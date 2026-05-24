# Presets

Synced Fluid ships a small set of theme presets. They are intentionally small:
fonts, semantic colours, layout defaults, and component token adjustments. The
same public primitives should work across every preset.

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
| `synced` | Synced brand and warm marketing pages. Warm primary action, serif display, balanced component radius. |
| `neutralSaas` | Calm SaaS, admin, and B2B apps. Neutral surfaces, blue action colour, slightly tighter controls. |
| `editorial` | Content-heavy marketing and article-led sites. Narrower measure, round action buttons, more generous cards. |
| `darkApp` | Dark dashboards, tools, and app surfaces. Dark semantic colours, stronger borders, compact controls. |

CLI aliases use kebab case:

```bash
synced-fluid init --theme synced
synced-fluid init --theme neutral-saas
synced-fluid init --theme editorial
synced-fluid init --theme dark-app
```

## What Presets Override

Presets use the same config surface available to consuming projects:

- `fonts` for `--sf-font-*`.
- `colours` and `darkColours` for semantic `--sf-colour-*` roles.
- `layout` for container width, gutter, and grid defaults.
- `components` for button, card, and input sizing/radius.

Keep project-specific brand details in the consuming app config. Presets should
stay broad enough to start a category of project without becoming full themes.

## Preset Confidence Rule

Every preset should support the same recipe snippets:

- marketing homepage
- SaaS product page
- documentation page
- contact form
- app shell
- pricing and FAQ

If a preset needs page-specific CSS to make those recipes usable, improve the
preset tokens before adding new classes.
