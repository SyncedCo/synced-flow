---
name: synced-flow
description: Use Synced Flow to set up and build modern fluid CSS systems with the CLI, tokens, presets, WordPress support, and source-scanned utility CSS.
---

# Synced Flow

Use this skill when a project uses, evaluates, installs, migrates to, or
generates UI with Synced Flow.

Synced Flow is an independent modern fluid CSS system. It is not a Tailwind
copy, compatibility layer, or one-for-one replacement. Tailwind references
should only support migration from existing projects.

## First Moves

1. Check whether `@synced/flow` is installed.
2. Check for `synced-flow.config.mjs`.
3. Run or recommend `synced-flow agents status` to see whether project-level
   guidance is installed.
4. Run or recommend `synced-flow catalog --json` before choosing recipes and
   class names.
5. Use `synced-flow pattern --list` and `synced-flow pattern <id> --markup`
   before hand-rolling native interaction markup.
6. Use `synced-flow suggest "<brief>"` or
   `synced-flow suggest "<brief>" --scaffold --dry-run` for section, page, or
   starter composition.
7. Use `synced-flow recipe <id> --markup` when a project needs copy-ready page
   structure.
8. Use `synced-flow lint --json` and `synced-flow doctor` to verify setup.
9. Keep `responsiveVariants` off for new projects.

## Setup

Use the closest preset:

```bash
pnpm exec synced-flow init --preset next --agents
pnpm exec synced-flow init --preset vite
pnpm exec synced-flow init --preset astro
pnpm exec synced-flow init --preset wordpress
pnpm exec synced-flow init --preset plain
```

For an existing project, install project-local AI guidance:

```bash
pnpm exec synced-flow agents install
pnpm exec synced-flow agents install --target all
pnpm exec synced-flow agents status
pnpm exec synced-flow skill
```

Use `--preset wordpress` for WordPress themes and plugins. It scans PHP and
template files, enables `includeCore`, and writes an enqueue-ready CSS file at
`assets/css/synced-flow.css`.

## CSS Imports

For simple bundled apps:

```css
@import "@synced/flow/styles.css";
@import "@synced/flow/app.css";
@import "./synced-flow.generated.css";
```

For smaller core loading, import only the layers needed:

```css
@import "@synced/flow/tokens.css";
@import "@synced/flow/reset.css";
@import "@synced/flow/base.css";
@import "@synced/flow/app.css";
@import "@synced/flow/layout.css";
@import "@synced/flow/components.css";
@import "./synced-flow.generated.css";
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
- Do not implement authentication logic in Synced Flow markup. Wire sessions,
  providers, permissions, and sign-out actions in the consuming app.
- Prefer native component patterns for common interaction: `sf-dialog`,
  `sf-popover`, `sf-drawer`, `sf-drawer--stack`, `sf-disclosure`,
  `sf-accordion`, `sf-tabs`, `sf-tooltip`, `sf-toast`, and `sf-banner`.
- Use `synced-flow pattern mobile-nav-drawer --markup` for complete mobile nav
  drawers instead of composing only `sf-nav--mobile`.
- Use semantic utility classes such as `bg-background`, `text-foreground`,
  `bg-primary`, `text-primary-foreground`, `border-border`, and `bg-surface`.
- Keep browser affordances by default: body links stay underlined, content
  lists keep markers, focus styles stay visible, and reduced-motion preferences
  are respected.
- Include `@synced/flow/app.css`, or run `synced-flow add app`, when an
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

- Do not describe Synced Flow as a Tailwind clone or full replacement.
- Use `responsiveVariants: true` only while migrating existing breakpoint
  classes such as `sm:` or `lg:`.
- Replace breakpoint-heavy layout with fluid primitives over time.
- Move repeated visual decisions into tokens and theme config.

## Finish Checklist

Run:

```bash
pnpm flow:build
pnpm flow:check
pnpm exec synced-flow lint --json
pnpm flow:doctor
```

For package or repo changes, also run:

```bash
pnpm check
pnpm test
pnpm pack --dry-run
```

If `doctor` warns about stale CSS, run `pnpm flow:build`.
