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
    --sf-type-title: var(--sf-step-4);
    --sf-type-display: var(--sf-step-7);

${spaceTokens.join('\n')}
${pairTokens.join('\n')}
    --sf-gutter: var(--sf-space-s-l);
    --sf-region: var(--sf-space-xl-2xl);
    --sf-container-max: ${fluidConfig.gridMaxWidthRem}rem;
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

    --sf-button-radius: ${componentTokens.button.radius};
    --sf-button-block-size: ${componentTokens.button.blockSize};
    --sf-button-padding-inline: ${componentTokens.button.paddingInline};
    --sf-card-radius: ${componentTokens.card.radius};
    --sf-card-padding: ${componentTokens.card.padding};
    --sf-input-radius: ${componentTokens.input.radius};
    --sf-input-block-size: ${componentTokens.input.blockSize};
  }

  :where(.sf-theme-dark, [data-sf-theme="dark"]) {
    color-scheme: dark;
    --sf-colour-background: var(--sf-colour-neutral-950);
    --sf-colour-foreground: oklch(96% 0.008 86);
    --sf-colour-muted: oklch(78% 0.012 86);
    --sf-colour-subtle: oklch(64% 0.014 86);
    --sf-colour-surface: var(--sf-colour-neutral-900);
    --sf-colour-surface-alt: var(--sf-colour-neutral-850);
    --sf-colour-border: oklch(100% 0 0 / 0.14);
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
  body {
    background: var(--sf-colour-background);
    color: var(--sf-colour-foreground);
    font-family: var(--sf-font-sans);
    font-size: var(--sf-type-body);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  :where(h1, h2, h3, h4, h5, h6) {
    color: inherit;
    font-family: var(--sf-font-display);
    font-weight: 700;
    line-height: 1;
    text-wrap: balance;
  }

  :where(h1) { font-size: var(--sf-step-6); }
  :where(h2) { font-size: var(--sf-step-5); }
  :where(h3) { font-size: var(--sf-step-4); }
  :where(h4) { font-size: var(--sf-step-3); }
  :where(p, li) { text-wrap: pretty; }
  :where(a) {
    color: inherit;
    text-decoration-color: color-mix(in oklch, currentColor 55%, transparent);
    text-decoration-skip-ink: auto;
    text-decoration-thickness: .08em;
    text-underline-offset: .18em;
  }
  :where(button:not(:disabled), [role="button"]:not(:disabled), a[href]) { cursor: pointer; }
  :where(button:disabled, [aria-disabled="true"]) { cursor: not-allowed; }
  :where(:focus-visible) { outline: 0.125rem solid var(--sf-colour-ring); outline-offset: .2rem; }
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

  .sf-section { padding-block: var(--sf-section-space, var(--sf-region)); }

  .sf-stack {
    display: flex;
    flex-direction: column;
    gap: var(--sf-stack-space, var(--sf-space-s));
  }

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

  .sf-centre {
    box-sizing: content-box;
    margin-inline: auto;
    max-inline-size: var(--sf-centre-size, 65ch);
  }

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

  .sf-card {
    background: var(--sf-card-bg, var(--sf-colour-surface));
    border: 1px solid var(--sf-card-border, var(--sf-colour-border));
    border-radius: var(--sf-card-radius);
    box-shadow: var(--sf-card-shadow, var(--sf-shadow-sm));
    color: var(--sf-card-colour, var(--sf-colour-foreground));
    padding: var(--sf-card-padding);
  }

  .sf-card--interactive {
    transition: border-color var(--sf-duration-normal) var(--sf-ease-standard), box-shadow var(--sf-duration-normal) var(--sf-ease-standard), transform var(--sf-duration-normal) var(--sf-ease-standard);
  }

  .sf-card--interactive:hover {
    border-color: color-mix(in oklch, var(--sf-colour-primary) 32%, var(--sf-colour-border));
    box-shadow: var(--sf-shadow-md);
    transform: translateY(-0.125rem);
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

  .sf-field {
    display: grid;
    gap: var(--sf-space-2xs);
  }

  .sf-field > label {
    color: var(--sf-colour-muted);
    font-size: var(--sf-step--1);
    font-weight: 700;
  }

  .sf-input {
    background: var(--sf-colour-surface);
    border: 1px solid var(--sf-colour-border);
    border-radius: var(--sf-input-radius);
    color: var(--sf-colour-foreground);
    min-block-size: var(--sf-input-block-size);
    padding-inline: var(--sf-space-s);
  }

  .sf-input:focus-visible {
    border-color: var(--sf-colour-ring);
    outline: 0.125rem solid color-mix(in oklch, var(--sf-colour-ring) 24%, transparent);
    outline-offset: 0;
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

  .sf-prose {
    max-inline-size: var(--sf-prose-width, 68ch);
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
    padding-block: var(--sf-space-2xs);
    padding-inline: var(--sf-space-s);
    position: fixed;
    text-decoration: none;
    transform: translateY(calc(-100% - var(--sf-space-m)));
    transition: transform var(--sf-duration-fast) var(--sf-ease-standard);
    z-index: 999;
  }

  .sf-skip-link:focus-visible { transform: translateY(0); }

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
