# Contributing

Thanks for considering a contribution to Synced Flow.

Synced Flow is an open-source fluid CSS design system maintained by SyncedCo.
The core project includes the CSS library, CLI, WordPress preset, examples, and
documentation.

## Local Setup

```bash
pnpm install --ignore-scripts
pnpm build:types
pnpm check:generated
pnpm exec playwright install chromium
```

Lifecycle scripts rebuild tracked CSS, so install with `--ignore-scripts` when
reviewing a checkout. `check:generated` verifies package CSS and the tracked
plain HTML, Vite, Next, Astro, and WordPress outputs before a build can refresh
them.

Useful commands:

```bash
pnpm check
pnpm test
pnpm test:browser
pnpm test:browser:all
pnpm pack --dry-run
```

## Contribution Guidelines

- Keep changes focused and easy to review.
- Prefer modern CSS features already used by the project: cascade layers,
  custom properties, logical properties, `clamp()`, OKLCH colour, and
  container-aware layout.
- Keep new APIs small and documented.
- Add or update tests for CLI, package, or generated CSS behaviour.
- Use complete class names in docs and examples so the scanner can find them.
- Avoid positioning Synced Flow as a Tailwind copy or one-for-one replacement;
  Tailwind references should only support migration from existing projects.
- Use British English in documentation.

## Before Opening A Pull Request

Run:

```bash
pnpm check:generated
pnpm check
pnpm test
pnpm test:browser
pnpm pack --dry-run
```

Install all release browsers with
`pnpm exec playwright install chromium firefox webkit` before running
`pnpm test:browser:all`. Pull requests and `main` run Chromium in CI; version
tags must pass Chromium, Firefox, and WebKit before npm publishing can start.

## Commercial Work

Commercial services, premium templates, hosted tools, and paid starter kits are
optional work around the open-source core. They are not part of this package
unless explicitly released here.
