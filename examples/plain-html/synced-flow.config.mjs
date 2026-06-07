import { defineConfig } from '@syncedco/flow/config'
import { themePresets } from '@syncedco/flow/presets'

export default defineConfig({
  scan: ['.'],
  out: 'synced-flow.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
})
