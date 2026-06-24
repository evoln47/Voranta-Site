# Voranta UI — Component Library Design

**Date:** 2026-06-23
**Status:** Approved (design), pending implementation plan

## Goal

Stand up a real, compiled React component library that embodies the locked Voranta
design system, so it can be synced to claude.ai/design via `/design-sync`. The sync
skill bundles compiled components (`dist/`) and feeds them to the Claude Design agent,
which then builds every design out of the customer's actual parts. Today this repo is a
no-build static HTML/CSS site with no component library, so there is nothing to sync.
This library fills that gap and aligns with the documented future Next.js migration.

## Non-goals (out of scope)

- Data-viz components (AIPQ radar, dot-grid, 2x2 matrix, data table).
- Migrating the static site to Next.js or to consume this library.
- Automated syncing of design tokens between the root `globals.css` and the library copy.
- The `/design-sync` run itself (a separate follow-on once the library builds and verifies).

## Architecture & placement

A new self-contained `packages/ui/` directory in this repo. The existing static site at the
repo root is untouched — no build step is added to the live Vercel deploy.

Stack:

- **React 18 + TypeScript** for components.
- **Tailwind v4** for styling. The root `globals.css` is already Tailwind v4-native
  (`@import "tailwindcss"`, an `@theme` token block, `@layer base`/`@layer components`).
  The library's theme CSS copies the `@theme` token block from the root `globals.css`.
  **The Google-Fonts CDN `@import` is KEPT** (the "remove it" rule in CLAUDE.md is
  Next.js-specific — `next/font` replaces it there; this is a Vite/Storybook library with no
  `next/font`, so dropping it would render every component in fallback fonts and break the
  fidelity gate). Fonts also load in Storybook via a `preview-head.html` `<link>`. The wordmark
  depends on Fraunces's `SOFT`/`WONK` axes, which the existing CDN URL requests explicitly.
- **Source of truth for component CSS:** the live site links `styles.css`, not `globals.css`,
  so `styles.css` is what the fidelity gate measures. Component class rules are sourced from
  `styles.css` (authored as plain CSS, purge-proof), while design tokens come from the
  `@theme` block. Where a rule exists in both files and they have drifted, `styles.css` wins.
  `.section-head`/`.rule` live only in `styles.css` and are ported in.
- **Vite library build** → `dist/` (ESM + `.d.ts`). This is the artifact `/design-sync` bundles.
- **Storybook** with one `.stories.tsx` per component, rendered for design-sync preview
  verification and as a living component playground.

Directory shape:

```
packages/ui/
  package.json
  tsconfig.json
  vite.config.ts
  .storybook/            # storybook config
  src/
    styles/
      theme.css          # @import "tailwindcss" + fonts @import + @theme tokens (from globals.css)
      components.css      # plain CSS component rules sourced from live styles.css
    index.ts             # barrel export (imports theme.css + components.css)
    Wordmark/{Wordmark.tsx, Wordmark.stories.tsx, index.ts}
    Button/{...}
    ...one dir per component
```

## Components

Ten components, each as `src/<Name>/{<Name>.tsx, <Name>.stories.tsx, index.ts}`. Props mirror
the variants already demonstrated in `style-guide.html`.

| Component | Key props | Maps to (existing classes) |
|---|---|---|
| `Wordmark` | `as`, `size` | `.wordmark` (Fraunces + cyan superscript `*`) |
| `Button` | `variant: 'solid' \| 'ghost'`, `size: 'md' \| 'lg'`, `as` | `.btn`, `.btn-ghost`, `.btn-lg` |
| `Badge` | `variant: 'default' \| 'ink'`, `dot?` | `.badge`, `.badge-ink`, `.badge-dot` |
| `Eyebrow` | `children` | `.eyebrow` (mono, tracked) |
| `Card` | `size: 'md' \| 'lg'`, `children` | `.card`, `.card-lg` |
| `FeatureCard` | `icon`, `title`, `body` | `.feature-card` |
| `PricingCard` | `featured?`, `price`, `period`, `features[]` | `.pricing-card`, `.is-featured` |
| `SectionHead` | `eyebrow`, `heading`, `subhead?` | `.section-head` + `.rule` + `.subhead` |
| `Stat` | `value`, `label`, `accent?` | `.stat`, `.stat-value-accent` |
| `ResearchCallout` | `children` | `.callout-research` (Fraunces trust moment) |

