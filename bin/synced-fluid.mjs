#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, renameSync, watch } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { themePresets, presetNames } from '../src/presets.mjs'
import { componentTokens, primitiveTokens, semanticTokens } from '../src/tokens.mjs'
import { fluidConfig } from '../src/utility-tokens.mjs'

const scriptFile = fileURLToPath(import.meta.url)
const scriptDir = fileURLToPath(new URL('.', import.meta.url))
const packageRoot = resolve(scriptDir, '..')
const args = process.argv.slice(2)
const command = args[0] && !args[0].startsWith('-') ? args.shift() : 'build'

if (command === 'help' || command === '--help' || command === '-h') {
  printHelp()
  process.exit(0)
}

if (command === 'init') {
  await runInit()
  process.exit(0)
}

if (command === 'add') {
  const addTarget = args.shift()
  if (addTarget === 'app') {
    runAddApp()
    process.exit(0)
  }
  console.error(`Unknown add target "${addTarget ?? ''}". Use: synced-fluid add app`)
  process.exit(1)
}

if (command === 'doctor' || command === 'validate') {
  process.exit(await runDoctor())
}

if (command === 'tokens') {
  runTokens()
  process.exit(0)
}

if (command === 'catalog') {
  runCatalog()
  process.exit(0)
}

if (command === 'suggest') {
  runSuggest()
  process.exit(0)
}

if (command === 'recipe' || command === 'recipes') {
  runRecipe()
  process.exit(0)
}

if (command === 'theme') {
  process.exit(await runThemeCommand())
}

const projectCommands = new Set(['build', 'lint', 'watch'])

if (!projectCommands.has(command)) {
  console.error(`Unknown command "${command}".`)
  printHelp()
  process.exit(1)
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp()
  process.exit(0)
}

const cliCwd = readOption('cwd')
const configPath = resolveConfigPath(readOption('config'), resolve(cliCwd ?? process.cwd()))
const config = configPath ? await loadConfig(configPath) : {}
validateConfig(config, configPath ?? 'inline options')
const checkOnly = args.includes('--check')
const cwd = resolve(cliCwd ?? config.cwd ?? process.cwd())
const repoRoot = cwd
const outFile = resolve(cwd, readOption('out') ?? config.out ?? 'synced-fluid.generated.css')
const cliScans = readOptions('scan')
const sourceDirs = cliScans.length ? cliScans : config.scan ?? []
const includeCore = readBooleanOption('include-core') ?? config.includeCore ?? false
const includeApp = readBooleanOption('app') ?? config.includeApp ?? false
const responsiveVariants = readBooleanOption('responsive-variants') ?? config.responsiveVariants ?? false
const failOnUnsupported = readBooleanOption('fail-on-unsupported') ?? config.failOnUnsupported ?? true
const quiet = args.includes('--quiet') || config.quiet === true
const cliSafelist = readOptions('safelist')
const safelist = cliSafelist.length ? cliSafelist : config.safelist ?? []

const breakpoints = {
  sm: '36rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  '2xl': '96rem',
}

if (!sourceDirs.length) {
  console.error('No scan directories configured. Add scan to synced-fluid.config.mjs or pass --scan app --scan components.')
  process.exit(1)
}

const missingSourceDirs = sourceDirs.filter((dir) => !existsSync(resolve(repoRoot, dir)))
if (missingSourceDirs.length && !quiet) {
  console.warn(`Scan directories not found: ${missingSourceDirs.join(', ')}`)
}

if (command === 'watch') {
  await runWatch()
  process.exit(0)
}

function readOption(name, fallback) {
  const prefix = `--${name}=`
  const inline = args.find((arg) => arg.startsWith(prefix))
  if (inline) return inline.slice(prefix.length)

  const index = args.indexOf(`--${name}`)
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) return args[index + 1]

  return fallback
}

function readOptions(name) {
  const values = []
  const prefix = `--${name}=`

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg.startsWith(prefix)) {
      values.push(...splitOptionList(arg.slice(prefix.length)))
      continue
    }
    if (arg === `--${name}` && args[index + 1] && !args[index + 1].startsWith('--')) {
      values.push(...splitOptionList(args[index + 1]))
      index += 1
    }
  }

  return values
}

function readPositionals() {
  const valueOptions = new Set(['--config', '--cwd', '--preset', '--theme', '--scan', '--out', '--safelist', '--file', '--css', '--from', '--limit', '--framework', '--section'])
  const values = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg.startsWith('--')) {
      if (valueOptions.has(arg) && args[index + 1] && !args[index + 1].startsWith('--')) index += 1
      continue
    }
    values.push(arg)
  }

  return values
}

function splitOptionList(value) {
  return value.split(/[,\s]+/).filter(Boolean)
}

async function runWatch() {
  const buildArgs = ['build', ...args.filter((arg) => arg !== '--watch')]
  let timer = null
  let running = false

  function build(reason) {
    if (running) return
    running = true
    const label = reason ? ` after ${reason}` : ''
    console.log(`synced-fluid build${label}`)
    const result = spawnSync(process.execPath, [scriptFile, ...buildArgs], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'inherit',
    })
    running = false
    if (result.status === 0) console.log('pass build complete. Watching for changes...')
    else console.log('warn build failed. Fix the issue and save again.')
  }

  function schedule(reason) {
    clearTimeout(timer)
    timer = setTimeout(() => build(reason), 120)
  }

  build()

  const watched = new Set()
  for (const dir of sourceDirs) {
    const fullDir = resolve(repoRoot, dir)
    if (!existsSync(fullDir)) continue
    for (const file of listProjectFiles(fullDir)) {
      const parent = dirname(file)
      if (watched.has(parent)) continue
      watched.add(parent)
      watch(parent, { persistent: true }, (_event, filename) => {
        if (filename && !/\.(tsx|ts|jsx|js|astro|html|php|phtml|twig|mdx|vue|svelte|css)$/.test(String(filename))) return
        schedule(filename ? String(filename) : relative(repoRoot, parent))
      })
    }
  }

  console.log(`Watching ${watched.size} directories. Press Ctrl+C to stop.`)
  await new Promise(() => {})
}

function normalizeThemeName(value) {
  const aliases = {
    'dark-app': 'darkApp',
    'neutral-saas': 'neutralSaas',
  }
  return aliases[value] ?? value
}

function kebabThemeName(value) {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function readBooleanOption(name) {
  if (args.includes(`--${name}`)) return true
  if (args.includes(`--no-${name}`)) return false
  return undefined
}

function resolveConfigPath(value, baseCwd) {
  if (value) {
    const explicit = resolve(baseCwd, value)
    if (!existsSync(explicit)) {
      console.error(`Config file not found: ${relative(baseCwd, explicit)}`)
      process.exit(1)
    }
    return explicit
  }

  for (const name of ['synced-fluid.config.mjs', 'synced-fluid.config.js', 'synced-fluid.config.cjs']) {
    const candidate = resolve(baseCwd, name)
    if (existsSync(candidate)) return candidate
  }

  return null
}

async function loadConfig(file) {
  const module = await import(pathToFileURL(file).href)
  const loaded = module.default ?? module.config ?? {}

  if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) {
    console.error(`Config file must export an object: ${relative(process.cwd(), file)}`)
    process.exit(1)
  }

  return loaded
}

function validateConfig(config, label) {
  const errors = []

  assertOptionalString(config, 'cwd', errors)
  assertOptionalString(config, 'out', errors)
  assertOptionalBoolean(config, 'includeCore', errors)
  assertOptionalBoolean(config, 'includeApp', errors)
  assertOptionalBoolean(config, 'responsiveVariants', errors)
  assertOptionalBoolean(config, 'failOnUnsupported', errors)
  assertOptionalBoolean(config, 'quiet', errors)
  assertOptionalStringArray(config, 'scan', errors)
  assertOptionalStringArray(config, 'safelist', errors)

  if (config.theme !== undefined) validateTheme(config.theme, errors)

  if (errors.length) {
    console.error(`Invalid Synced Fluid config in ${label}:`)
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }
}

function validateTheme(theme, errors) {
  if (!isPlainObject(theme)) {
    errors.push('theme must be an object.')
    return
  }

  assertOptionalStringMap(theme, 'fonts', errors)
  assertOptionalStringMap(theme, 'colours', errors)
  assertOptionalStringMap(theme, 'darkColours', errors)
  assertOptionalStringMap(theme, 'radii', errors)

  if (theme.layout !== undefined) {
    if (!isPlainObject(theme.layout)) {
      errors.push('theme.layout must be an object.')
    } else {
      assertOptionalString(theme.layout, 'containerMax', errors, 'theme.layout.containerMax')
      assertOptionalString(theme.layout, 'gutter', errors, 'theme.layout.gutter')
      if (theme.layout.columns !== undefined && (!Number.isFinite(theme.layout.columns) || theme.layout.columns <= 0)) {
        errors.push('theme.layout.columns must be a positive number.')
      }
    }
  }

  if (theme.components !== undefined) {
    if (!isPlainObject(theme.components)) {
      errors.push('theme.components must be an object.')
    } else {
      for (const [componentName, componentConfig] of Object.entries(theme.components)) {
        if (!isPlainObject(componentConfig)) {
          errors.push(`theme.components.${componentName} must be an object.`)
          continue
        }
        for (const [tokenName, value] of Object.entries(componentConfig)) {
          if (typeof value !== 'string') errors.push(`theme.components.${componentName}.${tokenName} must be a string.`)
        }
      }
    }
  }
}

function assertOptionalString(object, key, errors, label = key) {
  if (object[key] !== undefined && typeof object[key] !== 'string') errors.push(`${label} must be a string.`)
}

function assertOptionalBoolean(object, key, errors) {
  if (object[key] !== undefined && typeof object[key] !== 'boolean') errors.push(`${key} must be a boolean.`)
}

function assertOptionalStringArray(object, key, errors) {
  if (object[key] === undefined) return
  if (!Array.isArray(object[key])) {
    errors.push(`${key} must be an array of strings.`)
    return
  }
  for (const value of object[key]) {
    if (typeof value !== 'string' || !value.trim()) errors.push(`${key} must contain only non-empty strings.`)
  }
}

