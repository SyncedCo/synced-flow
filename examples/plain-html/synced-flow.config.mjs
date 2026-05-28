import { defineConfig } from '@synced/flow/config'
import { themePresets } from '@synced/flow/presets'

export default defineConfig({
  scan: ['.'],
  out: 'synced-flow.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
})
