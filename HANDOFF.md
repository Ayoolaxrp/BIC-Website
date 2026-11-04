# HANDOFF: read this first

BIC (Babcock Investors Club) website. Read this, then `FREEBUFF_HANDOFF.md` (rules, verified facts, validation commands), then `DESIGN.md`. Updated 2026-10-11.

## Where things stand
- Repo: this folder → GitHub `Ayoolaxrp/BIC-Website`. Live: https://www.babcockinvestorsclub.com (push to `main` = production deploy, Vercel project `bic-react`).
- 2026-10-11 (branch `polish-portal-backend`, merged via PR):
  - **Apple-design audit fixes:** Partners pricing tiers removed (one enquiry path, no packages); sponsor letter-badges removed; numbered steps only on Membership; repeated/filler stats cut; decorative labels (01–04, "Backed by", "Our vision" kickers, green pill, "BIC · Legal") removed; hero photos recropped; legacy green colour tokens remapped to BIC blue.
  - **Backend:** migration `20261011000700_offline_payments.sql` (applied live). Admins record a ₦2,500 fee paid in cash or by transfer through `admin_set_membership_payment()`; members cannot. `npm run test:db` = 43 checks. Live auth minimum password length is now 8.
  - **Student portal** (`src/pages/Member.jsx`, rewritten): sign in / create account / forgot password, set-new-password after a reset link, honest membership steps (account → application → fee), sector + chat link + resources, events, club updates, profile edit, change password, WhatsApp help. Admin console has Paid in cash / Paid by transfer / Undo on each application.
  - Verified end-to-end against the real Supabase project with throwaway users (21/21), then deleted.
- `brag-output*/` folders are from another agent's launch-video run and are not committed.

## Owner actions (code cannot do these)
1. **Custom SMTP in Supabase** (Authentication → Emails → SMTP). The built-in mailer sends ~2 auth emails per hour for the whole project, so most sign-up confirmations and reset links will not arrive. See `supabase/SETUP.md` §3.
2. **First admin:** an executive signs up at `/member`, then run the SQL in `supabase/SETUP.md` §5. There are currently no accounts at all.
3. Sector WhatsApp invite links for `src/lib/sectors.js` (portal says "the chair will add you" until then).

## Hard rules (short version)
- Design: **only** the apple-design skill (`~/.claude/skills/apple-design`). One accent: BIC blue. No eyebrow labels, no em/en-dashes, no icon-card grids, no pricing tiers, no hover glows. Edit `src/styles/system.css`, not `src/index.css`.
- No fake or unverified content. "Exclusive Investment Masterclass" is the real poster title; leave it.
- Never commit `.env`, never print its values, never put the service_role or Paystack secret key in the frontend or Vercel.
- Low RAM/disk machine; retry network calls on `EAI_AGAIN`; stop retry loops after 2 failures.

## Where we stopped (2026-11-04, merged to `main` and live unless noted)
- **WhatsApp groups after payment:** `/checkout/return` shows join buttons (`sectorGroups()` in `server/kora.mjs`, `supabaseSector()` in `server/http.mjs`). Owner decision 2026-11-04: the fee covers everything, so every paid member gets the main members chat (`Members` = "BIC Members 26/27") first, their own sector group next, then all other sector groups. Links live only in the Vercel Production env var `BIC_SECTOR_LINKS` (non-sensitive, readable and editable; format in `.env.example`), never in this public repo. Keys: Crypto, Securities, Forex, "Real Estate", `Members`. Group names were read from each invite's public preview. The big "aspiring GC" (about 630 people, mostly unpaid) is a different chat and must never be put in this variable. The form's phone field is labelled "WhatsApp Number" so chairs can match join requests.
- **Any valid email can apply:** one rule in `src/lib/email.js` (form, `/member` sign-up, server); the live `create_kora_intent` was updated 2026-11-04 (checked before and after).
- **Checkout is ON in production** (both KORA flags `true`, live Kora key, `VITE_SITE_URL` `https://www.babcockinvestorsclub.com`). The merchant account is the owner's agency account (temporary).
- **Open problem raised by the sector chairs (from a voice note):** the aspiring GC is a WhatsApp Community, so its ~630 people can see the registered-members groups and join without paying. Plan: take the paid groups out of the Community (or keep them standalone), turn on "Approve new participants", and let each chair check join requests against the paid list. The site already has the list (Admin, Submissions, Member Applications, scoped by `executive_access` permission `view_members`), but it shows only the latest 30 rows as raw data with no search. Next build: a search box (name, email, matric, phone digits) with a clear Paid label, over all rows. Chairs also need accounts, which needs working sign-up emails.
- **Open: sign-up and reset emails.** Supabase uses its built-in sender (about 2 emails an hour), so portal sign-ups will mostly not get a confirmation. Fix is custom SMTP in Supabase (Authentication, Emails, SMTP). The application-received email (`notify_send_email` trigger) does nothing until `private.app_config` has `send_email_url` and `webhook_secret` and the `send-email` edge function is deployed (nothing has ever been sent). Kora does not provide email sending for the club; its own pages describe alerts to the merchant, not to students.
- Not checked: a real Kora payment end to end (the live sector lookup was checked read-only against live data, and the join button against fakes), the Kora dashboard webhook address, Supabase Auth settings (the Management API token in the old `.env` has expired), the `/thermos` and `/pstack:blast-radius` reviews.
