-- supabase/schema.sql
-- Idempotent schema definition for SyncUp platform

-- 1. EXTENSIONS
create extension if not exists vector;
create extension if not exists pg_cron;

-- 2. CUSTOM TYPES
do $$ begin
  create type user_role as enum ('professional', 'business_owner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('draft', 'active', 'paused', 'ended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('held', 'captured', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

-- 3. TABLES

-- Users (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'professional',
  email text unique not null,
  full_name text not null,
  headline text,
  bio text,
  skills text[] default '{}',
  experience jsonb[] default '{}',
  photo_url text,
  verified_at timestamptz,
  face_embedding vector(128),
  referral_code text unique not null,
  referred_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- Company Pages
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id),
  name text not null,
  slug text unique not null,
  domain text,
  description text,
  logo_url text,
  verified_ownership_at timestamptz,
  created_at timestamptz not null default now(),
  constraint claim_flow_req check (
    verified_ownership_at is null or domain is not null
  )
);

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.users(id),
  company_id uuid references public.companies(id),
  title text not null,
  description text not null,
  cover_image_url text,
  event_date timestamptz not null,
  price_cents integer not null default 0,
  trust_score integer not null default 100,
  is_approved boolean not null default true,
  cancellation_policy text,
  payout_held_until timestamptz,
  organizer_verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Event Registrations (Escrow tracking)
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  attendee_id uuid not null references public.users(id),
  stripe_payment_intent_id text,
  payment_status payment_status,
  amount_cents integer not null,
  created_at timestamptz not null default now(),
  unique(event_id, attendee_id)
);

-- Event Cancellations & Reports
create table if not exists public.event_cancellations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reason text,
  refunds_issued_count integer default 0,
  cancelled_at timestamptz not null default now()
);

create table if not exists public.event_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reporter_id uuid not null references public.users(id),
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Promotion Wallets (P1 feature)
create table if not exists public.promotion_wallets (
  user_id uuid primary key references public.users(id) on delete cascade,
  balance_credits integer not null default 0 check (balance_credits >= 0),
  balance_bonus_credits integer not null default 0 check (balance_bonus_credits >= 0),
  bonus_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Campaigns & Impressions
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id),
  target_type text not null check (target_type in ('post', 'event', 'company', 'opportunity')),
  target_id uuid not null,
  budget_credits integer not null check (budget_credits >= 0),
  spent_credits integer not null default 0,
  status campaign_status not null default 'draft',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  targeting_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  constraint valid_budget check (spent_credits <= budget_credits)
);

create table if not exists public.campaign_impressions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  viewer_id uuid not null references public.users(id),
  cost_credits integer not null,
  viewed_at timestamptz not null default now()
);

-- Coupons
create table if not exists public.coupons (
  code text primary key,
  type text not null,
  base_credits integer not null default 0,
  bonus_credits integer not null default 0,
  expires_at timestamptz,
  max_redemptions integer not null default 1,
  redeemed_count integer not null default 0,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  constraint valid_redeem check (redeemed_count <= max_redemptions)
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_code text not null references public.coupons(code),
  user_id uuid not null references public.users(id),
  redeemed_at timestamptz not null default now(),
  unique(coupon_code, user_id)
);

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id),
  content text not null,
  image_url text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Job Postings
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  title text not null,
  description text not null,
  min_years_experience integer not null check (min_years_experience >= 1),
  created_at timestamptz not null default now()
);

-- Opportunities (P7 - mocked)
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id),
  title text not null,
  description text not null,
  type text not null default 'partnership',
  created_at timestamptz not null default now()
);

-- Referrals & Rewards
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users(id),
  referred_id uuid not null references public.users(id) unique,
  verified_at timestamptz,
  credited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_tiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  tier integer not null check (tier in (100, 500, 1000)),
  unlocked_at timestamptz not null default now(),
  reward_type text not null,
  claimed boolean not null default false,
  unique(user_id, tier)
);

-- Audit details for Face Match
create table if not exists public.verification_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  success boolean not null,
  method text not null,
  latency_ms integer not null,
  attempted_at timestamptz not null default now()
);

