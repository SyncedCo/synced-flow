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
| `--responsive-variants` | Enable migration support for `sm:`/`lg:` classes. |
| `--no-scripts` | Do not update `package.json`. |
| `--force` | Overwrite init-managed files. |

## build

Generate project utility CSS.

```bash
pnpm exec synced-fluid build
pnpm exec synced-fluid build --check
```

Use `--check` in CI to fail when the generated file is stale.

Generated CSS only includes source-scanned utility classes, configured theme
overrides, and keyframes needed by scanned animation classes.

## doctor

Inspect project setup.

```bash
pnpm exec synced-fluid doctor
pnpm exec synced-fluid validate
```

Checks include package installation, package scripts, config, generated CSS,
core stylesheet import, Tailwind residue, and whether strict fluid mode is on.

`validate` is an alias for `doctor`.

## tokens

Print supported tokens, presets, and starter classes.

```bash
pnpm exec synced-fluid tokens
pnpm exec synced-fluid tokens --json
```

Use `--json` when an AI agent or generator needs a machine-readable map.
