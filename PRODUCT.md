# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Babcock University students (100–500 level, any department) curious about investing — the site recruits them into the club and its sector communities. Registration is gated on an official `@babcock.edu.ng` email. When design decisions trade off, students win; sponsor-facing content serves that mission by establishing credibility. *(Confirmed with owner.)*

**Secondary:** Organizations and financial-services partners (e.g. Fundbox Financial Services) evaluating BIC for sponsorship and partnership programs.

**Operational users:** Current members (Member Portal: profile, membership status, resources, community groups, event RSVPs) and the executive team (Admin Console: members by sector, events, articles, resources, newsletter posts, submissions).

## Product Purpose

The public face and operating hub of the Babcock Investors Club (BIC) — a student-led investment community at Babcock University, Nigeria. It introduces the club ("Empowering students through financial education."), drives membership applications (₦5,000 fee), publishes events with RSVP (seminars, stock-pitch competitions, speaker sessions), showcases sector communities, and sells sponsorship partnerships. Success = membership applications, event RSVPs, and active sector communities.

## Positioning

A premier student-led community focused on investment awareness, networking, leadership, and growth opportunities — structured where most student clubs are loose: five named investment sectors (Crypto & Digital Assets, Forex & Trading, Securities & Equities on the Nigerian Exchange, Real Estate, General), each led by an executive chairperson with its own chat community.

## Operating Context

- Nigerian university context: ₦ pricing, Nigerian Exchange references, WhatsApp as the community-channel norm (sector group invite links are placeholders pending real links from the club — see Capabilities).
- Membership year/fee: ₦5,000 (what it covers is stated in the membership FAQ).
- Event programming is seasonal and named (e.g. "BIC Welcome Seminar: The Next Chapter", "Stock Pitch Competition 2.0", "University Bamboo League") — the photo wall and event history are real club memory.
- Live at https://www.babcockinvestorsclub.com (also bic-react.vercel.app; Vercel, auto-deploy from `main`; repo `Ayoolaxrp/BIC-Website`). The router also supports GitHub-Pages-style sub-path hosting.

## Capabilities and Constraints

- **Public pages:** Home, About, Events (+ RSVP), Membership (application + FAQ), Sponsorship (partners, tiers, inquiry form), Blog/Articles, Contact, Legal, 404.
- **Authenticated:** Member Portal and Admin Console (role-gated).
- **Stack (existing, not a choice to relitigate):** React 19 + Vite + TypeScript, framer-motion, react-router 7; Supabase for auth/database/storage; Paystack for payments; self-hosted variable fonts.
- **Open items (do not treat as done):** sector WhatsApp group links are `REPLACE_*` placeholders awaiting real invite links; the Supabase `payment_status` column migration (`supabase/migrations`) is documented but unapplied.

## Brand Commitments

- **Name:** "Babcock Investors Club" / "BIC".
- **University brand bound:** the club's visual identity operates under Babcock University's official brand rules — where the site's identity and university guidelines conflict, university rules win. *(Confirmed with owner.)*
- **Voice:** aspirational, keynote-confident, editorial — "Empowering students through financial education."
- **Contact channels (verbatim):** babcockinvestorsclub@gmail.com · instagram.com/babcock_investors_club · linkedin.com/company/babcock-investors-club/

## Evidence on Hand

- Real event photography (9-photo wall: Opening Address, Speaker Session, Guest Speaker, audience shots) in `src/assets/` and `public/`.
- Real partner names and testimonials on the Sponsorship page — **real committed relationships; preserve verbatim** *(confirmed with owner; never paraphrase, replace, or invent partners)*.
- Real event names and club history on About/Events.
- **Absence to respect:** no press coverage, awards, or member-count claims beyond what the pages already state — do not fabricate any.

## Product Principles

1. **Students first.** Every trade-off resolves toward the prospective member's journey; sponsors are convinced by that authenticity, not separate polish.
2. **University within.** The club brands itself inside Babcock University's identity rules, not apart from them.
3. **Real relationships are sacred.** Partner names, event history, fees, and photography are facts — design around them, never through them.
4. **From curiosity to belonging.** The site's job is moving a student from first visit to sector community membership.
5. **Accessible by default.** A public university audience on predominantly mobile connections: AA contrast, reduced-motion respect, touch-sized targets.

## Accessibility & Inclusion

Working target: WCAG 2.2 AA (AA text contrast shipped, 3:1 focus indicators, 44px touch targets, 16px+ inputs to prevent iOS zoom). `prefers-reduced-motion` is honored app-wide (React `MotionConfig` + CSS kill-switches). Mobile-first is a product constraint, not a nice-to-have: the audience is overwhelmingly phone-connected.
