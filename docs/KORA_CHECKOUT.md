# BIC membership checkout through Kora

This release uses the already-applied public membership contract recovered in the parent session. No new migration is included or needed. Events and the authenticated member portal are unchanged. No provider payment, deployment, push or live database write was performed in this implementation run.

## Existing configuration and switches

SUPABASE_URL is optional and takes precedence over VITE_SUPABASE_URL on the server.

Server variables use the existing Vercel names: KORAPAY_SECRET_KEY, SUPABASE_SECRET_KEY, VITE_SUPABASE_URL and VITE_SITE_URL. SUPABASE_SECRET_KEY is a modern sb_secret_ credential: server RPC requests send it in the apikey header ONLY, never as a Bearer token. The Kora key is sent only from the server to api.korapay.com with Bearer authorization. Neither secret may have a VITE_ prefix or be imported by frontend code.

KORA_CHECKOUT_ENABLED=true enables server endpoints. VITE_KORA_CHECKOUT_ENABLED=true exposes the membership checkout flow at build time. Both default off and neither was enabled by this run. VITE_SITE_URL must be the exact HTTPS site origin without a trailing slash; requests from other origins are rejected for initialize/status. The webhook has no browser-origin requirement. Preview needs its own origin and test Kora key, not production credentials. Turning off the server flag also blocks reconciliation, so prefer disabling the frontend first when pausing new payments with outstanding references.

## Endpoints and flow

- POST /api/kora/initialize accepts only {application:{full_name,matric_number,phone_number,department,level,email,knowledge_level,interests,sector,campus,committee}}. This is the public membership form, NOT an authenticated account flow. Fields are bounded, choices validated, and email must be @babcock.edu.ng to match the recovered SQL. Browser-supplied price, reference or paid status is rejected.
- The server generates BIC-KORA- plus crypto.randomUUID(), then calls create_kora_intent(p_reference,p_application). That RPC atomically saves the pending application and private intent. get_kora_intent(p_reference) must return the same reference, fixed 250000 kobo and NGN before initialization.
- The server sends Kora POST /merchant/api/v1/charges/initialize with narration BIC membership, amount 2500, currency NGN, merchant_bears_cost=true, a server reference, notification_url at /api/kora/webhook and redirect_url at /checkout/return. Only a credential-free https://checkout.korapay.com URL is accepted.
- POST /api/kora/status accepts {reference}. It returns only reference and pending/paid, never email or application data. The unpredictable UUID reference is the public lookup capability. It does not assert verified ownership of the email; public form submission was explicitly required.
- POST /api/kora/webhook preserves the bounded raw request stream, parses once, and validates x-korapay-signature using constant-time HMAC-SHA256 over JSON.stringify(payload.data), NOT the whole raw body. Kora signs only data; the unsigned outer event cannot grant value. Signed data.status must be success and webhook amount/currency/reference must match the saved intent.
- Before granting value, webhook/status independently GET /merchant/api/v1/charges/:reference. The server requires successful provider response, data.status=success and exact reference/currency/amount match. Success must include at least one actual amount field (amount_paid or amount_accepted). Every supplied actual field must exactly match 250000 kobo after decimal conversion; missing, malformed, underpaid or overpaid evidence cannot finalize, even when nominal amount matches. This conservative rule also sends return-excess cases with differing paid versus accepted amounts to manual reconciliation rather than automatically granting value. Fees are not subtracted from actual evidence: merchant_bears_cost remains true, and amount_accepted is the processed value, not the net merchant settlement after fees. Then finalize_kora_payment(p_reference,p_amount_kobo,p_currency) locks the intent and atomically writes one ledger payment, marks the linked application paid with payment_method=kora and marks the intent paid. Retries and webhook/return races are idempotent in SQL.

The browser callback/return URL never marks payment successful by itself. It asks the server to verify. A pending/error result explicitly warns not to pay again. The current tab saves a returned reference in sessionStorage and blocks another form checkout until confirmation, including after initialization errors that return a reference. Successful confirmation clears that tab's pending reference. Disabled checkout preserves the existing pending-application/manual-follow-up workflow. Legacy Paystack server files are untouched, but Membership.jsx no longer uses its unverified browser-callback route. Admin labels recognize kora as online payment.

## Recovered database contract

