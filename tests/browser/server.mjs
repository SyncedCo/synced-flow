import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cli = join(packageRoot, 'bin/synced-flow.mjs')
const styles = readFileSync(join(packageRoot, 'styles.css'), 'utf8')
const wordpressStyles = readFileSync(join(packageRoot, 'examples/wordpress/assets/css/synced-flow.css'), 'utf8')
const catalog = JSON.parse(run(['catalog', '--json']))

function run(args) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
}

function markup(kind, id) {
  const item = kind === 'pattern'
    ? catalog.patterns.find((entry) => entry.id === id)
    : catalog.recipes.find((entry) => entry.id === id)
  if (!item) return null
  return typeof item.markup === 'string' ? item.markup : item.markup.html
}

function document(title, body, script = '', theme = '', stylesheet = '/styles.css') {
  return `<!doctype html>
<html lang="en"${theme ? ` data-sf-theme="${theme}"` : ''}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <link rel="stylesheet" href="${stylesheet}">
  </head>
  <body>
    ${body}
    ${script ? `<script>${script}</script>` : ''}
  </body>
</html>`
}

function componentPage(stylesheet = '/styles.css') {
  const switchMarkup = markup('pattern', 'switch-control')
    .replace('name="notifications"', 'id="notifications" name="notifications"')
  const disabledSwitch = markup('pattern', 'switch-control')
    .replace('name="notifications" checked', 'id="disabled-switch" name="disabled_switch" checked disabled')
    .replace('Email notifications', 'Locked notifications')
  const radioMarkup = markup('pattern', 'segmented-control')
    .replace('name="cycle" value="monthly"', 'id="cycle-monthly" name="cycle" value="monthly"')
    .replace('name="cycle" value="annual"', 'id="cycle-annual" name="cycle" value="annual"')
  const disabledRadio = '<div class="sf-segmented-control"><label class="sf-segmented-control__option"><input id="available-radio" type="radio" name="locked_cycle" value="available" checked><span class="sf-segmented-control__label">Available cycle</span></label><label class="sf-segmented-control__option"><input id="disabled-radio" type="radio" name="locked_cycle" value="locked" disabled><span class="sf-segmented-control__label">Locked cycle</span></label></div>'
  const rangeMarkup = markup('pattern', 'native-file-and-range')
  const inputGroupMarkup = markup('pattern', 'input-group')
  const loadingMarkup = markup('pattern', 'loading-button')
  const dialogMarkup = markup('pattern', 'modal-form')

  return document('Synced Flow browser contract', `
    <main class="sf-section">
      <div class="sf-container sf-stack">
        <h1>Component contracts</h1>
        <form class="sf-form" id="contract-form">
          ${switchMarkup}
          ${disabledSwitch}
          ${radioMarkup}
          ${disabledRadio}
          ${rangeMarkup}
          ${inputGroupMarkup}
          <button class="sf-button" type="submit">Read form values</button>
        </form>
        <output id="form-values" role="status" aria-live="polite"></output>
        <section aria-labelledby="loading-title"><h2 id="loading-title">Loading state</h2>${loadingMarkup}</section>
        <button class="sf-button" id="open-dialog" type="button">Open edit dialog</button>
        ${dialogMarkup}
      </div>
    </main>`, `
      const form = document.querySelector('#contract-form')
      form.addEventListener('submit', (event) => {
        event.preventDefault()
        document.querySelector('#form-values').value = JSON.stringify(Object.fromEntries(new FormData(form)))
      })
      const dialog = document.querySelector('#edit-dialog')
      const dialogOpener = document.querySelector('#open-dialog')
      dialogOpener.addEventListener('click', () => dialog.showModal())
      dialog.addEventListener('close', () => dialogOpener.focus())
      document.querySelector('#edit-form').addEventListener('submit', (event) => {
        if (event.submitter?.textContent.trim() === 'Save') event.preventDefault()
      })
    `, '', stylesheet)
}

function settingsPage() {
  return document('Application settings recipe', markup('recipe', 'app-settings-workflow'))
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1:4173')
  if (url.pathname === '/health') return send(response, 200, 'text/plain; charset=utf-8', 'ok')
  if (url.pathname === '/styles.css') return send(response, 200, 'text/css; charset=utf-8', styles)
  if (url.pathname === '/wordpress.css') return send(response, 200, 'text/css; charset=utf-8', wordpressStyles)
  if (url.pathname === '/components') return send(response, 200, 'text/html; charset=utf-8', componentPage())
  if (url.pathname === '/components-wordpress') return send(response, 200, 'text/html; charset=utf-8', componentPage('/wordpress.css'))
  if (url.pathname === '/settings') {
    const theme = url.searchParams.get('theme') ?? ''
    return send(response, 200, 'text/html; charset=utf-8', document('Application settings recipe', markup('recipe', 'app-settings-workflow'), '', theme))
  }
  if (url.pathname.startsWith('/catalog/')) {
    const [, , kind, id] = url.pathname.split('/')
    const itemMarkup = markup(kind, id)
    const theme = url.searchParams.get('theme') ?? ''
    const themedMarkup = theme === 'dark' ? itemMarkup?.replaceAll('sf-theme-light', '') : itemMarkup
    if (typeof themedMarkup === 'string') return send(response, 200, 'text/html; charset=utf-8', document(`${kind}: ${id}`, themedMarkup, '', theme))
  }
  if (url.pathname === '/catalog.json') {
    return send(response, 200, 'application/json; charset=utf-8', JSON.stringify({
      patterns: catalog.patterns.map(({ id }) => id),
      recipes: catalog.recipes.map(({ id }) => id),
    }))
  }
  return send(response, 404, 'text/plain; charset=utf-8', 'Not found')
})

function send(response, status, type, body) {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' })
  response.end(body)
}

server.listen(4173, '127.0.0.1')

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
