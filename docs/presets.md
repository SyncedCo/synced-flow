# Presets

Synced Fluid ships a small set of theme presets. They are intentionally simple:
fonts, semantic colours, and a few layout defaults.

```js
import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ['src'],
  out: 'src/synced-fluid.generated.css',
  theme: themePresets.neutralSaas,
})
```

## Available Presets

| Preset | Use for |
| --- | --- |
| `synced` | Synced brand and warm marketing pages. |
| `neutralSaas` | Calm SaaS, admin, and B2B apps. |
| `editorial` | Content-heavy marketing and article-led sites. |
| `darkApp` | Dark dashboards, tools, and app surfaces. |

CLI aliases use kebab case:

```bash
synced-fluid init --theme synced
synced-fluid init --theme neutral-saas
synced-fluid init --theme editorial
synced-fluid init --theme dark-app
```