Exact functions: create_kora_intent(text,jsonb), get_kora_intent(text), finalize_kora_payment(text,bigint,text). The parent supplied live-backend-audit.json confirming RLS, no public policies, service-only function grants and kora accepted by payment_method. The implementation does not modify these functions or the database. tests/fixtures/applied-kora-contract.sql is a local-test snapshot of the recovered applied SQL, NOT a deployment migration. The old draft bic_private ledger and event fee extensions were removed entirely.

Compatibility intentionally retains paystack_ref as the unique generic reference field in member_applications and payments. The recovered finalize function validates the existing ledger before committing; it stores {provider:kora}. Existing member payment/sector triggers remain in charge. This release does not support events, alternate currencies, refunds, chargebacks or annual renewals.

## Deployment checks and limitations

Vercel must deploy the repository root so api and server files are included, not just static dist. API routing precedes the SPA fallback. Functions explicitly disable body parsing to read the webhook stream; verify actual Vercel routing and request behavior in an authorized preview before enabling real charges. All endpoints return no-store and cap request bodies at 32 KiB. Provider and Supabase requests have finite timeouts. Secrets, tokens and provider responses are not logged.

The public endpoint's exact Origin check is CSRF protection, not bot protection: a non-browser can spoof it. Configure Vercel WAF/rate limits for /api/kora/initialize and /api/kora/status before exposing a public live flow. No firewall changes were made here.

The applied schema has no durable initialization idempotency token, per-email uniqueness, saved checkout URL or automatic expiry. Fulfillment is duplicate-safe per reference, but separate submissions can create separate pending applications/charges. Do not claim global duplicate-payment prevention. If initialization succeeds at Kora but the response is lost, a new submit must not be used as a payment retry: check the original reference/provider first. Errors after intent creation return the reference for recovery when the response reaches the browser. Lost entire responses and expired/abandoned sessions need team reconciliation; no automatic replacement charge is created in the same tab once its reference is known. Public email ownership is not verified, per the requested public flow.

The documented initialize/card examples use major NGN amounts, but the extracted official pages do not explicitly label major/minor units. This code sends 2500 for NGN 2,500 and converts returned decimal amounts to integer 250000 kobo. Confirm denomination with Kora support or a separately authorized sandbox checkout before any live charge. Mock tests are not proof of provider behavior. A controlled sandbox payment and deployed runtime test were not authorized or performed by this run.

## Verification

npm run test:checkout: 26 mocked cases covering fixed price, public validation, no forged payment claims, signatures/raw input, provider matching, duplicate fulfillment, safe errors, HTTP guards and modern Supabase apikey-only auth.

npm run test:db: 63 passing local PGlite assertions. The repository migration chain and the recovered already-applied contract are loaded twice locally, then tested for browser denial, fixed amount, mismatch rejection, one payment row and paid application/intent. No live database is contacted.

npm run typecheck checks the existing app plus the new Node API modules via tsconfig.server.json. npm run build creates the production Vite bundle. See final handoff for latest exact results. No push or deployment is part of these commands.

## Official references consulted 2026-11-03

https://developers.korapay.com/docs/checkout-redirect — initialize endpoint and hosted return/notification URLs.
https://developers.korapay.com/docs/webhooks — data-only HMAC-SHA256 signature, x-korapay-signature, retries up to 72 hours for non-200 responses.
https://developers.korapay.com/docs/accepting-card-payments-with-apis — GET charges/:reference with boolean status=true and data.status=success.
https://docs.korapay.com/ — general API guidance; inconsistent string status examples are not accepted instead of the transaction-specific boolean contract.

Official amount-semantics reference: https://developers.korapay.com/docs/handling-underpayments-and-overpayments — nominal webhook amount remains the requested amount; use queried amount_accepted to determine value. amount_paid is the customer transfer, amount_accepted is the processed amount, and merchant balance settlement can subtract fees. No change to major-unit conversion is made; live collection stays off until an authorized sandbox display confirms denomination. Initialization retry remains status-only for known references; no automatic second charge is introduced.


## Temporary receiver configuration

The owner requested temporarily moving the merchant notification endpoint from Elion to BIC. Enable the Production server receiver with KORA_CHECKOUT_ENABLED=true and redeploy before changing the merchant webhook to https://www.babcockinvestorsclub.com/api/kora/webhook. Verify unsigned requests are rejected. The frontend collection flag remains false; receiver readiness does not prove a real payment or bank verification. Do not remove unrelated Elion settings.
