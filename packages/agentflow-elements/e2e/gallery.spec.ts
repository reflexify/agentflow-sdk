import { expect, test, type Locator, type Page } from '@playwright/test';
import { AF_DEFAULT_PALETTE } from '@reflexify/agentflow-sdk';
import type { AfDrillDetail } from '../src/kit/index.js';
import { COLUMN_STACKED, LIST, NUMBER_GOAL, PIE, TILE_CASES, WEEKS } from '../test/kit/fixtures/tiles.js';

for (const theme of ['light', 'dark'] as const) {
  test(`every kit element renders and opens in ${theme}`, async ({ page }) => {
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    for (const tag of ['af-dialog', 'af-confirm', 'af-menu', 'af-popover', 'af-tooltip', 'af-toast', 'af-date', 'af-person-picker', 'af-number-input', 'af-select', 'af-combobox', 'af-rich-editor', 'af-tile', 'af-field', 'af-fieldset', 'af-form', 'af-scroll-area', 'af-tabs', 'af-splitter', 'af-pager', 'af-copy-button', 'af-markdown', 'af-tree-picker', 'af-bulk-bar', 'af-file-upload', 'af-signature-pad', 'af-folder-source']) {
      await expect(pane.locator(tag).first(), tag).toBeAttached();
    }
    await pane.locator('.short-column af-menu [part="trigger"]').click();
    await expect(pane.locator('.short-column af-menu [part="item"]').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(pane.locator('.short-column af-menu [part="item"]').first()).toBeHidden();
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

// Intl writes the percent, and a percent with no step moves one point per arrow key, as the page sets each value back.
test('af-number-input steps a percent by one point', async ({ page }) => {
  await page.goto('/gallery/');
  const input = page.locator('[data-theme="light"] .gallery af-number-input[data-case="discount"] [part="input"]');
  await expect(input).toHaveValue('15%');
  await input.focus();
  await page.keyboard.press('ArrowUp');
  await expect(input).toHaveValue('16%');
  await page.keyboard.press('PageDown');
  await expect(input).toHaveValue('6%');
});

// Text whose separators cannot be a number in the language is refused, kept as typed and marked, rather than read as
// another number: in Vietnamese an English decimal point would otherwise group, "1234.5" reading as 12345.
test('af-number-input refuses text it cannot group, in each language', async ({ page }) => {
  await page.goto('/gallery/');
  for (const [theme, refused, read, shown] of [
    ['dark', '1234.5', '1.234,5', '1.234,5'],
    ['light', '1,5', '1,234.5', '1,234.5'],
  ] as const) {
    const host = page.locator(`[data-theme="${theme}"] .gallery af-number-input[data-case="price"]`);
    const input = host.locator('[part="input"]');
    await input.fill('7');
    await page.keyboard.press('Enter');
    await input.fill(refused);
    await page.keyboard.press('Enter');
    await expect(host).toHaveAttribute('data-unparsed', '');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await input.blur();
    await expect(input).toHaveValue(refused);
    await expect(host).toHaveJSProperty('value', 7);
    await input.fill(read);
    await page.keyboard.press('Enter');
    await expect(host).not.toHaveAttribute('data-unparsed');
    await expect(host).toHaveJSProperty('value', 1234.5);
    await expect(input).toHaveValue(shown);
  }
});

// A fractional number keeps the digits typed, and an unscaled percent is the percentage itself, a step of one point.
test('af-number-input keeps typed fraction digits and shows an unscaled percent as the percentage', async ({ page }) => {
  await page.goto('/gallery/');
  const weight = page.locator('[data-theme="light"] .gallery af-number-input[data-case="weight"] [part="input"]');
  await expect(weight).toHaveValue('1,234.567');
  await weight.fill('3.14159');
  await page.keyboard.press('Enter');
  await expect(weight).toHaveValue('3.14159');
  const rate = page.locator('[data-theme="light"] .gallery af-number-input[data-case="rate"] [part="input"]');
  await expect(rate).toHaveValue('12.5%');
  await rate.focus();
  await page.keyboard.press('ArrowUp');
  await expect(rate).toHaveValue('13.5%');
  await rate.fill('7.25');
  await page.keyboard.press('Enter');
  await expect(rate).toHaveValue('7.25%');
});

// A letter on the closed trigger opens the list at the first option it starts, letters typed together search together
// (the type-ahead forgets them after 350 ms), and Enter picks the highlighted option, which the page sets back.
test('af-select highlights by type-ahead and picks on Enter', async ({ page }) => {
  await page.goto('/gallery/');
  const select = page.locator('[data-theme="light"] .gallery af-select[data-case="status"]');
  const trigger = select.locator('[part="trigger"]');
  const highlighted = select.locator('[part="option"][data-highlighted]');
  await expect(trigger).toHaveText('Open');
  await trigger.focus();
  await page.keyboard.press('t');
  await expect(select).toHaveAttribute('data-raised', 'true');
  await expect(highlighted).toHaveText('Todo');
  await page.keyboard.press('Escape');
  await expect(select).toHaveAttribute('data-raised', 'false');
  await expect(trigger).toBeFocused();
  await page.keyboard.type('tr');
  await expect(highlighted).toHaveText('Triage');
  await page.keyboard.press('Enter');
  await expect(select).toHaveAttribute('data-raised', 'false');
  await expect(trigger).toHaveText('Triage');
  await expect(trigger).toBeFocused();
});

// A page's own dialog hears Escape on the document before the kit, as a Radix dialog does, and hands it to the select open
// inside it: the first Escape closes the select alone and gives its trigger focus back, the next closes the dialog.
test("a page's own layer hands Escape to a kit select inside it", async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const dialog = pane.locator('[data-testid="light-page-dialog"]');
  const select = dialog.locator('af-select');
  await pane.locator('[data-testid="light-open-page-dialog"]').click();
  await expect(dialog).toBeVisible();
  await select.locator('[part="trigger"]').click();
  await expect(select).toHaveAttribute('data-raised', 'true');
  await page.keyboard.press('Escape');
  await expect(select).toHaveAttribute('data-raised', 'false');
  await expect(select.locator('[part="trigger"]')).toBeFocused();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

// A field labels the page's input and the kit's control alike, draws its help where AgentFlow does, and a section places
// its fields from their attributes, with the legend in the fieldset's border.
test('af-field and af-fieldset label, describe and place their children', async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const email = pane.getByTestId('light-field-email');
  await expect(email.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription('A work address Enter an email');
  await expect(email.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true');
  const order = await email.evaluate((field) => [...field.children].map((c) => [c.className, Math.round(c.getBoundingClientRect().top)] as const));
  const top = Object.fromEntries(order.filter(([name]) => name.startsWith('af-field-')));
  expect(top['af-field-row']).toBeLessThan(top['af-field-description']!);
  const input = await email.locator('input').evaluate((el) => el.getBoundingClientRect().top);
  expect(top['af-field-description']).toBeLessThan(input);
  expect(input).toBeLessThan(top['af-field-error']!);

  const status = pane.getByTestId('light-field-status');
  await status.locator('label').click();
  await expect(status.locator('af-select [part="trigger"]')).toBeFocused();

  const owner = pane.getByTestId('light-field-owner');
  await expect(owner.locator('input')).toHaveJSProperty('readOnly', true);
  await expect(owner.getByRole('button', { name: 'Locked' })).toBeVisible();
  await expect(owner.getByRole('textbox')).toHaveAccessibleDescription('Set by the workflow');
  await expect(pane.getByTestId('light-field-priority').getByRole('radiogroup', { name: 'Priority' })).toBeVisible();

  const section = pane.getByTestId('light-section');
  const box = (testId: string) => pane.getByTestId(testId).evaluate((el) => { const r = el.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right) }; });
  const [wide, left, right] = [await box('light-field-email'), await box('light-field-status'), await box('light-field-owner')];
  expect(left.left).toBe(wide.left);
  expect(right.right).toBe(wide.right);
  expect(right.left).toBeGreaterThan(left.right);
  const legend = section.locator('legend');
  await expect(legend).toHaveText('Contact');
  const [legendBox, fieldsetBox] = [await legend.boundingBox(), await section.locator('fieldset').boundingBox()];
  expect(legendBox!.y, 'the legend sits in the border').toBeLessThan(fieldsetBox!.y + 1);

  const four = pane.getByTestId('light-section-four');
  expect((await four.evaluate((el) => getComputedStyle(el).gridTemplateColumns)).split(' '), 'four tracks').toHaveLength(4);
  const [opened, due] = await Promise.all(['light-four-opened', 'light-four-due'].map((testId) => pane.getByTestId(testId).evaluate((el) => el.getBoundingClientRect().width)));
  expect(due!, 'a span of two is two tracks and the gap').toBeGreaterThan(opened! * 2);
  const edited = pane.getByTestId('light-four-due');
  await expect(edited).toHaveCSS('padding-left', '9px');
  const bar = await edited.evaluate((el) => {
    const bar = getComputedStyle(el, '::before');
    return { width: bar.width, left: bar.insetInlineStart, colour: bar.backgroundColor, position: bar.position };
  });
  expect(bar).toMatchObject({ width: '3px', position: 'absolute', left: '0px' });
  expect(bar.colour).not.toBe('rgba(0, 0, 0, 0)');
  await expect(pane.getByTestId('light-four-opened')).toHaveCSS('padding-left', '0px');
  await expect(pane.getByTestId('light-four-cost').locator('af-number-input')).toHaveJSProperty('invalid', false);
});

// Two quick presses of Save emit one af-submit, because the page sets busy in its handler. The test holds the fake save
// until it has checked the busy form, then lets it answer with an error for the title, one for the branches and one for
// no field: the summary takes focus, Tab reaches its first link, and Enter focuses the title.
test('af-form submits once while busy, then focuses its summary, whose link reaches the field', async ({ page }) => {
  await page.goto('/gallery/');
  await page.evaluate(() => Object.assign(window, { galleryHoldSave: true }));
  const pane = page.locator('[data-theme="light"] .gallery');
  const form = pane.getByTestId('light-whole-form');
  const save = pane.getByTestId('light-whole-save');
  await save.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(save).toHaveAttribute('aria-disabled', 'true');
  await expect(save).toBeFocused();
  const submits = () =>
    page.evaluate(() => (window as unknown as { galleryEvents: { theme: string; type: string }[] }).galleryEvents.filter((e) => e.theme === 'light' && e.type === 'af-submit').length);
  expect(await submits()).toBe(1);
  await page.evaluate(() => (window as unknown as { galleryFinishSave: () => void }).galleryFinishSave());

  const summary = form.locator('.af-form-summary');
  await expect(summary).toBeFocused();
  await expect(summary).toHaveAttribute('role', 'alert');
  await expect(summary).toContainText('Some fields need attention');
  await expect(summary).toContainText('The quantity could not be checked; try again');
  await expect(save).not.toHaveAttribute('aria-disabled', 'true');
  await expect(form.locator('af-field[label="Title"] .af-field-error')).toHaveText('A request with this title is open');
  expect(await submits()).toBe(1);

  await page.keyboard.press('Tab');
  await expect(summary.getByRole('link', { name: 'Title' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(form.getByRole('textbox', { name: 'Title' })).toBeFocused();
});

// A multiple combobox holding chips puts focus in its input, never on a chip's remove, where typing would go nowhere and
// Space would drop a value: from its field's label, from a press on a chip's text, and from af-form's summary link.
test('a multiple combobox in a field takes focus in its input, from the label, a chip and the summary', async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const form = pane.getByTestId('light-whole-form');
  const branches = pane.getByTestId('light-whole-branches');
  const input = branches.locator('[part="input"]');
  const chips = branches.locator('[part="chip"]');
  const focusedPart = () =>
    page.evaluate(() => {
      let a: Element | null = document.activeElement;
      while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
      return a?.getAttribute('part') ?? null;
    });
  await expect(chips).toHaveCount(2);

  await form.locator('af-field[label="Branches"] .af-field-label').click();
  await expect.poll(focusedPart).toBe('input');
  await page.keyboard.type('ha ');
  await expect(input).toHaveValue('ha ');
  await expect(chips, 'Space typed a space, and removed nothing').toHaveCount(2);
  await page.keyboard.press('Escape');
  await input.fill('');
  await input.evaluate((el) => (el as HTMLElement).blur());
  await expect.poll(focusedPart).not.toBe('input');

  await chips.first().locator('span').first().click();
  await expect.poll(focusedPart).toBe('input');
  await page.keyboard.press('Escape');

  await pane.getByTestId('light-whole-save').click();
  const summary = form.locator('.af-form-summary');
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: 'Branches' }).click();
  await expect.poll(focusedPart).toBe('input');
  await page.keyboard.press('Enter');
  await expect(chips, 'Enter picked nothing and removed nothing').toHaveCount(2);
});

// The source answers twenty places at a time after 300 ms: the value's name comes from resolve, the list from the source
// when it opens, load more appends the next page, and typing asks again once it pauses.
test('af-combobox pages through a source and names its value', async ({ page }) => {
  await page.goto('/gallery/');
  const combobox = page.locator('[data-theme="light"] .gallery af-combobox[data-case="places"]');
  const input = combobox.locator('[part="input"]');
  const options = combobox.locator('[part="option"]');
  await expect(input).toHaveValue('Quận Cát Linh');
  await input.focus();
  await page.keyboard.press('ArrowDown');
  await expect(combobox).toHaveAttribute('data-raised', 'true');
  await expect(options).toHaveCount(20);
  await combobox.locator('[part="load-more"]').click();
  await expect(options).toHaveCount(40);
  await expect(input).toBeFocused();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('thi tran');
  await expect(options).toHaveCount(20);
  await expect(options.first()).toHaveText(/^Thị trấn An Bình/);
  await combobox.locator('[part="load-more"]').click();
  await expect(options).toHaveCount(40);
  await expect(combobox.locator('[part="load-more"]')).toHaveCount(0);
  // The pointer rests where load more was, over an appended option, and would highlight it.
  await page.mouse.move(0, 0);
  await page.keyboard.press('ArrowDown');
  await expect(combobox.locator('[part="option"][data-highlighted]')).toHaveText(/^Thị trấn An Bình/);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Thị trấn An Bình');
});

// The people come from a source twenty at a time after 300 ms, as the places do: typing asks once it pauses, load more
// appends, and an id no page has named is named by resolve.
test('af-person-picker over a source pages and names a chosen person', async ({ page }) => {
  await page.goto('/gallery/');
  const picker = page.locator('[data-theme="light"] .gallery af-person-picker[data-case="directory"]');
  const input = picker.locator('[part="input"]');
  const options = picker.locator('[part="option"]');
  await input.focus();
  await page.keyboard.type('ng');
  await expect(options).toHaveCount(20);
  await expect(options.first().locator('.name')).toHaveText('Nguyễn An');
  await picker.locator('[part="load-more"]').click();
  await expect(options).toHaveCount(40);
  await expect(input).toBeFocused();
  await options.filter({ hasText: 'Hoàng Giang' }).click();
  await expect(input).toHaveValue('Hoàng Giang');
  await picker.evaluate((el) => ((el as HTMLElement & { value: string }).value = 'person-200'));
  await expect(input).toHaveValue('Hồ Yến');
});

test('af-tree-picker opens matching branches on a search and picks with the keyboard', async ({ page }) => {
  await page.goto('/gallery/');
  const picker = page.locator('[data-theme="light"] .gallery af-tree-picker[data-case="office"]');
  const input = picker.locator('[part="input"]');
  const row = (id: string) => picker.locator(`[part~="node"][data-value="${id}"]`);
  // The input shows the chosen office, so the search replaces it.
  await input.selectText();
  await page.keyboard.type('hai');
  await expect(row('haiphong')).toBeVisible();
  await expect(row('haiphong').locator('[part="ancestry"]')).toHaveText('Miền Bắc');
  await expect(row('hanoi')).toBeHidden();
  await expect(row('central')).toBeHidden();
  await page.keyboard.press('ArrowDown');
  await expect(row('north')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(row('haiphong')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => eventsOf(page, 'light', 'af-tree-picker').then((all) => all.filter((e) => e.type === 'change').map((e) => e.detail))).toEqual([{ value: 'haiphong' }]);
  await expect(input).toHaveValue('Hải Phòng');
  await expect(input).toBeFocused();
  await expect(row('haiphong')).toBeHidden();
});

// The bar is fixed to the window inside a short scroll area, so only the top layer keeps it whole. At the gallery's width
// the second wide action does not fit, so it and the action after it move into the menu.
test('af-bulk-bar appears for a selection, moves its last actions into a menu, and clears on Escape', async ({ page }) => {
  await page.goto('/gallery/');
  const boxes = page.locator('[data-testid="light-bulk-list"] input[type="checkbox"]');
  const bulk = page.locator('[data-testid="light-bulk-bar"]');
  const bar = bulk.locator('[part~="bar"]');
  const actions = bulk.locator('[slot="actions"]');
  const of = (type: string) => eventsOf(page, 'light', 'af-bulk-bar').then((all) => all.filter((e) => e.type === type).map((e) => e.detail));
  await expect(bar).toBeHidden();
  await expect(bulk.locator('[part~="status"]')).toHaveText('');
  await boxes.nth(0).check();
  await boxes.nth(1).check();
  await expect(bar).toBeVisible();
  await expect(bulk).toHaveAttribute('data-raised', 'true');
  await expect(bulk.locator('[part~="count"]')).toHaveText('2');
  await expect(bulk.locator('[part~="status"]')).toHaveText('2 of 8 selected');
  // It appeared without taking focus, in the top layer over the page, 24px above the bottom and centred.
  const placed = await bar.evaluate((el) => {
    const host = (el.getRootNode() as ShadowRoot).host;
    const page = host.getRootNode() as ShadowRoot;
    const box = el.getBoundingClientRect();
    const hit = (el.getRootNode() as ShadowRoot).elementFromPoint(box.left + 6, box.top + box.height / 2);
    const middle = document.documentElement.clientWidth / 2;
    return {
      open: el.matches(':popover-open'),
      focused: !!host.shadowRoot!.activeElement || !!(page.activeElement && host.contains(page.activeElement)),
      bottom: Math.round(document.documentElement.clientHeight - box.bottom),
      centre: Math.round(box.left + box.width / 2 - middle),
      onTop: hit === el,
    };
  });
  expect(placed).toEqual({ open: true, focused: false, bottom: 24, centre: 0, onTop: true });

  await expect(actions.nth(0)).toBeVisible();
  await expect(actions.nth(1)).toBeVisible();
  await expect(actions.nth(2)).toBeVisible();
  await expect(actions.nth(3)).toBeHidden();
  await expect(actions.nth(4)).toBeHidden();
  const more = bulk.locator('[part~="more"]');
  await more.locator('[part="trigger"]').click();
  const items = more.locator('[part="item"]');
  await expect(items).toHaveText(['Move to another workspace', 'Archive']);
  await expect(items.nth(0)).toHaveAttribute('aria-disabled', 'true');
  // Escape in the open menu closes the menu and leaves the selection alone.
  await page.keyboard.press('Escape');
  await expect(items.first()).toBeHidden();
  await expect(bar).toBeVisible();
  await more.locator('[part="trigger"]').click();
  await items.nth(1).click();
  await expect.poll(() => of('action')).toEqual([{ label: 'Archive' }]);
  expect(await of('clear')).toEqual([]);

  await actions.nth(0).focus();
  await page.keyboard.press('Escape');
  await expect.poll(() => of('clear')).toEqual([{}]);
  await expect(bar).toBeHidden();
  await expect(bulk).toHaveAttribute('data-raised', 'false');
  await expect(boxes.nth(0)).not.toBeChecked();
  await expect(bulk.locator('[part~="status"]')).toHaveText('');
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
});

// AgentFlow's TreeSelect draws the chosen look (the accent ground, semibold) only on a row that can be picked, so a chosen
// row that is disabled, an archived office a record still names, stays in the muted look of a disabled row.
test('af-tree-picker draws a chosen row on the accent ground only while it can be picked', async ({ page }) => {
  await page.goto('/gallery/');
  await page.waitForFunction(() => customElements.get('af-tree-picker'));
  const rows = await page.evaluate(async () => {
    const settle = () => new Promise((resolve) => setTimeout(resolve, 500));
    const el = document.createElement('af-tree-picker') as HTMLElement & { nodes: unknown; value: string[]; multiple: boolean };
    el.nodes = [
      { id: 'open', parentId: null, label: 'Open office' },
      { id: 'closed', parentId: null, label: 'Closed office', disabled: true, reason: 'Closed for refit' },
    ];
    el.multiple = true;
    el.value = ['open', 'closed'];
    document.body.append(el);
    await settle();
    el.shadowRoot!.querySelector<HTMLElement>('[part~="input"]')!.click();
    await settle();
    const look = (id: string) => {
      const style = getComputedStyle(el.shadowRoot!.querySelector(`[part~="node"][data-value="${id}"]`)!);
      return { ground: style.backgroundColor, weight: style.fontWeight };
    };
    const out = { open: look('open'), closed: look('closed') };
    el.remove();
    return out;
  });
  expect(rows.open.ground).not.toBe('rgba(0, 0, 0, 0)');
  expect(rows.open.weight).toBe('600');
  expect(rows.closed).toEqual({ ground: 'rgba(0, 0, 0, 0)', weight: '400' });
});

// With no action fitting beside the menu the bar keeps its menu button and its clear button whole, and the summary, which
// would have pushed them out of the bar, is cut short with an ellipsis.
test('af-bulk-bar shortens its summary, not its clear button, in a narrow window', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/gallery/');
  const boxes = page.locator('[data-testid="light-bulk-list"] input[type="checkbox"]');
  const bulk = page.locator('[data-testid="light-bulk-bar"]');
  await boxes.nth(0).check();
  await boxes.nth(1).check();
  await expect(bulk).toHaveAttribute('data-raised', 'true');
  await expect(bulk.locator('[part~="count"]')).toHaveText('2');
  const placed = () => bulk.evaluate((host) => {
    const root = host.shadowRoot!;
    const box = (selector: string) => root.querySelector(selector)!.getBoundingClientRect();
    const summary = root.querySelector<HTMLElement>('[part~="text"]')!;
    const bar = box('[part~="bar"]');
    return {
      clearInside: box('[part~="clear"]').right <= bar.right,
      menuBeforeClear: box('[part~="more"]').right <= box('[part~="clear"]').left + 0.5,
      summaryBeforeMenu: box('[part~="text"]').right <= box('[part~="more"]').left + 0.5,
      cut: [summary, ...summary.querySelectorAll<HTMLElement>('*')].some((el) => el.scrollWidth > el.clientWidth + 1),
    };
  });
  await expect.poll(placed).toEqual({ clearInside: true, menuBeforeClear: true, summaryBeforeMenu: true, cut: true });
});

// An action wrapped in an af-popover is display: none while it sits in the menu, and its popover would anchor on a box
// with no size, at the window's top left. Chosen from the menu, the wrapper is shown until its popover closes. The menu's
// own close returns focus to its button, which a popover opened in the same turn takes for a press outside and closes
// at once, so the choice is sent as the menu sends it, without opening the menu.
test('af-bulk-bar anchors the popover of an overflowed wrapper on the wrapper, shown while it is open', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 700 });
  await page.goto('/gallery/');
  await page.waitForFunction(() => ['af-bulk-bar', 'af-popover'].every((tag) => customElements.get(tag)));
  const result = await page.evaluate(async () => {
    const settle = () => new Promise((resolve) => setTimeout(resolve, 600));
    const bar = document.createElement('af-bulk-bar') as HTMLElement & { count: number };
    bar.count = 3;
    bar.innerHTML = `
      <button slot="actions" type="button" class="af-button ghost sm" style="min-width: 300px">Assign someone</button>
      <button slot="actions" type="button" class="af-button ghost sm" style="min-width: 250px">Export</button>
      <af-popover slot="actions"><button slot="anchor" type="button" class="af-button ghost sm">Filters</button><div slot="content" style="padding: 8px">Filter body</div></af-popover>`;
    document.body.append(bar);
    const wrapper = bar.querySelector('af-popover') as HTMLElement & { open: boolean };
    const anchor = wrapper.querySelector('button')!;
    anchor.addEventListener('click', () => (wrapper.open = true));
    await settle();
    const more = bar.shadowRoot!.querySelector('[part~="more"]') as HTMLElement & { items: { id: string; label: string }[] };
    const hiddenBefore = wrapper.hasAttribute('data-overflow');
    const id = more.items.find((item) => item.label === 'Filters')!.id;
    more.dispatchEvent(new CustomEvent('select', { detail: { id } }));
    await settle();
    const box = (el: Element) => el.getBoundingClientRect();
    const content = box(wrapper.shadowRoot!.querySelector('[data-part="content"]')!);
    const reference = box(anchor);
    const during = { shown: !wrapper.hasAttribute('data-overflow'), height: content.height, gap: Math.max(reference.top - content.bottom, content.top - reference.bottom), overlaps: content.left < reference.right && content.right > reference.left };
    wrapper.open = false;
    await settle();
    const hiddenAfter = wrapper.hasAttribute('data-overflow');
    bar.remove();
    return { hiddenBefore, during, hiddenAfter };
  });
  expect(result.hiddenBefore).toBe(true);
  expect(result.during.shown).toBe(true);
  expect(result.during.height).toBeGreaterThan(0);
  expect(result.during.gap).toBeLessThanOrEqual(24);
  expect(result.during.overlaps).toBe(true);
  expect(result.hiddenAfter).toBe(true);
});

// The page holds two files of at most three, one of them uploading: a chosen file makes the third, which the page marks
// done, and a pick of four more is refused whole.
test('af-file-upload takes a chosen file and refuses a fourth', async ({ page }) => {
  await page.goto('/gallery/');
  const upload = page.locator('[data-testid="light-file-upload"]');
  const input = upload.locator('input[type="file"]');
  const rows = upload.locator('[part~="item"]');
  const added = () =>
    page.evaluate(() =>
      (window as unknown as { galleryEvents: { theme: string; tag: string; type: string; detail: { files: File[] } }[] }).galleryEvents
        .filter((e) => e.theme === 'light' && e.tag === 'af-file-upload' && e.type === 'files-add')
        .map((e) => e.detail.files.map((f) => f.name))
    );
  const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await expect(upload.locator('[part~="dropzone"]')).toHaveAttribute('role', 'button');
  await expect(upload.locator('[part~="hint"]')).toHaveText('Multiple files allowed.');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(1).locator('[part~="progress"]')).toBeVisible();

  await input.setInputFiles(pdf('invoice.pdf'));
  await expect.poll(added).toEqual([['invoice.pdf']]);
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(2).locator('[part~="name"]')).toHaveText('invoice.pdf');
  await expect(rows.nth(2).locator('[part~="progress"]')).toHaveCount(0);

  await input.setInputFiles([pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf'), pdf('d.pdf')]);
  await expect(upload.locator('[part~="notice"]')).toHaveText('At most 3 files.');
  await expect(upload.locator('[part~="notice"]')).toHaveAttribute('role', 'status');
  expect(await added()).toEqual([['invoice.pdf']]);
  await expect(rows).toHaveCount(3);
});

test('af-folder-source uploads chosen files, then browses into a watched folder and shows what a launch would take', async ({ page }) => {
  await page.goto('/gallery/');
  const source = page.locator('[data-testid="light-folder-source"]');
  const heard = (type: string) =>
    page.evaluate((wanted) =>
      (window as unknown as { galleryEvents: { theme: string; tag: string; type: string; detail: unknown }[] }).galleryEvents
        .filter((e) => e.theme === 'light' && e.tag === 'af-folder-source' && e.type === wanted)
        .map((e) => e.detail), type);
  await expect(source.getByRole('radio', { name: 'Folder from this computer' })).toBeChecked();
  await expect(source.locator('input[type="file"]')).toHaveAttribute('webkitdirectory', '');

  // The source switch is a radio group: the arrow keys move the choice.
  await source.getByRole('radio', { name: 'Folder from this computer' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(source.getByRole('radio', { name: 'Files' })).toBeChecked();
  await source.locator('input[type="file"]').setInputFiles([
    { name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
    { name: 'b.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
  ]);
  await expect(source.locator('[part~="progress"]')).toBeVisible();
  await expect(source.locator('[part~="preview"]')).toBeVisible();
  expect(await heard('af-folder-upload-started')).toEqual([{ setId: 'set-1' }]);
  expect(await heard('af-folder-progress')).toContainEqual({ stored: 2, total: 2 });
  expect(((await heard('af-folder-change')) as { value: unknown }[]).map((d) => d.value)).toEqual([{ $fileSet: 'set-1' }]);

  await source.getByRole('radio', { name: 'Watched folder' }).check();
  await source.getByRole('button', { name: 'Open Court scans' }).click();
  // Focus follows the list into the folder, so the keyboard carries on from its first row.
  await expect(source.locator('[part~="choose"]').first()).toBeFocused();
  await source.getByRole('button', { name: 'Load more' }).click();
  await expect(source.locator('[part~="folder"]')).toHaveCount(6);
  await page.keyboard.press('Enter');
  await expect(source.locator('[part~="chosen"]')).toHaveText('Court scans / batch-04');
  await expect(source.locator('[part~="count"]')).toHaveText(['Folders 1,043', 'Files 20,860', 'Left out 41']);
  await expect(source.locator('[part~="reason"]')).toHaveCount(7);
  await expect(source.locator('[part~="reason"][data-code="NOT_IN_A_FOLDER"]')).toHaveText('Files that are in no folder 318');
  expect(((await heard('af-folder-change')) as { value: unknown }[]).map((d) => d.value)).toEqual([{ $fileSet: 'set-1' }, null, { $fileSet: 'court-scans', path: 'batch-04' }]);
});

// With replace, a pick while the one file is held reaches the page, which puts the new file in its place.
test('af-file-upload is named by its label and takes a new file in place of the held one', async ({ page }) => {
  await page.goto('/gallery/');
  const upload = page.locator('[data-testid="light-file-replace"]');
  const zone = upload.locator('[part~="dropzone"]');
  await expect(zone).toHaveAccessibleName('Contract');
  await expect(zone).toHaveAccessibleDescription(/Drop a file here, or browse\s+One file only\./);
  const rows = upload.locator('[part~="item"] [part~="name"]');
  await expect(rows).toHaveText(['contract.pdf']);
  await upload.locator('input[type="file"]').setInputFiles({ name: 'amended.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await expect(rows).toHaveText(['amended.pdf']);
  await expect(upload.locator('[part~="notice"]')).toHaveText('');
});

// The page sets each reported signature back as the pad's value. The export is drawn on a canvas and its inked pixels
// counted, at twice the pixel ratio so the PNG must be twice the pad's size.
test.describe('at a pixel ratio of two', () => {
  test.use({ deviceScaleFactor: 2 });

  test('af-signature-pad draws a stroke, reports it, and keeps it through a resize', async ({ page }) => {
    await page.goto('/gallery/');
    const pad = page.locator('[data-testid="light-signature"]');
    const control = pad.locator('[part~="control"]');
    const strokes = pad.locator('[part~="segment"] path');
    const changes = () =>
      page.evaluate(() =>
        (window as unknown as { galleryEvents: { theme: string; tag: string; type: string; detail: { value: string | null } }[] }).galleryEvents
          .filter((e) => e.theme === 'light' && e.tag === 'af-signature-pad' && e.type === 'change')
          .map((e) => e.detail.value)
      );
    await control.scrollIntoViewIfNeeded();
    await expect(control).toHaveAccessibleName('Signature');
    const inner = await control.evaluate((el) => ({ width: el.clientWidth, height: el.clientHeight }));
    expect(inner.height).toBe(288);
    const box = (await control.boundingBox())!;

    await page.mouse.move(box.x + 40, box.y + 180);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + 40 + i * 24, box.y + 180 - Math.sin(i / 2) * 60, { steps: 3 });
    await page.mouse.up();
    await expect.poll(changes).toHaveLength(1);
    const [url] = await changes();
    expect(url).toMatch(/^data:image\/png;base64,/);
    const png = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ink = canvas.getContext('2d')!;
      ink.drawImage(image, 0, 0);
      const { data } = ink.getImageData(0, 0, canvas.width, canvas.height);
      let inked = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i]! > 0) inked++;
      return { width: image.naturalWidth, height: image.naturalHeight, inked, corner: data[3] };
    }, url!);
    expect(png).toMatchObject({ width: inner.width * 2, height: inner.height * 2, corner: 0 });
    expect(png.inked).toBeGreaterThan(500);
    await expect(strokes).toHaveCount(1);

    await pad.evaluate((el) => { (el as HTMLElement).style.width = `${el.getBoundingClientRect().width + 200}px`; });
    await expect.poll(() => control.evaluate((el) => el.clientWidth)).toBe(inner.width + 200);
    await expect(strokes).toHaveCount(1);
    expect(await changes()).toHaveLength(1);

    await pad.locator('[part~="clear"]').click();
    await expect.poll(changes).toEqual([url, null]);
    await expect(strokes).toHaveCount(0);
    await expect(pad.locator('[part~="image"]')).toHaveCount(0);
  });
});

for (const theme of ['light', 'dark'] as const) {
  test(`af-date shows and reads its format in ${theme}`, async ({ page }) => {
    await page.goto('/gallery/');
    const date = page.locator(`[data-theme="${theme}"] .gallery [data-testid="${theme}-date-masks"] af-date[format="DD.MM.YYYY"]`);
    const input = date.locator('[part="input"]');
    const value = () => date.evaluate((el) => (el as HTMLElement & { value: string | null }).value);
    await expect(input).toHaveValue('20.02.2026');

    await input.fill('');
    await input.press('Enter');
    await expect.poll(value).toBeNull();
    await input.fill('20.02.2026');
    await input.press('Enter');
    await expect.poll(value).toBe('2026-02-20');
    await expect(input).toHaveValue('20.02.2026');

    await input.fill('31.02.2026');
    await input.press('Enter');
    await expect(input).toHaveValue('31.02.2026');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(date).toHaveAttribute('data-unparsed', '');
    expect(await value()).toBe('2026-02-20');

    await date.locator('[part="trigger"]').click();
    const day = (iso: string) => date.locator(`[data-part="table-cell-trigger"][data-view="day"][data-value="${iso}"]`);
    await expect(day('2026-02-20')).toBeVisible();
    await expect(day('2026-02-20')).toHaveAttribute('data-selected', '');
    await expect(day('2026-03-15')).toHaveCount(0);
    await day('2026-02-12').click();
    await expect.poll(value).toBe('2026-02-12');
    await expect(input).toHaveValue('12.02.2026');
    await expect(date).not.toHaveAttribute('data-unparsed');
    await expect(input).not.toHaveAttribute('aria-invalid');
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`af-date and af-person-picker take part in a form in ${theme}`, async ({ page }) => {
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    const id = (name: string) => pane.locator(`[data-testid="${theme}-${name}"]`);
    const dateInput = id('form-date').locator('[part="input"]');
    const form = (method: 'checkValidity' | 'reportValidity') =>
      page.evaluate(([t, m]) => (document.querySelector(`.af-app[data-theme="${t}"]`)!.shadowRoot!.querySelector(`[data-testid="${t}-form"]`) as HTMLFormElement)[m](), [theme, method] as const);
    const focused = () =>
      page.evaluate(() => {
        let a: Element | null = document.activeElement;
        while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
        const root = a?.getRootNode();
        return { part: a?.getAttribute('part') ?? null, testid: root instanceof ShadowRoot ? root.host.getAttribute('data-testid') : null };
      });

    expect(await form('checkValidity')).toBe(false);
    expect(await form('reportValidity')).toBe(false);
    await expect.poll(focused).toEqual({ part: 'input', testid: `${theme}-form-date` });

    await dateInput.fill('05/11/2026');
    await dateInput.press('Enter');
    const who = id('form-who');
    for (const [query, name] of [['minh', 'Lê Minh'], ['hoa', 'Trần Hoa']] as const) {
      await who.locator('[part="input"]').fill(query);
      await who.locator('[part="option"]', { hasText: name }).click();
    }
    await expect(who.locator('[part="chip"]')).toHaveCount(2);
    expect(await form('checkValidity')).toBe(true);
    await id('form-submit').click();
    await expect(id('form-data')).toHaveText('[["due","2026-11-05"],["who","p-minh"],["who","p-hoa"]]');

    await id('form-reset').click();
    await expect(dateInput).toHaveValue('');
    await expect(who.locator('[part="chip"]')).toHaveCount(0);

    // A disabled element is left out of validity and FormData, set as a property as React sets it.
    const disabledAsProperty = (disabled: boolean) =>
      page.evaluate(([t, d]) => {
        const root = document.querySelector(`.af-app[data-theme="${t}"]`)!.shadowRoot!;
        (root.querySelector(`[data-testid="${t}-form-date"]`) as HTMLElement & { disabled: boolean }).disabled = d;
      }, [theme, disabled] as const);
    await disabledAsProperty(true);
    await expect.poll(() => form('checkValidity')).toBe(true);
    await id('form-submit').click();
    await expect(id('form-data')).toHaveText('[]');
    await disabledAsProperty(false);
    await expect.poll(() => form('checkValidity')).toBe(false);

    await pane.locator(`#${theme}-form-lock`).check();
    await expect(dateInput).toBeDisabled();
  });
}

type StyleSpec = Record<string, readonly [selector: string, props: readonly string[], pseudo?: '::before' | '::after' | '', which?: number]>;
/** The computed values of the elements a spec names inside `pane` (the first match, or the one `which` counts to), by key, in one round trip. */
const computedIn = (pane: Locator, spec: StyleSpec) =>
  pane.evaluate(
    (root, entries) =>
      Object.fromEntries(
        entries.map(([key, [selector, props, pseudo, which]]) => {
          const el = root.querySelectorAll(selector)[which ?? 0];
          if (!el) throw new Error(`no ${selector}`);
          const style = getComputedStyle(el, pseudo || null);
          return [key, Object.fromEntries(props.map((p) => [p, style.getPropertyValue(p)]))];
        })
      ),
    Object.entries(spec)
  );
/**
 * Colours and radii, as the browser computes each written out inside `pane`, in one round trip: a colour expression (a token
 * or a mix of tokens named by var()), or `radius <n>` for the kit's radius plus n px.
 */
const paintedIn = (pane: Locator, list: Record<string, string>) =>
  pane.evaluate((el, entries) => {
    const out: Record<string, string> = {};
    for (const [key, expression] of Object.entries(entries)) {
      const probe = Object.assign(document.createElement('span'), { style: expression.startsWith('radius ') ? `border-top-left-radius: calc(var(--k-radius) + ${expression.slice(7)}px)` : `color: ${expression}` });
      el.append(probe);
      out[key] = expression.startsWith('radius ') ? getComputedStyle(probe).borderTopLeftRadius : getComputedStyle(probe).color;
      probe.remove();
    }
    return out;
  }, list);
const mixed = (colour: string, amount: number, into: string) => `color-mix(in oklab, ${colour} ${amount}%, ${into})`;

for (const theme of ['light', 'dark'] as const) {
  // The classes were written for a shadow root, which is where the gallery draws them.
  test(`the display classes draw inside a shadow root in ${theme}`, async ({ page }) => {
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    const id = (name: string) => pane.locator(`[data-testid="${theme}-${name}"]`);

    await expect(id('chips').locator('.af-chip').first()).toHaveCSS('height', '22px');
    await expect(id('banners').locator('.af-banner.danger').first()).toHaveCSS('padding-left', '16px');
    await expect(id('banners').locator('.af-banner.danger').last()).toHaveCSS('padding-top', '12px');
    const [info, success] = await Promise.all(['info', 'success'].map((tone) => id('banners').locator(`.af-banner.${tone}`).evaluate((el) => getComputedStyle(el).backgroundColor)));
    expect(success, 'the success banner is tinted, and not as the info one is').not.toBe(info);
    expect(success).not.toBe(await id('banners').locator('.af-banner:not(.info, .success, .warning, .danger)').evaluate((el) => getComputedStyle(el).backgroundColor));
    // An image with no source, one marked as failed and one the browser fails to load all give way to the initials; one that loaded covers them.
    for (const name of ['avatar-none', 'avatar-failed']) await expect(id(name), name).toBeHidden();
    await expect(id('avatar-broken'), 'avatar-broken').toBeHidden();
    await expect(id('avatar-loaded')).toBeVisible();
    await expect(id('avatar-loaded').locator('xpath=preceding-sibling::span')).toHaveText('ĐĐ');
    await expect(id('progress').locator('.af-progress').first()).toHaveCSS('height', '8px');
    await expect(id('progress').locator('.af-progress.circular').nth(1)).toHaveCSS('background-image', /conic-gradient/);
    await expect(id('spinner')).toHaveCSS('width', '16px');
    await expect(id('spinner')).not.toHaveCSS('animation-name', 'none');
    const tabs = id('tabs').locator('.af-tabs').first();
    await expect(tabs).toHaveCSS('height', '36px');
    expect(
      await tabs.locator('[aria-selected="true"]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'the chosen tab is filled'
    ).not.toBe(await tabs.locator('[aria-selected="false"]').first().evaluate((el) => getComputedStyle(el).backgroundColor));
    await expect(id('skeletons').locator('.af-skeleton.row')).toHaveCSS('height', '40px');

    const empty = id('empty').locator('.af-empty');
    await expect(empty.first()).toHaveCSS('padding-top', '40px');
    await expect(empty.first().locator('svg')).toHaveCSS('width', '28px');
    await expect(empty.last()).toHaveCSS('border-top-style', 'dashed');
    await expect(empty.last()).toHaveCSS('border-top-width', '2px');
    await expect(empty.last().locator('.af-empty-title')).toHaveCSS('font-size', '14px');
    // The boxed card draws a larger icon, at a higher strength, than the plain column does.
    await expect(empty.last().locator('svg')).toHaveCSS('width', '32px');
    await expect(empty.last().locator('svg')).toHaveCSS('opacity', '0.6');

    const error = id('error').locator('.af-error');
    await expect(error).toHaveCSS('padding-top', '24px');
    await expect(error.locator('.af-error-icon')).toHaveCSS('width', '44px');
    expect(await error.locator('.af-error-icon').evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)), 'the tile is round').toBeGreaterThanOrEqual(22);
    // The trace is longer than the 192px the scroll area is bounded to, and the scroll area scrolls it.
    const scroller = error.locator('af-scroll-area');
    const bound = await scroller.evaluate((el) => el.getBoundingClientRect().height);
    expect(bound, 'the details are bounded to 192px').toBeLessThanOrEqual(192);
    expect(bound, 'and fill them').toBeGreaterThan(150);
    expect(await scroller.evaluate((el) => (el as unknown as { viewport: HTMLElement }).viewport.scrollHeight)).toBeGreaterThan(192);
    await expect(error.locator('pre')).toHaveCSS('white-space', 'pre-wrap');

    const repeater = id('repeater');
    await expect(repeater.locator('.af-repeater-row').first()).toHaveCSS('padding-top', '12px');
    await expect(repeater.locator('.af-repeater-row').last()).toHaveCSS('opacity', '0.8');
    expect((await repeater.locator('.af-repeater-fields').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns)).split(' '), 'two columns').toHaveLength(2);
    await expect(repeater.locator('.af-drag-handle').first()).toHaveCSS('cursor', 'grab');
    await expect(repeater.locator('.af-repeater-empty')).toHaveCSS('border-top-style', 'dashed');
    const line = id('repeater-line');
    const lineRow = line.locator('.af-repeater-row').first();
    await expect(lineRow).toHaveCSS('display', 'grid');
    await expect(lineRow).toHaveCSS('padding-top', '8px');
    await expect(lineRow.locator('.af-drag-handle')).toHaveCSS('width', '24px');
    await expect(lineRow.locator('.af-drag-handle')).toHaveCSS('height', '24px');
    await expect(lineRow.locator('.af-drag-handle')).toHaveCSS('cursor', 'grab');
    await expect(line.locator('.af-drag-handle[aria-pressed="true"]')).toHaveCSS('cursor', 'grabbing');
    const [handleBox, fieldsBox, removeBox] = await lineRow.evaluate((row) => ['.af-drag-handle', '.af-repeater-fields', '.af-button'].map((sel) => {
      const r = row.querySelector(sel)!.getBoundingClientRect();
      return { left: r.left, right: r.right };
    }));
    expect(fieldsBox!.left - handleBox!.right, 'the handle and the fields are 8 px apart').toBeCloseTo(8, 0);
    expect(removeBox!.left - fieldsBox!.right, 'the fields and the remove button are 8 px apart').toBeCloseTo(8, 0);
    const stacked = id('repeater-stacked');
    const [stackedHandle, stackedFields, stackedNote, stackedRemove] = await stacked.evaluate((row) => ['.af-drag-handle', '.af-repeater-fields', '.af-field-description', '.af-button'].map((sel) => {
      const r = row.querySelector(sel)!.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }));
    expect(stackedNote!.left, 'two children in the middle start at the same offset').toBeCloseTo(stackedFields!.left, 0);
    expect(stackedFields!.left - stackedHandle!.right, 'which is 8 px from the handle').toBeCloseTo(8, 0);
    expect(stackedNote!.top - stackedFields!.bottom, 'and they are 8 px apart').toBeCloseTo(8, 0);
    expect(stackedRemove!.left - stackedFields!.right).toBeCloseTo(8, 0);
    await expect(id('repeater-headless'), 'a row without the line class is drawn as before').toHaveCSS('padding-top', '12px');
    await expect(id('repeater-headless')).toHaveCSS('display', 'flex');

    const chips = id('file-chips').locator('.af-file-chip');
    await expect(chips.first()).toHaveCSS('font-size', '10.5px');
    await expect(chips.nth(1)).toHaveCSS('max-width', '240px');
    expect((await chips.nth(1).boundingBox())!.width, 'a long name stops at 240px').toBeLessThanOrEqual(240);
    await expect(chips.nth(1).locator('.af-file-chip-name')).toHaveCSS('text-overflow', 'ellipsis');
    await expect(chips.last().locator('.af-file-chip-name')).toHaveCSS('pointer-events', 'none');

    const table = id('table');
    await expect(table).toHaveCSS('font-size', '12.5px');
    await expect(table.locator('thead th').nth(1)).toHaveCSS('padding-left', '12px');
    await expect(table.locator('tbody td').nth(1)).toHaveCSS('padding-top', '8px');
    await expect(table.locator('thead th.num')).toHaveCSS('text-align', 'end');
    await expect(table.locator('thead th.check')).toHaveCSS('width', '40px');
    // A selected row, a toned row and a plain one each paint their own ground on the cells.
    const ground = (row: Locator) => row.locator('td').nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);
    const grounds = await Promise.all([table.locator('tr#' + theme + '-table-g1'), table.locator('tr[aria-selected="true"]'), table.locator('tr[data-tone="warn"]'), table.locator('tr[data-tone="danger"]')].map(ground));
    expect(new Set(grounds).size, 'a plain, a selected and two toned rows are four grounds').toBe(4);
    await expect(table.locator('.af-table-group-count').first()).toHaveCSS('font-size', '11px');
    // The empty group is dimmed and its action leaves the pointer alone; the collapsed one shows its header only.
    await expect(table.locator('tbody[data-empty] .af-table-group-row')).toHaveCSS('opacity', '0.6');
    await expect(table.locator('tbody[data-empty] .af-table-group-header'), 'the header row itself stays out of the stacking order').toHaveCSS('opacity', '1');
    await expect(table.locator('tbody[data-empty] .af-table-group-actions')).toHaveCSS('opacity', '1');
    await expect(table.locator('tbody[data-empty] .af-table-group-actions')).toHaveCSS('pointer-events', 'none');
    await expect(table.locator('tbody[data-collapsed] tr:not(.af-table-group-header)').first()).toBeHidden();
    await expect(table.locator('tbody[data-collapsed] .af-table-group-header')).toBeVisible();
  });
}

