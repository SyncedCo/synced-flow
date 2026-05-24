#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const budgets = {
  'styles.css': 8500,
  'components.css': 4000,
  'layout.css': 1500,
  'utilities.css': 1700,
  'tokens.css': 2600,
}

const cssFiles = ['styles.css', 'tokens.css', 'reset.css', 'base.css', 'app.css', 'layout.css', 'components.css', 'utilities.css']
const failures = []

checkRuntimeDependencies()
checkCssBudgets()
checkCssLayerShape()
checkRawPxUsage()

if (failures.length) {
  console.error('Synced Fluid guardrails failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log('pass guardrails: package remains dependency-free, CSS is within budgets, layer shape is clean, and shipped CSS avoids raw px outside allowed cases.')

function checkRuntimeDependencies() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  const deps = Object.keys(pkg.dependencies ?? {})
  if (deps.length) failures.push(`runtime dependencies must stay empty; found ${deps.join(', ')}`)
}

function checkCssBudgets() {
  for (const [file, budget] of Object.entries(budgets)) {
    const gzipBytes = gzipSync(readFileSync(file)).length
    if (gzipBytes > budget) failures.push(`${file} is ${gzipBytes} B gzip, above the ${budget} B budget`)
  }
}

function checkCssLayerShape() {
  const styles = readFileSync('styles.css', 'utf8')
  const expectedOrder = '@layer reset, tokens, base, app, layout, components, utilities;'
  if (!styles.includes(expectedOrder)) failures.push('styles.css is missing the canonical layer order')
  if (count(styles, '@layer reset {') !== 1) failures.push('styles.css should include exactly one reset layer block')
  if (count(styles, '@layer base {') !== 1) failures.push('styles.css should include exactly one base layer block')

  const reset = readFileSync('reset.css', 'utf8')
  const base = readFileSync('base.css', 'utf8')
  if (reset.includes('@layer base {')) failures.push('reset.css must not duplicate base.css')
  if (base.includes('@layer reset {')) failures.push('base.css must not duplicate reset.css')
}

function checkRawPxUsage() {
  for (const file of cssFiles) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, index) => {
      const values = line.match(/-?\d*\.?\d+px\b/g) ?? []
      for (const value of values) {
        if (!isAllowedPx(value, line)) failures.push(`${file}:${index + 1} uses ${value}; use rem, fluid tokens, or an allowed hairline/system fallback`)
      }
    })
  }
}

function isAllowedPx(value, line) {
  if (value === '1px' && /\bborder\b|border-(block|inline)|inset 0 0 0/.test(line)) return true
  if (value === '2px' && /Highlight/.test(line)) return true
  return false
}

function count(value, needle) {
  return value.split(needle).length - 1
}
