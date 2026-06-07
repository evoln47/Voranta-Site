---
name: founder-contact-buttons
description: Replace the LinkedIn text ghost button in the founder bio section with icon-only buttons for LinkedIn and email
metadata:
  type: project
---

## Overview

Replace the existing "LinkedIn →" ghost button in the founder bio section of `about.html` with two icon-only anchor links: a LinkedIn logo button and an email icon button.

## Assets

- `InBug-Black.png` — LinkedIn "In" bug logo, black, already in repo root
- `email-svgrepo-com.svg` — filled envelope icon, already in repo root

## HTML Change

**Location:** `about.html`, lines 106–110 (the `.founder-credentials` block)

**Remove:**
```html
<div class="founder-credentials">
  <div class="cred-item">
    <a href="https://linkedin.com/in/evanvolness" target="_blank" rel="noopener" class="btn btn-ghost">LinkedIn →</a>
  </div>
</div>
```

**Replace with:**
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

## CSS Addition

Appended to the `<style>` block in `about.html`:

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

## Key Decisions

- `alt=""` on images: the parent `<a>` carries the accessible name via `aria-label`, so the image is presentational within the link
- 28px icon size: large enough to be a comfortable click/tap target, compact enough to feel lightweight next to the bio text
- Opacity-on-hover (not color filter): simpler implementation, avoids complex filter chains, stays design-system safe
- `margin-top: 24px` matches existing spacing rhythm in the founder bio section
- Email link uses `mailto:evan@voranta.co` per spec; LinkedIn URL carried forward from existing HTML

## Files Modified

- `about.html` — HTML structure and CSS only
