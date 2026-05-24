# AI Usage Guide

Use this when an AI agent is building or editing a project with Synced Fluid.

For Codex-style skill loaders, use the repo-shipped skill at
[`skills/synced-fluid/SKILL.md`](../skills/synced-fluid/SKILL.md).

## First Moves

1. Install the package.
2. Run `synced-fluid init --preset <framework>`.
3. Import the generated CSS entry once.
4. Run `synced-fluid tokens --json` before choosing class names.
5. Run `synced-fluid doctor` before finishing.

## Styling Rules

- Prefer `sf-container`, `sf-section`, `sf-stack`, `sf-cluster`, `sf-auto-grid`,
  `sf-split`, and `sf-sidebar` before writing custom layout CSS.
- Use semantic colours: `bg-background`, `text-foreground`, `bg-primary`,
  `text-primary-foreground`, `border-border`, `bg-surface`.
- Use `sf-button`, `sf-card`, `sf-badge`, `sf-field`, and `sf-input` for common UI.
- Keep browser affordances unless the UI intentionally replaces them: body
  links stay underlined, content lists keep markers, and focus states remain
  visible.
- Use `@synced/fluid/app.css` for common app/site defaults when raw links should
  not be underlined and menu lists should not show bullets. Add it with
  `synced-fluid add app` if a project was initialised without it.
- Use `sr-only` / `not-sr-only`, `sf-skip-link`, `sf-focus-ring`,
  `sf-touch-target`, `sf-list-reset`, `sf-link`, and `sf-link-plain` for
  accessibility and UI affordance work.
- Use theme presets or config `theme` overrides for brand choices.
- Keep class names complete in source files. Do not build classes from fragments.
- Use `safelist` only when dynamic classes are unavoidable.
- Do not enable `responsiveVariants` in new projects.

## Good Starter Shape

```html
<main class="sf-section">
  <section class="sf-container sf-stack">
    <p class="sf-kicker">Practical systems</p>
    <h1 class="sf-text-display">Fluid from the first screen.</h1>
    <p class="sf-text-lead sf-prose">Use tokens and primitives before one-off CSS.</p>
    <div class="sf-cluster">
      <a class="sf-button sf-button--default" href="/contact">Start discovery</a>
      <a class="sf-button sf-button--outline" href="/docs">Read docs</a>
    </div>
  </section>
</main>
```

## Finish Checklist

```bash
pnpm fluid:build
pnpm fluid:check
pnpm fluid:doctor
```

If `doctor` warns about stale CSS, run `pnpm fluid:build`.
