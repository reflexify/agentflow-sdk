import { describe, expect, it, vi } from 'vitest';
import { bearerAdapter, createAgentFlowClient, mentions } from '../src/index.js';

const ENTITY = '0190f5a0-0000-7000-8000-000000000001';
const RECORD = '0190f5a0-0000-7000-8000-000000000002';
const PERSON = '0190f5a0-0000-7000-8000-000000000003';

function clientAnswering(body: unknown) {
  const seen: URL[] = [];
  const fetchFn = vi.fn(async (req: Request) => {
    seen.push(new URL(req.url));
    return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: bearerAdapter(async () => 't'), fetch: fetchFn });
  return { client, seen };
}

const OTHER = '0190f5a0-0000-7000-8000-000000000004';
const TASK = '0190f5a0-0000-7000-8000-000000000005';

const whole = {
  groups: [
    {
      key: 'people',
      label: 'Người',
      total: null,
      more: null,
      items: [
        { kind: 'user', id: PERSON, name: 'Lê Hoàng Nam', email: 'nam@x.test', is_self: false, will_be_notified: true },
        { kind: 'user', id: RECORD, name: 'Tôi', is_self: true, will_be_notified: false },
      ],
    },
    {
      key: `entity:${ENTITY}`,
      label: 'Task',
      total: 5,
      more: 2,
      items: [
        { kind: 'record', entity_id: ENTITY, id: TASK, label: 'Tích hợp cổng thanh toán', entity_label: 'Task', matched_field: null },
        { kind: 'record', entity_id: ENTITY, id: OTHER, label: 'Quarterly', entity_label: 'Task', matched_field: 'Mô tả' },
      ],
    },
  ],
  unsearched: [],
};

describe('mentions.menu', () => {
  it('asks GET /mentions with the record and what was typed', async () => {
    const { client, seen } = clientAnswering(whole);
    await mentions.menu(client, { entity_id: ENTITY, record_id: RECORD, q: 'ha', limit: 5 });
    expect(seen[0]!.pathname).toBe('/api/v1/mentions');
    expect(Object.fromEntries(seen[0]!.searchParams)).toEqual({ entity_id: ENTITY, record_id: RECORD, q: 'ha', limit: '5' });
  });

  it('offers people as user mentions, saying who will be told and who the caller is', async () => {
    const { client } = clientAnswering(whole);
    const menu = await mentions.menu(client, { entity_id: ENTITY, record_id: RECORD, q: 'ha' });
    const people = menu.groups[0]!;
    expect(people).toMatchObject({ key: 'people', title: 'People', more: null });
    expect(people.items[0]).toEqual({ kind: 'user', ref: `user/${PERSON}`, label: 'Lê Hoàng Nam', meta: 'Will be notified', self: false });
    expect(people.items[1]).toMatchObject({ ref: `user/${RECORD}`, meta: 'You', self: true });
  });

  it('offers each entity as a group of record mentions with the rest behind a more row', async () => {
    const { client } = clientAnswering(whole);
    const menu = await mentions.menu(client, { entity_id: ENTITY, record_id: RECORD, q: 'ha', copy: mentions.VIETNAMESE_MENU_COPY });
    const tasks = menu.groups[1]!;
    expect(tasks.key).toBe(`entity:${ENTITY}`);
    expect(tasks.title).toBe('Task');
    expect(tasks.items[0]).toEqual({
      kind: 'record',
      ref: `record/${ENTITY}/${TASK}`,
      label: 'Tích hợp cổng thanh toán',
      entity_label: 'Task',
      meta: null,
    });
    expect(tasks.items[1]!.meta).toBe('Khớp theo Mô tả');
    expect(tasks.more).toEqual({ count: 2, group: `entity:${ENTITY}`, label: 'Xem thêm 2 trong Task' });
  });

  it('names the entities the menu did not search under one heading, each asking for its group', async () => {
    const past = { ...whole, unsearched: [{ key: `entity:${OTHER}`, id: OTHER, label: 'Nhà cung cấp' }] };
    const { client } = clientAnswering(past);
    const menu = await mentions.menu(client, { entity_id: ENTITY, q: 'ha', copy: mentions.VIETNAMESE_MENU_COPY });
    expect(menu.unsearched).toEqual({ title: 'Tìm trong', scopes: [{ group: `entity:${OTHER}`, label: 'Nhà cung cấp' }] });
    const english = await mentions.menu(clientAnswering(past).client, { entity_id: ENTITY, q: 'ha' });
    expect(english.unsearched?.title).toBe('Search in');
    const none = await mentions.menu(clientAnswering(whole).client, { entity_id: ENTITY, q: 'ha' });
    expect(none).not.toHaveProperty('unsearched');
  });

  it('heads one entity asked for alone with its count of results', async () => {
    const alone = { groups: [{ ...whole.groups[1]!, more: null }] };
    const { client, seen } = clientAnswering(alone);
    const menu = await mentions.menu(client, { entity_id: ENTITY, record_id: RECORD, q: 'ha', group: `entity:${ENTITY}` });
    expect(seen[0]!.searchParams.get('group')).toBe(`entity:${ENTITY}`);
    expect(menu.groups[0]!.title).toBe('Task · 5 results');
    expect(menu.groups[0]!.more).toBeNull();
  });

  it('heads what was mentioned recently, and asks a create form by its parent', async () => {
    const recent = {
      groups: [
        {
          key: 'recent',
          label: 'Recently mentioned',
          total: null,
          more: null,
          items: [{ kind: 'record', entity_id: ENTITY, id: TASK, label: 'Sprint', entity_label: 'Task', matched_field: null }],
        },
      ],
    };
    const { client, seen } = clientAnswering(recent);
    const menu = await mentions.menu(client, { entity_id: ENTITY, parent_record_id: OTHER });
    expect(Object.fromEntries(seen[0]!.searchParams)).toEqual({ entity_id: ENTITY, parent_record_id: OTHER });
    expect(menu.groups[0]).toMatchObject({ key: 'recent', title: 'Recently mentioned' });
    expect(menu.groups[0]!.items[0]!.ref).toBe(`record/${ENTITY}/${TASK}`);
  });
});

