# Voranta UI Component Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a compiled React component library (`packages/ui/`) embodying the locked Voranta design system, ready to sync to claude.ai/design via `/design-sync`.

**Architecture:** A self-contained `packages/ui/` package in this repo (the root static site is untouched). React 18 + TypeScript components are thin wrappers that emit the design system's existing semantic class names (`.btn`, `.card`, `.wordmark`, ...). Styling ships as plain CSS in `components.css` (rule bodies copied verbatim from the live `styles.css` — the fidelity source of truth), with design tokens supplied by a Tailwind v4 `@theme` block in `theme.css`. Vite library mode compiles to `dist/` (ESM + `.d.ts` + a single CSS file). Storybook provides per-component stories for visual verification and design-sync preview rendering.

**Tech Stack:** React 18, TypeScript, Vite (library mode), `@tailwindcss/vite` (Tailwind v4), Storybook 8 (`@storybook/react-vite`), Vitest + `@testing-library/react` (smoke tests only).

**Key risk, front-loaded:** Whether Tailwind v4 + a copied `@theme` block actually emits the token custom properties, and whether our plain `components.css` rules survive the build, is proven by a Button vertical slice (Tasks 1–3) BEFORE the other nine components are built. Task 3 is the gate.

**Conventions:**
- All commands run from `packages/ui/` unless stated otherwise.
- Variant→class mappings are authored as complete static strings in a lookup object (`{ ghost: 'btn btn-ghost' }`), NEVER interpolated (`` `btn-${variant}` ``).
- Component CSS rule bodies are copied verbatim from the canonical source file named in each task (do not re-type from memory — copying preserves exact fidelity).
- Commit after every task.

---

## File Structure

```
packages/ui/
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts          # (or merged into vite.config.ts)
  .gitignore
  .storybook/
    main.ts
    preview.ts
    preview-head.html       # loads the three brand fonts in Storybook
  src/
    styles/
      theme.css             # @import "tailwindcss" + fonts @import + @theme tokens
      components.css         # plain CSS component rules, copied from live styles.css
    setupTests.ts           # @testing-library/jest-dom
    index.ts                # barrel: imports both CSS files, re-exports all components
    Wordmark/{Wordmark.tsx, Wordmark.stories.tsx, Wordmark.test.tsx, index.ts}
    Button/{Button.tsx, Button.stories.tsx, Button.test.tsx, index.ts}
    Badge/{...}
    Eyebrow/{...}
    Card/{...}
    FeatureCard/{...}
    PricingCard/{...}
    SectionHead/{...}
    Stat/{...}
    ResearchCallout/{...}
```

Responsibilities:
- `theme.css` — the ONLY place tokens/fonts are declared. One job: turn the locked tokens into CSS custom properties and load fonts.
- `components.css` — the ONLY place semantic class rules live. One job: visual rules for the 10 components, faithful to the live site.
- Each `<Name>.tsx` — one component, props → static class strings + markup. No styling logic beyond class selection.
- `index.ts` — public surface; importing it pulls in the CSS side effects.

---

### Task 1: Scaffold the package

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/vite.config.ts`
- Create: `packages/ui/.gitignore`

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@voranta/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/voranta-ui.js",
  "module": "./dist/voranta-ui.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/voranta-ui.js" },
    "./styles.css": "./dist/voranta-ui.css"
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": { "react": "^18", "react-dom": "^18" },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

(Storybook devDependencies are added in Task 5 via its installer, which pins matching versions.)

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.tsx", "src/**/*.stories.tsx"]
}
```

- [ ] **Step 3: Create `packages/ui/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VorantaUI',
      formats: ['es'],
      fileName: () => 'voranta-ui.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    cssCodeSplit: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
});
```

- [ ] **Step 4: Create `packages/ui/.gitignore`**

```
node_modules
dist
storybook-static
*.log
```

- [ ] **Step 5: Install dependencies**

Run (from `packages/ui/`): `npm install`
Expected: completes without error; `node_modules/` and `package-lock.json` created.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/package.json packages/ui/tsconfig.json packages/ui/vite.config.ts packages/ui/.gitignore packages/ui/package-lock.json
git commit -m "chore(ui): scaffold packages/ui (React+TS+Vite+Tailwind v4)"
```

---

### Task 2: Theme CSS (tokens + fonts) and Button's component CSS

**Files:**
- Create: `packages/ui/src/styles/theme.css`
- Create: `packages/ui/src/styles/components.css`

- [ ] **Step 1: Create `packages/ui/src/styles/theme.css`**

Copy verbatim into this file, in order:
1. The line `@import "tailwindcss";`
2. The Google-Fonts `@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,0..100,0..1&family=Geist:wght@300..700&family=Geist+Mono:wght@300..600&display=swap");` line copied EXACTLY from the root `globals.css` (it requests Fraunces's SOFT/WONK axes the wordmark needs).
3. The ENTIRE `@theme { ... }` block copied verbatim from the root `/Users/evanvolness/Voranta-Site/globals.css` (starts at `@theme {`, line ~25). Do not edit token values.

