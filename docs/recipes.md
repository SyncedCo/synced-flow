# Recipes

These recipes are copy-ready starting points. They intentionally compose the
public API from [System primitives](system-primitives.md) and avoid one-off page
CSS.

## CLI Recipe Catalog

The CLI also ships page-level recipes for AI agents and template generators:

```bash
pnpm exec synced-fluid recipe
pnpm exec synced-fluid recipe saas-landing --markup
pnpm exec synced-fluid recipe saas-landing --framework next --markup
pnpm exec synced-fluid recipe --section form --framework astro --markup
pnpm exec synced-fluid suggest "portfolio with full page scroll" --json
```

Available recipe ids:

- `saas-landing`
- `portfolio-scroll`
- `agency-home`
- `blog-index`
- `article-page`
- `about-timeline`
- `team-grid`
- `contact-page`
- `not-found`
- `coming-soon`

## Marketing Homepage

```html
<a class="sf-skip-link" href="#main">Skip to main content</a>
<header class="sf-container sf-repel" role="banner">
  <a class="sf-link-plain sf-focus-ring" href="/">Acme Studio</a>
  <nav class="sf-nav" aria-label="Primary">
    <ul class="sf-nav__list">
      <li><a class="sf-nav__link" href="#features" aria-current="page">Features</a></li>
      <li><a class="sf-nav__link" href="#pricing">Pricing</a></li>
      <li><a class="sf-nav__link" href="#contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main id="main">
  <section class="sf-hero">
    <div class="sf-container sf-split">
      <div class="sf-stack">
        <p class="sf-kicker">Fluid by default</p>
        <h1 class="sf-text-display">Launch a modern website without writing page CSS.</h1>
        <p class="sf-text-lead sf-prose">Compose sections from tokens, layout primitives, patterns, and accessible form states.</p>
        <div class="sf-cluster">
          <a class="sf-button" href="#contact">Start a project</a>
          <a class="sf-button sf-button--outline" href="#features">See features</a>
        </div>
      </div>
      <aside class="sf-surface sf-stack" aria-label="Included primitives">
        <h2 class="sf-text-h4">Included</h2>
        <ul class="sf-list-disc">
          <li>Fluid type and spacing</li>
          <li>Layout and website patterns</li>
          <li>Buttons, forms, cards, and states</li>
        </ul>
      </aside>
    </div>
  </section>

  <section class="sf-section" id="features">
    <div class="sf-container sf-stack">
      <header class="sf-section-header">
        <p class="sf-kicker">Features</p>
        <h2 class="sf-text-h2">Common sections are already covered.</h2>
      </header>
      <div class="sf-auto-grid">
        <article class="sf-feature">
          <span class="sf-feature__icon" aria-hidden="true">1</span>
          <h3 class="sf-feature__title">Tokens</h3>
          <p class="sf-feature__text">Use semantic colour, type, space, radius, shadow, and component variables.</p>
        </article>
        <article class="sf-feature">
          <span class="sf-feature__icon" aria-hidden="true">2</span>
          <h3 class="sf-feature__title">Patterns</h3>
          <p class="sf-feature__text">Build proof, pricing, FAQ, CTA, and footer sections from named classes.</p>
        </article>
        <article class="sf-feature">
          <span class="sf-feature__icon" aria-hidden="true">3</span>
          <h3 class="sf-feature__title">States</h3>
          <p class="sf-feature__text">Focus, current, invalid, disabled, busy, and forced-colors states are visible.</p>
        </article>
      </div>
    </div>
  </section>
</main>
```

## SaaS Product Page

```html
<main>
  <section class="sf-section">
    <div class="sf-container sf-stack">
      <header class="sf-section-header">
        <p class="sf-kicker">Product</p>
        <h1 class="sf-text-h1">A calm operating layer for busy teams.</h1>
        <p class="sf-text-lead sf-prose">Use the same primitives for landing pages, feature pages, and product-led flows.</p>
      </header>
      <div class="sf-logo-cloud" aria-label="Trusted by">
        <span>Studio</span>
        <span>Agency</span>
        <span>Startup</span>
        <span>Product</span>
      </div>
      <div class="sf-stats">
        <article class="sf-stat">
          <strong class="sf-stat__value">0</strong>
          <span class="sf-stat__label">Runtime dependencies</span>
        </article>
        <article class="sf-stat">
          <strong class="sf-stat__value">1</strong>
          <span class="sf-stat__label">Core import</span>
        </article>
        <article class="sf-stat">
          <strong class="sf-stat__value">9.4 KB</strong>
          <span class="sf-stat__label">Full core gzip size</span>
        </article>
      </div>
      <blockquote class="sf-testimonial">
        <p class="sf-testimonial__quote">"Synced Fluid gives us enough structure without locking the brand down."</p>
        <footer class="sf-testimonial__meta">Example product team</footer>
      </blockquote>
    </div>
  </section>
</main>
```

