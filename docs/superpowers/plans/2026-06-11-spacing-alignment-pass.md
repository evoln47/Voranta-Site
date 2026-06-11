# Spacing & Alignment Consistency Pass Implementation Plan

> **For agentic workers:** This is a no-build static site. There is NO test framework. Verification is by **headless-Chrome screenshot + visual comparison** (per repo memory: "no dev server; SEE pages before claiming visual work done"). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove cross-page spacing inconsistencies and two assessment-flow layout problems so the site reads as systematically designed, without introducing a new token layer or changing the deliberate 18px sub-scale.

**Architecture:** Edits land in the shared live stylesheet `styles.css` and three HTML pages (`index.html`, `about.html`, `aipq.html`). All values stay raw `px` matching the current convention. No spacing-token system is introduced (explicitly out of scope, approval-gated). The deliberate, consistently-used 18px sub-scale is left untouched.

**Tech Stack:** Static HTML + single live `styles.css`. Vanilla-JS `assessment/*.mjs` modules for the assessment flow (no edits needed — the JS already scrolls + focuses on results reveal; only CSS `min-height` tuning is required).

**Scope decisions (locked by the user):**
- Do the CSS consistency fixes **and** the assessment-flow fixes. Skip the token-system refactor.
- Leave the recurring 18px sub-scale as-is. Only fix values that are genuinely inconsistent between like components or are one-off inline overrides.

**Out of scope (do NOT touch):** spacing-token layer / `globals.css` mirroring; the `✓` checkmark in `.founding-benefits`; scorecard background-tone (M2, a color call); `style-guide.html` sync; the 18px sub-scale values (`.section-head .rule`, `.pillar-axis-*`, `.sc-summary-right`, `.sc-pillar-callout`).

---

## Verification setup (do this ONCE before Task 1)

- [ ] **Step A: Create a screenshot helper and capture BEFORE shots**

Run this to define a reusable shot function and capture the current state of every surface this plan touches. Re-run the same `shot` calls AFTER each task to compare.

```bash
cd /Users/evanvolness/Voranta-Site
mkdir -p /tmp/spacing-shots
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot () { # $1=file(abs path or relative) $2=width $3=outname
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --window-size="$2",2400 --screenshot="/tmp/spacing-shots/$3" \
    "file://$(pwd)/$1" >/dev/null 2>&1
}
# Desktop (1280) + mobile (375) for each touched page
for w in 1280 375; do
  shot index.html  $w before-index-$w.png
  shot about.html  $w before-about-$w.png
  shot aipq.html   $w before-aipq-$w.png
  shot assessment.html $w before-assessment-$w.png
done
ls -la /tmp/spacing-shots/before-*.png
```

Expected: 8 PNGs written (`before-{index,about,aipq,assessment}-{1280,375}.png`), each non-zero size.

- [ ] **Step B: Confirm the assessment quiz + results can be captured**

The quiz/results screens are JS-rendered and hidden until interaction, so a static screenshot only shows the intro. For the quiz layout-shift work (Task 5) you will instead measure rendered question heights directly with a headless DOM script (provided in Task 5). Note this now; no action beyond reading it.

---

## Task 1: Section-padding tiers (cta-section, inline-cta, assessment)

Collapse the ad-hoc section paddings to the two real tiers (96 base / 64 tight) and make the assessment section symmetric.

**Files:**
- Modify: `styles.css:158` (`.cta-section`)
- Modify: `styles.css:631` (`.inline-cta-section`)
- Modify: `styles.css:557` (`.assessment`)
- Modify: `styles.css:636` (`.assessment` mobile override)

- [ ] **Step 1: Bring the dark CTA section up to the base tier**

`styles.css:158` — change `88px` to `96px`:

```css
  .cta-section { background: var(--color-ink); color: var(--color-paper-light); padding: 96px 24px; text-align: center; border-bottom: none; }
```

- [ ] **Step 2: Bring the homepage inline CTA up to the tight tier**

`styles.css:631` — change `56px` to `64px`:

```css
.inline-cta-section { background: var(--color-paper); padding: 64px 24px; border-top: 0.5px solid var(--color-border-subtle); }
```

- [ ] **Step 3: Make the assessment section padding symmetric (base tier)**

`styles.css:557` — change `72px 24px 96px` to `96px 24px`:

```css
.assessment { padding: 96px 24px; }
```

