# Build A Site Walkthrough

This walkthrough shows the intended real-world flow for a new website: theme
decisions first, then recipes, then verification.

## 1. Install And Initialise

```bash
pnpm add @synced/flow
pnpm exec synced-flow init --preset next --theme synced --agents
```

Use the closest preset: `next`, `astro`, `vite`, `wordpress`, or `plain`.
For WordPress, see [WordPress](wordpress.md) and the
[`examples/wordpress`](../examples/wordpress) template.

`--agents` adds a project-level `AGENTS.md` Synced Flow section so AI coding
agents can find the packaged skill and the right CLI checks. Existing projects
can run `pnpm exec synced-flow agents install`.

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
pnpm exec synced-flow theme init --from brief.md --preset-base neutral-saas
```

If the brief misses decisions such as radius, fonts, primary colour, accent
colour, surface style, or density, the command prints warnings and fills
sensible defaults. Paste the generated `theme` block into
`synced-flow.config.mjs`.

## 3. Pick A Recipe

Ask Synced Flow for matching recipes:

```bash
pnpm exec synced-flow suggest "SaaS landing page with pricing and FAQ"
pnpm exec synced-flow suggest "scroll portfolio with contact" --scaffold --framework next --dry-run
```

Print copy-ready markup:

```bash
pnpm exec synced-flow recipe saas-landing --framework next --markup
```

For a single section:

```bash
pnpm exec synced-flow recipe --section form --framework next --markup
```

For interaction patterns such as mobile drawers or scroll panels:

```bash
pnpm exec synced-flow pattern --list
pnpm exec synced-flow pattern mobile-nav-drawer --framework next --markup
```

Available page recipes include `saas-landing`, `portfolio-scroll`,
`saas-dashboard`, `agency-home`, `blog-index`, `article-page`,
`about-timeline`, `team-grid`, `contact-page`, `not-found`, and
`coming-soon`.

Choose `saas-landing` for public SaaS marketing pages. Choose
`saas-dashboard` for authenticated app screens with login/account state,
workspace navigation, metrics, tables, and activity panels.

## 4. Edit Content, Not CSS

Replace headings, links, images, prices, and form fields in the recipe markup.
Keep the `sf-*` structure where possible:

- layout: `sf-container`, `sf-section`, `sf-stack`, `sf-split`, `sf-auto-grid`
- components: `sf-button`, `sf-card`, `sf-form`, `sf-nav`, `sf-disclosure`
- content: `sf-prose`, `sf-meta`, `sf-figure`, `sf-table-wrap`

Use `synced-flow catalog --json` when an AI agent needs the full public API.
Use `synced-flow pattern <id> --json` when it needs accessibility notes,
gotchas, and framework-specific markup for native interactions.

## 5. Build And Verify

```bash
pnpm flow:build
pnpm flow:check
pnpm exec synced-flow lint --json
pnpm flow:doctor
```

`lint` catches unsupported class tokens, suggests nearest alternatives, and
warns about incomplete native interaction composition such as drawers without
close paths or dynamic class fragments.
`doctor` checks setup, generated CSS freshness, theme shape, duplicate imports,
ad hoc token overrides, AI guidance, and release-facing guardrails.

## 6. Keep It Lean

Use the full core import while building:

```css
@import "@synced/flow/styles.css";
@import "./synced-flow.generated.css";
```

For tighter loading, switch to modular imports only if the project has a clear
reason to omit a layer. Do not import `styles.css` and modular core files
together.
