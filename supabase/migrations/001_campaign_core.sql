-- ================================================================
-- Pharmacy Plus LIFF Acquisition MVP schema
-- Safe to run in Supabase SQL editor
-- ================================================================

create extension if not exists "pgcrypto";

create table if not exists campaign_entries (
  id                bigserial primary key,
  campaign_key      text not null,
  session_id        uuid not null default gen_random_uuid(),
  line_user_id      text,
  display_name      text,
  full_name         text not null,
  phone             text,
  branch            text,
  is_line_friend    boolean not null default false,
  source            jsonb not null default '{}'::jsonb,
  registered_at     timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (campaign_key, session_id)
);
create index if not exists campaign_entries_campaign_idx on campaign_entries(campaign_key, created_at desc);
create index if not exists campaign_entries_line_idx on campaign_entries(line_user_id) where line_user_id is not null;

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists campaign_entries_touch on campaign_entries;
create trigger campaign_entries_touch before update on campaign_entries
  for each row execute function touch_updated_at();

create table if not exists campaign_events (
  id           bigserial primary key,
  campaign_key text not null,
  session_id   uuid,
  line_user_id text,
  event_name   text not null,
  step         text not null,
  source       jsonb not null default '{}'::jsonb,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists campaign_events_name_idx on campaign_events(campaign_key, event_name, created_at desc);
create index if not exists campaign_events_session_idx on campaign_events(session_id, created_at asc) where session_id is not null;

create table if not exists campaign_reward_pool (
  id                 bigserial primary key,
  campaign_key       text not null,
  reward_title       text not null,
  reward_detail      text not null,
  reward_tone        text not null check (reward_tone in ('peach','green','blue')),
  coupon_code_prefix text not null,
  weight             integer not null default 1,
  stock_total        integer,
  stock_issued       integer not null default 0,
  is_active          boolean not null default true,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists campaign_reward_pool_campaign_idx on campaign_reward_pool(campaign_key, is_active, id asc);

drop trigger if exists campaign_reward_pool_touch on campaign_reward_pool;
create trigger campaign_reward_pool_touch before update on campaign_reward_pool
  for each row execute function touch_updated_at();

create table if not exists campaign_rewards (
  id           bigserial primary key,
  campaign_key text not null,
  session_id   uuid not null,
  line_user_id text,
  reward_pool_id bigint references campaign_reward_pool(id) on delete set null,
  reward_code  text not null,
  reward_title text not null,
  reward_detail text not null,
  reward_tone  text not null check (reward_tone in ('peach','green','blue')),
  coupon_code  text not null,
  status       text not null default 'issued' check (status in ('issued','claimed','redeemed','expired','cancelled')),
  metadata     jsonb not null default '{}'::jsonb,
  issued_at    timestamptz not null default now(),
  claimed_at   timestamptz,
  redeemed_at  timestamptz,
  expires_at   timestamptz,
  unique (campaign_key, reward_code),
  unique (campaign_key, session_id)
);
create index if not exists campaign_rewards_session_idx on campaign_rewards(session_id, issued_at desc);
create index if not exists campaign_rewards_line_idx on campaign_rewards(line_user_id, issued_at desc) where line_user_id is not null;
create index if not exists campaign_rewards_status_idx on campaign_rewards(campaign_key, status, issued_at desc);

alter table campaign_entries enable row level security;
alter table campaign_events enable row level security;
alter table campaign_reward_pool enable row level security;
alter table campaign_rewards enable row level security;
