// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { ProjectsError, type ProjectsApi } from '../../src/api/projects-api.js';
import { createSeed, HOA, MAI, MINH, UNITS } from '../../src/api/seed.js';
import { CreateProject } from '../../src/projects/CreateProject.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { pickPerson, renderProjects, TEST_NOW, toasts } from '../support/render.js';

const vi_ = TEXT.vi;
const SOFTWARE = ['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử', 'Triển khai'];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type Dialog = HTMLElement & { open: boolean; heading: string };
type Picker = HTMLElement & { people: { id: string }[]; value: string | string[] | null; multiple: boolean };
type ConfirmEl = HTMLElement & { open: boolean; heading: string; confirmLabel: string; strings: { cancel?: string } | null };

/** The modal open over the project list; with `app`, opened from the list's Tạo project inside the whole module. */
async function openModal(opts: {
  you?: string; api?: (api: ProjectsApi, fake: ReturnType<typeof createFakeProjects>) => ProjectsApi; seed?: ReturnType<typeof createSeed>; app?: boolean;
} = {}) {
  const seed = opts.seed ?? createSeed(TEST_NOW);
  const fake = createFakeProjects({ you: opts.you ?? MAI, seed });
  const onClose = vi.fn();
  const view = renderProjects(opts.app ? <App /> : <CreateProject open onClose={onClose} />, {
    fake, lang: 'vi', path: '/projects', ...(opts.api ? { api: (api: ProjectsApi) => opts.api!(api, fake) } : {}),
  });
  if (opts.app) fireEvent.click(await screen.findByRole('button', { name: vi_.createProject }));
  const dialog = await waitFor(() => {
    const el = document.querySelector('af-dialog') as Dialog | null;
    expect(el?.open).toBe(true);
    return el!;
  });
  const name = (await within(dialog).findByLabelText(vi_.projectName)) as HTMLInputElement;
  const submit = () => within(dialog).getByRole('button', { name: vi_.createProject });
  const radio = (label: string) => within(dialog).getByRole('radio', { name: label });
  const sectionNames = () => [...dialog.querySelectorAll<HTMLInputElement>('.sections-editor [data-part="name"]')].map((el) => el.value);
  const projectsNamed = (n: string) => fake.server.records('project').filter((r) => r.body.name === n);
  const sectionsOf = (project: string) => fake.server.records('section')
    .filter((r) => r.body.project === project)
    .sort((a, b) => (a.body.position as number) - (b.body.position as number))
    .map((r) => ({ name: r.body.name, position: r.body.position }));
  const confirm = () => [...dialog.querySelectorAll<ConfirmEl>('af-confirm')].find((c) => c.open) ?? null;
  /** The module is on the project's page, and its header names it. */
  const opened = async (id: string, projectName: string) => {
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${id}`));
    await waitFor(() => expect(document.querySelector('header.header')?.textContent).toContain(projectName));
  };
  return { ...view, fake, seed, dialog, name, submit, radio, sectionNames, projectsNamed, sectionsOf, confirm, onClose, opened };
}

const picker = (dialog: HTMLElement, label: string) => within(dialog).getByRole('group', { name: label }).querySelector('af-person-picker') as Picker;

describe('create project', () => {
  it('needs a name: Tạo project is locked while it is empty', async () => {
    const { name, submit, dialog, projectsNamed } = await openModal();
    expect(dialog.heading).toBe(vi_.newProject);
    await waitFor(() => expect(document.activeElement).toBe(name));
    expect(submit().getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(submit().getAttribute('aria-describedby')!)?.textContent).toBe(vi_.projectNeedsName);
    fireEvent.click(submit());
    fireEvent.change(name, { target: { value: '   ' } });
    expect(submit().getAttribute('aria-disabled')).toBe('true');
    fireEvent.change(name, { target: { value: 'Dự án mới' } });
    expect(submit().getAttribute('aria-disabled')).toBeNull();
    expect(projectsNamed('Dự án mới')).toHaveLength(0);
  });

  it('starts with the creator as a manager, who cannot be removed', async () => {
    const { dialog } = await openModal();
    const managers = within(dialog).getByRole('group', { name: vi_.managers });
    const creator = managers.querySelector('[data-part="creator"]') as HTMLElement;
    expect(creator.textContent).toContain('Vũ Thị Mai');
    expect(creator.querySelector('button')).toBeNull();
    expect(within(managers).getByText(vi_.creatorIsManager)).toBeTruthy();
    const others = picker(dialog, vi_.managers);
    expect(others.multiple).toBe(true);
    expect(others.value).toEqual([]);
    expect(others.people.map((p) => p.id)).not.toContain(MAI);
    expect(picker(dialog, vi_.members).people.map((p) => p.id)).not.toContain(MAI);
  });

  it('offers the units with Không có first', async () => {
    const { dialog } = await openModal();
    const unit = within(dialog).getByLabelText(vi_.unit) as HTMLSelectElement;
    await waitFor(() => expect(unit.options.length).toBe(UNITS.length + 1));
    expect([...unit.options].map((o) => o.textContent)).toEqual([vi_.noUnit, 'Khối Kinh doanh', 'Khối Kỹ thuật', 'Phòng Hành chính']);
    expect(unit.value).toBe('');
  });

  it('shows each template as a card with its first three sections', async () => {
    const { dialog, radio } = await openModal();
    const group = within(dialog).getByRole('radiogroup', { name: vi_.template });
    expect(within(group).getAllByRole('radio').map((r) => r.getAttribute('aria-labelledby') && document.getElementById(r.getAttribute('aria-labelledby')!)?.textContent))
      .toEqual(['Trống', 'Dự án phần mềm', 'Sự kiện / Ra mắt', 'Theo thời gian', 'Theo mảng việc', vi_.reuseProject]);
    expect(radio('Trống').getAttribute('aria-checked')).toBe('true');
    const preview = document.getElementById(radio('Dự án phần mềm').getAttribute('aria-describedby')!)!.textContent!;
    for (const s of SOFTWARE.slice(0, 3)) expect(preview).toContain(s);
    expect(preview).not.toContain('Kiểm thử');
  });

  it('fills the sections from a template, and Trống empties them, asking first only if they were edited', async () => {
    const { radio, sectionNames, confirm, dialog } = await openModal();
    expect(sectionNames()).toEqual([]);
    fireEvent.click(radio('Dự án phần mềm'));
    expect(sectionNames()).toEqual(SOFTWARE);
    expect(radio('Dự án phần mềm').getAttribute('aria-checked')).toBe('true');
    fireEvent.click(radio('Trống'));
    expect(confirm()).toBeNull();
    expect(sectionNames()).toEqual([]);

    fireEvent.click(radio('Dự án phần mềm'));
    fireEvent.change(within(dialog).getByDisplayValue('Thiết kế'), { target: { value: 'Thiết kế UI' } });
    fireEvent.click(radio('Trống'));
    const ask = await waitFor(() => {
      const c = confirm();
      expect(c).toBeTruthy();
      return c!;
    });
    expect(ask.heading).toBe(vi_.replaceSections);
    expect(ask.strings?.cancel).toBe(vi_.goBack);
    act(() => { ask.dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' } })); });
    expect(sectionNames()).toEqual(['Phân tích', 'Thiết kế UI', 'Phát triển', 'Kiểm thử', 'Triển khai']);
    expect(radio('Dự án phần mềm').getAttribute('aria-checked')).toBe('true');

    fireEvent.click(radio('Trống'));
    const again = await waitFor(() => confirm()!);
    act(() => { again.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    await waitFor(() => expect(sectionNames()).toEqual([]));
    expect(radio('Trống').getAttribute('aria-checked')).toBe('true');
  });

  it('moves between the templates with the arrow keys', async () => {
    const { radio, sectionNames } = await openModal();
    const blank = radio('Trống');
    expect(blank.tabIndex).toBe(0);
    expect(radio('Dự án phần mềm').tabIndex).toBe(-1);
    blank.focus();
    fireEvent.keyDown(blank, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(radio('Dự án phần mềm'));
    expect(radio('Dự án phần mềm').getAttribute('aria-checked')).toBe('true');
    expect(sectionNames()).toEqual(SOFTWARE);
  });

  it('reuses the sections of a project the creator manages or belongs to, and none of its tasks', async () => {
    const { radio, dialog, sectionNames, submit, name, fake, sectionsOf, projectsNamed } = await openModal();
    fireEvent.click(radio(vi_.reuseProject));
    const from = (await within(dialog).findByLabelText(vi_.reuseFrom)) as HTMLSelectElement;
    await waitFor(() => expect(from.options.length).toBeGreaterThan(1));
    expect([...from.options].slice(1).map((o) => o.textContent)).toEqual(['Nâng cấp kho', 'Ra mắt ứng dụng', 'Văn phòng']);
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    fireEvent.change(from, { target: { value: launch } });
    await waitFor(() => expect(sectionNames()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']));
    expect((within(dialog).getByRole('textbox', { name: 'Mô tả của Thiết kế' }) as HTMLInputElement).value)
      .toBe('Thiết kế giải pháp, giao diện và kiến trúc trước khi phát triển');

    const tasksBefore = fake.server.records('task').length;
    fireEvent.change(name, { target: { value: 'Ra mắt bản 2' } });
    fireEvent.click(submit());
    await waitFor(() => expect(projectsNamed('Ra mắt bản 2')).toHaveLength(1));
    const created = projectsNamed('Ra mắt bản 2')[0]!.id;
    await waitFor(() => expect(sectionsOf(created).map((s) => s.name)).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']));
    expect(fake.server.records('section').find((r) => r.body.project === created && r.body.name === 'Thiết kế')!.body.description)
      .toBe('Thiết kế giải pháp, giao diện và kiến trúc trước khi phát triển');
    expect(fake.server.records('task')).toHaveLength(tasksBefore);
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${created}`));
  });

  it('creates the project with what was given, and its sections in order, then opens it', async () => {
    const { name, dialog, radio, submit, projectsNamed, sectionsOf, opened } = await openModal({ app: true });
    fireEvent.change(name, { target: { value: 'Cổng khách hàng' } });
    fireEvent.change(within(dialog).getByLabelText(vi_.description), { target: { value: 'Cổng tự phục vụ cho khách hàng.' } });
    const unit = within(dialog).getByLabelText(vi_.unit) as HTMLSelectElement;
    const kt = UNITS.find((u) => u.code === 'KT')!.id;
    await waitFor(() => expect([...unit.options].some((o) => o.value === kt)).toBe(true));
    fireEvent.change(unit, { target: { value: kt } });
    pickPerson(picker(dialog, vi_.managers), [MINH]);
    pickPerson(picker(dialog, vi_.members), [HOA]);
    fireEvent.click(radio('Dự án phần mềm'));
    fireEvent.click(submit());

    await waitFor(() => expect(projectsNamed('Cổng khách hàng')).toHaveLength(1));
    const [project] = projectsNamed('Cổng khách hàng');
    expect(project!.body).toMatchObject({
      name: 'Cổng khách hàng', description: 'Cổng tự phục vụ cho khách hàng.', unit: kt, managers: [MAI, MINH], members: [HOA],
    });
    await waitFor(() => expect(sectionsOf(project!.id)).toEqual(SOFTWARE.map((n, i) => ({ name: n, position: (i + 1) * 1024 }))));
    await opened(project!.id, 'Cổng khách hàng');
    expect(dialog.open).toBe(false);
    expect(toasts()).toEqual([]);
  });

  it('keeps a person in one of managers and members: a member made a manager leaves the members', async () => {
    const { dialog } = await openModal();
    pickPerson(picker(dialog, vi_.members), [HOA, MINH]);
    pickPerson(picker(dialog, vi_.managers), [MINH]);
    await waitFor(() => expect(picker(dialog, vi_.members).value).toEqual([HOA]));
    expect(picker(dialog, vi_.members).people.map((p) => p.id)).not.toContain(MINH);
  });

  it('suggests a sub-label for a section named like a status, and still creates it', async () => {
    const { name, dialog, submit, projectsNamed, sectionsOf } = await openModal();
    const newRow = within(dialog).getByRole('textbox', { name: vi_.newSectionName });
    fireEvent.change(newRow, { target: { value: 'Đang làm' } });
    fireEvent.keyDown(newRow, { key: 'Enter' });
    expect(within(dialog).getByText(vi_.sectionLooksLikeStatus)).toBeTruthy();
    fireEvent.change(name, { target: { value: 'Việc nhóm' } });
    expect(submit().getAttribute('aria-disabled')).toBeNull();
    fireEvent.click(submit());
    await waitFor(() => expect(projectsNamed('Việc nhóm')).toHaveLength(1));
    const [created] = projectsNamed('Việc nhóm');
    await waitFor(() => expect(sectionsOf(created!.id)).toEqual([{ name: 'Đang làm', position: 1024 }]));
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${created!.id}`));
  });

  it('locks Tạo project while a section has no name', async () => {
    const { name, dialog, radio, submit } = await openModal();
    fireEvent.change(name, { target: { value: 'Dự án có hạng mục trống' } });
    fireEvent.click(radio('Theo thời gian'));
    fireEvent.change(within(dialog).getByDisplayValue('Tuần sau'), { target: { value: '' } });
    expect(submit().getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(submit().getAttribute('aria-describedby')!)?.textContent).toBe(vi_.sectionNeedsName);
  });

  it('says which section was refused and why, and Thử lại creates only those still missing', async () => {
    let sectionCalls = 0;
    const order: string[] = [];
    const { name, radio, submit, dialog, projectsNamed, sectionsOf, opened } = await openModal({
      app: true,
      api: (api, fake) => ({
        ...api,
        createSection: (project, n, position, description) => {
          sectionCalls += 1;
          order.push(n);
          if (sectionCalls === 3) {
            fake.server.failNext('POST', /\/records$/, 422, {
              type: 'VALIDATION_ERROR', title: 'Validation failed', status: 422, detail: 'Hạng mục này tạm thời không lưu được',
            });
          }
          return api.createSection(project, n, position, description);
        },
      }),
    });
    fireEvent.change(name, { target: { value: 'Ứng dụng nội bộ' } });
    fireEvent.click(radio('Dự án phần mềm'));
    fireEvent.click(submit());

    const alert = await within(dialog).findByRole('alert');
    expect(alert.textContent).toContain(vi_.partlyCreated);
    const failed = within(alert).getByText('Phát triển').closest('li')!;
    expect(failed.textContent).toContain('Hạng mục này tạm thời không lưu được');
    expect(within(alert).getByText('Kiểm thử')).toBeTruthy();
    expect(within(alert).getByText('Triển khai')).toBeTruthy();
    expect(dialog.open).toBe(true);
    expect(window.location.pathname).toBe('/projects');
    const project = projectsNamed('Ứng dụng nội bộ');
    expect(project).toHaveLength(1);
    expect(sectionsOf(project[0]!.id).map((s) => s.name)).toEqual(['Phân tích', 'Thiết kế']);
    expect(within(dialog).getByRole('button', { name: vi_.openProject })).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: vi_.createProject })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: vi_.retry })));

    order.length = 0;
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.retry }));
    await opened(project[0]!.id, 'Ứng dụng nội bộ');
    expect(order).toEqual(['Phát triển', 'Kiểm thử', 'Triển khai']);
    expect(projectsNamed('Ứng dụng nội bộ')).toHaveLength(1);
    expect(sectionsOf(project[0]!.id)).toEqual(SOFTWARE.map((n, i) => ({ name: n, position: (i + 1) * 1024 })));
    expect(toasts()).toEqual([]);
  });

  it('makes one project for three presses while the create is in flight, locked until it settles', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let calls = 0;
    const { name, submit, projectsNamed } = await openModal({
      api: (api) => ({ ...api, createProject: (input) => { calls += 1; return gate.then(() => api.createProject(input)); } }),
    });
    fireEvent.change(name, { target: { value: 'Bấm ba lần' } });
    const button = submit();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.submit(name.form!);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    await act(async () => {});
    expect(calls).toBe(1);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    await act(async () => { release(); await gate; });
    await waitFor(() => expect(projectsNamed('Bấm ba lần')).toHaveLength(1));
    expect(calls).toBe(1);
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${projectsNamed('Bấm ba lần')[0]!.id}`));
  });

  it('reports the network failing after the project exists the same way: one project, and Thử lại', async () => {
    let sectionCalls = 0;
    const { name, radio, submit, dialog, projectsNamed, sectionsOf } = await openModal({
      api: (api) => ({
        ...api,
        createSection: (project, n, position, description) => {
          sectionCalls += 1;
          if (sectionCalls === 2) return Promise.reject(new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch'));
          return api.createSection(project, n, position, description);
        },
      }),
    });
    fireEvent.change(name, { target: { value: 'Mất mạng giữa chừng' } });
    fireEvent.click(radio('Theo thời gian'));
    fireEvent.click(submit());

    const alert = await within(dialog).findByRole('alert');
    expect(within(alert).getByText('Tuần sau').closest('li')!.textContent).toContain(vi_.offlineLocked);
    const [project] = projectsNamed('Mất mạng giữa chừng');
    expect(projectsNamed('Mất mạng giữa chừng')).toHaveLength(1);
    expect(sectionsOf(project!.id).map((s) => s.name)).toEqual(['Tuần này']);

    fireEvent.click(within(dialog).getByRole('button', { name: vi_.retry }));
    await waitFor(() => expect(sectionsOf(project!.id).map((s) => s.name)).toEqual(['Tuần này', 'Tuần sau', 'Để sau']));
    expect(projectsNamed('Mất mạng giữa chừng')).toHaveLength(1);
  });

  it('reads what was stored before Thử lại after a section create the network lost, so no section is made twice', async () => {
    let sectionCalls = 0;
    const { name, radio, submit, dialog, projectsNamed, sectionsOf } = await openModal({
      api: (api) => ({
        ...api,
        createSection: async (project, n, position, description) => {
          sectionCalls += 1;
          const stored = await api.createSection(project, n, position, description);
          if (sectionCalls === 2) throw new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch');
          return stored;
        },
      }),
    });
    fireEvent.change(name, { target: { value: 'Mất câu trả lời' } });
    fireEvent.click(radio('Theo thời gian'));
    fireEvent.click(submit());

    const alert = await within(dialog).findByRole('alert');
    expect(within(alert).getByText('Tuần sau').closest('li')!.textContent).toContain(vi_.offlineLocked);
    const [project] = projectsNamed('Mất câu trả lời');
    expect(sectionsOf(project!.id).map((s) => s.name)).toEqual(['Tuần này', 'Tuần sau']);

    fireEvent.click(within(dialog).getByRole('button', { name: vi_.retry }));
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${project!.id}`));
    expect(sectionsOf(project!.id)).toEqual([
      { name: 'Tuần này', position: 1024 }, { name: 'Tuần sau', position: 2048 }, { name: 'Để sau', position: 3072 },
    ]);
    expect(projectsNamed('Mất câu trả lời')).toHaveLength(1);
  });

  it('finds the project a create the network lost had made, and goes on to its sections', async () => {
    let calls = 0;
    const { name, radio, submit, projectsNamed, sectionsOf, opened } = await openModal({
      app: true,
      api: (api) => ({
        ...api,
        createProject: async (input) => {
          calls += 1;
          await api.createProject(input);
          throw new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch');
        },
      }),
    });
    fireEvent.change(name, { target: { value: 'Đã lưu mà không biết' } });
    fireEvent.click(radio('Theo mảng việc'));
    fireEvent.click(submit());

    await waitFor(() => expect(projectsNamed('Đã lưu mà không biết')).toHaveLength(1));
    const [project] = projectsNamed('Đã lưu mà không biết');
    await opened(project!.id, 'Đã lưu mà không biết');
    expect(sectionsOf(project!.id).map((s) => s.name)).toEqual(['Kinh doanh', 'Kỹ thuật', 'Hành chính']);
    expect(projectsNamed('Đã lưu mà không biết')).toHaveLength(1);
    expect(calls).toBe(1);
  });

  it('creates nothing again until it has found the project a lost create made, when the network was down to look', async () => {
    let down = false;
    let creates = 0;
    let refusedReads = 0;
    const offline = () => new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch');
    const { name, radio, submit, dialog, projectsNamed, sectionsOf, opened } = await openModal({
      app: true,
      api: (api) => ({
        ...api,
        projects: (statuses) => {
          if (!down) return api.projects(statuses);
          refusedReads += 1;
          return Promise.reject(offline());
        },
        createProject: async (input) => {
          creates += 1;
          await api.createProject(input);
          down = true;
          throw offline();
        },
      }),
    });
    fireEvent.change(name, { target: { value: 'Mất mạng' } });
    fireEvent.click(radio('Theo mảng việc'));
    fireEvent.click(submit());
    const alert = await within(dialog).findByRole('alert');
    expect(alert.textContent).toContain(vi_.offlineLocked);
    await waitFor(() => expect(submit().getAttribute('aria-disabled')).toBeNull());
    expect(projectsNamed('Mất mạng')).toHaveLength(1);

    const refusedBefore = refusedReads;
    fireEvent.click(submit());
    await waitFor(() => expect(refusedReads).toBeGreaterThan(refusedBefore));
    await waitFor(() => expect(submit().getAttribute('aria-disabled')).toBeNull());
    expect(within(dialog).getByRole('alert').textContent).toContain(vi_.offlineLocked);
    expect(creates).toBe(1);

    down = false;
    fireEvent.click(submit());
    const [project] = projectsNamed('Mất mạng');
    await opened(project!.id, 'Mất mạng');
    expect(sectionsOf(project!.id).map((s) => s.name)).toEqual(['Kinh doanh', 'Kỹ thuật', 'Hành chính']);
    expect(projectsNamed('Mất mạng')).toHaveLength(1);
    expect(creates).toBe(1);
  });

  it('creates the project on a later press when a create the network lost had not landed and the list could not be read', async () => {
    let down = false;
    let creates = 0;
    const offline = () => new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch');
    const { name, submit, dialog, projectsNamed } = await openModal({
      api: (api) => ({
        ...api,
        projects: (statuses) => (down ? Promise.reject(offline()) : api.projects(statuses)),
        createProject: (input) => {
          creates += 1;
          if (creates > 1) return api.createProject(input);
          down = true;
          return Promise.reject(offline());
        },
      }),
    });
    fireEvent.change(name, { target: { value: 'Chưa tới nơi' } });
    fireEvent.click(submit());
    const alert = await within(dialog).findByRole('alert');
    expect(alert.textContent).toContain(vi_.offlineLocked);
    await waitFor(() => expect(submit().getAttribute('aria-disabled')).toBeNull());
    expect(projectsNamed('Chưa tới nơi')).toHaveLength(0);

    down = false;
    fireEvent.click(submit());
    await waitFor(() => expect(projectsNamed('Chưa tới nơi')).toHaveLength(1));
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${projectsNamed('Chưa tới nơi')[0]!.id}`));
    expect(creates).toBe(2);
  });

  it('says it is offline when a project create never reached the server, and a later press makes one project', async () => {
    let calls = 0;
    const { name, submit, dialog, projectsNamed } = await openModal({
      api: (api) => ({
        ...api,
        createProject: (input) => {
          calls += 1;
          return calls === 1 ? Promise.reject(new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch')) : api.createProject(input);
        },
      }),
    });
    fireEvent.change(name, { target: { value: 'Chưa tới nơi' } });
    fireEvent.click(submit());
    const alert = await within(dialog).findByRole('alert');
    expect(alert.textContent).toContain(vi_.offlineLocked);
    await waitFor(() => expect(submit().getAttribute('aria-disabled')).toBeNull());
    expect(projectsNamed('Chưa tới nơi')).toHaveLength(0);

    fireEvent.click(submit());
    await waitFor(() => expect(projectsNamed('Chưa tới nơi')).toHaveLength(1));
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${projectsNamed('Chưa tới nơi')[0]!.id}`));
    expect(calls).toBe(2);
  });

  it('does not take an older project of the same name for one a lost create made', async () => {
    const { name, submit, dialog, projectsNamed } = await openModal({
      api: (api) => ({ ...api, createProject: () => Promise.reject(new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch')) }),
    });
    fireEvent.change(name, { target: { value: 'Văn phòng' } });
    fireEvent.click(submit());
    const alert = await within(dialog).findByRole('alert');
    expect(alert.textContent).toContain(vi_.offlineLocked);
    expect(projectsNamed('Văn phòng')).toHaveLength(1);
    expect(window.location.pathname).toBe('/projects');
  });

  it('opens the project from Mở project, leaving what failed unsaved', async () => {
    const { name, radio, submit, dialog, projectsNamed, sectionsOf, onClose } = await openModal({
      api: (api) => ({ ...api, createSection: () => Promise.reject(new ProjectsError('offline', 0, 'NETWORK', null, 'Failed to fetch')) }),
    });
    fireEvent.change(name, { target: { value: 'Mở luôn' } });
    fireEvent.click(radio('Theo mảng việc'));
    fireEvent.click(submit());
    await within(dialog).findByRole('alert');
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.openProject }));
    const [project] = projectsNamed('Mở luôn');
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${project!.id}`));
    expect(onClose).toHaveBeenCalled();
    expect(sectionsOf(project!.id)).toEqual([]);
  });

  it("shows the server's refusal of the project itself in the dialog, and unlocks the button", async () => {
    const seed = createSeed(TEST_NOW);
    const { name, submit, dialog, projectsNamed } = await openModal({ seed });
    fireEvent.change(name, { target: { value: 'Không được phép' } });
    // Taken out of the creators' group after the module read who may create.
    seed.groups.creators.splice(seed.groups.creators.indexOf(MAI), 1);
    fireEvent.click(submit());
    const alert = await within(dialog).findByRole('alert');
    expect(alert.textContent).toContain(vi_.refusedAccess);
    expect(dialog.open).toBe(true);
    await waitFor(() => expect(submit().getAttribute('aria-disabled')).toBeNull());
    expect(projectsNamed('Không được phép')).toHaveLength(0);
  });

  it('closes on Escape and on Huỷ without writing anything', async () => {
    const first = await openModal();
    const before = first.fake.server.records('project').length;
    act(() => { first.dialog.dispatchEvent(new CustomEvent('close', { detail: { reason: 'escape' }, bubbles: true })); });
    expect(first.onClose).toHaveBeenCalledTimes(1);
    expect(first.confirm()).toBeNull();
    first.unmount();

    const second = await openModal();
    fireEvent.click(within(second.dialog).getByRole('button', { name: vi_.cancel }));
    expect(second.onClose).toHaveBeenCalledTimes(1);
    expect(second.fake.server.records('project')).toHaveLength(before);
  });

  it('asks before Huỷ or Escape throw away what was typed', async () => {
    const { name, dialog, confirm, onClose, fake } = await openModal();
    const before = fake.server.records('project').length;
    fireEvent.change(name, { target: { value: 'Nháp' } });
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.cancel }));
    const ask = await waitFor(() => confirm()!);
    expect(ask.heading).toBe(vi_.discardChanges);
    expect(ask.confirmLabel).toBe(vi_.discard);
    expect(ask.strings?.cancel).toBe(vi_.goBack);
    expect(onClose).not.toHaveBeenCalled();
    act(() => { ask.dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'escape' } })); });
    await waitFor(() => expect(confirm()).toBeNull());
    expect(name.value).toBe('Nháp');

    act(() => { dialog.dispatchEvent(new CustomEvent('close', { detail: { reason: 'escape' }, bubbles: true })); });
    const again = await waitFor(() => confirm()!);
    act(() => { again.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(fake.server.records('project')).toHaveLength(before);
  });
});

