# Voranta Photography & Illustration System

**Date:** 2026-06-11
**Status:** Approved (all four system evolutions accepted by owner)
**Authors:** visual-designer + design-reviewer (synthesized)
**Scope:** A deliberate, repeatable system for using photography and illustration across voranta.co to fill currently-empty space with signal, not decoration.

---

## 0. Repo note (stale CLAUDE.md)

CLAUDE.md describes the site as a single `index.html`. It is now multi-page:
`index.html`, `about.html`, `aipq.html`, `assessment.html`, `style-guide.html`, with
`globals.css` (locked tokens) and `styles.css` (live styles). CLAUDE.md should be
updated separately; this spec assumes the multi-page reality.

---

## 1. The governing principle

**Photography = trust moments** (real-world, human, physical artifacts).
**Illustration = making abstract mechanisms visible.**

Every image must pass: *"Would a research analyst or strategy consultant feel this
image dignifies or cheapens the material?"* If it is decoration for its own sake, it
does not ship.

Both tracks live inside the locked palette — cool-cream paper (`#ECF1ED`), ink
(`#0A0908`), single cyan accent (`#0891B2`) — and use the **one locked image frame**
already in `styles.css`.

---

## 2. The locked image frame (already in the codebase)

This is the only image container treatment on the site. New placements inherit it; they
do not invent new framing.

```css
/* container */
border-radius: 12px;   /* --radius-lg, within the ≤16px cap */
overflow: hidden;
position: relative;

/* inset hairline border — never a shadow */
::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 0.5px solid rgba(10, 9, 8, 0.1);
  border-radius: 12px;
  pointer-events: none;
}
```

Currently applied to `.hero-visual`, `.about-image`, `.founder-photo`.

**Hard rules (from the locked design system):**
- No `box-shadow` / `filter: drop-shadow()` on images — the hairline border is the only edge treatment.
- No gradient scrims or tint overlays on images (a translucent dark layer over a photo *is* a banned gradient). Text sits on an image only via a solid, opaque ink panel.
- No `border-radius` above 16px except the approved `.img-avatar` exception (§5.2).
- No second accent hue. Naturally-occurring cyan/cool-blue *inside a photo* is fine; warm amber, green, magenta, purple, AI-violet are violations.
- No emoji / AI-sparkle iconography — extends fully to illustration.
- Diagram/caption type uses Geist Mono only; annotations use Geist.

---

## 3. Track A — Photography

**Use for:** genuine human or physical-world trust moments only. Never to decorate an
abstract-concept section.

**Subject matter:** architecture / structure seen from a new angle, and printed-research
artifacts (bound documents, fine-rule graph paper with annotation, research volumes,
data printouts). Never people-at-laptops, handshakes, teams-at-whiteboards, glowing-data
abstractions.

**Style:** cool, quiet, considered — a well-funded research library, not a cinematic
stock shot. Cool-desaturated so the photo "lives in the same world as the paper":
desaturate warm tones, push shadows cooler, no added grain, medium contrast.

**Established precedent:** `voranta-hero.webp` (cyan glass facade) and
`voranta-about.webp` (structural glass-ceiling interior) set the bar — real-world,
geometric, naturally on-palette, no clichés.

**Delivery:** `.webp` with explicit `width`/`height` to prevent layout shift.
Semantic images need real `alt` text (the two current images use `alt="" aria-hidden`).

---

## 4. Track B — Illustration

**Use for:** making an abstract mechanism legible — answering *"what does this actually
do?"* for a reader who hasn't clicked through.

**Format:** **inline SVG only** — never external `.svg` via `<img>`. Reasons: the
no-build-step single-file architecture, and so Geist Mono renders via CSS rather than
embedded font data.

**Vocabulary (extends what already exists):** the dot-grid (`#gap-stat-dots`), the AIPQ
radar SVG, the 2×2 quadrant matrix, the 70% counter. New illustration introduces **no
new visual language**.

- Monoline strokes, 1–1.5px (matches `.sc-radar-fill` stroke).
- Geometric, flat, diagrammatic. No isometric, no 3D extrusion, no organic blobs.
- Structure strokes: `--color-ink-faint`; active elements: `--color-ink-soft`.
- Fills: none, or `--color-paper-light` / `--color-accent-tint` at low opacity.
- **Cyan on exactly one element per diagram.** This is a system rule — never two.
- Labels: Geist Mono, 10–12px, `--color-ink-mute`, uppercase, 0.06em tracking.
- Size: 120–280px wide at desktop. Illustration serves copy; it never replaces it.
- `aria-hidden="true"` when it carries no information not already in the text.

**Off-brand (banned):** SaaS blob art, isometric "product-in-a-3D-box," glow/sparkle/
magic effects, neural-network/AI-brain imagery, dashboard-screenshot montages, gradient-
mesh backgrounds, multi-hue palettes, Notion/Linear/Loom pastel-flat aesthetics, and **any
AI-generated imagery** (directly contradicts the "research-led, peer-validated" signal).

---

## 5. Approved system evolutions

All four were accepted by the owner on 2026-06-11. They are now part of the system.

### 5.1 `.img-brand-tone` — locked photo-treatment filter
A single in-system CSS class to cool-desaturate warmer source photography:

```css
.img-brand-tone { filter: saturate(0.45) brightness(1.02) contrast(1.05); }
```

