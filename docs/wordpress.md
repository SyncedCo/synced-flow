# WordPress

Synced Fluid can be used in WordPress themes and plugins without asking
WordPress to resolve npm CSS imports in the browser.

## Setup

```bash
pnpm add @synced/fluid
pnpm exec synced-fluid init --preset wordpress
pnpm fluid:build
```

The WordPress preset:

- scans `templates`, `parts`, `patterns`, `blocks`, `inc`, `includes`, `src`,
  and `assets` when those folders exist
- scans PHP, HTML, JS, TS, JSX, TSX, Twig, Vue, Svelte, Astro, and MDX files
- enables `includeCore`
- writes `assets/css/synced-fluid.css`

See [`examples/wordpress`](../examples/wordpress) for a lean block theme style
template with `theme.json`, template parts, PHP patterns, enqueue code, and an
enqueue-ready generated CSS output.

## Example Structure

```text
examples/wordpress/
  functions.php
  theme.json
  synced-fluid.config.mjs
  assets/css/synced-fluid.css
  parts/header.html
  parts/footer.html
  templates/front-page.html
  templates/index.html
  patterns/landing-hero.php
  patterns/feature-grid.php
  patterns/contact-cta.php
```

## Enqueue

```php
wp_enqueue_style(
  'synced-fluid',
  get_theme_file_uri('assets/css/synced-fluid.css'),
  [],
  wp_get_theme()->get('Version')
);
```

For plugins, use `plugins_url()` or `plugin_dir_url()` instead of
`get_theme_file_uri()`.

## Dynamic Classes

Synced Fluid generates utility CSS from complete class tokens. Keep class names
complete in PHP and templates.

```php
<section class="sf-section text-primary">
```

When a class is composed dynamically, add the full class to `safelist`.
