# Live Assessment (Demand Research Index) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live, client-scored "Demand Research Index" assessment at `/assessment` that gives a visitor an ungated diagnosis (score, archetype, #1 gap) and captures their email plus result as a Voranta lead by email.

**Architecture:** A static page (`assessment.html`) drives four client-side states (intro, questions, ungated results, soft email capture). Scoring is a pure ES module (`assessment/scoring.mjs`) driven by data in `assessment/framework.mjs`, and is the only unit-tested piece (its logic is where bugs hide). UI modules render questions and the scorecard. A dependency-free Vercel function (`api/lead.js`) emails the lead via the Resend REST API.

**Tech Stack:** Vanilla JS ES modules (`.mjs`, no build step), existing `styles.css` design system, Vercel serverless function (CommonJS, global `fetch`), Resend REST API, `node:test` for the scoring unit test.

**Module strategy (important):** The repo has no `package.json` on purpose. Browser + Node ES modules therefore use the `.mjs` extension so both treat them as ESM without a `package.json`. The Vercel function uses CommonJS (`module.exports`) so it needs no `package.json` either. Do not add a `package.json`.

---

## File Structure

**Create:**
- `assessment.html` — the page shell: shared topbar/footer, head, and the four-state app container.
- `assessment/framework.mjs` — the DRI as data (questions, options, points, dimensions, archetypes, gap blurbs). The one file to edit for content.
- `assessment/scoring.mjs` — pure scoring: `scoreAnswers(answers)` → result object. Unit-tested.
- `assessment/engine.mjs` — quiz controller: renders one question at a time, tracks answers, fires `onComplete`.
- `assessment/scorecard.mjs` — renders the result into the DOM (animated score, archetype, dimension bars, gap).
- `assessment/capture.mjs` — email capture handler, POSTs to `/api/lead`, handles success/fallback.
- `assessment/main.mjs` — entry module: wires DOM, owns state transitions.
- `api/lead.js` — Vercel function: validates and emails the lead via Resend.
- `test/scoring.test.mjs` — `node:test` unit tests for scoring.

**Modify:**
- `styles.css` — append all `.assessment` / `.dri-*` styles (and a small `.inline-cta` block).
- `index.html` — hero secondary CTA → `/assessment`; add an inline assessment CTA after the Product section.

---

## Task 1: Page scaffold + base layout

**Files:**
- Create: `assessment.html`
- Modify: `styles.css` (append)

- [ ] **Step 1: Create `assessment.html`**

Copy the exact `<head>` from `aipq.html` (same fonts, favicon, `styles.css` link, the `js` class script), changing only the title and description. Copy the exact `<header class="topbar">…</header>` and `<footer>…</footer>` blocks from `aipq.html` (the wordmark SVG and the hamburger markup are identical across pages). Between them, place this `<main>`:

```html
<main>
<section class="assessment">
  <div class="section-inner">
    <div class="dri-app" id="dri-app">

      <!-- INTRO -->
      <div class="dri-screen" data-screen="intro">
        <span class="eyebrow">Voranta Demand Research Index</span>
        <h1 class="display">How ready is your funnel to earn both the read and the lead?</h1>
        <p class="subhead">Two minutes, eight questions. You get your score, your archetype, and the one gap to close. No email required to see your result.</p>
        <button class="btn btn-lg" id="dri-start" type="button">Start the assessment</button>
      </div>

      <!-- QUIZ -->
      <div class="dri-screen" data-screen="quiz" hidden>
        <div class="dri-progress">
          <div class="dri-progress-bar"><span id="dri-progress-fill"></span></div>
          <span class="dri-progress-label" id="dri-progress-label">Question 1 of 8</span>
        </div>
        <div id="dri-question" class="dri-question"></div>
      </div>

      <!-- RESULTS -->
      <div class="dri-screen" data-screen="results" hidden>
        <div class="dri-results-grid">
          <div class="sc-card is-dark dri-score-card">
            <div class="sc-card-head"><h3>Demand Research Index</h3></div>
            <div class="sc-score-value"><span id="dri-score">0</span><span class="denom">/100</span></div>
            <div>
              <span class="sc-archetype-label">Archetype</span>
              <h4 class="sc-archetype-name" id="dri-archetype-name"></h4>
              <p class="sc-archetype-desc" id="dri-archetype-blurb"></p>
            </div>
          </div>
          <div class="sc-card dri-dimensions">
            <div class="sc-card-head"><h3>Four-dimension diagnostic</h3></div>
            <div id="dri-bars" class="dri-bars"></div>
            <div class="sc-pillar-callout dri-gap">
              <div class="pc-head">
                <span class="pc-name">Your #1 gap</span>
                <span class="pc-score" id="dri-gap-label"></span>
              </div>
              <p class="pc-reading" id="dri-gap-blurb"></p>
            </div>
          </div>
        </div>

        <!-- CAPTURE -->
        <div class="dri-capture">
          <div class="dri-capture-inner">
            <div class="dri-capture-copy">
              <span class="eyebrow">Take it with you</span>
              <h3>Get the full breakdown, with benchmarks, by email.</h3>
            </div>
            <form class="dri-capture-form" id="dri-capture-form" novalidate>
              <input type="text" name="website" class="dri-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
              <input type="email" id="dri-email" name="email" placeholder="you@company.com" required aria-label="Your work email">
              <button type="submit" class="btn btn-lg" id="dri-capture-submit">Email me the breakdown</button>
            </form>
          </div>
          <p class="dri-capture-msg" id="dri-capture-msg" hidden></p>
          <div class="dri-results-cta">
            <a href="https://calendly.com/evoln47/30min" target="_blank" rel="noopener" class="btn btn-ghost btn-lg">Book a call to close the gap</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
</main>
```