for (const theme of ['light', 'dark'] as const) {
  // Its own test: the display classes' test is close to its time limit in WebKit.
  test(`the page structure classes draw inside a shadow root in ${theme}`, async ({ page }) => {
    test.slow();
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    const id = (name: string) => pane.locator(`[data-testid="${theme}-${name}"]`);
    const one = (name: string) => `[data-testid="${theme}-${name}"]`;
    // Each class's values are read in one round trip, and every colour in one, since a round trip costs more in WebKit than the reading does.
    const C = await paintedIn(pane, {
      muted: 'var(--k-muted)', fg: 'var(--k-fg)', surface: 'var(--k-surface)', mutedBg: 'var(--k-muted-bg)', warning: 'var(--k-warning)',
      info: 'var(--k-info)', primary: 'var(--k-primary)', success: 'var(--k-success)',
    });

    const head = await computedIn(pane, {
      crumbs: [one('breadcrumb'), ['font-size']],
      first: [`${one('breadcrumb')} li`, ['content'], '::before', 0],
      chevron: [`${one('breadcrumb')} li`, ['width', 'mask-image'], '::before', 1],
      link: [`${one('breadcrumb')} a`, ['color'], '', 0],
      current: [`${one('breadcrumb')} a`, ['color'], '', 2],
      eyebrow: [one('breadcrumb-eyebrow'), ['font-size', 'font-weight', 'text-transform', 'letter-spacing']],
      toggle: [`${one('disclosure')} .af-disclosure-toggle`, ['font-size', 'font-weight']],
      icon: [`${one('disclosure')} .af-disclosure-toggle svg`, ['width']],
      rule: [one('disclosure'), ['height'], '::after'],
      eyebrowToggle: [`${one('disclosure-eyebrow')} .af-disclosure-toggle`, ['font-size', 'text-transform']],
      eyebrowIcon: [`${one('disclosure-eyebrow')} svg`, ['width']],
      eyebrowBody: [`${one('disclosure-eyebrow')} .af-disclosure-body`, ['display']],
    });
    expect(head['crumbs']).toEqual({ 'font-size': '11.5px' });
    expect(head['first'], 'the first crumb has no chevron').toEqual({ content: 'none' });
    expect(head['chevron']!['width'], 'a later crumb has a 12px chevron').toBe('12px');
    expect(head['chevron']!['mask-image']).toContain('svg');
    expect(head['link'], 'a link is the muted text').toEqual({ color: C['muted'] });
    expect(head['current'], 'and the current page the foreground').toEqual({ color: C['fg'] });
    expect(head['eyebrow']).toEqual({ 'font-size': '11px', 'font-weight': '600', 'text-transform': 'uppercase', 'letter-spacing': '0.55px' });
    expect(head['toggle']).toEqual({ 'font-size': '12.5px', 'font-weight': '600' });
    expect(head['icon']).toEqual({ width: '14px' });
    expect(head['rule'], 'the rule is 1px').toEqual({ height: '1px' });
    expect(head['eyebrowToggle']).toEqual({ 'font-size': '10.5px', 'text-transform': 'uppercase' });
    expect(head['eyebrowIcon']).toEqual({ width: '12px' });
    expect(head['eyebrowBody'], 'a closed section is hidden').toEqual({ display: 'none' });

    const facts = await computedIn(pane, {
      list: [one('dl'), ['grid-template-columns', 'column-gap', 'row-gap']],
      term: [`${one('dl')} .af-dl-item dt`, ['font-size', 'text-transform']],
      value: [`${one('dl')} .af-dl-item dd`, ['margin-top', 'font-size']],
      card: [`${one('stats')} .af-stat`, ['padding', 'background-color']],
      label: [`${one('stats')} .af-stat .af-stat-label`, ['font-size', 'font-weight']],
      dot: [`${one('stats')} .af-stat .af-stat-dot`, ['width']],
      figure: [`${one('stats')} .af-stat .af-stat-value`, ['font-size', 'font-variant-numeric', 'color']],
      note: [`${one('stats')} .af-stat .af-stat-note`, ['font-size']],
      plain: [`${one('stats')} .af-stat.plain`, ['padding', 'background-color']],
      plainLabel: [`${one('stats')} .af-stat.plain .af-stat-label`, ['font-size', 'text-transform']],
      plainFigure: [`${one('stats')} .af-stat.plain .af-stat-value`, ['font-size']],
    });
    expect(facts['list']!['grid-template-columns'].split(' '), 'two columns').toHaveLength(2);
    expect(facts['list']).toMatchObject({ 'column-gap': '40px', 'row-gap': '16px' });
    expect(facts['term']).toEqual({ 'font-size': '10.5px', 'text-transform': 'uppercase' });
    expect(facts['value']).toEqual({ 'margin-top': '4px', 'font-size': '13.5px' });
    expect(facts['card'], 'the card is on the muted ground').toEqual({ padding: '12px 14px', 'background-color': C['mutedBg'] });
    expect(facts['label']).toEqual({ 'font-size': '12px', 'font-weight': '600' });
    expect(facts['dot']).toEqual({ width: '6px' });
    expect(facts['figure'], 'the warning tone').toEqual({ 'font-size': '24px', 'font-variant-numeric': 'tabular-nums', color: C['warning'] });
    expect(facts['note']).toEqual({ 'font-size': '11px' });
    expect(facts['plain']).toEqual({ padding: '0px', 'background-color': 'rgba(0, 0, 0, 0)' });
    expect(facts['plainLabel']).toEqual({ 'font-size': '10.5px', 'text-transform': 'uppercase' });
    expect(facts['plainFigure']).toEqual({ 'font-size': '21px' });
    const { widths, heights } = await id('dl').evaluate((el) => ({
      widths: [...el.querySelectorAll('.af-dl-item')].map((item) => item.getBoundingClientRect().width),
      heights: [...el.querySelectorAll('.af-dl-item dd')].map((dd) => dd.getBoundingClientRect().height),
    }));
    expect(widths[2], 'an item that spans two columns fills the list').toBeCloseTo(widths[0]! * 2 + 40, 0);
    expect(heights[2], 'a copy button does not make its value taller').toBeCloseTo(heights[0]!, 1);
    // The copy button shows under the pointer and while focus is inside its item, and not otherwise.
    const item = id('dl').locator('.af-dl-item').nth(2);
    const copy = item.locator('af-copy-button');
    await page.mouse.move(0, 0);
    await expect(copy, 'hidden at rest').toHaveCSS('opacity', '0');
    await item.hover();
    await expect(copy, 'shown under the pointer').toHaveCSS('opacity', '1');
    await page.mouse.move(0, 0);
    await expect(copy).toHaveCSS('opacity', '0');
    await copy.locator('button').focus();
    await expect(copy, 'and shown when focus is inside').toHaveCSS('opacity', '1');
    await copy.locator('button').blur();
    await expect(copy).toHaveCSS('opacity', '0');

    const feed = await computedIn(pane, {
      first: [`${one('timeline')} .af-timeline-item`, ['column-gap', 'padding-bottom']],
      last: [`${one('timeline')} > .af-timeline-item:last-child`, ['padding-bottom']],
      line: [`${one('timeline')} .af-timeline-item`, ['width', 'top', 'background-color'], '::before'],
      lastLine: [`${one('timeline')} > .af-timeline-item:last-child`, ['content'], '::before'],
      dot: [`${one('timeline')} .af-timeline-dot`, ['width', 'border-top-left-radius', 'box-shadow']],
      icon: [`${one('timeline')} .af-timeline-dot svg`, ['display']],
      time: [`${one('timeline')} .af-timeline-time`, ['font-size']],
      actor: [`${one('timeline')} .af-timeline-text b`, ['font-weight']],
      text: [`${one('timeline')} .af-timeline-text`, ['line-height']],
      tile: [`${one('timeline-icons')} .af-timeline-dot`, ['width', 'height', 'box-shadow', 'background-color']],
      tileIcon: [`${one('timeline-icons')} .af-timeline-dot svg`, ['width']],
    });
    expect(feed['first']).toEqual({ 'column-gap': '12px', 'padding-bottom': '16px' });
    expect(feed['last']).toEqual({ 'padding-bottom': '0px' });
    expect(feed['line'], 'a 1px line from 16px down').toMatchObject({ width: '1px', top: '16px' });
    expect(feed['lastLine'], 'and none after the last').toEqual({ content: 'none' });
    expect(feed['dot']!['width']).toBe('11px');
    expect(feed['dot']!['border-top-left-radius']).toMatch(/^[1-9]/);
    expect(feed['dot']!['box-shadow'], 'the ring is the surface').toBe(`${C['surface']} 0px 0px 0px 3px`);
    expect(feed['icon'], 'a dot holds no icon').toEqual({ display: 'none' });
    expect(feed['time']).toEqual({ 'font-size': '11px' });
    expect(feed['actor']).toEqual({ 'font-weight': '500' });
    expect(feed['text']).toEqual({ 'line-height': '17.1875px' });
    expect(feed['tile']).toMatchObject({ width: '28px', height: '28px', 'box-shadow': 'none' });
    expect(feed['tileIcon']).toEqual({ width: '14px' });

    // A person is the info tone, an agent the primary, the system the muted text, an admin the warning tone and the API the
    // success tone. An event with no kind stands for AgentFlow's neutral-300, which no token holds; the parity spec holds it
    // to AgentFlow's across the brands, and here it is pinned to what the kit's default palette paints, so a change to the
    // mix shows. The line is that same colour at 80%.
    const fills = await id('timeline').locator('.af-timeline-dot').evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
    expect(fills.slice(0, 5)).toEqual([C['info'], C['primary'], C['muted'], C['warning'], C['success']]);
    const painted = theme === 'light' ? [200, 203, 208] : [56, 64, 74];
    const noKind = await page.evaluate((colour) => {
      const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d')!;
      ctx.fillStyle = colour;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
    }, fills[5]!);
    expect(Math.max(...painted.map((v, i) => Math.abs(v - noKind[i]!))), `${noKind}: the dot with no kind`).toBeLessThanOrEqual(1);
    const { line } = await paintedIn(pane, { line: mixed(fills[5]!, 80, 'transparent') });
    expect(feed['line']!['background-color'], 'the line is the same colour at 80%').toBe(line);
    expect(feed['tile']!['background-color'], 'a tile is tinted').not.toBe(fills[0]);
  });
}

