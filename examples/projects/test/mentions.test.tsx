// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { MentionMenu } from '@reflexify/agentflow-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOA, KHOA, LAN, MAI, MINH } from '../src/api/seed.js';
import { App } from '../src/shell/App.js';
import { TEXT } from '../src/text.js';
import { TEST_NOW, renderProjects } from './support/render.js';
import { LAUNCH, seeded } from './task/support.js';

const vi_ = TEXT.vi;
const HANDOVER = 'Chuẩn bị tài liệu bàn giao';
const RESTRICTED = 'Khảo sát kệ kho mới';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type Chips = { kind: string | null; state: string | null; text: string; href: string | null }[];
type EditorEl = HTMLElement & { value: string; mentions: ((q: string, group?: string) => Promise<MentionMenu>) | null };

const LOGIN = 'Thiết kế màn hình đăng nhập';

async function openTask(
  you: string, title: string, prepare?: (s: ReturnType<typeof seeded>) => void,
  opts: { path?: (s: ReturnType<typeof seeded>, id: string) => string; api?: Parameters<typeof renderProjects>[1] extends infer O ? O extends { api?: infer A } ? A : never : never } = {},
) {
  const s = seeded(you);
  prepare?.(s);
  const id = s.task(title);
  const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path: opts.path ? opts.path(s, id) : `/p/${s.project(LAUNCH)}/t/${id}`, api: opts.api });
  const drawer = await screen.findByRole('dialog', { name: title });
  return { ...s, ...view, id, drawer };
}

const editorOf = (scope: HTMLElement) => scope.querySelector('[data-field="description"] af-rich-editor') as EditorEl;
const chipsOf = (el: HTMLElement): Chips =>
  [...el.shadowRoot!.querySelectorAll<HTMLElement>('.af-mention')].map((c) => ({
    kind: c.getAttribute('data-kind'),
    state: c.getAttribute('data-state'),
    text: c.textContent?.trim() ?? '',
    href: c.querySelector('a')?.getAttribute('href') ?? null,
  }));
const chipsAfter = async (el: HTMLElement, n: number) => {
  await waitFor(() => expect(chipsOf(el)).toHaveLength(n));
  return chipsOf(el);
};
const names = (menu: MentionMenu, group: string) => menu.groups.find((g) => g.key === group)?.items.map((i) => i.label) ?? [];

