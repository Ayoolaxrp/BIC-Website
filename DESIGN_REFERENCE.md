# Premium Web Design Reference — 3D Scroll, Mouse Tracking & Motion

> **Reusable design reference.** Consult this whenever premium website design,
> redesign, UI/UX enhancement, or interactive frontend work is requested.
> These techniques are **enhancement layers, not the foundation** of a website.

---

## 1. Core principle

> **Never use an effect simply because it looks impressive.**
> Use the effect only when it improves:
> - visual storytelling
> - hierarchy
> - product understanding
> - perceived quality
> - interaction
> - conversion

## 2. Decision framework

Apply this before adding any effect:

| If the section needs... | Consider... |
| --- | --- |
| visual storytelling | scroll-based effects |
| spatial depth | restrained 3D (perspective, parallax, layered movement) |
| cursor responsiveness | mouse tracking (spotlight, magnetic, cursor gradients) |
| *none of the above* | **do not use an effect** |

## 3. 3D SCROLL — restrained depth

- Document restrained 3D depth, perspective, parallax, layered movement, object
  rotation, and scroll-driven spatial effects.
- **Prioritize subtle depth over gimmicky effects.**
- Guidelines:
  - Small, bounded transforms (e.g. 3–15° rotation, 10–60px parallax).
  - Use `useScroll`/`useTransform` (framer-motion) mapped to scroll progress — smooth, GPU-friendly.
  - Layer content in z-space: background orbs move slower, content moves at 1×, foreground faster.
  - Never make whole-page or full-section movement that causes motion sickness.

## 4. MOUSE TRACKING — cursor-responsive interactions

Document cursor-responsive interactions such as:
- subtle element movement
- spotlight effects
- magnetic buttons
- image/object parallax
- cursor-following gradients
- hover-based depth

### Guidelines
- **Prioritize usability and performance.**
- Keep transforms small and springy (spring configs: stiffness ~250, damping ~20).
- Use motion values + `useSpring` — avoid re-rendering React on every mousemove.
- **Disable hover-dependent effects on touch devices** (`pointer: coarse` check) — mobile must never depend on hover.
- Always `will-change: transform` on animated elements; avoid animating `top/left` or `box-shadow` directly at scale.
- Spotlight/glare layers must be `pointer-events: none`.

## 5. Avoid these anti-patterns

- ❌ excessive parallax
- ❌ motion sickness (large/whole-screen movement)
- ❌ distracting cursor effects
- ❌ slow animations
- ❌ excessive GPU usage
- ❌ inaccessible interactions
- ❌ mobile experiences that depend on hover

## 6. Implementation notes (this project — BIC site)

Current interactive layers (all restrained, all GPU-friendly, touch-safe):

| Component | Technique | Usage |
| --- | --- | --- |
| `TiltCard.jsx` | hover 3D tilt + glare + scale | cards across Home/About/Blog/Sponsorship |
| `MagneticButton.jsx` | cursor-attracted buttons | primary CTAs |
| `SpotlightCard.jsx` | cursor-following radial spotlight | hero + feature cards |
| Home hero | scroll parallax (orbs + content), cursor-following gradient | storytelling + depth |
| `FadeIn.jsx` | scroll-reveal (fade + slide + perspective pop) | section transitions |
| App routes | page transitions (AnimatePresence) | navigation |

### Rules applied here
1. **Motion is always on — deliberately.** The club owner requested NO user-facing
   motion toggle and full effects. To keep this accessible, every effect is
   small and bounded (max ~8px magnetic travel, 3–12° tilt, 0.3s transitions),
   so it never causes discomfort even at full intensity.
2. Hover effects are **progressive enhancement** — every interaction still works
   via keyboard/click without the effect, and pointer-based effects are disabled
   on touch devices (`pointer: coarse`).
3. Transforms only (`translate/rotate/scale/opacity`), never layout properties.
4. `pointer-events: none` on all decorative layers.
5. No element ever exceeds the viewport horizontally (verified: 512px–1440px).

## 7. Checklist before shipping an effect

- [ ] Does it serve storytelling, hierarchy, understanding, quality, interaction, or conversion?
- [ ] Is it subtle? (small amplitude, bounded)
- [ ] Is it performant? (transform/opacity only, springs not re-renders)
- [ ] Does it work without hover (keyboard/touch)?
- [ ] Motion policy agreed: always-on (no toggle) vs honoring `prefers-reduced-motion`.
      If always-on, effects must stay small/bounded to remain comfortable.
- [ ] No overlap/clipping regressions at 375px, 768px, 1440px?
- [ ] No horizontal overflow at any width (decorative layers clipped by `overflow: hidden`).
