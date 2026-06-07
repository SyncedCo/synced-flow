import { defineConfig } from '@syncedco/flow/config'
import { themePresets } from '@syncedco/flow/presets'

export default defineConfig({
  scan: ['src'],
  out: 'src/styles/synced-flow.generated.css',
  responsiveVariants: false,
  theme: themePresets.editorial,
})
