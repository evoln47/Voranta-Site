# Voranta Design System — how to build with it

Components render real compiled React from `window.VorantaUI.*` (loaded from the root `_ds_bundle.js`). The look ships in `styles.css` (which `@import`s the component CSS and the brand fonts). Use the library components for controls; use the design tokens below for your own layout glue.

## Setup / wrapping

No provider, theme context, or root wrapper is required — components are self-contained and style themselves from the bound stylesheet. The only requirement is that the page load `styles.css` (it pulls in `_ds_bundle.css` and the Geist / Fraunces / Geist Mono fonts via `@import`). If text renders in a default system font, the stylesheet didn't load — there is nothing to "wrap" to fix it.

## Styling idiom — props for components, tokens for your own layout

This is a **semantic-token** system, not a utility-class system. Two rules:

1. **Configure library components through their props, never by passing utility classes.** A button's look comes from `variant`/`size`, not from `className`. Real props: `Button` (`variant: "solid"|"ghost"`, `size: "md"|"lg"`, `as`), `Badge` (`variant: "default"|"ink"`, `dot`), `Card` (`size: "md"|"lg"`), `PricingCard` (`featured`, `price`, `period`, `features[]`), `Stat` (`value`, `label`, `accent`), `SectionHead` (`eyebrow`, `heading`, `subhead`), `FeatureCard` (`icon`, `title`, `body`), `ResearchCallout` (`label`), `Eyebrow`, `Wordmark`. `className` exists only to add layout (margins, grid placement), never to restyle.
2. **Style your own scaffolding with the design tokens as CSS variables** — `var(--token)`:
   - Color: `--color-paper` (page background), `--color-paper-light` (card surface), `--color-paper-deep` (recessed). Text: `--color-ink`, `--color-ink-soft`, `--color-ink-mute`. Accent: `--color-accent` (cyan `#0891B2`) — the ONLY accent color; `--color-accent-dark`, `--color-accent-tint`. Borders: `--color-border-subtle`, `--color-border-strong`.
   - Type: `--font-sans` (Geist — body, all headings, UI), `--font-display` (Fraunces — trust moments ONLY: the wordmark, research callouts; never for headings), `--font-mono` (Geist Mono — eyebrows, badges, labels). Sizes `--text-xs … --text-6xl`.
   - Space/shape: `--spacing-1 … --spacing-48` (4px scale), `--radius-sm` 6 / `--radius-md` 8 / `--radius-lg` 12 / `--radius-xl` 16 / `--radius-pill`.

Locked guardrails: cyan is the only accent; no gradients; no drop shadows (focus rings excepted); no `border-radius` above `--radius-xl` (16px); Geist for all headings (Fraunces is never a heading font).

## Where the truth lives

Read `styles.css` (and the `_ds_bundle.css` it imports) for the exact token values and component rules, and each component's `<Name>.prompt.md` + `<Name>.d.ts` for its API and variants, before composing.

## Idiomatic example

```jsx
const { SectionHead, FeatureCard, Button } = window.VorantaUI;

<section style={{
  background: 'var(--color-paper)',
  padding: 'var(--spacing-24) var(--spacing-8)',
  fontFamily: 'var(--font-sans)',
}}>
  <SectionHead
    eyebrow="The methodology"
    heading="Research, not opinion"
    subhead="Every score traces to a documented question and weight."
  />
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--spacing-6)',
    marginTop: 'var(--spacing-12)',
  }}>
    <FeatureCard title="Research-led scoring" body="Every score traces to a documented question and weight." />
    <FeatureCard title="One sponsor per category" body="Exclusivity is enforced, not implied." />
    <FeatureCard title="Quarterly refresh" body="The benchmark updates as the market moves." />
  </div>
  <Button size="lg" style={{ marginTop: 'var(--spacing-12)' }}>Get the assessment</Button>
</section>
```
