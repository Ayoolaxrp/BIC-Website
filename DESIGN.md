---
name: Babcock Investors Club
description: Student investment club at Babcock University. Calm, confident, real.
colors:
  navy: "#0a1931"
  navy-mid: "#15305b"
  gold: "#c9a54a"
  gold-light: "#dfc277"
  gold-ink: "#7a5c12"
  green: "#14593f"
  green-tint: "#e8f1ec"
  white: "#ffffff"
  off-white: "#f5f5f7"
  gray-500: "#5b6273"
  gray-700: "#3a4052"
  black: "#070b14"
typography:
  family: "-apple-system / SF Pro, then Inter (self-hosted), then Segoe UI / Roboto"
  display: "clamp(2.5rem, 5.4vw, 4.25rem) / 1.05 / -0.032em / 700"
  title: "clamp(1.9rem, 3.4vw, 2.75rem) / 1.1 / -0.024em / 700"
  headline: "1.1875rem / 1.3 / -0.012em / 600"
  body: "1.0625rem / 1.55 / -0.003em / 400"
shape:
  control: "999px (buttons, chips, nav pills)"
  surface: "18px (cards, images, panels)"
  input: "12px"
---

# BIC design system

Source of truth: `src/styles/system.css` (loaded after `src/index.css`) and the
tokens in `:root` at the top of `src/index.css`. Nav lives in
`src/components/Navbar.css`. Built against the **apple-design** skill
(emilkowalski/skills) and checked with **design-taste-frontend**.

## Rules

- **Colour.** Navy, white and black carry the page. Two accents from the brief, each
  with one job: **gold lives on navy** (primary button on dark, brand moments),
  **deep green lives on white** (links, small labels, success). Any navy surface
  (`.surface-dark`, `.page-hero`, `.footer`, `.cta-section`, `.navbar`) re-points the
  accent variables to gold and inverts buttons automatically.
- **Type.** System face first, so Apple devices get SF Pro. Tracking tightens as
  size grows. Emphasis comes from weight, never from colouring half a headline.
  No mono except for machine values.
- **Shape.** Pills for controls, 18px for surfaces, 12px for inputs. Nothing else.
- **Surfaces.** Hairline border, flat at rest and on hover. No hover lifts, no
  shadows for decoration, no tilt or spotlight effects.
- **Controls.** One button system. Press feedback is instant (`scale(0.97)`, 100ms);
  hover only changes colour. One label per intent: *Join BIC*, *See events*,
  *Partner with BIC*, *Download the deck*.
- **Motion.** Reveals are short, decelerating and never overshoot. Page changes
  cross-fade in 200ms with no exit wait. Reduced motion turns travel into a plain
  fade. Reduced transparency and high contrast make the nav solid.
- **Content.** Real club photography only, nothing laid over images. Numbers only
  when the club has confirmed them (50+ members, 4 sectors, 7 committees, ₦5,000).
  No eyebrow labels above headlines, no em-dashes, no placeholder names.

## Homepage structure

Hero (one headline, one line, two actions, one photo) → next event strip →
sectors list → club-life gallery → joining steps with facts → partner tile.
