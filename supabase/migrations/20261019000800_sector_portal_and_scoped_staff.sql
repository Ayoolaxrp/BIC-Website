-- ============================================================================
-- BIC · 0800 · Paid sector portal and scoped executive access
-- - Paid membership unlocks protected content.
-- - A paid member's sector is authoritative and cannot be self-switched.
-- - Executive permissions are attached to verified school emails and limited
--   by sector/campus. profiles.role = 'admin' remains super-admin only.
-- ============================================================================

alter table public.profiles add column if not exists campus text default 'Ilishan';
alter table public.member_applications add column if not exists campus text default 'Ilishan';

alter table public.events add column if not exists sector text;
alter table public.events add column if not exists campus text;
alter table public.events add column if not exists visibility text not null default 'public';
alter table public.articles add column if not exists sector text;
alter table public.articles add column if not exists campus text;
alter table public.articles add column if not exists visibility text not null default 'public';
alter table public.resources add column if not exists campus text;
alter table public.resources add column if not exists visibility text not null default 'members';
alter table public.newsletter_posts add column if not exists sector text;
alter table public.newsletter_posts add column if not exists campus text;
alter table public.newsletter_posts add column if not exists visibility text not null default 'public';

do $$
declare t text;
begin
  foreach t in array array['events', 'articles', 'resources', 'newsletter_posts'] loop
    if not exists (select 1 from pg_constraint where conname = t || '_visibility_check') then
      execute format(
        'alter table public.%I add constraint %I check (visibility in (''public'', ''members'', ''sector''))',
        t, t || '_visibility_check'
      );
    end if;
  end loop;
end $$;

create table if not exists public.executive_access (
  email       text primary key,
  full_name   text not null,
  permissions text[] not null default '{}',
  sector      text,
  campus      text,
  user_id     uuid unique references auth.users(id) on delete set null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint executive_access_email_lowercase check (email = lower(email))
);

insert into public.executive_access (email, full_name, permissions, sector, campus)
values
  ('karibi-whytem6125@student.babcock.edu.ng', 'Monima Edward Karibi-Whyte',
   array['manage_events','view_rsvps'], null, 'Iperu'),
  ('georgewilld4473@student.babcock.edu.ng', 'Daniella Georgewill Fabia',
   array['manage_content','manage_members','view_rsvps'], null, 'Iperu'),
  ('inofep5668@student.babcock.edu.ng', 'Inofe Peace Otsebholu',
   array['manage_content','manage_events','manage_resources','view_members','view_rsvps'], 'Securities', null),
  ('obiajulud0850@student.babcock.edu.ng', 'Obiajulu Daniela Chidubem',
   array['manage_content','manage_newsletter','manage_media','view_contacts'], null, null)
on conflict (email) do update set
  full_name = excluded.full_name,
  permissions = excluded.permissions,
  sector = excluded.sector,
  campus = excluded.campus,
  active = true,
  updated_at = now();

-- Bind pre-approved access after the executive verifies and creates an account.
create or replace function public.bind_executive_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.executive_access
     set user_id = new.id, updated_at = now()
   where email = lower(new.email) and active;
  return new;
end;
$$;
revoke execute on function public.bind_executive_access() from public, anon, authenticated;

drop trigger if exists trg_bind_executive_access on auth.users;
create trigger trg_bind_executive_access
  after insert or update of email on auth.users
  for each row execute function public.bind_executive_access();

-- Bind assignments for accounts that already existed before this migration.
update public.executive_access ea
   set user_id = u.id, updated_at = now()
  from auth.users u
 where ea.email = lower(u.email) and ea.active;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (select public.email_is_confirmed()) and exists (
    select 1 from public.member_applications ma
    where lower(ma.email) = lower((select auth.jwt()) ->> 'email')
      and ma.payment_status = 'paid'
  );
$$;

create or replace function public.current_member_sector()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ma.sector from public.member_applications ma
  where lower(ma.email) = lower((select auth.jwt()) ->> 'email')
    and ma.payment_status = 'paid'
  order by ma.payment_verified_at desc nulls last, ma.created_at desc
  limit 1;
$$;

create or replace function public.current_member_campus()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(ma.campus, 'Ilishan') from public.member_applications ma
  where lower(ma.email) = lower((select auth.jwt()) ->> 'email')
    and ma.payment_status = 'paid'
  order by ma.payment_verified_at desc nulls last, ma.created_at desc
  limit 1;
$$;

create or replace function public.has_staff_permission(
  requested_permission text,
  target_sector text default null,
  target_campus text default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.executive_access ea
    where ea.user_id = auth.uid()
      and ea.active
      and requested_permission = any(ea.permissions)
      and (
        (ea.sector is null and ea.campus is null)
        or (target_sector is not null and ea.sector = target_sector)
        or (target_campus is not null and ea.campus = target_campus)
      )
  );