### Styling rules (carried from the locked design system)

Each component is a thin wrapper that emits the exact existing semantic class names
(`.btn`, `.card`, `.wordmark`, etc.). Those rules ship in `components.css` (sourced from the
live `styles.css`); design tokens they reference come from the `@theme` block in `theme.css`.
Components do not author new Tailwind utility soup in markup — the live site doesn't, and
fidelity means matching it. The design-system prohibitions all remain in force:

- Three fonts, strict roles: Geist for all headings/body/UI, Fraunces only for trust moments
  (Wordmark, ResearchCallout), Geist Mono for eyebrows/badges/labels. No serif headings.
- Cyan (`#0891B2`) is the only accent. No other accent hue.
- No gradients, no drop shadows (focus rings excepted), no `border-radius` > 16px.
- No em-dashes in any copy.

### Polymorphism

`Wordmark` and `Button` accept an `as` prop so the design agent can render a link or a button
from one component instead of us shipping two variants.

## Build & outputs

- `vite build` in library mode produces:
  - `dist/voranta-ui.js` (ESM bundle, esbuild-bundlable for design-sync)
  - `dist/voranta-ui.css` (Tailwind-compiled stylesheet from the locked tokens)
  - `dist/*.d.ts` (type declarations — the API contract design-sync codes against)
- A `window.VorantaUI.*` global name is exposed for design-sync's runtime to mount real
  components.

## Verification (fidelity gate)

Fidelity is the whole point: a component that renders wrong in Storybook renders wrong in every
design the agent later builds.

- Build must complete clean (`vite build`, `tsc --noEmit`).
- Storybook must build and render every story.
- Before declaring done, render the Storybook and visually confirm each component matches the
  live site's appearance. There is no dev server in this repo, so verify via headless-Chrome
  screenshot + crop (per the project's visual-verification practice), not by assertion.
- Token parity: `packages/ui/src/styles/theme.css`'s `@theme` block must remain a faithful copy
  of the root tokens. If the root `globals.css` changes, this copy must be re-synced (future
  automation, out of scope).
- **De-risk the Tailwind pipeline first:** `Button` is built as a full vertical slice (scaffold +
  Tailwind + theme + one component + `vite build`) before the other nine exist. The
  discriminating check: the built `dist/*.css` must contain the `.btn`, `.btn-ghost`, and
  `.btn-lg` rule bodies AND the `@theme` tokens emitted as `--color-*` custom properties. Only
  after that passes do the remaining components fan out. All variant→class mappings are authored
  as complete static strings in a lookup object (e.g. `{ ghost: 'btn btn-ghost' }`), never
  interpolated (`` `btn-${variant}` ``), so nothing depends on Tailwind's content scanner.

## design-sync handoff (follow-on, not part of this build)

Once the library builds clean and Storybook verifies:

1. Re-run `/design-sync`. It detects the Storybook shape, runs from `packages/ui/`, bundles
   `dist/`, and generates per-component `.d.ts` / `.prompt.md` / preview cards.
2. It uploads to a fresh claude.ai/design project.
3. Author the conventions header (`.design-sync/conventions.md`): the provider/wrapper needed for
   styling, the Tailwind token vocabulary (real token names), where the truth lives
   (`globals.css` + per-component docs), and one idiomatic build snippet. Validate every named
   class/token/component against the built artifacts before committing.

## Success criteria

- `packages/ui/` builds to `dist/` with ESM + `.d.ts` and a Tailwind-compiled CSS.
- All ten components have stories and render faithfully to the live style guide.
- The static site at repo root is unchanged and still deploys.
- The library is in a state where `/design-sync` can detect the Storybook shape and bundle it.
