-- ============================================================================
-- Babcock Investors Club — Full Supabase schema (v2)
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query → Run).
-- Safe to run multiple times. Creates tables, triggers, RLS and admin helpers.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES (one per auth user). `role` decides admin vs member.
--    Promote a user to admin:  update profiles set role='admin' where email='...';
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text not null,
  role       text not null default 'member' check (role in ('member', 'admin')),
  avatar_url text,
  sector     text,               -- Crypto | Forex | Securities | Real Estate | General
  phone      text,
  bio        text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists sector text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists bio text;

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Admin check used by RLS policies
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. EVENTS (managed by admins, shown on the Events page)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  event_date  date,
  event_time  text,
  location    text,
  event_type  text,               -- Summit | Workshop | Competition | Mixer ...
  image_url   text,
  featured    boolean not null default false,
  is_upcoming boolean not null default true,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles(id) on delete set null
);

-- ---------------------------------------------------------------------------
-- 3. ARTICLES — two kinds:
--    is_external = true  → curated real article (source_name/source_url link out)
--    is_external = false → club-written article (body holds the full content)
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  source_name   text not null default 'Babcock Investors Club',
  source_url    text default '',
  category      text,             -- Market Updates | Financial Literacy | Student Finance | Investment Strategies
  summary       text default '',
  cover_url     text default '',
  published_date text,
  body          text default '',  -- full content for club-written articles
  is_external   boolean not null default true,
  created_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id) on delete set null
);

-- Backfill for tables created before this column existed (idempotent)
alter table public.articles add column if not exists body text default '';
alter table public.articles add column if not exists is_external boolean not null default true;

-- Storage buckets for admin uploads (images up to 5MB, resources up to 3.5MB)
insert into storage.buckets (id, name, public)
values ('bic-images', 'bic-images', true),
       ('bic-resources', 'bic-resources', true)
on conflict (id) do nothing;

-- Public can read files; only authenticated admins upload (storage RLS)
drop policy if exists "public read bic-images" on storage.objects;
create policy "public read bic-images" on storage.objects
  for select using (bucket_id = 'bic-images');
drop policy if exists "public read bic-resources" on storage.objects;
create policy "public read bic-resources" on storage.objects
  for select using (bucket_id = 'bic-resources');
drop policy if exists "admin upload bic-images" on storage.objects;
create policy "admin upload bic-images" on storage.objects
  for insert with check (bucket_id = 'bic-images' and public.is_admin());
drop policy if exists "admin upload bic-resources" on storage.objects;
create policy "admin upload bic-resources" on storage.objects
  for insert with check (bucket_id = 'bic-resources' and public.is_admin());
drop policy if exists "admin delete objects" on storage.objects;
create policy "admin delete objects" on storage.objects
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. RESOURCES (downloadable files)
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  file_url    text not null,
  description text default '',
  size_label  text default '',
  sector      text,               -- Crypto | Forex | Securities | Real Estate | General (null = all)
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles(id) on delete set null
);

alter table public.resources add column if not exists sector text;

-- ---------------------------------------------------------------------------
-- 5. NEWSLETTER POSTS (admin drafts, published to the site)
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_posts (
  id         uuid primary key default gen_random_uuid(),
  subject    text not null,
  body       text not null,
  status     text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

-- ---------------------------------------------------------------------------
-- 6. SUBMISSIONS (anonymous form data — insert-only for the public)
-- ---------------------------------------------------------------------------
create table if not exists public.member_applications (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  full_name      text not null,
  matric_number  text,
  phone_number   text,
  department     text,
  level          text,
  email          text not null,
  knowledge_level text,
  interests      text[],
  sector         text,           -- Crypto | Forex | Securities | Real Estate | General
  committee      text,
  paystack_ref   text
);

alter table public.member_applications add column if not exists sector text;

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
  event_name text
);

create table if not exists public.subscribers (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email      text not null unique
);

-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles               enable row level security;
alter table public.events                 enable row level security;
alter table public.articles               enable row level security;
alter table public.resources              enable row level security;
alter table public.newsletter_posts       enable row level security;
alter table public.member_applications    enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.sponsorship_inquiries  enable row level security;
alter table public.rsvps                  enable row level security;
alter table public.subscribers            enable row level security;

-- Profiles: users read/write their own; admins read all
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- Events / Articles / Resources / Newsletter: public read, admin manage
do $$
declare t text;
begin
  foreach t in array array['events', 'articles', 'resources', 'newsletter_posts'] loop
    execute format('drop policy if exists "public read %I" on public.%I;', t, t);
    execute format('create policy "public read %I" on public.%I for select using (true);', t, t);
    execute format('drop policy if exists "admin all %I" on public.%I;', t, t);
    execute format('create policy "admin all %I" on public.%I for all using (public.is_admin()) with check (public.is_admin());', t, t);
  end loop;
end $$;

-- Submissions: anonymous insert, admin read
drop policy if exists "anon insert member_applications" on public.member_applications;
create policy "anon insert member_applications" on public.member_applications
  for insert to anon with check (true);
drop policy if exists "admin read member_applications" on public.member_applications;
create policy "admin read member_applications" on public.member_applications
  for select using (public.is_admin());

drop policy if exists "anon insert contact_messages" on public.contact_messages;
create policy "anon insert contact_messages" on public.contact_messages
  for insert to anon with check (true);
drop policy if exists "admin read contact_messages" on public.contact_messages;
create policy "admin read contact_messages" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "anon insert sponsorship_inquiries" on public.sponsorship_inquiries;
create policy "anon insert sponsorship_inquiries" on public.sponsorship_inquiries
  for insert to anon with check (true);
drop policy if exists "admin read sponsorship_inquiries" on public.sponsorship_inquiries;
create policy "admin read sponsorship_inquiries" on public.sponsorship_inquiries
  for select using (public.is_admin());

drop policy if exists "anon insert rsvps" on public.rsvps;
create policy "anon insert rsvps" on public.rsvps
  for insert to anon with check (true);
drop policy if exists "member select own rsvps" on public.rsvps;
create policy "member select own rsvps" on public.rsvps
  for select using (auth.jwt() ->> 'email' = email);

drop policy if exists "anon insert subscribers" on public.subscribers;
create policy "anon insert subscribers" on public.subscribers
  for insert to anon with check (true);
drop policy if exists "admin read subscribers" on public.subscribers;
create policy "admin read subscribers" on public.subscribers
  for select using (public.is_admin());

-- Explicit grants (independent of Supabase default privileges)
grant usage on schema public to anon, authenticated;
grant insert on public.member_applications, public.contact_messages,
  public.sponsorship_inquiries, public.rsvps, public.subscribers to anon;
grant select on public.events, public.articles, public.resources,
  public.newsletter_posts to anon, authenticated;
