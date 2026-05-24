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
      link: 'oklch(58% 0.17 42)',
      linkHover: 'oklch(68% 0.18 44)',
      ring: 'oklch(68% 0.18 44)',
    },
    components: {
      button: {
        radius: '0.5rem',
        blockSize: '2.75rem',
        paddingInline: 'var(--sf-space-s)',
      },
      card: {
        radius: '0.75rem',
        padding: 'var(--sf-space-m-l)',
      },
      input: {
        radius: '0.5rem',
        blockSize: '2.75rem',
      },
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
      link: 'oklch(45% 0.13 250)',
      linkHover: 'oklch(52% 0.14 250)',
      ring: 'oklch(52% 0.14 250)',
    },
    layout: {
      containerMax: '76rem',
      gutter: 'var(--sf-space-s-l)',
    },
    components: {
      button: {
        radius: '0.5rem',
        blockSize: '2.625rem',
      },
      card: {
        radius: '0.625rem',
      },
      input: {
        radius: '0.5rem',
        blockSize: '2.625rem',
      },
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
      link: 'oklch(50% 0.16 40)',
      linkHover: 'oklch(58% 0.17 42)',
      ring: 'oklch(58% 0.17 42)',
    },
    layout: {
      containerMax: '72rem',
      gutter: 'var(--sf-space-m-l)',
    },
    components: {
      button: {
        radius: '999rem',
        blockSize: '2.75rem',
      },
      card: {
        radius: '0.5rem',
        padding: 'var(--sf-space-l)',
      },
      input: {
        radius: '0.375rem',
      },
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
      link: 'oklch(76% 0.12 205)',
      linkHover: 'oklch(82% 0.1 205)',
      ring: 'oklch(70% 0.12 205)',
    },
    darkColours: {
      background: 'oklch(13.5% 0.03 252)',
      foreground: 'oklch(96% 0.008 86)',
      muted: 'oklch(78% 0.012 86)',
      subtle: 'oklch(68% 0.012 86)',
      surface: 'oklch(18% 0.026 250)',
      surfaceAlt: 'oklch(22% 0.024 248)',
      surfaceRaised: 'oklch(21% 0.028 250)',
      surfaceInset: 'oklch(15% 0.03 252)',
      border: 'oklch(100% 0 0 / 0.14)',
      borderStrong: 'oklch(100% 0 0 / 0.24)',
      primarySoft: 'oklch(70% 0.12 205 / 0.16)',
      primarySoftBorder: 'oklch(70% 0.12 205 / 0.32)',
      link: 'oklch(76% 0.12 205)',
      linkHover: 'oklch(82% 0.1 205)',
      ring: 'oklch(70% 0.12 205)',
    },
    layout: {
      containerMax: '80rem',
      gutter: 'var(--sf-space-s-l)',
    },
    components: {
      button: {
        radius: '0.5rem',
        blockSize: '2.625rem',
      },
      card: {
        radius: '0.75rem',
      },
      input: {
        radius: '0.5rem',
        blockSize: '2.625rem',
      },
    },
  },
}

export const presetNames = Object.keys(themePresets)
