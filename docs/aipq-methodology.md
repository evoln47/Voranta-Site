# AIPQ Methodology

**AI Production Quotient. Version 0.9 (pre-calibration draft).**

This document is the reasoning behind AIPQ. It is written to be read by a skeptical
enterprise buyer or a sharp analyst, and to survive that reading. Where a claim is
theory and not yet measured, it says so. Where a number is a placeholder prior, it
is labeled as one. Nothing here is written to flatter the taker.

Status note. This is a methodology rebuild, not a description of the current
`aipq.html` placeholder. The placeholder is treated as intent, not precedent. Where
the rebuild diverges from the live page, the divergence is called out and, where it
would ripple into the live brand surface (the radar, the "six conditions" copy), it
is flagged at the end as a decision for the owner rather than baked in silently.

---

## 0. What was wrong with the placeholder, in brief

The placeholder gets the *spirit* right: enterprise AI pilots succeed and then stall,
and the interesting question is which single constraint blocks the jump to
production. But as an instrument it has four gaps this document closes.

1. **The predicted outcome is undefined.** "Reaches production" is never
   operationalized. There is no unit of analysis, no time window, and no line
   between "a successful pilot" and "sustained production." Everything else in a
   predictive instrument hangs off this definition, and it was missing.

2. **The aggregation is unspecified, and the obvious default is wrong.** The live
   scoring code (the DRI) uses a compensatory weighted mean. If AIPQ inherits that
   pattern, the framework contradicts its own thesis: a compensatory mean says a
   strong pillar rescues a weak one, but the entire AIPQ story ("succeeds, then
   stalls on one constraint") is a bottleneck claim. This is the single most
   important decision in the document and it is settled in Section 4.

3. **The pillar set is asserted, not reasoned, and internally inconsistent.** The
   page names six pillars in prose (Workflow Stability, Data Readiness, Integration
   Density, Exception Tolerance, Adoption Surface, Outcome Measurability) but the
   hero radar (`aipq.html` lines 114 to 119) labels its six axes WS, DQ, OA, EA, IR,
   GV. "GV" reads as Governance and "OA" / "IR" do not map cleanly to the named six.
   That mismatch is direct evidence the pillar set was never settled, which is
   exactly why it should be rebuilt from mechanism rather than preserved.

4. **The predictive claims are unfounded.** "Pilot conversion ~88% / production
   conversion ~23%" appears as if measured. There is no model behind it and no
   calibration path. Section 6 replaces the asserted numbers with a stated model
   form and an explicit, honest plan for capturing real outcomes to calibrate against.

The pillars themselves are mostly good. The rebuild keeps all six constructs (two
renames and one refinement, no swaps), reframes the two axes around a sharper
mechanism, names the two best-documented omissions without forcing them in, and
supplies the missing target, aggregation, and predictive logic.

---

## 1. Construct definition and predictive target

A predictive instrument is only as rigorous as the outcome it predicts. This is
defined first, because every pillar, weight, and threshold downstream exists to
predict *this* and nothing else.

### 1.1 Unit of analysis

The unit is a **single AI initiative scoped to one workflow**, not a company and not
a department. "Should our company adopt AI" is unanswerable and the wrong altitude
for a line-of-business owner. "Will *this* AI initiative for *this* workflow reach
production" is answerable, and it is the decision the buyer actually owns.

A respondent who is evaluating three candidate workflows is expected to take AIPQ
three times, once per workflow. The instrument scores the workflow, not the person
and not the org.

### 1.2 The outcome, operationalized

AIPQ predicts a staged outcome with three terminal states. The two thresholds that
separate them are deliberately concrete so the prediction is falsifiable.

- **Stage P0 to P1, Pilot success.** Within the pilot window, the AI system meets
  its pre-stated success criteria on a bounded scope (typically a held-out sample or
  a limited user group). This is a *technical and design* bar: the thing works in a
  controlled setting.

- **Stage P1 to P2, Production deployment.** The system is operating on live,
  unbounded volume in the real workflow, with real users depending on it, and the
  human fallback is no longer doing the majority of the work. This is the jump the
  framework cares about. Reaching it is the headline event AIPQ predicts.

- **Stage P2 to P3, Sustained production.** The system is *still* in production
  **T months** after first production deployment, has not been silently rolled back
  to human-in-the-loop-for-everything, and has a maintained owner. This guards
  against the common pattern where a system ships, degrades, and is quietly
  abandoned without ever being formally killed.

**The outcome variable (the dependent variable).** The terminal stage an initiative
reaches, specifically whether it reaches **P2 and remains at P2 through P3**
(production, sustained T months). This staged terminal stage is *the* dependent
variable the AIPQ score is validated against. Everything in Sections 4 to 6 exists to
predict it. It is binary at the headline (reached-and-sustained vs not) but defined by
the staged P0/P1/P2/P3 criteria above so "production" cannot be argued away.

**Capture the baseline stage at T=0.** At assessment time, the initiative's
*current* stage (P0, P1, or already P2) is captured as a single one-field input
alongside the six pillar items. This is an **input field, not a seventh pillar**: it
does not enter the score, the radar, or the six-item count. It records where the
initiative started so the framework can measure the **transition** (start stage to
terminal stage) rather than only the end state.

Measuring the transition is a cleaner test than measuring the end state alone, for two
reasons. First, it **controls for the starting point**: an initiative scored at T=0
already in production tells you nothing about whether AIPQ predicts the jump, whereas
one scored at P1 that does or does not reach P2 is a direct test. Second, it
**isolates the P1 to P2 jump the framework actually claims to predict** (Section 1.3),
rather than letting initiatives that were never going to be hard inflate the apparent
hit rate. Note the asymmetry that makes this work: the baseline stage is a
current-state fact the respondent can self-report, but the *outcome* must be captured
independently of the predictor (Section 6.3), not self-scored after the fact.

**Recommended window, T = 6 months** after first production deployment. Six months is
long enough to expose the failure modes that only appear at scale (exception load,
adoption fatigue, attribution disputes, cost-to-serve shocks), and short enough to be
a practical horizon for passive outcome capture through sponsor systems (Section 6.3).
T is a calibration parameter; it can move once outcome data exists.

### 1.3 Why a *staged* target, and why it is the key to the whole framework

The reason AIPQ exists is the **gap between P1 and P2.** Industry post-mortems of
enterprise AI repeatedly describe "pilot purgatory": a high rate of pilot success
and a low rate of production conversion. The numbers vary by source and are not
reproduced here as fact, but the *shape* is well attested and is the phenomenon the
buyer is living through.

A framework that predicts only "does it work" (P1) tells the buyer nothing they do
not already learn from the pilot itself. AIPQ's claim to usefulness is that it
predicts the *second* gate, the one the pilot cannot reveal, before the buyer has
spent the money to discover it the hard way. That is why the target is staged and
why the pillar model in Section 2 is organized by *where each pillar bites*: at the
pilot gate or at the production gate.

---

## 2. The pillars: why these, and the mechanism for each

### 2.1 The organizing principle: where does the constraint bite?

The placeholder's two axes are "Technical Readiness" (inside the workflow) versus
"Operational Fit" (around the workflow). That intuition is close but the framing is
soft. "Inside vs around the workflow" is a spatial metaphor; it does not by itself
tell you why one axis predicts pilot success and the other predicts the stall.

The sharper, mechanistic reframing, and the backbone of the rebuilt framework:

- **Pilot-gating pillars** bite *during* the pilot. If they are weak, the pilot
  itself fails or never starts. These conditions are visible in a controlled setting
  because a controlled setting still has to build something that works on real data
  across real systems. Call this axis **Build Feasibility**.

- **Production-gating pillars** bite *only at scale*, after the pilot has succeeded.
  A pilot runs on a bounded sample, with motivated early users, on a short horizon,
  often with an engineer watching. None of the production-gating constraints are
  stressed under those conditions, so the pilot passes cleanly and then the system
  meets the real world and stalls. Call this axis **Production Absorption**.

This reframing earns its place because it does real work the placeholder's framing
does not:

1. It *explains* the pilot-to-production gap rather than asserting it. The gap exists
   precisely because pilot conditions test the Build Feasibility axis and silence the
   Production Absorption axis.
2. It makes "Stranded Capability" mechanistic: high Build Feasibility, low Production
   Absorption is, by construction, the archetype that passes pilots and stalls in
   production.
3. It makes the headline pilot-vs-production probability split a *consequence of the
   model* (Section 5), not a number typed into a card.

So the two-axis structure is kept, but renamed and re-grounded:

| Placeholder axis | Rebuilt axis | What it predicts |
|---|---|---|
| Technical Readiness (inside) | **Build Feasibility** | The P0 to P1 gate (can it be built and pass a pilot) |
| Operational Fit (around) | **Production Absorption** | The P1 to P2 gate (can the org run it at scale) |

### 2.2 The number of pillars

The placeholder commits to **six** in prose and in the radar geometry, the hero SVG,
and the scorecard. Six is also a good number on the merits: enough to separate
distinct failure modes, few enough that a line-of-business owner answers in about a
minute and a radar stays readable. The rebuild keeps **N = 6** and spends its
freedom on *which* six rather than on changing the count. (Adding a seventh or
eighth pillar would be defensible on content grounds but would break the brand
surface this document is not permitted to edit; that tradeoff is surfaced as an
owner decision at the end.)

Three pillars per axis keeps the two-axis structure balanced and the archetype 2x2
clean.

### 2.3 The Build Feasibility axis (pilot-gating)

#### Pillar 1. Workflow Stability *(kept)*

- **Latent construct:** the rate of change of the target procedure relative to the
  rate at which a model can be trained, validated, and redeployed.
- **Mechanism:** AI learns a mapping from a distribution of inputs to outputs. If the
  underlying procedure, policy, or input distribution changes faster than the model
  can be retrained and revalidated, the model is always fitting a world that no longer
  exists. This sinks the pilot (the held-out set drifts from the training set) and,
  if it sneaks through, guarantees decay in production.
- **High vs low:** High = a stable, documented procedure that changes on a quarterly
  or slower cadence. Low = procedures, rules, or policies that change weekly, or that
  are undocumented and live in individual heads.
- **Discriminant note:** distinct from Data Readiness. A workflow can have pristine
  historical data (high Data Readiness) about a procedure that has since changed
  beyond recognition (low Workflow Stability). One is about signal quality, the other
  about signal *durability*.

#### Pillar 2. Data Readiness *(kept)*

- **Latent construct:** the sufficiency, quality, labeling, and accessibility of the
  signal available to train or ground the system.
- **Mechanism:** model quality is bounded above by data quality. Sparse, noisy,
  unlabeled, or inaccessible data caps achievable accuracy below the threshold the
  pilot must clear. This is the most common reason a pilot underperforms its target.
- **High vs low:** High = sufficient volume, structured, labeled by outcome,
  accessible without a multi-quarter data-engineering project. Low = thin, unlabeled,
  locked in systems no one can extract from, or of unknown quality.
- **Discriminant note:** distinct from Integration Reach. Data Readiness is about the
  *quality and availability of the signal itself*; Integration Reach is about the
  *number and brittleness of the systems the running model must touch.* You can have
  excellent data sitting in a single accessible warehouse (high on both) or excellent
  data that nonetheless requires live coordination across six brittle systems (high
  Data Readiness, low Integration Reach).

#### Pillar 3. Integration Reach *(kept, renamed from "Integration Density")*

- **Latent construct:** the number, criticality, and brittleness of the systems the
  AI must read from or write to in order to function in the real workflow.
- **Mechanism:** integration is where pilots that "work" fail to ship. A pilot
  commonly runs against a snapshot or a single system. Production requires live,
  reliable coordination across the systems of record. Each additional system,
  especially each legacy or brittle one, multiplies the failure surface and the
  engineering cost, and is a leading cause of the "it worked in the demo" stall.
- **High vs low:** High = the AI needs one or two stable, well-documented,
  API-friendly systems. Low = it must coordinate across many systems, including
  legacy platforms with no clean interface.
- **Naming:** "Density" was ambiguous (dense could read as good). "Reach" names the
  construct (how far the system must reach across the estate) and scores cleanly:
  *less* reach required is *better*. Scored so that high pillar score = low reach
  burden, matching the ascending-maturity convention (high is always good).
- **Axis placement note:** Integration Reach straddles both gates. Brittle
  integration can sink a pilot, and it bites again at production scale. It is placed
  on Build Feasibility because the *binary* "can we even wire this up" question is
  resolved at or before pilot. Its residual production risk is acknowledged in the
  aggregation (Section 4), not by double-counting it as a seventh pillar.

### 2.4 The Production Absorption axis (production-gating)

#### Pillar 4. Error Cost and Tolerance *(kept, refined from "Exception Tolerance")*

- **Latent construct:** the consequence of a wrong output, and therefore the
  confidence bar the system must clear to run without a human checking every result.
- **Mechanism:** a pilot tolerates errors because a human is watching and the stakes
  are bounded. Production does not. If the cost of a wrong answer is high
  (customer-facing, regulated, financial, safety), the system must hit a confidence
  bar that lets it run unsupervised, or it never sheds the human reviewer, and if it
  never sheds the reviewer it never reaches P2 by the Section 1.2 definition (the
  human fallback is still doing the majority of the work). This is the textbook reason
  high-stakes pilots succeed and never go live.
- **High vs low:** High = errors are cheap and recoverable, so a "good enough" model
  can run unsupervised. Low = errors are expensive or irreversible, so the
  unsupervised bar is very high and may be unreachable with current model quality.
- **Refinement:** the placeholder framed this as one question ("cost of being
  wrong"). The construct is really *two coupled facts*: how costly an error is, and
  how reliably the system can flag its own uncertainty (so expensive errors can be
  routed to a human while cheap-confidence cases auto-run). Both are tapped, but they
  resolve to one pillar score because they jointly determine a single thing: whether
  the system can run at production scale without a human in every loop.

#### Pillar 5. Adoption Surface *(kept)*

- **Latent construct:** the number of people who must change their behavior for the
  system to deliver value, and the degree of change required.
- **Mechanism:** classic change-management failure. A pilot involves a handful of
  motivated volunteers. Production requires the median, unmotivated, busy user across
  shifts and roles to actually change how they work. The larger the population and
  the deeper the behavior change, the higher the probability the system is used around,
  ignored, or quietly reverted. This is invisible in a pilot by construction.
- **High vs low:** High = few people, small behavior change, or the AI works behind
  the scenes with no user-facing change. Low = hundreds of users across roles and
  shifts must adopt a meaningfully new way of working.

#### Pillar 6. Value Attribution *(kept, renamed from "Outcome Measurability")*

- **Latent construct:** the ability to cleanly attribute a production value delta to
  the AI system, in a metric the funder cares about.
- **Mechanism:** this is the *funding-continuity* failure mode, and it is why this
  pillar replaces the placeholder's framing with something sharper. Pilots are funded
  on novelty and executive enthusiasm. Production is funded on demonstrated ROI. If
  the value the system creates cannot be cleanly attributed (no baseline, no clean
  metric, confounded by other changes), the system enters a renewal conversation with
  no defense, loses the budget fight, and is stalled or killed regardless of how well
  it works technically. A system that cannot prove its value does not sustain through
  P3.
- **High vs low:** High = a pre-AI baseline exists, the value metric is tracked
  per-transaction, and attribution to the AI is clean. Low = no baseline, value is
  diffuse or confounded, and "did it help" is a matter of opinion.

### 2.5 The pillar swap, and the two best omissions

The rebuild keeps all six placeholder constructs (two renames and one refinement,
all sharpenings, no swaps). The reason no construct is dropped is that each of the six maps to a
distinct, well-documented enterprise-AI failure mode and they have acceptable
discriminant separation as argued above.

That said, the two best-documented omissions deserve to be named, because a skeptical
buyer will ask:

1. **Executive sponsorship and funding continuity.** The single most cited cause of
   "pilot purgatory" is loss of the sponsor or the budget between pilot and
   production. The rebuild handles the *consequence* of this (lost funding fights)
   through Value Attribution, which is the lever the buyer can actually move. Raw
   sponsorship is partly captured there and partly out of scope for a workflow-level
   instrument, but if the count could grow, this is the first pillar to add.

2. **Unit economics / cost-to-serve at scale.** A pilot's inference cost is trivial;
   at production volume, per-transaction model cost can make a working system
   uneconomic. This is a clean production-gating failure mode. It is the second
   pillar to add if the count grows.

Both are surfaced as owner decisions at the end. Within N = 6, the six above are the
defensible set.

---

## 3. Measurement model

### 3.1 Items per pillar

**One item per pillar, six items total.** This matches the Voranta house pattern (the
DRI uses one question per dimension, the chosen rung's value *is* the dimension
score) and it matches the stated promise on the page ("Five questions, about a
minute"; AIPQ uses six, one per pillar). The cost is that a single item carries the
full measurement burden for its construct, so each item must be written to tap the
*core* of the construct unambiguously. The benefit is completion rate, which for a
lead-generation instrument is not a nicety; an instrument no one finishes predicts
nothing.

A future version may split the two highest-stakes constructs (Error Cost and
Tolerance, which is genuinely two-part, and Value Attribution) into two items each to
improve reliability, at the cost of length. That is a calibration-era decision once
completion and outcome data exist.

### 3.2 Response scale

Each item is a single-select with **six ordered rungs**, valued **0, 20, 40, 60, 80,
100** in ascending maturity. The chosen rung's value is that pillar's /100 score
directly. This is the locked house pattern and it is the right one here:

- **No neutral midpoint** (six rungs, not five or seven). Forcing a respondent off
  the fence is deliberate; a midpoint becomes a refuge that destroys discriminant
  power.
- **No vanity top rung.** The 100 rung must describe a genuinely rare best case, not
  a flattering plateau most takers can claim. The top rung is written so that a
  typical respondent lands at 60 or 80, not 100. This is the central honesty
  guardrail of the measurement model: if most takers max a pillar, that pillar
  measures nothing.
- **Rungs describe honestly different realities, not a morality scale.** Each rung is
  a recognizable state of the world ("procedures change weekly" vs "quarterly"), not a
  good/bad judgment the respondent feels pressure to answer "correctly."

### 3.3 Anchors (the rubric each item must hit)

For each pillar, the 0 / 60 / 100 anchors below define the construct precisely enough
to be implementable. The 20, 40, 80 rungs interpolate honestly between them.
(Polished question and option wording is conversion-copywriter's job; the construct
and the per-rung *meaning* are fixed here.)

| Pillar | Rung 0 (worst) | Rung 60 (typical-strong) | Rung 100 (rare best) |
|---|---|---|---|
| **Workflow Stability** | Undocumented, changes weekly, lives in people's heads | Documented, changes on a quarterly cadence | Stable, documented, governed change process slower than the retrain loop |
| **Data Readiness** | Thin, unlabeled, or inaccessible; quality unknown | Sufficient and accessible, partially labeled | Ample, structured, outcome-labeled, accessible without a data project |
| **Integration Reach** | Must coordinate across many systems incl. brittle legacy | One or two systems, mostly stable interfaces | One stable, well-documented, API-friendly system of record |
| **Error Cost and Tolerance** | Errors are expensive/irreversible; no uncertainty signal | Moderate cost; system can flag low-confidence cases for review | Errors cheap and recoverable; confident auto-run is safe |
| **Adoption Surface** | Hundreds of users, deep behavior change, across roles/shifts | Dozens of users, moderate change, one function | Few or no user-facing changes; AI works behind the scenes |
| **Value Attribution** | No baseline, diffuse/confounded value, opinion-based | Metric tracked; attribution possible with some work | Pre-AI baseline + per-transaction metric; attribution is clean |

Scoring convention: **higher is always better** (lower production risk). Integration
Reach is scored so that *less reach required* yields a *higher* score, keeping the
direction consistent across all six pillars so the radar and the aggregation never
have a sign flip.

---

## 4. Scoring and aggregation

### 4.1 The decision that defines the framework: non-compensatory aggregation

This is the crux. The question is whether production-readiness is **compensatory** (a
high pillar offsets a low one, so a weighted mean is correct) or **non-compensatory /
bottleneck-driven** (the weakest pillar gates the outcome, like Liebig's law of the
minimum).

**The domain answer is unambiguous: it is a bottleneck.** Ask the discriminating
question directly. *Does a strong pillar rescue a fatally weak one?* If Value
Attribution is near zero (no way to prove ROI), does excellent Data Readiness save
the initiative? No. The funding fight is still lost. If Error Cost and Tolerance is
near zero (a wrong answer is catastrophic and the model cannot run unsupervised), does
a stable workflow save it? No. It never sheds the human reviewer and never reaches
P2. A single near-zero pillar can kill an initiative no matter how strong the other
five are. That is the definition of a non-compensatory system, and it is *also* the
literal content of the framework's thesis ("succeeds, then stalls on the one
constraint"). A compensatory weighted mean, the DRI's default, would directly
contradict the thesis. **AIPQ must not inherit the DRI's aggregation.**

This is not a stylistic preference. Inheriting compensatory scoring would make the
headline number tell a story the rest of the page denies.

### 4.2 But pure `min()` is too brittle

The naive non-compensatory form is `AIPQ = min(pillars)`. It is rejected. Pure min
throws away all information except the single lowest pillar, gives no gradation (a
profile of [10, 90, 90, 90, 90, 90] and [10, 10, 10, 10, 10, 10] score identically),
and treats every weak pillar as equally fatal when in reality some weak pillars are
survivable and some are not.

The instrument needs a form that is **non-compensatory in spirit** (a fatal low
pillar dominates) but **graded** (the other pillars still move the score). Two
related quantities deliver this, and crucially the same shape serves both the
headline score and the predictive model, so Sections 4 and 5 share one mathematics
instead of arguing two.

### 4.3 The aggregation: soft-min headline, gate-product probability

**Per-pillar gate probability.** Map each pillar's /100 score to a conditional
"pass" probability via a monotonic link. A pillar near 0 contributes a gate near 0
(fatal); a pillar near 100 contributes a gate near 1 (no obstacle). A logistic link
is the natural choice:

```
g_i = 1 / (1 + exp(-k * (s_i - s0)))
```

where `s_i` is pillar i's /100 score, `s0` is the midpoint (the score at which a
pillar is a coin-flip obstacle, prior s0 ~ 50), and `k` controls how sharply a low
pillar becomes fatal (prior k chosen so a pillar at 20 is a strong drag and a pillar
at 80 is nearly clear). `s0` and `k` are calibration parameters (Section 5).

**Headline AIPQ /100 (the displayed number).** Use a soft-min that is dominated by
the weakest pillar but still moves with the others:

```
AIPQ = round( alpha * mean(s_i)  +  (1 - alpha) * min(s_i) )
```

with **alpha = 0.4** as the prior. This weights the bottleneck (the `min` term) more
than the average, so a high mean cannot mask a fatal low, while still rewarding broad
strength. It is monotonic, bounded 0 to 100, trivially explainable to a CMO ("your
score leans on your weakest condition, on purpose, because that is what stalls you"),
and it never disagrees in direction with the gate-product model below. (A pure
geometric mean is the more elegant single-formula alternative and is noted as a
calibration-era option; the alpha-blend is chosen for v0.9 because it is the easiest
to explain on a public methodology page.)

**The two terms are deliberately different.** The headline (alpha-blend) is for human
reading. The production-probability (gate product, Section 5) is for prediction. They
are monotonically consistent (both fall when any pillar falls, both are dominated by
the weakest gates) but they are not the same number, and that is intentional: the
score communicates standing, the probability predicts the outcome.

### 4.4 Weighting

The gate link already encodes the most important asymmetry (low pillars dominate via
the `min` term and the product), so heavy differential weighting is not needed and
would be hard to defend without outcome data. **v0.9 uses equal nominal weight across
the six pillars** in the `mean` term. Differential weights are a *calibration
output*, not a *design input*: once outcome data exists, any pillar that empirically
predicts the P1 to P2 jump more strongly earns more weight, and the change is
published with the evidence (per the "Living" standard on the page). Asserting
differential weights now, with no data, is exactly the kind of unfalsifiable
arbitrariness the instrument is built to avoid.

### 4.5 The focus: the one constraint most likely to block them

The focus is the **single lowest-scoring pillar**, full stop. This is the headline
deliverable to the buyer ("the one gap to close first") and it follows directly from
the bottleneck model: in a non-compensatory system, the weakest pillar *is* the
binding constraint, so the most leveraged action is always to raise it.

Tie-breaking, following the house pattern: when two pillars share the lowest score,
break toward the **pilot-gating axis first** (Build Feasibility before Production
Absorption), because a Build-Feasibility failure stops you earlier and a Production
Absorption fix is wasted if the thing cannot be built. Within an axis, break by
pillar order. This is a documented sequence, not a hidden weight.

Honesty branch (house pattern): if the lowest pillar is itself in the high band
(>= 75 on its /100), it is framed as an **edge to extend**, the taker's next lever,
not a **deficit**, so a strong, evenly-high profile never gets told it has a damning
gap it does not have.

---

## 5. Archetypes

### 5.1 The model: shape, not magnitude

Following the principle proven in the DRI code, the archetype is **defined by which
axis is the bottleneck, not by the overall score.** This guarantees the archetype can
never contradict the named #1 gap. The score says *how ready*; the archetype says
*what shape of readiness*; the focus says *which single pillar*. Three outputs, one
coherent story.

The 2x2 is **Build Feasibility (axis mean) x Production Absorption (axis mean)**,
each axis classified High or Low against an axis threshold (prior: axis mean >= 75 on
the /100 scale = High; the threshold is a calibration parameter).

**The axis-High threshold is set to the same band cut (75) as the focus tier on
purpose.** If axis-High used a lower cut (say 60), a flat profile around 65 would read
as a High/High **Production-Ready** archetype while its lowest pillar (65, below the
75 deficit cut) rendered as "a gap to close first," which is a visible
self-contradiction in exactly the common 60 to 74 region. Aligning the cuts removes
that: an axis cannot be classified High unless its mean clears 75, so a deficit-tier
focus (lowest pillar < 75) drags its axis mean down and is very unlikely to coexist
with a High classification on that axis. The thresholds are coupled deliberately so
the score, archetype, and focus stay mutually consistent.

**Reconciliation note (the coherence trap).** The score uses bottleneck aggregation
(soft-min), but the archetype uses an axis *mean* to classify shape. This is
deliberate and not a contradiction: the *score* answers "how ready, gated by your
weakest link" and must therefore be bottleneck-driven; the *archetype* answers "which
half of the problem is your bottleneck on" and is a question about *pattern*, for
which the axis average is the right summary. The focus (single lowest pillar) is the
bridge that keeps them consistent.

Two design choices keep the three outputs from fighting each other. First, the
honesty branch (Section 4.5) frames a high-band lowest pillar as an *edge to extend*,
not a *deficit*, so a strong, evenly-high profile is never told it has a damning gap.
Second, the axis-High cut is aligned to the same 75 band cut as the focus tier (see
above). With both in place, a "deficit" focus and a High archetype almost never
co-occur. They are not strictly impossible: a profile like [80, 80, 70] on one axis
classifies that axis High (mean 76.7) while its 70 pillar is a deficit-tier focus. In
that narrow case the outputs are still coherent rather than contradictory, because the
focus is correctly read as the one soft spot inside an otherwise strong axis, not as a
claim that the axis is weak. The framing, not an impossibility claim, is what carries
the consistency.

### 5.2 The four archetypes

|  | Production Absorption **Low** | Production Absorption **High** |
|---|---|---|
| **Build Feasibility High** | **Stranded Capability** | **Production-Ready** |
| **Build Feasibility Low** | **Foundational** | **Operational Reach** |

- **Production-Ready** (high / high). Both gates are clear. The pilot will pass and the
  org can absorb it. The path to production is a question of execution, not of a
  structural blocker. Next step: ship, and watch the single lowest pillar as the only
  residual risk.

- **Stranded Capability** (high build / low absorption). *The seed archetype, now
  mechanistic.* The thing can be built and will pass its pilot, but the organization
  cannot absorb it at scale: errors are too costly to auto-run, the adoption
  population is too large to move, or the value cannot be proven to defend the budget.
  This is the archetype that **succeeds in pilot and stalls in production**, by
  construction. High pilot probability, low production probability. Next step: close
  the binding Production Absorption pillar before scaling, not after.

- **Foundational** (low / low). Neither gate is clear. The honest message is that this
  initiative is not yet pilot-ready, let alone production-ready. The instrument's job
  here is to *not* flatter: the next step is foundational work (data, workflow
  stability) before a pilot is worth running. This is the archetype most placeholder-
  style "everyone scores fine" instruments refuse to assign, and assigning it
  honestly is what earns credibility.

- **Operational Reach** (low build / high absorption). The organization could absorb
  the system (errors are cheap, few users, value is measurable) but it cannot yet be
  built reliably (data or stability or integration is the blocker). The pilot is at
  risk; the production environment is friendly. Next step: invest in the Build
  Feasibility blocker; the absorption side will not fight you. (Renamed from the
  placeholder's "Operational Gap," which was ambiguous about which side the gap was
  on.)

The four are mutually exclusive and exhaustive (every (High/Low, High/Low) pair lands
in exactly one cell), and each has a distinct, actionable next step keyed to the axis
that is the bottleneck.

---

## 6. Predictive validity: the crux

This section is where AIPQ is either a real predictive instrument or a quiz with a
radar. It is written to be honest about exactly which claims are derived from theory
and which require empirical calibration.

### 6.1 The model form (theory-derived)

The probability that an initiative reaches and sustains production (P1 to P2 held
through P3) is modeled as a **product of the per-pillar gates** from Section 4.3:

```
P(production) = base * product_over_i ( g_i )
```

where `g_i` is pillar i's logistic gate probability and `base` is an overall scale
factor. The product form is the formal statement of non-compensation: if any single
gate is near zero, the product is near zero, regardless of the others. This is the
mathematics of "one constraint blocks you."

For the **pilot** outcome (P0 to P1), the same form is used but **only over the Build
Feasibility gates** (Workflow Stability, Data Readiness, Integration Reach), because
those are the pilot-gating pillars:

```
P(pilot) = base_pilot * product_over_{build pillars} ( g_i )
```

This is what makes the headline split a *consequence of the model* rather than an
asserted pair of numbers. A Stranded Capability profile (high build, low absorption)
will, by this model, show **high P(pilot)** (the build gates are all near 1) and **low
P(production)** (an absorption gate is near 0 and tanks the full product). The "succeeds
then stalls" story falls out of the math instead of being typed onto a card.

### 6.2 What is theory and what needs calibration

**Theory-derived (defensible now, before any data):**
- The pillar set and the causal mechanism for each (Section 2), grounded in
  documented enterprise-AI failure modes.
- The *direction* of every effect (higher pillar = higher production probability).
- The *non-compensatory functional form* (product of gates), grounded in the domain
  argument that one fatal constraint sinks the initiative.
- The *ordering* of predictions across archetypes (Production-Ready > Stranded and
  Operational Reach > Foundational for P(production); Stranded > Operational Reach for
  P(pilot)).

**Requires empirical calibration (cannot be claimed as fact yet):**
- The link parameters `k`, `s0`, the scale factors `base` and `base_pilot`, the
  alpha-blend weight, and the axis/band thresholds.
- The *absolute* probabilities. The placeholder's "88% pilot / 23% production" are
  **not measured rates and are not displayed.** Per the locked display policy (Section
  9, item 4), at cold start the pilot-vs-production likelihood is shown as labeled
  **bands** (High / Moderate / Low) with a "typical pattern for this archetype, being
  calibrated" frame, and precise percentages are **withheld** until the parameters are
  fit from real outcome data; only then are calibrated point estimates shown, with
  their sample size.
- Any differential pillar weights.

### 6.3 Capturing the outcome variable: a ranked menu, not forced re-contact

Calibration needs matched pairs: each respondent's six pillar scores and baseline
stage (the predictor, captured at T=0) joined to that initiative's observed terminal
stage (the outcome, Section 1.2). The predictor side is free, it falls out of every
completion. The hard part is the outcome side, and the obvious method, contacting each
respondent at T months to ask what happened, is operationally heavy and erodes over
time as contacts go stale. It is not the only method, and it is not the best one.

What follows ranks the outcome-capture mechanisms by **rigor and independence from the
predictor** (the methodological priority, see the independence requirement below).
Phasing is treated separately: the cold-start phase has no forward observation window
at all, so the mechanism that is *best in steady state* is not the one that yields the
first data. The recommended design (end of this section) is therefore a hybrid keyed
to phase, not a single mechanism.

A key structural fact makes most of this possible without any respondent survey: the
sponsor is a software vendor, the scorecard already flows into the sponsor's CRM on the
account, so the outcome can be **joined to the predictor on the account record**. The
outcome is "did this account's initiative reach live production and sustain it through
T," and the sponsor's own systems frequently already know the answer.

**1. Passive capture via sponsor systems (recommended primary, going forward).**
No respondent contact at all; the outcome is read off systems the sponsor already
maintains and joined to the scorecard on the account.

- *If the sponsor IS the AI or deployment platform:* product **telemetry** is the
  gold-standard outcome signal. Whether the initiative is running on live volume,
  sustained at T, with the human fallback turned off is directly observable in the
  platform, and it maps almost one-to-one onto the P2-held-through-P3 definition. This
  is the most rigorous option: fully passive, objective, and **independent of the
  self-reported predictor** (it is observed, not asked), which is exactly what
  defeats common-method bias.
- *If the sponsor is not the platform:* the sponsor's **CRM and Customer Success
  records** (deployment-milestone fields, account-health or stage fields, CS call
  notes) can be coded into the staged outcome by a rater following the P1/P2/P3
  rubric. Passive, uses systems they already maintain, and still independent of the
  predictor. Less objective than telemetry because it relies on CS judgment, so it
  benefits from a coding rubric and, ideally, a second coder on a sample.

**2. Retrospective, already-resolved cases (recommended for launch / cold start).**
Instead of waiting forward, assess initiatives whose outcome is *already known* and
record that outcome at T=0 alongside the scores. For a resolved case you capture
*both ends of the transition at once*: the baseline-stage field (Section 1.2) records
where the initiative started, and you additionally record its now-known terminal
stage. This yields matched
(predictor, outcome) pairs **immediately, with zero forward window and zero
re-contact**, which is why it is the launch mechanism even though passive capture is
the better steady-state mechanism. Honest tradeoff: scoring the pillars *after* the
outcome is known invites **recall and hindsight bias** (a respondent who knows the
project failed may unconsciously mark the pillars down). Mitigations: the
behaviorally-anchored rungs (Section 3.2, states of the world, not judgments) blunt
this, and wherever possible the outcome should be taken from an **independently known
source** (a CS record, a billing fact) rather than the same person's recollection.

**3. Commercial proxy outcome (optional, sooner, fully passive, with caveats).**
If the sponsor sells a pilot tier and a production tier, the **purchase of the
production tier** (and later renewal and expansion) is observable in billing and CRM
and proxies production conversion without contacting anyone. It is available sooner
than a T-month production outcome and is fully passive. But be explicit that it is a
**proxy, not the true construct**: purchasing is not deploying, and the purchase is
confounded by commercial factors (discounting, multi-year deals, champion turnover).
It should **corroborate** the telemetry or CS outcome, not replace it.

**4. Forward re-contact (fallback only).** Contact the respondent at T months to
record the actual terminal stage. Use this only when none of the above is available
for an account. It is the most operationally expensive option and the most prone to
attrition, which is precisely why it is demoted from the primary path it occupied in
earlier drafts.

**Recommended design (the hybrid).** Launch on **retrospective resolved cases** to
seed immediate priors with no forward window, then move to **passive outcome capture
through the sponsor's telemetry (preferred) or CRM and CS records** as the
going-forward mechanism, with the **commercial-tier purchase signal** as optional
corroboration. Forward re-contact is held in reserve and, in this design, **never
required**.

**The independence requirement (why this matters, not a footnote).** The outcome must
be captured **independently of the predictor**, ideally objectively observed rather
than self-reported in the same sitting. Two distinct risks make this non-negotiable.
First, **common-method variance**: if the same person supplies both the pillar scores
and the outcome in one sitting, shared rater mood and self-presentation inflate the
apparent predictor-outcome correlation, so the model looks more predictive than it is.
Second, and sharper, **circularity**: some pillars are partly *consequences* of being
in production, not just causes of reaching it. **Value Attribution** is the clearest
case, a clean per-transaction value metric with a defended baseline often exists
*because* the system went to production and had to justify its renewal. If that pillar
is self-scored after the outcome is known, it partly measures the outcome it is
supposed to predict, and the validation is circular. Passive, observed outcome capture
(telemetry or CS records, joined on the account) breaks both risks at once because the
outcome never passes through the respondent. This is the strongest methodological
argument for ranking passive capture first, and it is the reason the doc treats
self-reported forward re-contact as a fallback rather than the path.

**Then fit and publish.** With enough matched (predictor, outcome) pairs from the
mechanisms above, fit the gate parameters `k`, `s0`, `base`, `base_pilot`, the
alpha-blend weight, and any differential weights by maximum likelihood, replace the
priors, version the change, and publish the calibration with its sample size and the
reasoning, per the page's "Living" and "Transparent" standards.

Until that fit has meaningful N, the framework's value rests on the *structure* (the
right pillars, the right non-compensatory form, the right archetype shapes) being
correct, with absolute calibration acknowledged as provisional (Section 9, item 4
locks bands, not point estimates, at cold start). A skeptical buyer can accept "the
structure is sound and the numbers are being calibrated on observed outcomes from a
published panel" far more readily than fabricated precision.

### 6.4 What would falsify the model

A real predictive instrument states how it could be proven wrong:

- **Compensation observed.** If, in outcome data, initiatives with one near-zero
  pillar reach sustained production at rates comparable to initiatives with all
  pillars moderate, the non-compensatory (product) form is wrong and AIPQ should move
  toward a compensatory model. This is the single most important falsification test
  because the product form is the framework's core bet.
- **A dead pillar.** If a pillar's score shows no relationship to the outcome across
  the panel, it is not measuring a real constraint and should be cut or replaced.
- **Axis misassignment.** If a "pilot-gating" pillar predicts the production jump more
  than the pilot pass (or vice versa), the Build/Absorption axis assignment is wrong
  and the archetype model needs revision.
- **Archetype non-separation.** If the four archetypes show statistically
  indistinguishable production rates, the 2x2 is not carving reality at its joints.

### 6.5 Threats to validity (stated, not hidden)

- **Self-report and single-rater bias.** Every predictor input is the taker's own
  assessment of their own workflow. Respondents may over- or under-rate themselves, and
  the same person rates all six pillars (common-method variance). The honest
  mitigations: behaviorally anchored rungs (describe states of the world, not
  judgments), no vanity top rung, and calibration against *observed* outcomes rather
  than trusting the self-report as truth. Crucially, **common-method variance is
  largely mitigated when the outcome is captured independently of the predictor**, as
  the recommended passive-capture design does (Section 6.3): the predictor is
  self-reported but the outcome is observed in telemetry or CS records, so the two are
  not generated by the same rater in the same sitting. The residual single-rater risk
  is confined to *within* the predictor (one person scoring all six pillars), not to
  the predictor-outcome link.
- **Survivorship and selection.** People who take a lead-gen AI-readiness diagnostic
  are not a random sample of AI initiatives; they skew toward initiatives in active
  consideration. Calibrated base rates apply to *that* population, not to all
  enterprise AI, and should be described that way.
- **Outcome attribution noise.** "Reached production" can be gamed or genuinely
  ambiguous; the staged P1/P2/P3 definition in Section 1.2 exists specifically to
  reduce this. Passive capture (Section 6.3) reduces it further, telemetry is hard to
  dispute, but CRM and CS coding still carries rater judgment, and retrospective cases
  carry recall bias. A coding rubric and a second coder on a sample are the
  mitigations. (This threat is smaller than under forward re-contact, which added
  attrition and missing outcomes on top of the ambiguity.)
- **Construct leakage.** Integration Reach bites at both gates (Section 2.3); if the
  single item taps the production-side risk too, it will blur the axis. This is a
  measurement risk to watch in the item wording and in calibration.

None of these are disqualifying. They are the normal limitations of a short
self-diagnostic, and naming them is part of why the instrument is credible rather than
in spite of it.

---

## 7. Output specification: what the buyer and sponsor see, and why

| Element | Buyer sees | Sponsor (CRM) sees | Why it earns its place |
|---|---|---|---|
| **AIPQ /100** | Yes, headline | Yes | One memorable number; the conversation opener. Soft-min so it honestly leans on the weakest condition. |
| **Archetype** | Yes, named + described | Yes | The shape of the problem; the buyer's "that's us" moment and the sponsor's sales-motion key. |
| **Six-pillar radar** | Yes | Yes | Shows *where* the strength and the gap are at a glance; makes the bottleneck visible. |
| **The focus (one lowest pillar)** | Yes, with a next step | Yes, as the wedge | The single most actionable output; follows directly from the bottleneck model. |
| **Pilot vs production likelihood** | Yes, as labeled bands (High/Moderate/Low) until calibrated | Yes | The framework's signature insight (succeed then stall), but only honestly framed (Sections 6.2, 9.4). |
| **Gate parameters / calibration status** | Linked (this doc) | n/a | The "Transparent" standard: the buyer can see how answers map to score. |

The buyer's surface and the sponsor's CRM surface carry the *same diagnosis* at
different resolution. The buyer gets a self-finding they can act on; the sponsor gets
a warm lead whose top gap they already know. The instrument's credibility, which is
what makes the lead warm, depends entirely on the buyer believing the diagnosis was
written to be true rather than to sell. Everything in this document serves that one
requirement.

---

## 8. Summary of changes from the placeholder

- **Added** a precise predictive target: workflow-level unit of analysis, staged
  P0/P1/P2/P3 outcome, six-month sustained-production window. (Was undefined.)
- **Named the outcome variable explicitly** (P2 held through P3) as the dependent
  variable the score is validated against, and **added a baseline-stage T=0 input
  field** (not a seventh pillar) so the framework measures the start-to-terminal
  *transition*, which controls for starting point and isolates the P1 to P2 jump.
- **Rebuilt outcome capture into a ranked menu** (Section 6.3): passive capture via
  sponsor telemetry or CRM/CS as the primary going-forward mechanism, retrospective
  already-resolved cases for cold-start priors, commercial-tier purchase as optional
  proxy corroboration, and forward re-contact demoted to a fallback. Recommended a
  phase-keyed hybrid that never requires re-contact, and made the
  independence-from-predictor requirement (common-method and Value-Attribution
  circularity) explicit.
- **Reframed** the two axes from "Technical Readiness vs Operational Fit" to
  **Build Feasibility (pilot-gating) vs Production Absorption (production-gating)**,
  which mechanistically explains the pilot-to-production gap instead of asserting it.
- **Kept** all six constructs; sharpened three names (two renames, Integration
  Density -> Integration Reach and Outcome Measurability -> Value Attribution; one
  refinement, Exception Tolerance -> Error Cost and Tolerance).
- **Settled the aggregation as non-compensatory** (soft-min headline, product-of-gates
  probability), explicitly rejecting the DRI's compensatory weighted mean as
  contradicting AIPQ's own thesis.
- **Rebuilt the archetypes** on the new axes, kept Stranded Capability as the seed and
  made it mechanistic, renamed Operational Gap to Operational Reach.
- **Replaced** the asserted 88/23 numbers with a stated model form, provisional-prior
  labeling, and a concrete calibration path (the audience is the panel).
- **Stated** falsification tests and validity threats, per the instrument's own bar.

---

## 9. Open decisions for the owner (before this is built into the live assessment)

1. **Aggregation: confirm non-compensatory. RESOLVED.** Confirmed non-compensatory
   (soft-min headline plus product-of-gates probability). Rationale: a compensatory
   mean would contradict the framework's own bottleneck thesis ("succeeds, then stalls
   on the one constraint"); the non-compensatory form *is* that thesis in math. Locked.
2. **Pillar count. RESOLVED.** Confirmed keep **six** pillars; do not expand.
   Rationale: six preserves the "six conditions" brand surface and the radar geometry,
   and is sufficient to separate the documented failure modes. Executive Sponsorship /
   Funding Continuity and Unit Economics / Cost-to-Serve remain *documented but
   excluded* (Section 2.5), the first candidates if the count ever grows.
3. **Pillar renames. RESOLVED.** Confirmed: Integration Density to **Integration
   Reach**, Outcome Measurability to **Value Attribution**, Exception Tolerance to
   **Error Cost and Tolerance**, and the axes to **Build Feasibility / Production
   Absorption**. Rationale: each new name states the construct without the ambiguity of
   the placeholder labels. Radar abbreviations still need reconciling on the live page
   (frontend work, out of methodology lane).
4. **Provisional-number display policy. RESOLVED: bands now, calibrated numbers
   later.** At cold start, show pilot-vs-production likelihood as labeled **bands**
   (High / Moderate / Low) with a short "typical pattern for this archetype, being
   calibrated" frame, and **withhold precise percentages** (remove the ~88% / ~23%
   style point estimates) until parameters are fit from real outcome data; then upgrade
   to calibrated point estimates shown with their sample size. Rationale: displaying
   fabricated precision pre-calibration is the fastest way to lose a skeptical CMO;
   bands are honest and still useful. This policy is now reflected in Sections 6.2 and
   7.
5. **Outcome-capture mechanism commitment. OPEN.** The reframed open decision is no
   longer "commit to forward re-contact at T months." Section 6.3 shows re-contact is
   not required: the recommended design is a hybrid of **retrospective resolved cases
   at launch** (for immediate priors) and **passive outcome capture through the
   sponsor's telemetry or CRM/CS records going forward**, with the commercial-tier
   purchase signal as optional corroboration. The decision the owner must still make is
   **which of these mechanism(s) the sponsor program will commit to and resource**:
   specifically (a) whether the sponsor can expose telemetry (gold standard) or will
   code outcomes from CRM/CS, (b) whether a stock of retrospective resolved cases can
   be assembled at launch, and (c) whether the commercial-tier signal is available.
   Without a committed outcome-capture mechanism, the framework cannot honestly call
   itself "Living," but it no longer depends on operationally heavy re-contact to get
   there.
```
