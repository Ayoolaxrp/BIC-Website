# FREEBUFF HANDOFF: BIC website (Babcock Investors Club)

## Project Context
- **Type**: Marketing site (Vite + React 19 SPA) with a Supabase back end (forms, member accounts, admin console) and Paystack payments
- **Repo**: `C:\Users\User\Projects\bic-website\bic-react` → GitHub `Ayoolaxrp/BIC-Website`
- **Branch**: `redesign/apple-restraint` (pushed; last commit `854f612`). `main` is the live site and is untouched.
- **Live site**: https://bic-react.vercel.app (still the OLD design until this branch is merged)
- **Preview of this branch**: Vercel builds it automatically on push (needs a Vercel login to view)
- **Request**: (1) remove everything that looks like AI slop, using the Apple design skill; (2) apply the club's WhatsApp feedback and the 2026/27 calendar; (3) write all Supabase migrations so the owner can create the project and deploy; (4) run the Cloudflare security audit skill so it is deployment-ready.
- **Date**: 2026-10-09

## Status at handoff

| Area | State |
| --- | --- |
| Apple-style redesign (all pages) | Done, committed `4349ba7` |
| Club feedback + calendar | Done, committed `70253d2` |
| Supabase migrations + runbook | Done and tested, committed `854f612` |
| Cloudflare security audit | **In progress** (see "Unfinished work" below) |
| Merge to `main` / go live | **Not done. Owner must approve first.** |
| Supabase project creation | **Owner will do it**, then share details |

