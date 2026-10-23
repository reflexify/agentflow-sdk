import { expect, test, type Locator, type Page } from '@playwright/test';

interface StoredTask { id: string; body: Record<string, unknown> & { section?: string; position?: number; title: string } }
interface StoredRecord { id: string; body: Record<string, unknown> & { name?: string; members?: string[]; managers?: string[]; base_status?: string } }
declare global {
  interface Window {
    /** Demo mode's handle (src/demo.tsx), typed here for the calls the specs make. */
    __projects?: {
      server: {
        fetch(request: Request): Promise<Response>;
        records(entity: 'task'): StoredTask[];
        records(entity: 'project' | 'section' | 'task_label'): StoredRecord[];
        write(entity: 'task', id: string, body: Record<string, unknown>): unknown;
        write(entity: 'project' | 'section' | 'task_label', id: string | null, body: Record<string, unknown>): unknown;
        failNext(method: string, path: RegExp, status: number, body: object): void;
      };
      actAs(id: string): void;
    };
  }
}

const person = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const LAN = person(1);
const MINH = person(2);
const HOA = person(3);
const TUAN = person(4);
const MAI = person(6);
const LAUNCH = '20000000-0000-4000-8000-000000000001';
const section = (n: number) => `30000000-0000-4000-8000-00000000000${n}`;
const task = (n: number) => `40000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const ANALYSIS = section(1);
const DESIGN = section(2);
/** "Thiết kế màn hình đăng nhập" and "Thiết kế luồng thanh toán", in Thiết kế; "Xây dựng API đăng nhập", in Phát triển. */
const LOGIN_DESIGN = task(3);
const PAYMENT_DESIGN = task(4);
const LOGIN_API = task(5);
const LOGIN_API_TITLE = 'Xây dựng API đăng nhập';
/** Wednesday 21 October 2026, 10:00 in Hanoi: the seed's dates count from here. */
const NOW = new Date('2026-10-21T03:00:00Z');

async function open(page: Page, path = '/', as?: string) {
  await page.clock.install({ time: NOW });
  await page.goto(`${path}${path.includes('?') ? '&' : '?'}demo`);
  if (as) await page.evaluate((id) => window.__projects!.actAs(id), as);
  await expect(page.locator('.projects .app')).toBeVisible();
}

/** Mounts the module again on the same in-memory AgentFlow: every read starts from what the server holds. */
const remount = (page: Page, as = MINH) => page.evaluate((id) => window.__projects!.actAs(id), as);

const stored = (page: Page, id: string) =>
  page.evaluate((t) => window.__projects!.server.records('task').find((r) => r.id === t)!.body, id);

const column = (page: Page, sectionId: string) => page.locator(`section.column[data-column="section:${sectionId}"]`);
/** The open cards of a column as the screen shows them, top to bottom, by task id: a drag moves cards by transforms. */
const cardsIn = (page: Page, sectionId: string) =>
  column(page, sectionId).locator('.column-list > li.card-slot article[data-task]').evaluateAll((els) => els
    .map((e) => ({ id: e.getAttribute('data-task'), top: e.getBoundingClientRect().top }))
    .sort((a, b) => a.top - b.top)
    .map((e) => e.id));
const cardSlot = (page: Page, title: string) => page.getByRole('group', { name: title, exact: true });

/** The seed's Phân tích holds only done tasks, which cannot be dragged: one open task moves there first. */
async function seedAnalysisCard(page: Page) {
  await page.evaluate(([t, s]) => window.__projects!.server.write('task', t!, { section: s, position: 1024 }), [LOGIN_API, ANALYSIS]);
  await expect.poll(() => cardsIn(page, ANALYSIS)).toEqual([LOGIN_API]);
}

/** Picks a card up from the keyboard, by Space on its place in the column (the `<li>` dnd-kit lifts), not on a button inside it. */
async function lift(page: Page, title: string) {
  await cardSlot(page, title).focus();
  await page.keyboard.press('Space');
  await expect(cardSlot(page, title)).toHaveAttribute('data-dragging', 'true');
  // dnd-kit starts listening for the arrows in a zero-delay timer queued at the lift: one queued now runs after it.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
}

/**
 * Runs in the page: the element under a point, inside every open shadow root on the way down; the kit elements it is
 * inside, and for each of `inside`, whether it is in an element that selector matches.
 */
const hitTest = (page: Page, box: { x: number; y: number; width: number; height: number }, inside: string[] = []) =>
  page.evaluate(([x, y, selectors]) => {
    let el: Element | null = document.elementFromPoint(x!, y!);
    while (el?.shadowRoot) {
      const inner = el.shadowRoot.elementFromPoint(x!, y!);
      if (!inner || inner === el) break;
      el = inner;
    }
    const kit: string[] = [];
    for (let n: Element | null = el; n; ) {
      if (n.localName.startsWith('af-')) kit.push(n.localName);
      const parent: Element | null = n.parentElement;
      if (parent) { n = parent; continue; }
      const root = n.getRootNode();
      n = root instanceof ShadowRoot ? root.host : null;
    }
    const within = Object.fromEntries((selectors as string[]).map((q) => [q, !!el?.closest(q)]));
    return { tag: el?.localName ?? null, part: el?.getAttribute('data-part') ?? el?.getAttribute('part') ?? null, kit, within };
  }, [box.x + box.width / 2, box.y + box.height / 2, inside] as const);

/** What has focus, inside every shadow root on the way down, and whether it is in an element `within` matches. */
const focused = (page: Page, within = ':root') => page.evaluate((q) => {
  let a: Element | null = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return {
    tag: a?.localName ?? null, className: a?.getAttribute('class') ?? null, text: a?.textContent ?? null,
    task: a?.closest('[data-task]')?.getAttribute('data-task') ?? null, within: !!a?.closest(q),
  };
}, within);

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe('My Work', () => {
  test('shows Hoa her groups, and a task opens in the drawer and closes', async ({ page }) => {
    await open(page, '/', HOA);
    for (const group of ['Overdue', 'Today', 'This week', 'After this week', 'Available to take']) {
      await expect(page.getByRole('region', { name: group, exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: 'Thiết kế màn hình đăng nhập', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' });
    await expect(drawer).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/mine/t/${LOGIN_DESIGN}\\?demo$`));
    await drawer.getByRole('button', { name: 'Close' }).click();
    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/\/\?demo$/);
  });

  test('moves focus into the drawer when it opens, and back to the card when it closes', async ({ page }) => {
    await open(page, '/', HOA);
    await page.getByRole('button', { name: 'Thiết kế màn hình đăng nhập', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' })).toBeVisible();
    // Held for a moment: focus that lands and is then taken away again is not focus in the drawer.
    await page.waitForTimeout(300);
    expect((await focused(page)).className).toBe('drawer-title');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' })).toBeHidden();
    await expect.poll(async () => focused(page)).toMatchObject({ className: 'card-title', task: LOGIN_DESIGN });
  });

  test('switches person in place: actAs mounts the module again as Hoa', async ({ page }) => {
    await open(page);
    await expect(page.locator('[data-part="project-count"]')).toHaveText('2 project tasks in progress');
    await page.evaluate((id) => window.__projects!.actAs(id), HOA);
    await expect(page.locator('[data-part="project-count"]')).toHaveText('5 project tasks in progress');
    await expect(page.locator('#persona')).toHaveValue(HOA);
    await page.locator('#persona').selectOption(MINH);
    await expect(page.locator('[data-part="project-count"]')).toHaveText('2 project tasks in progress');
  });
});

