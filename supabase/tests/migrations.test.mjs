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
create role service_role nologin bypassrls;
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
    try {
      if (f === '20261104000900_kora_initialization_throttle.sql') await db.exec(fs.readFileSync('tests/fixtures/applied-kora-contract.sql', 'utf8'));
      await db.exec(prep(fs.readFileSync(path.join(dir, f), 'utf8')));
    }
    catch (e) { console.log(`MIGRATION ERROR round ${round} ${f}: ${e.message}`); process.exit(1); }
  }
  console.log(`migrations and recovered applied Kora contract loaded, round ${round}`);
}

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
const U3 = '33333333-3333-3333-3333-333333333333';
const U4 = '44444444-4444-4444-4444-444444444444';
await db.exec(`insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('${U1}', 'member@babcock.edu.ng', '{"full_name":"Test Member"}', now()),
  ('${U2}', 'admin@babcock.edu.ng', '{}', now()),
  ('${U3}', 'victim@babcock.edu.ng', '{}', null),
  ('${U4}', 'inofep5668@student.babcock.edu.ng', '{"full_name":"Inofe Peace Otsebholu"}', now())`);
await db.exec(`update public.profiles set role = 'admin' where id = '${U2}'`); // as SQL editor would
ok('signup trigger creates profiles', (await db.query('select count(*)::int n from public.profiles')).rows[0].n === 4);
ok('approved executive email binds on signup',
  (await db.query(`select user_id from public.executive_access where email = 'inofep5668@student.babcock.edu.ng'`)).rows[0]?.user_id === U4);

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

// Scoped executive access and paid sector content
r = await as('authenticated', U4, 'inofep5668@student.babcock.edu.ng',
  `insert into public.resources (title, file_url, sector, visibility) values ('Securities guide', 'resources/sec.pdf', 'Securities', 'sector')`);
ok('sector admin can create content in own sector', !r.error, r.error);
r = await as('authenticated', U4, 'inofep5668@student.babcock.edu.ng',
  `insert into public.resources (title, file_url, sector, visibility) values ('Forex guide', 'resources/fx.pdf', 'Forex', 'sector')`);
ok('sector admin cannot create content in another sector', !!r.error, r.error);
r = await as('authenticated', U4, 'inofep5668@student.babcock.edu.ng', `select * from public.contact_messages`);
ok('sector admin cannot read unrelated contact messages', r.error || r.rows.length === 0);
r = await as('authenticated', U1, 'member@babcock.edu.ng', `select title from public.resources`);
ok('unpaid member cannot read protected resources', r.rows?.length === 0, JSON.stringify(r));

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

// Offline payments (0700): only admins record them; members then see "paid"
const appId = (await db.query(`select id from public.member_applications where email = 'member@babcock.edu.ng' limit 1`)).rows[0].id;
await db.exec(`update public.member_applications set sector = 'Securities', campus = 'Ilishan' where id = ${appId}`);
const setPay = (st, m, note = '') => `select payment_status from public.admin_set_membership_payment(${appId}, '${st}', ${m ? `'${m}'` : 'null'}, '${note}')`;
r = await as('anon', null, null, setPay('paid', 'cash'));
ok('anon cannot record a payment', !!r.error);
r = await as('authenticated', U1, 'member@babcock.edu.ng', setPay('paid', 'cash'));
ok('member cannot mark themselves paid', !!r.error && /admins/.test(r.error), r.error);
r = await as('authenticated', U2, 'admin@babcock.edu.ng', setPay('paid', 'bitcoin'));
ok('unknown payment method rejected', !!r.error);
r = await as('authenticated', U2, 'admin@babcock.edu.ng', setPay('paid', null));
ok('paid needs a method', !!r.error);
r = await as('authenticated', U2, 'admin@babcock.edu.ng', setPay('paid', 'cash', 'Paid at the welcome desk'));
ok('admin records a cash payment', !r.error && r.rows[0].payment_status === 'paid', r.error);
r = await as('authenticated', U1, 'member@babcock.edu.ng', `select title from public.resources`);
ok('paid member reads resources for their sector', r.rows?.length === 1 && r.rows[0].title === 'Securities guide', JSON.stringify(r));
r = await as('authenticated', U1, 'member@babcock.edu.ng', `update public.profiles set sector = 'Forex' where id = '${U1}'`);
ok('paid member cannot self-switch sector',
  (await db.query(`select sector from public.profiles where id = '${U1}'`)).rows[0]?.sector === 'Securities');
