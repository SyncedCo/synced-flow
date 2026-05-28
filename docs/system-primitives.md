# System Primitives

Synced Fluid is meant to cover the common styling decisions needed for a basic
modern website before a developer reaches for project-specific CSS.

## Token Layers

Use the `--sf-*` variables as the stable CSS foundation.

| Layer | Examples | Use for |
| --- | --- | --- |
| Font | `--sf-font-sans`, `--sf-font-display`, `--sf-font-mono` | Site typography families. |
| Type | `--sf-type-body`, `--sf-type-lead`, `--sf-type-h1`, `--sf-type-display` | Fluid text sizes. |
| Space | `--sf-space-s`, `--sf-space-m-l`, `--sf-space-xl-2xl` | Fluid padding, margin, and gaps. |
| Radius | `--sf-radius-control`, `--sf-radius-panel`, `--sf-radius-full` | Controls, panels, pills. |
| Colour | `--sf-colour-background`, `--sf-colour-surface`, `--sf-colour-primary` | Semantic UI colour roles. |
| State | `--sf-colour-success`, `--sf-colour-warning`, `--sf-colour-danger`, `--sf-colour-info` | Feedback and notices. |
| Motion | `--sf-duration-fast`, `--sf-duration-normal`, `--sf-ease-standard` | Consistent transitions. |
| Component | `--sf-button-*`, `--sf-card-*`, `--sf-input-*`, `--sf-alert-*` | Reusable component defaults. |
| Accessibility | `:focus-visible`, `:target`, `[aria-invalid]`, `[aria-current]`, `[aria-expanded]`, `[aria-selected]`, `[aria-busy]`, `[aria-disabled]` | Visible native and ARIA states. |

Light and dark modes can be applied with `.sf-theme-light`,
`[data-sf-theme="light"]`, `.sf-theme-dark`, or `[data-sf-theme="dark"]`.

## Layout Classes

These classes are the first choice for page structure.

| Class | Purpose |
| --- | --- |
| `sf-container` | Fluid max-width wrapper with tokenized gutters. |
| `sf-container--narrow`, `sf-container--wide`, `sf-container--full` | Container width variants. |
| `sf-section`, `sf-section--compact`, `sf-section--spacious` | Vertical section rhythm. |
| `sf-stack`, `sf-stack--tight`, `sf-stack--loose` | Vertical spacing between children. |
| `sf-flow` | Adds block flow spacing between prose-like children. |
| `sf-cluster` | Wrapping inline groups such as actions or tags. |
| `sf-repel` | Space-between layout that wraps safely. |
| `sf-toolbar` | Dense app/page toolbar that wraps actions safely. |
| `sf-app-shell`, `sf-app-sidebar`, `sf-app-sidebar__brand`, `sf-app-main` | Product app shell with persistent sidebar and main workspace. |
| `sf-split` | Responsive two-column layout. |
| `sf-split--reverse` | Reverses split layout visual order. |
| `sf-auto-grid`, `sf-panel-grid`, `sf-metric-grid`, `sf-pipeline` | Responsive card, metric, and operational grids. |
| `sf-frame`, `sf-frame--square`, `sf-frame--portrait`, `sf-frame--wide` | Stable media aspect ratios. |
| `sf-cover`, `sf-hero` | Full-height and hero section structure. |
| `sf-scroll-viewport`, `sf-scroll-panel`, `sf-scroll-snap-y`, `sf-sticky-top`, `sf-media-object`, `sf-aside-rail` | Scroll, sticky, and intent-based layout modes. |

## Component Classes

These cover the common UI elements needed for a simple site.

