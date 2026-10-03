---
name: Babcock Investors Club
description: Student-led investment community at Babcock University — keynote-stage confidence with ledger precision.
colors:
  midnight-navy: "#0a1931"
  navy-mid: "#15305b"
  navy-light: "#1f4277"
  signal-blue: "#0ea5e9"
  signal-blue-light: "#38bdf8"
  signal-blue-deep: "#0369a1"
  ember-green: "#10b981"
  ember-green-light: "#34d399"
  paper-white: "#ffffff"
  off-white: "#f5f6fa"
  gray-100: "#eef0f5"
  gray-300: "#b0b8cc"
  gray-500: "#55617e"
  gray-700: "#3a4460"
  ink-black: "#060c18"
  hairline: "rgba(6, 12, 24, 0.08)"
  hairline-strong: "rgba(6, 12, 24, 0.14)"
  focus: "#0369a1"
typography:
  display:
    fontFamily: "Space Grotesk Variable, Space Grotesk Fallback, Inter Variable, sans-serif"
    fontSize: "clamp(2.6rem, 5.2vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk Variable, Space Grotesk Fallback, Inter Variable, sans-serif"
    fontSize: "clamp(2.05rem, 3.4vw, 2.9rem)"
    fontWeight: 700
    lineHeight: 1.07
    letterSpacing: "-0.028em"
  title:
    fontFamily: "Space Grotesk Variable, Space Grotesk Fallback, Inter Variable, sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.35rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter Variable, Inter Fallback, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 700
    letterSpacing: "0.15em"
rounded:
  control: "10px"
  md: "12px"
  lg: "20px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
  space-8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.midnight-navy}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.navy-mid}"
  button-primary-dark:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.midnight-navy}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.midnight-navy}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  chip:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.midnight-navy}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  input:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.control}"
    padding: "13px 16px"
  card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
---

# Design System: Babcock Investors Club

## Overview

**Creative North Star: "The Keynote Ledger"**

BIC presents like an Apple keynote and keeps books like a trading desk. Every page opens on a photographic stage — real club events, never stock imagery — with a large Space Grotesk headline doing the talking. Beneath the stagecraft, the system is ruthlessly bookkept: one shared token scale for type and space, hairline rules instead of decoration, mono overlines like ledger folios, and a single Signal Blue that marks exactly where the visitor is meant to act. Nothing is centered, nothing bounces, nothing is decorated that could instead be structured.

The feel is **quiet confidence**: surfaces are flat, hairline-bordered and calm at rest, then spring to life only in response to the visitor — a card deepens its shadow, a chip settles on a hairline, a reveal cascades in with quint easing and a tight per-index stagger. Motion is bounded and decelerating (cubic-bezier(0.22, 1, 0.36, 1)); there is no overshoot, no bounce, no layout animation. Depth is earned by state, never applied as decoration.

Because the audience is Babcock University students on phones, the system is mobile-first and AA-accessible by construction: 44px touch floors, 16px+ inputs, contrast-checked text roles, and a global `prefers-reduced-motion` kill-switch over every effect.

**Key Characteristics:**
- Photographic keynote heroes with dark navy glass navigation
- One accent (Signal Blue) used sparingly — action and a single emphasized word
- Space Grotesk display over Inter body; mono uppercase overlines for structure
- Hairline borders, layered low-contrast shadows, 10–20px soft radius family
- Left-aligned editorial section headers; 22ch headline measure
- Scroll reveals with quint easing and ≤80ms stagger, fully reduced-motion-safe

## Colors

A deep navy institution carrying one decisive sky-blue signal, warmed by a single green for positive states, on white paper with cool grays.

