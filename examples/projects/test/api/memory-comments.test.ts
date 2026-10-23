import { describe, expect, it } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { isProjectsError } from '../../src/api/projects-api.js';
import { HOA, KHOA, LAN, MAI, MINH, TUAN } from '../../src/api/seed.js';

const NOW = new Date('2026-10-21T03:00:00Z');
const FLOW = 'Thiết kế luồng thanh toán';

function as(you: string) {
  const fake = createFakeProjects({ you, now: () => NOW });
  const id = (entity: 'task' | 'project' | 'section', key: string, value: string) =>
    fake.server.records(entity).find((r) => r.body[key] === value)!.id;
  const get = (path: string, init?: RequestInit) => fake.server.fetch(new Request(`http://projects.memory/agentflow/api${path}`, init));
  const flow = id('task', 'title', FLOW);
  const url = (task = flow) => `/entities/${fake.ids.entities.task}/records/${task}/comments`;
  return { fake, id, get, flow, url };
}

const code = async (res: Response) => ((await res.json()) as { type: string }).type;
const post = (body: unknown, headers: Record<string, string> = {}): RequestInit => ({
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
});

describe('the in-memory AgentFlow\'s comments', () => {
  it('reads a thread oldest first, with the viewer\'s own rights on each comment', async () => {
    const { get, url } = as(MINH);
    const page = (await (await get(url())).json()) as { items: { body: string; can_edit: boolean; can_delete: boolean; author: { name: string } }[]; closed: boolean; can_comment: boolean };
    expect(page.items.map((c) => [c.author.name, c.can_edit, c.can_delete])).toEqual([['Trần Văn Minh', true, true], ['Lê Thị Hoa', false, true]]);
    expect(page.items[0]!.body).toContain('@[Lê Thị Hoa](mention:user/');
    expect([page.closed, page.can_comment]).toEqual([false, true]);
  });

  it('answers the newest page first and the older one from prev_cursor', async () => {
    const { get, url } = as(MINH);
    const newest = (await (await get(`${url()}?limit=1`)).json()) as { items: { id: string; body: string }[]; total: number; prev_cursor?: string; next_cursor?: string };
    expect(newest.items.map((c) => c.body)).toEqual(['Mình đã chuẩn bị xong giao diện, chờ tài khoản là nối vào được.']);
    expect(newest.total).toBe(2);
    expect(newest.next_cursor).toBeUndefined();
    const older = (await (await get(`${url()}?limit=1&before=${newest.prev_cursor}`)).json()) as { items: { body: string }[]; prev_cursor?: string; next_cursor?: string };
    expect(older.items[0]!.body).toContain('ngân hàng hẹn');
    expect(older.prev_cursor).toBeUndefined();
    expect(older.next_cursor).toBeTruthy();
    expect(await code(await get(`${url()}?before=nope`))).toBe('CURSOR_INVALID');
    expect(await code(await get(`${url()}?limit=0`))).toBe('INVALID_QUERY_PARAMETER');
    expect((await get(`${url()}?limit=500`)).status).toBe(200);
    const both = await get(`${url()}?cursor=${newest.items[0]!.id}&before=${newest.items[0]!.id}`);
    expect(both.status).toBe(400);
  });

  it('closes a frozen task\'s thread to every write, and says so on read', async () => {
    const { get, url, id } = as(HOA);
    const frozen = id('task', 'title', 'Báo cáo ngân sách quý 3');
    const page = (await (await get(url(frozen))).json()) as { closed: boolean; can_comment: boolean; items: { can_edit: boolean; can_delete: boolean }[] };
    expect([page.closed, page.can_comment]).toEqual([true, false]);
    expect(page.items.every((c) => !c.can_edit && !c.can_delete)).toBe(true);
    const res = await get(url(frozen), post({ body: 'Muộn rồi' }));
    expect([res.status, await code(res)]).toEqual([409, 'COMMENTS_CLOSED']);
  });

  it('refuses a closed thread before it reads the body, and counts characters rather than UTF-16 units', async () => {
    const { get, url, id } = as(HOA);
    const frozen = id('task', 'title', 'Báo cáo ngân sách quý 3');
    expect(await code(await get(url(frozen), post({ body: 5 })))).toBe('COMMENTS_CLOSED');
    const open = as(MINH);
    expect((await open.get(open.url(), post({ body: '😀'.repeat(10_000) }))).status).toBe(201);
    expect(await code(await open.get(open.url(), post({ body: '😀'.repeat(10_001) })))).toBe('COMMENT_TOO_LONG');
  });

  it('takes no comments on an entity the package leaves them off', async () => {
    const { get, id, fake } = as(MINH);
    const section = id('section', 'name', 'Thiết kế');
    const res = await get(`/entities/${fake.ids.entities.section}/records/${section}/comments`);
    expect([res.status, await code(res)]).toEqual([409, 'COMMENTS_DISABLED']);
  });

  it('answers a record the caller cannot read as not found', async () => {
    const { get, url, id } = as(TUAN);
    const res = await get(url(id('task', 'title', 'Gia hạn hợp đồng thuê văn phòng')));
    expect(res.status).toBe(404);
  });

  it('refuses an empty comment and one with a file that does not exist', async () => {
    const { get, url } = as(MINH);
    expect(await code(await get(url(), post({ body: '   ' })))).toBe('COMMENT_EMPTY');
    const missing = await get(url(), post({ body: 'x', attachment_ids: ['00000000-0000-4000-8000-0000000000ff'] }));
    expect(missing.status).toBe(422);
  });

  it('lets the author alone edit, against the version they read', async () => {
    const mine = as(MINH);
    const { items } = (await (await mine.get(mine.url())).json()) as { items: { id: string; body: string; created_at: string }[] };
    const [first, second] = items;
    const patch = (version: string | null, body: string): RequestInit => ({
      method: 'PATCH', headers: { 'content-type': 'application/json', ...(version ? { 'if-match': version } : {}) }, body: JSON.stringify({ body }),
    });
    const missing = await mine.get(`${mine.url()}/00000000-0000-4000-8000-0000000000ee`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: '{}' });
    expect(missing.status).toBe(428);
    const empty = await mine.get(`${mine.url()}/${first!.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'if-match': first!.created_at }, body: '{}' });
    expect(empty.status).toBe(422);
    const noVersion = await mine.get(`${mine.url()}/${first!.id}`, patch(null, 'x'));
    expect(noVersion.status).toBe(428);
    const stale = await mine.get(`${mine.url()}/${first!.id}`, patch('2020-01-01T00:00:00Z', 'x'));
    expect([stale.status, await code(stale)]).toEqual([409, 'STALE_VERSION']);
    const notMine = await mine.get(`${mine.url()}/${second!.id}`, patch(second!.created_at, 'x'));
    expect([notMine.status, await code(notMine)]).toEqual([403, 'COMMENT_NOT_AUTHOR']);
    const ok = await mine.get(`${mine.url()}/${first!.id}`, patch(first!.created_at, 'Sửa xong'));
    expect(ok.status).toBe(200);
    const edited = (await ok.json()) as { comment: { body: string; edited_at: string }; unnotified: unknown[] };
    expect(edited.comment.body).toBe('Sửa xong');
    expect(edited.comment.edited_at).toBeTruthy();
    expect(edited.unnotified).toEqual([]);
    // The new version is the one to send next.
    const again = await mine.get(`${mine.url()}/${first!.id}`, patch(first!.created_at, 'Lại'));
    expect(again.status).toBe(409);
  });

  it('keeps a stored label when an edit sends a token with none', async () => {
    const { fake, flow, get, url } = as(MINH);
    const { comments } = await fake.api.comments(flow);
    const first = comments[0]!;
    const blank = first.body.replace(/@\[[^\]]*\]/, '@[]');
    const res = await get(`${url()}/${first.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'if-match': first.createdAt }, body: JSON.stringify({ body: blank }) });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { comment: { body: string } }).comment.body).toContain('@[Lê Thị Hoa](mention:user/');
  });

  it('lets whoever may update the task delete another\'s comment, and no one else', async () => {
    const admin = as(LAN);
    const { comments } = await admin.fake.api.comments(admin.flow);
    const denied = await admin.get(`${admin.url()}/${comments[0]!.id}`, { method: 'DELETE' });
    expect([denied.status, await code(denied)]).toEqual([403, 'COMMENT_NOT_AUTHOR']);
    const member = as(HOA);
    const gone = await member.get(`${member.url()}/${comments[0]!.id}`, { method: 'DELETE' });
    expect(gone.status).toBe(204);
    expect((await member.fake.api.comments(member.flow)).comments).toHaveLength(1);
    expect((await member.get(`${member.url()}/${comments[0]!.id}`, { method: 'DELETE' })).status).toBe(404);
  });

  it('names the people a comment mentions who cannot read the task, and only the newly mentioned on an edit', async () => {
    const { fake, flow } = as(MINH);
    const body = `Nhờ @[Khoa](mention:user/${KHOA}) và @[Mai](mention:user/${MAI})`;
    const done = await fake.api.postComment(flow, { body, files: [] });
    expect(done.unnotified).toEqual([{ id: KHOA, name: 'Đỗ Đăng Khoa' }]);
    const again = await fake.api.editComment(flow, done.comment, { body: `${body} và @[Tuấn](mention:user/${TUAN})`, files: [] });
    expect(again.unnotified).toEqual([{ id: TUAN, name: 'Phạm Minh Tuấn' }]);
  });

  it('answers a repeated create with the same Idempotency-Key with the first comment, not a second one', async () => {
    const { fake, flow } = as(MINH);
    const before = (await fake.api.comments(flow)).total;
    const first = await fake.api.postComment(flow, { body: 'Một lần thôi', files: [], key: 'draft-1' });
    const again = await fake.api.postComment(flow, { body: 'Một lần thôi', files: [], key: 'draft-1' });
    expect(again.comment.id).toBe(first.comment.id);
    const other = await fake.api.postComment(flow, { body: 'Một lần thôi', files: [], key: 'draft-2' });
    expect(other.comment.id).not.toBe(first.comment.id);
    expect((await fake.api.comments(flow)).total).toBe(before + 2);
  });

  it('draws a person\'s current name and empties the label of a record the reader cannot read', async () => {
    const { fake, flow, id } = as(MINH);
    const office = id('task', 'title', 'Gia hạn hợp đồng thuê văn phòng');
    const done = await fake.api.postComment(flow, {
      body: `@[Tên cũ](mention:user/${HOA}) @[Mật](mention:record/${fake.ids.entities.task}/${office})`, files: [],
    });
    expect(done.comment.body).toBe(`@[Lê Thị Hoa](mention:user/${HOA}) @[](mention:record/${fake.ids.entities.task}/${office})`);
    expect(done.comment.mentions[`record/${fake.ids.entities.task}/${office}`]).toEqual({ state: 'restricted', kind: 'record' });
  });

  it('removes a task\'s comments with the task', async () => {
    const { fake, flow, get, url } = as(MINH);
    const task = (await fake.api.task(flow));
    await fake.api.deleteTask(task);
    expect((await get(url())).status).toBe(404);
  });
});

