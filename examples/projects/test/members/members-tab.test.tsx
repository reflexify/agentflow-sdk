// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectsApi } from '../../src/api/projects-api.js';
import { HOA, KHOA, LAN, MAI, MINH, TUAN } from '../../src/api/seed.js';
import type { MenuItem } from '../../src/kit/elements.js';
import type { ProjectChanges } from '../../src/model/types.js';
import { App } from '../../src/shell/App.js';
import { TEXT, t } from '../../src/text.js';
import { TEST_NOW, pickPerson, renderProjects } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { seeded } from '../task/support.js';

const vi_ = TEXT.vi;
const LAUNCH = 'Ra mắt ứng dụng';
const Q3 = 'Kế hoạch quý 3';
const NAMES = { [MINH]: 'Trần Văn Minh', [HOA]: 'Lê Thị Hoa', [MAI]: 'Vũ Thị Mai', [TUAN]: 'Phạm Minh Tuấn', [KHOA]: 'Đỗ Đăng Khoa' } as Record<string, string>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type MenuEl = HTMLElement & { items: MenuItem[]; label: string };
type ConfirmEl = HTMLElement & { open: boolean; heading: string; message: string; confirmLabel: string; strings: { cancel?: string } | null };
type PickerEl = HTMLElement & { people: { id: string; name: string }[]; value: unknown; multiple: boolean };
type DialogEl = HTMLElement & { open: boolean; heading: string };

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });
const row = (id: string) => document.querySelector<HTMLElement>(`.members [data-person="${id}"]`);
const menuOf = (id: string) => row(id)?.querySelector<MenuEl>('af-menu') ?? null;
const labelsOf = (id: string) => menuOf(id)!.items.map((i) => i.label);
const choose = (id: string, item: string) => act(() => { menuOf(id)!.dispatchEvent(new CustomEvent('select', { detail: { id: item }, bubbles: true })); });
const confirmEl = () => document.querySelector<ConfirmEl>('.members af-confirm')!;
const confirm = () => act(() => { confirmEl().dispatchEvent(new CustomEvent('confirm', { bubbles: true })); });
const group = (name: 'managers' | 'members') => document.querySelector<HTMLElement>(`.members [data-group="${name}"]`)!;
const names = (name: 'managers' | 'members') => [...group(name).querySelectorAll('[data-person]')].map((li) => li.querySelector('.person-name')!.textContent);
const addButton = () => screen.queryByRole('button', { name: vi_.addMembers });
const dialogOf = (heading: string) => [...document.querySelectorAll<DialogEl>('.members af-dialog')].find((d) => d.heading === heading);
const picker = () => document.querySelector<PickerEl>('.members af-dialog af-person-picker');

/** The members tab of `project` as `you`, with every project patch recorded. */
async function open(you: string, project = LAUNCH, opts: { before?: (s: ReturnType<typeof seeded>, id: string) => void; api?: (api: ProjectsApi) => ProjectsApi } = {}) {
  const s = seeded(you);
  const id = s.project(project);
  opts.before?.(s, id);
  const patches: ProjectChanges[] = [];
  const view = renderProjects(<App />, {
    fake: s.fake, lang: 'vi', path: `/p/${id}/members`,
    api: (api: ProjectsApi) => {
      const counted: ProjectsApi = { ...api, updateProject: (p, changes) => { patches.push(changes); return api.updateProject(p, changes); } };
      return opts.api ? opts.api(counted) : counted;
    },
  });
  await waitFor(() => expect(document.querySelector('.members')).not.toBeNull());
  const stored = () => s.fake.server.records('project').find((r) => r.id === id)!.body as { managers: string[]; members: string[]; updated_at?: string };
  return { ...s, ...view, id, patches, stored };
}

/** Ra mắt ứng dụng with Hoa as a second manager. */
const twoManagers = (s: ReturnType<typeof seeded>, id: string) => {
  s.fake.server.write('project', id, { managers: [MINH, HOA], members: [MAI] }, MINH, { notify: false });
};

