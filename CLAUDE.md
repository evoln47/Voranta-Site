# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Marketing site for voranta.co. A multi-page static HTML site with no build step: `index.html`, `about.html`, `aipq.html`, `assessment.html`, and `style-guide.html`. All pages share a single live stylesheet, `styles.css`. Auto-deploys to Vercel on every push to `main` (~30 seconds).

## Editing

Edit the relevant `.html` page directly, and put styles in `styles.css` (the stylesheet every page links). There is no dev server, build tool, or package manager for the current site, so open the file in a browser to preview changes. Note: `globals.css` is the design-token source of truth but is NOT linked by the live pages (it is a future-Next.js artifact, see below); live rules must live in `styles.css`.

## Design system

The locked Voranta design system is defined authoritatively in `globals.css` (Tailwind v4 tokens) and visually demonstrated in `style-guide.html`.

**Three fonts, strict roles:**
- `Geist` (`--font-sans`) — dominant voice: body, all headings (H1–H4), UI
- `Fraunces` (`--font-display`) — trust moments only: wordmark, framework name, research callouts. Never use for headings.
- `Geist Mono` (`--font-mono`) — eyebrows, badges, data labels, tags

**Color palette (locked):**
- Background: `--color-paper` (`#ECF1ED`, cool cream)
- Primary type: `--color-ink` (`#0A0908`)
- Accent: `--color-accent` (`#0891B2`, cyan) — this is the only allowed accent color

**Wordmark spec:** The `.wordmark` class renders "Voranta" in Fraunces with a cyan superscript asterisk (`::after`). Font variation settings are locked: `"opsz" 144, "wght" 500, "SOFT" 15, "WONK" 0`.

**Prohibited by design system:**
- No gradients
- No drop shadows (focus rings are the one exception)
- No `border-radius` > 16px (`--radius-xl`)
- No accent color other than cyan `#0891B2` — no purple, no `#3B82F6` blue, no AI-violet
- No serif headings — Fraunces is not for H1–H4
- No body font-size below 14px on reading surfaces
- No emoji or AI-sparkle iconography on brand surfaces

**One approved exception to the image-frame and text-over-image rules: the Full-bleed Hero Exception.** Permits a full-bleed, text-over-image (or video) hero, one per page, on `index.html` only for now. It does NOT relax any other rule (subject-matter guardrails, `.img-brand-tone`, the three-font rule incl. Geist-only headings, no-shadow, no-gradient, accent-color all stay in effect). Full constraints in spec §5.5; satisfy them in full before shipping.

## Assets

- `voranta-wordmark.svg` — locked wordmark, embedded inline in `index.html`
- `voranta-favicon.svg` — primary favicon (cyan asterisk on paper)
- `voranta-favicon-*.png` — PNG fallbacks

## Copy rules

- No em-dashes anywhere — use commas or periods instead

## Imagery system

Photography, video, and illustration follow the approved system spec at `docs/superpowers/specs/2026-06-11-imagery-system-design.md`. Photography = trust moments (real-world, human, physical artifacts); video = the same subject-matter standard, muted and looping, brought into brand tone; illustration = making abstract mechanisms visible. All use the one locked image frame (12px radius + `0.5px` inset hairline `::after`, never a shadow). Approved token classes: `.img-brand-tone` (cool-desaturate filter, applies equally to `<img>` and `<video>`) and `.img-avatar` (the only `border-radius: 50%` exception, headshots ≤200px only).

**Stock sourcing (approved 2026-06-11):** agents may source real photographs and video from approved licensed libraries, currently **Pexels** and **Artgrid** only. (Coverr is NOT approved: it now mixes AI-generated footage into its library.) Sourcing from a library does not relax the subject-matter or cliché guardrails below; they apply regardless of origin. Log every licensed asset in `docs/imagery-licenses.md` (source, asset ID/URL, license type, attribution required Y/N).

**No-AI-slop guardrail (subject matter):** never use people-at-laptops, handshakes, team-at-whiteboard, glowing-orb/network-mesh, "AI brain", lens-flare hero shots, the clichéd stock-template aesthetic (Unsplash-"business", Shutterstock-"innovation"), or any AI-generated imagery. Sourcing from an approved library does not exempt an asset from this list; "recognizable stock-library templates" means that cliché look, not the act of licensing from a library. The brand is research-led; AI-generated visuals contradict that signal, and this ban is permanent.

