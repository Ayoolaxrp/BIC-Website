-- ============================================================================
-- BIC · 0200 · Row Level Security, grants and function exposure
-- Every table has RLS on. Visitors can only insert into form tables; members
-- read their own rows; admins (profiles.role = 'admin') manage everything.
-- Idempotent: policies are dropped and recreated by name.
-- ============================================================================

alter table public.profiles              enable row level security;
alter table public.events                enable row level security;
alter table public.articles              enable row level security;
alter table public.resources             enable row level security;
alter table public.newsletter_posts      enable row level security;
alter table public.member_applications   enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.sponsorship_inquiries enable row level security;
alter table public.rsvps                 enable row level security;
alter table public.subscribers           enable row level security;
alter table public.payments              enable row level security;

-- Clear policies from the old schema.sql so names never collide or linger.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'events', 'articles', 'resources', 'newsletter_posts',
                        'member_applications', 'contact_messages', 'sponsorship_inquiries',
                        'rsvps', 'subscribers', 'payments')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- ---- PROFILES -------------------------------------------------------------
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles: admin update" on public.profiles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---- CONTENT: public read, admin write -----------------------------------
create policy "events: public read" on public.events
  for select to anon, authenticated using (true);
create policy "articles: public read" on public.articles
  for select to anon, authenticated using (true);
create policy "resources: public read" on public.resources
  for select to anon, authenticated using (true);
-- Drafts stay private; only published newsletter posts are public.
create policy "newsletter: public read published" on public.newsletter_posts
  for select to anon, authenticated using (status = 'published' or (select public.is_admin()));

do $$
declare
  t text;
begin
  foreach t in array array['events', 'articles', 'resources', 'newsletter_posts'] loop
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_admin()))', t || ': admin insert', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t || ': admin update', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))', t || ': admin delete', t);
  end loop;
end $$;

-- ---- SUBMISSIONS: anyone may submit, admins read and tidy -----------------
do $$
declare
  t text;
begin
  foreach t in array array['member_applications', 'contact_messages', 'sponsorship_inquiries', 'rsvps', 'subscribers'] loop
    execute format('create policy %I on public.%I for insert to anon, authenticated with check (true)', t || ': public insert', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))', t || ': admin delete', t);
  end loop;
end $$;

create policy "contact_messages: admin read" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "sponsorship_inquiries: admin read" on public.sponsorship_inquiries
  for select to authenticated using ((select public.is_admin()));
create policy "subscribers: admin read" on public.subscribers
  for select to authenticated using ((select public.is_admin()));

-- Members see their own application and RSVPs (matched on their login email).
create policy "member_applications: read own or admin" on public.member_applications
  for select to authenticated
  using (lower(email) = lower((select auth.jwt()) ->> 'email') or (select public.is_admin()));
create policy "rsvps: read own or admin" on public.rsvps
  for select to authenticated
  using (lower(email) = lower((select auth.jwt()) ->> 'email') or (select public.is_admin()));

-- ---- PAYMENTS: written by the webhook (service role bypasses RLS) ---------
create policy "payments: admin read" on public.payments
  for select to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- GRANTS (explicit, so behaviour never depends on project defaults)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

revoke all on public.profiles, public.events, public.articles, public.resources,
  public.newsletter_posts, public.member_applications, public.contact_messages,
  public.sponsorship_inquiries, public.rsvps, public.subscribers, public.payments
  from anon, authenticated;

grant select on public.events, public.articles, public.resources, public.newsletter_posts to anon, authenticated;
grant insert, update, delete on public.events, public.articles, public.resources, public.newsletter_posts to authenticated;

grant select, update on public.profiles to authenticated;

grant insert on public.member_applications, public.contact_messages,
  public.sponsorship_inquiries, public.rsvps, public.subscribers to anon, authenticated;
grant select, delete on public.member_applications, public.contact_messages,
  public.sponsorship_inquiries, public.rsvps, public.subscribers to authenticated;

grant select on public.payments to authenticated;

-- ---------------------------------------------------------------------------
-- FUNCTION EXPOSURE: every public function is callable at /rest/v1/rpc/.
-- Trigger functions must not be. is_admin() stays callable because RLS
-- policies evaluate it as the requesting role.
-- ---------------------------------------------------------------------------
revoke execute on function public.handle_new_user()        from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
revoke execute on function public.is_admin()               from public;
grant  execute on function public.is_admin()               to anon, authenticated;
