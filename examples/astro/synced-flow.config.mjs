import { defineConfig } from '@synced/flow/config'
import { themePresets } from '@synced/flow/presets'

export default defineConfig({
  scan: ['src'],
  out: 'src/styles/synced-flow.generated.css',
  responsiveVariants: false,
  theme: themePresets.editorial,
})
