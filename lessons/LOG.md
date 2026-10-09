# Lessons log

## 2026-10-09: redesign/apple-restraint

- **Stacked design passes made it look AI-built.** index.css had four layers
  ("BIV-inspired", "Reticle structural", "Apple-skill improvement", "Premium
  refinement"), each overriding the last. Fix was deleting layers, not adding a
  fifth. New rules go in `src/styles/system.css`; edit that, don't append overrides.
- **Variable names lied.** `--gold` and `.gold` painted Tailwind sky-blue. Tokens are
  now real; legacy `--sky-*` names are aliases re-pointed per surface.
- **Navy-on-navy buttons.** A dark section without the dark-surface scope renders an
  invisible primary button. Add new dark containers to the `.surface-dark` list in
  system.css (or give them the `surface-dark` class).
- **Numbers drift.** Home said 150+, AUDIT said the club confirmed 50+. Only use
  confirmed figures; 13,000 "reach" was the university's population.
- **Club-authored copy is not ours to rewrite.** Vision and Mission on About are the
  club's words; only punctuation was touched.
- **Check the real domain before assuming one.** The site pointed at
  babcockinvestorsclub.org, which does not exist; the club owns
  babcockinvestorsclub.com (apex redirects to www; check Vercel → Domains). All
  absolute URLs come from `VITE_SITE_URL` (vite.config.js). robots.txt and sitemap.xml are generated at build time.
- **Photos.** Most 2026 event photos are 543px wide; only use them small. Ask the
  club for originals.

## 2026-10-09: security audit run-1 (Cloudflare security-audit skill)

- **Rows matched by email need a confirmed email.** Anyone can submit a form with
  any email, so "read own rows where email = JWT email" is only safe if the email
  is confirmed. Migration 0600 checks `auth.users.email_confirmed_at`.
- **Secrets must fail closed.** `send-email` compared a header to a secret that
  defaulted to `''`, so an empty header passed. Always guard `if (!SECRET) return 401`.
- **Public inserts that send email are a relay.** Throttle per address and never
  put submitted text in a subject line.
- **One payment, one application.** Payment references need a unique index and an
  email match, or one fee can mark many applications paid.
- The audit validators need POSIX no-follow I/O; on this Windows host run them with
  Node under WSL (`MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu -- ...`).
