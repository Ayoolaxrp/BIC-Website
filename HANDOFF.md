# HANDOFF: read this first

You are picking up the BIC (Babcock Investors Club) website mid-task. Read this file, then `FREEBUFF_HANDOFF.md` (rules, verified facts, validation commands), then `DESIGN.md`. Updated 2026-10-09.

## The ask (owner's words)
> "finish up and make sure the brag launch video is done when the site is worthy of a brag launch video design wise make sure the design is top tier"

So: (1) finish the inner-page design polish, (2) ship it, (3) make the brag launch video from the polished live site.

## Where things stand
- Repo: this folder → GitHub `Ayoolaxrp/BIC-Website`. Live: https://www.babcockinvestorsclub.com (push to `main` = production deploy via Vercel project `bic-react`).
- Everything up to PR #2 is merged and live-tested (forms, speed, brand blue, `/privacy`, `/terms`).
- **Uncommitted on local `main` (this round, not yet pushed):**
  - `src/components/PageHero.jsx`: new `image` + `imagePosition` props (full-bleed club photo under a navy scrim).
  - `src/pages/About.jsx`: rewritten (photo hero, story + photo, Vision/Mission as statements, objectives list, plain values, navy numbers strip, team).
  - `src/pages/Membership.jsx`: honest hero/Seo copy, numbered steps without icons (`.h-steps`), truthful benefits list (`.mb-benefits`), Paystack badge only when `paystackConfigured`, two-column FAQ (`.mb-faq`).
  - `src/pages/Events.jsx`: hero photo `bic-2025-10.webp`. `src/pages/Sponsorship.jsx`: hero photo `bic-seminar-panel.webp`.
  - `src/pages/Blog.jsx`: empty state now `section > container` (was 32px too wide).
  - `src/styles/system.css`: new blocks at the end: `.page-hero-photo`/`.ph-*`, `.ab-*`, `.mb-*`.
  - `npm run build` passes with these changes. Screenshots were being taken; **visual check not finished.**

## Visual check findings (screenshots of the local build, 2026-10-09)
- Membership desktop: hero photo, benefits list and two-column FAQ look right. **Bug:** the "Three steps to joining" row sits directly on top of "What members get" with no gap. Add spacing (e.g. `margin-bottom: var(--section-y)` on `.mb-steps`, or put the steps in their own `<section>`).
- About mobile (390px): layout stacks correctly; the hero looks short and there seems to be extra space above the story photo. Look at it at full size before deciding.
- Events, Partners and Blog screenshots were captured but not reviewed yet.

## Next steps, in order
1. Visually check About, Membership, Events, Partners (`/sponsorship`), Blog at 1440px and 390px (serve `dist/`, full-page screenshots). Look for: hero text legible over photo, no horizontal scroll, nothing misaligned, buttons readable on navy.
2. Run the checks in `FREEBUFF_HANDOFF.md` → "Validation Commands" (`npm run build`, `npm run test:db`, banned-content scan).
3. Create a branch (e.g. `polish-inner-pages`), commit, push, open a PR, wait for the Vercel preview, merge, then re-test the live site (all pages 200, no console errors).
4. **Brag launch video:** use the `brag` skill (`~/.claude/skills/brag`; on Opus 5.5 it switches to `~/.claude/skills/brag-slim/slim.md`). Output goes in `brag-output/`: `brag-plan.md`, `brag.mp4` (15–25 s, 1920x1080, 30 fps, hook in the first 2 s), `brag.jpg` (frame 0), `share-copy.txt`. Use **real site UI only** and **only the verified facts** listed in `FREEBUFF_HANDOFF.md`. Check that ffmpeg is installed first.
5. Update `FREEBUFF_HANDOFF.md` and `lessons/LOG.md`, and delete or refresh this file.

## Hard rules (short version)
- Design: **only** the apple-design skill (`~/.claude/skills/apple-design`). One accent: BIC blue `--brand #1a73e8`. No gold, no eyebrow labels, no em/en-dashes in visible text, no icon-card grids, no hover glows.
- No fake or unverified content: no invented stats, testimonials, events or partners. Benefits must be things the club actually runs.
- Never commit `.env`, never print its values, never put the Supabase service_role key or the Paystack secret anywhere in the frontend or Vercel.
- Edit `src/styles/system.css`, not `src/index.css`.
- The machine has little RAM and disk (C: about 95% full). Prefer short foreground commands; retry network calls on `EAI_AGAIN` DNS errors; stop a retry loop after 2 failures.