`styles.css:636` (inside the `@media (max-width: 880px)` block) — change `48px 20px 72px` to `48px 20px`:

```css
  .assessment { padding: 48px 20px; }
```

- [ ] **Step 4: Verify (render + compare)**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$2",2400 --screenshot="/tmp/spacing-shots/$3" "file://$(pwd)/$1" >/dev/null 2>&1; }
for w in 1280 375; do
  shot index.html $w after-t1-index-$w.png
  shot about.html $w after-t1-about-$w.png
  shot assessment.html $w after-t1-assessment-$w.png
done
```

Open the BEFORE/AFTER pairs with the Read tool (they are images). Confirm: the dark closing CTA on `index.html`/`about.html` now has visibly more vertical air; the homepage inline-CTA band is slightly taller; the assessment intro sits with balanced top/bottom space. Nothing overlaps or clips.

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "fix: normalize section padding to base/tight tiers (cta, inline-cta, assessment)"
```

---

## Task 2: Hero eyebrow spacing — systematize the inline 20px into a class

Both hero eyebrows use an identical inline `display: block; margin-bottom: 20px`. Move that to a real `.hero .eyebrow` rule and delete the inline styles, so the value lives in one place.

**Files:**
- Modify: `styles.css` (add a rule after line 83, the end of the `.hero` block)
- Modify: `index.html:86`
- Modify: `aipq.html:78`

- [ ] **Step 1: Add the `.hero .eyebrow` rule**

In `styles.css`, immediately after line 83 (`.hero .meta-value { ... }`), add:

```css
  .hero .eyebrow { display: block; margin-bottom: 20px; }
```

- [ ] **Step 2: Remove the inline override on the homepage hero**

`index.html:86` — change:

```html
      <span class="eyebrow" style="display: block; margin-bottom: 20px;">The missing demand-gen layer</span>
```

to:

```html
      <span class="eyebrow">The missing demand-gen layer</span>
```

- [ ] **Step 3: Remove the inline override on the AIPQ hero**

`aipq.html:78` — change:

```html
      <span class="eyebrow" style="display: block; margin-bottom: 20px;">The inaugural Voranta framework</span>
```

to:

```html
      <span class="eyebrow">The inaugural Voranta framework</span>
```

