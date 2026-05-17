# Mobile Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all mobile layout bugs and UX gaps in `index.html` so the site renders correctly at all screen widths from 320px to 880px.

**Architecture:** All changes are CSS-only, inside the single `<style>` block in `index.html`. One global rule added outside the media query; all other changes go inside or replace rules in the existing `@media (max-width: 880px)` block at line ~273. No HTML or JS changes.

**Tech Stack:** Vanilla HTML/CSS, no build step. Preview by opening `index.html` in browser and using DevTools device emulation.

---

### Task 1: Add global overflow-wrap rule and fix heading typography

**Files:**
- Modify: `index.html` — `<style>` block, heading rules (~line 33) and `@media (max-width: 880px)` block (~line 273)

- [ ] **Step 1: Add `overflow-wrap: break-word` to heading rule**

Find this line in the `<style>` block (~line 33):
```css
h1, h2, h3, h4 { font-family: var(--font-sans); font-weight: 600; color: var(--color-ink); letter-spacing: -0.02em; line-height: 1.2; }
```
Change to:
```css
h1, h2, h3, h4 { font-family: var(--font-sans); font-weight: 600; color: var(--color-ink); letter-spacing: -0.02em; line-height: 1.2; overflow-wrap: break-word; }
```

- [ ] **Step 2: Add h3 and sc-summary-header h3 font-size reductions inside the media query**

Inside the `@media (max-width: 880px)` block, add after the existing `h2` rule:
```css
h3 { font-size: 1.25rem; }
.sc-summary-header h3 { font-size: 1.375rem; }
```

- [ ] **Step 3: Verify in browser**

Open `index.html`. Set DevTools to 375px width. Check:
- No heading text causes horizontal scroll
- `h3` headings (diff cards, sponsor cards) are visibly smaller than desktop
- "The buyer learned something real..." heading in the summary box is a comfortable size

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Fix mobile heading overflow and reduce h3 font sizes"
```

---

### Task 2: Fix section and CTA section padding, and section-head margin

**Files:**
- Modify: `index.html` — `@media (max-width: 880px)` block

- [ ] **Step 1: Update section padding**

Find this line inside the `@media (max-width: 880px)` block:
```css
section { padding: 64px 24px; }
```
Change to:
```css
section { padding: 48px 20px; }
```

- [ ] **Step 2: Update CTA section padding**

Find:
```css
.cta-section { padding: 64px 24px; }
```
Change to:
```css
.cta-section { padding: 48px 20px; }
```

- [ ] **Step 3: Add section-head margin-bottom reduction**

Add this line inside the `@media (max-width: 880px)` block (after the `.cta-section` rule works well):
```css
.section-head { margin-bottom: 40px; }
```

- [ ] **Step 4: Verify in browser**

Set DevTools to 375px. Scroll through the full page and check:
- Sections feel appropriately spaced — not claustrophobic but not wastefully padded
- The gap between the section heading (eyebrow + h2 + rule) and the section content below it is comfortable
- The CTA (dark section at the bottom) has balanced padding

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Tighten section and section-head spacing on mobile"
```

---

### Task 3: Fix methodology grid specificity bug

**Files:**
- Modify: `index.html` — `@media (max-width: 880px)` block

- [ ] **Step 1: Add methodology grid override**

Inside the `@media (max-width: 880px)` block, add after the existing `#product .diff-grid` rule:
```css
#methodology .diff-grid { grid-template-columns: 1fr; }
```

- [ ] **Step 2: Verify in browser**

Set DevTools to 375px. Scroll to the Methodology section ("The bar for every framework we publish."). Confirm the four cards (Opinionated, Transparent, Independent, Living) stack vertically in a single column, not side-by-side.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Fix methodology diff-grid specificity bug on mobile"
```

---

### Task 4: Fix category gap section stat sizes

**Files:**
- Modify: `index.html` — `@media (max-width: 880px)` block

- [ ] **Step 1: Reduce numstat font size**

Find inside the `@media (max-width: 880px)` block:
```css
.gap-numstat-number { font-size: 6rem; }
```
Change to:
```css
.gap-numstat-number { font-size: 4rem; }
```

- [ ] **Step 2: Allow numstat lines to wrap**

Add inside the `@media (max-width: 880px)` block:
```css
.gap-numstat-line { white-space: normal; }
```

- [ ] **Step 3: Verify in browser**

Set DevTools to 375px. Scroll to the "< 3%" black stat card. Check:
- The large number fits comfortably without touching card edges
- The text lines below the number wrap naturally rather than overflowing

Also check at 320px width — the number should still be readable and contained.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Reduce numstat font size and allow text lines to wrap on mobile"
```

---

### Task 5: Fix card and block padding

**Files:**
- Modify: `index.html` — `@media (max-width: 880px)` block

- [ ] **Step 1: Reduce sponsor card padding**

Add inside the `@media (max-width: 880px)` block:
```css
.sponsor-card { padding: 24px 20px; }
```

- [ ] **Step 2: Reduce framework block padding**

Find inside the `@media (max-width: 880px)` block:
```css
.framework-block { padding: 40px 24px; }
```
Change to:
```css
.framework-block { padding: 32px 20px; }
```

- [ ] **Step 3: Verify in browser**

Set DevTools to 375px.

Sponsor cards ("Three tiers. One framework per vertical." section): each card should have comfortable internal spacing without the content area feeling cramped. The pricing number and feature list should be readable.

AIPQ framework block ("The live research framework..." section): the block should fit within the screen with reasonable margins on both sides.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Reduce sponsor card and framework block padding on mobile"
```

---

### Task 6: Fix footer mobile layout

**Files:**
- Modify: `index.html` — `@media (max-width: 880px)` block

- [ ] **Step 1: Add footer padding reduction**

Add inside the `@media (max-width: 880px)` block:
```css
footer { padding: 36px 20px 24px; }
footer .meta { gap: 20px; }
```

- [ ] **Step 2: Verify in browser**

Set DevTools to 375px. Scroll to the footer. Check:
- The Voranta wordmark and the meta links (privacy, terms, etc.) are well-spaced
- The footer doesn't feel over-padded relative to the sections above it
- At 320px, the meta links wrap cleanly if needed (they already have `flex-wrap: wrap`)

- [ ] **Step 3: Full-page pass at multiple widths**

Do a final scroll-through at each of these widths in DevTools:
- 320px (smallest phone)
- 375px (iPhone SE)
- 390px (iPhone 15)
- 768px (iPad portrait)

At each width, check for:
- No horizontal scroll bar
- No text or element clipping outside its container
- All grids stacking to single column
- Font sizes comfortable for reading

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Fix footer padding and meta gap on mobile"
```

---

### Task 7: Final review and push

- [ ] **Step 1: Run design-reviewer agent**

Ask Claude to "run a design review on the latest changes" to confirm no design system violations were introduced.

- [ ] **Step 2: Open site in browser at 375px**

Open `index.html`. Use DevTools responsive mode at 375px. Scroll from top to bottom confirming all sections render correctly.

- [ ] **Step 3: Push and create PR**

```bash
git push
```

Then create a PR summarizing all mobile fixes.
