-- ============================================================================
-- Babcock Investors Club — Paystack webhook schema (DRAFT — for review)
-- ============================================================================
-- Adds what the paystack-webhook Edge Function needs:
--   * member_applications.payment_status / payment_verified_at — a server-side
--     "paid" flag set from the VERIFIED webhook (never trusted from the client).
--   * public.payments — the ledger of every verified Paystack transaction
--     (membership fees + event tickets).
--   * a BEFORE INSERT trigger that marks an application paid if a verified
--     payment already exists for its paystack_ref — this closes the
--     webhook-vs-form race: whichever arrives first, the application ends up
--     'paid'.
--
-- PREREQUISITE: schema.review.sql must have been run first (needs
-- member_applications). Idempotent — safe to re-run.
-- Run this in the Supabase SQL Editor BEFORE deploying the function.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Server-side payment flag on membership applications
-- ---------------------------------------------------------------------------
alter table public.member_applications
  add column if not exists payment_status text not null default 'pending'
  check (payment_status in ('pending', 'paid'));

alter table public.member_applications
  add column if not exists payment_verified_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Payment ledger — one row per verified transaction
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id           bigint generated always as identity primary key,
  paystack_ref text not null unique,       -- idempotency key (webhooks retry)
  payment_type text not null default 'membership'
    check (payment_type in ('membership', 'ticket')),
  email        text,
  amount_kobo  bigint,                     -- Paystack amounts are in kobo (₦5,000 = 500000)
  status       text not null default 'paid'
    check (status in ('paid', 'failed')),
  event_id     text,                       -- ticket only; text because seed events use non-uuid ids
  event_name   text,                       -- ticket only (display name)
  raw          jsonb,                      -- full Paystack payload for audit
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_payments_email        on public.payments (email);
create index if not exists idx_payments_type         on public.payments (payment_type);
create index if not exists idx_member_app_paystack   on public.member_applications (paystack_ref);

-- ---------------------------------------------------------------------------
-- 3. Race-closer: application lands AFTER the webhook already verified payment
-- ---------------------------------------------------------------------------
create or replace function public.apply_membership_payment_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.paystack_ref is not null and NEW.payment_status = 'pending' then
    if exists (
      select 1 from public.payments
      where paystack_ref = NEW.paystack_ref and status = 'paid'
    ) then
      NEW.payment_status := 'paid';
      NEW.payment_verified_at := now();
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_member_app_payment_status on public.member_applications;
create trigger trg_member_app_payment_status
  before insert on public.member_applications
  for each row execute function public.apply_membership_payment_status();

-- ---------------------------------------------------------------------------
-- 4. RLS — payments is written by the service role (webhook) and read by
--    admins only. The public never touches it.
-- ---------------------------------------------------------------------------
alter table public.payments enable row level security;

drop policy if exists "admin read payments" on public.payments;
create policy "admin read payments" on public.payments
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Verify (run on its own after the above):
-- ---------------------------------------------------------------------------
-- select payment_type, count(*) from public.payments group by 1;
-- select payment_status, count(*) from public.member_applications group by 1;
