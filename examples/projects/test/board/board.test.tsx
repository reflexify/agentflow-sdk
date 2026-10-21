// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { HOA, MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT, t } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';

const vi_ = TEXT.vi;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

function seeded(opts: { workflowDelay?: 'manual' } = {}) {
  const fake = createFakeProjects({ you: MINH, ...opts });
  const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
  return { fake, launch };
}

const boardEl = () => document.querySelector('.board') as HTMLElement;
const columnTitles = () => [...boardEl().querySelectorAll(':scope > li > section .column-name')].map((n) => n.textContent);
const columnOf = (title: string) =>
  [...boardEl().querySelectorAll(':scope > li > section')].find((s) => s.querySelector('.column-name')?.textContent === title) as HTMLElement;
const openTitles = (column: HTMLElement) => [...column.querySelectorAll('.column-list > li [data-part="title"]')].map((b) => b.textContent);

async function renderBoard(query = '', setup?: (s: ReturnType<typeof seeded>) => void, opts: { workflowDelay?: 'manual' } = {}) {
  const s = seeded(opts);
  setup?.(s);
  const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${s.launch}${query}` });
  await waitFor(() => expect(boardEl()?.querySelectorAll('[data-task]').length).toBeGreaterThan(0));
  return { ...s, view };
}

describe('the board', () => {
  it('is a list of columns named for the board', async () => {
    await renderBoard();
    expect(boardEl().tagName).toBe('UL');
    expect(boardEl().getAttribute('aria-label')).toBe('Kanban: Ra mắt ứng dụng');
    expect(boardEl().getAttribute('aria-label')).toBe(t('vi', 'board', { name: 'Ra mắt ứng dụng' }));
    for (const child of boardEl().children) expect(child.tagName).toBe('LI');
    const column = columnOf('Thiết kế');
    expect(column.tagName).toBe('SECTION');
    expect(document.getElementById(column.getAttribute('aria-labelledby')!)?.tagName).toBe('H3');
    expect(column.querySelector('ol.column-list')).not.toBeNull();
  });

  it('grouped by section, shows No section first when a task has none, then the sections in order', async () => {
    const plain = await renderBoard();
    expect(columnTitles()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']);
    plain.view.unmount();

    await renderBoard('', ({ fake, launch }) => {
      fake.server.write('task', null, { title: 'Việc chưa xếp', project: launch, status: 'todo', position: 1024 }, MINH);
    });
    await waitFor(() => expect(columnTitles()).toEqual([vi_.noSection, 'Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']));
    expect(openTitles(columnOf(vi_.noSection))).toEqual(['Việc chưa xếp']);
  });

  it("folds each section's done tasks at its foot, closed, newest first and dimmed", async () => {
    await renderBoard();
    const analysis = columnOf('Phân tích');
    expect(openTitles(analysis)).toEqual([]);
    const fold = analysis.querySelector('details.fold') as HTMLDetailsElement;
    expect(fold.open).toBe(false);
    expect(fold.querySelector('summary')!.textContent).toBe(t('vi', 'doneFold', { n: 2 }));
    // The fold is the last thing in the column's scroller.
    expect(fold.parentElement!.lastElementChild).toBe(fold);
    const folded = [...fold.querySelectorAll('[data-task]')];
    expect(folded.map((c) => c.querySelector('[data-part="title"]')!.textContent)).toEqual(['Viết tài liệu đặc tả', 'Thu thập yêu cầu từ khách hàng']);
    for (const c of folded) expect(c.getAttribute('data-dimmed')).toBe('true');
    expect(columnOf('Thiết kế').querySelector('details.fold')).toBeNull();
  });

  it('grouped by status, keeps done tasks in Hoàn thành itself, with no fold anywhere', async () => {
    await renderBoard('?group=status');
    await waitFor(() => expect(columnTitles()).toEqual([vi_.statusTodo, vi_.statusDoing, vi_.statusDone]));
    expect(openTitles(columnOf(vi_.statusDone)).sort()).toEqual(['Thu thập yêu cầu từ khách hàng', 'Viết tài liệu đặc tả']);
    expect(boardEl().querySelector('details')).toBeNull();
    for (const c of columnOf(vi_.statusDone).querySelectorAll('[data-task]')) expect(c.hasAttribute('data-dimmed')).toBe(false);
  });

  it('keeps a task ticked a moment ago on a board read again before its completion stamp lands', async () => {
    for (const query of ['', '?group=status']) {
      const { fake, view } = await renderBoard(query, undefined, { workflowDelay: 'manual' });
      if (query) await waitFor(() => expect(columnTitles()).toContain(vi_.statusDone));
      const PAYMENT = 'Tích hợp cổng thanh toán';
      const card = [...boardEl().querySelectorAll<HTMLElement>('[data-task]')].find((c) => c.querySelector('[data-part="title"]')?.textContent === PAYMENT)!;
      act(() => (card.querySelector('[data-part="tick"]') as HTMLElement).click());
      const record = () => fake.server.records('task').find((r) => r.body.title === PAYMENT)!;
      await waitFor(() => expect(record().body.status).toBe('done'));
      expect(record().body.completed_at).toBeUndefined();
      // Someone else's change makes the board read itself again, while the stamp is still owed.
      const other = fake.server.records('task').find((r) => r.body.title === 'Xây dựng API đăng nhập')!;
      act(() => { fake.server.write('task', other.id, { title: 'Xây dựng API đăng nhập v2' }, HOA); });
      await waitFor(() => expect(boardEl().textContent).toContain('Xây dựng API đăng nhập v2'));
      const where = () => (query ? columnOf(vi_.statusDone) : columnOf('Phát triển').querySelector('details.fold') as HTMLElement | null);
      expect(where()?.textContent).toContain(PAYMENT);
      await act(async () => { await fake.server.drain(); });
      await waitFor(() => expect(record().body.completed_at).toBeTruthy());
      expect(where()?.textContent).toContain(PAYMENT);
      view.unmount();
    }
  });

  it('ticks from the version a drawer edit stored, though the board has not read itself again since', async () => {
    const s = seeded();
    const PAYMENT = 'Tích hợp cổng thanh toán';
    const id = s.fake.server.records('task').find((r) => r.body.title === PAYMENT)!.id;
    let hold = false;
    const view = renderProjects(<App />, {
      fake: s.fake, lang: 'vi', path: `/p/${s.launch}/t/${id}`,
      api: (api) => ({ ...api, boardTasks: (scope) => (hold ? new Promise(() => undefined) : api.boardTasks(scope)) }),
    });
    const drawer = await screen.findByRole('dialog', { name: PAYMENT });
    await waitFor(() => expect(boardEl()?.querySelector(`[data-task="${id}"]`)).not.toBeNull());
    hold = true;
    const stored = () => s.fake.server.records('task').find((r) => r.id === id)!.body;
    fireEvent.change(within(drawer).getByRole('combobox', { name: vi_.priority }), { target: { value: 'low' } });
    await waitFor(() => expect(stored().priority).toBe('low'));
    fireEvent.click(within(drawer).getByRole('button', { name: vi_.close }));
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    act(() => (boardEl().querySelector(`[data-task="${id}"] [data-part="tick"]`) as HTMLElement).click());
    await waitFor(() => expect(stored().status).toBe('done'));
    expect(stored().priority).toBe('low');
    expect(view.toasts()).toContain(vi_.taskCompleted);
    expect(view.toasts()).not.toContain(vi_.taskUpdatedElsewhere);
  });

  it('shows Đã huỷ only when cancelled tasks are asked for', async () => {
    const first = await renderBoard('?group=status');
    expect(columnTitles()).not.toContain(vi_.statusCancelled);
    first.view.unmount();
    await renderBoard('?group=status&cancelled=1');
    await waitFor(() => expect(columnTitles()).toEqual([vi_.statusTodo, vi_.statusDoing, vi_.statusDone, vi_.statusCancelled]));
    expect(openTitles(columnOf(vi_.statusCancelled))).toEqual(['Viết kịch bản kiểm thử']);
  });
});

describe('the board, before anything is hovered', () => {
  it('mounts no tooltip until the pointer comes over an anchor or focus lands in one, and keeps the reasons in place', async () => {
    await renderBoard();
    expect(document.querySelector('af-tooltip')).toBeNull();
    // Minh manages the project; Hoa holds this task, so Minh's tick is locked, and the reason is there already.
    const card = document.querySelector('[data-task] [data-part="title"]')!.closest('[data-task]')!;
    const designCard = [...document.querySelectorAll('[data-task]')].find((c) => c.querySelector('[data-part="title"]')!.textContent === 'Thiết kế màn hình đăng nhập')!;
    const tick = designCard.querySelector('[data-part="tick"]')!;
    expect(document.getElementById(tick.getAttribute('aria-describedby')!)!.textContent).toBe(vi_.onlyPrimaryCompletes);

    const title = designCard.querySelector('[data-part="title"]') as HTMLElement;
    fireEvent.pointerOver(title);
    const tip = title.closest('af-tooltip') as (HTMLElement & { text: string }) | null;
    expect(tip?.text).toBe('Thiết kế màn hình đăng nhập');
    expect(document.querySelectorAll('af-tooltip')).toHaveLength(1);

    const other = card.querySelector('[data-part="title"]') as HTMLElement;
    act(() => other.focus());
    expect(other.closest('af-tooltip')).not.toBeNull();
    expect(document.activeElement).toBe(other);
  });
});

describe('dragging on the board', () => {
  it('makes each card a draggable group named for its task, with the instructions in Vietnamese', async () => {
    await renderBoard();
    const slot = [...boardEl().querySelectorAll('.column-list > li')].find((li) => li.textContent?.includes('Thiết kế màn hình đăng nhập'))!;
    expect(slot.getAttribute('role')).toBe('group');
    expect(slot.getAttribute('aria-label')).toBe('Thiết kế màn hình đăng nhập');
    expect(slot.getAttribute('aria-roledescription')).toBe(vi_.draggableCard);
    expect(slot.getAttribute('tabindex')).toBe('0');
    expect(document.getElementById(slot.getAttribute('aria-describedby')!)!.textContent).toBe(vi_.dragInstructions);
    expect(slot.getAttribute('aria-disabled')).toBe('false');
  });

  it("gives a manager a grip on each section's head, and a member none", async () => {
    const minh = await renderBoard();
    const grip = columnOf('Thiết kế').querySelector('[data-part="section-grip"]')!;
    expect(grip.getAttribute('aria-label')).toBe(t('vi', 'reorderSection', { name: 'Thiết kế' }));
    expect(grip.getAttribute('aria-roledescription')).toBe(vi_.draggableSection);
    minh.view.unmount();

    const fake = createFakeProjects({ you: HOA });
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}` });
    await waitFor(() => expect(boardEl()?.querySelectorAll('[data-task]').length).toBeGreaterThan(0));
    expect(boardEl().querySelector('[data-part="section-grip"]')).toBeNull();
  });

  it('does not lift a card offline, and leaves it no tab stop and no word of dragging', async () => {
    const { view } = await renderBoard();
    view.live.setStatus('offline');
    await waitFor(() => expect(boardEl().querySelector('.column-list > li')!.getAttribute('data-locked')).toBe('true'));
    const slot = boardEl().querySelector('.column-list > li')!;
    expect(slot.getAttribute('role')).toBe('group');
    expect(slot.hasAttribute('tabindex')).toBe(false);
    expect(slot.hasAttribute('aria-roledescription')).toBe(false);
    expect(slot.hasAttribute('aria-describedby')).toBe(false);
    fireEvent.keyDown(slot, { key: ' ', code: 'Space' });
    expect(boardEl().querySelector('[data-dragging="true"]')).toBeNull();
  });

  it("leaves Enter and Space to a card's own buttons, and lifts the card from its slot", async () => {
    await renderBoard();
    const slot = [...boardEl().querySelectorAll('.column-list > li')].find((li) => li.textContent?.includes('Thiết kế màn hình đăng nhập')) as HTMLElement;
    const title = slot.querySelector('[data-part="title"]') as HTMLElement;
    const tick = slot.querySelector('[data-part="tick"]') as HTMLElement;
    expect(fireEvent.keyDown(title, { key: 'Enter', code: 'Enter' })).toBe(true);
    expect(fireEvent.keyDown(tick, { key: ' ', code: 'Space' })).toBe(true);
    expect(boardEl().querySelector('[data-dragging="true"]')).toBeNull();
    expect(boardEl().hasAttribute('data-dragging')).toBe(false);

    expect(fireEvent.keyDown(slot, { key: ' ', code: 'Space' })).toBe(false);
    await waitFor(() => expect(slot.getAttribute('data-dragging')).toBe('true'));
    expect(boardEl().getAttribute('data-dragging')).toBe('card');
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    fireEvent.keyDown(slot, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(boardEl().hasAttribute('data-dragging')).toBe(false));
  });

  it('cancels a drag with Escape and leaves the open drawer open', async () => {
    const s = seeded();
    const task = s.fake.server.records('task').find((r) => r.body.title === 'Thiết kế luồng thanh toán')!.id;
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${s.launch}/t/${task}` });
    await waitFor(() => expect(boardEl()?.querySelectorAll('[data-task]').length).toBeGreaterThan(0));
    await waitFor(() => expect(document.querySelector('aside[role="dialog"]')).not.toBeNull());
    const slot = [...boardEl().querySelectorAll('.column-list > li')].find((li) => li.textContent?.includes('Thiết kế màn hình đăng nhập')) as HTMLElement;
    act(() => slot.focus());
    fireEvent.keyDown(slot, { key: ' ', code: 'Space' });
    await waitFor(() => expect(boardEl().getAttribute('data-dragging')).toBe('card'));
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    fireEvent.keyDown(slot, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(boardEl().hasAttribute('data-dragging')).toBe(false));
    expect(document.querySelector('aside[role="dialog"]')).not.toBeNull();

    fireEvent.keyDown(slot, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(document.querySelector('aside[role="dialog"]')).toBeNull());
  });
});
