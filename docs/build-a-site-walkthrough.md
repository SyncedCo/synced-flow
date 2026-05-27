# Build A Site Walkthrough

This walkthrough shows the intended real-world flow for a new website: theme
decisions first, then recipes, then verification.

## 1. Install And Initialise

```bash
pnpm add @synced/fluid
pnpm exec synced-fluid init --preset next --theme synced
```

Use the closest preset: `next`, `astro`, `vite`, `wordpress`, or `plain`.

## 2. Write A Theme Brief

Create `brief.md`:

```md
Modern B2B SaaS site.
Radius: slightly rounded, not pill shaped.
Fonts: Inter/system UI with clean display headings.
Primary colour: blue.
Accent colour: green.
Surface style: raised cards.
Density: spacious sections.
```

Generate a validated theme block:

```bash
pnpm exec synced-fluid theme init --from brief.md --preset-base neutral-saas
```

If the brief misses decisions such as radius, fonts, primary colour, accent
colour, surface style, or density, the command prints warnings and fills
sensible defaults. Paste the generated `theme` block into
`synced-fluid.config.mjs`.

## 3. Pick A Recipe

Ask Synced Fluid for matching recipes:

```bash
pnpm exec synced-fluid suggest "SaaS landing page with pricing and FAQ"
```

Print copy-ready markup:

```bash
pnpm exec synced-fluid recipe saas-landing --framework next --markup
```

For a single section:

```bash
pnpm exec synced-fluid recipe --section form --framework next --markup
```

Available page recipes include `saas-landing`, `portfolio-scroll`,
`agency-home`, `blog-index`, `article-page`, `about-timeline`, `team-grid`,
`contact-page`, `not-found`, and `coming-soon`.

## 4. Edit Content, Not CSS

Replace headings, links, images, prices, and form fields in the recipe markup.
Keep the `sf-*` structure where possible:

- layout: `sf-container`, `sf-section`, `sf-stack`, `sf-split`, `sf-auto-grid`
- components: `sf-button`, `sf-card`, `sf-form`, `sf-nav`, `sf-disclosure`
- content: `sf-prose`, `sf-meta`, `sf-figure`, `sf-table-wrap`

Use `synced-fluid catalog --json` when an AI agent needs the full public API.

## 5. Build And Verify

```bash
pnpm fluid:build
pnpm fluid:check
pnpm fluid:lint
pnpm fluid:doctor
```

`lint` catches unsupported class tokens and suggests nearest alternatives.
`doctor` checks setup, generated CSS freshness, theme shape, duplicate imports,
ad hoc token overrides, and release-facing guardrails.

## 6. Keep It Lean

Use the full core import while building:

```css
@import "@synced/fluid/styles.css";
@import "./synced-fluid.generated.css";
```

For tighter loading, switch to modular imports only if the project has a clear
reason to omit a layer. Do not import `styles.css` and modular core files
together.