Do NOT copy `@layer base` or `@layer components` from globals.css — component rules come from `styles.css` instead (next step), and base resets are not needed for a component library.

- [ ] **Step 2: Create `packages/ui/src/styles/components.css` with the Button rules**

Copy verbatim the following selector blocks from the root `/Users/evanvolness/Voranta-Site/globals.css` `@layer components` section (lines ~283–313), but place them OUTSIDE any `@layer` (plain top-level rules, so they are never purged):

```css
.btn { /* copy body verbatim from globals.css .btn */ }
.btn:hover { /* copy verbatim */ }
.btn-ghost { /* copy verbatim */ }
.btn-ghost:hover { /* copy verbatim */ }
.btn-lg { /* copy verbatim */ }
```

(Verbatim means the exact declarations already in globals.css — `display: inline-flex; ... background: var(--color-accent); color: #FFFFFF;` etc. Do not retype values from memory; open globals.css and copy.)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/styles/theme.css packages/ui/src/styles/components.css
git commit -m "feat(ui): theme tokens/fonts + Button component CSS"
```

---

### Task 3: Button vertical slice — THE PIPELINE GATE

This task proves the whole approach. Do not start Tasks 6+ until its check passes.

**Files:**
- Create: `packages/ui/src/Button/Button.tsx`
- Create: `packages/ui/src/Button/index.ts`
- Create: `packages/ui/src/index.ts`

- [ ] **Step 1: Create `packages/ui/src/Button/Button.tsx`**

```tsx
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type ButtonVariant = 'solid' | 'ghost';
export type ButtonSize = 'md' | 'lg';

// Static class strings only — never interpolated, so Tailwind's scanner is irrelevant.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  solid: 'btn',
  ghost: 'btn btn-ghost',
};
const SIZE_CLASS: Record<ButtonSize, string> = {
  md: '',
  lg: 'btn-lg',
};

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'solid',
  size = 'md',
  as,
  children,
  className = '',
  ...rest
}: ButtonProps & Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonProps>) {
  const Tag = as ?? 'button';
  const cls = [VARIANT_CLASS[variant], SIZE_CLASS[size], className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: Create `packages/ui/src/Button/index.ts`**

```ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
```

- [ ] **Step 3: Create `packages/ui/src/index.ts`**

```ts
import './styles/theme.css';
import './styles/components.css';

export * from './Button';
```

- [ ] **Step 4: Build the library**

Run: `npm run build`
Expected: completes; `dist/voranta-ui.js`, `dist/voranta-ui.css`, and `dist/index.d.ts` exist.

- [ ] **Step 5: GATE — verify the built CSS contains the rule bodies AND token custom properties**

Run:
```bash
grep -c '\.btn-ghost' dist/voranta-ui.css
grep -c '\.btn-lg' dist/voranta-ui.css
grep -c '\--color-accent' dist/voranta-ui.css
```
Expected: each prints a number ≥ 1.

Then confirm the rule bodies are non-empty (not just selectors):
```bash
grep -A2 '\.btn-ghost' dist/voranta-ui.css
```
Expected: shows `background` / `color` / `border-color` declarations.

**If `.btn-ghost`/`.btn-lg` are missing:** Tailwind purged them — but since components.css is plain top-level CSS (Task 2 Step 2), this should not happen. If it does, confirm the rules are NOT inside an `@layer` and re-build. **If `--color-accent` is missing:** the `@theme` block did not emit custom properties — verify `@import "tailwindcss";` is the first line of theme.css and `@tailwindcss/vite` is in `vite.config.ts` plugins. Resolve before proceeding.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/Button packages/ui/src/index.ts
git commit -m "feat(ui): Button component + prove Tailwind/theme build pipeline"
```

---

### Task 4: Test harness + Button smoke test

Tests here are smoke tests only (render-without-crash + correct semantic class). The real fidelity check is the Storybook screenshot gate (Task 15). Do not write assertion-heavy tests that just restate JSX.

**Files:**
- Create: `packages/ui/src/setupTests.ts`
- Create: `packages/ui/src/Button/Button.test.tsx`

- [ ] **Step 1: Create `packages/ui/src/setupTests.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 2: Write the failing smoke test `packages/ui/src/Button/Button.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders a button with the solid base class', () => {
  render(<Button>Go</Button>);
  const el = screen.getByText('Go');
  expect(el).toHaveClass('btn');
});

test('ghost lg variant applies both ghost and lg classes', () => {
  render(<Button variant="ghost" size="lg">Go</Button>);
  const el = screen.getByText('Go');
  expect(el).toHaveClass('btn', 'btn-ghost', 'btn-lg');
});

test('as="a" renders an anchor', () => {
  render(<Button as="a" href="#x">Go</Button>);
  expect(screen.getByText('Go').tagName).toBe('A');
});
```

- [ ] **Step 3: Run the test**

Run: `npm test`
Expected: PASS (Button already implemented in Task 3). If it fails, fix Button, not the test.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/setupTests.ts packages/ui/src/Button/Button.test.tsx
git commit -m "test(ui): smoke-test harness + Button tests"
```

---

### Task 5: Storybook setup + Button story + fonts

**Files:**
- Create: `packages/ui/.storybook/main.ts`
- Create: `packages/ui/.storybook/preview.ts`
- Create: `packages/ui/.storybook/preview-head.html`
- Create: `packages/ui/src/Button/Button.stories.tsx`

- [ ] **Step 1: Add Storybook**

Run (from `packages/ui/`): `npx storybook@^8 init --builder vite --yes`
Expected: Storybook deps installed, a `.storybook/` dir created, sample stories added under `src/stories/`.

- [ ] **Step 2: Delete Storybook's sample stories**

Run: `rm -rf src/stories`
Expected: the auto-generated demo stories are gone.

- [ ] **Step 3: Replace `packages/ui/.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react-vite', options: {} },
};
export default config;
```

- [ ] **Step 4: Replace `packages/ui/.storybook/preview.ts`**

```ts
import type { Preview } from '@storybook/react';
import '../src/styles/theme.css';
import '../src/styles/components.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'paper',
      values: [{ name: 'paper', value: '#ECF1ED' }],
    },
  },
};
export default preview;
```

- [ ] **Step 5: Create `packages/ui/.storybook/preview-head.html`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,0..100,0..1&family=Geist:wght@300..700&family=Geist+Mono:wght@300..600&display=swap" />
```