## Required Skills (IN ORDER)
1. `apple-design` (installed at `~/.claude/skills/apple-design`, from github.com/emilkowalski/skills). The design authority for every UI change.
2. `design-taste-frontend`. Anti-slop checklist; run it after any visual change.
3. `security-audit` (Cloudflare's official skill, updated to github.com/cloudflare/security-audit-skill `main`). Only to finish the audit run described below.

## Agents to Invoke
- `design-reviewer`: before delivering any UI change.
- No other agents are needed. Do not start a second security audit; finish run-1 (below).

## Rules that must not be broken
1. **No fake or unverified content.** No invented stats, testimonials, events, photos, PDFs or partner names. The club explicitly asked for all fake pictures and unverified information to be removed. If something is not on a club poster, in the club calendar or confirmed by the club, it does not go on the site.
2. **Verified facts only** (sources: club posters in `public/images/*poster*.webp`, `BIC CALENDAR copy copy.docx`, and club WhatsApp messages in `../Screenshot 2026-10-09 0242*.png` / `0243*.png`):
   - 150+ active members (club-confirmed; overrides the older "50+")
   - Membership fee ₦2,500
   - Email babcockinvestorsclub@gmail.com, phone/WhatsApp +234 811 688 3025, replies "within 72 hours"
   - 2026 seminar sponsors: Fundbox Financial Services, Leadway Assurance, More Ladda (Meristem), Chapel Hill Denham. **Not Bamboo, not AVA** (unconfirmed).
   - Next major event: "BIC 2026/2027: Welcome to the Next Chapter", **November 2026, Babcock University** (month only, no countdown, no exact day).
   - Club tagline: "Building a community of smart, confident investors."
3. **Design system** (see `DESIGN.md`, `src/styles/system.css`):
   - One accent: **green**. Mint `#4fc58f` on navy, deep green `#14593f` on white. The club rejected yellow/gold.
   - System font first (SF Pro on Apple), Inter fallback. Tracking tightens as size grows.
   - Shapes: controls are pills, surfaces 18px, inputs 12px.
   - No eyebrow labels, no two-tone headlines, **no em-dashes or en-dashes in visible text**, no placeholder names (Jane Doe/Acme), no hover lifts or glows, no countdowns.
   - Press feedback `scale(0.97)` in 100ms; reveals decelerate and never overshoot; honour reduced motion/transparency/contrast.
   - New dark (navy) containers must be added to the `.surface-dark` list in `src/styles/system.css`, otherwise buttons render navy-on-navy.
   - Edit `src/styles/system.css`; do not append new override layers to `src/index.css` (that is what made the old site look AI-built; see `lessons/LOG.md`).
4. **Honest forms.** When Supabase is not configured, forms render `<OfflineNotice>` (WhatsApp + email) instead of pretending to save. A failed save must show as failed. Do not reintroduce "saved on this device" success messages.
5. **Never** commit `.env`, put the Supabase service_role key or Paystack secret key in the frontend or Vercel, push to `main`, or deploy to production without the owner's explicit OK.
6. Do not delete or overwrite the club's Vision/Mission text on About; it is the club's own wording.

## Files to Work On

| File | Action | Notes |
| --- | --- | --- |
| `~/security-audit-skill/bic-react/run-1/*` | Finish | Security audit run in progress (see below). Output lives OUTSIDE the repo. |
| `src/lib/sectors.js` | Modify when club sends links | `GROUP_LINKS` are `REPLACE_*` placeholders (portal hides them until real) |
| `src/pages/Blog.jsx` | No code change needed | Articles come from the admin console once Supabase is live. Club will send articles. |
| `src/pages/Events.jsx` | Modify when club sends details | Past events: only the two poster-verified events. Add more only with club-supplied photos/details. |
| `public/images/logo.png` | Owner decision | The logo is clip-art. Do not change it without the club's approval. |
| `supabase/migrations/*.sql` | Do not edit unless a test fails | Run `npm run test:db` after any change |

## Unfinished work

### 1. Cloudflare security audit, run-1 (quick profile)
- Output dir: `C:\Users\User\security-audit-skill\bic-react\run-1\` (outside the repo, on purpose)
- Done: `run-metadata.json`, `architecture.md`, `coverage-ledger.json` (9 units, valid), hunter prompts in `agents/hunt-access|hunt-payments|hunt-client/prompt.md`.
- Budget: strict 16 agent calls. **7 used** (4 reconnaissance agents failed on an API rate limit and still count; 3 hunters launched). Remaining: 9. The skill's `quick` profile needs 1 coverage-critic call, then 1 verifier per surviving candidate.
- The 3 hunters **finished** (7/16 calls used). Results: 5 of 9 units covered clean, 4 candidates (all `needs_validation`, none confirmed yet):
  1. `supabase/migrations/20261009000200_rls_policies.sql:submission-read-own-trusts-unverified-jwt-email`: members read "their" applications/RSVPs by JWT email; unsafe if Supabase "Confirm email" is off. Fix: keep Confirm email on (add `[auth.email] enable_confirmations = true` to `supabase/config.toml` and a line in `SETUP.md` step 3), and/or require `auth.jwt()->>'email_verified'`.
  2. `bic-react:member_applications.paystack_ref:non-unique-payment-reuse`: one paid ref can mark many applications paid. Fix: partial UNIQUE index on `member_applications(paystack_ref) where paystack_ref is not null`, and in `apply_membership_payment_status` also require `lower(payments.email) = lower(new.email)`.
  3. `bic-react:notify_send_email:anon-insert-arbitrary-recipient-email`: anonymous inserts make the club's sender email any address with attacker-chosen subject text. Fix: don't echo free-text `event_name` in the subject (use a fixed subject or look it up in `events`), and add per-email throttling (e.g. skip if the same email got a mail in the last hour).
  4. `bic-react:send-email:empty-webhook-secret-fail-open`: `send-email` passes an empty `x-webhook-secret` when `WEBHOOK_SECRET` is unset. Fix: `if (!WEBHOOK_SECRET) return 401` before comparing, plus a constant-time compare.
  - Hardening notes (not findings): add security headers (CSP, frame-ancestors, HSTS, nosniff, referrer-policy) in `vercel.json`; check URL schemes (http/https only) for admin-entered links; stop keeping failed submissions in localStorage; send the "payment received" email only when actually paid; require currency NGN in the webhook fee check.
  - Full hunter JSON is in this session's transcript. If it's lost, re-run only the coverage critic + verifiers on these fingerprints instead of re-hunting.
- Remaining phases (follow `~/.claude/skills/security-audit/SKILL.md`, `HUNTING.md`, `VALIDATION-AND-REPORTING.md`):
  1. Record each hunter's `units[]` result into the ledger (status `covered`/`candidate`/`blocked`, `reviewed_paths`, checks into `local_checks`, fingerprints), then validate.
  2. One post-wave coverage critic (`research` agent). In `quick`, any units it adds become `deferred` with reason `quick_profile_final_critic`; no second hunter wave.
  3. One fresh verifier per candidate fingerprint; write `findings.json` (confirmed / needs_validation / rejected).
  4. Validate, then write `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`, and set `run_status` in `run-metadata.json`. The report must say this is partial (quick) coverage and that no target code was executed (no OS sandbox on this Windows host).
- **Validators only run under WSL** (Windows lacks the no-follow file protection they require):
  ```bash
  MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu -- sh /mnt/c/Users/User/.claude/jobs/1da7da9d/tmp/val.sh ledger
  MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu -- sh /mnt/c/Users/User/.claude/jobs/1da7da9d/tmp/val.sh findings
  ```
  If that helper script is gone (it lives in a temporary job folder), the equivalent is:
  ```bash
  MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu -- ~/.cache/sa-node/node-v22.12.0-linux-x64/bin/node \
    /mnt/c/Users/User/.claude/skills/security-audit/validate-coverage-ledger.cjs \
    /mnt/c/Users/User/security-audit-skill/bic-react/run-1/coverage-ledger.json
  ```
- Fix any **confirmed** findings in the repo on the branch, re-run the checks below, commit and push. `needs_validation` items go to the owner's list.

### 2. After the owner creates Supabase (they will share the details)
Follow `supabase/SETUP.md` exactly. With the project ref and database password:
```bash
PGHOST=db.<ref>.supabase.co PGPORT=5432 PGDATABASE=postgres PGUSER=postgres PGPASSWORD='<password>' npm run db:apply
```
Then set Vercel env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Production + Preview) and redeploy. The saved Vercel token in `~/.bashrc` is **invalid**; ask the owner for a new one or have them set the vars in the dashboard. Note: the local `.env` already points at an older Supabase project (`zvbf…`, has an empty `events` table). Use whichever project the owner names; the migrations work on both.

### 3. Waiting on the club
- Real articles for the Blog
- Photos and details for past events
- WhatsApp group invite links per sector (`src/lib/sectors.js`)
- Whether BIC won the AVA trading competition (keep it off the site until confirmed)
- Original full-size 2026 event photos (current files are 543px wide)
- A cleaner logo (optional; club decision)
- A domain (`babcockinvestorsclub.org` does not resolve). When live, set `VITE_SITE_URL` in Vercel; canonical, sitemap and robots follow automatically.

## Acceptance Criteria
- [ ] `npm run build` passes
- [ ] `npm run test:db` passes (28 checks)
- [ ] No visible em/en-dashes, "₦5,000", bare "50+", Bamboo, AVA, "Demo mode", `babcockinvestorsclub.org`, placeholder names, or gold colour on any public page
- [ ] No horizontal scroll at 390px and 1440px on Home, About, Membership, Events, Blog, Partners, Contact
- [ ] Every button readable on its background (no navy-on-navy)
- [ ] Forms show the WhatsApp/email notice while Supabase is not configured
- [ ] Security audit run-1 reaches a terminal state (validators pass, or `run_status: "incomplete"` with the reason disclosed)
- [ ] `design-reviewer` passes on any UI change

## Validation Commands (RUN BEFORE DELIVERY)
```bash
cd C:/Users/User/Projects/bic-website/bic-react
npm run build
npm run test:db
# Rendered-page check (serves dist/ on :4175, screenshots + banned-content scan):
node C:/Users/User/.claude/jobs/1da7da9d/tmp/check2.cjs
```
If `check2.cjs` is gone, the equivalent: serve `dist/` locally, open each page at 1440px and 390px, and search the rendered text for the banned items in the acceptance list. **Note:** a local build reads `.env`, which has Supabase vars, so forms appear locally. To see what production shows, build with them blank:
`VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npm run build`.

## Context from Main Thread
- Machine is low on RAM (~1 GB free) and C: is ~95% full. Background servers get killed; prefer short foreground checks. Don't run the full local Supabase stack in Docker.
- In Git Bash, prefix `wsl.exe` calls with `MSYS_NO_PATHCONV=1`, and don't pass bare `/` as a script argument.
- Long heredocs with mixed quotes break in this shell; write scripts to files with the Write tool and run them.
- `lessons/LOG.md` records the non-obvious lessons; append to it.
- Commit as `Ayoolaxrp <awodeyiayoola@gmail.com>` (already set in this repo's git config) and end messages with the Co-Authored-By line used in recent commits.
- Push only to `redesign/apple-restraint`.

## Post-Delivery
After Freebuff delivers, the main thread runs:
```
/freebuff-sync validate
```
If validation passes → ready for the owner to approve merging into `main`.
If validation fails → back to Freebuff with the fix list.