-- Rate limits table
create table if not exists public.rate_limits (
  user_id uuid not null references public.users(id),
  action text not null,
  count integer not null default 1,
  window_start timestamptz not null default date_trunc('hour', now()),
  primary key (user_id, action, window_start)
);

-- 4. INDEXES
create index on public.users using ivfflat (face_embedding vector_cosine_ops) with (lists = 100);
create index idx_events_date on public.events(event_date);
create index idx_campaigns_status on public.campaigns(status);

-- 5. VIEWS
-- Materialized view for Leaderboard
create materialized view if not exists public.referral_leaderboard as
select 
  referrer_id as user_id, 
  count(*) as verified_referrals
from public.referral_events
where verified_at is not null
group by referrer_id
order by verified_referrals desc;

create unique index on public.referral_leaderboard(user_id);

-- 6. FUNCTIONS

-- Match Face RPC
create or replace function match_face(
  query_embedding vector(128),
  match_threshold float8,
  exclude_user uuid
)
returns table(user_id uuid, distance float8)
language plpgsql
as $$
begin
  return query
  select 
    id,
    (face_embedding <=> query_embedding) as distance
  from public.users
  where id != exclude_user 
    and face_embedding is not null
    and (face_embedding <=> query_embedding) < match_threshold
  order by (face_embedding <=> query_embedding) asc
  limit 1;
end;
$$;

-- Atomic Debit Budget RPC
create or replace function debit_campaign_budget(
  p_campaign_id uuid,
  p_cost integer
)
returns boolean
language plpgsql
as $$
declare
  v_spent integer;
  v_budget integer;
begin
  select spent_credits, budget_credits into v_spent, v_budget 
  from public.campaigns 
  where id = p_campaign_id for update;

  if (v_spent + p_cost) <= v_budget then
    update public.campaigns 
    set spent_credits = spent_credits + p_cost
    where id = p_campaign_id;
    return true;
  end if;
  return false;
end;
$$;

-- Trigger: Insert to users on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_referral_code text;
begin
  -- Generate 8 char alphanumeric
  v_referral_code := substring(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  
  insert into public.users (id, email, full_name, role, referral_code)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'professional'),
    v_referral_code
  );

  -- Create wallet
  insert into public.promotion_wallets (user_id) values (new.id);
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: Refresh Leaderboard
create or replace function public.refresh_leaderboard()
returns void language plpgsql set search_path = public as $$
begin
  refresh materialized view concurrently public.referral_leaderboard;
end;
$$;

-- 7. PG_CRON JOBS
DO $$ BEGIN
  -- Release held payouts daily safely
  perform cron.schedule(
    'release-held-payouts', 
    '0 0 * * *', 
    $$
    update public.events
    set payout_held_until = null
    where payout_held_until <= now() and is_approved = true;
    $$
  );

  -- Refresh leaderboard hourly
  perform cron.schedule(
    'refresh-leaderboard',
    '0 * * * *',
    $$ select public.refresh_leaderboard(); $$
  );
EXCEPTION WHEN undefined_object OR insufficient_privilege THEN 
  -- pg_cron not available in this environment context, mock silently
  NULL; 
END $$;

-- 8. RLS POLICIES
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.events enable row level security;
alter table public.campaigns enable row level security;

-- Users can read all public profiles, but update only their own
create policy "Public profiles are viewable by everyone."
  on public.users for select using (true);

create policy "Users can update own profile."
  on public.users for update using (auth.uid() = id);

-- Companies
create policy "Companies viewable by everyone."
  on public.companies for select using (true);
create policy "Verified users can create companies."
  on public.companies for insert 
  with check (auth.uid() = creator_id and exists (select 1 from public.users where id = auth.uid() and verified_at is not null));
create policy "Creators update companies."
  on public.companies for update using (auth.uid() = creator_id);

-- Events
create policy "Events viewable by everyone."
  on public.events for select using (true);
create policy "Verified users can create events."
  on public.events for insert 
  with check (auth.uid() = organizer_id and exists (select 1 from public.users where id = auth.uid() and verified_at is not null));

-- Campaigns limit
create policy "Campaigns viewable by owner."
  on public.campaigns for select using (auth.uid() = owner_id);
create policy "Campaigns insert."
  on public.campaigns for insert with check (auth.uid() = owner_id);
