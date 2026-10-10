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
