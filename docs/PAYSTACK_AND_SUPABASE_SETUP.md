# BIC — Paystack Live Payments & Supabase RLS Setup Guide

A step-by-step runbook for taking the Babcock Investors Club site from
"forms store applications, payments disabled" to "live payments verified
server-side". Every step is idempotent or explicitly one-time; nothing here
modifies application code.

> **Who this is for:** whoever holds the Paystack and Supabase dashboards.
> **Time needed:** ~45–60 minutes, most of it dashboard clicking.
> **Order matters for Steps 1–4.** Everything after can be done independently.

---

## Where things live in this repo

| What | Path |
|---|---|
| Full database schema (tables, triggers, RLS, storage) | `supabase/migrations (see supabase/SETUP.md)` |
| Schema v3 review draft (adds `articles.author`, `rsvps.event_id`, indexes) | `supabase/migrations (see supabase/SETUP.md)` |
| Paystack webhook schema (`payment_status`, `payments` ledger, race-closer) | `supabase/migrations (see supabase/SETUP.md)` |
| Webhook Edge Function (HMAC verify → Paystack Verify → DB write) | `supabase/functions/paystack-webhook/index.ts` |
| Webhook runbook (testing + troubleshooting) | `supabase/PAYSTACK_WEBHOOK.md` |
| Admin promotion SQL | `supabase/migrations (see supabase/SETUP.md)` |
| Frontend payment hook (loads `inline.js`, opens checkout) | `src/hooks/usePaystack.js` |
| Runtime key validation (`paystackConfigured`) | `src/lib/config.js` |
| Pages that take payments | `src/pages/Membership.jsx`, `src/pages/Events.jsx` |
| Local env template | `.env.example` |

**How the frontend decides payments are available:** `src/lib/config.js` sets
`paystackConfigured = true` only when `VITE_PAYSTACK_PUBLIC_KEY` starts with
`pk_`, is longer than 20 chars, and contains no `xxx`. With no key, the
membership form still submits the application (`payment_status: 'pending'`)
and payment CTAs are hidden/gated — so adding the key is the *only* code
change needed to turn payments on.

**How payments get verified:** the browser checkout is never trusted. The
`paystack-webhook` Edge Function checks the `x-paystack-signature` HMAC-SHA512
header, re-verifies with Paystack's Verify API, then writes the `payments`
ledger row (service role) and flips `member_applications.payment_status` to
`'paid'`.

---

## Part 1 — Supabase: schema & RLS verification

### Step 1 — Confirm you are in the right project

1. Go to <https://supabase.com/dashboard> and open the BIC project.
2. Note the **Project ref** (the `<ref>` in `https://<ref>.supabase.co`) from
   **Project Settings → General**. You will reuse it in Parts 2 and 3.

### Step 2 — Apply the base schema

1. Dashboard → **SQL Editor → New query**.
2. Open `supabase/migrations (see supabase/SETUP.md)` from this repo, copy the entire file, paste, **Run**.
3. Expected result: *"Success. No rows returned"* — it is idempotent, so re-running
   is safe.

> `supabase/migrations` is a v3 draft that additionally adds `articles.author`
> (the Admin console's article form inserts it), an optional `rsvps.event_id`,
> and performance indexes. If the Admin console article publishing errors with
> *"column author does not exist"*, run `supabase/migrations` instead — it
> preserves everything in v2 and is also idempotent.

### Step 3 — Apply the payments/webhook schema

1. SQL Editor → paste the full contents of `supabase/migrations (see supabase/SETUP.md)` → **Run**.
   (This is the documented prerequisite of the webhook function; it needs
   `member_applications` from Step 2.)
2. This adds:
   - `member_applications.payment_status` (`'pending' | 'paid'`, default `pending`)
     and `payment_verified_at`
   - `public.payments` ledger: `paystack_ref` (unique = idempotency key),
     `payment_type` (`membership | ticket`), `amount_kobo`, `event_id`/`event_name`
     (tickets), `raw` (full Paystack payload), `verified_at`
   - Trigger `apply_membership_payment_status()` — if an application row lands
     *after* the webhook already verified its `paystack_ref`, it is marked paid
     on insert. Either arrival order converges.

### Step 4 — Verify the RLS setup (run these in the SQL Editor)

**a) RLS is enabled on every table** — this must return one row per table,
all `rls_enabled = true`:

```sql
select tablename, rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
order by tablename;
-- expect: articles, contact_messages, events, member_applications,
-- newsletter_posts, payments, profiles, resources, rsvps,
-- sponsorship_inquiries, subscribers  → 11 tables, all true
```

**b) The policy inventory matches the intent:**

