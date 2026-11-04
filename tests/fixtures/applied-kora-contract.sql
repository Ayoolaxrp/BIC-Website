-- Local candidate only: review and apply separately with explicit database approval.
-- Compatibility: keep legacy paystack_ref as the generic unique ledger/reference field.
create table if not exists public.kora_checkout_intents (
  reference text primary key check (reference ~ '^BIC-KORA-[0-9a-f-]{36}$'),
  application_id bigint not null unique references public.member_applications(id),
  email text not null,
  amount_kobo bigint not null check (amount_kobo = 250000),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'pending' check (status in ('pending','paid')),
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
alter table public.kora_checkout_intents enable row level security;
revoke all on public.kora_checkout_intents from public, anon, authenticated;
-- No client policies. Access only through narrowly scoped service-role RPCs.
alter table public.member_applications drop constraint if exists member_app_payment_method_check;
alter table public.member_applications add constraint member_app_payment_method_check
  check (payment_method is null or payment_method in ('paystack','kora','cash','transfer')) not valid;

create or replace function public.create_kora_intent(p_reference text, p_application jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare app_id bigint;
begin
  if p_reference !~ '^BIC-KORA-[0-9a-f-]{36}$' or p_application->>'email' !~* '^[^[:space:]@]+@babcock\.edu\.ng$' then
    raise exception 'Invalid checkout intent';
  end if;
  insert into public.member_applications(full_name, matric_number, phone_number, department, level, email, knowledge_level, interests, sector, campus, committee, paystack_ref)
  values (p_application->>'full_name', p_application->>'matric_number', p_application->>'phone_number', p_application->>'department', p_application->>'level', lower(p_application->>'email'), p_application->>'knowledge_level', array(select jsonb_array_elements_text(p_application->'interests')), nullif(p_application->>'sector',''), nullif(p_application->>'campus',''), p_application->>'committee', p_reference)
  returning id into app_id;
  insert into public.kora_checkout_intents(reference, application_id, email, amount_kobo)
  values (p_reference, app_id, lower(p_application->>'email'), 250000);
end $$;

create or replace function public.get_kora_intent(p_reference text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object('reference', reference, 'email', email, 'amount_kobo', amount_kobo, 'currency', currency, 'status', status)
  from public.kora_checkout_intents where reference = p_reference;
$$;

create or replace function public.finalize_kora_payment(p_reference text, p_amount_kobo bigint, p_currency text)
returns void language plpgsql security definer set search_path = public as $$
declare intent public.kora_checkout_intents%rowtype; ledger public.payments%rowtype;
begin
  select * into intent from public.kora_checkout_intents where reference = p_reference for update;
  if not found then raise exception 'Checkout not found'; end if;
  if p_amount_kobo is distinct from intent.amount_kobo or p_currency is distinct from intent.currency then raise exception 'Checkout amount or currency mismatch'; end if;
  if intent.status = 'paid' then return; end if;
  -- Locked intent and transaction make webhook/return races safe, with no partial paid state.
  insert into public.payments(paystack_ref, payment_type, email, amount_kobo, status, verified_at, raw)
  values (intent.reference, 'membership', intent.email, intent.amount_kobo, 'paid', now(), '{"provider":"kora"}'::jsonb)
  on conflict (paystack_ref) do nothing;
  select * into ledger from public.payments where paystack_ref = intent.reference;
  if ledger.payment_type <> 'membership' or ledger.status <> 'paid' or ledger.email is distinct from intent.email or ledger.amount_kobo is distinct from intent.amount_kobo or ledger.raw->>'provider' is distinct from 'kora' then raise exception 'Conflicting payment ledger'; end if;
  update public.member_applications set payment_status = 'paid', payment_method = 'kora', payment_verified_at = now()
  where id = intent.application_id and paystack_ref = intent.reference and lower(email) = intent.email;
  if not found then raise exception 'Checkout application mismatch'; end if;
  update public.kora_checkout_intents set status = 'paid', verified_at = now() where reference = intent.reference;
end $$;
revoke all on function public.create_kora_intent(text,jsonb), public.get_kora_intent(text), public.finalize_kora_payment(text,bigint,text) from public, anon, authenticated;
grant execute on function public.create_kora_intent(text,jsonb), public.get_kora_intent(text), public.finalize_kora_payment(text,bigint,text) to service_role;
  