- [ ] **Step 6: Create `packages/ui/src/Button/Button.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Solid: Story = { args: { children: 'Get the assessment' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Learn more' } };
export const SolidLarge: Story = { args: { size: 'lg', children: 'Get the assessment' } };
export const GhostLarge: Story = { args: { variant: 'ghost', size: 'lg', children: 'Learn more' } };
```

- [ ] **Step 7: Build Storybook**

Run: `npm run build-storybook`
Expected: completes; `storybook-static/` produced with no errors.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/.storybook packages/ui/src/Button/Button.stories.tsx packages/ui/package.json packages/ui/package-lock.json
git rm -r --cached packages/ui/src/stories 2>/dev/null || true
git commit -m "feat(ui): Storybook with brand fonts + Button stories"
```

---

## Components 6–14 — mechanical fan-out

Each task follows the same shape: (a) append the component's rule blocks to `components.css`, copied verbatim from the source file named in the task; (b) write `<Name>.tsx` emitting those exact class names via static-string lookups; (c) `index.ts`; (d) a smoke test; (e) a story; (f) export from `src/index.ts`; (g) build, test, commit. Source file is `globals.css` unless the task says `styles.css`.

### Task 6: Wordmark

**Files:** Create `packages/ui/src/Wordmark/{Wordmark.tsx, index.ts, Wordmark.test.tsx, Wordmark.stories.tsx}`; Modify `packages/ui/src/styles/components.css`, `packages/ui/src/index.ts`.

- [ ] **Step 1: Append `.wordmark` rules to `components.css`** — copy verbatim the `.wordmark` and `.wordmark::after` blocks from `globals.css` (lines ~209–223). These carry the locked `font-variation-settings`.

- [ ] **Step 2: Create `Wordmark.tsx`**

```tsx
import type { ElementType, ComponentPropsWithoutRef } from 'react';

export interface WordmarkProps {
  as?: ElementType;
  className?: string;
}

export function Wordmark({
  as,
  className = '',
  ...rest
}: WordmarkProps & Omit<ComponentPropsWithoutRef<'span'>, keyof WordmarkProps>) {
  const Tag = as ?? 'span';
  return (
    <Tag className={['wordmark', className].filter(Boolean).join(' ')} {...rest}>
      Voranta
    </Tag>
  );
}
```

(The cyan superscript `*` is the `::after` from CSS — do not put it in markup.)

- [ ] **Step 3: Create `Wordmark/index.ts`**

```ts
export { Wordmark } from './Wordmark';
export type { WordmarkProps } from './Wordmark';
```

- [ ] **Step 4: Create `Wordmark.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { Wordmark } from './Wordmark';

