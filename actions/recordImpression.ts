'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const COST_PER_IMPRESSION = 10;

export async function recordImpression(campaignId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return { ok: false, error: 'Misconfigured' };

  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(n) { return cookieStore.get(n)?.value; } }
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // 1. Atomic decrement of budget via postgres RPC
    const { data: debited, error: debitError } = await adminClient.rpc('debit_campaign_budget', {
      p_campaign_id: campaignId,
      p_cost: COST_PER_IMPRESSION
    });

    if (debitError) throw debitError;
    if (!debited) {
      // Budget exhausted, pause campaign
      await adminClient.from('campaigns').update({ status: 'ended' }).eq('id', campaignId);
      return { ok: false, error: 'Budget exhausted' };
    }

    // 2. Record the impression to audit table
    await adminClient.from('campaign_impressions').insert({
      campaign_id: campaignId,
      viewer_id: user.id,
      cost_credits: COST_PER_IMPRESSION
    });

    return { ok: true };
  } catch (err: any) {
    console.error(err);
    return { ok: false, error: 'Failed to record impression' };
  }
}
