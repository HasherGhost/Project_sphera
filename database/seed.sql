-- supabase/seed.sql
-- Demo data for UI mocking to ensure page state is navigable.

-- IMPORTANT: This script uses hardcoded UUIDs so relationships resolve properly.
-- In a real environment, auth.users would exist first. We mock public.users.

-- Users (Demo setup: All Verified)
insert into public.users (id, role, email, full_name, headline, bio, verified_at, referral_code) values
('11111111-1111-1111-1111-111111111111', 'professional', 'alice@example.com', 'Alice Engineer', 'Senior Frontend Developer', 'Building fast UIs.', now(), 'ALICE123'),
('22222222-2222-2222-2222-222222222222', 'business_owner', 'bob@example.com', 'Bob Founder', 'CEO at TechCorp', 'Scaling products.', now(), 'BOBXYZ00'),
('33333333-3333-3333-3333-333333333333', 'professional', 'charlie@example.com', 'Charlie PM', 'Product Manager', 'Agile expert.', now(), 'CHARLIE1'),
('44444444-4444-4444-4444-444444444444', 'professional', 'dave@example.com', 'Dave Security', 'Cybersec Pro', 'Keeping things safe.', now(), 'DAVECYB1'),
('55555555-5555-5555-5555-555555555555', 'business_owner', 'eve@example.com', 'Eve Partner', 'Managing Partner', 'Investing deep tech.', now(), 'EVEINVST');

-- Wallets
insert into public.promotion_wallets (user_id, balance_credits) values
('11111111-1111-1111-1111-111111111111', 10000),
('22222222-2222-2222-2222-222222222222', 500000);

-- Companies
insert into public.companies (id, creator_id, name, slug, domain, verified_ownership_at, description) values
('aaaa1111-aaaa-1111-aaaa-1111aaaa1111', '22222222-2222-2222-2222-222222222222', 'TechCorp Inc', 'techcorp', 'example.com', now(), 'We build scalable platforms.'),
('bbbb2222-bbbb-2222-bbbb-2222bbbb2222', '55555555-5555-5555-5555-555555555555', 'Venture XYZ', 'venture-xyz', 'venture.example.com', now(), 'Deep tech investments.');

-- Events
insert into public.events (id, organizer_id, company_id, title, description, event_date, price_cents, trust_score, payout_held_until) values
('eeee1111-eeee-1111-eeee-1111eeee1111', '22222222-2222-2222-2222-222222222222', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Frontend Summit 2026', 'A massive gathering of UI engineers.', now() + interval '10 days', 0, 100, now() + interval '12 days'),
('eeee2222-eeee-2222-eeee-2222eeee2222', '33333333-3333-3333-3333-333333333333', null, 'Product Strategy Workshop', 'Intensive 4 hour session on metrics.', now() + interval '2 days', 5000, 85, now() + interval '4 days');

-- Posts
insert into public.posts (id, author_id, content) values
('ffff1111-ffff-1111-ffff-1111ffff1111', '11111111-1111-1111-1111-111111111111', 'Just verified my profile on SyncUp! The anti-spoofing is super fast.'),
('ffff2222-ffff-2222-ffff-2222ffff2222', '22222222-2222-2222-2222-222222222222', 'TechCorp is hiring senior engineers. Hit our jobs page.');

-- Campaigns
insert into public.campaigns (id, owner_id, target_type, target_id, budget_credits, spent_credits, status) values
('cccc1111-cccc-1111-cccc-1111cccc1111', '22222222-2222-2222-2222-222222222222', 'post', 'ffff2222-ffff-2222-ffff-2222ffff2222', 100000, 150, 'active');

-- Coupons
insert into public.coupons (code, type, base_credits, bonus_credits, max_redemptions) values
('LAUNCH60', 'promotion', 0, 120000, 1000);

-- Opportunities (P7 mocking)
insert into public.opportunities (id, creator_id, title, description, type) values
('00001111-0000-1111-0000-111100001111', '22222222-2222-2222-2222-222222222222', 'Seeking Cloud Solutions Vendor', 'We need a robust enterprise contract.', 'procurement');
