# Synced Flow

Standalone fluid CSS design system framework for Synced and reusable projects.

It ships a fluid CSS foundation and a small CLI that scans a consuming project
for class tokens, then generates project-specific utility CSS.

- primitive tokens: fonts, OKLCH colour primitives, radii, shadows
- semantic tokens: inherited surface, text, action, border, link, and state variables
- component tokens: button, card, input, alert, and navigation defaults
- fluid scales: Utopia-style type and spacing clamps across the configured viewport range
- layout primitives: container, section, stack, cluster, grid, sidebar, switcher, frame, cover, hero, and flow
- component primitives: buttons, cards, surfaces, navigation, forms, alerts, badges, avatars, charts, and section headers
- website patterns: logo clouds, feature blocks, stats, testimonials, pricing, FAQ, CTA, and footer helpers
- native component styling: dialog, popover, drawer, tooltip, disclosure, tabs,
  breadcrumbs, pagination, scroll snap, and sticky patterns
- AI-friendly CLI discovery: `catalog --json`, `suggest`, `lint`, `watch`, and
  `theme init --from` for turning a site brief into reusable theme tokens
- project-level AI agent setup: `agents install`, `agents status`, and `skill`
  make the packaged Synced Flow skill visible to common coding agents
- accessibility and base helpers: `sr-only`, `not-sr-only`, skip links, focus
  rings, touch targets, link helpers, and list helpers
- accessibility state styling for invalid, required, disabled, busy, current,
  expanded, pressed, selected, target, and forced-colors states
- modular CSS layer exports when a project wants a smaller imported surface
- modern CSS best practices: cascade layers, custom properties, logical
  properties, `clamp()`, OKLCH colour, container-aware primitives, and
  reduced-motion safeguards

## Links

