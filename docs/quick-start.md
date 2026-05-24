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

Bundled projects can import the full package stylesheet, or only the layers they
use:

```css
@import "@synced/fluid/tokens.css";
@import "@synced/fluid/reset.css";
@import "@synced/fluid/base.css";
@import "@synced/fluid/layout.css";
@import "@synced/fluid/components.css";
```

Keep `utilities.css` out unless the project uses the static `sf-text-*`,
`sf-prose`, `sf-visually-hidden`, or `sf-full-bleed` helpers. The generated CSS
file already emits source-scanned utility classes.

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
