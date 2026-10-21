// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsError, type ProjectsApi } from '../../src/api/projects-api.js';
import { LAN, MINH } from '../../src/api/seed.js';
import type { Status } from '../../src/model/types.js';
import { App } from '../../src/shell/App.js';
import { TaskDrawer } from '../../src/task/TaskDrawer.js';
import { LabelSettings } from '../../src/labels/LabelSettings.js';
import { TEXT } from '../../src/text.js';
import { TEST_NOW, renderProjects } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { LAUNCH, seeded } from '../task/support.js';

const vi_ = TEXT.vi;
const WAITING = 'Chờ duyệt';
const THIS_WEEK = 'Ưu tiên tuần';
const API_TASK = 'Xây dựng API đăng nhập';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type ConfirmEl = HTMLElement & { open: boolean; heading: string; message: string; confirmLabel: string; danger: boolean; strings: { cancel?: string } | null };
type DialogEl = HTMLElement & { open: boolean; heading: string };

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });
const group = (status: Status) => document.querySelector<HTMLElement>(`.label-settings [data-group="${status}"]`)!;
const row = (name: string) => [...document.querySelectorAll<HTMLElement>('.label-settings [data-label]')]
  .find((li) => li.querySelector<HTMLInputElement>('[data-part="name"]')?.value === name || li.querySelector('.label-builtin')?.textContent === name) ?? null;
const nameBox = (name: string) => row(name)!.querySelector<HTMLInputElement>('[data-part="name"]')!;
const namesIn = (status: Status) => [...group(status).querySelectorAll<HTMLElement>('[data-label]')]
  .map((li) => li.querySelector<HTMLInputElement>('[data-part="name"]')?.value ?? li.querySelector('.label-builtin')?.textContent);
const confirmEl = () => document.querySelector<ConfirmEl>('.label-settings af-confirm')!;
const confirm = () => act(() => { confirmEl().dispatchEvent(new CustomEvent('confirm', { bubbles: true })); });
const dialogEl = () => document.querySelector<DialogEl>('.label-settings af-dialog')!;
const stored = (fake: ReturnType<typeof seeded>['fake']) => fake.server.records('task_label').map((r) => r.body.name as string).sort();

/** The label settings as `you`, counting the label writes the page sends. */
async function open(you: string, opts: { before?: (s: ReturnType<typeof seeded>) => void; api?: (api: ProjectsApi) => ProjectsApi } = {}) {
  const s = seeded(you);
  opts.before?.(s);
  const sent = { create: [] as [string, Status][], update: [] as { name: string }[], remove: [] as string[] };
  const view = renderProjects(<App />, {
    fake: s.fake, lang: 'vi', path: '/settings/labels',
    api: (api) => {
      const counted: ProjectsApi = {
        ...api,
        createLabel: (name, base) => { sent.create.push([name, base]); return api.createLabel(name, base); },
        updateLabel: (label, changes) => { sent.update.push(changes); return api.updateLabel(label, changes); },
        deleteLabel: (label) => { sent.remove.push(label.id); return api.deleteLabel(label); },
      };
      return opts.api ? opts.api(counted) : counted;
    },
  });
  await waitFor(() => expect(document.querySelector('.label-settings, [data-state="forbidden"]')).not.toBeNull());
  return { ...s, ...view, sent };
}

/** Lan, also a manager of Ra mắt ứng dụng, whose tasks carry the seeded labels. */
const lanManages = (s: ReturnType<typeof seeded>) => {
  s.fake.server.write('project', s.project(LAUNCH), { managers: [MINH, LAN] }, MINH, { notify: false });
};

describe('who may open the page', () => {
  it('shows anyone but a project admin the no-access state, with a way back to the projects', async () => {
    await open(MINH);
    expect(document.querySelector('.label-settings')).toBeNull();
    expect(screen.getByText(vi_.labelsForbidden)).toBeTruthy();
    fireEvent.click(within(document.querySelector<HTMLElement>('[data-state="forbidden"]')!).getByRole('button', { name: vi_.breadcrumbProjects }));
    expect(window.location.pathname).toBe('/projects');
  });

  it('says what the page is for, in a heading and one line', async () => {
    await open(LAN);
    expect(screen.getByRole('heading', { level: 2, name: vi_.labelSettings })).toBeTruthy();
    expect(screen.getByText(vi_.labelSettingsHint)).toBeTruthy();
  });
});