Then copy the hamburger `<script>` IIFE from the bottom of `aipq.html` (the menu toggle) so nav works, and add this module script tag right before `</body>`:

```html
<script type="module" src="assessment/main.mjs"></script>
```

- [ ] **Step 2: Append base layout CSS to `styles.css`**

Add at the end of `styles.css`:

```css
/* ===== Assessment (Demand Research Index) ===== */
.assessment { padding: 72px 24px 96px; }
.assessment .section-inner { max-width: 980px; margin: 0 auto; }
.dri-screen[hidden] { display: none; }

.dri-screen[data-screen="intro"] { max-width: 640px; }
.dri-screen[data-screen="intro"] .display { margin: 16px 0 18px; }
.dri-screen[data-screen="intro"] .btn { margin-top: 28px; }

/* Progress */
.dri-progress { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.dri-progress-bar { flex: 1; height: 4px; background: var(--color-border-subtle); border-radius: 999px; overflow: hidden; }
.dri-progress-bar span { display: block; height: 100%; width: 0; background: var(--color-accent); border-radius: 999px; transition: width 240ms cubic-bezier(0.22, 1, 0.36, 1); }
.dri-progress-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-mute); white-space: nowrap; }

/* Question */
.dri-q-text { font-size: 1.5rem; font-weight: 500; letter-spacing: -0.02em; line-height: 1.3; margin: 0 0 28px; max-width: 760px; }
.dri-options { display: flex; flex-direction: column; gap: 12px; max-width: 760px; }
.dri-option { text-align: left; padding: 18px 20px; font-family: var(--font-sans); font-size: 15px; line-height: 1.45; color: var(--color-ink); background: var(--color-paper-light); border: 1px solid var(--color-border-subtle); border-radius: 12px; cursor: pointer; transition: border-color 120ms ease, background 120ms ease, transform 120ms ease; }
.dri-option:hover { border-color: var(--color-accent); background: var(--color-accent-tint); }
.dri-option:active { transform: translateY(1px); }
.dri-option:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

/* Results layout */
.dri-results-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 16px; margin-bottom: 16px; align-items: stretch; }
.dri-score-card .sc-score-value { margin-top: 12px; }

/* Dimension bars */
.dri-bars { display: flex; flex-direction: column; gap: 18px; margin-bottom: 8px; }
.dri-bar-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.dri-bar-name { font-size: 14px; font-weight: 500; color: var(--color-ink); }
.dri-bar-band { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-mute); }
.dri-bar.is-gap .dri-bar-band { color: var(--color-accent-dark); font-weight: 600; }
.dri-bar-track { height: 8px; background: var(--color-border-subtle); border-radius: 999px; overflow: hidden; }
.dri-bar-fill { display: block; height: 100%; width: 0; background: var(--color-ink-faint); border-radius: 999px; transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1); }
.dri-bar.is-gap .dri-bar-fill { background: var(--color-accent); }
.dri-gap { margin-top: 22px; }

/* Capture */
.dri-capture { margin-top: 16px; padding: 28px; border: 0.5px solid var(--color-border-subtle); border-radius: 16px; background: var(--color-paper-light); }
.dri-capture-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.dri-capture-copy h3 { margin: 8px 0 0; }
.dri-capture-form { display: flex; gap: 10px; flex-wrap: wrap; }
.dri-capture-form input[type="email"] { padding: 12px 16px; font-family: var(--font-sans); font-size: 15px; color: var(--color-ink); background: var(--color-paper); border: 1px solid var(--color-border-strong); border-radius: 6px; min-width: 240px; }
.dri-capture-form input[type="email"]:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 1px; border-color: var(--color-accent); }
.dri-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.dri-capture-msg { margin: 16px 0 0; font-size: 14px; }
.dri-capture-msg.is-ok { color: var(--color-accent-dark); }
.dri-capture-msg.is-error { color: var(--color-ink-soft); }
.dri-results-cta { margin-top: 20px; }
```

