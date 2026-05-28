import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = join(packageRoot, 'bin/synced-flow.mjs')

function tempProject() {
  const cwd = mkdtempSync(join(tmpdir(), 'synced-flow-lint-'))
  mkdirSync(join(cwd, 'src'), { recursive: true })
  mkdirSync(join(cwd, 'node_modules/@synced'), { recursive: true })
  symlinkSync(packageRoot, join(cwd, 'node_modules/@synced/flow'), 'dir')
  writeFileSync(
    join(cwd, 'package.json'),
    JSON.stringify({ type: 'module', dependencies: { '@synced/flow': 'file:../synced-flow' } }, null, 2) + '\n'
  )
  writeFileSync(
    join(cwd, 'synced-flow.config.mjs'),
    `export default {
  scan: ['src'],
  out: 'src/synced-flow.generated.css',
}
`
  )
  return cwd
}

function lintJson(cwd) {
  const result = spawnSync('node', [cli, 'lint', '--cwd', cwd, '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout)
}

test('lint composition rules teach native interaction structure', () => {
  const cwd = tempProject()
  writeFileSync(
    join(cwd, 'src/App.jsx'),
    `export function App() {
  const tone = 'primary'
  return (
    <>
      <nav className="sf-nav--mobile"></nav>
      <aside popover="auto" id="menu" className="sf-drawer"></aside>
      <a popoverTarget="menu" href="#menu">Open</a>
      <div className={\`sf-\${tone}\`}></div>
    </>
  )
}
`
  )
  writeFileSync(join(cwd, 'src/theme.css'), ':root { --sf-colour-primary: red; }\n')

  const output = lintJson(cwd)
  const rules = output.issues.map((issue) => issue.rule)

  assert.equal(output.ok, false)
  assert.ok(rules.includes('popover-missing-close'))
  assert.ok(rules.includes('mobile-nav-incomplete'))
  assert.ok(rules.includes('dynamic-class-fragment'))
  assert.ok(rules.includes('invalid-popover-on-anchor'))
  assert.ok(rules.includes('theme-override-in-css'))
  assert.ok(output.issues.every((issue) => issue.fix))
})

test('lint json reports unknown generated utility alternatives as errors', () => {
  const cwd = tempProject()
  writeFileSync(join(cwd, 'src/App.jsx'), '<div className="sf-buton text-prmary"></div>\n')

  const result = spawnSync('node', [cli, 'lint', '--cwd', cwd, '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
  const output = JSON.parse(result.stdout)

  assert.notEqual(result.status, 0)
  assert.equal(output.ok, false)
  assert.ok(output.issues.some((issue) => issue.rule === 'unknown-generated-utility' && issue.severity === 'error' && issue.fix.includes('sf-button')))
})
