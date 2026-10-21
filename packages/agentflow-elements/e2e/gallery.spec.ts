import { expect, test, type Page } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`every kit element renders and opens in ${theme}`, async ({ page }) => {
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    for (const tag of ['af-dialog', 'af-confirm', 'af-menu', 'af-popover', 'af-tooltip', 'af-toast', 'af-date', 'af-person-picker', 'af-rich-editor']) {
      await expect(pane.locator(tag).first(), tag).toBeAttached();
    }
    await pane.locator('af-menu [part="trigger"]').click();
    await expect(pane.locator('af-menu [part="item"]').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(pane.locator('af-menu [part="item"]').first()).toBeHidden();
    // The native <dialog> is an unnamed dialog around the named content, so the name picks one.
    const dialog = pane.getByRole('dialog', { name: 'Rename project' });
    await pane.getByRole('button', { name: 'Open dialog' }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await pane.getByRole('button', { name: 'Open dialog' }).click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await page.waitForTimeout(100);
    await expect(dialog).toBeHidden();
  });
}

test('the date picker opens its calendar unclipped and moves focus into it', async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const trigger = pane.locator('.short-column af-date [part="trigger"]');
  await trigger.click();
  const day = pane.locator('.short-column af-date [data-scope="date-picker"][data-part="table-cell-trigger"]').first();
  await expect(day).toBeVisible();
  const box = (await day.boundingBox())!;
  const hit = await page.evaluate(([x, y]) => {
    let el: Element | null = document.elementFromPoint(x!, y!);
    while (el?.shadowRoot) {
      const inner = el.shadowRoot.elementFromPoint(x!, y!);
      if (!inner || inner === el) break;
      el = inner;
    }
    return el?.closest('[data-scope="date-picker"]')?.getAttribute('data-part') ?? null;
  }, [box.x + box.width / 2, box.y + box.height / 2]);
  expect(hit).not.toBeNull();
  await expect.poll(() => page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    return a?.closest('[data-scope="date-picker"][data-part="content"]') !== null;
  })).toBe(true);
  await page.keyboard.press('Escape');
  await expect(day).toBeHidden();
});

test('a menu in a short scrolling column is not clipped', async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  await pane.locator('.short-column af-menu [part="trigger"]').click();
  const item = pane.locator('.short-column af-menu [part="item"]').last();
  await expect(item).toBeVisible();
  const box = (await item.boundingBox())!;
  const hit = await page.evaluate(([x, y]) => {
    let el: Element | null = document.elementFromPoint(x!, y!);
    while (el?.shadowRoot) {
      const inner = el.shadowRoot.elementFromPoint(x!, y!);
      if (!inner || inner === el) break;
      el = inner;
    }
    return el?.getAttribute('part');
  }, [box.x + box.width / 2, box.y + box.height / 2]);
  expect(hit).toBe('item');
});

interface Seen { tag: string; part: string | null; testid: string | null; kit: string | null; theme: string | null }
interface Box { top: number; right: number; bottom: number; left: number }
interface Layer { open: boolean; raised: string | null; content: Box | null }
interface Probe {
  active(): Seen | null;
  hit(x: number, y: number): Seen | null;
  layer(theme: string, selector: string): Layer | null;
  box(theme: string, selector: string): Box | null;
  dialogOpen(theme: string, selector: string): boolean | null;
  contentState(theme: string, selector: string): string | null;
  partBox(theme: string, selector: string, part: string): Box | null;
}
type Method = keyof Probe;

const KIT = 'af-dialog, af-confirm, af-menu, af-popover, af-tooltip, af-toast, af-date, af-person-picker, af-rich-editor';

