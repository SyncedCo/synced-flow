import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('every catalog item has valid ID references and no automated WCAG A/AA violations @chromium-only', async ({ page, request }) => {
  test.setTimeout(120_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const catalog = await (await request.get('/catalog.json')).json()

  for (const [kind, ids] of [['pattern', catalog.patterns], ['recipe', catalog.recipes]]) {
    for (const id of ids) {
      await test.step(`${kind}: ${id}`, async () => {
        await page.goto(`/catalog/${kind}/${id}?theme=light`)
        const references = await page.evaluate(() => {
          const duplicateIds = [...document.querySelectorAll('[id]')]
            .map((element) => element.id)
            .filter((id, index, ids) => ids.indexOf(id) !== index)
          const missing = []
          const idReferenceAttributes = [
            'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns',
            'aria-activedescendant', 'for', 'form', 'list', 'popovertarget', 'commandfor',
          ]

          for (const element of document.querySelectorAll('*')) {
            for (const attribute of idReferenceAttributes) {
              const value = element.getAttribute(attribute)
              if (!value) continue
              for (const target of value.trim().split(/\s+/)) {
                if (!document.getElementById(target)) missing.push(`${attribute}="${target}"`)
              }
            }
          }
          return { duplicateIds: [...new Set(duplicateIds)], missing }
        })
        expect.soft(references, `${kind} ${id}`).toEqual({ duplicateIds: [], missing: [] })

        for (const theme of ['light', 'dark']) {
          await page.goto(`/catalog/${kind}/${id}?theme=${theme}`)
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze()
          const violations = results.violations.map((violation) => ({
            id: violation.id,
            targets: violation.nodes.flatMap((node) => node.target),
          }))
          expect.soft(violations, `${kind} ${id} (${theme})`).toEqual([])
        }
      })
    }
  }
})
