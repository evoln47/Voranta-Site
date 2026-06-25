# Contract-AI-Readiness Diagnostic — Framework Context

**Research context for the `framework-architect` agent. Compiled 2026-06-25.**

This document is the evidence base and design brief for the Phase 0 beachhead framework:
a **contract-AI-readiness diagnostic** for the Contract AI / CLM value-prop cluster. It is
written to be read by the architect before any pillar is drafted, and to survive a skeptical
sponsor reading. Every claim below is tagged for evidentiary status. Vendor marketing is
labeled as positioning, not fact. Six framings were adversarially refuted in research and are
quarantined in §8 so they do not leak into the instrument.

The job of the diagnostic is structural, not editorial: **a framework is constant across one
competitive set that sells the same business outcome, so a taker's weakest pillar maps to the
exact capability gap the sponsor's product closes.** Exclusivity is sold inside the cluster.
Design the pillars so that mapping is clean, defensible, and hands a sponsor AE a live opening.

---

## 0. The strategic frame (carried from the segment brief)

- **Segment axis = value-prop cluster, not AI sub-vertical.** The cluster is defined by a
  shared business outcome, and the members compete head-to-head on it. That shared outcome is
  the spine of the framework (see §1).
- **Committed Phase 0 cluster: Contract AI / CLM.** Chosen on combined structure × propensity:
  members compete head-to-head; the cluster has a proven licensed-research culture (Icertis runs
  a 3-year "State of Contracting" benchmark, see §6); and the buyer (GC / legal ops /
  procurement) is a business buyer who responds to maturity diagnostics.
- **Primary sponsor candidates / buyers: Ironclad, Sirion, Luminance.** Each must have at least
  one pillar where it is uniquely positioned to close the gap (§3, §4).
- **Icertis = format competitor, NOT a buyer.** It self-produces its own benchmark. Treat it as
  the reference standard for what licensed CLM research looks like, and as the AI-positioning
  baseline for the cluster — not as a sales target.
- **Disqualified, do not list as sponsors:** Evisort (acquired by Workday), Cognigy (acquired by
  NICE — a different cluster entirely, CCaaS). Evisort may still appear as a competitive
  reference inside accounts but is not a sponsor.
- **Economics flag the architect should respect:** this is a 1–2 premium-sponsor beachhead, not
  a 5–8 sponsor framework. The pillar set should be sharp enough that two sponsors with distinct
  gaps both see themselves in it, rather than diluted to fit a crowd.

---

## 1. The one shared value proposition (the framework's spine)

**Verified (3-0).** The entire cluster has converged on a single positioning: contracts move
from a passive **"system of record"** to an active **"system of action,"** where every
agreement is reframed as a **reusable, queryable business asset** — unstructured content turned
into structured, actionable data. This is not three messages; it is one message the architect
should mirror in the diagnostic's own language.

- Ironclad: "leading the category transformation from a system of record to a system of action,"
  and the Nov 13 2025 release is literally titled *"Every Agreement is Now an Asset."* CEO:
  "moving beyond process automation to intelligent contracting that unlocks data to drive
  strategic business outcomes."
- The shared message implies a **three-stage maturity arc** the cluster already speaks aloud:

> **Repository → Intelligence → Action**

**Verified (3-0):** Ironclad publishes its own *"AI contracting maturity stages"* article whose
arc is foundational repository/OCR → workflow → predictive intelligence → agentic. **Use this as
the maturity spine.** It is the cluster's own published vocabulary, which means a sponsor AE can
talk to it without translation. Do **not** substitute a generic 5-level CMMM "Ad hoc → Optimized"
ladder — that specific model was sourced only from a marketing blog and was refuted in research
(§8).

**Design implication.** The three stages are the *rows* of the maturity model; the pillars (§3)
are the *columns*. A taker sits at a stage on each pillar. The lowest-scoring pillar is the
bottleneck, and the bottleneck is the sale.

---

## 2. Recommended scoring posture (bottleneck, not compensatory)

This is the single most important structural decision, and the house already has a precedent for
it. The `aipq-methodology.md` rebuild settled that a "succeeds, then stalls on one constraint"
thesis demands a **non-compensatory / bottleneck aggregation** — a strong pillar must not be
allowed to rescue a weak one, because the weak one is the whole point.

