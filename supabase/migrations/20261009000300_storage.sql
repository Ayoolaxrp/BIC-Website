-- ============================================================================
-- BIC · 0300 · Storage buckets for admin uploads
-- Images 5 MB, resources 3.5 MB (matches src/lib/upload.js). Public read,
-- admin-only write. SVG is not allowed: it can carry script.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('bic-images', 'bic-images', true, 5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('bic-resources', 'bic-resources', true, 3670016,
    array['application/pdf', 'text/csv', 'text/plain', 'application/zip',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Old policy names from schema.sql
drop policy if exists "public read bic-images"     on storage.objects;
drop policy if exists "public read bic-resources"  on storage.objects;
drop policy if exists "admin upload bic-images"    on storage.objects;
drop policy if exists "admin upload bic-resources" on storage.objects;
drop policy if exists "admin delete objects"       on storage.objects;
-- Current names
drop policy if exists "bic: public read"   on storage.objects;
drop policy if exists "bic: admin insert"  on storage.objects;
drop policy if exists "bic: admin update"  on storage.objects;
drop policy if exists "bic: admin delete"  on storage.objects;

create policy "bic: public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('bic-images', 'bic-resources'));

create policy "bic: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('bic-images', 'bic-resources') and (select public.is_admin()));

create policy "bic: admin update" on storage.objects
  for update to authenticated
  using (bucket_id in ('bic-images', 'bic-resources') and (select public.is_admin()))
  with check (bucket_id in ('bic-images', 'bic-resources') and (select public.is_admin()));

create policy "bic: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('bic-images', 'bic-resources') and (select public.is_admin()));