test.describe('the board', () => {
  test('shows Ra mắt ứng dụng by section, and a card dragged by pointer stays where it was dropped', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await expect(page.getByRole('list', { name: 'Kanban: Ra mắt ứng dụng' })).toBeVisible();
    await expect(page.locator('section.column .column-name')).toHaveText(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']);
    await seedAnalysisCard(page);

    const from = await box(cardSlot(page, LOGIN_API_TITLE));
    const to = await box(column(page, DESIGN).locator('.column-cards'));
    await page.mouse.move(from.x + from.width / 2, from.y + 12);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2 + 10, from.y + 16, { steps: 4 });
    await page.mouse.move(to.x + to.width / 2, to.y + to.height - 10, { steps: 12 });
    await page.mouse.up();

    await expect.poll(async () => (await stored(page, LOGIN_API)).section).toBe(DESIGN);
    await remount(page);
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual([LOGIN_DESIGN, PAYMENT_DESIGN, LOGIN_API]);
    await expect.poll(() => cardsIn(page, ANALYSIS)).toEqual([]);
  });

  test('moves a card by keyboard into a gap too tight to halve: the column is renumbered, and the screen keeps the stored order', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await page.evaluate((t) => window.__projects!.server.write('task', t, { position: 1024 + 1e-7 }), PAYMENT_DESIGN);
    await seedAnalysisCard(page);
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual([LOGIN_DESIGN, PAYMENT_DESIGN]);

    await lift(page, LOGIN_API_TITLE);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual([LOGIN_API, LOGIN_DESIGN, PAYMENT_DESIGN]);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual([LOGIN_DESIGN, LOGIN_API, PAYMENT_DESIGN]);
    await page.keyboard.press('Space');

    await expect.poll(async () => (await stored(page, LOGIN_API)).section).toBe(DESIGN);
    const positions = await page.evaluate((ids) => {
      const all = window.__projects!.server.records('task');
      return ids.map((id) => all.find((r) => r.id === id)!.body.position as number);
    }, [LOGIN_DESIGN, LOGIN_API, PAYMENT_DESIGN]);
    // Renumbered: both neighbours moved off their crowded places to whole numbers, with room around the card between.
    expect(positions.every(Number.isInteger)).toBe(true);
    expect(positions[1]! - positions[0]!).toBeGreaterThanOrEqual(1);
    expect(positions[2]! - positions[1]!).toBeGreaterThanOrEqual(1);
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual([LOGIN_DESIGN, LOGIN_API, PAYMENT_DESIGN]);

    await remount(page);
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual([LOGIN_DESIGN, LOGIN_API, PAYMENT_DESIGN]);
    const storedOrder = await page.evaluate((s) => window.__projects!.server.records('task')
      .filter((r) => r.body.section === s && r.body.status !== 'done' && r.body.status !== 'cancelled')
      .sort((a, b) => (a.body.position as number) - (b.body.position as number))
      .map((r) => r.id), DESIGN);
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual(storedOrder);
  });

  test('a keyboard drop the server refuses puts the card back and says why', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await seedAnalysisCard(page);
    const reason = 'The section belongs to another project';
    await page.evaluate((message) => window.__projects!.server.failNext('PATCH', /records/, 422, {
      type: 'VALIDATION_ERROR', title: 'Invalid', status: 422, request_id: 'memory',
      field_errors: [{ field: 'section', code: 'ENTITY_VALIDATION_RULE_FAILED', message }],
    }), reason);

    await lift(page, LOGIN_API_TITLE);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => cardsIn(page, DESIGN)).toContain(LOGIN_API);
    await page.keyboard.press('Space');

    // The toast as shown, not the copy the kit keeps in its live region for screen readers.
    await expect(page.locator('af-toast [part="text"]', { hasText: reason })).toBeVisible();
    await expect.poll(() => cardsIn(page, ANALYSIS)).toEqual([LOGIN_API]);
    await expect.poll(() => cardsIn(page, DESIGN)).toEqual([LOGIN_DESIGN, PAYMENT_DESIGN]);
    expect((await stored(page, LOGIN_API)).section).toBe(ANALYSIS);
  });

  test('Escape during a keyboard drag cancels the drag and leaves the open drawer open', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await seedAnalysisCard(page);
    await page.getByRole('button', { name: 'Thiết kế màn hình đăng nhập', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' });
    await expect(drawer).toBeVisible();

    await lift(page, LOGIN_API_TITLE);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => cardsIn(page, DESIGN)).toContain(LOGIN_API);
    await page.keyboard.press('Escape');

    await expect(cardSlot(page, LOGIN_API_TITLE)).not.toHaveAttribute('data-dragging', 'true');
    await expect.poll(() => cardsIn(page, ANALYSIS)).toEqual([LOGIN_API]);
    expect((await stored(page, LOGIN_API)).section).toBe(ANALYSIS);
    await expect(drawer).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/t/${LOGIN_DESIGN}`));
  });

  test('a section\'s menu opens over the column, unclipped, in the top layer', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await column(page, ANALYSIS).locator('af-menu [part="trigger"]').click();
    const item = column(page, ANALYSIS).locator('af-menu [part="item"]').last();
    await expect(item).toBeVisible();
    await expect(item).toBeInViewport({ ratio: 1 });
    // What a click on the last item meets is the item, not the board or the column it opened from.
    expect((await hitTest(page, await box(item))).kit).toContain('af-menu');
    await page.keyboard.press('Escape');
    await expect(item).toBeHidden();
  });

  test('switches to the list and back to the board, the address following both ways', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await page.getByRole('tab', { name: 'List' }).click();
    await expect(page).toHaveURL(new RegExp(`/p/${LAUNCH}\\?view=list&demo$`));
    await expect(page.locator('table').first()).toBeVisible();
    await page.getByRole('tab', { name: 'Board' }).click();
    await expect(page).toHaveURL(new RegExp(`/p/${LAUNCH}\\?demo$`));
    await expect(page.getByRole('list', { name: 'Kanban: Ra mắt ứng dụng' })).toBeVisible();
    await expect(page.locator('table')).toHaveCount(0);
  });
});

test.describe('quick create', () => {
  test('opens as a modal in the top layer, over the board', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await page.getByRole('button', { name: 'Create task' }).click();
    const dialog = page.getByRole('dialog', { name: 'New task' });
    await expect(dialog).toBeVisible();
    expect(await page.locator('af-dialog dialog[open]').evaluate((d) => d.matches(':modal'))).toBe(true);
    // Slotted into the dialog, so in the module's tree rather than under the dialog's own content.
    const submit = page.locator('button.qc-submit');
    await expect(submit).toHaveAccessibleName('Create');
    const hit = await hitTest(page, await box(submit), ['button.qc-submit', '.board']);
    expect(hit.within).toEqual({ 'button.qc-submit': true, '.board': false });
    expect(hit.kit).toContain('af-dialog');
  });
});

test.describe('the drawer', () => {
  const opened = async (page: Page) => {
    const drawer = page.getByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' });
    await expect(drawer).toBeVisible();
    // Measured once it has slid in.
    await drawer.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
    return drawer;
  };
  const layout = (page: Page) => page.evaluate(() => {
    const root = document.getElementById('root')!.shadowRoot!;
    const rect = (s: string) => {
      const r = root.querySelector(s)!.getBoundingClientRect();
      return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width };
    };
    return {
      position: getComputedStyle(root.querySelector('.drawer')!).position,
      module: rect('.projects'), header: rect('.header'), screen: rect('main.screen'), drawer: rect('.drawer'),
    };
  });

  test.describe('mentions', () => {
    test.use({ locale: 'vi-VN' });

    test('typing @ in a task description and picking a teammate saves a chip', async ({ page }) => {
      await open(page, `/mine/t/${LOGIN_DESIGN}`, HOA);
      const drawer = await opened(page);
      const box = drawer.locator('[data-field="description"] [contenteditable="true"]');
      await box.click();
      await page.keyboard.press('Control+End');
      await page.keyboard.type(' Nhờ @mai');
      const option = page.locator('[part="mention-option"]', { hasText: 'Vũ Thị Mai' });
      await expect(option).toBeVisible();
      await expect(option).toContainText('Sẽ nhận thông báo');
      await page.keyboard.press('Enter');
      await expect(drawer.locator('.af-mention', { hasText: 'Vũ Thị Mai' })).toBeVisible();
      await expect.poll(async () => String((await stored(page, LOGIN_DESIGN)).description)).toContain(`@[Vũ Thị Mai](mention:user/${MAI})`);
    });

    test('draws a restricted mention without its title, and a deleted one struck through', async ({ page }) => {
      const HANDOVER = 'Chuẩn bị tài liệu bàn giao';
      await open(page, `/mine/t/${task(7)}`, MINH);
      const asMinh = page.getByRole('dialog', { name: HANDOVER });
      await expect(asMinh.locator('.af-mention')).toHaveCount(4);
      await expect(asMinh.locator('.af-mention[data-state="deleted"]')).toHaveCount(1);
      await expect(asMinh.locator('.af-mention[data-state="restricted"]')).toHaveCount(0);

      await open(page, `/mine/t/${task(7)}`, HOA);
      const asHoa = page.getByRole('dialog', { name: HANDOVER });
      const restricted = asHoa.locator('.af-mention[data-state="restricted"]');
      await expect(restricted).toHaveCount(1);
      await expect(restricted).not.toContainText('Khảo sát kệ kho mới');
      await expect(asHoa).not.toContainText('Khảo sát kệ kho mới');
    });
  });

  test('pushes the screen aside at 1200px and wider, and stays put while the screen scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 560 });
    await open(page, `/mine/t/${LOGIN_DESIGN}`, HOA);
    const drawer = await opened(page);
    const l = await layout(page);
    expect(l.position).not.toBe('absolute');
    expect(l.screen.right).toBeLessThanOrEqual(l.drawer.left + 1);
    expect(l.drawer.right).toBeCloseTo(l.module.right, 0);
    expect(l.drawer.top).toBeGreaterThanOrEqual(l.header.bottom - 1);

    const scrolled = await page.locator('main.screen').evaluate((el) => { el.scrollTop = 400; return el.scrollTop; });
    expect(scrolled, 'My Work is long enough to scroll here').toBeGreaterThan(0);
    const after = await layout(page);
    expect(after.drawer).toEqual(l.drawer);
    expect(after.header).toEqual(l.header);
    await expect(drawer).toBeInViewport();
  });

  test('overlays the screen from 720px to 1199px, under the header, and stays put while the screen scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 560 });
    await open(page, `/mine/t/${LOGIN_DESIGN}`, HOA);
    const drawer = await opened(page);
    const before = await layout(page);
    expect(before.position).toBe('absolute');
    expect(before.screen.width).toBeCloseTo(before.module.width, 0);
    expect(before.drawer.width).toBeLessThan(before.module.width);
    expect(before.drawer.right).toBeCloseTo(before.module.right, 0);
    expect(before.drawer.top, 'the header stays uncovered').toBeGreaterThanOrEqual(before.header.bottom - 1);
    // Above the drawer's own column, the header is what a click meets.
    const above = await hitTest(page, { x: before.drawer.left + 8, y: before.header.top + 8, width: 0, height: 0 }, ['.header', '.drawer']);
    expect(above.within).toEqual({ '.header': true, '.drawer': false });

    const scrolled = await page.locator('main.screen').evaluate((el) => { el.scrollTop = 400; return el.scrollTop; });
    expect(scrolled, 'My Work is long enough to scroll here').toBeGreaterThan(0);
    const after = await layout(page);
    expect(after.drawer).toEqual(before.drawer);
    expect(after.header).toEqual(before.header);
    await expect(drawer).toBeInViewport();
  });

  test('takes the full width below 720px', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await open(page, `/mine/t/${LOGIN_DESIGN}`, HOA);
    await opened(page);
    const l = await layout(page);
    expect(l.drawer.width).toBeCloseTo(l.module.width, 0);
    expect(l.drawer.top).toBeGreaterThanOrEqual(l.header.bottom - 1);
  });

  test('opens its date picker in the top layer, unclipped, with focus inside', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 640 });
    await open(page, `/p/${LAUNCH}/t/${LOGIN_DESIGN}`);
    const drawer = await opened(page);
    await drawer.locator('af-date [part="trigger"]').click();
    const day = drawer.locator('af-date [data-scope="date-picker"][data-part="table-cell-trigger"]').filter({ visible: true }).last();
    await expect(day).toBeVisible();
    expect((await hitTest(page, await box(day))).kit).toContain('af-date');
    await expect.poll(async () => (await focused(page, '[data-scope="date-picker"][data-part="content"]')).within).toBe(true);
    await page.keyboard.press('Escape');
    await expect(day).toBeHidden();
    await expect(drawer, 'Escape closes the picker, not the drawer').toBeVisible();
  });

  test('opens its person picker in the top layer, unclipped', async ({ page }) => {
    await open(page, `/p/${LAUNCH}/t/${LOGIN_DESIGN}`);
    const drawer = await opened(page);
    const picker = drawer.locator('af-person-picker').last();
    // Two shadow roots deep, WebKit's actionability check refuses a click on the input: focus it instead.
    await picker.locator('[part="input"]').focus();
    await page.keyboard.press('ArrowDown');
    const option = picker.locator('[part="option"]').first();
    await expect(option).toBeVisible();
    expect((await hitTest(page, await box(option))).kit).toContain('af-person-picker');
    await page.keyboard.press('Escape');
    await expect(option).toBeHidden();
    await expect(drawer).toBeVisible();
  });
});

test.describe('tooltips', () => {
  test('a card title\'s tooltip shows on the first hover, though it mounts only then', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    const slot = page.locator(`[data-task="${LOGIN_DESIGN}"] .card-tip`);
    await expect(slot.locator('af-tooltip')).toHaveCount(0);
    const title = page.locator(`[data-task="${LOGIN_DESIGN}"] [data-part="title"]`);
    const b = await box(title);
    // One move, the first the title hears: it mounts the tooltip, and the same move opens it.
    await page.mouse.move(b.x + 20, b.y + b.height / 2);
    const tip = page.locator(`[data-task="${LOGIN_DESIGN}"] af-tooltip [data-scope="tooltip"][data-part="content"]`);
    await expect(tip).toBeVisible();
    await expect(tip).toHaveText('Thiết kế màn hình đăng nhập');
    expect((await hitTest(page, await box(tip))).kit).toContain('af-tooltip');
  });
});

test.describe('the look', () => {
  test('follows the dark colour scheme: the root takes the dark background token', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page);
    await expect(page.locator('#root')).toHaveAttribute('data-theme', 'dark');
    const [background, token] = await page.locator('.projects').evaluate((el) => {
      const probe = document.createElement('div');
      probe.style.background = getComputedStyle(document.getElementById('root')!).getPropertyValue('--af-bg');
      document.body.append(probe);
      const want = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [getComputedStyle(el).backgroundColor, want];
    });
    expect(background).toBe(token);
  });

  test('in dark mode, cards, columns and tags keep visible surface steps and legible text', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page, `/p/${LAUNCH}`);
    await expect(page.locator(`[data-task="${LOGIN_DESIGN}"]`)).toBeVisible();
    const m = await page.evaluate((card) => {
      const root = document.getElementById('root')!.shadowRoot!;
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
      const rgb = (c: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = c;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };
      const lum = (c: string) => {
        const [r, g, b] = rgb(c).map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
      };
      const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05); };
      const style = (s: string) => getComputedStyle(root.querySelector(s)!);
      const bg = style('.projects').backgroundColor;
      const col = style('section.column').backgroundColor;
      const cardStyle = style(`article[data-task="${card}"]`);
      const tag = style(`article[data-task="${card}"] .tag`);
      const pill = style(`article[data-task="${card}"] .pill`);
      const title = style(`article[data-task="${card}"] [data-part="title"]`);
      return {
        lum: { page: lum(bg), column: lum(col), card: lum(cardStyle.backgroundColor) },
        border: contrast(cardStyle.borderTopColor, cardStyle.backgroundColor),
        title: contrast(title.color, cardStyle.backgroundColor),
        tag: contrast(tag.color, tag.backgroundColor),
        tagOnCard: contrast(tag.backgroundColor, cardStyle.backgroundColor),
        pill: contrast(pill.color, pill.backgroundColor),
      };
    }, LOGIN_DESIGN);
    await test.info().attach('dark look', { body: JSON.stringify(m, null, 2), contentType: 'application/json' });
    // Each raised surface is lighter than the one it sits on.
    expect(m.lum.column).toBeGreaterThan(m.lum.page);
    expect(m.lum.card).toBeGreaterThan(m.lum.column);
    expect(m.border, 'the card keeps a border against its own fill').toBeGreaterThan(1.1);
    expect(m.title).toBeGreaterThanOrEqual(4.5);
    expect(m.tag).toBeGreaterThanOrEqual(4.5);
    expect(m.pill).toBeGreaterThanOrEqual(4.5);
    expect(m.tagOnCard, 'a tag stands off the card').toBeGreaterThan(1.05);
  });

  for (const [name, path, ready] of [['My Work', '/', '.work-group'], ['the board', `/p/${LAUNCH}`, 'section.column']] as const) {
    test(`never scrolls sideways at phone width, on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 860 });
      await open(page, path);
      await expect(page.locator(ready).first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      for (const selector of ['.projects', 'main.screen', '.header']) {
        const over = await page.locator(selector).evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(over, selector).toBeLessThanOrEqual(0);
      }
      const whole = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(whole).toBeLessThanOrEqual(0);
    });
  }

  test.describe('in Vietnamese', () => {
    test.use({ locale: 'vi-VN' });
    test('speaks the browser\'s language, the page\'s own picker included', async ({ page }) => {
      await open(page, '/', HOA);
      await expect(page.locator('#persona-label')).toHaveText('Đang xem với vai');
      await expect(page.locator('[data-part="project-count"]')).toHaveText('5 việc dự án đang làm');
      for (const group of ['Quá hạn', 'Hôm nay', 'Có thể nhận']) await expect(page.getByRole('region', { name: group, exact: true })).toBeVisible();
    });
  });

  test('says the site is not set up when it has no ?demo and no configuration', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('This site is not set up yet', { exact: true })).toBeVisible();
    await expect(page.getByText('Ask an administrator to add its configuration.', { exact: true })).toBeVisible();
    await expect(page.locator('#demo-bar')).toBeHidden();
  });
});

