# Contract-AI-Readiness Diagnostic Methodology

**CARD. Version 0.9 (pre-calibration draft).**

This document is the reasoning behind the Contract-AI-Readiness Diagnostic (CARD). It is
written to be read by a skeptical sponsor AE, a sharp legal-tech analyst, or a General
Counsel who has been burned by a legal-tech project before, and to survive that reading.
Where a claim is theory and not yet measured, it says so. Where a number is a placeholder
prior, it is labeled as one. Where a vendor's framing is positioning rather than verified
fact, it is named as positioning. Nothing here is written to flatter the taker.

Status note. This is a methodology design from the research context at
`docs/contract-ai-readiness-research-context.md`, not a description of an existing page.
The 7-pillar hypothesis in that context's §3 is treated as a strong starting hypothesis to
pressure-test and prune, not as settled precedent. Where this design diverges from the
hypothesis (the pillar count, the consolidation, the Organizational Readiness call), the
divergence is called out and justified rather than made silently. House conventions follow
`docs/aipq-methodology.md`, especially its §4 (aggregation), §5 (pillar scoring), and §6
(calibration).

---

## 0. What the 7-pillar hypothesis got right, and the three calls this document makes

The research context proposed seven candidate pillars mapped to a maturity arc the cluster
itself speaks aloud (Repository to Intelligence to Action) and to named vendor products
that close each gap. That hypothesis is mostly sound, and this design keeps its spine. But
seven is the upper bound for a clean instrument, and three structural decisions were left
open. This document makes all three.

1. **Consolidate Contract Data Foundation (1) and Repository Intelligence (4) into one
   pillar.** Both answer the same latent question, "is the contract estate usable as
   data?" One is "is the estate captured and structured," the other is "can you query it."
   These are two halves of one construct: an estate is not usable data until it is both
   structured and retrievable, and they fail together far more often than apart. Holding
   them apart inflates the pillar count without adding discriminant power, and both still
   map to the same sponsor products (Ironclad Intake plus Conversational Search, Sirion
   Extraction plus Search). Consolidated into a single pillar, **Your Contract Estate as
   Usable Data**, with both halves tapped by items. This yields six pillars.

2. **Organizational Readiness becomes a pre-qualifier module, not a scored pillar.** The
   context's §12 proposes it either way. It is dissolved out of the scored set for a
   reason of construct hygiene: it measures *readiness to succeed with a CLM at all*
   (executive sponsorship, change management, integration scoping), not *maturity of AI
   capability* the way the other six do. Mixing the two kinds of construct into one
   bottleneck score would let an organizational risk masquerade as a capability gap, or
   vice versa, and blur the commercial mapping. It is retained as a short, unscored
   **Implementation Readiness pre-qualifier** (§2.7) that flags pre-sales risk to the
   sponsor without entering the headline diagnosis. The commercial argument the context
   makes for keeping it (a weak readiness signal means services revenue before the
   software sale) is fully preserved by surfacing it to the sponsor as a flag.

3. **Pillar count lands at six.** Six separates the cluster's distinct capability failure
   modes, preserves every sponsor's owned pillar (Sirion owns one, Luminance owns two,
   Ironclad and Sirion share the foundation pillars), and is short enough that a GC or
   legal-ops director finishes in about two minutes. This matches the house bias toward a
   tight instrument and the context's own warning to resist going above seven.

Everything else in the hypothesis is kept and sharpened.

---

## 1. Construct definition and what the diagnostic is for

A diagnostic is only as honest as the thing it claims to measure. This is defined first,
because every pillar, level, and threshold downstream exists to characterize *this* and
nothing else.

### 1.1 What CARD is, and is not

CARD is a **maturity diagnostic, not a predictive model.** It does not claim to predict a
dated outcome the way the AIPQ instrument predicts production conversion. It characterizes
*where an organization stands today* on the capabilities the Contract AI / CLM cluster has
converged on selling, and *which single capability is the binding constraint* on the
organization's next step. The honest framing to a sponsor is: "this tells your prospect
where they actually are, and hands you the one gap that is blocking them." It is a mirror
held up with precision, not a forecast.

### 1.2 Unit of analysis

The unit is **the organization's contracting function**, scoped to one estate of
agreements under one governance regime. Not a single contract, not a single workflow, and
not "the company" in the abstract. The taker is answering for the body of contracts their
function owns and the practices around them. An enterprise with genuinely separate
contracting regimes (for example a regulated insurance arm and a commercial software arm
run independently) is expected to take CARD once per regime, because the maturity profile
will differ.

### 1.3 What "readiness" means, and what it is read against

Readiness is defined against the cluster's own published maturity arc, **Repository to
Intelligence to Action** (verified as the cluster's own vocabulary in the research
context's §1, sourced to Ironclad's published "AI contracting maturity stages"). This arc
is the *rows* of the model; the six pillars are the *columns*. A taker sits at a stage on
each pillar.

- **Stage 1, Repository.** The estate exists as documents and is being managed as a system
  of record. The work is captured but passive.
- **Stage 2, Intelligence.** The estate is structured, queryable, and machine-readable;
  the organization can ask questions of its contracts and apply standards to them.
