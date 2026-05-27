import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ['src'],
  out: 'src/styles/synced-fluid.generated.css',
  responsiveVariants: false,
  theme: themePresets.editorial,
})