- [ ] **Step 4: Verify (render + compare)**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$2",2400 --screenshot="/tmp/spacing-shots/$3" "file://$(pwd)/$1" >/dev/null 2>&1; }
shot index.html 1280 after-t2-index.png
shot aipq.html 1280 after-t2-aipq.png
```

Confirm with the Read tool: both hero eyebrows render with exactly the same gap to the H1 as before (20px) — this is a no-visual-change refactor. If the eyebrow gap visibly changed, the rule did not apply (check specificity / that the inline style was actually removed).

- [ ] **Step 5: Commit**

```bash
git add styles.css index.html aipq.html
git commit -m "refactor: move hero eyebrow spacing from inline styles to .hero .eyebrow rule"
```

---

## Task 3: Product-card internal gap matches diff-card

`.product-card` uses `gap: 12px`; the visually-identical `.diff-card` uses `gap: 16px`. Standardize the product card to 16px.

**Files:**
- Modify: `styles.css:210`

- [ ] **Step 1: Change the gap**

`styles.css:210` — change `gap: 12px` to `gap: 16px`:

```css
  .product-card { background: var(--color-paper-light); border: 0.5px solid var(--color-border-subtle); border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
```

- [ ] **Step 2: Verify (render + compare)**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$2",2400 --screenshot="/tmp/spacing-shots/$3" "file://$(pwd)/$1" >/dev/null 2>&1; }
shot index.html 1280 after-t3-index.png
```

Confirm with the Read tool: the product cards ("What we deploy" section) have slightly more internal breathing room between the tag, heading, and body, now matching the differentiation cards. Cards still align in their grid; no text clipping.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "fix: align product-card internal gap (12px -> 16px) with diff-card"
```

---

## Task 4: Remove the one-off section-head override on about.html

The first `.section-head` on `about.html` has an inline `margin-bottom: 36px` that exists nowhere else (system default is 56px). Remove it so the about page matches every other section head.

**Files:**
- Modify: `about.html:95`

- [ ] **Step 1: Remove the inline override**

`about.html:95` — change:

```html
        <div class="section-head" style="margin-bottom: 36px;">
```

to:

```html
        <div class="section-head">
```

- [ ] **Step 2: Verify (render + compare)**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$2",2400 --screenshot="/tmp/spacing-shots/$3" "file://$(pwd)/$1" >/dev/null 2>&1; }
for w in 1280 375; do shot about.html $w after-t4-about-$w.png; done
```

Confirm with the Read tool: on `about.html`, the gap between the "Rewiring the research funnel." heading block and the body paragraph is now the same generous 56px used site-wide; the eyebrow/headline/rule unit reads as a distinct layer above the prose. The two-column layout is still vertically balanced (image left, text right). If it looks too loose given the short header, STOP and flag for a judgment call rather than reintroducing an off-scale value.

- [ ] **Step 3: Commit**

```bash
git add about.html
git commit -m "fix: remove one-off 36px section-head override on about page (use system 56px)"
```

---

## Task 5: Assessment quiz — eliminate question-to-question layout shift

`.dri-q-text` reserves `min-height: 2.6em` (desktop) / `5.2em` (mobile). The longest questions wrap to more lines than that reserves, so the options block jumps vertically between questions. Measure the tallest rendered question and set `min-height` to cover it.

**Files:**
- Modify: `styles.css:577` (`.dri-q-text` desktop)
- Modify: `styles.css:638` (`.dri-q-text` mobile, inside `@media (max-width: 880px)`)

- [ ] **Step 1: Measure every question's rendered text height (desktop 760px column)**

Run this headless measurement script. It renders each question string into the real `.dri-q-text` box at the real quiz width and reports heights, so the `min-height` is evidence-based, not guessed.

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cat > /tmp/measure-q.html <<'EOF'
<!DOCTYPE html><html><head><link rel="stylesheet" href="styles.css">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&display=swap" rel="stylesheet"></head>
<body><div class="dri-screen" data-screen="quiz" style="display:block"><div id="m"></div></div>
<script type="module">
import { questions } from './assessment/framework.mjs';
const m = document.getElementById('m');
const out = [];
for (const q of questions) {
  m.innerHTML = `<p class="dri-q-text" style="min-height:0">${q.text}</p>`;
  const h = m.querySelector('.dri-q-text').getBoundingClientRect().height;
  out.push(`${q.id}: ${h.toFixed(1)}px`);
}
document.title = 'H:' + out.join(' | ');
document.body.insertAdjacentHTML('beforeend', '<pre style="font-size:20px">'+out.join('\n')+'</pre>');
</script></body></html>
EOF
"$CHROME" --headless --disable-gpu --window-size=1280,1200 --screenshot=/tmp/spacing-shots/measure-desktop.png "file://$(pwd)/tmp-measure" 2>/dev/null
cp /tmp/measure-q.html /Users/evanvolness/Voranta-Site/tmp-measure.html
"$CHROME" --headless --disable-gpu --window-size=1280,1200 --screenshot=/tmp/spacing-shots/measure-desktop.png "file://$(pwd)/tmp-measure.html" 2>/dev/null
echo "Open /tmp/spacing-shots/measure-desktop.png to read per-question px heights at the 760px quiz width."
```

Read `/tmp/spacing-shots/measure-desktop.png`. Note the **maximum** px height across the five questions. Convert to em: `max_px / 24` (desktop `.dri-q-text` font-size is 1.5rem = 24px). Round UP to a clean value (e.g. if max is ~93px → 3.9em). This is your desktop `min-height`.

> Note: at 760px the longest questions (`pov`, `signal`) are expected to wrap to 3 lines (~3.9em). Use the measured number, not this estimate, if they differ.

- [ ] **Step 2: Set the desktop min-height**

`styles.css:577` — replace `min-height: 2.6em` with the measured value (write the number you derived; example shown uses `3.9em`):

```css
.dri-q-text { font-size: 1.5rem; font-weight: 500; letter-spacing: -0.02em; line-height: 1.3; margin: 0 0 28px; max-width: 760px; min-height: 3.9em; }
```

- [ ] **Step 3: Measure + set the mobile min-height**

Re-run the measurement at mobile width (font-size becomes 1.25rem = 20px, column ~335px):

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --window-size=375,1400 --screenshot=/tmp/spacing-shots/measure-mobile.png "file://$(pwd)/tmp-measure.html" 2>/dev/null
echo "Read measure-mobile.png; divide max px by 20 for the mobile em value."
```

Read `/tmp/spacing-shots/measure-mobile.png`, take max px, divide by 20, round up. `styles.css:638` — set `.dri-q-text` mobile `min-height` to that value (keep `5.2em` if the measured value is ≤ 5.2em; only raise it if larger):

```css
    .dri-q-text { font-size: 1.25rem; min-height: 5.2em; }
```

- [ ] **Step 4: Verify the shift is gone (render quiz at each question)**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cat > tmp-quiz.html <<'EOF'
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="styles.css">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&display=swap" rel="stylesheet"></head>
<body><section class="assessment"><div class="section-inner"><div class="dri-app">
<div class="dri-screen" data-screen="quiz" style="display:block">
<div class="dri-progress"><div class="dri-progress-bar"><span style="width:20%"></span></div>
<span class="dri-progress-label">Question 1 of 5</span></div>
<div id="dri-question"></div></div></div></div></section>
<script type="module">
import { questions } from './assessment/framework.mjs';
const i = Number(new URLSearchParams(location.search).get('q')||0);
const q = questions[i];
document.getElementById('dri-question').innerHTML =
 `<p class="dri-q-text">${q.text}</p><div class="dri-options">`+
 q.options.map(o=>`<button class="dri-option">${o.label}</button>`).join('')+
 `</div><div class="dri-nav"><span></span><button class="btn dri-next">Continue</button></div>`;
</script></body></html>
EOF
for i in 0 1 2 3 4; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size=1280,1400 --screenshot="/tmp/spacing-shots/quiz-q$i.png" "file://$(pwd)/tmp-quiz.html?q=$i" 2>/dev/null
done
echo "Read quiz-q0..q4: the FIRST option button's top edge should sit at the same Y in every shot."
```

Read `quiz-q0.png` through `quiz-q4.png`. Confirm the first `.dri-option` button starts at the **same vertical position** in all five (allowing a few px). If a 3-line question still pushes options down, raise the desktop `min-height` and re-verify.

- [ ] **Step 5: Remove the temporary measurement files**

```bash
cd /Users/evanvolness/Voranta-Site && rm -f tmp-measure.html tmp-quiz.html /tmp/measure-q.html
git status --short  # confirm only styles.css is modified; no tmp-*.html left tracked
```

- [ ] **Step 6: Commit**

```bash
git add styles.css
git commit -m "fix: stabilize quiz question height to remove option layout shift between questions"
```

---

## Task 6: Assessment results — capture block internal structure + separation

Two small fixes on the results screen: (a) replace the `h3` top-margin hack in the capture copy with a flex gap so the eyebrow+heading group is structurally clean (helps the desktop vertical-centering and the mobile stack), and (b) increase the gap between the primary CTA block and the secondary capture block so they read as a ranked pair, not one unit.

**Files:**
- Modify: `styles.css:610` (`.dri-capture`)
- Modify: `styles.css:612` (`.dri-capture-copy h3`)
- Add: a `.dri-capture-copy` rule in `styles.css` (insert just before line 612)

- [ ] **Step 1: Increase CTA-to-capture separation**

`styles.css:610` — change `margin-top: 24px` to `margin-top: 40px`:

```css
.dri-capture { margin-top: 40px; padding: 28px; border: 0.5px solid var(--color-border-subtle); border-radius: 16px; background: var(--color-paper-light); }
```

- [ ] **Step 2: Replace the h3 top-margin hack with a flex gap on the copy block**

`styles.css:612` — replace this single line:

```css
.dri-capture-copy h3 { margin: 8px 0 0; }
```

with these two rules (the copy block owns the eyebrow→heading gap; the h3 carries no stray margin):

```css
.dri-capture-copy { display: flex; flex-direction: column; gap: 8px; }
.dri-capture-copy h3 { margin: 0; }
```

- [ ] **Step 3: Verify (render the results screen)**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cat > tmp-results.html <<'EOF'
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="styles.css">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@300..600&display=swap" rel="stylesheet"></head>
<body><section class="assessment"><div class="section-inner">
<div class="dri-cta-block"><p class="dri-cta-frame">Your score identifies the gap. A 30-minute call with Voranta maps the specific steps to close it.</p>
<a class="btn btn-lg" href="#">Book a call</a></div>
<div class="dri-capture"><div class="dri-capture-inner">
<div class="dri-capture-copy"><span class="eyebrow">Take it with you</span><h3>Get the full breakdown by email.</h3></div>
<form class="dri-capture-form"><input type="email" placeholder="you@company.com"><button class="btn btn-ghost btn-lg">Email me the breakdown</button></form>
</div></div></div></section></body></html>
EOF
shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$2",1400 --screenshot="/tmp/spacing-shots/$3" "file://$(pwd)/$1" >/dev/null 2>&1; }
shot tmp-results.html 1280 after-t6-results-1280.png
shot tmp-results.html 375 after-t6-results-375.png
rm -f tmp-results.html
```

Read `after-t6-results-1280.png` and `after-t6-results-375.png`. Confirm: (1) clearer separation between the cyan CTA block and the bordered capture block; (2) within the capture block, eyebrow sits 8px above the heading and is vertically aligned cleanly with the form on desktop; (3) on mobile the heading is not flush against the email input (the 24px inner-flex gap separates copy from form).

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "fix: clean capture-copy spacing + increase CTA-to-capture separation on results"
```

---

## Task 7: AIPQ scorecard summary — symmetric padding + more separation

On `aipq.html`, the `.sc-summary` block has asymmetric padding (`48px 56px`) and sits only `32px` below the scorecard grid. Make padding symmetric and increase the top margin.

**Files:**
- Modify: `styles.css:270` (`.sc-summary`)

- [ ] **Step 1: Symmetric padding + larger top margin**

`styles.css:270` — change `padding: 48px 56px` to `padding: 48px` and `margin-top: 32px` to `margin-top: 48px` (leave `column-gap: 56px` and `row-gap: 20px` unchanged):

```css
  .sc-summary { background: var(--color-accent-tint); border-left: 3px solid var(--color-accent); border-radius: 0 16px 16px 0; padding: 48px; margin-top: 48px; display: grid; grid-template-columns: 1.1fr 1fr; column-gap: 56px; row-gap: 20px; align-items: start; }
```

- [ ] **Step 2: Verify (render + compare)**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$2",2400 --screenshot="/tmp/spacing-shots/$3" "file://$(pwd)/$1" >/dev/null 2>&1; }
for w in 1280 375; do shot aipq.html $w after-t7-aipq-$w.png; done
```

Read the AFTER shots and compare to `before-aipq-{1280,375}.png`. Confirm: the cyan "Now imagine the exchange" summary block sits with a clearer gap below the three scorecard cards, and its internal padding looks even on all sides. The mobile override (`32px 28px`, line 328) is unchanged and should still look correct.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "fix: symmetric padding + clearer top separation on AIPQ scorecard summary"
```

---

## Task 8: Final cross-page review pass

- [ ] **Step 1: Re-capture all four pages at both widths and compare to BEFORE**

```bash
cd /Users/evanvolness/Voranta-Site
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$2",2400 --screenshot="/tmp/spacing-shots/$3" "file://$(pwd)/$1" >/dev/null 2>&1; }
for w in 1280 375; do
  shot index.html $w final-index-$w.png
  shot about.html $w final-about-$w.png
  shot aipq.html  $w final-aipq-$w.png
  shot assessment.html $w final-assessment-$w.png
done
```

Read each `final-*` shot against its `before-*` counterpart. Confirm every change is intentional and nothing regressed (no clipping, overlap, broken alignment, or mobile cramping). The only differences should be the deliberate spacing improvements from Tasks 1–7.

- [ ] **Step 2: Run the pre-commit review agents (CLAUDE.md convention)**

Dispatch `visual-designer`, `ux-reviewer`, and `design-reviewer` (read-only, in parallel) on the changed pages to confirm the spacing pass landed and introduced no design-system violations. Apply any high-confidence fixes via the relevant producer, then re-verify.

- [ ] **Step 3: Confirm clean working tree (no stray temp files)**

```bash
cd /Users/evanvolness/Voranta-Site && git status --short
```

Expected: clean (all changes committed; no `tmp-*.html` artifacts).

---

## Self-review checklist (run before declaring done)

1. **Inconsistencies fixed:** cta-section 88→96, inline-cta 56→64, assessment symmetric, hero eyebrow systematized, product-card 12→16, about section-head override removed, quiz min-height tuned, capture spacing, sc-summary padding/margin. ✓ each has a task.
2. **No token system introduced; 18px sub-scale untouched.** ✓ Out-of-scope list honored.
3. **Every CSS edit verified by render**, not by reading the diff. ✓ Each task has a render+Read verify step.
4. **No temp files committed.** ✓ Task 5/8 clean-up steps.