r = await as('authenticated', U1, 'member@babcock.edu.ng', `select payment_status, payment_method, payment_recorded_by from public.member_applications`);
ok('member sees their payment', r.rows?.[0]?.payment_status === 'paid' && r.rows[0].payment_method === 'cash' && r.rows[0].payment_recorded_by === U2, JSON.stringify(r));
r = await as('authenticated', U2, 'admin@babcock.edu.ng', setPay('pending', 'cash'));
ok('admin can undo a payment', !r.error && r.rows[0].payment_status === 'pending', r.error);
ok('undo clears method and time', (await db.query(`select payment_method, payment_verified_at from public.member_applications where id = ${appId}`)).rows[0].payment_method === null);
r = await as('authenticated', U2, 'admin@babcock.edu.ng', `select * from public.admin_set_membership_payment(999999, 'paid', 'cash', '')`);
ok('missing application reported', !!r.error && /not found/.test(r.error), r.error);
ok('payment RPC not callable by anon', !(await priv('public.admin_set_membership_payment(bigint, text, text, text)', 'anon')));

const b = (await db.query(`select id, file_size_limit from storage.buckets order by id`)).rows;
ok('buckets with limits', b.length === 2 && b[0].file_size_limit === 5242880n || b[0].file_size_limit == 5242880, JSON.stringify(b, (k, v) => typeof v === 'bigint' ? Number(v) : v));


// Snapshot of already-applied Kora contract, tested only in local PGlite.
for(const signature of ['create_kora_intent(text,jsonb)','get_kora_intent(text)','finalize_kora_payment(text,bigint,text)']){
 ok('Kora RPC denied to browsers '+signature,!(await priv('public.'+signature,'anon'))&&!(await priv('public.'+signature,'authenticated')));
 ok('Kora RPC service-only '+signature,await priv('public.'+signature,'service_role'));
}
r=await as('anon',null,null,'select * from public.kora_checkout_intents');ok('anon cannot read Kora intents',!!r.error);
const kref='BIC-KORA-11111111-1111-4111-8111-111111111111';
const kapp={full_name:'Mock Kora Member',email:'kora@babcock.edu.ng',sector:'Securities',campus:'Ilishan',interests:[]};
await db.query('select public.create_kora_intent($1,$2)',[kref,JSON.stringify(kapp)]);
const ki=(await db.query('select public.get_kora_intent($1) i',[kref])).rows[0].i;
ok('recovered contract sets fixed server price',ki.amount_kobo===250000&&ki.currency==='NGN'&&ki.status==='pending');
let rejected=false;try{await db.query('select public.finalize_kora_payment($1,$2,$3)',[kref,1,'NGN']);}catch{rejected=true;}ok('Kora amount mismatch rejected',rejected);
rejected=false;try{await db.query('select public.finalize_kora_payment($1,$2,$3)',[kref,250000,'USD']);}catch{rejected=true;}ok('Kora currency mismatch rejected',rejected);
await db.query('select public.finalize_kora_payment($1,$2,$3)',[kref,250000,'NGN']);
await db.query('select public.finalize_kora_payment($1,$2,$3)',[kref,250000,'NGN']);
ok('duplicate Kora confirmation writes one ledger row',Number((await db.query('select count(*) n from public.payments where paystack_ref=$1',[kref])).rows[0].n)===1);
const ka=(await db.query('select payment_status,payment_method from public.member_applications where paystack_ref=$1',[kref])).rows[0];
ok('Kora membership confirmation applied',ka.payment_status==='paid'&&ka.payment_method==='kora');
ok('Kora intent paid',(await db.query('select public.get_kora_intent($1) i',[kref])).rows[0].i.status==='paid');