function assertOptionalStringMap(object, key, errors) {
  if (object[key] === undefined) return
  if (!isPlainObject(object[key])) {
    errors.push(`theme.${key} must be an object of string values.`)
    return
  }
  for (const [name, value] of Object.entries(object[key])) {
    if (typeof value !== 'string' || !value.trim()) errors.push(`theme.${key}.${name} must be a non-empty string.`)
  }
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function printHelp() {
  console.log(`Usage:
  synced-fluid init [options]
  synced-fluid add app [options]
  synced-fluid build [options]
  synced-fluid doctor [options]
  synced-fluid validate [options]
  synced-fluid tokens [options]
  synced-fluid catalog [options]
  synced-fluid suggest "<site or section brief>" [options]
  synced-fluid recipe [id] [options]
  synced-fluid lint [options]
  synced-fluid watch [options]
  synced-fluid theme init --from <brief.md> [options]
  synced-fluid theme validate [options]

Options:
  --config <file>              Use a specific config file.
  --cwd <dir>                  Resolve scans and output from a directory.
  --preset <name>              init preset: next, vite, react, astro, wordpress, plain.
  --theme <name>               init theme: synced, neutral-saas, editorial, dark-app.
  --scan <dir>                 Add a source directory to scan for classes.
  --out <file>                 Generated CSS output path.
  --safelist <classes>         Always generate space/comma-separated class names.
  --json                       Print token information as JSON.
  --check                      Fail if the generated CSS is out of date.
  --include-core               Include reset, base, layout, and component CSS in output.
  --no-include-core            Only generate project tokens and utility CSS.
  --app                        Include app.css opinionated app/site defaults.
  --no-app                     Keep app.css out of init/generated core output.
  --file <file>                CSS file to update for "synced-fluid add app".
  --responsive-variants        Enable sm:/md:/lg:/xl: compatibility variants.
  --no-responsive-variants     Treat responsive variants as unsupported.
  --fail-on-unsupported        Fail when class tokens cannot be generated.
  --no-fail-on-unsupported     Warn but do not fail on unsupported class tokens.
  --no-scripts                 init without adding package.json scripts.
  --force                      overwrite init-managed files.
  --quiet                      Suppress non-critical warnings.
  --from <file>                Read a theme brief for "theme init".
  --preset-base <name>         Base "theme init" output on synced, neutral-saas, editorial, or dark-app.
  --limit <number>             Limit results for "suggest".
  --markup                     Include markup snippets in text recipe output.

Config:
  Create synced-fluid.config.mjs and export defineConfig({ scan, out }).`)
}

async function runInit() {
  const targetCwd = resolve(readOption('cwd', process.cwd()))
  const preset = readOption('preset') ?? detectPreset(targetCwd)
  const themeName = normalizeThemeName(readOption('theme', 'synced'))
  if (!themePresets[themeName]) {
    console.error(`Unknown theme "${readOption('theme')}". Use one of: ${presetNames.map(kebabThemeName).join(', ')}.`)
    process.exit(1)
  }
  const force = args.includes('--force')
  const noScripts = args.includes('--no-scripts')
  const responsive = readBooleanOption('responsive-variants') ?? preset === 'legacy'
  const includeCore = readBooleanOption('include-core') ?? preset === 'wordpress'
  const includeApp = readBooleanOption('app') ?? defaultIncludeApp(preset)
  const scanDirs = readOptions('scan').length ? readOptions('scan') : defaultScanDirs(targetCwd, preset)
  const outPath = readOption('out') ?? defaultOutputPath(targetCwd, preset)
  const stylePath = includeCore ? outPath : defaultStyleEntryPath(targetCwd, preset, outPath)
  const configFile = resolve(targetCwd, readOption('config', 'synced-fluid.config.mjs'))
  const generatedFile = resolve(targetCwd, outPath)
  const styleFile = resolve(targetCwd, stylePath)
  const singleCssOutput = generatedFile === styleFile
  const safelistValues = readOptions('safelist')

  writeProjectFile(
    configFile,
    `import { defineConfig } from '@synced/fluid/config'
import { themePresets } from '@synced/fluid/presets'

export default defineConfig({
  scan: ${formatStringArray(scanDirs)},
  out: '${outPath}',
  responsiveVariants: ${responsive},
${includeCore ? '  includeCore: true,\n' : ''}${includeCore && includeApp ? '  includeApp: true,\n' : ''}  theme: themePresets.${themeName},
${safelistValues.length ? `  safelist: ${formatStringArray(safelistValues)},\n` : ''}})
`,
    force
  )

  if (singleCssOutput) {
    writeProjectFile(
      generatedFile,
      `/* Generated by @synced/fluid. Run synced-fluid build to refresh this file. */
`,
      force
    )
  } else {
    writeProjectFile(
      styleFile,
      `@import "@synced/fluid/styles.css";
${includeApp ? '@import "@synced/fluid/app.css";\n' : ''}@import "./${relative(dirname(styleFile), generatedFile).replace(/\\/g, '/')}";

/* Prefer synced-fluid.config.mjs theme overrides for reusable project tokens. */
`,
      force
    )

    writeProjectFile(
      generatedFile,
      `/* Generated by @synced/fluid. Run synced-fluid build to refresh this file. */
`,
      force
    )
  }

  if (!noScripts) addPackageScripts(targetCwd)

  console.log(`Synced Fluid initialised for ${preset} with ${kebabThemeName(themeName)} theme.`)
  console.log(`Config: ${relative(targetCwd, configFile)}`)
  if (singleCssOutput) {
    console.log(`CSS output: ${relative(targetCwd, generatedFile)}`)
  } else {
    console.log(`CSS entry: ${relative(targetCwd, styleFile)}`)
    console.log(`Generated CSS: ${relative(targetCwd, generatedFile)}`)
  }
  console.log('')
  console.log('Next steps:')
  if (preset === 'wordpress') {
    console.log(`  1. Enqueue ${relative(targetCwd, generatedFile)} from your theme or plugin.`)
  } else {
    console.log(`  1. Import ${relative(targetCwd, styleFile)} from your app entry/layout.`)
  }
  console.log('  2. Run pnpm fluid:build')
  console.log('  3. Run pnpm fluid:doctor')
  if (includeApp) {
    console.log('Note: app.css removes raw link underlines and list markers for common app/site UI. Use sf-link, sf-list-disc, or sf-prose when content semantics need them.')
  } else {
    console.log('Note: base CSS keeps links visibly underlined and list markers intact. Add @synced/fluid/app.css or run synced-fluid add app for app/site defaults.')
  }
}

function runAddApp() {
  const targetCwd = resolve(readOption('cwd', process.cwd()))
  const cssPath = readOption('file') ?? readOption('css') ?? findStyleEntry(targetCwd)

  if (!cssPath) {
    console.error('Could not find a CSS entry. Pass --file <path>, for example: synced-fluid add app --file src/synced-fluid.css')
    process.exit(1)
  }

  const cssFile = resolve(targetCwd, cssPath)
  if (!existsSync(cssFile)) {
    console.error(`CSS file not found: ${relative(targetCwd, cssFile)}`)
    process.exit(1)
  }

  const css = readFileSync(cssFile, 'utf8')
  if (css.includes('@synced/fluid/app.css')) {
    console.log(`skip ${relative(targetCwd, cssFile)} already imports @synced/fluid/app.css.`)
    return
  }

  const appImport = '@import "@synced/fluid/app.css";'
  let nextCss

  if (css.includes('@import "@synced/fluid/styles.css";')) {
    nextCss = css.replace('@import "@synced/fluid/styles.css";', `@import "@synced/fluid/styles.css";\n${appImport}`)
  } else if (css.includes('@import "@synced/fluid/base.css";')) {
    nextCss = css.replace('@import "@synced/fluid/base.css";', `@import "@synced/fluid/base.css";\n${appImport}`)
  } else {
    nextCss = `${appImport}\n${css}`
  }

  writeFileSync(cssFile, nextCss)
  console.log(`update ${relative(targetCwd, cssFile)} with @synced/fluid/app.css`)
}

async function runDoctor() {
  const targetCwd = resolve(readOption('cwd', process.cwd()))
  const messages = []
  let failed = false
  let loadedConfig = null

  function pass(message) {
    messages.push(`pass ${message}`)
  }

  function warn(message) {
    messages.push(`warn ${message}`)
  }

  function fail(message) {
    failed = true
    messages.push(`fail ${message}`)
  }

  const packageFile = resolve(targetCwd, 'package.json')
  if (!existsSync(packageFile)) {
    warn('package.json not found; skipping dependency and script checks.')
  } else {
    const pkg = JSON.parse(readFileSync(packageFile, 'utf8'))
    const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
    if (allDeps['@synced/fluid']) pass('@synced/fluid is installed.')
    else warn('@synced/fluid is not listed in package.json.')

    const scripts = pkg.scripts ?? {}
    if (scripts['fluid:build'] === 'synced-fluid build') pass('fluid:build script is configured.')
    else warn('Add "fluid:build": "synced-fluid build" to package.json.')

    if (scripts['fluid:check'] === 'synced-fluid build --check') pass('fluid:check script is configured.')
    else warn('Add "fluid:check": "synced-fluid build --check" to package.json.')

    if (scripts['fluid:doctor'] === 'synced-fluid doctor') pass('fluid:doctor script is configured.')
    else warn('Add "fluid:doctor": "synced-fluid doctor" to package.json.')

    if (scripts['fluid:lint'] === 'synced-fluid lint') pass('fluid:lint script is configured.')
    else warn('Add "fluid:lint": "synced-fluid lint" to package.json so class mistakes are caught before handoff.')

    if (scripts['fluid:watch'] === 'synced-fluid watch') pass('fluid:watch script is configured.')
    else warn('Add "fluid:watch": "synced-fluid watch" to package.json for local rebuilds during development.')

    const tailwindDeps = ['tailwindcss', '@tailwindcss/postcss', '@tailwindcss/vite', 'tailwind-merge'].filter((name) => allDeps[name])
    if (tailwindDeps.length) warn(`Tailwind packages still present: ${tailwindDeps.join(', ')}.`)
    else pass('No Tailwind dependencies found.')
  }

  const foundConfig = resolveConfigPath(readOption('config'), targetCwd)
  if (!foundConfig) {
    fail('synced-fluid.config.mjs was not found.')
  } else {
    pass(`Config found at ${relative(targetCwd, foundConfig)}.`)
    const loaded = await loadConfig(foundConfig)
    loadedConfig = loaded
    if (Array.isArray(loaded.scan) && loaded.scan.length) pass(`Scan paths configured: ${loaded.scan.join(', ')}.`)
    else fail('Config needs a non-empty scan array.')

    const missingScans = (loaded.scan ?? []).filter((dir) => !existsSync(resolve(targetCwd, dir)))
    if (missingScans.length) warn(`Some scan paths do not exist yet: ${missingScans.join(', ')}.`)

    if (loaded.out) {
      const generated = resolve(targetCwd, loaded.out)
      if (existsSync(generated)) pass(`Generated CSS exists at ${loaded.out}.`)
      else warn(`Generated CSS missing at ${loaded.out}; run synced-fluid build.`)
    } else {
      warn('Config has no out path; defaulting to synced-fluid.generated.css.')
    }

    const check = spawnSync(process.execPath, [scriptFile, 'build', '--cwd', targetCwd, '--check', '--quiet'], {
      encoding: 'utf8',
    })
    if (check.status === 0) pass('Generated CSS is up to date.')
    else warn('Generated CSS is out of date or unsupported classes were found; run synced-fluid build and review warnings.')

    const lint = spawnSync(process.execPath, [scriptFile, 'lint', '--cwd', targetCwd, '--quiet'], {
      encoding: 'utf8',
    })
    if (lint.status === 0) pass('No unsupported class tokens found.')
    else warn('Unsupported class tokens were found; run synced-fluid lint for nearest supported alternatives.')

    const themeErrors = []
    if (loaded.theme === undefined) warn('No theme configured; add a theme preset or run synced-fluid theme init --from brief.md.')
    else {
      validateTheme(loaded.theme, themeErrors)
      if (themeErrors.length) warn(`Theme config has ${themeErrors.length} issue(s); run synced-fluid theme validate.`)
      else pass('Theme config is valid.')
    }

    if (loaded.failOnUnsupported === false) warn('failOnUnsupported is disabled; enable it before release so unsupported classes fail the build.')

    if (loaded.responsiveVariants) warn('responsiveVariants is enabled; use this only for migration projects.')
    else pass('Strict fluid mode is enabled.')
  }

  if (loadedConfig?.includeCore) pass('Core CSS is included in generated output.')
  else if (projectContains(targetCwd, '@synced/fluid/styles.css') || projectContains(targetCwd, '@import "../../styles.css"')) pass('Core stylesheet import found.')
  else warn('Import @synced/fluid/styles.css from your app CSS or layout entry.')

  const duplicateImports = findDuplicateCoreImports(targetCwd)
  if (duplicateImports.length) {
    warn(`Avoid duplicate core CSS imports in ${duplicateImports.join(', ')}. Use styles.css alone, or import modular layers without styles.css.`)
  } else {
    pass('No duplicate core stylesheet imports found.')
  }

  const customTokenFiles = findCustomTokenOverrides(targetCwd)
  if (customTokenFiles.length) {
    warn(`Custom --sf-* token overrides found in ${customTokenFiles.join(', ')}. Prefer synced-fluid.config.mjs theme tokens for reusable brand decisions.`)
  } else {
    pass('No ad hoc --sf-* token overrides found in project CSS.')
  }

  for (const message of messages) console.log(message)
  return failed ? 1 : 0
}

function getTokenSummary() {
  return {
    type: {
      minStep: fluidConfig.typeMinStep,
      maxStep: fluidConfig.typeMaxStep,
      aliases: ['caption', 'body', 'lead', 'h4', 'h3', 'h2', 'h1', 'display'],
    },
    space: ['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', 's-l', 'm-xl', 'l-2xl'],
    colours: {
      primitive: Object.keys(primitiveTokens.colours),
      semantic: Object.keys(semanticTokens.colours),
    },
    fonts: Object.keys(primitiveTokens.fonts),
    radii: Object.keys(primitiveTokens.radii),
    shadows: Object.keys(primitiveTokens.shadows),
    components: componentTokens,
    themePresets: presetNames.map(kebabThemeName),
    starterClasses: {
      layout: ['sf-container', 'sf-container--narrow', 'sf-container--wide', 'sf-section', 'sf-section--compact', 'sf-section--spacious', 'sf-stack', 'sf-flow', 'sf-cluster', 'sf-repel', 'sf-auto-grid', 'sf-switcher', 'sf-sidebar', 'sf-split', 'sf-split--reverse', 'sf-frame', 'sf-cover', 'sf-scroll-viewport', 'sf-scroll-panel', 'sf-scroll-snap-y', 'sf-sticky-top', 'sf-media-object', 'sf-aside-rail'],
      components: ['sf-button', 'sf-button-group', 'sf-card', 'sf-surface', 'sf-hero', 'sf-logo-cloud', 'sf-feature', 'sf-stats', 'sf-stat', 'sf-testimonial', 'sf-pricing-grid', 'sf-price-card', 'sf-price', 'sf-faq', 'sf-cta', 'sf-footer', 'sf-badge', 'sf-nav', 'sf-nav--mobile', 'sf-nav__list', 'sf-nav__link', 'sf-menu', 'sf-breadcrumb', 'sf-pagination', 'sf-dialog', 'sf-popover', 'sf-tooltip', 'sf-tooltip-trigger', 'sf-menu-popover', 'sf-toast', 'sf-banner', 'sf-drawer', 'sf-disclosure', 'sf-accordion', 'sf-tabs', 'sf-tab-list', 'sf-tab', 'sf-tab-panel', 'sf-form', 'sf-fieldset', 'sf-field', 'sf-label', 'sf-help', 'sf-error', 'sf-input', 'sf-select', 'sf-textarea', 'sf-check', 'sf-alert', 'sf-section-header', 'sf-kicker'],
      type: ['sf-text-caption', 'sf-text-body', 'sf-text-lead', 'sf-text-h4', 'sf-text-h3', 'sf-text-h2', 'sf-text-h1', 'sf-text-display'],
      utilities: ['sr-only', 'not-sr-only', 'sf-visually-hidden', 'sf-not-visually-hidden', 'sf-skip-link', 'sf-focus-ring', 'sf-touch-target', 'sf-list-reset', 'sf-list-disc', 'sf-list-decimal', 'sf-link', 'sf-link-subtle', 'sf-link-plain', 'sf-prose', 'sf-prose--blog', 'sf-prose--legal', 'sf-meta', 'sf-figure', 'sf-caption', 'sf-table-wrap', 'sf-full-bleed', 'sf-text-muted', 'sf-bg-surface', 'sf-border', 'sf-rounded-panel', 'sf-shadow-md', 'sf-animate-fade', 'sf-animate-rise', 'sf-animate-scale', 'sf-animate-slide', 'sf-animate-stagger'],
    },
  }
}

function getPublicPatterns() {
  return [
    {
      id: 'sticky-navigation',
      name: 'Sticky header and navigation',
      whenToUse: 'Global site headers, section navigation, scroll-spy style pages, and mobile nav shells.',
      classes: ['sf-sticky-top', 'sf-nav', 'sf-nav--mobile', 'sf-nav__list', 'sf-nav__link', 'sf-menu', 'sf-button', 'sf-button--ghost'],
      markup: '<header class="sf-section sf-section--compact sf-sticky-top"><nav class="sf-container sf-nav">...</nav></header>',
      keywords: ['nav', 'navigation', 'header', 'sticky', 'mobile', 'menu', 'scroll-spy'],
    },
    {
      id: 'hero-split',
      name: 'Split hero',
      whenToUse: 'Landing page intros with copy, actions, media, and a supporting stats or proof block.',
      classes: ['sf-section', 'sf-container', 'sf-split', 'sf-stack', 'sf-kicker', 'sf-text-display', 'sf-text-lead', 'sf-button', 'sf-frame'],
      markup: '<section class="sf-section"><div class="sf-container sf-split">...</div></section>',
      keywords: ['hero', 'intro', 'split', 'landing', 'media', 'cta'],
    },
    {
      id: 'card-grid',
      name: 'Feature or card grid',
      whenToUse: 'Feature lists, service cards, pricing summaries, team cards, and blog indexes.',
      classes: ['sf-section', 'sf-container', 'sf-section-header', 'sf-auto-grid', 'sf-card', 'sf-card--interactive', 'sf-badge'],
      markup: '<section class="sf-section"><div class="sf-container sf-stack"><div class="sf-auto-grid">...</div></div></section>',
      keywords: ['feature', 'features', 'grid', 'cards', 'services', 'team', 'pricing', 'blog'],
    },
    {
      id: 'native-dialog-drawer',
      name: 'Native dialog, popover, and drawer',
      whenToUse: 'Modals, mobile menus, cookie notices, command menus, lightweight drawers, and non-JS native overlays.',
      classes: ['sf-dialog', 'sf-dialog__header', 'sf-dialog__body', 'sf-dialog__footer', 'sf-popover', 'sf-drawer', 'sf-toast', 'sf-banner'],
      markup: '<dialog class="sf-dialog">...</dialog><aside popover class="sf-drawer sf-drawer--right">...</aside>',
      keywords: ['dialog', 'modal', 'drawer', 'popover', 'toast', 'banner', 'cookie', 'overlay', 'menu'],
    },
    {
      id: 'faq-disclosure-tabs',
      name: 'FAQ, disclosure, and tabs',
      whenToUse: 'FAQs, filters, mobile sections, feature tabs, pricing toggles, and compact long content.',
      classes: ['sf-disclosure', 'sf-accordion', 'sf-tabs', 'sf-tab-list', 'sf-tab', 'sf-tab-panel', 'sf-faq'],
      markup: '<details class="sf-disclosure"><summary>Question</summary><p>Answer</p></details>',
      keywords: ['faq', 'accordion', 'details', 'summary', 'tabs', 'toggle', 'filters', 'pricing'],
    },
    {
      id: 'scroll-snap-page',
      name: 'Scroll snap page sections',
      whenToUse: 'Portfolio panels, product storytelling, presentation-style pages, and full-page feature sections.',
      classes: ['sf-scroll-viewport', 'sf-scroll-snap-y', 'sf-scroll-panel', 'sf-sticky-top', 'sf-section', 'sf-container'],
      markup: '<main class="sf-scroll-viewport" data-snap="mandatory"><section class="sf-scroll-panel">...</section></main>',
      keywords: ['scroll', 'snap', 'panel', 'portfolio', 'presentation', 'full-page', 'sections'],
    },
    {
      id: 'long-form-content',
      name: 'Blog article and long-form content',
      whenToUse: 'Articles, legal pages, documentation, case studies, figures, captions, metadata, and responsive tables.',
      classes: ['sf-prose', 'sf-prose--blog', 'sf-prose--legal', 'sf-meta', 'sf-figure', 'sf-caption', 'sf-table-wrap', 'sf-breadcrumb'],
      markup: '<article class="sf-container sf-prose sf-prose--blog">...</article>',
      keywords: ['blog', 'article', 'prose', 'legal', 'docs', 'case-study', 'table', 'figure', 'seo'],
    },
    {
      id: 'contact-form',
      name: 'Accessible contact form',
      whenToUse: 'Contact forms, sign-up forms, newsletter forms, and simple application flows.',
      classes: ['sf-form', 'sf-fieldset', 'sf-field', 'sf-label', 'sf-help', 'sf-error', 'sf-input', 'sf-select', 'sf-textarea', 'sf-check', 'sf-button'],
      markup: '<form class="sf-form"><label class="sf-field"><span class="sf-label">Email</span><input class="sf-input"></label></form>',
      keywords: ['form', 'contact', 'signup', 'newsletter', 'input', 'select', 'textarea', 'checkbox'],
    },
  ]
}

function getPublicRecipes() {
  return [
    {
      id: 'saas-landing',
      name: 'SaaS landing page',
      whenToUse: 'Product marketing pages with hero, proof, features, pricing, FAQ, CTA, and footer.',
      sections: ['sticky-navigation', 'hero-split', 'card-grid', 'faq-disclosure-tabs', 'contact-form'],
      classes: ['sf-sticky-top', 'sf-nav', 'sf-section', 'sf-container', 'sf-split', 'sf-card', 'sf-auto-grid', 'sf-pricing-grid', 'sf-faq', 'sf-cta', 'sf-footer'],
      keywords: ['saas', 'landing', 'marketing', 'pricing', 'feature', 'faq', 'cta', 'product'],
      markup: `<a class="sf-skip-link" href="#main">Skip to main content</a>
<header class="sf-section sf-section--compact sf-sticky-top sf-bg-background">
  <nav class="sf-container sf-nav" aria-label="Main navigation">
    <a class="sf-nav__link" href="/">Product</a>
    <ul class="sf-nav__list">
      <li><a class="sf-nav__link" href="#features">Features</a></li>
      <li><a class="sf-nav__link" href="#pricing">Pricing</a></li>
      <li><a class="sf-nav__link" href="#faq">FAQ</a></li>
    </ul>
    <a class="sf-button sf-button--sm" href="#contact">Book demo</a>
  </nav>
</header>
<main id="main">
  <section class="sf-section">
    <div class="sf-container sf-split">
      <div class="sf-stack">
        <p class="sf-kicker">Launch faster</p>
        <h1 class="sf-text-display">A modern product site without page-specific CSS.</h1>
        <p class="sf-text-lead sf-prose">Compose hero, proof, pricing, FAQ, and contact sections from Synced Fluid primitives.</p>
        <div class="sf-cluster">
          <a class="sf-button sf-button--default" href="#contact">Start free</a>
          <a class="sf-button sf-button--outline" href="#features">View features</a>
        </div>
      </div>
      <aside class="sf-card sf-stack">
        <p class="sf-badge">Included</p>
        <ul class="sf-list-disc">
          <li>Fluid tokens</li>
          <li>Native components</li>
          <li>Accessible states</li>
        </ul>
      </aside>
    </div>
  </section>
  <section class="sf-section" id="features">
    <div class="sf-container sf-stack">
      <header class="sf-section-header" data-align="center">
        <p class="sf-kicker">Features</p>
        <h2 class="sf-text-h2">Everything a basic website needs.</h2>
      </header>
      <div class="sf-auto-grid">
        <article class="sf-card sf-card--interactive sf-stack"><h3 class="sf-text-h4">Tokens</h3><p class="sf-text-muted">Theme type, colour, radius, motion, and surfaces.</p></article>
        <article class="sf-card sf-card--interactive sf-stack"><h3 class="sf-text-h4">Patterns</h3><p class="sf-text-muted">Hero, cards, nav, forms, pricing, FAQ, and CTA.</p></article>
        <article class="sf-card sf-card--interactive sf-stack"><h3 class="sf-text-h4">Guardrails</h3><p class="sf-text-muted">Doctor, lint, catalog, and recipe discovery.</p></article>
      </div>
    </div>
  </section>
  <section class="sf-section" id="pricing">
    <div class="sf-container sf-stack">
      <header class="sf-section-header" data-align="center"><p class="sf-kicker">Pricing</p><h2 class="sf-text-h2">Simple plans.</h2></header>
      <div class="sf-pricing-grid">
        <article class="sf-price-card"><h3>Starter</h3><p class="sf-price">$19</p><a class="sf-button sf-button--outline" href="#contact">Choose Starter</a></article>
        <article class="sf-price-card" data-featured="true"><h3>Team</h3><p class="sf-price">$49</p><a class="sf-button" href="#contact">Choose Team</a></article>
      </div>
    </div>
  </section>
</main>`,
    },
    {
      id: 'portfolio-scroll',
      name: 'Scroll snap portfolio',
      whenToUse: 'Portfolio, case study, or studio pages that use full-panel storytelling.',
      sections: ['sticky-navigation', 'scroll-snap-page', 'card-grid', 'contact-form'],
      classes: ['sf-sticky-top', 'sf-scroll-viewport', 'sf-scroll-panel', 'sf-split', 'sf-card', 'sf-frame', 'sf-button'],
      keywords: ['portfolio', 'scroll', 'snap', 'case', 'study', 'studio', 'full-page', 'panel'],
      markup: `<header class="sf-section sf-section--compact sf-sticky-top sf-bg-background">
  <nav class="sf-container sf-nav" aria-label="Portfolio navigation">
    <a class="sf-nav__link" href="#intro">Studio</a>
    <ul class="sf-nav__list"><li><a class="sf-nav__link" href="#work">Work</a></li><li><a class="sf-nav__link" href="#contact">Contact</a></li></ul>
  </nav>
</header>
<main class="sf-scroll-viewport" data-snap="mandatory">
  <section class="sf-scroll-panel" id="intro">
    <div class="sf-container sf-stack">
      <p class="sf-kicker">Selected work</p>
      <h1 class="sf-text-display">Fluid portfolio panels with native scroll snap.</h1>
      <p class="sf-text-lead sf-prose">Use each panel for one story, proof point, or call to action.</p>
    </div>
  </section>
  <section class="sf-scroll-panel" id="work">
    <div class="sf-container sf-split">
      <div class="sf-card sf-stack"><p class="sf-badge">Case study</p><h2 class="sf-text-h2">Project title</h2><p class="sf-text-muted">Replace this panel with project details.</p></div>
      <div class="sf-frame sf-card"></div>
    </div>
  </section>
  <section class="sf-scroll-panel" id="contact">
    <div class="sf-container sf-stack"><h2 class="sf-text-h2">Let's build the next one.</h2><a class="sf-button" href="mailto:hello@example.com">Start a project</a></div>
  </section>
</main>`,
    },
    {
      id: 'agency-home',
      name: 'Agency homepage',
      whenToUse: 'Agency, consultancy, or service business websites with services, proof, team, and contact.',
      sections: ['sticky-navigation', 'hero-split', 'card-grid', 'contact-form'],
      classes: ['sf-nav', 'sf-hero', 'sf-split', 'sf-feature', 'sf-testimonial', 'sf-stats', 'sf-form', 'sf-footer'],
      keywords: ['agency', 'consultancy', 'service', 'team', 'proof', 'testimonial', 'contact'],
      markup: `<main>
  <section class="sf-hero">
    <div class="sf-container sf-split">
      <div class="sf-stack"><p class="sf-kicker">Agency</p><h1 class="sf-text-display">Strategy, design, and build in one fluid system.</h1><p class="sf-text-lead sf-prose">A complete service homepage using Synced Fluid primitives.</p><a class="sf-button" href="#contact">Plan a project</a></div>
      <aside class="sf-stats"><article class="sf-stat"><strong class="sf-stat__value">12</strong><span class="sf-stat__label">Years</span></article><article class="sf-stat"><strong class="sf-stat__value">80+</strong><span class="sf-stat__label">Launches</span></article></aside>
    </div>
  </section>
  <section class="sf-section"><div class="sf-container sf-auto-grid"><article class="sf-feature"><h2 class="sf-feature__title">Positioning</h2><p class="sf-feature__text">Turn offers into clear site structure.</p></article><article class="sf-feature"><h2 class="sf-feature__title">Design systems</h2><p class="sf-feature__text">Build tokens before pages.</p></article><article class="sf-feature"><h2 class="sf-feature__title">Delivery</h2><p class="sf-feature__text">Ship fast with fewer one-off styles.</p></article></div></section>
  <section class="sf-section" id="contact"><div class="sf-container sf-cta"><h2 class="sf-text-h2">Ready to scope the work?</h2><a class="sf-button" href="mailto:hello@example.com">Contact us</a></div></section>
</main>`,
    },
    {
      id: 'blog-index',
      name: 'Blog index',
      whenToUse: 'Editorial indexes, resources pages, changelogs, and news listings.',
      sections: ['sticky-navigation', 'card-grid', 'long-form-content'],
      classes: ['sf-breadcrumb', 'sf-section-header', 'sf-auto-grid', 'sf-card', 'sf-meta', 'sf-pagination'],
      keywords: ['blog', 'index', 'resources', 'articles', 'news', 'seo', 'cards'],
      markup: `<main class="sf-section">
  <div class="sf-container sf-stack">
    <nav class="sf-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>Resources</span></nav>
    <header class="sf-section-header"><p class="sf-kicker">Resources</p><h1 class="sf-text-display">Ideas, guides, and product notes.</h1></header>
    <div class="sf-auto-grid">
      <article class="sf-card sf-card--interactive sf-stack"><p class="sf-meta">Guide - 6 min read</p><h2 class="sf-text-h4"><a class="sf-link-plain" href="/articles/theme-tokens">Theme tokens first</a></h2><p class="sf-text-muted">Keep brand decisions reusable.</p></article>
      <article class="sf-card sf-card--interactive sf-stack"><p class="sf-meta">Pattern - 4 min read</p><h2 class="sf-text-h4"><a class="sf-link-plain" href="/articles/native-ui">Native UI patterns</a></h2><p class="sf-text-muted">Use browser primitives before JavaScript.</p></article>
    </div>
    <nav class="sf-pagination" aria-label="Pagination"><a href="#">Previous</a><a aria-current="page" href="#">1</a><a href="#">2</a><a href="#">Next</a></nav>
  </div>
</main>`,
    },
    {
      id: 'article-page',
      name: 'Article page',
      whenToUse: 'Long-form blog posts, documentation pages, legal content, and case studies.',
      sections: ['long-form-content'],
      classes: ['sf-breadcrumb', 'sf-prose', 'sf-prose--blog', 'sf-meta', 'sf-figure', 'sf-caption', 'sf-table-wrap'],
      keywords: ['article', 'post', 'prose', 'legal', 'documentation', 'case', 'study', 'long-form'],
      markup: `<main class="sf-section">
  <article class="sf-container sf-prose sf-prose--blog">
    <nav class="sf-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><a href="/articles">Articles</a><span>Theme tokens</span></nav>
    <p class="sf-meta">Guide - 6 min read - Updated today</p>
    <h1>Theme tokens before page CSS</h1>
    <p class="sf-text-lead">Synced Fluid works best when repeated brand decisions live in config.</p>
    <figure class="sf-figure"><div class="sf-frame"></div><figcaption class="sf-caption">Use real project imagery here.</figcaption></figure>
    <h2>Start with primitives</h2>
    <p>Use semantic colours, fluid spacing, and named components before adding custom CSS.</p>
    <div class="sf-table-wrap"><table><thead><tr><th>Layer</th><th>Use</th></tr></thead><tbody><tr><td>Tokens</td><td>Brand decisions</td></tr><tr><td>Components</td><td>Common UI</td></tr></tbody></table></div>
  </article>
</main>`,
    },
    {
      id: 'about-timeline',
      name: 'About and timeline',
      whenToUse: 'About pages, company stories, roadmaps, and chronological proof sections.',
      sections: ['hero-split', 'card-grid'],
      classes: ['sf-section', 'sf-container', 'sf-split', 'sf-stack', 'sf-card', 'sf-meta'],
      keywords: ['about', 'timeline', 'history', 'roadmap', 'company', 'story'],
      markup: `<main>
  <section class="sf-section"><div class="sf-container sf-split"><div class="sf-stack"><p class="sf-kicker">About</p><h1 class="sf-text-display">Built for teams who want fast, modern CSS.</h1></div><p class="sf-text-lead sf-prose">Tell the company story with clear type, spacing, and surfaces.</p></div></section>
  <section class="sf-section"><div class="sf-container sf-stack"><h2 class="sf-text-h2">Timeline</h2><div class="sf-stack"><article class="sf-card"><p class="sf-meta">2024</p><h3>Started with fluid tokens</h3></article><article class="sf-card"><p class="sf-meta">2026</p><h3>Expanded into native-first recipes</h3></article></div></div></section>
</main>`,
    },
    {
      id: 'team-grid',
      name: 'Team grid',
      whenToUse: 'Team, advisors, contributors, partners, or speaker sections.',
      sections: ['card-grid'],
      classes: ['sf-section', 'sf-container', 'sf-section-header', 'sf-auto-grid', 'sf-card', 'sf-frame', 'sf-meta'],
      keywords: ['team', 'people', 'advisors', 'contributors', 'partners', 'speakers'],
      markup: `<section class="sf-section">
  <div class="sf-container sf-stack">
    <header class="sf-section-header"><p class="sf-kicker">Team</p><h2 class="sf-text-h2">People behind the work.</h2></header>
    <div class="sf-auto-grid">
      <article class="sf-card sf-stack"><div class="sf-frame"></div><h3 class="sf-text-h4">Alex Morgan</h3><p class="sf-meta">Design systems</p></article>
      <article class="sf-card sf-stack"><div class="sf-frame"></div><h3 class="sf-text-h4">Jamie Lee</h3><p class="sf-meta">Frontend engineering</p></article>
    </div>
  </div>
</section>`,
    },
    {
      id: 'contact-page',
      name: 'Contact page',
      whenToUse: 'Contact, lead capture, support, and booking pages.',
      sections: ['contact-form', 'faq-disclosure-tabs'],
      classes: ['sf-section', 'sf-container', 'sf-split', 'sf-form', 'sf-field', 'sf-input', 'sf-textarea', 'sf-disclosure'],
      keywords: ['contact', 'lead', 'form', 'support', 'booking', 'faq'],
      markup: `<main class="sf-section">
  <div class="sf-container sf-split">
    <div class="sf-stack"><p class="sf-kicker">Contact</p><h1 class="sf-text-display">Tell us what you are building.</h1><details class="sf-disclosure"><summary>When will you reply?</summary><p>Usually within one working day.</p></details></div>
    <form class="sf-form sf-card"><label class="sf-field"><span class="sf-label">Email</span><input class="sf-input" type="email" required /></label><label class="sf-field"><span class="sf-label">Message</span><textarea class="sf-textarea" rows="5"></textarea></label><button class="sf-button" type="submit">Send</button></form>
  </div>
</main>`,
    },
    {
      id: 'not-found',
      name: '404 page',
      whenToUse: 'Missing pages and broken routes that need a useful recovery path.',
      sections: ['hero-split'],
      classes: ['sf-section', 'sf-container', 'sf-stack', 'sf-text-display', 'sf-button', 'sf-button--outline'],
      keywords: ['404', 'not-found', 'error', 'missing', 'empty'],
      markup: `<main class="sf-section">
  <section class="sf-container sf-stack">
    <p class="sf-kicker">404</p>
    <h1 class="sf-text-display">This page is not available.</h1>
    <p class="sf-text-lead sf-prose">The link may be old, or the page may have moved.</p>
    <div class="sf-cluster"><a class="sf-button" href="/">Go home</a><a class="sf-button sf-button--outline" href="/contact">Contact support</a></div>
  </section>
</main>`,
    },
    {
      id: 'coming-soon',
      name: 'Coming soon page',
      whenToUse: 'Pre-launch pages, waitlists, newsletter capture, and product teasers.',
      sections: ['hero-split', 'contact-form'],
      classes: ['sf-section', 'sf-container', 'sf-stack', 'sf-card', 'sf-form', 'sf-input', 'sf-button', 'sf-badge'],
      keywords: ['coming', 'soon', 'waitlist', 'launch', 'newsletter', 'signup'],
      markup: `<main class="sf-section">
  <section class="sf-container sf-split">
    <div class="sf-stack"><p class="sf-badge">Coming soon</p><h1 class="sf-text-display">A new product is almost ready.</h1><p class="sf-text-lead sf-prose">Join the list for launch updates.</p></div>
    <form class="sf-form sf-card"><label class="sf-field"><span class="sf-label">Email</span><input class="sf-input" type="email" placeholder="you@example.com" required /></label><button class="sf-button" type="submit">Join waitlist</button></form>
  </section>
</main>`,
    },
  ]
}

function getPublicCatalog() {
  const tokens = getTokenSummary()
  return {
    name: '@synced/fluid',
    purpose: 'A dependency-free fluid CSS system for complete modern websites using tokens, layout primitives, native components, recipes, and generated utilities.',
    cssFiles: ['styles.css', 'tokens.css', 'reset.css', 'base.css', 'app.css', 'layout.css', 'components.css', 'utilities.css'],
    commands: ['init', 'build', 'watch', 'lint', 'doctor', 'tokens', 'catalog', 'suggest', 'recipe', 'theme init', 'theme validate'],
    tokens,
    classes: tokens.starterClasses,
    patterns: getPublicPatterns(),
    recipes: getPublicRecipes(),
    guardrails: [
      'Prefer tokens and sf-* primitives before custom CSS.',
      'Do not import styles.css alongside modular core layer files.',
      'Keep generated utility class names complete in source files.',
      'Use theme config for repeated brand choices.',
      'Keep JavaScript optional; native components are styled, not shipped as JS widgets.',
    ],
  }
}

function runTokens() {
  const tokenSummary = getTokenSummary()

  if (args.includes('--json')) {
    console.log(JSON.stringify(tokenSummary, null, 2))
    return
  }

  console.log('Synced Fluid tokens')
  console.log('')
  console.log(`Themes: ${tokenSummary.themePresets.join(', ')}`)
  console.log(`Type: sf-step-${fluidConfig.typeMinStep} ... sf-step-${fluidConfig.typeMaxStep}`)
  console.log(`Space: ${tokenSummary.space.map((name) => `sf-space-${name}`).join(', ')}`)
  console.log(`Semantic colours: ${tokenSummary.colours.semantic.map((name) => `sf-colour-${cssTokenName(name)}`).join(', ')}`)
  console.log(`Layout classes: ${tokenSummary.starterClasses.layout.join(', ')}`)
  console.log(`Component classes: ${tokenSummary.starterClasses.components.join(', ')}`)
  console.log('')
  console.log('Use --json for a machine-readable token map.')
}

function runCatalog() {
  const catalog = getPublicCatalog()
  if (args.includes('--json')) {
    console.log(JSON.stringify(catalog, null, 2))
    return
  }

  console.log('Synced Fluid catalog')
  console.log('')
  console.log(catalog.purpose)
  console.log('')
  console.log(`Commands: ${catalog.commands.join(', ')}`)
  console.log(`Patterns: ${catalog.patterns.map((pattern) => pattern.id).join(', ')}`)
  console.log(`Recipes: ${catalog.recipes.map((recipe) => recipe.id).join(', ')}`)
  console.log('')
  console.log('Use --json for the full machine-readable API catalog.')
}

function runSuggest() {
  const json = args.includes('--json')
  const limit = Number(readOption('limit', '3'))
  const query = readPositionals().join(' ').trim()
  if (!query) {
    console.error('Pass a short brief, for example: synced-fluid suggest "full page scroll portfolio"')
    process.exit(1)
  }

  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const scored = scoreCatalogItems(getPublicPatterns(), terms, limit)
  const recipeMatches = scoreCatalogItems(getPublicRecipes(), terms, limit)

  if (json) {
    console.log(JSON.stringify({ query, suggestions: scored, recipes: recipeMatches }, null, 2))
    return
  }

  if (!scored.length && !recipeMatches.length) {
    console.log('No close recipe match found. Run synced-fluid catalog --json to inspect available patterns.')
    return
  }

  console.log(`Suggestions for "${query}"`)
  if (recipeMatches.length) {
    console.log('')
    console.log('Recipes:')
    for (const recipe of recipeMatches) {
      console.log(`- ${recipe.id}: ${recipe.name}`)
      console.log(`  Use: ${recipe.whenToUse}`)
      console.log(`  Command: synced-fluid recipe ${recipe.id}`)
    }
  }
  if (scored.length) {
    console.log('')
    console.log('Patterns:')
    for (const pattern of scored) {
      console.log(`- ${pattern.id}: ${pattern.name}`)
      console.log(`  Classes: ${pattern.classes.join(' ')}`)
      console.log(`  Markup: ${pattern.markup}`)
    }
  }
}

function scoreCatalogItems(items, terms, limit) {
  return items
    .map((item) => {
      const haystack = [item.id, item.name, item.whenToUse, ...(item.keywords ?? []), ...(item.classes ?? []), ...(item.sections ?? [])].join(' ').toLowerCase()
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 2 : 0) + (item.keywords ?? []).filter((keyword) => keyword.includes(term)).length, 0)
      return { ...item, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 3)
}

function runRecipe() {
  const id = readPositionals()[0]
  const framework = readOption('framework', 'html')
  const section = readOption('section')
  const recipes = getPublicRecipes()
  const patterns = getPublicPatterns()

  if (section) {
    const pattern = findPattern(section, patterns)
    if (!pattern) {
      console.error(`Unknown section "${section}". Use one of: ${patterns.map((entry) => entry.id).join(', ')}.`)
      process.exit(1)
    }
    const markup = renderMarkup(pattern.markup, framework, pattern.name)
    if (args.includes('--json')) {
      console.log(JSON.stringify({ ...pattern, framework, renderedMarkup: markup }, null, 2))
      return
    }
    console.log(`${pattern.id}: ${pattern.name}`)
    console.log(`Use: ${pattern.whenToUse}`)
    console.log(`Classes: ${pattern.classes.join(' ')}`)
    if (args.includes('--markup')) {
      console.log('')
      console.log(markup)
    }
    return
  }

  if (args.includes('--json')) {
    const payload = id ? recipes.find((recipe) => recipe.id === id) : recipes
    if (!payload) {
      console.error(`Unknown recipe "${id}". Use one of: ${recipes.map((recipe) => recipe.id).join(', ')}.`)
      process.exit(1)
    }
    if (Array.isArray(payload)) console.log(JSON.stringify(payload, null, 2))
    else console.log(JSON.stringify({ ...payload, framework, renderedMarkup: renderMarkup(payload.markup, framework, payload.name) }, null, 2))
    return
  }

  if (!id) {
    console.log('Synced Fluid recipes')
    for (const recipe of recipes) {
      console.log(`- ${recipe.id}: ${recipe.name}`)
    }
    console.log('')
    console.log('Run synced-fluid recipe <id> --markup to print copy-ready HTML.')
    return
  }

  const recipe = recipes.find((entry) => entry.id === id)
  if (!recipe) {
    console.error(`Unknown recipe "${id}". Use one of: ${recipes.map((entry) => entry.id).join(', ')}.`)
    process.exit(1)
  }

  console.log(`${recipe.id}: ${recipe.name}`)
  console.log(`Use: ${recipe.whenToUse}`)
  console.log(`Sections: ${recipe.sections.join(', ')}`)
  console.log(`Classes: ${recipe.classes.join(' ')}`)
  console.log(`Framework: ${framework}`)
  if (args.includes('--markup')) {
    console.log('')
    console.log(renderMarkup(recipe.markup, framework, recipe.name))
  }
}

function findPattern(value, patterns) {
  const normal = value.toLowerCase()
  return (
    patterns.find((pattern) => pattern.id === normal) ??
    patterns.find((pattern) => pattern.keywords.some((keyword) => keyword === normal)) ??
    patterns.find((pattern) => pattern.name.toLowerCase().includes(normal))
  )
}

function renderMarkup(markup, framework, name) {
  if (framework === 'html' || framework === 'astro-html') return markup
  if (framework === 'astro') {
    return `---
import '../styles/synced-fluid.css'
---

${markup}`
  }
  if (framework === 'next' || framework === 'react' || framework === 'jsx') {
    return `export default function Page() {
  return (
    <>
${indentMarkup(htmlToJsx(markup), 6)}
    </>
  )
}`
  }

  console.error(`Unknown framework "${framework}". Use html, next, react, or astro.`)
  process.exit(1)
}

function htmlToJsx(markup) {
  return markup
    .replace(/\bclass=/g, 'className=')
    .replace(/\bfor=/g, 'htmlFor=')
    .replace(/<!--/g, '{/*')
    .replace(/-->/g, '*/}')
}

function indentMarkup(markup, spaces) {
  const pad = ' '.repeat(spaces)
  return markup.split('\n').map((line) => `${pad}${line}`).join('\n')
}

async function runThemeCommand() {
  const subcommand = args.shift()
  if (subcommand === 'init') return runThemeInit()
  if (subcommand === 'validate') return runThemeValidate()

  console.error('Unknown theme command. Use: synced-fluid theme init --from brief.md or synced-fluid theme validate')
  return 1
}

function runThemeInit() {
  const targetCwd = resolve(readOption('cwd', process.cwd()))
  const from = readOption('from')
  const presetBase = normalizeThemeName(readOption('preset-base', 'synced'))
  if (!themePresets[presetBase]) {
    console.error(`Unknown preset base "${readOption('preset-base')}". Use one of: ${presetNames.map(kebabThemeName).join(', ')}.`)
    return 1
  }
  if (!from) {
    console.error('Pass a theme brief with --from <file>, for example: synced-fluid theme init --from brief.md')
    return 1
  }

  const briefFile = resolve(targetCwd, from)
  if (!existsSync(briefFile)) {
    console.error(`Theme brief not found: ${relative(targetCwd, briefFile)}`)
    return 1
  }

  const brief = readFileSync(briefFile, 'utf8')
  const analysis = analyseThemeBrief(brief)
  const theme = themeFromBrief(brief, presetBase)
  const errors = []
  validateTheme(theme, errors)
  if (errors.length) {
    console.error('Generated theme was invalid:')
    for (const error of errors) console.error(`  - ${error}`)
    return 1
  }

  const summary = summarizeTheme(theme)
  if (args.includes('--json')) {
    console.log(JSON.stringify({ summary, presetBase: kebabThemeName(presetBase), warnings: analysis.warnings, theme }, null, 2))
    return 0
  }

  console.log(`Summary: ${summary}`)
  console.log(`Preset base: ${kebabThemeName(presetBase)}`)
  if (analysis.warnings.length) {
    console.log('')
    console.log('Warnings:')
    for (const warning of analysis.warnings) console.log(`- ${warning}`)
  }
  console.log('')
  console.log('Paste this into synced-fluid.config.mjs:')
  console.log('')
  console.log(`theme: ${formatJsValue(theme, 0)},`)
  return 0
}

async function runThemeValidate() {
  const targetCwd = resolve(readOption('cwd', process.cwd()))
  const configPath = resolveConfigPath(readOption('config'), targetCwd)
  if (!configPath) {
    console.error('synced-fluid.config.mjs was not found.')
    return 1
  }

  const loaded = await loadConfig(configPath)
  const errors = []
  if (loaded.theme === undefined) errors.push('theme is missing. Add themePresets.<name> or a theme object.')
  else validateTheme(loaded.theme, errors)

  if (errors.length) {
    console.error(`Invalid Synced Fluid theme in ${relative(targetCwd, configPath)}:`)
    for (const error of errors) console.error(`  - ${error}`)
    return 1
  }

  console.log(`pass theme is valid in ${relative(targetCwd, configPath)}.`)
  return 0
}

function analyseThemeBrief(brief) {
  const lower = brief.toLowerCase()
  const checks = [
    ['radius', /\b(radius|rounded|square|sharp|pill|curved)\b/],
    ['font', /\b(font|typeface|sans|serif|inter|system|editorial|display)\b/],
    ['primary colour', /\b(primary|brand)\b.*\b(blue|green|orange|red|purple|violet|teal|cyan|pink|amber|yellow|slate|black|neutral)\b/],
    ['accent colour', /\b(accent|secondary)\b.*\b(blue|green|orange|red|purple|violet|teal|cyan|pink|amber|yellow|slate|black|neutral)\b/],
    ['surface style', /\b(surface|card|raised|elevated|flat|warm)\b/],
    ['density', /\b(compact|dense|spacious|generous|open)\b/],
  ]
  const warnings = checks
    .filter(([, pattern]) => !pattern.test(lower))
    .map(([label]) => `Brief does not mention ${label}; Synced Fluid used a sensible default.`)
  return { warnings }
}

function themeFromBrief(brief, presetBase = 'synced') {
  const lower = brief.toLowerCase()
  const base = structuredClone(themePresets[presetBase] ?? themePresets.synced)
  const primary = findNamedColour(lower, 'primary') ?? findNamedColour(lower, 'brand') ?? findAnyColour(lower) ?? base.colours?.primary ?? 'oklch(62% 0.19 252)'
  const accent = findNamedColour(lower, 'accent') ?? findNamedColour(lower, 'secondary') ?? base.colours?.accent ?? (primary.includes('252') ? 'oklch(68% 0.16 150)' : 'oklch(62% 0.19 252)')
  const radius = lower.includes('no radius') || lower.includes('square') || lower.includes('sharp') ? '0.125rem' : lower.includes('pill') || lower.includes('fully rounded') ? '999rem' : lower.includes('slightly') || lower.includes('subtle') ? '0.5rem' : base.components?.button?.radius ?? '0.875rem'
  const compact = lower.includes('compact') || lower.includes('dense')
  const spacious = lower.includes('spacious') || lower.includes('generous') || lower.includes('open')
  const raised = lower.includes('raised') || lower.includes('elevated') || lower.includes('shadow')
  const flat = lower.includes('flat')
  const serif = lower.includes('serif') || lower.includes('editorial')
  const mono = lower.includes('mono') || lower.includes('developer')
  const warm = lower.includes('warm')

  return mergeTheme(base, {
    fonts: {
      sans: lower.includes('inter') ? 'Inter, ui-sans-serif, system-ui, sans-serif' : base.fonts?.sans ?? 'ui-sans-serif, system-ui, sans-serif',
      display: serif ? 'Georgia, ui-serif, serif' : base.fonts?.display ?? 'var(--sf-font-sans)',
      ...(mono ? { mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' } : {}),
    },
    colours: {
      primary,
      link: primary,
      ring: primary,
      accent,
      surface: warm ? 'oklch(97% 0.018 72)' : base.colours?.surface ?? 'oklch(98% 0.004 248)',
      'surface-alt': warm ? 'oklch(94% 0.024 72)' : base.colours?.surfaceAlt ?? base.colours?.['surface-alt'] ?? 'oklch(95% 0.006 248)',
    },
    darkColours: {
      primary: colorForDarkMode(primary),
      link: colorForDarkMode(primary),
      ring: colorForDarkMode(primary),
      accent: colorForDarkMode(accent),
    },
    radii: {
      md: radius,
      lg: radius,
      xl: radius === '999rem' ? '1.75rem' : `calc(${radius} * 1.4)`,
    },
    layout: {
      containerMax: lower.includes('wide') ? '82rem' : lower.includes('narrow') ? '64rem' : base.layout?.containerMax ?? '72rem',
      gutter: compact ? 'var(--space-xs-s)' : spacious ? 'var(--space-m-xl)' : base.layout?.gutter ?? 'var(--space-s-l)',
    },
    components: {
      button: {
        radius,
        blockSize: compact ? '2.5rem' : spacious ? '3rem' : '2.75rem',
        paddingInline: compact ? 'var(--space-xs)' : 'var(--space-s)',
      },
      card: {
        radius: radius === '999rem' ? '1.5rem' : `calc(${radius} * 1.4)`,
        padding: compact ? 'var(--space-s)' : spacious ? 'var(--space-l)' : 'var(--space-m-l)',
        ...(raised ? { shadow: 'var(--shadow-md)' } : {}),
        ...(flat ? { shadow: 'none' } : {}),
      },
      input: {
        radius,
        blockSize: compact ? '2.5rem' : '2.75rem',
      },
    },
  })
}

function mergeTheme(base, overrides) {
  const output = structuredClone(base)
  for (const [key, value] of Object.entries(overrides)) {
    if (isPlainObject(value) && isPlainObject(output[key])) output[key] = mergeTheme(output[key], value)
    else output[key] = value
  }
  return output
}

function findNamedColour(brief, label) {
  const segment = brief.match(new RegExp(`${label}[^\\n.;,]*(blue|green|orange|red|purple|violet|teal|cyan|pink|amber|yellow|slate|black|neutral)`))
  return segment ? colourFromName(segment[1]) : null
}

function findAnyColour(brief) {
  const match = brief.match(/\b(blue|green|orange|red|purple|violet|teal|cyan|pink|amber|yellow|slate|black|neutral)\b/)
  return match ? colourFromName(match[1]) : null
}

function colourFromName(name) {
  return {
    blue: 'oklch(62% 0.19 252)',
    green: 'oklch(62% 0.16 150)',
    orange: 'oklch(69% 0.18 44)',
    red: 'oklch(58% 0.22 26)',
    purple: 'oklch(58% 0.2 292)',
    violet: 'oklch(58% 0.2 292)',
    teal: 'oklch(64% 0.13 186)',
    cyan: 'oklch(70% 0.13 210)',
    pink: 'oklch(64% 0.2 8)',
    amber: 'oklch(72% 0.16 70)',
    yellow: 'oklch(80% 0.15 92)',
    slate: 'oklch(44% 0.04 258)',
    black: 'oklch(22% 0.02 258)',
    neutral: 'oklch(48% 0.02 248)',
  }[name]
}

function colorForDarkMode(value) {
  if (value.includes('252')) return 'oklch(72% 0.14 252)'
  if (value.includes('150')) return 'oklch(76% 0.13 150)'
  if (value.includes('44')) return 'oklch(76% 0.14 44)'
  if (value.includes('292')) return 'oklch(74% 0.14 292)'
  return value
}

function summarizeTheme(theme) {
  const displayFont = theme.fonts.display.toLowerCase()
  const displayLabel = /\b(georgia|fraunces|ui-serif)\b/.test(displayFont) ? 'serif display' : 'system display'
  return `${theme.radii.md} radius, ${displayLabel}, ${theme.colours.primary} primary, ${theme.colours.accent} accent, ${theme.layout.containerMax} container.`
}

function formatJsValue(value, indent = 0) {
  const pad = ' '.repeat(indent)
  const nextPad = ' '.repeat(indent + 2)
  if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.map((item) => formatJsValue(item, indent)).join(', ')}]`
  if (isPlainObject(value)) {
    const entries = Object.entries(value)
    if (!entries.length) return '{}'
    const lines = entries.map(([key, nested]) => `${nextPad}${/^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`}: ${formatJsValue(nested, indent + 2)},`)
    return `{\n${lines.join('\n')}\n${pad}}`
  }
  return 'undefined'
}

