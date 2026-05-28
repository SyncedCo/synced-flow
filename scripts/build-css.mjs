import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { componentTokens, fluidConfig, primitiveTokens, semanticTokens } from '../src/tokens.mjs'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

const spaces = {
  '3xs': 0.25,
  '2xs': 0.5,
  xs: 0.75,
  s: 1,
  m: 1.5,
  l: 2,
  xl: 3,
  '2xl': 4,
  '3xl': 6,
  '4xl': 8,
}

const spacePairs = [
  ['3xs', '2xs'],
  ['2xs', 'xs'],
  ['xs', 's'],
  ['s', 'm'],
  ['m', 'l'],
  ['l', 'xl'],
  ['xl', '2xl'],
  ['2xl', '3xl'],
  ['s', 'l'],
  ['m', 'xl'],
  ['l', '2xl'],
]

function round(value) {
  return Number(value.toFixed(4))
}

function fluidClamp(minPx, maxPx) {
  if (minPx === maxPx) return `${round(minPx / 16)}rem`
  const slope = (maxPx - minPx) / (fluidConfig.maxViewport - fluidConfig.minViewport)
  const intercept = minPx - slope * fluidConfig.minViewport
  return `clamp(${round(minPx / 16)}rem, ${round(intercept / 16)}rem + ${round(slope * 100)}vw, ${round(maxPx / 16)}rem)`
}

function typeStep(step) {
  const minPx = fluidConfig.minRoot * Math.pow(fluidConfig.minTypeScale, step)
  const maxPx = fluidConfig.maxRoot * Math.pow(fluidConfig.maxTypeScale, step)
  return fluidClamp(minPx, maxPx)
}

function tokenId(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-z])(\d)/g, '$1-$2')
    .toLowerCase()
}

function block(lines) {
  return lines.filter(Boolean).join('\n')
}

function buildTokensCss() {
  const typeTokens = []
  for (let step = fluidConfig.typeMinStep; step <= fluidConfig.typeMaxStep; step += 1) {
    typeTokens.push(`    --sf-step-${step < 0 ? `-${Math.abs(step)}` : step}: ${typeStep(step)};`)
  }

  const spaceTokens = Object.entries(spaces).map(([name, multiplier]) => {
    return `    --sf-space-${name}: ${fluidClamp(fluidConfig.minRoot * multiplier, fluidConfig.maxRoot * multiplier)};`
  })

  const pairTokens = spacePairs.map(([minName, maxName]) => {
    return `    --sf-space-${minName}-${maxName}: ${fluidClamp(fluidConfig.minRoot * spaces[minName], fluidConfig.maxRoot * spaces[maxName])};`
  })

  const fontTokens = Object.entries(primitiveTokens.fonts).map(([name, value]) => `    --sf-font-${name}: ${value};`)
  const colourTokens = Object.entries(primitiveTokens.colours).map(([name, value]) => `    --sf-colour-${tokenId(name)}: ${value};`)
  const semanticColourTokens = Object.entries(semanticTokens.colours).map(([name, value]) => `    --sf-colour-${tokenId(name)}: ${value};`)
  const radiusTokens = Object.entries(primitiveTokens.radii).map(([name, value]) => `    --sf-radius-${name}: ${value};`)
  const shadowTokens = Object.entries(primitiveTokens.shadows).map(([name, value]) => `    --sf-shadow-${name}: ${value};`)

  return `@layer tokens {
  :root {
    color-scheme: light;

${fontTokens.join('\n')}

${typeTokens.join('\n')}
    --sf-type-caption: var(--sf-step--1);
    --sf-type-body: var(--sf-step-0);
    --sf-type-lead: var(--sf-step-1);
    --sf-type-h6: var(--sf-step-1);
    --sf-type-h5: var(--sf-step-2);
    --sf-type-h4: var(--sf-step-3);
    --sf-type-h3: var(--sf-step-4);
    --sf-type-h2: var(--sf-step-5);
    --sf-type-h1: var(--sf-step-6);
    --sf-type-title: var(--sf-step-4);
    --sf-type-display: var(--sf-step-7);
    --sf-line-height-tight: 1;
    --sf-line-height-heading: 1.08;
    --sf-line-height-body: 1.5;
    --sf-line-height-loose: 1.7;

${spaceTokens.join('\n')}
${pairTokens.join('\n')}
    --sf-gutter: var(--sf-space-s-l);
    --sf-region: var(--sf-space-xl-2xl);
    --sf-container-max: ${fluidConfig.gridMaxWidthRem}rem;
    --sf-container-narrow: 48rem;
    --sf-container-wide: 108rem;
    --sf-grid-columns: ${fluidConfig.gridColumns};

${radiusTokens.join('\n')}
    --sf-radius-control: var(--sf-radius-md);
    --sf-radius-panel: var(--sf-radius-lg);

${colourTokens.join('\n')}
${semanticColourTokens.join('\n')}

${shadowTokens.join('\n')}
    --sf-duration-fast: 150ms;
    --sf-duration-normal: 220ms;
    --sf-duration-slow: 360ms;
    --sf-ease-standard: cubic-bezier(.2, 0, 0, 1);
    --sf-ease-emphasized: cubic-bezier(.16, 1, .3, 1);

    --sf-button-radius: ${componentTokens.button.radius};
    --sf-button-block-size: ${componentTokens.button.blockSize};
    --sf-button-padding-inline: ${componentTokens.button.paddingInline};
    --sf-card-radius: ${componentTokens.card.radius};
    --sf-card-padding: ${componentTokens.card.padding};
    --sf-input-radius: ${componentTokens.input.radius};
    --sf-input-block-size: ${componentTokens.input.blockSize};
    --sf-input-padding-inline: ${componentTokens.input.paddingInline};
    --sf-input-border: ${componentTokens.input.border};
    --sf-input-bg: ${componentTokens.input.background};
    --sf-alert-radius: ${componentTokens.alert.radius};
    --sf-alert-padding: ${componentTokens.alert.padding};
    --sf-nav-gap: ${componentTokens.nav.gap};
    --sf-nav-link-radius: ${componentTokens.nav.linkRadius};
  }

  :where(.sf-theme-light, [data-sf-theme="light"]) {
    color-scheme: light;
    --sf-colour-background: var(--sf-colour-neutral-50);
    --sf-colour-foreground: var(--sf-colour-neutral-900);
    --sf-colour-muted: var(--sf-colour-neutral-700);
    --sf-colour-subtle: var(--sf-colour-neutral-500);
    --sf-colour-surface: var(--sf-colour-neutral-0);
    --sf-colour-surface-alt: var(--sf-colour-neutral-100);
    --sf-colour-surface-raised: var(--sf-colour-neutral-0);
    --sf-colour-surface-inset: var(--sf-colour-neutral-100);
    --sf-colour-border: oklch(18% 0.026 250 / 0.12);
    --sf-colour-border-strong: oklch(18% 0.026 250 / 0.22);
    --sf-colour-link: var(--sf-colour-orange-700);
    --sf-colour-link-hover: var(--sf-colour-orange-600);
  }

  :where(.sf-theme-dark, [data-sf-theme="dark"]) {
    color-scheme: dark;
    --sf-colour-background: var(--sf-colour-neutral-950);
    --sf-colour-foreground: oklch(96% 0.008 86);
    --sf-colour-muted: oklch(78% 0.012 86);
    --sf-colour-subtle: oklch(64% 0.014 86);
    --sf-colour-surface: var(--sf-colour-neutral-900);
    --sf-colour-surface-alt: var(--sf-colour-neutral-850);
    --sf-colour-surface-raised: var(--sf-colour-neutral-850);
    --sf-colour-surface-inset: var(--sf-colour-neutral-950);
    --sf-colour-border: oklch(100% 0 0 / 0.14);
    --sf-colour-border-strong: oklch(100% 0 0 / 0.24);
    --sf-colour-link: var(--sf-colour-orange-500);
    --sf-colour-link-hover: oklch(80% 0.14 50);
  }
}`
}

