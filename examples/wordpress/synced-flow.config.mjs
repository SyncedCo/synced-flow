import { defineConfig } from '@synced/flow/config'
import { themePresets } from '@synced/flow/presets'

export default defineConfig({
  scan: ['templates', 'parts', 'patterns', 'assets'],
  out: 'assets/css/synced-flow.css',
  includeCore: true,
  includeApp: true,
  responsiveVariants: false,
  theme: themePresets.synced,
})
