-- ============================================================================
-- BIC · 0100 · Core schema
-- Tables, helper functions and triggers that match what the frontend reads
-- and writes (src/lib/api.js, auth.js, store.js, pages/*).
-- Idempotent: safe on a fresh project and on one that ran the old schema.sql.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- PROFILES: one per auth user. role decides admin vs member.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  email      text not null,
  role       text not null default 'member',
  avatar_url text,
  sector     text,
  phone      text,
  bio        text,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists sector text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles add constraint profiles_role_check check (role in ('member', 'admin'));
  end if;
end $$;

-- Admin check used by RLS. SECURITY DEFINER so it can read profiles under RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- New auth user -> profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Members may edit their own profile, but never their role or email.
-- (Without this, "update own profile" lets any member promote themselves.)
-- SQL editor / service role (auth.uid() is null) can still promote admins.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role  := old.role;
    new.email := old.email;
    new.id    := old.id;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_fields on public.profiles;
create trigger trg_protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------------------------------------------------------------------------
-- CONTENT (admin-managed, publicly readable)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  event_date  date,
  event_time  text,
  location    text,
  event_type  text,
  image_url   text,
  featured    boolean not null default false,
  is_upcoming boolean not null default true,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles (id) on delete set null
);

create table if not exists public.articles (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  author         text not null default 'Babcock Investors Club',
  source_name    text not null default 'Babcock Investors Club',
  source_url     text default '',
  category       text,
  summary        text default '',
  cover_url      text default '',
  published_date text,
  body           text default '',
  is_external    boolean not null default true,
  created_at     timestamptz not null default now(),
  created_by     uuid references public.profiles (id) on delete set null
);
alter table public.articles add column if not exists author text not null default 'Babcock Investors Club';
alter table public.articles add column if not exists body text default '';
alter table public.articles add column if not exists is_external boolean not null default true;

create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  file_url    text not null,
  description text default '',
  size_label  text default '',
  sector      text,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles (id) on delete set null
);
alter table public.resources add column if not exists sector text;

create table if not exists public.newsletter_posts (
  id         uuid primary key default gen_random_uuid(),
  subject    text not null,
  body       text not null,
  status     text not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'newsletter_posts_status_check') then
    alter table public.newsletter_posts add constraint newsletter_posts_status_check check (status in ('draft', 'published'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- SUBMISSIONS (public forms: insert-only for visitors)
-- ---------------------------------------------------------------------------
create table if not exists public.member_applications (
  id                  bigint generated always as identity primary key,
  created_at          timestamptz not null default now(),
  full_name           text not null,
  matric_number       text,
  phone_number        text,
  department          text,
  level               text,
  email               text not null,
  knowledge_level     text,
  interests           text[],
  sector              text,
  committee           text,
  paystack_ref        text,
  payment_status      text not null default 'pending',
  payment_verified_at timestamptz
);
alter table public.member_applications add column if not exists sector text;
alter table public.member_applications add column if not exists payment_status text not null default 'pending';
alter table public.member_applications add column if not exists payment_verified_at timestamptz;

create table if not exists public.contact_messages (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  first_name text,
  last_name  text,
  email      text not null,
  subject    text,
  message    text not null
);

create table if not exists public.sponsorship_inquiries (
  id                   bigint generated always as identity primary key,
  created_at           timestamptz not null default now(),
  contact_name         text not null,
  company_name         text not null,
  email                text not null,
  phone                text,
  sponsorship_interest text,
  message              text
);

create table if not exists public.rsvps (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null,
  email      text not null,
  event_name text,
  event_id   uuid references public.events (id) on delete set null
);
alter table public.rsvps add column if not exists event_id uuid references public.events (id) on delete set null;

create table if not exists public.subscribers (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email      text not null unique
);

-- Payments recorded by the paystack-webhook edge function (service role only).
create table if not exists public.payments (
  id           bigint generated always as identity primary key,
  paystack_ref text not null unique,
  payment_type text not null default 'membership',
  email        text,
  amount_kobo  bigint,
  status       text not null default 'paid',
  event_id     text,
  event_name   text,
  raw          jsonb,
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- GUARDRAILS on public input: sane lengths and email shape. NOT VALID so an
-- existing project with older rows still migrates; new rows are checked.
-- ---------------------------------------------------------------------------
do $$
declare
  c record;
begin
  for c in
    select * from (values
      ('member_applications',   'member_applications_payment_status_check', $c$payment_status in ('pending', 'paid')$c$),
      ('payments',              'payments_type_check',                      $c$payment_type in ('membership', 'ticket')$c$),
      ('payments',              'payments_status_check',                    $c$status in ('paid', 'failed')$c$),
      ('member_applications',   'member_applications_email_shape',          $c$email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320$c$),
      ('member_applications',   'member_applications_lengths',              $c$char_length(full_name) <= 200 and coalesce(char_length(matric_number), 0) <= 40 and coalesce(char_length(phone_number), 0) <= 40 and coalesce(char_length(department), 0) <= 120 and coalesce(char_length(level), 0) <= 20 and coalesce(char_length(committee), 0) <= 120 and coalesce(char_length(sector), 0) <= 60 and coalesce(cardinality(interests), 0) <= 20$c$),
      ('contact_messages',      'contact_messages_email_shape',             $c$email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320$c$),
      ('contact_messages',      'contact_messages_lengths',                 $c$char_length(message) <= 5000 and coalesce(char_length(first_name), 0) <= 100 and coalesce(char_length(last_name), 0) <= 100 and coalesce(char_length(subject), 0) <= 60$c$),
      ('sponsorship_inquiries', 'sponsorship_inquiries_email_shape',        $c$email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320$c$),
      ('sponsorship_inquiries', 'sponsorship_inquiries_lengths',            $c$char_length(contact_name) <= 200 and char_length(company_name) <= 200 and coalesce(char_length(phone), 0) <= 40 and coalesce(char_length(message), 0) <= 5000 and coalesce(char_length(sponsorship_interest), 0) <= 40$c$),
      ('rsvps',                 'rsvps_email_shape',                        $c$email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320$c$),
      ('rsvps',                 'rsvps_lengths',                            $c$char_length(name) <= 200 and coalesce(char_length(event_name), 0) <= 200$c$),
      ('subscribers',           'subscribers_email_shape',                  $c$email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320$c$)
    ) as t(tbl, name, expr)
  loop
    if not exists (select 1 from pg_constraint where conname = c.name) then
      execute format('alter table public.%I add constraint %I check (%s) not valid', c.tbl, c.name, c.expr);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- INDEXES for the queries the frontend and webhook run
-- ---------------------------------------------------------------------------
create index if not exists idx_member_app_email     on public.member_applications (lower(email));
create index if not exists idx_member_app_paystack  on public.member_applications (paystack_ref);
create index if not exists idx_rsvps_email          on public.rsvps (lower(email));
create index if not exists idx_events_upcoming      on public.events (is_upcoming, event_date);
create index if not exists idx_articles_category    on public.articles (category);
create index if not exists idx_resources_sector     on public.resources (sector);
create index if not exists idx_newsletter_status    on public.newsletter_posts (status);
create index if not exists idx_payments_email       on public.payments (email);
create index if not exists idx_payments_type        on public.payments (payment_type);
create index if not exists idx_events_created_by    on public.events (created_by);
create index if not exists idx_articles_created_by  on public.articles (created_by);
create index if not exists idx_resources_created_by on public.resources (created_by);
create index if not exists idx_newsletter_created_by on public.newsletter_posts (created_by);
create index if not exists idx_rsvps_event_id       on public.rsvps (event_id);
