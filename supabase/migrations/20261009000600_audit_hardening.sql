-- ============================================================================
-- BIC · 0600 · Hardening from security audit run-1 (quick profile)
-- Closes the four needs_validation leads in source, so none of them depends
-- on a dashboard setting. Idempotent.
--   1. One payment, one application  (fingerprint ...paystack_ref:non-unique-payment-reuse)
--   2. Own-row reads need a confirmed email (...submission-read-own-trusts-unverified-jwt-email)
--   3. Confirmation emails throttled per address (...anon-insert-arbitrary-recipient-email)
--   (4. send-email fail-open is fixed in supabase/functions/send-email.)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. A Paystack reference can back at most one application, and only when
--    the payer's email matches the applicant's.
-- ---------------------------------------------------------------------------
create unique index if not exists uq_member_app_paystack_ref
  on public.member_applications (paystack_ref)
  where paystack_ref is not null;

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
    select 1 from public.payments p
    where p.paystack_ref = new.paystack_ref
      and p.payment_type = 'membership'
      and p.status = 'paid'
      and lower(coalesce(p.email, '')) = lower(new.email)
  ) then
    new.payment_status      := 'paid';
    new.payment_verified_at := now();
  end if;
  return new;
end;
$$;
revoke execute on function public.apply_membership_payment_status() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Members read their own application and RSVPs only once Supabase Auth
--    has confirmed the email they signed in with. Rows are matched by email
--    (anyone can submit any email), so an unconfirmed sign-up must not see them.
-- ---------------------------------------------------------------------------
create or replace function public.email_is_confirmed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke execute on function public.email_is_confirmed() from public, anon;
grant  execute on function public.email_is_confirmed() to authenticated;

drop policy if exists "member_applications: read own or admin" on public.member_applications;
create policy "member_applications: read own or admin" on public.member_applications
  for select to authenticated
  using (
    (select public.is_admin())
    or (lower(email) = lower((select auth.jwt()) ->> 'email') and (select public.email_is_confirmed()))
  );

drop policy if exists "rsvps: read own or admin" on public.rsvps;
create policy "rsvps: read own or admin" on public.rsvps
  for select to authenticated
  using (
    (select public.is_admin())
    or (lower(email) = lower((select auth.jwt()) ->> 'email') and (select public.email_is_confirmed()))
  );

-- ---------------------------------------------------------------------------
-- 3. At most one confirmation email per address per hour, so public form
--    inserts cannot turn the club's sender into a mass-mailing relay.
-- ---------------------------------------------------------------------------
create table if not exists private.email_log (
  id       bigint generated always as identity primary key,
  email    text not null,
  source   text not null,
  sent_at  timestamptz not null default now()
);
create index if not exists idx_email_log_email_time on private.email_log (lower(email), sent_at desc);
revoke all on private.email_log from public, anon, authenticated;

create or replace function public.notify_send_email()
returns trigger
language plpgsql
security definer
set search_path = public, private, extensions
as $$
declare
  v_url    text;
  v_secret text;
begin
  if coalesce(new.email, '') = '' then
    return new;
  end if;

  select value into v_url    from private.app_config where key = 'send_email_url';
  select value into v_secret from private.app_config where key = 'webhook_secret';
  if v_url is null or v_secret is null then
    return new;  -- not configured yet
  end if;

  if exists (
    select 1 from private.email_log l
    where lower(l.email) = lower(new.email)
      and l.sent_at > now() - interval '1 hour'
  ) then
    return new;  -- already emailed this address recently
  end if;

  insert into private.email_log (email, source) values (new.email, tg_table_name);

  begin
    perform net.http_post(
      url                  := v_url,
      body                 := jsonb_build_object('table', tg_table_name, 'record', to_jsonb(new)),
      headers              := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
      timeout_milliseconds := 3000
    );
  exception when others then
    raise warning 'send-email notification failed: %', sqlerrm;
  end;
  return new;
end;
$$;
revoke execute on function public.notify_send_email() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Hardening: submission timestamps are set by the server, not the browser.
-- ---------------------------------------------------------------------------
create or replace function public.set_created_at_now()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_at := now();
  return new;
end;
$$;
revoke execute on function public.set_created_at_now() from public, anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array['member_applications', 'contact_messages', 'sponsorship_inquiries', 'rsvps', 'subscribers'] loop
    execute format('drop trigger if exists trg_%s_created_at on public.%I', t, t);
    execute format('create trigger trg_%s_created_at before insert on public.%I for each row execute function public.set_created_at_now()', t, t);
  end loop;
end $$;