| Class | Purpose |
| --- | --- |
| `sf-button` | Base button/link button. |
| `sf-button--default`, `sf-button--secondary`, `sf-button--outline`, `sf-button--ghost`, `sf-button--link`, `sf-button--destructive` | Button variants. |
| `sf-button--sm`, `sf-button--lg`, `sf-button--icon`, `sf-button--block` | Button sizing and width. |
| `sf-button-group` | Wrapped action group. |
| `sf-card`, `sf-card--flat`, `sf-card--raised`, `sf-card--interactive` | Card surfaces. |
| `sf-card__header`, `sf-card__body`, `sf-card__footer`, `sf-card__title`, `sf-card__description` | Card structure. |
| `sf-surface`, `sf-surface--alt`, `sf-surface--raised` | Generic reusable panels. |
| `sf-logo-cloud`, `sf-feature`, `sf-stats`, `sf-testimonial`, `sf-pricing-grid`, `sf-faq`, `sf-cta`, `sf-footer` | Common website patterns. |
| `sf-nav`, `sf-nav__list`, `sf-nav__link` | Navigation basics. |
| `sf-nav--mobile`, `sf-menu`, `sf-breadcrumb`, `sf-pagination` | Mobile, menu, breadcrumb, and paginated navigation. |
| `sf-dialog`, `sf-dialog__header`, `sf-dialog__body`, `sf-dialog__footer` | Native `<dialog>` styling. |
| `sf-popover`, `sf-tooltip`, `sf-tooltip-trigger`, `sf-menu-popover`, `sf-toast`, `sf-banner`, `sf-drawer` | Popover-backed native overlays. |
| `sf-disclosure`, `sf-accordion` | Native `details`/`summary` disclosure patterns. |
| `sf-tabs`, `sf-tab-list`, `sf-tab`, `sf-tab-panel` | HTML/CSS-first tab styling. |
| `sf-form`, `sf-fieldset`, `sf-field`, `sf-label`, `sf-help`, `sf-error` | Form structure and messaging. |
| `sf-input`, `sf-select`, `sf-textarea`, `sf-check` | Form controls. |
| `sf-alert`, `sf-alert--info`, `sf-alert--success`, `sf-alert--warning`, `sf-alert--danger`, `sf-alert__title` | Notices and feedback. |
| `sf-section-header`, `sf-kicker`, `sf-badge` | Common marketing/content patterns. |

## Utility Classes

Use utility classes for small decisions that do not need a new component.

| Class | Purpose |
| --- | --- |
| `sf-text-caption`, `sf-text-body`, `sf-text-lead`, `sf-text-h4`, `sf-text-h3`, `sf-text-h2`, `sf-text-h1`, `sf-text-display` | Fluid text scale. |
| `sf-text-muted`, `sf-text-subtle`, `sf-text-primary`, `sf-text-success`, `sf-text-warning`, `sf-text-danger` | Semantic text colour. |
| `sf-bg-background`, `sf-bg-surface`, `sf-bg-surface-alt`, `sf-bg-primary-soft`, `sf-bg-success-soft`, `sf-bg-warning-soft`, `sf-bg-danger-soft` | Semantic backgrounds. |
| `sf-border`, `sf-border-strong`, `sf-rounded`, `sf-rounded-panel`, `sf-rounded-full` | Border and radius helpers. |
| `sf-shadow-sm`, `sf-shadow-md`, `sf-shadow-lg`, `sf-shadow-none` | Shadow helpers. |
| `sf-push-block-end`, `sf-push-block-start`, `sf-push-inline-end`, `sf-push-inline-start` | Auto-margin positioning helpers for pushing items to an edge inside flex/grid layouts. |
| `sf-prose`, `sf-text-balance`, `sf-text-pretty` | Content width and wrapping helpers. |
| `sf-prose--blog`, `sf-prose--legal`, `sf-meta`, `sf-figure`, `sf-caption`, `sf-table-wrap` | Long-form content and article helpers. |
| `sf-link`, `sf-link-subtle`, `sf-link-plain` | Link treatments. |
| `sf-list-reset`, `sf-list-disc`, `sf-list-decimal` | List treatments. |
| `sf-skip-link`, `sf-focus-ring`, `sf-focus-ring-inset`, `sf-touch-target`, `sr-only`, `not-sr-only` | Accessibility helpers. |
| `sf-animate-fade`, `sf-animate-rise`, `sf-animate-scale`, `sf-animate-slide`, `sf-animate-stagger` | Reduced-motion-safe motion primitives. |

## Example

```html
<section class="sf-section">
  <div class="sf-container sf-split">
    <div class="sf-stack">
      <p class="sf-badge">Fluid by default</p>
      <h1 class="sf-text-display">Build from reusable CSS primitives.</h1>
      <p class="sf-text-lead sf-text-muted sf-prose">
        Start with tokens, layout classes, and components before writing custom CSS.
      </p>
      <div class="sf-button-group">
        <a class="sf-button sf-button--default" href="/contact">Start a project</a>
        <a class="sf-button sf-button--outline" href="/docs">Read docs</a>
      </div>
    </div>

    <form class="sf-surface sf-form">
      <div class="sf-field">
        <label for="email">Email</label>
        <input class="sf-input" id="email" type="email" />
      </div>
      <button class="sf-button sf-button--block" type="submit">Send</button>
    </form>
  </div>
</section>
```

See `examples/plain-html` for a complete page using the same primitives.

For copy-ready section patterns, see [Website patterns](website-patterns.md).
For native browser component patterns, see [Native Components](native-components.md).
For accessibility state hooks, see [Accessibility CSS](accessibility-css.md).
For public API stability rules, see [CSS API Contract](api-contract.md).
