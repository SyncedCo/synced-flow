# Config Reference

Create `synced-flow.config.mjs` in the project root.

```js
import { defineConfig } from '@syncedco/flow/config'
import { themePresets } from '@syncedco/flow/presets'

export default defineConfig({
  scan: ['src', 'components'],
  out: 'src/synced-flow.generated.css',
  responsiveVariants: false,
  includeDefaults: true,
  safelist: [],
  theme: themePresets.synced,
})
```

## Options

| Option | Type | Purpose |
| --- | --- | --- |
| `cwd` | `string` | Resolve scan and output paths from a specific directory. |
| `scan` | `string[]` | Source directories scanned for complete class tokens. |
| `safelist` | `string[]` | Class tokens to always generate for dynamic class cases. |
| `out` | `string` | Generated CSS output path. |
| `includeCore` | `boolean` | Include reset/base/layout/component CSS in generated output. |
| `includeDefaults` | `boolean` | Include optional site/UI defaults when `includeCore` is true. |
| `responsiveVariants` | `boolean` | Enable `sm:`, `md:`, `lg:`, `xl:` compatibility variants. |
| `failOnUnsupported` | `boolean` | Fail when unsupported class tokens are detected. |
| `quiet` | `boolean` | Suppress non-critical warnings. |
| `theme` | `object` | Project token overrides emitted into generated CSS. |

Set `includeCore: true` for environments that enqueue a plain CSS file and do
not process npm CSS imports, such as many WordPress themes and plugins.
Set `includeDefaults: true` with `includeCore` when that single generated file should
also remove raw link underlines and list markers for site/UI surfaces.

## Theme

Theme values become CSS custom properties in the generated file. Synced Flow
emits both the public `--sf-*` token and the utility-compatible alias where
needed.

```js
theme: {
  fonts: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    display: 'Fraunces, Georgia, serif',
    mono: '"SF Mono", ui-monospace, monospace',
  },
  colours: {
    background: 'oklch(98.6% 0.006 80)',
    foreground: 'oklch(18% 0.026 250)',
    primary: 'oklch(68% 0.18 44)',
    primaryHover: 'oklch(60% 0.18 44)',
    primaryForeground: 'oklch(100% 0 0)',
    border: 'oklch(18% 0.026 250 / 0.12)',
  },
  darkColours: {
    background: 'oklch(13.5% 0.03 252)',
    foreground: 'oklch(96% 0.008 86)',
  },
  radii: {
    md: '0.5rem',
    lg: '0.75rem',
  },
  layout: {
    containerMax: '72rem',
    gutter: 'var(--space-s-l)',
    columns: 12,
  },
  components: {
    button: {
      radius: 'var(--radius-md)',
      blockSize: '2.75rem',
      paddingInline: 'var(--space-s)',
    },
  },
}
```

## Theme Scope

The config theme model is intentionally global. Use `theme.colours` for the
default token set and `theme.darkColours` for `.sf-theme-dark` /
`[data-sf-theme="dark"]` overrides. This covers the common site or app case:
one brand token set, with an optional dark-mode token set.

Synced Flow does not try to encode every theme matrix in config. If a project
needs per-tenant branding, `[data-surface]` variants, density-by-context, or
other multi-axis theme rules, keep the reusable defaults in config and write
the extra token scopes in project CSS:

```css
[data-tenant="acme"] {
  --sf-colour-primary: oklch(62% 0.19 252);
  --sf-colour-primary-hover: oklch(56% 0.19 252);
}

[data-surface="inset"] {
  --sf-colour-surface: var(--sf-colour-surface-inset);
  --sf-card-padding: var(--sf-space-s);
}
```

Use this pattern for deliberate product theming. Avoid scattering one-off
colour values through page components when a value can live in a token scope.
