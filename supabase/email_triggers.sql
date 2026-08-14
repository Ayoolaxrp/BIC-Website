-- ============================================================================
-- Babcock Investors Club — Email triggers (DRAFT — for review, not yet run)
-- ============================================================================
-- Fires the send-email Edge Function whenever a new row lands in
--   member_applications  → membership application confirmation email
--   rsvps                → event RSVP confirmation email
--
-- PREREQUISITES (do these FIRST, in order):
--   1. Deploy the function and set its secrets:
--        supabase functions deploy send-email --no-verify-jwt
--        supabase secrets set RESEND_API_KEY=re_... \
--          FROM_EMAIL="Babcock Investors Club <onboarding@resend.dev>" \
--          WEBHOOK_SECRET=<same random string as below> \
--          SITE_URL=https://babcockinvestorsclub.org
--   2. Edit the two placeholders in this file:
--        YOUR_PROJECT_REF      → your Supabase project ref
--                                (the <ref> in https://<ref>.supabase.co)
--        CHANGE_ME_WEBHOOK_SECRET → the EXACT same string you set as
--                                WEBHOOK_SECRET above. Use something long and
--                                random, e.g. `openssl rand -hex 32`.
--   3. Run this whole file in the Supabase SQL Editor. Safe to re-run.
--
-- Notes:
--   * The trigger is a no-op when the row has no email address.
--   * If the function call fails (e.g. it isn't deployed yet), the insert still
--     succeeds — the email just doesn't fire. Check the function logs with:
--       supabase functions logs send-email
--   * Prefer this SQL approach over the Dashboard "Database Webhooks" UI so it
--     lives in the repo with the rest of the schema.
-- ============================================================================

create or replace function public.send_email_on_insert()
returns trigger
language plpgsql
security definer set search_path = public, supabase_functions
as $$
begin
  if NEW.email is null or NEW.email = '' then
    return NEW; -- nothing to send to
  end if;

  perform supabase_functions.http_request(
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email',
    'POST',
    '{"Content-Type":"application/json","x-webhook-secret":"CHANGE_ME_WEBHOOK_SECRET"}',
    jsonb_build_object('table', TG_TABLE_NAME, 'record', to_jsonb(NEW)),
    '1000'  -- timeout ms; email sending is async in the function
  );
  return NEW;
end;
$$;

-- Membership application → confirmation email
drop trigger if exists trg_member_app_email on public.member_applications;
create trigger trg_member_app_email
  after insert on public.member_applications
  for each row execute function public.send_email_on_insert();

-- Event RSVP → confirmation email
drop trigger if exists trg_rsvp_email on public.rsvps;
create trigger trg_rsvp_email
  after insert on public.rsvps
  for each row execute function public.send_email_on_insert();

-- ---------------------------------------------------------------------------
-- Verify (run on its own after the above):
-- ---------------------------------------------------------------------------
-- select tgname, tgrelid::regclass, pg_get_triggerdef(oid)
-- from pg_trigger
-- where not tgisinternal
--   and tgname in ('trg_member_app_email', 'trg_rsvp_email');
