import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { createElement } from 'react'
import { act, create } from 'react-test-renderer'

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const cli = join(packageRoot, 'bin/synced-flow.mjs')

function run(args) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
}

function generatedSource(kind, id, framework) {
  const output = run([kind, id, '--framework', framework, '--json'])
  return JSON.parse(output).renderedMarkup
}

function formatDiagnostic(diagnostic) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
  if (!diagnostic.file || diagnostic.start === undefined) return message
  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
  return `${diagnostic.file.fileName}:${position.line + 1}:${position.character + 1} ${message}`
}

test('every React and Next catalog pattern and recipe passes semantic TypeScript compilation', () => {
  const catalog = JSON.parse(run(['catalog', '--json']))
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'synced-flow-generated-tsx-'))
  const files = []

  try {
    for (const framework of ['react', 'next']) {
      for (const pattern of catalog.patterns) {
        const file = join(temporaryDirectory, `${framework}-pattern-${pattern.id}.tsx`)
        writeFileSync(file, generatedSource('pattern', pattern.id, framework))
        files.push(file)
      }

      for (const recipe of catalog.recipes) {
        const file = join(temporaryDirectory, `${framework}-recipe-${recipe.id}.tsx`)
        writeFileSync(file, generatedSource('recipe', recipe.id, framework))
        files.push(file)
      }
    }

    const program = ts.createProgram(files, {
      jsx: ts.JsxEmit.ReactJSX,
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: true,
      skipLibCheck: true,
      strict: true,
      typeRoots: [join(packageRoot, 'node_modules/@types')],
      types: ['react'],
    })
    const diagnostics = ts.getPreEmitDiagnostics(program)

    assert.equal(
      diagnostics.length,
      0,
      `Generated catalog TypeScript diagnostics:\n${diagnostics.map(formatDiagnostic).join('\n')}`,
    )
    assert.equal(files.length, (catalog.patterns.length + catalog.recipes.length) * 2)
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('React scroll spy output owns observation lifecycle without injecting a script element', () => {
  const source = generatedSource('pattern', 'scroll-viewport-with-spy', 'react')
  assert.match(source, /useEffect/)
  assert.match(source, /observer\.disconnect\(\)/)
  assert.doesNotMatch(source, /dangerouslySetInnerHTML|<script/)
})

test('generated React scroll spy updates active links and disconnects its observer', async () => {
  const source = generatedSource('pattern', 'scroll-viewport-with-spy', 'react')
  const temporaryDirectory = mkdtempSync(join(packageRoot, '.generated-react-test-'))
  const moduleFile = join(temporaryDirectory, 'scroll-spy.mjs')
  const links = [
    createLink('#one', 'location'),
    createLink('#two'),
  ]
  const panels = [{ id: 'one' }, { id: 'two' }]
  let observerCallback
  let disconnectCount = 0
  const observed = []
  const OriginalIntersectionObserver = globalThis.IntersectionObserver
  const originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT

  class TestIntersectionObserver {
    constructor(callback) {
      observerCallback = callback
    }

    observe(panel) {
      observed.push(panel.id)
    }

    disconnect() {
      disconnectCount += 1
    }
  }

  globalThis.IntersectionObserver = TestIntersectionObserver
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  try {
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText
    writeFileSync(moduleFile, transpiled)
    const { default: ScrollViewportWithSpy } = await import(`${new URL(`file://${moduleFile}`).href}?test=${Date.now()}`)
    let renderer

    await act(async () => {
      renderer = create(createElement(ScrollViewportWithSpy), {
        createNodeMock(element) {
          if (element.props.className?.includes('sf-sticky-top')) {
            return { querySelectorAll: () => links }
          }
          if (element.props.className?.includes('sf-scroll-viewport')) {
            return { querySelectorAll: () => panels }
          }
          return {}
        },
      })
    })

    assert.deepEqual(observed, ['one', 'two'])
    await act(async () => {
      observerCallback([{ isIntersecting: true, target: panels[1] }])
    })
    assert.equal(links[0].getAttribute('aria-current'), null)
    assert.equal(links[1].getAttribute('aria-current'), 'location')

    await act(async () => renderer.unmount())
    assert.equal(disconnectCount, 1)
  } finally {
    globalThis.IntersectionObserver = OriginalIntersectionObserver
    globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

function createLink(hash, initialCurrent = null) {
  const attributes = new Map()
  if (initialCurrent) attributes.set('aria-current', initialCurrent)
  return {
    hash,
    getAttribute(name) {
      return attributes.get(name) ?? null
    },
    removeAttribute(name) {
      attributes.delete(name)
    },
    setAttribute(name, value) {
      attributes.set(name, value)
    },
  }
}