// Runs in the page. The gallery nests each element's shadow root inside its pane's, so every lookup walks both.
function installProbe(kit: string) {
  const describe = (el: Element | null): Seen | null => {
    if (!el) return null;
    let owner: Element | null = null;
    let theme: string | null = null;
    for (let n: Element | null = el; n; ) {
      owner ??= n.closest(kit);
      const pane = n.closest('.af-app');
      if (pane) {
        theme = pane.getAttribute('data-theme');
        break;
      }
      const root = n.getRootNode();
      n = root instanceof ShadowRoot ? root.host : null;
    }
    return { tag: el.localName, part: el.getAttribute('part'), testid: el.getAttribute('data-testid'), kit: owner?.localName ?? null, theme };
  };
  const rect = (el: Element | null | undefined): Box | null => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, right: r.right, bottom: r.bottom, left: r.left };
  };
  const find = (theme: string, selector: string) => document.querySelector(`.af-app[data-theme="${theme}"]`)?.shadowRoot?.querySelector(selector) ?? null;
  const probe: Probe = {
    active() {
      let a: Element | null = document.activeElement;
      while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
      return describe(a);
    },
    hit(x, y) {
      let el: Element | null = document.elementFromPoint(x, y);
      while (el?.shadowRoot) {
        const inner = el.shadowRoot.elementFromPoint(x, y);
        if (!inner || inner === el) break;
        el = inner;
      }
      return describe(el);
    },
    layer(theme, selector) {
      const host = find(theme, selector);
      const layer = host?.shadowRoot?.querySelector<HTMLElement>('[popover]');
      if (!host || !layer) return null;
      const content = layer.querySelector('[data-part="content"], [data-scope="toast"][data-part="root"]');
      return { open: layer.matches(':popover-open'), raised: host.getAttribute('data-raised'), content: rect(content) };
    },
    box(theme, selector) {
      return rect(find(theme, selector));
    },
    dialogOpen(theme, selector) {
      return find(theme, selector)?.shadowRoot?.querySelector('dialog')?.open ?? null;
    },
    contentState(theme, selector) {
      return find(theme, selector)?.shadowRoot?.querySelector('[data-part="content"]')?.getAttribute('data-state') ?? null;
    },
    partBox(theme, selector, part) {
      return rect(find(theme, selector)?.shadowRoot?.querySelector(`[part="${part}"]`));
    },
  };
  Object.assign(window, { probe });
}

function call<M extends Method>(page: Page, method: M, ...args: Parameters<Probe[M]>): Promise<ReturnType<Probe[M]>> {
  return page.evaluate(
    ([m, a]) => {
      const p = (window as unknown as { probe: Record<string, (...x: unknown[]) => unknown> }).probe;
      return p[m as string]!(...(a as unknown[]));
    },
    [method, args] as const,
  ) as Promise<ReturnType<Probe[M]>>;
}

interface GalleryEvent { theme: string; tag: string; type: string; detail: unknown }
const eventsOf = (page: Page, theme: string, tag: string) =>
  page.evaluate(([t, g]) => (window as unknown as { galleryEvents: GalleryEvent[] }).galleryEvents.filter((e) => e.theme === t && e.tag === g), [theme, tag] as const);

const OUTSIDE = { x: 5, y: 5 };