```sql
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Expected:

| Table | Policies | Meaning |
|---|---|---|
| `profiles` | select own (or admin), update own | users see/edit only their row; admins read all |
| `events`, `articles`, `resources`, `newsletter_posts` | public read, admin all | public content; admins manage |
| `member_applications`, `contact_messages`, `sponsorship_inquiries`, `subscribers` | anon insert, admin read | public forms can insert, only admins can read |
| `rsvps` | anon insert, member select own (by JWT email match) | guests RSVP; members see their own |
| `payments` | admin read only | written by the webhook's service role; never client-writable |

**c) Write access is insert-only for the public** — this must return **zero rows**:

```sql
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and privilege_type in ('UPDATE', 'DELETE');
```

**d) Simulate the anonymous visitor (the real proof):**

```sql
-- As anon: these must all FAIL with "new row violates row-level security"
-- or "permission denied":
set local role anon;
insert into public.member_applications (full_name, email) values ('x','x@x');  -- ok only via API; in SQL editor use the next block instead
```

Because raw SQL runs as `postgres` (which bypasses RLS), test through the API
instead — with the **anon** key from **Project Settings → API**:

```bash
ANON_KEY="eyJ..."   # Project Settings → API → project API keys → anon
URL="https://YOUR_PROJECT_REF.supabase.co"

# INSERT as anon → expect 201
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$URL/rest/v1/rsvps" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"RLS Test","email":"rls-test@example.com","event_name":"policy-check"}'

# SELECT as anon → expect 200 with [] (empty, not the rows)
curl -s "$URL/rest/v1/rsvps?select=*" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
```

Cleanup afterwards: `delete from public.rsvps where email = 'rls-test@example.com';`
(run as the dashboard owner, which bypasses RLS).

**e) Storage buckets exist and are public-read / admin-write** — from Step 2:
`bic-images` and `bic-resources` buckets with
`public read` (select, all users) and `admin upload/delete` policies.

### Step 5 — Verify the triggers exist

```sql
select tgname, tgrelid::regclass as on_table
from pg_trigger
where not tgisinternal
order by 2, 1;
-- expect: on_auth_user_created (auth.users),
--         trg_member_app_payment_status (member_applications)
```

### Step 6 — Authentication & admins

1. **Authentication → Providers**: enable **Email** (the Member portal uses
   email + password) and optionally **Google** OAuth (the login page has a
   Google button — add your redirect URL in the Google Cloud console if you
   enable it).
2. **Authentication → URL Configuration**: set **Site URL** to
   `https://www.babcockinvestorsclub.com` and add
   `https://www.babcockinvestorsclub.com/**` (see supabase/SETUP.md for the full list) to **Redirect URLs**.
3. Each executive signs up at `/member` (or is created under
   **Authentication → Users**), then gets promoted:
   - Open `supabase/migrations (see supabase/SETUP.md)`, replace the placeholder emails with
     real ones, run it in the SQL Editor.
   - `role='admin'` drives `public.is_admin()`, which every admin policy above
     depends on — no promoted admin, no admin console access.
4. Sanity-check:

```sql
select email, role, sector from public.profiles where role = 'admin';
```

---

## Part 2 — Paystack: keys, webhook, go-live

### Step 7 — Get the public key into Vercel

