import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { as, completeTask, idsByKey, readSandbox, signInAs, waitForRun, waitForTask, type WorkTask } from '../src/testing/index.js';

const STATE = {
  version: 1, url: 'https://af.test', id: 's-1', name: 'app', created_at: 'x', expires_at: 'y',
  deploy_key: 'afk_d', owner: 'admin',
  people: { admin: { user_id: 'u-1', token: 'afs_admin' }, agent: { user_id: 'u-2', token: 'afs_agent' } },
  ids: { groups: {}, units: {}, principals: {}, connections: {} },
  install: { parameters: {}, decisions: {} },
  installation: { id: 'i-1', deployment_id: 'd-1', package_id: 'acme/desk', version: '1.0.0', armed: [], objects: { 'entity:case': 'e-1' }, parameters: {} },
};

function dirWith(state: unknown): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-'));
  if (state !== undefined) {
    fs.mkdirSync(path.join(dir, '.agentflow'));
    fs.writeFileSync(path.join(dir, '.agentflow', 'sandbox.json'), typeof state === 'string' ? state : JSON.stringify(state));
  }
  return dir;
}
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('the sandbox test kit', () => {
  it('reads the state file and names deploy --sandbox when it is missing', () => {
    expect(readSandbox(dirWith(STATE)).id).toBe('s-1');
    expect(() => readSandbox(dirWith(undefined))).toThrow(/agentflow-app deploy --sandbox/);
  });

  it.each([
    ['a newer version', { ...STATE, version: 2 }],
    ['no people', { ...STATE, people: undefined }],
    ['a person without a token', { ...STATE, people: { admin: { user_id: 'u-1', token: '' } } }],
    ['an installation that is neither null nor an object', { ...STATE, installation: 'i-1' }],
    ['not JSON', '{'],
  ])('refuses a state file with %s, naming the file and the command', (_name, state) => {
    expect(() => readSandbox(dirWith(state))).toThrow(/sandbox\.json is not a sandbox file this SDK reads.*agentflow-app deploy --sandbox/);
  });

  it('never puts a token in a refusal', () => {
    const state = { ...STATE, version: 2 };
    try {
      readSandbox(dirWith(state));
      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).not.toMatch(/afs_|afk_/);
    }
  });

  it('acts as a person with their token', async () => {
    const fetchFn = vi.fn(async (req: Request) => {
      expect(req.headers.get('authorization')).toBe('Bearer afs_agent');
      expect(new URL(req.url).origin + new URL(req.url).pathname).toBe('https://af.test/api/v1/caller');
      return json(200, { kind: 'user', id: 'u-2' });
    });
    const client = as('agent', { dir: dirWith(STATE), fetch: fetchFn });
    const { data } = await client.GET('/caller');
    expect(data).toMatchObject({ id: 'u-2' });
    expect(() => as('ghost', { dir: dirWith(STATE) })).toThrow("ghost is not one of the sandbox's people: admin, agent");
  });

  it('signs a page in through its request context', async () => {
    const post = vi.fn(async (_url: string, _options: { data: unknown }) => ({ status: () => 204 }));
    await signInAs({ request: { post } }, 'admin', { dir: dirWith(STATE) });
    expect(post).toHaveBeenCalledWith('https://af.test/api/v1/auth/sandbox-session', { data: { token: 'afs_admin' } });
    const refused = vi.fn(async () => ({ status: () => 401 }));
    await expect(signInAs({ request: { post: refused } }, 'admin', { dir: dirWith(STATE) })).rejects.toThrow(/answered 401/);
    await expect(signInAs({ request: { post } }, 'ghost', { dir: dirWith(STATE) })).rejects.toThrow(/ghost is not one of the sandbox's people/);
  });

  it('gives the installed objects by key', () => {
    expect(idsByKey({ dir: dirWith(STATE) })).toEqual({ 'entity:case': 'e-1' });
    expect(() => idsByKey({ dir: dirWith({ ...STATE, installation: null }) })).toThrow(/no installed app/);
  });

  it('types the keys by the package\'s logical keys when given them', () => {
    type Key = 'entity:case' | 'workflow:triage';
    const ids = idsByKey<Key>({ dir: dirWith(STATE) });
    expectTypeOf(ids).toEqualTypeOf<Record<Key, string>>();
    expectTypeOf(idsByKey({ dir: dirWith(STATE) })).toEqualTypeOf<Record<string, string>>();
    expect(ids['entity:case']).toBe('e-1');
  });

  it('waits for a run to settle, and gives up after the timeout', async () => {
    const run = '3f1e2d4c-5b6a-4789-9abc-def012345678';
    let polls = 0;
    const fetchFn = vi.fn(async () => json(200, { id: run, status: ++polls < 3 ? 'running' : 'completed' }));
    const client = as('admin', { dir: dirWith(STATE), fetch: fetchFn });
    await expect(waitForRun(client, run, { interval: 1 })).resolves.toMatchObject({ status: 'completed' });
    const stuck = as('admin', { dir: dirWith(STATE), fetch: vi.fn(async () => json(200, { id: run, status: 'running' })) });
    await expect(waitForRun(stuck, run, { interval: 1, timeout: 20 })).rejects.toThrow(`run ${run} is still running after 20 ms`);
  });

  it('propagates a refused poll as an AgentFlowError', async () => {
    const run = '3f1e2d4c-5b6a-4789-9abc-def012345678';
    const client = as('admin', {
      dir: dirWith(STATE),
      fetch: vi.fn(async () => new Response(JSON.stringify({ type: 'NOT_FOUND', detail: 'no run' }), { status: 404, headers: { 'content-type': 'application/problem+json' } })),
    });
    await expect(waitForRun(client, run, { interval: 1 })).rejects.toMatchObject({ name: 'AgentFlowError', status: 404, code: 'NOT_FOUND' });
  });
});

