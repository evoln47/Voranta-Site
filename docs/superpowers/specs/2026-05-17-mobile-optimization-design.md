# Mobile Optimization — Design Spec
Date: 2026-05-17

## Scope

Comprehensive mobile CSS fixes for `index.html`. All changes go inside the existing `@media (max-width: 880px)` block, plus one global rule. No new breakpoints, no HTML changes, no JavaScript changes.

## Approach

Single-breakpoint fix (Approach B). Fill gaps in the existing 880px media query — fix confirmed layout bugs and close UX gaps. Keep the code pattern consistent with the existing site.

## Changes

### Global (outside media query)

Add `overflow-wrap: break-word` to `h1, h2, h3, h4`. Prevents any long word in a heading from causing horizontal scroll on any screen size.

### Inside `@media (max-width: 880px)`

| Selector | Property | Current value | New value | Reason |
|----------|----------|---------------|-----------|--------|
| `#methodology .diff-grid` | `grid-template-columns` | `repeat(2,1fr)` (not overridden — specificity bug) | `1fr` | Confirmed layout break: 2 narrow cards side-by-side on phone |
| `section` | `padding` | `64px 24px` | `48px 20px` | Reduce vertical breathing room; 4px tighter horizontal |
| `.cta-section` | `padding` | `64px 24px` | `48px 20px` | Match section padding reduction |
| `.section-head` | `margin-bottom` | `56px` (not overridden) | `40px` | Too much space between head and content on mobile |
| `.gap-numstat-number` | `font-size` | `6rem` | `4rem` | 96px numeral is too large on 320–375px screens |
| `.gap-numstat-line` | `white-space` | `nowrap` (not overridden) | `normal` | Lines cannot wrap and may overflow narrow screens |
| `.sponsor-card` | `padding` | `36px 32px` (not overridden) | `24px 20px` | 32px inner horizontal + 20px section = too narrow on phone |
| `.framework-block` | `padding` | `40px 24px` | `32px 20px` | Doubles up with section's own 20px horizontal padding |
| `h3` | `font-size` | `1.5rem` (not overridden) | `1.25rem` | Reduces oversized h3 headings on mobile |
| `.sc-summary-header h3` | `font-size` | `1.625rem` (not overridden) | `1.375rem` | Specific override for the summary heading |
| `footer` | `padding` | `48px 24px 32px` (not overridden) | `36px 20px 24px` | Reduce footer size on mobile |
| `footer .meta` | `gap` | `32px` (not overridden) | `20px` | Footer meta links too spread out on small screens |

## Files Changed

- `index.html` — CSS block only (style tag)

## Out of Scope

- No second breakpoint (480px) — single breakpoint approach is appropriate for this static marketing page
- No JavaScript changes
- No HTML structure changes
- No design system token changes
