import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ['templates', 'parts', 'patterns', 'assets'],
  out: 'assets/css/synced-fluid.css',
  includeCore: true,
  includeApp: true,
  responsiveVariants: false,
  theme: themePresets.synced,
})
