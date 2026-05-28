# CSS API Contract

Synced Fluid is small enough to read, but projects still need to know which
parts are safe to rely on. Treat this page as the public CSS contract for the
0.x line.

## Stable Public Surface

These are intended for application code and examples.

| Surface | Public API |
| --- | --- |
| Imports | `@synced/fluid/styles.css`, `tokens.css`, `reset.css`, `base.css`, `app.css`, `layout.css`, `components.css`, `utilities.css` |
| Tokens | `--sf-*` custom properties emitted by `tokens.css` |
| Theme config | `theme.fonts`, `theme.colours`, `theme.darkColours`, `theme.radii`, `theme.layout`, `theme.components` |
| Layout classes | `sf-container`, `sf-section`, `sf-stack`, `sf-flow`, `sf-cluster`, `sf-repel`, `sf-auto-grid`, `sf-switcher`, `sf-sidebar`, `sf-split`, `sf-frame`, `sf-cover` |
| Components | `sf-button`, `sf-card`, `sf-surface`, `sf-hero`, `sf-nav`, `sf-form`, `sf-field`, `sf-input`, `sf-select`, `sf-textarea`, `sf-check`, `sf-alert`, `sf-badge`, `sf-section-header`, `sf-kicker` |
| Native components | `sf-dialog`, `sf-popover`, `sf-tooltip`, `sf-drawer`, `sf-drawer--stack`, `sf-disclosure`, `sf-accordion`, `sf-tabs`, `sf-menu`, `sf-breadcrumb`, `sf-pagination` |
| Website patterns | `sf-logo-cloud`, `sf-feature`, `sf-stats`, `sf-testimonial`, `sf-pricing-grid`, `sf-price-card`, `sf-faq`, `sf-cta`, `sf-footer` |
| Utilities | `sf-prose`, `sf-link`, `sf-link-subtle`, `sf-link-plain`, `sf-list-*`, `sf-focus-ring`, `sf-touch-target`, `sf-skip-link`, `sr-only`, `not-sr-only` |
| CLI | `synced-fluid init`, `agents install`, `agents status`, `skill`, `add app`, `build`, `watch`, `lint`, `doctor`, `tokens`, `catalog`, `suggest`, `pattern`, `recipe`, `theme init`, `theme validate` |

## AI Agent Contract

The project-level AI setup commands are public in 0.x:

- `synced-fluid agents install [--target universal|cursor|codex|claude|copilot|windsurf|gemini|aider|all] [--force] [--dry-run]`
- `synced-fluid agents status`
- `synced-fluid skill`
- `synced-fluid pattern <id> [--framework html|next|react|astro] [--markup|--json]`
- `synced-fluid pattern --list`
- `synced-fluid suggest "<brief>" --scaffold [--framework next|vite|astro|plain] [--out dir] [--dry-run] [--force]`
- `synced-fluid lint [--json] [--fix] [paths...]`

`catalog --json` includes `patterns[]` with copy-ready interaction metadata:
classes, markup, JS requirement notes, accessibility notes, and gotchas.

## Internal Or Compatibility Surface

These can change more freely.

- Generated compatibility utility selectors such as `[class~="text-primary"]`.
- Tailwind-migration helpers enabled by `responsiveVariants`.
- Implementation details inside `scripts/build-css.mjs`.
- Utility-compatible aliases such as `--color-*`, `--font-*`, and `--radius-*`.
  They are useful for migration output, but `--sf-*` tokens are the preferred
  long-term API.

## Unit Policy

Design decisions should use `rem`, fluid `clamp()` tokens, logical properties,
or percentages. Raw `px` is reserved for:

- `1px` borders and inset hairlines.
- Forced-colors/system fallback outlines.
- Internal generator math that is emitted as `rem` or `clamp()`.

`pnpm guardrails` enforces this policy against the shipped CSS files.

## Change Rules

- Additive tokens/classes are safe in minor releases.
- Renaming or removing public `--sf-*` tokens or `sf-*` classes needs a
  migration note and should wait for a major release once the project leaves
  `0.x`.
- New primitives should earn their place by replacing repeated website/app
  CSS, not by chasing every utility class from larger frameworks.
- Prefer documentation recipes before adding new CSS.

## Stability Checklist

Before changing the public surface, run:

```bash
pnpm build
pnpm check
pnpm test
```

`pnpm check` includes generated CSS freshness, type checks, CSS size budgets,
dependency checks, layer-shape checks, and raw-pixel guardrails.