describe('mentions in the task drawer', () => {
  it('the description editor offers people of the project only', async () => {
    const { drawer } = await openTask(MINH, HANDOVER);
    const el = editorOf(drawer);
    await waitFor(() => expect(el.mentions).toBeTypeOf('function'));
    // The project's manager, member and the administrator can read the task; a man in no project cannot.
    expect(names(await el.mentions!('Khoa'), 'people')).toEqual([]);
    expect(names(await el.mentions!('Tuan'), 'people')).toEqual([]);
    expect(names(await el.mentions!('hoa'), 'people')).toEqual(['Lê Thị Hoa']);
    const all = await el.mentions!('Th');
    expect(names(all, 'people').sort()).toEqual(['Lê Thị Hoa', 'Nguyễn Thị Lan', 'Vũ Thị Mai'].sort());
  });

  it('tells a person who will be notified, and the caller from the rest', async () => {
    const { drawer } = await openTask(MINH, HANDOVER);
    const el = editorOf(drawer);
    await waitFor(() => expect(el.mentions).toBeTypeOf('function'));
    const menu = await el.mentions!('tran');
    const me = menu.groups.find((g) => g.key === 'people')!.items[0]!;
    expect(me.label).toBe('Trần Văn Minh');
    expect(me.meta).toBe('Bạn');
    const hoa = (await el.mentions!('le thi')).groups.find((g) => g.key === 'people')!.items[0]!;
    expect(hoa.meta).toBe('Sẽ nhận thông báo');
  });

  it('finds records by what they are called, without accents, and keeps the unreadable out', async () => {
    const asMinh = await openTask(MINH, HANDOVER);
    const el = editorOf(asMinh.drawer);
    await waitFor(() => expect(el.mentions).toBeTypeOf('function'));
    const found = await el.mentions!('thiet ke man');
    const group = found.groups.find((g) => g.title === 'Task')!;
    expect(group.items.map((i) => i.label)).toEqual(['Thiết kế màn hình đăng nhập']);
    // Minh manages the warehouse project's reader group, Hoa does not: the task there is offered to him alone.
    expect(names(await el.mentions!('khao sat'), 'entity:' + asMinh.fake.ids.entities.task)).toEqual([RESTRICTED]);
    asMinh.unmount();

    const asHoa = await openTask(HOA, LOGIN);
    const hoaEditor = editorOf(asHoa.drawer);
    await waitFor(() => expect(hoaEditor.mentions).toBeTypeOf('function'));
    expect((await hoaEditor.mentions!('khao sat')).groups).toEqual([]);
  });

  it('shows what was mentioned recently when nothing is typed', async () => {
    const { drawer, fake, id, record } = await openTask(MINH, HANDOVER);
    const el = editorOf(drawer);
    await waitFor(() => expect(el.mentions).toBeTypeOf('function'));
    expect(await el.mentions!('')).toEqual({ groups: [] });
    const other = record('Xây dựng API đăng nhập').id;
    const description = `Xem @[x](mention:record/${fake.ids.entities.task}/${other})`;
    const res = await fake.server.fetch(new Request(`http://projects.memory/agentflow/api/entities/${fake.ids.entities.task}/records/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expected_updated_at: record(HANDOVER).updated_at, changes: { description } }),
    }));
    expect(res.status).toBe(200);
    const recent = await el.mentions!('');
    expect(recent.groups.map((g) => g.title)).toEqual(['Nhắc gần đây']);
    expect(names(recent, 'recent')).toEqual(['Xây dựng API đăng nhập']);
  });

  it('draws a person and a record in the description as chips, and a deleted record as struck through', async () => {
    const { drawer } = await openTask(MINH, HANDOVER);
    const chips = await chipsAfter(editorOf(drawer), 4);
    expect(chips.map((c) => [c.kind, c.state ?? 'ok'])).toEqual([['user', 'ok'], ['record', 'ok'], ['record', 'deleted'], ['record', 'ok']]);
    expect(chips[0]!.text).toContain('Lê Thị Hoa');
    expect(chips[1]!.text).toContain(RESTRICTED);
    expect(chips[3]!.text).toContain(LAUNCH);
  });

  it('a restricted chip shows no title', async () => {
    const { drawer, fake, id } = await openTask(HOA, HANDOVER);
    const chips = await chipsAfter(editorOf(drawer), 4);
    expect(chips[1]!.state).toBe('restricted');
    expect(chips[1]!.text).not.toContain(RESTRICTED);
    expect(chips[1]!.href).toBeNull();
    const raw = await fake.server.fetch(new Request(`http://projects.memory/agentflow/api/entities/${fake.ids.entities.task}/records/${id}`));
    expect(await raw.text()).not.toContain(RESTRICTED);
  });

  it('draws a mention the response does not describe as restricted, never with the stored label', async () => {
    const { drawer } = await openTask(MINH, HANDOVER, undefined, {
      api: (a) => ({ ...a, task: async (taskId) => ({ ...(await a.task(taskId)), mentions: {} }) }),
    });
    await waitFor(() => expect(chipsOf(editorOf(drawer)).map((c) => c.state)).toEqual(['restricted', 'restricted', 'restricted', 'restricted']));
    expect(chipsOf(editorOf(drawer)).some((c) => c.text.includes(RESTRICTED))).toBe(false);
  });

  it('a checklist item mention renders as a chip', async () => {
    const { drawer, fake, id } = await openTask(MINH, 'Thiết kế màn hình đăng nhập', (s) => {
      const t = s.record('Thiết kế màn hình đăng nhập');
      const checklist = [{ id: '80000000-0000-4000-8000-000000000042', text: `Nhờ @[Lê Thị Hoa](mention:user/${HOA}) xem`, done: false }];
      s.fake.server.write('task', t.id, { ...t.body, checklist }, MINH);
    });
    const row = await waitFor(() => {
      const r = drawer.querySelector<HTMLElement>('[data-item="80000000-0000-4000-8000-000000000042"]');
      expect(r).toBeTruthy();
      return r!;
    });
    const editor = row.querySelector('af-rich-editor') as HTMLElement;
    const chips = await chipsAfter(editor, 1);
    expect(chips[0]).toMatchObject({ kind: 'user', text: expect.stringContaining('Lê Thị Hoa') });
    expect(row.querySelector('[data-part="check"]')!.getAttribute('aria-label')).toBe('Nhờ @Lê Thị Hoa xem');
    expect(fake.server.records('task').find((r) => r.id === id)).toBeTruthy();
  });

  it('a checklist item mention is a chip to a viewer who only reads', async () => {
    const { drawer } = await openTask(MAI, 'Xây dựng API đăng nhập', (s) => {
      const t = s.record('Xây dựng API đăng nhập');
      const checklist = [{ id: '80000000-0000-4000-8000-000000000043', text: `Hỏi @[Nguyễn Thị Lan](mention:user/${LAN})`, done: false }];
      s.fake.server.write('task', t.id, { ...t.body, checklist }, MINH);
    });
    const row = await waitFor(() => {
      const r = drawer.querySelector<HTMLElement>('[data-item="80000000-0000-4000-8000-000000000043"]');
      expect(r).toBeTruthy();
      return r!;
    });
    const editor = row.querySelector('af-rich-editor') as HTMLElement & { readonly: boolean };
    expect(editor.readonly).toBe(true);
    expect((await chipsAfter(editor, 1))[0]!.text).toContain('Nguyễn Thị Lan');
  });

  it('keeps a mention in the stored text when the description is saved, with the label the server knows', async () => {
    const { drawer, fake, id, stored } = await openTask(MINH, HANDOVER);
    const el = editorOf(drawer);
    fireEvent.focusIn(el);
    const next = `Nhờ @[sai tên](mention:user/${LAN}) rà soát.`;
    act(() => { el.dispatchEvent(new CustomEvent('change', { detail: { value: next } })); });
    await waitFor(() => expect(String(stored(id).description)).toContain('rà soát'));
    expect(stored(id).description).toBe(`Nhờ @[Nguyễn Thị Lan](mention:user/${LAN}) rà soát.`);
    expect(fake.server.records('task').length).toBeGreaterThan(0);
  });

  it('does not blank a stored label when a viewer who cannot read the record saves the text around it', async () => {
    const { drawer, id, stored } = await openTask(HOA, LOGIN, (s) => {
      const t = s.record(LOGIN);
      const target = `${s.fake.ids.entities.task}/${s.record(RESTRICTED).id}`;
      s.fake.server.write('task', t.id, { ...t.body, description: `Đối chiếu @[${RESTRICTED}](mention:record/${target}).` }, MINH);
    });
    await chipsAfter(editorOf(drawer), 1);
    const el = editorOf(drawer);
    fireEvent.focusIn(el);
    const masked = el.value.replace('Đối chiếu', 'So với');
    expect(masked).toContain('mention:record');
    act(() => { el.dispatchEvent(new CustomEvent('change', { detail: { value: masked } })); });
    await waitFor(() => expect(String(stored(id).description)).toContain('So với'));
    expect(String(stored(id).description)).toContain(`@[${RESTRICTED}](mention:`);
  });

  it('keeps the title of a task free of mentions: its field takes plain text', async () => {
    const { drawer } = await openTask(MINH, HANDOVER);
    expect(drawer.querySelector('[data-field="title"] af-rich-editor')).toBeNull();
  });
});

describe('the record panel', () => {
  it('lists the tasks that mention a project, with how and where', async () => {
    const s = seeded(MINH);
    const id = s.project(LAUNCH);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${id}` });
    await waitFor(() => expect(document.querySelector('header af-menu')).toBeTruthy());
    (document.querySelector('header af-menu') as HTMLElement).dispatchEvent(new CustomEvent('select', { detail: { id: 'edit' }, bubbles: true }));
    const drawer = await screen.findByRole('dialog', { name: vi_.editProject });
    const panel = await waitFor(() => {
      const p = drawer.querySelector<HTMLElement>('[data-part="mentioned-in"]');
      expect(p).toBeTruthy();
      return p!;
    });
    expect(within(panel).getByRole('heading').textContent).toBe('Liên quan · Task nhắc đến bản ghi này (1)');
    const row = within(panel).getByRole('button', { name: new RegExp(HANDOVER) });
    expect(row.textContent).toContain('Mô tả');
  });

  it('lists nothing a viewer cannot read, and nothing at all when there is nothing', async () => {
    const s = seeded(MAI);
    const id = s.project('Văn phòng');
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${id}` });
    await waitFor(() => expect(document.querySelector('header af-menu')).toBeTruthy());
    (document.querySelector('header af-menu') as HTMLElement).dispatchEvent(new CustomEvent('select', { detail: { id: 'edit' }, bubbles: true }));
    const drawer = await screen.findByRole('dialog', { name: vi_.editProject });
    await new Promise((r) => setTimeout(r, 30));
    expect(drawer.querySelector('[data-part="mentioned-in"]')).toBeNull();
  });

  it('never reveals a source the viewer cannot read, nor counts it', async () => {
    const s = seeded(MAI);
    const launch = s.project(LAUNCH);
    const target = `record/${s.fake.ids.entities.project}/${launch}`;
    // A task of the warehouse project, which Hoa cannot read, mentions the project twice.
    const hidden = s.record(RESTRICTED);
    s.fake.server.write('task', hidden.id, { ...hidden.body, description: `Một @[x](mention:${target}) và hai @[y](mention:${target}).` }, MAI);
    const ask = async () => {
      const res = await s.fake.server.fetch(new Request(`http://projects.memory/agentflow/api/entities/${s.fake.ids.entities.project}/records/${launch}/mentioned-in`));
      const raw = await res.text();
      return { raw, items: JSON.parse(raw).items as { label: string; count: number }[] };
    };
    const asMai = await ask();
    expect(asMai.items.find((i) => i.label === RESTRICTED)?.count).toBe(2);
    s.fake.server.actAs(HOA);
    const asHoa = await ask();
    expect(asHoa.items.map((i) => i.label)).toEqual([HANDOVER]);
    expect(asHoa.raw).not.toContain(RESTRICTED);
    s.fake.server.actAs(KHOA);
    const denied = await s.fake.server.fetch(new Request(`http://projects.memory/agentflow/api/entities/${s.fake.ids.entities.project}/records/${launch}/mentioned-in`));
    expect(denied.status).toBe(404);
  });
});

