import { expect, test, type Page } from '@playwright/test';
import { CHAT_SERVER_CODE, startChatServer, type ChatServer } from './chat-server.js';

let server: ChatServer;

test.beforeAll(async ({}, info) => {
  server = await startChatServer(new URL(info.project.use.baseURL!).origin);
});
test.afterAll(() => server.close());

const keyOf = (title: string) => `pub_${title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`;

async function visit(page: Page, key: string, lang?: string, file = 'chat.html') {
  const query = new URLSearchParams({ api: server.url, key, ...(lang ? { lang } : {}) });
  await page.goto(`/gallery/${file}?${query}`);
  const part = (name: string) => page.locator(`agentflow-chat [part="${name}"]`);
  await expect(part('launcher')).toBeVisible();
  return part;
}

/** The contrast of a node's text against what it is drawn over, each element up to the log composited as its own opacity group. */
function contrastOn(locator: ReturnType<Page['locator']>): Promise<number> {
  return locator.evaluate((node) => {
    type Rgba = { c: number[]; a: number };
    const parse = (color: string): Rgba => {
      const [r, g, b, a = 1] = color.match(/[\d.]+/g)!.map(Number);
      return { c: [r!, g!, b!], a };
    };
    const over = (top: Rgba, bottom: Rgba): Rgba => {
      const a = top.a + bottom.a * (1 - top.a);
      return a === 0 ? { c: [0, 0, 0], a: 0 } : { c: top.c.map((v, i) => (v * top.a + bottom.c[i]! * bottom.a * (1 - top.a)) / a), a };
    };
    const pixel = (start: Rgba) => {
      let layer = start;
      for (let at: Element | null = node; at && at.getAttribute('part') !== 'log'; at = at.parentElement) {
        const style = getComputedStyle(at);
        layer = over(layer, parse(style.backgroundColor));
        layer = { ...layer, a: layer.a * Number(style.opacity) };
      }
      return over(layer, parse(getComputedStyle(node.closest("[part='panel']")!).backgroundColor)).c;
    };
    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const [light, dark] = [luminance(pixel(parse(getComputedStyle(node).color))), luminance(pixel({ c: [0, 0, 0], a: 0 }))].sort((x, y) => y - x);
    return (light! + 0.05) / (dark! + 0.05);
  });
}

async function write(part: (name: string) => ReturnType<Page['locator']>, text: string) {
  await part('input').fill(text);
  await part('input').press('Enter');
}

test('opens in the connection colour, sends, shows typing and the reply, and restores the log after a reload', async ({ page }, info) => {
  const part = await visit(page, keyOf(info.title));
  await expect(part('launcher')).toHaveCSS('background-color', 'rgb(15, 118, 110)');
  await part('launcher').click();
  await expect(part('panel')).toBeVisible();
  await expect(part('greeting')).toHaveText('Hi, this is Hanoi Bicycle Rental.');
  await write(part, 'Do you rent tandem bikes?');
  const bubble = part('message').first();
  await expect(bubble.locator('[part="status"]')).toHaveText('Sent');
  await expect(bubble).toHaveAttribute('data-position', '1');
  await expect(bubble.locator('[part="status"]')).toHaveCount(0);
  await expect(part('typing')).toBeVisible();
  const reply = page.locator('agentflow-chat [part="message"][data-author="agent"]');
  await expect(reply.locator('[part="text"]')).toHaveText('Thanks! You wrote: Do you rent tandem bikes?');
  await expect(reply.locator('[part="author"]')).toHaveText('Mai');
  await expect(part('typing')).toBeHidden();
  await expect(part('live')).toHaveText('Mai: Thanks! You wrote: Do you rent tandem bikes?');

  await page.reload();
  await part('launcher').click();
  await expect(part('message')).toHaveCount(2);
  await expect(part('message').first().locator('[part="text"]')).toHaveText('Do you rent tandem bikes?');
  expect(server.sessions(keyOf(info.title))).toBe(1);
});

test("draws and chats under a site's strict style-src and Trusted Types", async ({ page }, info) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const part = await visit(page, keyOf(info.title), undefined, 'chat-strict.html');
  await expect(part('launcher')).toHaveCSS('position', 'fixed');
  await expect(part('launcher')).toHaveCSS('background-color', 'rgb(15, 118, 110)');
  await part('launcher').click();
  await expect(part('panel')).toHaveCSS('position', 'fixed');
  await write(part, 'Hello from a strict page');
  await expect(page.locator('agentflow-chat [part="message"][data-author="agent"] [part="text"]')).toHaveText('Thanks! You wrote: Hello from a strict page');
  expect(pageErrors).toEqual([]);
});

test('speaks Vietnamese when the page asks for it', async ({ page }, info) => {
  const part = await visit(page, keyOf(info.title), 'vi');
  await expect(part('launcher')).toHaveAccessibleName('Trò chuyện với chúng tôi');
  await part('launcher').click();
  await expect(part('greeting')).toHaveText('Xin chào, đây là Hanoi Bicycle Rental.');
  await expect(part('input')).toHaveAttribute('placeholder', 'Nhập tin nhắn…');
  await expect(part('send')).toHaveAccessibleName('Gửi');
  await expect(part('close')).toHaveAccessibleName('Đóng');
});