$$;

create or replace function public.has_staff_role(requested_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.executive_access ea
    where ea.user_id = auth.uid() and ea.active
      and requested_permission = any(ea.permissions)
  );
$$;

revoke execute on function public.is_active_member() from public;
revoke execute on function public.current_member_sector() from public;
revoke execute on function public.current_member_campus() from public;
revoke execute on function public.has_staff_permission(text, text, text) from public;
revoke execute on function public.has_staff_role(text) from public;
-- These helpers are referenced by policies shared with anon. SECURITY DEFINER
-- returns only booleans/a single sector and discloses no rows by itself.
grant execute on function public.is_active_member() to anon, authenticated;
grant execute on function public.current_member_sector() to anon, authenticated;
grant execute on function public.current_member_campus() to anon, authenticated;
grant execute on function public.has_staff_permission(text, text, text) to anon, authenticated;
grant execute on function public.has_staff_role(text) to anon, authenticated;

-- Keep a paid member's profile aligned with their approved application.
create or replace function public.sync_paid_member_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.payment_status = 'paid' then
    update public.profiles
       set sector = new.sector, campus = coalesce(new.campus, 'Ilishan')
     where lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;
revoke execute on function public.sync_paid_member_profile() from public, anon, authenticated;
drop trigger if exists trg_sync_paid_member_profile on public.member_applications;
create trigger trg_sync_paid_member_profile
  after insert or update of payment_status, sector, campus on public.member_applications
  for each row execute function public.sync_paid_member_profile();

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.email := old.email;
    new.id := old.id;
    new.created_at := old.created_at;
    if public.is_active_member() then
      new.sector := old.sector;
      new.campus := old.campus;
    end if;
  end if;
  return new;
end;
$$;

-- Executives can read their own assignment; only service role/SQL owners alter it.
alter table public.executive_access enable row level security;
drop policy if exists "executive access: read own" on public.executive_access;
create policy "executive access: read own" on public.executive_access
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
revoke all on public.executive_access from anon, authenticated;
grant select on public.executive_access to authenticated;

-- Content visibility and scoped writes are enforced in the database.
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('events','articles','resources','newsletter_posts')
  loop execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename); end loop;
end $$;

create policy "events: audience read" on public.events for select to anon, authenticated using (
  visibility = 'public'
  or ((select public.is_active_member()) and visibility = 'members')
  or ((select public.is_active_member()) and visibility = 'sector' and sector = (select public.current_member_sector()))
  or (select public.has_staff_permission('manage_events', sector, campus))
);
create policy "articles: audience read" on public.articles for select to anon, authenticated using (
  visibility = 'public'
  or ((select public.is_active_member()) and visibility = 'members')
  or ((select public.is_active_member()) and visibility = 'sector' and sector = (select public.current_member_sector()))
  or (select public.has_staff_permission('manage_content', sector, campus))
);
create policy "resources: audience read" on public.resources for select to anon, authenticated using (
  ((select public.is_active_member()) and visibility = 'members')
  or ((select public.is_active_member()) and visibility = 'sector' and sector = (select public.current_member_sector()))
  or (select public.has_staff_permission('manage_resources', sector, campus))
  or (visibility = 'public')
);
create policy "newsletter: audience read" on public.newsletter_posts for select to anon, authenticated using (
  status = 'published' and (
    visibility = 'public'
    or ((select public.is_active_member()) and visibility = 'members')
    or ((select public.is_active_member()) and visibility = 'sector' and sector = (select public.current_member_sector()))
  )
  or (select public.has_staff_permission('manage_newsletter', sector, campus))
);

create policy "events: scoped insert" on public.events for insert to authenticated
  with check ((select public.has_staff_permission('manage_events', sector, campus)));
create policy "events: scoped update" on public.events for update to authenticated
  using ((select public.has_staff_permission('manage_events', sector, campus)))
  with check ((select public.has_staff_permission('manage_events', sector, campus)));
create policy "events: scoped delete" on public.events for delete to authenticated
  using ((select public.has_staff_permission('manage_events', sector, campus)));

create policy "articles: scoped insert" on public.articles for insert to authenticated
  with check ((select public.has_staff_permission('manage_content', sector, campus)));
create policy "articles: scoped update" on public.articles for update to authenticated
  using ((select public.has_staff_permission('manage_content', sector, campus)))
  with check ((select public.has_staff_permission('manage_content', sector, campus)));
create policy "articles: scoped delete" on public.articles for delete to authenticated
  using ((select public.has_staff_permission('manage_content', sector, campus)));