- [ ] **Step 3: Verify the page loads**

Use `npx serve .` from the repo root (not `python3 -m http.server`: Python often serves `.mjs` as `application/octet-stream`, and browsers reject that as an ES module). Open the printed URL at `/assessment.html`.
Expected: intro screen renders with the headline, subhead, and Start button; topbar wordmark and nav present; no console errors (the module script will 404 until Task 3, that is expected for now). Confirm fonts and colors match the rest of the site.

- [ ] **Step 4: Commit**

```bash
git add assessment.html styles.css
git commit -m "feat: scaffold assessment page shell and base styles"
```

---

## Task 2: Framework data + scoring (TDD)

**Files:**
- Create: `assessment/framework.mjs`
- Create: `assessment/scoring.mjs`
- Test: `test/scoring.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `test/scoring.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnswers } from '../assessment/scoring.mjs';

const IDS = ['pov1', 'pov2', 'conv1', 'conv2', 'trust1', 'trust2', 'signal1', 'signal2'];
const all = (choiceIndex) => IDS.map((id) => ({ questionId: id, choiceIndex }));
const from = (map) => IDS.map((id) => ({ questionId: id, choiceIndex: map[id] }));

test('all lowest answers -> Renter, score 0, gap Point of View', () => {
  const r = scoreAnswers(all(0));
  assert.equal(r.points, 0);
  assert.equal(r.score, 0);
  assert.equal(r.archetype.key, 'renter');
  assert.equal(r.gap.dimension, 'pointOfView');
});

test('all highest answers -> Authority, score 100', () => {
  const r = scoreAnswers(all(2));
  assert.equal(r.points, 16);
  assert.equal(r.score, 100);
  assert.equal(r.archetype.key, 'authority');
});

test('mid band, POV strong -> Publisher, gap Conversion Surface', () => {
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 1, conv2: 1, trust1: 1, trust2: 1, signal1: 1, signal2: 1 }));
  assert.equal(r.score, 63);
  assert.equal(r.archetype.key, 'publisher');
  assert.equal(r.gap.dimension, 'conversionSurface');
});

test('mid band, Conversion strong -> Operator, gap Point of View', () => {
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, conv1: 2, conv2: 2, trust1: 1, trust2: 1, signal1: 1, signal2: 1 }));
  assert.equal(r.score, 63);
  assert.equal(r.archetype.key, 'operator');
  assert.equal(r.gap.dimension, 'pointOfView');
});