- **Stage 3, Action.** Contracts behave as active assets: obligations are tracked and
  acted on, rationale is retained, and AI operates against the organization's encoded
  standards with controlled oversight.

What readiness is *predictive of* is stated as theory, not as a measured rate: an
organization that scores at Stage 2 or above on **Playbook Codification** is positioned to
adopt AI redlining, because a codified, machine-applicable playbook is the verified
prerequisite for it (research context §5). An organization sitting at Stage 1 on that
pillar cannot deploy AI redlining no matter what else it buys. That is a structural claim
grounded in the cluster's own product documentation, not a calibrated probability.
Section 6 is explicit about which claims are theory and which would require post-launch
data to confirm.

### 1.4 The commercial mechanic this serves

A framework is constant across one competitive set that sells the same business outcome.
The cluster has converged on one outcome (contracts moving from a system of record to a
system of action, every agreement reframed as a reusable, queryable asset, verified 3-0 in
the context). Because the outcome is shared, a taker's **weakest pillar maps to the exact
capability gap a sponsor's product closes.** The deliverable to the taker is "here is your
binding constraint." The deliverable to the sponsor is "and here is who closes it." This
is why the aggregation must be non-compensatory (§3): if a strong pillar were allowed to
average away a weak one, the binding constraint would disappear and the sponsor would lose
the opening.

---

## 2. The pillar set, finalized and reasoned

Six pillars, each measuring one assessable construct, each named in the buyer's vocabulary
(GC, legal-ops director, procurement lead) rather than in vendor product names. For each:
the construct, what good looks like at Stage 1 / 2 / 3, and the sponsor product that closes
the gap for a taker who scores weak. Pillar 2 is the keystone and the diagnostic's center
of gravity.

### 2.1 Pillar 1. Your Contract Estate as Usable Data *(consolidated from hypothesis 1 + 4)*

- **Construct.** Whether the organization's body of contracts, including third-party
  paper and historical agreements, has been captured, structured into machine-readable
  data, and made findable on demand rather than sitting inert in drives, inboxes, and PDF
  scans.
- **Why consolidated.** "Is the estate captured and structured" and "can you query the
  estate" are two halves of one question, "is the estate usable as data," and they fail
  together: an estate you cannot search is rarely well structured, and a well-structured
  estate is almost always searchable. Splitting them inflated the count without separating
  respondents.
- **Stage 1.** Active contracts live in the CLM; the historical estate is still in network
  drives, email, and SharePoint, and querying means a person opening files.
- **Stage 2.** Most of the estate, including legacy paper, is digitized, OCR'd, and
  metadata-structured, and the function can find obligations and terms by searching rather
  than by remembering where a document is.
- **Stage 3.** The whole estate is machine-readable and queryable in natural language;
  anyone authorized can ask "which contracts auto-renew in Q3 and cap our liability below
  X" and get an answer without a manual review project.
- **Discriminant note.** Distinct from Pillar 2. This pillar is about whether the
  *content* is usable data; Pillar 2 is about whether the *standards you apply to that
  content* are codified. An organization can have a beautifully structured estate (high
  here) with no digitized playbook (low there).
- **Sponsor gap.** Weak score maps to metadata extraction, estate migration, and
  conversational search. Ironclad (Intake Agent, Conversational Search), Sirion
  (Extraction Agent, Search Agent). Shared ground between the two.

### 2.2 Pillar 2. Codified Playbook and Standards *(the keystone)*

- **Construct.** Whether the organization's preferred positions, fallback language, clause
  bank, and risk tolerances exist as digitized, machine-applicable standards rather than as
  attorney judgment, tribal knowledge, or a Word document no system can read.
- **Why this is the center of gravity.** Verified (3-0): AI redlining presupposes a codified
  playbook. Ironclad's own support documentation states the approved, properly formatted
  playbook is the prerequisite before the Redlining Agent can function, and Ironclad
  monetizes the gap directly through its Services team. This pillar is therefore (a)
  concrete and assessable (you either have machine-applicable standards or you do not), (b)
  a precondition for the cluster's flagship capability, so a weak score is an urgent,
  credible finding rather than an abstract "you are immature" verdict, and (c) the one
  pillar where all three primary sponsors have a play and each monetizes the codification
  itself. It is the safest pillar to feature when a sponsor is not yet committed.
- **Stage 1.** Standards live in attorneys' heads or in static documents; "the playbook" is
  whatever the senior reviewer decides that day. Fallback positions are not written down in
  any consistent place.
- **Stage 2.** A written playbook with preferred and fallback positions and a clause bank
  exists and is used by reviewers, but it is a human reference document, not something a
  system can apply automatically.
- **Stage 3.** Preferred positions, fallback language, and risk tolerances are encoded in a
  machine-applicable form, so a system can flag deviations and propose first-pass redlines
  against them without a human re-explaining the rules each time.
- **Discriminant note.** Distinct from Pillar 3. This pillar measures whether the *rules
  exist in applicable form*; Pillar 3 measures whether AI is *applying* them. You can have a
  codified playbook (high here) that no AI review tool is yet using (low there).