## Documentation Page

```html
<main class="sf-section">
  <div class="sf-container sf-sidebar">
    <aside class="sf-sidebar__sidebar" aria-label="Documentation navigation">
      <nav class="sf-nav">
        <ul class="sf-nav__list">
          <li><a class="sf-nav__link" href="#install" aria-current="page">Install</a></li>
          <li><a class="sf-nav__link" href="#tokens">Tokens</a></li>
          <li><a class="sf-nav__link" href="#components">Components</a></li>
        </ul>
      </nav>
    </aside>
    <article class="sf-sidebar__content sf-prose">
      <h1 id="install">Install Synced Fluid</h1>
      <p>Import the full stylesheet for the smallest setup path, or use modular layers when a project needs tighter control.</p>
      <pre><code>@import "@synced/fluid/styles.css";</code></pre>
      <h2 id="tokens">Tokens</h2>
      <p>Use <code>--sf-*</code> variables for stable project styling.</p>
      <h2 id="components">Components</h2>
      <p>Compose cards, buttons, forms, alerts, and website patterns from public <code>sf-*</code> classes.</p>
    </article>
  </div>
</main>
```

## Contact Or Lead Form

```html
<section class="sf-section" id="contact">
  <div class="sf-container sf-split">
    <div class="sf-stack">
      <p class="sf-kicker">Contact</p>
      <h2 class="sf-text-h2">Collect a lead with accessible states included.</h2>
      <p class="sf-prose">Labels, help text, required markers, invalid states, and submit buttons share the same token system.</p>
    </div>
    <form class="sf-card sf-form" action="#" method="post">
      <div class="sf-field">
        <label class="sf-required" for="name">Name</label>
        <input class="sf-input" id="name" name="name" required aria-describedby="name-help" />
        <p class="sf-help" id="name-help">Your name is required.</p>
      </div>
      <div class="sf-field" data-invalid="true">
        <label class="sf-required" for="email">Email</label>
        <input class="sf-input" id="email" name="email" type="email" required aria-invalid="true" aria-describedby="email-help email-error" />
        <p class="sf-help" id="email-help">Use a work email address.</p>
        <p class="sf-error" id="email-error">Enter a valid email address.</p>
      </div>
      <button class="sf-button" type="submit">Send enquiry</button>
    </form>
  </div>
</section>
```

## Lightweight App Shell

```html
<div class="sf-section sf-bg-surface-alt">
  <div class="sf-container sf-stack">
    <header class="sf-repel">
      <div>
        <p class="sf-kicker">Workspace</p>
        <h1 class="sf-text-h2">Project dashboard</h1>
      </div>
      <button class="sf-button sf-button--secondary" type="button" aria-pressed="false">Filter</button>
    </header>
    <div class="sf-panel-grid">
      <article class="sf-card">
        <h2 class="sf-card__title">Pipeline</h2>
        <p class="sf-card__description">Review the current work queue.</p>
      </article>
      <article class="sf-card">
        <h2 class="sf-card__title">Messages</h2>
        <p class="sf-card__description">Keep client updates visible.</p>
      </article>
      <article class="sf-alert sf-alert--info" role="status">
        <p class="sf-alert__title">Sync complete</p>
        <p>The workspace is up to date.</p>
      </article>
    </div>
  </div>
</div>
```

## Pricing And FAQ

```html
<section class="sf-section" id="pricing">
  <div class="sf-container sf-stack">
    <header class="sf-section-header">
      <p class="sf-kicker">Pricing</p>
      <h2 class="sf-text-h2">Commercial sections use the same primitives.</h2>
    </header>
    <div class="sf-pricing-grid">
      <article class="sf-price-card">
        <h3>Starter</h3>
        <p class="sf-price"><span class="sf-price__value">£0</span> <span class="sf-price__interval">prototype</span></p>
        <a class="sf-button sf-button--outline" href="/start">Try it</a>
      </article>
      <article class="sf-price-card sf-price-card--featured">
        <p class="sf-badge">Most useful</p>
        <h3>Website</h3>
        <p class="sf-price"><span class="sf-price__value">£49</span> <span class="sf-price__interval">project</span></p>
        <a class="sf-button" href="/start">Start</a>
      </article>
    </div>
    <div class="sf-faq">
      <details class="sf-faq__item">
        <summary>Can I customize the theme?</summary>
        <p>Yes. Override semantic tokens before writing custom CSS.</p>
      </details>
    </div>
  </div>
</section>
```
