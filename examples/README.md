# Examples

These examples show the intended starting point for new projects.

- `next` - Next.js App Router setup
- `vite` - Vite React setup
- `plain-html` - no framework setup
- WordPress is supported through `synced-fluid init --preset wordpress`, which
  emits an enqueue-ready CSS file rather than relying on npm CSS imports at
  runtime.

Each example uses `synced-fluid.config.mjs`, imports a single CSS entry file,
and keeps `responsiveVariants` off.
