# Site-Build Agents — Design Spec

- **Date:** 2026-06-10
- **Status:** Approved (pending user review of this document)
- **Topic:** A set of project-level Claude Code subagents that specialize in the distinct disciplines required to build and grow voranta.co, plus a lightweight orchestration layer that tells the main thread how to use them together.

## 1. Context and problem

voranta.co has outgrown a single-page static site. It now spans:

- Three+ marketing pages (`index.html`, `about.html`, `aipq.html`) on a locked design system (`globals.css`, `style-guide.html`).
- A live client-scored assessment product (`assessment.html`, the `assessment/*.mjs` engine, a test suite) built on the Demand Research Index (DRI) framework.
- A Vercel serverless layer for lead capture (`api/lead.js`, `api/_dri.js`).

Building this well requires several genuinely different kinds of expertise — research methodology, conversion copywriting, UX, brand-system compliance, best-in-class visual design, front-end implementation, serverless back end, and SEO. A single general assistant context handles all of them adequately but none of them with specialist depth, and it has no enforced sense of where one discipline's authority ends and another's begins.

The goal is a roster of focused subagents, each an expert in one discipline with a clear boundary, plus a small playbook that coordinates them. This concentrates the right context on each task and keeps disciplines from overwriting each other's work.

## 2. Goal and success criteria

Give the project a durable, reusable team of specialist agents that the main thread can dispatch with confidence.

Success criteria:

- Eight agent definitions exist in `.claude/agents/`, committed to the repo and available as spawnable subagent types.
- Each agent has a clear single discipline, a correct tool grant, and an explicit boundary that tells it what to flag rather than touch.
- Reviewers are read-only; producers can edit but always report what they changed.
- Each agent defers platform/deploy/performance concerns to the existing Vercel plugin agents and skills rather than duplicating them.
- All eight use a consistent, structured output format (located finding + suggested fix) modeled on the existing `design-reviewer`.
- CLAUDE.md carries a short Agent Playbook: ownership map + default build sequence + the pre-commit review convention.
- Everything respects the locked Voranta design system and copy rules (notably: no em-dashes).

## 3. Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Roster size | Eight agents |
| Location | Project-level `.claude/agents/`, committed to the repo |
| Reviewer vs producer split | UX, design, and visual are read-only reviewers; copy, framework, frontend, api, and seo are producers that can edit |
| Design split | Two complementary design agents: `design-reviewer` for brand/system compliance, `visual-designer` for best-in-class visual excellence within the system |
| Brand evolution | `design-reviewer` may propose evolutions to the locked system itself, but only in a separate, clearly labeled, approval-gated section — it never silently relaxes or violates a current rule |
| Model strategy | Inherit the session model on all agents, except `framework-architect` which is pinned to Opus |
| SEO | A standing `seo-engineer` agent (user is planning content growth), not a one-time checklist pass |
| Analytics instrumentation | Out of scope for now — no measurement stack exists; `seo-engineer` may recommend adding one but no event-tracking guidance is baked into any prompt |
| Meta-orchestrator agent | Rejected — the main thread is the orchestrator; an agent that dispatches agents adds indirection without capability |
| Handoff model | Agents cannot call each other. Boundaries are written as "flag this as X's domain, do not change it yourself," never "defer to the X agent" |
| Ecosystem deference | Each agent routes Vercel-platform, deploy, and performance concerns to the existing `vercel:*` plugin agents/skills rather than duplicating them |
| Standalone performance agent | Rejected — `vercel:performance-optimizer` already covers this surface |

## 4. The roster

Eight project-level agents in `.claude/agents/`. Boundary column states what each owns and, by implication, what it flags rather than touches.

| # | Agent | Type | Tools | Model | Owns |
|---|-------|------|-------|-------|------|
| 1 | `ux-reviewer` | Reviewer | Read-only | inherit | User flows, IA, funnel friction, interaction design, accessibility |
| 2 | `design-reviewer` | Reviewer | Read-only | inherit | Brand/system compliance (the 10 rules) + approval-gated proposals to evolve the system |
| 3 | `visual-designer` | Reviewer | Read-only | inherit | Best-in-class visual excellence within the system: composition, hierarchy, whitespace, type craft, polish |
| 4 | `conversion-copywriter` | Producer | Read + Edit/Write | inherit | The words — headlines, subheads, CTAs, microcopy, capture/result copy |
| 5 | `framework-architect` | Producer | Read + Edit/Write + Web | **Opus** | Research methodology, questions, scoring logic, archetypes |
| 6 | `frontend-engineer` | Producer | Full | inherit | Static HTML/CSS and vanilla-JS `.mjs` assessment implementation |
| 7 | `api-engineer` | Producer | Full | inherit | Vercel serverless functions, lead capture, env/secrets |
| 8 | `seo-engineer` | Producer | Read + Edit/Write | inherit | Titles, meta, OG/Twitter cards, JSON-LD, semantic HTML, sitemap/robots |

