-- BIC · Member check for executives
-- One narrow, read-only lookup so a chair can answer "is this person registered, and have they paid?"
-- from a WhatsApp join request. It returns only name, WhatsApp number, sector, campus and paid status
-- (never email, matric number, department or level).
--
-- Who may call it: signed-in, club-wide executives with view_members or manage_members (or an admin).
-- Executives limited to one sector or campus cannot, because anyone who paid may join any group.
-- Short queries return nothing and results are capped, so it cannot be used to dump the member list.
-- Safe to run more than once. Changes no table and no existing function.
create or replace function public.member_check(p_query text)
returns table (
  full_name   text,
  phone_number text,
  sector      text,
  campus      text,
  paid        boolean,
  paid_at     timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  q          text := btrim(coalesce(p_query, ''));
  looks_like_number boolean := btrim(coalesce(p_query, '')) ~ '^[0-9+()[:space:]-]+$';
  digits     text := regexp_replace(coalesce(p_query, ''), '[^0-9]', '', 'g');
  tail10     text := right(regexp_replace(coalesce(p_query, ''), '[^0-9]', '', 'g'), 10);
begin
  if auth.uid() is null
     or not (public.has_staff_permission('view_members') or public.has_staff_permission('manage_members')) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  -- A number needs at least 7 digits; anything else needs at least 3 characters.
  if char_length(q) < 3 or char_length(q) > 100 or (looks_like_number and char_length(digits) < 7) then
    return;
  end if;

  return query
  select x.full_name, x.phone_number, x.sector, x.campus, x.paid, x.paid_at
  from (
    -- One row per phone number: students who retried have a second, unpaid application. Show the paid one.
    select distinct on (coalesce(nullif(right(regexp_replace(coalesce(ma.phone_number, ''), '[^0-9]', '', 'g'), 10), ''), ma.id::text))
           ma.full_name, ma.phone_number, ma.sector, ma.campus,
           (ma.payment_status = 'paid') as paid,
           ma.payment_verified_at as paid_at
    from public.member_applications ma
    where (looks_like_number
             and right(regexp_replace(coalesce(ma.phone_number, ''), '[^0-9]', '', 'g'), char_length(tail10)) = tail10)
       or (not looks_like_number and (
              lower(ma.email) = lower(q)
           or lower(coalesce(ma.matric_number, '')) = lower(q)
           or ma.full_name ilike '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%'))
    order by coalesce(nullif(right(regexp_replace(coalesce(ma.phone_number, ''), '[^0-9]', '', 'g'), 10), ''), ma.id::text),
             (ma.payment_status = 'paid') desc, ma.payment_verified_at desc nulls last, ma.created_at desc
  ) x
  order by x.paid desc, x.paid_at desc nulls last, x.full_name
  limit 20;
end;
$$;

revoke all on function public.member_check(text) from public, anon;
grant execute on function public.member_check(text) to authenticated;
