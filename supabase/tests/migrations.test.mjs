// Runs the BIC Supabase migrations in PGlite (real Postgres, WASM) against
// minimal stubs of Supabase's auth/storage/net, twice (idempotency), then
// checks behaviour as anon, member and admin.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const db = new PGlite();

const STUBS = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}', email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated;
grant execute on all functions in schema auth to anon, authenticated;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
create schema extensions;
create table public._http_log (url text, body jsonb);
create schema net;
create function net.http_post(url text, body jsonb default '{}', params jsonb default '{}',
  headers jsonb default '{}', timeout_milliseconds int default 5000) returns bigint
  language plpgsql security definer as $$ begin insert into public._http_log values (url, body); return 1; end $$;
`;

const prep = (sql) => sql.replace(/create extension if not exists pgcrypto with schema extensions;/g, '-- (pgcrypto built in)').replace(/create extension if not exists pg_net with schema extensions;/g, '-- (pg_net stubbed in test)');

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log('  PASS', name); } else { fail++; console.log('  FAIL', name, detail); }
};

async function as(role, uid, email, sql) {
  await db.exec(`set role ${role}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claims', $2, false)`,
    [uid || '', JSON.stringify(email ? { email } : {})]);
  try { return { rows: (await db.query(sql)).rows }; }
  catch (e) { return { error: e.message }; }
  finally { await db.exec('reset role'); await db.query(`select set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claims', '', false)`); }
}

await db.exec(STUBS);
for (const old of (process.env.PRE || '').split(',').filter(Boolean)) {
  try { await db.exec(fs.readFileSync(old, 'utf8')); console.log('old schema applied:', path.basename(old)); }
  catch (e) { console.log('OLD SCHEMA ERROR', old, e.message); process.exit(1); }
}
for (const round of [1, 2]) {
  for (const f of files) {
    try { await db.exec(prep(fs.readFileSync(path.join(dir, f), 'utf8'))); }
    catch (e) { console.log(`MIGRATION ERROR round ${round} ${f}: ${e.message}`); process.exit(1); }
  }
  console.log(`migrations applied, round ${round}`);
}

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
const U3 = '33333333-3333-3333-3333-333333333333';
await db.exec(`insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('${U1}', 'member@babcock.edu.ng', '{"full_name":"Test Member"}', now()),
  ('${U2}', 'admin@babcock.edu.ng', '{}', now()),
  ('${U3}', 'victim@babcock.edu.ng', '{}', null)`);
await db.exec(`update public.profiles set role = 'admin' where id = '${U2}'`); // as SQL editor would
ok('signup trigger creates profiles', (await db.query('select count(*)::int n from public.profiles')).rows[0].n === 3);

// Visitors
let r = await as('anon', null, null, `insert into public.contact_messages (first_name, email, message) values ('A', 'a@b.co', 'hi')`);
ok('anon can send a contact message', !r.error, r.error);
r = await as('anon', null, null, `select * from public.contact_messages`);
ok('anon cannot read contact messages', !!r.error, JSON.stringify(r.rows));
r = await as('anon', null, null, `insert into public.contact_messages (email, message) values ('not-an-email', 'x')`);
ok('bad email rejected', !!r.error);
r = await as('anon', null, null, `insert into public.contact_messages (email, message) values ('a@b.co', repeat('x', 6000))`);
ok('oversized message rejected', !!r.error);
r = await as('anon', null, null, `insert into public.events (title) values ('fake')`);
ok('anon cannot create events', !!r.error);
r = await as('anon', null, null, `insert into public.subscribers (email) values ('s@b.co')`);
ok('anon can subscribe', !r.error, r.error);

// Payments cannot be self-declared
r = await as('anon', null, null, `insert into public.member_applications (full_name, email, payment_status, paystack_ref) values ('Cheat', 'cheat@b.co', 'paid', 'FAKE')`);
ok('application insert works', !r.error, r.error);
ok('self-declared "paid" is forced to pending',
  (await db.query(`select payment_status from public.member_applications where email = 'cheat@b.co'`)).rows[0]?.payment_status === 'pending');
await db.exec(`insert into public.payments (paystack_ref, payment_type, status, amount_kobo, email) values ('REAL1', 'membership', 'paid', 250000, 'Payer@b.co')`);
await as('anon', null, null, `insert into public.member_applications (full_name, email, paystack_ref) values ('Payer', 'payer@b.co', 'REAL1')`);
ok('verified payment marks application paid',
  (await db.query(`select payment_status from public.member_applications where email = 'payer@b.co'`)).rows[0]?.payment_status === 'paid');
r = await as('anon', null, null, `insert into public.member_applications (full_name, email, paystack_ref) values ('Freeloader', 'other@b.co', 'REAL1')`);
ok('a payment reference cannot back a second application', !!r.error, r.error);
await db.exec(`insert into public.payments (paystack_ref, payment_type, status, amount_kobo, email) values ('REAL2', 'membership', 'paid', 250000, 'someone@b.co')`);
await as('anon', null, null, `insert into public.member_applications (full_name, email, paystack_ref) values ('Mismatch', 'different@b.co', 'REAL2')`);
ok('payment by a different email stays pending',
  (await db.query(`select payment_status from public.member_applications where email = 'different@b.co'`)).rows[0]?.payment_status === 'pending');
