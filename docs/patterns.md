# Interaction Patterns

Synced Flow patterns are copy-ready HTML/CSS-native building blocks for common
website interactions. They are not JavaScript components.

```bash
pnpm exec synced-flow pattern --list
pnpm exec synced-flow pattern mobile-nav-drawer --framework next --markup
pnpm exec synced-flow pattern scroll-viewport-sections --json
```

## Pattern IDs

| ID | Use |
| --- | --- |
| `mobile-nav-drawer` | Mobile burger, popover drawer, close button, and vertical nav list. |
| `scroll-viewport-sections` | Sticky section nav plus full-height scroll snap panels. |
| `scroll-viewport-with-spy` | Scroll snap panels with optional IntersectionObserver active-state notes. |
| `native-dialog-react` | Native `<dialog>` markup plus React/Next fallback shape. |
| `popover-drawer-layout` | Popover-backed drawer or filter panel with `sf-drawer--stack`. |
| `filter-toolbar` | Search, filters, and actions above app lists and tables. |
| `date-filter-form` | Native date/time inputs inside filter forms. |
| `active-filter-tags` | Visible selected filter tags with remove and clear actions. |
| `data-table` | Native responsive table markup with status pills. |
| `empty-state` | No-results and first-run states with clear next actions. |
| `settings-section` | Settings/detail sections for account, team, billing, and security screens. |

Pattern JSON includes:

- `classes`: public Synced Flow classes used by the pattern
- `requiresJs` and `requiresJsNotes`: whether CSS/HTML alone is enough
- `a11y`: accessibility requirements to preserve when editing
- `gotchas`: browser or markup details that agents commonly miss
- `markup`: framework-specific starter markup where useful

Use patterns before hand-rolling interaction markup. Use recipes for full-page
composition and patterns for the tricky native interaction details inside those
pages.
