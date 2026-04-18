'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Zod Schema 
const verifyFaceSchema = z.object({
  descriptor: z.array(z.number()).length(128),
  latencyMs: z.number().int().nonnegative()
});

type VerifyActionState = 
  | { ok: true; latencyMs: number }
  | { ok: false; error: string; reason?: string };

export async function verifyFace(input: z.infer<typeof verifyFaceSchema>): Promise<VerifyActionState> {
  // Service Role Key enforced on server
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Server misconfiguration: Missing Supabase Admin Keys');
  }

  // Use service role for Auth overriding and RPC vector matching
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  // Extract auth context manually since serviceRole bypasses RLS
  // Wait, better to use the cookies-based SSR client to get exact userId, then use Admin to UPSERT
  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = cookies();
  const supabaseUser = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; }
    }
  });

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: 'Unauthorized' };
  }

  // Parse input
  const parseResult = verifyFaceSchema.safeParse(input);
  if (!parseResult.success) {
    return { ok: false, error: 'Invalid input schema' };
  }
  const { descriptor, latencyMs } = parseResult.data;

  try {
    // 1. Vector matching - Match against all EXCEPT current user
    const formattedVector = `[${descriptor.join(',')}]`;
    const { data: matchData, error: matchError } = await supabaseAdmin.rpc('match_face', {
      query_embedding: formattedVector,
      match_threshold: 0.4, // Cosine distance threshold 
      exclude_user: user.id
    });

    if (matchError) throw matchError;

    // Reject if a duplicate identity is found
    if (matchData && matchData.length > 0) {
      await supabaseAdmin.from('verification_attempts').insert({
        user_id: user.id,
        success: false,
        method: 'anti-spoof:duplicate',
        latency_ms: latencyMs,
      });
      return { ok: false, error: 'Duplicate identity detected.', reason: 'duplicate' };
    }

    // 2. UPSERT Embedding & verify user
    const { error: updateError } = await supabaseAdmin.from('users').update({
      face_embedding: formattedVector,
      verified_at: new Date().toISOString()
    }).eq('id', user.id);

    if (updateError) throw updateError;

    // 3. Log attempt
    await supabaseAdmin.from('verification_attempts').insert({
      user_id: user.id,
      success: true,
      method: 'anti-spoof:challenge-pass',
      latency_ms: latencyMs,
    });

    // 4. Trigger Referrer Credit (Wait, schema trigger handles reward if we want? Let's credit here safely)
    const { data: userData } = await supabaseAdmin.from('users').select('referred_by').eq('id', user.id).single();
    if (userData?.referred_by) {
      // Find event
      await supabaseAdmin.from('referral_events')
        .update({ verified_at: new Date().toISOString() })
        .eq('referred_id', user.id);
    }

    return { ok: true, latencyMs };
  } catch (err: any) {
    console.error('[verifyFace] Error:', err);
    return { ok: false, error: 'Internal Server Error' };
  }
}