/**
 * Presses Tab until `done` says focus is where it should be; fails loudly instead of cycling for ever. WebKit on macOS
 * leaves buttons out of Tab unless Option is held, as Safari does by default.
 */
async function tabTo(page: Page, done: (f: Awaited<ReturnType<typeof focused>>) => boolean, max = 40) {
  const key = page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press(key);
    if (done(await focused(page))) return;
  }
  throw new Error(`Tab did not reach the control within ${max} presses`);
}

/** The bar's own link to a screen, outside the module. */
const barLink = (page: Page, name: string) => page.locator('#demo-bar').getByRole('link', { name, exact: true });

test.describe('managing projects', () => {
  test.use({ locale: 'vi-VN' });

  test('the demo bar reaches the project list and My Work, and follows the module', async ({ page }) => {
    await open(page, '/', MAI);
    await expect(barLink(page, 'Việc của tôi')).toHaveAttribute('aria-current', 'page');
    await barLink(page, 'Dự án').click();
    await expect(page).toHaveURL(/\/projects\?demo$/);
    await expect(page.locator('.project-grid')).toBeVisible();
    await expect(barLink(page, 'Dự án')).toHaveAttribute('aria-current', 'page');
    await expect(barLink(page, 'Việc của tôi')).not.toHaveAttribute('aria-current', 'page');
    await page.locator('.project-card .project-name').first().click();
    await expect(page).toHaveURL(/\/p\/[0-9a-f-]+\?demo$/);
    await expect(barLink(page, 'Dự án')).toHaveAttribute('aria-current', 'page');
    await page.goBack();
    await page.goBack();
    await expect(barLink(page, 'Việc của tôi')).toHaveAttribute('aria-current', 'page');
  });

  test('the module crosses from My Work to a project by a task\'s project link, and the bar follows', async ({ page }) => {
    await open(page, '/', HOA);
    await expect(barLink(page, 'Việc của tôi')).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: 'Thiết kế màn hình đăng nhập', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' });
    await expect(drawer).toBeVisible();
    await expect(barLink(page, 'Việc của tôi')).toHaveAttribute('aria-current', 'page');
    await drawer.getByRole('link', { name: 'Ra mắt ứng dụng', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/p/${LAUNCH}\\?demo$`));
    await expect(barLink(page, 'Dự án')).toHaveAttribute('aria-current', 'page');
    await expect(barLink(page, 'Việc của tôi')).not.toHaveAttribute('aria-current', 'page');
  });

  test('Mai creates a software project and renames Kiểm thử: the board shows its five sections', async ({ page }) => {
    await open(page, '/', MAI);
    await barLink(page, 'Dự án').click();
    await page.getByRole('button', { name: 'Tạo project', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Tạo project mới' });
    await expect(dialog).toBeVisible();
    const form = page.locator('.create-project-modal');
    await form.getByRole('textbox', { name: 'Tên project' }).fill('Cổng khách hàng');
    await form.getByRole('radio', { name: 'Dự án phần mềm' }).click();
    const test4 = form.getByRole('textbox', { name: 'Tên hạng mục 4' });
    await expect(test4).toHaveValue('Kiểm thử');
    await test4.fill('QA');
    await form.locator('button.qc-submit').click();
    await expect(page).toHaveURL(/\/p\/[0-9a-f-]+\?demo$/);
    await expect(page.locator('.crumb-current')).toHaveText('Cổng khách hàng');
    const columns = page.locator('section.column');
    await expect(columns).toHaveCount(5);
    // A column is named with its count: "QA · 0/0".
    for (const name of ['Phân tích', 'Thiết kế', 'Phát triển', 'QA', 'Triển khai']) {
      await expect(page.getByRole('region', { name: new RegExp(`^${name} · `) })).toBeVisible();
    }
    await expect(page.getByRole('region', { name: /^Kiểm thử · / })).toHaveCount(0);
    const stored = await page.evaluate(() => window.__projects!.server.records('project').find((r) => r.body.name === 'Cổng khách hàng')!.body);
    expect(stored.managers).toEqual([MAI]);
  });

  test('Minh edits the default grouping, then closes the project and sees Mở lại', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await expect(column(page, ANALYSIS)).toBeVisible();
    await page.getByRole('button', { name: 'Thao tác project', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Chỉnh sửa project', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Chỉnh sửa project' });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('combobox', { name: 'Nhóm mặc định' }).selectOption({ label: 'Trạng thái' });
    await expect.poll(() => page.evaluate((id) => window.__projects!.server.records('project').find((r) => r.id === id)!.body.default_group_by, LAUNCH)).toBe('status');
    await drawer.getByRole('button', { name: 'Đóng', exact: true }).click();
    await expect(drawer).toBeHidden();
    await expect(page.locator('section.column[data-column="status:todo"]')).toBeVisible();
    await expect(page.locator('section.column[data-column^="section:"]')).toHaveCount(0);

    await page.getByRole('button', { name: 'Thao tác project', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Đóng project', exact: true }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Đóng project' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Đóng project', exact: true }).click();
    await expect(confirm).toBeHidden();
    const banner = page.getByRole('status').filter({ hasText: 'Project đã đóng, chỉ đọc' });
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Mở lại', exact: true })).toBeVisible();
  });

  test('Minh adds Tuấn on the Thành viên tab, and the project holds him', async ({ page }) => {
    await open(page, `/p/${LAUNCH}`);
    await page.getByRole('tab', { name: 'Thành viên', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/p/${LAUNCH}/members\\?demo$`));
    await page.getByRole('button', { name: 'Thêm thành viên', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Thêm thành viên' });
    await expect(dialog).toBeVisible();
    // The dialog's content is slotted into it, so it is in the module's tree and not under the dialog.
    const picker = page.locator('af-person-picker');
    await picker.locator('[part="input"]').focus();
    await page.keyboard.type('Tuấn');
    await picker.locator('[part="option"]').filter({ hasText: 'Phạm Minh Tuấn' }).click();
    const add = page.getByRole('button', { name: 'Thêm', exact: true });
    await expect(add).not.toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await add.click();
    await expect(dialog).toBeHidden();
    const row = page.locator(`section.member-group[data-group="members"] li[data-person="${TUAN}"]`);
    await expect(row).toBeVisible();
    await expect(row).toContainText('Phạm Minh Tuấn');
    const members = await page.evaluate((id) => window.__projects!.server.records('project').find((r) => r.id === id)!.body.members, LAUNCH);
    expect(members).toContain(TUAN);
  });

  test('Lan adds the label Chờ phản hồi under Đang làm', async ({ page }) => {
    await open(page, '/', LAN);
    await barLink(page, 'Dự án').click();
    await page.getByRole('button', { name: 'Nhãn trạng thái', exact: true }).click();
    await expect(page).toHaveURL(/\/settings\/labels\?demo$/);
    const doing = page.locator('section.label-group[data-group="doing"]');
    await expect(doing).toBeVisible();
    await doing.getByRole('button', { name: 'Thêm nhãn', exact: true }).click();
    await page.getByRole('textbox', { name: 'Tên nhãn mới' }).fill('Chờ phản hồi');
    await page.keyboard.press('Enter');
    await expect(doing.getByRole('button', { name: 'Đổi tên Chờ phản hồi' })).toBeVisible();
    const added = await page.evaluate(() => window.__projects!.server.records('task_label').find((r) => r.body.name === 'Chờ phản hồi')?.body);
    expect(added?.base_status).toBe('doing');
  });

  test('Mai creates a project with the keyboard alone: Tab, the arrow keys, Enter', async ({ page }) => {
    await open(page, '/', MAI);
    await barLink(page, 'Dự án').click();
    const trigger = page.getByRole('button', { name: 'Tạo project', exact: true });
    await tabTo(page, (f) => (f.className ?? '').includes('create-project'));
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Tạo project mới' });
    await expect(dialog).toBeVisible();
    await expect.poll(async () => (await focused(page)).tag).toBe('input');
    await page.keyboard.type('Làm bằng bàn phím');
    await tabTo(page, (f) => f.tag === 'button' && f.className === 'cp-template');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.create-project-modal').getByRole('radio', { name: 'Dự án phần mềm' })).toBeChecked();
    await tabTo(page, (f) => (f.className ?? '').includes('qc-submit'));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/p\/[0-9a-f-]+\?demo$/);
    await expect(page.locator('section.column')).toHaveCount(5);
  });

  test('Escape closes the create modal, and focus returns to Tạo project', async ({ page }) => {
    await open(page, '/', MAI);
    await barLink(page, 'Dự án').click();
    const trigger = page.getByRole('button', { name: 'Tạo project', exact: true });
    await tabTo(page, (f) => (f.className ?? '').includes('create-project'));
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Tạo project mới' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect.poll(async () => (await focused(page)).tag).toBe('input');
    await page.keyboard.type('Nửa chừng');
    await page.keyboard.press('Escape');
    const discard = page.getByRole('alertdialog', { name: 'Bỏ những gì bạn đã nhập?' });
    await expect(discard).toBeVisible();
    await tabTo(page, (f) => f.text?.trim() === 'Bỏ');
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test.describe('at 400px wide', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 860 });
    });
    /**
     * Nothing scrolls sideways: not the module's own scrollers, not the page, and nothing inside `inner` reaches past
     * the right edge of the box it is in. (A visually hidden 1px label sits on that edge by design, so it does not count.)
     */
    const noSideScroll = async (page: Page, inner: string[]) => {
      await page.evaluate(() => document.fonts.ready);
      for (const selector of ['.projects', 'main.screen', '.header']) {
        const over = await page.locator(selector).first().evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(over, selector).toBeLessThanOrEqual(0);
      }
      for (const selector of inner) {
        for (const box of await page.locator(selector).all()) {
          const spilled = await box.evaluate((el) => {
            const edge = el.getBoundingClientRect().right + 0.5;
            return [...el.querySelectorAll('*')]
              .filter((x) => !x.closest('.sr-only') && x.getBoundingClientRect().width > 0 && x.getBoundingClientRect().right > edge)
              .map((x) => `${x.localName}.${x.getAttribute('class') ?? ''}`);
          });
          expect(spilled, `inside ${selector}`).toEqual([]);
        }
      }
      const whole = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(whole, 'the page').toBeLessThanOrEqual(0);
    };

    test('the create modal does not scroll sideways', async ({ page }) => {
      await open(page, '/', MAI);
      await barLink(page, 'Dự án').click();
      await page.getByRole('button', { name: 'Tạo project', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Tạo project mới' });
      await expect(dialog).toBeVisible();
      const form = page.locator('.create-project-modal');
      await form.getByRole('radio', { name: 'Dự án phần mềm' }).click();
      await expect(form.getByRole('textbox', { name: 'Tên hạng mục 5' })).toBeVisible();
      await noSideScroll(page, ['.cp-form', '.sections-editor']);
      const inside = await dialog.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, width: window.innerWidth };
      });
      expect(inside.left).toBeGreaterThanOrEqual(0);
      expect(inside.right).toBeLessThanOrEqual(inside.width);
    });

    test('the Members tab does not scroll sideways', async ({ page }) => {
      await open(page, `/p/${LAUNCH}/members`);
      await expect(page.locator('section.member-group').first()).toBeVisible();
      await noSideScroll(page, ['section.member-group']);
    });

    test('the label settings do not scroll sideways', async ({ page }) => {
      await open(page, '/settings/labels', LAN);
      await expect(page.locator('section.label-group').first()).toBeVisible();
      await noSideScroll(page, ['section.label-group']);
    });

    test('a confirm fits inside the window, its buttons included', async ({ page }) => {
      await open(page, '/settings/labels', LAN);
      await page.getByRole('button', { name: 'Xoá Ưu tiên tuần' }).click();
      const confirm = page.getByRole('alertdialog', { name: 'Xoá nhãn "Ưu tiên tuần"?' });
      await expect(confirm).toBeVisible();
      for (const target of [confirm, confirm.getByRole('button', { name: 'Xoá', exact: true })]) {
        const b = await box(target);
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(400);
      }
    });

    test('the header keeps Tạo task in view on a closed project with a long name', async ({ page }) => {
      await open(page, `/p/${LAUNCH}`);
      await page.evaluate((id) => window.__projects!.server.write('project', id, {
        name: 'Ra mắt ứng dụng di động cho Khối Kinh doanh miền Nam và đối tác', status: 'closed',
      }), LAUNCH);
      await remount(page);
      await expect(page.getByRole('button', { name: 'Mở lại', exact: true })).toBeVisible();
      await noSideScroll(page, ['.header', '.banners']);
      for (const name of ['Tạo task', 'Thao tác project', 'Dự án']) {
        const b = await box(page.locator('.header').getByRole('button', { name, exact: true }));
        expect(b.x + b.width, name).toBeLessThanOrEqual(400);
      }
    });
  });
});