create policy "resources: scoped insert" on public.resources for insert to authenticated
  with check ((select public.has_staff_permission('manage_resources', sector, campus)));
create policy "resources: scoped update" on public.resources for update to authenticated
  using ((select public.has_staff_permission('manage_resources', sector, campus)))
  with check ((select public.has_staff_permission('manage_resources', sector, campus)));
create policy "resources: scoped delete" on public.resources for delete to authenticated
  using ((select public.has_staff_permission('manage_resources', sector, campus)));

create policy "newsletter: scoped insert" on public.newsletter_posts for insert to authenticated
  with check ((select public.has_staff_permission('manage_newsletter', sector, campus)));
create policy "newsletter: scoped update" on public.newsletter_posts for update to authenticated
  using ((select public.has_staff_permission('manage_newsletter', sector, campus)))
  with check ((select public.has_staff_permission('manage_newsletter', sector, campus)));
create policy "newsletter: scoped delete" on public.newsletter_posts for delete to authenticated
  using ((select public.has_staff_permission('manage_newsletter', sector, campus)));

-- Scoped access to applications and RSVPs. Finance remains super-admin only.
drop policy if exists "member_applications: read own or admin" on public.member_applications;
create policy "member applications: own or scoped staff" on public.member_applications
  for select to authenticated using (
    (lower(email) = lower((select auth.jwt()) ->> 'email') and (select public.email_is_confirmed()))
    or (select public.is_admin())
    or (select public.has_staff_permission('manage_members', sector, campus))
    or (select public.has_staff_permission('view_members', sector, campus))
  );

drop policy if exists "rsvps: read own or admin" on public.rsvps;
create policy "rsvps: own or scoped staff" on public.rsvps
  for select to authenticated using (
    (lower(email) = lower((select auth.jwt()) ->> 'email') and (select public.email_is_confirmed()))
    or (select public.is_admin())
    or exists (
      select 1 from public.events e where e.id = rsvps.event_id
        and (select public.has_staff_permission('view_rsvps', e.sector, e.campus))
    )
  );

-- Contact messages are available only to super admins and designated PR staff.
drop policy if exists "contact_messages: admin read" on public.contact_messages;
create policy "contact messages: authorised read" on public.contact_messages
  for select to authenticated using (
    (select public.is_admin()) or (select public.has_staff_permission('view_contacts', null, null))
  );

create index if not exists idx_executive_access_user on public.executive_access(user_id) where active;
create index if not exists idx_member_app_sector_paid on public.member_applications(sector, payment_status);
create index if not exists idx_events_audience on public.events(visibility, sector, campus);
create index if not exists idx_articles_audience on public.articles(visibility, sector, campus);
create index if not exists idx_resources_audience on public.resources(visibility, sector, campus);

-- Member files must not remain reachable through permanent public URLs.
update storage.buckets set public = false where id = 'bic-resources';

create or replace function public.can_access_resource_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1 from public.resources r
    where (r.file_url = object_name or r.file_url like '%/bic-resources/' || object_name)
      and (
        (r.visibility = 'public')
        or (public.is_active_member() and r.visibility = 'members')
        or (public.is_active_member() and r.visibility = 'sector' and r.sector = public.current_member_sector())
        or public.has_staff_permission('manage_resources', r.sector, r.campus)
      )
  );
$$;
revoke execute on function public.can_access_resource_object(text) from public;
grant execute on function public.can_access_resource_object(text) to anon, authenticated;

drop policy if exists "bic: public read" on storage.objects;
drop policy if exists "bic: admin insert" on storage.objects;
drop policy if exists "bic: admin update" on storage.objects;
drop policy if exists "bic: admin delete" on storage.objects;
drop policy if exists "bic: images public read" on storage.objects;
drop policy if exists "bic: protected resource read" on storage.objects;
drop policy if exists "bic: scoped insert" on storage.objects;
drop policy if exists "bic: super admin update" on storage.objects;
drop policy if exists "bic: super admin delete" on storage.objects;

create policy "bic: images public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'bic-images');
create policy "bic: protected resource read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'bic-resources' and (select public.can_access_resource_object(name)));
create policy "bic: scoped insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'bic-images' and (
      (select public.is_admin())
      or (select public.has_staff_role('manage_media'))
      or (select public.has_staff_role('manage_content'))
    )
    or bucket_id = 'bic-resources' and (
      (select public.is_admin())
      or (select public.has_staff_role('manage_resources'))
    )
  );
create policy "bic: super admin update" on storage.objects
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "bic: super admin delete" on storage.objects
  for delete to authenticated using ((select public.is_admin()));

