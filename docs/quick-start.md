# Quick Start

Synced Flow is a small fluid CSS system for projects that want strong design
tokens, generated utility CSS, and no default dependency on viewport breakpoints.

## Install

```bash
pnpm add @synced/flow
pnpm exec synced-flow init --theme synced
```

For the GitHub repo before registry publishing:

```bash
pnpm add git+https://github.com/SyncedCo/synced-flow.git
pnpm exec synced-flow init
```

## Shape The Theme First

Before building pages, answer a small theme brief. This keeps brand decisions in
tokens instead of scattered page CSS.

- Radius: sharp, slightly rounded, or soft/curved?
- Font family: system, geometric sans, editorial serif, or brand font?
- Primary colour: main action and focus colour.
- Secondary/accent colour: supporting highlights.
- Surface style: flat, raised cards, or subtle panels?
- Density: compact app UI or more spacious marketing pages?

With an AI assistant, ask it to use the Synced Flow skill and turn those
answers into `synced-flow.config.mjs` theme tokens.

Example prompt:

```text
Use the Synced Flow skill. Create a website theme with slightly rounded
controls, Inter for UI, Fraunces for display headings, orange as the primary
colour, cyan as the accent, light raised cards, and spacious marketing sections.
Return the Synced Flow theme config only.
```

Then place the result in `synced-flow.config.mjs`:

```js
theme: {
  fonts: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    display: 'Fraunces, Georgia, serif',
  },
  colours: {
    primary: 'oklch(68% 0.18 44)',
    primaryForeground: 'oklch(100% 0 0)',
    accent: 'oklch(70% 0.12 205)',
    ring: 'oklch(68% 0.18 44)',
  },
  components: {
    button: { radius: '0.5rem' },
    card: { radius: '0.75rem' },
    input: { radius: '0.5rem' },
  },
}
```

## Import

`init` creates a CSS entry file such as `src/synced-flow.css` or
`app/synced-flow.css`.

Import that file once from your app entry, root layout, or main CSS file.

```ts
import './synced-flow.css'
```

Choose one core import strategy. Most projects use the full package stylesheet:

```css
@import "@synced/flow/styles.css";
@import "@synced/flow/app.css";
@import "./synced-flow.generated.css";
```

`styles.css` already includes tokens, reset, base, layout, components, and
static utilities. Do not also import those modular files alongside `styles.css`.

For tighter loading, skip `styles.css` and import only the layers the project
uses:

```css
@import "@synced/flow/tokens.css";
@import "@synced/flow/reset.css";
@import "@synced/flow/base.css";
@import "@synced/flow/app.css";
@import "@synced/flow/layout.css";
@import "@synced/flow/components.css";
@import "@synced/flow/utilities.css";
@import "./synced-flow.generated.css";
```

`app.css` is optional. It removes raw link underlines and list markers for
common app/site UI. Leave it out, or run `synced-flow init --no-app`, when a
project should keep content-style browser defaults.

Keep `utilities.css` out unless the project uses static helpers such as
`sf-text-*`, `sf-prose`, `sr-only`, `not-sr-only`, `sf-skip-link`,
`sf-focus-ring`, `sf-touch-target`, `sf-list-reset`, `sf-link`, or
`sf-full-bleed`. The generated CSS file already emits source-scanned utility
classes.

For the supported starter surface, see [System primitives](system-primitives.md).
It lists the tokens, layout classes, component classes, and utility helpers that
can build a basic website before project-specific CSS is needed.
For copy-ready website sections, see [Website patterns](website-patterns.md).
For native dialog, popover, disclosure, drawer, tooltip, tabs, and scroll
patterns, see [Native Components](native-components.md).
For accessible state styling and markup hooks, see
[Accessibility CSS](accessibility-css.md).
For the stable public surface, see [CSS API Contract](api-contract.md).
For a full project flow, see [Build a site walkthrough](build-a-site-walkthrough.md).

## Base Defaults

Synced Flow uses a conservative base: links remain visibly underlined, lists
keep their markers, focus styles are visible, and motion preferences are
respected. Add `@synced/flow/app.css` or run `synced-flow add app` when a
site should use app-style defaults globally.

## Build

```bash
pnpm flow:build
pnpm flow:check
pnpm flow:lint
pnpm flow:doctor
```

In this repository, `pnpm check` also runs package guardrails for dependency
count, gzip budgets, generated CSS shape, and raw-pixel usage.

## Theme Tokens

Override reusable project tokens in `synced-flow.config.mjs`.

```js
export default defineConfig({
  scan: ['src', 'components'],
  out: 'src/synced-flow.generated.css',
  theme: {
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      display: 'Fraunces, Georgia, serif',
    },
    colours: {
      primary: 'oklch(68% 0.18 44)',
      primaryForeground: 'oklch(100% 0 0)',
    },
  },
})
```

Use the CSS entry file for one-off local overrides.

```css
@import "@synced/flow/styles.css";
@import "./synced-flow.generated.css";

:root {
  --sf-font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --sf-colour-primary: oklch(68% 0.18 44);
}
```

## Config

```js
import { defineConfig } from '@synced/flow/config'

export default defineConfig({
  scan: ['src', 'components'],
  out: 'src/synced-flow.generated.css',
  responsiveVariants: false,
  safelist: [],
})
```

## Presets

```bash
pnpm exec synced-flow init --preset next
pnpm exec synced-flow init --preset vite
pnpm exec synced-flow init --preset astro
pnpm exec synced-flow init --preset wordpress
pnpm exec synced-flow init --preset plain
pnpm exec synced-flow init --theme neutral-saas
```

Use `--responsive-variants` only for migration projects that still contain
classes like `sm:` or `lg:`.

## Scanner Limits

Synced Flow scans source files as text and generates CSS for complete class
tokens. Keep class names complete in source files.

```tsx
// Good
const variants = {
  primary: 'bg-primary text-primary-foreground',
  quiet: 'bg-surface text-heading',
}

// Avoid
const colour = 'primary'
const className = `bg-${colour}`
```

For dynamic cases that cannot be avoided, use `safelist`.

## WordPress

The WordPress preset is designed for themes and plugins that enqueue plain CSS.
It scans PHP and template files, enables `includeCore`, and writes one CSS file:

```bash
pnpm exec synced-flow init --preset wordpress
pnpm flow:build
```

Enqueue the generated file from the theme or plugin:

```php
wp_enqueue_style(
  'synced-flow',
  get_theme_file_uri('assets/css/synced-flow.css'),
  [],
  wp_get_theme()->get('Version')
);
```

## AI-Friendly Discovery

```bash
pnpm exec synced-flow tokens
pnpm exec synced-flow tokens --json
pnpm exec synced-flow catalog --json
pnpm exec synced-flow suggest "service site with pricing and faq"
```

Use this before generating UI so class names, token names, and presets stay
inside the supported surface area.