describe('mentions.menuSource', () => {
  it('passes entity_id and record_id with every query, and the group asked for', async () => {
    const { client, seen } = clientAnswering(whole);
    const source = mentions.menuSource(client, { entity_id: ENTITY, record_id: RECORD });
    await source('na');
    await source('');
    await source('na', 'people');
    expect(seen.map((u) => u.searchParams.get('entity_id'))).toEqual([ENTITY, ENTITY, ENTITY]);
    expect(seen.map((u) => u.searchParams.get('record_id'))).toEqual([RECORD, RECORD, RECORD]);
    expect(seen.map((u) => u.searchParams.get('q'))).toEqual(['na', null, 'na']);
    expect(seen.map((u) => u.searchParams.get('group'))).toEqual([null, null, 'people']);
  });
});

describe('mentions.mentionedIn', () => {
  const page = {
    items: [
      {
        entity_id: ENTITY,
        record_id: TASK,
        label: 'Tích hợp cổng thanh toán',
        entity_label: 'Task',
        places: [{ kind: 'comment' }, { kind: 'field', key: 'description', label: 'Mô tả' }],
        count: 3,
        last_at: '2026-10-20T10:00:00Z',
        last_author: null,
      },
    ],
    next_cursor: 'abc',
    prev_cursor: null,
  };

  it('asks the record\'s mentioned-in list, with the cursor and limit when given', async () => {
    const { client, seen } = clientAnswering(page);
    const found = await mentions.mentionedIn(client, { entity_id: ENTITY, record_id: RECORD, cursor: 'xyz', limit: 5 });
    expect(seen[0]!.pathname).toBe(`/api/v1/entities/${ENTITY}/records/${RECORD}/mentioned-in`);
    expect(Object.fromEntries(seen[0]!.searchParams)).toEqual({ cursor: 'xyz', limit: '5' });
    expect(found.items[0]!.places).toEqual([{ kind: 'comment' }, { kind: 'field', key: 'description', label: 'Mô tả' }]);
    expect(found.next_cursor).toBe('abc');
  });

  it('sends no query when none is given', async () => {
    const { client, seen } = clientAnswering(page);
    await mentions.mentionedIn(client, { entity_id: ENTITY, record_id: RECORD });
    expect(seen[0]!.search).toBe('');
  });
});

describe('mentions.unnotifiedOf', () => {
  it('reads a null unnotified list as nobody', () => {
    expect(mentions.unnotifiedOf({ unnotified: null })).toEqual([]);
    expect(mentions.unnotifiedOf({})).toEqual([]);
    const one = { user_id: PERSON, name: 'Nam' };
    expect(mentions.unnotifiedOf({ unnotified: [one] })).toEqual([one]);
  });
});
