# FREEBUFF HANDOFF: BIC website (Babcock Investors Club)

## Project Context
- **Type**: Marketing site (Vite + React 19 SPA) with a Supabase back end (forms, member accounts, admin console) and Paystack payments
- **Repo**: `C:\Users\User\Projects\bic-website\bic-react` → GitHub `Ayoolaxrp/BIC-Website`
- **Branch**: merged into `main` via PR #1 on 2026-10-09 (`2ff884a`). Work on `main` (or a new branch + PR) from now on.
- **Live site**: https://www.babcockinvestorsclub.com (apex redirects to www; also bic-react.vercel.app). The redesign is live.
- **Preview of this branch**: Vercel builds it automatically on push (needs a Vercel login to view)
- **Request**: (1) remove everything that looks like AI slop, using the Apple design skill; (2) apply the club's WhatsApp feedback and the 2026/27 calendar; (3) write all Supabase migrations so the owner can create the project and deploy; (4) run the Cloudflare security audit skill so it is deployment-ready.
- **Date**: 2026-10-09

## Status at handoff

| Area | State |
| --- | --- |
| Apple-style redesign (all pages) | Done, committed `4349ba7` |
| Club feedback + calendar | Done, committed `70253d2` |
| Supabase migrations + runbook | Done and tested, committed `854f612` |
| Cloudflare security audit | Done (quick profile): 0 confirmed, 4 leads, all 4 fixed in source |
| Speed, forms, brand, legal | Done 2026-10-09 (PR #2): content renders instantly, SDK/animation libs off public pages, aligned forms + interest chips, blue brand hero, `/privacy` and `/terms` |
| Merge to `main` / go live | Done 2026-10-09 (PR #1). Live site tested: all pages 200, security headers sent, live Contact form saves to Supabase |
| Supabase project | Created by owner (ref in `.env`, region eu-west-1). All 6 migrations applied and verified 2026-10-09; Vercel env vars set (Production/Preview/Development) |

## Required Skills (IN ORDER)
1. `apple-design` (installed at `~/.claude/skills/apple-design`, from github.com/emilkowalski/skills). **Owner rule (Oct 2026): use ONLY this skill for design on this project.**
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
   - One accent: **BIC blue** from the club posters. `--brand #1a73e8` for buttons, `--brand-ink #1259c3` for text on white, `--brand-light #6aa8ff` on navy. Green only for success. The club rejected gold.
   - System font first (SF Pro on Apple), Inter fallback. Tracking tightens as size grows.
   - Shapes: controls are pills, surfaces 18px, inputs 12px.
   - No eyebrow labels, no two-tone headlines, **no em-dashes or en-dashes in visible text**, no placeholder names (Jane Doe/Acme), no hover lifts or glows, no countdowns.
   - Press feedback `scale(0.97)` in 100ms; reveals decelerate and never overshoot; honour reduced motion/transparency/contrast.
   - New dark (navy) containers must be added to the `.surface-dark` list in `src/styles/system.css`, otherwise buttons render navy-on-navy.
   - Edit `src/styles/system.css`; do not append new override layers to `src/index.css` (that is what made the old site look AI-built; see `lessons/LOG.md`).
4. **Honest forms.** When Supabase is not configured, forms render `<OfflineNotice>` (WhatsApp + email) instead of pretending to save. A failed save must show as failed. Do not reintroduce "saved on this device" success messages.
5. **Never** commit `.env`, or put the Supabase service_role key or Paystack secret key in the frontend or Vercel. Pushing to `main` deploys production: run the checks first.
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

### 1. Cloudflare security audit, run-1: DONE
- Report: `C:\Users\User\security-audit-skill\bic-react\run-1\REPORT.md` (plus `findings.json`, `NEEDS-VALIDATION.md`, `coverage-ledger.json`). Outside the repo on purpose.
- Result: **0 confirmed vulnerabilities**, 4 `needs_validation` leads, run status `complete` (quick profile = partial pass by definition). 12 of 16 agent calls used. Both validators pass (run under WSL; Windows lacks the file protection they need).
- All 4 leads are now fixed in source, so none depends on a dashboard setting:
  1. Payment reference reuse → unique index on `member_applications.paystack_ref` and payer-email match in the paid-status trigger (`supabase/migrations/20261009000600_audit_hardening.sql`).
  2. Unverified-email reads → own-row RLS now also requires a confirmed email (`email_is_confirmed()`), plus `[auth.email] enable_confirmations = true` in `supabase/config.toml`.
  3. Club sender as a relay → at most one confirmation email per address per hour (`private.email_log`), fixed RSVP subject (no echoed text).
  4. `send-email` fail-open → refuses all requests when `WEBHOOK_SECRET` is empty; constant-time compare.
  - Also: security headers in `vercel.json`/`netlify.toml`, NGN currency check in the webhook, honest "payment not confirmed yet" email wording, server-set `created_at`.
- `npm run test:db` now runs 33 checks (fresh database and upgrade from the old schema).
- Owner checks still worth doing after setup (from the report): `supabase secrets list` shows a non-empty `WEBHOOK_SECRET`; Auth "Confirm email" on.
- Not done: a full Content-Security-Policy (only `frame-ancestors` is set). Adding `script-src`/`connect-src` needs a live test with Paystack and Supabase so checkout isn't broken.

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
- [ ] `npm run test:db` passes (33 checks)
- [ ] No visible em/en-dashes, "₦5,000", bare "50+", Bamboo, AVA, "Demo mode", `babcockinvestorsclub.org`, placeholder names, or gold colour on any public page
- [ ] No horizontal scroll at 390px and 1440px on Home, About, Membership, Events, Blog, Partners, Contact
- [ ] Every button readable on its background (no navy-on-navy)
- [ ] Forms show the WhatsApp/email notice while Supabase is not configured
- [x] Security audit run-1 complete; validators pass; leads fixed
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
- `main` deploys production on every push. Run the validation commands before pushing.
- Supabase Auth verified 2026-10-09 via the Management API (`SUPABASE_ACCESS_TOKEN` in `.env`): Site URL is the www domain; redirect list has www, apex, bic-react.vercel.app and localhost; Confirm email and Secure email change on.
- Google sign-in is hidden unless `VITE_GOOGLE_AUTH=true` (provider is off in Supabase).

## Post-Delivery
After Freebuff delivers, the main thread runs:
```
/freebuff-sync validate
```
If validation passes → ready for the owner to approve merging into `main`.
If validation fails → back to Freebuff with the fix list.