describe('the members tab', () => {
  it('lists the managers and then the members, each with an avatar, a name and an email', async () => {
    await open(MINH);
    expect(within(group('managers')).getByRole('heading', { name: new RegExp(vi_.managers) })).toBeTruthy();
    expect(within(group('members')).getByRole('heading', { name: new RegExp(vi_.members) })).toBeTruthy();
    expect(names('managers')).toEqual([NAMES[MINH]]);
    expect(names('members')).toEqual([NAMES[HOA], NAMES[MAI]]);
    const hoa = row(HOA)!;
    expect(hoa.querySelector('.af-avatar')!.textContent).toBe('LH');
    expect(hoa.textContent).toContain('hoa@example.com');
  });

  it('marks the viewer\'s own row', async () => {
    await open(MINH);
    expect(row(MINH)!.textContent).toContain(vi_.youTag);
    expect(row(HOA)!.textContent).not.toContain(vi_.youTag);
  });

  it('shows a member the list and no controls', async () => {
    await open(HOA);
    expect(names('managers')).toEqual([NAMES[MINH]]);
    expect(names('members')).toEqual([NAMES[HOA], NAMES[MAI]]);
    expect(document.querySelector('.members af-menu')).toBeNull();
    expect(addButton()).toBeNull();
  });

  it('shows a project admin outside the project the same read-only list', async () => {
    await open(LAN);
    expect(names('managers')).toEqual([NAMES[MINH]]);
    expect(names('members')).toEqual([NAMES[HOA], NAMES[MAI]]);
    expect(document.querySelector('.members af-menu')).toBeNull();
    expect(addButton()).toBeNull();
  });

  it('says so when a project has no members', async () => {
    await open(MAI, 'Văn phòng', { before: (s, id) => s.fake.server.write('project', id, { members: [] }, MAI, { notify: false }) });
    expect(group('members').textContent).toContain(vi_.noMembersYet);
  });
});

describe('adding people', () => {
  it('offers the people who are not in the project, and adds those chosen in one write', async () => {
    const { patches, stored } = await open(MINH);
    fireEvent.click(addButton()!);
    await waitFor(() => expect(picker()).not.toBeNull());
    expect(picker()!.multiple).toBe(true);
    expect(picker()!.people.map((p) => p.id).sort()).toEqual([KHOA, LAN, TUAN].sort());
    expect(dialogOf(vi_.addMembers)).toBeTruthy();

    pickPerson(picker()!, [TUAN, KHOA]);
    fireEvent.click(screen.getByRole('button', { name: vi_.addToProject }));
    await waitFor(() => expect(names('members')).toEqual([NAMES[HOA], NAMES[MAI], NAMES[TUAN], NAMES[KHOA]]));
    expect(patches).toEqual([{ managers: [MINH], members: [HOA, MAI, TUAN, KHOA] }]);
    expect(stored().members).toEqual([HOA, MAI, TUAN, KHOA]);
    await waitFor(() => expect(dialogOf(vi_.addMembers)!.open).toBe(false));
  });

  it('does nothing until someone is chosen', async () => {
    const { patches } = await open(MINH);
    fireEvent.click(addButton()!);
    await waitFor(() => expect(picker()).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: vi_.addToProject }));
    await settle();
    expect(patches).toEqual([]);
  });
});

