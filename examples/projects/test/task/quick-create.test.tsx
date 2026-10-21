// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsError, type NewTask, type ProjectsApi } from '../../src/api/projects-api.js';
import { HOA, MAI, MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { QuickCreate } from '../../src/task/QuickCreate.js';
import { t, TEXT } from '../../src/text.js';
import { pickDate, pickPerson, renderProjects, TEST_NOW } from '../support/render.js';
import { useNodeUploads } from '../support/uploads.js';
import { LAUNCH, seeded } from './support.js';

const vi_ = TEXT.vi;
const OFFICE = 'Văn phòng';

useNodeUploads();
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type Dialog = HTMLElement & { open: boolean; heading: string };
type Picker = HTMLElement & { people: { id: string }[]; value: string | string[] | null; multiple: boolean };

/** The API with every createTask input recorded, and any further wrapping the test asks for. */
function recordingCreates(wrap: (api: ProjectsApi) => ProjectsApi = (api) => api) {
  const inputs: NewTask[] = [];
  return {
    inputs,
    api: (base: ProjectsApi): ProjectsApi => {
      const api = wrap(base);
      return { ...api, createTask: (input) => { inputs.push(input); return api.createTask(input); } };
    },
  };
}

async function openForm(you: string, projectName = LAUNCH, wrap?: (api: ProjectsApi) => ProjectsApi) {
  const s = seeded(you);
  const creates = recordingCreates(wrap);
  const project = s.project(projectName);
  const view = renderProjects(<QuickCreate open project={project} onClose={() => {}} />, {
    fake: s.fake, lang: 'vi', path: `/p/${project}`, api: creates.api,
  });
  const dialog = (await waitFor(() => {
    const el = document.querySelector('af-dialog') as Dialog | null;
    expect(el?.open).toBe(true);
    return el!;
  }));
  const title = await screen.findByLabelText(vi_.title);
  const submit = () => screen.getByRole('button', { name: vi_.create });
  const group = (label: string) => screen.queryByRole('group', { name: label });
  const tasks = () => s.fake.server.records('task');
  return { ...s, ...view, project, dialog, title: title as HTMLInputElement, submit, group, tasks, inputs: creates.inputs };
}

/** Picks a section of Ra mắt ứng dụng in the open form, once its sections have loaded. */
async function chooseSection(fake: ReturnType<typeof seeded>['fake'], name: string): Promise<string> {
  const id = fake.server.records('section').find((r) => r.body.name === name)!.id;
  const select = await waitFor(() => {
    const el = screen.getByLabelText(vi_.section) as HTMLSelectElement;
    expect([...el.options].some((o) => o.value === id)).toBe(true);
    return el;
  });
  fireEvent.change(select, { target: { value: id } });
  return id;
}

async function headerOf(): Promise<HTMLElement> {
  return waitFor(() => {
    const el = document.querySelector<HTMLElement>('header.header');
    expect(el).toBeTruthy();
    return el!;
  });
}

const newTask = (tasks: () => { id: string; body: Record<string, unknown> }[], title: string) => tasks().filter((t) => t.body.title === title);

describe('quick create', () => {
  it('needs a title and a project, and starts on the project being viewed', async () => {
    const { submit, title, dialog, project } = await openForm(MINH);
    expect(dialog.heading).toBe(vi_.newTask);
    await waitFor(() => expect(document.activeElement).toBe(title));
    const select = screen.getByLabelText(vi_.project) as HTMLSelectElement;
    expect(select.value).toBe(project);
    expect(submit().getAttribute('aria-disabled')).toBe('true');

    fireEvent.change(title, { target: { value: 'Viết thông cáo báo chí' } });
    expect(submit().getAttribute('aria-disabled')).toBeNull();

    fireEvent.change(select, { target: { value: '' } });
    expect(submit().getAttribute('aria-disabled')).toBe('true');
    fireEvent.change(select, { target: { value: project } });
    fireEvent.change(title, { target: { value: '   ' } });
    expect(submit().getAttribute('aria-disabled')).toBe('true');
  });

  it('names its date and people controls by the labels shown beside them', async () => {
    const { dialog } = await openForm(MINH);
    const label = (field: string, tag: string) => (dialog.querySelector(`[data-field="${field}"] ${tag}`) as (HTMLElement & { label: string | null }) | null)?.label;
    expect(label('due', 'af-date')).toBe(vi_.due);
    expect(label('collaborators', 'af-person-picker')).toBe(vi_.collaborators);
    expect(label('primary', 'af-person-picker')).toBe(vi_.primary);
    const loading = (field: string) => (dialog.querySelector(`[data-field="${field}"] af-person-picker`) as HTMLElement & { loading: boolean }).loading;
    expect([loading('collaborators'), loading('primary')]).toEqual([false, false]);
  });

  it('a locked press creates nothing', async () => {
    const { submit, tasks, inputs } = await openForm(MINH);
    const before = tasks().length;
    fireEvent.click(submit());
    await act(async () => {});
    expect(inputs).toHaveLength(0);
    expect(tasks()).toHaveLength(before);
  });

  it('lists only the projects the viewer may create tasks in', async () => {
    const { project } = await openForm(HOA);
    const select = screen.getByLabelText(vi_.project) as HTMLSelectElement;
    const offered = [...select.options].filter((o) => o.value).map((o) => o.textContent);
    // Hoa is a member of both active projects; Kế hoạch quý 3 is closed, and she is in no other.
    expect(offered.sort()).toEqual([LAUNCH, OFFICE].sort());
    expect(select.value).toBe(project);
  });

  it('sends the section, due date, priority and collaborators, and opens the new task', async () => {
    const { title, submit, group, tasks, inputs, project, fake } = await openForm(MINH);
    const design = fake.server.records('section').find((r) => r.body.name === 'Thiết kế')!.id;
    fireEvent.change(title, { target: { value: 'Duyệt bảng màu' } });
    const section = await waitFor(() => {
      const el = screen.getByLabelText(vi_.section) as HTMLSelectElement;
      expect([...el.options].some((o) => o.value === design)).toBe(true);
      return el;
    });
    fireEvent.change(section, { target: { value: design } });
    pickDate(group(vi_.due)!.querySelector('af-date')!, '2026-10-30');
    fireEvent.change(screen.getByLabelText(vi_.priority), { target: { value: 'high' } });
    const collaborators = group(vi_.collaborators)!.querySelector('af-person-picker') as Picker;
    expect(collaborators.multiple).toBe(true);
    expect(collaborators.people.map((p) => p.id).sort()).toEqual([MINH, HOA, MAI].sort());
    pickPerson(collaborators, [HOA]);

    fireEvent.click(submit());
    await waitFor(() => expect(newTask(tasks, 'Duyệt bảng màu')).toHaveLength(1));
    expect(inputs).toEqual([{
      project, title: 'Duyệt bảng màu', section: design, due: '2026-10-30', priority: 'high', collaborators: [HOA], primary: null,
      position: expect.any(Number),
    }]);
    const [created] = newTask(tasks, 'Duyệt bảng màu');
    expect(created!.body).toMatchObject({ project, section: design, due: '2026-10-30', priority: 'high', collaborators: [HOA], status: 'todo' });
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${project}/t/${created!.id}`));
  });

  it('submits from the title with Enter, trimmed, leaving the optional fields unset', async () => {
    const { title, tasks, inputs, project } = await openForm(MINH);
    fireEvent.change(title, { target: { value: '  Gọi nhà cung cấp  ' } });
    // Enter in a single-line field submits its form.
    fireEvent.submit(title.form!);
    await waitFor(() => expect(newTask(tasks, 'Gọi nhà cung cấp')).toHaveLength(1));
    // No section holds no other open card in this project, so there is nothing to go above and no place to send.
    expect(inputs).toEqual([{ project, title: 'Gọi nhà cung cấp', section: null, due: null, priority: null, collaborators: [], primary: null, position: null }]);
  });

  it('lets a manager pick the primary, who then holds the new task', async () => {
    const { title, submit, group, tasks } = await openForm(MINH);
    const primary = group(vi_.primary)!.querySelector('af-person-picker') as Picker;
    expect(primary.multiple).toBe(false);
    pickPerson(primary, MAI);
    fireEvent.change(title, { target: { value: 'Chuẩn bị buổi demo' } });
    fireEvent.click(submit());
    await waitFor(() => expect(newTask(tasks, 'Chuẩn bị buổi demo')).toHaveLength(1));
    expect(newTask(tasks, 'Chuẩn bị buổi demo')[0]!.body.claimed_by).toBe(MAI);
  });

  it('shows a member no primary picker, and the member holds the task they create', async () => {
    const { title, submit, group, tasks, inputs } = await openForm(HOA);
    expect(group(vi_.primary)).toBeNull();
    expect(screen.queryByText(vi_.primary)).toBeNull();
    fireEvent.change(title, { target: { value: 'Rà soát lỗi chính tả' } });
    fireEvent.click(submit());
    await waitFor(() => expect(newTask(tasks, 'Rà soát lỗi chính tả')).toHaveLength(1));
    expect(inputs[0]!.primary).toBeNull();
    expect(newTask(tasks, 'Rà soát lỗi chính tả')[0]!.body.claimed_by).toBe(HOA);
  });

  it('uploads a dropped file after the create and attaches it to the task', async () => {
    const order: string[] = [];
    const { title, submit, tasks, fake } = await openForm(MINH, LAUNCH, (api) => ({
      ...api,
      createTask: (input) => { order.push('create'); return api.createTask(input); },
      upload: (file) => { order.push('upload'); return api.upload(file); },
      updateTask: (task, changes) => { order.push(`update:${Object.keys(changes).join(',')}`); return api.updateTask(task, changes); },
    }));
    const file = new File(['%PDF-1.4'], 'bao-gia.pdf', { type: 'application/pdf' });
    const zone = screen.getByText(vi_.dropFiles).closest('[data-part="dropzone"]')!;
    fireEvent.drop(zone, { dataTransfer: { files: [file], types: ['Files'] } });
    expect(screen.getByText('bao-gia.pdf')).toBeTruthy();
    fireEvent.change(title, { target: { value: 'Gửi báo giá' } });
    fireEvent.click(submit());

    await waitFor(() => expect((newTask(tasks, 'Gửi báo giá')[0]?.body.attachments as string[] | undefined)?.length).toBe(1));
    expect(order).toEqual(['create', 'upload', 'update:attachments']);
    const [id] = newTask(tasks, 'Gửi báo giá')[0]!.body.attachments as string[];
    expect((await fake.api.attachment(id!)).name).toBe('bao-gia.pdf');
  });

  it('takes files from the file picker too, and drops one again on its remove button', async () => {
    const { title, submit, tasks } = await openForm(MINH);
    const input = screen.getByLabelText(vi_.dropFiles) as HTMLInputElement;
    const keep = new File(['a'], 'giu-lai.txt', { type: 'text/plain' });
    const drop = new File(['b'], 'bo-di.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [keep, drop] } });
    fireEvent.click(screen.getByRole('button', { name: t('vi', 'quickCreateRemoveFile', { name: 'bo-di.txt' }) }));
    expect(screen.queryByText('bo-di.txt')).toBeNull();
    fireEvent.change(title, { target: { value: 'Lưu hồ sơ' } });
    fireEvent.click(submit());
    await waitFor(() => expect((newTask(tasks, 'Lưu hồ sơ')[0]?.body.attachments as string[] | undefined)?.length).toBe(1));
  });

  it('creates one task for three presses while the create is in flight, and stays locked until it settles', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let calls = 0;
    const { title, submit, tasks } = await openForm(MINH, LAUNCH, (api) => ({
      ...api,
      createTask: (input) => { calls += 1; return gate.then(() => api.createTask(input)); },
    }));
    const before = tasks().length;
    fireEvent.change(title, { target: { value: 'Kiểm tra bản dựng' } });
    const button = submit();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.submit(title.form!);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    await act(async () => {});
    expect(calls).toBe(1);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    await act(async () => { release(); await gate; });
    await waitFor(() => expect(tasks()).toHaveLength(before + 1));
    expect(newTask(tasks, 'Kiểm tra bản dựng')).toHaveLength(1);
    expect(calls).toBe(1);
  });

  it("shows the server's refusal in the dialog and unlocks the button", async () => {
    const { title, submit, tasks, fake, project, dialog } = await openForm(MINH);
    fireEvent.change(title, { target: { value: 'Việc sau khi đóng' } });
    const stored = fake.server.records('project').find((r) => r.id === project)!;
    fake.server.write('project', project, { ...stored.body, status: 'closed' }, MINH, { notify: false });
    const before = tasks().length;

    fireEvent.click(submit());
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('A closed project takes no new tasks');
    expect(dialog.contains(alert)).toBe(true);
    expect(dialog.open).toBe(true);
    expect(submit().getAttribute('aria-disabled')).toBeNull();
    expect(tasks()).toHaveLength(before);
  });

  it('closes and opens the task when the create lands but a follow-up write fails, and says what was not saved', async () => {
    let calls = 0;
    const { title, submit, tasks, group, project, dialog, toasts } = await openForm(MINH, LAUNCH, (api) => ({
      ...api,
      createTask: async (input) => {
        calls += 1;
        const created = await api.createTask({ ...input, collaborators: [] });
        throw new ProjectsError('partial', 409, 'STALE_VERSION', 'Task vừa được cập nhật', undefined, created, 'stale');
      },
    }));
    pickPerson(group(vi_.collaborators)!.querySelector('af-person-picker')!, [HOA]);
    fireEvent.change(title, { target: { value: 'Viết ghi chú phát hành' } });
    fireEvent.click(submit());

    await waitFor(() => expect(dialog.open).toBe(false));
    const [created] = newTask(tasks, 'Viết ghi chú phát hành');
    expect(created).toBeTruthy();
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${project}/t/${created!.id}`));
    await waitFor(() => expect(toasts().some((t) => t.includes(vi_.quickCreateCollaboratorsNotSaved.split(':')[0]!) && t.includes('Task vừa được cập nhật'))).toBe(true));
    expect(calls).toBe(1);
    expect(newTask(tasks, 'Viết ghi chú phát hành')).toHaveLength(1);
  });

  it('cannot be dismissed while the create is in flight, and Huỷ says why', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const s = seeded(MINH);
    const project = s.project(LAUNCH);
    const onClose = vi.fn();
    renderProjects(<QuickCreate open project={project} onClose={onClose} />, {
      fake: s.fake, lang: 'vi', path: `/p/${project}`,
      api: (api) => ({ ...api, createTask: (input) => gate.then(() => api.createTask(input)) }),
    });
    fireEvent.change(await screen.findByLabelText(vi_.title), { target: { value: 'Không huỷ giữa chừng' } });
    const dialog = document.querySelector('af-dialog') as Dialog;
    fireEvent.click(screen.getByRole('button', { name: vi_.create }));

    const cancel = screen.getByRole('button', { name: vi_.cancel });
    await waitFor(() => expect(cancel.getAttribute('aria-disabled')).toBe('true'));
    expect(document.getElementById(cancel.getAttribute('aria-describedby')!)?.textContent).toBe(vi_.quickCreateWait);
    fireEvent.click(cancel);
    act(() => { dialog.dispatchEvent(new CustomEvent('close', { detail: { reason: 'escape' }, bubbles: true })); });
    act(() => { dialog.dispatchEvent(new CustomEvent('close', { detail: { reason: 'outside' }, bubbles: true })); });
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);

    await act(async () => { release(); await gate; });
    await waitFor(() => expect(dialog.open).toBe(false));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(s.fake.server.records('task').filter((t) => t.body.title === 'Không huỷ giữa chừng')).toHaveLength(1);
  });

  it('opens the task and says it is not on top when only the follow-up write for its place fails', async () => {
    const { title, submit, tasks, project, dialog, toasts, inputs, fake } = await openForm(MINH, LAUNCH, (api) => ({
      ...api,
      createTask: async (input) => {
        const created = await api.createTask({ ...input, position: null });
        throw new ProjectsError('partial', 409, 'STALE_VERSION', 'Task vừa được cập nhật', undefined, created, 'stale');
      },
    }));
    await chooseSection(fake, 'Thiết kế');
    fireEvent.change(title, { target: { value: 'Chưa lên đầu cột' } });
    fireEvent.click(submit());

    await waitFor(() => expect(dialog.open).toBe(false));
    const [created] = newTask(tasks, 'Chưa lên đầu cột');
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${project}/t/${created!.id}`));
    expect(typeof inputs[0]!.position).toBe('number');
    await waitFor(() => expect(toasts()).toContain(t('vi', 'quickCreatePlaceNotSaved', { reason: 'Task vừa được cập nhật' })));
  });

  it('names the collaborators and the place when the follow-up write that holds both fails', async () => {
    const { title, submit, dialog, toasts, group, fake } = await openForm(MINH, LAUNCH, (api) => ({
      ...api,
      createTask: async (input) => {
        const created = await api.createTask({ ...input, collaborators: [], position: null });
        throw new ProjectsError('partial', 409, 'STALE_VERSION', 'Task vừa được cập nhật', undefined, created, 'stale');
      },
    }));
    await chooseSection(fake, 'Thiết kế');
    pickPerson(group(vi_.collaborators)!.querySelector('af-person-picker')!, [HOA]);
    fireEvent.change(title, { target: { value: 'Hỏng cả hai' } });
    fireEvent.click(submit());
    await waitFor(() => expect(dialog.open).toBe(false));
    await waitFor(() => expect(toasts()).toContain(t('vi', 'quickCreateCollaboratorsAndPlaceNotSaved', { reason: 'Task vừa được cập nhật' })));
  });

  it('still creates when the board cannot be read to place the card, and sends no place', async () => {
    const { title, submit, tasks, inputs, fake } = await openForm(MINH, LAUNCH, (api) => ({
      ...api,
      boardTasks: () => Promise.reject(new ProjectsError('failed', 500, 'INTERNAL', null)),
    }));
    await chooseSection(fake, 'Thiết kế');
    fireEvent.change(title, { target: { value: 'Không đọc được bảng' } });
    fireEvent.click(submit());
    await waitFor(() => expect(newTask(tasks, 'Không đọc được bảng')).toHaveLength(1));
    expect(inputs[0]!.position).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('stays locked after a partial answer that names no task, and can then only be closed', async () => {
    let calls = 0;
    const { title, submit, dialog } = await openForm(MINH, LAUNCH, (api) => ({
      ...api,
      createTask: async () => {
        calls += 1;
        throw new ProjectsError('partial', 409, 'STALE_VERSION', 'Task vừa được cập nhật', undefined, null, 'stale');
      },
    }));
    fireEvent.change(title, { target: { value: 'Không rõ đã tạo chưa' } });
    fireEvent.click(submit());
    expect((await screen.findByRole('alert')).textContent).toContain('Task vừa được cập nhật');
    expect(submit().getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(submit().getAttribute('aria-describedby')!)?.textContent).toBe(vi_.quickCreateDone);
    fireEvent.click(submit());
    fireEvent.submit(title.form!);
    await act(async () => {});
    expect(calls).toBe(1);
    expect(screen.getByRole('button', { name: vi_.cancel }).getAttribute('aria-disabled')).toBeNull();
    expect(dialog.open).toBe(true);
  });

  it('closes on Huỷ without creating anything', async () => {
    const s = seeded(MINH);
    const project = s.project(LAUNCH);
    const onClose = vi.fn();
    const before = s.fake.server.records('task').length;
    renderProjects(<QuickCreate open project={project} onClose={onClose} />, { fake: s.fake, lang: 'vi', path: `/p/${project}` });
    fireEvent.change(await screen.findByLabelText(vi_.title), { target: { value: 'Không tạo' } });
    fireEvent.click(screen.getByRole('button', { name: vi_.cancel }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(s.fake.server.records('task')).toHaveLength(before);
  });
});

describe('where Tạo task opens it', () => {
  it("opens from the header's Tạo task on the project, and the new task's drawer opens after the create", async () => {
    const s = seeded(MINH);
    const project = s.project(LAUNCH);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${project}` });
    const header = await headerOf();
    fireEvent.click(await within(header).findByRole('button', { name: vi_.createTask }));
    const dialog = header.querySelector('div.quick-create af-dialog') as Dialog;
    await waitFor(() => expect(dialog.open).toBe(true));
    const select = within(dialog).getByLabelText(vi_.project) as HTMLSelectElement;
    expect(select.value).toBe(project);

    fireEvent.change(within(dialog).getByLabelText(vi_.title), { target: { value: 'Mở từ đầu trang' } });
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.create }));
    await waitFor(() => expect(s.fake.server.records('task').some((t) => t.body.title === 'Mở từ đầu trang')).toBe(true));
    const created = s.fake.server.records('task').find((t) => t.body.title === 'Mở từ đầu trang')!;
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${project}/t/${created.id}`));
    const drawer = await screen.findByRole('dialog', { name: 'Mở từ đầu trang' });
    expect(dialog.open).toBe(false);
    await waitFor(() => expect(document.activeElement).toBe(drawer.querySelector('h2')));
  });

  it('gives focus back to the header\'s Tạo task on Huỷ', async () => {
    const s = seeded(MINH);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${s.project(LAUNCH)}` });
    const header = await headerOf();
    const opener = await within(header).findByRole('button', { name: vi_.createTask });
    opener.focus();
    fireEvent.click(opener);
    const dialog = header.querySelector('div.quick-create af-dialog') as Dialog;
    await waitFor(() => expect(dialog.open).toBe(true));
    const title = within(dialog).getByLabelText(vi_.title);
    await waitFor(() => expect(document.activeElement).toBe(title));
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.cancel }));
    await waitFor(() => expect(dialog.open).toBe(false));
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it('puts the new card first in its column', async () => {
    const s = seeded(MINH);
    const project = s.project(LAUNCH);
    const design = s.fake.server.records('section').find((r) => r.body.name === 'Thiết kế')!.id;
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${project}` });
    const column = await waitFor(() => {
      const el = document.querySelector<HTMLElement>(`[data-column="section:${design}"]`);
      expect(el?.querySelector('[data-task]')).toBeTruthy();
      return el!;
    });
    const cardsOf = () => [...column.querySelectorAll<HTMLElement>('.column-list [data-task]')].map((c) => c.dataset.task);
    const before = cardsOf();
    const header = await headerOf();
    fireEvent.click(within(header).getByRole('button', { name: vi_.createTask }));
    const dialog = header.querySelector('div.quick-create af-dialog') as Dialog;
    await waitFor(() => expect(dialog.open).toBe(true));
    fireEvent.change(within(dialog).getByLabelText(vi_.title), { target: { value: 'Lên đầu cột' } });
    fireEvent.change(within(dialog).getByLabelText(vi_.section), { target: { value: design } });
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.create }));

    await waitFor(() => expect(s.fake.server.records('task').some((t) => t.body.title === 'Lên đầu cột')).toBe(true));
    const created = s.fake.server.records('task').find((t) => t.body.title === 'Lên đầu cột')!;
    await waitFor(() => expect(cardsOf()).toEqual([created.id, ...before]));
  });

  it('puts a task left with no priority first among the medium ones, as it is stored, when grouped by priority', async () => {
    const s = seeded(MINH);
    const project = s.project(LAUNCH);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${project}?group=priority` });
    const column = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-column="priority:medium"]');
      expect(el?.querySelector('[data-task]')).toBeTruthy();
      return el!;
    });
    const cardsOf = () => [...column.querySelectorAll<HTMLElement>('.column-list [data-task]')].map((c) => c.dataset.task);
    const before = cardsOf();
    const header = await headerOf();
    fireEvent.click(within(header).getByRole('button', { name: vi_.createTask }));
    const dialog = header.querySelector('div.quick-create af-dialog') as Dialog;
    await waitFor(() => expect(dialog.open).toBe(true));
    fireEvent.change(within(dialog).getByLabelText(vi_.title), { target: { value: 'Chưa đặt ưu tiên' } });
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.create }));

    await waitFor(() => expect(s.fake.server.records('task').some((t) => t.body.title === 'Chưa đặt ưu tiên')).toBe(true));
    const created = s.fake.server.records('task').find((t) => t.body.title === 'Chưa đặt ưu tiên')!;
    expect(created.body.priority).toBe('medium');
    await waitFor(() => expect(cardsOf()).toEqual([created.id, ...before]));
  });

  it('opens the drawer after creating from the empty Tasks tab, though the board fills before the files are attached', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const s = seeded(MINH);
    const empty = s.fake.server.write('project', null, {
      name: 'Dự án trống', description: '', managers: [MINH], members: [HOA], status: 'active', default_group_by: 'status',
    }, MINH);
    renderProjects(<App />, {
      fake: s.fake, lang: 'vi', path: `/p/${empty.id}`,
      api: (api) => ({ ...api, upload: (file) => gate.then(() => api.upload(file)) }),
    });
    const main = await waitFor(() => {
      const el = document.querySelector('main.screen') as HTMLElement;
      expect(within(el).getByText(vi_.noTasks)).toBeTruthy();
      return el;
    });
    fireEvent.click(within(main).getByRole('button', { name: vi_.createTask }));
    const dialog = main.querySelector('div.quick-create af-dialog') as Dialog;
    await waitFor(() => expect(dialog.open).toBe(true));
    const zone = within(dialog).getByText(vi_.dropFiles).closest('[data-part="dropzone"]')!;
    fireEvent.drop(zone, { dataTransfer: { files: [new File(['x'], 'ke-hoach.txt', { type: 'text/plain' })], types: ['Files'] } });
    pickPerson(dialog.querySelector('[data-field="collaborators"] af-person-picker')!, [HOA]);
    fireEvent.change(within(dialog).getByLabelText(vi_.title), { target: { value: 'Việc đầu tiên' } });
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.create }));

    await waitFor(() => expect(s.fake.server.records('task').some((t) => t.body.title === 'Việc đầu tiên')).toBe(true));
    const created = s.fake.server.records('task').find((t) => t.body.title === 'Việc đầu tiên')!;
    // The board refills with the new card while the upload is still held.
    await waitFor(() => expect(main.querySelector(`[data-task="${created.id}"]`)).toBeTruthy());
    expect(document.contains(dialog)).toBe(true);
    await act(async () => { release(); await gate; });

    await waitFor(() => expect(window.location.pathname).toBe(`/p/${empty.id}/t/${created.id}`));
    expect(await screen.findByRole('dialog', { name: 'Việc đầu tiên' })).toBeTruthy();
    expect((s.fake.server.records('task').find((t) => t.id === created.id)!.body.attachments as string[]).length).toBe(1);
  });

  it("opens from the empty Tasks tab's Tạo task", async () => {
    const s = seeded(MINH);
    const empty = s.fake.server.write('project', null, {
      name: 'Dự án trống', description: '', managers: [MINH], members: [], status: 'active', default_group_by: 'status',
    }, MINH);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${empty.id}` });
    const main = await waitFor(() => {
      const el = document.querySelector('main.screen') as HTMLElement;
      expect(within(el).getByText(vi_.noTasks)).toBeTruthy();
      return el;
    });
    fireEvent.click(within(main).getByRole('button', { name: vi_.createTask }));
    const dialog = main.querySelector('div.quick-create af-dialog') as Dialog;
    await waitFor(() => expect(dialog.open).toBe(true));
    expect((within(dialog).getByLabelText(vi_.project) as HTMLSelectElement).value).toBe(empty.id);
  });

  it('a locked Tạo task in the header opens nothing', async () => {
    const s = seeded(MINH);
    const q3 = s.project('Kế hoạch quý 3');
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${q3}` });
    const header = await headerOf();
    const button = await within(header).findByRole('button', { name: vi_.createTask });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(button);
    await act(async () => {});
    expect((document.querySelector('div.quick-create af-dialog') as Dialog | null)?.open ?? false).toBe(false);
  });
});
