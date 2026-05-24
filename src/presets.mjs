export const themePresets = {
  synced: {
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      display: 'Fraunces, Georgia, serif',
    },
    colours: {
      background: 'oklch(98.6% 0.006 80)',
      foreground: 'oklch(18% 0.026 250)',
      muted: 'oklch(45% 0.018 236)',
      surface: 'oklch(100% 0 0)',
      surfaceAlt: 'oklch(96.4% 0.011 80)',
      border: 'oklch(18% 0.026 250 / 0.12)',
      primary: 'oklch(68% 0.18 44)',
      primaryHover: 'oklch(60% 0.17 42)',
      primaryForeground: 'oklch(100% 0 0)',
      accent: 'oklch(70% 0.12 205)',
    },
  },
  neutralSaas: {
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      display: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
    colours: {
      background: 'oklch(98.5% 0.002 247)',
      foreground: 'oklch(20.8% 0.042 265)',
      muted: 'oklch(44.6% 0.043 257)',
      surface: 'oklch(100% 0 0)',
      surfaceAlt: 'oklch(96.8% 0.007 247)',
      border: 'oklch(20.8% 0.042 265 / 0.12)',
      primary: 'oklch(52% 0.14 250)',
      primaryHover: 'oklch(44% 0.13 250)',
      primaryForeground: 'oklch(100% 0 0)',
      accent: 'oklch(70% 0.12 205)',
    },
    layout: {
      containerMax: '76rem',
    },
  },
  editorial: {
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      display: 'Fraunces, Georgia, serif',
    },
    colours: {
      background: 'oklch(97% 0.018 78)',
      foreground: 'oklch(18% 0.022 55)',
      muted: 'oklch(43% 0.02 65)',
      surface: 'oklch(100% 0 0)',
      surfaceAlt: 'oklch(94% 0.02 80)',
      border: 'oklch(18% 0.022 55 / 0.14)',
      primary: 'oklch(58% 0.17 42)',
      primaryHover: 'oklch(50% 0.16 40)',
      primaryForeground: 'oklch(100% 0 0)',
      accent: 'oklch(62% 0.13 150)',
    },
    layout: {
      containerMax: '72rem',
    },
  },
  darkApp: {
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      display: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
    colours: {
      background: 'oklch(13.5% 0.03 252)',
      foreground: 'oklch(96% 0.008 86)',
      muted: 'oklch(78% 0.012 86)',
      surface: 'oklch(18% 0.026 250)',
      surfaceAlt: 'oklch(22% 0.024 248)',
      border: 'oklch(100% 0 0 / 0.14)',
      primary: 'oklch(70% 0.12 205)',
      primaryHover: 'oklch(76% 0.12 205)',
      primaryForeground: 'oklch(13.5% 0.03 252)',
      accent: 'oklch(68% 0.18 44)',
    },
    darkColours: {
      background: 'oklch(13.5% 0.03 252)',
      foreground: 'oklch(96% 0.008 86)',
      muted: 'oklch(78% 0.012 86)',
      surface: 'oklch(18% 0.026 250)',
      surfaceAlt: 'oklch(22% 0.024 248)',
      border: 'oklch(100% 0 0 / 0.14)',
    },
  },
}

export const presetNames = Object.keys(themePresets)