test('gap is the strictly lowest dimension regardless of archetype', () => {
  // pov = 3, others = 4 -> points 15, score 94 -> Authority, gap pointOfView
  const r = scoreAnswers(from({ pov1: 2, pov2: 1, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 2, signal2: 2 }));
  assert.equal(r.score, 94);
  assert.equal(r.archetype.key, 'authority');
  assert.equal(r.gap.dimension, 'pointOfView');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/scoring.test.mjs`
Expected: FAIL — cannot resolve `../assessment/scoring.mjs` (module does not exist yet).

- [ ] **Step 3: Create `assessment/framework.mjs`**

```javascript
// The Demand Research Index (DRI) as data. Edit this file to change content.

export const meta = {
  name: 'Demand Research Index',
  short: 'DRI',
};

export const dimensions = [
  { key: 'pointOfView', label: 'Point of View', gap: 'You are renting the lens buyers research against. A framework licensed to your category makes that lens yours.' },
  { key: 'conversionSurface', label: 'Conversion Surface', gap: 'You earn attention but your capture leaks it. An assessment converts where a gated PDF cannot.' },
  { key: 'trustAtCapture', label: 'Trust at Capture', gap: 'Your form taxes trust instead of earning it. A diagnosis gives the buyer a reason to raise their hand.' },
  { key: 'signalToSales', label: 'Signal to Sales', gap: 'Your reps cold-qualify. A scored, archetyped lead puts the diagnosis on the table before the first call.' },
];

export const questions = [
  { id: 'pov1', dimension: 'pointOfView', text: 'When a buyer in your category researches the problem you solve, whose framework or point of view are they most likely using?', options: [
    { label: "A competitor's or an analyst's framework", points: 0 },
    { label: 'A mix, including some of our content, but nothing they would name as ours', points: 1 },
    { label: 'A named framework or point of view the market associates with us', points: 2 },
  ] },
  { id: 'pov2', dimension: 'pointOfView', text: 'Do you have a proprietary, opinionated methodology published under your brand?', options: [
    { label: 'No, our content is mostly best practices and product material', points: 0 },
    { label: 'We have strong thought leadership but no named, structured framework', points: 1 },
    { label: 'Yes, a named framework with a defined methodology buyers can apply', points: 2 },
  ] },
  { id: 'conv1', dimension: 'conversionSurface', text: 'What does your highest-value content typically ask the reader to do?', options: [
    { label: 'Download a gated PDF or fill a form before they get value', points: 0 },
    { label: 'Read freely, with a generic contact-us or newsletter CTA', points: 1 },
    { label: 'Engage with something interactive that returns a personalized result', points: 2 },
  ] },
  { id: 'conv2', dimension: 'conversionSurface', text: 'Roughly what share of people who engage your best content become identifiable pipeline?', options: [
    { label: 'Under about 3 percent, or we cannot tell', points: 0 },
    { label: 'A modest, hard-to-attribute slice', points: 1 },
    { label: 'A meaningful, measured share we can point to', points: 2 },
  ] },
  { id: 'trust1', dimension: 'trustAtCapture', text: 'When you ask a buyer for their information, what do they get in return?', options: [
    { label: 'Access to a download or a demo request', points: 0 },
    { label: 'A useful resource, but nothing specific to them', points: 1 },
    { label: 'A personalized diagnosis or result they could not get elsewhere', points: 2 },
  ] },
  { id: 'trust2', dimension: 'trustAtCapture', text: 'How would a buyer describe filling out your form?', options: [
    { label: 'A toll they pay to reach the content', points: 0 },
    { label: 'Neutral, a reasonable ask', points: 1 },
    { label: 'Worth it on its own, the result is the value', points: 2 },
  ] },
  { id: 'signal1', dimension: 'signalToSales', text: 'When a lead reaches your sales team, what context comes with it?', options: [
    { label: 'A name and an email', points: 0 },
    { label: 'Basic firmographics and the asset they downloaded', points: 1 },
    { label: 'A diagnosed profile: where they stand and the specific gap to close', points: 2 },
  ] },
  { id: 'signal2', dimension: 'signalToSales', text: 'How does a typical first sales conversation open?', options: [
    { label: 'Cold qualification, figuring out who they are and what they need', points: 0 },
    { label: 'Some context, but reps still re-discover the basics', points: 1 },
    { label: "With the buyer's result on the table, straight to the gap", points: 2 },
  ] },
];

export const archetypes = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your buyer's research runs on someone else's framework, and your funnel leaks the attention you earn." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You earn the read, not the lead. Strong point of view, weak conversion and hand-off.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You convert attention well, but you compete on the same lens as everyone else. No framework of your own.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own a framework buyers research against, it converts, and it briefs sales. Lock it to your category before a competitor licenses it first.' },
};
```

- [ ] **Step 4: Create `assessment/scoring.mjs`**

```javascript
import { questions, dimensions, archetypes } from './framework.mjs';

const MAX_POINTS = questions.length * 2; // 16

export function scoreAnswers(answers) {
  const detailed = answers.map((a) => {
    const q = questions.find((x) => x.id === a.questionId);
    return { questionId: a.questionId, choiceIndex: a.choiceIndex, points: q.options[a.choiceIndex].points, dimension: q.dimension };
  });

  const points = detailed.reduce((sum, d) => sum + d.points, 0);
  const score = Math.round((points / MAX_POINTS) * 100);

  const dimensionScores = {};
  for (const dim of dimensions) {
    dimensionScores[dim.key] = detailed.filter((d) => d.dimension === dim.key).reduce((sum, d) => sum + d.points, 0);
  }

  return {
    score,
    points,
    dimensionScores,
    archetype: pickArchetype(score, dimensionScores),
    gap: pickGap(dimensionScores),
    answers: detailed.map(({ questionId, choiceIndex, points: p }) => ({ questionId, choiceIndex, points: p })),
  };
}

function pickArchetype(score, dimensionScores) {
  let a;
  if (score < 40) a = archetypes.renter;
  else if (score >= 65) a = archetypes.authority;
  else a = dimensionScores.pointOfView >= dimensionScores.conversionSurface ? archetypes.publisher : archetypes.operator;
  return { key: a.key, label: a.label, blurb: a.blurb };
}

function pickGap(dimensionScores) {
  let lowest = null;
  for (const dim of dimensions) {
    const value = dimensionScores[dim.key];
    if (lowest === null || value < lowest.value) lowest = { dimension: dim.key, label: dim.label, blurb: dim.gap, value };
  }
  return { dimension: lowest.dimension, label: lowest.label, blurb: lowest.blurb };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/scoring.test.mjs`
Expected: PASS — all 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add assessment/framework.mjs assessment/scoring.mjs test/scoring.test.mjs
git commit -m "feat: add DRI framework data and tested scoring module"
```

---

## Task 3: Quiz engine + app wiring

**Files:**
- Create: `assessment/engine.mjs`
- Create: `assessment/main.mjs`

- [ ] **Step 1: Create `assessment/engine.mjs`**

```javascript
import { questions } from './framework.mjs';

export function createQuiz({ mountEl, progressFill, progressLabel, onComplete }) {
  const answers = [];
  let index = 0;

  function render() {
    const q = questions[index];
    progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
    progressFill.style.width = `${(index / questions.length) * 100}%`;
    mountEl.innerHTML = `
      <p class="dri-q-text">${q.text}</p>
      <div class="dri-options" role="group" aria-label="Answer choices">
        ${q.options.map((o, i) => `<button type="button" class="dri-option" data-choice="${i}">${o.label}</button>`).join('')}
      </div>`;
    mountEl.querySelectorAll('.dri-option').forEach((btn) => {
      btn.addEventListener('click', () => choose(parseInt(btn.dataset.choice, 10)));
    });
    const first = mountEl.querySelector('.dri-option');
    if (first) first.focus();
  }

  function choose(choiceIndex) {
    answers[index] = { questionId: questions[index].id, choiceIndex };
    if (index < questions.length - 1) {
      index += 1;
      render();
    } else {
      progressFill.style.width = '100%';
      onComplete(answers.slice());
    }
  }

  return { start: render };
}
```

- [ ] **Step 2: Create `assessment/main.mjs`** (scorecard + capture imports are wired now; their modules arrive in Tasks 4 and 5)

```javascript
import { scoreAnswers } from './scoring.mjs';
import { createQuiz } from './engine.mjs';
import { renderScorecard } from './scorecard.mjs';
import { wireCapture } from './capture.mjs';

const app = document.getElementById('dri-app');
const screens = {};
app.querySelectorAll('[data-screen]').forEach((el) => { screens[el.dataset.screen] = el; });

function show(name) {
  Object.entries(screens).forEach(([key, el]) => { el.hidden = key !== name; });
}

let lastResult = null;

const quiz = createQuiz({
  mountEl: document.getElementById('dri-question'),
  progressFill: document.getElementById('dri-progress-fill'),
  progressLabel: document.getElementById('dri-progress-label'),
  onComplete(answers) {
    lastResult = scoreAnswers(answers);
    renderScorecard(lastResult, {
      score: document.getElementById('dri-score'),
      archetypeName: document.getElementById('dri-archetype-name'),
      archetypeBlurb: document.getElementById('dri-archetype-blurb'),
      gapLabel: document.getElementById('dri-gap-label'),
      gapBlurb: document.getElementById('dri-gap-blurb'),
      bars: document.getElementById('dri-bars'),
    });
    show('results');
    app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
});

document.getElementById('dri-start').addEventListener('click', () => {
  show('quiz');
  quiz.start();
});

wireCapture(
  document.getElementById('dri-capture-form'),
  document.getElementById('dri-capture-msg'),
  () => lastResult,
);
```

- [ ] **Step 3: Stub the not-yet-built modules so the page runs**

So the page works before Tasks 4 and 5, create temporary minimal files. Create `assessment/scorecard.mjs`:

```javascript
export function renderScorecard() {}
```

Create `assessment/capture.mjs`:

```javascript
export function wireCapture() {}
```

These are replaced with real implementations in Tasks 4 and 5.

- [ ] **Step 4: Verify the quiz flow in the browser**

Run: `npx serve .` from the repo root, open the printed URL at `/assessment.html`.
Expected: clicking Start shows Question 1 of 8; the progress bar advances; clicking an answer advances to the next question; after question 8 the results screen shows (score reads 0 and archetype is empty for now, that is expected until Task 4). No console errors.

- [ ] **Step 5: Commit**

```bash
git add assessment/engine.mjs assessment/main.mjs assessment/scorecard.mjs assessment/capture.mjs
git commit -m "feat: add quiz engine and app state wiring with stub renderers"
```

---

## Task 4: Scorecard renderer

**Files:**
- Modify: `assessment/scorecard.mjs` (replace the stub)

- [ ] **Step 1: Replace `assessment/scorecard.mjs` with the full implementation**

```javascript
import { dimensions } from './framework.mjs';

export function renderScorecard(result, els) {
  els.archetypeName.textContent = result.archetype.label;
  els.archetypeBlurb.textContent = result.archetype.blurb;
  els.gapLabel.textContent = result.gap.label;
  els.gapBlurb.textContent = result.gap.blurb;

  els.bars.innerHTML = dimensions.map((dim) => {
    const raw = result.dimensionScores[dim.key]; // 0-4
    const pct = (raw / 4) * 100;
    const band = raw <= 1 ? 'low' : raw === 2 ? 'mid' : 'high';
    const isGap = dim.key === result.gap.dimension;
    return `
      <div class="dri-bar${isGap ? ' is-gap' : ''}">
        <div class="dri-bar-head">
          <span class="dri-bar-name">${dim.label}</span>
          <span class="dri-bar-band">${band}${isGap ? ' &middot; your gap' : ''}</span>
        </div>
        <div class="dri-bar-track"><span class="dri-bar-fill" data-pct="${pct}"></span></div>
      </div>`;
  }).join('');

  // Animate bars on the next frame so the width transition runs.
  requestAnimationFrame(() => {
    els.bars.querySelectorAll('.dri-bar-fill').forEach((el) => { el.style.width = `${el.dataset.pct}%`; });
  });

  animateScore(els.score, result.score);
}

function animateScore(el, target) {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { el.textContent = String(target); return; }
  const duration = 900;
  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const eased = Math.sin((p * Math.PI) / 2);
    el.textContent = String(Math.round(eased * target));
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = String(target);
  }
  requestAnimationFrame(frame);
}
```

- [ ] **Step 2: Verify each archetype renders correctly**

Run the local server and open `http://localhost:8000/assessment.html`. Walk the quiz four times to confirm:
- All first options (top answer each) → score animates to 0, archetype "The Renter", gap "Point of View".
- All last options → score animates to 100, archetype "The Authority".
- POV both top, others middle → score 63, "The Publisher", gap "Conversion Surface".
- Conversion both top, others middle → score 63, "The Operator", gap "Point of View".
Expected: the gap dimension bar is cyan and tagged "· your gap"; other bars are neutral. Score uses tabular numerals and animates.

- [ ] **Step 3: Commit**

```bash
git add assessment/scorecard.mjs
git commit -m "feat: render DRI scorecard with animated score, bars, and gap"
```

---

## Task 5: Email capture (client side)

**Files:**
- Modify: `assessment/capture.mjs` (replace the stub)

- [ ] **Step 1: Replace `assessment/capture.mjs` with the full implementation**

```javascript
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function wireCapture(form, msgEl, getResult) {
  if (!form) return;
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements.email.value.trim();
    const website = form.elements.website.value; // honeypot

    if (!EMAIL_RE.test(email)) {
      showMsg(msgEl, 'Please enter a valid email.', false);
      return;
    }

    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, ...getResult() }),
      });
      if (!res.ok) throw new Error(`bad status ${res.status}`);
      showMsg(msgEl, 'Sent. Check your inbox for the full breakdown.', true);
      form.hidden = true;
    } catch (err) {
      showMsg(msgEl, 'We could not send that. Email evan@voranta.co and we will get it to you.', false);
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}

function showMsg(el, text, ok) {
  el.textContent = text;
  el.hidden = false;
  el.classList.toggle('is-ok', ok);
  el.classList.toggle('is-error', !ok);
}
```

- [ ] **Step 2: Verify client-side validation and the failure path**

Run the local server, complete the quiz, and on the results screen:
- Submit with an invalid email (e.g. `abc`) → inline message "Please enter a valid email." and no network request.
- Submit with a valid email → since `/api/lead` does not exist on the static server, the fetch fails and the fallback message "We could not send that..." shows, and the button re-enables. (The endpoint is built and verified in Task 6.)
Expected: results stay visible throughout; nothing is gated.

- [ ] **Step 3: Commit**

```bash
git add assessment/capture.mjs
git commit -m "feat: wire client-side email capture with validation and fallback"
```

---

## Task 6: `/api/lead` serverless function

**Files:**
- Create: `api/lead.js`

- [ ] **Step 1: Create `api/lead.js`** (CommonJS, dependency-free, Resend REST API)

```javascript
// Vercel serverless function (Node runtime, CommonJS, no dependencies).
// Emails a pre-diagnosed Demand Research Index lead via the Resend REST API.

const FROM = process.env.LEAD_FROM || 'Voranta Assessment <onboarding@resend.dev>';
const TO = process.env.LEAD_TO || 'evan@voranta.co';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  if (body.website) { res.status(200).json({ ok: true }); return; } // honeypot: silently accept

  const email = String(body.email || '').trim();
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email not configured' });
    return;
  }

  const ds = body.dimensionScores || {};
  const archetypeLabel = body.archetype && body.archetype.label;
  const text = [
    'New Demand Research Index lead',
    '',
    `Email: ${email}`,
    `Score: ${body.score}/100`,
    `Archetype: ${archetypeLabel}`,
    `#1 gap: ${body.gap && body.gap.label}`,
    '',
    'Dimension scores (0-4):',
    `  Point of View: ${ds.pointOfView}`,
    `  Conversion Surface: ${ds.conversionSurface}`,
    `  Trust at Capture: ${ds.trustAtCapture}`,
    `  Signal to Sales: ${ds.signalToSales}`,
    '',
    `Answers: ${JSON.stringify(body.answers)}`,
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `New DRI lead: ${email} (${body.score}/100, ${archetypeLabel})`,
        text,
      }),
    });
    if (!r.ok) { res.status(502).json({ error: 'Send failed' }); return; }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: 'Send failed' });
  }
};
```

- [ ] **Step 2: Set the Resend env var (manual, one time)**

The implementer or Evan creates a Resend account, gets an API key, and adds it to the Vercel project:

Run: `vercel env add RESEND_API_KEY` (or set it in the Vercel dashboard for Production and Preview).
Optionally set `LEAD_FROM` to a verified-domain sender (e.g. `Voranta <noreply@voranta.co>`) once the domain is verified in Resend; until then the default `onboarding@resend.dev` works for testing.

- [ ] **Step 3: Verify on a Vercel preview deploy**

A real send needs the Vercel function runtime, so verify on a preview deployment (the static `python3 -m http.server` cannot run `/api`). Push the branch and open the preview URL, complete the quiz, submit a valid email.
Expected: success message "Sent. Check your inbox..." and a lead email arrives at the `TO` inbox with the score, archetype, gap, dimension scores, and answers.
Also: submitting with the hidden `website` honeypot filled returns 200 and sends nothing (test with a manual `curl -X POST <preview>/api/lead -H 'content-type: application/json' -d '{"website":"x","email":"a@b.co"}'`).

- [ ] **Step 4: Commit**

```bash
git add api/lead.js
git commit -m "feat: add /api/lead function to email diagnosed leads via Resend"
```

---

## Task 7: Wire the assessment into the homepage

**Files:**
- Modify: `index.html` (hero CTA + inline CTA after the Product section)
- Modify: `styles.css` (append inline CTA styles)

- [ ] **Step 1: Repoint the hero secondary CTA**

In `index.html`, in the `.cta-row` (around line 79), replace the ghost button:

Find:
```html
        <a href="/aipq" class="btn btn-ghost btn-lg">How it works</a>