test('fills a phone screen with no sideways scroll', async ({ page }, info) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const part = await visit(page, keyOf(info.title));
  await part('launcher').click();
  expect(await part('panel').boundingBox()).toEqual({ x: 0, y: 0, width: 375, height: 667 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(part('close')).toBeInViewport();
  await expect(part('send')).toBeInViewport();
});

test('works from the keyboard alone, and Escape returns focus to the launcher', async ({ page }, info) => {
  const part = await visit(page, keyOf(info.title));
  // WebKit on macOS, as Safari, tabs only to text fields unless Option is held; on Linux, where CI runs, Tab reaches buttons.
  await page.keyboard.press(info.project.name === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
  await expect(part('launcher')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(part('input')).toBeFocused();
  await page.keyboard.type('Are you open on Sunday?');
  await page.keyboard.press('Enter');
  await expect(part('message').first().locator('[part="text"]')).toHaveText('Are you open on Sunday?');
  await expect(part('input')).toBeFocused();
  await expect(part('end'), 'End chat appears once the session opens').toBeVisible();
  const order: (string | null | undefined)[] = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => document.querySelector('agentflow-chat')!.shadowRoot!.activeElement?.getAttribute('part')));
  }
  expect(order, 'Tab cycles through the panel and stays in it').toEqual(['send', 'end', 'close', 'log', 'input', 'send']);
  await page.keyboard.press('Shift+Tab');
  await expect(part('input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(part('panel')).toBeHidden();
  await expect(part('launcher')).toBeFocused();
});

test('ends the chat, and the next message opens a second session on a clean log', async ({ page }, info) => {
  const key = keyOf(info.title);
  const part = await visit(page, key);
  await part('launcher').click();
  await write(part, 'First question');
  await expect(page.locator('agentflow-chat [part="message"][data-author="agent"]')).toHaveCount(1);
  await part('end').click();
  await expect(part('notice')).toHaveText('This chat has ended. Write again to start a new one.');
  await expect(part('end')).toBeHidden();
  await expect(part('message')).toHaveCount(2);

  await write(part, 'Second question');
  await expect(page.locator('agentflow-chat [part="message"][data-author="agent"] [part="text"]')).toHaveText('Thanks! You wrote: Second question');
  await expect(part('message')).toHaveCount(2);
  await expect(part('notice')).toBeHidden();
  expect(server.sessions(key)).toBe(2);
});

test('streams the reply into one bubble, which becomes the stored message in place', async ({ page }, info) => {
  const part = await visit(page, keyOf(info.title));
  await part('launcher').click();
  await write(part, 'Do you rent tandem bikes?');
  const draft = page.locator('agentflow-chat [part="message"][data-draft]');
  await expect(draft.locator('[part="label"]')).toHaveText('Writing');
  await draft.evaluate((node) => node.setAttribute('data-seen-as-draft', ''));
  const partial = await draft.locator('[part="text"]').textContent();
  expect('Thanks! You wrote: Do you rent tandem bikes?'.startsWith(partial ?? '-'), 'the words grow from the start').toBe(true);
  const reply = page.locator('agentflow-chat [part="message"][data-author="agent"]');
  await expect(reply).toHaveAttribute('data-position', '2');
  await expect(reply).toHaveCount(1);
  await expect(reply).toHaveAttribute('data-seen-as-draft', '');
  await expect(reply.locator('[part="text"]')).toHaveText('Thanks! You wrote: Do you rent tandem bikes?');
  await expect(reply.locator('[part="author"]')).toHaveText('Mai');
  await expect(reply.locator('[part="label"]')).toHaveCount(0);
});

test('asks for an email code when a tool needs it, then sends the last message again and streams the answer', async ({ page }, info) => {
  const key = keyOf(info.title);
  const part = await visit(page, key);
  await part('launcher').click();
  await write(part, 'Where is my order 4411?');
  await expect(part('sheet')).toBeVisible();
  await expect(part('sheet-title')).toHaveText('Confirm it’s you');
  await page.getByLabel('Email address').fill('ada@example.org');
  await page.getByRole('button', { name: 'Email me a code' }).click();
  await expect(part('code-sent')).toHaveText('We sent a 6-digit code to a•••@example.org.');
  await expect(page.getByLabel('6-digit code')).toBeFocused();
  await page.keyboard.type('000000');
  await page.keyboard.press('Enter');
  await expect(part('sheet-error')).toHaveText('That code is wrong or has expired. Check it, or ask for a new one.');
  await expect(page.getByLabel('6-digit code'), 'a refusal leaves focus in the field').toBeFocused();
  await page.getByLabel('6-digit code').fill(CHAT_SERVER_CODE);
  await page.keyboard.press('Enter');
  await expect(part('sheet')).toBeHidden();
  await expect(part('input'), 'focus goes back to the composer').toBeFocused();
  await expect(page.locator('agentflow-chat [part="message"][data-author="system"] [part="text"]')).toHaveText('Verified as a•••@example.org');
  const resent = page.locator('agentflow-chat [part="message"][data-resent]');
  await expect(resent.locator('[part="resent"]')).toHaveText('Sent again after you confirmed');
  await expect(resent.locator('[part="text"]')).toHaveText('Where is my order 4411?');
  for (const name of ['text', 'resent']) {
    expect(await contrastOn(resent.locator(`[part="${name}"]`)), `the faded ${name} keeps AA contrast`).toBeGreaterThanOrEqual(4.5);
  }
  await expect(page.locator('agentflow-chat [part="message"][data-author="agent"]').last().locator('[part="text"]')).toHaveText('Thanks! You wrote: Where is my order 4411?');
  expect(server.posts(key)).toBe(2);
});