for (const theme of ['light', 'dark'] as const) {
  // Its own test, like the page structure classes': the display classes' test is close to its time limit in WebKit. Every class
  // is read in one evaluate, and every colour in one, since each round trip to the page costs more in WebKit than the reading does.
  test(`the view classes draw inside a shadow root in ${theme}`, async ({ page }) => {
    test.slow();
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    const id = (name: string) => pane.locator(`[data-testid="${theme}-${name}"]`);
    const one = (name: string) => `[data-testid="${theme}-${name}"]`;
    // On screen, so what is measured below is laid out where it is hovered.
    await id('views').scrollIntoViewIfNeeded();
    const probe = (spec: StyleSpec) => computedIn(pane, spec);
    const painted = await paintedIn(
      pane,
      {
        line: 'var(--k-line)', surface: 'var(--k-surface)', muted: 'var(--k-muted)', mutedBg: 'var(--k-muted-bg)', primary: 'var(--k-primary)', primaryFg: 'var(--k-primary-fg)', fg: 'var(--k-fg)',
        hover: 'var(--k-hover)', focus: 'var(--k-focus-border)', blue: '#2a78d6',
        chosenLine: mixed('var(--k-primary)', 40, 'var(--k-surface)'), chosenGround: mixed('var(--k-primary)', 6, 'var(--k-surface)'), warned: mixed('var(--k-warning)', 8, 'var(--k-surface)'),
        term: mixed('var(--k-muted)', 70, 'transparent'), column: mixed('var(--k-muted-bg)', 60, 'transparent'), dashed: mixed('var(--k-muted-bg)', 40, 'transparent'),
        names: mixed('var(--k-muted-bg)', 80, 'transparent'), outside: mixed('var(--k-muted-bg)', 70, 'transparent'), picked: mixed('var(--k-primary)', 5, 'var(--k-surface)'),
        pickedRing: mixed('var(--k-primary)', 30, 'transparent'), tint: mixed('var(--k-fg)', 5, 'transparent'),
        teal12: mixed('#0f766e', 12, 'var(--k-surface)'), teal30: mixed('#0f766e', 30, 'var(--k-surface)'), teal75: mixed('#0f766e', 75, 'var(--k-fg)'), primary12: mixed('var(--k-primary)', 12, 'var(--k-surface)'),
        radius0: 'radius 0', radius4: 'radius 4',
      }
    );
    const C = painted;

    // The toolbar: a wrapping row of 8px gaps, whose lead takes the width and whose trail is pushed to the end.
    const bar = await probe({
      bar: [one('toolbar'), ['display', 'flex-wrap', 'align-items', 'column-gap']],
      lead: [`${one('toolbar')} .af-toolbar-lead`, ['flex-grow', 'min-width', 'column-gap']],
      divider: [`${one('toolbar')} .af-toolbar-divider`, ['width', 'height', 'background-color']],
      trail: [`${one('toolbar')} .af-toolbar-trail`, ['column-gap']],
    });
    expect(bar['bar']).toEqual({ display: 'flex', 'flex-wrap': 'wrap', 'align-items': 'center', 'column-gap': '8px' });
    expect(bar['lead']).toEqual({ 'flex-grow': '1', 'min-width': '0px', 'column-gap': '8px' });
    expect(bar['divider'], 'a 1px by 16px rule in the line colour').toEqual({ width: '1px', height: '16px', 'background-color': C['line'] });
    expect(bar['trail']).toEqual({ 'column-gap': '4px' });
    const edges = await id('toolbar').evaluate((el) => [el.getBoundingClientRect().right, el.querySelector('.af-toolbar-trail')!.getBoundingClientRect().right]);
    expect(edges[1], 'the trail ends where the toolbar does').toBeCloseTo(edges[0]!, 0);

    // A card: radius, padding, border and shadow; chosen, toned and compact; the title, the rows, the media.
    const card = (n: number) => one(`card-${n}`);
    const cards = await probe({
      plain: [card(0), ['padding-top', 'border-top-width', 'border-top-left-radius', 'background-color', 'box-shadow', 'position']],
      compact: [card(4), ['padding-top']],
      chosen: [card(1), ['border-top-color', 'background-color']],
      toned: [card(2), ['background-color']],
      title: [`${card(0)} .af-card-title`, ['font-size', 'font-weight', 'line-height', 'margin-top']],
      rows: [`${card(0)} .af-card-rows`, ['margin-top', 'row-gap', 'font-size', 'font-variant-numeric', 'color']],
      term: [`${card(0)} .af-card-row dt`, ['color']],
      media: [`${card(3)} .af-card-media`, ['border-top-width', 'border-top-left-radius', 'background-color', 'color']],
      grid: [one('cards'), ['column-gap', 'row-gap']],
    });
    expect(cards['plain']).toMatchObject({ 'padding-top': '10px', 'border-top-width': '1px', 'border-top-left-radius': C['radius0'], 'background-color': C['surface'], position: 'relative' });
    expect(cards['plain']!['box-shadow'], 'the small shadow').toContain('0px 1px 3px 0px');
    expect(cards['compact']).toEqual({ 'padding-top': '6px' });
    expect(cards['chosen']).toEqual({ 'border-top-color': C['chosenLine'], 'background-color': C['chosenGround'] });
    expect(cards['toned'], 'a toned card is tinted').toEqual({ 'background-color': C['warned'] });
    expect(cards['title']).toEqual({ 'font-size': '12.5px', 'font-weight': '600', 'line-height': '17.1875px', 'margin-top': '0px' });
    expect(cards['rows']).toEqual({ 'margin-top': '6px', 'row-gap': '4px', 'font-size': '11px', 'font-variant-numeric': 'tabular-nums', color: C['muted'] });
    expect(cards['term'], 'a term is lighter than its value').toEqual({ color: C['term'] });
    expect(cards['media']).toMatchObject({ 'border-top-width': '1px', 'border-top-left-radius': C['radius0'], 'background-color': C['mutedBg'], color: C['muted'] });
    expect(cards['grid'], 'a grid with 12px between cards').toEqual({ 'column-gap': '12px', 'row-gap': '12px' });
    const boxes = await id('cards').evaluate((el, [first, picture]) => {
      const rect = (e: Element | null) => e!.getBoundingClientRect();
      const link = rect(el.querySelector(`${first} .af-card-link`));
      const outer = rect(el.querySelector(first));
      const media = rect(el.querySelector(`${picture} .af-card-media`));
      return { inset: [link.left - outer.left, link.top - outer.top, outer.right - link.right, outer.bottom - link.bottom], position: getComputedStyle(el.querySelector(`${first} .af-card-link`)!).position, ratio: media.width / media.height, wide: outer.width };
    }, [one('card-0'), one('card-3')] as const);
    expect(boxes.inset, 'the link covers the card inside its border').toEqual([1, 1, 1, 1]);
    expect(boxes.position).toBe('absolute');
    expect(boxes.ratio, 'the media is 16:9').toBeCloseTo(16 / 9, 2);
    expect(boxes.wide, 'a card is at least 200px wide').toBeGreaterThanOrEqual(200);

    // The board: columns of 256px (224px compact) with 12px between them, a dashed one on a fainter ground, a dot in the page's
    // colour, a count pill, an empty note; each column's cards scroll in a scroll area that takes what the column leaves.
    const column = (n: number) => one(`view-board-column-${n}`);
    const board = await probe({
      board: [one('view-board'), ['column-gap', 'padding-bottom']],
      first: [column(0), ['padding-top', 'border-top-width', 'border-top-left-radius', 'background-color', 'display', 'flex-direction']],
      dashed: [column(3), ['border-top-style', 'background-color']],
      dashedTitle: [`${column(3)} .af-board-column-title`, ['color']],
      header: [`${column(0)} .af-board-column-header`, ['display', 'justify-content', 'padding-top', 'padding-right', 'padding-bottom']],
      title: [`${column(0)} .af-board-column-title`, ['column-gap', 'font-size', 'font-weight']],
      dot: [`${column(0)} .af-board-dot`, ['width', 'height', 'background-color']],
      count: [`${column(0)} .af-board-count`, ['font-size', 'padding-left', 'color', 'background-color']],
      cards: [`${column(0)} .af-board-cards`, ['row-gap']],
      empty: [`${column(2)} .af-board-empty`, ['padding-top', 'padding-left', 'font-size', 'color']],
    });
    expect(board['board']).toEqual({ 'column-gap': '12px', 'padding-bottom': '8px' });
    expect(board['first']).toEqual({ 'padding-top': '8px', 'border-top-width': '1px', 'border-top-left-radius': C['radius4'], 'background-color': C['column'], display: 'flex', 'flex-direction': 'column' });
    expect(board['dashed'], 'the dashed column').toEqual({ 'border-top-style': 'dashed', 'background-color': C['dashed'] });
    expect(board['dashedTitle'], 'with a muted title').toEqual({ color: C['muted'] });
    expect(board['header']).toEqual({ display: 'flex', 'justify-content': 'space-between', 'padding-top': '0px', 'padding-right': '4px', 'padding-bottom': '8px' });
    expect(board['title']).toEqual({ 'column-gap': '6px', 'font-size': '12px', 'font-weight': '500' });
    expect(board['dot'], 'an 8px dot in the colour the page sets').toEqual({ width: '8px', height: '8px', 'background-color': C['blue'] });
    expect(board['count'], 'the count is a pill on the surface').toEqual({ 'font-size': '10px', 'padding-left': '6px', color: C['muted'], 'background-color': C['surface'] });
    expect(board['cards']).toEqual({ 'row-gap': '6px' });
    expect(board['empty']).toEqual({ 'padding-top': '8px', 'padding-left': '4px', 'font-size': '11px', color: C['muted'] });
    const layout = await id('view-board-area').evaluate((area, [cardsArea, firstColumn]) => {
      type Scroller = HTMLElement & { viewport: HTMLElement };
      const root = area.getRootNode() as ShadowRoot;
      const inner = root.querySelector(cardsArea) as Scroller;
      const holder = root.querySelector(firstColumn)!;
      const first = holder.querySelector('.af-card')!.getBoundingClientRect();
      const viewport = inner.viewport;
      return {
        widths: [...area.querySelector('.af-board')!.children].map((c) => c.getBoundingClientRect().width),
        tall: viewport.scrollHeight > viewport.clientHeight,
        fits: inner.getBoundingClientRect().height < holder.getBoundingClientRect().height,
        across: (area as Scroller).viewport.scrollWidth > (area as Scroller).viewport.clientWidth,
        room: first.left - viewport.getBoundingClientRect().left,
      };
    }, [one('view-board-cards-0'), column(0)] as const);
    expect(layout.widths, 'column widths').toEqual([256, 224, 256, 256]);
    expect(layout.tall, "a column's cards scroll when the column is too short for them").toBe(true);
    expect(layout.fits, 'in an area that fits inside the column').toBe(true);
    expect(layout.across, 'and the board scrolls across').toBe(true);
    expect(layout.room, 'the cards sit 4px inside their scroll area, so a shadow and a ring at its edge are not cut').toBe(4);

    // The list: a listbox with no bullets, rows of 8px by 12px (6px compact), a line under each but the last, a bar and a ground
    // on the chosen row, the active row lit as under the pointer.
    const row = (n: number) => one(`row-${n}`);
    const list = await probe({
      list: [one('list'), ['list-style-type', 'margin-top', 'padding-left']],
      row: [row(1), ['display', 'column-gap', 'padding-top', 'padding-left', 'border-bottom-width', 'background-color']],
      compact: [row(4), ['padding-top', 'border-bottom-width']],
      active: [row(2), ['background-color']],
      chosen: [row(0), ['background-color']],
      bar: [row(0), ['width', 'inset-inline-start', 'background-color', 'border-top-right-radius', 'border-top-left-radius'], '::before'],
      noBar: [row(1), ['content'], '::before'],
    });
    expect(list['list']).toEqual({ 'list-style-type': 'none', 'margin-top': '0px', 'padding-left': '0px' });
    expect(list['row']).toEqual({ display: 'flex', 'column-gap': '8px', 'padding-top': '8px', 'padding-left': '12px', 'border-bottom-width': '1px', 'background-color': 'rgba(0, 0, 0, 0)' });
    expect(list['compact'], 'a compact row, with no line under the last').toEqual({ 'padding-top': '6px', 'border-bottom-width': '0px' });
    expect(list['active'], 'the active row is lit').toEqual({ 'background-color': C['hover'] });
    expect(list['chosen'], 'the chosen row is the primary at 6%').toEqual({ 'background-color': C['chosenGround'] });
    expect(list['bar'], 'with a 3px bar in the primary, rounded on its far side').toMatchObject({ width: '3px', 'inset-inline-start': '0px', 'background-color': C['primary'], 'border-top-right-radius': '4px', 'border-top-left-radius': '0px' });
    expect(list['noBar'], 'and no bar elsewhere').toEqual({ content: 'none' });
    await id('row-1').hover();
    expect((await probe({ row: [row(1), ['background-color']] }))['row'], 'a row under the pointer is lit').toEqual({ 'background-color': C['hover'] });
    await page.mouse.move(0, 0);
    await id('list').focus();
    await expect(id('list')).toHaveCSS('box-shadow', `${C['focus']} 0px 0px 0px 1px inset`);

    // The month: a box that clips its corners, a header, the weekday names over seven equal columns, 35 days of 116px or more.
    const month = one('cal-month');
    const at = (n: number, props: readonly string[]) => [`${month} .af-cal-day`, props, '', n] as const;
    const calendar = await probe({
      box: [month, ['overflow-x', 'border-top-width', 'border-top-left-radius', 'background-color', 'box-shadow']],
      header: [`${month} .af-cal-header`, ['display', 'flex-wrap', 'column-gap', 'padding-top', 'padding-left', 'border-bottom-width']],
      period: [`${month} .af-cal-period`, ['font-size', 'font-weight', 'letter-spacing', 'margin-top']],
      names: [`${month} .af-cal-weekdays`, ['grid-template-columns', 'background-color']],
      name: [`${month} .af-cal-weekdays span`, ['padding-top', 'padding-left', 'font-size', 'font-weight', 'text-transform', 'letter-spacing', 'color', 'border-right-width']],
      lastName: [`${month} .af-cal-weekdays span`, ['border-right-width'], '', 6],
      ordinary: at(8, ['border-right-width', 'border-bottom-width', 'background-color']),
      rowEnd: at(6, ['border-right-width']),
      last: at(34, ['border-bottom-width']),
      outside: at(0, ['background-color']),
      chosen: at(17, ['background-color', 'box-shadow']),
      date: [`${month} .af-cal-day:nth-child(9) .af-cal-date`, ['height', 'font-size', 'font-weight', 'border-top-left-radius', 'color']],
      today: [`${month} .af-cal-date.today`, ['background-color', 'color']],
      outsideDate: [`${month} .af-cal-day:nth-child(1) .af-cal-date`, ['color']],
      events: [`${month} .af-cal-day:nth-child(18) .af-cal-events`, ['row-gap', 'z-index', 'position']],
      more: [`${month} .af-cal-more`, ['font-size', 'padding-left', 'color']],
      event: [`${month} .af-cal-day:nth-child(18) .af-event`, ['height', 'padding-left', 'column-gap', 'font-size', 'line-height', 'border-top-left-radius', 'border-top-width', 'background-color', 'border-top-color', 'color', 'overflow-x', 'white-space'], '', 1],
      bare: [`${month} .af-cal-day:nth-child(18) .af-event`, ['background-color']],
      time: [`${month} .af-event-time`, ['font-variant-numeric', 'opacity']],
      continued: [`${month} .af-event.continued`, ['border-right-width', 'border-top-right-radius', 'border-bottom-right-radius', 'border-left-width', 'border-top-left-radius']],
      continues: [`${month} .af-event.continues`, ['border-left-width', 'border-top-left-radius', 'border-bottom-left-radius', 'border-right-width', 'border-top-right-radius']],
    });
    expect(calendar['box']).toMatchObject({ 'overflow-x': 'hidden', 'border-top-width': '1px', 'border-top-left-radius': C['radius4'], 'background-color': C['surface'] });
    expect(calendar['header']).toEqual({ display: 'flex', 'flex-wrap': 'wrap', 'column-gap': '8px', 'padding-top': '8px', 'padding-left': '10px', 'border-bottom-width': '1px' });
    expect(calendar['period']).toEqual({ 'font-size': '13px', 'font-weight': '600', 'letter-spacing': '-0.325px', 'margin-top': '0px' });
    expect(calendar['names']!['grid-template-columns']!.split(' '), 'seven columns').toHaveLength(7);
    expect(calendar['names']!['background-color']).toBe(C['names']);
    expect(calendar['name']).toEqual({ 'padding-top': '4px', 'padding-left': '8px', 'font-size': '11px', 'font-weight': '500', 'text-transform': 'uppercase', 'letter-spacing': '0.275px', color: C['muted'], 'border-right-width': '1px' });
    expect(calendar['lastName'], 'no line after the last name').toEqual({ 'border-right-width': '0px' });
    expect(calendar['ordinary']).toEqual({ 'border-right-width': '1px', 'border-bottom-width': '1px', 'background-color': C['surface'] });
    expect(calendar['rowEnd'], 'no line at the end of a row').toEqual({ 'border-right-width': '0px' });
    expect(calendar['last'], 'or under the last').toEqual({ 'border-bottom-width': '0px' });
    expect(calendar['outside'], 'a day of another month is on the muted ground').toEqual({ 'background-color': C['outside'] });
    expect(calendar['chosen']).toEqual({ 'background-color': C['picked'], 'box-shadow': `${C['pickedRing']} 0px 0px 0px 1px inset` });
    expect(calendar['date']).toMatchObject({ height: '20px', 'font-size': '11px', 'font-weight': '500', color: C['fg'] });
    expect(calendar['date']!['border-top-left-radius'], 'the date is round').toMatch(/^[1-9]/);
    expect(calendar['today'], 'today is filled with the primary').toEqual({ 'background-color': C['primary'], color: C['primaryFg'] });
    expect(calendar['outsideDate'], 'a date of another month is muted').toEqual({ color: C['muted'] });
    expect(calendar['events']).toEqual({ 'row-gap': '2px', 'z-index': '1', position: 'relative' });
    expect(calendar['more']).toEqual({ 'font-size': '10.5px', 'padding-left': '4px', color: C['muted'] });
    expect(calendar['event'], 'an event: 19px tall, a 4px radius, its colour mixed over the surface').toEqual({
      height: '19px', 'padding-left': '6px', 'column-gap': '4px', 'font-size': '11px', 'line-height': '17px', 'border-top-left-radius': '4px', 'border-top-width': '1px',
      'background-color': C['teal12'], 'border-top-color': C['teal30'], color: C['teal75'], 'overflow-x': 'hidden', 'white-space': 'nowrap',
    });
    expect(calendar['bare'], 'with no colour set, the primary').toEqual({ 'background-color': C['primary12'] });
    expect(calendar['time']).toEqual({ 'font-variant-numeric': 'tabular-nums', opacity: '0.7' });
    expect(calendar['continued'], 'the end of one that runs on is square and borderless').toEqual({ 'border-right-width': '0px', 'border-top-right-radius': '0px', 'border-bottom-right-radius': '0px', 'border-left-width': '1px', 'border-top-left-radius': '4px' });
    expect(calendar['continues'], 'and so is the start of one that came before').toEqual({ 'border-left-width': '0px', 'border-top-left-radius': '0px', 'border-bottom-left-radius': '0px', 'border-right-width': '1px', 'border-top-right-radius': '4px' });
    const grid = await id('cal-month').evaluate((el) => {
      const rect = (e: Element) => e.getBoundingClientRect();
      const days = [...el.querySelectorAll('.af-cal-day')];
      const cell = days[8]!;
      const button = rect(cell.querySelector('.af-cal-day-button')!);
      const date = rect(cell.querySelector('.af-cal-date')!);
      const tops = [...days[17]!.querySelectorAll('.af-event')].map((e) => rect(e).top);
      return {
        count: days.length,
        equal: new Set(days.slice(0, 7).map((d) => Math.round(rect(d).width))).size,
        shortest: Math.min(...days.map((d) => rect(d).height)),
        button: [button.left - rect(cell).left, button.top - rect(cell).top, rect(cell).right - button.right, rect(cell).bottom - button.bottom, getComputedStyle(cell.querySelector('.af-cal-day-button')!).position],
        placing: { right: rect(cell).right - date.right, top: date.top - rect(cell).top, below: rect(cell.querySelector('.af-cal-events')!).top - rect(cell).top },
        gaps: tops.slice(1).map((top, i) => top - tops[i]!),
        more: days[17]!.querySelector('.af-cal-more')!.textContent,
      };
    });
    expect(grid.count, '35 days').toBe(35);
    expect(grid.equal, 'in equal columns').toBe(1);
    expect(grid.shortest, 'each at least 116px tall').toBeGreaterThanOrEqual(116);
    expect(grid.button, "a day's button covers its cell inside its end and bottom lines").toEqual([0, 0, 1, 1, 'absolute']);
    expect(grid.placing, 'the date sits 6px from the end and 4px from the top, and the events begin below it').toEqual({ right: 7, top: 4, below: 24 });
    expect(grid.gaps, 'events are 21px apart: 19px and a 2px gap').toEqual([21, 21]);
    expect(grid.more).toBe('+3 more');
    const hovered = async (selector: string, prop: string) => {
      await pane.locator(selector).first().hover();
      const value = await pane.locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
      await page.mouse.move(0, 0);
      return value;
    };
    expect(await hovered(`${month} .af-cal-day:nth-child(9) .af-cal-day-button`, 'background-color'), "a day's button tints its cell under the pointer").toBe(C['tint']);
    expect(await hovered(`${month} .af-cal-more`, 'color'), 'the more button is the foreground under the pointer').toBe(C['fg']);

    // The week: the hour rail of 56px and seven columns, the all-day label, the hours of --af-cal-hour (48px) and a block placed over its hour.
    const week = one('cal-week');
    const strip = await probe({
      week: [`${week} .af-cal-week`, ['grid-template-columns']],
      hours: [`${week} .af-cal-hours`, ['grid-template-columns']],
      label: [`${week} .af-cal-allday-label`, ['font-size', 'text-transform', 'text-align', 'letter-spacing', 'color', 'border-right-width']],
      hour: [`${week} .af-cal-hour-label`, ['font-size', 'font-variant-numeric', 'color', 'text-align', 'border-top-width']],
      next: [`${week} .af-cal-hour-label`, ['border-top-width'], '', 1],
      block: [`${week} .af-event.block`, ['position', 'font-size', 'line-height', 'padding-left', 'border-top-left-radius', 'top', 'height']],
    });
    expect(strip['week']!['grid-template-columns']!.split(' ')[0]).toBe('56px');
    expect(strip['hours']!['grid-template-columns']!.split(' '), 'a rail and seven columns').toHaveLength(8);
    expect(strip['label']).toEqual({ 'font-size': '10px', 'text-transform': 'uppercase', 'text-align': 'end', 'letter-spacing': '0.25px', color: C['muted'], 'border-right-width': '1px' });
    expect(strip['hour']).toEqual({ 'font-size': '10px', 'font-variant-numeric': 'tabular-nums', color: C['muted'], 'text-align': 'end', 'border-top-width': '0px' });
    expect(strip['next'], 'a line over every hour but the first').toEqual({ 'border-top-width': '1px' });
    expect(strip['block']).toEqual({ position: 'absolute', 'font-size': '10.5px', 'line-height': '13.125px', 'padding-left': '1px', 'border-top-left-radius': '4px', top: '24px', height: '46px' });
    const hours = await id('cal-week').evaluate((el) => {
      const rect = (e: Element) => e.getBoundingClientRect();
      const labels = [...el.querySelectorAll('.af-cal-hour-label')].map((e) => rect(e).height);
      const block = el.querySelector('.af-event.block')!;
      const hour = rect(block.parentElement!);
      (el.querySelector('.af-cal-hours') as HTMLElement).style.setProperty('--af-cal-hour', '64px');
      return { labels, block: [rect(block).left - hour.left, rect(block).top - hour.top, hour.right - rect(block).right], taller: rect(el.querySelector('.af-cal-hour')!).height };
    });
    expect(hours.labels, 'an hour is 48px').toEqual([48, 48, 48]);
    expect(hours.block, 'a block fills its hour sideways, inside its end line, and starts where the page puts it').toEqual([0, 24, 1]);
    expect(hours.taller, 'the page sets the height of an hour').toBe(64);
  });
}

