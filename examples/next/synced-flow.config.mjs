import { defineConfig } from '@syncedco/flow/config'
import { themePresets } from '@syncedco/flow/presets'

export default defineConfig({
  scan: ['app', 'components', 'lib'],
  out: 'app/synced-flow.generated.css',
  responsiveVariants: false,
  theme: themePresets.synced,
})