const SCREENS = 'e2e/screens';

test.describe('screenshots for the design pass @screens', () => {
  test.use({ locale: 'vi-VN' });
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1280, 800]) {
      test(`every main screen, ${theme}, ${width}px`, async ({ page }) => {
        test.setTimeout(90_000);
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        const shot = async (name: string) => {
          await page.evaluate(() => document.fonts.ready);
          await page.mouse.move(0, 0);
          await page.waitForTimeout(400);
          await page.screenshot({ path: `${SCREENS}/${name}-${theme}-${width}.png`, animations: 'disabled' });
        };
        await open(page, '/', HOA);
        await expect(page.locator('[data-part="project-count"]')).toBeVisible();
        await shot('my-work');
        await page.goto('/projects?demo');
        await expect(page.locator('.project-card').first()).toBeVisible();
        await shot('project-list');
        await page.goto(`/p/${LAUNCH}?view=list&demo`);
        await expect(page.locator('table').first()).toBeVisible();
        await shot('tasks-list');
        await page.goto(`/p/${LAUNCH}?demo`);
        await expect(page.locator(`[data-task="${LOGIN_DESIGN}"]`)).toBeVisible();
        await shot('board');
        await page.getByRole('button', { name: 'Thiết kế màn hình đăng nhập', exact: true }).click();
        await expect(page.getByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' })).toBeVisible();
        await shot('drawer');
        await page.goto(`/p/${LAUNCH}?demo`);
        await page.getByRole('button', { name: 'Tạo task' }).click();
        await expect(page.getByRole('dialog', { name: 'Tạo task' })).toBeVisible();
        await shot('quick-create');
      });
    }
  }
});

