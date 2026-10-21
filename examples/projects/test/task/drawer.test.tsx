// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { HOA, KHOA, MAI, MINH, TUAN } from '../../src/api/seed.js';
import { LiveContext, type Live } from '../../src/live/LiveProvider.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, pickDate, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { LAUNCH, LOGIN_DESIGN, recordingPatches, seeded } from './support.js';

const vi_ = TEXT.vi;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });
const reasonOf = (field: string, drawer: HTMLElement) => {
  hoverTooltips(drawer);
  return (drawer.querySelector(`[data-field="${field}"] af-tooltip`) as (HTMLElement & { text: string }) | null)?.text;
};
const titleBox = (drawer: HTMLElement) => within(drawer).getByRole('textbox', { name: vi_.taskTitle }) as HTMLTextAreaElement;

async function open(you: string, title: string, opts: { path?: (s: ReturnType<typeof seeded>, id: string) => string } = {}) {
  const s = seeded(you);
  const writes = recordingPatches();
  const id = s.task(title);
  const path = opts.path ? opts.path(s, id) : `/p/${s.project(LAUNCH)}/t/${id}`;
  const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path, api: writes.api });
  const drawer = await screen.findByRole('dialog', { name: title });
  return { ...s, ...view, id, drawer, patches: writes.patches };
}