describe('the record panel and comments', () => {
  it('lists a task whose comment mentions a project, and counts the comment', async () => {
    const s = seeded(MAI);
    const launch = s.project(LAUNCH);
    const target = `record/${s.fake.ids.entities.project}/${launch}`;
    const task = s.record(RESTRICTED);
    const before = await ask(s, launch);
    expect(before.find((i) => i.label === RESTRICTED)).toBeUndefined();
    await s.fake.server.fetch(new Request(`http://projects.memory/agentflow/api/entities/${s.fake.ids.entities.task}/records/${task.id}/comments`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ body: `Xem @[x](mention:${target}) nhé`, files: [] }),
    }));
    const after = await ask(s, launch);
    const row = after.find((i) => i.label === RESTRICTED)!;
    expect(row.count).toBe(1);
    expect(row.places).toEqual([{ kind: 'comment' }]);
  });
});

async function ask(s: ReturnType<typeof seeded>, record: string) {
  const res = await s.fake.server.fetch(new Request(`http://projects.memory/agentflow/api/entities/${s.fake.ids.entities.project}/records/${record}/mentioned-in`));
  return (await res.json()).items as { label: string; count: number; places: unknown[] }[];
}

describe('what a write stores and what other places draw', () => {
  const patch = (s: ReturnType<typeof seeded>, id: string, changes: object) =>
    s.fake.server.fetch(new Request(`http://projects.memory/agentflow/api/entities/${s.fake.ids.entities.task}/records/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expected_updated_at: s.record(LOGIN).updated_at, changes }),
    }));

  it('stores no label a writer forged for a record they cannot read', async () => {
    const s = seeded(HOA);
    const id = s.task(LOGIN);
    const target = `record/${s.fake.ids.entities.task}/${s.record(RESTRICTED).id}`;
    const res = await patch(s, id, { description: `Xem @[Giả mạo](mention:${target}) và @[Hoa giả](mention:user/${HOA}).` });
    expect(res.status).toBe(200);
    expect(s.stored(id).description).toBe(`Xem @[](mention:${target}) và @[Lê Thị Hoa](mention:user/${HOA}).`);
  });

  it('keeps the label stored at the same place only, not one stored in another field', async () => {
    const s = seeded(MINH);
    const id = s.task(LOGIN);
    const gone = `record/${s.fake.ids.entities.task}/40000000-0000-4000-8000-000000000099`;
    const stored = s.record(LOGIN);
    s.fake.server.write('task', id, {
      ...stored.body, description: `Cũ @[Biên bản cũ](mention:${gone}).`,
      checklist: [{ id: '80000000-0000-4000-8000-000000000051', text: 'Trống', done: false }],
    }, MINH);
    const res = await patch(s, id, { checklist: [{ id: '80000000-0000-4000-8000-000000000051', text: `Thêm @[Biên bản cũ](mention:${gone})`, done: false }] });
    expect(res.status).toBe(200);
    expect((s.stored(id).checklist as { text: string }[])[0]!.text).toBe(`Thêm @[](mention:${gone})`);
    expect(s.stored(id).description).toBe(`Cũ @[Biên bản cũ](mention:${gone}).`);
  });

  it('draws a person an app is not told the names of as restricted, with no name', async () => {
    const { drawer } = await openTask(MINH, HANDOVER, (s) => s.fake.server.withholdNames(true));
    await waitFor(() => expect(chipsOf(editorOf(drawer)).some((c) => c.kind === 'user')).toBe(true));
    const person = chipsOf(editorOf(drawer)).find((c) => c.kind === 'user')!;
    expect(person.state).toBe('restricted');
    expect(person.text).not.toContain('Lê Thị Hoa');
  });

  it('draws a checklist mention on a board card in words, never the token or a hidden title', async () => {
    const s = seeded(HOA);
    const t = s.record(LOGIN);
    const target = `record/${s.fake.ids.entities.task}/${s.record(RESTRICTED).id}`;
    const gone = `record/${s.fake.ids.entities.task}/40000000-0000-4000-8000-000000000099`;
    s.fake.server.write('task', t.id, {
      ...t.body,
      checklist: [
        { id: '80000000-0000-4000-8000-000000000061', text: `Xem @[${RESTRICTED}](mention:${target})`, done: false },
        { id: '80000000-0000-4000-8000-000000000062', text: `Hỏi @[Lê Thị Hoa](mention:user/${HOA}) về @[Cũ](mention:${gone})`, done: false },
      ],
    }, HOA);
    renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${s.project(LAUNCH)}` });
    const list = await waitFor(() => {
      const el = document.querySelector<HTMLElement>(`article[data-task="${t.id}"] [data-part="checklist-items"]`);
      expect(el).toBeTruthy();
      return el!;
    });
    expect([...list.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['Xem @Bản ghi bị hạn chế', 'Hỏi @Lê Thị Hoa về @Bản ghi đã xoá']);
    expect(list.textContent).not.toContain(RESTRICTED);
    expect(list.textContent).not.toContain('mention:');
  });
});
