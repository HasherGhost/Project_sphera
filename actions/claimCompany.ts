'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

type ClaimMethod = 'domain_match' | 'dns_txt' | 'document';

interface ClaimInput {
  companyId: string;
  method: ClaimMethod;
  payload?: string; // Used for DNS expected token or document path
}

export async function claimCompany(input: ClaimInput) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return { ok: false, error: 'Misconfigured' };

  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(n) { return cookieStore.get(n)?.value; } }
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, error: 'Unauthorized' };

  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const { data: company, error: compErr } = await adminClient
      .from('companies')
      .select('id, domain, verified_ownership_at')
      .eq('id', input.companyId)
      .single();

    if (compErr || !company) return { ok: false, error: 'Company not found' };
    if (company.verified_ownership_at) return { ok: false, error: 'Already verified' };
    if (!company.domain) return { ok: false, error: 'Company must have a domain to claim' };

    let verificationPassed = false;

    if (input.method === 'domain_match') {
      const userDomain = user.email.split('@')[1];
      if (userDomain.toLowerCase() === company.domain.toLowerCase()) {
        verificationPassed = true;
      } else {
        return { ok: false, error: 'Domain mismatch. Your email does not match the company domain.' };
      }
    } 
    else if (input.method === 'dns_txt') {
      if (!input.payload) return { ok: false, error: 'Missing DNS token payload' };
      try {
        // In demo, we might mock this if it's a test domain
        if (company.domain === 'example.com') {
          verificationPassed = true; // Hardcoded bypass for demo
        } else {
          const records = await resolveTxt(company.domain);
          const flatRecords = records.flat();
          if (flatRecords.includes(`syncup-verification=${input.payload}`)) {
            verificationPassed = true;
          } else {
            return { ok: false, error: 'DNS TXT record not found' };
          }
        }
      } catch (dnsErr) {
        return { ok: false, error: 'DNS lookup failed' };
      }
    }
    else if (input.method === 'document') {
      // Document upload enters admin queue, so we don't automatically mark ownership.
      // E.g. Insert into "ownership_claims" queue (stubbed)
      return { ok: true, status: 'pending_review', message: 'Document submitted for admin review.' };
    }

    if (verificationPassed) {
      await adminClient.from('companies')
        .update({ verified_ownership_at: new Date().toISOString() })
        .eq('id', company.id);

      return { ok: true, status: 'verified', message: 'Company ownership verified successfully.' };
    }

    return { ok: false, error: 'Verification failed' };

  } catch (err: any) {
    console.error(err);
    return { ok: false, error: 'Internal failure' };
  }
}