```
Replace with:
```html
        <a href="/assessment" class="btn btn-ghost btn-lg">Take the 2-minute assessment</a>
```
(The framework is still reachable from the nav "Framework" link and the framework teaser's "Explore the framework" button, so no path is lost.)

- [ ] **Step 2: Add an inline CTA after the Product section**

In `index.html`, immediately after the Product section's closing `</section>` (the section with `id="product"`, around line 162) and before `<!-- FRAMEWORK TEASER -->`, insert:

```html
<!-- INLINE ASSESSMENT CTA -->
<section class="inline-cta-section">
  <div class="section-inner">
    <div class="inline-cta">
      <p>See the mechanic for yourself. Take the 2-minute Demand Research Index and get your funnel's score, your archetype, and the one gap to close.</p>
      <a href="/assessment" class="btn btn-lg">Take the assessment</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Append inline CTA styles to `styles.css`**

```css
/* Inline assessment CTA (homepage) */
.inline-cta-section { background: var(--color-paper); padding: 56px 24px; border-top: 0.5px solid var(--color-border-subtle); }
.inline-cta { max-width: 880px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 28px; flex-wrap: wrap; }
.inline-cta p { font-size: 1.0625rem; line-height: 1.5; color: var(--color-ink-soft); margin: 0; max-width: 560px; }
```

