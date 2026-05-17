# AIPQ Section Visual Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the AIPQ section's visual weight and narrative clarity so sponsors immediately understand the model and can picture deploying AIPQ in their own market.

**Architecture:** Three coordinated changes to `index.html` only — section head copy rewrite, CSS split of `.framework-block` into dark header and light body zones, and HTML restructure to wrap content in those zones.

**Tech Stack:** Static HTML/CSS. No build step. Preview by opening `index.html` in a browser directly.

---

### Task 1: Rewrite section head copy

**Files:**
- Modify: `index.html` lines 595–600

- [ ] **Step 1: Replace the section head block**

Find this block (lines 595–600):

```html
    <div class="section-head">
      <span class="eyebrow">Currently in market</span>
      <h2>Most enterprise AI succeeds in pilot. Then it stalls.</h2>
      <div class="rule"></div>
      <p class="subhead" style="margin-top: 20px;">AIPQ diagnoses why, at the workflow level, before a quarter of engineering time is committed.</p>
    </div>
```

Replace with:

```html
    <div class="section-head">
      <span class="eyebrow">The framework in practice</span>
      <h2>Every market has a version of this problem. AIPQ is the diagnostic you deploy in yours.</h2>
      <div class="rule"></div>
      <p class="subhead" style="margin-top: 20px;">AI software vendors license AIPQ to run this assessment with their prospects. Each sponsor holds it exclusively in their segment. The buyer gets a real diagnosis. The sponsor opens every sales conversation with the problem already named.</p>
    </div>
```

- [ ] **Step 2: Open `index.html` in a browser and scroll to the AIPQ section**

Verify:
- Eyebrow reads "The framework in practice"
- H2 reads "Every market has a version of this problem. AIPQ is the diagnostic you deploy in yours."
- Subhead reads correctly (starts "AI software vendors license AIPQ…")

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Rewrite AIPQ section head to sponsor frame"
```

---

### Task 2: Update `.framework-block` CSS and add new zone classes

**Files:**
- Modify: `index.html` line 98 (`.framework-block` rule)
- Modify: `index.html` after line 101 (add new rules in the AIPQ framework section comment block)
- Modify: `index.html` line 298 (remove obsolete `.framework-block` mobile padding rule)

- [ ] **Step 1: Replace the `.framework-block` rule (line 98)**

Find:
```css
  .framework-block { background: var(--color-paper-light); border: 0.5px solid var(--color-border-subtle); border-radius: 16px; padding: 64px 48px; }
```

Replace with:
```css
  .framework-block { border: 0.5px solid var(--color-border-subtle); border-radius: 16px; overflow: hidden; }
```

- [ ] **Step 2: Add new zone rules directly after the `.framework-desc` rule (after line 101)**

Find:
```css
  .framework-desc { font-size: 15px; color: var(--color-ink-soft); line-height: 1.6; margin-bottom: 40px; }
```

Replace with:
```css
  .framework-desc { font-size: 15px; color: var(--color-ink-soft); line-height: 1.6; margin-bottom: 40px; }
  .framework-block-head { background: var(--color-ink); padding: 48px 48px 40px; }
  .framework-block-body { background: var(--color-paper-light); padding: 40px 48px 48px; }
  .framework-block-head .framework-name { color: var(--color-paper-light); }
  .framework-block-head .framework-full { color: rgba(244,247,244,0.65); }
  .framework-block-head .framework-desc { color: rgba(244,247,244,0.7); margin-bottom: 0; }
  .framework-block-head .badge { background: rgba(244,247,244,0.08); color: rgba(244,247,244,0.75); border: 0.5px solid rgba(244,247,244,0.25); }
  .framework-block-head .badge-dot { background: var(--color-accent); }
```

- [ ] **Step 3: Remove the obsolete `.framework-block` mobile padding rule (line 298)**

Find (inside the `@media (max-width: 880px)` block around line 298):
```css
    .framework-block { padding: 32px 20px; }
```

Replace with:
```css
    .framework-block-head { padding: 32px 20px 24px; }
    .framework-block-body { padding: 24px 20px 32px; }
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Split framework-block into dark head and light body zones"
```

---

### Task 3: Restructure framework-block HTML

**Files:**
- Modify: `index.html` lines 601–673

The current `.framework-block` has the name/badge/description floating loose inside the block. This task wraps them in `.framework-block-head`, moves the pillar axes into `.framework-block-body`, and updates the badge text.

- [ ] **Step 1: Replace the framework-block open and its header content**

Find (lines 601–609):
```html
    <div class="framework-block">
      <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
        <div>
          <span class="framework-name">AIPQ</span>
          <p class="framework-full">AI Production Quotient</p>
        </div>
        <span class="badge"><span class="badge-dot"></span>Founding cohort forming · Q2 2026</span>
      </div>
      <p class="framework-desc">Six structural conditions determine whether an AI workflow will reach production. AIPQ scores all six, places the workflow against four archetypes, and names the one constraint most likely to block deployment. No pilot data required.</p>
      <div class="pillar-axes">
```

Replace with:
```html
    <div class="framework-block">
      <div class="framework-block-head">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
          <div>
            <span class="framework-name">AIPQ</span>
            <p class="framework-full">AI Production Quotient</p>
          </div>
          <span class="badge"><span class="badge-dot"></span>Founding cohort forming</span>
        </div>
        <p class="framework-desc">Six structural conditions determine whether an AI workflow will reach production. AIPQ scores all six, places the workflow against four archetypes, and names the one constraint most likely to block deployment. No pilot data required.</p>
      </div>
      <div class="framework-block-body">
      <div class="pillar-axes">
```

- [ ] **Step 2: Close the new `.framework-block-body` div**

Use the `</section>` tag as anchor to make the find unique. Find (lines 671–674):
```html
      </div>
    </div>
  </div>
</section>
```

Replace with (adds one `</div>` to close `.framework-block-body` before `.framework-block` closes):
```html
      </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Open `index.html` in a browser and verify the AIPQ section**

Check:
- The AIPQ name ("AIPQ" in large Fraunces italic) appears on a dark ink background
- "AI Production Quotient" and the description paragraph are also on dark background with legible light text
- The badge reads "Founding cohort forming" (no "· Q2 2026") and is visible on dark
- The two pillar axes (Technical Readiness / Operational Fit) appear below on a light background
- The dark-to-light split looks clean with no gap or misaligned border-radius
- Section has clear visual weight compared to the surrounding sections

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Restructure framework-block HTML into dark head and light body zones"
```
