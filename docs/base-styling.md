# Base Styling Decisions

Synced Fluid uses a conservative reset and modern base layer. The goal is to
make new projects consistent without hiding important browser affordances.

## What Stays Native

- Links stay visibly underlined by default.
- `ul` and `ol` keep their markers by default.
- Form controls inherit project typography but keep their native semantics.
- Focus styles are visible through `:focus-visible`.
- Headings, code, blockquotes, horizontal rules, and selection states get
  token-based defaults without removing their native meaning.

## Optional App Defaults

Most app and marketing-site interfaces do not want raw link underlines in
navigation, or bullets on menu lists. Add the optional app layer for those
project-wide UI defaults:

```css
@import "@synced/fluid/app.css";
```

You can also add it later with the CLI:

```bash
pnpm exec synced-fluid add app --file src/synced-fluid.css
```

`app.css` removes raw link underlines, resets `ol`/`ul`/`menu` markers and start
padding, and strips basic button/fieldset chrome. Use `sf-link`, `sf-list-disc`,
`sf-list-decimal`, or `sf-prose` where content needs visible semantics again.

Use opt-in utilities when a component needs a different treatment:

```html
<nav aria-label="Primary">
  <ul class="sf-list-reset sf-cluster">
    <li><a class="sf-link-plain" href="/">Home</a></li>
    <li><a class="sf-link-plain" href="/docs">Docs</a></li>
  </ul>
</nav>
```

## Accessibility Utilities

```html
<a class="sf-skip-link" href="#main">Skip to main content</a>
<span class="sr-only">Opens in a new tab</span>
<button class="sf-touch-target sf-focus-ring">Save</button>
```

Available helpers:

- `sr-only` / `sf-visually-hidden`
- `not-sr-only` / `sf-not-visually-hidden`
- `sf-skip-link`
- `sf-focus-ring`
- `sf-focus-ring-inset`
- `sf-touch-target`

## Link Utilities

- `sf-link` for primary inline links.
- `sf-link-subtle` for inherited-colour inline links.
- `sf-link-plain` for navigation, buttons, cards, and other UI where the
  element has another clear affordance.

Body and prose links should normally stay visibly identifiable.

## Forms And UI Components

The base layer keeps native form semantics, while component classes provide
ready-to-use styling:

```html
<form class="sf-form">
  <div class="sf-field">
    <label for="email">Email</label>
    <input class="sf-input" id="email" type="email" />
    <p class="sf-help">We only use this for project updates.</p>
  </div>
  <button class="sf-button" type="submit">Send</button>
</form>
```

Use `sf-input`, `sf-select`, `sf-textarea`, `sf-check`, `sf-help`, and
`sf-error` for common form needs. Use `sf-alert` variants for notices and
feedback.

Synced Fluid also styles accessible states such as `[aria-invalid="true"]`,
`[aria-disabled="true"]`, `[aria-busy="true"]`, `[aria-current="page"]`, and
required-field markers. See [Accessibility CSS](accessibility-css.md) for the
markup contract.

## List Utilities

- `sf-list-reset` removes list markers and start padding for navigation or UI
  lists.
- `sf-list-disc` restores disc markers.
- `sf-list-decimal` restores numbered markers.

Do not reset content lists just to remove browser defaults. Keep markers when
they carry meaning.

## Modern CSS Baseline

The base layer uses cascade layers, logical properties, low-specificity
`:where()` selectors, OKLCH-aware `color-mix()`, `:focus-visible`, and
`prefers-reduced-motion`. Utopia informs the fluid type, space, and grid
tokens; Synced Fluid owns the reset, accessibility helpers, and component
defaults.