The contract-AI-readiness diagnostic has the *same* shape, for a sharper reason: the commercial
mechanic literally depends on the weakest pillar being legible. If the aggregation is a
compensatory weighted mean, a taker with one catastrophic gap and five strengths scores "fine,"
the bottleneck disappears into the average, and the sponsor AE loses the opening. **Recommend a
min-style or steep-penalty aggregation so the weakest pillar surfaces as the headline finding,**
and report the per-pillar profile, not just a single number. The deliverable to the taker is
"here is your binding constraint"; the deliverable to the sponsor is "and here is who closes it."

---

## 3. The proposed pillar set (each pillar → a capability gap a sponsor sells)

Seven candidate pillars, mapped to the maturity arc and to the named products that close each
gap. The architect should treat this as a strong starting hypothesis to pressure-test and prune
(7 is likely too many for a clean instrument — see the consolidation note after the table), not
as settled. The value of the set is that **every primary sponsor owns at least one pillar
outright**, so any of them can point a taker at their own product.

| # | Pillar (working name) | Maturity stage | What "good" looks like | Weakness maps to → product | Primary owner(s) |
|---|---|---|---|---|---|
| 1 | **Contract Data Foundation** | Repository | Whole estate digitized, OCR'd, metadata-structured, machine-readable | Metadata extraction from third-party paper; estate migration | Ironclad *Intake Agent*; Sirion *Extraction Agent* |
| 2 | **Playbook Codification** | Repository → Intelligence | Standards, fallback language, clause bank, and risk tolerances are digitized and machine-applicable | AI redlining is *blocked* without this; vendors sell the codification service itself | Ironclad *Redlining Agent* + Services; Sirion *Playbook Agent*; (precondition for Luminance too) |
| 3 | **AI Review & Redlining** | Intelligence | AI flags missing clauses, risky terms, compliance gaps, and proposes first-pass redlines against the playbook | Risk/deviation detection + redline generation | Ironclad *Redlining Agent*; Sirion *Issue Detection* + *Redline* Agents |
| 4 | **Repository Intelligence & Retrieval** | Intelligence | The estate is queryable in natural language; obligations and terms are findable on demand | Conversational/semantic search over the repository | Ironclad *Conversational Search*; Sirion *Search Agent* |
| 5 | **Post-Signature Governance** | Action | Obligations, renewals, and compliance are tracked and acted on *after* signing | Obligation management / lifecycle governance | **Sirion (uniquely owns)** |
| 6 | **Institutional Memory & Explainability** | Intelligence → Action | Negotiation rationale is captured; the org can answer "who agreed to this, and why?"; decisions show the "why," not just the "what" | Memory-aware, explainable contracting | **Luminance (uniquely owns)** |
| 7 | **Autonomous Contracting Readiness** | Action (apex) | Governance, guardrails, and trust exist to let AI negotiate against AI with controlled human oversight | Autonomous / agent-to-agent negotiation | **Luminance (uniquely owns)** |

**Why this set hands every sponsor a live opening:**

