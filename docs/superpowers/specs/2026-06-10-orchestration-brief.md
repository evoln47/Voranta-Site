# Voranta Site Polish — Orchestration Brief

- **Date:** 2026-06-10
- **Purpose:** A driver brief for an Opus orchestrator session that runs the eight Voranta subagents to audit, plan, and polish voranta.co to a clean, stable, externally-presentable state, unattended.
- **How to use it:** Open a session on Opus, create a fresh branch, set a non-blocking permission posture, then paste the kickoff prompt below. The orchestrator follows this document.

---

## Kickoff prompt (paste this to start the run)

> You are the Opus orchestrator for a multi-agent polish run on voranta.co. Read `docs/superpowers/specs/2026-06-10-orchestration-brief.md` in full and follow it exactly. Read `docs/superpowers/orchestration-progress.md` if it exists and resume from it; if it does not exist, create it from the template in the brief and start a fresh run. Confirm you are on a non-main branch before any edit. Run the audit, plan, implement, review loop until the Acceptance Bar is met, committing after each task and updating the progress file every cycle. Serialize all producer edits to a shared file (one editing agent at a time). Do not merge to main. Park any proposed brand-system evolutions for human approval. When the bar is met, stop, push the branch, and present a summary with the preview URL.

---

## 1. Roles and models

The orchestrator is the main session (Opus). It dispatches subagents; subagents cannot call each other, so every handoff routes through the orchestrator.

| Agent | Lane | Type | Model |
|---|---|---|---|
| `framework-architect` | Methodology, scoring, archetypes | Producer | opus |
| `conversion-copywriter` | Headlines, subheads, CTAs, microcopy | Producer | sonnet |
| `frontend-engineer` | Static HTML/CSS, `.mjs` assessment | Producer | sonnet |
| `api-engineer` | Vercel serverless, lead capture, env | Producer | sonnet |
| `seo-engineer` | Titles, meta, OG, JSON-LD, semantics | Producer | sonnet |
| `design-reviewer` | Brand and design-system compliance | Reviewer (read-only) | sonnet |
| `visual-designer` | Layout, hierarchy, craft within the system | Reviewer (read-only) | sonnet |
| `ux-reviewer` | Flows, IA, funnel friction, a11y | Reviewer (read-only) | sonnet |

Models are pinned in each agent's frontmatter. The orchestrator does not need to pass model overrides.

## 2. Scope

In scope: every page in the repo that ships to visitors (currently `index.html`, plus any assessment pages and `/api` functions that exist at run time), their copy, structure, SEO, methodology, and front-end and back-end behavior.

Out of scope: anything requiring external credentials or accounts that are not already configured (for example, a Resend key for live lead email); net-new product surfaces not asked for; the locked design system itself (it may be *proposed* against, never silently changed).

## 3. Acceptance Bar (the stop condition)

"Externally presentable" is not a feeling; it is the conjunction of these gates. The loop runs until all three hold, then stops.

**3.1 Objective gates (must all pass):**

- Tests green: `node --test "test/*.test.mjs"` passes (if a `test/` suite exists).
- `design-reviewer` returns zero violations on every changed page.
- All internal links and asset references resolve; no obvious broken states in the markup.
- SEO essentials present on every page: title, meta description, canonical, Open Graph, Twitter card, and at least one valid JSON-LD block.
- No em-dashes anywhere in copy; no design-system violations (cyan-only accent, Fraunces only on trust moments, no gradients or drop shadows, radius <= 16px).

**3.2 Stability gate (the real terminator):**

- Two consecutive full review passes (all three reviewers, all pages) produce zero new must-fix or high-priority findings. Polish stops at stability, not at subjective perfection.

**3.3 Hard backstop (anti-churn):**

- Cap at three implement-then-review cycles per page. If a page has not reached zero new must-fix findings after three cycles, stop working it, record why in the progress file, and escalate it to the human rather than looping further.

## 4. The loop

Follow the build sequence from `CLAUDE.md`: methodology, then copy, then build, then review, then SEO.

