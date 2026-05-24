import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ['app', 'components', 'lib'],
  out: 'app/synced-fluid.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
})
