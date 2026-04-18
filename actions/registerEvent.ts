'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10',
});

export async function registerEvent(eventId: string) {
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
    // 1. Get event details
    const { data: event, error: eventErr } = await adminClient
      .from('events')
      .select('id, price_cents')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) throw new Error('Event not found');

    // 2. Stripe Manual Capture intent (Mock implementation for hackathon)
    let paymentIntentId = 'mock_pi_xxxxxx';
    let pStatus = 'held';
    
    if (event.price_cents > 0) {
      // In a real flow, this would return clientSecret to frontend
      const intent = await stripe.paymentIntents.create({
        amount: event.price_cents,
        currency: 'usd',
        capture_method: 'manual',
        metadata: { event_id: eventId, user_id: user.id }
      });
      paymentIntentId = intent.id;
    } else {
      pStatus = 'captured'; // Free events are instantly captured
    }

    // 3. Store registration
    const { error: regError } = await adminClient
      .from('event_registrations')
      .insert({
        event_id: eventId,
        attendee_id: user.id,
        stripe_payment_intent_id: paymentIntentId,
        payment_status: pStatus,
        amount_cents: event.price_cents
      });

    if (regError) throw regError;

    return { ok: true, paymentIntentId };
  } catch (err: any) {
    console.error(err);
    return { ok: false, error: err.message || 'Registration failed' };
  }
}
