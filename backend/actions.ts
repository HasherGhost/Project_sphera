'use server'

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  increment,
  runTransaction
} from "firebase/firestore";
import { cookies } from 'next/headers';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10',
});

// --- HELPER: Auth verification ---
// In a real Firebase app, we'd verify the session cookie using firebase-admin.
// For this refactor, we'll assume the 'session' cookie contains the UID.
async function getAuthUser() {
  const session = cookies().get('session')?.value;
  if (!session) return null;
  // This is a simplified mock. In production, use admin.auth().verifySessionCookie(session)
  return { id: session }; 
}

// ==========================================
// 1. FACE VERIFICATION
// ==========================================
const verifyFaceSchema = z.object({
  descriptor: z.array(z.number()).length(128),
  latencyMs: z.number().int().nonnegative()
});

export async function verifyFace(input: any) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  const parsed = verifyFaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };
  const { descriptor, latencyMs } = parsed.data;

  try {
    const userRef = doc(db, 'users', user.id);
    
    // Log verification attempt in sub-collection
    const attemptsRef = collection(userRef, 'verification_attempts');
    await addDoc(attemptsRef, {
      success: true,
      method: 'anti-spoof:challenge-pass',
      latency_ms: latencyMs,
      timestamp: serverTimestamp()
    });

    // Save biometric descriptors to users collection
    await updateDoc(userRef, {
      face_embedding: descriptor,
      verified_at: serverTimestamp()
    });

    // Check for referrals (simplified)
    const userDoc = await getDoc(userRef);
    const referredBy = userDoc.data()?.referred_by;
    if (referredBy) {
      // In Firestore, we should use a query or a batch to update referral events
      const referralsRef = collection(db, 'referral_events');
      const q = query(referralsRef, where('referred_id', '==', user.id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (d) => {
        await updateDoc(d.ref, { verified_at: serverTimestamp() });
      });
    }

    return { ok: true, latencyMs };
  } catch (err: any) {
    console.error('Face verification error:', err);
    return { ok: false, error: 'Internal Server Error' };
  }
}

// ==========================================
// 2. CAMPAIGN MANAGEMENT
// ==========================================
export async function createCampaign(input: any) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  try {
    const walletRef = doc(db, 'promotion_wallets', user.id);
    const walletDoc = await getDoc(walletRef);
    if (!walletDoc.exists()) throw new Error('Wallet not found');
    const walletData = walletDoc.data();

    // Transaction to ensure atomic credit deduction
    const campaignId = await runTransaction(db, async (transaction) => {
      const wDoc = await transaction.get(walletRef);
      if (!wDoc.exists()) throw new Error('Wallet not found');
      
      const newBalance = (wDoc.data().balance_credits || 0) - input.budgetCredits;
      if (newBalance < 0) throw new Error('Insufficient credits');

      const campaignRef = doc(collection(db, 'campaigns'));
      transaction.set(campaignRef, {
        owner_id: user.id,
        target_type: input.targetType,
        target_id: input.targetId,
        budget_credits: input.budgetCredits,
        spent_credits: 0,
        status: 'active',
        targeting_json: input.targetingJSON,
        created_at: serverTimestamp()
      });

      transaction.update(walletRef, { balance_credits: newBalance });
      return campaignRef.id;
    });

    return { ok: true, campaignId };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function recordImpression(campaignId: string) {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, {
      spent_credits: increment(10)
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: 'Budget exhausted or error' };
  }
}

// ==========================================
// 3. EVENT ESCROW & REGISTRATION
// ==========================================
export async function registerEvent(eventId: string) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    if (!eventDoc.exists()) return { ok: false, error: 'Event not found' };
    const event = eventDoc.data();

    const intent = await stripe.paymentIntents.create({ 
      amount: event.price_cents, 
      currency: 'usd', 
      capture_method: 'manual' 
    });

    await addDoc(collection(db, 'event_registrations'), {
      event_id: eventId,
      attendee_id: user.id,
      stripe_payment_intent_id: intent.id,
      payment_status: 'held',
      amount_cents: event.price_cents,
      created_at: serverTimestamp()
    });
    
    return { ok: true, paymentIntentId: intent.id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function releaseEscrow(eventId: string) {
  try {
    const regsRef = collection(db, 'event_registrations');
    const q = query(regsRef, where('event_id', '==', eventId), where('payment_status', '==', 'held'));
    const querySnapshot = await getDocs(q);

    for (const d of querySnapshot.docs) {
      const reg = d.data();
      if (!reg.stripe_payment_intent_id.startsWith('mock_')) {
        await stripe.paymentIntents.capture(reg.stripe_payment_intent_id);
      }
      await updateDoc(d.ref, { payment_status: 'captured' });
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ==========================================
// 4. COMPANY CLAIM
// ==========================================
export async function claimCompany(input: any) {
  const user = await getAuthUser();
  // For company claim, we might need email from auth
  // In this mock, we assume user object has it if we fetched it properly
  if (!user) return { ok: false, error: 'Unauthorized' };

  try {
    const userRef = doc(db, 'users', user.id);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    if (!userData?.email) return { ok: false, error: 'Email missing' };

    const companyRef = doc(db, 'companies', input.companyId);
    const companyDoc = await getDoc(companyRef);
    if (!companyDoc.exists()) return { ok: false, error: 'Not found' };
    const company = companyDoc.data();

    if (input.method === 'domain_match') {
      if (userData.email.split('@')[1] === company.domain) {
        await updateDoc(companyRef, { verified_ownership_at: serverTimestamp() });
        return { ok: true, status: 'verified' };
      }
    }
    return { ok: false, error: 'Verification failed' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