function buildResetCss() {
  return `@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  *:where(:not(dialog)) { margin: 0; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { min-block-size: 100%; }
  img, picture, video, canvas, svg { display: block; max-inline-size: 100%; }
  img, video { block-size: auto; }
  input, button, textarea, select { font: inherit; }
  button, input:where([type="button"], [type="submit"], [type="reset"]) { appearance: button; }
  [hidden]:where(:not([hidden="until-found"])) { display: none !important; }
}`
}

function buildBaseCss() {
  return `@layer base {
  html {
    background: var(--sf-colour-background);
    color: var(--sf-colour-foreground);
    scroll-behavior: smooth;
  }

  body {
    background: var(--sf-colour-background);
    color: var(--sf-colour-foreground);
    font-family: var(--sf-font-sans);
    font-size: var(--sf-type-body);
    line-height: var(--sf-line-height-body);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  :where(h1, h2, h3, h4, h5, h6) {
    color: inherit;
    font-family: var(--sf-font-display);
    font-weight: 700;
    line-height: var(--sf-line-height-tight);
    text-wrap: balance;
  }

  :where(h1) { font-size: var(--sf-type-h1); }
  :where(h2) { font-size: var(--sf-type-h2); }
  :where(h3) { font-size: var(--sf-type-h3); }
  :where(h4) { font-size: var(--sf-type-h4); }
  :where(h5) { font-size: var(--sf-type-h5); }
  :where(h6) { font-size: var(--sf-type-h6); }
  :where(p, li, dd, figcaption) { text-wrap: pretty; }
  :where(a) {
    color: var(--sf-colour-link);
    text-decoration-color: color-mix(in oklch, currentColor 55%, transparent);
    text-decoration-skip-ink: auto;
    text-decoration-thickness: .08em;
    text-underline-offset: .18em;
  }
  :where(a:hover) { color: var(--sf-colour-link-hover); }
  :where(strong, b) { font-weight: 800; }
  :where(small) { font-size: var(--sf-step--1); }
  :where(code, kbd, samp, pre) { font-family: var(--sf-font-mono); }
  :where(:not(pre) > code, kbd) {
    background: var(--sf-colour-surface-alt);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-sm);
    font-size: .9em;
    padding: .1em .35em;
  }
  :where(pre) {
    background: var(--sf-colour-surface-inset);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    overflow-x: auto;
    padding: var(--sf-space-s);
  }
  :where(hr) {
    border: 0;
    border-block-start: 1px solid var(--sf-colour-border);
    margin-block: var(--sf-space-l);
  }
  :where(blockquote) {
    border-inline-start: 0.25rem solid var(--sf-colour-primary);
    color: var(--sf-colour-muted);
    padding-inline-start: var(--sf-space-s);
  }
  :where(label) { cursor: pointer; }
  :where(input, textarea, select) { color: inherit; }
  :where(textarea) { resize: vertical; }
  :where(button:not(:disabled), [role="button"]:not(:disabled), a[href]) { cursor: pointer; }
  :where(button:disabled, input:disabled, textarea:disabled, select:disabled, [aria-disabled="true"]) { cursor: not-allowed; }
  :where(:focus-visible) { outline: 0.125rem solid var(--sf-colour-ring); outline-offset: .2rem; }
  :where(:target) { scroll-margin-block: var(--sf-space-l); }
  ::selection { background: color-mix(in oklch, var(--sf-colour-primary) 28%, transparent); }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (forced-colors: active) {
    :where(:focus-visible) {
      outline: 2px solid Highlight;
      outline-offset: .2rem;
    }

    ::selection {
      background: Highlight;
      color: HighlightText;
    }
  }
}`
}

function buildAppCss() {
  return `@layer app {
  :where(a) {
    color: inherit;
    text-decoration: none;
  }

  :where(ol, ul, menu) {
    list-style: none;
    padding-inline-start: 0;
  }

  :where(button) {
    background: transparent;
    border: 0;
    color: inherit;
  }

  :where(fieldset) {
    border: 0;
    padding: 0;
  }

  :where(legend) { padding: 0; }
}`
}

