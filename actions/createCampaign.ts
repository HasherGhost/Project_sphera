'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createCampaignSchema = z.object({
  targetType: z.enum(['post', 'event', 'company', 'opportunity']),
  targetId: z.string().uuid(),
  budgetCredits: z.number().int().min(100),
  targetingJSON: z.object({
    industries: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    roles: z.array(z.string()).optional(),
  }).default({}),
});

type CampaignResponse = 
  | { ok: true; campaignId: string }
  | { ok: false; error: string };

export async function createCampaign(input: z.infer<typeof createCampaignSchema>): Promise<CampaignResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return { ok: false, error: 'Server misconfiguration' };

  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid schema' };

  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(n) { return cookieStore.get(n)?.value; } }
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  // Setup Admin Client to interact securely
  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // 1. Verify user's wallet has enough balance
    const { data: wallet, error: walletError } = await adminClient
      .from('promotion_wallets')
      .select('balance_credits, balance_bonus_credits, bonus_expires_at')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) throw new Error('Wallet not found');

    let isBonusValid = wallet.bonus_expires_at ? new Date(wallet.bonus_expires_at) > new Date() : false;
    let availableBonus = isBonusValid ? wallet.balance_bonus_credits : 0;
    
    // Total available (ignoring complex split for prototype, treating as single pool for validation)
    const totalAvailable = wallet.balance_credits + availableBonus;
    if (totalAvailable < parsed.data.budgetCredits) {
      return { ok: false, error: 'Insufficient credits' };
    }

    // 2. Draft Campaign
    const { data: campaign, error: capError } = await adminClient
      .from('campaigns')
      .insert({
        owner_id: user.id,
        target_type: parsed.data.targetType,
        target_id: parsed.data.targetId,
        budget_credits: parsed.data.budgetCredits,
        spent_credits: 0,
        status: 'active',
        targeting_json: parsed.data.targetingJSON,
      })
      .select('id')
      .single();

    if (capError || !campaign) throw capError;

    // 3. Deduct from wallet safely
    let remainingToDeduct = parsed.data.budgetCredits;
    let newBonus = wallet.balance_bonus_credits;
    let newBase = wallet.balance_credits;

    if (isBonusValid && newBonus > 0) {
      let deductBonus = Math.min(newBonus, remainingToDeduct);
      newBonus -= deductBonus;
      remainingToDeduct -= deductBonus;
    }
    
    if (remainingToDeduct > 0) {
      newBase -= remainingToDeduct;
    }

    const { error: dedError } = await adminClient
      .from('promotion_wallets')
      .update({
        balance_credits: newBase,
        balance_bonus_credits: newBonus,
      })
      .eq('user_id', user.id);

    if (dedError) {
      // Rollback (Compensation)
      await adminClient.from('campaigns').delete().eq('id', campaign.id);
      throw dedError;
    }

    return { ok: true, campaignId: campaign.id };
  } catch (err: any) {
    console.error(err);
    return { ok: false, error: err.message || 'Internal error' };
  }
}
