import { defineConfig } from '@synced/flow/config'
import { themePresets } from '@synced/flow/presets'

export default defineConfig({
  scan: ['app', 'components', 'lib'],
  out: 'app/synced-flow.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
})
