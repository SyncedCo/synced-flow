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
| `app-shell-layout` | Fixed header, sidebar, collapsed state, and mobile drawer app shell. |
| `row-action-menu` | Native popover row actions with destructive menu item styling. |
| `tabs-with-counts` | Pill tabs with compact count chips. |
| `data-table-actions` | Sortable header controls, clickable rows, and responsive card fallback. |
| `search-field` | Labelled native search input with icon shell and compact density. |
| `modal-form` | Native dialog layout for form body and footer actions. |
| `toast-stack` | Fixed app notification stack layout. |
| `filter-toolbar` | Search, filters, and actions above app lists and tables. |
| `date-filter-form` | Native date/time inputs inside filter forms. |
| `active-filter-tags` | Visible selected filter tags with remove and clear actions. |
| `data-table` | Native responsive table markup with status pills. |
| `empty-state` | No-results and first-run states with clear next actions. |
| `settings-section` | Settings/detail sections for account, team, billing, and security screens. |
| `switch-control` | Native checkbox-backed binary setting switch. |
| `input-group` | Prefix, suffix, unit, or inline-action input composition. |
| `native-file-and-range` | Styled native file and bounded range inputs. |
| `segmented-control` | Native radio-backed mutually exclusive choice. |
| `loading-button` | Busy action with spinner and text/live-region guidance. |
| `searchable-select` | Presentation shell and complete app-owned combobox contract. |
| `bulk-actions-toolbar` | Selection count and list/table actions. |
| `complete-pagination` | Result context, page links, page size, and direct page entry. |
| `multi-step-form` | Step progress and form navigation structure with textual current and completed states. |

Pattern JSON includes:

- `classes`: public Synced Flow classes used by the pattern
- `requiresJs` and `requiresJsNotes`: whether CSS/HTML alone is enough
- `a11y`: accessibility requirements to preserve when editing
- `gotchas`: browser or markup details that agents commonly miss
- `markup`: framework-specific starter markup where useful

Use patterns before hand-rolling interaction markup. Use recipes for full-page
composition and patterns for the tricky native interaction details inside those
pages.

Patterns with `requiresJs: true` are presentation and markup contracts. Synced
Flow deliberately does not pretend that CSS supplies combobox keyboard
behavior, async state, row selection, or wizard validation. The consuming app
owns those behaviors and their browser/assistive-technology tests.

Wizard completion cannot rely on the tick marker alone. Keep that decorative
marker hidden from assistive technology and prefix completed labels with
screen-reader text such as `Completed:`.