function detectPreset(targetCwd) {
  if (existsSync(resolve(targetCwd, 'next.config.js')) || existsSync(resolve(targetCwd, 'next.config.mjs')) || existsSync(resolve(targetCwd, 'next.config.ts'))) return 'next'
  if (existsSync(resolve(targetCwd, 'astro.config.mjs')) || existsSync(resolve(targetCwd, 'astro.config.ts'))) return 'astro'
  if (existsSync(resolve(targetCwd, 'vite.config.js')) || existsSync(resolve(targetCwd, 'vite.config.ts')) || existsSync(resolve(targetCwd, 'vite.config.mjs'))) return 'vite'
  if (existsSync(resolve(targetCwd, 'functions.php')) || existsSync(resolve(targetCwd, 'theme.json'))) return 'wordpress'
  if (existsSync(resolve(targetCwd, 'src'))) return 'react'
  return 'plain'
}

function defaultScanDirs(targetCwd, preset) {
  const candidates = {
    next: ['app', 'pages', 'components', 'lib', 'src'],
    vite: ['src', 'components', 'lib'],
    react: ['src', 'components', 'lib'],
    astro: ['src', 'components'],
    wordpress: ['templates', 'parts', 'patterns', 'blocks', 'inc', 'includes', 'src', 'assets'],
    plain: ['src', '.'],
    legacy: ['app', 'pages', 'components', 'lib', 'src'],
  }[preset] ?? ['src']

  const existing = candidates.filter((dir) => existsSync(resolve(targetCwd, dir)))
  return existing.length ? existing : candidates.slice(0, 1)
}