test('renders the wordmark text with class', () => {
  render(<Wordmark />);
  expect(screen.getByText('Voranta')).toHaveClass('wordmark');
});
```

- [ ] **Step 5: Create `Wordmark.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Wordmark } from './Wordmark';

const meta: Meta<typeof Wordmark> = { title: 'Components/Wordmark', component: Wordmark };
export default meta;
export const Default: StoryObj<typeof Wordmark> = {
  render: () => <div style={{ fontSize: 48 }}><Wordmark /></div>,
};
```

- [ ] **Step 6: Add `export * from './Wordmark';` to `src/index.ts`.**

- [ ] **Step 7: Build + test**

Run: `npm run build && npm test`
Expected: build succeeds; tests pass. Confirm `dist/voranta-ui.css` contains `.wordmark`: `grep -c 'wordmark' dist/voranta-ui.css` ≥ 1.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/Wordmark packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): Wordmark component"
```

---

### Task 7: Badge

**Files:** Create `packages/ui/src/Badge/{Badge.tsx, index.ts, Badge.test.tsx, Badge.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append `.badge`, `.badge-ink`, and `.badge-dot` rules to `components.css`** — copy `.badge` and `.badge-ink` verbatim from `globals.css` (lines ~264–280). Copy `.badge-dot` verbatim from `globals.css` if present there; otherwise from `styles.css` (`grep -n 'badge-dot' globals.css styles.css` to locate, then copy the exact block).

- [ ] **Step 2: Create `Badge.tsx`**

```tsx
import type { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'ink';

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: 'badge',
  ink: 'badge badge-ink',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', dot = false, children, className = '' }: BadgeProps) {
  const cls = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create `Badge/index.ts`**

```ts
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';
```

- [ ] **Step 4: Create `Badge.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

test('default badge class', () => {
  render(<Badge>New</Badge>);
  expect(screen.getByText('New')).toHaveClass('badge');
});

test('ink variant adds badge-ink', () => {
  render(<Badge variant="ink">New</Badge>);
  expect(screen.getByText('New')).toHaveClass('badge', 'badge-ink');
});
```

- [ ] **Step 5: Create `Badge.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = { title: 'Components/Badge', component: Badge };
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: 'Research-led' } };
export const Ink: Story = { args: { variant: 'ink', children: 'Beta' } };
export const WithDot: Story = { args: { dot: true, children: 'One sponsor per category' } };
```

- [ ] **Step 6: Add `export * from './Badge';` to `src/index.ts`.**

- [ ] **Step 7: Build + test**

Run: `npm run build && npm test`
Expected: pass. `grep -c 'badge-ink' dist/voranta-ui.css` ≥ 1.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/Badge packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): Badge component"
```

---

### Task 8: Eyebrow

**Files:** Create `packages/ui/src/Eyebrow/{Eyebrow.tsx, index.ts, Eyebrow.test.tsx, Eyebrow.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append `.eyebrow` rule to `components.css`** — copy verbatim from `globals.css` (line ~254).

- [ ] **Step 2: Create `Eyebrow.tsx`**

```tsx
import type { ReactNode } from 'react';

export interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = '' }: EyebrowProps) {
  return <span className={['eyebrow', className].filter(Boolean).join(' ')}>{children}</span>;
}
```

- [ ] **Step 3: Create `Eyebrow/index.ts`**

```ts
export { Eyebrow } from './Eyebrow';
export type { EyebrowProps } from './Eyebrow';
```

- [ ] **Step 4: Create `Eyebrow.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { Eyebrow } from './Eyebrow';

test('eyebrow class applied', () => {
  render(<Eyebrow>How it works</Eyebrow>);
  expect(screen.getByText('How it works')).toHaveClass('eyebrow');
});
```

- [ ] **Step 5: Create `Eyebrow.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Eyebrow } from './Eyebrow';

const meta: Meta<typeof Eyebrow> = { title: 'Components/Eyebrow', component: Eyebrow };
export default meta;
export const Default: StoryObj<typeof Eyebrow> = { args: { children: 'The methodology' } };
```

- [ ] **Step 6: Add `export * from './Eyebrow';` to `src/index.ts`.**

- [ ] **Step 7: Build + test** — Run: `npm run build && npm test` (expect pass; `grep -c 'eyebrow' dist/voranta-ui.css` ≥ 1).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/Eyebrow packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): Eyebrow component"
```

---

### Task 9: Card

**Files:** Create `packages/ui/src/Card/{Card.tsx, index.ts, Card.test.tsx, Card.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append `.card` and `.card-lg` rules to `components.css`** — copy verbatim from `globals.css` (lines ~316–322).

- [ ] **Step 2: Create `Card.tsx`**

```tsx
import type { ReactNode } from 'react';

export type CardSize = 'md' | 'lg';

const SIZE_CLASS: Record<CardSize, string> = {
  md: 'card',
  lg: 'card card-lg',
};

export interface CardProps {
  size?: CardSize;
  children: ReactNode;
  className?: string;
}

export function Card({ size = 'md', children, className = '' }: CardProps) {
  return <div className={[SIZE_CLASS[size], className].filter(Boolean).join(' ')}>{children}</div>;
}
```

- [ ] **Step 3: Create `Card/index.ts`**

```ts
export { Card } from './Card';
export type { CardProps, CardSize } from './Card';
```

- [ ] **Step 4: Create `Card.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { Card } from './Card';

test('md card has card class', () => {
  const { container } = render(<Card>x</Card>);
  expect(container.firstChild).toHaveClass('card');
});

test('lg card adds card-lg', () => {
  const { container } = render(<Card size="lg">x</Card>);
  expect(container.firstChild).toHaveClass('card', 'card-lg');
});
```

- [ ] **Step 5: Create `Card.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = { title: 'Components/Card', component: Card };
export default meta;
type Story = StoryObj<typeof Card>;

export const Medium: Story = {
  render: () => <Card><p style={{ margin: 0 }}>A standard card surface.</p></Card>,
};
export const Large: Story = {
  render: () => <Card size="lg"><p style={{ margin: 0 }}>A large module surface.</p></Card>,
};
```

- [ ] **Step 6: Add `export * from './Card';` to `src/index.ts`.**

- [ ] **Step 7: Build + test** — Run: `npm run build && npm test` (expect pass; `grep -c 'card-lg' dist/voranta-ui.css` ≥ 1).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/Card packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): Card component"
```

---

### Task 10: FeatureCard

**Files:** Create `packages/ui/src/FeatureCard/{FeatureCard.tsx, index.ts, FeatureCard.test.tsx, FeatureCard.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append `.feature-card`, `.feature-card .icon`, `.feature-card h3`, `.feature-card p` rules to `components.css`** — copy verbatim from `globals.css` (lines ~359–388).

- [ ] **Step 2: Create `FeatureCard.tsx`**

```tsx
import type { ReactNode } from 'react';

export interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  body: ReactNode;
  className?: string;
}

export function FeatureCard({ icon, title, body, className = '' }: FeatureCardProps) {
  return (
    <div className={['feature-card', className].filter(Boolean).join(' ')}>
      {icon && <div className="icon" aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create `FeatureCard/index.ts`**

```ts
export { FeatureCard } from './FeatureCard';
export type { FeatureCardProps } from './FeatureCard';
```

- [ ] **Step 4: Create `FeatureCard.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { FeatureCard } from './FeatureCard';

test('renders title and body inside feature-card', () => {
  const { container } = render(<FeatureCard title="Rigor" body="Peer-reviewed method." />);
  expect(container.firstChild).toHaveClass('feature-card');
  expect(screen.getByText('Rigor')).toBeInTheDocument();
  expect(screen.getByText('Peer-reviewed method.')).toBeInTheDocument();
});
```

- [ ] **Step 5: Create `FeatureCard.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FeatureCard } from './FeatureCard';