1. **Paystack Dashboard → Settings → API Keys & Webhooks** (test keys live
   under *Developer settings* if you don't see them).
2. Copy the **public key**: `pk_test_…` now, `pk_live_…` at go-live.
3. **Vercel → your BIC project → Settings → Environment Variables** and add
   (for **Production**, **Preview**, and **Development**):

   | Name | Value |
   |---|---|
   | `VITE_PAYSTACK_PUBLIC_KEY` | `pk_test_…` (start with test) |
   | `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | the anon (publishable) key — safe for browsers |

4. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) — env vars only apply to
   new builds.
5. Confirm the flag flipped: open the site, view source / devtools and check
   that the membership form now shows payment CTAs (see `src/lib/config.js` —
   `paystackConfigured` requires the key to start with `pk_`).

> The **secret key** (`sk_…`) never goes into Vercel or the client bundle —
> it lives only in Supabase Edge Function secrets (Step 9).

### Step 8 — Check how each payment page uses the key

No changes needed — this is what already ships:

- **Membership (₦5,000):** form submit → if `paystackConfigured`, checkout
  opens with `metadata.payment_type: 'membership'`; the application row is
  written with the `paystack_ref`. If Paystack isn't configured, the
  application still saves with `payment_status: 'pending'` and the team
  follows up manually (the flag from Step 7 re-enables checkout with zero code
  changes).
- **Event tickets (₦2,000):** checkout tagged `payment_type: 'ticket'` with
  `event_id`/`event_name` in metadata (`src/pages/Events.jsx`).
- **Reference format:** `BIC_<timestamp>_<random>` (generated in
  `src/hooks/usePaystack.js`) — the webhook matches membership payments back
  to applications by this reference.

### Step 9 — Deploy the verification webhook

The browser callback alone is *not* proof of payment. The webhook is:

```bash
npm i -g supabase        # or: npx supabase (skip the global install)
supabase login
supabase link --project-ref YOUR_PROJECT_REF

supabase functions deploy paystack-webhook --no-verify-jwt

supabase secrets set \
  PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

- `--no-verify-jwt` is correct here: Paystack sends no Supabase JWT; the
  webhook authenticates via its own HMAC signature check.
- The **service_role** key bypasses RLS — that is by design and safe *only*
  because it stays server-side in Supabase secrets.
- Webhook schema prerequisite: `supabase/migrations` (Step 3) must be applied
  **before** the function runs, or the upsert into `payments` 500s.

### Step 10 — Point Paystack at the function

1. Paystack Dashboard → **Settings → API Keys & Webhooks → Webhook URL**:

   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-webhook
   ```

2. Enable the **`charge.success`** event.
3. Paystack's test webhook button sends a signed payload — a `200` in
   **Supabase → Edge Functions → paystack-webhook → Logs** confirms the
   signature path works.

### Step 11 — Test the full loop (test mode)

1. On the deployed site, fill the membership form and pay with Paystack's test
   card: **4084 0840 8408 4081**, any future expiry, any CVV, any OTP.
2. Verify in the SQL Editor:

```sql
-- one row, status 'paid':
select paystack_ref, payment_type, email, amount_kobo, verified_at
from public.payments order by created_at desc limit 5;   -- 500000 = ₦5,000

-- the matching application flipped to paid (either order of webhook vs form):
select email, paystack_ref, payment_status, payment_verified_at
from public.member_applications order by created_at desc limit 5;
```

3. Also buy a test ticket on `/events` and confirm the `payments` row has
   `payment_type = 'ticket'` with the right `event_name`.
4. If the webhook failed, `supabase functions logs paystack-webhook` and the
   troubleshooting table in `supabase/PAYSTACK_WEBHOOK.md` cover the usual
   suspects (401 = wrong secret; 404 = function not deployed/wrong ref;
   recorded payment but pending application = reference mismatch).

### Step 12 — Go live checklist

1. Paystack: complete business activation if you haven't, then switch to the
   **live** keys.
2. Supabase secrets: re-run `supabase secrets set` with `sk_live_…`.
3. Vercel: change `VITE_PAYSTACK_PUBLIC_KEY` to `pk_live_…`, redeploy.
4. Paystack webhook URL stays the same — **test-mode webhooks only fire for
   test transactions**; do not delete it.
5. Make one small **live** payment, confirm the `payments` row and
   `payment_status = 'paid'`, then refund it from the Paystack dashboard.
6. Optional (recommended): enable **Payments → Settings → "Notify customers of
   payments"** and check bank settlement timing for the club's account.

---

## Part 3 — Env vars reference (all of them, one place)

| Variable | Where | Value | Public? |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Vercel + `.env.local` | `https://<ref>.supabase.co` | yes (it's the project URL) |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` | anon key from Project Settings → API | yes (RLS is the boundary) |
| `VITE_PAYSTACK_PUBLIC_KEY` | Vercel + `.env.local` | `pk_test_…` → `pk_live_…` | yes (public keys are public) |
| `PAYSTACK_SECRET_KEY` | Supabase secrets **only** | `sk_…` | **no — never client-side** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets **only** | service_role key | **no — bypasses RLS** |

Local development: copy `.env.example` to `.env.local`, fill the three
`VITE_` vars, `npm run dev`.

---

## Final verification checklist

- [ ] `pg_tables` query returns 11 public tables, all `rls_enabled`
- [ ] `payments` table exists with the `paystack_ref` unique constraint
- [ ] Anon-key INSERT to `rsvps` returns 201; SELECT returns `[]`
- [ ] Anon UPDATE/DELETE grant query returns zero rows
- [ ] Both triggers listed (`on_auth_user_created`, `trg_member_app_payment_status`)
- [ ] Admins promoted and visible in the Admin console
- [ ] `pk_…` key set in Vercel, site redeployed, checkout CTA visible
- [ ] Webhook function deployed with secrets; Paystack test webhook → `200`
- [ ] Test-mode payment: `payments` row + `payment_status = 'paid'`
- [ ] Switched to live keys, made and refunded one live payment

---

## Threat model notes (why the flow looks like this)

- **Never trust the browser callback.** The client's `onSuccess` fires before
  money is confirmed; only the signed webhook + Verify API call is truth. That
  is why `payment_status` is set exclusively by the webhook and the
  race-closing trigger — the client cannot write it.
- **RLS is the only thing protecting the anon key.** It's shipped in the JS
  bundle by design; the policies above make it insert-only on form tables and
  read-only on public content.
- **Service role = root.** The webhook needs it to write the payments ledger
  regardless of RLS, which is acceptable only because the function is
  reachable solely by HMAC-verified Paystack requests (`--no-verify-jwt`
  removes JWT auth; the signature check *is* the auth).
- **Idempotency everywhere.** Paystack retries failed deliveries; the
  `paystack_ref` unique constraint and the trigger make replays harmless.
