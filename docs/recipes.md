# Recipes

These recipes are deliberately small. They show the shapes Synced Fluid wants
developers and AI agents to reach for first.

## Hero

```html
<main class="sf-cover">
  <section class="sf-container sf-stack sf-cover__centre">
    <p class="sf-kicker">Operations without drag</p>
    <h1 class="sf-text-display">A fluid system for focused teams.</h1>
    <p class="sf-text-lead sf-prose">
      Start with semantic tokens and layout primitives, then add only the project CSS you need.
    </p>
    <div class="sf-cluster">
      <a class="sf-button sf-button--default" href="/contact">Book a call</a>
      <a class="sf-button sf-button--outline" href="/services">View services</a>
    </div>
  </section>
</main>
```

## Feature Grid

```html
<section class="sf-section">
  <div class="sf-container sf-stack">
    <header class="sf-section-header">
      <p class="sf-kicker">Why it works</p>
      <h2 class="sf-text-h2">Systems that scale with the viewport.</h2>
    </header>
    <div class="sf-panel-grid" data-density="featured">
      <article class="sf-card sf-card--interactive">
        <h3 class="sf-text-h4">Fluid defaults</h3>
        <p class="sf-prose">Type, spacing, and layout use clamp-based tokens.</p>
      </article>
      <article class="sf-card sf-card--interactive">...</article>
      <article class="sf-card sf-card--interactive">...</article>
    </div>
  </div>
</section>
```

## Form

```html
<form class="sf-card sf-stack">
  <div class="sf-field">
    <label for="email">Email</label>
    <input class="sf-input" id="email" type="email" />
  </div>
  <button class="sf-button sf-button--default" type="submit">Send</button>
</form>
```

## Accessible Navigation

```html
<a class="sf-skip-link" href="#main">Skip to main content</a>
<nav aria-label="Primary">
  <ul class="sf-list-reset sf-cluster">
    <li><a class="sf-link-plain sf-focus-ring" href="/">Home</a></li>
    <li><a class="sf-link-plain sf-focus-ring" href="/docs">Docs</a></li>
  </ul>
</nav>
```

## Split Layout

```html
<section class="sf-section">
  <div class="sf-container sf-split">
    <div class="sf-stack">
      <p class="sf-kicker">Plan</p>
      <h2 class="sf-text-h2">A balanced two-column section.</h2>
    </div>
    <div class="sf-card">
      <p class="sf-prose">The columns collapse naturally without breakpoint classes.</p>
    </div>
  </div>
</section>
```