- [ ] **Step 4: Verify on the homepage**

Run the local server, open `http://localhost:8000/` (or `/index.html`).
Expected: the hero ghost button reads "Take the 2-minute assessment" and links to `/assessment`; a new inline CTA band appears between the Product section and the framework teaser, with a working "Take the assessment" button. Both navigate to the assessment page.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat: link homepage hero and inline CTA to the assessment"
```

---

## Task 8: Responsive + design-system pass

**Files:**
- Modify: `styles.css` (append mobile overrides)

- [ ] **Step 1: Append mobile styles to `styles.css`**

```css
@media (max-width: 880px) {
  .assessment { padding: 48px 20px 72px; }
  .dri-results-grid { grid-template-columns: 1fr; }
  .dri-q-text { font-size: 1.25rem; }
  .dri-capture-inner { flex-direction: column; align-items: stretch; }
  .dri-capture-form { flex-direction: column; }
  .dri-capture-form input[type="email"] { min-width: 0; width: 100%; }
  .dri-capture-form .btn { width: 100%; justify-content: center; }
  .inline-cta { flex-direction: column; align-items: flex-start; }
  .inline-cta .btn { width: 100%; justify-content: center; }
}
```

- [ ] **Step 2: Verify mobile and the design system**

In the browser dev tools, set the viewport to 375px wide and walk the full flow.
Expected: results stack vertically; the capture form stacks and the button is full width; the inline CTA stacks. Then confirm design-system compliance: only Geist / Fraunces / Geist Mono fonts; the only accent is cyan `#0891B2`; no gradients, no drop shadows; no border-radius over 16px; no em-dashes in any copy.

