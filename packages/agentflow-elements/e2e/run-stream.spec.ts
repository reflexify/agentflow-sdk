import { expect, test, type Page } from '@playwright/test';
import { DRAFT_WORDS, threeSteps } from '../test/kit/fixtures/runs.js';

// `af-run-stream` in a real browser, in a module's shadow root, fed a recorded run one frame at a time. The fixtures are served by the
// gallery's own server, so the page builds its source from the same recorded frames the test names.

declare global {
  interface Window { runFeed: { push(...items: unknown[]): void; end(): void } }
}

/** Empties the gallery, keeping the kit it defined, and draws one `af-run-stream` fed by `window.runFeed`. */
async function stage(page: Page, width?: number) {
  if (width) await page.setViewportSize({ width, height: 800 });
  await page.goto('/gallery/');
  await page.evaluate(async () => {
    await customElements.whenDefined('af-run-stream');
    const served = '/test/kit/fixtures/runs.ts';
    const fixtures = (await import(/* @vite-ignore */ served)) as typeof import('../test/kit/fixtures/runs.js');
    const feed = fixtures.fed();
    window.runFeed = feed;
    const host = document.createElement('div');
    host.className = 'af-kit';
    host.style.cssText = 'padding:16px;box-sizing:border-box;width:100%';
    const root = host.attachShadow({ mode: 'open' });
    const el = document.createElement('af-run-stream') as HTMLElement & Record<string, unknown>;
    Object.assign(el, { locale: 'en', source: feed.source });
    root.append(el);
    document.body.replaceChildren(host);
    document.body.style.margin = '0';
  });
}

const stream = (page: Page) => page.locator('af-run-stream');
const region = (page: Page) => stream(page).locator('[part~="status"]').evaluate((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());

test('the polite region says each step’s end and the outcome once, after the frame that ends it, and never a word', async ({ page }) => {
  await stage(page);
  await expect(stream(page).locator('[part~="status"]')).toHaveAttribute('role', 'status');
  const items = threeSteps();
  const heard: string[] = [];
  for (const item of items) {
    await page.evaluate((frame) => window.runFeed.push(frame), item);
    await page.waitForTimeout(150);
    const now = await region(page);
    if (now && heard.at(-1) !== now) heard.push(now);
  }
  expect(heard).toEqual(['Load the order: done', 'Draft the reply: done', 'Tell the customer: done', 'The run completed']);
  for (const word of DRAFT_WORDS) expect(heard.join(' ')).not.toContain(word.replace(/\*/g, '').trim());
  await expect(stream(page).locator('[part~="words"]')).toContainText('ships on Monday.');
  await expect(stream(page).locator('[part~="outcome"]')).toHaveText('The run completed');
  expect(await stream(page).locator('[part~="step"]').evaluateAll((steps) => steps.map((s) => s.getAttribute('data-status')))).toEqual(['done', 'done', 'done']);
});

test('fits 375px with no horizontal scroll, long words and a For Each of twenty items included', async ({ page }) => {
  await stage(page, 375);
  const long = { ...threeSteps()[4]!, text: `A reference with no break in it: ${'INV-2026-'.repeat(12)} and a link https://example.com/${'path/'.repeat(20)}` };
  await page.evaluate(async (frames) => {
    const served = '/test/kit/fixtures/runs.ts';
    const fixtures = (await import(/* @vite-ignore */ served)) as typeof import('../test/kit/fixtures/runs.js');
    window.runFeed.push(...frames, ...fixtures.forEach(20).slice(0, -3));
  }, [...threeSteps().slice(0, 4), long]);
  await expect(stream(page).locator('[part~="items"]')).toContainText('20 items');
  await expect(stream(page).locator('[part~="words"]')).toContainText('A reference');
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, view: document.documentElement.clientWidth, right: document.querySelector('div.af-kit')!.shadowRoot!.querySelector('af-run-stream')!.getBoundingClientRect().right }));
  expect(sizes.scroll, 'the page scrolls sideways').toBeLessThanOrEqual(sizes.view);
  expect(sizes.right).toBeLessThanOrEqual(375);
});
