# Accessibility CSS

Synced Flow does not run accessibility audits. It provides CSS affordances so
semantic HTML and ARIA states are visible, consistent, and easy to compose.

## Principles

- Prefer native elements first: `button`, `a[href]`, `label`, `input`,
  `select`, `textarea`, `details`, `summary`, `nav`, `main`, `section`, and
  `footer`.
- Use ARIA only when native semantics do not express the state.
- Keep accessible names and descriptions in markup; Synced Flow styles the
  visible states.
- Use project-level accessibility testing in the consuming app.

## Built-In Affordances

| Hook | Styled behavior |
| --- | --- |
| `:focus-visible` | Visible outline using `--sf-colour-ring`, with forced-colors support. |
| `:target` | Scroll margin for skip links and anchor navigation. |
| `.sf-skip-link` | Keyboard-visible skip link. |
| `.sf-visually-hidden`, `.sr-only` | Visually hidden text that remains available to assistive tech. |
| `.sf-touch-target` | Minimum interactive target sizing. |
| `[aria-current="page"]`, `[aria-current="true"]` | Current nav/link state. |
| `[aria-expanded="true"]`, `[aria-pressed="true"]`, `[aria-selected="true"]`, `[data-state="open"]` | Active disclosure/toggle/selection state for buttons and nav links. |
| `[aria-disabled="true"]`, `:disabled` | Disabled affordance for buttons, links, cards, and form controls. |
| `[aria-busy="true"]`, `[data-loading="true"]` | Busy/loading affordance for buttons and form controls. |
| `.sf-field[data-invalid="true"]`, `[aria-invalid="true"]` | Invalid field styling. |
| `.sf-required`, `.sf-label[aria-required="true"]`, `label:has(+ :required)` | Required-field marker styling. |
| `@media (forced-colors: active)` | High contrast mode border, focus, and button fallbacks. |

## Forms

Pair visible help and error text with `aria-describedby`. Use
`aria-invalid="true"` only when a field is currently invalid.

```html
<div class="sf-field" data-invalid="true">
  <label class="sf-required" for="email">Email</label>
  <input
    class="sf-input"
    id="email"
    name="email"
    type="email"
    required
    aria-invalid="true"
    aria-describedby="email-help email-error"
  />
  <p class="sf-help" id="email-help">Use a work email address.</p>
  <p class="sf-error" id="email-error">Enter a valid email address.</p>
</div>
```

Use `disabled` for native disabled controls. Use `aria-disabled="true"` only
when an element cannot use the native `disabled` attribute, such as an anchor
that is visually present but intentionally unavailable.

## Navigation And Disclosure

Use `aria-current="page"` for the current page link.

```html
<nav class="sf-nav" aria-label="Primary">
  <ul class="sf-nav__list">
    <li><a class="sf-nav__link" href="/" aria-current="page">Home</a></li>
    <li><a class="sf-nav__link" href="/pricing">Pricing</a></li>
  </ul>
</nav>
```

Use native `details`/`summary` for FAQ and simple disclosure content.

```html
<details class="sf-faq__item">
  <summary>Can I customize the theme?</summary>
  <p>Yes. Override semantic tokens before adding custom CSS.</p>
</details>
```

For JavaScript-powered menus or toggles, use real buttons and update
`aria-expanded`, `aria-pressed`, or `aria-selected` as appropriate. Synced Flow
styles those states for `.sf-button` and `.sf-nav__link`.

For native dialog, popover, drawer, tooltip, tabs, and disclosure markup, see
[Native Components](native-components.md). Synced Flow styles those browser
primitives but does not ship JavaScript components.

## Alerts And Status

Synced Flow alert variants are visual styles. Choose the live-region behavior
in markup:

```html
<div class="sf-alert sf-alert--success" role="status">
  <p class="sf-alert__title">Saved</p>
  <p>Your changes were saved.</p>
</div>

<div class="sf-alert sf-alert--danger" role="alert">
  <p class="sf-alert__title">Payment failed</p>
  <p>Check the card details and try again.</p>
</div>
```

Use `role="status"` for polite updates. Use `role="alert"` only for urgent
messages that need immediate announcement.

## Busy And Loading States

When an action is in progress, keep the accessible name visible and add state:

```html
<button class="sf-button" type="button" aria-busy="true">
  Saving
</button>
```

Synced Flow styles this as a busy state, but the consuming app should still
manage focus, state changes, and completion messaging.

## Confidence Checklist

Use this when changing the CSS system or examples:

- Navigate the demo with keyboard only.
- Confirm focus is visible on links, buttons, form controls, summaries, and the
  skip link.
- Confirm invalid, required, disabled, busy, current, expanded, selected, and
  pressed states remain visible when those states are present in markup.
- Confirm `details`/`summary` works without JavaScript.
- Confirm forced-colors styles do not depend only on subtle background colour.
- Confirm examples use native elements before ARIA.