const meta: Meta<typeof FeatureCard> = { title: 'Components/FeatureCard', component: FeatureCard };
export default meta;
export const Default: StoryObj<typeof FeatureCard> = {
  args: { title: 'Research-led scoring', body: 'Every score traces to a documented question and weight.' },
};
```

- [ ] **Step 6: Add `export * from './FeatureCard';` to `src/index.ts`.**

- [ ] **Step 7: Build + test** — Run: `npm run build && npm test` (expect pass; `grep -c 'feature-card' dist/voranta-ui.css` ≥ 1).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/FeatureCard packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): FeatureCard component"
```

---

### Task 11: PricingCard

**Files:** Create `packages/ui/src/PricingCard/{PricingCard.tsx, index.ts, PricingCard.test.tsx, PricingCard.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append `.pricing-card` and its child rules to `components.css`** — copy verbatim from `globals.css` (lines ~425–470): `.pricing-card`, `.pricing-card.is-featured`, `.pricing-card.is-featured h3`, `.pricing-card.is-featured .price-value`, `.pricing-card .price-value`, `.pricing-card .price-period`, `.pricing-card ul`, `.pricing-card li`.

- [ ] **Step 2: Create `PricingCard.tsx`**

```tsx
import type { ReactNode } from 'react';

export interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  featured?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function PricingCard({
  title,
  price,
  period,
  features,
  featured = false,
  footer,
  className = '',
}: PricingCardProps) {
  const cls = ['pricing-card', featured ? 'is-featured' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <h3>{title}</h3>
      <div>
        <span className="price-value">{price}</span>
        {period && <span className="price-period">{period}</span>}
      </div>
      <ul>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {footer}
    </div>
  );
}
```

- [ ] **Step 3: Create `PricingCard/index.ts`**

```ts
export { PricingCard } from './PricingCard';
export type { PricingCardProps } from './PricingCard';
```

- [ ] **Step 4: Create `PricingCard.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { PricingCard } from './PricingCard';