"Full" = Read, Edit, Write, Bash, Grep, Glob. "Read-only" = Read, Grep, Glob, WebFetch, WebSearch. Producers without Bash (copywriter, seo) cannot run tests; producers with Bash (framework, frontend, api) run the relevant tests when they touch logic.

### Boundary overlaps, resolved

- **Design-reviewer vs visual-designer:** design-reviewer enforces the current rules and tokens, and may propose changing the rules/tokens themselves (approval-gated); visual-designer pushes composition, layout, and polish toward best-in-class *within* the current system. If visual-designer wants something the system forbids, it flags to design-reviewer, which either upholds the rule or proposes evolving it. Neither edits CSS — frontend implements.
- **Copywriter vs UX on microcopy:** UX decides *that* a reassurance line belongs under the email field and *where* it sits in the flow; copywriter decides *what it says*. UX flags wording as copy's domain; copywriter flags placement/flow as UX's domain.
- **Framework vs copywriter on assessment text:** framework owns what a question must measure and its scoring; copywriter owns whether the phrasing converts. Framework flags final phrasing as copy's domain; copywriter must not change a question's measured construct or point values.
- **Visual/design vs frontend on CSS:** both design agents review and advise; frontend implements. The design agents are read-only and never edit CSS themselves.
- **SEO vs frontend on markup:** seo owns head/meta/structured-data and semantic-element choices; frontend owns layout/styling/behavior. SEO edits head and semantic structure; it flags layout/visual concerns to visual-designer/frontend.

## 5. Shared context block

Every agent prompt opens with the same short Voranta context so none re-derives it:

- **Audience:** B2B software marketing leaders / prospective Voranta sponsors.
- **Design system:** locked; authoritative in `globals.css`, demonstrated in `style-guide.html`. Three fonts with strict roles (Geist sans, Fraunces display for trust moments only, Geist Mono for labels), cyan `#0891B2` as the only accent, cool-cream paper background.
- **Copy rule:** no em-dashes anywhere; use commas or periods.
- **Build reality:** no build step for the marketing pages; single `<style>` block in each HTML file; `#section-id .class` override pattern; mobile overrides in the existing `@media (max-width: 880px)` block; assessment is vanilla ES modules (`.mjs`), no framework.
- **Ecosystem:** Vercel-platform, deploy, and performance concerns route to the existing `vercel:*` plugin agents and skills; do not duplicate them.

## 6. Standardized output format

Modeled on the existing `design-reviewer`. Every agent returns:

1. A one-line summary verdict.
2. Findings as a list, each with: a short label, a file/line or selector reference, the issue, and a suggested fix (or, for producers, the change made).
3. For producers: an explicit "Changed" section listing files touched, so nothing happens silently.
4. For reviewers: a clean-pass sentence when nothing is found (e.g., "Design check passed — no violations found").
5. A final "Out of my lane" note when the agent encountered something it deliberately did not touch, naming the discipline that owns it.

## 7. Per-agent substance

### 7.1 `ux-reviewer` (read-only)

Senior UX / conversion-UX reviewer. Audits: information architecture and navigation; funnel friction (a known finding: homepage CTAs dead-ending at a 30-minute Calendly); the assessment's interaction flow (progress indication, back-navigation, error and empty states, the ungated-results moment); mobile experience at the 880px breakpoint; perceived performance; and accessibility to WCAG AA (keyboard navigation, visible focus states, ARIA, color contrast, motion). Prioritizes findings by severity. Flags wording to copywriter and pixel-level visual choices to visual-designer. Never edits.

### 7.2 `design-reviewer` (read-only, expands existing)

Brand/system compliance reviewer. Keeps the existing ten enforcement rules verbatim (em-dashes, Fraunces misuse, accent color, gradients, shadows, radius cap, section-override selectors, CSS placement, section-head structure, no emoji/AI-sparkle). Output sections: "Violations (must fix)" against the current system, and a separate "Proposed system evolutions (your approval required)." The evolution section is where it may argue that a locked rule or token should change because doing so would be a genuine improvement; it presents the rationale and the proposed new rule, but never treats a proposal as license to relax or violate the current system in the same review. Defers layout/composition craft to visual-designer and never edits CSS itself.

### 7.3 `visual-designer` (read-only)

Senior visual design director. Owns best-in-class visual craft *within* the locked system: layout composition and balance, visual hierarchy, whitespace and vertical rhythm, typographic craft within the three-font roles, alignment and grid discipline, image and asset treatment, and cross-page visual consistency. Its mandate is ambition, not compliance: push each surface from "passes the rules" to "would a top-tier studio ship this," benchmarking against best-in-class B2B/SaaS marketing sites. Proposes concrete, specific elevations (not vague praise), each with a rationale. When an idea would require breaking a system rule, it flags that to design-reviewer rather than recommending a violation. Never edits CSS — frontend implements.

### 7.4 `conversion-copywriter` (producer)

