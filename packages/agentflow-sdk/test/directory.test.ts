import { describe, expect, it, vi } from 'vitest';
import { AgentFlowError, bearerAdapter, createAgentFlowClient, directory } from '../src/index.js';
import type { PickerSource } from '../src/index.js';

const U1 = '0190f5a0-0000-7000-8000-0000000000a1';
const U2 = '0190f5a0-0000-7000-8000-0000000000a2';
const G1 = '0190f5a0-0000-7000-8000-0000000000b1';
const G2 = '0190f5a0-0000-7000-8000-0000000000b2';
const P1 = '0190f5a0-0000-7000-8000-0000000000c1';
const P2 = '0190f5a0-0000-7000-8000-0000000000c2';
const P3 = '0190f5a0-0000-7000-8000-0000000000c3';

function clientAnswering(answer: (url: URL) => unknown) {
  const seen: URL[] = [];
  const fetchFn = vi.fn(async (req: Request) => {
    req.signal.throwIfAborted();
    const url = new URL(req.url);
    seen.push(url);
    return new Response(JSON.stringify(answer(url)), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: bearerAdapter(async () => 't'), fetch: fetchFn });
  return { client, seen, fetchFn };
}

const live = () => new AbortController().signal;
const params = (url: URL) => Object.fromEntries(url.searchParams);

const user = (id: string, display_name: string, email: string) => ({ id, display_name, email, is_active: true });
const unit = (id: string, name: string, code: string, parent_id: string | null, archived = false) => ({ id, name, code, parent_id, archived });

describe('directory sources', () => {
  const cases: {
    name: string;
    path: string;
    make: (client: ReturnType<typeof clientAnswering>['client']) => PickerSource<unknown>;
    page: unknown;
    items: unknown[];
  }[] = [
    {
      name: 'people',
      path: '/api/v1/users',
      make: (client) => directory.people(client),
      page: { items: [user(U1, 'Lê Hoàng Nam', 'nam@x.test')], next_cursor: 'c2', prev_cursor: null },
      items: [{ id: U1, name: 'Lê Hoàng Nam', email: 'nam@x.test' }],
    },
    {
      name: 'groups',
      path: '/api/v1/groups',
      make: (client) => directory.groups(client),
      page: { items: [{ id: G1, name: 'Kế toán', member_count: 12 }], next_cursor: 'c2', prev_cursor: null },
      items: [{ value: G1, label: 'Kế toán', description: '12 members' }],
    },
    {
      name: 'units',
      path: '/api/v1/units',
      make: (client) => directory.units(client),
      page: { items: [unit(P1, 'HQ', 'HQ', null)], next_cursor: 'c2', prev_cursor: null },
      items: [{ id: P1, parentId: null, label: 'HQ', code: 'HQ', archived: false }],
    },
  ];

  it.each(cases)('$name asks with what was typed and where the last page ended, and maps the page', async ({ path, make, page, items }) => {
    const { client, seen } = clientAnswering(() => page);
    const found = await make(client)({ q: 'ha', cursor: 'c1', signal: live() });
    expect(seen).toHaveLength(1);
    expect(seen[0]!.pathname).toBe(path);
    expect(params(seen[0]!)).toEqual({ q: 'ha', cursor: 'c1' });
    expect(found).toEqual({ items, next: 'c2' });
  });

  it.each(cases)('$name sends no q or cursor when none is held, and ends with next null when the server names none', async ({ make, page }) => {
    const last = { ...(page as object), next_cursor: null };
    const { client, seen } = clientAnswering(() => last);
    const found = await make(client)({ q: '', cursor: null, signal: live() });
    expect(seen[0]!.search).toBe('');
    expect(found.next).toBeNull();
  });

  it.each([
    ['people', (client: ReturnType<typeof clientAnswering>['client']) => directory.people(client, { limit: 20 })],
    ['groups', (client: ReturnType<typeof clientAnswering>['client']) => directory.groups(client, { limit: 20 })],
    ['units', (client: ReturnType<typeof clientAnswering>['client']) => directory.units(client, { limit: 20 })],
  ] as const)('%s sends limit when given', async (_name, make) => {
    const { client, seen } = clientAnswering(() => ({ items: [], next_cursor: null, prev_cursor: null }));
    await make(client)({ q: '', cursor: null, signal: live() });
    expect(params(seen[0]!)).toEqual({ limit: '20' });
  });

  it.each(cases)('$name rejects with the client\'s abort error and sends nothing once the signal has fired', async ({ make, page }) => {
    const { client, seen } = clientAnswering(() => page);
    const source = make(client);
    const gone = new AbortController();
    gone.abort();
    await expect(source({ q: '', cursor: null, signal: gone.signal })).rejects.toMatchObject({ name: 'AbortError' });
    await expect(source.resolve!([U1], gone.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(seen).toEqual([]);
  });
});

describe('directory.people', () => {
  it('forwards its filters with the query', async () => {
    const { client, seen } = clientAnswering(() => ({ items: [], next_cursor: null, prev_cursor: null }));
    const source = directory.people(client, { group_id: `${G1},${G2}`, not_group_id: G2, unit_id: P1, role_id: 'r1', is_active: false, limit: 5 });
    await source({ q: 'na', cursor: 'c1', signal: live() });
    expect(params(seen[0]!)).toEqual({ q: 'na', cursor: 'c1', group_id: `${G1},${G2}`, not_group_id: G2, unit_id: P1, role_id: 'r1', is_active: 'false', limit: '5' });
  });

  it('names a person by email when an installed app is not told the display name', async () => {
    const { client } = clientAnswering(() => ({ items: [{ id: U1, email: 'nam@x.test' }, { id: U2 }], next_cursor: null, prev_cursor: null }));
    const found = await directory.people(client)({ q: '', cursor: null, signal: live() });
    expect(found.items).toEqual([
      { id: U1, name: 'nam@x.test', email: 'nam@x.test' },
      { id: U2, name: U2, email: null },
    ]);
  });

  it('resolves ids through the identity names, naming the users returned', async () => {
    const { client, seen } = clientAnswering(() => ({ users: [{ id: U1, name: 'Nam' }, { id: U2, name: 'Lan' }], groups: [], service_principals: [] }));
    const found = await directory.people(client).resolve!([U1, U2], live());
    expect(seen[0]!.pathname).toBe('/api/v1/identities');
    expect(params(seen[0]!)).toEqual({ user_ids: `${U1},${U2}` });
    expect(found).toEqual([{ id: U1, name: 'Nam' }, { id: U2, name: 'Lan' }]);
  });
});

describe('directory.groups', () => {
  const page = (counts: number[]) => ({
    items: counts.map((member_count, i) => ({ id: `g${i}`, name: `G${i}`, member_count })),
    next_cursor: null,
    prev_cursor: null,
  });

  it('describes a group by its members in English: 1 member, 12 members', async () => {
    const { client } = clientAnswering(() => page([1, 12, 0]));
    const found = await directory.groups(client)({ q: '', cursor: null, signal: live() });
    expect(found.items.map((o) => o.description)).toEqual(['1 member', '12 members', '0 members']);
  });

  it('words the members count with the members option', async () => {
    const { client } = clientAnswering(() => page([1, 12]));
    const found = await directory.groups(client, { members: (n) => `${n} thành viên` })({ q: '', cursor: null, signal: live() });
    expect(found.items.map((o) => o.description)).toEqual(['1 thành viên', '12 thành viên']);
  });

  it('resolves ids through the identity names, naming the groups returned', async () => {
    const { client, seen } = clientAnswering(() => ({ users: [], groups: [{ id: G1, name: 'Kế toán' }], service_principals: [] }));
    const found = await directory.groups(client).resolve!([G1, G2], live());
    expect(seen[0]!.pathname).toBe('/api/v1/identities');
    expect(params(seen[0]!)).toEqual({ group_ids: `${G1},${G2}` });
    expect(found).toEqual([{ value: G1, label: 'Kế toán' }]);
  });
});

describe('directory.units', () => {
  it('forwards include_archived, and reads a unit an installed app is told little of', async () => {
    const { client, seen } = clientAnswering(() => ({
      items: [unit(P2, 'Phòng A', 'A', P1, true), { id: P3 }],
      next_cursor: null,
      prev_cursor: null,
    }));
    const found = await directory.units(client, { include_archived: true })({ q: '', cursor: null, signal: live() });
    expect(params(seen[0]!)).toEqual({ include_archived: 'true' });
    // A unit the server says nothing of is not claimed to be live: `archived` is absent, not false.
    expect(found.items).toStrictEqual([
      { id: P2, parentId: P1, label: 'Phòng A', code: 'A', archived: true },
      { id: P3, parentId: null, label: P3, code: null },
    ]);
  });

  describe('resolve', () => {
    const everything = [unit(P1, 'HQ', 'HQ', null), unit(P2, 'Sales', 'S', P1), unit(P3, 'Old', 'O', P1, true)];
    const pagesOfOne = (url: URL) => {
      const at = Number(url.searchParams.get('cursor') ?? 0);
      return { items: [everything[at]], next_cursor: at + 1 < everything.length ? String(at + 1) : null, prev_cursor: null };
    };

    it('stops at the page that holds the last id, asking with include_archived and the same limit', async () => {
      const { client, seen } = clientAnswering(pagesOfOne);
      const found = await directory.units(client, { limit: 1 }).resolve!([P2], live());
      expect(seen.map((u) => u.searchParams.get('cursor'))).toEqual([null, '1']);
      expect(seen.every((u) => u.pathname === '/api/v1/units' && u.searchParams.get('include_archived') === 'true' && u.searchParams.get('limit') === '1')).toBe(true);
      expect(found).toEqual([{ id: P2, parentId: P1, label: 'Sales', code: 'S', archived: false }]);
    });

    it('leaves out an id no page holds, and ends at the last page', async () => {
      const { client, seen } = clientAnswering(pagesOfOne);
      const found = await directory.units(client).resolve!([P3, 'missing'], live());
      expect(seen).toHaveLength(3);
      expect(found.map((n) => n.id)).toEqual([P3]);
    });

    it('lists archived units even when the source does not', async () => {
      const { client, seen } = clientAnswering(pagesOfOne);
      await directory.units(client, { include_archived: false }).resolve!([P1], live());
      expect(seen[0]!.searchParams.get('include_archived')).toBe('true');
    });

    it('sends no further page once the signal fires mid-walk', async () => {
      const gone = new AbortController();
      const { client, seen } = clientAnswering((url) => {
        gone.abort();
        return pagesOfOne(url);
      });
      await expect(directory.units(client).resolve!([P3], gone.signal)).rejects.toMatchObject({ name: 'AbortError' });
      expect(seen).toHaveLength(1);
    });

    it('asks nothing for no ids', async () => {
      const { client, fetchFn } = clientAnswering(pagesOfOne);
      expect(await directory.units(client).resolve!([], live())).toEqual([]);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });
});

describe('a refused request', () => {
  it('rejects with the client\'s error', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify({ type: 'APP_CEILING_DENIED', title: 'Forbidden', status: 403, detail: 'no' }), { status: 403, headers: { 'content-type': 'application/problem+json' } }));
    const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: bearerAdapter(async () => 't'), fetch: fetchFn });
    await expect(directory.groups(client)({ q: '', cursor: null, signal: live() })).rejects.toBeInstanceOf(AgentFlowError);
  });
});

describe('directory.myUnits', () => {
  it('lists the caller\'s placements, keeping a withheld name and code null', async () => {
    const items = [
      { id: P1, name: 'Court A', code: null, primary: true },
      { id: P2, name: null, code: null, primary: false },
    ];
    const { client, seen } = clientAnswering(() => ({ items }));
    await expect(directory.myUnits(client, live())).resolves.toEqual(items);
    expect(seen.map((url) => url.pathname)).toEqual(['/api/v1/me/units']);
  });
});
