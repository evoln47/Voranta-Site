# Live Assessment — Design Spec

- **Date:** 2026-06-08
- **Status:** Approved (pending user review of this document)
- **Topic:** A live, client-scored assessment on voranta.co that demos the product mechanic and captures the visitor as a Voranta lead.

## 1. Context and problem

The conversion audit found two linked gaps:

- **Finding #1:** Voranta sells interactive assessments as the answer to gated PDFs that convert under 3 percent, yet the site only shows a *static* sample scorecard. It does not eat its own dog food.
- **Finding #3:** Every homepage CTA dead-ends at a 30-minute Calendly, so the interested-but-not-ready visitor leaves and nothing is captured.

A live assessment closes both at once: it is the strongest "show, don't tell" proof, and its completion becomes the lower-commitment capture path that keeps the call primary.

## 2. Goal and success criteria

Give a B2B software marketing leader (the prospective sponsor) a real, ungated diagnosis of their own research-funnel maturity, and capture their email plus result as a pre-diagnosed lead for Voranta.

Success criteria:

- A visitor can complete the assessment and see a real score, archetype, and #1 gap without entering an email (ungated).
- On opt-in, the lead reaches Evan by email with the visitor's answers and computed result attached.
- The assessment is reusable as the homepage secondary CTA and the inline CTA after the Product section.
- Everything respects the locked Voranta design system.

## 3. Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| What it is | A client-side scored demo that captures leads (not the full CRM-routing product) |
| Framework content | A new Voranta self-diagnostic aimed at the visitor, not AIPQ |
| Framework name | **Demand Research Index (DRI)** |
| URL | `/assessment` (`assessment.html`) |
| Capture mechanism | A small Vercel serverless function at `/api/lead` that emails the lead |
| Results gating | Ungated. Results always show; email capture is an optional follow-on |

## 4. The framework: Demand Research Index (DRI)

Four dimensions, mapped 1:1 to Voranta's four product parts and the homepage narrative. Each dimension has 2 questions. Each question is multiple choice with 3 graded answers worth 0, 1, or 2 points.

| Dimension | Measures |
|---|---|
| Point of View | Do you own a proprietary framework buyers research against, or rent analysts'/competitors' frameworks? |
| Conversion Surface | Does your best content convert, or sit behind gated PDFs at under 3 percent? |
| Trust at Capture | Does your form give the buyer a diagnosis, or just extract an email? |
| Signal to Sales | Do leads arrive pre-qualified with context, or as a name and email to cold-chase? |

### 4.1 Questions (v1 draft)

Answer points shown in brackets. Copy may be refined during implementation, but the pattern and scoring are fixed.

**Point of View**

1. When a buyer in your category researches the problem you solve, whose framework or point of view are they most likely using?
   - A competitor's or an analyst's framework [0]
   - A mix, including some of our content, but nothing they would name as ours [1]
   - A named framework or point of view the market associates with us [2]
2. Do you have a proprietary, opinionated methodology published under your brand?
   - No, our content is mostly best practices and product material [0]
   - We have strong thought leadership but no named, structured framework [1]
   - Yes, a named framework with a defined methodology buyers can apply [2]

**Conversion Surface**

3. What does your highest-value content typically ask the reader to do?
   - Download a gated PDF or fill a form before they get value [0]
   - Read freely, with a generic contact-us or newsletter CTA [1]
   - Engage with something interactive that returns a personalized result [2]
4. Roughly what share of people who engage your best content become identifiable pipeline?
   - Under about 3 percent, or we cannot tell [0]
   - A modest, hard-to-attribute slice [1]
   - A meaningful, measured share we can point to [2]

**Trust at Capture**

5. When you ask a buyer for their information, what do they get in return?
   - Access to a download or a demo request [0]
   - A useful resource, but nothing specific to them [1]
   - A personalized diagnosis or result they could not get elsewhere [2]
6. How would a buyer describe filling out your form?
   - A toll they pay to reach the content [0]
   - Neutral, a reasonable ask [1]
   - Worth it on its own, the result is the value [2]

**Signal to Sales**

7. When a lead reaches your sales team, what context comes with it?
   - A name and an email [0]
   - Basic firmographics and the asset they downloaded [1]
   - A diagnosed profile: where they stand and the specific gap to close [2]
8. How does a typical first sales conversation open?
   - Cold qualification, figuring out who they are and what they need [0]
   - Some context, but reps still re-discover the basics [1]
   - With the buyer's result on the table, straight to the gap [2]

### 4.2 Scoring

- **Per dimension:** sum of its 2 questions, range 0 to 4.
- **Overall:** sum of all 8 questions (range 0 to 16), normalized to 0 to 100 as `round(points / 16 * 100)`.
- **Dimension band for the bars:** 0 to 1 = low, 2 = mid, 3 to 4 = high.

### 4.3 Archetypes (deterministic)

Assigned from the overall score, with the mid band split by pattern:

- **0 to 39 — The Renter:** Your buyer's research runs on someone else's framework, and your funnel leaks the attention you earn.
- **40 to 64 — mid band:**
  - if `PointOfView points >= ConversionSurface points` → **The Publisher:** You earn the read, not the lead. Strong point of view, weak conversion and hand-off.
  - else → **The Operator:** You convert attention well, but you compete on the same lens as everyone else. No framework of your own.
- **65 to 100 — The Authority:** You own a framework buyers research against, it converts, and it briefs sales. Lock it to your category before a competitor licenses it first.

