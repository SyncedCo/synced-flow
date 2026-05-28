# Website Patterns

Synced Flow pattern classes cover common website sections without turning the
system into a large utility framework. Use them as semantic building blocks, then
override tokens for brand-specific decisions.

## Pattern Classes

| Class | Purpose |
| --- | --- |
| `sf-logo-cloud` | Wraps partner, client, or integration names/logos. |
| `sf-feature`, `sf-feature__icon`, `sf-feature__title`, `sf-feature__text` | Feature or benefit blocks. |
| `sf-stats`, `sf-stat`, `sf-stat__value`, `sf-stat__label` | Metric and proof sections. |
| `sf-testimonial`, `sf-testimonial__quote`, `sf-testimonial__meta` | Customer quote blocks. |
| `sf-pricing-grid`, `sf-price-card`, `sf-price`, `sf-price__value`, `sf-price__interval` | Pricing sections. |
| `sf-faq`, `sf-faq__item` | Native `details`/`summary` FAQ sections. |
| `sf-cta` | Call-to-action block. Add `data-layout="split"` for a two-column CTA when space allows. |
| `sf-footer` | Footer region with tokenized spacing and top border. |

These patterns are intentionally broad. They provide enough structure for a
developer to ship a normal website while leaving project-specific visual details
to semantic tokens and local CSS.

## Feature Grid

```html
<section class="sf-section">
  <div class="sf-container sf-stack sf-stack--loose">
    <div class="sf-section-header">
      <p class="sf-kicker">Features</p>
      <h2>Reusable sections without page CSS.</h2>
    </div>

    <div class="sf-auto-grid">
      <article class="sf-feature">
        <span class="sf-feature__icon" aria-hidden="true">1</span>
        <h3 class="sf-feature__title">Fluid defaults</h3>
        <p class="sf-feature__text">Type, spacing, and surfaces adapt from shared tokens.</p>
      </article>
    </div>
  </div>
</section>
```

## Proof Section

```html
<div class="sf-logo-cloud" aria-label="Trusted by">
  <span>Studio</span>
  <span>Agency</span>
  <span>Startup</span>
</div>

<div class="sf-stats">
  <div class="sf-stat">
    <p class="sf-stat__value">10.5 KB</p>
    <p class="sf-stat__label">Full core gzip size</p>
  </div>
</div>

<figure class="sf-testimonial">
  <blockquote class="sf-testimonial__quote">"Custom CSS is reserved for brand moments."</blockquote>
  <figcaption class="sf-testimonial__meta">Example client</figcaption>
</figure>
```

## Pricing And FAQ

```html
<div class="sf-pricing-grid">
  <article class="sf-price-card sf-price-card--featured">
    <p class="sf-badge">Most useful</p>
    <h3 class="sf-card__title">Website</h3>
    <div class="sf-price">
      <span class="sf-price__value">£49</span>
      <span class="sf-price__interval">project</span>
    </div>
    <p class="sf-card__description">Patterns, docs, and examples for a complete site.</p>
    <a class="sf-button sf-button--default sf-button--block" href="/contact">Start</a>
  </article>
</div>

<div class="sf-faq">
  <details class="sf-faq__item">
    <summary>Is this a Tailwind replacement?</summary>
    <p>No. Synced Flow uses named primitives and patterns for common website work.</p>
  </details>
</div>
```

## CTA And Footer

```html
<section class="sf-section">
  <div class="sf-container">
    <div class="sf-cta" data-layout="split">
      <div class="sf-stack sf-stack--tight">
        <h2>Ready to build?</h2>
        <p class="sf-text-muted">Start with patterns, then customize tokens.</p>
      </div>
      <a class="sf-button" href="/contact">Start a project</a>
    </div>
  </div>
</section>

<footer class="sf-footer">
  <div class="sf-container sf-repel">
    <p class="sf-text-caption">Synced Flow</p>
    <a class="sf-link" href="#main">Back to top</a>
  </div>
</footer>
```

See `examples/plain-html` for the complete website demo.