- GitHub: [github.com/SyncedCo/synced-flow](https://github.com/SyncedCo/synced-flow)
- Website: [syncedco.com](https://syncedco.com)
- Issues: [github.com/SyncedCo/synced-flow/issues](https://github.com/SyncedCo/synced-flow/issues)
- Support: [SUPPORT.md](SUPPORT.md)

## Open Source

Synced Flow core is released under the [MIT licence](LICENSE). The open-source
core includes the CSS library, CLI, WordPress preset, modern frontend examples,
documentation, and recipes.

Useful project files:

- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Support](SUPPORT.md)
- [Trademark and brand use](TRADEMARKS.md)

The MIT licence covers the software. It does not grant rights to use Synced,
SyncedCo, or Synced Flow branding in a way that implies official endorsement.

## Install

```bash
pnpm add @synced/flow
pnpm exec synced-flow init --preset next --theme synced --agents
```

`--agents` adds project-level AI guidance so Cursor, Codex-style agents, Claude,
Copilot, Windsurf, Gemini, and Aider can discover the Synced Flow skill and
recommended CLI checks from the consuming project.

Until the package is published to a registry, install it from the GitHub repo:

```bash
pnpm add git+https://github.com/SyncedCo/synced-flow.git
```

## Import

Most projects should choose one core import strategy.

Use the full stylesheet when simplicity matters:

```css
@import "@synced/flow/styles.css";
@import "@synced/flow/app.css";
```

`styles.css` already includes the tokens, reset, base, layout, components, and
static utilities layers. Do not also import those modular layer files alongside
`styles.css`.

`app.css` is optional. It applies common app/site defaults such as removing raw
link underlines and list markers. Leave it out for content-heavy pages that
should keep browser affordances by default.

For tighter CSS loading, skip `styles.css` and import only the layers the
project uses:

```css
@import "@synced/flow/tokens.css";
@import "@synced/flow/reset.css";
@import "@synced/flow/base.css";
@import "@synced/flow/app.css";
@import "@synced/flow/layout.css";
@import "@synced/flow/components.css";
@import "@synced/flow/utilities.css";
```

## CSS Size And Loading

Synced Flow is designed to avoid shipping a large universal utility stylesheet.
It uses modern CSS techniques and keeps CSS loading compact in three ways:

- the CLI scans source files and generates utility CSS only for discovered class
  tokens
- CSS layers are exported separately, so projects can import only tokens, reset,
  base, app defaults, layout, components, or static utilities as needed
- generated animation keyframes are emitted only when scanned animation classes
  need them

The core CSS is built around current browser capabilities rather than legacy
breakpoint-heavy patterns: fluid `clamp()` scales, CSS custom properties,
logical sizing and spacing, cascade layers, OKLCH colour tokens,
container-aware layout primitives, and `prefers-reduced-motion` handling.

Current built CSS sizes from `pnpm build` on 2026-05-28:

| File | Raw | Gzip | Purpose |
| --- | ---: | ---: | --- |
| `styles.css` | 59.1 KB | 10.5 KB | Full core stylesheet for simple setup. |
| `tokens.css` | 9.5 KB | 2.2 KB | Design tokens only. |
| `reset.css` | 0.7 KB | 0.4 KB | Reset layer only. |
| `base.css` | 3.4 KB | 1.2 KB | Base element styles. |
| `app.css` | 0.5 KB | 0.3 KB | Optional app/site defaults for links, lists, and native controls. |
| `layout.css` | 7.5 KB | 1.9 KB | Fluid layout, app shell, scroll, sticky, media, and split primitives. |
| `components.css` | 31.3 KB | 5.0 KB | Button, icon, avatar, chart, card, surface, nav, form, alert, native component, website pattern, accessibility state, and input primitives. |
| `utilities.css` | 7.5 KB | 1.9 KB | Static `sf-*` content, positioning, motion, and helper utilities. |

CSS is not automatically tree-shaken like JavaScript in every environment. The
Synced Flow approach is explicit and predictable: import the core layers you
need, then run `synced-flow build` so project utilities are generated from real
usage.

For WordPress themes and plugins, `synced-flow init --preset wordpress` scans
PHP/template files and writes one enqueue-ready CSS file at
`assets/css/synced-flow.css`.

See [CSS optimisation](docs/css-optimisation.md) for the full measurements,
developer notes, and marketing-safe claims.

## Base Styling Decisions

Synced Flow keeps the browser affordances people rely on:

- links stay visibly underlined by default
- `ul` and `ol` keep their markers by default
- focus states are visible through `:focus-visible`
- reduced-motion preferences are respected

Use opt-in helpers when UI needs a different treatment: `sf-link-plain` for
navigation links, `sf-list-reset` for menu lists, `sr-only` for assistive text,
`sf-skip-link` for skip navigation, and `sf-touch-target` for compact controls.
For app/site projects, include `@synced/flow/app.css` or run
`synced-flow add app` to apply those common UI defaults globally.

See [Base styling decisions](docs/base-styling.md).

## Icons

Synced Flow supports icons without shipping an icon set. Use `sf-icon` on
inline SVGs or external libraries such as Lucide, Heroicons, or Bootstrap Icons;
icons inherit `currentColor` and size from fluid system tokens.

```tsx
import { Settings } from "lucide-react"

<button className="sf-button">
  <Settings className="sf-icon" aria-hidden="true" />
  Settings
</button>
```

## Configure

`synced-flow init` creates `synced-flow.config.mjs`, a CSS entry file, a
generated CSS placeholder, and `flow:build` / `flow:check` / `flow:lint` /
`flow:watch` package scripts.

To add AI agent guidance to an existing project:

```bash
pnpm exec synced-flow agents install
pnpm exec synced-flow agents status
pnpm exec synced-flow skill
```

Use `--target all` to also add tool-specific project files for Cursor, Claude,
Copilot, Windsurf, Gemini, and Aider where those tools support project-local
instructions or skills.

Start by shaping the theme: radius style, font family, primary colour, accent
colour, surface treatment, and density. With AI, ask it to use the Synced Flow
skill and convert that brief into `synced-flow.config.mjs` theme tokens before
building pages.

You can also create the config by hand:

```js
import { defineConfig } from '@synced/flow/config'
import { themePresets } from '@synced/flow/presets'

export default defineConfig({
  scan: ['app', 'components', 'lib'],
  out: 'app/synced-flow.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
  safelist: ['hidden', 'flex'],
})
```

Import the generated file after the core stylesheet:

```ts
import '@synced/flow/styles.css'
import './synced-flow.generated.css'
```

Add package scripts:

```json
{
  "scripts": {
    "flow:build": "synced-flow build",
    "flow:check": "synced-flow build --check",
    "flow:lint": "synced-flow lint",
    "flow:watch": "synced-flow watch",
    "flow:doctor": "synced-flow doctor"
  }
}
```

Run setup checks:

```bash
pnpm flow:doctor
```

Discover the supported starter surface:

```bash
pnpm exec synced-flow tokens
pnpm exec synced-flow tokens --json
pnpm exec synced-flow catalog --json
pnpm exec synced-flow suggest "full page scroll portfolio"
pnpm exec synced-flow recipe portfolio-scroll --markup
pnpm exec synced-flow recipe portfolio-scroll --framework next --markup
pnpm exec synced-flow theme init --from brief.md
pnpm exec synced-flow theme init --from brief.md --preset-base neutral-saas
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
synced-flow build --scan app --scan components --out app/synced-flow.generated.css
```

Use `--include-core` only when you want the generated CSS file to contain the
reset, base, layout, and component layers instead of importing
`@synced/flow/styles.css` separately.

For WordPress themes or plugins, use the WordPress preset. It scans PHP and
template files and writes one CSS file that can be enqueued directly:

```bash
pnpm exec synced-flow init --preset wordpress
pnpm flow:build
```

New projects should keep `responsiveVariants` off. Turn it on only when migrating
an existing codebase that still contains compatibility classes such as `sm:` or
`lg:`.

## Docs

- [Quick start](docs/quick-start.md)
- [Build a site walkthrough](docs/build-a-site-walkthrough.md)
- [AI usage guide](docs/ai-usage.md)
- [Base styling decisions](docs/base-styling.md)
- [Accessibility CSS](docs/accessibility-css.md)
- [System primitives](docs/system-primitives.md)
- [CSS API contract](docs/api-contract.md)
- [Native components](docs/native-components.md)
- [Website patterns](docs/website-patterns.md)
- [CLI reference](docs/cli-reference.md)
- [Config reference](docs/config-reference.md)
- [CSS optimisation](docs/css-optimisation.md)
- [Presets](docs/presets.md)
- [Recipes](docs/recipes.md)
- [Release readiness](docs/release-readiness.md)
- [WordPress](docs/wordpress.md)
- [Synced Flow skill](skills/synced-flow/SKILL.md)
- [Tokens guide](docs/tokens.md)
- [Tailwind comparison](docs/tailwind-comparison.md)
- [Migration from Tailwind](docs/migration-from-tailwind.md)

## Scripts

```bash
pnpm build
pnpm check
pnpm type-check
```
