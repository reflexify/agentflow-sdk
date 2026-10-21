// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { ProjectsError, type ProjectsApi } from '../../src/api/projects-api.js';
import { HOA, MINH } from '../../src/api/seed.js';
import type { MenuItem } from '../../src/kit/elements.js';
import { App } from '../../src/shell/App.js';
import { TEXT, t } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';

const vi_ = TEXT.vi;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type Call = { op: 'create'; project: string; name: string; position: number } | { op: 'update'; changes: object } | { op: 'delete'; id: string };

function seeded(you: string) {
  const fake = createFakeProjects({ you });
  const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
  const section = (name: string) => fake.server.records('section').find((r) => r.body.name === name);
  const calls: Call[] = [];
  const api = (inner: ProjectsApi): ProjectsApi => ({
    ...inner,
    createSection: (project, name, position) => {
      calls.push({ op: 'create', project, name, position });
      return inner.createSection(project, name, position);
    },
    updateSection: (s, changes) => {
      calls.push({ op: 'update', changes });
      return inner.updateSection(s, changes);
    },
    deleteSection: (s) => {
      calls.push({ op: 'delete', id: s.id });
      return inner.deleteSection(s);
    },
  });
  return { fake, launch, section, calls, api };
}

const columnOf = (title: string) =>
  [...document.querySelectorAll('.board > li > section')].find((s) => s.querySelector('.column-name')?.textContent === title) as HTMLElement;
const columnTitles = () => [...document.querySelectorAll('.board > li > section .column-name')].map((n) => n.textContent);
type MenuEl = HTMLElement & { items: MenuItem[] };
const menuOf = (title: string) => columnOf(title).querySelector('af-menu') as MenuEl | null;
const choose = (menu: Element, id: string) =>
  act(() => { menu.dispatchEvent(new CustomEvent('select', { detail: { id }, bubbles: true })); });

async function renderBoard(you: string, setup?: (s: ReturnType<typeof seeded>) => void) {
  const s = seeded(you);
  setup?.(s);
  const view = renderProjects(<App />, { fake: s.fake, api: s.api, lang: 'vi', path: `/p/${s.launch}` });
  await waitFor(() => expect(columnTitles()).toContain('Thiết kế'));
  return { ...s, view };
}

