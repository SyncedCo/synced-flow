export const fluidConfig = {
  minViewport: 360,
  maxViewport: 1536,
  minRoot: 16,
  maxRoot: 18,
  minTypeScale: 1.2,
  maxTypeScale: 1.25,
  typeMinStep: -2,
  typeMaxStep: 8,
  gridColumns: 12,
  gridMaxWidthRem: 90,
}

export const primitiveTokens = {
  fonts: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'Fraunces, Georgia, "Times New Roman", serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },
  colours: {
    neutral0: 'oklch(100% 0 0)',
    neutral50: 'oklch(98.6% 0.006 80)',
    neutral100: 'oklch(96.4% 0.011 80)',
    neutral200: 'oklch(90.8% 0.014 78)',
    neutral300: 'oklch(82% 0.018 76)',
    neutral500: 'oklch(53% 0.018 244)',
    neutral700: 'oklch(34% 0.02 244)',
    neutral850: 'oklch(22% 0.024 248)',
    neutral900: 'oklch(18% 0.026 250)',
    neutral950: 'oklch(13.5% 0.03 252)',
    orange500: 'oklch(74% 0.17 48)',
    orange600: 'oklch(68% 0.18 44)',
    orange700: 'oklch(58% 0.17 42)',
    green500: 'oklch(62% 0.13 150)',
    green700: 'oklch(44% 0.12 150)',
    cyan500: 'oklch(70% 0.12 205)',
    blue600: 'oklch(52% 0.14 250)',
    red600: 'oklch(56% 0.2 28)',
  },
  radii: {
    none: '0',
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '999rem',
  },
  shadows: {
    sm: '0 0.125rem 0.375rem oklch(0% 0 0 / 0.08)',
    md: '0 0.75rem 1.75rem oklch(0% 0 0 / 0.12)',
    lg: '0 1.25rem 3rem oklch(0% 0 0 / 0.16)',
    glow: '0 0 2rem oklch(68% 0.18 44 / 0.24)',
  },
}

export const semanticTokens = {
  colours: {
    background: 'var(--sf-colour-neutral-50)',
    foreground: 'var(--sf-colour-neutral-900)',
    muted: 'var(--sf-colour-neutral-700)',
    subtle: 'var(--sf-colour-neutral-500)',
    surface: 'var(--sf-colour-neutral-0)',
    surfaceAlt: 'var(--sf-colour-neutral-100)',
    border: 'oklch(18% 0.026 250 / 0.12)',
    primary: 'var(--sf-colour-orange-600)',
    primaryHover: 'var(--sf-colour-orange-700)',
    primaryForeground: 'var(--sf-colour-neutral-0)',
    accent: 'var(--sf-colour-cyan-500)',
    success: 'var(--sf-colour-green-500)',
    danger: 'var(--sf-colour-red-600)',
    ring: 'var(--sf-colour-orange-600)',
  },
}

export const componentTokens = {
  button: {
    radius: 'var(--sf-radius-md)',
    blockSize: '2.75rem',
    paddingInline: 'var(--sf-space-s)',
  },
  card: {
    radius: 'var(--sf-radius-lg)',
    padding: 'var(--sf-space-m-l)',
  },
  input: {
    radius: 'var(--sf-radius-md)',
    blockSize: '2.75rem',
  },
}

export const tokens = {
  fluidConfig,
  primitiveTokens,
  semanticTokens,
  componentTokens,
}