function defaultOutputPath(targetCwd, preset) {
  if (preset === 'next') {
    if (existsSync(resolve(targetCwd, 'app'))) return 'app/synced-fluid.generated.css'
    if (existsSync(resolve(targetCwd, 'src/app'))) return 'src/app/synced-fluid.generated.css'
  }
  if (preset === 'wordpress') return 'assets/css/synced-fluid.css'
  if (preset === 'plain') return 'synced-fluid.generated.css'
  return 'src/synced-fluid.generated.css'
}

function defaultStyleEntryPath(targetCwd, preset, outPath) {
  if (preset === 'next') return outPath.replace(/synced-fluid\.generated\.css$/, 'synced-fluid.css')
  if (preset === 'wordpress') return outPath
  if (preset === 'plain') return 'synced-fluid.css'
  return existsSync(resolve(targetCwd, 'src')) ? 'src/synced-fluid.css' : 'synced-fluid.css'
}

function defaultIncludeApp(preset) {
  return ['next', 'vite', 'react', 'astro', 'plain'].includes(preset)
}

function findStyleEntry(targetCwd) {
  const candidates = [
    'src/synced-fluid.css',
    'app/synced-fluid.css',
    'src/app/synced-fluid.css',
    'synced-fluid.css',
  ]

  for (const candidate of candidates) {
    if (existsSync(resolve(targetCwd, candidate))) return candidate
  }

  const roots = ['app', 'src', 'pages', 'components', 'assets'].filter((dir) => existsSync(resolve(targetCwd, dir)))
  for (const root of roots) {
    const files = listProjectFiles(resolve(targetCwd, root))
    const match = files.find((file) => file.endsWith('.css') && readFileSync(file, 'utf8').includes('@synced/fluid/'))
    if (match) return relative(targetCwd, match)
  }

  return null
}

function writeProjectFile(file, contents, force) {
  if (existsSync(file) && !force) {
    console.log(`skip ${relative(process.cwd(), file)} already exists. Use --force to overwrite.`)
    return
  }
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, contents)
  console.log(`write ${relative(process.cwd(), file)}`)
}

function writeGeneratedCss(file, contents) {
  mkdirSync(dirname(file), { recursive: true })
  const tempFile = `${file}.${process.pid}.tmp`
  writeFileSync(tempFile, contents)
  renameSync(tempFile, file)
}

