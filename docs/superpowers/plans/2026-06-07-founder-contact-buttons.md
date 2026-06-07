# Founder Contact Icon Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "LinkedIn →" ghost button in the founder bio section with two icon-only links — a LinkedIn logo and an email icon.

**Architecture:** Single file change to `about.html`. The `.founder-credentials` HTML block is replaced with a `.founder-social` flex row. Two CSS rules (`.founder-social`, `.social-icon-link`) are appended to the existing `<style>` block in `about.html`.

**Tech Stack:** Static HTML, inline CSS. No build step. Assets already on disk: `InBug-Black.png`, `email-svgrepo-com.svg`.

---

### Task 1: Replace the HTML block

**Files:**
- Modify: `about.html:106-110`

- [ ] **Step 1: Open `about.html` and locate the `.founder-credentials` block**

It sits between line 106 and 110 and looks like this:

```html
        <div class="founder-credentials">
          <div class="cred-item">
            <a href="https://linkedin.com/in/evanvolness" target="_blank" rel="noopener" class="btn btn-ghost">LinkedIn →</a>
          </div>
        </div>
```

- [ ] **Step 2: Replace it with the `.founder-social` block**

```html
        <div class="founder-social">
          <a href="https://linkedin.com/in/evanvolness" target="_blank" rel="noopener"
             aria-label="Evan Volness on LinkedIn" class="social-icon-link">
            <img src="InBug-Black.png" alt="" width="28" height="28" />
          </a>
          <a href="mailto:evan@voranta.co" aria-label="Email Evan at evan@voranta.co"
             class="social-icon-link">
            <img src="email-svgrepo-com.svg" alt="" width="28" height="28" />
          </a>
        </div>
```

Note: `alt=""` is intentional — each `<a>` carries its own `aria-label`, so the image is presentational within a labelled link.

---

### Task 2: Add CSS

**Files:**
- Modify: `about.html` — the `<style>` block (it is at the bottom of `<head>`, before the closing `</head>` tag)

- [ ] **Step 1: Locate the closing `</style>` tag inside `<head>`**

It's the only `<style>` block in the file.

- [ ] **Step 2: Append the following rules just before the closing `</style>` tag**

```css
.founder-social {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.social-icon-link {
  display: inline-flex;
  align-items: center;
  opacity: 1;
  transition: opacity 0.15s;
}
.social-icon-link:hover { opacity: 0.5; }
.social-icon-link img { display: block; width: 28px; height: 28px; }
```

---

### Task 3: Verify visually and commit

**Files:**
- No changes — verification only, then commit.

- [ ] **Step 1: Open `about.html` in a browser**

```bash
open /Users/evanvolness/Voranta-Site/about.html
```

- [ ] **Step 2: Scroll to the Founder Bio section and confirm**

  - The "LinkedIn →" ghost button is gone
  - Two icons appear side by side below the bio text: LinkedIn "In" logo and envelope icon
  - Both are ~28px, vertically aligned
  - Hovering either icon drops opacity to ~50%
  - Clicking the LinkedIn icon opens `https://linkedin.com/in/evanvolness` in a new tab
  - Clicking the email icon opens the mail client addressed to `evan@voranta.co`

- [ ] **Step 3: Commit**

```bash
git add about.html
git commit -m "feat: replace LinkedIn text button with icon buttons for LinkedIn and email"
```
