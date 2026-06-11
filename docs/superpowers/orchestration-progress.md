# Orchestration Progress

- Branch: agent-orchestrated-build
- Run started: 2026-06-10
- Last updated: 2026-06-10 (Phase 0 complete, entering audit)
- Current phase: framework evolution v2 (APPROVED 2026-06-10) — make no-focus rare + tailored conversion copy per outcome

## Evolution v2 brief (in progress)
**NORTH STAR (human, explicit): the assessment is a SALES instrument. Its single job is to make the taker click "Book a call" with Evan and ultimately buy. Every result, strong or weak, must be presented to create a compelling, tailored reason to book the call.** A weak result = "here is exactly what is leaking and how Voranta fixes it, let's talk." A strong result = "you are ahead, lock in / extend the lead before a competitor licenses the same advantage, let's talk." No outcome is a dead end; each is a different on-ramp to the call.

Two user asks: (1) make a genuine "no gap / no focus" outcome VERY RARE; (2) every outcome's results copy drives conversion to the call, tailored exactly to that outcome.
Mechanism (per advisor): replace R1 gap-SUPPRESSION with band-adaptive FRAMING. Always surface one focus dimension (deterministic tie-break); frame by band: low/mid lowest = deficit "gap to close"; high-band lowest = relative "edge to extend / next lever" (opportunity, NOT deficit). True no-focus only when all four exactly equal (rare). This is an EVOLUTION of the contradiction fix, not a reversal: R2 coherence (no archetype claims strength on a dimension shown as a DEFICIT) stays; the enumeration test updates from "high-band => null gap" to "high-band lowest => framed as edge, never deficit" and now COUNTS + reports the no-focus fraction (target well under ~1%, ideally only all-equal). Structural change (pillar count / question count) optional + secondary, allowed only if it preserves the v1 construct independence + coherence. Balanced/no-focus residual must ALSO convert (tailored), not a flat note.
Plan: design-first (framework-architect designs mechanism + outcome map + measured no-focus rate) -> verify coherence + rate -> confirm shape with human -> composable tailored copy matrix (copywriter) -> render (frontend+api) -> review -> verify. Keep scope to assessment + result copy; do not reopen site-wide loop.

### v2 status: model + copy done (no-focus 0.80%). Review found regressions being fixed:
- B24 (must-fix): conversion rewrite reintroduced over-claims. Operator blurb ("converts and hands off leads with context") + Authority ("engine converts attention into pipeline") assert specific cluster dimensions that can be the deficit focus -> contradiction (verified: Operator/signal=0 shows "hands off with context" next to "reps start from scratch"). The 625 enumeration passed only because its claimed-strong encoding still matched the OLD softened blurbs. Rule: archetype blurb may assert strength only on Point of View (Authority/Publisher, guaranteed), may make an AGGREGATE engine claim, but must NOT name a specific cluster dimension as working, nor a singular "the gap/fix" (focus panel owns the specific lever). Fix blurbs + make R2 encoding honest + guard.
- B25 (high): all-equal-low Renter blurb claims a singular "most fixable gap" conflicting with even-low "no single gap" panel.
- B26 (high-value, north star): CTA href is a bare Calendly link with no result context (the instrument that sells Signal-to-Sales hands off cold). Encode archetype/score/focus as query params.
- B27 (north star): "Book a call" is the secondary ghost button under "Email me the breakdown" (filled). For a sales instrument whose #1 goal is the call, make Book-a-call primary. FLAG to human (reversible funnel choice).
- B28 (low): even-high CTA "map next steps" lacks urgency -> use "extend your lead". CSS: .dri-gap margin-top:22px overrides margin-top:auto so the focus callout does not bottom-anchor; rely on auto + padding-top.

## QUEUED (human):
1. Make the assessment PAGE visually interesting / a cool experience (AIPQ animated sample scorecard is the style reference). [in progress]
2. Add a visual component to the DRI RESULTS like the AIPQ radar chart + 2x2 quadrant. [v1 built; redesigning to AIPQ-quality per review]
3. Make the EMAIL results breakdown more in-depth and valuable, tailored to the specific results. [next]