await as('anon', null, null, `insert into public.contact_messages (email, message, created_at) values ('time@b.co', 'x', '2001-01-01')`);
ok('server sets created_at on submissions',
  (await db.query(`select extract(year from created_at)::int y from public.contact_messages where email = 'time@b.co'`)).rows[0]?.y > 2001);

// Members
r = await as('authenticated', U1, 'member@babcock.edu.ng', `update public.profiles set role = 'admin', bio = 'hi' where id = '${U1}'`);
const p1 = (await db.query(`select role, bio from public.profiles where id = '${U1}'`)).rows[0];
ok('member cannot promote themselves', p1.role === 'member', JSON.stringify(p1));
ok('member can edit own bio', p1.bio === 'hi', r.error);
r = await as('authenticated', U1, 'member@babcock.edu.ng', `select count(*)::int n from public.profiles`);
ok('member sees only own profile', r.rows?.[0]?.n === 1, JSON.stringify(r));
await as('anon', null, null, `insert into public.member_applications (full_name, email) values ('Test Member', 'member@babcock.edu.ng')`);
r = await as('authenticated', U1, 'member@babcock.edu.ng', `select email from public.member_applications`);
ok('member reads only own application', r.rows?.length === 1 && r.rows[0].email === 'member@babcock.edu.ng', JSON.stringify(r));
await as('anon', null, null, `insert into public.member_applications (full_name, email) values ('Victim', 'victim@babcock.edu.ng')`);
r = await as('authenticated', U3, 'victim@babcock.edu.ng', `select count(*)::int n from public.member_applications`);
ok('unconfirmed sign-up cannot read applications for that email', r.rows?.[0]?.n === 0, JSON.stringify(r));
r = await as('authenticated', U1, 'member@babcock.edu.ng', `insert into public.rsvps (name, email, event_name) values ('Test Member', 'member@babcock.edu.ng', 'Welcome')`);
ok('signed-in member can RSVP', !r.error, r.error);
r = await as('authenticated', U1, 'member@babcock.edu.ng', `select * from public.contact_messages`);
ok('member cannot read contact messages', r.error || r.rows.length === 0);

// Admins
r = await as('authenticated', U2, 'admin@babcock.edu.ng', `select count(*)::int n from public.contact_messages`);
ok('admin reads contact messages', r.rows?.[0]?.n >= 1, JSON.stringify(r));
r = await as('authenticated', U2, 'admin@babcock.edu.ng', `insert into public.newsletter_posts (subject, body, status) values ('Draft', 'x', 'draft'), ('Live', 'y', 'published')`);
ok('admin writes newsletter posts', !r.error, r.error);
r = await as('anon', null, null, `select subject from public.newsletter_posts`);
ok('public sees only published posts', r.rows?.length === 1 && r.rows[0].subject === 'Live', JSON.stringify(r));
r = await as('authenticated', U2, 'admin@babcock.edu.ng', `select count(*)::int n from public.rsvps`);
ok('admin reads RSVPs', r.rows?.[0]?.n >= 1, JSON.stringify(r));
r = await as('authenticated', U2, 'admin@babcock.edu.ng', `insert into storage.objects (bucket_id, name) values ('bic-images', 'a.png')`);
ok('admin can upload', !r.error, r.error);
r = await as('authenticated', U1, 'member@babcock.edu.ng', `insert into storage.objects (bucket_id, name) values ('bic-images', 'b.png')`);
ok('member cannot upload', !!r.error);

// Function exposure
const priv = (fn, role) => db.query(`select has_function_privilege('${role}', '${fn}', 'execute') v`).then((x) => x.rows[0].v);
ok('trigger functions not callable by anon', !(await priv('public.handle_new_user()', 'anon')) && !(await priv('public.apply_membership_payment_status()', 'anon')) && !(await priv('public.notify_send_email()', 'anon')) && !(await priv('public.protect_profile_fields()', 'anon')) && !(await priv('public.set_created_at_now()', 'anon')) && !(await priv('public.email_is_confirmed()', 'anon')));
ok('is_admin callable for RLS', await priv('public.is_admin()', 'anon'));
r = await as('anon', null, null, `select * from private.app_config`);
ok('private config not readable by anon', !!r.error);

// Email trigger: silent until configured, fires once configured
ok('no email calls before config', (await db.query('select count(*)::int n from public._http_log')).rows[0].n === 0);
await db.exec(`insert into private.app_config values ('send_email_url', 'https://example.test/fn'), ('webhook_secret', 's')`);
await as('anon', null, null, `insert into public.rsvps (name, email, event_name) values ('X', 'x@b.co', 'Welcome')`);
ok('email call made after config', (await db.query('select count(*)::int n from public._http_log')).rows[0].n === 1);
await as('anon', null, null, `insert into public.rsvps (name, email, event_name) values ('X', 'x@b.co', 'Again')`);
ok('second email to the same address within an hour is skipped', (await db.query('select count(*)::int n from public._http_log')).rows[0].n === 1);

const b = (await db.query(`select id, file_size_limit from storage.buckets order by id`)).rows;
ok('buckets with limits', b.length === 2 && b[0].file_size_limit === 5242880n || b[0].file_size_limit == 5242880, JSON.stringify(b, (k, v) => typeof v === 'bigint' ? Number(v) : v));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
