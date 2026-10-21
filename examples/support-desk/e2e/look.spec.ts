import { expect, test, type Page } from '@playwright/test';

/** The desk's own background: the page around it has none; the desk fills its shadow root's host. */
const deskBackground = (page: Page) => page.locator('.desk').evaluate((el) => getComputedStyle(el).backgroundColor);

test('never scrolls sideways at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 });
  await page.goto('/f/mine/t/30000000-0000-4000-8000-000000000002?demo&script=off');
  await expect(page.getByRole('heading', { name: 'Where is my order? It was due Friday' })).toBeVisible();
  const desk = await page.locator('.desk').evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(desk).toBeLessThanOrEqual(0);
  const whole = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(whole).toBeLessThanOrEqual(0);
});

test('follows the dark colour scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/?demo&script=off');
  // --bg in the dark palette (#0d1312); the light one is #f3f6f5, so a page that ignored the scheme would fail this.
  await expect.poll(() => deskBackground(page)).toBe('rgb(13, 19, 18)');
});

test('stays light when the browser asks for light', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/?demo&script=off');
  await expect.poll(() => deskBackground(page)).toBe('rgb(243, 246, 245)');
});

test('follows the colour scheme live, as a host switching its theme does', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/?demo&script=off');
  await expect.poll(() => deskBackground(page)).toBe('rgb(243, 246, 245)');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('#root')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => deskBackground(page)).toBe('rgb(13, 19, 18)');
});

test.describe('in Vietnamese', () => {
  test.use({ locale: 'vi-VN' });
  test('speaks the browser\'s language', async ({ page }) => {
    await page.goto('/?demo&script=off');
    await expect(page.getByRole('button', { name: /^Của tôi/ })).toBeVisible();
  });
});

test('shows focus on the keyboard path', async ({ page }) => {
  await page.goto('/?demo&script=off');
  await expect(page.getByTestId('desk')).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  // Chrome's own ring is `auto` and would pass `not none`: the stylesheet's is a solid 2px line in the ring colour.
  const outline = await page.evaluate(() => {
    // The document's active element is the shadow's host; the focused control is inside its shadow root.
    let active: Element | null = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    const style = getComputedStyle(active as Element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline).toEqual({ style: 'solid', width: '2px' });
});
