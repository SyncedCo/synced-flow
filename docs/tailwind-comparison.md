# Tailwind Migration Context

Tailwind CSS is referenced here only to help teams migrate existing projects.
Synced Fluid is an independent fluid CSS system, not a Tailwind copy,
compatibility layer, or one-for-one feature replacement.

## Developer Expectations During Migration

Teams coming from Tailwind often expect a short install flow, a CLI, generated
CSS from source files, clear framework setup, safelisting for dynamic class
names, and setup diagnostics. Synced Fluid supports those expectations while
using its own fluid, token-led styling model.

| Migration expectation | Synced Fluid direction |
| --- | --- |
| Install a package, import one stylesheet, start building | `pnpm add @synced/fluid`, `synced-fluid init`, import the generated CSS entry |
| CLI builds CSS from scanned source files | `synced-fluid build` scans configured project folders and writes generated utility CSS |
| Framework-specific setup docs | `synced-fluid init --preset next/vite/astro/plain` |
| Theme variables as the styling API | CSS custom properties in `@synced/fluid/styles.css` plus project overrides |
| Source registration and monorepo-friendly paths | `scan` and `cwd` config options |
| Safelisting for dynamic class names | `safelist` config option and `--safelist` CLI flag |
| Setup diagnostics | `synced-fluid doctor` |

## How Synced Fluid Differs

Synced Fluid starts with a fluid design system rather than a breakpoint-first
utility framework. New projects keep `responsiveVariants` off, then use fluid
type, spacing, layout primitives, and container-aware component CSS.

For CSS size, Synced Fluid favours modular layer imports and source-scanned
utility generation rather than shipping a large universal utility file. See
[CSS optimisation](css-optimisation.md) for current size measurements and
marketing-safe claims.

Responsive variants such as `sm:` and `lg:` are available only as an explicit
migration option:

```js
export default defineConfig({
  scan: ['app', 'components', 'lib'],
  out: 'app/synced-fluid.generated.css',
  responsiveVariants: true,
})
```

## Migration Docs Should Keep

- `init` should get a project compiling quickly.
- `build --check` should fail CI when generated CSS is stale.
- `doctor` should explain missing imports, config, scripts, and stale setup.
- Docs should show copy-pasteable install paths for common frameworks.
- Scanner docs must clearly explain dynamic class limits.
- Token docs should show the primitive, semantic, and component layers.

## References For Migration Planning

- Tailwind's Vite guide shows the value of a short install/import/start flow:
  https://tailwindcss.com/docs/installation/using-vite
- Tailwind's CLI guide shows the expected build/watch mental model:
  https://tailwindcss.com/docs/installation/tailwind-cli
- Tailwind's source detection docs explain scanner behaviour, explicit source
  paths, and safelisting:
  https://tailwindcss.com/docs/detecting-classes-in-source-files
- Tailwind's theme variable docs show why tokens should be the public styling
  API:
  https://tailwindcss.com/docs/theme
