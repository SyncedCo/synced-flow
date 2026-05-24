import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ['.'],
  out: 'synced-fluid.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
})
