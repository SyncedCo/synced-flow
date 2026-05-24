# CSS Optimisation Notes

Current measurements from `pnpm build` on 2026-05-24.

## Developer Notes

Synced Fluid keeps CSS loading small through three mechanisms:

- modular CSS layer exports for projects that do not need the full core file
- source-scanned utility generation, so project utility CSS is generated from
  discovered class tokens instead of shipping every possible utility
- conditional generated helpers, so animation keyframes are emitted only when
  scanned classes such as `animate-pulse` or `animate-spin` need them

The core stylesheet is intentionally built with modern CSS best practices:
cascade layers for predictable ordering, CSS custom properties for theming,
fluid `clamp()` scales, logical properties for writing-mode-friendly layout,
OKLCH colour tokens, container-aware layout primitives, and
`prefers-reduced-motion` safeguards.

CSS is not tree-shaken like JavaScript by default. The practical optimisation
model is to import only the layers a project needs, then let
`synced-fluid build` generate project-specific utility CSS.

Choose either the bundled core stylesheet or modular layer imports. Do not
import `styles.css` alongside `tokens.css`, `reset.css`, `base.css`,
`layout.css`, `components.css`, or `utilities.css`, because `styles.css`
already contains those layers.

## Current CSS Sizes

Sizes are raw bytes and gzip bytes from `gzip -c`.

| File | Raw | Gzip | Use |
| --- | ---: | ---: | --- |
| `tokens.css` | 8,696 B | 2,192 B | Design tokens only. |
| `reset.css` | 713 B | 430 B | Reset layer only. |
| `base.css` | 3,171 B | 1,077 B | Base element styles. |
| `app.css` | 505 B | 296 B | Optional app/site defaults for raw links, lists, and controls. |
| `layout.css` | 3,874 B | 1,136 B | Layout primitives such as container, stack, grid, sidebar, and split. |
| `components.css` | 19,569 B | 3,328 B | Component primitives such as button, card, surface, nav, form, alert, website patterns, accessibility states, and input. |
| `utilities.css` | 4,654 B | 1,287 B | Static type, prose, accessibility, link, list, colour, border, and shadow helpers. |
| `styles.css` | 40,136 B | 7,539 B | Full core stylesheet with tokens, reset, base, layout, components, and utilities. |

Example generated project CSS with tokens plus one scanned `text-primary`
utility measured 7,031 B raw and 1,943 B gzip.

## Import Choices

Use the full stylesheet when simplicity matters:

```css
@import "@synced/fluid/styles.css";
@import "./synced-fluid.generated.css";
```

Use layer imports instead when a project wants a smaller core surface:

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

Leave out `components.css` if the project only uses tokens and layout
primitives. Leave out `app.css` when content-style browser affordances should
stay intact. Leave out `utilities.css` unless the project uses static type,
prose, accessibility, link, list, or full-bleed helpers.

## WordPress

Many WordPress themes and plugins enqueue plain CSS rather than resolving npm CSS
imports through a bundler. Use the WordPress preset for that environment:

```bash
pnpm exec synced-fluid init --preset wordpress
pnpm fluid:build
```

That preset scans PHP and template files, enables `includeCore`, and writes a
single enqueue-ready file at `assets/css/synced-fluid.css`.

## Marketing Notes

Safe claims:

- Modern CSS-first: Synced Fluid uses cascade layers, custom properties,
  `clamp()`, logical properties, OKLCH colour, and container-aware primitives.
- Compact by default: the full core stylesheet is currently about 7.4 KB gzip.
- Flexible loading: developers can import only the CSS layers their project
  uses.
- Source-scanned utilities: project utility CSS is generated from actual class
  usage rather than shipping a large universal utility file.
- WordPress-ready: themes and plugins can build one enqueue-ready CSS file.
- Dependency-free runtime: the JavaScript entry currently ships without runtime
  package dependencies.

The package guardrail script enforces current gzip budgets:

```bash
pnpm guardrails
```

Budgets are intentionally tight enough to catch accidental bloat while leaving
room for small improvements to the core primitives.

Avoid claiming:

- automatic CSS tree-shaking in every bundler
- a full Tailwind feature replacement
- fixed size guarantees, because CSS size changes as tokens and primitives
  evolve