B2B conversion copywriter for software marketing leaders. Principles: clarity over cleverness; specificity and proof over adjectives; one job per piece of copy; objection-handling at capture points; a trust-forward voice without hype. Hard rules: no em-dashes; no AI-hype clichés; sentence-level concision; no body copy below 14px on reading surfaces (a design-system constraint it must respect when suggesting copy length). Knows Voranta's positioning (a proprietary framework buyers research against vs. rented analyst/competitor frameworks; the anti-gated-PDF stance). Writes and revises headlines, subheads, CTAs, microcopy, and capture/result copy, always showing before/after. Must not change a framework question's measured construct or point values — flags those to `framework-architect`.

### 7.5 `framework-architect` (producer, Opus-pinned)

Expert in research methodology and diagnostic design: maturity models, scoring rubrics, psychometric soundness (validity, reliability, discriminant power, bias-free item construction), archetype/segmentation design, and translating methodology into defensible scoring logic in the `.mjs` engine. **Explicitly empowered to critique and rebuild AIPQ, DRI, and any existing framework from first principles — current frameworks are placeholder, not precedent.** Biased toward intellectual honesty over vanity-metric assessments that flatter the taker. Owns question logic, response scales, and point values; flags final consumer-facing phrasing to `conversion-copywriter`. Runs the assessment test suite after changing scoring logic.

### 7.6 `frontend-engineer` (producer)

Builds and maintains the static HTML/CSS pages and the vanilla-JS `.mjs` assessment modules. Knows the no-build-step reality, the single `<style>` block, the `#section-id .class` override pattern, the mobile `@media (max-width: 880px)` block, WebP image optimization, and accessible implementation (semantic elements, focus management, ARIA where needed). Aware of the future Next.js migration path (`fonts.ts`, `globals.css` as Tailwind v4 config) but does not pre-migrate. Runs the test suite when touching the engine. Routes deep performance and Vercel-platform questions to the existing `vercel:performance-optimizer` and vercel skills rather than reinventing them.

### 7.7 `api-engineer` (producer)

Builds Vercel serverless functions: lead capture, email delivery, env/secrets handling, input validation, and error paths with no silent failures. Knows the critical lesson that bulk content inlined in an `/api` entrypoint silently breaks the zero-config function build — entrypoints stay thin and bulk moves to `api/_*.js` (the existing `lead.js` + `_dri.js` already follow this). Targets the current Node runtime on Fluid Compute (not Edge). Routes platform configuration, deploy, and runtime-tuning questions to `vercel:deployment-expert` and the `vercel:vercel-functions` skill.

### 7.8 `seo-engineer` (producer)

Owns on-page discoverability: page titles, meta descriptions, Open Graph and Twitter card tags, JSON-LD structured data (Organization, WebSite, and product/assessment schema where apt), semantic HTML for search, heading order, canonical URLs, sitemap and robots. Works within the locked design system and never alters visual layout — flags those to visual-designer/frontend. May recommend adding a measurement stack (e.g., Vercel Analytics or a privacy-friendly alternative) but adds no event-tracking code or guidance until one is chosen and present. Routes Vercel-specific SEO/analytics product questions to the vercel skills.

## 8. Orchestration layer (CLAUDE.md Agent Playbook)

A short new section appended to CLAUDE.md, not a heavy gate system:

- **Ownership map:** one line per agent stating its discipline and boundary.
- **Default build sequence for a new section or feature:** `framework-architect` (if methodology is involved) → `conversion-copywriter` (words) → `frontend-engineer` / `api-engineer` (build) → `visual-designer` + `ux-reviewer` + `design-reviewer` in parallel (read-only review) → fixes → `seo-engineer` pass on any new/changed page.
- **Pre-commit convention:** run `visual-designer`, `ux-reviewer`, and `design-reviewer` on any changed page before committing; run `seo-engineer` when a page is added or its content/structure changes.
- **Reminder:** the main thread dispatches; agents do not call each other. When an agent flags out-of-lane work, the main thread routes it to the owning agent.

## 9. Non-goals

- No meta-orchestrator agent.
- No standalone performance agent (covered by `vercel:performance-optimizer`).
- No analytics/event-instrumentation work until a measurement stack is chosen.
- No Next.js migration work — agents are migration-aware but do not pre-migrate.
- No changes to site content or code as part of this task; this task only creates the agents and the playbook.

## 10. Acceptance

- Eight `.claude/agents/*.md` files exist with correct frontmatter (`name`, `description`, `tools` where restricted, `model: opus` only on `framework-architect`).
- `design-reviewer.md` retains all ten original enforcement rules and adds the approval-gated "Proposed system evolutions" section.
- `visual-designer.md` covers best-in-class visual excellence within the system and flags rule conflicts to design-reviewer.
- Each prompt contains the shared context block, an explicit boundary with flag-don't-touch language, the standardized output format, and ecosystem-deferral language where relevant.
- CLAUDE.md contains the Agent Playbook section.
- Spec and files committed to the branch.
