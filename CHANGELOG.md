# Changelog

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
