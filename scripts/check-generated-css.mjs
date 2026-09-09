#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = join(packageRoot, 'bin/synced-flow.mjs')
const checks = [
  [join(packageRoot, 'scripts/build-css.mjs'), '--check'],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/plain-html')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/vite')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/next')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/astro')],
  [cli, 'build', '--check', '--cwd', join(packageRoot, 'examples/wordpress')],
]

for (const [script, ...args] of checks) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log('pass generated CSS: package layers and every tracked example output are current.')