for (const theme of ['light', 'dark'] as const) {
  // Its own test, like the view classes': the display classes' test is close to its time limit in WebKit. The values of the elements a spec names are read in one
  // evaluate and each colour in another, since each round trip to the page costs more in WebKit than the reading does.
  test(`the filter classes draw inside a shadow root in ${theme}`, async ({ page }) => {
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    const id = (name: string) => pane.locator(`[data-testid="${theme}-${name}"]`);
    const one = (name: string) => `[data-testid="${theme}-${name}"]`;
    await id('filters').scrollIntoViewIfNeeded();
    const probe = (spec: StyleSpec) => computedIn(pane, spec);
    const C = await paintedIn(
      pane,
      {
        line: 'var(--k-line)', surface: 'var(--k-surface)', muted: 'var(--k-muted)', mutedBg: 'var(--k-muted-bg)', fg: 'var(--k-fg)', primary: 'var(--k-primary)', warning: 'var(--k-warning)',
        secondary: 'var(--k-secondary)', secondaryFg: 'var(--k-secondary-fg)', accent: 'var(--k-accent)', blue: '#2a78d6', clear: 'transparent',
        tinted: mixed('var(--k-primary)', 8, 'var(--k-surface)'), radius2: 'radius -2',
      }
    );
    const ring = /0px 0px 0px 3px/;
    const hovered = async (locator: Locator, prop: string) => {
      await locator.hover();
      const value = await locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
      await page.mouse.move(0, 0);
      return value;
    };

    // The bar is a column of 8px gaps and a row of chips wraps with 6px between them.
    const bars = await probe({
      bar: [one('filter-bar'), ['display', 'flex-direction', 'row-gap']],
      row: [one('filter-row'), ['display', 'flex-wrap', 'align-items', 'column-gap', 'row-gap']],
    });
    expect(bars['bar']).toEqual({ display: 'flex', 'flex-direction': 'column', 'row-gap': '8px' });
    expect(bars['row']).toEqual({ display: 'flex', 'flex-wrap': 'wrap', 'align-items': 'center', 'column-gap': '6px', 'row-gap': '6px' });

    // A chip: 24px tall on the secondary ground in 11.5px text, with 4px at its end where the remove button is and 8px where it is not.
    const chip = one('filter-status');
    const chips = await probe({
      chip: [chip, ['height', 'max-width', 'padding-top', 'padding-left', 'padding-right', 'column-gap', 'border-top-width', 'border-top-style', 'border-top-color', 'border-top-left-radius', 'background-color', 'color', 'font-size', 'font-weight', 'overflow-x']],
      edit: [one('filter-status-edit'), ['font-size', 'text-overflow', 'overflow-x', 'white-space', 'cursor', 'border-top-width', 'background-color', 'min-width']],
      field: [`${chip} .af-filter-chip-field`, ['opacity']],
      op: [`${chip} b`, ['font-weight']],
      remove: [one('filter-status-remove'), ['width', 'height', 'opacity', 'cursor', 'background-color']],
      glyph: [`${one('filter-status-remove')} svg`, ['width', 'height']],
      preset: [one('filter-preset'), ['padding-left', 'padding-right', 'background-color', 'color', 'border-top-style']],
      presetEdit: [`${one('filter-preset')} .af-filter-chip-edit`, ['text-overflow', 'overflow-x', 'cursor']],
      aside: [one('filter-aside'), ['padding-right', 'background-color', 'color', 'border-top-style', 'border-top-color']],
      clear: [one('filter-clear'), ['font-size', 'color', 'text-decoration-line', 'text-underline-offset', 'margin-left', 'background-color', 'border-top-width', 'cursor']],
    });
    expect(chips['chip']).toMatchObject({ height: '24px', 'max-width': '288px', 'padding-top': '0px', 'padding-left': '8px', 'padding-right': '4px', 'column-gap': '4px', 'border-top-width': '1px', 'border-top-style': 'solid', 'border-top-color': C['clear'], 'background-color': C['secondary'], color: C['secondaryFg'], 'font-size': '11.5px', 'font-weight': '400', 'overflow-x': 'visible' });
    expect(chips['chip']!['border-top-left-radius'], 'the chip is round').toMatch(/^[1-9]/);
    expect(chips['edit'], 'the edit button is its text: bare, one line and clipped by an ellipsis').toEqual({ 'font-size': '11.5px', 'text-overflow': 'ellipsis', 'overflow-x': 'hidden', 'white-space': 'nowrap', cursor: 'pointer', 'border-top-width': '0px', 'background-color': C['clear'], 'min-width': '0px' });
    expect(chips['field'], 'the field is dimmed').toEqual({ opacity: '0.7' });
    expect(chips['op'], 'and the operator and the value are heavier').toEqual({ 'font-weight': '500' });
    expect(chips['remove']).toEqual({ width: '12px', height: '12px', opacity: '0.6', cursor: 'pointer', 'background-color': C['clear'] });
    expect(chips['glyph']).toEqual({ width: '12px', height: '12px' });
    expect(chips['preset'], 'a quick filter is the primary at 8% in the primary text, with no remove button').toMatchObject({ 'padding-left': '8px', 'padding-right': '8px', 'background-color': C['tinted'], color: C['primary'], 'border-top-style': 'solid' });
    expect(chips['presetEdit'], 'its text is not a button').toMatchObject({ 'text-overflow': 'ellipsis', 'overflow-x': 'hidden' });
    expect(chips['presetEdit']!['cursor']).not.toBe('pointer');
    await expect(id('filter-preset').locator('button')).toHaveCount(0);
    expect(chips['aside'], 'a chip set aside is dashed, muted and ungrounded').toEqual({ 'padding-right': '8px', 'background-color': C['clear'], color: C['muted'], 'border-top-style': 'dashed', 'border-top-color': C['line'] });
    expect(chips['clear']).toEqual({ 'font-size': '11.5px', color: C['muted'], 'text-decoration-line': 'underline', 'text-underline-offset': '2px', 'margin-left': '2px', 'background-color': C['clear'], 'border-top-width': '0px', cursor: 'pointer' });
    expect(await hovered(id('filter-status-remove'), 'opacity'), 'the remove button is at full strength under the pointer').toBe('1');
    expect(await hovered(id('filter-clear'), 'color'), 'the clear link takes the foreground under the pointer').toBe(C['fg']);
    // A chip with a long list of values stops at 288px, and its text gives way to an ellipsis, with the remove button kept whole.
    const long = await id('filter-long').evaluate((el) => {
      const edit = el.querySelector('.af-filter-chip-edit') as HTMLElement;
      const remove = el.querySelector('.af-filter-chip-remove')!.getBoundingClientRect();
      return { chip: el.getBoundingClientRect().width, clipped: edit.scrollWidth > edit.clientWidth, removeInside: remove.right <= el.getBoundingClientRect().right && remove.width === 12 };
    });
    expect(long.chip, 'the chip stops at 288px').toBeCloseTo(288, 0);
    expect(long.clipped, 'the text is cut off').toBe(true);
    expect(long.removeInside, 'and the remove button is whole').toBe(true);
    // Each button of a chip is its own tab stop and draws the kit's ring around itself, which the pill does not clip.
    await id('filter-status-edit').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(id('filter-status-edit'), "the edit button's ring").toHaveCSS('box-shadow', ring);
    await page.keyboard.press('Tab');
    await expect(id('filter-status-remove')).toBeFocused();
    await expect(id('filter-status-remove'), "the remove button's ring").toHaveCSS('box-shadow', ring);
    await id('filter-clear').focus();
    await expect(id('filter-clear'), "the clear link's ring").toHaveCSS('box-shadow', ring);
    await page.mouse.move(0, 0);

    // The search box: a label at least 128px wide, the magnifier inside its start, the input and the clear button inside its end.
    const boxes = await probe({
      label: [one('search'), ['position', 'min-width', 'max-width', 'display']],
      icon: [`${one('search')} > svg`, ['position', 'left', 'width', 'height', 'color', 'pointer-events', 'translate']],
      input: [one('search-input'), ['height', 'padding-left', 'padding-right', 'font-size', 'line-height']],
      xs: [one('search-xs-input'), ['height', 'padding-left']],
      clear: [one('search-clear'), ['position', 'right', 'width', 'height', 'color', 'background-color', 'border-top-width', 'display', 'cursor']],
      glyph: [`${one('search-clear')} svg`, ['width', 'height']],
    });
    expect(boxes['label']).toEqual({ position: 'relative', 'min-width': '128px', 'max-width': '320px', display: 'block' });
    expect(boxes['icon'], 'the magnifier is 14px, 10px in from the start, muted and inert').toEqual({ position: 'absolute', left: '10px', width: '14px', height: '14px', color: C['muted'], 'pointer-events': 'none', translate: '0px -50%' });
    expect(boxes['input']).toEqual({ height: '32px', 'padding-left': '32px', 'padding-right': '28px', 'font-size': '14px', 'line-height': '20px' });
    expect(boxes['xs'], 'xs makes it 28px').toEqual({ height: '28px', 'padding-left': '32px' });
    expect(boxes['clear']).toEqual({ position: 'absolute', right: '4px', width: '20px', height: '20px', color: C['muted'], 'background-color': C['clear'], 'border-top-width': '0px', display: 'none', cursor: 'pointer' });
    expect(boxes['glyph']).toEqual({ width: '12px', height: '12px' });
    const placing = await id('search').evaluate((el) => {
      const rect = (e: Element) => e.getBoundingClientRect();
      const icon = rect(el.querySelector('svg')!);
      const input = rect(el.querySelector('input')!);
      return { iconStart: icon.left - input.left, iconMiddle: icon.top + icon.height / 2 - (input.top + input.height / 2), fills: rect(el).width === input.width };
    });
    expect(placing.iconStart, 'the magnifier sits 10px in').toBe(10);
    expect(placing.iconMiddle, 'and in the middle of the input').toBeCloseTo(0, 0);
    expect(placing.fills, 'the input fills the label').toBe(true);
    await id('search-input').pressSequentially('INV');
    expect(await id('search-clear').evaluate((el) => getComputedStyle(el).display), 'the clear button shows once the input holds text').not.toBe('none');
    expect(await hovered(id('search-clear'), 'color'), 'and takes the foreground under the pointer').toBe(C['fg']);
    await id('search-clear').focus();
    await expect(id('search-clear')).toHaveCSS('box-shadow', ring);
    await id('search-clear').click();

    // A facet: a column of cards 240px wide, 16px apart, each with a heading, its options and, in the first, a note, the range and a button.
    const facetStatus = one('facet-status');
    const firstOption = one('facet-status-option-0');
    const facets = await probe({
      bar: [one('facets'), ['display', 'flex-direction', 'row-gap', 'width']],
      card: [facetStatus, ['padding-top', 'padding-left', 'border-top-width', 'border-top-color', 'border-top-left-radius', 'background-color', 'color']],
      header: [`${facetStatus} .af-facet-header`, ['display', 'justify-content', 'align-items', 'margin-bottom']],
      title: [`${facetStatus} h3`, ['font-size', 'font-weight', 'margin-top', 'color']],
      note: [`${facetStatus} .af-facet-note`, ['font-size', 'text-transform', 'letter-spacing', 'color']],
      list: [`${facetStatus} .af-facet-list`, ['display', 'row-gap', 'padding-right', 'list-style-type', 'margin-top']],
      option: [firstOption, ['display', 'column-gap', 'align-items']],
      check: [`${firstOption} .af-checkbox`, ['width', 'height', 'flex-shrink']],
      dot: [`${firstOption} .af-facet-dot`, ['width', 'height', 'background-color', 'flex-shrink']],
      round: [`${firstOption} .af-facet-dot`, ['border-top-left-radius']],
      label: [`${firstOption} label`, ['flex-grow', 'font-size', 'cursor', 'overflow-x', 'text-overflow', 'white-space', 'color']],
      zero: [`${one('facet-status-option-6')} label`, ['color']],
      count: [`${firstOption} .af-facet-count`, ['font-size', 'color', 'font-variant-numeric']],
      stats: [`${facetStatus} .af-facet-stats`, ['font-size', 'color', 'margin-top', 'padding-top']],
      more: [`${facetStatus} .af-facet-more`, ['font-size', 'font-weight', 'color', 'cursor', 'padding-top', 'padding-left', 'margin-top', 'background-color']],
    });
    expect(facets['bar']).toEqual({ display: 'flex', 'flex-direction': 'column', 'row-gap': '16px', width: '240px' });
    expect(facets['card']).toEqual({ 'padding-top': '12px', 'padding-left': '12px', 'border-top-width': '1px', 'border-top-color': C['line'], 'border-top-left-radius': C['radius2'], 'background-color': C['surface'], color: C['fg'] });
    expect(facets['header']).toEqual({ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px' });
    expect(facets['title']).toEqual({ 'font-size': '12px', 'font-weight': '500', 'margin-top': '0px', color: C['fg'] });
    expect(facets['note'], 'the note is small, upper-case and in the warning tone').toEqual({ 'font-size': '10px', 'text-transform': 'uppercase', 'letter-spacing': '0.25px', color: C['warning'] });
    expect(facets['list']).toEqual({ display: 'grid', 'row-gap': '6px', 'padding-right': '8px', 'list-style-type': 'none', 'margin-top': '0px' });
    expect(facets['option']).toEqual({ display: 'flex', 'column-gap': '8px', 'align-items': 'center' });
    expect(facets['check']).toEqual({ width: '16px', height: '16px', 'flex-shrink': '0' });
    expect(facets['dot'], 'the dot is 8px, and in the colour the page sets').toEqual({ width: '8px', height: '8px', 'background-color': C['blue'], 'flex-shrink': '0' });
    expect(facets['round']!['border-top-left-radius'], 'and round').toMatch(/^[1-9]/);
    expect(facets['label']).toEqual({ 'flex-grow': '1', 'font-size': '12px', cursor: 'pointer', 'overflow-x': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', color: C['fg'] });
    expect(facets['zero'], 'an option with no records is muted').toEqual({ color: C['muted'] });
    expect(facets['count']).toEqual({ 'font-size': '11px', color: C['muted'], 'font-variant-numeric': 'tabular-nums' });
    expect(facets['stats']).toEqual({ 'font-size': '11px', color: C['muted'], 'margin-top': '6px', 'padding-top': '4px' });
    expect(facets['more']).toEqual({ 'font-size': '11px', 'font-weight': '500', color: C['muted'], cursor: 'pointer', 'padding-top': '4px', 'padding-left': '4px', 'margin-top': '4px', 'background-color': C['clear'] });
    const more = id('facet-status').locator('.af-facet-more');
    expect(await hovered(more, 'color'), 'the more button takes the foreground under the pointer').toBe(C['fg']);
    await more.focus();
    await expect(more).toHaveCSS('box-shadow', ring);
    // A label too long for its row gives way to an ellipsis and leaves the count where the others are; a label belongs to its option's checkbox.
    const rows = await id('facet-status').evaluate((el) => {
      const rect = (e: Element) => e.getBoundingClientRect();
      const options = [...el.querySelectorAll('.af-facet-option')];
      const label = options[7]!.querySelector('label') as HTMLElement;
      return {
        clipped: label.scrollWidth > label.clientWidth,
        counts: [options[0], options[7]].map((o) => rect(o!.querySelector('.af-facet-count')!).right),
        list: rect(el.querySelector('.af-facet-list')!).right - 8,
        gaps: options.slice(1).map((o, i) => rect(o).top - rect(options[i]!).bottom),
        reachable: (options[0]!.querySelector('label') as HTMLLabelElement).control === options[0]!.querySelector('input'),
      };
    });
    expect(rows.clipped, 'the long name is cut off').toBe(true);
    expect(rows.counts[1], 'and its count still ends where the others do').toBeCloseTo(rows.counts[0]!, 0);
    expect(rows.counts[0], 'inside the list and its padding').toBeCloseTo(rows.list, 0);
    expect(rows.gaps, 'options are 6px apart').toEqual(Array(7).fill(6));
    expect(rows.reachable, "a label belongs to its option's checkbox").toBe(true);
    // The first facet's eight options fit; the second's fourteen are held to 224px by its scroll area, which scrolls them.
    const heights = await pane.evaluate(
      (root, names) =>
        names.map((n) => {
          const area = root.querySelector(n) as HTMLElement & { viewport: HTMLElement };
          return [area.getBoundingClientRect().height, area.viewport.scrollHeight, area.viewport.clientHeight];
        }),
      [one('facet-status-area'), one('facet-owner-area')]
    );
    expect(heights[0]![0], 'eight options are under 224px, and nothing scrolls').toBeLessThan(224);
    expect(heights[0]![1]).toBeLessThanOrEqual(heights[0]![2]! + 1);
    expect(heights[1]![0], 'fourteen are held to 224px').toBe(224);
    expect(heights[1]![1], 'and scroll').toBeGreaterThan(224);

    // The chip as a toggle: 26px, quiet until pressed, the primary at 8% once it is, and 22px when compact; a locked one dims and keeps its focus.
    const toggles = await probe({
      on: [one('toggle-all'), ['height', 'padding-left', 'column-gap', 'border-top-width', 'border-top-left-radius', 'font-size', 'font-weight', 'background-color', 'color', 'cursor']],
      off: [one('toggle-open'), ['background-color', 'color', 'height']],
      compactOn: [one('toggle-compact-on'), ['height', 'padding-left', 'font-size', 'border-top-left-radius', 'background-color']],
      compact: [one('toggle-compact'), ['height', 'padding-left', 'font-size', 'font-weight', 'color']],
      locked: [one('chip-locked'), ['opacity', 'cursor', 'background-color']],
      plain: [one('chip-button'), ['cursor', 'margin-top']],
    });
    expect(toggles['on']).toEqual({ height: '26px', 'padding-left': '10px', 'column-gap': '6px', 'border-top-width': '0px', 'border-top-left-radius': C['radius2'], 'font-size': '12px', 'font-weight': '500', 'background-color': C['tinted'], color: C['primary'], cursor: 'pointer' });
    expect(toggles['off'], 'an unpressed toggle has no ground and the muted text').toEqual({ 'background-color': C['clear'], color: C['muted'], height: '26px' });
    expect(toggles['compactOn']).toEqual({ height: '22px', 'padding-left': '8px', 'font-size': '11.5px', 'border-top-left-radius': C['radius2'], 'background-color': C['tinted'] });
    expect(toggles['compact']).toEqual({ height: '22px', 'padding-left': '8px', 'font-size': '11.5px', 'font-weight': '500', color: C['muted'] });
    expect(toggles['locked'], 'a locked chip is at 60% and shows that nothing happens').toMatchObject({ opacity: '0.6', cursor: 'not-allowed' });
    expect(toggles['plain'], 'a button chip shows the pointer and has no margin of its own').toEqual({ cursor: 'pointer', 'margin-top': '0px' });
    expect(await hovered(id('toggle-open'), 'background-color'), 'an unpressed toggle takes the muted ground under the pointer').toBe(C['mutedBg']);
    expect(await hovered(id('toggle-open'), 'color'), 'and the foreground').toBe(C['fg']);
    expect(await hovered(id('toggle-all'), 'background-color'), 'a pressed one keeps its ground').toBe(C['tinted']);
    expect(await hovered(id('chip-locked'), 'background-color'), 'a locked chip does not light under the pointer').toBe(toggles['locked']!['background-color']);
    expect(await hovered(id('chip-button'), 'background-color'), 'an outline button chip takes the accent ground, as a link does').toBe(C['accent']);
    // A link chip that is locked does not light either.
    const link = id('chips').locator('a.af-chip.outline');
    expect(await hovered(link, 'background-color'), 'a link chip takes the accent ground under the pointer').toBe(C['accent']);
    await link.evaluate((el) => el.setAttribute('aria-disabled', 'true'));
    expect(await hovered(link, 'background-color'), 'and does not once it is locked').toBe(C['clear']);
    await link.evaluate((el) => el.removeAttribute('aria-disabled'));
    await id('chip-locked').focus();
    await expect(id('chip-locked'), 'a locked chip keeps its focus').toBeFocused();
    await expect(id('chip-locked'), 'and draws the ring').toHaveCSS('box-shadow', ring);
    expect(await id('chip-locked').getAttribute('aria-describedby')).toBe(`${theme}-why`);
  });
}

test("the search's clear button appears once something is typed and empties the input", async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const input = pane.locator('[data-testid="light-search-input"]');
  const clear = pane.locator('[data-testid="light-search-clear"]');
  await input.scrollIntoViewIfNeeded();
  await expect(clear, 'hidden while the input shows its placeholder').toBeHidden();
  await input.pressSequentially('INV-0042');
  await expect(clear, 'shown once there is text').toBeVisible();
  // Its box is inside the input, at the end, 4px in.
  const box = await clear.boundingBox();
  const field = await input.boundingBox();
  expect(box!.x + box!.width, 'inside the end of the input, 4px in').toBeCloseTo(field!.x + field!.width - 4, 0);
  // Where the browser draws its own cancel button (the end of the text's box, 28px in) there is nothing to press: it is hidden, and a click there does not empty the input.
  await page.mouse.click(field!.x + field!.width - 28 - 8, field!.y + field!.height / 2);
  await expect(input, "the browser's own cancel button is gone").toHaveValue('INV-0042');
  await clear.click();
  await expect(input, 'the click empties the input').toHaveValue('');
  await expect(input, 'and puts the caret back in it').toBeFocused();
  await expect(clear, 'and the button goes again').toBeHidden();
  await input.pressSequentially('a');
  await input.press('Backspace');
  await expect(clear, 'deleting the text by hand hides it too').toBeHidden();
});

test("a card's checkbox appears under the pointer and the card's link rings the card on focus", async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  await pane.locator('[data-testid="light-views"]').scrollIntoViewIfNeeded();
  const card = pane.locator('[data-testid="light-card-0"]');
  const check = pane.locator('[data-testid="light-card-0-check"]');
  const link = pane.locator('[data-testid="light-card-0-link"]');
  const border = () => card.evaluate((el) => getComputedStyle(el).borderTopColor);

  await page.mouse.move(0, 0);
  await expect(check, 'hidden at rest').toHaveCSS('opacity', '0');
  const resting = await border();
  await card.hover();
  await expect(check, 'shown under the pointer').toHaveCSS('opacity', '1');
  await expect.poll(border, { message: 'and the border strengthens' }).not.toBe(resting);
  await page.mouse.move(0, 0);
  await expect(check).toHaveCSS('opacity', '0');

  // The link is the card's keyboard stop and covers it; its focus rings the card itself.
  await expect(card).toHaveCSS('box-shadow', /0px 1px 3px 0px/);
  await link.focus();
  await expect(link).toBeFocused();
  await expect(card, 'the ring is the card\'s own').toHaveCSS('box-shadow', /0px 0px 0px 3px/);
  await expect(check, 'the checkbox stays hidden for the link').toHaveCSS('opacity', '0');
  await page.keyboard.press('Tab');
  await expect(check).toBeFocused();
  await expect(check, 'shown once the checkbox has focus').toHaveCSS('opacity', '1');
  await page.keyboard.press('Space');
  await expect(card, 'a checked card is chosen').toHaveAttribute('aria-selected', 'true');
  await page.mouse.move(0, 0);
  await check.blur();
  await expect(check, 'and a checked box stays shown').toHaveCSS('opacity', '1');
});

test('the steps draw their markers, connectors and four states', async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const steps = pane.locator('[data-testid="light-steps"]');
  const step = steps.locator('.af-step');
  const marker = steps.locator('.af-step-marker');
  const token = (name: string) =>
    pane.evaluate((el, n) => {
      const probe = Object.assign(document.createElement('span'), { style: `color: var(${n})` });
      el.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    }, name);
  const style = (locator: Locator, prop: string, pseudo?: '::before') => locator.evaluate((el, [p, q]) => getComputedStyle(el, q || null).getPropertyValue(p!), [prop, pseudo ?? ''] as const);

  await expect(steps).toHaveCSS('list-style-type', 'none');
  const boxes = await marker.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()).map((r) => [r.width, r.height, r.left + r.width / 2]));
  for (const [width, height] of boxes) expect([width, height], 'a 24px marker').toEqual([24, 24]);
  const columns = await step.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  expect(new Set(columns.map(Math.round)).size, 'equal columns').toBe(1);
  await expect(marker.first()).toHaveCSS('border-top-left-radius', /^[1-9]/);
  await expect(steps.locator('.af-step-label').first()).toHaveCSS('font-size', '12px');
  const gap = await step.first().evaluate((el) => el.querySelector('.af-step-label')!.getBoundingClientRect().top - el.querySelector('.af-step-marker')!.getBoundingClientRect().bottom);
  expect(gap, 'the label sits 6px below the marker').toBe(6);

  // The states, by token: done is filled in the primary, the current one outlined in it, one still to come in the line colour, and a failed one filled in the danger tone.
  expect(await style(marker.nth(0), 'background-color')).toBe(await token('--k-primary'));
  expect(await style(marker.nth(0), 'color')).toBe(await token('--k-primary-fg'));
  expect(await style(marker.nth(1), 'border-top-color')).toBe(await token('--k-primary'));
  expect(await style(marker.nth(1), 'color')).toBe(await token('--k-primary'));
  expect(await style(marker.nth(1), 'background-color')).toBe('rgba(0, 0, 0, 0)');
  expect(await style(marker.nth(2), 'border-top-color')).toBe(await token('--k-line'));
  expect(await style(marker.nth(2), 'color')).toBe(await token('--k-muted'));
  expect(await style(marker.nth(3), 'background-color')).toBe(await token('--k-danger'));

  // A connector joins a marker to the one before it, from edge to edge of the gap, and is the primary after a done step.
  await expect(step.first()).toHaveCSS('position', 'relative');
  expect(await style(step.first(), 'content', '::before'), 'none before the first').toBe('none');
  for (const i of [1, 2, 3]) {
    const line = await step.nth(i).evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      const column = el.getBoundingClientRect();
      const left = column.left + parseFloat(before.left);
      return { height: before.height, width: parseFloat(before.width), left, right: left + parseFloat(before.width) };
    });
    expect(line.height, `the connector into step ${i + 1} is 1px`).toBe('1px');
    expect(line.left, 'it starts 4px after the marker before it').toBeCloseTo(boxes[i - 1]![2]! + 12 + 4, 0);
    expect(line.right, 'and ends 4px before this one').toBeCloseTo(boxes[i]![2]! - 12 - 4, 0);
  }
  expect(await style(step.nth(1), 'background-color', '::before'), 'after a done step').toBe(await token('--k-primary'));
  expect(await style(step.nth(2), 'background-color', '::before'), 'after the current one').toBe(await token('--k-line'));
  expect(await style(step.nth(3), 'background-color', '::before')).toBe(await token('--k-line'));

  // aria-current="step" marks the current step as its data-state does.
  await step.nth(1).evaluate((el) => {
    el.removeAttribute('data-state');
    el.setAttribute('aria-current', 'step');
  });
  expect(await style(marker.nth(1), 'border-top-color')).toBe(await token('--k-primary'));
  expect(await style(marker.nth(1), 'border-top-width')).toBe('2px');
});