const LONG_NAME = 'Nguyễn Thị Phương Thảo — Khối Kinh doanh miền Nam';
const LONG_PERSON = person(7);
const LONG_UNIT = '00000000-0000-4000-8000-000000000409';
const Q3 = '20000000-0000-4000-8000-000000000003';
const SECTION_ENTITY = '00000000-0000-4000-8000-000000000102';

/**
 * Mounts the module again as `as`, with a person and a unit of long Vietnamese names in the organisation's lists. The
 * in-memory AgentFlow answers the next read of each list with its own rows plus the long one.
 */
async function withLongNames(page: Page, as: string) {
  await page.evaluate(async ([who, unit, name]) => {
    const server = window.__projects!.server;
    const read = async (path: string) =>
      (await (await server.fetch(new Request(`http://projects.memory/agentflow/api${path}`))).json()) as { items: Record<string, unknown>[] };
    const [users, units] = await Promise.all([read('/users?limit=200'), read('/units?limit=200')]);
    const listed = (items: Record<string, unknown>[]) => ({ items, next_cursor: null, prev_cursor: null });
    const stamp = '2026-01-01T00:00:00Z';
    // Twice each: the dev build mounts in React's strict mode, which reads every list twice.
    for (let i = 0; i < 2; i += 1) {
      server.failNext('GET', /^\/users$/, 200, listed([...users.items, { id: who, display_name: name, email: 'phuong.thao.nguyen.kinhdoanh.miennam@example.com', is_active: true }]));
      server.failNext('GET', /^\/units$/, 200, listed([...units.items, {
        id: unit, name, code: 'KDMN', parent_id: null, depth: 0, ancestor_names: [], archived: false, archived_at: null, created_at: stamp, updated_at: stamp,
      }]));
    }
  }, [LONG_PERSON, LONG_UNIT, LONG_NAME] as const);
  await remount(page, as);
  await expect(page.locator('.projects .app')).toBeVisible();
}

