export { defineConfig, type SyncedFlowConfig, type SyncedFlowTheme } from './config.js'
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
    buttonGroup: 'sf-button-group',
    icon: 'sf-icon',
    iconButton: 'sf-icon-button',
    card: 'sf-card',
    surface: 'sf-surface',
    hero: 'sf-hero',
    logoCloud: 'sf-logo-cloud',
    feature: 'sf-feature',
    stats: 'sf-stats',
    testimonial: 'sf-testimonial',
    pricingGrid: 'sf-pricing-grid',
    faq: 'sf-faq',
    callToAction: 'sf-cta',
    footer: 'sf-footer',
    badge: 'sf-badge',
    avatar: 'sf-avatar',
    alert: 'sf-alert',
    status: 'sf-status',
    sectionHeader: 'sf-section-header',
    kicker: 'sf-kicker',
    nav: 'sf-nav',
    form: 'sf-form',
    fieldset: 'sf-fieldset',
    field: 'sf-field',
    label: 'sf-label',
    help: 'sf-help',
    error: 'sf-error',
    input: 'sf-input',
    inputGroup: 'sf-input-group',
    select: 'sf-select',
    textarea: 'sf-textarea',
    check: 'sf-check',
    switch: 'sf-switch',
    fileInput: 'sf-file-input',
    range: 'sf-range',
    segmentedControl: 'sf-segmented-control',
    spinner: 'sf-spinner',
    search: 'sf-search',
    combobox: 'sf-combobox',
    filterBar: 'sf-filter-bar',
    bulkActions: 'sf-bulk-actions',
    dataTable: 'sf-data-table',
    tableSort: 'sf-table-sort',
    dataList: 'sf-data-list',
    emptyState: 'sf-empty-state',
    settingsSection: 'sf-settings-section',
    detailPanel: 'sf-detail-panel',
    dialog: 'sf-dialog',
    popover: 'sf-popover',
    drawer: 'sf-drawer',
    tooltip: 'sf-tooltip',
    toast: 'sf-toast',
    toastStack: 'sf-toast-stack',
    banner: 'sf-banner',
    disclosure: 'sf-disclosure',
    accordion: 'sf-accordion',
    tabs: 'sf-tabs',
    tab: 'sf-tab',
    menu: 'sf-menu',
    breadcrumb: 'sf-breadcrumb',
    pagination: 'sf-pagination',
    stepper: 'sf-stepper',
    wizardActions: 'sf-wizard-actions',
    progress: 'sf-progress',
    skeleton: 'sf-skeleton',
    chart: 'sf-chart',
    meter: 'sf-meter',
    codeWindow: 'sf-code-window',
    codeLines: 'sf-code-lines',
    tokenStrip: 'sf-token-strip',
    marquee: 'sf-marquee',
    commandList: 'sf-command-list',
    platformCard: 'sf-platform-card',
  },
  utilities: {
    visuallyHidden: 'sf-visually-hidden',
    notVisuallyHidden: 'sf-not-visually-hidden',
    srOnly: 'sr-only',
    notSrOnly: 'not-sr-only',
    skipLink: 'sf-skip-link',
    focusRing: 'sf-focus-ring',
    focusRingInset: 'sf-focus-ring-inset',
    touchTarget: 'sf-touch-target',
    listReset: 'sf-list-reset',
    listDisc: 'sf-list-disc',
    listDecimal: 'sf-list-decimal',
    link: 'sf-link',
    linkSubtle: 'sf-link-subtle',
    linkPlain: 'sf-link-plain',
    prose: 'sf-prose',
  },
} as const

export type FluidSystem = typeof fluidSystem