**Video constraints:** `<video>` must be `muted`, `loop`, `playsinline`, carry a `poster` still and explicit `width`/`height`, and pass the subject-matter guardrail above. No baked-in type or lower-thirds (all type is live HTML in the brand fonts); no second accent hue introduced by the grade; quiet motion only (no rapid cuts, kinetic typography, or cinematic flare); honor `prefers-reduced-motion` (fall back to the poster still). Host on Vercel/CDN, not third-party iframes. Text-over-video legibility is governed by the locked image rules (text only on a solid opaque panel) unless a specific design-system exception has been approved. The **Full-bleed Hero Exception** (spec §5.5) is one such approved exception; its constraints are binding.

**Illustration palette:** inline SVG only (no external `.svg` via `<img>`). Greyscale ramp + cyan accent, with cyan on exactly ONE element per diagram. Monoline 1–1.5px strokes, flat/geometric, no fills except `--color-accent-tint`/`--color-paper-light`, no shadows/glows. Extend the existing data-viz vocabulary (AIPQ radar, dot-grid, 2x2 matrix), never generic SaaS/isometric/blob art.

## CSS conventions

- Section-specific layout overrides use `#section-id .class` selectors (see `#product .diff-grid`, `#methodology .diff-grid`) — never modify the base rule
- New CSS appends to `styles.css` (the shared live stylesheet); mobile overrides go inside the existing `@media (max-width: 880px)` block. Design tokens that need a Next.js-parity definition are mirrored into `globals.css`, but the `styles.css` copy is what renders live
- Exception: the `.hero--fullbleed` mobile overrides live in a SECOND `@media (max-width: 880px)` block placed AFTER the desktop `.hero--fullbleed` rules (near end of file). This is intentional and required: those desktop rules carry no media guard, so a mobile override of equal specificity must come later in source order to win. Do not merge this block back into the earlier mobile block

## Section structure

- `.section-head` pattern: `<span class="eyebrow">` → `<h2>` → `<div class="rule">` → optional `<p class="subhead" style="margin-top: 20px;">`

## Future Next.js context

`fonts.ts` and `globals.css` are design-system artifacts intended for a future Next.js app. `fonts.ts` shows how to load the three fonts via `next/font/google`; `globals.css` is the Tailwind v4 (CSS-first) config. When migrating, remove the `@import url(...)` Google Fonts CDN line from `globals.css` since `next/font` handles font loading.

## Agent playbook

This repo ships eight project-level subagents in `.claude/agents/`. The main thread dispatches them; they cannot call each other. When an agent flags out-of-lane work, route it to the owning agent.

**Ownership map:**

- `ux-reviewer` (read-only) — user flows, IA, funnel friction, interaction design, accessibility.
- `design-reviewer` (read-only) — brand/design-system compliance (the locked rules), plus approval-gated proposals to evolve the system.
- `visual-designer` (read-only) — best-in-class visual craft (layout, hierarchy, whitespace, type) within the system.
- `conversion-copywriter` (edits) — the words: headlines, subheads, CTAs, microcopy, capture/result copy.
- `framework-architect` (edits, Opus) — research methodology, questions, scoring logic, archetypes.
- `frontend-engineer` (edits) — static HTML/CSS and the vanilla-JS `.mjs` assessment.
- `api-engineer` (edits) — Vercel serverless functions, lead capture, env/secrets.
- `seo-engineer` (edits) — titles, meta, OG/Twitter, JSON-LD, semantic HTML, sitemap/robots.

**Default build sequence for a new section or feature:**

1. `framework-architect` if any methodology or scoring is involved.
2. `conversion-copywriter` for the words.
3. `frontend-engineer` and/or `api-engineer` to build.
4. `visual-designer`, `ux-reviewer`, and `design-reviewer` in parallel (read-only review).
5. Apply fixes via the relevant producer.
6. `seo-engineer` pass on any new or changed page.

**Pre-commit convention:** run `visual-designer`, `ux-reviewer`, and `design-reviewer` on any changed page before committing. Run `seo-engineer` when a page is added or its content or structure changes.