test('renders price, period, and features', () => {
  const { container } = render(
    <PricingCard title="Sponsor" price="$5k" period="/yr" features={['A', 'B']} />,
  );
  expect(container.firstChild).toHaveClass('pricing-card');
  expect(screen.getByText('$5k')).toHaveClass('price-value');
  expect(screen.getByText('/yr')).toHaveClass('price-period');
  expect(screen.getByText('A')).toBeInTheDocument();
});

test('featured adds is-featured', () => {
  const { container } = render(<PricingCard title="x" price="$1" features={[]} featured />);
  expect(container.firstChild).toHaveClass('pricing-card', 'is-featured');
});
```

- [ ] **Step 5: Create `PricingCard.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PricingCard } from './PricingCard';

const meta: Meta<typeof PricingCard> = { title: 'Components/PricingCard', component: PricingCard };
export default meta;
type Story = StoryObj<typeof PricingCard>;

export const Standard: Story = {
  args: { title: 'Category Sponsor', price: '$5,000', period: '/year', features: ['Exclusive category', 'Quarterly report', 'Logo placement'] },
};
export const Featured: Story = {
  args: { title: 'Founding Sponsor', price: '$8,000', period: '/year', featured: true, features: ['Everything in Category', 'Methodology input', 'First access'] },
};
```

- [ ] **Step 6: Add `export * from './PricingCard';` to `src/index.ts`.**

- [ ] **Step 7: Build + test** — Run: `npm run build && npm test` (expect pass; `grep -c 'pricing-card' dist/voranta-ui.css` ≥ 1).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/PricingCard packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): PricingCard component"
```

---

### Task 12: SectionHead (source: styles.css)

**Files:** Create `packages/ui/src/SectionHead/{SectionHead.tsx, index.ts, SectionHead.test.tsx, SectionHead.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append the section-head rules to `components.css`** — copy verbatim from the live `/Users/evanvolness/Voranta-Site/styles.css` (lines ~92–96): `.section-head`, `.section-head .eyebrow`, `.section-head .rule`, `.section-head .subhead`. (These do NOT exist in globals.css — styles.css is the source.)

- [ ] **Step 2: Create `SectionHead.tsx`** (reuses Eyebrow)

```tsx
import type { ReactNode } from 'react';
import { Eyebrow } from '../Eyebrow';

export interface SectionHeadProps {
  eyebrow?: string;
  heading: ReactNode;
  subhead?: ReactNode;
  className?: string;
}

