# Native Components

Synced Flow styles modern browser primitives instead of shipping JavaScript
components. These patterns are progressive enhancements: use the native markup
first, then add tiny project or example JavaScript only where state sync is
needed.

## Theme Control

Use explicit theme selectors when a project owns theme state.

```html
<html data-sf-theme="light">
<html data-sf-theme="dark">
```

The matching class selectors are also supported:

```html
<body class="sf-theme-light">
<body class="sf-theme-dark">
```

Synced Flow sets `color-scheme` for native controls, forms, dialogs, and
popover-backed UI. Projects can toggle the attribute however they like; the
package does not ship a JavaScript theme switcher.

## Switches And Segmented Choices

Use `sf-switch` only for a strict binary setting. The native checkbox owns the
checked, keyboard, disabled, and form states. Keep the visible label unchanged
when the value changes, and do not use `indeterminate` or `aria-checked="mixed"`
for this pattern.

```html
<label class="sf-switch">
  <input type="checkbox" role="switch" name="notifications" checked>
  <span class="sf-switch__control" aria-hidden="true"></span>
  <span class="sf-switch__label">Email notifications</span>
</label>
```

Checkboxes do not have a native read-only state. Use `disabled` when a setting
is unavailable. If a product needs a focusable but non-editable explanation,
the app must implement and test that behavior rather than adding `readonly` to
the checkbox.

State mapping is deliberately small: omit `checked` for off, add `checked` for
on, rely on native `:focus-visible` for keyboard focus, and add `disabled` to
the input when unavailable. The visible label must stay the same in every
state.

Use the radio-backed segmented control for one choice from a small set. It is a
form control, not a tab list and not a group of independent switches.

```html
<fieldset class="sf-fieldset">
  <legend>Billing cycle</legend>
  <div class="sf-segmented-control">
    <label class="sf-segmented-control__option">
      <input type="radio" name="cycle" value="monthly" checked>
      <span class="sf-segmented-control__label">Monthly</span>
    </label>
    <label class="sf-segmented-control__option">
      <input type="radio" name="cycle" value="annual">
      <span class="sf-segmented-control__label">Annual</span>
    </label>
  </div>
</fieldset>
```

Both controls include light/dark token behavior, visible keyboard focus,
disabled styling, forced-colors fallbacks, and reduced-motion handling.

## Input Groups, File Inputs, And Range Inputs

`sf-input-group` composes one flexible input with leading/trailing content or
an inline action. Prefixes that repeat visible label context should be hidden
from assistive technology. Use `sf-search` for a normal search field.

```html
<label class="sf-field">
  <span class="sf-label">Monthly budget</span>
  <span class="sf-input-group">
    <span class="sf-input-group__leading" aria-hidden="true">£</span>
    <input class="sf-input" name="budget" inputmode="decimal">
    <span class="sf-input-group__trailing" aria-hidden="true">GBP</span>
  </span>
</label>
```

Use `sf-file-input` and `sf-range` on their native input types. File previews,
upload limits, live range output, and persistence belong to the app.

```html
<label class="sf-field">
  <span class="sf-label">Supporting document</span>
  <input class="sf-file-input" type="file" accept=".pdf,.doc,.docx">
  <span class="sf-help">PDF or Word, up to 10 MB.</span>
</label>

<label class="sf-field">
  <span class="sf-label">Team size: <output for="team-size">12</output></span>
  <input class="sf-range" id="team-size" type="range" min="1" max="50" value="12">
</label>
```

## Loading Buttons

`sf-spinner` is a presentational indicator. A pending action must also expose a
text status and use app state to prevent duplicate submission.

```html
<button class="sf-button" type="submit" aria-busy="true" aria-disabled="true">
  <span class="sf-spinner" aria-hidden="true"></span>
  <span>Saving…</span>
</button>
<p class="sr-only" role="status" aria-live="polite">Saving changes</p>
```

The spinner stops rotating under reduced motion while remaining visible.
`aria-disabled` keeps an in-flight button in the focus order, but the app must
prevent click and submit activation while it is set. Use native `disabled`
instead when removing the action from the focus order is the better tradeoff.

## App-Owned Interactive Shells

Synced Flow includes presentation classes for searchable selects, selection
toolbars, complete pagination, and multi-step forms. The copy-ready contracts
live in the CLI:

```bash
pnpm exec synced-flow pattern searchable-select --markup
pnpm exec synced-flow pattern bulk-actions-toolbar --markup
pnpm exec synced-flow pattern complete-pagination --markup
pnpm exec synced-flow pattern multi-step-form --markup
```

The combobox shell does not implement filtering or keyboard behavior. The app
must synchronize `aria-expanded`, `aria-controls`, `aria-activedescendant`, and
`aria-selected`, and test the complete interaction with keyboard and assistive
technology. Bulk selection, client-side pagination state, step validation,
focus movement, persistence, and history are also app-owned.

For a completed wizard step, include hidden text such as
`<span class="sr-only">Completed: </span>` before the visible label. The tick
or marker may remain `aria-hidden`; completion must still be available as text.