test("in a right-to-left page the timeline's line stays under its dots, and the chevrons point the other way", async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const read = () =>
    pane.evaluate((root) => {
      const item = root.querySelector('[data-testid="light-timeline"] .af-timeline-item')!;
      const box = item.getBoundingClientRect();
      const line = getComputedStyle(item, '::before');
      const width = parseFloat(line.width);
      const start = getComputedStyle(item).direction === 'rtl' ? box.right - parseFloat(line.right) - width : box.left + parseFloat(line.left);
      const dot = item.querySelector('.af-timeline-dot')!.getBoundingClientRect();
      return {
        apart: Math.abs(start + width / 2 - (dot.left + dot.width / 2)),
        crumb: getComputedStyle(root.querySelectorAll('[data-testid="light-breadcrumb"] li')[1]!, '::before').transform,
        chevron: getComputedStyle(root.querySelector('[data-testid="light-disclosure-eyebrow"] .af-disclosure-toggle > svg')!).transform,
      };
    });
  expect(await read()).toEqual({ apart: 0, crumb: 'none', chevron: 'none' });
  await pane.evaluate((root) => {
    for (const name of ['timeline', 'breadcrumb', 'disclosure-eyebrow']) root.querySelector(`[data-testid="light-${name}"]`)!.setAttribute('dir', 'rtl');
  });
  // The chevron turns over 100 ms, so the reading is polled until it rests.
  await expect.poll(async () => (await read()).chevron, { message: "a closed disclosure's chevron points left" }).toBe('matrix(-1, 0, 0, 1, 0, 0)');
  const mirrored = await read();
  expect(mirrored.apart, 'the line runs through the middle of the dot').toBeLessThanOrEqual(0.5);
  expect(mirrored.crumb, "the breadcrumb's chevron points left").toBe('matrix(-1, 0, 0, 1, 0, 0)');
});

test("a disclosure's toggle turns its chevron and hides its body", async ({ page }) => {
  await page.goto('/gallery/');
  const disclosure = page.locator('[data-theme="light"] .gallery [data-testid="light-disclosure"]');
  const toggle = disclosure.locator('.af-disclosure-toggle');
  const body = disclosure.locator('.af-disclosure-body');
  const chevron = toggle.locator('svg');
  const turn = () => chevron.evaluate((el) => getComputedStyle(el).transform);

  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(body).toBeVisible();
  await expect.poll(turn, { message: 'open, the chevron has turned a quarter' }).toBe('matrix(0, 1, -1, 0, 0, 0)');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(body, 'a closed section hides its body').toBeHidden();
  await expect.poll(turn, { message: 'and the chevron points right again' }).toBe('none');
  await toggle.click();
  await expect(body).toBeVisible();
  await expect.poll(turn).toBe('matrix(0, 1, -1, 0, 0, 0)');

  // The toggle is a tab stop with the kit's focus ring.
  await toggle.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS('box-shadow', /0px 0px 0px 3px/);
});

// The classes reach a module as one string in its own shadow root, so a rule the engine rejects shows here. A selector list
// that holds an engine's pseudo-element another engine does not know is dropped whole; this is how that was found.
test("a progress bar is drawn in the system's colours under forced colours", async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/gallery/');
  const row = page.locator('[data-theme="light"] .gallery [data-testid="light-progress"]');
  const paint = async (selector: string, points: readonly (readonly [number, number])[]) => {
    const png = (await row.locator(selector).first().screenshot()).toString('base64');
    return page.evaluate(
      async ({ png, points }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const canvas = Object.assign(document.createElement('canvas'), { width: image.width, height: image.height });
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(image, 0, 0);
        return points.map(([x, y]) => Array.from(ctx.getImageData(Math.min(image.width - 1, Math.floor(x * image.width)), Math.min(image.height - 1, Math.floor(y * image.height)), 1, 1).data));
      },
      { png, points },
    );
  };
  // What a system colour paints under this emulation: the pixel of a swatch that opts out of the adjustment, beside the
  // bars so that it is painted over what they are (a translucent colour such as WebKit's grey text depends on it).
  const system = async (colour: string) => {
    await row.evaluate((row, colour) => {
      const swatch = Object.assign(document.createElement('div'), { id: 'system-colour-swatch' });
      swatch.style.cssText = `width: 16px; height: 16px; forced-color-adjust: none; background-color: ${colour}`;
      row.append(swatch);
    }, colour);
    const [pixel] = await paint('#system-colour-swatch', [[0.5, 0.5]]);
    await row.evaluate((row) => row.querySelector('#system-colour-swatch')?.remove());
    return pixel!;
  };
  const apart = (a: number[], b: number[]) => Math.max(...a.map((channel, i) => Math.abs(channel - b[i]!)));
  const shows = (a: number[], b: number[]) => apart(a, b) >= 51;
  const [highlight, grey, canvas] = [await system('Highlight'), await system('GrayText'), await system('Canvas')];

  // The fill is the highlight on a canvas track with a grey edge. In Chromium these are the forced palette; WebKit's
  // emulation overrides no colours, so there this holds the kit's own rules, which name the same colours.
  // The edge is the outermost pixel row of an 8px bar, which a bar that sits on a half pixel spreads over two.
  const [fill, track, edge, edgeBelow] = await paint('.af-progress:not(.circular)', [[0.2, 0.5], [0.8, 0.5], [0.5, 0], [0.5, 0.125]]);
  expect(apart(fill!, highlight), `the fill is Highlight: ${fill} against ${highlight}`).toBeLessThanOrEqual(2);
  expect(apart(track!, canvas), `the track is Canvas: ${track} against ${canvas}`).toBeLessThanOrEqual(2);
  expect(shows(edge!, track!) || shows(edgeBelow!, track!), "the track's edge shows against it").toBe(true);
  // A ring a quarter full, on its own radius: 45 degrees clockwise from the top is filled, 225 is not.
  const at = (degrees: number): [number, number] => [0.5 + 0.4375 * Math.sin((degrees * Math.PI) / 180), 0.5 - 0.4375 * Math.cos((degrees * Math.PI) / 180)];
  const [ringFill, ringTrack] = await paint('.af-progress.circular >> nth=1', [at(45), at(225)]);
  expect(apart(ringFill!, highlight), `the ring's fill is Highlight: ${ringFill} against ${highlight}`).toBeLessThanOrEqual(2);
  expect(apart(ringTrack!, grey), `the ring's track is GrayText: ${ringTrack} against ${grey}`).toBeLessThanOrEqual(2);
});

test('a toggle chip keeps an edge, and its focus is an outline that shows, under forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const toggle = pane.locator('[data-testid="light-toggle-open"]');
  const pressed = pane.locator('[data-testid="light-toggle-all"]');
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle, 'an unpressed toggle has no border, so a 1px outline is its edge').toHaveCSS('outline-width', '1px');
  await toggle.focus();
  await expect(toggle, 'and focus is a 2px outline').toHaveCSS('outline-width', '2px');
  // A pressed toggle is filled with the highlight and its text is the highlight's text colour, which the outline must not take: it would be that colour over the canvas.
  await pressed.focus();
  await expect(pressed, 'a pressed toggle has the same outline when focused').toHaveCSS('outline-width', '2px');
  const [outline, text] = await pressed.evaluate((el) => [getComputedStyle(el).outlineColor, getComputedStyle(el).color]);
  expect(outline, "the focus outline is not the pressed toggle's text colour").not.toBe(text);
  // The pointer over it changes nothing: the author's hover tint would show through, since the rule opts out of the adjustment.
  const paint = () => pressed.evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
  const resting = await paint();
  await pressed.hover();
  expect(await paint(), 'a hovered pressed toggle keeps the highlight').toEqual(resting);
});

test('the page structure classes draw their lines, dots and markers in system colours under forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const one = (name: string) => `[data-testid="light-${name}"]`;
  // A system colour as the browser paints it, read from a probe that opts out of the adjustment, as these rules do.
  const system = await pane.evaluate((el) => {
    const read = (colour: string) => {
      const probe = Object.assign(document.createElement('span'), { style: `forced-color-adjust: none; color: ${colour}` });
      el.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    return { text: read('CanvasText'), highlight: read('Highlight') };
  });
  const drawn = await computedIn(pane, {
    chevron: [`${one('breadcrumb')} li`, ['background-color'], '::before', 1],
    line: [`${one('timeline')} .af-timeline-item`, ['background-color'], '::before'],
    dot: [`${one('timeline')} .af-timeline-dot`, ['background-color'], '', 5],
    done: [`${one('steps')} .af-step-marker`, ['background-color']],
    connector: [`${one('steps')} .af-step`, ['background-color'], '::before', 2],
  });
  expect(drawn['chevron'], "the breadcrumb's chevron, a background, would vanish in the canvas").toEqual({ 'background-color': system.text });
  expect(drawn['line'], "the timeline's line").toEqual({ 'background-color': system.text });
  expect(drawn['dot'], 'a dot with no kind').toEqual({ 'background-color': system.text });
  expect(drawn['done'], 'a done step is filled in the highlight').toEqual({ 'background-color': system.highlight });
  expect(drawn['connector'], 'a connector after a step that is not done').toEqual({ 'background-color': system.text });
});

test('reduced motion stops the turn of a disclosure chevron and the fade of a field list copy button', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const still = await computedIn(pane, {
    chevron: ['[data-testid="light-disclosure"] .af-disclosure-toggle > svg', ['transition-duration']],
    copy: ['[data-testid="light-dl"] dd > af-copy-button', ['transition-duration']],
  });
  expect(still).toEqual({ chevron: { 'transition-duration': '0s' }, copy: { 'transition-duration': '0s' } });
});

test('reduced motion stops the transition of every control that has one', async ({ page }) => {
  const controls = ['.af-button', '.af-chip', '.af-chip.toggle', '.af-tabs [role="tab"]', '.af-input', '.af-checkbox', '.af-radio', '.af-switch', '.af-toggle', '.af-segmented > label > span'];
  const durations = () =>
    page.evaluate((controls) => {
      const pane = [...document.querySelectorAll('.af-app')].find((host) => host.shadowRoot?.querySelector('.gallery'))!.shadowRoot!;
      const handle = pane.querySelector('af-splitter')!.shadowRoot!.querySelector('[part="handle"]')!;
      return [...controls.map((selector) => [selector, getComputedStyle(pane.querySelector(selector)!).transitionDuration] as const),
        ['af-splitter handle', getComputedStyle(handle).transitionDuration] as const];
    }, controls);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/gallery/');
  // Without the preference they all move, so the check below is not one that anything passes.
  for (const [selector, duration] of await durations()) expect(duration, selector).not.toBe('0s');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [selector, duration] of await durations()) expect(duration, selector).toBe('0s');
});

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

test("a menu's radio item emits select with checked, and the page's answer moves the check", async ({ page }) => {
  await page.goto('/gallery/');
  const menu = page.locator('[data-theme="light"] .gallery .short-column af-menu');
  await menu.locator('[part="trigger"]').click();
  await expect(menu.locator('[part="heading"]')).toHaveText('Sort by');
  const radio = (name: string) => menu.getByRole('menuitemradio', { name });
  await expect(radio('Due date')).toHaveAttribute('aria-checked', 'true');
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Show archived' })).toHaveAttribute('aria-checked', 'false');
  await radio('Priority').click();
  await expect(menu.locator('[part="item"]').first(), 'picking a checkable item closes the menu').toBeHidden();
  expect((await eventsOf(page, 'light', 'af-menu')).map((e) => e.detail)).toEqual([{ id: 'sort-priority', checked: true }]);
  await menu.locator('[part="trigger"]').click();
  await expect(radio('Priority')).toHaveAttribute('aria-checked', 'true');
  await expect(radio('Due date')).toHaveAttribute('aria-checked', 'false');
  await expect(radio('Priority').locator('[part="indicator"]')).toBeVisible();
  await expect(radio('Due date').locator('[part="indicator"]')).toBeHidden();
  await page.keyboard.press('Escape');
});