**Phase 0 — Branch and progress check.** Confirm a non-main branch. Create or resume `docs/superpowers/orchestration-progress.md`.

**Phase 1 — Audit (parallel reviewers).** Dispatch `design-reviewer`, `visual-designer`, and `ux-reviewer` in parallel, read-only, each returning a prioritized findings list for its lane. Optionally dispatch `seo-engineer` and `framework-architect` in audit-only mode (instruct them to report, not edit) for their lanes. Collect everything into one backlog in the progress file, deduplicated and tagged by owning agent and priority.

**Phase 2 — Plan.** The orchestrator synthesizes the backlog into a sequenced task list: resolve cross-lane overlaps (for example, microcopy is copywriter, not ux; assessment question wording is framework, not copy), order by dependency and impact, and assign each task to exactly one producer.

**Phase 3 — Implement (serialized per file).** Dispatch producers one task at a time for any shared file. Because the site is effectively one file per page with a single `<style>` block, never run two producers against the same file in the same turn; the second would edit stale content and clobber the first. Reviewers may still run in parallel because they only read.

**Phase 4 — Re-review and commit.** After each page or cluster, run the review trio in parallel, apply fixes through the owning producer, and commit per logical unit with a clear message. Update the progress file.

**Phase 5 — Converge or escalate.** Repeat phases 3 and 4 until the stability gate holds or the backstop trips. Then stop.

## 5. Guardrails

- **Branch only; never merge to main.** `main` auto-deploys to production on push. The run lives on a feature branch. Pushing the branch is encouraged (it yields a Vercel preview deploy to inspect). Merging to main is the human gate and the run never performs it.
- **Serialize producer edits to shared files.** One editing agent per file per turn. This is the top source of silent corruption in a run like this.
- **Park brand evolutions.** `design-reviewer` may propose system evolutions; these require human approval and are recorded in the progress file under "Parked for human", never auto-applied.
- **Commit after every task.** Progress must be durable so compaction or an overnight interruption never loses the plan or the work.
- **Respect the locked system and copy rules** at all times (see `CLAUDE.md` and `globals.css`).
- **Stay in lane.** When an agent flags out-of-lane work, the orchestrator routes it to the owning agent rather than letting the flagging agent reach across.

## 6. Honest limits

- The reviewers reason about **code, not rendered pixels**. There is no screenshot or browser tool in this setup. The loop drives the site to a clean, compliant, stable *code* state. The final judgment of whether it looks genuinely S-tier is the human viewing the **preview deploy**. Expect one or two human review passes after the run, not a guaranteed one-shot.
- Anything gated on external accounts or secrets cannot be completed unattended and is recorded as a blocker for the human.

## 7. Progress file convention

The orchestrator maintains `docs/superpowers/orchestration-progress.md` and updates it every cycle. It is the durable memory that survives compaction. Template:

```markdown
# Orchestration Progress

- Branch: <branch-name>
- Run started: <timestamp>
- Last updated: <timestamp>
- Current phase: <audit | plan | implement | review | done>

## Acceptance Bar status
- Objective gates: <pass/fail per gate>
- Stability gate: <consecutive clean passes: N of 2>
- Pages at backstop (escalated): <list or none>

## Backlog (open)
- [ ] <priority> | <owning agent> | <page> | <finding> | <cycle count>

## Done this run
- [x] <task> | <commit sha> | <agent>

## Parked for human (require approval)
- <design-reviewer proposed evolution, or external-secret blocker>

## Notes
- <anything the next cycle or the human needs to know>
```

## 8. Next-session checklist (for the human)

1. Switch the session to Opus (`/model`).
2. Create a fresh branch off `main` (or let the orchestrator do it as its first step).
3. Set a non-blocking permission posture so the run does not stall on edit and commit prompts. Bypass-permissions is the usual choice; it is de-risked here because the run is confined to a branch and never merges to main. This is your call.
4. Paste the kickoff prompt from the top of this brief.
5. Walk away. Return to the preview deploy and the progress file, review, and merge to main yourself if it meets your bar.
