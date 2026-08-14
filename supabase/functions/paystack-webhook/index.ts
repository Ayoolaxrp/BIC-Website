// ============================================================================
// BIC — paystack-webhook Supabase Edge Function (Deno)
// ============================================================================
// Server-side payment verification for Paystack.
//
// Flow:
//   1. Paystack POSTs transaction events to
//      https://<ref>.supabase.co/functions/v1/paystack-webhook
//      (configured in Paystack Dashboard → Settings → Webhooks).
//   2. We verify the HMAC-SHA512 signature (`x-paystack-signature`, computed
//      with the Paystack SECRET key) — proof the request really came from
//      Paystack.
//   3. We double-check with Paystack's Verify API (status must be `success`).
//   4. We record the payment in `public.payments` and, for membership fees,
//      mark the matching `member_applications` row as paid.
//
// The frontend passes `metadata.payment_type` ('membership' | 'ticket') at
// checkout — see the small edits in usePaystack.js / Membership.jsx /
// Events.jsx. The webhook also matches membership payments by paystack_ref,
// so even legacy client-only checkouts get recorded.
//
// Deploy (after `supabase login` + `supabase link`):
//   supabase functions deploy paystack-webhook --no-verify-jwt
//   supabase secrets set PAYSTACK_SECRET_KEY=sk_test_... \
//     SUPABASE_URL=https://<ref>.supabase.co \
//     SUPABASE_SERVICE_ROLE_KEY=eyJ...        # service role — server-side only
//
// Runbook: ../PAYSTACK_WEBHOOK.md
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

// Service role bypasses RLS — safe here because only Paystack (signature-
// verified) can trigger this function.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Constant-time comparison (no short-circuit on first mismatch). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Paystack signs the RAW request body with HMAC-SHA512 using the secret key. */
async function computeSignature(secret: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Confirm with Paystack that the transaction really succeeded. */
async function verifyTransaction(
  reference: string,
): Promise<{ status: string; amount_kobo: number } | null> {
  if (!PAYSTACK_SECRET_KEY) throw new Error('PAYSTACK_SECRET_KEY is not set');
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Paystack verify failed (${res.status}): ${detail}`);
  }
  const body = await res.json();
  if (!body.status) throw new Error(`Paystack verify error: ${body.message ?? 'unknown'}`);
  return {
    status: body.data?.status ?? 'unknown',
    amount_kobo: Number(body.data?.amount ?? 0), // kobo (₦1 = 100 kobo)
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Read the RAW body first — the signature is computed over exactly this.
  const rawBody = await req.text();

  // 1. Signature check — proves this request came from Paystack.
  const signature = req.headers.get('x-paystack-signature') ?? '';
  const expected = await computeSignature(PAYSTACK_SECRET_KEY, rawBody);
  if (!PAYSTACK_SECRET_KEY || !safeEqual(signature, expected)) {
    console.error('paystack-webhook: invalid signature');
    return json({ received: false, error: 'Invalid signature' }, 401);
  }

  let payload: { event?: string; data?: Record<string, unknown> };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ received: true }, 200); // unparseable — ignore, don't retry
  }

  // Only act on successful charges; other events (ping, failed, etc.) are ack'd.
  if (payload.event !== 'charge.success') {
    return json({ received: true }, 200);
  }

  const txn = payload.data ?? {};
  const reference = String(txn.reference ?? '');
  const email = String((txn.customer as { email?: string } | undefined)?.email ?? txn.email ?? '');
  const metadata = (txn.metadata ?? {}) as Record<string, unknown>;
  const paymentType = metadata.payment_type === 'ticket' ? 'ticket' : 'membership';

  try {
    // 2. Double-check with Paystack's Verify API.
    const verified = await verifyTransaction(reference);
    if (!verified || verified.status !== 'success') {
      console.error(
        `paystack-webhook: transaction ${reference} not successful (${verified?.status})`,
      );
      return json({ received: true }, 200); // don't record failed transactions
    }

    // 3. Record the payment — idempotent via unique paystack_ref (Paystack
    //    retries failed deliveries, so the same event can arrive twice).
    const { error: payErr } = await supabase.from('payments').upsert(
      {
        paystack_ref: reference,
        payment_type: paymentType,
        email: email || null,
        amount_kobo: verified.amount_kobo,
        status: 'paid',
        event_id: paymentType === 'ticket' ? (metadata.event_id ?? null) : null,
        event_name: paymentType === 'ticket' ? (metadata.event_name ?? null) : null,
        raw: txn,
        verified_at: new Date().toISOString(),
      },
      { onConflict: 'paystack_ref' },
    );
    if (payErr) throw payErr;

    // 4. Membership fee → mark the application paid (idempotent update).
    if (paymentType === 'membership') {
      const { error: appErr } = await supabase
        .from('member_applications')
        .update({
          payment_status: 'paid',
          payment_verified_at: new Date().toISOString(),
        })
        .eq('paystack_ref', reference);
      if (appErr) throw appErr;
    }

    console.log(
      `paystack-webhook: recorded ${paymentType} payment ${reference} ` +
        `(₦${(verified.amount_kobo / 100).toFixed(2)})`,
    );
    return json({ received: true }, 200);
  } catch (err) {
    // Return 500 so Paystack retries — the upsert/update are idempotent,
    // so a retry is safe.
    console.error('paystack-webhook error:', err instanceof Error ? err.message : err);
    return json({ received: false, error: 'Internal error' }, 500);
  }
});