function buildLayoutCss() {
  return `@layer layout {
  .sf-container {
    inline-size: min(100% - (var(--sf-gutter) * 2), var(--sf-container-max));
    margin-inline: auto;
  }

  .sf-container--narrow { --sf-container-max: var(--sf-container-narrow); }
  .sf-container--wide { --sf-container-max: var(--sf-container-wide); }
  .sf-container--full { --sf-container-max: 100%; }

  .sf-section { padding-block: var(--sf-section-space, var(--sf-region)); }
  .sf-section--compact { --sf-section-space: var(--sf-space-l-xl); }
  .sf-section--spacious { --sf-section-space: var(--sf-space-2xl-3xl); }

  .sf-stack {
    display: flex;
    flex-direction: column;
    gap: var(--sf-stack-space, var(--sf-space-s));
  }

  .sf-stack--tight { --sf-stack-space: var(--sf-space-2xs-xs); }
  .sf-stack--loose { --sf-stack-space: var(--sf-space-m-xl); }

  .sf-flow > * + * { margin-block-start: var(--sf-flow-space, var(--sf-space-s)); }

  .sf-cluster {
    align-items: var(--sf-cluster-align, center);
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-cluster-space, var(--sf-space-s));
    justify-content: var(--sf-cluster-justify, flex-start);
  }

  .sf-repel {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-space-s);
    justify-content: space-between;
  }

  .sf-grid {
    display: grid;
    gap: var(--sf-grid-gap, var(--sf-gutter));
    grid-template-columns: repeat(var(--sf-grid-columns), minmax(0, 1fr));
  }

  .sf-grid--2 { --sf-grid-columns: 2; }
  .sf-grid--3 { --sf-grid-columns: 3; }
  .sf-grid--4 { --sf-grid-columns: 4; }

  .sf-auto-grid {
    display: grid;
    gap: var(--sf-grid-gap, var(--sf-gutter));
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--sf-auto-grid-min, 16rem)), 1fr));
  }

  .sf-split {
    display: grid;
    gap: var(--sf-split-gap, var(--sf-gutter));
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--sf-split-min, 24rem)), 1fr));
  }

  .sf-split--reverse > :first-child { order: 2; }
  .sf-split--reverse > :last-child { order: 1; }

  .sf-centre {
    box-sizing: content-box;
    margin-inline: auto;
    max-inline-size: var(--sf-centre-size, 65ch);
  }

  .sf-centre--narrow { --sf-centre-size: 48ch; }
  .sf-centre--wide { --sf-centre-size: 80ch; }

  .sf-sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-gutter);
  }

  .sf-sidebar > :first-child {
    flex-basis: var(--sf-sidebar-width, 20rem);
    flex-grow: 1;
  }

  .sf-sidebar > :last-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: min(100%, var(--sf-sidebar-content-min, 50%));
  }

  .sf-switcher {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-gutter);
  }

  .sf-switcher > * {
    flex-basis: calc((var(--sf-switcher-threshold, 42rem) - 100%) * 999);
    flex-grow: 1;
  }

  .sf-frame {
    aspect-ratio: var(--sf-frame-ratio, 16 / 9);
    overflow: hidden;
  }

  .sf-frame > :where(img, video, iframe) {
    block-size: 100%;
    inline-size: 100%;
    object-fit: cover;
  }

  .sf-frame--square { --sf-frame-ratio: 1; }
  .sf-frame--portrait { --sf-frame-ratio: 4 / 5; }
  .sf-frame--wide { --sf-frame-ratio: 21 / 9; }

  .sf-cover {
    display: flex;
    flex-direction: column;
    min-block-size: var(--sf-cover-min, 100svh);
    padding-block: var(--sf-region);
  }

  .sf-cover > :where(:first-child:not(.sf-cover__centre)) { margin-block-end: auto; }
  .sf-cover > :where(:last-child:not(.sf-cover__centre)) { margin-block-start: auto; }

  .sf-panel-grid {
    container-type: inline-size;
    display: grid;
    gap: var(--sf-grid-gap, var(--sf-gutter));
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--sf-panel-min, 18rem)), 1fr));
  }

  .sf-scroll-viewport,
  .sf-scroll-snap-y {
    block-size: var(--sf-scroll-viewport-size, 100svh);
    overflow-y: auto;
    scroll-padding-block: var(--sf-scroll-padding, var(--sf-space-l));
    scroll-snap-type: y proximity;
  }

  :where(.sf-scroll-viewport, .sf-scroll-snap-y)[data-snap="mandatory"] {
    --sf-scroll-snap-stop: always;
    scroll-snap-type: y mandatory;
  }
  .sf-scroll-viewport[data-size="preview"] {
    --sf-scroll-margin: 0;
    --sf-scroll-padding: 0;
    --sf-scroll-viewport-size: min(32rem, 80svh);
    --sf-scroll-panel-min: min(32rem, 80svh);
  }

  .sf-scroll-panel {
    align-content: center;
    display: grid;
    min-block-size: var(--sf-scroll-panel-min, 100svh);
    scroll-margin-block: var(--sf-scroll-margin, var(--sf-space-l));
    scroll-snap-align: start;
    scroll-snap-stop: var(--sf-scroll-snap-stop, normal);
  }

  .sf-sticky-top {
    position: sticky;
    inset-block-start: var(--sf-sticky-offset, 0);
    z-index: var(--sf-sticky-z, 20);
  }

  .sf-media-object {
    align-items: var(--sf-media-object-align, start);
    display: grid;
    gap: var(--sf-space-s-m);
    grid-template-columns: auto minmax(0, 1fr);
  }

  .sf-aside-rail {
    display: grid;
    gap: var(--sf-gutter);
    grid-template-columns: minmax(0, 1fr);
  }

  @media (min-width: 48rem) {
    .sf-aside-rail {
      grid-template-columns: minmax(0, 1fr) minmax(14rem, 22rem);
    }

    .sf-aside-rail[data-rail="start"] {
      grid-template-columns: minmax(14rem, 22rem) minmax(0, 1fr);
    }
  }

  @supports (animation-timeline: view()) {
    .sf-scroll-panel[data-view-progress] {
      view-timeline-name: --sf-panel;
      view-timeline-axis: block;
    }
  }

  @container (min-width: 42rem) {
    .sf-panel-grid[data-density="featured"] > :first-child {
      grid-column: span 2;
    }
  }
}`
}