// A step's overflow actions: the locked trigger says why and stays where focus can reach it, and each action is drawn in the
// text colour of the chip in its tone.
for (const theme of ['light', 'dark'] as const) {
  test(`af-menu: a locked trigger shows its reason and does not open, and items take their tone in ${theme}`, async ({ page }) => {
    await page.goto('/gallery/');
    const pane = page.locator(`[data-theme="${theme}"] .gallery`);
    const locked = pane.locator(`[data-testid="${theme}-menu-locked"]`);
    const trigger = locked.locator('[part="trigger"]');
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await expect(trigger).toHaveAttribute('aria-description', 'Saving the step');
    await trigger.hover();
    await expect(locked.locator('af-tooltip').getByText('Saving the step')).toBeVisible();
    await trigger.click({ force: true });
    await trigger.press('ArrowDown');
    await expect(locked.locator('[part="item"]').first()).toBeHidden();
    await expect(locked.locator('[part="trigger"]')).toHaveAttribute('aria-expanded', 'false');
    await page.mouse.move(0, 0);

    const toned = pane.locator(`[data-testid="${theme}-menu-tones"]`);
    const [lockedBox, openBox] = [await trigger.boundingBox(), await toned.locator('[part="trigger"]').boundingBox()];
    expect(lockedBox, 'the tooltip around a locked trigger leaves it the size and place of an unlocked one').toMatchObject({ width: openBox!.width, height: openBox!.height, y: openBox!.y });
    await toned.locator('[part="trigger"]').click();
    const colour = (name: string) => toned.getByRole('menuitem', { name }).evaluate((el) => getComputedStyle(el).color);
    const chip = (tone: string) => pane.locator(`.af-chip.${tone}`).first().evaluate((el) => getComputedStyle(el).color);
    expect(await colour('Approve')).toBe(await chip('success'));
    expect(await colour('Put on hold')).toBe(await chip('warning'));
    expect(await colour('Ask a question')).toBe(await chip('info'));
    const plain = await colour('Add a comment');
    for (const tone of ['Approve', 'Put on hold', 'Ask a question']) expect(await colour(tone), tone).not.toBe(plain);
    expect(await colour('Reject'), 'a danger tone is the danger flag').toBe(await colour('Remove'));
    expect(await colour('Remove')).not.toBe(plain);
    await toned.getByRole('menuitem', { name: 'Approve' }).hover();
    await expect(toned.getByRole('menuitem', { name: 'Approve' })).toHaveAttribute('data-highlighted', '');
    expect(await colour('Approve'), 'a highlighted toned item keeps its colour').toBe(await chip('success'));
    expect(await toned.getByRole('menuitem', { name: 'Approve' }).evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    await page.keyboard.press('Escape');
  });
}

test('af-menu: a trigger locked with a reason while it has focus keeps focus, and unlocking takes the tooltip away', async ({ page }) => {
  await page.goto('/gallery/');
  const menu = page.locator('[data-theme="light"] .gallery [data-testid="light-menu-tones"]');
  const trigger = menu.locator('[part="trigger"]');
  await trigger.focus();
  await menu.evaluate((el) => Object.assign(el, { disabled: true, reason: 'Saving the step' }));
  await expect(trigger).toHaveAttribute('aria-disabled', 'true');
  await expect(trigger).toBeFocused();
  await expect(menu.locator('af-tooltip')).toHaveCount(1);
  await trigger.hover();
  await expect(menu.locator('af-tooltip').getByText('Saving the step')).toBeVisible();
  await menu.evaluate((el) => Object.assign(el, { disabled: false }));
  await expect(trigger).not.toHaveAttribute('aria-disabled');
  await expect(menu.locator('af-tooltip')).toHaveCount(0);
  await trigger.press('Enter');
  await expect(menu.getByRole('menuitem', { name: 'Approve' })).toBeVisible();
  await page.keyboard.press('Escape');
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

// The page sets each change back, so the panel shown is the one asked for; the arrow keys skip the locked tab and wrap.
test('af-tabs moves between tabs with the arrow keys and shows the chosen panel', async ({ page }) => {
  await page.goto('/gallery/');
  const tabs = page.locator('[data-theme="light"] .gallery [data-testid="light-tabs-element"]');
  const tab = (name: string) => tabs.getByRole('tab', { name });
  const panel = (value: string) => tabs.locator(`[slot="${value}"]`);
  await expect(tabs.getByRole('tablist', { name: 'Record sections' })).toBeVisible();
  await expect(panel('overview')).toBeVisible();
  await expect(panel('activity')).toBeHidden();
  await tab('Overview').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab('Activity')).toBeFocused();
  await expect(tab('Activity')).toHaveAttribute('aria-selected', 'true');
  await expect(panel('activity')).toBeVisible();
  await expect(panel('overview')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(tab('Overview')).toBeFocused();
  await expect(panel('overview')).toBeVisible();
  await expect(tab('Audit log')).toHaveAttribute('aria-disabled', 'true');
  // The locked tab sits in af-tooltip, and kit.css's tab rules reach it there: it lines up with its neighbours.
  const metrics = (name: string) => tab(name).evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { top: box.top, height: box.height, fontSize: getComputedStyle(el).fontSize };
  });
  expect(await metrics('Audit log')).toEqual(await metrics('Activity'));
  // The locked tab lets the pointer through to its tooltip, which shows the reason.
  const locked = (await tab('Audit log').boundingBox())!;
  await page.mouse.move(locked.x + locked.width / 2, locked.y + locked.height / 2);
  await expect(tabs.locator('af-tooltip')).toHaveAttribute('data-raised', 'true');
  await tab('Activity').click();
  await expect(panel('activity')).toBeVisible();
  await expect(panel('audit')).toBeHidden();
});

// The panes follow the pointer, one change reports where the drag ended, a press that moves nothing reports nothing, a
// size the page sets moves the handle, and the focused or dragged handle paints above the end pane, which has a fill.
test('af-splitter follows a drag, reports it once, and moves for a size the page sets', async ({ page }) => {
  await page.goto('/gallery/');
  const splitter = page.locator('[data-theme="light"] .gallery [data-testid="light-splitter"]');
  const handle = splitter.getByRole('separator', { name: 'Resize the list' });
  const startWidth = () => splitter.locator('[part~="start"]').evaluate((el) => el.getBoundingClientRect().width);
  const changes = () => page.evaluate(() => (window as unknown as { galleryEvents: { tag: string; type: string; theme: string; detail: { size: number } }[] }).galleryEvents
    .filter((e) => e.tag === 'af-splitter' && e.type === 'size-change' && e.theme === 'light').map((e) => e.detail.size));
  const lifted = () => handle.evaluate((el) => ({ position: getComputedStyle(el).position, zIndex: getComputedStyle(el).zIndex }));
  await expect(handle).toHaveAttribute('aria-valuenow', '40');
  await handle.scrollIntoViewIfNeeded();
  const before = await startWidth();
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.up();
  // A fixed wait, the one way to show that nothing is emitted: there is no event to poll for.
  await page.waitForTimeout(100);
  expect(await changes()).toEqual([]);

  await page.mouse.down();
  await page.mouse.move(x + 30, y, { steps: 3 });
  await page.mouse.move(x + 60, y, { steps: 3 });
  // Mid-drag, the pane has already followed, nothing has been reported, and the handle is lifted above the panes.
  expect(await startWidth()).toBeGreaterThan(before + 50);
  expect(await changes()).toEqual([]);
  expect(await lifted()).toEqual({ position: 'relative', zIndex: '1' });
  await page.mouse.up();
  await expect.poll(changes).toHaveLength(1);
  expect(Math.abs((await changes())[0]! - 50)).toBeLessThanOrEqual(1);
  expect(Math.abs((await startWidth()) - before - 60)).toBeLessThanOrEqual(6);

  await splitter.evaluate((el) => { (el as HTMLElement & { size: number }).size = 30; });
  await expect(handle).toHaveAttribute('aria-valuenow', '30');
  await expect.poll(startWidth).toBeLessThan(before);
  expect(await changes()).toHaveLength(1);

  // Reached from the keyboard, the handle shows its ring, lifted above the end pane.
  await page.mouse.move(0, 0);
  await splitter.locator('[slot="start"]').evaluate((el) => (el as HTMLElement & { viewport: HTMLElement }).viewport.focus());
  await page.keyboard.press('Tab');
  await expect(handle).toBeFocused();
  expect(await handle.evaluate((el) => el.matches(':focus-visible'))).toBe(true);
  expect(await lifted()).toEqual({ position: 'relative', zIndex: '1' });
});

// Next moves the range as the page sets it back; after Load more, the status counts the rows that arrived and focus
// lands on the first of them.
test('af-pager pages a list, and Load more announces and focuses the rows that arrived', async ({ page }) => {
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const pager = pane.locator('[data-testid="light-pager"]');
  await expect(pager.locator('[part="range"]')).toHaveText('1–25 of 200');
  await expect(pager.getByRole('button', { name: 'Previous' })).toHaveAttribute('aria-disabled', 'true');
  await pager.getByRole('button', { name: 'Next' }).click();
  await expect(pager.locator('[part="range"]')).toHaveText('26–50 of 200');
  await expect(pane.locator('#light-page-rows li').first()).toHaveText('Row 26');
  // An id in the page cannot name the list from inside the pager's shadow root; element reflection does.
  const controlled = await pager.evaluate((el) =>
    [...el.shadowRoot!.querySelectorAll('button')].map((b) => (b as HTMLButtonElement & { ariaControlsElements: Element[] | null }).ariaControlsElements?.[0]?.id ?? null));
  expect(controlled, 'Previous and Next reach the list itself').toEqual(['light-page-rows', 'light-page-rows']);

  const more = pane.locator('[data-testid="light-more-pager"]');
  const button = more.getByRole('button', { name: 'Load more' });
  await expect(more).toContainText('Showing 20 of 100');
  await button.click();
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(more.locator('[part="status"]')).toHaveText('20 more loaded');
  const first = pane.locator('#light-more-rows li').nth(20);
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('tabindex', '-1');
  await expect(more).toContainText('Showing 40 of 100');
});

// A press copies the value, says so in the status region for two seconds, and tells the page. WebKit has no
// clipboard-read permission to grant, so the text on the clipboard is read back in Chromium only; both engines check the
// outcome the person sees and the event.
test('af-copy-button copies its value, says so, and tells the page', async ({ page, context, browserName }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/gallery/');
  const pane = page.locator('[data-theme="light"] .gallery');
  const button = pane.locator('[data-testid="light-copy-button"]');
  const trigger = button.getByRole('button', { name: 'Copy' });
  const status = button.locator('[part="status"]');
  await expect(status).toHaveText('');
  await trigger.click();
  await expect(status).toHaveText('Copied');
  await expect(trigger.locator('svg rect'), 'the check replaces the copy icon').toHaveCount(0);
  expect((await eventsOf(page, 'light', 'af-copy-button')).map((e) => ({ type: e.type, detail: e.detail }))).toEqual([{ type: 'af-copy', detail: { value: 'INV-0042', ok: true } }]);
  if (browserName === 'chromium') expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('INV-0042');
  await expect(status, 'and clears again after two seconds').toHaveText('', { timeout: 3500 });
  await expect(trigger.locator('svg rect')).toHaveCount(1);
});

// With the clipboard API refusing, the value goes through a selected textarea in the shadow root and execCommand, which a
// browser honours only while the click's gesture is current: the write is tried after the refusal has been awaited.
test('af-copy-button falls back to a selected textarea when the clipboard API refuses', async ({ page, context, browserName }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    const real = navigator.clipboard;
    Object.assign(window, { realClipboard: real });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) }, configurable: true });
  });
  await page.goto('/gallery/');
  const button = page.locator('[data-theme="light"] .gallery [data-testid="light-copy-button"]');
  await button.getByRole('button', { name: 'Copy' }).click();
  await expect(button.locator('[part="status"]')).toHaveText('Copied');
  expect((await eventsOf(page, 'light', 'af-copy-button')).map((e) => e.detail)).toEqual([{ value: 'INV-0042', ok: true }]);
  await expect(button.getByRole('button', { name: 'Copy' }), 'focus is back on the button').toBeFocused();
  if (browserName === 'chromium') expect(await page.evaluate(() => (window as unknown as { realClipboard: Clipboard }).realClipboard.readText())).toBe('INV-0042');
});

// The view loads as a chunk on first use, draws GFM's table and the mention as the editor's chip with the name the map
// resolves, and leaves a link the page does not stop to open in a new tab.
test('af-markdown draws a table and a mention chip, and its links open in a new page', async ({ page, context }) => {
  await page.goto('/gallery/');
  const markdown = page.locator('[data-theme="light"] .gallery [data-testid="light-markdown"]');
  await expect(markdown.locator('table th')).toHaveText(['Task', 'Owner']);
  await expect(markdown.locator('.af-mention-label')).toHaveText('Phạm Lan');
  await expect(markdown.locator('.af-mention')).not.toContainText('0b6c1f4e');
  const opened = context.waitForEvent('page');
  await markdown.getByRole('link', { name: 'the brief' }).click();
  const tab = await opened;
  expect(tab.url()).toContain('example.com/brief');
  expect((await eventsOf(page, 'light', 'af-markdown')).map((e) => ({ type: e.type, detail: e.detail }))).toEqual([{ type: 'af-link', detail: { href: 'https://example.com/brief' } }]);
  await tab.close();
});

test.describe('af-scroll-area in a real browser', () => {
  const scrollTop = (viewport: Locator) => viewport.evaluate((el) => el.scrollTop);

  test('af-scroll-area keeps native scrolling and draws its own scrollbar', async ({ page }) => {
    await page.goto('/gallery/');
    const pane = page.locator('[data-theme="light"] .gallery');
    const area = pane.locator('[data-testid="light-scroll-area"]');
    const viewport = area.locator('[part="viewport"]');
    const scrollbar = area.locator('[part="scrollbar"][data-orientation="vertical"]');
    const thumb = scrollbar.locator('[part="thumb"]');
    await area.scrollIntoViewIfNeeded();
    const box = (await area.boundingBox())!;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => scrollTop(viewport), { message: 'the wheel scrolls the viewport' }).toBeGreaterThan(0);
    await expect(thumb, 'the thumb shows while it scrolls').toBeVisible();
    await expect(scrollbar).toHaveCSS('opacity', '1');
    await page.mouse.move(box.x + box.width / 2, box.y - 40);
    // Ark keeps the scrollbar while the pointer is over the area and for a second after the last scroll.
    await expect(thumb, 'and hides once the pointer has left and the scrolling stopped').toBeHidden({ timeout: 1500 });
    await expect(scrollbar).toHaveCSS('opacity', '0');

    await viewport.evaluate((el) => (el.scrollTop = 0));
    await pane.locator('[data-testid="light-scroll-before"]').focus();
    await page.keyboard.press('Tab');
    await expect(viewport, 'Tab from the field before lands on the viewport').toBeFocused();
    // The soft 3px ring of AgentFlow's ScrollArea viewport, and the kit's own 1px outline, which AgentFlow does not draw.
    await expect(viewport).toHaveCSS('outline-width', '1px');
    await expect(viewport).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => scrollTop(viewport), { message: 'and ArrowDown scrolls it' }).toBeGreaterThan(0);

    await viewport.evaluate((el) => (el.scrollTop = 300));
    const [head, port] = await Promise.all([pane.locator('[data-testid="light-scroll-head"]').boundingBox(), viewport.boundingBox()]);
    expect(Math.abs(head!.y - port!.y), 'a sticky heading sticks to the viewport\'s top').toBeLessThanOrEqual(1);

    // Bounded by a max-height alone, as the README's example and AgentFlow's facet list are.
    await area.evaluate((el) => {
      el.style.height = 'auto';
      el.style.maxHeight = '120px';
    });
    await expect.poll(() => viewport.evaluate((el) => el.clientHeight), { message: 'the viewport is as tall as the max-height' }).toBe(120);
    expect(await viewport.evaluate((el) => el.scrollHeight), 'and its rows run past it').toBeGreaterThan(120);
    await viewport.evaluate((el) => (el.scrollTop = 0));
    const bounded = (await area.boundingBox())!;
    await page.mouse.move(bounded.x + bounded.width / 2, bounded.y + bounded.height / 2);
    await page.mouse.wheel(0, 100);
    await expect.poll(() => scrollTop(viewport), { message: 'and the wheel scrolls it' }).toBeGreaterThan(0);
  });

  test('a scroller is a tab stop while it overflows with nothing Tab reaches inside: plain text is one, a dialog body with a field is not', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 240 });
    await page.goto('/gallery/');
    const pane = page.locator('[data-theme="light"] .gallery');
    const text = pane.locator('[data-testid="light-scroll-area"] [part="viewport"]');
    await expect(text, 'fifty rows of text').toHaveAttribute('tabindex', '0');
    await page.getByTestId('light-open-dialog').click();
    const body = pane.locator('af-dialog').first().locator('[part~="viewport"]');
    await expect.poll(() => body.evaluate((el) => el.scrollHeight > el.clientHeight), { message: 'a short window makes the body scroll' }).toBe(true);
    expect(await body.getAttribute('tabindex'), 'its field is reached by Tab, so the body is no stop').toBeNull();
  });

  test("a menu of 40 items scrolls inside its content, drawn by the kit's scrollbar", async ({ page }) => {
    await page.goto('/gallery/');
    const menu = page.locator('[data-theme="light"] .gallery .short-column af-menu');
    await menu.evaluate((el) => {
      (el as HTMLElement & { items: unknown }).items = Array.from({ length: 40 }, (_, i) => ({ id: `item-${i + 1}`, label: `Item ${i + 1}` }));
    });
    await menu.locator('[part="trigger"]').click();
    const items = menu.locator('[part="item"]');
    await expect(items.first()).toBeVisible();
    const viewport = menu.locator('[part="viewport"]');
    expect(await viewport.evaluate((el) => el.scrollHeight > el.clientHeight), 'forty items overflow the content').toBe(true);
    await expect(menu.locator('[part="thumb"]'), 'its scrollbar is the kit\'s').toHaveCount(1);
    await page.keyboard.press('ArrowDown');
    await expect(items.first()).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Escape');
    // Zag's menu does not loop, as Radix's does not: ArrowUp on the closed trigger opens it at the last item.
    await expect(menu.locator('[part="trigger"]')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(items.last(), 'ArrowUp reaches the fortieth').toHaveAttribute('data-highlighted', '');
    await expect.poll(() => scrollTop(viewport), { message: 'which scrolls into view' }).toBeGreaterThan(0);
    await expect(items.last()).toBeInViewport();
    await page.keyboard.press('Escape');
  });

  // Frame gaps from the first of 20 wheel steps of 100 px sideways over `target` until its scrolling has settled, and one
  // frame more. `target` is the element that scrolls, or an af-scroll-area whose viewport does.
  async function frameGaps(page: Page, target: Locator): Promise<{ max: number; mean: number; scrolled: number }> {
    await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.evaluate(() => {
      const frames = { gaps: [] as number[], on: true };
      Object.assign(window, { boardFrames: frames });
      let last = performance.now();
      const tick = (now: number) => {
        if (!frames.on) return;
        frames.gaps.push(now - last);
        last = now;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    for (let step = 0; step < 20; step++) await page.mouse.wheel(100, 0);
    const { gaps, scrolled } = await target.evaluate(
      (el) =>
        new Promise<{ gaps: number[]; scrolled: number }>((done) => {
          const scroller = (el as HTMLElement & { viewport?: HTMLElement }).viewport ?? el;
          const frames = (window as unknown as { boardFrames: { gaps: number[]; on: boolean } }).boardFrames;
          let previous = scroller.scrollLeft;
          const settle = () =>
            requestAnimationFrame(() => {
              if (scroller.scrollLeft !== previous) {
                previous = scroller.scrollLeft;
                settle();
                return;
              }
              requestAnimationFrame(() => {
                frames.on = false;
                done({ gaps: frames.gaps, scrolled: scroller.scrollLeft });
              });
            });
          settle();
        }),
    );
    return { max: Math.max(...gaps), mean: gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length, scrolled };
  }

  test('a board of 40 columns of 60 cards scrolls without a long frame', async ({ page, browserName }) => {
    test.slow();
    // The skeleton's pulse repaints 2,400 cards a frame, with or without the kit's scrollers; reduced motion stops it, so
    // what is measured is the scrolling.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/gallery/');
    const pane = page.locator('[data-theme="light"] .gallery');
    // A headless browser draws in software, and scrolls this board at about 17 to 23 ms a frame in Chromium and 30 to 35 ms
    // in WebKit in plain overflow boxes too, so the kit's longest frame and mean are held to the same board without it, measured
    // first in the same run: a collection left by tearing the plain board down lands in the kit's measurement, not the other way.
    await pane.locator('[data-testid="light-board-cost"]').evaluate((el) => {
      const column = `<div style="flex: none; width: 160px; height: 320px; overflow-y: auto">${'<div class="af-skeleton card" style="margin-bottom: 8px"></div>'.repeat(60)}</div>`;
      el.innerHTML = `<div data-testid="light-plain-board" style="overflow-x: auto"><div class="board">${column.repeat(40)}</div></div>`;
    });
    const plain = await frameGaps(page, pane.locator('[data-testid="light-plain-board"]'));
    console.log(`board in plain overflow boxes, ${browserName}: max gap ${plain.max.toFixed(1)} ms, mean ${plain.mean.toFixed(1)} ms`);

    await pane.locator('[data-testid="light-build-board"]').click();
    const board = pane.locator('[data-testid="light-board"]');
    await expect(board.locator('.board-column')).toHaveCount(40);
    const kit = await frameGaps(page, board);
    console.log(`board in kit scrollers, ${browserName}: max gap ${kit.max.toFixed(1)} ms, mean ${kit.mean.toFixed(1)} ms`);
    expect(plain.scrolled, 'the wheel scrolled the plain board').toBeGreaterThan(0);
    expect(kit.scrolled, 'and the kit board').toBeGreaterThan(0);
    expect(kit.max, "no frame waits much longer than the plain board's longest").toBeLessThan(Math.max(100, plain.max * 1.5));
    expect(kit.mean, 'and the mean frame is within a third of plain overflow boxes').toBeLessThan(plain.mean * (4 / 3));
  });
});

test.describe('af-table in a real browser', () => {
  const open = async (page: Page) => {
    await page.goto('/gallery/');
    const area = page.locator('[data-theme="light"] .gallery [data-testid="light-table-area"]');
    await area.scrollIntoViewIfNeeded();
    return { area, viewport: area.locator('[part="viewport"]'), table: area.locator('[data-testid="light-table"]') };
  };

  // A sticky header must stick to the scroll area's viewport, not the page's; a group's header sticks under it, and the
  // rows that scroll beneath neither paint over it nor take their first column's place from it.
  test("the sticky table's header row and a group's header stick inside the scroll area", async ({ page }) => {
    const { area, viewport, table } = await open(page);
    const head = Number.parseFloat(await table.evaluate((el) => getComputedStyle(el).getPropertyValue('--af-table-head')));
    expect(head, "the kit sets the header row's height for a table that has a check column").toBe(36);
    const box = async (locator: Locator) => (await locator.boundingBox())!;
    const th = table.locator('thead th').first();
    const group = table.locator('.af-table-group-header th').first();

    await viewport.evaluate((el) => (el.scrollTop = 300));
    await expect.poll(async () => Math.abs((await box(th)).y - (await box(viewport)).y), { message: "the header row sticks to the viewport's top" }).toBeLessThanOrEqual(1);
    await expect.poll(async () => Math.abs((await box(group)).y - ((await box(viewport)).y + head)), { message: 'and the group header sticks under it' }).toBeLessThanOrEqual(1);
    // The kit's value is the header row's own height, so the group header meets it: no gap to see rows through, and no more
    // than a pixel or two of the group header under the row.
    const overlap = (await box(th)).y + (await box(th)).height - (await box(group)).y;
    expect(overlap, "the group header starts where the header row ends, or under it by less than 2px").toBeGreaterThanOrEqual(-0.5);
    expect(overlap).toBeLessThan(2);

    const amount = table.locator('tbody td.num').first();
    const before = (await box(amount)).x;
    await viewport.evaluate((el) => (el.scrollLeft = 200));
    expect(await viewport.evaluate((el) => el.scrollLeft), 'the table runs wider than its scroll area').toBe(200);
    const left = (await box(viewport)).x;
    const firstColumn = await table.locator('thead th.check, tbody:not([data-collapsed]) td.check').evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().left));
    expect(firstColumn.length, 'the header cell and the twelve rows of the open group').toBe(13);
    for (const x of firstColumn) expect(Math.abs(x - left), 'the first column keeps its place').toBeLessThanOrEqual(1);
    expect(Math.abs(before - 200 - (await box(amount)).x), 'while the other columns move with the scroll').toBeLessThanOrEqual(1);

    // At the group header's first column, the topmost thing is the group header: a row scrolling under it must not cover it.
    const y = (await box(group)).y + 18;
    const covered = await table.evaluate((el, at) => {
      const hit = (el.getRootNode() as ShadowRoot).elementFromPoint(at.x, at.y);
      return hit === null ? 'nothing' : hit.closest('.af-table-group-header') === null ? hit.outerHTML.slice(0, 80) : 'the group header';
    }, { x: left + 20, y });
    expect(covered, "a row's first cell does not paint over the group header").toBe('the group header');
    await expect(area.locator('[part="scrollbar"][data-orientation="horizontal"]'), 'the horizontal scrollbar is the kit\'s').toHaveCount(1);
  });

  // The sticky layers sit above the table's own cells and no higher than the scroll area's own parts: the drawn
  // scrollbars stay on top of a stuck header row, group header and first column, wherever a column runs under them.
  test("the sticky table's layers stay under the scroll area's scrollbars", async ({ page }) => {
    const { area } = await open(page);
    await area.hover();
    const thumbs = { vertical: area.locator('[part="scrollbar"][data-orientation="vertical"] [part="thumb"]'), horizontal: area.locator('[part="scrollbar"][data-orientation="horizontal"] [part="thumb"]') };
    for (const [axis, thumb] of Object.entries(thumbs)) {
      await expect(thumb, `the ${axis} thumb shows under the pointer`).toBeVisible();
      const box = (await thumb.boundingBox())!;
      // The thumb's near end: where the header row and the first column are drawn.
      const at = axis === 'vertical' ? { x: box.x + box.width / 2, y: box.y + 3 } : { x: box.x + 3, y: box.y + box.height / 2 };
      const hit = await area.evaluate((el, point) => {
        const found = (el.getRootNode() as ShadowRoot).elementFromPoint(point.x, point.y);
        return found === null ? 'nothing' : found === el ? 'the scroll area' : found.outerHTML.slice(0, 80);
      }, at);
      expect(hit, `the topmost thing at the ${axis} thumb's near end is the scrollbar, not a table cell`).toBe('the scroll area');
    }
  });

  // An earlier group's header stays pinned under the header row (a stuck cell is bounded by the table), so the one of the
  // empty group that arrives later must paint over it: dimming the group must not take it out of the stacking order.
  test("the sticky table's stuck header of an empty group paints over the earlier groups' headers", async ({ page }) => {
    const { area, viewport, table } = await open(page);
    await area.evaluate((el) => (el.style.height = '120px'));
    await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const head = Number.parseFloat(await table.evaluate((el) => getComputedStyle(el).getPropertyValue('--af-table-head')));
    const empty = table.locator('tbody[data-empty] .af-table-group-header th');
    const port = (await viewport.boundingBox())!;
    await expect.poll(async () => Math.abs((await empty.boundingBox())!.y - (port.y + head)), { message: "the empty group's header has reached its place under the header row" }).toBeLessThanOrEqual(1);
    const hit = await table.evaluate((el, at) => {
      const found = (el.getRootNode() as ShadowRoot).elementFromPoint(at.x, at.y);
      const group = found?.closest('tbody');
      return found === null ? 'nothing' : group?.hasAttribute('data-empty') ? 'the empty group' : (found.outerHTML.slice(0, 80));
    }, { x: port.x + 60, y: port.y + head + 18 });
    expect(hit, "the topmost thing there is the empty group's header, not an earlier group's").toBe('the empty group');
  });

  test('the sort icon shows under the pointer, on focus and when active', async ({ page }) => {
    const { table } = await open(page);
    const icon = (sort: string) => table.locator(`[data-testid="light-sort-${sort}"] svg`);
    const turn = (sort: string) => icon(sort).evaluate((el) => getComputedStyle(el).transform);
    await expect(icon('none'), 'an unsorted header shows no icon at rest').toHaveCSS('opacity', '0');
    await table.locator('thead th[aria-sort="none"]').hover();
    await expect(icon('none'), 'and shows it under the pointer').toHaveCSS('opacity', '1');
    await page.mouse.move(0, 0);
    await expect(icon('none')).toHaveCSS('opacity', '0');
    await table.locator('[data-testid="light-sort-ascending"]').focus();
    await page.keyboard.press('Tab');
    await expect(table.locator('[data-testid="light-sort-none"]'), 'Tab lands on the next sort button').toBeFocused();
    await expect(icon('none'), 'which shows it').toHaveCSS('opacity', '1');
    await expect(table.locator('[data-testid="light-sort-none"]')).toHaveCSS('box-shadow', /0px 0px 0px 3px/);
    await page.keyboard.press('Tab');
    await expect(icon('none'), 'and hides it again when focus leaves').toHaveCSS('opacity', '0');

    await expect(icon('ascending'), 'the sorted column shows its icon at rest').toHaveCSS('opacity', '1');
    await expect(icon('descending')).toHaveCSS('opacity', '1');
    expect(await turn('ascending'), 'pointing up for ascending').toBe('none');
    await expect.poll(() => turn('descending'), { message: 'and turned half a turn for descending' }).toBe('matrix(-1, 0, 0, -1, 0, 0)');
  });

  test('a group collapses to its header and its chevron turns', async ({ page }) => {
    const { table } = await open(page);
    const group = table.locator('tbody.af-table-group').nth(1);
    const visible = (rows: Locator) => rows.evaluateAll((list) => list.filter((row) => getComputedStyle(row).display !== 'none').length);
    const toggle = group.locator('.af-table-group-toggle');
    const chevron = toggle.locator('svg');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await visible(group.locator('tr')), 'a collapsed group shows only its header').toBe(1);
    const closed = await chevron.evaluate((el) => getComputedStyle(el).transform);

    await toggle.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(group).not.toHaveAttribute('data-collapsed');
    expect(await visible(group.locator('tr:has(td.check)')), 'its twelve rows show').toBe(12);
    await expect.poll(() => chevron.evaluate((el) => getComputedStyle(el).transform), { message: 'the chevron turned a quarter' }).not.toBe(closed);
    await expect.poll(() => chevron.evaluate((el) => getComputedStyle(el).transform)).toBe('matrix(0, 1, -1, 0, 0, 0)');
  });
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

const KIT = 'af-dialog, af-confirm, af-menu, af-popover, af-tooltip, af-toast, af-date, af-person-picker, af-number-input, af-select, af-combobox, af-rich-editor, af-tile';

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

interface GalleryEvent { theme: string; tag: string; type: string; detail: unknown; id?: string }
const eventsOf = (page: Page, theme: string, tag: string) =>
  page.evaluate(([t, g]) => (window as unknown as { galleryEvents: GalleryEvent[] }).galleryEvents.filter((e) => e.theme === t && e.tag === g), [theme, tag] as const);

/** The colour of one pixel of the page, as the browser draws it. */
async function colourAt(page: Page, x: number, y: number): Promise<number[]> {
  const png = (await page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } })).toString('base64');
  return page.evaluate(async (png) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = Object.assign(document.createElement('canvas'), { width: image.width, height: image.height });
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(image, 0, 0);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data);
  }, png);
}

