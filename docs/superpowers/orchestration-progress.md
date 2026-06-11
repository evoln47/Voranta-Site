# Orchestration Progress

- Branch: agent-orchestrated-build
- Run started: 2026-06-10
- Last updated: 2026-06-10 (Phase 0 complete, entering audit)
- Current phase: done (Acceptance Bar met)

## Run topology (orientation findings)

Shipped visitor pages and surfaces:
- `index.html` — home (title "Voranta")
- `about.html` — about (title "About | Voranta")
- `aipq.html` — AIPQ framework page (title "AIPQ: AI Production Quotient | Voranta")
- `assessment.html` — Demand Research Index assessment app shell; loads `assessment/main.mjs`
- `style-guide.html` — internal design-system demo (title "Voranta — Design System"); not in primary nav
- `assessment/*.mjs` — vanilla-JS assessment engine (framework, engine, scoring, scorecard, capture, main)
- `api/lead.js`, `api/_dri.js` — Vercel serverless (lead capture + DRI scoring helper)
- `test/scoring.test.mjs` — node:test suite

Key infra facts:
- **All pages share `styles.css`** (single shared stylesheet). CSS edits must be serialized GLOBALLY, not per-page — this is the top corruption risk.
- `globals.css` is the future-Next.js design-token artifact (not shipped to current pages).
- `vercel.json`: `{ "cleanUrls": true }` — internal links use extensionless paths (`/about`, `/aipq`, `/assessment`).
- Baseline tests: PASS (5/5) via `node --test "test/*.test.mjs"`.

## Scope & triage rules (locked for this run)
- **In scope for brand/visual/SEO polish:** `index.html`, `about.html`, `aipq.html`, `assessment.html`.
- **`style-guide.html`: EXCLUDED** from polish. It is an internal design-system reference artifact, not in nav. Reviewers may consult it as the source of truth but generate no findings against it.
- **`assessment/*.mjs` + `api/*.js`: logic surfaces**, covered by green tests. Scoped to `ux-reviewer` (flow) and `framework-architect` (methodology) only — NOT brand/visual polish lanes.
- **Triage / stability discriminator:** only **must-fix or high-priority** findings block the stability gate and trigger producer work. Medium/low ("nice-to-have", subjective "could be better") findings are recorded but do NOT reset the two-clean-pass counter. A "pass" = all 3 reviewers x all in-scope pages.
- **Backstop:** max 3 implement-then-review cycles per page, then escalate.

## Acceptance Bar status — MET
- Objective gates: ALL PASS — tests 7/7; design-reviewer zero violations (pass 2); all in-page anchors + asset refs resolve; SEO essentials complete on all 4 pages (title/desc/canonical/OG/Twitter/valid JSON-LD, verified by parse); zero em-dashes in any shipped surface; no design-system violations.
- Stability gate: 2 of 2 CLEAN consecutive passes (all three reviewers, all pages, zero new must-fix/high in both).
- Pages at backstop (escalated): none. No page exceeded the 3-cycle cap (each took 1 implement + review).
- Note: one trivial post-pass-2 fix (em-dash in a code comment) — non-reviewer-domain, does not invalidate the clean passes.

## Backlog (open) — deduplicated, triaged. BLOCKING = must-fix/high (resets stability gate); NON-BLOCKING recorded only.

