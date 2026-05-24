# Config Reference

Create `synced-fluid.config.mjs` in the project root.

```js
import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ['src', 'components'],
  out: 'src/synced-fluid.generated.css',
  responsiveVariants: false,
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
| `responsiveVariants` | `boolean` | Enable `sm:`, `md:`, `lg:`, `xl:` compatibility variants. |
| `failOnUnsupported` | `boolean` | Fail when unsupported class tokens are detected. |
| `quiet` | `boolean` | Suppress non-critical warnings. |
| `theme` | `object` | Project token overrides emitted into generated CSS. |

Set `includeCore: true` for environments that enqueue a plain CSS file and do
not process npm CSS imports, such as many WordPress themes and plugins.

## Theme

Theme values become CSS custom properties in the generated file. Synced Fluid
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