## APPROVED (human, 2026-06-10): /100 per-dimension scoring rebuild
Decisions: (1) GRANULARITY = 12 questions, 3 per dimension (was 2). (2) WEIGHTING = equal.
Model (from framework-architect proposal):
- Each dimension scored /100 = rawPoints/maxPerDim * 100. DRI = equal-weight mean of the four dimension FRACTIONS, round ONCE at the end (so displayed dims average to the shown total).
- Add 4 new questions (pov3/conv3/trust3/signal3), options 0/1/2, each top answer keying off a DISTINCT capability (constructs specified by framework-architect): pov3 = POV durability/proprietariness; conv3 = relevance-matching of the next step; trust3 = immediacy of value at capture (keeps the interactive-assessment artifact anchored to Trust); signal3 = timeliness/freshness of the brief. Preserve construct independence + coherence.
- Archetype restated on FRACTION thresholds (classification-preserving): POV high = povFrac >= 0.75; Execution high = mean(conv,trust,signal frac) >= 2/3 (epsilon for the cluster=8 boundary). 2x2 unchanged.
- Bands on /100: low <50, mid 50-<75, high >=75. Focus = lowest /100; deficit <75 / edge >=75; tie-break funnel order. all-equal -> null + evenTier.
- Ripple: framework.mjs (4 new Qs), scoring.mjs, api/_dri.js (mirror + email "/4"->"/100" rows), scorecard.mjs (/4->/100), scorecard-viz.mjs (radar divisors, aria "of 4"->"of 100", BUYER-DOT magic constants 8/3/12/4 -> fraction thresholds 0.75 & 2/3, ring labels 25/50/75/100), test/scoring.test.mjs (enumeration 5^4=625 -> 7^4=2401, rewrite split/answersFor, update hardcoded expected scores, no-focus 5->7, add fraction-threshold + round-once tests). NOTE: questions are DATA in framework.mjs rendered by engine.mjs; no per-question markup needed in assessment.html/index.html.
- No-focus rate drops 0.80% -> ~0.29% (uniform enumeration) with 3 Qs/dim.
BUILD SEQUENCE (after the in-flight CTA copy pass commits, to avoid _dri.js/scorecard.mjs clobber): framework-architect implements scoring+questions+_dri mirror+test -> conversion-copywriter polishes the 4 new question wordings (constructs/points LOCKED) -> frontend-engineer the /4->/100 display swaps -> review -> verify -> push.

