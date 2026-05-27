# Native Components

Synced Fluid styles modern browser primitives instead of shipping JavaScript
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

Synced Fluid sets `color-scheme` for native controls, forms, dialogs, and
popover-backed UI. Projects can toggle the attribute however they like; the
package does not ship a JavaScript theme switcher.

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
    <p>Yes. Override Synced Fluid tokens before adding custom CSS.</p>
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
- Synced Fluid provides styling and state hooks; it does not polyfill browser
  APIs.
- Prefer `dialog`, `popover`, `details`, scroll snap, `:popover-open`,
  `::backdrop`, `:has()`, `color-scheme`, and anchor positioning before custom
  JavaScript.