No gradient, no second hue. Define once in `globals.css` as a locked token — never apply
ad-hoc per-image filters. First likely uses: `.founder-photo`, `.about-image`, and a
saturation pull on `voranta-hero.webp`.

### 5.2 `.img-avatar` — scoped circular-crop exception
The only permitted exception to the ≤16px radius cap. Founder/author headshots only,
≤200px wide:

```css
.img-avatar { border-radius: 50%; overflow: hidden; } /* + the §2 ::after hairline */
```

May **not** be applied to product, illustrative, or any non-portrait image.

### 5.3 "No-AI-slop" subject-matter exclusion list (written guardrail)
Prohibited photographic subjects (reputational, not CSS, risk): people-staring-at-laptops,
handshakes, diverse-team-at-whiteboard, glowing orbs / network mesh, "AI brain" imagery,
lens-flare hero shots, recognizable stock-library templates (Unsplash "business",
Shutterstock "innovation"), and AI-image-generator output. → also add to CLAUDE.md.

### 5.4 Data-viz illustration palette (written guardrail)
Diagrams/framework illustrations are restricted to the greyscale ramp + cyan accent, with:
1–1.5px strokes, no fills except `--color-accent-tint` / `--color-paper-light`, no shadows,
no glows, corner geometry `--radius-sm` (6px) or sharp 0. Ties illustration directly to the
existing radar/scorecard SVG vocabulary. → also add to CLAUDE.md.

---

## 6. Placement inventory & priority

Ordered by impact-to-effort; ship incrementally.

### Priority 1 — Product card illustrations (`index.html` `#product .diff-grid`)
The most important explanatory section is entirely text. Add one **inline SVG per card**,
at the top above `.card-tag`, ~180×100px, built on existing scorecard vocabulary:
- *The framework* → radar polygon outline
- *The assessment* → question + progress-bar schematic
- *The lead* → CRM data-row with score + archetype tag
- *The benchmark* → distribution histogram, one cyan bar
Grey-ramp strokes, cyan on one element each. Stacks naturally at the 880px breakpoint.

### Priority 2 — Hero image treatment (`index.html` `.hero-visual`)
`voranta-hero.webp` is over-saturated cyan and reads as decoration. Short-term: apply a
saturation pull (`§5.1` `.img-brand-tone`, or `filter: saturate(0.7)`). Medium-term:
replace with a cool-desaturated structural-interior photo. Single image swap, no layout change.

### Priority 3 — AIPQ page hero visual (`aipq.html` hero)
That hero has **no visual column at all**. Add a `.hero-visual` mirroring the homepage
grid: either an architectural photo or an **empty-state** AIPQ radar illustration (structure
visible, no scores plotted). Signals "structured, visual framework" before a word is read.

### Priority 4 — Framework teaser illustration (`index.html` `.framework-teaser-row`)
Add a ~200px empty-state AIPQ radar outline as a third flex item. Gives the abstract
concept shape and an invitation to click. At 880px it moves between copy and the CTA.

### Priority 5 — Founding-sponsor card (`index.html` `#sponsors .founding-hero`)
Add a contained image in the dark card's right column — printed-research artifact photo or
a scorecard-output illustration (~280px tall) — to make the high-value offer concrete.
At 880px it moves above the benefits list.

---

## 7. Composition patterns (reference)

- **A — Text + image column split** (hero pattern): unequal columns, image fills the
  narrower one matched to text height; portrait-leaning crop (3:4 / 4:5); image hidden at
  880px. Used by index/aipq heroes, about founder grid.
- **B — Card-internal illustration** (product cards): illustration at top of card, ~80–100px
  tall, contained within card padding; stacks with card content at 880px.
- **C — Inline diagnostic illustration** (framework teaser): inline flex item, 180–240px,
  doesn't push copy past its `max-width`; moves above CTA at 880px.
- **D — Contained image in dark card** (founding sponsor): top of the card's right column,
  benefits stack below; moves above benefits at 880px.

No placement changes section vertical padding; imagery sits within the existing rhythm.

---

## 8. Open follow-ups (other lanes)

- **Mobile (ux-reviewer):** `.hero-visual` and `.about-image` are `display:none` at 880px.
  If imagery becomes central to the experience, revisit the mobile-hiding behavior.
- **Headshot tone (visual-designer):** `evanheadshot.webp` has a warm background that
  clashes with the cool-cream palette — interim `.img-brand-tone`, or re-shoot cooler.
- **Alt text / SEO (seo-engineer):** semantic images added under this system need real
  `alt` text, not the current decorative `alt="" aria-hidden`.
- **Copy (conversion-copywriter):** once product-card illustrations land, card copy may
  tighten since the diagram carries some explanatory load.
- **CLAUDE.md:** update the "single index.html" description; fold in §5.3 and §5.4 guardrails.

---

## 9. Build order

1. Add §5.1–§5.2 tokens/classes to `globals.css`; fold §5.3–§5.4 guardrails into CLAUDE.md.
2. Priority 1 (product-card SVGs) — `frontend-engineer`.
3. Priority 2 (hero treatment) — `frontend-engineer`.
4. Priorities 3–5 incrementally.
5. Per CLAUDE.md pre-commit convention: run `visual-designer`, `ux-reviewer`,
   `design-reviewer` on changed pages; `seo-engineer` when content/structure changes.