// Any well-formed email may apply (migration 20261104001000); malformed ones are still refused by the database.
for(const email of ['someone@gmail.com','awodeyia4449@student.babcock.edu.ng']){
 await db.query('select public.create_kora_intent($1,$2)',['BIC-KORA-'+crypto.randomUUID(),JSON.stringify({full_name:'Any Email',email,sector:'Crypto',campus:'Ilishan',interests:[]})]);
 ok('Kora intent accepts '+email,Number((await db.query('select count(*) n from public.kora_checkout_intents where email=$1',[email])).rows[0].n)===1);
}
for(const email of ['not-an-email','a@gmail','a b@gmail.com']){
 rejected=false;try{await db.query('select public.create_kora_intent($1,$2)',['BIC-KORA-'+crypto.randomUUID(),JSON.stringify({full_name:'Bad',email,interests:[]})]);}catch{rejected=true;}
 ok('Kora intent refuses malformed email '+JSON.stringify(email),rejected);
}

// Member check (migration 20261105000100): a narrow lookup for club-wide executives.
const MC = { chair: '55555555-5555-5555-5555-555555555555', manager: '66666666-6666-6666-6666-666666666666', sector: '77777777-7777-7777-7777-777777777777', events: '88888888-8888-8888-8888-888888888888' };
await db.exec(`insert into public.executive_access (email, full_name, permissions, sector, campus) values
  ('chair.one@test.example', 'Chair One', array['view_members'], null, null),
  ('chair.two@test.example', 'Chair Two', array['manage_members'], null, null),
  ('chair.sector@test.example', 'Sector Chair', array['view_members'], 'Securities', null),
  ('chair.events@test.example', 'Events Chair', array['manage_events'], null, null)
  on conflict (email) do nothing`);
await db.exec(`insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('${MC.chair}', 'chair.one@test.example', '{}', now()),
  ('${MC.manager}', 'chair.two@test.example', '{}', now()),
  ('${MC.sector}', 'chair.sector@test.example', '{}', now()),
  ('${MC.events}', 'chair.events@test.example', '{}', now())`);
// The payment trigger refuses rows inserted as paid (nobody can fake a payment), so seed with user triggers off.
await db.exec('alter table public.member_applications disable trigger user');
await db.exec(`insert into public.member_applications (full_name, phone_number, email, matric_number, sector, campus, payment_status, payment_verified_at, created_at) values
  ('Ada Paid', '+234 813 825 7616', 'ada.paid@gmail.com', '21/0001', 'Crypto', 'Ilishan', 'paid', now(), now() - interval '2 hours'),
  ('Ada Retry', '08138257616', 'ada.paid@gmail.com', '21/0001', 'Crypto', 'Ilishan', 'pending', null, now() - interval '3 hours'),
  ('Bola Unpaid', '0803 111 2222', 'bola@gmail.com', '22/0002', 'Forex', 'Iperu', 'pending', null, now() - interval '1 hour'),
  ('Chi_Wild 50%', '0901 000 0001', 'chi@yahoo.com', '22/9999', 'Securities', 'Ilishan', 'paid', now(), now() - interval '1 hour'),
  ('Chidinma Other', '0902 000 0002', 'chidinma@gmail.com', '22/9998', 'General', 'Ilishan', 'pending', null, now() - interval '1 hour')`);
await db.exec(`insert into public.member_applications (full_name, phone_number, email, payment_status, payment_verified_at)
  select 'Many Person ' || n, '0705' || lpad(n::text, 7, '0'), 'many' || n || '@gmail.com', 'paid', now() from generate_series(1, 25) n`);