describe('the groups', () => {
  it('lists the four statuses in order, each with the labels of that base status', async () => {
    await open(LAN);
    const heads = [...document.querySelectorAll('.label-settings .label-group-head')].map((h) => h.querySelector('.label-group-name')!.textContent);
    expect(heads).toEqual([vi_.statusTodo, vi_.statusDoing, vi_.statusDone, vi_.statusCancelled]);
    expect(namesIn('todo')).toEqual([THIS_WEEK]);
    expect(namesIn('doing')).toEqual([WAITING, vi_.blocked]);
    expect(namesIn('done')).toEqual([]);
    expect(group('done').textContent).toContain(vi_.noLabelsYet);
  });

  it('lists Bị chặn under Đang làm as built in, with no actions', async () => {
    await open(LAN);
    const blocked = row(vi_.blocked)!;
    expect(blocked.closest('[data-group="doing"]')).not.toBeNull();
    expect(blocked.textContent).toContain(vi_.builtIn);
    expect(blocked.querySelector('button, input')).toBeNull();
  });
});

describe('adding a label', () => {
  it('adds a label with the status of the group whose Thêm nhãn was pressed', async () => {
    const { sent, fake } = await open(LAN);
    fireEvent.click(within(group('done')).getByRole('button', { name: vi_.addLabel }));
    const input = within(group('done')).getByRole('textbox', { name: vi_.newLabelName });
    fireEvent.change(input, { target: { value: 'Đã nghiệm thu' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(namesIn('done')).toEqual(['Đã nghiệm thu']));
    expect(sent.create).toEqual([['Đã nghiệm thu', 'done']]);
    expect(stored(fake)).toContain('Đã nghiệm thu');
    expect(fake.server.records('task_label').find((r) => r.body.name === 'Đã nghiệm thu')!.body.base_status).toBe('done');
  });

  it('sends nothing for an empty name, and Escape leaves without a label', async () => {
    const { sent } = await open(LAN);
    fireEvent.click(within(group('todo')).getByRole('button', { name: vi_.addLabel }));
    const blank = within(group('todo')).getByRole('textbox', { name: vi_.newLabelName });
    fireEvent.change(blank, { target: { value: '   ' } });
    fireEvent.keyDown(blank, { key: 'Enter' });
    await settle();
    expect(within(group('todo')).queryByRole('textbox', { name: vi_.newLabelName })).toBeNull();

    fireEvent.click(within(group('todo')).getByRole('button', { name: vi_.addLabel }));
    const typed = within(group('todo')).getByRole('textbox', { name: vi_.newLabelName });
    fireEvent.change(typed, { target: { value: 'Nháp' } });
    fireEvent.keyDown(typed, { key: 'Escape' });
    await settle();
    expect(sent.create).toEqual([]);
    expect(namesIn('todo')).toEqual([THIS_WEEK]);
  });
});

describe('renaming in place', () => {
  it('saves on Enter', async () => {
    const { sent, fake } = await open(LAN);
    const box = nameBox(THIS_WEEK);
    box.focus();
    fireEvent.change(box, { target: { value: 'Tuần này' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(stored(fake)).toContain('Tuần này'));
    expect(sent.update).toEqual([{ name: 'Tuần này' }]);
    expect(stored(fake)).not.toContain(THIS_WEEK);
    expect(document.activeElement).toBe(nameBox('Tuần này'));
  });

  it('saves on blur', async () => {
    const { sent, fake } = await open(LAN);
    const box = nameBox(WAITING);
    box.focus();
    fireEvent.change(box, { target: { value: 'Chờ phê duyệt' } });
    fireEvent.blur(box);
    await waitFor(() => expect(stored(fake)).toContain('Chờ phê duyệt'));
    expect(sent.update).toEqual([{ name: 'Chờ phê duyệt' }]);
  });

  it('is cancelled by Escape, which also ends the blur that follows', async () => {
    const { sent, fake } = await open(LAN);
    const box = nameBox(WAITING);
    box.focus();
    fireEvent.change(box, { target: { value: 'Sẽ bỏ' } });
    fireEvent.keyDown(box, { key: 'Escape' });
    fireEvent.blur(box);
    await settle();
    expect(box.value).toBe(WAITING);
    expect(sent.update).toEqual([]);
    expect(stored(fake)).toContain(WAITING);
  });

  it('writes nothing for a blank or unchanged name and puts the old one back', async () => {
    const { sent } = await open(LAN);
    const box = nameBox(WAITING);
    fireEvent.change(box, { target: { value: '  ' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await settle();
    expect(box.value).toBe(WAITING);
    fireEvent.keyDown(box, { key: 'Enter' });
    await settle();
    expect(sent.update).toEqual([]);
  });

  it('keeps editing while a save is on its way, and the second save waits for the first', async () => {
    const { sent, fake } = await open(LAN);
    const box = nameBox(WAITING);
    fireEvent.change(box, { target: { value: 'Một' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    fireEvent.change(box, { target: { value: 'Hai' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(stored(fake)).toContain('Hai'));
    expect(sent.update).toEqual([{ name: 'Một' }, { name: 'Hai' }]);
  });
});

describe('deleting a label', () => {
  it('asks first, in words that say what happens to the tasks', async () => {
    const { sent, fake } = await open(LAN, { before: lanManages });
    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', THIS_WEEK) }));
    await waitFor(() => expect(confirmEl().open).toBe(true));
    expect(confirmEl()).toMatchObject({
      heading: vi_.deleteLabelHeading.replace('{name}', THIS_WEEK),
      message: vi_.deleteLabelConfirm,
      confirmLabel: vi_.deleteLabel,
      danger: true,
    });
    expect(confirmEl().strings).toMatchObject({ cancel: vi_.goBack });
    act(() => { confirmEl().dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' } })); });
    await waitFor(() => expect(confirmEl().open).toBe(false));
    expect(sent.remove).toEqual([]);
    expect(stored(fake)).toContain(THIS_WEEK);
  });

  it('removes the label and leaves the tasks that used it in their status, without it', async () => {
    const { sent, fake, task, stored: taskBody, toasts } = await open(LAN, { before: lanManages });
    const id = task(API_TASK);
    expect(taskBody(id).label).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', THIS_WEEK) }));
    await waitFor(() => expect(confirmEl().open).toBe(true));
    await confirm();
    await waitFor(() => expect(row(THIS_WEEK)).toBeNull());
    expect(sent.remove).toHaveLength(1);
    expect(stored(fake)).not.toContain(THIS_WEEK);
    expect(taskBody(id).label ?? null).toBeNull();
    expect(taskBody(id).status).toBe('todo');
    await waitFor(() => expect(toasts()).toContain(vi_.labelDeletedCleared.replace('{n}', '1')));
    await waitFor(() => expect(confirmEl().open).toBe(false));
  });

  it('removes a label nothing uses, and says so', async () => {
    const { fake, toasts } = await open(LAN, {
      before: (s) => { s.fake.server.write('task_label', null, { name: 'Không dùng', base_status: 'cancelled' }, LAN, { notify: false }); },
    });
    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', 'Không dùng') }));
    await waitFor(() => expect(confirmEl().open).toBe(true));
    await confirm();
    await waitFor(() => expect(row('Không dùng')).toBeNull());
    expect(stored(fake)).not.toContain('Không dùng');
    await waitFor(() => expect(toasts()).toContain(vi_.labelDeleted));
  });

  it('is refused when the deleter cannot edit every task that uses the label: the reason shows and nothing changes', async () => {
    const { sent, fake, task, stored: taskBody } = await open(LAN);
    const id = task(API_TASK);
    const before = { ...taskBody(id) };
    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', THIS_WEEK) }));
    await waitFor(() => expect(confirmEl().open).toBe(true));
    await confirm();

    await waitFor(() => expect(dialogEl().open).toBe(true));
    expect(dialogEl().heading).toBe(vi_.labelInUse);
    expect(dialogEl().textContent).toContain(vi_.labelInUseForbidden.replace('{n}', '1'));
    expect(dialogEl().textContent).not.toContain('cannot edit');
    expect(dialogEl().textContent).not.toContain('ENTITY_RECORD_CASCADE_FORBIDDEN');
    expect(dialogEl().textContent).toContain(vi_.labelInUseHint);
    expect(confirmEl().open).toBe(false);

    expect(sent.remove).toHaveLength(1);
    expect(stored(fake)).toContain(THIS_WEEK);
    expect(row(THIS_WEEK)).not.toBeNull();
    expect(taskBody(id)).toEqual(before);

    // The kit puts focus back on what had it before the dialog opened; the field must take it after that.
    const trigger = screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', THIS_WEEK) });
    trigger.focus();
    fireEvent.click(within(dialogEl()).getByRole('button', { name: vi_.rename }));
    await waitFor(() => expect(dialogEl().open).toBe(false));
    expect(document.activeElement).not.toBe(nameBox(THIS_WEEK));
    trigger.focus();
    await waitFor(() => expect(document.activeElement).toBe(nameBox(THIS_WEEK)));
    expect(nameBox(THIS_WEEK).selectionStart).toBe(0);
    expect(nameBox(THIS_WEEK).selectionEnd).toBe(THIS_WEEK.length);
  });

  it('says how many tasks use the label when more than one delete can change, and keeps the label', async () => {
    const reason = 'deleting this record would touch 501 records; the limit is 500';
    const { fake } = await open(LAN, {
      api: (api) => ({
        ...api,
        deleteLabel: () => Promise.reject(new ProjectsError('invalid', 422, 'ENTITY_RECORD_CASCADE_TOO_LARGE', reason, undefined, null, null, null, { found: 501, cap: 500 })),
      }),
    });
    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', WAITING) }));
    await waitFor(() => expect(confirmEl().open).toBe(true));
    await confirm();
    await waitFor(() => expect(dialogEl().open).toBe(true));
    expect(dialogEl().heading).toBe(vi_.labelInUse);
    expect(dialogEl().textContent).toContain(vi_.labelInUseTooMany.replace('{n}', '500').replace('{cap}', '499'));
    expect(dialogEl().textContent).not.toContain('the limit is');
    expect(stored(fake)).toContain(WAITING);
  });

  it('falls back to the server\'s sentence for a refusal it has no words for', async () => {
    const { fake } = await open(LAN, {
      api: (api) => ({ ...api, deleteLabel: () => Promise.reject(new ProjectsError('forbidden', 403, 'ENTITY_RECORD_CASCADE_FORBIDDEN', 'some sentence from the server')) }),
    });
    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', WAITING) }));
    await waitFor(() => expect(confirmEl().open).toBe(true));
    await confirm();
    await waitFor(() => expect(dialogEl().open).toBe(true));
    expect(dialogEl().textContent).toContain('some sentence from the server');
    expect(stored(fake)).toContain(WAITING);
  });

  it('shows an open task drawer without the label, in the same status, once the delete goes through', async () => {
    const s = seeded(LAN);
    lanManages(s);
    const id = s.task(API_TASK);
    renderProjects(<><LabelSettings /><TaskDrawer taskId={id} route={{ screen: 'projects', task: id }} /></>, {
      fake: s.fake, lang: 'vi', path: `/projects/t/${id}`,
    });
    const drawer = await screen.findByRole('dialog', { name: API_TASK });
    await waitFor(() => expect(within(drawer).getByRole('button', { name: THIS_WEEK, pressed: true })).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', THIS_WEEK) }));
    await waitFor(() => expect(confirmEl().open).toBe(true));
    await confirm();

    await waitFor(() => expect(within(drawer).queryByRole('button', { name: THIS_WEEK })).toBeNull());
    expect(within(drawer).getByRole('button', { name: vi_.statusTodo, pressed: true })).toBeTruthy();
    expect(s.stored(id).status).toBe('todo');
  });
});

describe('offline', () => {
  it('locks every control with the reason', async () => {
    const { live } = await open(LAN);
    act(() => live.setStatus('offline'));
    await waitFor(() => expect(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', WAITING) }).getAttribute('aria-disabled')).toBe('true'));
    expect(within(group('todo')).getByRole('button', { name: vi_.addLabel }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: vi_.renameLabelOf.replace('{name}', WAITING) }).getAttribute('aria-disabled')).toBe('true');
    expect(nameBox(WAITING).readOnly).toBe(true);
    hoverTooltips();
    const reasons = [...document.querySelectorAll<HTMLElement & { text: string }>('.label-settings af-tooltip')].map((t) => t.text);
    expect(reasons).toContain(vi_.offlineLocked);

    fireEvent.click(screen.getByRole('button', { name: vi_.deleteLabelOf.replace('{name}', WAITING) }));
    await settle();
    expect(confirmEl().open).toBe(false);
  });
});
