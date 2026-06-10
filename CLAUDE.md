# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Marketing site for voranta.co. Currently a single-page static HTML site (`index.html`) with no build step. Auto-deploys to Vercel on every push to `main` (~30 seconds).

## Editing

Edit `index.html` directly. There is no dev server, build tool, or package manager for the current site — open the file in a browser to preview changes.

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

## Assets

- `voranta-wordmark.svg` — locked wordmark, embedded inline in `index.html`
- `voranta-favicon.svg` — primary favicon (cyan asterisk on paper)
- `voranta-favicon-*.png` — PNG fallbacks

## Copy rules

- No em-dashes anywhere — use commas or periods instead

## CSS conventions

- Section-specific layout overrides use `#section-id .class` selectors (see `#product .diff-grid`, `#methodology .diff-grid`) — never modify the base rule
- New CSS appends to the single `<style>` block in `index.html`; mobile overrides go inside the existing `@media (max-width: 880px)` block

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
