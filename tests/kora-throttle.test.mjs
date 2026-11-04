// Isolated local PGlite only; no connection strings or live SQL runner.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
const migration=fs.readFileSync('supabase/migrations/20261104000900_kora_initialization_throttle.sql','utf8');
async function fixture(){
 const db=new PGlite();
 await db.exec(`
 create role anon; create role authenticated; create role service_role;
 create table public.member_applications(id bigserial primary key,full_name text,matric_number text,phone_number text,department text,level text,email text,knowledge_level text,interests text[],sector text,campus text,committee text,paystack_ref text unique,payment_status text default 'pending',payment_method text,payment_verified_at timestamptz);
 create table public.payments(paystack_ref text primary key,payment_type text,email text,amount_kobo bigint,status text,verified_at timestamptz,raw jsonb);
 `);
 await db.exec(fs.readFileSync('tests/fixtures/applied-kora-contract.sql','utf8'));
 const create=async(email='member@babcock.edu.ng')=>{const reference='BIC-KORA-'+randomUUID();await db.query('select public.create_kora_intent($1,$2)',[reference,JSON.stringify({full_name:'Local Test',email,interests:[]})]);return reference;};
 return {db,create,apply:()=>db.exec(migration),count:async(table)=>(await db.query('select count(*)::int n from public.'+table)).rows[0].n};
}
test('additive migration preserves existing pending/paid rows, functions, and service-only ACL on repeat',async()=>{
 const f=await fixture();try{
  const paid=await f.create('paid@babcock.edu.ng');await f.db.query("select public.finalize_kora_payment($1,250000,'NGN')",[paid]);await f.create('pending@babcock.edu.ng');
  const snapshot=async()=>JSON.stringify((await f.db.query('select row_to_json(t) r from public.kora_checkout_intents t order by reference')).rows)+JSON.stringify((await f.db.query('select row_to_json(t) r from public.member_applications t order by id')).rows)+JSON.stringify((await f.db.query('select row_to_json(t) r from public.payments t')).rows);
  const functions=async()=>(await f.db.query("select oid::text,prosrc,proacl::text from pg_proc where proname in ('get_kora_intent','finalize_kora_payment') order by proname")).rows;
  const before=await snapshot(),defs=await functions();await f.apply();await f.apply();assert.equal(await snapshot(),before);assert.deepEqual(await functions(),defs);
  for(const role of ['anon','authenticated','service_role']){const permission=(await f.db.query("select has_function_privilege($1,'public.create_kora_intent(text,jsonb)','execute') p",[role])).rows[0].p;assert.equal(permission,role==='service_role');}
 }finally{await f.db.close();}
});
test('3 normalized-email intents/hour; fourth is atomic rejection including paid intents',async()=>{
 const f=await fixture();try{await f.apply();const a=await f.create(' Member@babcock.edu.ng ');await f.db.query("select public.finalize_kora_payment($1,250000,'NGN')",[a]);await f.create('member@babcock.edu.ng');await f.create('MEMBER@BABCOCK.EDU.NG');
 await assert.rejects(f.create(' member@babcock.edu.ng '),/email limit/);assert.equal(await f.count('member_applications'),3);assert.equal(await f.count('kora_checkout_intents'),3);
 assert.equal((await f.db.query('select distinct email from public.kora_checkout_intents')).rows[0].email,'member@babcock.edu.ng');
 // Local-only aging simulates the rolling hour. Production migration never does this.
 await f.db.exec("update public.kora_checkout_intents set created_at=clock_timestamp()-interval '61 minutes'");await f.create();assert.equal(await f.count('kora_checkout_intents'),4);
 }finally{await f.db.close();}
});
test('30 global intents/minute across different emails; rejection inserts no application; window expires',async()=>{
 const f=await fixture();try{await f.apply();for(let i=0;i<30;i++)await f.create('student'+i+'@babcock.edu.ng');await assert.rejects(f.create('next@babcock.edu.ng'),/global limit/);assert.equal(await f.count('member_applications'),30);assert.equal(await f.count('kora_checkout_intents'),30);
 await f.db.exec("update public.kora_checkout_intents set created_at=clock_timestamp()-interval '61 seconds'");await f.create('next@babcock.edu.ng');assert.equal(await f.count('kora_checkout_intents'),31);
 }finally{await f.db.close();}
});
test('parallel queued calls cannot exceed limit; lock precedes counts; stale snapshot isolation fails closed',async()=>{
 const f=await fixture();try{await f.apply();const outcomes=await Promise.allSettled(Array.from({length:12},()=>f.create()));assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,3);assert.equal(await f.count('member_applications'),3);
 // PGlite serializes queries: queued calls are NOT independent PG sessions.
 assert.ok(migration.indexOf('perform pg_advisory_xact_lock')<migration.indexOf('if (select count(*)'));
 await f.db.exec('begin isolation level repeatable read');await assert.rejects(f.create('other@babcock.edu.ng'),/read committed isolation/);await f.db.exec('rollback');
 }finally{await f.db.close();}
});
