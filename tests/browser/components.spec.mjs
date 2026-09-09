import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components')
})

test('native switch and segmented controls keep keyboard behaviour and visible focus', async ({ page }) => {
  const switchInput = page.locator('#notifications')
  const switchControl = switchInput.locator('+ .sf-switch__control')
  await switchInput.focus()
  await expect(switchControl).toHaveCSS('outline-style', 'solid')
  await expect(switchControl).not.toHaveCSS('outline-width', '0px')
  await expect(switchControl).not.toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)')
  await page.keyboard.press('Space')
  await expect(switchInput).not.toBeChecked()
  await page.keyboard.press('Space')
  await expect(switchInput).toBeChecked()

  const monthly = page.locator('#cycle-monthly')
  const annual = page.locator('#cycle-annual')
  await monthly.focus()
  await expect(monthly.locator('+ .sf-segmented-control__label')).toHaveCSS('outline-style', 'solid')
  await expect(monthly.locator('+ .sf-segmented-control__label')).not.toHaveCSS('outline-width', '0px')
  await page.keyboard.press('ArrowRight')
  await expect(annual).toBeChecked()
  await expect(annual).toBeFocused()
  await expect(annual.locator('+ .sf-segmented-control__label')).toHaveCSS('outline-style', 'solid')
})

test('disabled binary controls remain immutable', async ({ page }) => {
  const disabledSwitch = page.locator('#disabled-switch')
  const disabledRadio = page.locator('#disabled-radio')
  const availableRadio = page.locator('#available-radio')
  await expect(disabledSwitch).toBeDisabled()
  await expect(disabledRadio).toBeDisabled()
  await expect(disabledSwitch).toBeChecked()
  await expect(disabledRadio).not.toBeChecked()
  await expect(availableRadio).toBeChecked()
  await disabledSwitch.evaluate((element) => element.click())
  await disabledRadio.evaluate((element) => element.click())
  await expect(disabledSwitch).toBeChecked()
  await expect(disabledRadio).not.toBeChecked()
  await expect(availableRadio).toBeChecked()
})

test('new visual controls expose their native roles and accessible names', async ({ page }) => {
  await expect(page.getByRole('switch', { name: 'Email notifications' })).toBeVisible()
  await expect(page.getByRole('switch', { name: 'Locked notifications' })).toBeDisabled()
  await expect(page.getByRole('radio', { name: 'Monthly' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Annual' })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Saving changes' })).toBeAttached()
})

test('native controls submit their actual form values', async ({ page }) => {
  await page.locator('input[name="budget"]').fill('1250')
  await page.locator('input[name="team_size"]').fill('18')
  await page.getByText('Annual', { exact: true }).click()
  await page.getByRole('button', { name: 'Read form values' }).click()

  const values = JSON.parse(await page.locator('#form-values').evaluate((element) => element.value))
  expect(values).toMatchObject({
    notifications: 'on',
    cycle: 'annual',
    team_size: '18',
    budget: '1250',
  })
  expect(values).not.toHaveProperty('disabled_switch')
  expect(values.locked_cycle).toBe('available')
})

test('reduced motion leaves the spinner visible and stationary', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const spinner = page.locator('.sf-spinner').first()
  await expect(spinner).toBeVisible()
  await expect(spinner).toHaveCSS('animation-name', 'none')
  await expect(spinner).toHaveCSS('border-top-style', 'solid')
  await expect(spinner).not.toHaveCSS('border-top-width', '0px')
  const box = await spinner.boundingBox()
  expect(box?.width).toBeGreaterThan(0)
  expect(box?.height).toBeGreaterThan(0)
})

test('dialog Cancel, Escape, and app focus restoration work across browsers', async ({ page }) => {
  const opener = page.locator('#open-dialog')
  const dialog = page.locator('#edit-dialog')
  await opener.click()
  await expect(dialog).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(opener).toBeFocused()

  await opener.click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(opener).toBeFocused()
})

test('HTML scroll spy updates the current link as panels intersect', async ({ page }) => {
  await page.goto('/catalog/pattern/scroll-viewport-with-spy')
  await page.locator('#two').scrollIntoViewIfNeeded()
  await expect(page.locator('a[href="#two"]')).toHaveAttribute('aria-current', 'location')
  await expect(page.locator('a[href="#one"]')).not.toHaveAttribute('aria-current', /.+/)
})

test('forced colours preserve visual controls and their focus indicators @chromium-only', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  const switchInput = page.locator('#notifications')
  const switchControl = switchInput.locator('+ .sf-switch__control')
  await switchInput.focus()
  await expect(switchControl).toHaveCSS('outline-style', 'solid')
  await expect(switchControl).not.toHaveCSS('border-top-style', 'none')
  const checkedBackground = await switchControl.evaluate((element) => getComputedStyle(element).backgroundColor)
  await page.keyboard.press('Space')
  await expect(switchInput).not.toBeChecked()
  await page.waitForTimeout(20)
  const uncheckedBackground = await switchControl.evaluate((element) => getComputedStyle(element).backgroundColor)
  expect(uncheckedBackground).not.toBe(checkedBackground)

  const radio = page.locator('#cycle-monthly')
  const annual = page.locator('#cycle-annual')
  await radio.focus()
  await expect(radio.locator('+ .sf-segmented-control__label')).toHaveCSS('outline-style', 'solid')
  const selectedBackground = await radio.locator('+ .sf-segmented-control__label').evaluate((element) => getComputedStyle(element).backgroundColor)
  const unselectedBackground = await annual.locator('+ .sf-segmented-control__label').evaluate((element) => getComputedStyle(element).backgroundColor)
  expect(selectedBackground).not.toBe(unselectedBackground)
})

test('component fixture has no automated WCAG A or AA violations @chromium-only', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => { document.documentElement.dataset.sfTheme = value }, theme)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations, theme).toEqual([])
  }

  await page.locator('#open-dialog').click()
  const openDialogResults = await new AxeBuilder({ page }).include('#edit-dialog').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  expect(openDialogResults.violations).toEqual([])
})

test('light theme links retain contrast in their hover state @chromium-only', async ({ page }) => {
  await page.goto('/catalog/pattern/data-table-actions')
  await page.evaluate(() => { document.documentElement.dataset.sfTheme = 'light' })
  const link = page.locator('.sf-link').first()
  await link.hover()
  const results = await new AxeBuilder({ page }).include('.sf-link').withTags(['wcag2aa']).analyze()
  expect(results.violations).toEqual([])
})

test('WordPress includeCore CSS keeps the new native controls usable @chromium-only', async ({ page }) => {
  await page.goto('/components-wordpress')
  const switchInput = page.locator('#notifications')
  const switchControl = switchInput.locator('+ .sf-switch__control')
  await switchInput.focus()
  await expect(switchControl).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Space')
  await expect(switchInput).not.toBeChecked()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const spinner = page.locator('.sf-spinner').first()
  await expect(spinner).toBeVisible()
  await expect(spinner).toHaveCSS('animation-name', 'none')
})