test.describe('in a real browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(installProbe, KIT);
    await page.goto('/gallery/');
  });

  const OVERLAYS = [
    { tag: 'af-menu', selector: '.short-column af-menu', reachesPast: true },
    { tag: 'af-popover', selector: '.short-column af-popover', reachesPast: true },
    { tag: 'af-tooltip', selector: '.short-column .row > af-tooltip', reachesPast: false },
    { tag: 'af-date', selector: '.short-column af-date', reachesPast: true },
    { tag: 'af-person-picker', selector: '.short-column af-person-picker', reachesPast: true },
  ] as const;

  for (const overlay of OVERLAYS) {
    test(`${overlay.tag} opens into the top layer, past its scrolling column, and closes on an outside click`, async ({ page }) => {
      const pane = page.locator('[data-theme="light"] .gallery');
      const el = pane.locator(overlay.selector);
      if (overlay.tag === 'af-menu' || overlay.tag === 'af-date') await el.locator('[part="trigger"]').click();
      if (overlay.tag === 'af-popover') await pane.getByTestId('light-popover-anchor').click();
      if (overlay.tag === 'af-tooltip') await pane.getByTestId('light-tooltip-anchor').hover();
      if (overlay.tag === 'af-person-picker') {
        await el.locator('[part="input"]').focus();
        await page.keyboard.press('ArrowDown');
      }
      await expect.poll(async () => (await call(page, 'layer', 'light', overlay.selector))?.open).toBe(true);
      const layer = (await call(page, 'layer', 'light', overlay.selector))!;
      expect(layer.raised).toBe('true');
      const content = layer.content!;
      const column = (await call(page, 'box', 'light', '.short-column'))!;
      let y = (content.top + content.bottom) / 2;
      if (overlay.reachesPast) {
        expect(content.bottom, 'the overlay reaches past the bottom of its column').toBeGreaterThan(column.bottom + 8);
        y = (Math.max(column.bottom, content.top) + content.bottom) / 2;
      }
      const hit = await call(page, 'hit', (content.left + content.right) / 2, y);
      expect(hit?.kit, JSON.stringify(hit)).toBe(overlay.tag);

      await page.mouse.click(OUTSIDE.x, OUTSIDE.y);
      await page.waitForTimeout(100);
      await expect.poll(async () => (await call(page, 'layer', 'light', overlay.selector))?.open).toBe(false);
      expect((await call(page, 'layer', 'light', overlay.selector))?.raised).toBe('false');
    });
  }

  test('the popover’s Tab order runs from its content into the slotted fields', async ({ page }) => {
    const pane = page.locator('[data-theme="light"] .gallery');
    await pane.getByTestId('light-popover-anchor').click();
    await expect.poll(async () => (await call(page, 'active'))?.kit).toBe('af-popover');
    const first = await call(page, 'active');
    const order = [first];
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      order.push(await call(page, 'active'));
    }
    console.log(`popover tab order (${test.info().project.name}):`, JSON.stringify(order));
    const ids = order.map((s) => s?.testid ?? s?.part ?? s?.tag);
    const at = ids.indexOf('light-popover-first');
    expect(at, JSON.stringify(ids)).toBeGreaterThanOrEqual(0);
    expect(ids[at + 1]).toBe('light-popover-second');
  });

  for (const [tag, opener, firstPart] of [['af-dialog', 'light-open-dialog', 'close'], ['af-confirm', 'light-open-confirm', 'cancel']] as const) {
    test(`${tag} focuses its ${firstPart} button first and keeps Tab inside`, async ({ page, browserName }) => {
      await page.getByTestId(opener).click();
      await expect.poll(async () => (await call(page, 'active'))?.part).toBe(firstPart);
      expect((await call(page, 'active'))?.kit).toBe(tag);
      const seen: (Seen | null)[] = [];
      for (const key of browserName === 'webkit' ? ['Tab', 'Alt+Tab', 'Shift+Tab'] : ['Tab', 'Shift+Tab']) {
        for (let i = 0; i < 8; i++) {
          await page.keyboard.press(key);
          seen.push(await call(page, 'active'));
        }
      }
      console.log(`${tag} tab sequence (${test.info().project.name}):`, JSON.stringify(seen.map((s) => s && `${s.kit ?? '-'}:${s.testid ?? s.part ?? s.tag}`)));
      for (const s of seen) expect(s?.kit === tag || s?.tag === 'body', JSON.stringify(s)).toBe(true);
      await page.locator(`[data-theme="light"] .gallery ${tag} [part="${firstPart}"]`).focus();
      await page.getByTestId('light-outside').evaluate((field) => (field as HTMLInputElement).focus());
      expect((await call(page, 'active'))?.kit, 'focus() on a field behind the dialog').toBe(tag);
    });

    test(`${tag} gives focus back to its opener when it closes`, async ({ page }) => {
      const pane = page.locator('[data-theme="light"] .gallery');
      const open = async () => {
        await page.getByTestId(opener).focus();
        await page.keyboard.press('Enter');
        await expect.poll(async () => (await call(page, 'active'))?.kit).toBe(tag);
      };
      await open();
      await page.keyboard.press('Escape');
      await expect.poll(async () => (await call(page, 'active'))?.testid).toBe(opener);
      expect(await call(page, 'dialogOpen', 'light', tag)).toBe(false);
      await open();
      await pane.locator(`${tag} [part="${firstPart}"]`).click();
      await expect.poll(async () => (await call(page, 'active'))?.testid).toBe(opener);
      expect(await call(page, 'dialogOpen', 'light', tag)).toBe(false);
    });
  }

  test('Tab from af-dialog’s close button reaches the slotted field and Save, and focusing them keeps it open', async ({ page, browserName }) => {
    await page.getByTestId('light-open-dialog').click();
    await expect.poll(async () => (await call(page, 'active'))?.part).toBe('close');
    const walk = async (key: string) => {
      const reached: (string | null)[] = [];
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press(key);
        const s = await call(page, 'active');
        reached.push(s?.testid ?? s?.part ?? s?.tag ?? null);
      }
      return reached;
    };
    const byTab = await walk('Tab');
    expect(byTab, JSON.stringify(byTab)).toContain('light-dialog-field');
    // WebKit, like Safari by default, moves to buttons only with Option+Tab.
    const toButtons = await walk(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    expect(toButtons, JSON.stringify(toButtons)).toContain('light-dialog-save');
    await page.waitForTimeout(100);
    expect(await call(page, 'dialogOpen', 'light', 'af-dialog')).toBe(true);
    expect(await eventsOf(page, 'light', 'af-dialog')).toEqual([]);
  });

  test('a backdrop click closes af-dialog as an outside interaction', async ({ page }) => {
    const pane = page.locator('[data-theme="light"] .gallery');
    await page.getByTestId('light-open-dialog').click();
    await expect.poll(async () => (await call(page, 'active'))?.kit).toBe('af-dialog');
    await page.mouse.click(OUTSIDE.x, OUTSIDE.y);
    await page.waitForTimeout(100);
    await expect(pane.getByRole('dialog', { name: 'Rename project' })).toBeHidden();
    expect(await eventsOf(page, 'light', 'af-dialog')).toEqual([{ theme: 'light', tag: 'af-dialog', type: 'close', detail: { reason: 'outside' } }]);
  });

  test('a backdrop click leaves af-confirm open and emits nothing', async ({ page }) => {
    const pane = page.locator('[data-theme="light"] .gallery');
    await page.getByTestId('light-open-confirm').click();
    await expect.poll(async () => (await call(page, 'active'))?.kit).toBe('af-confirm');
    await page.mouse.click(OUTSIDE.x, OUTSIDE.y);
    await page.waitForTimeout(150);
    await expect(pane.getByRole('alertdialog', { name: 'Delete this task?' })).toBeVisible();
    expect(await eventsOf(page, 'light', 'af-confirm')).toEqual([]);
  });

  for (const [tag, opener, type, button] of [['af-dialog', 'light-open-dialog', 'close', 'close'], ['af-confirm', 'light-open-confirm', 'cancel', 'cancel']] as const) {
    test(`${tag} stays usable through refused closes while the app keeps it open`, async ({ page }) => {
      const pane = page.locator('[data-theme="light"] .gallery');
      await pane.locator(tag).evaluate((el) => el.setAttribute('data-keep-open', ''));
      await page.getByTestId(opener).click();
      await expect.poll(async () => (await call(page, 'active'))?.kit).toBe(tag);
      for (let i = 0; i < 2; i++) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
      }
      const escape = { theme: 'light', tag, type, detail: { reason: 'escape' } };
      expect(await eventsOf(page, 'light', tag)).toEqual([escape, escape]);
      expect(await call(page, 'dialogOpen', 'light', tag)).toBe(true);
      expect(await pane.locator(tag).evaluate((el) => (el as HTMLElement & { open: boolean }).open)).toBe(true);
      expect(await call(page, 'contentState', 'light', tag)).toBe('open');
      const box = (await call(page, 'partBox', 'light', tag, button))!;
      const hit = await call(page, 'hit', (box.left + box.right) / 2, (box.top + box.bottom) / 2);
      expect(hit, JSON.stringify(hit)).toMatchObject({ kit: tag, part: button });
      await page.mouse.click(OUTSIDE.x, OUTSIDE.y);
      await page.waitForTimeout(150);
      if (tag === 'af-dialog') {
        expect((await eventsOf(page, 'light', tag)).at(-1)).toEqual({ theme: 'light', tag, type, detail: { reason: 'outside' } });
        await pane.getByTestId('light-dialog-field').click();
        await expect.poll(async () => (await call(page, 'active'))?.testid).toBe('light-dialog-field');
      } else {
        expect(await eventsOf(page, 'light', tag)).toHaveLength(2);
      }
      expect(await call(page, 'contentState', 'light', tag)).toBe('open');
    });
  }

  test('a backdrop click with af-confirm over af-dialog closes neither, and Escape closes only the confirm', async ({ page }) => {
    const pane = page.locator('[data-theme="light"] .gallery');
    await page.getByTestId('light-open-dialog').click();
    await expect.poll(async () => (await call(page, 'active'))?.kit).toBe('af-dialog');
    await pane.locator('af-confirm').evaluate((el) => ((el as HTMLElement & { open: boolean }).open = true));
    await expect.poll(async () => (await call(page, 'active'))?.kit).toBe('af-confirm');
    await page.mouse.click(OUTSIDE.x, OUTSIDE.y);
    await page.waitForTimeout(150);
    expect(await eventsOf(page, 'light', 'af-dialog')).toEqual([]);
    expect(await eventsOf(page, 'light', 'af-confirm')).toEqual([]);
    expect(await call(page, 'dialogOpen', 'light', 'af-dialog')).toBe(true);
    expect(await call(page, 'dialogOpen', 'light', 'af-confirm')).toBe(true);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    expect(await eventsOf(page, 'light', 'af-confirm')).toEqual([{ theme: 'light', tag: 'af-confirm', type: 'cancel', detail: { reason: 'escape' } }]);
    expect(await eventsOf(page, 'light', 'af-dialog')).toEqual([]);
    expect(await call(page, 'dialogOpen', 'light', 'af-confirm')).toBe(false);
    expect(await call(page, 'dialogOpen', 'light', 'af-dialog')).toBe(true);
    await expect.poll(async () => (await call(page, 'active'))?.kit).toBe('af-dialog');
    await page.mouse.click(OUTSIDE.x, OUTSIDE.y);
    await page.waitForTimeout(150);
    expect(await eventsOf(page, 'light', 'af-dialog')).toEqual([{ theme: 'light', tag: 'af-dialog', type: 'close', detail: { reason: 'outside' } }]);
  });

  test('af-toast shows at the bottom end of the viewport, above the page', async ({ page }) => {
    await page.getByTestId('light-show-toast').click();
    await expect.poll(async () => (await call(page, 'layer', 'light', 'af-toast'))?.open).toBe(true);
    await expect.poll(async () => (await call(page, 'layer', 'light', 'af-toast'))?.content?.bottom ?? 0).toBeGreaterThan(0);
    await page.waitForTimeout(450);
    const toast = (await call(page, 'layer', 'light', 'af-toast'))!.content!;
    const viewport = page.viewportSize()!;
    console.log(`toast box (${test.info().project.name}):`, JSON.stringify(toast), JSON.stringify(viewport));
    expect(viewport.width - toast.right).toBeGreaterThanOrEqual(0);
    expect(viewport.width - toast.right).toBeLessThanOrEqual(32);
    expect(viewport.height - toast.bottom).toBeGreaterThanOrEqual(0);
    expect(viewport.height - toast.bottom).toBeLessThanOrEqual(32);
    const hit = await call(page, 'hit', (toast.left + toast.right) / 2, (toast.top + toast.bottom) / 2);
    expect(hit?.kit, JSON.stringify(hit)).toBe('af-toast');
  });

  test('a new toast is as tall as its content', async ({ page }) => {
    const toast = page.locator('[data-theme="light"] .gallery af-toast [part="toast"]');
    await page.getByTestId('light-show-error').click();
    await expect(toast).toHaveCount(1);
    await page.waitForTimeout(450);
    const size = await toast.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const inner = [...el.querySelectorAll('[part="text"], [part="action"], [part="close"]')].map((c) => c.getBoundingClientRect());
      return { top: box.top, bottom: box.bottom, contentTop: Math.min(...inner.map((r) => r.top)), contentBottom: Math.max(...inner.map((r) => r.bottom)) };
    });
    console.log(`newest toast box (${test.info().project.name}):`, JSON.stringify(size));
    expect(size.top, JSON.stringify(size)).toBeLessThanOrEqual(size.contentTop);
    expect(size.bottom, JSON.stringify(size)).toBeGreaterThanOrEqual(size.contentBottom);
  });

  test('af-date puts focus back where the person was', async ({ page }) => {
    const pane = page.locator('[data-theme="light"] .gallery');
    const date = pane.locator('.short-column af-date');
    const open = async () => {
      await date.locator('[part="trigger"]').click();
      await expect.poll(async () => (await call(page, 'active'))?.kit).toBe('af-date');
      await expect.poll(async () => (await call(page, 'layer', 'light', '.short-column af-date'))?.open).toBe(true);
    };
    const focused = async () => (await call(page, 'active'))?.part;

    await open();
    await date.locator('[data-part="table-cell-trigger"][data-value="2026-09-20"]').click();
    await expect.poll(focused).toBe('input');
    await expect(date.locator('[part="input"]')).toHaveValue(/^20 Sept? 2026$/);

    await open();
    await date.locator('[part="today"]').click();
    await expect.poll(focused).toBe('trigger');

    await open();
    await date.locator('[part="clear"]').click();
    await expect.poll(focused).toBe('input');
    await expect(date.locator('[part="input"]')).toHaveValue('');

    await open();
    await page.keyboard.press('Escape');
    await expect.poll(focused).toBe('trigger');
    await expect.poll(async () => (await call(page, 'layer', 'light', '.short-column af-date'))?.open).toBe(false);

    const values = (await eventsOf(page, 'light', 'af-date')).map((e) => (e.detail as { value: string | null }).value);
    expect(values.length).toBe(3);
    expect(values[0]).toBe('2026-09-20');
    expect(values[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(values[2]).toBeNull();
  });

  test('af-date shows the browser’s own short month in English and dd/mm/yyyy in Vietnamese', async ({ page }) => {
    const en = await page.locator('[data-theme="light"] .gallery af-date [part="input"]').inputValue();
    const vi = await page.locator('[data-theme="dark"] .gallery af-date [part="input"]').inputValue();
    console.log(`af-date display (${test.info().project.name}):`, JSON.stringify({ en, vi }));
    expect(en).toMatch(/^15 Sept? 2026$/);
    expect(vi).toBe('15/09/2026');
  });
});
