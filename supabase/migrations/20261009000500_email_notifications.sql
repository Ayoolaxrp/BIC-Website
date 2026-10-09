-- ============================================================================
-- BIC · 0500 · Confirmation emails (optional, off until configured)
-- New membership applications and RSVPs call the send-email edge function.
-- Settings live in private.app_config (not exposed through the API). Until
-- both keys are set the trigger does nothing, and a failed call never blocks
-- the insert. To switch on, see supabase/SETUP.md step 6.
-- ============================================================================

create extension if not exists pg_net with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  key   text primary key,
  value text not null
);
revoke all on private.app_config from public, anon, authenticated;

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

-- Old trigger names from email_triggers.sql
drop trigger if exists trg_member_app_email on public.member_applications;
drop trigger if exists trg_rsvp_email on public.rsvps;

create trigger trg_member_app_email
  after insert on public.member_applications
  for each row execute function public.notify_send_email();

create trigger trg_rsvp_email
  after insert on public.rsvps
  for each row execute function public.notify_send_email();

-- Retire the old trigger function if it exists (it hard-coded a placeholder URL).
drop function if exists public.send_email_on_insert();