function buildComponentCss() {
  return `@layer components {
  .sf-button {
    align-items: center;
    background: var(--sf-button-bg, var(--sf-colour-primary));
    border: 1px solid var(--sf-button-border, color-mix(in oklch, var(--sf-colour-primary) 84%, black));
    border-radius: var(--sf-button-radius);
    box-shadow: var(--sf-button-shadow, var(--sf-shadow-sm));
    color: var(--sf-button-colour, var(--sf-colour-primary-foreground));
    display: inline-flex;
    font-size: var(--sf-step--1);
    font-weight: 700;
    gap: var(--sf-space-2xs);
    justify-content: center;
    min-block-size: var(--sf-button-block-size);
    padding-block: .625rem;
    padding-inline: var(--sf-button-padding-inline);
    text-decoration: none;
    transition: background-color var(--sf-duration-normal) var(--sf-ease-standard), border-color var(--sf-duration-normal) var(--sf-ease-standard), box-shadow var(--sf-duration-normal) var(--sf-ease-standard), color var(--sf-duration-normal) var(--sf-ease-standard), transform var(--sf-duration-normal) var(--sf-ease-standard);
    white-space: nowrap;
  }

  .sf-button:hover {
    background: var(--sf-button-bg-hover, var(--sf-colour-primary-hover));
    transform: translateY(-0.0625rem);
  }

  .sf-button:disabled,
  .sf-button[aria-disabled="true"] {
    opacity: .55;
    pointer-events: none;
  }

  :where(.sf-button, .sf-nav__link, .sf-card--interactive, .sf-price-card)[aria-disabled="true"],
  :where(.sf-link, .sf-link-subtle, .sf-link-plain)[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: .55;
    pointer-events: none;
  }

  :where(.sf-button, .sf-nav__link)[aria-expanded="true"],
  :where(.sf-button, .sf-nav__link)[aria-pressed="true"],
  :where(.sf-button, .sf-nav__link)[aria-selected="true"],
  :where(.sf-button, .sf-nav__link)[data-state="open"] {
    background: var(--sf-colour-surface-alt);
    border-color: color-mix(in oklch, var(--sf-colour-primary) 34%, var(--sf-colour-border));
    color: var(--sf-colour-foreground);
  }

  .sf-button[aria-busy="true"],
  .sf-button[data-loading="true"] {
    cursor: progress;
    opacity: .78;
    pointer-events: none;
  }

  .sf-button:focus-visible {
    box-shadow: 0 0 0 0.25rem color-mix(in oklch, var(--sf-colour-ring) 22%, transparent);
  }

  .sf-button--default,
  .sf-button[data-variant="default"] {
    --sf-button-bg: var(--sf-colour-primary);
    --sf-button-bg-hover: var(--sf-colour-primary-hover);
    --sf-button-border: color-mix(in oklch, var(--sf-colour-primary) 84%, black);
    --sf-button-colour: var(--sf-colour-primary-foreground);
  }

  .sf-button--secondary,
  .sf-button[data-variant="secondary"] {
    --sf-button-bg: var(--sf-colour-surface-alt);
    --sf-button-bg-hover: color-mix(in oklch, var(--sf-colour-surface-alt) 86%, var(--sf-colour-primary));
    --sf-button-border: var(--sf-colour-border);
    --sf-button-colour: var(--sf-colour-foreground);
  }

  .sf-button--outline,
  .sf-button[data-variant="outline"] {
    --sf-button-bg: transparent;
    --sf-button-bg-hover: var(--sf-colour-surface-alt);
    --sf-button-border: var(--sf-colour-border);
    --sf-button-colour: var(--sf-colour-foreground);
    --sf-button-shadow: none;
  }

  .sf-button--ghost,
  .sf-button[data-variant="ghost"] {
    --sf-button-bg: transparent;
    --sf-button-bg-hover: var(--sf-colour-surface-alt);
    --sf-button-border: transparent;
    --sf-button-colour: var(--sf-colour-foreground);
    --sf-button-shadow: none;
  }

  .sf-button--link,
  .sf-button[data-variant="link"] {
    --sf-button-bg: transparent;
    --sf-button-bg-hover: transparent;
    --sf-button-border: transparent;
    --sf-button-colour: var(--sf-colour-primary);
    --sf-button-shadow: none;
    min-block-size: auto;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: .25em;
  }

  .sf-button--link:hover,
  .sf-button[data-variant="link"]:hover {
    transform: none;
  }

  .sf-button--destructive,
  .sf-button[data-variant="destructive"] {
    --sf-button-bg: var(--sf-colour-danger);
    --sf-button-bg-hover: color-mix(in oklch, var(--sf-colour-danger) 86%, black);
    --sf-button-border: color-mix(in oklch, var(--sf-colour-danger) 84%, black);
    --sf-button-colour: var(--sf-colour-primary-foreground);
  }

  .sf-button--sm,
  .sf-button[data-size="sm"] {
    --sf-button-block-size: 2.25rem;
    --sf-button-padding-inline: var(--sf-space-xs);
  }

  .sf-button--lg,
  .sf-button[data-size="lg"] {
    --sf-button-block-size: 3rem;
    --sf-button-padding-inline: var(--sf-space-m);
  }

  .sf-button--icon,
  .sf-button[data-size="icon"] {
    --sf-button-block-size: 2.75rem;
    inline-size: 2.75rem;
    padding-inline: 0;
  }

  .sf-button--block,
  .sf-button[data-width="block"] {
    inline-size: 100%;
  }

  .sf-button-group {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-space-2xs);
  }

  .sf-card {
    background: var(--sf-card-bg, var(--sf-colour-surface));
    border: 1px solid var(--sf-card-border, var(--sf-colour-border));
    border-radius: var(--sf-card-radius);
    box-shadow: var(--sf-card-shadow, var(--sf-shadow-sm));
    color: var(--sf-card-colour, var(--sf-colour-foreground));
    padding: var(--sf-card-padding);
  }

  .sf-card--flat {
    --sf-card-shadow: none;
  }

  .sf-card--raised {
    --sf-card-bg: var(--sf-colour-surface-raised);
    --sf-card-shadow: var(--sf-shadow-md);
  }

  .sf-card__header,
  .sf-card__body,
  .sf-card__footer {
    display: grid;
    gap: var(--sf-space-xs);
  }

  .sf-card__title {
    font-family: var(--sf-font-display);
    font-size: var(--sf-step-2);
    font-weight: 700;
    line-height: var(--sf-line-height-heading);
  }

  .sf-card__description {
    color: var(--sf-colour-muted);
  }

  .sf-card--interactive {
    transition: border-color var(--sf-duration-normal) var(--sf-ease-standard), box-shadow var(--sf-duration-normal) var(--sf-ease-standard), transform var(--sf-duration-normal) var(--sf-ease-standard);
  }

  .sf-card--interactive:hover {
    border-color: color-mix(in oklch, var(--sf-colour-primary) 32%, var(--sf-colour-border));
    box-shadow: var(--sf-shadow-md);
    transform: translateY(-0.125rem);
  }

  .sf-surface {
    background: var(--sf-surface-bg, var(--sf-colour-surface));
    border: 1px solid var(--sf-surface-border, var(--sf-colour-border));
    border-radius: var(--sf-surface-radius, var(--sf-radius-panel));
    box-shadow: var(--sf-surface-shadow, none);
    color: var(--sf-surface-colour, var(--sf-colour-foreground));
    padding: var(--sf-surface-padding, var(--sf-space-m-l));
  }

  .sf-surface--alt {
    --sf-surface-bg: var(--sf-colour-surface-alt);
  }

  .sf-surface--raised {
    --sf-surface-bg: var(--sf-colour-surface-raised);
    --sf-surface-shadow: var(--sf-shadow-md);
  }

  .sf-hero {
    align-items: center;
    display: grid;
    min-block-size: var(--sf-hero-min, min(42rem, 82svh));
    padding-block: var(--sf-space-2xl-3xl);
  }

  .sf-logo-cloud {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-space-s-m);
    justify-content: var(--sf-logo-cloud-justify, center);
  }

  .sf-logo-cloud > * {
    color: var(--sf-colour-subtle);
    font-size: var(--sf-step--1);
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .sf-feature {
    display: grid;
    gap: var(--sf-space-xs);
  }

  .sf-feature__icon {
    align-items: center;
    background: var(--sf-colour-primary-soft);
    border: 1px solid var(--sf-colour-primary-soft-border);
    border-radius: var(--sf-radius-md);
    color: var(--sf-colour-primary);
    display: inline-flex;
    font-weight: 800;
    inline-size: var(--sf-feature-icon-size, 2.75rem);
    justify-content: center;
    min-block-size: var(--sf-feature-icon-size, 2.75rem);
  }

  .sf-feature__title {
    font-family: var(--sf-font-display);
    font-size: var(--sf-step-2);
    font-weight: 700;
    line-height: var(--sf-line-height-heading);
  }

  .sf-feature__text {
    color: var(--sf-colour-muted);
  }

  .sf-stats {
    display: grid;
    gap: var(--sf-grid-gap, var(--sf-gutter));
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--sf-stat-min, 12rem)), 1fr));
  }

  .sf-stat {
    border-block-start: 1px solid var(--sf-colour-border);
    display: grid;
    gap: var(--sf-space-2xs);
    padding-block-start: var(--sf-space-s);
  }

  .sf-stat__value {
    font-family: var(--sf-font-display);
    font-size: var(--sf-step-4);
    font-weight: 700;
    line-height: var(--sf-line-height-tight);
  }

  .sf-stat__label {
    color: var(--sf-colour-muted);
    font-size: var(--sf-step--1);
    font-weight: 700;
  }

  .sf-testimonial {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    box-shadow: var(--sf-shadow-sm);
    display: grid;
    gap: var(--sf-space-s);
    padding: var(--sf-space-m-l);
  }

  .sf-testimonial__quote {
    font-family: var(--sf-font-display);
    font-size: var(--sf-step-2);
    font-weight: 700;
    line-height: var(--sf-line-height-heading);
    text-wrap: balance;
  }

  .sf-testimonial__meta {
    color: var(--sf-colour-muted);
    font-size: var(--sf-step--1);
    font-weight: 700;
  }

  .sf-pricing-grid {
    container-type: inline-size;
    display: grid;
    gap: var(--sf-grid-gap, var(--sf-gutter));
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--sf-pricing-min, 18rem)), 1fr));
  }

  .sf-price-card {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-price-card-border, var(--sf-colour-border));
    border-radius: var(--sf-radius-panel);
    box-shadow: var(--sf-price-card-shadow, var(--sf-shadow-sm));
    display: grid;
    gap: var(--sf-space-s);
    padding: var(--sf-space-m-l);
  }

  .sf-price-card[data-featured="true"],
  .sf-price-card--featured {
    --sf-price-card-border: color-mix(in oklch, var(--sf-colour-primary) 44%, var(--sf-colour-border));
    --sf-price-card-shadow: var(--sf-shadow-md);
  }

  .sf-price {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-space-2xs);
  }

  .sf-price__value {
    font-family: var(--sf-font-display);
    font-size: var(--sf-step-5);
    font-weight: 700;
    line-height: var(--sf-line-height-tight);
  }

  .sf-price__interval {
    color: var(--sf-colour-muted);
    font-size: var(--sf-step--1);
    font-weight: 700;
  }

  .sf-faq {
    display: grid;
    gap: var(--sf-space-xs);
  }

  .sf-faq__item {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-lg);
    padding: var(--sf-space-s);
  }

  .sf-faq__item[open] {
    border-color: color-mix(in oklch, var(--sf-colour-primary) 30%, var(--sf-colour-border));
    box-shadow: var(--sf-shadow-sm);
  }

  .sf-faq__item > summary {
    cursor: pointer;
    font-weight: 800;
  }

  .sf-faq__item > summary:focus-visible {
    border-radius: var(--sf-radius-sm);
    outline: 0.125rem solid var(--sf-colour-ring);
    outline-offset: .2rem;
  }

  .sf-faq__item > :where(p, ul, ol) {
    color: var(--sf-colour-muted);
    margin-block-start: var(--sf-space-xs);
  }

  .sf-cta {
    align-items: center;
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    box-shadow: var(--sf-shadow-md);
    display: grid;
    gap: var(--sf-space-s-m);
    padding: var(--sf-space-l-xl);
  }

  @container (min-width: 48rem) {
    .sf-cta[data-layout="split"] {
      grid-template-columns: minmax(0, 1fr) auto;
    }
  }

  .sf-footer {
    border-block-start: 1px solid var(--sf-colour-border);
    color: var(--sf-colour-muted);
    padding-block: var(--sf-space-l-xl);
  }

  .sf-section-header {
    display: grid;
    gap: var(--sf-space-xs);
    max-inline-size: var(--sf-section-header-width, 54rem);
  }

  .sf-section-header[data-align="center"] {
    margin-inline: auto;
    text-align: center;
  }

  .sf-kicker {
    color: var(--sf-colour-primary);
    font-size: var(--sf-step--1);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .sf-badge {
    align-items: center;
    background: color-mix(in oklch, var(--sf-colour-primary) 12%, transparent);
    border: 1px solid color-mix(in oklch, var(--sf-colour-primary) 24%, transparent);
    border-radius: var(--sf-radius-full);
    color: var(--sf-colour-primary);
    display: inline-flex;
    font-size: var(--sf-step--1);
    font-weight: 700;
    gap: var(--sf-space-3xs);
    line-height: 1;
    padding: .45em .75em;
  }

  .sf-nav {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-nav-gap);
    justify-content: space-between;
  }

  .sf-nav__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-nav-gap);
    list-style: none;
    padding-inline-start: 0;
  }

  .sf-nav__link {
    border-radius: var(--sf-nav-link-radius);
    color: var(--sf-colour-muted);
    display: inline-flex;
    font-size: var(--sf-step--1);
    font-weight: 700;
    padding-block: var(--sf-space-3xs);
    padding-inline: var(--sf-space-2xs);
    text-decoration: none;
    transition: background-color var(--sf-duration-fast) var(--sf-ease-standard), color var(--sf-duration-fast) var(--sf-ease-standard);
  }

  .sf-nav__link:hover,
  .sf-nav__link[aria-current="page"],
  .sf-nav__link[aria-current="true"],
  .sf-nav__link[aria-selected="true"] {
    background: var(--sf-colour-surface-alt);
    color: var(--sf-colour-foreground);
  }

  .sf-form {
    display: grid;
    gap: var(--sf-form-gap, var(--sf-space-s-m));
  }

  .sf-fieldset {
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    display: grid;
    gap: var(--sf-space-s);
    padding: var(--sf-space-s-m);
  }

  .sf-fieldset > legend {
    color: var(--sf-colour-foreground);
    font-weight: 800;
    padding-inline: var(--sf-space-2xs);
  }

  .sf-field {
    display: grid;
    gap: var(--sf-space-2xs);
  }

  .sf-label,
  .sf-field > label {
    color: var(--sf-colour-muted);
    font-size: var(--sf-step--1);
    font-weight: 700;
  }

  .sf-required,
  .sf-label[aria-required="true"],
  .sf-field > label:has(+ :required) {
    color: var(--sf-colour-foreground);
  }

  .sf-required::after,
  .sf-label[aria-required="true"]::after,
  .sf-field > label:has(+ :required)::after {
    color: var(--sf-colour-danger);
    content: " *";
  }

  .sf-help {
    color: var(--sf-colour-subtle);
    font-size: var(--sf-step--1);
    line-height: 1.4;
  }

  .sf-error {
    color: var(--sf-colour-danger);
    font-size: var(--sf-step--1);
    font-weight: 700;
    line-height: 1.4;
  }

  .sf-input,
  .sf-select,
  .sf-textarea {
    background: var(--sf-input-bg);
    border: 1px solid var(--sf-input-border);
    border-radius: var(--sf-input-radius);
    color: var(--sf-colour-foreground);
    inline-size: 100%;
    min-block-size: var(--sf-input-block-size);
    padding-inline: var(--sf-input-padding-inline);
    transition: background-color var(--sf-duration-fast) var(--sf-ease-standard), border-color var(--sf-duration-fast) var(--sf-ease-standard), box-shadow var(--sf-duration-fast) var(--sf-ease-standard);
  }

  .sf-textarea {
    min-block-size: var(--sf-textarea-block-size, 8rem);
    padding-block: var(--sf-space-xs);
  }

  .sf-select {
    appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
    background-position: calc(100% - 1rem) 50%, calc(100% - .7rem) 50%;
    background-repeat: no-repeat;
    background-size: .35rem .35rem, .35rem .35rem;
    padding-inline-end: var(--sf-space-l);
  }

  :where(.sf-input, .sf-select, .sf-textarea)::placeholder {
    color: var(--sf-colour-subtle);
  }

  :where(.sf-input, .sf-select, .sf-textarea):hover {
    border-color: var(--sf-colour-border-strong);
  }

  :where(.sf-input, .sf-select, .sf-textarea):focus-visible {
    border-color: var(--sf-colour-ring);
    box-shadow: 0 0 0 0.25rem color-mix(in oklch, var(--sf-colour-ring) 18%, transparent);
    outline: 0.125rem solid color-mix(in oklch, var(--sf-colour-ring) 24%, transparent);
    outline-offset: 0;
  }

  :where(.sf-input, .sf-select, .sf-textarea)[aria-invalid="true"],
  .sf-field[data-invalid="true"] :where(.sf-input, .sf-select, .sf-textarea) {
    --sf-input-border: var(--sf-colour-danger);
    border-color: var(--sf-colour-danger);
    box-shadow: 0 0 0 0.25rem var(--sf-colour-danger-soft);
  }

  .sf-field[data-invalid="true"] :where(.sf-label, label),
  .sf-field[data-invalid="true"] .sf-help {
    color: var(--sf-colour-danger);
  }

  :where(.sf-input, .sf-select, .sf-textarea):disabled {
    background: var(--sf-colour-surface-alt);
    color: var(--sf-colour-subtle);
    opacity: .72;
  }

  :where(.sf-input, .sf-select, .sf-textarea)[aria-busy="true"],
  :where(.sf-input, .sf-select, .sf-textarea)[data-loading="true"] {
    cursor: progress;
    opacity: .78;
  }

  .sf-check {
    align-items: start;
    display: grid;
    gap: var(--sf-space-2xs);
    grid-template-columns: auto 1fr;
  }

  .sf-check > :where(input[type="checkbox"], input[type="radio"]) {
    accent-color: var(--sf-colour-primary);
    block-size: 1.1em;
    inline-size: 1.1em;
    margin-block-start: .2em;
  }

  .sf-alert {
    background: var(--sf-alert-bg, var(--sf-colour-info-soft));
    border: 1px solid var(--sf-alert-border, color-mix(in oklch, var(--sf-colour-info) 32%, transparent));
    border-radius: var(--sf-alert-radius);
    color: var(--sf-alert-colour, var(--sf-colour-foreground));
    display: grid;
    gap: var(--sf-space-2xs);
    padding: var(--sf-alert-padding);
  }

  .sf-alert__title {
    font-weight: 800;
  }

  .sf-alert--info,
  .sf-alert[data-variant="info"] {
    --sf-alert-bg: var(--sf-colour-info-soft);
    --sf-alert-border: color-mix(in oklch, var(--sf-colour-info) 32%, transparent);
  }

  .sf-alert--success,
  .sf-alert[data-variant="success"] {
    --sf-alert-bg: var(--sf-colour-success-soft);
    --sf-alert-border: color-mix(in oklch, var(--sf-colour-success) 32%, transparent);
  }

  .sf-alert--warning,
  .sf-alert[data-variant="warning"] {
    --sf-alert-bg: var(--sf-colour-warning-soft);
    --sf-alert-border: color-mix(in oklch, var(--sf-colour-warning) 38%, transparent);
  }

  .sf-alert--danger,
  .sf-alert[data-variant="danger"] {
    --sf-alert-bg: var(--sf-colour-danger-soft);
    --sf-alert-border: color-mix(in oklch, var(--sf-colour-danger) 34%, transparent);
  }

  .sf-dialog {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    box-shadow: var(--sf-shadow-xl);
    color: var(--sf-colour-foreground);
    inline-size: min(100% - (var(--sf-gutter) * 2), var(--sf-dialog-width, 42rem));
    max-block-size: min(100% - (var(--sf-gutter) * 2), 42rem);
    overflow: auto;
    padding: 0;
  }

  .sf-dialog::backdrop,
  .sf-popover::backdrop,
  .sf-drawer::backdrop {
    background: oklch(0% 0 0 / 0.48);
  }

  .sf-dialog__header,
  .sf-dialog__body,
  .sf-dialog__footer {
    padding: var(--sf-space-s-m);
  }

  .sf-dialog__header,
  .sf-dialog__footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-space-s);
    justify-content: space-between;
  }

  .sf-dialog__header {
    border-block-end: 1px solid var(--sf-colour-border);
  }

  .sf-dialog__footer {
    border-block-start: 1px solid var(--sf-colour-border);
    justify-content: flex-end;
  }

  .sf-popover,
  .sf-menu-popover,
  .sf-tooltip,
  .sf-toast,
  .sf-banner,
  .sf-drawer {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    box-shadow: var(--sf-shadow-lg);
    color: var(--sf-colour-foreground);
    inset: unset;
    margin: 0;
    max-block-size: calc(100dvh - (var(--sf-space-s) * 2));
    overflow: auto;
    padding: var(--sf-space-s);
  }

  :where(.sf-popover, .sf-menu-popover, .sf-tooltip, .sf-toast, .sf-banner, .sf-drawer)[popover] {
    display: none;
  }

  :where(.sf-popover, .sf-menu-popover, .sf-tooltip, .sf-toast, .sf-banner, .sf-drawer):popover-open {
    display: grid;
    gap: var(--sf-space-xs);
  }

  .sf-popover {
    inline-size: min(100% - (var(--sf-gutter) * 2), var(--sf-popover-width, 22rem));
  }

  .sf-menu-popover,
  .sf-menu {
    display: grid;
    gap: var(--sf-space-2xs);
    min-inline-size: var(--sf-menu-min, 12rem);
  }

  .sf-menu :where(a, button),
  .sf-menu-popover :where(a, button) {
    border-radius: var(--sf-radius-sm);
    color: inherit;
    padding-block: var(--sf-space-3xs);
    padding-inline: var(--sf-space-2xs);
    text-align: start;
    text-decoration: none;
  }

  .sf-menu :where(a, button):hover,
  .sf-menu-popover :where(a, button):hover {
    background: var(--sf-colour-surface-alt);
  }

  .sf-tooltip {
    border-radius: var(--sf-radius-md);
    box-shadow: var(--sf-shadow-md);
    font-size: var(--sf-step--1);
    inline-size: max-content;
    max-inline-size: min(22rem, calc(100vw - (var(--sf-gutter) * 2)));
    padding-block: var(--sf-space-2xs);
    padding-inline: var(--sf-space-xs);
  }

  .sf-tooltip-trigger {
    border-block-end: 0.08em dotted currentColor;
    cursor: help;
    text-decoration: none;
  }

  .sf-toast {
    block-size: auto;
    bottom: auto;
    inline-size: min(100% - (var(--sf-gutter) * 2), var(--sf-toast-width, 24rem));
    left: auto;
    position: fixed;
    right: var(--sf-space-s);
    top: var(--sf-space-s);
  }

  .sf-banner {
    block-size: auto;
    border-radius: var(--sf-radius-lg);
    bottom: auto;
    inline-size: min(100% - (var(--sf-gutter) * 2), var(--sf-banner-width, 64rem));
    left: var(--sf-space-s);
    margin-inline: auto;
    position: fixed;
    right: var(--sf-space-s);
    top: var(--sf-space-s);
  }

  .sf-drawer {
    block-size: 100dvh;
    border-radius: 0;
    inline-size: min(100%, var(--sf-drawer-width, 24rem));
    max-block-size: 100dvh;
    overflow: auto;
    position: fixed;
    top: 0;
    bottom: 0;
  }

  .sf-drawer--left {
    left: 0;
    right: auto;
  }

  .sf-drawer--right {
    left: auto;
    right: 0;
  }

  .sf-drawer--bottom {
    block-size: auto;
    border-start-start-radius: var(--sf-radius-panel);
    border-start-end-radius: var(--sf-radius-panel);
    inline-size: 100%;
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    max-block-size: min(80dvh, 42rem);
  }

  .sf-drawer--stack {
    display: flex;
    flex-direction: column;
    gap: var(--sf-space-s);
  }

  .sf-drawer--stack:popover-open {
    display: flex;
  }

  @supports (anchor-name: --sf-anchor) {
    .sf-tooltip-trigger,
    [data-sf-anchor] {
      anchor-name: var(--sf-anchor-name, --sf-anchor);
    }

    .sf-tooltip,
    .sf-popover,
    .sf-menu-popover {
      position-anchor: var(--sf-anchor-name, --sf-anchor);
      position-area: block-end span-inline-end;
      position-try-fallbacks: flip-block, flip-inline;
    }
  }

  .sf-disclosure,
  .sf-accordion {
    display: grid;
    gap: var(--sf-space-xs);
  }

  .sf-disclosure > details,
  details.sf-disclosure,
  .sf-accordion > details {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-lg);
    padding: var(--sf-space-s);
  }

  .sf-disclosure summary,
  .sf-accordion summary {
    cursor: pointer;
    font-weight: 800;
  }

  .sf-disclosure :where(details[open]),
  details.sf-disclosure[open],
  .sf-accordion details[open] {
    border-color: color-mix(in oklch, var(--sf-colour-primary) 30%, var(--sf-colour-border));
    box-shadow: var(--sf-shadow-sm);
  }

  .sf-tabs {
    display: grid;
    gap: var(--sf-space-s);
  }

  .sf-tab-list {
    align-items: center;
    border-block-end: 1px solid var(--sf-colour-border);
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-space-2xs);
  }

  .sf-tab {
    border-block-end: 0.125rem solid transparent;
    color: var(--sf-colour-muted);
    display: inline-flex;
    font-weight: 800;
    padding-block: var(--sf-space-xs);
    padding-inline: var(--sf-space-s);
    text-decoration: none;
  }

  .sf-tab:hover,
  .sf-tab[aria-selected="true"],
  .sf-tab[data-state="active"] {
    border-block-end-color: var(--sf-colour-primary);
    color: var(--sf-colour-foreground);
  }

  .sf-tab-panel {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    padding: var(--sf-space-s-m);
  }

  .sf-tabs > input[type="radio"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .sf-tabs > input[type="radio"] ~ .sf-tab-panels > .sf-tab-panel {
    display: none;
  }

  .sf-tabs > input[type="radio"]:nth-of-type(1):checked ~ .sf-tab-panels > .sf-tab-panel:nth-child(1),
  .sf-tabs > input[type="radio"]:nth-of-type(2):checked ~ .sf-tab-panels > .sf-tab-panel:nth-child(2),
  .sf-tabs > input[type="radio"]:nth-of-type(3):checked ~ .sf-tab-panels > .sf-tab-panel:nth-child(3),
  .sf-tabs > input[type="radio"]:nth-of-type(4):checked ~ .sf-tab-panels > .sf-tab-panel:nth-child(4),
  .sf-tabs > input[type="radio"]:nth-of-type(5):checked ~ .sf-tab-panels > .sf-tab-panel:nth-child(5) {
    display: block;
  }

  .sf-nav--mobile {
    align-items: center;
    display: flex;
    gap: var(--sf-space-s);
    justify-content: space-between;
  }

  .sf-breadcrumb,
  .sf-pagination {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sf-space-2xs);
    list-style: none;
    padding-inline-start: 0;
  }

  .sf-breadcrumb a,
  .sf-pagination a,
  .sf-pagination [aria-current="page"] {
    border-radius: var(--sf-radius-sm);
    color: var(--sf-colour-muted);
    display: inline-flex;
    font-size: var(--sf-step--1);
    font-weight: 700;
    padding-block: var(--sf-space-3xs);
    padding-inline: var(--sf-space-2xs);
    text-decoration: none;
  }

  .sf-breadcrumb li + li::before {
    color: var(--sf-colour-subtle);
    content: "/";
    margin-inline-end: var(--sf-space-2xs);
  }

  .sf-pagination a:hover,
  .sf-pagination [aria-current="page"] {
    background: var(--sf-colour-surface-alt);
    color: var(--sf-colour-foreground);
  }

  @media (forced-colors: active) {
    :where(.sf-button, .sf-card, .sf-surface, .sf-alert, .sf-price-card, .sf-testimonial, .sf-faq__item, .sf-input, .sf-select, .sf-textarea, .sf-dialog, .sf-popover, .sf-tooltip, .sf-toast, .sf-banner, .sf-drawer, .sf-disclosure > details, details.sf-disclosure, .sf-accordion > details, .sf-tab-panel) {
      border-color: ButtonText;
      forced-color-adjust: auto;
    }

    .sf-button {
      background: ButtonFace;
      color: ButtonText;
    }

    .sf-button--default,
    .sf-button[data-variant="default"] {
      background: Highlight;
      border-color: Highlight;
      color: HighlightText;
    }

    :where(.sf-input, .sf-select, .sf-textarea)[aria-invalid="true"],
    .sf-field[data-invalid="true"] :where(.sf-input, .sf-select, .sf-textarea) {
      border-color: Mark;
      box-shadow: none;
    }
  }
}`
}

