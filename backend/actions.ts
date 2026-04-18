'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { z } from 'zod';
import Stripe from 'stripe';
import { resolveTxt } from 'dns/promises';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10',
});

// --- HELPER: Admin Client ---
async function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Misconfigured keys');
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

// --- HELPER: User Client ---
async function getUserClient() {
  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(n) { return cookieStore.get(n)?.value; } }
  });
}

// ==========================================
// 1. FACE VERIFICATION
// ==========================================
const verifyFaceSchema = z.object({
  descriptor: z.array(z.number()).length(128),
  latencyMs: z.number().int().nonnegative()
});

export async function verifyFace(input: any) {
  const adminClient = await getAdminClient();
  const userClient = await getUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  const parsed = verifyFaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };
  const { descriptor, latencyMs } = parsed.data;

  try {
    const formattedVector = `[${descriptor.join(',')}]`;
    const { data: matchData, error: matchError } = await adminClient.rpc('match_face', {
      query_embedding: formattedVector,
      match_threshold: 0.4, 
      exclude_user: user.id
    });

    if (matchError) throw matchError;
    if (matchData && matchData.length > 0) {
      await adminClient.from('verification_attempts').insert({ user_id: user.id, success: false, method: 'anti-spoof:duplicate', latency_ms: latencyMs });
      return { ok: false, error: 'Duplicate identity detected.', reason: 'duplicate' };
    }

    await adminClient.from('users').update({ face_embedding: formattedVector, verified_at: new Date().toISOString() }).eq('id', user.id);
    await adminClient.from('verification_attempts').insert({ user_id: user.id, success: true, method: 'anti-spoof:challenge-pass', latency_ms: latencyMs });

    const { data: userData } = await adminClient.from('users').select('referred_by').eq('id', user.id).single();
    if (userData?.referred_by) {
      await adminClient.from('referral_events').update({ verified_at: new Date().toISOString() }).eq('referred_id', user.id);
    }

    return { ok: true, latencyMs };
  } catch (err: any) {
    return { ok: false, error: 'Internal Server Error' };
  }
}

// ==========================================
// 2. CAMPAIGN MANAGEMENT
// ==========================================
export async function createCampaign(input: any) {
  const adminClient = await getAdminClient();
  const userClient = await getUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  try {
    const { data: wallet, error: walletError } = await adminClient.from('promotion_wallets').select('*').eq('user_id', user.id).single();
    if (walletError || !wallet) throw new Error('Wallet not found');

    const { data: campaign, error: capError } = await adminClient.from('campaigns').insert({
      owner_id: user.id,
      target_type: input.targetType,
      target_id: input.targetId,
      budget_credits: input.budgetCredits,
      spent_credits: 0,
      status: 'active',
      targeting_json: input.targetingJSON,
    }).select('id').single();

    if (capError || !campaign) throw capError;

    // Deduct from wallet (Simplified)
    await adminClient.from('promotion_wallets').update({ balance_credits: wallet.balance_credits - input.budgetCredits }).eq('user_id', user.id);

    return { ok: true, campaignId: campaign.id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function recordImpression(campaignId: string) {
  const adminClient = await getAdminClient();
  const { data: debited, error: debitError } = await adminClient.rpc('debit_campaign_budget', { p_campaign_id: campaignId, p_cost: 10 });
  if (debitError || !debited) return { ok: false, error: 'Budget exhausted' };
  return { ok: true };
}

// ==========================================
// 3. EVENT ESCROW & REGISTRATION
// ==========================================
export async function registerEvent(eventId: string) {
  const adminClient = await getAdminClient();
  const userClient = await getUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  const { data: event } = await adminClient.from('events').select('*').eq('id', eventId).single();
  if (!event) return { ok: false, error: 'Event not found' };

  const intent = await stripe.paymentIntents.create({ amount: event.price_cents, currency: 'usd', capture_method: 'manual' });
  await adminClient.from('event_registrations').insert({ event_id: eventId, attendee_id: user.id, stripe_payment_intent_id: intent.id, payment_status: 'held', amount_cents: event.price_cents });
  
  return { ok: true, paymentIntentId: intent.id };
}

export async function releaseEscrow(eventId: string) {
  const adminClient = await getAdminClient();
  const { data: regs } = await adminClient.from('event_registrations').select('*').eq('event_id', eventId).eq('payment_status', 'held');
  if (!regs) return { ok: true };

  for (const reg of regs) {
    if (!reg.stripe_payment_intent_id.startsWith('mock_')) await stripe.paymentIntents.capture(reg.stripe_payment_intent_id);
    await adminClient.from('event_registrations').update({ payment_status: 'captured' }).eq('id', reg.id);
  }
  return { ok: true };
}

// ==========================================
// 4. COMPANY CLAIM
// ==========================================
export async function claimCompany(input: any) {
  const adminClient = await getAdminClient();
  const userClient = await getUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !user.email) return { ok: false, error: 'Unauthorized' };

  const { data: company } = await adminClient.from('companies').select('*').eq('id', input.companyId).single();
  if (!company) return { ok: false, error: 'Not found' };

  if (input.method === 'domain_match') {
    if (user.email.split('@')[1] === company.domain) {
      await adminClient.from('companies').update({ verified_ownership_at: new Date().toISOString() }).eq('id', company.id);
      return { ok: true, status: 'verified' };
    }
  }
  return { ok: false, error: 'Verification failed' };
}
