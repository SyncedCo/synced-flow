---
name: synced-fluid
description: Use Synced Fluid to set up and build modern fluid CSS systems with the CLI, tokens, presets, WordPress support, and source-scanned utility CSS.
---

# Synced Fluid

Use this skill when a project uses, evaluates, installs, migrates to, or
generates UI with Synced Fluid.

Synced Fluid is an independent modern fluid CSS system. It is not a Tailwind
copy, compatibility layer, or one-for-one replacement. Tailwind references
should only support migration from existing projects.

## First Moves

1. Check whether `@synced/fluid` is installed.
2. Check for `synced-fluid.config.mjs`.
3. Run or recommend `synced-fluid agents status` to see whether project-level
   guidance is installed.
4. Run or recommend `synced-fluid catalog --json` before choosing recipes and
   class names.
5. Use `synced-fluid pattern --list` and `synced-fluid pattern <id> --markup`
   before hand-rolling native interaction markup.
6. Use `synced-fluid suggest "<brief>"` or
   `synced-fluid suggest "<brief>" --scaffold --dry-run` for section, page, or
   starter composition.
7. Use `synced-fluid recipe <id> --markup` when a project needs copy-ready page
   structure.
8. Use `synced-fluid lint --json` and `synced-fluid doctor` to verify setup.
9. Keep `responsiveVariants` off for new projects.

## Setup

Use the closest preset:

```bash
pnpm exec synced-fluid init --preset next --agents
pnpm exec synced-fluid init --preset vite
pnpm exec synced-fluid init --preset astro
pnpm exec synced-fluid init --preset wordpress
pnpm exec synced-fluid init --preset plain
```

For an existing project, install project-local AI guidance:

```bash
pnpm exec synced-fluid agents install
pnpm exec synced-fluid agents install --target all
pnpm exec synced-fluid agents status
pnpm exec synced-fluid skill
```

Use `--preset wordpress` for WordPress themes and plugins. It scans PHP and
template files, enables `includeCore`, and writes an enqueue-ready CSS file at
`assets/css/synced-fluid.css`.

## CSS Imports

For simple bundled apps:

```css
@import "@synced/fluid/styles.css";
@import "@synced/fluid/app.css";
@import "./synced-fluid.generated.css";
```

For smaller core loading, import only the layers needed:

```css
@import "@synced/fluid/tokens.css";
@import "@synced/fluid/reset.css";
@import "@synced/fluid/base.css";
@import "@synced/fluid/app.css";
@import "@synced/fluid/layout.css";
@import "@synced/fluid/components.css";
@import "./synced-fluid.generated.css";
```

Leave out `components.css` if the project only uses tokens and layout
primitives. Leave out `app.css` when content-style browser defaults should stay
intact. Leave out `utilities.css` unless static helpers such as `sf-text-*`,
`sf-prose`, `sr-only`, `not-sr-only`, `sf-skip-link`, `sf-focus-ring`,
`sf-touch-target`, `sf-list-reset`, `sf-link`, or `sf-full-bleed` are used.

## Styling Rules

- Prefer primitives first: `sf-container`, `sf-section`, `sf-stack`,
  `sf-cluster`, `sf-repel`, `sf-auto-grid`, `sf-split`, `sf-sidebar`,
  `sf-frame`, and `sf-flow`.
- Prefer component primitives for common UI: `sf-button`, `sf-card`,
  `sf-badge`, `sf-field`, and `sf-input`.
- Use `saas-landing` for public SaaS marketing pages. Use `saas-dashboard` for
  authenticated app UI, admin panels, portals, CRMs, analytics dashboards,
  metrics, tables, account menus, and login state.
- Do not implement authentication logic in Synced Fluid markup. Wire sessions,
  providers, permissions, and sign-out actions in the consuming app.
- Prefer native component patterns for common interaction: `sf-dialog`,
  `sf-popover`, `sf-drawer`, `sf-drawer--stack`, `sf-disclosure`,
  `sf-accordion`, `sf-tabs`, `sf-tooltip`, `sf-toast`, and `sf-banner`.
- Use `synced-fluid pattern mobile-nav-drawer --markup` for complete mobile nav
  drawers instead of composing only `sf-nav--mobile`.
- Use semantic utility classes such as `bg-background`, `text-foreground`,
  `bg-primary`, `text-primary-foreground`, `border-border`, and `bg-surface`.
- Keep browser affordances by default: body links stay underlined, content
  lists keep markers, focus styles stay visible, and reduced-motion preferences
  are respected.
- Include `@synced/fluid/app.css`, or run `synced-fluid add app`, when an
  app/site should remove raw link underlines and list markers globally.
- Use `sr-only` / `not-sr-only`, `sf-skip-link`, `sf-focus-ring`,
  `sf-touch-target`, `sf-list-reset`, `sf-link`, and `sf-link-plain` for
  accessibility and explicit UI styling.
- Put brand choices in `theme` config or theme presets rather than scattered
  one-off CSS.
- Use modern CSS techniques already in the system: cascade layers, custom
  properties, logical properties, `clamp()`, OKLCH colour, container-aware
  layout, and `prefers-reduced-motion`.
- Keep class names complete in source files. Do not compose class names from
  fragments.
- Use `safelist` only when dynamic classes are unavoidable.

## Migration Guidance

When migrating from Tailwind, frame the work as migration guidance only.

- Do not describe Synced Fluid as a Tailwind clone or full replacement.
- Use `responsiveVariants: true` only while migrating existing breakpoint
  classes such as `sm:` or `lg:`.
- Replace breakpoint-heavy layout with fluid primitives over time.
- Move repeated visual decisions into tokens and theme config.

## Finish Checklist

Run:

```bash
pnpm fluid:build
pnpm fluid:check
pnpm exec synced-fluid lint --json
pnpm fluid:doctor
```

For package or repo changes, also run:

```bash
pnpm check
pnpm test
pnpm pack --dry-run
```

If `doctor` warns about stale CSS, run `pnpm fluid:build`.