## STATUS (latest): v2 framework + results visual experience DONE to AIPQ bar. Email enrichment (#3) in progress.
- Framework v2: no-focus 0.80%, band-adaptive deficit/edge framing, tailored sales copy per outcome, cluster-silent coherence guard, 625-profile enumeration. 18/18 tests.
- Results redesign: unified AIPQ 3-card row (Score|Radar|Quadrant), retired redundant bars, animated 4-axis radar + 2x2 quadrant (POV x execution), roving-tabindex a11y, decoupled aria-live, sr-only fallback, quadrant focus-visible, QUADRANT copy from guarded source.
- Craft polish: 1160px results container (radar at AIPQ scale; intro/quiz centered at readable width), dark-card two-zone rhythm, primary Book-a-call block (accent tint + 3px border) outranking secondary email capture, label legibility, CTA result-context UTMs, email-success points back to the call.
- Reviews: ux confirmed all 4 prior blockers resolved; visual confirmed the 3 craft must-fixes addressed -> AIPQ-grade. Pushed (641da3c).
- OPEN visual note (human's call, NOT done): a 4-axis radar is geometrically a diamond; a 5th DRI dimension would make it a richer pentagon, but that is a METHODOLOGY change to the just-stabilized framework. Flagged to human, not done unilaterally.
- Placeholder copy pending copywriter polish: CTA frame line, email-success line, dynamic CTA labels.

## (historical) Results-viz v1 review findings -> consolidated redesign:
- visual (structural): two-row layout buries showpieces + redundant (bars AND radar show same 4 scores). FIX: single AIPQ 3-card row Score|Radar|Quadrant; RETIRE the separate bars row (radar = the 4-dim display). Enlarge radar (maxR ~160). Keep radar per explicit user request despite 4-axis sparseness; execute it well.
- ux BLOCKER: email-success is a dead end (no path to booking) -> success copy must nudge to the call. ux BLOCKER: quadrant cells no :focus-visible -> add accent outline. ux HIGH: aria-live fires on focus (SR spam) -> update live region on click/Enter only, visual on hover/focus. ux HIGH: radar role=img conflicts w/ interactive children -> role=group + visually-hidden score list for SR. ux HIGH: primary CTA buried in tab order -> prominent framed Book-a-call after the scorecard.
- design/coherence: QUADRANT_DESC duplicates archetype copy unguarded -> import archetypes from framework.mjs (single guarded source).
- medium craft: quadrant axis arrows, score-card divider, card-head names ("Four-dimension diagnostic"/"Archetype placement").

## Framework rebuild pass (approved)
Scope (bounded): re-spec the cluster questions so the four dimensions are independently discriminable. PRESERVE structure: 4 dimensions, 2 questions each, 3 options (0/1/2 pts), per-dimension 0-4, MAX_POINTS 16, dimension keys, {questionId,choiceIndex} contract, the dimension-defined archetype mapping + nullable gap. Keep 4 archetypes.
ACCEPTANCE CRITERION (reviewable by reading, NOT by test-green — scoring math is byte-identical so tests only validate the unchanged engine): **no single real-world artifact/capability may be the 2-point top answer across more than one dimension.** Today "we run an interactive assessment that returns a personalized diagnosis" is the top answer on conv1/trust1/trust2/signal1/signal2 -> 3 dimensions collapse into 1 latent factor. After: each dimension's top answer keys off a DIFFERENT thing (Conversion Surface = CTA conversion mechanics; Trust at Capture = value exchange independent of format; Signal to Sales = handoff/qualification context independent of capture mechanism; Point of View unchanged, already independent).
Also: re-sync dimensions[].gap blurbs + archetype blurbs to format-independent framing on BOTH surfaces (scorecard + api/_dri.js email). Fix conv2 double-barrel (#4).

### B23 (BLOCKING must-fix, found in rebuild review) — archetype/gap contradiction across the input space
Enumeration of all 625 reachable dimension profiles: 14 label a HIGH-band dimension (score>=3) as "your gap" (incoherent "high . your gap"); 68 are Authority+non-null-gap where the Authority blurb claims all-dimension strength while the gap flags one weak. The earlier nullable-gap fix only covered min==max (all tied). The rebuild's independent cluster made lumpy profiles common, exposing this. ACCEPTANCE ORACLE (enumerate all 625, must hold): (R1) gap is null whenever the lowest dimension is in the high band (score>=3) — a strong dimension is never "the gap"; (R2) an archetype blurb must not claim strength on the dimension flagged as the gap. Recommended model: archetype blurbs claim only their DEFINING axes (POV ownership and/or cluster-level execution), not per-dimension mastery; plus R1. Fix in scoring.mjs + framework.mjs blurbs, mirror api/_dri.js, add an enumeration test proving zero contradictions. This closes the contradiction class exhaustively rather than case-by-case.

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

## Framework rebuild — DONE (approved + delivered)
- New construct independence verified by reading: the personalized-result artifact is the 2-pt top answer of Trust at Capture ONLY (mechanically confirmed). Four dimensions now key off four distinct things: named framework / low-friction+measured conversion / personalized value at capture / routed rep brief.
- Archetype/gap contradiction closed EXHAUSTIVELY: 625-profile enumeration test asserts R1 (no high-band dimension is ever "the gap") + R2 (no archetype blurb claims strength on its gap dimension) + exact client/server parity. 15/15 tests.
- Commits: 7b… rebuild (cef? see log), copy polish, B23 contradiction-closure, null-gap copy reconciliation. Branch pushed (0207476).
- Residual NON-BLOCKING copy nitpicks (ux review, recorded, not addressed to avoid churn): conv1 option-0 bundles two friction examples ("long gated form or book a demo"); conv1/trust1 sit at the same funnel moment and a fast reader could conflate them; "opinionated" in pov2 carries mild positive valence. All minor; route to conversion-copywriter if desired.
- The two softened Authority/Operator blurbs were written by framework-architect under the R2 constraint (claim only defining axes); serviceable and on-voice, not separately copy-polished. Human may refine on preview.

## Parked for human (require approval)
- ~~Framework instrument rebuild~~ -> APPROVED and DONE (see above).
- **Framework instrument rebuild (framework #2/#3) [HISTORICAL]:** Conversion Surface / Trust at Capture / Signal to Sales collapse into one latent factor (the top option of 5 items all describe "we run an interactive assessment" — the product Voranta sells, a leading option). Only Point of View is independently discriminable. Fixing requires re-speccing constructs + point values + question wording + tests + both scoring files. This changes the PRODUCT's substance (like a brand evolution) and is high-risk in an unattended run. RECOMMENDATION: approve a dedicated framework-rebuild pass. Not auto-applied. (Note: the must-fix contradiction B1 is fixed within the current archetype mapping without re-speccing questions.)
- **design-reviewer compact-reading-token proposal:** add `--text-reading-compact: 13.5px` sanctioned only for scorecard annotation surfaces, instead of forcing 14px. Until approved, B6 raises to 14px per current locked rule.
- **Button contrast (locked token):** white on `--color-accent` #0891B2 ~3.7:1, below WCAG AA 4.5:1 for normal text. Fix requires changing a LOCKED design token. Needs human approval.
- **Bespoke OG image (1200x630) + per-page OG variants:** no image tooling in run; B3 wires og:image to an existing asset as interim. Designed image is a visual-designer/human deliverable.
- **Analytics:** none installed; recommend Vercel Analytics (zero-config) before go-live to baseline traffic.

## Notes
- On non-main branch `agent-orchestrated-build`. Will not merge to main.
- Repo is larger than the brief's single-file example; audit covers 4 shipped pages + assessment app + api.