const OUTSIDE = { x: 5, y: 5 };

/**
 * Opens the light pane's side panel and reads its content in the same task as the open: the animation its style names and
 * the animations it runs (a name whose keyframes are missing is still named but runs nothing, so both are read). The slide
 * lasts 500 ms, and a read after a separate poll could land after it, so the read is taken on the first frame the dialog is
 * open; the call then waits for the slide to finish, so the docked box is read at rest.
 */
const openPanel = (page: Page) =>
  page.evaluate(async () => {
    const app = document.querySelector('.af-app[data-theme="light"]')!.shadowRoot!;
    const panel = app.querySelector('[data-testid="light-side-panel"]')!;
    const button = app.querySelector<HTMLElement>('[data-testid="light-open-side-panel"]')!;
    button.focus();
    button.click();
    const open = () => !!panel.shadowRoot!.querySelector('dialog')?.open;
    for (let frame = 0; frame < 120 && !open(); frame++) await new Promise(requestAnimationFrame);
    const content = panel.shadowRoot!.querySelector('[part="content"]')!;
    const animations = content.getAnimations();
    const read = { open: open(), named: getComputedStyle(content).animationName, running: animations.map((a) => (a as CSSAnimation).animationName) };
    await Promise.all(animations.map((a) => a.finished.catch(() => {})));
    return read;
  });

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

  test('Escape closes the popover’s tooltip first, then the popover, and focus returns to its anchor', async ({ page }) => {
    const pane = page.locator('[data-theme="light"] .gallery');
    const popover = '.short-column af-popover';
    const tooltip = `${popover} af-tooltip`;
    await pane.getByTestId('light-popover-anchor').click();
    await expect.poll(async () => (await call(page, 'layer', 'light', popover))?.raised).toBe('true');
    await pane.getByTestId('light-popover-hint').focus();
    await expect.poll(async () => (await call(page, 'layer', 'light', tooltip))?.raised).toBe('true');
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await call(page, 'layer', 'light', tooltip))?.raised).toBe('false');
    expect((await call(page, 'layer', 'light', popover))?.raised, 'the popover stays open').toBe('true');
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await call(page, 'layer', 'light', popover))?.raised).toBe('false');
    await expect.poll(async () => (await call(page, 'active'))?.testid).toBe('light-popover-anchor');
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
      await page.locator(`[data-theme="light"] .gallery ${tag} [part="${firstPart}"]`).first().focus();
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
      await pane.locator(`${tag} [part="${firstPart}"]`).first().click();
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
      await pane.locator(tag).first().evaluate((el) => el.setAttribute('data-keep-open', ''));
      await page.getByTestId(opener).click();
      await expect.poll(async () => (await call(page, 'active'))?.kit).toBe(tag);
      for (let i = 0; i < 2; i++) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
      }
      const escape = { theme: 'light', tag, type, detail: { reason: 'escape' } };
      expect(await eventsOf(page, 'light', tag)).toEqual([escape, escape]);
      expect(await call(page, 'dialogOpen', 'light', tag)).toBe(true);
      expect(await pane.locator(tag).first().evaluate((el) => (el as HTMLElement & { open: boolean }).open)).toBe(true);
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

  test('af-dialog placement="end" docks at the viewport’s end, a select inside opens above it, and Escape closes the select first', async ({ page }) => {
    const panel = '[data-testid="light-side-panel"]';
    const select = '[data-testid="light-panel-status"]';
    expect(await openPanel(page)).toEqual({ open: true, named: 'af-dialog-slide-in', running: ['af-dialog-slide-in'] });
    const edge = await page.evaluate(() => ({ width: document.documentElement.clientWidth, height: window.innerHeight }));
    const content = (await call(page, 'partBox', 'light', panel, 'content'))!;
    expect(content.right).toBe(edge.width);
    expect(content.top).toBe(0);
    expect(content.bottom).toBe(edge.height);
    expect(content.right - content.left).toBeCloseTo(Math.min(edge.width * 0.75, 384), 0);

    await page.locator(`[data-theme="light"] .gallery ${select} [part="trigger"]`).click();
    await expect.poll(async () => (await call(page, 'layer', 'light', select))?.open).toBe(true);
    const option = (await page.locator(`[data-theme="light"] .gallery ${select} [part="option"]`).first().boundingBox())!;
    const hit = await call(page, 'hit', option.x + option.width / 2, option.y + option.height / 2);
    expect(hit?.kit, JSON.stringify(hit)).toBe('af-select');

    await page.keyboard.press('Escape');
    await expect.poll(async () => (await call(page, 'layer', 'light', select))?.open).toBe(false);
    await page.waitForTimeout(150);
    expect(await eventsOf(page, 'light', 'af-dialog')).toEqual([]);
    expect(await call(page, 'dialogOpen', 'light', panel)).toBe(true);

    await page.keyboard.press('Escape');
    await expect.poll(() => call(page, 'dialogOpen', 'light', panel)).toBe(false);
    expect(await eventsOf(page, 'light', 'af-dialog')).toEqual([{ theme: 'light', tag: 'af-dialog', type: 'close', detail: { reason: 'escape' } }]);
    await expect.poll(async () => (await call(page, 'active'))?.testid).toBe('light-open-side-panel');
  });

  test('af-dialog placement="end" does not slide under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await openPanel(page)).toEqual({ open: true, named: 'none', running: [] });
  });

  test('af-dialog placement="end" with no actions keeps its body above the window’s foot', async ({ page }) => {
    const panel = '[data-testid="light-side-panel"]';
    await page.getByTestId('light-open-side-panel').click();
    await expect.poll(() => call(page, 'dialogOpen', 'light', panel)).toBe(true);
    const panelRoot = `document.querySelector('.af-app[data-theme="light"]').shadowRoot.querySelector('${panel}')`;
    await page.evaluate(`${panelRoot}.querySelector('[slot="actions"]').remove()`);
    await expect.poll(() => page.evaluate(`${panelRoot}.shadowRoot.querySelector('[part="actions"]').hidden`)).toBe(true);
    const viewport = await page.evaluate<{ bottom: number; height: number }>(
      `({ bottom: ${panelRoot}.shadowRoot.querySelector('[part~="viewport"]').getBoundingClientRect().bottom, height: window.innerHeight })`,
    );
    expect(viewport.bottom, JSON.stringify(viewport)).toBeLessThanOrEqual(viewport.height);
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

  // The toast region is a popover raised after the modal <dialog>, so it is later in the top layer and is drawn above the dialog's
  // backdrop. A modal dialog makes everything outside it inert, though, and the region is not inside it: both engines draw the toast
  // and hand it no press. The first half is the observed behaviour; the second shows the same toast is pressable once the dialog is gone.
  test('a toast shown from inside a modal dialog is drawn above it but cannot be pressed until the dialog closes', async ({ page }) => {
    const pane = page.locator('[data-theme="light"] .gallery');
    const invite = '[data-testid="light-invite-dialog"]';
    const toast = pane.locator('af-toast [part="toast"]');
    const retry = toast.getByRole('button', { name: 'Retry', exact: true });
    const actions = () => eventsOf(page, 'light', 'af-toast');

    await pane.getByTestId('light-open-invite').click();
    await expect(pane.getByRole('dialog', { name: 'Invite people' })).toBeVisible();
    // A press outside the dialog closes it in the gallery. This one stays open, so the press below is the only thing that changes.
    await pane.locator(invite).evaluate((el) => el.setAttribute('data-keep-open', ''));
    await pane.getByRole('button', { name: 'Send invites' }).click();
    await expect(retry).toBeVisible();
    await expect.poll(() => toast.evaluate((el) => getComputedStyle(el).opacity === '1' && el.getAnimations().length === 0)).toBe(true);

    const layer = (await call(page, 'layer', 'light', 'af-toast'))!;
    expect(layer.open, 'the toast region is raised while the dialog is open').toBe(true);
    const centreOf = async () => {
      const box = (await retry.boundingBox())!;
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    // A point inside the toast's own padding, away from its text and its corner.
    const ground = { x: (layer.content!.left + layer.content!.right) / 2, y: layer.content!.top + 6 };
    const open = { toast: await colourAt(page, ground.x, ground.y), page: await colourAt(page, OUTSIDE.x, OUTSIDE.y) };

    const at = await centreOf();
    const hit = await call(page, 'hit', at.x, at.y);
    console.log(`what is at the toast's action (${test.info().project.name}):`, JSON.stringify(hit));
    expect(hit?.kit, 'the point where the action is drawn').not.toBe('af-toast');
    await page.mouse.click(at.x, at.y);
    expect(await actions(), 'a press where the action is drawn').toEqual([]);
    expect(await call(page, 'dialogOpen', 'light', invite), 'the dialog is still open').toBe(true);

    await pane.locator(invite).evaluate((el) => el.removeAttribute('data-keep-open'));
    await page.keyboard.press('Escape');
    await expect.poll(() => call(page, 'dialogOpen', 'light', invite)).toBe(false);
    const closed = { toast: await colourAt(page, ground.x, ground.y), page: await colourAt(page, OUTSIDE.x, OUTSIDE.y) };
    expect(closed.page, 'the backdrop dimmed the page while the dialog was open').not.toEqual(open.page);
    expect(open.toast, 'the toast was drawn above the backdrop, not dimmed by it').toEqual(closed.toast);

    const after = await centreOf();
    expect((await call(page, 'hit', after.x, after.y))?.part, 'the point where the action is drawn, with the dialog closed').toBe('action');
    await retry.click();
    expect(await actions()).toMatchObject([{ theme: 'light', tag: 'af-toast', type: 'action', detail: { action: 'retry-invite' } }]);
  });

  test('a new toast is as tall as its content', async ({ page }) => {
    const toast = page.locator('[data-theme="light"] .gallery af-toast [part="toast"]');
    await page.getByTestId('light-show-error').click();
    await expect(toast).toHaveCount(1);
    await page.waitForTimeout(450);
    const size = await toast.evaluate((el) => {
      const box = el.getBoundingClientRect();
      // The close button sits over the leading top corner, half outside, as AgentFlow's does, so it is not content.
      const inner = [...el.querySelectorAll('[part="text"], [part="action"]')].map((c) => c.getBoundingClientRect());
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
    const en = await page.locator('[data-theme="light"] .gallery .short-column af-date [part="input"]').inputValue();
    const vi = await page.locator('[data-theme="dark"] .gallery .short-column af-date [part="input"]').inputValue();
    console.log(`af-date display (${test.info().project.name}):`, JSON.stringify({ en, vi }));
    expect(en).toMatch(/^15 Sept? 2026$/);
    expect(vi).toBe('15/09/2026');
  });

  test('af-date range emits once for a picked start and end, and refuses a typed end before its start', async ({ page }) => {
    const span = page.locator('[data-theme="light"] .gallery [data-testid="light-date-range"]');
    const [start, end] = [span.locator('[part="input start"]'), span.locator('[part="input end"]')];
    await expect(start).toHaveAttribute('aria-label', 'Window: Start date');
    await expect(span.locator('[part="separator"]')).toHaveText('–');
    const heights = await Promise.all([start, end].map((input) => input.evaluate((el) => el.getBoundingClientRect().height)));
    expect(heights).toEqual([36, 36]);

    await span.locator('[part="trigger"]').click();
    await expect.poll(async () => (await call(page, 'layer', 'light', '[data-testid="light-date-range"]'))?.open).toBe(true);
    const day = (iso: string) => span.locator(`[data-part="table-cell-trigger"][data-view="day"][data-value="${iso}"]`);
    await expect(day('2026-09-10')).toHaveAttribute('data-in-range', '');
    await day('2026-09-20').click();
    await page.mouse.move(0, 0);
    expect(await eventsOf(page, 'light', 'af-date')).toEqual([]);
    await day('2026-09-25').click();
    await expect.poll(async () => (await call(page, 'layer', 'light', '[data-testid="light-date-range"]'))?.open).toBe(false);
    expect((await eventsOf(page, 'light', 'af-date')).map((e) => e.detail)).toEqual([{ start: '2026-09-20', end: '2026-09-25' }]);
    await expect(start).toHaveValue(/^20 Sept? 2026$/);
    await expect(end).toHaveValue(/^25 Sept? 2026$/);

    await end.fill('2026-09-01');
    await end.press('Enter');
    await expect(end).toHaveValue(/^25 Sept? 2026$/);
    await end.fill('');
    await end.blur();
    await expect(end).toHaveValue('');
    expect((await eventsOf(page, 'light', 'af-date')).map((e) => e.detail)).toEqual([
      { start: '2026-09-20', end: '2026-09-25' },
      { start: '2026-09-20', end: null },
    ]);
  });
});

type Theme = 'light' | 'dark';
const THEMES: readonly Theme[] = ['light', 'dark'];

// What each gallery case draws, as the part that shows it. The narrow bar chart is the grouped one in half the width.
const DRAWS: Record<string, string> = {
  NUMBER_GOAL: 'figure',
  NUMBER_CAPPED: 'figure',
  NUMBER_SECONDARIES: 'figure',
  COLUMN_STACKED: 'plot',
  BAR_GROUPED: 'plot',
  BAR_GROUPED_NARROW: 'plot',
  LINE: 'plot',
  PIE: 'plot',
  DONUT: 'plot',
  MULTIPLES: 'plot',
  BAR_SHARE: 'plot',
  COLUMN_RUNNING: 'plot',
  BAR_RANK: 'plot',
  COLUMN_FORMULA: 'plot',
  COLUMN_FANS_OUT: 'plot',
  TEXT: 'prose',
  LIST: 'list',
  UNAVAILABLE: 'state',
  FAILED: 'state',
  LOADING: 'state',
};

const tileOf = (page: Page, theme: Theme, name: string): Locator => page.locator(`.af-app[data-theme="${theme}"]`).locator(`[data-case="${name}"] af-tile`);
const markOf = (tile: Locator, bucket: number, series: number) => tile.locator(`[part="plot"] [role="button"][data-bucket="${bucket}"][data-series="${series}"]`);
/** What a tile sent as `type`, in order. */
const heardFrom = (page: Page, theme: Theme, id: string, type: string) =>
  page.evaluate(
    ([t, i, ty]) => (window as unknown as { galleryEvents: GalleryEvent[] }).galleryEvents.filter((e) => e.theme === t && e.tag === 'af-tile' && e.id === i && e.type === ty).map((e) => e.detail),
    [theme, id, type] as const,
  );
const drillsOf = (page: Page, theme: Theme, id: string) => heardFrom(page, theme, id, 'af-drill');
const opensOf = (page: Page, theme: Theme, id: string) => heardFrom(page, theme, id, 'af-open-record');

/** The element that holds focus, through every shadow root, as the bucket and series it is the mark of. */
const heldMark = (page: Page) =>
  page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    const el = a as HTMLElement | null;
    return el && el.matches('[role="button"][data-bucket]') ? { bucket: Number(el.dataset.bucket), series: Number(el.dataset.series) } : null;
  });

/** The panel, by its place among the tile's plots, that holds focus. */
const heldPanel = (page: Page) =>
  page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    const plot = a?.closest('[part="plot"]');
    return plot ? [...(plot.getRootNode() as ShadowRoot).querySelectorAll('[part="plot"]')].indexOf(plot) : null;
  });

/** Whether the browser draws a focus ring on this mark: what the stylesheet gives it, and what it matches. */
const ringOf = (mark: Locator) =>
  mark.evaluate((el) => {
    const style = getComputedStyle(el);
    return { focusVisible: el.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor };
  });

/** A picture of the mark and a few pixels around it, with the tooltip taken out, so a difference is the mark's own. */
async function pictureOf(page: Page, mark: Locator) {
  await mark.scrollIntoViewIfNeeded();
  const box = (await mark.boundingBox())!;
  return page.screenshot({ clip: { x: box.x - 6, y: box.y - 6, width: box.width + 12, height: box.height + 12 }, animations: 'disabled' });
}

