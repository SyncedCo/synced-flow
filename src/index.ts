export { defineConfig, type SyncedFluidConfig, type SyncedFluidTheme } from './config.js'
export { presetNames, themePresets } from '../src/presets.mjs'

export type ClassValue = string | number | boolean | null | undefined | ClassValue[] | Record<string, unknown>

export function cx(...inputs: ClassValue[]) {
  const classes: string[] = []

  for (const input of inputs) appendClassValue(classes, input)

  return classes.join(' ')
}

function appendClassValue(classes: string[], value: ClassValue): void {
  if (!value) return

  if (typeof value === 'string' || typeof value === 'number') {
    classes.push(String(value))
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) appendClassValue(classes, item)
    return
  }

  if (typeof value === 'object') {
    for (const [className, enabled] of Object.entries(value)) {
      if (enabled) classes.push(className)
    }
  }
}

export const fluidSystem = {
  layout: {
    container: 'sf-container',
    section: 'sf-section',
    stack: 'sf-stack',
    cluster: 'sf-cluster',
    repel: 'sf-repel',
    grid: 'sf-grid',
    autoGrid: 'sf-auto-grid',
    sidebar: 'sf-sidebar',
    switcher: 'sf-switcher',
    frame: 'sf-frame',
    cover: 'sf-cover',
    flow: 'sf-flow',
  },
  components: {
    button: 'sf-button',
    card: 'sf-card',
    badge: 'sf-badge',
    field: 'sf-field',
    input: 'sf-input',
  },
  utilities: {
    visuallyHidden: 'sf-visually-hidden',
    prose: 'sf-prose',
  },
} as const

export type FluidSystem = typeof fluidSystem