- A taker weak on **Post-Signature Governance** → Sirion's lifecycle/obligation story.
- A taker weak on **Institutional Memory** or **Autonomous Readiness** → Luminance.
- A taker weak on **Intake / Redlining / Repository Search** → Ironclad (or Sirion).
- A taker weak on **Playbook Codification** → all three have a play, and each *monetizes the
  codification itself* (Ironclad's Services team will translate existing guidance into a
  "Jurist-ready playbook"; Sirion's Playbook Agent "transforms institutional knowledge into
  standardised playbooks"). This is the single cleanest "weakness = a specific sponsor sale"
  pillar in the set — see §5.

**Consolidation note.** Seven pillars is the upper bound; a tighter instrument might fold
**Repository Intelligence (4)** into **Contract Data Foundation (1)** (both are "is the estate
usable as data?"), yielding a clean six that still preserves every sponsor's owned pillar. Do not
drop 5, 6, or 7 — those are the *only* pillars uniquely owned by Sirion and Luminance, and
removing them collapses the two-sponsor economics. Pillars 1–4 are where Ironclad and Sirion
overlap (shared ground); 5 is Sirion-only; 6–7 are Luminance-only. Keep that ownership balance.

---

## 4. Per-vendor capability map (the raw material for pillar → product mapping)

All three are framed around **agentic, multi-model AI architectures composed of discrete, named,
lifecycle-spanning agents.** Each named agent is a ready-made pillar → capability-gap mapping.
(One caution: "multi-model architecture" is *table stakes*, not a differentiator — Ironclad,
Sirion, **and** Icertis all market it. Do not build a "model flexibility" pillar; it discriminates
nobody. See §8.)

### Ironclad — *workflow-native CLM, intake + playbook redlining + conversational repository*
**Verified (3-0).** Nov 13 2025 "next wave of AI agents," a unified network of named agents:
- **Intake Agent** — "automatically extracts metadata from third-party contracts and assists
  users with filling out launch forms to accelerate contract intake." → Pillar 1.
- **Redlining Agent** — "highlights missing clauses, risky terms, or compliance gaps within a
  document based on playbooks," performing "first-pass redlines based on a company's pre-approved
  legal playbooks." → Pillars 2 + 3.
- **Conversational Search** — "enables natural language querying within your Contract
  Repository." → Pillar 4.
- These join **Jurist**, the commercial-legal assistant (engine of Manager, Drafting, Editing,
  Review, Research Agents; the Manager Agent is the orchestrator). Built on Ironclad's "secure,
  multi-model architecture."
- **Analyst standing:** Leader in the 2025 Gartner Magic Quadrant for CLM, third consecutive year;
  top **Current Offering** score in the Forrester Wave (Q1 2025).
- **Timing caveat:** a *later* Ironclad release (March 19 2026, "New AI Assistant and Agents," PR
  302717729) was not fully covered in research and may rename/supersede the Nov 2025 lineup.
  Verify the current agent names before locking them into pillar copy (§7, §9).

### Sirion — *agentOS-governed multi-model agents across the full lifecycle, incl. post-signature*
**Verified (3-0).** Platform built on **agentOS**: "a secure, extensible framework to build,
orchestrate, and govern specialized agents. Its multi-model architecture dynamically deploys
curated combinations of proprietary and open-source large and small language models." Six
out-of-the-box named agents (Oct 9 2025):
- **Search** ("finds, reasons and retrieves contract intelligence") → Pillar 4
- **Draft** ("drafts contracts based on approved templates")
- **Issue Detection** ("identifies deviations from playbook") → Pillar 3
- **Redline** ("surgically redlines deviations with clear explanations") → Pillar 3
- **Extraction** ("converts documents into structured contract intelligence") → Pillar 1
- **Playbook** ("transforms institutional knowledge into standardised playbooks") → Pillar 2
- Agents span "every step in the contracting lifecycle — from drafting and negotiations to risk
  assessment and **post-signature governance**." → **Sirion uniquely owns Pillar 5.**
- **Analyst standing:** Leader in the Forrester Wave for CLM (Q1 2025).
- **Do NOT use:** the framing that Sirion's AI was "built organically in-house over 15+ years /
  not bolted on" was refuted (0-3). Do not attribute it. (§8)

### Luminance — *autonomous, explainable, memory-aware negotiation (top of the ladder)*
**Verified (3-0).**
- **Autonomous Negotiation** (formerly "Autopilot") — positioned as "the only platform capable
  of 100% AI-powered, agent-to-agent contract negotiation that is fully autonomous, with zero
  human intervention required" (Legalweek, March 11 2026). Being opened beyond legal teams to any
  enterprise user (beta with design partners; full launch slated spring 2026). → **Luminance
  uniquely owns Pillar 7.** (The "only" is a narrowly-scoped self-asserted superlative; Pactum
  does agent-to-supplier procurement, not agent-to-agent legal. Frame as positioning.)
- **Institutional Memory / Explainability** (Jan 27 2026) — "multi-agent architecture, where
  specialist AI agents operate across every stage of the contract lifecycle... Each agent draws
  on both short-term memory (outputs from previous reasoning steps) and long-term memory
  (negotiation history, related contracts, portfolio-wide precedent)." Surfaces "the why behind
  every decision, not just the what." Frames the core problem as **"enterprise amnesia"** —
  systems that captured outcomes but lost the reasoning. CEO: "Whenever it's time to renegotiate
  a contract, executives ask: who agreed to this, and why?" → **Luminance uniquely owns Pillar
  6.**
- **Do NOT cite as fact:** the "reclaim 30%+ of legal teams' time" and "90% negotiation-time"
  figures are unverified vendor marketing. Use them as directional positioning only, attributed.

---

## 5. The keystone insight: Playbook Codification is the assessable prerequisite

**Verified (3-0).** AI redlining presupposes a codified playbook. Ironclad's own support docs:
"The key prerequisite is having an approved, properly formatted playbook... before you can use it
for the Redlining Agent functionality." And Ironclad monetizes the gap directly: "the Ironclad
Services team will help you review existing guidance (playbooks, clause banks, etc.) and translate
those materials into a Jurist-ready playbook with your preferred positions, fallback language, and
risk tolerances."

Why this matters for the framework:
- It is **concrete and assessable.** A taker either has digitized, machine-applicable standards
  (clause bank, fallback language, risk tolerances) or does not. That is a clean question set.
- It is a **precondition for the cluster's flagship capability** (AI redlining), so a weak score
  here is a credible, urgent finding — not an abstract "you're immature" verdict.
- **Every primary sponsor sells the fix.** Ironclad (Services + Redlining Agent), Sirion
  (Playbook Agent), and Luminance (autonomous negotiation also requires encoded standards). A
  weak Playbook Codification score is the rare pillar that hands *all three* AEs an opening, which
  makes it the safest pillar to feature in a sponsor pitch when the sponsor is not yet committed.

Treat Pillar 2 as the diagnostic's center of gravity.

---

## 6. The licensed-research reference point (Icertis) and the adoption anchor

**Verified (3-0).** Icertis runs the annual **"State of Contracting"** benchmark (now in its
third consecutive year) — the format the diagnostic should emulate as a licensed-research artifact
and the cultural proof that this cluster buys research. Its 2026 report quantifies the current
adoption stage:

- **44%** of companies have deployed, or are actively deploying, AI in contracting workflows.
- **44%** use AI for **contract review**; **20%** use AI for **redlining**. Summarization also
  leads.

**Use of the anchor.** The "44% / review-redline-summarize" figure is the *current adoption stage*
the diagnostic positions a taker against ("you are ahead of / behind the 44%"). Review, redlining,
and summarization are the three most-validated AI use cases — build Pillar 3 around them with
confidence. **Caveat:** the 44% is vendor-published and promotionally framed; present it as a
directional benchmark, attributed to Icertis, not as independent ground truth.

**Do NOT cite** (all refuted in research, §8): the "500+ practitioners across legal/procurement/
finance" sample composition; the "55% data quality / 44% C-suite trust" blocker stats; the "50%+
of C-suite expect AI agents to autonomously negotiate within 12 months" stat. They sound usable
and are not verified.

**Analyst framing for the "one competitive set" claim (verified, 3-0):**
- 2025 **Forrester Wave for CLM** evaluated the 12 most significant providers; **four Leaders:
  Icertis, Ironclad, Sirion, Agiloft.** Scored on **Current Offering, Strategy, and Customer
  Feedback** (note: "Customer Feedback" became a dot-size element rather than a positional axis in
  the 2024 methodology — describe loosely). Ironclad took top Current Offering; Icertis took top
  Strategy.
- This establishes the credible "one competitive set" framing the segment thesis needs: these
  vendors are evaluated *against each other*, on the *same* outcome.

---

## 7. Terminology to mirror (the cluster's actual language)

The diagnostic earns credibility by speaking the buyer's and vendor's words. Use these; they are
load-bearing in the cluster's marketing and analyst coverage:

- **Spine / vision:** "system of record → system of action," "every agreement is an asset,"
  "active assets," "structured, actionable data," "intelligent contracting."
- **Architecture:** "agentic CLM," "multi-agent architecture," "named agents," "agentOS,"
  "multi-model architecture" (table stakes — describe, don't grade), "orchestration."
- **Capabilities:** "metadata extraction," "third-party paper," "contract intake," "first-pass
  redline," "issue/deviation detection," "conversational search / natural-language querying,"
  "obligation management," "post-signature governance."
- **Playbook vocabulary:** "playbook," "clause bank," "fallback language," "preferred positions,"
  "risk tolerances," "approved templates."
- **Luminance-specific:** "enterprise amnesia," "institutional memory," "short-term / long-term
  memory," "the why behind every decision," "autonomous negotiation," "agent-to-agent."
- **Adoption use cases:** "contract review," "redlining," "summarization."
- **Buyer personas:** General Counsel (GC), legal operations, procurement, sales operations, and
  CFO/finance for the value narrative. The diagnostic should let any of these self-identify.

---

## 8. Guardrails — refuted framings and unverified numbers (do NOT bake in)

These were adversarially tested in research and either refuted or flagged as unverified marketing.
Keeping them out of the instrument is part of surviving a skeptical sponsor read.

**Refuted (do not use, do not attribute):**
1. Sirion's AI "built organically in-house over 15+ years / not bolted on" (0-3).
2. Icertis benchmark "500+ practitioners across legal/procurement/finance" sample composition (1-2).
3. Blocker stats "55% cite data-output quality / 44% of C-suite cite trust in AI autonomy" (0-3).
4. "50%+ of C-suite expect AI agents to autonomously negotiate within 12 months" (1-2).
5. The HyperStart **5-level CMMM** ("Ad hoc → Basic → Defined → Managed → Optimized") and its
   six-dimension breakdown (both 0-3, blog-quality). **Do not borrow this maturity spine** — use
   Ironclad's published "repository → intelligence → action" arc instead (§1).

**Unverified vendor outcome numbers (use only as attributed, directional positioning):**
- Luminance "reclaim 30%+ of legal team time," "90% negotiation time."
- Icertis "44% adoption" — directionally usable as a benchmark, attributed; not ground truth.

**Table-stakes, not a differentiator:** "multi-model / model flexibility." All three primaries
*and* Icertis market it. A pillar built on it discriminates no one and gives no sponsor an opening.

---

## 9. Open questions and validation gates (resolve before/while building)

These are the gaps research could not close; the architect should design around them or trigger a
follow-up before locking the instrument.

1. **Ironclad's March 19 2026 release** (PR 302717729, "New AI Assistant and Agents") may rename
   or supersede the Nov 2025 agent lineup the pillar mapping leans on. Verify current agent names
   before they go into taker-facing or sponsor-facing copy.
2. **Landscape competitors under-evidenced.** No verified claims survived for DocuSign CLM/IAM,
   Agiloft, ContractPodAi/Leah, Malbek, LinkSquares, SpotDraft, Conga, or the Evisort→Workday
   move. The "constant across one competitive set" claim is currently evidenced only by the three
   primaries plus Icertis. If the framework needs to credibly span the whole cluster, commission
   a targeted second pass on these names.
3. **No evidence-backed "blockers" pillar.** The Icertis trust/data-quality blocker stats were
   refuted, so there is currently *no* independently-sourced failure-mode data (legacy-contract
   migration, data quality, CRM/ERP/procurement integration, trust in AI redlining). If a
   "blockers/readiness-risk" pillar is wanted, source it from analyst or academic work first — do
   not infer it from vendor marketing.
4. **Luminance Autonomous Negotiation GA status.** It was design-partner beta with full launch
   "spring 2026." Confirm whether Pillar 7 tops out at a *shipping* capability or an *aspirational*
   one as of the build date, and what governance/guardrail features exist — this changes whether
   the apex pillar measures readiness for a real product or a roadmap.
5. **Sponsor validation gate (from the segment brief, binding before build):** 2–3
   contract-cluster sponsor conversations must confirm the diagnosis hands their AEs a live
   opening. If a sponsor cannot see the sale in the weakest-pillar mapping, the pillar set is
   wrong — revise §3 before committing engineering.

---

## 10. Sources

Primary (vendor positioning — authoritative for *language and positioning*, not for independently
verified efficacy):
- Ironclad next-wave agents (Nov 13 2025): prnewswire.com/news-releases/introducing-ironclads-next-wave-of-ai-agents-every-agreement-is-now-an-asset-302614708.html; ironcladapp.com/resources/articles/ai-agentic-launch
- Ironclad AI contracting maturity stages: ironcladapp.com/resources/articles/ai-contracting-maturity-stages
- Ironclad Gartner MQ Leader 2025: prnewswire.com/news-releases/ironclad-named-a-leader-in-the-2025-gartner-magic-quadrant-for-contract-life-cycle-management-for-third-consecutive-year-302615851.html
- Sirion platform / agentOS: sirion.ai/platform/; businesswire.com/news/home/20251009924272; sirion.ai/press/next-gen-agentic-clm-360-conversational-contracting/
- Luminance autonomous negotiation: luminance.com/press/luminance-enhances-the-legal-industrys-only-100-ai-autonomous-contract-negotiation-tool-to-show-the-why-behind-every-decision-and-opens-it-to-the-entire-enterprise/
- Luminance institutional memory / "enterprise amnesia": luminance.com/press/luminance-launches-new-legal-ai-with-institutional-memory-addressing-enterprise-amnesia/
- Icertis 2026 State of Contracting: icertis.com/company/news/features/2026-state-of-contracting-report-highlights-key-trends-shaping-the-year-ahead/
- Forrester Wave for CLM (via Icertis intro): icertis.com/research/analyst-reports/forrester-wave/intro/; forrester.com/report/RES181997

Supporting: IEEE Spectrum (Luminance Autopilot history, spectrum.ieee.org/ai-contracts); Legal IT
Insider (CLM implementation failure modes — independent but blog-quality, treat as directional).

**Evidentiary note.** All primary sources are vendor press releases / marketing pages and
analyst-report summaries reproduced on vendor sites. They are authoritative for what a context
doc needs — *how the cluster positions and what language it uses* — but not for independently
verified outcomes. Every quantified outcome claim in this cluster should be treated as unverified
marketing until an independent source confirms it.