describe('the task helpers', () => {
  const RECORD = '0b7a3c1e-2d4f-4a6b-8c9d-0e1f2a3b4c5d';
  const line = (id: string, stepKey: string, recordId: string | null, claimed: string | null = null) => ({
    id,
    entity_id: 'task-entity',
    claimed_by_user_id: claimed,
    live: true,
    step: { step: { key: stepKey, label: stepKey }, subject: recordId === null ? null : { entity_id: 'e-1', record_id: recordId }, workflow: { id: 'w-1', name: 'W' } },
  });
  const page = (items: unknown[], next: string | null = null) => json(200, { items, next_cursor: next, prev_cursor: null });

  it('finds the task at the step on the record, reading every page of live work', async () => {
    const seen: URL[] = [];
    let polls = 0;
    const fetchFn = vi.fn(async (req: Request) => {
      const url = new URL(req.url);
      seen.push(url);
      if (url.searchParams.get('cursor') === 'c2') return page([line('t-3', 'review', RECORD), line('t-4', 'approve', RECORD)]);
      if (++polls < 2) return page([line('t-0', 'approve', 'other')]);
      return page([line('t-1', 'approve', 'other'), line('t-2', 'review', RECORD), line('t-5', 'approve', null)], 'c2');
    });
    const client = as('agent', { dir: dirWith(STATE), fetch: fetchFn });
    const task = await waitForTask(client, 'approve', RECORD, { interval: 1 });
    expect(task.id).toBe('t-4');
    expect(seen[0]!.pathname).toBe('/api/v1/work');
    expect(Object.fromEntries(seen[0]!.searchParams)).toEqual({ view: 'all', live: 'true', limit: '200' });
    expect(seen.at(-1)!.searchParams.get('cursor')).toBe('c2');
  });

  it('gives up after the timeout, naming the step and the record', async () => {
    const client = as('agent', { dir: dirWith(STATE), fetch: vi.fn(async () => page([])) });
    await expect(waitForTask(client, 'approve', RECORD, { interval: 1, timeout: 20 })).rejects.toThrow(
      `no approve task on record ${RECORD} after 20 ms`,
    );
  });

  it('claims a task nobody holds, then submits the action with the payload', async () => {
    const calls: { path: string; body: unknown }[] = [];
    const fetchFn = vi.fn(async (req: Request) => {
      calls.push({ path: new URL(req.url).pathname, body: req.method === 'POST' && req.headers.get('content-type') ? await req.json() : undefined });
      return json(200, {});
    });
    const client = as('agent', { dir: dirWith(STATE), fetch: fetchFn });
    await completeTask(client, line('t-1', 'approve', RECORD) as WorkTask, 'approve', { payload: { note: 'ok' } });
    expect(calls.map((c) => c.path)).toEqual([
      '/api/v1/entities/task-entity/records/t-1/work/claim',
      '/api/v1/entities/task-entity/records/t-1/step/submit',
    ]);
    expect(calls[1]!.body).toEqual({ payload: { _action: 'approve', note: 'ok' } });
  });

  it('submits a task already claimed for the person without claiming it, and the action wins over a payload _action', async () => {
    const paths: string[] = [];
    const bodies: unknown[] = [];
    const fetchFn = vi.fn(async (req: Request) => {
      paths.push(new URL(req.url).pathname);
      bodies.push(await req.json());
      return json(200, {});
    });
    const client = as('agent', { dir: dirWith(STATE), fetch: fetchFn });
    await completeTask(client, line('t-1', 'approve', RECORD, 'u-2') as WorkTask, 'reject', { payload: { _action: 'approve', note: 'n' } });
    expect(paths).toEqual(['/api/v1/entities/task-entity/records/t-1/step/submit']);
    expect(bodies).toEqual([{ payload: { note: 'n', _action: 'reject' } }]);
  });

  it('propagates a refused claim as an AgentFlowError, and submits nothing', async () => {
    const paths: string[] = [];
    const fetchFn = vi.fn(async (req: Request) => {
      paths.push(new URL(req.url).pathname);
      return new Response(JSON.stringify({ type: 'WORK_ALREADY_CLAIMED', detail: 'taken' }), { status: 409, headers: { 'content-type': 'application/problem+json' } });
    });
    const client = as('agent', { dir: dirWith(STATE), fetch: fetchFn });
    await expect(completeTask(client, line('t-1', 'approve', RECORD) as WorkTask, 'approve')).rejects.toMatchObject({ code: 'WORK_ALREADY_CLAIMED' });
    expect(paths).toHaveLength(1);
  });
});
