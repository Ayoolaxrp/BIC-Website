-- ============================================================================
-- BIC · 0700 · Membership payments taken in person or by bank transfer
-- Online payment (Paystack) is not live, so the membership team collects the
-- ₦2,500 fee by hand. Admins record it here; the member portal then shows the
-- member as paid. Visitors still cannot mark themselves paid (0400/0600).
-- Idempotent.
-- ============================================================================

alter table public.member_applications add column if not exists payment_method text;
alter table public.member_applications add column if not exists payment_note text;
alter table public.member_applications add column if not exists payment_recorded_by uuid
  references public.profiles (id) on delete set null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'member_app_payment_method_check') then
    alter table public.member_applications
      add constraint member_app_payment_method_check
      check (payment_method is null or payment_method in ('paystack', 'cash', 'transfer')) not valid;
  end if;
end $$;

-- One entry point, admin only. security definer because members and visitors
-- have no UPDATE grant on member_applications; the is_admin() check is the gate.
create or replace function public.admin_set_membership_payment(
  p_application_id bigint,
  p_status text,
  p_method text default null,
  p_note text default null
)
returns public.member_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.member_applications;
begin
  if not public.is_admin() then
    raise exception 'Only club admins can record payments' using errcode = '42501';
  end if;
  if p_status not in ('paid', 'pending') then
    raise exception 'Status must be paid or pending' using errcode = '22023';
  end if;
  if p_status = 'paid' and coalesce(p_method, '') not in ('cash', 'transfer', 'paystack') then
    raise exception 'Payment method must be cash, transfer or paystack' using errcode = '22023';
  end if;

  update public.member_applications set
    payment_status      = p_status,
    payment_verified_at = case when p_status = 'paid' then now() else null end,
    payment_method      = case when p_status = 'paid' then p_method else null end,
    payment_note        = nullif(left(btrim(coalesce(p_note, '')), 300), ''),
    payment_recorded_by = auth.uid()
  where id = p_application_id
  returning * into r;

  if not found then
    raise exception 'Application not found' using errcode = 'P0002';
  end if;
  return r;
end;
$$;

revoke execute on function public.admin_set_membership_payment(bigint, text, text, text) from public, anon;
grant  execute on function public.admin_set_membership_payment(bigint, text, text, text) to authenticated;
