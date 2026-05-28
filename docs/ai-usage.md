# AI Agent Setup And Usage

Use this when an AI agent is building or editing a project with Synced Fluid.

Synced Fluid ships a skill at
[`skills/synced-fluid/SKILL.md`](../skills/synced-fluid/SKILL.md). In a
consumer project, make it discoverable with project-level guidance:

```bash
pnpm exec synced-fluid agents install
pnpm exec synced-fluid agents status
pnpm exec synced-fluid skill
```

Use `agents install --target all` to add project-local guidance for Cursor,
Codex-style agents, Claude, Copilot, Windsurf, Gemini, and Aider where those
tools have clear project conventions.

## First Moves

1. Install the package.
2. Run `synced-fluid init --preset <framework> --agents`.
3. Ask for a short theme brief: radius, fonts, primary colour, accent colour,
   surface style, and density.
4. Convert that brief into `synced-fluid.config.mjs` theme tokens.
5. Import the generated CSS entry once.
6. Run `synced-fluid catalog --json` before choosing recipes and classes.
7. Run `synced-fluid pattern --list` before hand-rolling interaction markup.
8. Run `synced-fluid lint --json` and `synced-fluid doctor` before finishing.

Good theme prompt:

```text
Use the Synced Fluid skill. Build a theme config for a modern B2B website:
soft but not pill-shaped radius, system sans UI, editorial display headings,
blue primary, green accent, light raised cards, and spacious sections.
Return only the Synced Fluid config theme object.
```

For a file-based workflow, put the answers in `brief.md` and run:

```bash
pnpm exec synced-fluid theme init --from brief.md
pnpm exec synced-fluid theme init --from brief.md --preset-base neutral-saas
```

If the output includes warnings, ask the user for the missing brand decisions
before finalising the theme.

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
- Put repeated brand decisions in theme tokens before adding custom CSS.
- Use `synced-fluid suggest "<brief>"` to choose section recipes before adding
  new one-off patterns.
- Use `synced-fluid suggest "<brief>" --scaffold --framework <target> --dry-run`
  when starting a page or project from a brief.
- Use `synced-fluid pattern <id> --markup` for complete native interaction
  patterns such as mobile drawers, scroll sections, popover drawers, and native
  dialogs.
- Use `synced-fluid recipe <id> --markup` to get copy-ready page sections for
  SaaS, portfolio, agency, blog, article, about, team, contact, 404, and coming
  soon pages.
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
pnpm exec synced-fluid lint --json
pnpm fluid:doctor
```

If `doctor` warns about stale CSS, run `pnpm fluid:build`.
