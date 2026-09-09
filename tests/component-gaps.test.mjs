import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

import { fluidSystem } from '../dist/index.js'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const cli = join(packageRoot, 'bin/synced-flow.mjs')

function run(args) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
}

function generatedComponent(output) {
  const componentStart = output.indexOf('export default function Page()')
  assert.notEqual(componentStart, -1, 'CLI output contains a copy-ready component')
  return output.slice(componentStart)
}

function assertValidTsx(source, label) {
  const file = ts.createSourceFile(`${label}.tsx`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  assert.deepEqual(
    file.parseDiagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')),
    [],
    `${label} parses as TSX`,
  )
}

test('new component selectors ship in generated component CSS', () => {
  const css = readFileSync(join(packageRoot, 'components.css'), 'utf8')
  const selectors = [
    'sf-spinner',
    'sf-input-group',
    'sf-file-input',
    'sf-range',
    'sf-switch',
    'sf-segmented-control',
    'sf-combobox',
    'sf-bulk-actions',
    'sf-stepper',
    'sf-wizard-actions',
    'sf-pagination__summary',
  ]

  for (const selector of selectors) assert.ok(css.includes(`.${selector}`), selector)
  assert.match(css, /\.sf-switch > input\[type="checkbox"\]:checked \+ \.sf-switch__control/)
  assert.match(css, /\.sf-switch > input\[type="checkbox"\]:focus-visible \+ \.sf-switch__control/)
  assert.match(css, /\.sf-switch:has\(input:disabled\)/)
  assert.match(css, /\.sf-segmented-control__option > input\[type="radio"\]:checked \+ \.sf-segmented-control__label/)
  assert.match(css, /\.sf-file-input\[aria-invalid="true"\]/)
  assert.match(css, /\.sf-range:disabled/)
  assert.match(css, /\.sf-input-group:focus-within/)
  assert.match(css, /\.sf-input-group > :where\(\.sf-input, \.sf-select\) \{[\s\S]*flex: 1 1 0%;[\s\S]*min-inline-size: 0;/)
  assert.match(css, /\.sf-form \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);/)
  assert.match(css, /\.sf-field \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\.sf-spinner \{ animation: none;/)
  assert.match(css, /@media \(forced-colors: active\) \{[\s\S]*\.sf-switch__control,[\s\S]*background: Canvas;[\s\S]*border-color: ButtonText;/)
  assert.match(css, /\.sf-switch > input\[type="checkbox"\]:focus-visible \+ \.sf-switch__control,[\s\S]*outline: \.125rem solid Highlight;/)
  assert.match(css, /\.sf-stepper__step\[data-complete="true"\] \.sf-stepper__marker \{[\s\S]*border-color: LinkText;/)
})

test('CLI catalog and patterns expose every new production contract', () => {
  const catalog = JSON.parse(run(['catalog', '--json']))
  const classes = catalog.tokens.starterClasses.components
  const expectedClasses = [
    'sf-spinner',
    'sf-input-group',
    'sf-file-input',
    'sf-range',
    'sf-switch',
    'sf-segmented-control',
    'sf-combobox',
    'sf-bulk-actions',
    'sf-stepper',
    'sf-pagination__jump',
  ]
  for (const className of expectedClasses) assert.ok(classes.includes(className), className)
  const styles = readFileSync(join(packageRoot, 'styles.css'), 'utf8')
  for (const className of classes) {
    assert.ok(styles.includes(`.${className}`), `catalogued component selector ${className} ships in styles.css`)
  }

  const expectedPatterns = [
    'switch-control',
    'input-group',
    'native-file-and-range',
    'segmented-control',
    'loading-button',
    'searchable-select',
    'bulk-actions-toolbar',
    'complete-pagination',
    'multi-step-form',
  ]
  for (const id of expectedPatterns) assert.ok(catalog.patterns.some((pattern) => pattern.id === id), id)

  assert.equal(catalog.patterns.find((pattern) => pattern.id === 'switch-control').requiresJs, false)
  assert.equal(catalog.patterns.find((pattern) => pattern.id === 'searchable-select').requiresJs, true)
  assert.match(run(['pattern', '--list']), /complete-pagination/)
})

test('copy-ready markup preserves native semantics and names app-owned behavior', () => {
  const switchPattern = JSON.parse(run(['pattern', 'switch-control', '--json']))
  assert.match(switchPattern.markup.html, /type="checkbox"/)
  assert.match(switchPattern.markup.html, /role="switch"/)
  assert.doesNotMatch(switchPattern.markup.html, /mixed|indeterminate/)
  assert.ok(switchPattern.gotchas.some((note) => note.includes('no readonly state')))

  const segmented = JSON.parse(run(['pattern', 'segmented-control', '--json']))
  assert.match(segmented.markup.html, /type="radio"/)
  assert.match(segmented.markup.html, /<fieldset/)

  const combobox = JSON.parse(run(['pattern', 'searchable-select', '--json']))
  assert.equal(combobox.requiresJs, true)
  assert.match(combobox.requiresJsNotes, /ARIA combobox contract/)
  assert.match(combobox.markup.html, /aria-activedescendant=/)

  const loading = JSON.parse(run(['pattern', 'loading-button', '--json']))
  assert.match(loading.markup.html, /aria-busy="true"/)
  assert.match(loading.markup.html, /aria-disabled="true"/)
  assert.doesNotMatch(loading.markup.html, /\sdisabled(?:\s|>)/)
  assert.match(loading.markup.html, /role="status"/)
  assert.match(loading.requiresJsNotes, /prevents activation while aria-disabled/)

  const stepper = JSON.parse(run(['pattern', 'multi-step-form', '--json']))
  assert.match(stepper.markup.html, /<span class="sr-only">Completed: <\/span>/)
  assert.ok(stepper.a11y.some((note) => note.includes('Completed:')))
})

test('every new React and Next example parses as TSX and uses React-safe attributes', () => {
  const patternIds = [
    'switch-control',
    'input-group',
    'native-file-and-range',
    'segmented-control',
    'loading-button',
    'searchable-select',
    'bulk-actions-toolbar',
    'complete-pagination',
    'multi-step-form',
  ]

  for (const framework of ['react', 'next']) {
    for (const patternId of patternIds) {
      const source = generatedComponent(run(['pattern', patternId, '--framework', framework, '--markup']))
      assertValidTsx(source, `${framework}-${patternId}`)
      assert.doesNotMatch(source, /aria-[a-z-]*[A-Z]/, `${patternId} keeps ARIA attributes lowercase`)
      assert.doesNotMatch(source, /data-[a-z-]*[A-Z]/, `${patternId} keeps data attributes lowercase`)
    }

    const recipe = generatedComponent(run(['recipe', 'app-settings-workflow', '--framework', framework, '--markup']))
    assertValidTsx(recipe, `${framework}-app-settings-workflow`)
    assert.match(recipe, /accept="image\/png,image\/svg\+xml" \/>/)
    assert.match(recipe, /defaultChecked/)
    assert.match(recipe, /defaultValue="12"/)
    assert.match(recipe, /type="radio" name="cycle" value="monthly"/)
    assert.match(recipe, /aria-autocomplete="list"/)
    assert.doesNotMatch(recipe, /aria-autoComplete/)
  }

  const modal = generatedComponent(run(['pattern', 'modal-form', '--framework', 'next', '--markup']))
  assertValidTsx(modal, 'next-modal-form')
  assert.match(modal, /formMethod="dialog"/)
  assert.doesNotMatch(modal, /formmethod=/)
})

test('corrected dialog and sortable-table examples use valid associations', () => {
  const modal = JSON.parse(run(['pattern', 'modal-form', '--json']))
  assert.match(modal.markup.html, /form="edit-form" formmethod="dialog"/)

  const table = JSON.parse(run(['pattern', 'data-table-actions', '--json']))
  assert.match(table.markup.html, /<th aria-sort="ascending"><button class="sf-table-sort"/)
  assert.doesNotMatch(table.markup.html, /<button[^>]+aria-sort=/)

  const css = readFileSync(join(packageRoot, 'components.css'), 'utf8')
  assert.match(css, /\.sf-data-table th\[aria-sort="ascending"\] :where\(button, \.sf-table-sort\)::after/)
})

test('TypeScript shortcuts and full-page recipe cover the deliberate public surface', () => {
  assert.equal(fluidSystem.components.switch, 'sf-switch')
  assert.equal(fluidSystem.components.inputGroup, 'sf-input-group')
  assert.equal(fluidSystem.components.combobox, 'sf-combobox')
  assert.equal(fluidSystem.components.stepper, 'sf-stepper')
  assert.equal(fluidSystem.components.codeWindow, 'sf-code-window')
  assert.equal(fluidSystem.components.platformCard, 'sf-platform-card')

  const recipe = JSON.parse(run(['recipe', 'app-settings-workflow', '--json']))
  for (const className of ['sf-switch', 'sf-input-group', 'sf-file-input', 'sf-range', 'sf-segmented-control', 'sf-combobox', 'sf-stepper', 'sf-spinner']) {
    assert.ok(recipe.classes.includes(className), className)
    assert.match(recipe.markup, new RegExp(className))
  }
})

test('public documentation includes technical presentation and CLI integration contracts', () => {
  const api = readFileSync(join(packageRoot, 'docs/api-contract.md'), 'utf8')
  for (const className of ['sf-code-window', 'sf-token-strip', 'sf-marquee', 'sf-command-list', 'sf-platform-card']) {
    assert.match(api, new RegExp(className))
  }
  assert.match(api, /does not own an MCP server/)

  const fixture = readFileSync(join(packageRoot, 'examples/templates/app-settings-workflow.html'), 'utf8')
  assert.match(fixture, /class="sf-switch"/)
  assert.match(fixture, /role="combobox"[^>]+aria-expanded="false"/)
  assert.match(fixture, /class="sf-combobox__listbox"[^>]+hidden/)
  assert.match(fixture, /<span class="sr-only">Completed: <\/span>/)
  assert.match(fixture, /class="sf-spinner"[^>]+hidden/)
  assert.match(fixture, /<span>Continue<\/span>/)
  assert.doesNotMatch(fixture, /Saving…|aria-busy="true"|role="status"/)
})

test('packaged WordPress include-core CSS stays in sync with the current generator', () => {
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/wordpress')], {
      cwd: packageRoot,
      encoding: 'utf8',
    })
  })

  const css = readFileSync(join(packageRoot, 'examples/wordpress/assets/css/synced-flow.css'), 'utf8')
  for (const selector of ['sf-switch', 'sf-input-group', 'sf-file-input', 'sf-range', 'sf-segmented-control', 'sf-spinner', 'sf-combobox']) {
    assert.ok(css.includes(`.${selector}`), `${selector} ships in the WordPress include-core asset`)
  }
})