describe('the in-memory people menu', () => {
  it('offers people who may read the task, matching the start of a word, accents ignored', async () => {
    const { fake, flow } = as(MINH);
    expect((await fake.api.mentionPeople(flow, 'thi')).map((p) => p.name)).toEqual(['Nguyễn Thị Lan', 'Lê Thị Hoa', 'Vũ Thị Mai']);
    expect((await fake.api.mentionPeople(flow, 'tuan')).map((p) => p.name)).toEqual([]);
    expect((await fake.api.mentionPeople(flow, 'trần vă')).map((p) => p.name)).toEqual(['Trần Văn Minh']);
    expect((await fake.api.mentionPeople(flow, '')).length).toBeLessThanOrEqual(8);
  });

  it('bounds the limit to 1..8 and answers an unreadable task as not found', async () => {
    const { get, fake, flow } = as(MINH);
    const base = `/mentions/people?entity_id=${fake.ids.entities.task}&record_id=${flow}`;
    expect((await get(`${base}&limit=9`)).status).toBe(400);
    expect((await get(`${base}&limit=0`)).status).toBe(400);
    expect((await get(`${base}&limit=3`)).status).toBe(200);
    const outsider = as(TUAN);
    const office = outsider.id('task', 'title', 'Gia hạn hợp đồng thuê văn phòng');
    expect((await outsider.get(`/mentions/people?entity_id=${outsider.fake.ids.entities.task}&record_id=${office}`)).status).toBe(404);
  });

  it('reads a record of another entity under the task route as not found, which the section treats as nothing to show', async () => {
    const { fake } = as(MINH);
    const section = fake.server.records('section')[0]!.id;
    await expect(fake.api.comments(section)).rejects.toSatisfy((e) => isProjectsError(e, 'not_found'));
  });
});
