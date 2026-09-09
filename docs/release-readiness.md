# Release Readiness

Use this checklist before tagging or publishing Synced Flow.

## Lean Package Checks

- `package.json` has no runtime dependencies.
- `styles.css` stays below the gzip budget in `scripts/guardrails.mjs`.
- `components.css`, `layout.css`, `utilities.css`, and `tokens.css` stay below
  their gzip budgets.
- New CSS uses existing tokens before introducing new variables.
- New classes are broad primitives or common website patterns, not project
  one-offs.

## CSS System Checks

- Type and spacing use Utopia-style `clamp()` tokens.
- Fixed dimensions use `rem`.
- Raw `px` appears only for allowed hairlines or forced-colors fallbacks.
- Reset, base, app, layout, components, and utilities remain separate layer
  files.
- `styles.css` is generated from the same layer sources and does not duplicate
  reset/base content.

## Accessibility Confidence Pass

Synced Flow does not run audits for consuming projects, but the package should
keep the CSS affordances in place.

- Keyboard focus is visible on links, buttons, form fields, summaries, and
  skip links.
- `aria-current`, `aria-expanded`, `aria-pressed`, `aria-selected`,
  `aria-disabled`, `aria-busy`, and `aria-invalid` have visible states where
  the system provides matching primitives.
- Native disabled, required, invalid, `details[open]`, and `:target` states are
  styled.
- Checkbox-backed switches remain strictly binary and radio-backed segmented
  controls preserve native keyboard behavior.
- Loading indicators have a text status; reduced motion leaves a visible
  non-rotating indicator.
- App-owned combobox, bulk-selection, pagination, and wizard examples clearly
  name the JavaScript and focus behavior the consumer must implement.
- Forced-colors fallbacks keep borders and focus outlines visible.
- `prefers-reduced-motion` is respected by the base styles.
- Examples use semantic landmarks, real buttons, real links, labels, help text,
  and native disclosure controls.
- Every catalogue pattern and recipe has valid IDs and ID references and passes
  automated WCAG A/AA checks in light and dark themes.
- Native component behaviour passes in Chromium, Firefox, and WebKit.

## Documentation Checks

- README points to the main docs.
- Quick start explains the import choices.
- System primitives lists current tokens/classes.
- CSS API contract explains public vs internal surfaces.
- Recipes show how to build common pages without one-off CSS.
- CSS optimisation docs include current measured sizes.

## Commands

```bash
pnpm install --ignore-scripts
pnpm build:types
pnpm check:generated
pnpm check
pnpm test
pnpm test:browser:all
npm pack --dry-run
node bin/synced-flow.mjs tokens --json
node bin/synced-flow.mjs catalog --json
node bin/synced-flow.mjs pattern switch-control --markup
node bin/synced-flow.mjs pattern searchable-select --json
node bin/synced-flow.mjs recipe app-settings-workflow --markup
node bin/synced-flow.mjs doctor --cwd examples/plain-html
```

Run freshness checks before `pnpm build`, `pnpm install` without
`--ignore-scripts`, or another lifecycle command can regenerate tracked CSS.
The freshness gate covers the eight package layer/bundle files plus plain HTML,
Vite, Next, Astro, and WordPress generated outputs. The unit suite semantically
compiles all 35 patterns and 12 recipes for React and Next (94 generated TSX
files), and exercises the generated React scroll-spy lifecycle. Browser tests
use shipped CSS and generated markup to cover native keyboard/form behaviour,
focus, reduced motion, forced colours, dialogs, responsive overflow, IDs, and
light/dark Axe checks.

## npm Trusted Publishing

Pull requests and `main` use `.github/workflows/ci.yml` to run the freshness,
static, unit, package dry-run, and Chromium gates. Publishing is handled by
`.github/workflows/npm-publish.yml` when a `v*` tag is pushed. Its release gate
checks that the tag matches `package.json` and runs the same checks with
Chromium, Firefox, and WebKit. The publish job can start only after that gate
passes and is the only job granted npm trusted-publishing identity permission.

Configure npm package trusted publishing for `@syncedco/flow` with:

- Provider: GitHub Actions
- Organization or user: `SyncedCo`
- Repository: `synced-flow`
- Workflow filename: `npm-publish.yml`
- Allowed action: `npm publish`

After this is verified, prefer npm's package setting to require two-factor
authentication and disallow token publishing.