- **Sponsor gap.** Weak score maps to the codification service itself. Ironclad (Services
  plus Redlining Agent), Sirion (Playbook Agent, "transforms institutional knowledge into
  standardised playbooks"). Also a precondition Luminance's autonomous negotiation depends
  on. All three primaries.

### 2.3 Pillar 3. AI-Assisted Review and Redlining

- **Construct.** Whether AI is actively used to flag missing clauses, risky terms, and
  compliance gaps and to propose first-pass redlines against the organization's standards,
  versus review being entirely manual.
- **Why it discriminates and why it is grounded.** The cluster's three most-validated AI
  use cases are review, redlining, and summarization (research context §6, anchored to the
  Icertis State of Contracting benchmark; treat the specific adoption figures as
  directional vendor-published positioning, attributed, not as ground truth). Adoption is
  uneven enough across organizations that this pillar separates respondents cleanly: some
  do none of it, some pilot review, few run redlining at scale.
- **Stage 1.** Review is fully manual; every contract is read start to finish by a person,
  and redlines are drafted from scratch each time.
- **Stage 2.** AI is used for review and summarization, flagging risky or missing terms and
  surfacing what a contract says, but a human still drafts every redline.
- **Stage 3.** AI proposes first-pass redlines against the codified playbook and flags
  deviations automatically; reviewers edit and approve rather than draft from blank.
- **Discriminant note.** Depends on Pillar 2 (you cannot run AI redlining without a codified
  playbook) but is distinct from it: it measures the *doing*, not the *prerequisite*.
- **Sponsor gap.** Weak score maps to risk and deviation detection plus redline generation.
  Ironclad (Redlining Agent), Sirion (Issue Detection plus Redline Agents). Shared ground.

### 2.4 Pillar 4. Post-Signature Obligation and Renewal Control *(Sirion owns this)*

- **Construct.** Whether obligations, renewals, milestones, and compliance commitments are
  tracked and acted on *after* signing, versus signed contracts being filed and forgotten
  until something goes wrong.
- **Why it is its own pillar and not collapsed.** This is the only pillar Sirion uniquely
  owns in the set (research context §3, §4: Sirion's agents span "every step in the
  contracting lifecycle, from drafting and negotiations to risk assessment and
  post-signature governance"). Collapsing it would remove Sirion's owned gap and break the
  two-sponsor economics. It is also a genuinely distinct construct: pre-signature
  capability says nothing about whether anyone watches the contract once the ink is dry,
  and the most expensive contract failures (missed renewals, breached obligations,
  un-exercised rights) happen here.
- **Stage 1.** Once signed, contracts are filed. Renewals are caught when someone
  remembers, or when the counterparty sends a notice. Obligations are tracked, if at all,
  in someone's spreadsheet.
- **Stage 2.** Key dates and renewals are tracked in the system with alerts, and the major
  obligations are recorded against the right owners.
- **Stage 3.** Obligations, renewals, and compliance commitments are tracked and
  proactively acted on across the estate, with the system surfacing what is due, what is at
  risk, and who owns it before it becomes a problem.
- **Discriminant note.** Distinct from Pillar 1. Pillar 1 is whether you can *find* what a
  signed contract says; this pillar is whether anyone is *acting* on its forward
  obligations. An organization can have a searchable estate (high on 1) that nobody manages
  post-signature (low here).
- **Sponsor gap.** Obligation management and lifecycle governance. **Sirion, uniquely.**

### 2.5 Pillar 5. Institutional Memory and Explainability *(Luminance owns this)*

- **Construct.** Whether the organization retains the *reasoning* behind its agreements,
  who agreed to what and why, and can explain the rationale behind a position or an AI
  recommendation, versus capturing only the outcome and losing the why.
- **Why it is its own pillar.** One of two pillars Luminance uniquely owns (research context
  §4: Luminance frames the core problem as "enterprise amnesia," systems that captured
  outcomes but lost the reasoning, and surfaces "the why behind every decision, not just the
  what"). It is also the construct most connected to the documented change-management
  failure mode: explainability that shows *why* an AI made a decision is what reduces the
  trust gap that stalls senior-attorney adoption (research context §12, failure mode 5).
- **Stage 1.** Outcomes are recorded; the reasoning is lost. When it is time to renegotiate,
  nobody can answer "who agreed to this concession, and why did we accept it."
- **Stage 2.** Negotiation rationale is captured for major deals in notes or memos, but it
  is unevenly applied and not connected to the contracts themselves.
- **Stage 3.** Rationale is captured systematically and tied to the agreements and to
  portfolio precedent, so the organization can answer "who agreed to this and why" and any
  AI recommendation shows its reasoning rather than just its output.
- **Discriminant note.** Distinct from Pillar 1. Pillar 1 retains the *what* (the terms);
  this pillar retains the *why* (the rationale). Most organizations have far more of the
  former than the latter, which is what makes this discriminating.
- **Sponsor gap.** Memory-aware, explainable contracting. **Luminance, uniquely.**

### 2.6 Pillar 6. Autonomous Negotiation Readiness *(Luminance owns this)*

- **Construct.** Whether the governance, guardrails, and trust framework exist to let AI
  draft and negotiate within defined bounds under controlled human oversight, versus every
  negotiation requiring a human in every loop.
- **Why it is its own pillar, with a caveat.** The second pillar Luminance uniquely owns
  (research context §4: Luminance's autonomous negotiation, positioned as agent-to-agent,
  fully autonomous; note this is a narrowly-scoped self-asserted superlative and its full
  GA status was design-partner beta with a spring-2026 launch, so this pillar measures
  *readiness for* a capability that may be partly aspirational at the build date, see
  research context §9 item 4). The pillar is written to measure the organization's
  *governance readiness* for autonomy, not the existence of a shipping autonomous product,
  which keeps it honest regardless of the GA timing.
- **Stage 1.** No framework exists for letting AI act without a human; the idea of AI
  negotiating within bounds has not been scoped, and there is no policy for when AI output
  is trusted versus reviewed.
- **Stage 2.** AI drafts and proposes within defined templates and a human approves every
  output; there is an emerging human-in-the-loop policy but no delegated authority.
- **Stage 3.** Governance, guardrails, and a defined authority framework let AI operate
  within bounds (for example, accept fallback positions inside pre-approved tolerances)
  with humans handling exceptions and escalations rather than every case.
- **Discriminant note.** This is the apex pillar; very few organizations sit at Stage 3, by
  design, which is the honesty guardrail (§3.2) that keeps the pillar from flattering
  everyone. It depends on Pillars 2 and 5 (you cannot delegate to AI without encoded
  standards and retained rationale) but is distinct: it measures *governance readiness for
  delegation*, not the standards or the memory themselves.
- **Sponsor gap.** Autonomous, agent-to-agent negotiation readiness. **Luminance,
  uniquely.**

### 2.7 The Implementation Readiness pre-qualifier (unscored)

Not a seventh pillar. A short, unscored module that captures pre-sales risk and surfaces it
to the sponsor, dissolved out of the scored set for the construct-hygiene reason in §0. It
draws on the documented CLM implementation failure modes (research context §12) and asks
about:

- **Executive sponsorship and cross-functional alignment.** Does finance, procurement, and
  sales share ownership of the contracting initiative, or does legal ops own it alone (the
  single most cited implementation failure mode).
- **Upstream systems scoping.** Is the CLM expected to connect to the CRM, ERP, and
  procurement systems, or will it be a standalone island.
- **AI governance policy.** Does a formal human-in-the-loop policy exist defining when AI
  output is reviewed versus trusted.

These flag *readiness to succeed with* an implementation, not *AI capability maturity*.
They are reported to the sponsor as risk flags (the commercial value the context identifies:
a weak readiness signal means services revenue exists before the software sale) and are
shown to the taker as context, not folded into the bottleneck score. Direction of effect
only; no points enter the headline.

---

## 3. Aggregation and scoring posture

### 3.1 The decision that defines the framework: non-compensatory aggregation

This is the crux, and the house already settled the precedent in `aipq-methodology.md` §4.
The discriminating question: does a strong pillar rescue a fatally weak one? In this
cluster the answer is unambiguously no, for a reason sharper than AIPQ's. The commercial
mechanic *literally depends on the weakest pillar being legible.* If an organization has a
beautifully searchable estate, AI review running, and obligation tracking in place, but no
codified playbook, it cannot deploy AI redlining, and that single gap is the entire
finding. A compensatory weighted mean would average that gap into a comfortable middling
score, the bottleneck would vanish, and the sponsor AE would lose the opening. The weakest
pillar is the sale. The aggregation must surface it as the headline.

So CARD uses a **non-compensatory, bottleneck aggregation**, mirroring the AIPQ rebuild's
settled form rather than the compensatory weighted mean of the older DRI.

### 3.2 The scoring scale per pillar

Each pillar is scored on **four ordered levels** valued **0, 33, 67, 100**, corresponding
to the maturity arc plus a floor:

- **0, Absent.** The capability does not exist (below Stage 1: not even managed as a
  system of record on this dimension).
- **33, Stage 1 / Repository.** Captured but passive.
- **67, Stage 2 / Intelligence.** Structured, applied, queryable.
- **100, Stage 3 / Action.** Active, governed, the rare best case.

Four levels, **forced choice, no neutral midpoint.** A neutral option becomes a refuge that
destroys discriminant power; forcing the respondent off the fence is deliberate. The 100
level describes a genuinely rare best case (a fully governed Action-stage capability), not a
flattering plateau most takers can claim. This is the central honesty guardrail: if most
takers max a pillar, that pillar measures nothing. Each level describes an honestly
different state of the world, not a good/bad morality scale.

### 3.3 The aggregation rule: soft-min headline, profile-first reporting

Pure `min()` is rejected for the same reason AIPQ rejects it: it throws away all
information except the single lowest pillar and gives no gradation (a profile of
[33, 100, 100, 100, 100, 100] and [33, 33, 33, 33, 33, 33] would score identically). The
instrument needs a form that is **non-compensatory in spirit** (a fatal low pillar
dominates) but **graded** (the other pillars still move the number). The AIPQ soft-min is
the proven house form:

```
CARD = round( alpha * mean(pillars) + (1 - alpha) * min(pillars) )
```

with **alpha = 0.35** as the prior. This is a deliberately *stronger* bottleneck weighting
than AIPQ's 0.4, because the commercial mechanic here depends even more directly on the
weakest pillar being the headline. The `min` term carries 65 percent of the weight, so a
high average cannot mask a fatal low, while the `mean` term still rewards broad strength so
two genuinely different profiles do not collapse to the same number. It is monotonic,
bounded 0 to 100, and explainable to a skeptical GC in one sentence: "your score leans on
your weakest capability, on purpose, because that is the one blocking your next step." Alpha
is a calibration parameter (§6).

**Profile-first, not number-first.** The single CARD number is reported, but it is
deliberately secondary. The headline deliverable is the **per-pillar profile and the
binding constraint**, not the aggregate. The reason is that a maturity diagnostic's value to
this buyer is the diagnosis ("here is exactly where you are and what is blocking you"), not
a leaderboard rank. The number exists to be memorable and to anchor a "you are at the
Intelligence stage overall, blocked at Repository on Playbook" sentence, not to stand alone.

### 3.4 The binding constraint and the honesty branch

The headline finding is the **single lowest-scoring pillar**, full stop. In a
non-compensatory system the weakest pillar *is* the binding constraint, so the most
leveraged action is always to raise it.

Tie-breaking, following the house pattern: when two pillars share the lowest score, break
toward the **earlier maturity stage first** (a Repository-stage gap blocks you before an
Action-stage gap, and an Action fix is wasted if the foundation is missing). Within a
stage, Pillar 2 (Playbook Codification, the keystone) breaks the tie before others, because
it is the precondition the most other capabilities depend on. This is a documented sequence,
not a hidden weight.

Honesty branch, also house pattern: if the lowest pillar is itself already high (at the 100
level, fully Stage 3), it is framed as an **edge to extend**, the taker's next lever, not a
**deficit**. A strong, evenly-high organization is never told it has a damning gap it does
not have. Given a four-level scale this branch is narrow (it only triggers when every pillar
is at 100), which is appropriate: almost no organization is at the Action stage on all six.

### 3.5 Per-pillar output format

For each pillar the diagnostic delivers a compact, three-part output:

- **Stage label.** "Repository," "Intelligence," or "Action" (or "Absent" at 0).
- **Brief diagnosis.** One honest sentence describing what that level means in the
  organization's own terms (for Playbook at Stage 1: "Your standards live in your
  reviewers' heads, which means AI redlining has no rules to apply.").
- **Implied next step.** The single move to the next stage (for the same example: "Codify
  your preferred and fallback positions into a machine-applicable playbook before turning on
  AI redlining.").

For the binding-constraint pillar specifically, the next step is the headline of the whole
result. That next step is, by construction, the gap a sponsor product closes (§5).

---

## 4. The question set

At least three questions per pillar. Eighteen scored items total, plus the unscored
Implementation Readiness pre-qualifier. Each item maps to exactly one pillar and one
maturity dimension. Every item is answerable from business experience, not IT-system
knowledge: a GC, legal-ops director, or procurement lead can answer all of them without
asking their CLM administrator. Response format is four-level forced choice; the options map
to the 0 / 33 / 67 / 100 scale in §3.2. Items are written to feel diagnostic, not
evaluative: the taker should feel understood, not graded.

These are construct-accurate draft questions. Final consumer-facing phrasing is
conversion-copywriter's lane (§8); the construct, the mapping, and the per-option level
values are fixed here and must not change in polish.

### Pillar 1. Your Contract Estate as Usable Data

**1.1 Where do your historical, already-signed contracts actually live today?**
(a) Scattered across drives, email, and filing cabinets; finding one means knowing who has
it. (0)
(b) Most are filed in one place, but as documents you open and read, not data you can query.
(33)
(c) The bulk of the estate, including older paper, has been digitized and tagged so you can
search by terms and dates. (67)
(d) The whole estate is machine-readable; you can ask plain-language questions across it and
get answers. (100)

**1.2 If you needed to know which contracts auto-renew in the next quarter, how would you
find out?**
(a) We would not reliably know; we would find out when a renewal happened. (0)
(b) Someone would manually review files to pull the dates together. (33)
(c) We could search or filter the system on renewal dates and get a list. (67)
(d) The system already surfaces this; we can ask for it in plain language any time. (100)

**1.3 When a contract from a counterparty arrives on their paper, what happens to its key
terms?**
(a) They stay in the document; we read them when we need them. (0)
(b) Someone manually keys the important terms into a tracker. (33)
(c) The system extracts the key terms and structures them automatically. (67)
(d) Extracted, structured, and immediately queryable alongside the rest of the estate. (100)

### Pillar 2. Codified Playbook and Standards (keystone)

**2.1 Where do your preferred and fallback negotiating positions live?**
(a) In our experienced reviewers' judgment; they are not written down consistently. (0)
(b) In a reference document or wiki people consult. (33)
(c) In a structured playbook with clear preferred and fallback positions reviewers follow.
(67)
(d) Encoded in a form a system can apply automatically to flag deviations. (100)

**2.2 If a new reviewer joined next week, how would they know what terms you will and will
not accept?**
(a) They would learn it over months by watching senior reviewers. (0)
(b) We would hand them a guidance document and a clause bank to read. (33)
(c) They would follow a maintained playbook that spells out positions and fallbacks. (67)
(d) The system applies the standards for them; the rules are built in, not memorized. (100)

**2.3 How standardized is the language you fall back to when a counterparty pushes on a key
clause?**
(a) It varies by who is handling it; there is no agreed fallback. (0)
(b) Experienced people know the usual fallbacks, but they are not formally recorded. (33)
(c) Approved fallback language exists in our playbook and is used consistently. (67)
(d) Fallback positions and their tolerances are codified so a system can propose them. (100)

### Pillar 3. AI-Assisted Review and Redlining

**3.1 How is an incoming contract reviewed for risk today?**
(a) A person reads it in full, every time, from the start. (0)
(b) A person reads it, sometimes with AI summarizing or surfacing key terms to speed it up.
(33)
(c) AI flags missing clauses, risky terms, and compliance gaps for the reviewer to act on.
(67)
(d) AI flags deviations against our playbook and proposes first-pass redlines automatically.
(100)

**3.2 When your team marks up a contract, where do the redlines come from?**
(a) Drafted from scratch by the reviewer each time. (0)
(b) Reviewers reuse prior markups and templates they keep themselves. (33)
(c) AI suggests edits and language the reviewer selects from and adjusts. (67)
(d) AI generates a first-pass redline against our standards; reviewers edit and approve.
(100)

**3.3 How much of your routine contract review still requires a person to read every word?**
(a) All of it; nothing is automated. (0)
(b) Most of it, though AI helps summarize or triage what to read first. (33)
(c) Routine contracts are largely handled by AI review with human checks on the flags. (67)
(d) Routine review is AI-first; people focus on exceptions and high-stakes deals. (100)

### Pillar 4. Post-Signature Obligation and Renewal Control

**4.1 After a contract is signed, what happens to its obligations and key dates?**
(a) It gets filed; we deal with obligations if and when they come up. (0)
(b) Someone tracks the important dates in a spreadsheet or calendar. (33)
(c) The system tracks key dates and obligations and alerts the owners. (67)
(d) Obligations, renewals, and risks are proactively surfaced and assigned across the
estate. (100)

**4.2 How do you find out a renewal or deadline is coming?**
(a) Often when the counterparty tells us, or after the date has passed. (0)
(b) Someone reviews the tracker periodically to catch what is upcoming. (33)
(c) The system alerts us ahead of key dates. (67)
(d) The system surfaces what is due, what is at risk, and who owns it, before we ask. (100)

**4.3 Who is accountable for the commitments your contracts make after signing?**
(a) No one specifically; it is whoever notices. (0)
(b) Legal or ops keeps an informal list of the big ones. (33)
(c) Major obligations are recorded against named owners in the system. (67)
(d) Every material obligation has an owner and is tracked to completion in the system. (100)

### Pillar 5. Institutional Memory and Explainability

**5.1 If you needed to renegotiate a contract, could you find out why your side agreed to a
particular concession?**
(a) Rarely; the reasoning left with whoever handled it. (0)
(b) Sometimes, by tracking down the people involved and their notes. (33)
(c) Rationale for major deals is captured in notes we can locate. (67)
(d) The reasoning is recorded against the contract and our precedent; we can answer it
directly. (100)

**5.2 When a position is taken in a negotiation, is the reasoning behind it retained?**
(a) No; we keep the outcome, not the why. (0)
(b) Informally, in individual emails or memos that may or may not be findable. (33)
(c) For significant deals, the rationale is documented in a consistent place. (67)
(d) Rationale is captured systematically and tied to the agreements and related precedent.
(100)

**5.3 If an AI tool recommended a contract change, would your team be able to see why?**
(a) We do not use AI for this, or it gives an answer with no reasoning. (0)
(b) It gives an answer; understanding the why takes extra digging. (33)
(c) It shows the basis for its recommendation alongside the recommendation. (67)
(d) Every recommendation shows the why, traced to our standards and precedent, by default.
(100)

### Pillar 6. Autonomous Negotiation Readiness

**6.1 Could AI draft or propose contract terms in your organization without a person
approving each one?**
(a) No; the idea has not been scoped, and there is no framework for it. (0)
(b) AI can draft, but a person reviews and approves every single output. (33)
(c) AI operates within defined templates and tolerances, with humans approving exceptions.
(67)
(d) AI acts within pre-approved bounds and authority; humans handle escalations, not every
case. (100)

**6.2 Is there a policy for when AI output is trusted versus reviewed by a human?**
(a) No policy exists. (0)
(b) It is handled case by case, at the reviewer's discretion. (33)
(c) An emerging human-in-the-loop policy defines what gets reviewed. (67)
(d) A defined authority framework sets exactly where AI may act and where humans must.
(100)

**6.3 If you wanted to let AI accept a fallback position automatically within set limits,
how ready are you?**
(a) Not at all; we have no encoded limits for it to work within. (0)
(b) We have the standards on paper but no governance to delegate to a system. (33)
(c) We have the standards and a partial governance framework; we would pilot it carefully.
(67)
(d) Standards, guardrails, and oversight are in place; we could enable it within bounds.
(100)

### Implementation Readiness pre-qualifier (unscored)

**PQ.1** Who owns your contracting improvement effort: legal ops alone, or shared with
finance, procurement, and sales? *(flags executive-sponsorship risk)*

**PQ.2** Is your CLM expected to connect to your CRM, ERP, and procurement systems, or run
as a standalone system? *(flags integration-scoping risk)*

**PQ.3** Does a written policy define when AI contract output is reviewed by a human versus
trusted? *(flags AI-governance risk)*

These do not enter the score; they are reported to the sponsor as pre-sales risk flags.

---

## 5. Pillar to sponsor product mapping

The commercial spine. A sponsor AE reads their row and sees how to use it in a discovery
call. Stage 1 meaning is in plain language. Note that Pillar 2 is the one row all three
primaries can claim, which makes it the safest pillar to feature when the sponsor is not yet
committed.

| Pillar | What a Stage 1 (weak) score means | Sponsor product that closes it | AE opening line |
|---|---|---|---|
| **1. Estate as Usable Data** | Your contracts are documents in drives and inboxes, not data you can query. | Ironclad Intake Agent + Conversational Search; Sirion Extraction + Search Agents | "You can't act on contracts you can't find. Let's get your estate into a state you can actually query." |
| **2. Codified Playbook** *(keystone)* | Your standards live in your reviewers' heads, so AI redlining has nothing to apply. | Ironclad Services + Redlining Agent; Sirion Playbook Agent; (precondition for Luminance) | "AI redlining starts with a codified playbook. We'll turn your team's judgment into rules a system can run." |
| **3. AI Review and Redlining** | Every contract is reviewed by hand, start to finish. | Ironclad Redlining Agent; Sirion Issue Detection + Redline Agents | "Your team is reading every word of routine contracts. Let's put AI on the first pass against your playbook." |
| **4. Post-Signature Control** | Signed contracts get filed and forgotten until a renewal surprises you. | **Sirion** (obligation management, lifecycle governance) | "Most of your contract risk lives after signing. Let's make obligations and renewals something the system watches, not your memory." |
| **5. Institutional Memory** | You keep the outcome of a deal but lose the reasoning behind it. | **Luminance** (memory-aware, explainable contracting) | "When it's time to renegotiate, can you say who agreed to this and why? Let's stop losing that reasoning." |
| **6. Autonomous Readiness** | There's no framework for letting AI act within bounds. | **Luminance** (autonomous, agent-to-agent negotiation) | "Once your standards and governance are in place, AI can handle the routine negotiation. Let's map the path to that." |

Read down the owner column: Ironclad and Sirion share Pillars 1 to 3, Sirion uniquely owns
Pillar 4, Luminance uniquely owns Pillars 5 and 6, and Pillar 2 is the common ground all
three monetize. That balance is what lets two premium sponsors with distinct gaps both see
themselves in the instrument.

---

## 6. What is theory, and what is calibrated

Be explicit. No pillar weight, percentage, or maturity-distribution claim in this document
is presented as measured. Everything quantitative is a labeled prior.

**Theory-derived (defensible now, before any data):**
- The pillar set and the construct for each, grounded in the cluster's own published
  positioning and product documentation (research context §§1, 4, 5).
- The maturity arc (Repository to Intelligence to Action) as the level structure, because it
  is the cluster's own verified vocabulary, not an imported model.
- The *direction* of every effect (higher level = more mature on that capability).
- The *non-compensatory functional form* (soft-min), grounded in the commercial mechanic
  that the weakest pillar is the binding constraint and the sale.
- The structural prerequisite claim: a codified playbook (Pillar 2 at Stage 2 or above) is
  required before AI redlining can function. This is grounded in vendor product
  documentation (Ironclad's stated prerequisite), which is verified positioning, not an
  independently measured outcome rate.

**Prior, not measured (must be calibrated post-launch):**
- The alpha-blend weight (prior 0.35), the four-level point values, and the tie-break order.
- Any differential pillar weighting. The instrument uses **equal nominal weight** in the
  `mean` term at launch. Differential weights are a *calibration output*, not a design
  input; asserting them now with no data is the unfalsifiable arbitrariness the instrument
  exists to avoid.
- Any claim about the *distribution* of organizations across stages (how common Stage 1 on
  Playbook is). The Icertis adoption figures are directional vendor-published positioning
  (research context §6), useful as an attributed external benchmark to position a taker
  against, never presented as CARD's own ground truth.

**The calibration path (what data would test whether the pillar set is actually
predictive):**

Because CARD is a maturity diagnostic, not a predictive model, the calibration question is
not "does the score predict a dated outcome" but "do the pillars carve the cluster at its
joints, and is the prerequisite claim true." The data to collect post-launch:

1. **Response distributions per pillar.** If almost every taker picks the same level on a
   pillar, that pillar does not discriminate and should be re-anchored or cut. This is the
   first and cheapest test, available from completions alone.
2. **Inter-pillar correlation.** If two pillars move together near-perfectly across takers,
   they are measuring one construct and should be consolidated (the same logic that merged
   hypothesis Pillars 1 and 4). Pillars 2 and 3 are the pair to watch, since 3 depends on 2.
3. **The prerequisite test (the central one).** Joined to sponsor CRM and CS records on the
   account, do organizations that scored Stage 1 on Playbook (Pillar 2) and then attempted
   AI redlining actually fail or stall, versus those at Stage 2 or above succeeding? This is
   the one theory claim that, if refuted, would force a redesign of the keystone, and it is
   testable passively through sponsor systems without re-contacting takers (the independence
   logic from `aipq-methodology.md` §6.3 applies: capture the outcome from the sponsor's
   records, not from the same respondent in the same sitting).
4. **Binding-constraint stability.** Re-take by the same organization at a later date should
   show the binding constraint moving as capabilities are addressed. If it does not, the
   levels are not sensitive enough to detect real change.

Until that data exists, CARD's value rests on the *structure* being right (the right
pillars, the right non-compensatory form, the right maturity arc), with the priors
acknowledged as provisional. A skeptical sponsor can accept "the structure is sound and the
numbers are being calibrated against observed outcomes from a published panel" far more
readily than fabricated precision.

---

## 7. Refuted framings (carried forward from the research context)

These were adversarially tested in research and either refuted or flagged as unverified
marketing. Keeping them out is part of surviving a skeptical sponsor read. Future editors
must not reintroduce them.

**Refuted, do not use and do not attribute:**
1. The Sirion "AI built organically in-house over 15+ years / not bolted on" framing
   (refuted 0-3). Not used anywhere in this design.
2. The Icertis benchmark "500+ practitioners across legal/procurement/finance" sample
   composition (refuted 1-2).
3. The "55% cite data-output quality / 44% of C-suite cite trust in AI autonomy" blocker
   stats (refuted 0-3). The Implementation Readiness pre-qualifier (§2.7) draws on
   *documented failure modes*, not these refuted stats.
4. The "50%+ of C-suite expect AI agents to autonomously negotiate within 12 months" stat
   (refuted 1-2). Pillar 6 measures governance readiness, not a predicted adoption timeline.
5. The HyperStart 5-level CMMM ladder ("Ad hoc to Optimized") and its six-dimension
   breakdown (blog-quality, refuted 0-3). CARD uses the cluster's own verified
   Repository to Intelligence to Action arc instead, never a generic CMMM ladder.

**Excluded by design, not a differentiator:**
- **"Multi-model" or "model flexibility" as a pillar.** Verified table stakes across
  Ironclad, Sirion, and Icertis; it discriminates no one and gives no sponsor an opening. No
  pillar is built on it. It is mentioned only as a thing the diagnostic *describes* but never
  *grades*.

**Use only as attributed, directional positioning, never as CARD ground truth:**
- Luminance "reclaim 30%+ of legal team time" and "90% negotiation time" figures.
- The Icertis "44% adoption" figure, usable as an attributed external benchmark to position a
  taker against, not as a measured CARD rate.

---

## 8. Out of lane

- **Question wording** (§4) is drafted for construct accuracy, not conversion. The exact
  phrasing of items, option labels, and the result copy goes to **conversion-copywriter**.
  The construct each item taps, the pillar it maps to, and the per-option level value
  (0 / 33 / 67 / 100) must not change in polish.
- **Results presentation** (the profile visual, how the binding constraint and the maturity
  arc are shown, the per-pillar stage display) goes to **visual-designer** and
  **frontend-engineer**. This document specifies the output content (§3.5) and the data the
  surface must carry, not its layout.

---

## 9. Open decisions for the owner

1. **Pillar count and consolidation. RESOLVED in this draft.** Six scored pillars;
   hypothesis Pillars 1 and 4 consolidated; Organizational Readiness demoted to an unscored
   pre-qualifier. Confirm before build.
2. **Sponsor validation gate (binding, from research context §9 item 5).** Two to three
   contract-cluster sponsor conversations must confirm the weakest-pillar mapping (§5) hands
   their AEs a live opening. If a sponsor cannot see the sale in their row, the pillar set is
   wrong and §2 must be revised before engineering. OPEN.
3. **Ironclad agent names (research context §9 item 1).** The March 19 2026 release may
   rename the Nov 2025 agent lineup the §5 mapping leans on. Verify current product names
   before they go into taker-facing or sponsor-facing copy. OPEN.
4. **Pillar 6 GA status (research context §9 item 4).** Confirm whether Luminance's
   autonomous negotiation is shipping or aspirational at build date. Pillar 6 is written to
   measure *governance readiness* precisely so it survives either answer, but the sponsor
   copy in §5 should match reality. OPEN.
