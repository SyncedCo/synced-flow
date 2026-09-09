import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`application settings recipe does not overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/settings')
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
  })
}

test('application settings recipe has no automated WCAG A or AA violations @chromium-only', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByRole('combobox', { name: 'Workspace owner' })).toBeVisible()
  await expect(page.getByRole('switch', { name: 'Email weekly summary' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Monthly' })).toBeVisible()
  await expect(page.locator('input[type="range"][name="team_size"]')).toHaveAccessibleName(/Team size/)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const theme of ['light', 'dark']) {
    await page.goto(`/settings?theme=${theme}`)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations, theme).toEqual([])
  }
})
