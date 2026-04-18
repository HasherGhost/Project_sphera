'use server'

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10',
});

// Mock simulation of pg_cron webhook behavior where payout_held_until passes
export async function releaseEscrow(eventId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return { ok: false, error: 'Misconfigured' };

  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const { data: regs, error: regErr } = await adminClient
      .from('event_registrations')
      .select('id, stripe_payment_intent_id')
      .eq('event_id', eventId)
      .eq('payment_status', 'held');

    if (regErr) throw regErr;
    if (!regs || regs.length === 0) return { ok: true, message: 'No held funds found' };

    let capturedCount = 0;
    for (const reg of regs) {
      if (reg.stripe_payment_intent_id && reg.stripe_payment_intent_id.startsWith('mock_pi_')) {
        // Skip actual stripe call for mock intents
        capturedCount++;
      } else if (reg.stripe_payment_intent_id) {
        try {
          await stripe.paymentIntents.capture(reg.stripe_payment_intent_id);
          capturedCount++;
        } catch (captureErr) {
          console.error(`Failed to capture ${reg.stripe_payment_intent_id}`, captureErr);
          continue;
        }
      }

      await adminClient.from('event_registrations')
        .update({ payment_status: 'captured' })
        .eq('id', reg.id);
    }

    // Unhold event explicitly
    await adminClient.from('events').update({ payout_held_until: null }).eq('id', eventId);

    return { ok: true, capturedCount };
  } catch (err: any) {
    console.error(err);
    return { ok: false, error: 'Escrow release failed' };
  }
}
