# Tokens Guide

Synced Flow uses a three-layer token model.

```text
Primitive -> Semantic -> Component
```

## Primitive

Primitive tokens hold raw design values.

```css
--sf-colour-orange-600: oklch(68% 0.18 44);
--sf-radius-md: 0.5rem;
--sf-font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
```

## Semantic

Semantic tokens describe intent.

```css
--sf-colour-background: var(--sf-colour-neutral-50);
--sf-colour-foreground: var(--sf-colour-neutral-900);
--sf-colour-primary: var(--sf-colour-orange-800);
--sf-colour-surface-raised: var(--sf-colour-neutral-0);
--sf-colour-success-soft: oklch(62% 0.13 150 / 0.12);
```

Tokens are emitted outside CSS layers so configured themes can act as the
source of truth for brand colours, radius, layout, and component decisions.
Use `theme.darkColours` for dark-mode values instead of maintaining a separate
CSS file that redefines `--sf-*` variables.

Theme overrides use `.sf-theme-dark`, `[data-sf-theme="dark"]`,
`.sf-theme-light`, and `[data-sf-theme="light"]` selectors directly so they have
enough specificity to override default `:root` values.

The default action and link oranges use the darker 800/900 steps so white
button text and orange text on light surfaces meet normal-text contrast.

Use semantic utilities in projects:

```html
<section class="bg-background text-foreground">
  <a class="sf-button sf-button--default">Book a call</a>
</section>
```

## Component

Component tokens define reusable component defaults.

```css
--sf-button-radius: var(--sf-radius-md);
--sf-button-block-size: 2.75rem;
--sf-card-padding: var(--sf-space-m-l);
--sf-input-padding-inline: var(--sf-space-s);
--sf-alert-padding: var(--sf-space-s-m);
--sf-nav-gap: var(--sf-space-xs-s);
```

## Fluid Scale

Type and space tokens use Utopia-style `clamp()` values.

```css
--sf-step-0: clamp(1rem, 0.9617rem + 0.1701vw, 1.125rem);
--sf-type-body: var(--sf-step-0);
--sf-text-base: var(--sf-type-body);
--sf-space-s-l: clamp(1rem, 0.6173rem + 1.7007vw, 2.25rem);
```

Prefer these tokens for new project CSS instead of fixed pixel values. The root
`html` element stays at `font-size: 100%` so browser and user accessibility
settings remain in control; Synced Flow starts its fluid body scale from
`--sf-text-base`.

## Core Starter Tokens

The generated core includes enough semantic variables for common website UI:

- surfaces: `--sf-colour-background`, `--sf-colour-surface`,
  `--sf-colour-surface-alt`, `--sf-colour-surface-raised`,
  `--sf-colour-surface-raised-2`, `--sf-colour-surface-hover`,
  `--sf-colour-surface-inset`
- text and links: `--sf-colour-foreground`, `--sf-colour-muted`,
  `--sf-colour-subtle`, `--sf-colour-link`, `--sf-colour-link-hover`
- actions: `--sf-colour-primary`, `--sf-colour-primary-hover`,
  `--sf-colour-primary-foreground`, `--sf-colour-primary-soft`
- state feedback: `--sf-colour-success`, `--sf-colour-warning`,
  `--sf-colour-danger`, `--sf-colour-info`, plus matching soft variants
- structure: `--sf-colour-border-subtle`, `--sf-colour-border`,
  `--sf-colour-border-strong`, `--sf-colour-backdrop`,
  `--sf-radius-control`, `--sf-radius-panel`, `--sf-shadow-*`
- stacking: `--sf-z-sticky`, `--sf-z-header`, `--sf-z-backdrop`,
  `--sf-z-drawer`, `--sf-z-overlay`, `--sf-z-toast`, `--sf-z-skip-link`
- data accents: `--sf-colour-categorical-1` through
  `--sf-colour-categorical-6`

For class-level usage, see [System primitives](system-primitives.md).

Custom semantic colour names from `theme.colours`, such as `secondary` or
`tertiary`, are emitted as CSS variables and can be consumed directly with
`var(--sf-colour-tertiary)`. Generated colour utilities are available when the
class token is present in scanned source, for example `text-tertiary` or
`bg-tertiary`.
