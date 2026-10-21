// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectsApi } from '../../src/api/projects-api.js';
import type { ProjectChanges } from '../../src/model/types.js';
import { MAI, MINH, UNITS } from '../../src/api/seed.js';
import type { MenuItem } from '../../src/kit/elements.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { TEST_NOW, renderProjects } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { seeded } from '../task/support.js';

const vi_ = TEXT.vi;
const LAUNCH = 'Ra mắt ứng dụng';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type MenuEl = HTMLElement & { items: MenuItem[] };
type EditorEl = HTMLElement & { value: string };

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });
const menu = () => document.querySelector<MenuEl>('header af-menu')!;
const choose = (id: string) => act(() => { menu().dispatchEvent(new CustomEvent('select', { detail: { id }, bubbles: true })); });
const trigger = () => menu().shadowRoot!.querySelector<HTMLElement>('[part="trigger"]')!;

/** The page of Ra mắt ứng dụng as `you` with the edit drawer open; every project patch is recorded. */
async function openEdit(you = MINH, opts: { path?: string; before?: (s: ReturnType<typeof seeded>) => void } = {}) {
  const s = seeded(you);
  opts.before?.(s);
  const patches: ProjectChanges[] = [];
  const id = s.project(LAUNCH);
  const view = renderProjects(<App />, {
    fake: s.fake, lang: 'vi', path: opts.path ?? `/p/${id}`,
    api: (api: ProjectsApi) => ({ ...api, updateProject: (project, changes) => { patches.push(changes); return api.updateProject(project, changes); } }),
  });
  await waitFor(() => expect(menu()).toBeTruthy());
  choose('edit');
  const drawer = await screen.findByRole('dialog', { name: vi_.editProject });
  const stored = () => s.fake.server.records('project').find((r) => r.id === id)!.body;
  return { ...s, ...view, id, drawer, patches, stored };
}

const nameBox = (drawer: HTMLElement) => within(drawer).getByRole('textbox', { name: vi_.projectName }) as HTMLInputElement;
const editor = (drawer: HTMLElement) => drawer.querySelector('[data-field="description"] af-rich-editor') as EditorEl;
const unitSelect = (drawer: HTMLElement) => within(drawer).getByRole('combobox', { name: vi_.unit }) as HTMLSelectElement;
const groupSelect = (drawer: HTMLElement) => within(drawer).getByRole('combobox', { name: vi_.defaultGrouping }) as HTMLSelectElement;
const columnNames = () => [...document.querySelectorAll('.board > li > section .column-name')].map((n) => n.textContent);
const deepActive = (): Element | null => {
  let at = document.activeElement;
  while (at?.shadowRoot?.activeElement) at = at.shadowRoot.activeElement;
  return at;
};

