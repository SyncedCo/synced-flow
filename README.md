# Synced Fluid

Standalone fluid CSS design system framework for Synced and reusable projects.

It ships a fluid CSS foundation and a small CLI that scans a consuming project
for class tokens, then generates project-specific utility CSS.

- primitive tokens: fonts, OKLCH colour primitives, radii, shadows
- semantic tokens: inherited surface, text, action, border, and state variables
- component tokens: button, card, and input defaults
- fluid scales: Utopia-style type and spacing clamps across the configured viewport range
- layout primitives: container, section, stack, cluster, grid, sidebar, switcher, frame, cover, and flow
- modular CSS layer exports when a project wants a smaller imported surface
- modern CSS best practices: cascade layers, custom properties, logical
  properties, `clamp()`, OKLCH colour, container-aware primitives, and
  reduced-motion safeguards

## Links

- GitHub: [github.com/SyncedCo/synced-fluid](https://github.com/SyncedCo/synced-fluid)
- Website: [syncedco.com](https://syncedco.com)
- Issues: [github.com/SyncedCo/synced-fluid/issues](https://github.com/SyncedCo/synced-fluid/issues)
- Support: [SUPPORT.md](SUPPORT.md)

## Open Source

Synced Fluid core is released under the [MIT licence](LICENSE). The open-source
core includes the CSS library, CLI, WordPress preset, modern frontend examples,
documentation, and recipes.

Useful project files:

- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Support](SUPPORT.md)
- [Trademark and brand use](TRADEMARKS.md)

The MIT licence covers the software. It does not grant rights to use Synced,
SyncedCo, or Synced Fluid branding in a way that implies official endorsement.

## Install

```bash
pnpm add @synced/fluid
pnpm exec synced-fluid init --theme synced
```

Until the package is published to a registry, install it from the GitHub repo:

```bash
pnpm add git+https://github.com/SyncedCo/synced-fluid.git
```

## Import

Most bundled apps can use the full stylesheet:

```css
@import "@synced/fluid/styles.css";
```

For tighter CSS loading, import only the layers the project uses:

```css
@import "@synced/fluid/tokens.css";
@import "@synced/fluid/reset.css";
@import "@synced/fluid/base.css";
@import "@synced/fluid/layout.css";
@import "@synced/fluid/components.css";
```

## CSS Size And Loading

Synced Fluid is designed to avoid shipping a large universal utility stylesheet.
It uses modern CSS techniques and keeps CSS loading compact in three ways:

- the CLI scans source files and generates utility CSS only for discovered class
  tokens
- CSS layers are exported separately, so projects can import only tokens, reset,
  base, layout, components, or static utilities as needed
- generated animation keyframes are emitted only when scanned animation classes
  need them

The core CSS is built around current browser capabilities rather than legacy
breakpoint-heavy patterns: fluid `clamp()` scales, CSS custom properties,
logical sizing and spacing, cascade layers, OKLCH colour tokens,
container-aware layout primitives, and `prefers-reduced-motion` handling.

Current built CSS sizes from `pnpm build` on 2026-05-24:

| File | Raw | Gzip | Purpose |
| --- | ---: | ---: | --- |
| `styles.css` | 17.8 KB | 4.2 KB | Full core stylesheet for simple setup. |
| `tokens.css` | 6.1 KB | 1.8 KB | Design tokens only. |
| `layout.css` | 3.0 KB | 0.9 KB | Fluid layout primitives. |
| `components.css` | 6.2 KB | 1.3 KB | Button, card, badge, field, and input primitives. |
| `utilities.css` | 1.2 KB | 0.5 KB | Static `sf-*` helper utilities. |

CSS is not automatically tree-shaken like JavaScript in every environment. The
Synced Fluid approach is explicit and predictable: import the core layers you
need, then run `synced-fluid build` so project utilities are generated from real
usage.

For WordPress themes and plugins, `synced-fluid init --preset wordpress` scans
PHP/template files and writes one enqueue-ready CSS file at
`assets/css/synced-fluid.css`.

See [CSS optimisation](docs/css-optimisation.md) for the full measurements,
developer notes, and marketing-safe claims.

## Configure

`synced-fluid init` creates `synced-fluid.config.mjs`, a CSS entry file, a
generated CSS placeholder, and `fluid:build` / `fluid:check` package scripts.

You can also create the config by hand:

```js
import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ['app', 'components', 'lib'],
  out: 'app/synced-fluid.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
  safelist: ['hidden', 'flex'],
})
```

Import the generated file after the core stylesheet:

```ts
import '@synced/fluid/styles.css'
import './synced-fluid.generated.css'
```

Add package scripts:

```json
{
  "scripts": {
    "fluid:build": "synced-fluid build",
    "fluid:check": "synced-fluid build --check",
    "fluid:doctor": "synced-fluid doctor"
  }
}
```

Run setup checks:

```bash
pnpm fluid:doctor
```

Discover the supported starter surface:

```bash
pnpm exec synced-fluid tokens
pnpm exec synced-fluid tokens --json
```

## Use

```html
<section class="sf-section">
  <div class="sf-container sf-stack" style="--sf-stack-space: var(--sf-space-l)">
    <span class="sf-badge">Fluid by default</span>
    <h1 class="sf-text-display">A styling system that adapts without layout breakpoints.</h1>
    <p class="sf-text-lead sf-prose">Use shared tokens and layout primitives before project-specific styling.</p>
    <a class="sf-button" href="/contact">Start a project</a>
  </div>
</section>
```

The CLI also accepts flags for projects that do not want a config file:

```bash
synced-fluid build --scan app --scan components --out app/synced-fluid.generated.css
```

Use `--include-core` only when you want the generated CSS file to contain the
reset, base, layout, and component layers instead of importing
`@synced/fluid/styles.css` separately.

For WordPress themes or plugins, use the WordPress preset. It scans PHP and
template files and writes one CSS file that can be enqueued directly:

```bash
pnpm exec synced-fluid init --preset wordpress
pnpm fluid:build
```

New projects should keep `responsiveVariants` off. Turn it on only when migrating
an existing codebase that still contains compatibility classes such as `sm:` or
`lg:`.

## Docs

- [Quick start](docs/quick-start.md)
- [AI usage guide](docs/ai-usage.md)
- [CLI reference](docs/cli-reference.md)
- [Config reference](docs/config-reference.md)
- [CSS optimisation](docs/css-optimisation.md)
- [Presets](docs/presets.md)
- [Recipes](docs/recipes.md)
- [WordPress](docs/wordpress.md)
- [Synced Fluid skill](skills/synced-fluid/SKILL.md)
- [Tokens guide](docs/tokens.md)
- [Tailwind comparison](docs/tailwind-comparison.md)
- [Migration from Tailwind](docs/migration-from-tailwind.md)

## Scripts

```bash
pnpm build
pnpm check
pnpm type-check
```
