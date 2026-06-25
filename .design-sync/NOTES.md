# design-sync notes — Voranta Design System

Project: `Voranta Design System` (db947775-1cbc-4997-a0dc-10150e3e59e0). Shape: storybook. Package: `packages/ui` (`window.VorantaUI`).

## Config decisions (why each key is set)

- `[GENERAL] cssEntry: "dist/voranta-ui.css"` — REQUIRED. The converter does not auto-detect the package's compiled CSS sidecar; without `cssEntry`, `_ds_bundle.css` is an `@import`-only stub (`[CSS_PLACEHOLDER]`) and every preview renders unstyled. Path is relative to the package root (`packages/ui`), not the repo root.
- `config.json` must contain ONLY converter-known keys. An extra `projectName` key fails the build with `config: unknown key`. `projectId` is allowed (and required for the upload anchor).
- No `provider` / decorators needed: `packages/ui/.storybook/preview.ts` declares no decorators (it only imports the two CSS files). Components are self-contained; the bundled CSS styles them.

## Fonts

`[FONT_REMOTE]` — Geist / Fraunces / Geist Mono are served via a Google Fonts `@import` in `styles.css`. The reference storybook loads the same CDN URL via `packages/ui/.storybook/preview-head.html`, so both compare panels verify with the real fonts (Fraunces incl. the locked SOFT/WONK axes). If the CDN is ever swapped for self-hosted fonts, update both `theme.css` and `preview-head.html` together.

## Result (first sync, 2026-06-24)

10/10 components graded `match` on every story (max 4 stories/component; no `[STORY_CAP]`). Driver receipt `ok: true`, `pendingGrade: []`. validate exits 0, render-check 10/10 clean.

## Re-sync risks (watch-list for the next run)

- **Component CSS source of truth:** `packages/ui/src/styles/components.css` is sourced VERBATIM from the live `styles.css` (NOT `globals.css`; the two have drifted). If you edit `packages/ui`, rebuild it (`buildCmd`) AND rebuild `.design-sync/sb-reference` so the oracle isn't stale (`[REFERENCE_STALE?]`).
- **`.d.ts` parse check skipped** — typescript isn't installed in `.ds-sync/node_modules`, so validate prints "(.d.ts parse check skipped)". The `.d.ts` files are emitted by the package's own `tsc` build and were present (21 parsed at build time); this is not a defect, just an unverified-by-the-converter surface. Install `typescript` into `.ds-sync` if you want the check to run.
- **PricingCard** reflects `globals.css`'s `.pricing-card`, which is NOT used on the live site (the site uses `.sponsors-offer-card`). Its featured-card legibility fix lives in `components.css`. Graded `match` against storybook, which is the contract here.
- **Driver `iterations`** reported as ~4 (initial build + 2 cssEntry-fix rebuilds + driver). Not load-bearing.