Tie in the mid band (equal points) resolves to The Publisher.

### 4.4 The #1 gap

The gap is the dimension with the lowest raw points. Ties break by the dimension order listed in section 4 (Point of View, Conversion Surface, Trust at Capture, Signal to Sales). Each dimension has one gap blurb that names the weakness and points to what a Voranta framework fixes:

- **Point of View:** You are renting the lens buyers research against. A framework licensed to your category makes that lens yours.
- **Conversion Surface:** You earn attention but your capture leaks it. An assessment converts where a gated PDF cannot.
- **Trust at Capture:** Your form taxes trust instead of earning it. A diagnosis gives the buyer a reason to raise their hand.
- **Signal to Sales:** Your reps cold-qualify. A scored, archetyped lead puts the diagnosis on the table before the first call.

## 5. Flow and page states

New page at `/assessment` (`assessment.html`). Four client-side states:

1. **Intro:** framework name, "2 minutes, 8 questions, get your score and the one gap to close," Start button. No email required to start.
2. **Questions:** one question at a time, progress indicator, multiple choice.
3. **Results (ungated):** the scorecard, reusing the AIPQ scorecard visual language for consistency. The overall score animates in like the homepage stat. Shows archetype, the four dimension bars, and the #1 gap.
4. **Soft capture:** below the results, "Email me the full breakdown" (email field) plus "Book a call." Results stay visible regardless of whether the visitor submits.

### 5.1 Scorecard layout (reference)

```
DEMAND RESEARCH INDEX
   58 / 100      archetype: THE PUBLISHER
                 "You earn the read, not the lead."

Point of View       high
Conversion Surface  low   <- your gap
Trust at Capture    mid
Signal to Sales     low

YOUR #1 GAP: Conversion Surface
You earn attention but your capture leaks it. [on-message line]

   [ Email me the full breakdown ]   [ Book a call ]
```

## 6. Architecture (clean units)

- **`framework.js`** — the DRI as data: questions, options, points, dimensions, archetype bands, gap blurbs. The single file tuned to change content. No rendering logic.
- **Quiz engine (JS)** — renders questions, tracks answers, computes the result object from `framework.js`. Deterministic, so it is unit-testable.
- **Scorecard renderer (JS)** — takes the result object and draws score, archetype, bars, and gap.
- **Capture handler (JS)** — on email submit, POSTs to `/api/lead` and handles success and failure.
- **`/api/lead` (Vercel serverless function)** — receives `{ email, answers, score, dimensionScores, archetype, gap }`, validates, and emails Evan a pre-diagnosed lead. Uses Resend (`RESEND_API_KEY` env var) as the email provider. Includes a honeypot field for spam.
- **`assessment.html` + CSS** — layout for the four states. Follows the current external `styles.css` pattern, matching `aipq.html`.

### 6.1 Data flow

`framework.js` → quiz engine collects answers → scoring → result object → scorecard renderer, and on opt-in → capture handler → `/api/lead` → email to Evan.

### 6.2 Result object (interface between units)

```
{
  score: number,              // 0-100
  points: number,             // 0-16 raw
  dimensionScores: {          // raw 0-4 per dimension
    pointOfView, conversionSurface, trustAtCapture, signalToSales
  },
  archetype: { key, label, blurb },
  gap: { dimension, blurb },
  answers: [{ questionId, choiceIndex, points }]
}
```

## 7. Error handling

- `/api/lead` validates the payload and the email; returns 2xx on success, 4xx on bad input, 5xx on provider failure.
- On any non-2xx, the client shows a graceful fallback ("We could not send that. Email evan@voranta.co and we will get it to you."). The result is never lost and never gated, so a capture failure never blocks the value.
- Email validated client-side before submit. Honeypot field rejects obvious bots.

## 8. Testing

- Scoring is deterministic, so the core is covered by a small Node script asserting `answers -> score, archetype, gap` across representative answer sets (all-low → Renter, all-high → Authority, mid with POV>Conversion → Publisher, mid with Conversion>POV → Operator, and a known weakest-dimension gap).
- The repo has no test setup today, so this stays a lightweight standalone script rather than a framework.
- Manual pass: complete the flow in a browser, confirm ungated results, confirm a test lead email arrives.

## 9. Design-system compliance

- Geist throughout. **Fraunces only** for the framework name and the big score (trust moments). Geist Mono for eyebrows and dimension tags.
- Cyan accent only. No gradients, no drop shadows, no border-radius over 16px.
- No em-dashes anywhere in copy.
- Score animates in, consistent with the homepage stat animation.

## 10. Scope

**In v1:** 8 questions, 4 dimensions, ungated scorecard, archetype plus weakest-dimension gap, email capture via `/api/lead`, wiring as the homepage secondary CTA and the inline CTA after the Product section.

**Not in v1 (YAGNI):** storing responses for a real benchmark, user accounts, multiple frameworks, real CRM integration, A/B variants, and the per-sponsor branded/CRM-routing product (that remains what Voranta licenses, not what runs on voranta.co).

## 11. Open implementation dependencies

- A Resend account and `RESEND_API_KEY` env var in Vercel, plus a verified sender domain (or the Resend onboarding domain for testing). This is a setup task, not a design question.
- Confirm the destination inbox (`evan@voranta.co`).
- The homepage rewiring (hero secondary CTA and the inline CTA) is part of this work but touches `index.html`, so it sequences after the assessment page exists, per the audit's lane plan.
