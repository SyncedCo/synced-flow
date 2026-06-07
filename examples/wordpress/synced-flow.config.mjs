import { defineConfig } from '@syncedco/flow/config'
import { themePresets } from '@syncedco/flow/presets'

export default defineConfig({
  scan: ['templates', 'parts', 'patterns', 'assets'],
  out: 'assets/css/synced-flow.css',
  includeCore: true,
  includeDefaults: true,
  responsiveVariants: false,
  theme: themePresets.synced,
})