describe('the project edit drawer', () => {
  it('opens on its heading, with the project\'s name, description, unit and grouping', async () => {
    const { drawer } = await openEdit();
    await waitFor(() => expect(document.activeElement).toBe(within(drawer).getByRole('heading', { name: vi_.editProject })));
    expect(nameBox(drawer).value).toBe(LAUNCH);
    expect(editor(drawer).value).toBe('Ra mắt ứng dụng di động phiên bản đầu tiên.');
    expect(unitSelect(drawer).value).toBe('');
    expect(groupSelect(drawer).value).toBe('section');
    const label = (field: string, tag: string) => (drawer.querySelector(`[data-field="${field}"] ${tag}`) as (HTMLElement & { label: string | null }) | null)?.label;
    expect(label('description', 'af-rich-editor')).toBe(vi_.description);
  });

  it('lists the units and Tự động, then the groupings as the group menu names them', async () => {
    const { drawer } = await openEdit();
    await waitFor(() => expect([...unitSelect(drawer).options].map((o) => o.textContent)).toEqual([vi_.noUnit, ...UNITS.map((u) => u.name)]));
    expect([...groupSelect(drawer).options].map((o) => o.textContent)).toEqual([
      vi_.groupAuto, vi_.groupStatus, vi_.groupSection, vi_.groupOwner, vi_.groupDue, vi_.groupPriority,
    ]);
  });

  it('saves the name when the field is left, one PATCH, and says nothing of it', async () => {
    const { drawer, patches, stored, toasts } = await openEdit();
    const box = nameBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: 'Ra mắt phiên bản 2' } });
    expect(patches).toEqual([]);
    fireEvent.blur(box);
    await waitFor(() => expect(stored().name).toBe('Ra mắt phiên bản 2'));
    expect(patches).toEqual([{ name: 'Ra mắt phiên bản 2' }]);
    await waitFor(() => expect(document.querySelector('header')!.textContent).toContain('Ra mắt phiên bản 2'));
    expect(toasts()).toEqual([]);
  });

  it('saves the name on Enter', async () => {
    const { drawer, patches, stored } = await openEdit();
    const box = nameBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: '  Tên mới  ' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(stored().name).toBe('Tên mới'));
    expect(patches).toEqual([{ name: 'Tên mới' }]);
  });

  it('writes nothing for a name that did not change', async () => {
    const { drawer, patches } = await openEdit();
    const box = nameBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: `${LAUNCH} ` } });
    fireEvent.blur(box);
    await settle();
    expect(patches).toEqual([]);
  });

  it('needs a name: a cleared one says Hãy nhập tên, goes back to the old one and writes nothing', async () => {
    const { drawer, patches, stored } = await openEdit();
    const box = nameBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: '   ' } });
    expect(within(drawer).getByText(vi_.nameRequired)).toBeTruthy();
    expect(box.getAttribute('aria-invalid')).toBe('true');
    fireEvent.blur(box);
    expect(box.value).toBe(LAUNCH);
    await settle();
    expect(within(drawer).queryByText(vi_.nameRequired)).toBeNull();
    expect(patches).toEqual([]);
    expect(stored().name).toBe(LAUNCH);
  });

  it('puts the name back on Escape and stays open', async () => {
    const { drawer, patches } = await openEdit();
    const box = nameBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: 'Đang gõ dở' } });
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(box.value).toBe(LAUNCH);
    expect(drawer.isConnected).toBe(true);
    await settle();
    expect(patches).toEqual([]);
  });

  it('saves the description from its editor', async () => {
    const { drawer, patches, stored } = await openEdit();
    act(() => { editor(drawer).dispatchEvent(new CustomEvent('change', { detail: { value: 'Mô tả mới của project' } })); });
    await waitFor(() => expect(stored().description).toBe('Mô tả mới của project'));
    expect(patches).toEqual([{ description: 'Mô tả mới của project' }]);
  });

  it('saves a unit at once, and clears it with Không có', async () => {
    const { drawer, patches, stored } = await openEdit();
    await waitFor(() => expect(unitSelect(drawer).options.length).toBe(UNITS.length + 1));
    fireEvent.change(unitSelect(drawer), { target: { value: UNITS[1]!.id } });
    await waitFor(() => expect(stored().unit).toBe(UNITS[1]!.id));
    await waitFor(() => expect(unitSelect(drawer).value).toBe(UNITS[1]!.id));
    fireEvent.change(unitSelect(drawer), { target: { value: '' } });
    await waitFor(() => expect(stored().unit ?? null).toBeNull());
    expect(patches).toEqual([{ unit: UNITS[1]!.id }, { unit: null }]);
  });

  it('saves the default grouping, and Tự động clears it', async () => {
    const { drawer, patches, stored } = await openEdit();
    fireEvent.change(groupSelect(drawer), { target: { value: 'priority' } });
    await waitFor(() => expect(stored().default_group_by).toBe('priority'));
    fireEvent.change(groupSelect(drawer), { target: { value: '' } });
    await waitFor(() => expect(stored().default_group_by ?? null).toBeNull());
    await waitFor(() => expect(groupSelect(drawer).value).toBe(''));
    expect(patches).toEqual([{ defaultGroupBy: 'priority' }, { defaultGroupBy: null }]);
  });

  it('moves the board to a new default grouping while the address names none', async () => {
    const { drawer } = await openEdit();
    await waitFor(() => expect(columnNames()).toContain('Thiết kế'));
    fireEvent.change(groupSelect(drawer), { target: { value: 'status' } });
    await waitFor(() => expect(columnNames()).toContain(vi_.statusTodo));
    expect(columnNames()).not.toContain('Thiết kế');
  });

  it('leaves a grouping the address names alone', async () => {
    const { drawer, id } = await openEdit(MINH, { path: undefined });
    act(() => {
      window.history.pushState(null, '', `/p/${id}?group=owner`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() => expect(window.location.search).toBe('?group=owner'));
    const before = columnNames();
    fireEvent.change(groupSelect(drawer), { target: { value: 'status' } });
    await settle();
    expect(columnNames()).toEqual(before);
  });

  it("shows the server's reason in a toast when it refuses an edit, and shows the stored value again, flashing its row", async () => {
    const { drawer, fake, toasts, stored } = await openEdit();
    fake.server.failNext('PATCH', /\/records\//, 422, {
      type: 'VALIDATION_ERROR', title: 'Unprocessable Entity', status: 422, detail: 'refused',
      field_errors: [{ path: '/default_group_by', message: 'Không đổi được cách nhóm', rule: 'r' }],
    });
    fireEvent.change(groupSelect(drawer), { target: { value: 'owner' } });
    await waitFor(() => expect(toasts()).toContain('Không đổi được cách nhóm'));
    await waitFor(() => expect(groupSelect(drawer).value).toBe('section'));
    expect(stored().default_group_by).toBe('section');
    const row = drawer.querySelector('.field-row[data-field="group"]')!;
    await waitFor(() => expect(row.hasAttribute('data-rolled-back')).toBe(true));
    expect(drawer.querySelectorAll('[data-rolled-back]')).toHaveLength(1);
  });

  it("reloads on a stale edit, says Project vừa được cập nhật and writes nothing over the other manager's change", async () => {
    const { drawer, fake, id, stored, toasts, patches } = await openEdit(MINH, {
      before: (s) => {
        const body = s.fake.server.records('project').find((r) => r.id === s.project(LAUNCH))!.body;
        s.fake.server.write('project', s.project(LAUNCH), { ...body, managers: [MINH, MAI] }, MINH, { notify: false });
      },
    });
    await settle();
    expect(nameBox(drawer).value).toBe(LAUNCH);
    // Mai's drawer is the other open one: she renames the project behind this module's back.
    fake.server.write('project', id, { ...stored(), name: 'Mới' }, MAI, { notify: false });
    await settle();
    expect(nameBox(drawer).value).toBe(LAUNCH);

    act(() => { editor(drawer).dispatchEvent(new CustomEvent('change', { detail: { value: 'Mô tả của Minh' } })); });
    await waitFor(() => expect(toasts()).toContain(vi_.projectStale));
    await waitFor(() => expect(nameBox(drawer).value).toBe('Mới'));
    await waitFor(() => expect(document.querySelector('header')!.textContent).toContain('Mới'));
    expect(patches).toEqual([{ description: 'Mô tả của Minh' }]);
    expect(stored().name).toBe('Mới');
    expect(stored().description).toBe('Ra mắt ứng dụng di động phiên bản đầu tiên.');
    expect(toasts().filter((t) => t === vi_.projectStale)).toHaveLength(1);
    // The editor shows what is stored, not the draft that was refused.
    await waitFor(() => expect(editor(drawer).value).toBe('Ra mắt ứng dụng di động phiên bản đầu tiên.'));
    // Not the viewer's error: nothing flashes.
    expect(drawer.querySelector('[data-rolled-back]')).toBeNull();

    // The next edit starts from the reloaded version and lands.
    fireEvent.change(groupSelect(drawer), { target: { value: 'status' } });
    await waitFor(() => expect(stored().default_group_by).toBe('status'));
    expect(stored().name).toBe('Mới');
  });

  it("drops a description draft started before another manager changed the description, and says so", async () => {
    const { drawer, fake, id, stored, toasts, patches } = await openEdit();
    const el = editor(drawer);
    fireEvent.focusIn(el);
    fake.server.write('project', id, { ...stored(), description: 'Mai viết lại mô tả' }, MAI);
    await waitFor(() => expect(el.value).toBe('Mai viết lại mô tả'));
    act(() => { el.dispatchEvent(new CustomEvent('change', { detail: { value: 'Minh viết đè' } })); });
    await settle();
    expect(stored().description).toBe('Mai viết lại mô tả');
    expect(patches).toEqual([]);
    expect(toasts().filter((t) => t === vi_.projectStale)).toHaveLength(1);
  });

  it('keeps a description draft when the refused write was another field, and writes it from the reloaded version', async () => {
    const { drawer, fake, id, stored, toasts, patches } = await openEdit();
    const el = editor(drawer);
    fireEvent.focusIn(el);
    fake.server.write('project', id, { ...stored(), name: 'Mới' }, MAI, { notify: false });
    fireEvent.change(groupSelect(drawer), { target: { value: 'status' } });
    await waitFor(() => expect(toasts()).toContain(vi_.projectStale));
    await waitFor(() => expect(nameBox(drawer).value).toBe('Mới'));
    expect(editor(drawer)).toBe(el);
    act(() => { el.dispatchEvent(new CustomEvent('change', { detail: { value: 'Mô tả của Minh' } })); });
    await waitFor(() => expect(stored().description).toBe('Mô tả của Minh'));
    expect(stored().name).toBe('Mới');
    expect(patches).toEqual([{ defaultGroupBy: 'status' }, { description: 'Mô tả của Minh' }]);
  });

  it('closes on Escape and gives focus back to the menu button', async () => {
    const { drawer } = await openEdit();
    await waitFor(() => expect(document.activeElement).toBe(within(drawer).getByRole('heading', { name: vi_.editProject })));
    fireEvent.keyDown(within(drawer).getByRole('heading', { name: vi_.editProject }), { key: 'Escape' });
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    await waitFor(() => expect(deepActive()).toBe(trigger()));
  });

  it('closes with ✕ and gives focus back to the menu button', async () => {
    const { drawer } = await openEdit();
    fireEvent.click(within(drawer).getByRole('button', { name: vi_.close }));
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    await waitFor(() => expect(deepActive()).toBe(trigger()));
  });

  it('saves a name still being typed when Escape closes the drawer from another field', async () => {
    const { drawer, stored } = await openEdit();
    const box = nameBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: 'Tên chưa lưu' } });
    fireEvent.keyDown(unitSelect(drawer), { key: 'Escape' });
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    await waitFor(() => expect(stored().name).toBe('Tên chưa lưu'));
  });

  it('closes when a task is opened beside it', async () => {
    const { drawer, id, task } = await openEdit();
    const target = task('Thiết kế màn hình đăng nhập');
    act(() => {
      window.history.pushState(null, '', `/p/${id}/t/${target}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await screen.findByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' });
    expect(drawer.isConnected).toBe(false);
  });

  it('locks its fields with the reason when the project is closed under it', async () => {
    const { drawer, fake, id, stored } = await openEdit();
    fake.server.write('project', id, { ...stored(), status: 'closed' }, MINH);
    await waitFor(() => expect(drawer.querySelector('[data-field="name"] [aria-disabled="true"]')).toBeTruthy());
    expect(within(drawer).queryByRole('textbox', { name: vi_.projectName })).toBeNull();
    expect(drawer.querySelector('[data-field="unit"] select')).toBeNull();
    expect(drawer.querySelector('[data-field="group"] select')).toBeNull();
    hoverTooltips(drawer);
    const tip = drawer.querySelector('[data-field="name"] af-tooltip') as HTMLElement & { text: string };
    expect(tip.text).toBe(vi_.projectClosedLocked);
    expect((editor(drawer) as EditorEl & { readonly: boolean }).readonly).toBe(true);
  });
});
