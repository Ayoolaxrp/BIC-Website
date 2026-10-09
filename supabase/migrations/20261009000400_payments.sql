-- ============================================================================
-- BIC · 0400 · Membership payment status
-- A visitor can insert an application, but can never mark it paid. On insert
-- the status is always derived from public.payments, which only the
-- paystack-webhook edge function (service role, verified with Paystack and
-- checked against the fee) can write. Covers both arrival orders:
--   webhook first  -> this trigger marks the new application paid
--   insert first   -> the webhook updates the existing application
-- ============================================================================

create or replace function public.apply_membership_payment_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.payment_status      := 'pending';
  new.payment_verified_at := null;
  if new.paystack_ref is not null and exists (
    select 1 from public.payments
    where paystack_ref = new.paystack_ref
      and payment_type = 'membership'
      and status = 'paid'
  ) then
    new.payment_status      := 'paid';
    new.payment_verified_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_member_app_payment_status on public.member_applications;
create trigger trg_member_app_payment_status
  before insert on public.member_applications
  for each row execute function public.apply_membership_payment_status();

revoke execute on function public.apply_membership_payment_status() from public, anon, authenticated;
