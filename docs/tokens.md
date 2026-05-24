# Tokens Guide

Synced Fluid uses a three-layer token model.

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
--sf-colour-primary: var(--sf-colour-orange-600);
--sf-colour-surface-raised: var(--sf-colour-neutral-0);
--sf-colour-success-soft: oklch(62% 0.13 150 / 0.12);
```

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
--sf-space-s-l: clamp(1rem, 0.6173rem + 1.7007vw, 2.25rem);
```

Prefer these tokens for new project CSS instead of fixed pixel values.

## Core Starter Tokens

The generated core includes enough semantic variables for common website UI:

- surfaces: `--sf-colour-background`, `--sf-colour-surface`,
  `--sf-colour-surface-alt`, `--sf-colour-surface-raised`,
  `--sf-colour-surface-inset`
- text and links: `--sf-colour-foreground`, `--sf-colour-muted`,
  `--sf-colour-subtle`, `--sf-colour-link`, `--sf-colour-link-hover`
- actions: `--sf-colour-primary`, `--sf-colour-primary-hover`,
  `--sf-colour-primary-foreground`, `--sf-colour-primary-soft`
- state feedback: `--sf-colour-success`, `--sf-colour-warning`,
  `--sf-colour-danger`, `--sf-colour-info`, plus matching soft variants
- structure: `--sf-colour-border`, `--sf-colour-border-strong`,
  `--sf-radius-control`, `--sf-radius-panel`, `--sf-shadow-*`

For class-level usage, see [System primitives](system-primitives.md).
