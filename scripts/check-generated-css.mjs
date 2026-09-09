#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { lstatSync, mkdirSync, readlinkSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = join(packageRoot, 'bin/synced-flow.mjs')
const localPackageLink = join(packageRoot, 'node_modules/@syncedco/flow')
const checks = [
  [join(packageRoot, 'scripts/build-css.mjs'), '--check'],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/plain-html')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/vite')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/next')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/astro')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/wordpress')],
]

let createdPackageLink = false
const packageRealpath = realpathSync(packageRoot)

function inspectPackageLink() {
  try {
    lstatSync(localPackageLink)
  } catch (error) {
    if (error.code === 'ENOENT') return { kind: 'missing' }
    throw error
  }

  try {
    const resolved = realpathSync(localPackageLink)
    return resolved === packageRealpath
      ? { kind: 'valid' }
      : { kind: 'invalid', detail: `resolves to ${resolved}` }
  } catch (error) {
    if (error.code === 'ENOENT') {
      let target = 'an unavailable target'
      try {
        target = `the missing target ${readlinkSync(localPackageLink)}`
      } catch {
        // Keep the generic message when the entry cannot be read as a link.
      }
      return { kind: 'invalid', detail: `is dangling and points to ${target}` }
    }
    throw error
  }
}

try {
  // The tracked examples use the same package specifier as a real consumer.
  // A root-only install does not install their file dependency, so provide the
  // source tree as a temporary self-link while checking its generated output.
  const packageLink = inspectPackageLink()
  if (packageLink.kind === 'invalid') {
    console.error(`Cannot verify generated CSS: ${localPackageLink} ${packageLink.detail}. Remove the stale package link or run this check from a clean install.`)
    process.exitCode = 1
  } else if (packageLink.kind === 'missing') {
    mkdirSync(dirname(localPackageLink), { recursive: true })
    symlinkSync(packageRoot, localPackageLink, 'dir')
    createdPackageLink = true
  }

  for (const [script, ...args] of checks) {
    if (process.exitCode) break
    const result = spawnSync(process.execPath, [script, ...args], {
      cwd: packageRoot,
      encoding: 'utf8',
    })

    if (result.stdout) process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)
    if (result.status !== 0) process.exitCode = result.status ?? 1
    if (process.exitCode) break
  }
} finally {
  if (createdPackageLink) rmSync(localPackageLink, { force: true })
}

if (!process.exitCode) console.log('pass generated CSS: package layers and every tracked example output are current.')