await db.exec('alter table public.member_applications enable trigger user');
const mc = (uid, email, q) => as('authenticated', uid, email, `select * from public.member_check(${q === null ? 'null' : "'" + q.replace(/'/g, "''") + "'"})`);
const chair = (q) => mc(MC.chair, 'chair.one@test.example', q);

let m = await chair('8138257616');
ok('member check finds a paid member by number, one row despite a retry application', m.rows?.length === 1 && m.rows[0].full_name === 'Ada Paid' && m.rows[0].paid === true, JSON.stringify(m));
for (const typed of ['+2348138257616', '+234 813 825 7616', '0813 825 7616', '(0813) 825-7616', '234 813 825 7616', '8257616']) {
  m = await chair(typed);
  ok('member check matches however the number is typed: ' + typed, m.rows?.length === 1 && m.rows[0].full_name === 'Ada Paid', JSON.stringify(m));
}
m = await chair('0803 111 2222');
ok('member check shows an unpaid applicant as not paid', m.rows?.length === 1 && m.rows[0].full_name === 'Bola Unpaid' && m.rows[0].paid === false, JSON.stringify(m));
m = await chair('08000000000');
ok('member check returns nothing for an unknown number', m.rows?.length === 0, JSON.stringify(m));
m = await chair('ada');
ok('member check searches names, merging a retry into the paid row', m.rows?.length === 1 && m.rows[0].paid === true, JSON.stringify(m));
m = await chair('bola@gmail.com');
ok('member check finds by exact email', m.rows?.length === 1 && m.rows[0].full_name === 'Bola Unpaid', JSON.stringify(m));
m = await chair('bola@gmail');
ok('member check does not match part of an email', m.rows?.length === 0, JSON.stringify(m));
m = await chair('22/9999');
ok('member check finds by exact matric number', m.rows?.length === 1 && m.rows[0].full_name === 'Chi_Wild 50%', JSON.stringify(m));
m = await chair('%%%');
ok('member check treats percent signs literally', m.rows?.length === 0, JSON.stringify(m));
m = await chair('chi_');
ok('member check treats underscores literally', m.rows?.length === 1 && m.rows[0].full_name === 'Chi_Wild 50%', JSON.stringify(m));
for (const short of ['ab', '12345', ' ', '+234 8', '']) {
  m = await chair(short);
  ok('member check refuses short queries: ' + JSON.stringify(short), m.rows?.length === 0, JSON.stringify(m));
}
m = await chair(null);
ok('member check handles a null query', m.rows?.length === 0, JSON.stringify(m));
m = await chair('Many Person');
ok('member check caps results at 20', m.rows?.length === 20, JSON.stringify(m.rows?.length ?? m));
m = await chair('8138257616');
ok('member check returns only name, number, sector, campus and paid status', JSON.stringify(Object.keys(m.rows[0])) === JSON.stringify(['full_name', 'phone_number', 'sector', 'campus', 'paid', 'paid_at']), JSON.stringify(Object.keys(m.rows[0] ?? {})));
m = await mc(MC.manager, 'chair.two@test.example', '8138257616');
ok('manage_members executives can use the member check', m.rows?.length === 1, JSON.stringify(m));
m = await as('authenticated', U2, 'admin@babcock.edu.ng', `select * from public.member_check('8138257616')`);
ok('admins can use the member check', m.rows?.length === 1, JSON.stringify(m));
for (const [who, uid, email] of [['a sector-limited executive', MC.sector, 'chair.sector@test.example'], ['an executive without member permissions', MC.events, 'chair.events@test.example'], ['a plain member', U1, 'member@babcock.edu.ng']]) {
  m = await mc(uid, email, '8138257616');
  ok('member check is denied to ' + who, !!m.error && /not allowed/i.test(m.error), JSON.stringify(m));
}
m = await as('anon', null, null, `select * from public.member_check('8138257616')`);
ok('member check is denied to anon', !!m.error, JSON.stringify(m));
ok('member check is not executable by anon, executable by signed-in users', !(await priv('public.member_check(text)', 'anon')) && (await priv('public.member_check(text)', 'authenticated')));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
