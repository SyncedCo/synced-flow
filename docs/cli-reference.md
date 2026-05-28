# CLI Reference

## init

Scaffold Synced Flow into a project.

```bash
pnpm exec synced-flow init --preset next
```

Options:

| Option | Purpose |
| --- | --- |
| `--preset next` | Next.js app or pages project. |
| `--preset vite` | Vite React project. |
| `--preset astro` | Astro project. |
| `--preset wordpress` | WordPress theme or plugin with enqueue-ready CSS output. |
| `--preset plain` | Plain HTML/CSS project. |
| `--agents <target>` | Install project-level AI guidance after init. Omit the value for `universal`. |
| `--theme <name>` | Use `synced`, `neutral-saas`, `editorial`, or `dark-app`. |
| `--scan <dir>` | Add source directories. |
| `--out <file>` | Choose generated CSS output path. |
| `--safelist <classes>` | Add always-generated classes. |
| `--include-core` | Write a single CSS output that includes tokens, reset, base, layout, and components. |
| `--app` / `--no-app` | Include or exclude optional app/site defaults during init. |
| `--responsive-variants` | Enable migration support for `sm:`/`lg:` classes. |
| `--no-scripts` | Do not update `package.json`. |
| `--force` | Overwrite init-managed files. |

## agents

Install or inspect project-level AI guidance.

```bash
pnpm exec synced-flow agents install
pnpm exec synced-flow agents install --target all
pnpm exec synced-flow agents install --target cursor --dry-run
pnpm exec synced-flow agents status
```

Targets are `universal`, `cursor`, `codex`, `claude`, `copilot`, `windsurf`,
`gemini`, `aider`, and `all`. The default target is `universal`, which writes a
managed Synced Flow section to `AGENTS.md`. Tool-specific targets add
project-local instruction or skill files where the tool supports them.

Use `--force` to refresh managed guidance and `--dry-run` to preview writes.

## skill

Print the packaged Synced Flow skill location and the project setup commands.

```bash
pnpm exec synced-flow skill
```

## add app

Add the optional app/site defaults import to an existing CSS entry.

```bash
pnpm exec synced-flow add app --file src/synced-flow.css
```

If `--file` is omitted, the CLI looks for the CSS entry created by `init`.

## build

Generate project utility CSS.

```bash
pnpm exec synced-flow build
pnpm exec synced-flow build --check
```

Use `--check` in CI to fail when the generated file is stale.

Generated CSS only includes source-scanned utility classes, configured theme
overrides, and keyframes needed by scanned animation classes.

## watch

Run `build`, then rebuild when configured scan files change.

```bash
pnpm exec synced-flow watch
```

`watch` uses the same config and options as `build`. It is a small development
loop helper and does not add a bundler or runtime dependency.

## lint

Scan configured source files and report unsupported class tokens with nearest
public Synced Flow alternatives. It also reports composition warnings for
common AI-generated structural mistakes.

```bash
pnpm exec synced-flow lint
pnpm exec synced-flow lint --json
pnpm exec synced-flow lint --json src components
```

Use this before handoff when an AI agent or template generator has composed
markup. It catches misspelled generated utilities such as `text-prmary` and
unknown `sf-*` classes such as `sf-buton`.

Composition rules include `popover-missing-close`, `mobile-nav-incomplete`,
`dynamic-class-fragment`, `invalid-popover-on-anchor`,
`theme-override-in-css`, and `unknown-generated-utility`. JSON output returns
`ok` and an `issues[]` array with `rule`, `severity`, `file`, `line`,
`message`, and `fix`. `--fix` is accepted for forward compatibility; current
composition rules provide guided fixes rather than rewriting source.

## doctor

Inspect project setup.

```bash
pnpm exec synced-flow doctor
pnpm exec synced-flow validate
```

Checks include package installation, package scripts, config, generated CSS,
core stylesheet import, lint status, theme shape, duplicate core imports,
ad hoc token overrides, Tailwind residue, AI agent guidance, and whether strict
fluid mode is on.

`validate` is an alias for `doctor`.

## tokens

Print supported tokens, presets, and starter classes.

```bash
pnpm exec synced-flow tokens
pnpm exec synced-flow tokens --json
```

Use `--json` when an AI agent or generator needs a machine-readable map.

## catalog

Print the public API catalog: CSS files, commands, tokens, classes, native
component patterns, recipes, and guardrails.

```bash
pnpm exec synced-flow catalog
pnpm exec synced-flow catalog --json
```

Use `catalog --json` when an AI agent needs to choose the right recipe or class
surface before writing markup.

## suggest

Return matching recipes and classes for a short site or section brief.

```bash
pnpm exec synced-flow suggest "full page scroll portfolio"
pnpm exec synced-flow suggest "native drawer menu and contact form" --json
pnpm exec synced-flow suggest "scroll portfolio" --scaffold --framework next --dry-run
```

JSON output includes matching section patterns and full-page recipes. Use the
recipe id with `recipe` when an agent needs copy-ready markup.

With `--scaffold`, Synced Flow prints or writes a minimal starter for
`next`, `vite`, `astro`, or `plain`. Use `--out <dir>` to choose the project
directory, `--dry-run` to print the file tree and contents, and `--force` to
overwrite scaffold-managed files.

## pattern

List or print copy-ready interaction patterns.

```bash
pnpm exec synced-flow pattern --list
pnpm exec synced-flow pattern mobile-nav-drawer --framework next --markup
pnpm exec synced-flow pattern scroll-viewport-sections --json
```

Current interaction patterns include `mobile-nav-drawer`,
`scroll-viewport-sections`, `scroll-viewport-with-spy`,
`native-dialog-react`, and `popover-drawer-layout`. Pattern JSON includes
classes, framework markup, JS requirement notes, accessibility notes, and
implementation gotchas.

## recipe

List or print page-level recipes.

```bash
pnpm exec synced-flow recipe
pnpm exec synced-flow recipe saas-landing
pnpm exec synced-flow recipe portfolio-scroll --markup
pnpm exec synced-flow recipe portfolio-scroll --framework next --markup
pnpm exec synced-flow recipe --section hero --framework astro --markup
pnpm exec synced-flow recipe coming-soon --json
```

Current recipes include SaaS landing, scroll portfolio, agency homepage, blog
index, article page, about timeline, team grid, contact page, 404, coming soon,
and SaaS dashboard. Use `saas-landing` for public product marketing and
`saas-dashboard` for authenticated app UI with account state, metrics, tables,
and workspace navigation. Recipes are composed from public `sf-*` classes and
are intended as copy-paste starting points rather than new utility APIs.

Use `--framework html`, `--framework next`, `--framework react`, or
`--framework astro` to adapt markup. Use `--section <id-or-keyword>` to print a
single section pattern such as `hero`, `scroll`, `tabs`, or `form`.

## theme

Create or validate theme tokens without scattering brand decisions through page
CSS.

```bash
pnpm exec synced-flow theme init --from brief.md
pnpm exec synced-flow theme init --from brief.md --preset-base neutral-saas
pnpm exec synced-flow theme init --from brief.md --json
pnpm exec synced-flow theme validate
```

`theme init --from` reads a simple brief for radius, fonts, colours, card style,
and density, then prints a validated `theme` block for
`synced-flow.config.mjs`. `theme validate` checks the configured theme shape.
Use `--preset-base synced`, `--preset-base neutral-saas`,
`--preset-base editorial`, or `--preset-base dark-app` to inherit a starting
preset before applying brief-derived overrides.
