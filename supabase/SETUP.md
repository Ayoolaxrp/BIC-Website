# Supabase setup (BIC)

Everything the site needs is in `supabase/migrations/`, in order. Each file is
safe to run more than once, on a brand-new project or on one that ran the old
`schema.sql`. Tested with `npm run test:db` (33 checks: access rules, payments,
email trigger and throttle, re-runs, upgrade from the old schema).

Until these steps are done the live site stays honest: forms show
"email or WhatsApp us" instead of pretending to save, and member login is hidden.

## 1. Create the project

1. https://supabase.com/dashboard → **New project**. Name it `bic`, region
   **West EU (London)** or the closest to Nigeria offered, and save the
   database password somewhere safe.
2. Wait for it to finish provisioning.

## 2. Run the migrations

Pick one.

**A. SQL editor (no tools needed).** Project → SQL Editor → New query. Paste
each file from `supabase/migrations/` in filename order and press **Run**:

1. `20261009000100_core_schema.sql`
2. `20261009000200_rls_policies.sql`
3. `20261009000300_storage.sql`
4. `20261009000400_payments.sql`
5. `20261009000500_email_notifications.sql`
6. `20261009000600_audit_hardening.sql`

**B. Supabase CLI.**

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

**C. `npm run db:apply`.** Put `SUPABASE_DB_URL` in `.env` (Connect → **Session pooler** URI,
with your password filled in) and run `npm run db:apply`. Use the pooler, not the direct
`db.<ref>.supabase.co` address: the direct one is IPv6-only and fails on most home
networks. This project's pooler is `aws-0-eu-west-1.pooler.supabase.com`.

## 3. Auth settings

Authentication → Providers → **Email**: on, with **Confirm email** and
**Secure email change** both on (they are by default; leave them on).
Authentication → URL Configuration:

- Site URL: `https://bic-react.vercel.app` (change when the club domain is live)
- Redirect URLs: add `https://bic-react.vercel.app/**` and
  `http://localhost:3000/**`

## 4. Connect the site

Project Settings → API. Copy the **Project URL** and the **anon public** key.

In Vercel → bic-react → Settings → Environment Variables (Production and
Preview):

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public key |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key (`pk_live_…`), when ready |
| `VITE_SITE_URL` | only once the club domain is live |

Redeploy. The forms, newsletter and member login switch on by themselves.
Never put the **service_role** key in Vercel or in the site.

## 5. Make the first admins

Each executive signs up on `/member` first. Then, in the SQL editor:

```sql
update public.profiles set role = 'admin'
where lower(email) in ('first.exec@babcock.edu.ng', 'second.exec@babcock.edu.ng');
```

Admins manage events, articles, resources and newsletter posts at `/admin` and
see every form submission there.

## 6. Optional: confirmation emails and Paystack

**Emails** (application received, RSVP confirmed) use Resend.

1. Create a Resend account and API key. Sending from your own address needs a
   domain you control; until then Resend's test sender works for testing.
2. Deploy the function and set its secrets:
   ```bash
   npx supabase functions deploy send-email --no-verify-jwt
   npx supabase secrets set RESEND_API_KEY=... FROM_EMAIL="BIC <hello@your-domain>" \
     WEBHOOK_SECRET=<long random string> SITE_URL=https://bic-react.vercel.app
   ```
3. Tell the database where to send, in the SQL editor:
   ```sql
   insert into private.app_config (key, value) values
     ('send_email_url', 'https://<project-ref>.supabase.co/functions/v1/send-email'),
     ('webhook_secret', '<the same long random string>')
   on conflict (key) do update set value = excluded.value;
   ```

**Paystack** (₦2,500 membership fee).

1. Paystack dashboard → Settings → API Keys. Put the **public** key in Vercel
   (step 4).
2. Deploy the webhook with the **secret** key as a function secret:
   ```bash
   npx supabase functions deploy paystack-webhook --no-verify-jwt
   npx supabase secrets set PAYSTACK_SECRET_KEY=sk_live_... MEMBERSHIP_FEE_KOBO=250000
   ```
3. Paystack → Settings → API Keys & Webhooks → Webhook URL:
   `https://<project-ref>.supabase.co/functions/v1/paystack-webhook`

A membership only counts as paid when Paystack confirms it and the amount is at
least `MEMBERSHIP_FEE_KOBO` (₦2,500 = `250000`). Visitors can never mark
themselves paid.

## Check it worked

- Table Editor shows: profiles, events, articles, resources, newsletter_posts,
  member_applications, contact_messages, sponsorship_inquiries, rsvps,
  subscribers, payments.
- Advisors → Security shows no errors.
- On the live site, send a message from `/contact`; it appears in `/admin`.