function buildUtilityCss() {
  const typeUtilities = [
    ['caption', 'var(--sf-step--1)', '1.35'],
    ['body', 'var(--sf-step-0)', '1.5'],
    ['lead', 'var(--sf-step-1)', '1.45'],
    ['h4', 'var(--sf-step-3)', '1.1'],
    ['h3', 'var(--sf-step-4)', '1.05'],
    ['h2', 'var(--sf-step-5)', '1'],
    ['h1', 'var(--sf-step-6)', '1'],
    ['display', 'var(--sf-step-7)', '.95'],
  ].map(([name, size, lineHeight]) => `  .sf-text-${name} { font-size: ${size}; line-height: ${lineHeight}; }`)

  return `@layer utilities {
${typeUtilities.join('\n')}

  .sf-text-balance { text-wrap: balance; }
  .sf-text-pretty { text-wrap: pretty; }
  .sf-text-muted { color: var(--sf-colour-muted); }
  .sf-text-subtle { color: var(--sf-colour-subtle); }
  .sf-text-primary { color: var(--sf-colour-primary); }
  .sf-text-success { color: var(--sf-colour-success); }
  .sf-text-warning { color: var(--sf-colour-warning); }
  .sf-text-danger { color: var(--sf-colour-danger); }

  .sf-font-sans { font-family: var(--sf-font-sans); }
  .sf-font-display { font-family: var(--sf-font-display); }
  .sf-font-mono { font-family: var(--sf-font-mono); }

  .sf-bg-background { background: var(--sf-colour-background); }
  .sf-bg-surface { background: var(--sf-colour-surface); }
  .sf-bg-surface-alt { background: var(--sf-colour-surface-alt); }
  .sf-bg-primary-soft { background: var(--sf-colour-primary-soft); }
  .sf-bg-success-soft { background: var(--sf-colour-success-soft); }
  .sf-bg-warning-soft { background: var(--sf-colour-warning-soft); }
  .sf-bg-danger-soft { background: var(--sf-colour-danger-soft); }

  .sf-border { border: 1px solid var(--sf-colour-border); }
  .sf-border-strong { border: 1px solid var(--sf-colour-border-strong); }
  .sf-rounded { border-radius: var(--sf-radius-md); }
  .sf-rounded-panel { border-radius: var(--sf-radius-panel); }
  .sf-rounded-full { border-radius: var(--sf-radius-full); }
  .sf-shadow-sm { box-shadow: var(--sf-shadow-sm); }
  .sf-shadow-md { box-shadow: var(--sf-shadow-md); }
  .sf-shadow-lg { box-shadow: var(--sf-shadow-lg); }
  .sf-shadow-none { box-shadow: none; }

  .sf-prose {
    max-inline-size: var(--sf-prose-width, 68ch);
  }

  .sf-prose--blog { --sf-prose-width: 72ch; }
  .sf-prose--legal { --sf-prose-width: 80ch; }

  :where(.sf-prose--blog, .sf-prose--legal) > * + * {
    margin-block-start: var(--sf-space-s);
  }

  :where(.sf-prose--blog, .sf-prose--legal) :where(h2, h3) {
    margin-block-start: var(--sf-space-l);
  }

  .sf-meta {
    align-items: center;
    color: var(--sf-colour-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: var(--sf-step--1);
    font-weight: 700;
    gap: var(--sf-space-2xs);
  }

  .sf-figure {
    display: grid;
    gap: var(--sf-space-xs);
  }

  .sf-caption {
    color: var(--sf-colour-muted);
    font-size: var(--sf-step--1);
  }

  .sf-table-wrap {
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-radius-panel);
    overflow-x: auto;
  }

  .sf-table-wrap table {
    border-collapse: collapse;
    inline-size: 100%;
    min-inline-size: var(--sf-table-min, 42rem);
  }

  .sf-table-wrap :where(th, td) {
    border-block-end: 1px solid var(--sf-colour-border);
    padding: var(--sf-space-xs);
    text-align: start;
  }

  .sf-table-wrap :where(th) {
    background: var(--sf-colour-surface-alt);
    font-weight: 800;
  }

  :where(.sf-visually-hidden, .sr-only) {
    block-size: 0.0625rem;
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    inline-size: 0.0625rem;
    margin: -0.0625rem;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
  }

  :where(.sf-not-visually-hidden, .not-sr-only) {
    block-size: auto;
    clip: auto;
    clip-path: none;
    inline-size: auto;
    margin: 0;
    overflow: visible;
    padding: 0;
    position: static;
    white-space: normal;
  }

  .sf-skip-link {
    background: var(--sf-colour-primary);
    border-radius: var(--sf-radius-md);
    box-shadow: var(--sf-shadow-md);
    color: var(--sf-colour-primary-foreground);
    inset-block-start: var(--sf-space-s);
    inset-inline-start: var(--sf-space-s);
    opacity: 0;
    padding-block: var(--sf-space-2xs);
    padding-inline: var(--sf-space-s);
    pointer-events: none;
    position: fixed;
    text-decoration: none;
    transform: translateY(calc(-100% - var(--sf-space-m)));
    transition: opacity var(--sf-duration-fast) var(--sf-ease-standard), transform var(--sf-duration-fast) var(--sf-ease-standard);
    z-index: 999;
  }

  .sf-skip-link:focus-visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .sf-focus-ring:focus-visible {
    outline: 0.125rem solid var(--sf-colour-ring);
    outline-offset: .2rem;
  }

  .sf-focus-ring-inset:focus-visible {
    outline: 0.125rem solid var(--sf-colour-ring);
    outline-offset: -0.125rem;
  }

  .sf-touch-target {
    min-block-size: 2.75rem;
    min-inline-size: 2.75rem;
  }

  .sf-list-reset {
    list-style: none;
    padding-inline-start: 0;
  }

  .sf-list-disc {
    list-style: disc;
    padding-inline-start: var(--sf-space-m);
  }

  .sf-list-decimal {
    list-style: decimal;
    padding-inline-start: var(--sf-space-m);
  }

  :where(.sf-link, .sf-link-subtle) {
    text-decoration: underline;
    text-decoration-color: color-mix(in oklch, currentColor 45%, transparent);
    text-decoration-skip-ink: auto;
    text-decoration-thickness: .08em;
    text-underline-offset: .18em;
  }

  .sf-link { color: var(--sf-colour-primary); }

  .sf-link:hover,
  .sf-link-subtle:hover {
    text-decoration-color: currentColor;
  }

  .sf-link-plain {
    color: inherit;
    text-decoration: none;
  }

  .sf-full-bleed {
    inline-size: 100vw;
    margin-inline-start: 50%;
    transform: translateX(-50%);
  }

  .sf-animate-fade,
  .sf-animate-rise,
  .sf-animate-scale,
  .sf-animate-slide {
    animation-duration: var(--sf-motion-duration, var(--sf-duration-slow));
    animation-fill-mode: both;
    animation-timing-function: var(--sf-motion-ease, var(--sf-ease-emphasized));
  }

  .sf-animate-fade { animation-name: sf-fade; }
  .sf-animate-rise { animation-name: sf-rise; }
  .sf-animate-scale { animation-name: sf-scale; }
  .sf-animate-slide { animation-name: sf-slide; }

  .sf-animate-stagger > * {
    animation-delay: calc(var(--sf-stagger-index, 0) * var(--sf-stagger-step, 80ms));
  }

  @keyframes sf-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes sf-rise {
    from { opacity: 0; transform: translateY(var(--sf-motion-distance, var(--sf-space-s))); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes sf-scale {
    from { opacity: 0; transform: scale(.96); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes sf-slide {
    from { opacity: 0; transform: translateX(var(--sf-motion-distance, var(--sf-space-s))); }
    to { opacity: 1; transform: translateX(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    :where(.sf-animate-fade, .sf-animate-rise, .sf-animate-scale, .sf-animate-slide) {
      animation: none;
    }
  }
}`
}

