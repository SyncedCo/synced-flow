# Quick Start

Synced Fluid is a small fluid CSS system for projects that want strong design
tokens, generated utility CSS, and no default dependency on viewport breakpoints.

## Install

```bash
pnpm add @synced/fluid
pnpm exec synced-fluid init --theme synced
```

For the GitHub repo before registry publishing:

```bash
pnpm add git+https://github.com/SyncedCo/synced-fluid.git
pnpm exec synced-fluid init
```

## Import

`init` creates a CSS entry file such as `src/synced-fluid.css` or
`app/synced-fluid.css`.

Import that file once from your app entry, root layout, or main CSS file.

```ts
import './synced-fluid.css'
```

Choose one core import strategy. Most projects use the full package stylesheet:

```css
@import "@synced/fluid/styles.css";
@import "@synced/fluid/app.css";
@import "./synced-fluid.generated.css";
```

`styles.css` already includes tokens, reset, base, layout, components, and
static utilities. Do not also import those modular files alongside `styles.css`.

For tighter loading, skip `styles.css` and import only the layers the project
uses:

```css
@import "@synced/fluid/tokens.css";
@import "@synced/fluid/reset.css";
@import "@synced/fluid/base.css";
@import "@synced/fluid/app.css";
@import "@synced/fluid/layout.css";
@import "@synced/fluid/components.css";
@import "@synced/fluid/utilities.css";
@import "./synced-fluid.generated.css";
```

`app.css` is optional. It removes raw link underlines and list markers for
common app/site UI. Leave it out, or run `synced-fluid init --no-app`, when a
project should keep content-style browser defaults.

Keep `utilities.css` out unless the project uses static helpers such as
`sf-text-*`, `sf-prose`, `sr-only`, `not-sr-only`, `sf-skip-link`,
`sf-focus-ring`, `sf-touch-target`, `sf-list-reset`, `sf-link`, or
`sf-full-bleed`. The generated CSS file already emits source-scanned utility
classes.

For the supported starter surface, see [System primitives](system-primitives.md).
It lists the tokens, layout classes, component classes, and utility helpers that
can build a basic website before project-specific CSS is needed.

## Base Defaults

Synced Fluid uses a conservative base: links remain visibly underlined, lists
keep their markers, focus styles are visible, and motion preferences are
respected. Add `@synced/fluid/app.css` or run `synced-fluid add app` when a
site should use app-style defaults globally.

## Build

```bash
pnpm fluid:build
pnpm fluid:check
pnpm fluid:doctor
```

## Theme Tokens

Override reusable project tokens in `synced-fluid.config.mjs`.

```js
export default defineConfig({
  scan: ['src', 'components'],
  out: 'src/synced-fluid.generated.css',
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
@import "@synced/fluid/styles.css";
@import "./synced-fluid.generated.css";

:root {
  --sf-font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --sf-colour-primary: oklch(68% 0.18 44);
}
```

## Config

```js
import { defineConfig } from '@synced/fluid/config'

export default defineConfig({
  scan: ['src', 'components'],
  out: 'src/synced-fluid.generated.css',
  responsiveVariants: false,
  safelist: [],
})
```

## Presets

```bash
pnpm exec synced-fluid init --preset next
pnpm exec synced-fluid init --preset vite
pnpm exec synced-fluid init --preset astro
pnpm exec synced-fluid init --preset wordpress
pnpm exec synced-fluid init --preset plain
pnpm exec synced-fluid init --theme neutral-saas
```

Use `--responsive-variants` only for migration projects that still contain
classes like `sm:` or `lg:`.

## Scanner Limits

Synced Fluid scans source files as text and generates CSS for complete class
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
pnpm exec synced-fluid init --preset wordpress
pnpm fluid:build
```

Enqueue the generated file from the theme or plugin:

```php
wp_enqueue_style(
  'synced-fluid',
  get_theme_file_uri('assets/css/synced-fluid.css'),
  [],
  wp_get_theme()->get('Version')
);
```

## AI-Friendly Discovery

```bash
pnpm exec synced-fluid tokens
pnpm exec synced-fluid tokens --json
```

Use this before generating UI so class names, token names, and presets stay
inside the supported surface area.
