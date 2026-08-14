# BIC — Paystack Webhook (server-side payment verification)

Replaces the "trust the browser" payment flow with a real one:

| Payment | Before | After |
|---|---|---|
| Membership fee (₦5,000) | Client callback only; `paystack_ref` stored, nothing verified | Webhook verifies with Paystack → `member_applications.payment_status = 'paid'` (server-set) |
| Event ticket (₦2,000) | Alert only — **no record at all** | Webhook records the purchase in `payments` (amount, event, email) |

Files in this package:

- `functions/paystack-webhook/index.ts` — the Edge Function (HMAC signature
  check → Paystack Verify API → record + mark paid).
- `paystack_webhook.sql` — schema additions (`payment_status`, `payments`
  ledger, race-closing trigger, RLS).
- Frontend edits (already applied): `usePaystack.js` now passes `metadata`
  through to Paystack; `Membership.jsx` tags checkout as `payment_type:
  'membership'`; `Events.jsx` tags tickets with `event_id`/`event_name` (and a
  missing `PAYSTACK_PUBLIC_KEY` import was fixed).

---

## Step 1 — Apply the schema

Run `supabase/paystack_webhook.sql` in the Supabase **SQL Editor**
(prerequisite: `schema.review.sql` already applied). Idempotent — safe to re-run.

## Step 2 — Deploy the function

```bash
cd bic-react
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # the <ref> in https://<ref>.supabase.co

supabase functions deploy paystack-webhook --no-verify-jwt
```

Set the secrets (replace the values):

```bash
supabase secrets set \
  PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # Project Settings → API → service_role
```

> `--no-verify-jwt`: Paystack sends no Supabase JWT. The webhook's own
> HMAC-SHA512 signature (keyed with `PAYSTACK_SECRET_KEY`) is the auth.
> `SUPABASE_SERVICE_ROLE_KEY` grants full DB access — it lives only in
> Supabase secrets, never in the client bundle.

## Step 3 — Point Paystack at the function

1. Paystack dashboard → **Settings → Webhooks** (or **Developers → Webhooks**).
2. Add a webhook:
   - **URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-webhook`
   - **Events:** enable **`charge.success`** (enable all `charge.*` if you want
     failed transactions recorded too — the function ignores non-success ones).
3. Save. Paystack now POSTs a signed payload for every successful charge.

## Step 4 — Test

1. **Inspect the function locally** (optional):
   ```bash
   supabase functions serve paystack-webhook
   ```
   Then send a signed test payload (signature = HMAC-SHA512 of the body with
   your secret key):
   ```bash
   BODY='{"event":"charge.success","data":{"reference":"TEST-1","customer":{"email":"you@yourdomain.com"},"metadata":{"payment_type":"membership"},"amount":500000}}'
   SIG=$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "sk_test_xxxxxxxx" -hex | awk '{print $2}')
   curl -X POST http://127.0.0.1:54321/functions/v1/paystack-webhook \
     -H "Content-Type: application/json" \
     -H "x-paystack-signature: $SIG" \
     -d "$BODY"
   ```
   Or use the Paystack dashboard **"Send test webhook"** button — it sends a
   real signed payload straight to the configured URL.
2. **Live test:** on the site (with `VITE_PAYSTACK_PUBLIC_KEY=pk_test_...`),
   pay with Paystack's test card `4084 0840 8408 4081`, any future expiry,
   any CVV. Then check:
   - `select * from public.payments order by created_at desc;` → one row,
     `status = 'paid'`.
   - For membership: `select email, payment_status, paystack_ref from
     public.member_applications order by created_at desc;` → `'paid'`.
   - Logs: `supabase functions logs paystack-webhook`.

## Notes & gotchas

- **Idempotent:** Paystack retries non-2xx deliveries up to ~12 times. The
  `paystack_ref` unique constraint + `.upsert()` make retries safe.
- **Race:** the webhook can arrive before the browser writes the application.
  The `apply_membership_payment_status()` trigger marks it paid when the row
  finally lands. Either order converges.
- **Ticket events:** DB events use UUID ids; the seed events
  (`summit-2026`, …) don't exist in the DB, so `payments.event_id` is stored
  as text and `event_name` is always kept for display.
- **Amounts:** stored in **kobo** (`amount_kobo`) — that's what Paystack
  sends. Divide by 100 for naira.
- **Production:** switch to `sk_live_...` and `pk_live_...` when going live.
  Do **not** delete the webhook after testing in live mode — test-mode
  webhooks only fire for test transactions.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `401` in function logs | Wrong `PAYSTACK_SECRET_KEY` secret, or the request didn't come from Paystack. |
| `404` on the webhook URL | Function not deployed, or wrong project ref in the webhook URL. |
| No `payments` rows after a test payment | Webhook not saved / `charge.success` not enabled in Paystack settings; or you paid in a different mode (test vs live) than the webhook. |
| Payment recorded but application still `pending` | Application row's `paystack_ref` doesn't match the payment's reference (e.g. checkout metadata mismatch). Both should be `BIC_<timestamp>_<random>`. |
| `500` then retries | Function error — check `supabase functions logs paystack-webhook` for the message. Retries are safe. |