describe('the task drawer', () => {
  it('lays its sections out in order: title, Ưu tiên and Hạn chót, Mô tả, the people, Trạng thái', async () => {
    const { drawer } = await open(MINH, LOGIN_DESIGN);
    const headings = within(drawer).getAllByRole('heading');
    expect(headings[0]!.querySelector('textarea')?.value).toBe(LOGIN_DESIGN);
    expect(headings.slice(1, 7).map((h) => h.textContent)).toEqual([
      vi_.priority, vi_.due, vi_.description, vi_.primary, vi_.collaborators, vi_.status,
    ]);
  });

  it('names its date, people and description controls by the labels shown beside them', async () => {
    const { drawer } = await open(MINH, 'Chuẩn bị tài liệu bàn giao');
    const label = (field: string, tag: string) => (drawer.querySelector(`[data-field="${field}"] ${tag}`) as (HTMLElement & { label: string | null }) | null)?.label;
    expect(label('due', 'af-date')).toBe(vi_.due);
    expect(label('primary', 'af-person-picker')).toBe(vi_.primary);
    expect(label('collaborators', 'af-person-picker')).toBe(vi_.collaborators);
    expect(label('description', 'af-rich-editor')).toBe(vi_.description);
    // The module shows a screen only once the people have been read, so no picker is left waiting on them.
    const loading = (field: string) => (drawer.querySelector(`[data-field="${field}"] af-person-picker`) as HTMLElement & { loading: boolean }).loading;
    expect([loading('primary'), loading('collaborators')]).toEqual([false, false]);
  });

  it('puts focus on its heading when it opens, not on the title, which would start an edit', async () => {
    const { drawer } = await open(MINH, LOGIN_DESIGN);
    await waitFor(() => expect(document.activeElement).toBe(within(drawer).getAllByRole('heading')[0]));
  });

  it('edits the title in place, and an emptied title goes back to the old one and writes nothing', async () => {
    const { drawer, patches, id, stored } = await open(MINH, LOGIN_DESIGN);
    const box = titleBox(drawer);
    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: '   ' } });
    expect(within(drawer).getByText(vi_.titleRequired)).toBeTruthy();
    fireEvent.blur(box);
    expect(box.value).toBe(LOGIN_DESIGN);
    await settle();
    expect(patches).toEqual([]);

    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: 'Thiết kế màn hình đăng nhập mới' } });
    fireEvent.blur(box);
    await waitFor(() => expect(stored(id).title).toBe('Thiết kế màn hình đăng nhập mới'));
    expect(patches).toEqual([{ title: 'Thiết kế màn hình đăng nhập mới' }]);
  });

  it('puts the title back on Escape and stays open', async () => {
    const { drawer, patches } = await open(MINH, LOGIN_DESIGN);
    const box = titleBox(drawer);
    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: 'Nháp' } });
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(box.value).toBe(LOGIN_DESIGN);
    await settle();
    expect(drawer.isConnected).toBe(true);
    expect(patches).toEqual([]);
  });

  it('closes on Escape in the title when nothing was typed there', async () => {
    const { drawer } = await open(MINH, LOGIN_DESIGN);
    const box = titleBox(drawer);
    fireEvent.focus(box);
    fireEvent.keyDown(box, { key: 'Escape' });
    await waitFor(() => expect(drawer.isConnected).toBe(false));
  });

  it('chooses Ưu tiên from Khẩn cấp, Cao, Trung bình and Thấp, and Hạn chót from a date input; both write', async () => {
    const { drawer, patches, id, stored } = await open(MINH, LOGIN_DESIGN);
    const priority = within(drawer).getByRole('combobox', { name: vi_.priority }) as HTMLSelectElement;
    expect([...priority.options].map((o) => o.textContent)).toEqual([vi_.priorityUrgent, vi_.priorityHigh, vi_.priorityMedium, vi_.priorityLow]);
    expect(priority.value).toBe('high');
    fireEvent.change(priority, { target: { value: 'urgent' } });
    await waitFor(() => expect(stored(id).priority).toBe('urgent'));
    pickDate(drawer.querySelector('[data-field="due"] af-date')!, '2026-10-30');
    await waitFor(() => expect(stored(id).due).toBe('2026-10-30'));
    expect(patches).toEqual([{ priority: 'urgent' }, { due: '2026-10-30' }]);
  });

  it('locks Ưu tiên and Hạn chót for a collaborator, saying who may change them', async () => {
    // Tuấn is on no project, so he reaches the task from My Work, not from a project page he cannot read.
    const { drawer } = await open(TUAN, 'Xây dựng API đăng nhập', { path: (_, id) => `/mine/t/${id}` });
    expect(within(drawer).queryByRole('combobox', { name: vi_.priority })).toBeNull();
    expect(drawer.querySelector('[data-field="due"] af-date')).toBeNull();
    expect(reasonOf('priority', drawer)).toBe(vi_.onlyOwnerOrManager);
    expect(reasonOf('due', drawer)).toBe(vi_.onlyOwnerOrManager);
    const locked = drawer.querySelector('[data-field="priority"] [aria-disabled="true"]')!;
    const reason = drawer.querySelector(`[id="${locked.getAttribute('aria-describedby')}"]`);
    expect(reason?.textContent).toBe(vi_.onlyOwnerOrManager);
  });

  it('lets the primary and a manager edit Mô tả, and shows it read only to anyone else', async () => {
    const editor = (drawer: HTMLElement) => drawer.querySelector('[data-field="description"] af-rich-editor') as HTMLElement & { readonly: boolean; value: string };
    const primary = await open(HOA, LOGIN_DESIGN, { path: (_, id) => `/mine/t/${id}` });
    expect(editor(primary.drawer).readonly).toBe(false);
    act(() => { editor(primary.drawer).dispatchEvent(new CustomEvent('change', { detail: { value: 'Mô tả mới' } })); });
    await waitFor(() => expect(primary.stored(primary.id).description).toBe('Mô tả mới'));
    expect(primary.patches).toEqual([{ description: 'Mô tả mới' }]);
    primary.unmount();

    const manager = await open(MINH, LOGIN_DESIGN);
    expect(editor(manager.drawer).readonly).toBe(false);
    manager.unmount();

    const member = await open(MAI, LOGIN_DESIGN);
    expect(editor(member.drawer).readonly).toBe(true);
    expect(editor(member.drawer).value).toContain('mã OTP');
    expect(reasonOf('description', member.drawer)).toBe(vi_.onlyOwnerOrManager);
  });

  it("reloads someone else's newer version on a stale write, says so once, and writes nothing over it", async () => {
    const { drawer, fake, id, stored, toasts, record } = await open(MINH, LOGIN_DESIGN);
    fake.server.write('task', id, { ...record(LOGIN_DESIGN).body, title: 'Hoa đã đổi' }, HOA, { notify: false });
    await settle();
    expect(titleBox(drawer).value).toBe(LOGIN_DESIGN);

    fireEvent.change(within(drawer).getByRole('combobox', { name: vi_.priority }), { target: { value: 'low' } });
    await waitFor(() => expect(titleBox(drawer).value).toBe('Hoa đã đổi'));
    await waitFor(() => expect(toasts()).toContain(vi_.taskUpdatedElsewhere));
    await settle();
    expect(toasts().filter((t) => t === vi_.taskUpdatedElsewhere)).toHaveLength(1);
    expect(stored(id).priority).toBe('high');
    expect((within(drawer).getByRole('combobox', { name: vi_.priority }) as HTMLSelectElement).value).toBe('high');
  });

  it('reloads on a live change to its task and says so', async () => {
    const { drawer, fake, id, toasts, record } = await open(MINH, LOGIN_DESIGN);
    fake.server.write('task', id, { ...record(LOGIN_DESIGN).body, title: 'Hoa sửa tiêu đề' }, HOA);
    await waitFor(() => expect(titleBox(drawer).value).toBe('Hoa sửa tiêu đề'));
    await waitFor(() => expect(toasts()).toContain(vi_.taskUpdatedElsewhere));
  });

  it("does not say so for the viewer's own change, nor for the completion stamp that follows it", async () => {
    // Minh holds and manages this one, so he may complete it and still edit it once it is done.
    const { drawer, id, stored, toasts, fake } = await open(MINH, 'Tích hợp cổng thanh toán');
    fireEvent.change(within(drawer).getByRole('combobox', { name: vi_.priority }), { target: { value: 'low' } });
    await waitFor(() => expect(stored(id).priority).toBe('low'));
    fireEvent.click(within(drawer).getByRole('button', { name: vi_.statusDone }));
    await waitFor(() => expect(stored(id).status).toBe('done'));
    await fake.server.drain();
    await waitFor(() => expect(stored(id).completed_at).toBeTruthy());
    await settle();
    expect(toasts()).not.toContain(vi_.taskUpdatedElsewhere);
    // A second write after the stamp moved the version still lands, without a stale reload.
    fireEvent.change(within(drawer).getByRole('combobox', { name: vi_.priority }), { target: { value: 'urgent' } });
    await waitFor(() => expect(stored(id).priority).toBe('urgent'));
    expect(toasts()).not.toContain(vi_.taskUpdatedElsewhere);
  });

  it('shows Không tìm thấy, and nothing of the task, for a task in a project the viewer is not in', async () => {
    const s = seeded(KHOA);
    const id = s.task(LOGIN_DESIGN);
    for (const path of [`/t/${id}`, `/mine/t/${id}`]) {
      const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path });
      expect(await screen.findByText(vi_.notFound)).toBeTruthy();
      await settle();
      expect(document.body.textContent).not.toContain(LOGIN_DESIGN);
      expect(document.body.textContent).not.toContain(LAUNCH);
      view.unmount();
    }
  });

  it('says the task no longer exists when it is deleted while open, keeping ✕', async () => {
    const { drawer, fake, id } = await open(MINH, LOGIN_DESIGN);
    act(() => fake.server.remove('task', id));
    expect(await within(drawer).findByText(vi_.taskGone)).toBeTruthy();
    expect(within(drawer).queryByRole('textbox', { name: vi_.taskTitle })).toBeNull();
    expect(within(drawer).getByRole('button', { name: vi_.close })).toBeTruthy();
  });

  it('closes on Escape through navigate, leaving the page behind where it was scrolled', async () => {
    const { drawer, project } = await open(MINH, LOGIN_DESIGN);
    const behind = document.querySelector<HTMLElement>('main[data-screen="project"]')!;
    behind.scrollTop = 120;
    fireEvent.keyDown(within(drawer).getAllByRole('heading')[0]!, { key: 'Escape' });
    expect(window.location.pathname).toBe(`/p/${project(LAUNCH)}`);
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    expect(document.querySelector('main[data-screen="project"]')).toBe(behind);
    expect(behind.scrollTop).toBe(120);
  });

  it('gives focus back to the card it was opened from when it closes', async () => {
    const { drawer, id } = await open(HOA, LOGIN_DESIGN, { path: (_, id) => `/mine/t/${id}` });
    const card = await waitFor(() => {
      const found = document.querySelector<HTMLElement>(`[data-task="${id}"] [data-part="title"]`);
      expect(found).not.toBeNull();
      return found!;
    });
    fireEvent.click(within(drawer).getByRole('button', { name: vi_.close }));
    await waitFor(() => expect(document.activeElement).toBe(card));
  });

  it('asks the host to keep it a viewer of its task while open, and stops on close', async () => {
    const s = seeded(MINH);
    const id = s.task(LOGIN_DESIGN);
    const watch = vi.fn();
    const live: Live = { status: 'live', online: true, watch };
    renderProjects(<LiveContext.Provider value={live}><App /></LiveContext.Provider>, { fake: s.fake, lang: 'vi', path: `/p/${s.project(LAUNCH)}/t/${id}` });
    const drawer = await screen.findByRole('dialog', { name: LOGIN_DESIGN });
    await waitFor(() => expect(watch).toHaveBeenCalledWith({ entityId: s.fake.ids.entities.task, recordId: id }));
    fireEvent.click(within(drawer).getByRole('button', { name: vi_.close }));
    await waitFor(() => expect(watch).toHaveBeenLastCalledWith(null));
  });

  it('saves a description still waiting on its timer when Escape closes the drawer with focus in the editor', async () => {
    const { drawer, id, stored } = await open(MINH, LOGIN_DESIGN);
    const el = drawer.querySelector('[data-field="description"] af-rich-editor') as HTMLElement & { editor: EditorLike | null };
    const editor = await waitFor(() => {
      expect(el.editor).toBeTruthy();
      return el.editor!;
    });
    const content = el.shadowRoot!.querySelector<HTMLElement>('[contenteditable]')!;
    // ProseMirror asks for this when its content takes focus; jsdom has none.
    const doc = document as Document & { execCommand?: unknown };
    const had = doc.execCommand;
    doc.execCommand = () => false;
    onTestFinished(() => { doc.execCommand = had; });
    act(() => {
      content.focus();
      editor.commands.insertContent(' Thêm bước xác minh.');
    });
    expect(deepActive()).toBe(content);
    fireEvent.keyDown(content, { key: 'Escape' });
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    await waitFor(() => expect(String(stored(id).description)).toContain('Thêm bước xác minh.'));
  });

  it('saves an unsaved title when the browser goes back', async () => {
    const { drawer, id, stored, project } = await open(MINH, LOGIN_DESIGN);
    const box = titleBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: 'Tiêu đề chưa lưu' } });
    act(() => {
      window.history.pushState(null, '', `/p/${project(LAUNCH)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    await waitFor(() => expect(stored(id).title).toBe('Tiêu đề chưa lưu'));
  });

  it("drops a description draft started before someone else changed the description, and says so", async () => {
    const { drawer, fake, id, stored, record, toasts, patches } = await open(MINH, LOGIN_DESIGN);
    const el = drawer.querySelector('[data-field="description"] af-rich-editor') as HTMLElement;
    fireEvent.focusIn(el);
    fake.server.write('task', id, { ...record(LOGIN_DESIGN).body, description: 'Hoa viết lại mô tả' }, HOA);
    await waitFor(() => expect((el as HTMLElement & { value: string }).value).toBe('Hoa viết lại mô tả'));
    act(() => { el.dispatchEvent(new CustomEvent('change', { detail: { value: 'Minh viết đè' } })); });
    await settle();
    expect(stored(id).description).toBe('Hoa viết lại mô tả');
    expect(patches).toEqual([]);
    expect(toasts().filter((t) => t === vi_.taskUpdatedElsewhere)).toHaveLength(1);
  });

  it('shows the stored description at once when it drops a draft, and writes what is typed after it', async () => {
    const { drawer, fake, id, stored, record, toasts } = await open(MINH, LOGIN_DESIGN);
    const doc = document as Document & { execCommand?: unknown };
    const had = doc.execCommand;
    doc.execCommand = () => false;
    onTestFinished(() => { doc.execCommand = had; });
    const shownEditor = () => waitFor(() => {
      const el = drawer.querySelector('[data-field="description"] af-rich-editor') as HTMLElement & { editor: EditorFull | null };
      expect(el.editor).toBeTruthy();
      return { el, editor: el.editor! };
    });
    const first = await shownEditor();
    const content = first.el.shadowRoot!.querySelector<HTMLElement>('[contenteditable]')!;
    act(() => {
      content.focus();
      first.editor.commands.setContent('Minh viết đè', { contentType: 'markdown' });
    });
    act(() => { fake.server.write('task', id, { ...record(LOGIN_DESIGN).body, description: 'Hoa viết lại mô tả' }, HOA); });
    // Past the editor's 600 ms wait, when it hands the draft over and the drawer drops it.
    await waitFor(() => expect(toasts().filter((t) => t === vi_.taskUpdatedElsewhere)).toHaveLength(1), { timeout: 2000 });
    const after = await waitFor(async () => {
      const shown = await shownEditor();
      expect(shown.editor.getMarkdown().trim()).toBe('Hoa viết lại mô tả');
      return shown;
    });
    expect(after.el).not.toBe(first.el);
    expect(stored(id).description).toBe('Hoa viết lại mô tả');
    // Focus stays on the field rather than falling to the page.
    expect(document.activeElement).toBe(drawer.querySelector('[data-field="description"] .description'));

    const box = after.el.shadowRoot!.querySelector<HTMLElement>('[contenteditable]')!;
    act(() => {
      box.focus();
      after.editor.commands.insertContentAt(after.editor.state.doc.content.size - 1, ', Minh bổ sung');
    });
    expect(after.editor.getMarkdown().trim()).toBe('Hoa viết lại mô tả, Minh bổ sung');
    await waitFor(() => expect(stored(id).description).toBe('Hoa viết lại mô tả, Minh bổ sung'), { timeout: 2000 });
    expect(toasts().filter((t) => t === vi_.taskUpdatedElsewhere)).toHaveLength(1);
  });

  it('keeps writing a description the viewer goes on typing after their own save', async () => {
    const { drawer, id, stored } = await open(MINH, LOGIN_DESIGN);
    const el = drawer.querySelector('[data-field="description"] af-rich-editor') as HTMLElement;
    fireEvent.focusIn(el);
    act(() => { el.dispatchEvent(new CustomEvent('change', { detail: { value: 'Bản một' } })); });
    await waitFor(() => expect(stored(id).description).toBe('Bản một'));
    act(() => { el.dispatchEvent(new CustomEvent('change', { detail: { value: 'Bản hai' } })); });
    await waitFor(() => expect(stored(id).description).toBe('Bản hai'));
  });

  it('locks a finished task for its holder, naming the managers', async () => {
    const { drawer } = await open(HOA, 'Viết tài liệu đặc tả', { path: (_, id) => `/mine/t/${id}` });
    expect(reasonOf('priority', drawer)).toBe(vi_.onlyManagersFinished);
    expect(within(drawer.querySelector<HTMLElement>('[data-field="primary"]')!).getByText('Lê Thị Hoa')).toBeTruthy();
  });

  it('opens a task for a collaborator outside its project, over a page that says the project is out of reach', async () => {
    const { drawer } = await open(TUAN, 'Xây dựng API đăng nhập', { path: (_, id) => `/t/${id}` });
    expect(screen.getByText(vi_.projectUnavailable, { selector: '.project-unavailable p' })).toBeTruthy();
    expect(drawer.querySelector('.drawer-crumb')?.textContent).toBe(vi_.projectUnavailable);
    expect(drawer.querySelector('.drawer-crumb a, .drawer-crumb button')).toBeNull();
    expect(document.body.textContent).not.toContain(LAUNCH);
    fireEvent.click(within(drawer).getByRole('button', { name: vi_.close }));
    expect(window.location.pathname).toBe('/');
  });

  it('gives one Không tìm thấy, and no project-unavailable page, to someone who cannot read the task', async () => {
    const s = seeded(KHOA);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/t/${s.task(LOGIN_DESIGN)}` });
    expect(await screen.findByText(vi_.notFound)).toBeTruthy();
    await settle();
    expect(screen.getAllByText(vi_.notFound)).toHaveLength(1);
    expect(screen.queryByText(vi_.projectUnavailable)).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape from an expanded fold on the page behind, but not from an open popup trigger', async () => {
    const { drawer } = await open(MINH, LOGIN_DESIGN);
    const behind = document.querySelector<HTMLElement>('main[data-screen="project"]')!;
    const menu = behind.appendChild(document.createElement('button'));
    menu.setAttribute('aria-haspopup', 'menu');
    menu.setAttribute('aria-expanded', 'true');
    fireEvent.keyDown(menu, { key: 'Escape' });
    await settle();
    expect(drawer.isConnected).toBe(true);
    const fold = behind.appendChild(document.createElement('button'));
    fold.setAttribute('aria-expanded', 'true');
    fireEvent.keyDown(fold, { key: 'Escape' });
    await waitFor(() => expect(drawer.isConnected).toBe(false));
  });

  it("forgets one task's refused write when it switches to another", async () => {
    const { drawer, fake, project, task } = await open(MINH, LOGIN_DESIGN);
    fake.server.failNext('PATCH', /\/records\//, 422, { type: 'VALIDATION_ERROR', title: 'x', status: 422, detail: 'Không được' });
    fireEvent.change(within(drawer).getByRole('combobox', { name: vi_.priority }), { target: { value: 'low' } });
    await waitFor(() => expect(drawer.querySelector('[data-field="priority"][data-rolled-back]')).not.toBeNull());
    act(() => {
      window.history.pushState(null, '', `/p/${project(LAUNCH)}/t/${task('Thiết kế luồng thanh toán')}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    const next = await screen.findByRole('dialog', { name: 'Thiết kế luồng thanh toán' });
    expect(next.querySelector('[data-rolled-back]')).toBeNull();
  });

  it('is named while its task loads', async () => {
    const s = seeded(MINH);
    renderProjects(<App />, {
      fake: s.fake, lang: 'vi', path: `/mine/t/${s.task(LOGIN_DESIGN)}`,
      api: (api) => ({ ...api, task: () => new Promise(() => undefined) }),
    });
    expect(await screen.findByRole('dialog', { name: vi_.loading })).toBeTruthy();
  });

  it('is named Không tìm thấy for a task the viewer cannot read', async () => {
    const s = seeded(KHOA);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/mine/t/${s.task(LOGIN_DESIGN)}` });
    expect(await screen.findByRole('dialog', { name: vi_.notFound })).toBeTruthy();
  });

  it('is named Task không còn tồn tại once its task is deleted', async () => {
    const { fake, id } = await open(MINH, LOGIN_DESIGN);
    act(() => fake.server.remove('task', id));
    expect(await screen.findByRole('dialog', { name: vi_.taskGone })).toBeTruthy();
  });

  it("never saves one task's description draft onto the next when the browser switches task within the editor's wait", async () => {
    const API = 'Xây dựng API đăng nhập';
    const PAYMENT = 'Tích hợp cổng thanh toán';
    const { drawer, id, stored, project, task } = await open(MINH, API);
    const next = task(PAYMENT);
    expect(stored(id).description ?? '').toBe('');
    expect(stored(next).description ?? '').toBe('');
    const el = drawer.querySelector('[data-field="description"] af-rich-editor') as HTMLElement & { editor: EditorLike | null };
    const editor = await waitFor(() => {
      expect(el.editor).toBeTruthy();
      return el.editor!;
    });
    const content = el.shadowRoot!.querySelector<HTMLElement>('[contenteditable]')!;
    const doc = document as Document & { execCommand?: unknown };
    const had = doc.execCommand;
    doc.execCommand = () => false;
    onTestFinished(() => { doc.execCommand = had; });
    act(() => {
      content.focus();
      editor.commands.insertContent('Bản nháp của task trước');
    });
    act(() => {
      window.history.pushState(null, '', `/p/${project(LAUNCH)}/t/${next}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await screen.findByRole('dialog', { name: PAYMENT });
    // Past the editor's 600 ms wait.
    await act(async () => { await new Promise((r) => setTimeout(r, 900)); });
    expect(stored(next).description ?? '').toBe('');
    expect(String(stored(id).description)).toContain('Bản nháp của task trước');
  });

  it("saves one task's unsaved title to that task when the browser switches to another", async () => {
    const PAYMENT = 'Tích hợp cổng thanh toán';
    const { drawer, id, stored, project, task } = await open(MINH, 'Xây dựng API đăng nhập');
    const next = task(PAYMENT);
    const box = titleBox(drawer);
    act(() => box.focus());
    fireEvent.change(box, { target: { value: 'Tiêu đề của task trước' } });
    act(() => {
      window.history.pushState(null, '', `/p/${project(LAUNCH)}/t/${next}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await screen.findByRole('dialog', { name: PAYMENT });
    await waitFor(() => expect(stored(id).title).toBe('Tiêu đề của task trước'));
    expect(stored(next).title).toBe(PAYMENT);
  });
});

type EditorLike = { commands: { insertContent(text: string): boolean } };
type EditorFull = {
  commands: {
    insertContent(text: string): boolean; insertContentAt(at: number, text: string): boolean;
    setContent(text: string, opts?: { contentType?: 'markdown' }): boolean;
  };
  state: { doc: { content: { size: number } } };
  getMarkdown(): string;
};

function deepActive(): HTMLElement | null {
  let at: Element | null = document.activeElement;
  while (at?.shadowRoot?.activeElement) at = at.shadowRoot.activeElement;
  return at as HTMLElement | null;
}