test.describe('<af-tile> in a real browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(installProbe, KIT);
    await page.goto('/gallery/');
  });

  test('every af-tile case renders in light and dark', async ({ page }) => {
    test.slow();
    for (const theme of THEMES) {
      for (const [name, part] of Object.entries(DRAWS)) {
        const tile = tileOf(page, theme, name);
        await expect(tile.locator(`[part~="${part}"]`).first(), `${theme} ${name}`).toBeAttached();
        // The drawing code arrives as a chunk, so a case is loading until it lands; only the one with no result stays.
        await expect(tile.locator('[part="state"][role="status"]'), `${theme} ${name} loading`).toHaveCount(name === 'LOADING' ? 1 : 0);
        const cut = await tile.evaluate((el) => {
          const root = el.shadowRoot!;
          const frame = root.querySelector('[part="frame"]')!;
          const room = frame.getBoundingClientRect();
          const outside = (r: DOMRect, box: DOMRect) => r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5;
          const found: string[] = [];
          for (const node of root.querySelectorAll('[part]')) {
            const r = node.getBoundingClientRect();
            // What scrolls inside a region is cut by design; the region itself must stay in the frame.
            if (node.closest('[part="tooltip"]') || node.parentElement?.closest('[role="region"]') || (r.width === 0 && r.height === 0)) continue;
            if (outside(r, room)) found.push(`part ${node.getAttribute('part')}`);
          }
          for (const text of root.querySelectorAll<SVGTextElement>('svg text')) {
            if (outside(text.getBoundingClientRect(), text.ownerSVGElement!.getBoundingClientRect())) found.push(`text ${text.textContent}`);
          }
          if (frame.scrollWidth > frame.clientWidth + 1 || frame.scrollHeight > frame.clientHeight + 1) found.push('scroll');
          return found;
        });
        expect(cut, `${theme} ${name}: nothing leaves its frame or its drawing`).toEqual([]);
      }
    }
  });

  test("a column's colour resolves from the token in both themes", async ({ page }) => {
    const seen: Record<string, string> = {};
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'COLUMN_STACKED');
      await expect(tile.locator('[part="plot"] [data-kind="value"]').first()).toBeAttached();
      const resolved = await tile.evaluate((el, literal) => {
        const root = el.shadowRoot!;
        const kit = root.querySelector('.af-kit')!;
        const mark = root.querySelector('[part="plot"] [data-kind="value"]') as SVGElement;
        // The same property, through a probe: one reads the token, the other the palette's own value.
        const resolve = (value: string) => {
          const probe = document.createElement('i');
          probe.style.fill = value;
          kit.append(probe);
          const fill = getComputedStyle(probe).fill;
          probe.remove();
          return fill;
        };
        return { drawn: getComputedStyle(mark).fill, token: resolve('var(--k-chart-1)'), palette: resolve(literal), inline: mark.style.fill };
      }, AF_DEFAULT_PALETTE[theme]['--af-chart-1']);
      expect(resolved.inline, `${theme}: painted by the token, not a literal`).toBe('var(--k-chart-1)');
      expect(resolved.token, `${theme}: the token is the palette's first colour`).toBe(resolved.palette);
      expect(resolved.drawn, `${theme}: the mark is that colour`).toBe(resolved.token);
      seen[theme] = resolved.drawn;
    }
    expect(seen.light, 'the two themes paint it differently').not.toBe(seen.dark);
  });

  test('Tab into a chart, ArrowRight, Enter records an af-drill', async ({ page }) => {
    const bucket = (COLUMN_STACKED.result as { measures: Record<string, { buckets: { key: string; segments: { key: string; count: number; drill: unknown }[] }[] }> }).measures.pipeline!.buckets[1]!;
    const segment = bucket.segments[0]!;
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'COLUMN_STACKED');
      await tile.locator('[part="table-toggle"]').focus();
      await page.keyboard.press('Tab');
      await expect.poll(() => heldMark(page), { message: `${theme}: Tab lands on the first mark` }).toEqual({ bucket: 0, series: 0 });
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => heldMark(page), { message: `${theme}: ArrowRight moves to the next week` }).toEqual({ bucket: 1, series: 0 });
      expect(await drillsOf(page, theme, 'COLUMN_STACKED'), 'moving opens nothing').toEqual([]);
      await page.keyboard.press('Enter');
      const detail: AfDrillDetail = { drill: segment.drill as AfDrillDetail['drill'], measure: 'pipeline', bucket: bucket.key, segment: segment.key, label: `${bucket.key} · New`, count: segment.count, other: false, newTab: false };
      await expect.poll(() => drillsOf(page, theme, 'COLUMN_STACKED'), { message: `${theme}: Enter opens the week's first segment` }).toEqual([detail]);
    }
  });

  test('Enter and Space on a number tile each record an af-drill', async ({ page }) => {
    test.slow();
    const detail = (NUMBER_GOAL.result as { population: { count: number; drill: unknown } }).population;
    const expected: AfDrillDetail = { drill: detail.drill as AfDrillDetail['drill'], measure: 'revenue', bucket: null, segment: null, label: 'sum · Amount', count: detail.count, other: false, newTab: false };
    for (const theme of THEMES) {
      const value = tileOf(page, theme, 'NUMBER_GOAL').locator('[part="value"]');
      expect(await value.evaluate((el) => el.localName), 'a native button').toBe('button');
      await value.focus();
      await page.keyboard.press('Enter');
      await expect.poll(() => drillsOf(page, theme, 'NUMBER_GOAL'), { message: `${theme}: Enter` }).toEqual([expected]);
      await page.keyboard.press('Space');
      await expect.poll(() => drillsOf(page, theme, 'NUMBER_GOAL'), { message: `${theme}: Space` }).toEqual([expected, expected]);
    }
  });

  test('hovering a column shows its tooltip unclipped in the top layer', async ({ page }) => {
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'COLUMN_STACKED');
      await markOf(tile, 3, 1).hover();
      const tooltip = tile.locator('[part="tooltip"]');
      await expect.poll(() => tooltip.evaluate((el) => el.matches(':popover-open')), { message: `${theme}: the tooltip opens` }).toBe(true);
      await expect(tooltip, `${theme}: and can be seen`).toBeVisible();
      const shown = await tooltip.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const view = document.documentElement;
        return {
          inside: r.left >= 0 && r.top >= 0 && r.right <= view.clientWidth && r.bottom <= view.clientHeight,
          width: r.width,
          position: getComputedStyle(el).position,
          words: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
        };
      });
      expect(shown.inside, `${theme}: wholly inside the viewport`).toBe(true);
      expect(shown.width, `${theme}: has a box`).toBeGreaterThan(0);
      expect(shown.position, `${theme}: in the top layer, so no container clips it`).toBe('fixed');
      expect(shown.words, `${theme}: names the week and its segments`).toContain(WEEKS[3]);
      expect(shown.words).toContain('Qualified');
      await page.mouse.move(5, 5);
      await expect.poll(() => tooltip.evaluate((el) => el.matches(':popover-open')), { message: `${theme}: it closes when the pointer leaves` }).toBe(false);
    }
  });

  test('the table view lists every bucket, and its scroll area is a tab stop only while it scrolls', async ({ page }) => {
    test.slow();
    const labels = (name: keyof typeof TILE_CASES) => {
      const result = TILE_CASES[name].result as { measures: Record<string, { buckets: { key: string | null }[] }> };
      return Object.values(result.measures)[0]!.buckets.map((b) => b.key);
    };
    const cases = { COLUMN_STACKED: labels('COLUMN_STACKED'), BAR_GROUPED: ['North', 'Central', 'South', 'Online'], LINE: labels('LINE') };
    for (const theme of THEMES) {
      for (const [name, rows] of Object.entries(cases)) {
        const tile = tileOf(page, theme, name);
        const toggle = tile.locator('[part="table-toggle"]');
        expect(await toggle.getAttribute('aria-pressed'), `${theme} ${name}: a plain button`).toBeNull();
        await toggle.click();
        const table = tile.locator('[part="table"]');
        await expect(table, `${theme} ${name}`).toBeVisible();
        await expect(tile.locator('[part="plot"]')).toHaveCount(0);
        expect(await table.locator('tbody tr th').allTextContents(), `${theme} ${name}: a row for each bucket, in order`).toEqual(rows);

        // The tile's cell is given the room, so each state is built rather than left to how long a language's headings run.
        const region = tile.locator('[part="viewport"]');
        const room = (width: string) => tile.evaluate((el, w) => ((el.parentElement as HTMLElement).style.width = w), width);
        await room('3000px');
        await expect.poll(() => region.getAttribute('tabindex'), { message: `${theme} ${name}: a table that fits is no tab stop` }).toBeNull();
        await region.focus();
        await expect(region, `${theme} ${name}: and takes no focus`).not.toBeFocused();
        await room('140px');
        await expect(region, `${theme} ${name}: squeezed, it scrolls, so it is a stop`).toHaveAttribute('tabindex', '0');
        await region.focus();
        await expect(region, `${theme} ${name}: and a keyboard can scroll it`).toBeFocused();
        await room('3000px');
        await expect.poll(() => region.getAttribute('tabindex'), { message: `${theme} ${name}: widened, it is no stop again` }).toBeNull();
        await room('');
        await toggle.click();
        await expect(tile.locator('[part="plot"]'), `${theme} ${name}: back to the chart`).toBeAttached();
        await expect(table).toHaveCount(0);
      }
    }
  });

  test('Tab shows a focus ring on a mark', async ({ page }) => {
    const tile = tileOf(page, 'light', 'COLUMN_STACKED');
    const mark = markOf(tile, 0, 0);
    await page.mouse.move(5, 5);
    await tile.locator('[part="table-toggle"]').focus();
    await tile.evaluate((el) => el.shadowRoot!.append(Object.assign(document.createElement('style'), { textContent: '[part="tooltip"] { display: none !important; }' })));
    const before = await pictureOf(page, mark);
    await page.keyboard.press('Tab');
    await expect.poll(() => heldMark(page)).toEqual({ bucket: 0, series: 0 });
    expect(await ringOf(mark), 'keyboard focus matches :focus-visible and the ring is 2px solid').toMatchObject({ focusVisible: true, style: 'solid', width: '2px' });
    expect((await pictureOf(page, mark)).equals(before), 'the ring is drawn around the mark').toBe(false);
  });

  test('a click leaves no focus ring', async ({ page }) => {
    const tile = tileOf(page, 'light', 'COLUMN_STACKED');
    const mark = markOf(tile, 2, 1);
    await page.mouse.move(5, 5);
    await tile.evaluate((el) => el.shadowRoot!.append(Object.assign(document.createElement('style'), { textContent: '[part="tooltip"] { display: none !important; }' })));
    const before = await pictureOf(page, mark);
    await mark.click();
    await expect.poll(() => heldMark(page), { message: 'the click took focus, so a ring would be possible' }).toEqual({ bucket: 2, series: 1 });
    expect(await ringOf(mark), 'a pointer focus does not match :focus-visible, and the browser adds no outline of its own').toMatchObject({ focusVisible: false, style: 'none' });
    expect((await pictureOf(page, mark)).equals(before), 'nothing is drawn around the mark').toBe(true);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => heldMark(page)).toEqual({ bucket: 3, series: 1 });
    expect(await ringOf(markOf(tile, 3, 1)), 'a key moves focus and shows the ring again').toMatchObject({ focusVisible: true, style: 'solid' });
  });

  test("a pie's slices take their option colours in both themes", async ({ page }) => {
    // The stage field lists new, qualified, won and lost, so won is the third colour, qualified the second and lost the fourth. Region lists four in order.
    const cases = { PIE: { slices: 5, slots: [3, 2, 4] }, DONUT: { slices: 4, slots: [1, 2, 3, 4] } };
    const seen: Record<string, string> = {};
    for (const theme of THEMES) {
      for (const [name, { slices, slots }] of Object.entries(cases)) {
        const tile = tileOf(page, theme, name);
        await expect(tile.locator('[part="plot"] [data-kind="slice"]'), `${theme} ${name}`).toHaveCount(slices);
        const drawn = await tile.evaluate((el, wanted) => {
          const root = el.shadowRoot!;
          const kit = root.querySelector('.af-kit')!;
          const resolve = (value: string) => {
            const probe = document.createElement('i');
            probe.style.fill = value;
            kit.append(probe);
            const fill = getComputedStyle(probe).fill;
            probe.remove();
            return fill;
          };
          return [...root.querySelectorAll<SVGElement>('[part="plot"] [data-kind="slice"]')].map((slice, i) => ({
            fill: getComputedStyle(slice).fill,
            inline: slice.style.fill,
            token: wanted[i] === undefined ? null : resolve(`var(--k-chart-${wanted[i]})`),
          }));
        }, slots);
        drawn.forEach((slice, i) => {
          if (slots[i] === undefined) return expect(slice.inline, `${theme} ${name} slice ${i}: the remainder and the withheld slice are hatched`).toMatch(/^url\(/);
          expect(slice.inline, `${theme} ${name} slice ${i}: painted by the token, not a literal`).toBe(`var(--k-chart-${slots[i]})`);
          expect(slice.fill, `${theme} ${name} slice ${i}: the option's colour`).toBe(slice.token);
        });
        seen[`${theme}${name}`] = drawn[0]!.fill;
      }
    }
    expect(seen.lightPIE, 'the two themes paint a slice differently').not.toBe(seen.darkPIE);
  });

  test('Tab into a pie, ArrowRight, Enter records an af-drill', async ({ page }) => {
    const bucket = (PIE.result as { measures: Record<string, { buckets: { key: string; count: number; drill: unknown }[] }> }).measures.deals!.buckets[1]!;
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'PIE');
      await tile.locator('[part="table-toggle"]').focus();
      await page.keyboard.press('Tab');
      await expect.poll(() => heldMark(page), { message: `${theme}: Tab lands on the first slice` }).toEqual({ bucket: 0, series: 0 });
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => heldMark(page), { message: `${theme}: ArrowRight moves to the next slice` }).toEqual({ bucket: 1, series: 0 });
      expect(await drillsOf(page, theme, 'PIE'), 'moving opens nothing').toEqual([]);
      await page.keyboard.press('Enter');
      const detail: AfDrillDetail = { drill: bucket.drill as AfDrillDetail['drill'], measure: 'deals', bucket: bucket.key, segment: null, label: 'Qualified', count: bucket.count, other: false, newTab: false };
      await expect.poll(() => drillsOf(page, theme, 'PIE'), { message: `${theme}: Enter opens the slice's records` }).toEqual([detail]);
    }
  });

  test('small multiples line up their buckets', async ({ page }) => {
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'MULTIPLES');
      await expect(tile.locator('[part="plot"]'), `${theme}: a panel for each unit`).toHaveCount(2);
      const lefts = await tile.evaluate((el, buckets) => {
        const plots = [...el.shadowRoot!.querySelectorAll('[part="plot"]')];
        return plots.map((plot) => Array.from({ length: buckets }, (_, b) => plot.querySelector(`[role="button"][data-bucket="${b}"]`)!.getBoundingClientRect().x));
      }, WEEKS.length);
      const [first, second] = lefts as [number[], number[]];
      first.forEach((x, b) => expect(Math.abs(x - second[b]!), `${theme}: week ${b} starts at the same x in both panels`).toBeLessThanOrEqual(0.5));
      expect(first[WEEKS.length - 1]! - first[0]!, `${theme}: and the weeks are spread across the panel`).toBeGreaterThan(100);
    }
  });

  test('one Tab moves from a small-multiples panel to the next', async ({ page }) => {
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'MULTIPLES');
      await tile.locator('[part="table-toggle"]').focus();
      await page.keyboard.press('Tab');
      await expect.poll(() => heldPanel(page), { message: `${theme}: Tab lands in the first panel` }).toBe(0);
      await page.keyboard.press('Tab');
      await expect.poll(() => heldPanel(page), { message: `${theme}: one more Tab lands in the second` }).toBe(1);
      expect(await heldMark(page), `${theme}: on that panel's own first mark`).toEqual({ bucket: 0, series: 0 });
    }
  });

  test('a list row click records an af-open-record', async ({ page }) => {
    const row = LIST.rows![1]!;
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'LIST');
      // Beside the button, in the third cell: the whole row opens its record.
      await tile.locator('tbody tr').nth(1).locator('td').nth(2).click();
      await expect.poll(() => opensOf(page, theme, 'LIST'), { message: `${theme}: the row's record and entity` }).toEqual([{ record: row.id, entity: row.entity_id, newTab: false }]);
      expect(await drillsOf(page, theme, 'LIST'), `${theme}: and a list sends no af-drill`).toEqual([]);
    }
  });

  test('Enter and Space on a list row’s button each record one af-open-record', async ({ page }) => {
    const row = LIST.rows![0]!;
    const expected = { record: row.id, entity: row.entity_id, newTab: false };
    for (const theme of THEMES) {
      const button = tileOf(page, theme, 'LIST').locator('tbody tr').first().locator('button');
      await button.focus();
      await page.keyboard.press('Enter');
      await expect.poll(() => opensOf(page, theme, 'LIST'), { message: `${theme}: Enter` }).toEqual([expected]);
      await page.keyboard.press('Space');
      await expect.poll(() => opensOf(page, theme, 'LIST'), { message: `${theme}: Space` }).toEqual([expected, expected]);
    }
  });

  test("a text tile's raw HTML is text in a real browser", async ({ page }) => {
    const body = ['a <b>bold</b> c', '', '<a href="http://evil.example">click</a>', '', '<img src="http://evil.example/x.png" onerror="window.pwned = 1">', '', '<script>window.pwned = 1</script>'].join('\n');
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'TEXT');
      await tile.evaluate((el, markdown) => Object.assign(el, { spec: { kind: 'text', label: 'Raw HTML', body: markdown } }), body);
      const prose = tile.locator('[part~="prose"]');
      await expect(prose, `${theme}: its source is on the page as words`).toContainText('a <b>bold</b> c');
      await expect(prose).toContainText('<script>window.pwned = 1</script>');
      await expect(prose.locator('a, img, script, b'), `${theme}: and none of it is a live element`).toHaveCount(0);
    }
    expect(await page.evaluate(() => (window as unknown as { pwned?: number }).pwned), 'nothing ran').toBeUndefined();
  });

  test('the verdict chip shows under a fanned-out chart', async ({ page }) => {
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'COLUMN_FANS_OUT');
      const verdict = tile.locator('[part="verdict"]');
      await expect(verdict, `${theme}: shown`).toBeVisible();
      await expect(verdict).toHaveAttribute('data-verdict', 'fans_out');
      await expect(verdict).toContainText(/250[.,]000/);
      const drawn = await tile.evaluate((el) => {
        const root = el.shadowRoot!;
        const kit = root.querySelector('.af-kit')!;
        const chip = root.querySelector('[part="verdict"]')!;
        const color = (value: string) => {
          const probe = document.createElement('i');
          probe.style.color = value;
          kit.append(probe);
          const resolved = getComputedStyle(probe).color;
          probe.remove();
          return resolved;
        };
        const plot = root.querySelector('[part="plot"]')!.getBoundingClientRect();
        const frame = root.querySelector('[part="frame"]')!.getBoundingClientRect();
        const box = chip.getBoundingClientRect();
        return {
          below: box.top >= plot.bottom - 0.5,
          inside: box.left >= frame.left - 0.5 && box.right <= frame.right + 0.5 && box.bottom <= frame.bottom + 0.5,
          icon: getComputedStyle(chip.querySelector('svg')!).color,
          words: getComputedStyle(chip.querySelector('.words')!).color,
          warning: color('var(--k-warning)'),
          fg: color('var(--k-fg)'),
        };
      });
      expect(drawn.below, `${theme}: under the chart`).toBe(true);
      expect(drawn.inside, `${theme}: inside the frame`).toBe(true);
      expect(drawn.icon, `${theme}: the warning icon alone is in the warning colour`).toBe(drawn.warning);
      expect(drawn.words, `${theme}: the words are in the text colour`).toBe(drawn.fg);
    }
  });

  test('a list wider than its tile scrolls inside the tile, which is a tab stop while its rows hold no buttons', async ({ page }) => {
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'LIST');
      const region = tile.locator('[part="viewport"]');
      // With drill each row's first cell is a button, which Tab reaches, so the region is no stop of its own.
      await expect.poll(() => region.getAttribute('tabindex'), { message: `${theme}: rows with buttons, no stop` }).toBeNull();
      await tile.evaluate((el) => ((el as HTMLElement & { drill: boolean }).drill = false));
      await expect(region, `${theme}: rows of text alone, a tab stop while it scrolls`).toHaveAttribute('tabindex', '0');
      const shown = await tile.evaluate((el) => {
        const root = el.shadowRoot!;
        const scroller = root.querySelector('[part="viewport"]')!;
        const frame = root.querySelector('[part="frame"]')!;
        return { scrolls: scroller.scrollWidth > scroller.clientWidth, spills: frame.scrollWidth > frame.clientWidth + 1 };
      });
      expect(shown.scrolls, `${theme}: nine columns are wider than the tile`).toBe(true);
      expect(shown.spills, `${theme}: and the tile itself does not spill`).toBe(false);
      await region.focus();
      await expect(region, `${theme}: a keyboard can scroll it`).toBeFocused();
      // Reached by the keyboard, the box around it draws the tile's ring, a solid 2px inside its edge and over the sticky
      // header row, and the region draws no outline of its own.
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(region).toBeFocused();
      const ring = await tile.evaluate((el) => {
        const style = getComputedStyle(el.shadowRoot!.querySelector('.ring')!, '::after');
        return { width: style.borderTopWidth, style: style.borderTopStyle, content: style.content };
      });
      expect(ring, `${theme}: the tile's ring`).toEqual({ width: '2px', style: 'solid', content: '""' });
      await expect(region, `${theme}: and no outline of its own`).toHaveCSS('outline-style', 'none');
      await tile.evaluate((el) => ((el as HTMLElement & { drill: boolean }).drill = true));
    }
  });

  // A dashboard card draws its own frame and takes the tile's padding away, and the tile's frame scrolls, so a ring drawn
  // outside the region would be cut off where the region meets the frame. The ring is the kit scroller's, drawn inside the
  // viewport's own edge, which is an isolated box, so the table's sticky header row cannot paint over it.
  test("a wide list's focus ring shows inside a frame with no padding", async ({ page }) => {
    await page.addStyleTag({ content: 'af-tile.bare::part(frame) { padding: 0; border: 0; }' });
    for (const theme of THEMES) {
      const tile = tileOf(page, theme, 'LIST');
      await tile.evaluate((el) => el.classList.add('bare'));
      // With drill each row's first cell is a button, which Tab reaches, so the region is a stop only with the rows as text.
      await tile.evaluate((el) => ((el as HTMLElement & { drill: boolean }).drill = false));
      const region = tile.locator('[role="region"]');
      await expect(region, `${theme}: rows of text alone, a tab stop while it scrolls`).toHaveAttribute('tabindex', '0');
      await region.scrollIntoViewIfNeeded();
      const before = await region.screenshot({ animations: 'disabled' });
      await region.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(region, `${theme}: focus came back by the keyboard`).toBeFocused();
      expect(await region.evaluate((el) => el.matches(':focus-visible')), `${theme}: a keyboard focus`).toBe(true);
      const after = await region.screenshot({ animations: 'disabled' });
      expect(after.equals(before), `${theme}: the ring is drawn where the frame does not cut it`).toBe(false);
      await tile.evaluate((el) => ((el as HTMLElement & { drill: boolean }).drill = true));
    }
  });

  test('a tile squeezed to 150px keeps a slice’s figure and a table’s words whole', async ({ page }) => {
    const squeeze = (tile: Locator) => tile.evaluate((el) => ((el.parentElement as HTMLElement).style.width = '150px'));
    for (const theme of THEMES) {
      const donut = tileOf(page, theme, 'DONUT');
      await squeeze(donut);
      await expect(donut.locator('[part="legend-item"]'), `${theme}: a slice each`).toHaveCount(4);
      const lines = await donut.evaluate((el) => [...el.shadowRoot!.querySelectorAll('[part="legend-item"] .detail')].map((d) => d.getBoundingClientRect().height));
      expect(Math.max(...lines), `${theme}: a value and its share stay on one line`).toBeLessThanOrEqual(20);

      const text = tileOf(page, theme, 'TEXT');
      await squeeze(text);
      const scroller = text.locator('[part~="prose"] .scroll [part="viewport"]');
      await expect(scroller, `${theme}: the table is wider than the tile, so it scrolls`).toHaveAttribute('tabindex', '0');
      const heads = await text.evaluate((el) =>
        [...el.shadowRoot!.querySelectorAll('[part~="prose"] th')].map((th) => {
          const range = document.createRange();
          range.selectNodeContents(th);
          return [...range.getClientRects()].length;
        }),
      );
      expect(heads, `${theme}: one word is on one line, not broken`).toEqual([1, 1, 1]);
    }
  });
});