export function SectionHead({ eyebrow, heading, subhead, className = '' }: SectionHeadProps) {
  return (
    <div className={['section-head', className].filter(Boolean).join(' ')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{heading}</h2>
      <div className="rule" />
      {subhead && <p className="subhead">{subhead}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Create `SectionHead/index.ts`**

```ts
export { SectionHead } from './SectionHead';
export type { SectionHeadProps } from './SectionHead';
```

- [ ] **Step 4: Create `SectionHead.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { SectionHead } from './SectionHead';

test('renders eyebrow, heading, rule, subhead', () => {
  const { container } = render(
    <SectionHead eyebrow="Method" heading="How scoring works" subhead="Every point traces to a question." />,
  );
  expect(container.firstChild).toHaveClass('section-head');
  expect(screen.getByText('Method')).toHaveClass('eyebrow');
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('How scoring works');
  expect(container.querySelector('.rule')).toBeInTheDocument();
  expect(screen.getByText('Every point traces to a question.')).toHaveClass('subhead');
});
```

- [ ] **Step 5: Create `SectionHead.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SectionHead } from './SectionHead';

const meta: Meta<typeof SectionHead> = { title: 'Components/SectionHead', component: SectionHead };
export default meta;
export const Default: StoryObj<typeof SectionHead> = {
  args: { eyebrow: 'The methodology', heading: 'Research, not opinion', subhead: 'Every score traces to a documented question and weight.' },
};
```

- [ ] **Step 6: Add `export * from './SectionHead';` to `src/index.ts`.**

- [ ] **Step 7: Build + test** — Run: `npm run build && npm test` (expect pass; `grep -c 'section-head' dist/voranta-ui.css` ≥ 1 and `grep -c '\.rule' dist/voranta-ui.css` ≥ 1).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/SectionHead packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): SectionHead component"
```

---

### Task 13: Stat

**Files:** Create `packages/ui/src/Stat/{Stat.tsx, index.ts, Stat.test.tsx, Stat.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append the stat rules to `components.css`** — copy verbatim from `globals.css` (lines ~325–345): `.stat`, `.stat-value`, `.stat-value-accent`, `.stat-label`.

- [ ] **Step 2: Create `Stat.tsx`**

```tsx
export interface StatProps {
  value: string;
  label: string;
  accent?: boolean;
  className?: string;
}

export function Stat({ value, label, accent = false, className = '' }: StatProps) {
  const valueCls = ['stat-value', accent ? 'stat-value-accent' : ''].filter(Boolean).join(' ');
  return (
    <div className={['stat', className].filter(Boolean).join(' ')}>
      <div className={valueCls}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create `Stat/index.ts`**

```ts
export { Stat } from './Stat';
export type { StatProps } from './Stat';
```

- [ ] **Step 4: Create `Stat.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { Stat } from './Stat';

test('renders value and label', () => {
  render(<Stat value="92%" label="of buyers" />);
  expect(screen.getByText('92%')).toHaveClass('stat-value');
  expect(screen.getByText('of buyers')).toHaveClass('stat-label');
});

test('accent adds stat-value-accent', () => {
  render(<Stat value="3x" label="lift" accent />);
  expect(screen.getByText('3x')).toHaveClass('stat-value', 'stat-value-accent');
});
```

- [ ] **Step 5: Create `Stat.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = { title: 'Components/Stat', component: Stat };
export default meta;
type Story = StoryObj<typeof Stat>;

export const Default: Story = { args: { value: '92%', label: 'of buyers shortlist by reputation' } };
export const Accent: Story = { args: { value: '3.4x', label: 'pipeline lift', accent: true } };
```

- [ ] **Step 6: Add `export * from './Stat';` to `src/index.ts`.**

- [ ] **Step 7: Build + test** — Run: `npm run build && npm test` (expect pass; `grep -c 'stat-value-accent' dist/voranta-ui.css` ≥ 1).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/Stat packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): Stat component"
```

---

### Task 14: ResearchCallout (source: styles.css)

**Files:** Create `packages/ui/src/ResearchCallout/{ResearchCallout.tsx, index.ts, ResearchCallout.test.tsx, ResearchCallout.stories.tsx}`; Modify `components.css`, `src/index.ts`.

- [ ] **Step 1: Append the callout rules to `components.css`** — copy verbatim from the live `/Users/evanvolness/Voranta-Site/styles.css`: `.callout-research` and `.callout-research strong` (the live versions; styles.css wins over globals.css here). Locate with `grep -n 'callout-research' styles.css`.

- [ ] **Step 2: Create `ResearchCallout.tsx`**

```tsx
import type { ReactNode } from 'react';

export interface ResearchCalloutProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function ResearchCallout({ label, children, className = '' }: ResearchCalloutProps) {
  return (
    <div className={['callout-research', className].filter(Boolean).join(' ')}>
      {label && <strong>{label}</strong>}
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `ResearchCallout/index.ts`**

```ts
export { ResearchCallout } from './ResearchCallout';
export type { ResearchCalloutProps } from './ResearchCallout';
```

- [ ] **Step 4: Create `ResearchCallout.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { ResearchCallout } from './ResearchCallout';

test('renders label and body in callout', () => {
  const { container } = render(<ResearchCallout label="Finding">68% of buyers said so.</ResearchCallout>);
  expect(container.firstChild).toHaveClass('callout-research');
  expect(screen.getByText('Finding').tagName).toBe('STRONG');
  expect(screen.getByText('68% of buyers said so.')).toBeInTheDocument();
});
```

- [ ] **Step 5: Create `ResearchCallout.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ResearchCallout } from './ResearchCallout';

const meta: Meta<typeof ResearchCallout> = { title: 'Components/ResearchCallout', component: ResearchCallout };
export default meta;
export const Default: StoryObj<typeof ResearchCallout> = {
  args: { label: 'Research finding', children: 'In a study of 200 software buyers, reputation outranked feature lists 3 to 1.' },
};
```

- [ ] **Step 6: Add `export * from './ResearchCallout';` to `src/index.ts`.**

- [ ] **Step 7: Build + test** — Run: `npm run build && npm test` (expect pass; `grep -c 'callout-research' dist/voranta-ui.css` ≥ 1).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/ResearchCallout packages/ui/src/index.ts packages/ui/src/styles/components.css
git commit -m "feat(ui): ResearchCallout component"
```

---

### Task 15: Full fidelity gate — Storybook render vs. live site

The real test of this library. No dev server exists in this repo, so verify with headless-Chrome screenshots (per the project's visual-verification practice), not by assertion.

**Files:** none created; may modify `components.css` or a `.tsx` to fix discrepancies.

- [ ] **Step 1: Build everything**

Run: `npm run build && npm test && npm run build-storybook`
Expected: all succeed; `storybook-static/` exists.

- [ ] **Step 2: Serve the static Storybook and screenshot each story**

Run:
```bash
npx http-server storybook-static -p 6007 &
```
Then for each story, capture its iframe with headless Chrome, e.g.:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --window-size=1200,900 \
  --screenshot=/tmp/ui-button.png \
  "http://localhost:6007/iframe.html?id=components-button--solid&viewMode=story"
```
Capture at least one screenshot per component (10 total). Stop the server when done (`kill %1`).

- [ ] **Step 3: Compare against the live style guide**

Open `/Users/evanvolness/Voranta-Site/style-guide.html` in headless Chrome the same way (screenshot), or compare each component screenshot against the corresponding specimen in the style guide. For each component verify: correct fonts (Geist body/heads, Fraunces only on Wordmark + ResearchCallout, Geist Mono on eyebrow/badge), cyan `#0891B2` accent, correct radii, NO drop shadows, NO gradients.

- [ ] **Step 4: Read each screenshot and record pass/fail**

Use the Read tool on each `/tmp/ui-*.png`. For any component that renders in fallback fonts, unstyled, or visually off from the style guide: fix the cause (missing CSS rule, wrong class name, missing font link) in `components.css` or the component, rebuild, re-screenshot. Repeat until all 10 match.

- [ ] **Step 5: Commit any fixes**

```bash
git add packages/ui/src
git commit -m "fix(ui): fidelity fixes from Storybook visual gate"
```

(If no fixes were needed, skip the commit.)

---

### Task 16: design-sync readiness

**Files:** none (verification + handoff).

- [ ] **Step 1: Confirm the sync inputs exist**

Run:
```bash
ls packages/ui/dist/voranta-ui.js packages/ui/dist/voranta-ui.css packages/ui/dist/index.d.ts
ls packages/ui/.storybook/main.ts
```
Expected: all present. (design-sync detects the Storybook shape from `.storybook/main.ts` and bundles `dist/`.)

- [ ] **Step 2: Confirm the static site is untouched**

Run (from repo root): `git status --porcelain -- ':!packages/ui'`
Expected: no changes to root HTML/CSS/etc. — only `packages/ui/` and `docs/` were added.

- [ ] **Step 3: Final commit / clean tree**

Run: `git status` — confirm clean working tree (all component work committed).

- [ ] **Step 4: Hand off to design-sync**

The library is ready. Re-run `/design-sync` from the repo. It will: detect the Storybook shape (`.storybook/main.ts` under `packages/ui/`), run from `packages/ui/`, bundle `dist/`, generate per-component `.d.ts`/`.prompt.md`/preview cards, render Storybook for preview verification, and upload to a fresh claude.ai/design project. During that run, author `.design-sync/conventions.md` (the wrapper/provider note, the token vocabulary with real `--color-*`/`--font-*` names, where the truth lives, one build snippet) and validate every named token/class/component against the built artifacts.

---

## Self-Review notes (completed by plan author)

- **Spec coverage:** All 10 components (spec table) → Tasks 3, 6–14. Tailwind v4 theme → Task 2. Fonts kept + Storybook fonts → Tasks 2, 5. styles.css as CSS truth → Tasks 12, 14 (and the verbatim-copy convention). Vite dist + d.ts → Tasks 1, 3, 15. Storybook → Task 5. Vertical-slice gate → Task 3. Fidelity gate → Task 15. design-sync handoff (out of build scope) → Task 16. Out-of-scope items (data-viz, Next.js migration, token auto-sync) correctly absent.
- **Placeholder scan:** No `TBD`/`TODO`. The only "copy verbatim from globals.css/styles.css" instructions are deliberate — copying the canonical rule body is the correct fidelity-preserving method, with exact file + selector + line range named and a `grep` verification per task.
- **Type consistency:** Variant lookups (`VARIANT_CLASS`, `SIZE_CLASS`) and prop names (`variant`, `size`, `accent`, `featured`, `dot`, `as`) are consistent across components, tests, and stories. Each component's `index.ts` exports both the component and its `Props` type; `src/index.ts` re-exports each via `export *`.
