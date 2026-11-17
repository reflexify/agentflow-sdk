import { describe, expect, it, vi } from 'vitest';
import { AgentFlowError, bearerAdapter, comments, createAgentFlowClient, type PublicEvent } from '../src/index.js';

const ENTITY = '0190f5a0-0000-7000-8000-000000000001';
const RECORD = '0190f5a0-0000-7000-8000-000000000002';
const OTHER = '0190f5a0-0000-7000-8000-000000000003';
const COMMENT = '0190f5a0-0000-7000-8000-000000000004';
const FILE = '0190f5a0-0000-7000-8000-000000000005';

const dto = {
  id: COMMENT,
  author: { id: OTHER, display_name: 'Nam' },
  body: 'Looks right',
  mentions: {},
  files: [],
  can_edit: true,
  can_delete: true,
  created_at: '2026-11-12T08:00:00Z',
  edited_at: null,
};

function clientAnswering(status: number, body: unknown, contentType = 'application/json') {
  const seen: { request: Request; body: string }[] = [];
  const fetchFn = vi.fn(async (req: Request) => {
    seen.push({ request: req, body: await req.clone().text() });
    return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': contentType } });
  });
  const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: bearerAdapter(async () => 't'), fetch: fetchFn });
  return { client, seen };
}

describe('comments.list', () => {
  it('asks the thread with the cursor, before and limit it was given', async () => {
    const { client, seen } = clientAnswering(200, { items: [dto], total: 1, closed: false, can_comment: true });
    const got = await comments.list(client, { entity_id: ENTITY, record_id: RECORD, cursor: 'c1', limit: 10 });
    const url = new URL(seen[0]!.request.url);
    expect(url.pathname).toBe(`/api/v1/entities/${ENTITY}/records/${RECORD}/comments`);
    expect(Object.fromEntries(url.searchParams)).toEqual({ cursor: 'c1', limit: '10' });
    expect(got.items[0]!.id).toBe(COMMENT);

    await comments.list(client, { entity_id: ENTITY, record_id: RECORD, before: 'p1' });
    expect(Object.fromEntries(new URL(seen[1]!.request.url).searchParams)).toEqual({ before: 'p1' });
  });
});

describe('comments.create', () => {
  it('posts the text and files with the caller-chosen Idempotency-Key', async () => {
    const { client, seen } = clientAnswering(201, { comment: dto, unnotified: [] });
    const got = await comments.create(client, {
      entity_id: ENTITY,
      record_id: RECORD,
      body: 'Looks right',
      attachment_ids: [FILE],
      idempotency_key: 'key-1',
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]!.request.method).toBe('POST');
    expect(seen[0]!.request.headers.get('idempotency-key')).toBe('key-1');
    expect(JSON.parse(seen[0]!.body)).toEqual({ body: 'Looks right', attachment_ids: [FILE] });
    expect(got.comment.id).toBe(COMMENT);
  });

  it('sends no attachment_ids when there are none', async () => {
    const { client, seen } = clientAnswering(201, { comment: dto, unnotified: [] });
    await comments.create(client, { entity_id: ENTITY, record_id: RECORD, body: 'Hi', idempotency_key: 'key-2' });
    expect(JSON.parse(seen[0]!.body)).toEqual({ body: 'Hi' });
  });
});

describe('comments.update', () => {
  it('sends If-Match from edited_at, and from created_at while it was never edited', async () => {
    const { client, seen } = clientAnswering(200, { comment: dto, unnotified: [] });
    await comments.update(client, {
      entity_id: ENTITY,
      record_id: RECORD,
      comment: { ...dto, edited_at: '2026-11-12T09:30:00Z' },
      body: 'Edited',
    });
    expect(seen[0]!.request.method).toBe('PATCH');
    expect(new URL(seen[0]!.request.url).pathname).toBe(`/api/v1/entities/${ENTITY}/records/${RECORD}/comments/${COMMENT}`);
    expect(seen[0]!.request.headers.get('if-match')).toBe('2026-11-12T09:30:00Z');
    expect(JSON.parse(seen[0]!.body)).toEqual({ body: 'Edited' });

    await comments.update(client, { entity_id: ENTITY, record_id: RECORD, comment: dto, attachment_ids: [] });
    expect(seen[1]!.request.headers.get('if-match')).toBe('2026-11-12T08:00:00Z');
    expect(JSON.parse(seen[1]!.body)).toEqual({ attachment_ids: [] });
  });

  it('rejects a stale edit with the code STALE_VERSION', async () => {
    const { client } = clientAnswering(
      409,
      { type: 'STALE_VERSION', title: 'Conflict', status: 409, detail: 'the comment changed' },
      'application/problem+json',
    );
    const failure = await comments.update(client, { entity_id: ENTITY, record_id: RECORD, comment: dto, body: 'x' }).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(AgentFlowError);
    expect(failure).toMatchObject({ status: 409, code: 'STALE_VERSION' });
  });
});

describe('comments.remove', () => {
  it('deletes the comment and resolves with nothing', async () => {
    const { client, seen } = clientAnswering(204, undefined);
    await expect(comments.remove(client, { entity_id: ENTITY, record_id: RECORD, comment_id: COMMENT })).resolves.toBeUndefined();
    expect(seen[0]!.request.method).toBe('DELETE');
    expect(new URL(seen[0]!.request.url).pathname).toBe(`/api/v1/entities/${ENTITY}/records/${RECORD}/comments/${COMMENT}`);
  });

  it('rejects when the author check refuses', async () => {
    const { client } = clientAnswering(403, { type: 'COMMENT_NOT_AUTHOR', title: 'Forbidden', status: 403 }, 'application/problem+json');
    await expect(comments.remove(client, { entity_id: ENTITY, record_id: RECORD, comment_id: COMMENT })).rejects.toMatchObject({ code: 'COMMENT_NOT_AUTHOR' });
  });
});

describe('comments.isAbout', () => {
  const record = { entity_id: ENTITY, record_id: RECORD };
  const event = (type: string, kind: string, id: string): PublicEvent => ({
    id: OTHER,
    type,
    occurred_at: '2026-11-12T08:00:00Z',
    org_id: OTHER,
    position: 1,
    subject: { kind, id, entity_id: ENTITY },
    comment_id: COMMENT,
  });

  it.each([
    ['created on the record', event('comment.created', 'record', RECORD), true],
    ['updated on the record', event('comment.updated', 'record', RECORD), true],
    ['deleted on the record', event('comment.deleted', 'record', RECORD), true],
    ['on another record', event('comment.created', 'record', OTHER), false],
    ['not a comment event', event('record.updated', 'record', RECORD), false],
    ['a comment type on a work subject', event('comment.created', 'work', RECORD), false],
  ])('%s: %s', (_what, e, expected) => {
    expect(comments.isAbout(e, record)).toBe(expected);
  });
});