describe('a section header', () => {
  it("reads the section's name with its done and total counts", async () => {
    await renderBoard(MINH, ({ fake, launch, section }) => {
      fake.server.write('task', null, { title: 'Duyệt giao diện', project: launch, section: section('Thiết kế')!.id, status: 'done', position: 4096 }, MINH);
    });
    const column = columnOf('Thiết kế');
    await waitFor(() => expect(column.querySelector('h3')!.textContent).toBe('Thiết kế · 1/3'));
    expect(within(column).getByRole('heading', { name: 'Thiết kế · 1/3' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Thiết kế · 1/3' })).toBe(column);
  });

  it('keeps the description, as plain text, in the info icon’s tooltip and name', async () => {
    await renderBoard(MINH, ({ fake, section }) => {
      fake.server.write('section', section('Thiết kế')!.id, { description: 'Thiết kế **giao diện** và [kiến trúc](https://example.com)' }, MINH);
    });
    const info = columnOf('Thiết kế').querySelector('[data-part="section-info"]')!;
    hoverTooltips();
    expect((info.closest('af-tooltip') as HTMLElement & { text: string }).text).toBe('Thiết kế giao diện và kiến trúc');
    expect(info.getAttribute('aria-label')).toBe('Thiết kế giao diện và kiến trúc');
  });

  it('offers a manager Đổi tên, Mô tả and Xoá', async () => {
    await renderBoard(MINH);
    expect(menuOf('Thiết kế')!.items.map((i) => i.label)).toEqual([vi_.renameSection, vi_.describeSection, vi_.deleteSection]);
    expect((menuOf('Thiết kế') as MenuEl & { label: string }).label).toBe('Thao tác hạng mục: Thiết kế');
  });

  it('renames in place', async () => {
    const { calls, section } = await renderBoard(MINH);
    const column = columnOf('Thiết kế');
    choose(menuOf('Thiết kế')!, 'rename');
    const input = within(column).getByRole('textbox', { name: vi_.sectionName });
    expect((input as HTMLInputElement).value).toBe('Thiết kế');
    fireEvent.change(input, { target: { value: 'Thiết kế giao diện' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(document.activeElement).toBe(column.querySelector('h3'));
    await waitFor(() => expect(section('Thiết kế giao diện')).toBeTruthy());
    expect(calls).toEqual([{ op: 'update', changes: { name: 'Thiết kế giao diện' } }]);
    await waitFor(() => expect(columnTitles()).toContain('Thiết kế giao diện'));
  });

  it('leaves the name as it was on Esc or when emptied', async () => {
    const { calls } = await renderBoard(MINH);
    choose(menuOf('Thiết kế')!, 'rename');
    let input = screen.getByRole('textbox', { name: vi_.sectionName });
    fireEvent.change(input, { target: { value: 'Khác' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(columnTitles()).toContain('Thiết kế');
    expect(document.activeElement).toBe(columnOf('Thiết kế').querySelector('h3'));
    choose(menuOf('Thiết kế')!, 'rename');
    input = screen.getByRole('textbox', { name: vi_.sectionName });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(columnTitles()).toContain('Thiết kế');
    expect(calls).toEqual([]);
  });

  it('edits the description in a small dialog with the rich editor', async () => {
    const { calls, section } = await renderBoard(MINH);
    choose(menuOf('Thiết kế')!, 'describe');
    const dialog = columnOf('Thiết kế').querySelector('af-dialog') as HTMLElement & { open: boolean; heading: string };
    await waitFor(() => expect(dialog.open).toBe(true));
    const editor = dialog.querySelector('af-rich-editor') as HTMLElement & { value: string };
    expect(editor.value).toBe(section('Thiết kế')!.body.description);
    act(() => { editor.dispatchEvent(new CustomEvent('change', { detail: { value: 'Thiết kế **mới**' } })); });
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.save }));
    await waitFor(() => expect(section('Thiết kế')!.body.description).toBe('Thiết kế **mới**'));
    expect(calls).toEqual([{ op: 'update', changes: { description: 'Thiết kế **mới**' } }]);
    await waitFor(() => expect(dialog.open).toBe(false));
  });

  it('deletes after a confirm that names what happens to its tasks, and its tasks move to No section', async () => {
    const { calls, section } = await renderBoard(MINH);
    const id = section('Thiết kế')!.id;
    choose(menuOf('Thiết kế')!, 'delete');
    const confirm = columnOf('Thiết kế').querySelector('af-confirm') as HTMLElement & {
      open: boolean; heading: string; impact: string; confirmLabel: string; danger: boolean; strings: { cancel?: string };
    };
    await waitFor(() => expect(confirm.open).toBe(true));
    expect(confirm.heading).toBe(t('vi', 'deleteSectionHeading', { name: 'Thiết kế' }));
    expect(confirm.impact).toBe(t('vi', 'sectionDeleteImpact', { n: 2 }));
    expect(confirm.impact).toBe('2 task sẽ chuyển sang Chưa có hạng mục');
    expect(confirm.danger).toBe(true);
    expect(confirm.strings.cancel).toBe(vi_.goBack);
    act(() => { confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    act(() => { confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    await waitFor(() => expect(section('Thiết kế')).toBeUndefined());
    expect(calls).toEqual([{ op: 'delete', id }]);
    await waitFor(() => expect(columnTitles()).toEqual([vi_.noSection, 'Phân tích', 'Phát triển', 'Kiểm thử']));
    const moved = [...columnOf(vi_.noSection).querySelectorAll('[data-part="title"]')].map((b) => b.textContent);
    expect(moved).toEqual(expect.arrayContaining(['Thiết kế màn hình đăng nhập', 'Thiết kế luồng thanh toán']));
  });

  it('says a refused section delete in the server\'s sentence, not in words about labels', async () => {
    const s = seeded(MINH);
    const reason = 'deleting this record would change records you cannot edit';
    const refuse = (inner: ProjectsApi): ProjectsApi => ({
      ...s.api(inner),
      deleteSection: () => Promise.reject(new ProjectsError('forbidden', 403, 'ENTITY_RECORD_CASCADE_FORBIDDEN', reason, undefined, null, null, null, { forbidden: 3 })),
    });
    const view = renderProjects(<App />, { fake: s.fake, api: refuse, lang: 'vi', path: `/p/${s.launch}` });
    await waitFor(() => expect(columnTitles()).toContain('Thiết kế'));
    choose(menuOf('Thiết kế')!, 'delete');
    const confirm = columnOf('Thiết kế').querySelector('af-confirm') as HTMLElement & { open: boolean };
    await waitFor(() => expect(confirm.open).toBe(true));
    act(() => { confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    await waitFor(() => expect(view.toasts()).toContain(reason));
    expect(view.toasts().join(' ')).not.toContain('Nhãn');
    expect(s.section('Thiết kế')).toBeDefined();
  });

  it('leaves focus where a Tab took it when the rename ends by leaving', async () => {
    const { calls } = await renderBoard(MINH);
    choose(menuOf('Thiết kế')!, 'rename');
    const input = screen.getByRole('textbox', { name: vi_.sectionName });
    const next = columnOf('Phát triển').querySelector('[data-part="section-info"]') as HTMLElement;
    next.focus();
    fireEvent.focusOut(input, { relatedTarget: next });
    expect(document.activeElement).toBe(next);
    expect(calls).toEqual([]);
  });

  it('counts the cancelled tasks that a delete moves, though the board hides them', async () => {
    await renderBoard(MINH, ({ fake, launch, section }) => {
      fake.server.write('task', null, { title: 'Phương án cũ', project: launch, section: section('Thiết kế')!.id, status: 'cancelled', position: 8192 }, MINH);
    });
    choose(menuOf('Thiết kế')!, 'delete');
    const confirm = columnOf('Thiết kế').querySelector('af-confirm') as HTMLElement & { open: boolean; impact: string };
    await waitFor(() => expect(confirm.open).toBe(true));
    expect(confirm.impact).toBe('3 task sẽ chuyển sang Chưa có hạng mục');
  });

  it('adds a section after the last one with Thêm hạng mục', async () => {
    const { calls, launch, section } = await renderBoard(MINH);
    fireEvent.click(screen.getByRole('button', { name: vi_.addSection }));
    const input = screen.getByRole('textbox', { name: vi_.sectionName });
    fireEvent.change(input, { target: { value: 'Bàn giao' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(section('Bàn giao')).toBeTruthy());
    // Kiểm thử, the last section, sits at 4096.
    expect(calls).toEqual([{ op: 'create', project: launch, name: 'Bàn giao', position: 5120 }]);
    expect(section('Bàn giao')!.body.position).toBe(5120);
    await waitFor(() => expect(columnTitles()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử', 'Bàn giao']));
    await waitFor(() => expect(document.activeElement).toBe(columnOf('Bàn giao').querySelector('h3')));
  });

  it('puts focus back on Thêm hạng mục when the new name is dropped', async () => {
    const { calls } = await renderBoard(MINH);
    fireEvent.click(screen.getByRole('button', { name: vi_.addSection }));
    fireEvent.keyDown(screen.getByRole('textbox', { name: vi_.sectionName }), { key: 'Escape' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: vi_.addSection }));
    expect(calls).toEqual([]);
  });

  it('shows a member none of these controls', async () => {
    await renderBoard(HOA);
    expect(document.querySelector('.board af-menu')).toBeNull();
    expect(screen.queryByRole('button', { name: vi_.addSection })).toBeNull();
    expect(columnOf('Thiết kế').querySelector('[data-part="section-info"]')).not.toBeNull();
  });
});