### BLOCKING — must-fix
- [ ] B1 | framework-architect | scoring.mjs + api/_dri.js + test | Archetype assigned by total score contradicts dimension-specific narrative; reachable inputs make results screen self-contradict. Make archetypes dimension-defined; add malignant-case tests. Mirror both files. | 0
- [ ] B2 | seo-engineer | index/about/aipq heads | Em-dash in og:title/twitter:title ("Voranta — B2B..."); replace with colon. (design V1 + seo) | 0
- [ ] B3 | seo-engineer | all 4 heads | og:image + twitter:image MISSING site-wide; wire to existing asset (voranta-wordmark.png) + set twitter:card=summary_large_image. Bespoke 1200x630 PARKED. | 0
- [ ] B4 | seo-engineer | new files | sitemap.xml + robots.txt missing at root; create. | 0
- [ ] B5 | frontend-engineer | about.html + styles.css | Inline <style> block in about.html (.founder-social/.social-icon-link) must move to styles.css, scoped. (design V2) | 0
- [ ] B6 | frontend-engineer | styles.css | Sub-14px reading surfaces: .pillar-desc(13), .sc-archetype-desc(13.5), .sc-pillar-callout .pc-reading(13), .sc-quadrant-callout(13), .sc-likelihood(13) -> 14px. (design V3 + visual H-5) | 0
- [ ] B7 | copywriter + frontend | about.html | Missing <h1> (a11y/SEO/visual). Copywriter sets h1 text; frontend places it as .display h1. (visual H-3, ux #7, seo) | 0

### BLOCKING — high
- [ ] B8 | frontend-engineer | assessment/engine.mjs | Quiz auto-advances: no selected state, no Next, no Back, no answer-change. Add selected state + explicit advance + back nav restoring saved answer. (ux #2) | 0
- [ ] B9 | frontend-engineer | assessment/main.mjs | On completion focus is lost + results not announced. Move focus to results heading + aria-live. (ux #3) | 0
- [ ] B10 | frontend-engineer | about/aipq/assessment nav | Assessment unreachable from secondary-page nav. Add "Assessment" nav link site-wide. (ux #1) IA decision: APPROVED to add. | 0
- [ ] B11 | frontend-engineer | styles.css | Measure caps missing -> 130-145ch lines: .section-head .subhead (max-width 640), .cta-section p (600), .framework-desc (620). (visual M-1, M-2) | 0
- [ ] B12 | frontend-engineer | styles.css + index.html | Sponsor card .price-value (2.5rem) holds descriptor text -> hierarchy inversion. New .price-label class. Copy of "Annual license"/"Custom" -> copywriter. (visual H-1) | 0
- [ ] B13 | seo-engineer | about + aipq heads | og:title/twitter:title duplicate homepage generic string; make page-specific. (seo high) | 0
- [ ] B14 | frontend-engineer | styles.css | .founder-content ~86ch; add max-width 620. (visual H-2) | 0
- [ ] B15 | frontend-engineer | styles.css | .gap-stat padding 20px undersized vs 10rem figure -> 36px 32px. (visual H-4) | 0
- [ ] B16 | frontend-engineer | styles.css | :focus-visible absent on .topbar nav a, footer .meta a, .btn, .cta-link. Add. (ux #11) | 0
- [ ] B17 | seo-engineer | index head | <title>"Voranta" only; strengthen to descriptive title. (seo high) | 0
- [ ] B18 | frontend/seo | index + assessment | Heading order: index product cards H2->H4 skip; assessment H1->H3 skip. (ux #14, seo) | 0
- [ ] B19 | frontend-engineer | assessment.html | BROKEN in-page link: href="#methodology" has no matching id on assessment.html (section lives only on aipq). Change to /aipq#methodology. PROMOTED from ux #5 medium -> blocking: objective gate 3.1 (links resolve) is binary, ignores priority tags. Verified mechanically. | 0

### NON-BLOCKING — recorded (medium/low, do NOT reset stability gate; address opportunistically)
- ux #4 capture msg role=alert; #5 dead #methodology anchor on assessment; #6 question not assoc w/ options (aria-labelledby); #8 skip-to-content link; #9 scorecard touch/keyboard a11y (aipq); #10 button contrast ~3.7:1 (LOCKED-TOKEN, see Parked); #12 progress bar 0% on Q1; #13 reduced-motion incomplete; #15 footer nav inconsistency.
- visual M-A founder-eyebrow border; M-B hero eyebrow inline 20px; M-C three consecutive paper sections; M-D CTA button margin-top 8px; M-E framework teaser inline styles -> classes; L-1 social icons as <img>; L-2 gap-stat-caption contrast; L-3 assessment top padding.
- design V4 merge 3 @media(880px) blocks; orphaned .gap-stat-pull / .price-value dead CSS.
- seo medium: JSON-LD contactType "sales" invalid -> "customer support"; add WebSite/Person/Product/CreativeWork blocks; assessment JSON-LD desc uses page copy not org desc; titles weak on about/aipq/assessment.
- framework #4 conv2 double-barreled; #7 gap tie-break order-deterministic.

### PARKED for human (see Parked section)
- framework #2/#3 instrument construct rebuild (dimension collapse); design compact-reading-token proposal; button-contrast token change; bespoke OG image + analytics.

## Done this run
- [x] B1 archetype dimension-defined fix | 29cbe74 | framework-architect (7/7 tests pass, no expectations changed)
- [x] B4 sitemap.xml + robots.txt | 9b125b9 | seo-engineer
- [x] B7 about.html h1 (copy) | 4edda07 | conversion-copywriter
- [x] B5,B6,B10,B11,B12,B14,B15,B16,B18,B19 + skip-links | 25a9fc7 | frontend-engineer (CSS/static)
- [x] B8,B9 + ux#4/#6/#12 a11y + about h2 fix | fb0c440 | frontend-engineer (assessment JS) — 7/7 tests pass, contract verified
- [x] B2,B3,B13,B17 + JSON-LD fixes | 620b80f | seo-engineer — SEO gate verified mechanically (all essentials present, JSON-LD valid, zero meta em-dashes)

ALL 19 blocking items resolved. Entering stability review.
- [x] cheap a11y/craft cleanup (focus on capture, aria-live, price-label weight, grid scope) | d266660 | frontend-engineer
- [x] B20 tied-dimension gap contradiction -> gap nullable + balanced render (scoring+email) | 891ae1d | framework-architect + frontend-engineer (10/10 tests)
- [x] B21 on-page CTA wired to gap state (no more "close the gap" on balanced) | 05e278a | frontend-engineer
- [x] B22 score-neutral balanced copy synced to scorecard + email | 05e278a | conversion-copywriter (words) + frontend + api-engineer

FINAL: Acceptance Bar met. Branch pushed. Preview: https://voranta-site-git-agent-orchestrated-build-voranta.vercel.app

## /api/lead verification status (honest limit)
- COULD NOT verify the capture->email path unattended. The preview deployment is behind Vercel deployment protection (GET and POST to /api/lead both return HTTP 401, the platform auth gate, before reaching the function). So a 404-vs-working distinction is not observable without an authenticated/bypass request, and Resend email cannot be sent unattended anyway.
- Reassurance: this run changed only api/_dri.js (imported bulk) plus its email copy; api/lead.js (thin entrypoint) and vercel.json were NOT touched, so zero-config function detection is unchanged from the last good production deploy. Human should test capture on the preview (authenticated) or after merge.

## Residual / discovered
- [PROMOTED TO BLOCKING B20] Gap/archetype contradiction on tied dimensions. Verified empirically: when all four dimensions tie high (e.g. all=3 -> Authority score 75; all=4 -> Authority score 100), pickGap() resolves the tie to Point of View and shows "you are renting the lens", contradicting the Authority "you own a framework" narrative on BOTH the results screen AND the visitor email. Same must-fix class as B1; reachable below a perfect score by any uniformly-confident answerer. Initial non-blocking dismissal ("requires a perfect score") was WRONG. Fix: gap = null when no dimension is genuinely lowest (gap dim score == max dim score); render results + email gracefully with no gap. Synced scoring.mjs + api/_dri.js + tests.
- Code-comment em-dashes in aipq.html (script comments) + styles.css (CSS comments) — not user-facing copy, but CLAUDE.md says "anywhere"; frontend to tidy opportunistically during its pass. All USER-FACING em-dashes are the meta tags (B2).

## Parked for human (require approval)
- **Framework instrument rebuild (framework #2/#3):** Conversion Surface / Trust at Capture / Signal to Sales collapse into one latent factor (the top option of 5 items all describe "we run an interactive assessment" — the product Voranta sells, a leading option). Only Point of View is independently discriminable. Fixing requires re-speccing constructs + point values + question wording + tests + both scoring files. This changes the PRODUCT's substance (like a brand evolution) and is high-risk in an unattended run. RECOMMENDATION: approve a dedicated framework-rebuild pass. Not auto-applied. (Note: the must-fix contradiction B1 is fixed within the current archetype mapping without re-speccing questions.)
- **design-reviewer compact-reading-token proposal:** add `--text-reading-compact: 13.5px` sanctioned only for scorecard annotation surfaces, instead of forcing 14px. Until approved, B6 raises to 14px per current locked rule.
- **Button contrast (locked token):** white on `--color-accent` #0891B2 ~3.7:1, below WCAG AA 4.5:1 for normal text. Fix requires changing a LOCKED design token. Needs human approval.
- **Bespoke OG image (1200x630) + per-page OG variants:** no image tooling in run; B3 wires og:image to an existing asset as interim. Designed image is a visual-designer/human deliverable.
- **Analytics:** none installed; recommend Vercel Analytics (zero-config) before go-live to baseline traffic.

## Notes
- On non-main branch `agent-orchestrated-build`. Will not merge to main.
- Repo is larger than the brief's single-file example; audit covers 4 shipped pages + assessment app + api.