function addPackageScripts(targetCwd) {
  const packageFile = resolve(targetCwd, 'package.json')
  if (!existsSync(packageFile)) {
    console.log('skip package.json not found; scripts were not added.')
    return
  }

  const pkg = JSON.parse(readFileSync(packageFile, 'utf8'))
  pkg.scripts ??= {}
  pkg.scripts['fluid:build'] ??= 'synced-fluid build'
  pkg.scripts['fluid:check'] ??= 'synced-fluid build --check'
  pkg.scripts['fluid:doctor'] ??= 'synced-fluid doctor'
  pkg.scripts['fluid:lint'] ??= 'synced-fluid lint'
  pkg.scripts['fluid:watch'] ??= 'synced-fluid watch'
  writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`)
  console.log('update package.json scripts')
}

function formatStringArray(values) {
  return `[${values.map((value) => `'${value}'`).join(', ')}]`
}

function projectContains(targetCwd, needle) {
  return allProjectFiles(targetCwd).some((file) => readFileSync(file, 'utf8').includes(needle))
}

function allProjectFiles(targetCwd) {
  const rootFiles = ['synced-fluid.css', 'styles.css', 'style.css', 'app.css', 'global.css', 'globals.css']
    .map((file) => resolve(targetCwd, file))
    .filter((file) => existsSync(file))

  const roots = ['app', 'src', 'pages', 'components', 'templates', 'parts', 'patterns', 'blocks', 'inc', 'includes', 'assets'].filter((dir) => existsSync(resolve(targetCwd, dir)))
  return [...rootFiles, ...roots.flatMap((root) => listProjectFiles(resolve(targetCwd, root)))]
}

function findDuplicateCoreImports(targetCwd) {
  const modularImports = ['tokens.css', 'reset.css', 'base.css', 'app.css', 'layout.css', 'components.css', 'utilities.css']
  return allProjectFiles(targetCwd)
    .filter((file) => file.endsWith('.css'))
    .filter((file) => {
      const css = readFileSync(file, 'utf8')
      return css.includes('@synced/fluid/styles.css') && modularImports.some((name) => css.includes(`@synced/fluid/${name}`))
    })
    .map((file) => relative(targetCwd, file))
}

function findCustomTokenOverrides(targetCwd) {
  return allProjectFiles(targetCwd)
    .filter((file) => file.endsWith('.css'))
    .filter((file) => {
      const relativeFile = relative(targetCwd, file)
      if (/synced-fluid\.generated\.css$/.test(relativeFile)) return false
      const css = readFileSync(file, 'utf8')
      return /--sf-(space|colour|color|font|radius|container|gutter|grid|button|card|input)-/.test(css)
    })
    .map((file) => relative(targetCwd, file))
}

function listProjectFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((entry) => {
    if (isIgnoredDirectory(entry)) return []
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) return listProjectFiles(fullPath)
    if (/\.(css|tsx|ts|jsx|js|astro|html|php|phtml|twig|mdx|vue|svelte)$/.test(entry)) return [fullPath]
    return []
  })
}

function isIgnoredDirectory(entry) {
  return new Set(['.git', '.next', 'coverage', 'dist', 'node_modules', 'out']).has(entry)
}

const semanticColours = {
  background: 'var(--color-background)',
  foreground: 'var(--color-foreground)',
  card: 'var(--color-card)',
  'card-foreground': 'var(--color-card-foreground)',
  popover: 'var(--color-popover)',
  'popover-foreground': 'var(--color-popover-foreground)',
  primary: 'var(--color-primary)',
  'primary-hover': 'var(--color-primary-hover)',
  'primary-label': 'var(--color-primary-label)',
  'primary-border': 'var(--color-primary-border)',
  'primary-foreground': 'var(--color-primary-foreground)',
  secondary: 'var(--color-secondary)',
  'secondary-foreground': 'var(--color-secondary-foreground)',
  muted: 'var(--color-muted)',
  'muted-foreground': 'var(--color-muted-foreground)',
  accent: 'var(--color-accent)',
  'accent-foreground': 'var(--color-accent-foreground)',
  destructive: 'var(--color-destructive)',
  'destructive-foreground': 'var(--color-destructive-foreground)',
  border: 'var(--color-border)',
  input: 'var(--color-input)',
  ring: 'var(--color-ring)',
  heading: 'var(--color-heading)',
  'page-text': 'var(--color-page-text)',
  body: 'var(--color-body)',
  'body-dark': 'var(--color-body-dark)',
  subdued: 'var(--color-subdued)',
  surface: 'var(--color-surface)',
  'surface-alt': 'var(--color-surface-alt)',
  'hero-bg': 'var(--color-hero-bg)',
  green: 'var(--color-green)',
  'green-dark': 'var(--color-green-dark)',
  'green-muted': 'var(--color-green-muted)',
  'green-light': 'var(--color-green-light)',
  'green-lighter': 'var(--color-green-lighter)',
  'green-bg': 'var(--color-green-bg)',
  'green-bg-alt': 'var(--color-green-bg-alt)',
  'green-vivid': 'var(--color-green-vivid)',
  'green-mid': 'var(--color-green-mid)',
  'green-deep': 'var(--color-green-deep)',
  'green-deepest': 'var(--color-green-deepest)',
  'green-wash': 'var(--color-green-wash)',
  'green-wash-alt': 'var(--color-green-wash-alt)',
  'green-gradient-from': 'var(--color-green-gradient-from)',
  'green-gradient-to': 'var(--color-green-gradient-to)',
  'deco-lime': 'var(--color-deco-lime)',
  'deco-blue': 'var(--color-deco-blue)',
  'deco-warm': 'var(--color-deco-warm)',
  'deco-warm-light': 'var(--color-deco-warm-light)',
  'deco-warm-mid': 'var(--color-deco-warm-mid)',
  'purple-light': 'var(--color-purple-light)',
  'purple-mid': 'var(--color-purple-mid)',
  'purple-dark': 'var(--color-purple-dark)',
  'purple-darker': 'var(--color-purple-darker)',
  'purple-icon': 'var(--color-purple-icon)',
  'warm-light': 'var(--color-warm-light)',
  'warm-mid': 'var(--color-warm-mid)',
  'warm-grad-to': 'var(--color-warm-grad-to)',
  'warm-grad-to-alt': 'var(--color-warm-grad-to-alt)',
  'warm-icon': 'var(--color-warm-icon)',
  'cool-light': 'var(--color-cool-light)',
  'cool-dark': 'var(--color-cool-dark)',
  'primary-glow': 'var(--color-primary-glow)',
  'primary-soft': 'var(--color-primary-soft)',
  'primary-soft-border': 'var(--color-primary-soft-border)',
  'primary-soft-border-light': 'var(--color-primary-soft-border-light)',
  'primary-soft-text': 'var(--color-primary-soft-text)',
  'primary-highlight': 'var(--color-primary-highlight)',
  white: 'var(--color-white)',
  black: 'var(--color-black)',
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
  red: 'var(--color-red-600)',
  'red-50': 'oklch(97.1% 0.013 17.38)',
  'red-100': 'oklch(93.6% 0.032 17.717)',
  'red-200': 'oklch(88.5% 0.062 18.334)',
  'red-700': 'oklch(50.5% 0.213 27.518)',
  'green-50': 'oklch(98.2% 0.018 155.826)',
  'green-200': 'oklch(92.5% 0.084 155.995)',
  'green-800': 'oklch(44.8% 0.119 151.328)',
}

const palette = {
  slate: { 50: 'oklch(98.4% 0.003 247.858)', 100: 'oklch(96.8% 0.007 247.896)', 200: 'oklch(92.9% 0.013 255.508)', 300: 'oklch(86.9% 0.022 252.894)', 400: 'oklch(70.4% 0.04 256.788)', 500: 'oklch(55.4% 0.046 257.417)', 600: 'oklch(44.6% 0.043 257.281)', 700: 'oklch(37.2% 0.044 257.287)', 800: 'oklch(27.9% 0.041 260.031)', 900: 'oklch(20.8% 0.042 265.755)' },
  gray: { 50: 'oklch(98.5% 0.002 247.839)', 100: 'oklch(96.7% 0.003 264.542)', 200: 'oklch(92.8% 0.006 264.531)', 300: 'oklch(87.2% 0.01 258.338)', 400: 'oklch(70.7% 0.022 261.325)', 500: 'oklch(55.1% 0.027 264.364)', 600: 'oklch(44.6% 0.03 256.802)', 700: 'oklch(37.3% 0.034 259.733)', 800: 'oklch(27.8% 0.033 256.848)', 900: 'oklch(21% 0.034 264.665)' },
  blue: { 50: 'oklch(97% 0.014 254.604)', 100: 'oklch(93.2% 0.032 255.585)', 200: 'oklch(88.2% 0.059 254.128)', 300: 'oklch(80.9% 0.105 251.813)', 400: 'oklch(70.7% 0.165 254.624)', 500: 'oklch(62.3% 0.214 259.815)', 600: 'oklch(54.6% 0.245 262.881)', 700: 'oklch(48.8% 0.243 264.376)', 800: 'oklch(42.4% 0.199 265.638)', 900: 'oklch(37.9% 0.146 265.522)', 950: 'oklch(28.2% 0.091 267.935)' },
  cyan: { 50: 'oklch(98.4% 0.019 200.873)', 100: 'oklch(95.6% 0.045 203.388)', 200: 'oklch(91.7% 0.08 205.041)', 300: 'oklch(86.5% 0.127 207.078)', 400: 'oklch(78.9% 0.154 211.53)', 500: 'oklch(71.5% 0.143 215.221)', 600: 'oklch(60.9% 0.126 221.723)', 700: 'oklch(52% 0.105 223.128)', 800: 'oklch(45% 0.085 224.283)', 900: 'oklch(39.8% 0.07 227.392)', 950: 'oklch(30.2% 0.056 229.695)' },
  green: { 50: 'oklch(98.2% 0.018 155.826)', 100: 'oklch(96.2% 0.044 156.743)', 200: 'oklch(92.5% 0.084 155.995)', 300: 'oklch(87.1% 0.15 154.449)', 400: 'oklch(79.2% 0.209 151.711)', 500: 'oklch(72.3% 0.219 149.579)', 600: 'oklch(62.7% 0.194 149.214)', 700: 'oklch(52.7% 0.154 150.069)', 800: 'oklch(44.8% 0.119 151.328)', 900: 'oklch(39.3% 0.095 152.535)', 950: 'oklch(26.6% 0.065 152.934)' },
  orange: { 50: 'oklch(98% 0.016 73.684)', 100: 'oklch(95.4% 0.038 75.164)', 200: 'oklch(90.1% 0.076 70.697)', 300: 'oklch(83.7% 0.128 66.29)', 400: 'oklch(75% 0.183 55.934)', 500: 'oklch(70.5% 0.213 47.604)', 600: 'oklch(64.6% 0.222 41.116)', 700: 'oklch(55.3% 0.195 38.402)', 800: 'oklch(47% 0.157 37.304)', 900: 'oklch(40.8% 0.123 38.172)', 950: 'oklch(26.6% 0.079 36.259)' },
  red: { 50: 'oklch(97.1% 0.013 17.38)', 100: 'oklch(93.6% 0.032 17.717)', 200: 'oklch(88.5% 0.062 18.334)', 300: 'oklch(80.8% 0.114 19.571)', 400: 'oklch(70.4% 0.191 22.216)', 500: 'oklch(63.7% 0.237 25.331)', 600: 'oklch(57.7% 0.245 27.325)', 700: 'oklch(50.5% 0.213 27.518)', 800: 'oklch(44.4% 0.177 26.899)', 900: 'oklch(39.6% 0.141 25.723)', 950: 'oklch(25.8% 0.092 26.042)' },
  pink: { 600: 'oklch(59.2% 0.249 0.584)', 700: 'oklch(52.5% 0.223 3.958)' },
  amber: { 600: 'oklch(66.6% 0.179 58.318)' },
  yellow: { 400: 'oklch(85.2% 0.199 91.936)', 500: 'oklch(79.5% 0.184 86.047)', 700: 'oklch(55.4% 0.135 66.442)' },
  teal: { 500: 'oklch(70.4% 0.14 182.503)', 600: 'oklch(60% 0.118 184.704)' },
}

const fontSizeMap = {
  xs: 'var(--step--2)',
  sm: 'var(--step--1)',
  base: 'var(--step-0)',
  lg: 'var(--step-1)',
  xl: 'var(--step-2)',
  '2xl': 'var(--step-3)',
  '3xl': 'var(--step-4)',
  '4xl': 'var(--step-5)',
  '5xl': 'var(--step-6)',
  '6xl': 'var(--step-7)',
  '7xl': 'var(--step-8)',
}

const lineHeightMap = {
  none: '1',
  tight: '1.1',
  snug: '1.25',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
  3: '.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
}

const fontWeightMap = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}

function fluidClamp(minPx, maxPx) {
  if (minPx === maxPx) return `${round(minPx / 16)}rem`
  const slope = (maxPx - minPx) / (fluidConfig.maxViewport - fluidConfig.minViewport)
  const intercept = minPx - slope * fluidConfig.minViewport
  return `clamp(${round(minPx / 16)}rem, ${round(intercept / 16)}rem + ${round(slope * 100)}vw, ${round(maxPx / 16)}rem)`
}

function typeStep(step) {
  const minPx = fluidConfig.minRoot * Math.pow(fluidConfig.minTypeScale, step)
  const maxPx = fluidConfig.maxRoot * Math.pow(fluidConfig.maxTypeScale, step)
  return fluidClamp(minPx, maxPx)
}

function spacingUnit(value) {
  if (value === '0') return '0'
  if (value === 'px') return '1px'
  const number = Number(value)
  if (Number.isNaN(number)) return null
  return fluidClamp(number * 4, number * 4.5)
}

function round(value) {
  return Number(value.toFixed(4))
}

function pxToRem(value) {
  return value.replace(/(-?\d*\.?\d+)px/g, (_, number) => {
    const rem = Number(number) / 16
    return `${round(rem)}rem`
  })
}

function arbitraryValue(value) {
  return pxToRem(value.replace(/_/g, ' '))
}

function listFiles(dir) {
  const fullDir = join(repoRoot, dir)
  if (!existsSync(fullDir)) return []

  return readdirSync(fullDir).flatMap((entry) => {
    if (isIgnoredDirectory(entry)) return []
    const fullPath = join(fullDir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) return listFiles(relative(repoRoot, fullPath))
    if (/\.(tsx|ts|jsx|js|astro|html|php|phtml|twig|mdx|vue|svelte)$/.test(entry)) return [fullPath]
    return []
  })
}

function collectClassTokens() {
  const tokens = new Set([
    'sf-container',
    'sf-section',
    'sf-stack',
    'sf-cluster',
    'sf-repel',
    'sf-grid',
    'sf-auto-grid',
    'sf-sidebar',
    'sf-frame',
    'sf-flow',
    'sf-card',
    'sf-button',
    'sf-button--default',
    'sf-button--outline',
    'sf-button--secondary',
    'sf-button--ghost',
    'sf-button--link',
    'sf-button--destructive',
    'sf-button--sm',
    'sf-button--lg',
    'sf-button--icon',
    ...safelist,
  ])

  const stringPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
  const files = sourceDirs.flatMap(listFiles)

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    let match
    while ((match = stringPattern.exec(source))) {
      const raw = match[2].replace(/\$\{[\s\S]*?\}/g, ' ')
      for (const token of raw.split(/\s+/)) {
        const cleaned = token.trim()
        if (looksLikeClass(cleaned)) tokens.add(cleaned)
      }
    }
  }

  return [...tokens].sort()
}

function looksLikeClass(token) {
  if (!token || token.length > 240) return false
  if (/[\n\r{};]/.test(token)) return false
  if (/[,.]$/.test(token)) return false
  if (/^(http|https|mailto|tel):/.test(token)) return false
  if (/^\/|^\.\//.test(token)) return false
  if (/["'<>()]/.test(token) && !/^[a-z-]+\[/.test(token) && !/^[a-z-]+-\[/.test(token) && !/^\[&/.test(token)) return false
  if (/^[\[\](),:]+$/.test(token) || token.endsWith(':')) return false
  if (/^[A-Z][A-Za-z]+$/.test(token)) return false
  if (token.startsWith('--')) return false

  const { base } = splitVariants(token)
  const falseTokens = new Set([
    'content-heavy',
    'list-synced-free-tools',
    'list-synced-insights',
    'list-synced-services',
    'object-alt',
    'right',
    'rights',
    'rings',
    'scale-item',
    'select-name',
    'shadows',
    'text-section',
    'top',
    'transformation',
    'transforming',
    'transitions',
  ])
  if (falseTokens.has(base)) return false
  const exact = new Set([
    'absolute',
    'relative',
    'fixed',
    'sticky',
    'static',
    'isolate',
    'block',
    'inline',
    'inline-block',
    'inline-flex',
    'flex',
    'grid',
    'hidden',
    'contents',
    'sr-only',
    'not-sr-only',
    'group',
    'peer',
    'grow',
    'shrink',
    'uppercase',
    'lowercase',
    'capitalize',
    'truncate',
    'underline',
    'italic',
    'antialiased',
  ])

  return Boolean(
    token.startsWith('sf-') ||
      exact.has(base) ||
      /^\[.+:.+\]$/.test(base) ||
      /^(container|pointer-events-|cursor-|select-|resize|appearance-|overflow-|object-|inset-|top-|right-|bottom-|left-|z-|order-|col-|row-|m[trblxy]?-\S+|p[trblxy]?-\S+|gap-\S+|space-[xy]-\S+|w-\S+|h-\S+|size-\S+|min-[wh]-\S+|max-[wh]-\S+|basis-\S+|flex-\S+|items-|justify-|content-|self-|place-|grid-|rounded|border|divide-|bg-|from-|via-|to-|text-|font-|leading-|tracking-|normal-case|whitespace-|break-|line-clamp-|shadow|ring|outline|opacity-|blur|backdrop-|transition|duration-|ease-|delay-|animate-|transform|origin-|translate-|scale-|rotate-|skew-|fill-|stroke-|accent-|prose|list-|decoration-|underline-offset-|no-underline)/.test(base)
  )
}

function splitVariants(token) {
  const parts = []
  let current = ''
  let depth = 0

  for (const char of token) {
    if (char === '[') depth += 1
    if (char === ']') depth -= 1
    if (char === ':' && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += char
    }
  }

  parts.push(current)
  return { variants: parts.slice(0, -1), base: parts.at(-1) ?? token }
}

function attrEscape(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function selectorFor(token, variants) {
  let selector = `[class~="${attrEscape(token)}"]`
  let pseudoElement = ''
  const wrappers = []

  for (const variant of variants) {
    if (breakpoints[variant]) {
      if (!responsiveVariants) return null
      wrappers.push({ type: 'media', condition: `(min-width: ${breakpoints[variant]})` })
      continue
    }

    if (variant === 'motion-reduce') {
      wrappers.push({ type: 'media', condition: '(prefers-reduced-motion: reduce)' })
      continue
    }

    if (variant === 'motion-safe') {
      wrappers.push({ type: 'media', condition: '(prefers-reduced-motion: no-preference)' })
      continue
    }

    if (variant === 'dark') {
      selector = `.dark ${selector}`
      continue
    }

    if (variant === 'hover' || variant === 'focus' || variant === 'focus-visible' || variant === 'focus-within' || variant === 'active') {
      selector += `:${variant}`
      continue
    }

    if (variant === 'disabled') {
      selector += ':disabled'
      continue
    }

    if (variant === 'first' || variant === 'last' || variant === 'odd' || variant === 'even') {
      selector += `:${variant === 'first' ? 'first-child' : variant === 'last' ? 'last-child' : variant === 'odd' ? 'nth-child(odd)' : 'nth-child(even)'}`
      continue
    }

    if (variant === 'before' || variant === 'after') {
      pseudoElement = `::${variant}`
      continue
    }

    if (variant === 'placeholder') {
      pseudoElement = '::placeholder'
      continue
    }

    if (variant === 'file') {
      pseudoElement = '::file-selector-button'
      continue
    }

    if (variant === 'group-hover') {
      selector = `.group:hover ${selector}`
      continue
    }

    if (variant === 'group-focus') {
      selector = `.group:focus ${selector}`
      continue
    }

    if (variant.startsWith('data-[')) {
      const [name, value] = variant.slice(6, -1).split('=')
      selector += value ? `[data-${name}="${value}"]` : `[data-${name}]`
      continue
    }

    if (variant.startsWith('aria-[')) {
      const [name, value] = variant.slice(6, -1).split('=')
      selector += value ? `[aria-${name}="${value}"]` : `[aria-${name}]`
      continue
    }

    if (variant.startsWith('[&')) {
      selector = variant.slice(1, -1).replace('&', selector).replace(/_/g, ' ')
      continue
    }
  }

  return {
    selector: selector + pseudoElement,
    wrappers,
    needsPseudoContent: pseudoElement === '::before' || pseudoElement === '::after',
  }
}

function colourValue(name) {
  const [raw, opacity] = name.split('/')
  const paletteMatch = raw.match(/^([a-z]+)-(\d+)$/)
  const base = semanticColours[raw] ?? (paletteMatch ? palette[paletteMatch[1]]?.[paletteMatch[2]] : null)
  if (!base) return null
  if (!opacity) return base
  const amount = Number(opacity)
  if (Number.isNaN(amount)) return base
  if (base === 'transparent' || base === 'currentColor' || base === 'inherit') return base
  return `color-mix(in oklch, ${base} ${amount}%, transparent)`
}

function declarationsFor(base) {
  if (base.startsWith('sf-')) return []

  if (base.startsWith('[') && base.endsWith(']') && base.includes(':')) {
    const body = base.slice(1, -1)
    const [property, ...valueParts] = body.split(':')
    return [[property, arbitraryValue(valueParts.join(':'))]]
  }

  const important = base.endsWith('!')
  if (important) base = base.slice(0, -1)

  const declarations = rawDeclarationsFor(base)
  if (!important || !declarations) return declarations
  return declarations.map(([property, value]) => [property, `${value} !important`])
}

function rawDeclarationsFor(base) {
  const arbitrary = base.match(/^([a-z-]+)-\[(.+)\]$/)
  if (arbitrary) {
    const [, prefix, rawValue] = arbitrary
    const value = arbitraryValue(rawValue)
    const spacingProps = {
      p: ['padding'],
      px: ['padding-left', 'padding-right'],
      py: ['padding-top', 'padding-bottom'],
      pt: ['padding-top'],
      pr: ['padding-right'],
      pb: ['padding-bottom'],
      pl: ['padding-left'],
      m: ['margin'],
      mx: ['margin-left', 'margin-right'],
      my: ['margin-top', 'margin-bottom'],
      mt: ['margin-top'],
      mr: ['margin-right'],
      mb: ['margin-bottom'],
      ml: ['margin-left'],
      gap: ['gap'],
    }
    if (spacingProps[prefix]) return spacingProps[prefix].map((property) => [property, value])
    if (prefix === 'bg') return [['background', value]]
    if (prefix === 'border') return [['border-color', value]]
    if (prefix === 'ring') return [['--sf-ring-color', value]]
    if (prefix === 'from') return [['--sf-gradient-from', value], ['--sf-gradient-stops', 'var(--sf-gradient-from), var(--sf-gradient-to, transparent)']]
    if (prefix === 'to') return [['--sf-gradient-to', value]]
    if (prefix === 'text') {
      if (/^(oklch|rgb|hsl|#|color-mix)/.test(value)) return [['color', value]]
      return [['font-size', value]]
    }
    if (prefix === 'leading') return [['line-height', value]]
    if (prefix === 'tracking') return [['letter-spacing', value]]
    if (prefix === 'grid-cols') return [['grid-template-columns', value]]
    if (prefix === 'grid-rows') return [['grid-template-rows', value]]
    if (prefix === 'max-w') return [['max-width', value]]
    if (prefix === 'min-w') return [['min-width', value]]
    if (prefix === 'max-h') return [['max-height', value]]
    if (prefix === 'min-h') return [['min-height', value]]
    if (prefix === 'w') return [['width', value]]
    if (prefix === 'h') return [['height', value]]
    if (prefix === 'basis') return [['flex-basis', value]]
    if (prefix === 'top' || prefix === 'right' || prefix === 'bottom' || prefix === 'left' || prefix === 'inset') return [[prefix, value]]
    if (prefix === 'shadow') return [['box-shadow', value]]
    if (prefix === 'opacity') return [['opacity', value]]
    if (prefix === 'z') return [['z-index', value]]
  }

  const displayMap = {
    block: 'block',
    'inline-block': 'inline-block',
    inline: 'inline',
    'inline-flex': 'inline-flex',
    flex: 'flex',
    grid: 'grid',
    hidden: 'none',
    contents: 'contents',
  }
  if (displayMap[base]) return [['display', displayMap[base]]]

  if (base === 'sr-only') {
    return [
      ['position', 'absolute'],
      ['width', '1px'],
      ['height', '1px'],
      ['padding', '0'],
      ['margin', '-1px'],
      ['overflow', 'hidden'],
      ['clip', 'rect(0, 0, 0, 0)'],
      ['white-space', 'nowrap'],
      ['border-width', '0'],
    ]
  }
  if (base === 'not-sr-only') {
    return [
      ['position', 'static'],
      ['width', 'auto'],
      ['height', 'auto'],
      ['padding', '0'],
      ['margin', '0'],
      ['overflow', 'visible'],
      ['clip', 'auto'],
      ['white-space', 'normal'],
    ]
  }

  const positionMap = {
    static: 'static',
    fixed: 'fixed',
    absolute: 'absolute',
    relative: 'relative',
    sticky: 'sticky',
  }
  if (positionMap[base]) return [['position', positionMap[base]]]
  if (base === 'isolate') return [['isolation', 'isolate']]
  if (base === 'antialiased') return [['-webkit-font-smoothing', 'antialiased'], ['-moz-osx-font-smoothing', 'grayscale']]
  if (base === 'container' || base === 'sf-container') return null
  if (base === 'group' || base === 'peer') return []

  const simpleMaps = [
    [/^overflow-(hidden|visible|auto|scroll|clip)$/, 'overflow'],
    [/^overflow-x-(hidden|visible|auto|scroll|clip)$/, 'overflow-x'],
    [/^overflow-y-(hidden|visible|auto|scroll|clip)$/, 'overflow-y'],
    [/^object-(cover|contain|fill|none|scale-down)$/, 'object-fit'],
    [/^whitespace-(normal|nowrap|pre|pre-line|pre-wrap|break-spaces)$/, 'white-space'],
    [/^break-(normal|words|all|keep)$/, 'overflow-wrap'],
    [/^cursor-(pointer|default|not-allowed|grab|grabbing|text)$/, 'cursor'],
    [/^resize-(none|both|x|y)$/, 'resize'],
    [/^select-(none|text|all|auto)$/, 'user-select'],
    [/^pointer-events-(none|auto)$/, 'pointer-events'],
  ]
  for (const [pattern, property] of simpleMaps) {
    const match = base.match(pattern)
    if (match) return [[property, match[1] === 'words' ? 'break-word' : match[1]]]
  }

  if (base === 'appearance-none') return [['appearance', 'none']]
  if (base === 'resize') return [['resize', 'both']]
  if (base === 'truncate') return [['overflow', 'hidden'], ['text-overflow', 'ellipsis'], ['white-space', 'nowrap']]
  const lineClamp = base.match(/^line-clamp-(\d+)$/)
  if (lineClamp) return [['overflow', 'hidden'], ['display', '-webkit-box'], ['-webkit-box-orient', 'vertical'], ['-webkit-line-clamp', lineClamp[1]]]
  const zIndex = base.match(/^z-(auto|\d+)$/)
  if (zIndex) return [['z-index', zIndex[1]]]
  if (base === 'uppercase' || base === 'lowercase' || base === 'capitalize') return [['text-transform', base]]
  if (base === 'normal-case') return [['text-transform', 'none']]
  if (base === 'underline') return [['text-decoration-line', 'underline']]
  if (base === 'no-underline') return [['text-decoration-line', 'none']]
  if (base === 'italic') return [['font-style', 'italic']]
  if (base === 'not-italic') return [['font-style', 'normal']]

  const inset = sideUtility(base, ['inset', 'top', 'right', 'bottom', 'left'])
  if (inset) return inset

  const spacing = spacingUtility(base)
  if (spacing) return spacing

  const sizing = sizingUtility(base)
  if (sizing) return sizing

  const flexGrid = flexGridUtility(base)
  if (flexGrid) return flexGrid

  const typography = typographyUtility(base)
  if (typography) return typography

  const colour = colourUtility(base)
  if (colour) return colour

  const border = borderUtility(base)
  if (border) return border

  const effects = effectUtility(base)
  if (effects) return effects

  const transform = transformUtility(base)
  if (transform) return transform

  return null
}

function sideUtility(base, prefixes) {
  for (const prefix of prefixes) {
    const match = base.match(new RegExp(`^-?${prefix}-(.+)$`))
    if (!match) continue
    const negative = base.startsWith('-')
    const value = spacingUnit(match[1]) ?? sizeKeyword(match[1])
    if (!value) continue
    const resolved = negative ? `calc(${value} * -1)` : value
    if (prefix === 'inset') return [['inset', resolved]]
    return [[prefix, resolved]]
  }
  if (base === 'inset-0') return [['inset', '0']]
  if (base === 'inset-x-0') return [['left', '0'], ['right', '0']]
  if (base === 'inset-y-0') return [['top', '0'], ['bottom', '0']]
  return null
}

function spacingUtility(base) {
  const negative = base.startsWith('-')
  const token = negative ? base.slice(1) : base
  const match = token.match(/^(gap-x|gap-y|space-x|space-y|m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl|gap)-(.+)$/)
  if (!match) return null

  const [, prefix, valueName] = match
  const value = spacingUnit(valueName) ?? sizeKeyword(valueName)
  if (!value) return null
  const resolved = negative ? `calc(${value} * -1)` : value
  const map = {
    m: ['margin'],
    mx: ['margin-left', 'margin-right'],
    my: ['margin-top', 'margin-bottom'],
    mt: ['margin-top'],
    mr: ['margin-right'],
    mb: ['margin-bottom'],
    ml: ['margin-left'],
    p: ['padding'],
    px: ['padding-left', 'padding-right'],
    py: ['padding-top', 'padding-bottom'],
    pt: ['padding-top'],
    pr: ['padding-right'],
    pb: ['padding-bottom'],
    pl: ['padding-left'],
    gap: ['gap'],
    'gap-x': ['column-gap'],
    'gap-y': ['row-gap'],
  }
  if (prefix === 'space-x') return [['--sf-space-x', resolved]]
  if (prefix === 'space-y') return [['--sf-space-y', resolved]]
  return map[prefix].map((property) => [property, resolved])
}

function sizeKeyword(valueName) {
  const map = {
    auto: 'auto',
    full: '100%',
    screen: '100svw',
    svw: '100svw',
    svh: '100svh',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
    prose: '65ch',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '1/2': '50%',
    '1/3': '33.333333%',
    '2/3': '66.666667%',
    '1/4': '25%',
    '2/4': '50%',
    '3/4': '75%',
    '1/5': '20%',
    '2/5': '40%',
    '3/5': '60%',
    '4/5': '80%',
    '1/6': '16.666667%',
    '5/6': '83.333333%',
  }
  return map[valueName] ?? null
}

function sizingUtility(base) {
  const match = base.match(/^(w|h|min-w|min-h|max-w|max-h|size|basis)-(.+)$/)
  if (!match) return null
  const [, prefix, valueName] = match
  const value = spacingUnit(valueName) ?? sizeKeyword(valueName)
  if (!value) return null
  const props = {
    w: ['width'],
    h: ['height'],
    'min-w': ['min-width'],
    'min-h': ['min-height'],
    'max-w': ['max-width'],
    'max-h': ['max-height'],
    size: ['width', 'height'],
    basis: ['flex-basis'],
  }
  return props[prefix].map((property) => [property, value])
}

function flexGridUtility(base) {
  const direct = {
    'flex-row': [['flex-direction', 'row']],
    'flex-row-reverse': [['flex-direction', 'row-reverse']],
    'flex-col': [['flex-direction', 'column']],
    'flex-col-reverse': [['flex-direction', 'column-reverse']],
    'flex-wrap': [['flex-wrap', 'wrap']],
    'flex-nowrap': [['flex-wrap', 'nowrap']],
    'flex-1': [['flex', '1 1 0%']],
    'flex-auto': [['flex', '1 1 auto']],
    'flex-none': [['flex', 'none']],
    grow: [['flex-grow', '1']],
    'grow-0': [['flex-grow', '0']],
    shrink: [['flex-shrink', '1']],
    'shrink-0': [['flex-shrink', '0']],
  }
  if (direct[base]) return direct[base]

  const alignMap = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    baseline: 'baseline',
    stretch: 'stretch',
  }
  const justifyMap = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
    stretch: 'stretch',
  }
  const placeMap = { center: 'center', start: 'start', end: 'end', stretch: 'stretch' }
  let match = base.match(/^items-(start|end|center|baseline|stretch)$/)
  if (match) return [['align-items', alignMap[match[1]]]]
  match = base.match(/^justify-(start|end|center|between|around|evenly|stretch)$/)
  if (match) return [['justify-content', justifyMap[match[1]]]]
  match = base.match(/^content-(start|end|center|between|around|evenly|stretch)$/)
  if (match) return [['align-content', justifyMap[match[1]]]]
  match = base.match(/^self-(auto|start|end|center|stretch|baseline)$/)
  if (match) return [['align-self', match[1] === 'start' ? 'flex-start' : match[1] === 'end' ? 'flex-end' : match[1]]]
  match = base.match(/^place-(items|content|self)-(center|start|end|stretch)$/)
  if (match) return [[`place-${match[1]}`, placeMap[match[2]]]]

  match = base.match(/^grid-cols-(\d+)$/)
  if (match) return [['grid-template-columns', `repeat(${match[1]}, minmax(0, 1fr))`]]
  match = base.match(/^grid-rows-(\d+)$/)
  if (match) return [['grid-template-rows', `repeat(${match[1]}, minmax(0, 1fr))`]]
  match = base.match(/^col-span-(\d+)$/)
  if (match) return [['grid-column', `span ${match[1]} / span ${match[1]}`]]
  match = base.match(/^row-span-(\d+)$/)
  if (match) return [['grid-row', `span ${match[1]} / span ${match[1]}`]]
  if (base === 'col-span-full') return [['grid-column', '1 / -1']]
  if (base === 'grid-flow-col') return [['grid-auto-flow', 'column']]
  if (base === 'grid-flow-row') return [['grid-auto-flow', 'row']]

  return null
}

function typographyUtility(base) {
  let match = base.match(/^font-(sans|display|mono)$/)
  if (match) {
    const map = {
      sans: 'var(--font-inter, var(--sf-font-sans, ui-sans-serif, system-ui, sans-serif))',
      display: 'var(--font-display, var(--sf-font-display, ui-serif, Georgia, serif))',
      mono: 'var(--font-mono, var(--sf-font-mono, ui-monospace, monospace))',
    }
    return [['font-family', map[match[1]]]]
  }
  match = base.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)
  if (match) return [['font-weight', String(fontWeightMap[match[1]])]]
  match = base.match(/^text-(left|center|right|justify|start|end)$/)
  if (match) return [['text-align', match[1]]]
  match = base.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/)
  if (match) return [['font-size', fontSizeMap[match[1]]]]
  match = base.match(/^leading-(.+)$/)
  if (match && lineHeightMap[match[1]]) return [['line-height', lineHeightMap[match[1]]]]
  match = base.match(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)
  if (match) {
    const map = { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em' }
    return [['letter-spacing', map[match[1]]]]
  }
  match = base.match(/^list-(none|disc|decimal)$/)
  if (match) return [['list-style-type', match[1]]]
  if (base === 'list-inside') return [['list-style-position', 'inside']]
  if (base === 'list-outside') return [['list-style-position', 'outside']]
  match = base.match(/^underline-offset-(\d+)$/)
  if (match) return [['text-underline-offset', spacingUnit(match[1])]]
  return null
}

function colourUtility(base) {
  const match = base.match(/^(bg|text|border|ring|fill|stroke|accent|from|via|to)-(.+)$/)
  if (!match) return null
  const [, prefix, name] = match
  const value = colourValue(name)
  if (!value) return null
  if (prefix === 'bg') return [['background-color', value]]
  if (prefix === 'text') return [['color', value]]
  if (prefix === 'border') return [['border-color', value]]
  if (prefix === 'ring') return [['--sf-ring-color', value]]
  if (prefix === 'fill') return [['fill', value]]
  if (prefix === 'stroke') return [['stroke', value]]
  if (prefix === 'accent') return [['accent-color', value]]
  if (prefix === 'from') return [['--sf-gradient-from', value], ['--sf-gradient-stops', 'var(--sf-gradient-from), var(--sf-gradient-to, transparent)']]
  if (prefix === 'via') return [['--sf-gradient-via', value], ['--sf-gradient-stops', 'var(--sf-gradient-from), var(--sf-gradient-via), var(--sf-gradient-to, transparent)']]
  if (prefix === 'to') return [['--sf-gradient-to', value]]
  return null
}

function borderUtility(base) {
  if (base === 'border') return [['border-width', '1px']]
  if (base === 'border-0') return [['border-width', '0']]
  if (base === 'border-2') return [['border-width', '2px']]
  if (base === 'border-t') return [['border-top-width', '1px']]
  if (base === 'border-r') return [['border-right-width', '1px']]
  if (base === 'border-b') return [['border-bottom-width', '1px']]
  if (base === 'border-l') return [['border-left-width', '1px']]
  if (base === 'border-y') return [['border-top-width', '1px'], ['border-bottom-width', '1px']]
  if (base === 'border-x') return [['border-left-width', '1px'], ['border-right-width', '1px']]
  const sideWidth = base.match(/^border-(t|r|b|l)-(\d+)$/)
  if (sideWidth) {
    const side = { t: 'top', r: 'right', b: 'bottom', l: 'left' }[sideWidth[1]]
    return [[`border-${side}-width`, `${sideWidth[2]}px`]]
  }
  if (base === 'divide-y') return [['--sf-divide-y', '1px']]
  if (base === 'divide-x') return [['--sf-divide-x', '1px']]
  const roundedSide = base.match(/^rounded-(t|r|b|l|tr|tl|br|bl)-(none|xs|sm|md|lg|xl|2xl|3xl|full)$/)
  if (roundedSide) {
    const radius = `var(--radius-${roundedSide[2]})`
    const sides = {
      t: ['border-top-left-radius', 'border-top-right-radius'],
      r: ['border-top-right-radius', 'border-bottom-right-radius'],
      b: ['border-bottom-right-radius', 'border-bottom-left-radius'],
      l: ['border-top-left-radius', 'border-bottom-left-radius'],
      tr: ['border-top-right-radius'],
      tl: ['border-top-left-radius'],
      br: ['border-bottom-right-radius'],
      bl: ['border-bottom-left-radius'],
    }
    return sides[roundedSide[1]].map((property) => [property, radius])
  }
  const match = base.match(/^rounded(?:-(none|xs|sm|md|lg|xl|2xl|3xl|full|t|r|b|l|tr|tl|br|bl))?$/)
  if (match) {
    const part = match[1]
    if (!part) return [['border-radius', 'var(--radius-md)']]
    if (fluidConfig.radii[part]) return [['border-radius', `var(--radius-${part})`]]
    const radius = 'var(--radius-md)'
    const sides = {
      t: ['border-top-left-radius', 'border-top-right-radius'],
      r: ['border-top-right-radius', 'border-bottom-right-radius'],
      b: ['border-bottom-right-radius', 'border-bottom-left-radius'],
      l: ['border-top-left-radius', 'border-bottom-left-radius'],
      tr: ['border-top-right-radius'],
      tl: ['border-top-left-radius'],
      br: ['border-bottom-right-radius'],
      bl: ['border-bottom-left-radius'],
    }
    return sides[part].map((property) => [property, radius])
  }
  return null
}

function effectUtility(base) {
  if (base === 'bg-gradient-to-r') return [['background-image', 'linear-gradient(to right, var(--sf-gradient-stops))']]
  if (base === 'bg-gradient-to-l') return [['background-image', 'linear-gradient(to left, var(--sf-gradient-stops))']]
  if (base === 'bg-gradient-to-t') return [['background-image', 'linear-gradient(to top, var(--sf-gradient-stops))']]
  if (base === 'bg-gradient-to-b') return [['background-image', 'linear-gradient(to bottom, var(--sf-gradient-stops))']]
  if (base === 'bg-gradient-to-br') return [['background-image', 'linear-gradient(to bottom right, var(--sf-gradient-stops))']]
  if (base === 'bg-gradient-to-bl') return [['background-image', 'linear-gradient(to bottom left, var(--sf-gradient-stops))']]
  if (base === 'bg-gradient-to-tr') return [['background-image', 'linear-gradient(to top right, var(--sf-gradient-stops))']]
  if (base === 'bg-gradient-to-tl') return [['background-image', 'linear-gradient(to top left, var(--sf-gradient-stops))']]
  if (base === 'shadow-sm') return [['box-shadow', 'var(--shadow-sm)']]
  if (base === 'shadow') return [['box-shadow', 'var(--shadow-md)']]
  if (base === 'shadow-md') return [['box-shadow', 'var(--shadow-md)']]
  if (base === 'shadow-lg') return [['box-shadow', 'var(--shadow-lg)']]
  if (base === 'shadow-xl') return [['box-shadow', 'var(--shadow-xl)']]
  if (base === 'shadow-2xl') return [['box-shadow', 'var(--shadow-2xl)']]
  if (base === 'shadow-none') return [['box-shadow', 'none']]
  if (base === 'shadow-primary-cta') return [['box-shadow', 'var(--shadow-primary-cta)']]
  if (base === 'shadow-glow') return [['box-shadow', 'var(--shadow-glow)']]
  if (base.startsWith('shadow-')) return [['--sf-shadow-color', colourValue(base.slice(7)) ?? 'currentColor']]

  let match = base.match(/^opacity-(\d+)$/)
  if (match) return [['opacity', String(Number(match[1]) / 100)]]
  match = base.match(/^blur-(none|sm|md|lg|xl|2xl|3xl)$/)
  if (match) {
    const map = { none: '0', sm: '4px', md: '12px', lg: '16px', xl: '24px', '2xl': '40px', '3xl': '64px' }
    return [['filter', `blur(${map[match[1]]})`]]
  }
  match = base.match(/^backdrop-blur(?:-(none|sm|md|lg|xl))?$/)
  if (match) {
    const map = { undefined: '8px', none: '0', sm: '4px', md: '12px', lg: '16px', xl: '24px' }
    return [['backdrop-filter', `blur(${map[match[1] ?? 'undefined']})`]]
  }
  match = base.match(/^ring(?:-(\d+))?$/)
  if (match) return [['box-shadow', `0 0 0 ${match[1] ?? 3}px var(--sf-ring-color, var(--color-ring))`]]
  if (base === 'ring-offset-white') return [['--sf-ring-offset-color', 'var(--color-white)']]
  if (base === 'ring-offset-background') return [['--sf-ring-offset-color', 'var(--color-background)']]
  match = base.match(/^ring-offset-(\d+)$/)
  if (match) return [['--sf-ring-offset-width', `${match[1]}px`]]
  if (base === 'outline') return [['outline-style', 'solid']]
  if (base === 'outline-none') return [['outline', '2px solid transparent'], ['outline-offset', '2px']]
  match = base.match(/^outline-(\d+)$/)
  if (match) return [['outline-width', `${match[1]}px`]]
  match = base.match(/^outline-offset-(\d+)$/)
  if (match) return [['outline-offset', `${match[1]}px`]]
  match = base.match(/^outline-(.+)$/)
  if (match) {
    const value = colourValue(match[1])
    if (value) return [['outline-color', value]]
  }
  if (base === 'transition') return [['transition-property', 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter'], ['transition-duration', 'var(--duration-normal)'], ['transition-timing-function', 'var(--ease-standard)']]
  if (base === 'transition-all') return [['transition-property', 'all'], ['transition-duration', 'var(--duration-normal)'], ['transition-timing-function', 'var(--ease-standard)']]
  if (base === 'transition-colors') return [['transition-property', 'color, background-color, border-color, text-decoration-color, fill, stroke'], ['transition-duration', 'var(--duration-normal)'], ['transition-timing-function', 'var(--ease-standard)']]
  if (base === 'transition-transform') return [['transition-property', 'transform'], ['transition-duration', 'var(--duration-normal)'], ['transition-timing-function', 'var(--ease-standard)']]
  match = base.match(/^transition-\[(.+)\]$/)
  if (match) return [['transition-property', arbitraryValue(match[1])], ['transition-duration', 'var(--duration-normal)']]
  match = base.match(/^duration-(\d+)$/)
  if (match) return [['transition-duration', `${match[1]}ms`]]
  match = base.match(/^delay-(\d+)$/)
  if (match) return [['transition-delay', `${match[1]}ms`]]
  if (base === 'ease-out') return [['transition-timing-function', 'cubic-bezier(0, 0, 0.2, 1)']]
  if (base === 'ease-in') return [['transition-timing-function', 'cubic-bezier(0.4, 0, 1, 1)']]
  if (base === 'ease-in-out') return [['transition-timing-function', 'cubic-bezier(0.4, 0, 0.2, 1)']]
  if (base === 'animate-pulse') return [['animation', 'sf-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite']]
  if (base === 'animate-spin') return [['animation', 'sf-spin 1s linear infinite']]
  if (base === 'animate-in') return [['animation', 'sf-enter var(--duration-normal) var(--ease-standard) both']]
  if (base === 'animate-out') return [['animation', 'sf-exit var(--duration-fast) var(--ease-standard) both']]
  return null
}

function transformUtility(base) {
  const declarations = []
  let match = base.match(/^(-?)translate-x-(.+)$/)
  if (match) declarations.push(['--sf-translate-x', `${match[1] ? '-' : ''}${spacingUnit(match[2]) ?? sizeKeyword(match[2])}`])
  match = base.match(/^(-?)translate-y-(.+)$/)
  if (match) declarations.push(['--sf-translate-y', `${match[1] ? '-' : ''}${spacingUnit(match[2]) ?? sizeKeyword(match[2])}`])
  match = base.match(/^scale-\[(.+)\]$/)
  if (match) declarations.push(['--sf-scale-x', arbitraryValue(match[1])], ['--sf-scale-y', arbitraryValue(match[1])])
  match = base.match(/^scale-(\d+)$/)
  if (match) declarations.push(['--sf-scale-x', String(Number(match[1]) / 100)], ['--sf-scale-y', String(Number(match[1]) / 100)])
  match = base.match(/^(-?)rotate-(\d+)$/)
  if (match) declarations.push(['--sf-rotate', `${match[1] ? '-' : ''}${match[2]}deg`])
  if (base === 'transform' || declarations.length) {
    return [
      ...declarations,
      ['transform', 'translate3d(var(--sf-translate-x, 0), var(--sf-translate-y, 0), 0) rotate(var(--sf-rotate, 0)) scaleX(var(--sf-scale-x, 1)) scaleY(var(--sf-scale-y, 1))'],
    ]
  }
  return null
}

function cssRuleFor(token) {
  const { variants, base } = splitVariants(token)
  const declarations = declarationsFor(base)
  if (!declarations) return null
  if (declarations.length === 0) return ''

  const selectorResult = selectorFor(token, variants)
  if (!selectorResult) return null

  const { selector, wrappers, needsPseudoContent } = selectorResult
  const allDeclarations = needsPseudoContent ? [['content', '""'], ...declarations] : declarations
  let rule = `${selector}{${allDeclarations.map(([property, value]) => `${property}:${value}`).join(';')}}`

  for (const wrapper of wrappers.reverse()) {
    const atRule = wrapper.type === 'container' ? '@container' : '@media'
    rule = `${atRule} ${wrapper.condition}{${rule}}`
  }

  return rule
}

function cssTokenName(value) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-z])(\d)/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase()
}

function buildThemeCss(theme) {
  if (!theme || typeof theme !== 'object') return ''

  const root = []
  const dark = []

  for (const [name, value] of Object.entries(theme.fonts ?? {})) {
    const token = cssTokenName(name)
    root.push(`    --sf-font-${token}: ${value};`)
    root.push(`    --font-${token}: var(--sf-font-${token});`)
  }

  for (const [name, value] of Object.entries(theme.colours ?? {})) {
    const token = cssTokenName(name)
    root.push(`    --sf-colour-${token}: ${value};`)
    root.push(`    --color-${token}: var(--sf-colour-${token});`)
  }

  for (const [name, value] of Object.entries(theme.darkColours ?? {})) {
    const token = cssTokenName(name)
    dark.push(`    --sf-colour-${token}: ${value};`)
    dark.push(`    --color-${token}: var(--sf-colour-${token});`)
  }

  for (const [name, value] of Object.entries(theme.radii ?? {})) {
    const token = cssTokenName(name)
    root.push(`    --sf-radius-${token}: ${value};`)
    root.push(`    --radius-${token}: var(--sf-radius-${token});`)
  }

  if (theme.layout?.containerMax) {
    root.push(`    --sf-container-max: ${theme.layout.containerMax};`)
    root.push(`    --grid-max-width: ${theme.layout.containerMax};`)
  }
  if (theme.layout?.gutter) {
    root.push(`    --sf-gutter: ${theme.layout.gutter};`)
    root.push(`    --grid-gutter: ${theme.layout.gutter};`)
  }
  if (theme.layout?.columns) {
    root.push(`    --sf-grid-columns: ${theme.layout.columns};`)
    root.push(`    --grid-columns: ${theme.layout.columns};`)
  }

  const { button, card, input } = theme.components ?? {}
  if (button?.radius) {
    root.push(`    --sf-button-radius: ${button.radius};`)
    root.push(`    --button-radius: ${button.radius};`)
  }
  if (button?.blockSize) {
    root.push(`    --sf-button-block-size: ${button.blockSize};`)
    root.push(`    --button-size: ${button.blockSize};`)
  }
  if (button?.paddingInline) {
    root.push(`    --sf-button-padding-inline: ${button.paddingInline};`)
    root.push(`    --button-padding-inline: ${button.paddingInline};`)
  }
  if (card?.radius) {
    root.push(`    --sf-card-radius: ${card.radius};`)
    root.push(`    --card-radius: ${card.radius};`)
  }
  if (card?.padding) root.push(`    --sf-card-padding: ${card.padding};`)
  if (card?.shadow) root.push(`    --card-shadow: ${card.shadow};`)
  if (input?.radius) root.push(`    --sf-input-radius: ${input.radius};`)
  if (input?.blockSize) root.push(`    --sf-input-block-size: ${input.blockSize};`)

  if (!root.length && !dark.length) return ''

  const sections = []
  if (root.length) {
    sections.push(`  :root {\n${root.join('\n')}\n  }`)
  }
  if (dark.length) {
    sections.push(`  :where(.sf-theme-dark, [data-sf-theme="dark"]) {\n${dark.join('\n')}\n  }`)
  }

  return `@layer tokens {\n${sections.join('\n\n')}\n}`
}

function buildTokensCss() {
  const steps = []
  for (let step = fluidConfig.typeMinStep; step <= 8; step += 1) {
    steps.push(`    --step-${step < 0 ? `-${Math.abs(step)}` : step}: ${typeStep(step)};`)
  }

  const spaceMultipliers = {
    '3xs': 0.25,
    '2xs': 0.5,
    xs: 0.75,
    s: 1,
    m: 1.5,
    l: 2,
    xl: 3,
    '2xl': 4,
    '3xl': 6,
    '4xl': 8,
  }
  const spaces = Object.entries(spaceMultipliers).map(([name, multiplier]) => {
    return `    --space-${name}: ${fluidClamp(fluidConfig.minRoot * multiplier, fluidConfig.maxRoot * multiplier)};`
  })
  const pairs = [
    ['3xs', '2xs'],
    ['2xs', 'xs'],
    ['xs', 's'],
    ['s', 'm'],
    ['m', 'l'],
    ['l', 'xl'],
    ['xl', '2xl'],
    ['2xl', '3xl'],
    ['s', 'l'],
    ['m', 'xl'],
    ['l', '2xl'],
  ].map(([minName, maxName]) => {
    return `    --space-${minName}-${maxName}: ${fluidClamp(fluidConfig.minRoot * spaceMultipliers[minName], fluidConfig.maxRoot * spaceMultipliers[maxName])};`
  })

  const colours = fluidConfig.colours

  return `@layer tokens {
  :root {
    color-scheme: light;
    --font-sans: var(--sf-font-sans, ui-sans-serif, system-ui, sans-serif);
    --font-display: var(--sf-font-display, ui-serif, Georgia, serif);
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;

${steps.join('\n')}

${spaces.join('\n')}
${pairs.join('\n')}

    --grid-max-width: ${fluidConfig.gridMaxWidthRem}rem;
    --grid-gutter: var(--space-s-l);
    --grid-columns: ${fluidConfig.gridColumns};

    --radius-none: ${fluidConfig.radii.none};
    --radius-xs: ${fluidConfig.radii.xs};
    --radius-sm: ${fluidConfig.radii.sm};
    --radius-md: ${fluidConfig.radii.md};
    --radius-lg: ${fluidConfig.radii.lg};
    --radius-xl: ${fluidConfig.radii.xl};
    --radius-2xl: ${fluidConfig.radii['2xl']};
    --radius-3xl: ${fluidConfig.radii['3xl']};
    --radius-full: ${fluidConfig.radii.full};
    --radius: var(--radius-xl);

    --color-ink-950: ${colours.ink950};
    --color-ink-900: ${colours.ink900};
    --color-ink-800: ${colours.ink800};
    --color-ink-700: ${colours.ink700};
    --color-ink-600: ${colours.ink600};
    --color-ink-500: ${colours.ink500};
    --color-paper: ${colours.paper};
    --color-paper-alt: ${colours.paperAlt};
    --color-white: ${colours.white};
    --color-black: ${colours.black};

    --color-background: ${colours.ink950};
    --color-foreground: oklch(96% 0.01 92);
    --color-card: ${colours.ink900};
    --color-card-foreground: oklch(96% 0.01 92);
    --color-popover: ${colours.ink900};
    --color-popover-foreground: oklch(96% 0.01 92);
    --color-primary: ${colours.orange600};
    --color-primary-hover: oklch(64% 0.18 44);
    --color-primary-label: oklch(55% 0.18 44);
    --color-primary-border: oklch(66% 0.17 43);
    --color-primary-foreground: oklch(98% 0.01 95);
    --color-secondary: oklch(24% 0.018 22);
    --color-secondary-foreground: oklch(96% 0.01 92);
    --color-muted: oklch(26% 0.012 24);
    --color-muted-foreground: oklch(76% 0.01 92);
    --color-accent: oklch(24% 0.018 22);
    --color-accent-foreground: oklch(96% 0.01 92);
    --color-destructive: ${colours.red600};
    --color-destructive-foreground: oklch(98% 0.01 95);
    --color-border: oklch(100% 0 0 / 0.12);
    --color-input: oklch(100% 0 0 / 0.12);
    --color-ring: ${colours.orange600};
    --color-heading: oklch(20% 0.02 18);
    --color-page-text: oklch(23% 0.02 18);
    --color-body: oklch(45% 0.02 28);
    --color-body-dark: oklch(40% 0.02 28);
    --color-subdued: oklch(42% 0.02 20);
    --color-surface: ${colours.surfaceAlt};
    --color-surface-alt: ${colours.paperAlt};
    --color-hero-bg: oklch(8% 0.02 260);
    --color-green: ${colours.green600};
    --color-green-dark: ${colours.green700};
    --color-green-muted: oklch(40% 0.12 148);
    --color-green-light: ${colours.green100};
    --color-green-lighter: oklch(92% 0.04 148);
    --color-green-bg: oklch(88% 0.07 148);
    --color-green-bg-alt: oklch(82% 0.1 148);
    --color-green-vivid: oklch(78% 0.08 148);
    --color-green-mid: oklch(75% 0.12 148);
    --color-green-deep: oklch(70% 0.14 150);
    --color-green-deepest: oklch(60% 0.14 150);
    --color-green-wash: oklch(93% 0.06 148);
    --color-green-wash-alt: oklch(88% 0.08 148);
    --color-green-gradient-from: oklch(82% 0.1 148);
    --color-green-gradient-to: oklch(86% 0.06 148);
    --color-deco-lime: oklch(80% 0.18 130);
    --color-deco-blue: oklch(60% 0.12 240);
    --color-deco-warm: oklch(80% 0.06 60);
    --color-deco-warm-light: oklch(92% 0.02 80);
    --color-deco-warm-mid: oklch(80% 0.15 60);
    --color-purple-light: oklch(95% 0.05 280);
    --color-purple-mid: oklch(92% 0.05 280);
    --color-purple-dark: oklch(90% 0.06 280);
    --color-purple-darker: oklch(87% 0.07 280);
    --color-purple-icon: ${colours.purple600};
    --color-warm-light: oklch(95.6% 0.05 22);
    --color-warm-mid: oklch(95% 0.04 40);
    --color-warm-grad-to: oklch(90% 0.08 30);
    --color-warm-grad-to-alt: oklch(90% 0.06 30);
    --color-warm-icon: oklch(60% 0.17 44);
    --color-cool-light: oklch(92% 0.04 200);
    --color-cool-dark: oklch(87% 0.06 200);
    --color-primary-glow: oklch(80% 0.12 44);
    --color-primary-soft: oklch(69% 0.18 44 / 0.10);
    --color-primary-soft-border: oklch(69% 0.18 44 / 0.30);
    --color-primary-soft-border-light: oklch(69% 0.18 44 / 0.25);
    --color-primary-soft-text: oklch(85% 0.08 44);
    --color-primary-highlight: oklch(75% 0.14 44);

    --shadow-sm: 0 0.125rem 0.375rem oklch(0% 0 0 / 0.06);
    --shadow-md: 0 0.5rem 1.5rem oklch(0% 0 0 / 0.08);
    --shadow-lg: 0 1rem 2rem oklch(0% 0 0 / 0.1);
    --shadow-xl: 0 1.5rem 3rem oklch(0% 0 0 / 0.14);
    --shadow-2xl: 0 2rem 4rem oklch(0% 0 0 / 0.18);
    --shadow-primary-cta: 0 0.875rem 1.875rem oklch(69% 0.18 44 / 0.24);
    --shadow-glow: 0 0 2rem oklch(69% 0.18 44 / 0.28);

    --duration-fast: 150ms;
    --duration-normal: 220ms;
    --duration-slow: 360ms;
    --ease-standard: cubic-bezier(.2, 0, 0, 1);
  }
}`
}

function buildBaseCss() {
  return `@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  *:where(:not(dialog)) { margin: 0; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { min-block-size: 100%; }
  img, picture, video, canvas, svg { display: block; max-inline-size: 100%; }
  img, video { block-size: auto; }
  input, button, textarea, select { font: inherit; }
  button, input:where([type="button"], [type="submit"], [type="reset"]) { appearance: button; }
  [hidden]:where(:not([hidden="until-found"])) { display: none !important; }
}

@layer base {
  body {
    background: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-inter, var(--sf-font-sans, ui-sans-serif, system-ui, sans-serif));
    font-size: var(--step-0);
    line-height: 1.5;
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  :where(h1, h2, h3, h4) {
    color: inherit;
    font-family: var(--font-display, var(--sf-font-display, ui-serif, Georgia, serif));
    text-wrap: balance;
  }

  :where(p, li) { text-wrap: pretty; }

  :where(a) {
    color: inherit;
    text-decoration-color: color-mix(in oklch, currentColor 55%, transparent);
    text-decoration-skip-ink: auto;
    text-decoration-thickness: .08em;
    text-underline-offset: .18em;
  }

  :where(button:not(:disabled), [role="button"]:not(:disabled), a[href]) { cursor: pointer; }

  :where(button:disabled, [aria-disabled="true"]) { cursor: not-allowed; }

  :where(:focus-visible) {
    outline: 2px solid var(--color-ring);
    outline-offset: .2rem;
  }

  ::selection {
    background: color-mix(in oklch, var(--color-primary) 24%, transparent);
    color: var(--color-card);
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
}`
}

function buildAppCss() {
  return `@layer app {
  :where(a) {
    color: inherit;
    text-decoration: none;
  }

  :where(ol, ul, menu) {
    list-style: none;
    padding-inline-start: 0;
  }

  :where(button) {
    background: transparent;
    border: 0;
    color: inherit;
  }

  :where(fieldset) {
    border: 0;
    padding: 0;
  }

  :where(legend) { padding: 0; }
}`
}

function buildLayoutCss() {
  return `@layer layout {
  .sf-container {
    inline-size: min(100% - (var(--grid-gutter) * 2), var(--grid-max-width));
    margin-inline: auto;
  }

  .sf-section {
    padding-block: var(--space-xl-2xl);
  }

  .sf-stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-space, var(--space-s));
  }

  .sf-cluster {
    display: flex;
    flex-wrap: wrap;
    align-items: var(--cluster-align, center);
    justify-content: var(--cluster-justify, flex-start);
    gap: var(--cluster-space, var(--space-s));
  }

  .sf-repel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-s);
  }

  .sf-grid {
    display: grid;
    gap: var(--grid-gutter);
  }

  .sf-auto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--auto-grid-min, 16rem)), 1fr));
    gap: var(--grid-gutter);
  }

  .sf-split {
    display: grid;
    gap: var(--split-gap, var(--grid-gutter));
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--split-min, 24rem)), 1fr));
  }

  .sf-centre {
    box-sizing: content-box;
    margin-inline: auto;
    max-inline-size: var(--centre-size, 65ch);
  }

  .sf-sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--grid-gutter);
  }

  .sf-sidebar > :first-child {
    flex-basis: var(--sidebar-width, 20rem);
    flex-grow: 1;
  }

  .sf-sidebar > :last-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: min(100%, var(--sidebar-content-min, 50%));
  }

  .sf-frame {
    aspect-ratio: var(--frame-ratio, 16 / 9);
    overflow: hidden;
  }

  .sf-frame > :where(img, video) {
    block-size: 100%;
    inline-size: 100%;
    object-fit: cover;
  }

  .sf-flow > * + * { margin-block-start: var(--flow-space, var(--space-s)); }

  .sf-panel-grid {
    container-type: inline-size;
    display: grid;
    gap: var(--grid-gutter);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--panel-min, 18rem)), 1fr));
  }

  @container (min-width: 42rem) {
    .sf-panel-grid[data-density="featured"] > :first-child {
      grid-column: span 2;
    }
  }

  :where(.space-y-1, .space-y-2, .space-y-3, .space-y-4, .space-y-5, .space-y-6, .space-y-8, .space-y-10, .space-y-12) > * + * {
    margin-block-start: var(--sf-space-y);
  }

  :where(.space-x-1, .space-x-2, .space-x-3, .space-x-4, .space-x-5, .space-x-6, .space-x-8) > * + * {
    margin-inline-start: var(--sf-space-x);
  }

  .divide-y > * + * { border-block-start-width: var(--sf-divide-y); }
  .divide-x > * + * { border-inline-start-width: var(--sf-divide-x); }
}`
}

function buildComponentCss() {
  return `@layer components {
  .sf-button {
    align-items: center;
    border-radius: var(--button-radius, var(--radius-md));
    display: inline-flex;
    font-size: var(--button-font-size, var(--step--1));
    font-weight: 700;
    gap: var(--space-2xs);
    justify-content: center;
    min-block-size: var(--button-size, 2.75rem);
    padding-block: var(--button-padding-block, .625rem);
    padding-inline: var(--button-padding-inline, var(--space-s));
    text-decoration: none;
    transition: background-color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard);
    white-space: nowrap;
  }

  .sf-button:disabled,
  .sf-button[aria-disabled="true"] {
    opacity: .55;
    pointer-events: none;
  }

  .sf-button--default {
    background: var(--button-bg, var(--color-primary));
    border: 1px solid var(--button-border, var(--color-primary-border));
    box-shadow: var(--shadow-primary-cta);
    color: var(--button-fg, var(--color-primary-foreground));
  }

  .sf-button--default:hover { background: var(--color-primary-hover); }
  .sf-button--outline { background: transparent; border: 1px solid color-mix(in oklch, var(--color-ink-950) 12%, transparent); color: var(--color-heading); }
  .sf-button--outline:hover { background: var(--color-surface); }
  .sf-button--secondary { background: var(--color-secondary); color: var(--color-secondary-foreground); }
  .sf-button--secondary:hover { background: color-mix(in oklch, var(--color-secondary) 80%, white); }
  .sf-button--ghost { background: transparent; color: var(--color-heading); }
  .sf-button--ghost:hover { background: var(--color-surface); }
  .sf-button--link { min-block-size: auto; padding: 0; color: var(--color-primary); text-decoration: underline; text-underline-offset: .25em; box-shadow: none; }
  .sf-button--destructive { background: var(--color-destructive); color: var(--color-destructive-foreground); }
  .sf-button--sm { --button-size: 2.25rem; --button-padding-inline: var(--space-xs); }
  .sf-button--lg { --button-size: 3rem; --button-padding-inline: var(--space-m); }
  .sf-button--icon { --button-size: 2.75rem; inline-size: 2.75rem; padding-inline: 0; }

  .sf-card {
    background: var(--card-bg, var(--color-card));
    border: 1px solid var(--card-border, var(--color-border));
    border-radius: var(--card-radius, var(--radius-lg));
    box-shadow: var(--card-shadow, var(--shadow-sm));
    color: var(--card-fg, var(--color-card-foreground));
    padding: var(--card-padding, var(--space-m-l));
  }

  .sf-card--interactive {
    transition: border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard);
  }

  .sf-card--interactive:hover {
    border-color: color-mix(in oklch, var(--color-primary) 32%, var(--color-border));
    box-shadow: var(--shadow-md);
    transform: translateY(-0.125rem);
  }

  .sf-section-header {
    display: grid;
    gap: var(--space-xs);
    max-inline-size: var(--section-header-width, 54rem);
  }

  .sf-section-header[data-align="center"] {
    margin-inline: auto;
    text-align: center;
  }

  .sf-kicker {
    color: var(--color-primary);
    font-size: var(--step--1);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .sf-badge {
    align-items: center;
    background: color-mix(in oklch, var(--color-primary) 12%, transparent);
    border: 1px solid color-mix(in oklch, var(--color-primary) 24%, transparent);
    border-radius: var(--radius-full);
    color: var(--color-primary);
    display: inline-flex;
    font-size: var(--step--1);
    font-weight: 700;
    gap: var(--space-3xs);
    line-height: 1;
    padding: .45em .75em;
  }

  .sf-field {
    display: grid;
    gap: var(--space-2xs);
  }

  .sf-field > label {
    color: var(--color-muted-foreground);
    font-size: var(--step--1);
    font-weight: 700;
  }

  .sf-input {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--input-radius, var(--radius-md));
    color: var(--color-foreground);
    min-block-size: var(--input-block-size, 2.75rem);
    padding-inline: var(--space-s);
  }

  .sf-input:focus-visible {
    border-color: var(--color-ring);
    outline: 0.125rem solid color-mix(in oklch, var(--color-ring) 24%, transparent);
    outline-offset: 0;
  }
}`
}

function buildStaticUtilitiesCss() {
  return `@layer utilities {
  .sf-text-caption { font-size: var(--step--1); line-height: 1.35; }
  .sf-text-body { font-size: var(--step-0); line-height: 1.5; }
  .sf-text-lead { font-size: var(--step-1); line-height: 1.45; }
  .sf-text-h4 { font-size: var(--step-3); line-height: 1.1; }
  .sf-text-h3 { font-size: var(--step-4); line-height: 1.05; }
  .sf-text-h2 { font-size: var(--step-5); line-height: 1; }
  .sf-text-h1 { font-size: var(--step-6); line-height: 1; }
  .sf-text-display { font-size: var(--step-7); line-height: .95; }

  .sf-prose {
    max-inline-size: var(--prose-width, 68ch);
  }

  :where(.sf-visually-hidden, .sr-only) {
    block-size: 0.0625rem;
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    inline-size: 0.0625rem;
    margin: -0.0625rem;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
  }

  :where(.sf-not-visually-hidden, .not-sr-only) {
    block-size: auto;
    clip: auto;
    clip-path: none;
    inline-size: auto;
    margin: 0;
    overflow: visible;
    padding: 0;
    position: static;
    white-space: normal;
  }

  .sf-skip-link {
    background: var(--color-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    color: var(--color-primary-foreground);
    inset-block-start: var(--space-s);
    inset-inline-start: var(--space-s);
    padding-block: var(--space-2xs);
    padding-inline: var(--space-s);
    position: fixed;
    text-decoration: none;
    transform: translateY(calc(-100% - var(--space-m)));
    transition: transform var(--duration-fast) var(--ease-standard);
    z-index: 999;
  }

  .sf-skip-link:focus-visible { transform: translateY(0); }

  .sf-focus-ring:focus-visible {
    outline: 0.125rem solid var(--color-ring);
    outline-offset: .2rem;
  }

  .sf-focus-ring-inset:focus-visible {
    outline: 0.125rem solid var(--color-ring);
    outline-offset: -0.125rem;
  }

  .sf-touch-target {
    min-block-size: 2.75rem;
    min-inline-size: 2.75rem;
  }

  .sf-list-reset {
    list-style: none;
    padding-inline-start: 0;
  }

  .sf-list-disc {
    list-style: disc;
    padding-inline-start: var(--space-m);
  }

  .sf-list-decimal {
    list-style: decimal;
    padding-inline-start: var(--space-m);
  }

  :where(.sf-link, .sf-link-subtle) {
    text-decoration: underline;
    text-decoration-color: color-mix(in oklch, currentColor 45%, transparent);
    text-decoration-skip-ink: auto;
    text-decoration-thickness: .08em;
    text-underline-offset: .18em;
  }

  .sf-link { color: var(--color-primary); }

  .sf-link:hover,
  .sf-link-subtle:hover {
    text-decoration-color: currentColor;
  }

  .sf-link-plain {
    color: inherit;
    text-decoration: none;
  }

  .sf-full-bleed {
    inline-size: 100vw;
    margin-inline-start: 50%;
    transform: translateX(-50%);
  }
}`
}

function buildUtilitiesCss(tokens) {
  const unsupported = []
  const rules = []
  const bases = new Set(tokens.map((token) => splitVariants(token).base))

  for (const token of tokens) {
    const rule = cssRuleFor(token)
    if (rule === null) unsupported.push(token)
    else if (rule) rules.push(rule)
  }

  if (unsupported.length && !quiet && command !== 'lint') {
    const report = unsupported.slice(0, 160).join('\n  ')
    console.warn(`Unsupported class tokens: ${unsupported.length}\n  ${report}`)
  }

  return {
    css: `@layer utilities {
${rules.map((rule) => `  ${rule}`).join('\n')}
${buildUsedKeyframesCss(bases)}
}`,
    unsupported,
  }
}

function buildUsedKeyframesCss(bases) {
  const keyframes = []

  if (bases.has('animate-pulse')) keyframes.push('@keyframes sf-pulse { 50% { opacity: .5; } }')
  if (bases.has('animate-spin')) keyframes.push('@keyframes sf-spin { to { transform: rotate(360deg); } }')
  if (bases.has('animate-in')) keyframes.push('@keyframes sf-enter { from { opacity: 0; transform: translate3d(0, .5rem, 0) scale(.98); } to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } }')
  if (bases.has('animate-out')) keyframes.push('@keyframes sf-exit { from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } to { opacity: 0; transform: translate3d(0, .25rem, 0) scale(.98); } }')

  return keyframes.length ? `\n${keyframes.map((rule) => `  ${rule}`).join('\n')}` : ''
}

function knownPublicClasses() {
  const classes = Object.values(getTokenSummary().starterClasses).flat()
  return [...new Set([...classes, ...knownShippedClasses(), ...utilitySuggestionClasses(), 'flex', 'grid', 'hidden', 'block', 'inline-flex', 'relative', 'absolute', 'sticky', 'sr-only', 'not-sr-only'])]
}

function knownShippedClasses() {
  const cssFile = resolve(packageRoot, 'styles.css')
  if (!existsSync(cssFile)) return []
  const css = readFileSync(cssFile, 'utf8')
  const classes = new Set()
  for (const match of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*(?:--?[_a-zA-Z0-9-]+)?(?:__[_a-zA-Z0-9-]+)?)/g)) {
    classes.add(match[1])
  }
  return [...classes]
}

function utilitySuggestionClasses() {
  const colours = Object.keys(semanticColours)
  const spacing = ['0', '1', '2', '3', '4', '6', '8', '10', '12']
  return [
    ...colours.flatMap((name) => [`text-${name}`, `bg-${name}`, `border-${name}`, `ring-${name}`]),
    ...spacing.flatMap((name) => [`p-${name}`, `px-${name}`, `py-${name}`, `m-${name}`, `gap-${name}`]),
    'text-sm',
    'text-base',
    'text-lg',
    'font-sans',
    'font-display',
    'rounded',
    'rounded-lg',
    'shadow-md',
  ]
}

function nearestClass(token) {
  const { base } = splitVariants(token)
  const candidates = knownPublicClasses()
  const scored = candidates
    .map((candidate) => ({ candidate, score: levenshtein(base, candidate) }))
    .sort((a, b) => a.score - b.score)
  return scored[0]?.score <= Math.max(4, Math.ceil(base.length / 3)) ? scored[0].candidate : null
}

function levenshtein(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 0; i < a.length; i += 1) {
    const current = [i + 1]
    for (let j = 0; j < b.length; j += 1) {
      current[j + 1] = Math.min(
        current[j] + 1,
        previous[j + 1] + 1,
        previous[j] + (a[i] === b[j] ? 0 : 1)
      )
    }
    previous.splice(0, previous.length, ...current)
  }
  return previous[b.length]
}

const tokens = collectClassTokens()
const utilities = buildUtilitiesCss(tokens)
const coreCss = includeCore ? [buildBaseCss(), includeApp ? buildAppCss() : '', buildLayoutCss(), buildComponentCss(), buildStaticUtilitiesCss()] : []
const themeCss = buildThemeCss(config.theme)
const css = [
  '/* Generated by @synced/fluid. Edit synced-fluid.config.mjs or run synced-fluid build to refresh. */',
  '@layer reset, tokens, base, app, layout, components, utilities, overrides;',
  buildTokensCss(),
  themeCss,
  ...coreCss,
  utilities.css,
].filter(Boolean).join('\n\n') + '\n'

if (command === 'lint') {
  const known = new Set(knownPublicClasses())
  const unknownStatic = tokens.filter((token) => {
    const { base } = splitVariants(token)
    return base.startsWith('sf-') && !known.has(base)
  })
  const lintFailures = [...new Set([...utilities.unsupported, ...unknownStatic])]

  if (!lintFailures.length) {
    console.log('pass no unsupported class tokens found.')
  } else {
    console.error(`Unsupported class tokens: ${lintFailures.length}`)
    for (const token of lintFailures.slice(0, 160)) {
      const suggestion = nearestClass(token)
      console.error(`  - ${token}${suggestion ? ` (did you mean ${suggestion}?)` : ''}`)
    }
  }
  process.exit(lintFailures.length ? 1 : 0)
}

if (checkOnly) {
  const current = existsSync(outFile) ? readFileSync(outFile, 'utf8') : ''
  if (current !== css) {
    console.error(`${relative(repoRoot, outFile)} is out of date. Run synced-fluid build.`)
    process.exit(1)
  }
} else {
  writeGeneratedCss(outFile, css)
}

if (utilities.unsupported.length && failOnUnsupported) {
  process.exitCode = 1
}