const generatedComment = '/* Generated by @synced/fluid. Edit src/tokens.mjs or scripts/build-css.mjs, then run pnpm build. */'
const layerOrder = '@layer reset, tokens, base, app, layout, components, utilities;'

function buildCssFile(sections) {
  return `${block([generatedComment, layerOrder, ...sections])}\n`
}

function buildCssOutputs() {
  return {
    'tokens.css': buildCssFile([buildTokensCss()]),
    'reset.css': buildCssFile([buildResetCss()]),
    'base.css': buildCssFile([buildBaseCss()]),
    'app.css': buildCssFile([buildAppCss()]),
    'layout.css': buildCssFile([buildLayoutCss()]),
    'components.css': buildCssFile([buildComponentCss()]),
    'utilities.css': buildCssFile([buildUtilityCss()]),
    'styles.css': buildCssFile([
      buildTokensCss(),
      buildResetCss(),
      buildBaseCss(),
      buildLayoutCss(),
      buildComponentCss(),
      buildUtilityCss(),
    ]),
  }
}

function writeCssFile(file, css) {
  const tempFile = `${file}.${process.pid}.tmp`
  writeFileSync(tempFile, css)
  renameSync(tempFile, file)
}

const outputs = buildCssOutputs()

if (checkOnly) {
  let failed = false
  for (const [fileName, css] of Object.entries(outputs)) {
    const file = join(packageRoot, fileName)
    const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
    if (current !== css) {
      console.error(`${fileName} is out of date. Run pnpm build.`)
      failed = true
    }
  }
  if (failed) process.exit(1)
} else {
  for (const [fileName, css] of Object.entries(outputs)) {
    writeCssFile(join(packageRoot, fileName), css)
  }
}
