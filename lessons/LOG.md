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
- **Dead domain in canonical.** babcockinvestorsclub.org does not resolve. All
  absolute URLs come from `VITE_SITE_URL` (vite.config.js); set it on the host when
  the domain is live. robots.txt and sitemap.xml are generated at build time.
- **Photos.** Most 2026 event photos are 543px wide; only use them small. Ask the
  club for originals.
