# CLI Reference

## init

Scaffold Synced Fluid into a project.

```bash
pnpm exec synced-fluid init --preset next
```

Options:

| Option | Purpose |
| --- | --- |
| `--preset next` | Next.js app or pages project. |
| `--preset vite` | Vite React project. |
| `--preset astro` | Astro project. |
| `--preset wordpress` | WordPress theme or plugin with enqueue-ready CSS output. |
| `--preset plain` | Plain HTML/CSS project. |
| `--theme <name>` | Use `synced`, `neutral-saas`, `editorial`, or `dark-app`. |
| `--scan <dir>` | Add source directories. |
| `--out <file>` | Choose generated CSS output path. |
| `--safelist <classes>` | Add always-generated classes. |
| `--include-core` | Write a single CSS output that includes tokens, reset, base, layout, and components. |
| `--app` / `--no-app` | Include or exclude optional app/site defaults during init. |
| `--responsive-variants` | Enable migration support for `sm:`/`lg:` classes. |
| `--no-scripts` | Do not update `package.json`. |
| `--force` | Overwrite init-managed files. |

## add app

Add the optional app/site defaults import to an existing CSS entry.

```bash
pnpm exec synced-fluid add app --file src/synced-fluid.css
```

If `--file` is omitted, the CLI looks for the CSS entry created by `init`.

## build

Generate project utility CSS.

```bash
pnpm exec synced-fluid build
pnpm exec synced-fluid build --check
```

Use `--check` in CI to fail when the generated file is stale.

Generated CSS only includes source-scanned utility classes, configured theme
overrides, and keyframes needed by scanned animation classes.

## watch

Run `build`, then rebuild when configured scan files change.

```bash
pnpm exec synced-fluid watch
```

`watch` uses the same config and options as `build`. It is a small development
loop helper and does not add a bundler or runtime dependency.

## lint

Scan configured source files and report unsupported class tokens with nearest
public Synced Fluid alternatives.

```bash
pnpm exec synced-fluid lint
```

Use this before handoff when an AI agent or template generator has composed
markup. It catches misspelled generated utilities such as `text-prmary` and
unknown `sf-*` classes such as `sf-buton`.

## doctor

Inspect project setup.

```bash
pnpm exec synced-fluid doctor
pnpm exec synced-fluid validate
```

Checks include package installation, package scripts, config, generated CSS,
core stylesheet import, lint status, theme shape, duplicate core imports,
ad hoc token overrides, Tailwind residue, and whether strict fluid mode is on.

`validate` is an alias for `doctor`.

## tokens

Print supported tokens, presets, and starter classes.

```bash
pnpm exec synced-fluid tokens
pnpm exec synced-fluid tokens --json
```

Use `--json` when an AI agent or generator needs a machine-readable map.

## catalog

Print the public API catalog: CSS files, commands, tokens, classes, native
component patterns, recipes, and guardrails.

```bash
pnpm exec synced-fluid catalog
pnpm exec synced-fluid catalog --json
```

Use `catalog --json` when an AI agent needs to choose the right recipe or class
surface before writing markup.

## suggest

Return matching recipes and classes for a short site or section brief.

```bash
pnpm exec synced-fluid suggest "full page scroll portfolio"
pnpm exec synced-fluid suggest "native drawer menu and contact form" --json
```

JSON output includes matching section patterns and full-page recipes. Use the
recipe id with `recipe` when an agent needs copy-ready markup.

## recipe

List or print page-level recipes.

```bash
pnpm exec synced-fluid recipe
pnpm exec synced-fluid recipe saas-landing
pnpm exec synced-fluid recipe portfolio-scroll --markup
pnpm exec synced-fluid recipe portfolio-scroll --framework next --markup
pnpm exec synced-fluid recipe --section hero --framework astro --markup
pnpm exec synced-fluid recipe coming-soon --json
```

Current recipes include SaaS landing, scroll portfolio, agency homepage, blog
index, article page, about timeline, team grid, contact page, 404, and coming
soon. Recipes are composed from public `sf-*` classes and are intended as
copy-paste starting points rather than new utility APIs.

Use `--framework html`, `--framework next`, `--framework react`, or
`--framework astro` to adapt markup. Use `--section <id-or-keyword>` to print a
single section pattern such as `hero`, `scroll`, `tabs`, or `form`.

## theme

Create or validate theme tokens without scattering brand decisions through page
CSS.

```bash
pnpm exec synced-fluid theme init --from brief.md
pnpm exec synced-fluid theme init --from brief.md --json
pnpm exec synced-fluid theme validate
```

`theme init --from` reads a simple brief for radius, fonts, colours, card style,
and density, then prints a validated `theme` block for
`synced-fluid.config.mjs`. `theme validate` checks the configured theme shape.
