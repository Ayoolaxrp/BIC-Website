-- Targeted additive migration for the recovered, already-applied Kora contract.
-- Apply this file only after verifying create_kora_intent(text,jsonb) and
-- kora_checkout_intents match the recovered contract. Do not replay old migrations.
-- No existing application, intent or payment rows are updated/deleted.
-- CREATE OR REPLACE retains the existing function owner and service-only ACL.
create index if not exists kora_checkout_intents_created_at_idx
  on public.kora_checkout_intents (created_at);
create index if not exists kora_checkout_intents_email_created_at_idx
  on public.kora_checkout_intents (lower(btrim(email)), created_at);

create or replace function public.create_kora_intent(p_reference text, p_application jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  app_id bigint;
  normalized_email text := lower(btrim(p_application->>'email'));
  checked_at timestamptz;
begin
  if p_reference is null or p_reference !~ '^BIC-KORA-[0-9a-f-]{36}$'
     or normalized_email is null or normalized_email !~ '^[^[:space:]@]+@babcock\.edu\.ng$' then
    raise exception 'Invalid checkout intent';
  end if;
  -- Serialize ALL initializations, not merely the same email. Transaction-scoped
  -- lock is held through both inserts/commit, including across parallel RPCs.
  -- READ COMMITTED (PostgREST default) is needed for a fresh count after waiting.
  -- Fail closed for snapshot-isolated callers rather than count a stale snapshot.
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Checkout initialization requires read committed isolation';
  end if;
  perform pg_advisory_xact_lock(1112097611, 1);
  checked_at := clock_timestamp();
  if (select count(*) from public.kora_checkout_intents
      where lower(btrim(email)) = normalized_email
        and created_at >= checked_at - interval '1 hour') >= 3 then
    raise exception 'Checkout initialization email limit reached';
  end if;
  if (select count(*) from public.kora_checkout_intents
      where created_at >= checked_at - interval '1 minute') >= 30 then
    raise exception 'Checkout initialization global limit reached';
  end if;
  insert into public.member_applications(full_name, matric_number, phone_number, department, level, email, knowledge_level, interests, sector, campus, committee, paystack_ref)
  values (p_application->>'full_name', p_application->>'matric_number', p_application->>'phone_number', p_application->>'department', p_application->>'level', normalized_email, p_application->>'knowledge_level', array(select jsonb_array_elements_text(p_application->'interests')), nullif(p_application->>'sector',''), nullif(p_application->>'campus',''), p_application->>'committee', p_reference)
  returning id into app_id;
  insert into public.kora_checkout_intents(reference, application_id, email, amount_kobo, created_at)
  values (p_reference, app_id, normalized_email, 250000, checked_at);
end $$;