describe('the project list and create project', () => {
  it('opens the modal from Tạo project, and the new project shows in the list', async () => {
    const fake = createFakeProjects({ you: MAI });
    renderProjects(<App />, { fake, lang: 'vi', path: '/projects' });
    await screen.findByText('Văn phòng');
    fireEvent.click(screen.getByRole('button', { name: vi_.createProject }));
    const dialog = await waitFor(() => {
      const el = document.querySelector('af-dialog') as Dialog | null;
      expect(el?.open).toBe(true);
      return el!;
    });
    fireEvent.change(within(dialog).getByLabelText(vi_.projectName), { target: { value: 'Từ danh sách' } });
    fireEvent.click(within(dialog).getByRole('button', { name: vi_.createProject }));
    await waitFor(() => expect(fake.server.records('project').some((r) => r.body.name === 'Từ danh sách')).toBe(true));
    const id = fake.server.records('project').find((r) => r.body.name === 'Từ danh sách')!.id;
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${id}`));
    await waitFor(() => expect(document.querySelector('header.header')?.textContent).toContain('Từ danh sách'));
  });

  it('offers Tạo project to a creator in no project from the empty list', async () => {
    const seed = createSeed(TEST_NOW);
    seed.records.project = seed.records.project!.filter((p) => !(p.body.managers as string[]).includes(MAI) && !(p.body.members as string[]).includes(MAI));
    const fake = createFakeProjects({ you: MAI, seed });
    renderProjects(<App />, { fake, lang: 'vi', path: '/projects' });
    const empty = (await screen.findByText(vi_.noProjects)).closest('.state') as HTMLElement;
    fireEvent.click(within(empty).getByRole('button', { name: vi_.createProject }));
    await waitFor(() => expect((document.querySelector('af-dialog') as Dialog | null)?.open).toBe(true));
  });

  it('offers a member in no project no Tạo project in the empty list', async () => {
    const seed = createSeed(TEST_NOW);
    seed.records.project = [];
    const fake = createFakeProjects({ you: HOA, seed });
    renderProjects(<App />, { fake, lang: 'vi', path: '/projects' });
    const empty = (await screen.findByText(vi_.noProjects)).closest('.state') as HTMLElement;
    expect(within(empty).queryByRole('button')).toBeNull();
  });
});
