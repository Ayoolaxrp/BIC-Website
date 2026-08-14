# BIC — Transactional Email Setup (Resend + Supabase)

Sends real confirmation emails when members apply and RSVP:

| Trigger | Email sent |
|---|---|
| New row in `member_applications` (after Paystack payment) | "Your BIC Membership Application Was Received" → applicant |
| New row in `rsvps` (RSVP form) | "You're In — \<event name\>" → attendee |

**What this does NOT need:** no changes to the React frontend. Emails fire
server-side from database triggers, so they also work for any future admin
imports — not just form submissions.

Files in this package:

- `functions/send-email/index.ts` — the Edge Function that builds and sends the
  emails through the Resend API.
- `email_triggers.sql` — DB triggers that call the function on insert.
- this runbook.

---

## Step 0 — What you need

- A Supabase project with the schema from `schema.review.sql` applied (tables
  `member_applications` + `rsvps` must exist).
- A Resend account and API key (see Step 1).
- Supabase CLI for deploying the function (`npm i -g supabase`, or
  `npx supabase …`).

---

## Step 1 — Create the Resend API key

1. Open <https://resend.com/api-keys> and create an API key
   (starts with `re_`). Copy it — you'll only see it once.
2. **Domain setup (one-time, for sending to real inboxes):**
   - Testing only: you can send from `onboarding@resend.dev` — but Resend only
     delivers those to **your own inbox** (the account owner's email).
   - Production: add your domain at <https://resend.com/domains>
     (e.g. `babcockinvestorsclub.org`), add the two DNS records it shows you
     (SPF/DKIM), and wait for verification. Then send from
     `Babcock Investors Club <hello@babcockinvestorsclub.org>`.

---

## Step 2 — Deploy the Edge Function

```bash
cd bic-react
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # the <ref> in https://<ref>.supabase.co

supabase functions deploy send-email --no-verify-jwt
```

Then set the secrets (replace the values):

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxx \
  FROM_EMAIL="Babcock Investors Club <onboarding@resend.dev>" \
  WEBHOOK_SECRET=$(openssl rand -hex 32) \
  SITE_URL=https://babcockinvestorsclub.org
```

> `--no-verify-jwt` makes the function publicly callable **by URL only**; the
> `x-webhook-secret` header check inside the function is what actually protects
> it. Keep `WEBHOOK_SECRET` long and random.

## Step 3 — Add the database triggers

Open `supabase/email_triggers.sql`, replace the two placeholders
(`YOUR_PROJECT_REF`, `CHANGE_ME_WEBHOOK_SECRET` — must equal the
`WEBHOOK_SECRET` you set above), then run the file in the Supabase **SQL
Editor**. It is safe to re-run.

## Step 4 — Test end-to-end

1. **Local smoke test** (optional, needs CLI running locally):
   ```bash
   supabase functions serve send-email
   curl -X POST http://127.0.0.1:54321/functions/v1/send-email \
     -H "Content-Type: application/json" \
     -H "x-webhook-secret: <WEBHOOK_SECRET>" \
     -d '{"table":"rsvps","record":{"name":"Jane Doe","email":"you@yourdomain.com","event_name":"Annual Student Finance Summit 2026"}}'
   ```
2. **Live test:** on the deployed site, submit an RSVP (or a membership
   application with a Paystack **test** key) and check the inbox.
3. **Logs:** `supabase functions logs send-email` shows each send + its Resend
   message id; delivery status appears in the Resend dashboard.

---

## Step 5 — Production polish (recommended)

- **Verify your domain** (Step 1.2) and switch `FROM_EMAIL` to it — otherwise
  real members never see the emails.
- **Supabase Auth emails** (signup confirmation, password reset): enable the
  Resend integration in **Authentication → Email → Resend** with the same API
  key, or keep Supabase's built-in SMTP. Either way the site's "check your
  email to confirm" flow becomes real.
- **Turn on "Confirm email"** in Authentication → Providers → Email once
  production is live.
- **Delivery tracking (optional):** add a Resend webhook
  (<https://resend.com/webhooks>) that POSTs delivery/ bounce events to another
  Edge Function or a Slack channel.
- **Spam-safety:** all form emails go to addresses people typed themselves;
  keep `email` columns as `not null` (already the case) and don't add
  unverified bulk sends without double opt-in.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `401 Unauthorized` in function logs | `x-webhook-secret` in `email_triggers.sql` ≠ `WEBHOOK_SECRET` secret. Fix and re-run the SQL. |
| `404` calling the function URL | Function not deployed (`supabase functions deploy send-email --no-verify-jwt`) or wrong project ref. |
| Emails send but never arrive | Using `onboarding@resend.dev` — only delivers to the Resend account owner's inbox. Verify a domain. |
| `Resend API error 403` | API key is restricted or the from-address isn't allowed yet. |
| No email at all, inserts still work | Check `supabase functions logs send-email`; ensure `email_triggers.sql` was run **after** deploying the function. |
| `schema "supabase_functions" does not exist` | Deploy any Edge Function first (it provisions the schema), then re-run the SQL. |

---

## How it fits together

```
Member fills form → row inserted into member_applications / rsvps
        ↓ (Postgres trigger)
send-email Edge Function (checks x-webhook-secret)
        ↓ (Resend API, RESEND_API_KEY)
Confirmation email to the applicant / attendee
```
