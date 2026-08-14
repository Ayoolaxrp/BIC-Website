// ============================================================================
// BIC — send-email Supabase Edge Function (Deno)
// ============================================================================
// Sends transactional confirmation emails via Resend (https://resend.com).
// Called by the database triggers in ../email_triggers.sql whenever a row is
// inserted into `member_applications` (membership application confirmation)
// or `rsvps` (event RSVP confirmation).
//
// Security: the function is deployed with --no-verify-jwt and is protected by
// the `x-webhook-secret` header, which must match the WEBHOOK_SECRET secret.
// Only the DB trigger (which embeds the same secret) can call it.
//
// Deploy (after `supabase login` + `supabase link`):
//   supabase functions deploy send-email --no-verify-jwt
//   supabase secrets set RESEND_API_KEY=re_... \
//     FROM_EMAIL="Babcock Investors Club <onboarding@resend.dev>" \
//     WEBHOOK_SECRET=<long random string> \
//     SITE_URL=https://babcockinvestorsclub.org
//
// Test locally:
//   supabase functions serve send-email
//   curl -X POST http://127.0.0.1:54321/functions/v1/send-email \
//     -H "Content-Type: application/json" \
//     -H "x-webhook-secret: <WEBHOOK_SECRET>" \
//     -d '{"table":"rsvps","record":{"name":"Jane Doe","email":"jane@babcock.edu.ng","event_name":"Annual Student Finance Summit 2026"}}'
// ============================================================================

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL =
  Deno.env.get('FROM_EMAIL') ??
  'Babcock Investors Club <onboarding@resend.dev>';
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://babcockinvestorsclub.org';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Send an email through the Resend REST API (no SDK dependency). */
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ id?: string }> {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend API error ${res.status}: ${detail}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Email templates (BIC navy/gold branding, plain + HTML)
// ---------------------------------------------------------------------------

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e3e8ef;">
            <tr>
              <td style="background:#011B33;padding:22px 28px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.5px;">Babcock Investors <span style="color:#C9A227;">Club</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 14px;font-size:20px;color:#011B33;">${escapeHtml(title)}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e3e8ef;">
                <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
                  This is an automated message from the Babcock Investors Club.<br/>
                  BIC content is educational only and is not financial advice.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function applicationEmail(record: Record<string, unknown>): {
  subject: string;
  html: string;
  text: string;
} {
  const name = escapeHtml(record.full_name ?? 'there');
  const ref = escapeHtml(record.paystack_ref ?? 'pending');
  const html = layout(
    'Application Received 🎉',
    `<p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">Hi ${name},</p>
     <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">
       Thank you for applying to join the Babcock Investors Club! Your membership
       application and payment have been received.
     </p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e3e8ef;border-radius:8px;margin:16px 0;">
       <tr><td style="padding:14px 18px;font-size:13px;color:#475569;">
         <strong style="color:#011B33;">Payment reference:</strong> ${ref}<br/>
         <strong style="color:#011B33;">Status:</strong> Received — the executive team will onboard you at the next session.
       </td></tr>
     </table>
     <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">
       Keep an eye on your email and our socials for session schedules, your sector
       community group, and next steps.
     </p>
     <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">Welcome aboard!<br/><strong style="color:#011B33;">Babcock Investors Club</strong></p>`,
  );
  const text =
    `Hi ${name},\n\n` +
    `Thank you for applying to join the Babcock Investors Club! Your membership application and payment have been received.\n\n` +
    `Payment reference: ${ref}\n` +
    `Status: Received — the executive team will onboard you at the next session.\n\n` +
    `Keep an eye on your email and our socials for session schedules and next steps.\n\n` +
    `Welcome aboard!\nBabcock Investors Club\n${SITE_URL}`;
  return { subject: 'Your BIC Membership Application Was Received', html, text };
}

function rsvpEmail(record: Record<string, unknown>): {
  subject: string;
  html: string;
  text: string;
} {
  const name = escapeHtml(record.name ?? 'there');
  const event = escapeHtml(record.event_name ?? 'your selected event');
  const html = layout(
    'RSVP Confirmed ✅',
    `<p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">Hi ${name},</p>
     <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">
       You're on the list for <strong style="color:#011B33;">${event}</strong>.
     </p>
     <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">
       Registration details, the venue/joining link, and reminders will be shared
       on our socials and here on the website as the date approaches.
     </p>
     <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">See you there!<br/><strong style="color:#011B33;">Babcock Investors Club</strong></p>`,
  );
  const text =
    `Hi ${name},\n\n` +
    `You're on the list for ${event}.\n\n` +
    `Registration details, the venue/joining link, and reminders will be shared on our socials and on the website as the date approaches.\n\n` +
    `See you there!\nBabcock Investors Club\n${SITE_URL}`;
  return { subject: `You're In — ${event}`, html, text };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only the DB trigger/webhook may call this — verify the shared secret.
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const table: string = body.table;
    const record: Record<string, unknown> = body.record ?? {};

    let email: { subject: string; html: string; text: string };
    if (table === 'member_applications') {
      email = applicationEmail(record);
    } else if (table === 'rsvps') {
      email = rsvpEmail(record);
    } else {
      return json(
        { ok: false, error: `No email template configured for table "${table}"` },
        400,
      );
    }

    const to = String(record.email ?? '').trim();
    if (!to) return json({ ok: false, error: 'Missing recipient email' }, 400);

    const sent = await sendEmail({ to, ...email });
    console.log(`email sent to ${to} (table=${table}, id=${sent.id})`);
    return json({ ok: true, id: sent.id });
  } catch (err) {
    console.error('send-email error:', err instanceof Error ? err.message : err);
    return json(
      { ok: false, error: err instanceof Error ? err.message : 'Internal error' },
      500,
    );
  }
});