- [ ] **Step 3: Run the design-reviewer agent (optional but recommended)**

Ask the design-reviewer agent to check `assessment.html`, `index.html`, and the appended `styles.css` against the Voranta design system. Address any flagged issues.

- [ ] **Step 4: Final scoring test run**

Run: `node --test test/scoring.test.mjs`
Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "feat: responsive styles and design-system pass for the assessment"
```

---

## Self-Review

**Spec coverage:**
- DRI framework (4 dimensions, 8 questions, points) → Task 2 (`framework.mjs`).
- Scoring (0-100, dimension scores, archetypes with mid-band split, weakest-dimension gap) → Task 2 (`scoring.mjs`), tested.
- Flow / four states (intro, questions, ungated results, soft capture) → Task 1 markup + Task 3 wiring.
- Ungated results → results render before any email ask; capture failure never hides results (Tasks 4, 5).
- Scorecard visual language reuse + animated score → Task 4, reusing `.sc-card.is-dark` etc.
- Email capture + `/api/lead` (Resend, honeypot, validation) → Tasks 5 and 6.
- Error handling (graceful fallback, never lose the result) → Task 5 fallback path.
- Testing (deterministic scoring) → Task 2 `node:test`.
- Design-system compliance + Fraunces only for name/score → reuse of `.sc-*` classes + Task 8 review.
- Homepage wiring (hero secondary + inline CTA after Product) → Task 7.
- Resend `RESEND_API_KEY` dependency → Task 6 Step 2.

**Placeholder scan:** No TBD/TODO; every code step contains full code; the Task 3 stubs are explicitly temporary and replaced in Tasks 4 and 5.

**Type consistency:** `scoreAnswers` returns `{ score, points, dimensionScores, archetype:{key,label,blurb}, gap:{dimension,label,blurb}, answers }`, consumed identically in `scorecard.mjs` (reads `archetype.label`, `gap.dimension`, `dimensionScores[key]`), `capture.mjs` (spreads the whole result), and `api/lead.js` (reads `score`, `archetype.label`, `gap.label`, `dimensionScores.*`, `answers`). Element-id hooks in `assessment.html` match every `getElementById` in `main.mjs`. Module filenames are `.mjs` throughout the import graph; the API function alone is `.js` CommonJS.

---

## Execution Handoff

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task with review between tasks (superpowers:subagent-driven-development).
2. **Inline Execution** — execute tasks in this session with checkpoints (superpowers:executing-plans).
