# AIPQ Section Visual Flow — Design Spec
**Date:** 2026-05-17

## Problem

The `#framework` section (AIPQ) has two related issues:

1. **Lacks visual weight.** The `.framework-block` uses `--color-paper-light` on a `--color-paper` background, and the pillar axes inside are also `--color-paper-light`. The entire block reads as a flat, low-contrast surface that disappears against the surrounding sections.

2. **Arrives without narrative context.** The section head frames AIPQ from the enterprise buyer's perspective ("Most enterprise AI succeeds in pilot. Then it stalls.") rather than from the sponsor's perspective. A software vendor reading the page doesn't immediately see how AIPQ relates to their own sales motion with their own prospects.

## Scope

Changes are confined to the `#framework` section in `index.html`. No structural changes to surrounding sections.

## Design

### 1. Section Head Rewrite

Replace the existing eyebrow, H2, and subhead with copy that orients the reader as a potential sponsor.

**Eyebrow:** "The framework in practice"

**H2:** "Every market has a version of this problem. AIPQ is the diagnostic you deploy in yours."

**Subhead:** "AI software vendors license AIPQ to run this assessment with their prospects. Each sponsor holds it exclusively in their segment. The buyer gets a real diagnosis. The sponsor opens every sales conversation with the problem already named."

This makes three things explicit up front: AIPQ is the framework (not a custom build), sponsors license it per segment with exclusivity, and the exchange creates a sales-ready lead.

### 2. Framework Block — Dark Header Treatment

Split `.framework-block` into two visual zones:

**Top zone — dark header (`.framework-block-head`):**
- Background: `--color-ink`
- Contains: AIPQ name, "AI Production Quotient" subtitle, badge, description paragraph
- Text colors shift to paper-light variants:
  - `.framework-name` → `--color-paper-light`
  - `.framework-full` → `rgba(244,247,244,0.65)`
  - `.framework-desc` → `rgba(244,247,244,0.7)`
- Badge gets a ghost/outline treatment on dark: light border (`rgba(244,247,244,0.25)`), semi-transparent background (`rgba(244,247,244,0.08)`), muted text (`rgba(244,247,244,0.75)`)

**Bottom zone — light body (`.framework-block-body`):**
- Background: `--color-paper-light`
- Contains: `.pillar-axes` unchanged
- Padding: `40px 48px`

**Outer block:**
- `.framework-block` loses explicit background and padding; becomes a layout container
- Retains `border: 0.5px solid var(--color-border-subtle)`, `border-radius: 16px`, adds `overflow: hidden`

**Padding summary:**
- `.framework-block-head`: `48px 48px 40px` (top/sides/bottom)
- `.framework-block-body`: `40px 48px 48px` (top/sides/bottom)

This creates a clear visual hierarchy: the dark zone anchors "what AIPQ is," the light zone shows "how it works." The contrast also gives the section presence against the surrounding paper-tone sections.

### 3. Badge Copy

Remove "· Q2 2026" from the badge. Text becomes: "Founding cohort forming"

## What Is Not Changing

- Pillar axes layout, pillar content, pillar CSS — unchanged
- Surrounding sections (`#product`, `#sample-scorecard`) — unchanged
- Mobile breakpoint rules — updated to mirror new structure: `.framework-block-head` and `.framework-block-body` both reduce horizontal padding to `24px`, matching the existing mobile pattern for `.pillar-axis`