## Dialog

Use `<dialog>` for modal UI. Style the dialog with `sf-dialog` and structure it
with the header/body/footer classes.

```html
<button class="sf-button" commandfor="settings-dialog" command="show-modal">
  Open settings
</button>

<dialog class="sf-dialog" id="settings-dialog" aria-labelledby="settings-title">
  <header class="sf-dialog__header">
    <h2 id="settings-title">Settings</h2>
    <button class="sf-button sf-button--ghost" commandfor="settings-dialog" command="close">Close</button>
  </header>
  <div class="sf-dialog__body">
    <p class="sf-prose">Use native dialog behavior for focus and Escape handling where supported.</p>
  </div>
  <footer class="sf-dialog__footer">
    <button class="sf-button" commandfor="settings-dialog" command="close">Done</button>
  </footer>
</dialog>
```

If the target browser does not support invoker commands yet, use a small project
script to call `showModal()` and `close()`.

## Popover, Tooltip, Drawer, Toast, And Banner

Use the Popover API for non-modal overlays.

```html
<button class="sf-button" popovertarget="site-menu">Menu</button>

<nav class="sf-drawer sf-drawer--right" id="site-menu" popover aria-label="Mobile">
  <a class="sf-nav__link" href="/work">Work</a>
  <a class="sf-nav__link" href="/contact">Contact</a>
</nav>
```

Tooltips should keep the accessible description in markup. Native
`interestfor` support is progressive, so pair the trigger with visible or
described text when the content is important.

```html
<button class="sf-tooltip-trigger" interestfor="save-tip" aria-describedby="save-tip">
  Save
</button>
<p class="sf-tooltip" id="save-tip" popover="hint">Saves your current draft.</p>
```

Use `sf-toast` and `sf-banner` for popover-backed announcements or feedback.

## Disclosure And Accordions

Use native `details` and `summary`. Give related details the same `name` value
for an exclusive accordion in supporting browsers.

```html
<div class="sf-accordion">
  <details name="pricing">
    <summary>Can I customize the theme?</summary>
    <p>Yes. Override Synced Flow tokens before adding custom CSS.</p>
  </details>
  <details name="pricing">
    <summary>Does this need JavaScript?</summary>
    <p>No for basic disclosure. The browser owns the open state.</p>
  </details>
</div>
```

## Tabs

Tabs can be styled with `sf-tabs`, `sf-tab-list`, `sf-tab`, and `sf-tab-panel`.
For fully accessible keyboard behavior and ARIA state sync, use a tiny
project-level script. For simple CSS-only panels, radio inputs can control
panels without package JavaScript.

```html
<section class="sf-tabs">
  <div class="sf-tab-list" role="tablist" aria-label="Plans">
    <button class="sf-tab" role="tab" aria-selected="true">Starter</button>
    <button class="sf-tab" role="tab" aria-selected="false">Team</button>
  </div>
  <div class="sf-tab-panel" role="tabpanel">Starter plan content.</div>
</section>
```

## Navigation

Use `sf-nav--mobile` with a popover drawer for mobile navigation. Use
`sf-breadcrumb` and `sf-pagination` for common content navigation.

```html
<nav class="sf-breadcrumb" aria-label="Breadcrumb">
  <ol class="sf-breadcrumb">
    <li><a href="/">Home</a></li>
    <li><a href="/docs">Docs</a></li>
    <li aria-current="page">Native components</li>
  </ol>
</nav>
```

## Native Date And Time Inputs

Use browser-native inputs for simple date, time, month, week, and datetime
fields. Synced Flow styles the control shell with `sf-input`; validation,
range rules, and custom scheduling behavior belong to the app.

```html
<form class="sf-filter-bar" action="/app/reports" method="get">
  <label class="sf-field">
    <span class="sf-label">From</span>
    <input class="sf-input" name="from" type="date">
  </label>
  <label class="sf-field">
    <span class="sf-label">To</span>
    <input class="sf-input" name="to" type="date">
  </label>
  <button class="sf-button" type="submit">Apply</button>
</form>
```

## Scroll And Sticky

Use CSS scroll snap and sticky positioning for full-page sections and sticky
headers.

```html
<main class="sf-scroll-viewport" data-snap="mandatory">
  <section class="sf-scroll-panel">
    <div class="sf-container sf-stack">
      <h1>First panel</h1>
      <p class="sf-prose">Each panel snaps to the viewport.</p>
    </div>
  </section>
  <section class="sf-scroll-panel">...</section>
</main>
```

## Progressive Enhancement Notes

- Popover API, invoker commands, interest invokers, and anchor positioning are
  modern browser features. Use fallback-safe markup when content is critical.
- Synced Flow provides styling and state hooks; it does not polyfill browser
  APIs.
- Prefer `dialog`, `popover`, `details`, scroll snap, `:popover-open`,
  `::backdrop`, `:has()`, `color-scheme`, and anchor positioning before custom
  JavaScript.