test.describe('screenshots of managing projects @screens', () => {
  test.use({ locale: 'vi-VN' });
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1280, 400]) {
      test(`every project-management screen, ${theme}, ${width}px`, async ({ page }) => {
        test.setTimeout(180_000);
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        const shot = async (name: string) => {
          await page.evaluate(() => document.fonts.ready);
          await page.mouse.move(0, 0);
          await page.waitForTimeout(400);
          await page.screenshot({ path: `${SCREENS}/${name}-${theme}-${width}.png`, animations: 'disabled' });
        };
        const go = async (path: string, as: string) => {
          await page.goto(`${path}${path.includes('?') ? '&' : '?'}demo`);
          await expect(page.locator('.projects .app')).toBeVisible();
          await withLongNames(page, as);
        };
        await page.clock.install({ time: NOW });

        // The project list with both of its buttons, as Lan, who may manage labels and create projects.
        await go('/projects', LAN);
        await expect(page.locator('.project-actions .create-project')).toBeVisible();
        await shot('project-list-admin');

        // The empty list, as Khoa, who is in no project, made a project creator for the shot.
        await page.evaluate(async ([who, group]) => {
          const server = window.__projects!.server;
          const path = `/groups/${group}`;
          const body = await (await server.fetch(new Request(`http://projects.memory/agentflow/api${path}`))).json() as { members: unknown[] };
          const members = [...body.members, { id: who, display_name: 'Đỗ Đăng Khoa', email: 'khoa@example.com', added_at: '2026-01-01T00:00:00Z' }];
          for (let i = 0; i < 2; i += 1) server.failNext('GET', new RegExp(`^${path}$`), 200, { ...body, members, member_count: members.length });
        }, [person(5), person(202)] as const);
        await remount(page, person(5));
        await expect(page.locator('.state .create-project, .state button.af-button.primary').first()).toBeVisible();
        await shot('project-list-empty');

        // Tạo project: the software template, one section named like a status, and a long unit.
        await go('/projects', MAI);
        await page.getByRole('button', { name: 'Tạo project', exact: true }).click();
        const form = page.locator('.create-project-modal');
        await expect(page.getByRole('dialog', { name: 'Tạo project mới' })).toBeVisible();
        await form.getByRole('textbox', { name: 'Tên project' }).fill('Cổng khách hàng cho Khối Kinh doanh miền Nam');
        await form.getByRole('radio', { name: 'Dự án phần mềm' }).click();
        await form.getByRole('textbox', { name: 'Tên hạng mục 4' }).fill('Hoàn thành');
        await expect(form.locator('.se-note[data-tone="info"]')).toBeVisible();
        await form.locator('select').first().selectOption(LONG_UNIT);
        await form.getByRole('textbox', { name: 'Tên project' }).focus();
        await shot('create-project');
        await form.locator('.se-note[data-tone="info"]').scrollIntoViewIfNeeded();
        await shot('create-project-sections');

        // The project exists but its sections were refused: the modal names them and offers Thử lại.
        await page.evaluate((entity) => window.__projects!.server.failNext('POST', new RegExp(`/entities/${entity}/records$`), 422, {
          type: 'VALIDATION_ERROR', title: 'Validation failed', status: 422, detail: 'Hạng mục này tạm thời không lưu được',
        }), SECTION_ENTITY);
        await form.locator('button.qc-submit').click();
        await expect(form.locator('.cp-unsaved')).toBeVisible();
        await shot('create-project-unsaved');

        // The project page's header, its menu open, then the edit drawer, the project in the long-named unit.
        await go(`/p/${LAUNCH}`, MINH);
        await page.evaluate(([id, unit]) => window.__projects!.server.write('project', id, { unit }), [LAUNCH, LONG_UNIT] as const);
        await withLongNames(page, MINH);
        await expect(column(page, ANALYSIS)).toBeVisible();
        await shot('project-header');
        await page.getByRole('button', { name: 'Thao tác project', exact: true }).click();
        await expect(page.getByRole('menuitem', { name: 'Chỉnh sửa project', exact: true })).toBeVisible();
        await shot('project-menu');
        await page.getByRole('menuitem', { name: 'Chỉnh sửa project', exact: true }).click();
        await expect(page.getByRole('dialog', { name: 'Chỉnh sửa project' })).toBeVisible();
        await shot('project-edit');

        // A long project name in the header.
        await page.keyboard.press('Escape');
        await page.evaluate((id) => window.__projects!.server.write('project', id, { name: 'Ra mắt ứng dụng di động cho Khối Kinh doanh miền Nam và đối tác' }), LAUNCH);
        await remount(page, MINH);
        await expect(column(page, ANALYSIS)).toBeVisible();
        await shot('project-header-long');

        // The Members tab as Minh, a manager, with the long-named member's menu open; then as Hoa, a member.
        await go(`/p/${LAUNCH}/members`, MINH);
        await page.evaluate(([id, members]) => window.__projects!.server.write('project', id, { members }), [LAUNCH, [HOA, MAI, LONG_PERSON]] as const);
        const row = page.locator(`li[data-person="${LONG_PERSON}"]`);
        await expect(row).toBeVisible();
        await row.locator('af-menu [part="trigger"]').click();
        await expect(row.locator('af-menu [part="item"]').first()).toBeVisible();
        await shot('members-manager');
        await page.keyboard.press('Escape');
        await withLongNames(page, HOA);
        await expect(page.locator(`li[data-person="${LONG_PERSON}"]`)).toBeVisible();
        await shot('members-member');

        // A closed project, with Mở lại for its manager.
        await go(`/p/${Q3}`, MINH);
        await expect(page.getByRole('button', { name: 'Mở lại', exact: true })).toBeVisible();
        await shot('project-closed');

        // The label settings, with a long label, as Lan; then a delete the platform refuses because tasks use the label.
        await page.goto('/settings/labels?demo');
        await expect(page.locator('.projects .app')).toBeVisible();
        await page.evaluate((name) => window.__projects!.server.write('task_label', null, { name, base_status: 'doing' }), `Chờ phản hồi từ ${LONG_NAME}`);
        await withLongNames(page, LAN);
        await expect(page.locator('section.label-group').first()).toBeVisible();
        await shot('labels');
        await page.getByRole('button', { name: 'Xoá Ưu tiên tuần' }).click();
        const confirm = page.getByRole('alertdialog');
        await expect(confirm).toBeVisible();
        await shot('label-delete-confirm');
        await confirm.getByRole('button', { name: 'Xoá', exact: true }).click();
        await expect(page.getByRole('dialog', { name: 'Không xoá được nhãn này' })).toBeVisible();
        await shot('label-in-use');
      });

      test(`the site's own states, ${theme}, ${width}px`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        const shot = async (name: string) => {
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(400);
          await page.screenshot({ path: `${SCREENS}/${name}-${theme}-${width}.png`, animations: 'disabled' });
        };
        const ids = {
          entities: { project: person(101), section: person(102), task: person(103), task_label: person(104) },
          groups: { users: person(201), creators: person(202), admins: person(203) },
        };
        const site = async (signedIn: boolean, caller: 'refused' | 'failed' | 'waiting') => {
          await page.unrouteAll({ behavior: 'ignoreErrors' });
          await page.route('**/site/config.json', (r) => r.fulfill({ json: { basePath: '/agentflow', ids, agentflowUrl: 'https://agentflow.example' } }));
          await page.route('**/agentflow/session', (r) => r.fulfill({ json: { signedIn } }));
          await page.route('**/agentflow/api/caller', (r) => {
            if (caller === 'waiting') return;
            const status = caller === 'refused' ? 403 : 502;
            return r.fulfill({ status, contentType: 'application/problem+json', json: { type: 'about:blank', title: 'x', status } });
          });
          await page.goto('/');
        };
        const shown = (text: string) => page.locator('#root').getByText(text);

        await page.goto('/');
        await expect(shown('Trang này chưa được cấu hình')).toBeVisible();
        await shot('site-not-set-up');
        await site(false, 'refused');
        await expect(shown('Đăng nhập vào Dự án')).toBeVisible();
        await shot('site-sign-in');
        await site(true, 'refused');
        await expect(page.locator('#root .state')).toBeVisible();
        await shot('site-access-refused');
        await site(true, 'failed');
        await expect(page.locator('#root .state.error')).toBeVisible({ timeout: 30_000 });
        await shot('site-host-failed');
        await site(true, 'waiting');
        await page.waitForTimeout(1000);
        await shot('site-connecting');
      });
    }
  }
});
