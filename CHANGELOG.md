# Changelog

## 0.5.0 - 2026-09-25

- Fix `border`, `border-t`, `border-2` and the other border width utilities
  drawing nothing: they now also set `border-style: solid`.
- Fix `space-x-*`, `space-y-*`, `divide-x` and `divide-y` doing nothing unless
  core CSS was included. They now generate their own child rules for any
  value, so `space-y-7` works too.
- Fix `h-screen`, `min-h-screen`, `max-h-screen`, `top-screen`,
  `bottom-screen` and `translate-y-screen` using the viewport width (`100svw`)
  instead of the viewport height (`100svh`). `size-screen` now sets
  `100svw` by `100svh`.
- Add `dvh`, `dvw`, `lvh` and `lvw` sizing keywords, such as `min-h-dvh`.
- Add common utilities: `border-dashed`/`dotted`/`double`/`none`,
  `divide-<colour>`, `divide-dashed`, `divide-x-2`, `order-*`,
  `col-start-*`/`col-end-*`/`row-start-*`/`row-end-*`, `justify-items-*`,
  `justify-self-*`, `flex-initial`, `max-w-none`, `max-h-none`,
  `object-<position>`, `bg-cover`/`contain`, `bg-<position>`,
  `bg-no-repeat` and other repeat values, `bg-fixed`, `bg-linear-to-*`,
  `bg-none`, `origin-*`, `font-serif`, `text-ellipsis`, `text-clip`, `blur`,
  `transition-opacity`, `transition-shadow`, `transition-none`,
  `animate-ping`, `animate-bounce` and `animate-none`.
- Improve `synced-flow lint` hints: suggest Flow's own class first
  (`prose` suggests `sf-prose`), suggest the same utility with a valid value
  (`h-scren` suggests `h-screen`, not `hidden`), and only suggest near typos,
  so hints no longer name a class that does something else.

## 0.4.1 - 2026-09-09

- Fix source-tree generated-CSS checks when the package is tested from a
  root-only installation, and refresh tracked example outputs against the
  current theme tokens.

## 0.4.0 - 2026-09-09

- Add native checkbox-backed switches, radio-backed segmented controls,
  grouped inputs, styled file/range inputs, and a reduced-motion-safe spinner.
- Add app-tier presentation contracts for searchable selects, bulk actions,
  complete pagination, and multi-step forms while keeping JavaScript state in
  consuming apps.
- Expand CLI catalogue, suggestion routing, patterns, and the
  `app-settings-workflow` recipe across the new public surface.
- Expand the TypeScript `fluidSystem.components` shortcuts and document the
  existing code-window, token-strip, marquee, command-list, and platform-card
  presentation classes as public.
- Fix modal Cancel form association and move sortable-table `aria-sort` to the
  column header.
- Add generated-CSS freshness, semantic React/Next compilation, package dry-run,
  and cross-browser accessibility/interaction release gates.
- Darken default light-theme action and link tokens to meet normal-text colour
  contrast, including hover states.

## 0.3.2 - 2026-06-15

- Add an explicit accessible root typography baseline with `html { font-size: 100%; }`.
- Add `--sf-text-base` and generated `--text-base` aliases for fluid body text.
- Use the new fluid body text token in shipped and generated base CSS.
- Convert CLI-generated utility lengths for blur, rings, outlines, and thicker borders from static `px` to `rem`.
- Extend guardrails and tests so shipped generated examples reject raw pixels outside allowed hairline, visually-hidden, and forced-colors exceptions.

## 0.3.1 - 2026-06-13

- Fix mobile app drawer scrolling by giving the drawer sidebar a viewport block size.
- Vertically center `.sf-tab` contents.
- Improve built-in dark theme token coverage for primary, state, soft, ring, and glow tokens.
- Make `.sf-filter-bar` alignment token-configurable with a centered default.
- Add a status-chip dot opt-out with `data-dot="false"` and `sf-status--label`.
- Add reduced-motion safeguards for hover lift and marquee animation.
- Add public `--sf-z-*` stacking tokens for header, backdrop, drawer, overlay, toast, sticky, and skip-link layers.
- Reframe positioning copy from "AI-native" to "AI-friendly".
- Document the global theme config scope and the project-CSS pattern for advanced theme matrices.