### Primary
- **Signal Blue** (#0ea5e9): the only accent. Marks CTAs, links, active states, and — in headlines — the single emphasized word (`span` inside a title). Light variant #38bdf8 for dark-surface accents.
- **Signal Blue Deep** (#0369a1): the AA-on-white form of the accent for text and focus indicators (5.9:1). Use this whenever blue is *text*.

### Secondary
- **Ember Green** (#10b981, light #34d399): positive states only — success messages, confirmation, growth indicators. Never decorative.

### Neutral
- **Midnight Navy** (#0a1931): primary text, primary button fill, hero ink on dark. Mids #15305b/#1f4277 for hover and gradients-on-dark.
- **Ink Black** (#060c18): shadow tint and deepest surfaces.
- **Paper White** (#ffffff) / **Off-White** (#f5f6fa): page and inset surfaces.
- **Cool Grays** (#eef0f5 → #3a4460): body text uses gray-700 (AA), secondary text gray-500 (AA-darkened), hairlines gray-100/gray-300.
- **Hairlines**: `rgba(6,12,24,0.08)` default, `0.14` for input strokes.

### Named Rules
**The One Signal Rule.** Signal Blue is ≤10% of any screen. It marks action and emphasis; it is never a fill for large areas, never a decoration, never two different meanings on one page.

## Typography

**Display Font:** Space Grotesk Variable (300–700 axis; static 700 face + metric-matched Arial fallback via `size-adjust` so swaps never reflow)
**Body Font:** Inter Variable (100–900 axis, same fallback treatment)
**Label/Mono Font:** System mono stack (`ui-monospace, SFMono-Regular, Menlo, Consolas`)

**Character:** A geometric grotesk with ledger-like evenness presents the club as composed and modern; Inter's neutrality keeps long student-facing copy invisible in the best way; the mono stack reads as structural annotation, not branding.

### Hierarchy
- **Display** (700, clamp(2.6rem→3.75rem), 1.1, −0.02em): page heroes; the homepage hero runs larger (~5rem cap) over photography. Never exceeds the font's true 700 axis — no faux weights.
- **Headline** (700, clamp(2.05rem→2.9rem), 1.07, −0.028em): section titles, max-width 22ch, left-aligned, one optional blue `span`.
- **Title** (700, clamp(1.6rem→2.35rem), 1.1): sub-section and card-group headings.
- **Body** (400, 1rem/1.6): Inter, gray-700; measure ≤70ch.
- **Label** (700, 0.78rem, 0.15em, UPPERCASE): mono section overlines (`.section-label`), footer folios, structural annotations.

### Named Rules
**The Solid Ink Rule.** Headings are solid Midnight Navy (or white on dark photography). No gradient text, no background-clip tricks, no weights the variable axis doesn't ship.

## Layout

A single centered container — max 1200px with 24px gutters — on a generous vertical rhythm: sections are 72px tall (60px for compact bands). Type and space come from one shared scale (`--text-display`→`--text-caption`; `--space-1` 4px → `--space-8` 64px) used by every page; page-specific values are exceptions to justify, not habits to repeat.

Responsive behavior collapses in a fixed ladder (max-width 1024 / 820 / 768 / 640 / 600 / 560 / 480): grids stack to single-column at ≤820px, the photo wall drops to 2 columns with 116px row floors at ≤480px, and the event ledger rows stack full-bleed on phones. Every override is declared *after* the base blocks — cascade order is a stated invariant, since later same-specificity rules shadow earlier ones.

**Named Rule:** **The Override-Bottom Rule.** Mobile overrides live at the end of the stylesheet, after every base rule — a base rule appended below the responsive layer silently kills its override.

## Elevation & Depth

Depth is layered, navy-tinted, and low-contrast — ambient atmosphere rather than hard drop shadows. Surfaces are flat at rest behind 1px hairlines; shadow appears as a *response* to state.

### Shadow Vocabulary
- **Ambient rest** (`--shadow-card`: `0 1px 2px rgba(6,12,24,0.05), 0 8px 24px rgba(6,12,24,0.07)`): cards at rest.
- **State lift** (`--shadow-card-hover`: `0 2px 4px rgba(6,12,24,0.06), 0 16px 40px rgba(6,12,24,0.13)`): cards on hover, with a 3–5px rise.
- **Small / medium / large** (`--shadow-sm/md/lg`): controls, raised panels, overlays respectively — all layered two-tone navy tints.
- **Dark-surface overlay** (`0 12px 40px rgba(0,0,0,0.35)`): elements floating over hero photography.
- **Focus rings**: `0 0 0 3.5px rgba(10,25,49,0.08)` on inputs (with a navy border shift) and `0 0 0 4px rgba(14,165,233,0.15)` on accent elements — 3:1-visible per WCAG 2.2.

### Named Rules
**The Earned Lift Rule.** A surface at rest shows a hairline and (at most) ambient shadow. Shadow and lift only appear in response to hover, focus, or open state — and the primary button lifts *nothing*: it changes fill only.

## Shapes

Soft, single-family rounding: 10px on controls (inputs, chips, small buttons), 12px on standard surfaces, 20px on cards and large panels, 999px pills on every CTA. Structural separation is always a 1px hairline in translucent ink — never a colored border thicker than 1px, never a side-tab accent. Photo tiles and event images clip to the surface radius via `overflow: hidden`.

### Named Rules
**The Hairline Rule.** If a border is doing structural work, it is `1px` translucent ink. Colored borders don't exist above 1px, and accent-colored "tabs" don't exist at all.

## Components

### Buttons
- **Shape:** full pill (999px), 14px×32px padding, 0.95rem/600 Inter, 0.02em tracking.
- **Primary:** Midnight Navy fill, white text, 1px ambient shadow. Hover: Navy-Mid fill and a deeper shadow — **no transform**. On dark surfaces (hero, CTA band, pipeline) the primary inverts to white fill with navy text.
- **Outline:** transparent, 1px `rgba(6,12,24,0.18)` border, navy text. Hover: 4% ink wash, border darkens.
- **Focus:** visible ring (`0 0 0 4px rgba(14,165,233,0.15)`).
- **Motion:** all button transitions ride `--ease-out-quint` at 0.25s.

### Chips
- **Style:** off-white fill, 1px `rgba(10,25,49,0.12)` hairline, navy 0.9rem/600 text, 12px×18px padding, 10px radius.
- **State:** static informational tags; interactive chips get the hover wash, never a filled accent.

### Cards / Containers
- **Corner Style:** 20px (`--radius-lg`).
- **Background:** Paper White on Off-White bands; Off-White inset panels on white.
- **Shadow Strategy:** ambient at rest → state lift on hover (see Elevation).
- **Border:** 1px `rgba(10,25,49,0.07)`.
- **Internal Padding:** 24–32px (`--space-5`/`--space-6`).

### Inputs / Fields
- **Style:** white fill, 1px `--hairline-strong` stroke, 10px radius, 13px×16px padding, 16px+ font (no iOS zoom).
- **Focus:** border shifts to Midnight Navy + 3.5px navy ring; error state adds a red 3px ring (`rgba(239,68,68,0.12)`).
- **Disabled/labels:** labels always associated (app-level a11y hook), never placeholder-as-label.

### Navigation
- **Desktop:** transparent over hero photography; on scroll it becomes a glass bar — `rgba(10,22,40,0.72)` with 20px blur + 180% saturation — links as pill chips (44px touch floor).
- **Mobile:** 44px hamburger opens a full-screen glass overlay (48px link rows, body scroll locked).
- **Active state:** pill chip fill; hover is a subtle wash, never underline-only.

### Signature: The Sec-Head Header System
Every section opens left-aligned: a mono uppercase overline (`.section-label`) → Space Grotesk headline clamped to 22ch with at most one Signal Blue `span` → a 560px-max gray-500 sub → an optional mono uppercase arrow-link (44px pill chip on touch). The homepage hero adds a photographic backdrop, floating orbs as parallax vehicles, and a one-time spring entrance.

### Signature: The Photo Wall
A 3-row grid of real event photography (216/168/168px rows, 2-col with 116px floors on phones), mono uppercase tag chips, cascade reveal on scroll.

## Do's and Don'ts

### Do:
- **Do** open every section with the sec-head system: mono overline → 22ch Space Grotesk title → 560px sub, left-aligned.
- **Do** use exactly one Signal Blue emphasis per headline (the `span`), and reserve Signal Blue Deep (#0369a1) for blue *text* to hold AA.
- **Do** ride all state motion on `--ease-out-quint` (cubic-bezier(0.22,1,0.36,1)), 0.25–0.3s, transform/opacity only.
- **Do** reveal content with the IntersectionObserver class system (`.rg`/`.rg-in`, ≤80ms per-index stagger) and gate every effect behind `prefers-reduced-motion`.
- **Do** use real club photography and real names — partners, events, and fees are facts (see PRODUCT.md).
- **Do** keep interactive targets ≥44px and inputs ≥16px.

### Don't:
- **Don't** use gradient text, side-tab accent borders, or decorative grid overlays — all three are banned patterns this system deliberately removed.
- **Don't** animate layout properties (width, max-height, padding): bars scale via `transform: scaleX`, accordions via `grid-template-rows: 0fr ↔ 1fr`.
- **Don't** add bounce/overshoot easings; real objects decelerate.
- **Don't** center section headers or let headlines exceed the 22ch measure without cause.
- **Don't** use Inter for display type or invent weights above 700 (the axis cap).
- **Don't** append base rules below the responsive override layer.