describe('promoting, demoting and removing', () => {
  it('makes a member a manager in one write', async () => {
    const { patches, stored } = await open(MINH);
    expect(labelsOf(HOA)).toEqual([vi_.makeManager, vi_.removeFromProject]);
    choose(HOA, 'promote');
    await waitFor(() => expect(names('managers')).toEqual([NAMES[MINH], NAMES[HOA]]));
    expect(patches).toEqual([{ managers: [MINH, HOA], members: [MAI] }]);
    expect(stored().managers).toEqual([MINH, HOA]);
    expect(names('members')).toEqual([NAMES[MAI]]);
  });

  it('makes a manager a member again when another manager remains', async () => {
    const { patches } = await open(MINH, LAUNCH, { before: twoManagers });
    expect(labelsOf(HOA)).toEqual([vi_.makeMember, vi_.removeFromProject]);
    expect(menuOf(HOA)!.items.every((i) => !i.disabled)).toBe(true);
    choose(HOA, 'demote');
    await waitFor(() => expect(names('managers')).toEqual([NAMES[MINH]]));
    expect(names('members')).toEqual([NAMES[MAI], NAMES[HOA]]);
    expect(patches).toEqual([{ managers: [MINH], members: [MAI, HOA] }]);
  });

  it('asks before removing someone, and says they keep the tasks they hold', async () => {
    const { patches } = await open(MINH);
    choose(MAI, 'remove');
    await waitFor(() => expect(confirmEl().open).toBe(true));
    expect(confirmEl().message).toBe(t('vi', 'removeMemberConfirm', { name: NAMES[MAI]! }));
    expect(confirmEl().confirmLabel).toBe(vi_.removeFromProject);
    expect(confirmEl().strings).toMatchObject({ cancel: vi_.goBack });
    expect(patches).toEqual([]);

    confirm();
    await waitFor(() => expect(names('members')).toEqual([NAMES[HOA]]));
    expect(patches).toEqual([{ managers: [MINH], members: [HOA] }]);
    await waitFor(() => expect(confirmEl().open).toBe(false));
  });

  it('writes nothing when the confirmation is dismissed', async () => {
    const { patches } = await open(MINH);
    choose(MAI, 'remove');
    await waitFor(() => expect(confirmEl().open).toBe(true));
    act(() => { confirmEl().dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' }, bubbles: true })); });
    await waitFor(() => expect(confirmEl().open).toBe(false));
    expect(patches).toEqual([]);
    expect(names('members')).toEqual([NAMES[HOA], NAMES[MAI]]);
  });

  it('makes one write however many times the confirmation is pressed', async () => {
    const { patches } = await open(MINH);
    choose(MAI, 'remove');
    await waitFor(() => expect(confirmEl().open).toBe(true));
    confirm();
    confirm();
    await waitFor(() => expect(names('members')).toEqual([NAMES[HOA]]));
    expect(patches).toHaveLength(1);
  });
});

describe('the last manager', () => {
  it('cannot step down or be removed: both are locked with the reason, and nothing is written', async () => {
    const { patches } = await open(MINH);
    const items = menuOf(MINH)!.items;
    expect(items.map((i) => i.label)).toEqual([vi_.makeMember, vi_.leaveProject, vi_.handOverManagement]);
    expect(items[0]).toMatchObject({ disabled: true, reason: vi_.lastManagerStays });
    expect(items[1]).toMatchObject({ disabled: true, reason: vi_.lastManagerStays });
    expect(items[2]!.disabled).toBeFalsy();
    choose(MINH, 'demote');
    choose(MINH, 'remove');
    await settle();
    expect(confirmEl().open).toBe(false);
    expect(patches).toEqual([]);
  });

  it('can hand management to a member, after a confirmation, in one write', async () => {
    const { patches, stored } = await open(MINH);
    choose(MINH, 'handover');
    await waitFor(() => expect(picker()).not.toBeNull());
    expect(picker()!.multiple).toBe(false);
    expect(picker()!.people.map((p) => p.id).sort()).toEqual([HOA, MAI].sort());
    expect(dialogOf(vi_.handOverManagement)).toBeTruthy();

    pickPerson(picker()!, HOA);
    await waitFor(() => expect(confirmEl().open).toBe(true));
    expect(confirmEl().message).toBe(t('vi', 'handOverConfirm', { name: NAMES[HOA]! }));
    expect(patches).toEqual([]);
    confirm();

    await waitFor(() => expect(patches).toEqual([{ managers: [HOA], members: [MAI, MINH] }]));
    expect(stored().managers).toEqual([HOA]);
    expect(stored().members).toEqual([MAI, MINH]);
    await waitFor(() => expect(document.querySelector('.members af-menu')).toBeNull());
    expect(addButton()).toBeNull();
    expect(names('managers')).toEqual([NAMES[HOA]]);
    expect(names('members')).toEqual([NAMES[MAI], NAMES[MINH]]);
  });

  it('offers hand over only from the viewer\'s own row, and locks it when nobody else is in the project', async () => {
    await open(MINH, LAUNCH, { before: twoManagers });
    expect(labelsOf(HOA)).not.toContain(vi_.handOverManagement);
    expect(labelsOf(MINH)).toContain(vi_.handOverManagement);
    expect(menuOf(MINH)!.items.find((i) => i.id === 'demote')!.disabled).toBeFalsy();
  });

  it('locks hand over with its reason when the project has no member to take it', async () => {
    await open(MAI, 'Văn phòng', { before: (s, id) => s.fake.server.write('project', id, { members: [] }, MAI, { notify: false }) });
    expect(menuOf(MAI)!.items.find((i) => i.id === 'handover')).toMatchObject({ disabled: true, reason: vi_.handOverToMember });
  });

  it('meets 409 and reloads when another manager changed the project first, and writes nothing over their change', async () => {
    const { patches, stored, toasts, id, fake } = await open(MINH, LAUNCH, { before: twoManagers });
    // Hoa adds Tuấn while Minh's page is open and is not told.
    fake.server.write('project', id, { members: [MAI, TUAN] }, HOA, { notify: false });

    choose(HOA, 'demote');
    await waitFor(() => expect(toasts()).toContain(vi_.projectStale));
    expect(patches).toEqual([{ managers: [MINH], members: [MAI, HOA] }]);
    expect(stored().managers).toEqual([MINH, HOA]);
    expect(stored().members).toEqual([MAI, TUAN]);
    await waitFor(() => expect(names('members')).toEqual([NAMES[MAI], NAMES[TUAN]]));
    expect(names('managers')).toEqual([NAMES[MINH], NAMES[HOA]]);
  });

  it('is refused and reloads when two managers demote each other: the one who lost the role is shown the list read-only', async () => {
    const { patches, stored, toasts, id, fake } = await open(MINH, LAUNCH, { before: twoManagers });
    // Hoa demotes Minh while his page is open and is not told.
    fake.server.write('project', id, { managers: [HOA], members: [MAI, MINH] }, HOA, { notify: false });

    choose(HOA, 'demote');
    await waitFor(() => expect(toasts()).toContain(vi_.refusedAccess));
    expect(patches).toEqual([{ managers: [MINH], members: [MAI, HOA] }]);
    expect(stored().managers).toEqual([HOA]);
    expect(stored().members).toEqual([MAI, MINH]);
    await waitFor(() => expect(names('managers')).toEqual([NAMES[HOA]]));
    expect(names('members')).toEqual([NAMES[MAI], NAMES[MINH]]);
    expect(document.querySelector('.members af-menu')).toBeNull();
    expect(addButton()).toBeNull();
  });

  it('shows the server\'s refusal when a write that leaves no manager reaches it', async () => {
    const { patches, stored, toasts } = await open(MINH, LAUNCH, {
      api: (api) => ({ ...api, updateProject: (p, changes) => api.updateProject(p, { ...changes, managers: [] }) }),
    });
    choose(MAI, 'remove');
    await waitFor(() => expect(confirmEl().open).toBe(true));
    confirm();
    await waitFor(() => expect(toasts()).toContain(vi_.lastManagerStays));
    expect(patches).toHaveLength(1);
    expect(stored().managers).toEqual([MINH]);
    expect(stored().members).toEqual([HOA, MAI]);
  });
});

describe('leaving', () => {
  it('takes a manager who removes themselves to the project list, with a notice', async () => {
    const { patches, stored, toasts } = await open(MINH, LAUNCH, { before: twoManagers });
    choose(MINH, 'remove');
    await waitFor(() => expect(confirmEl().open).toBe(true));
    confirm();
    await waitFor(() => expect(window.location.pathname).toBe('/projects'));
    expect(patches).toEqual([{ managers: [HOA], members: [MAI] }]);
    expect(stored().managers).toEqual([HOA]);
    await waitFor(() => expect(toasts()).toContain(vi_.youLeftProject));
    expect(toasts()).not.toContain(vi_.refusedAccess);
    await settle();
    expect(document.body.textContent).not.toContain(vi_.notFound);
  });

  it.each(['vi', 'en'] as const)('says leaving, not removing someone, on the viewer\'s own row (%s)', async (lang) => {
    const s = seeded(MINH);
    const id = s.project(LAUNCH);
    twoManagers(s, id);
    renderProjects(<App />, { fake: s.fake, lang, path: `/p/${id}/members` });
    await waitFor(() => expect(document.querySelector('.members')).not.toBeNull());
    const text = TEXT[lang];
    expect(labelsOf(MINH)).toEqual([text.makeMember, text.leaveProject, text.handOverManagement]);
    expect(labelsOf(HOA)).toEqual([text.makeMember, text.removeFromProject]);
    choose(MINH, 'remove');
    await waitFor(() => expect(confirmEl().open).toBe(true));
    expect(confirmEl().heading).toBe(text.leaveProject);
    expect(confirmEl().confirmLabel).toBe(text.leaveProject);
    expect(confirmEl().message).toBe(text.leaveProjectConfirm);
    act(() => { confirmEl().dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' }, bubbles: true })); });
    choose(HOA, 'remove');
    await waitFor(() => expect(confirmEl().message).toBe(t(lang, 'removeMemberConfirm', { name: NAMES[HOA]! })));
    expect(confirmEl().confirmLabel).toBe(text.removeFromProject);
  });

  it('stays on the tab when a manager only steps down', async () => {
    await open(MINH, LAUNCH, { before: twoManagers });
    choose(MINH, 'demote');
    await waitFor(() => expect(names('managers')).toEqual([NAMES[HOA]]));
    expect(window.location.pathname).toMatch(/\/members$/);
  });
});

describe('a closed project', () => {
  it('locks every action with the reason, and the add button too', async () => {
    const { patches } = await open(MINH, Q3);
    for (const id of [MINH, HOA]) {
      expect(menuOf(id)!.items.length).toBeGreaterThan(0);
      for (const item of menuOf(id)!.items) expect(item).toMatchObject({ disabled: true, reason: vi_.projectClosedLocked });
    }
    const add = addButton()!;
    expect(add.getAttribute('aria-disabled')).toBe('true');
    hoverTooltips();
    await settle();
    expect(add.closest('.tip')).not.toBeNull();
    fireEvent.click(add);
    choose(HOA, 'promote');
    await settle();
    expect(picker()).toBeNull();
    expect(patches).toEqual([]);
    expect(document.getElementById(add.getAttribute('aria-describedby')!)!.textContent).toBe(vi_.projectClosedLocked);
  });
});

describe('the menu', () => {
  it('names the person it acts on', async () => {
    await open(MINH);
    expect(menuOf(HOA)!.label).toBe(t('vi', 'memberActions', { name: NAMES[HOA]! }));
  });

  it('speaks English when the module does', async () => {
    const s = seeded(MINH);
    renderProjects(<App />, { fake: s.fake, lang: 'en', path: `/p/${s.project(LAUNCH)}/members` });
    await waitFor(() => expect(document.querySelector('.members')).not.toBeNull());
    expect(labelsOf(HOA)).toEqual([TEXT.en.makeManager, TEXT.en.removeFromProject]);
    expect(screen.getByRole('button', { name: TEXT.en.addMembers })).toBeTruthy();
  });
});
