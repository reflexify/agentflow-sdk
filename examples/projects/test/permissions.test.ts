import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createAgentFlowClient, matchOperation, proxyAdapter } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
import { createHttpProjectsApi } from '../src/api/http-projects-api.js';
import type { ProjectsApi } from '../src/api/projects-api.js';
import type { Project, Section, Task, TaskLabel } from '../src/model/types.js';
import { aProject, aSection, aTask } from './support/fixtures.js';
import { TEST_IDS } from './support/ids.js';

const REPO = fileURLToPath(new URL('../../../../', import.meta.url));
const OPENAPI = JSON.parse(readFileSync(`${REPO}openapi.json`, 'utf8')) as { paths: Record<string, Record<string, { operationId?: string }>> };
const CLOSED_SURFACE = readFileSync(`${REPO}docs/design/public-api.md`, 'utf8');

// An installed app's ceiling refuses these (docs/design/public-api.md, the closed surface), and a packaged client
// needs them opened before it can run: Projects asks for them, so this list is what that change has to cover.
const REFUSED_UNDER_A_CEILING = ['get_group', 'list_units', 'resolve_identities', 'upload_attachment'];

const BASE = 'http://projects.memory/agentflow/api';
const uuid = (n: number) => `00000000-0000-4000-8000-${String(900 + n).padStart(12, '0')}`;
const PERSON = uuid(1);
const STAMP = '2026-10-01T00:00:00Z';

const record = (id: string, entityId: string, body: Record<string, unknown> = {}) =>
  ({ id, org_id: 'org', entity_id: entityId, body, version: 1, created_at: STAMP, updated_at: STAMP });
const page = (items: unknown[]) => ({ items, next_cursor: null, prev_cursor: null });

const wireComment = () => ({
  id: uuid(8), author: { id: PERSON, name: 'Minh' }, body: 'Xong', created_at: STAMP, can_edit: true, can_delete: true, files: [], mentions: {},
});

interface Seen { method: string; path: string }

/** AgentFlow as far as the module can tell: every published operation it calls gets an answer of the right shape. */
function recordingFetch() {
  const seen: Seen[] = [];
  const operations: string[] = [];
  const start = { seen: 0 };
  async function fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice('/agentflow/api'.length);
    seen.push({ method: request.method, path });
    const matched = matchOperation(request.method, path);
    const id = matched ? OPENAPI.paths[matched.path]?.[matched.method.toLowerCase()]?.operationId : undefined;
    operations.push(id ?? `unpublished ${request.method} ${path}`);
    const json = (body: unknown) => Response.json(body);
    switch (id) {
      case 'query_records': return json(page([]));
      case 'get_record': case 'create_record': case 'patch_record': case 'apply_list_ops':
        return json(record(path.split('/').at(-1) === 'list-ops' ? path.split('/').at(-2)! : uuid(2), TEST_IDS.entities.task, { title: 'Task', project: uuid(3), status: 'todo' }));
      case 'delete_record': return json({ cleared_count: 1 });
      case 'claim_work': case 'release_work': case 'assign_work': case 'reassign_work': return json({});
      case 'list_work': return json(page(url.searchParams.get('view') === 'claimable'
        ? [{ id: uuid(2), entity_id: TEST_IDS.entities.task, title: 'Task', assigned_group_ids: [], step: null }] : []));
      case 'get_group': return json({ id: TEST_IDS.groups.creators, name: 'Creators', members: [{ id: PERSON }] });
      case 'list_users': return json(page([{ id: PERSON, display_name: 'Minh', email: 'minh@example.test' }]));
      case 'resolve_identities': return json({ users: [{ id: PERSON, name: 'Minh' }], groups: [] });
      case 'list_units': return json(page([{ id: uuid(4), name: 'Unit' }]));
      case 'upload_attachment': case 'get_attachment':
        return json({ id: uuid(5), original_filename: 'a.txt', byte_size: 1, content_type: 'text/plain', uploaded_at: STAMP });
      case 'list_mentioned_in': return json({ items: [], next_cursor: null, prev_cursor: null });
      case 'list_mentions': return json({ groups: [] });
      case 'list_record_comments': return json({ items: [], total: 0, closed: false, can_comment: true });
      case 'create_record_comment': case 'update_record_comment': return json({ comment: wireComment(), unnotified: [] });
      case 'delete_record_comment': return new Response(null, { status: 204 });
      case 'list_mention_people': return json({ items: [{ id: PERSON, name: 'Minh', is_self: true }] });
      case 'download_attachment': return new Response('x', { headers: { 'content-type': 'text/plain' } });
      default:
        return Response.json({ type: 'NOT_FOUND', title: 'Not found', status: 404 }, { status: 404 });
    }
  }
  return { fetch, seen, operations, start };
}

const api = (fetch: (request: Request) => Promise<Response>): ProjectsApi =>
  createHttpProjectsApi({
    client: createAgentFlowClient({ baseUrl: BASE, auth: proxyAdapter(), fetch, maxRetries: 0 }),
    ids: TEST_IDS, apiUrl: (p) => BASE + p, personId: PERSON, now: () => new Date('2026-10-21T03:00:00Z'),
  });

const project: Project = aProject({ id: uuid(3), updatedAt: STAMP });
const section: Section = aSection({ id: uuid(6), project: project.id });
const task: Task = aTask({ id: uuid(2), project: project.id });
const label: TaskLabel = { id: uuid(7), updatedAt: STAMP, name: 'Bug', baseStatus: 'todo', version: 1 } as TaskLabel;
const file = () => new File(['x'], 'a.txt', { type: 'text/plain' });

/** One call per method of the API. The keys must be the interface's own, so a method added without a call fails to compile. */
const CALLS: { [K in keyof ProjectsApi]: (api: ProjectsApi) => Promise<unknown> | unknown } = {
  viewer: (a) => a.viewer(),
  people: (a) => a.people(),
  names: (a) => a.names({ users: [PERSON], groups: [TEST_IDS.groups.users] }),
  projects: (a) => a.projects(['active']),
  project: (a) => a.project(project.id),
  sections: (a) => a.sections(project.id),
  labels: (a) => a.labels(),
  boardTasks: (a) => a.boardTasks({ project: project.id, done: 'hide', cancelled: false }),
  task: (a) => a.task(task.id),
  myWork: (a) => a.myWork(PERSON),
  createTask: (a) => a.createTask({ title: 'T', project: project.id, primary: PERSON, collaborators: [PERSON] }),
  updateTask: (a) => a.updateTask(task, { title: 'T2' }),
  checklist: (a) => a.checklist(task, [{ op: 'add', text: 'x', after: null }]),
  claim: (a) => a.claim(task),
  assign: async (a) => {
    await a.assign(task, PERSON);
    await a.assign({ ...task, holder: PERSON }, PERSON);
  },
  release: (a) => a.release(task),
  deleteTask: (a) => a.deleteTask(task),
  createSection: (a) => a.createSection(project.id, 'S', 1),
  updateSection: (a) => a.updateSection(section, { name: 'S2' }),
  deleteSection: (a) => a.deleteSection(section),
  createProject: (a) => a.createProject({ name: 'P', description: '', managers: [PERSON], members: [], unit: null, defaultGroupBy: 'status' }),
  updateProject: (a) => a.updateProject(project, { name: 'P2' }),
  units: (a) => a.units(),
  createLabel: (a) => a.createLabel('Bug', 'todo'),
  updateLabel: (a) => a.updateLabel(label, { name: 'Bug 2' }),
  deleteLabel: (a) => a.deleteLabel(label),
  upload: (a) => a.upload(file()),
  attachment: (a) => a.attachment(uuid(5)),
  fileUrl: (a) => a.fileUrl(uuid(5)),
  fileBlob: (a) => a.fileBlob(uuid(5)),
  mentionSource: (a) => a.mentionSource({ entity: 'task', record: task.id }, 'vi')('an'),
  mentionedIn: (a) => a.mentionedIn({ entity: 'project', record: project.id }),
  comments: (a) => a.comments(task.id),
  postComment: (a) => a.postComment(task.id, { body: 'Xong', files: [] }),
  editComment: async (a) => {
    const { comment } = await a.postComment(task.id, { body: 'Xong', files: [] });
    await a.editComment(task.id, comment, { body: 'Xong rồi', files: [] });
  },
  deleteComment: (a) => a.deleteComment(task.id, uuid(8)),
  mentionPeople: (a) => a.mentionPeople(task.id, 'mi'),
};

async function recordEverything() {
  const server = recordingFetch();
  const client = api(server.fetch);
  const byMethod = new Map<string, string[]>();
  for (const [name, run] of Object.entries(CALLS)) {
    const before = server.operations.length;
    const result = await run(client);
    // A link the browser follows itself is not a call: its address is what the module hands to an anchor.
    if (name === 'fileUrl') {
      const url = new URL(result as string);
      const path = url.pathname.slice('/agentflow/api'.length);
      const matched = matchOperation('GET', path);
      server.operations.push(matched ? OPENAPI.paths[matched.path]![matched.method.toLowerCase()]!.operationId! : `unpublished GET ${path}`);
    }
    byMethod.set(name, server.operations.slice(before));
  }
  return { operations: server.operations, byMethod };
}

describe('the operations Projects calls', () => {
  it('are all published, and each method of the API calls at least one', async () => {
    const { operations, byMethod } = await recordEverything();
    expect(operations.filter((o) => o.startsWith('unpublished'))).toEqual([]);
    for (const [name, ops] of byMethod) expect(ops.length, name).toBeGreaterThan(0);
  });

  it('include exactly the ones an installed app\'s ceiling refuses, which a packaged client must have opened', async () => {
    const { operations } = await recordEverything();
    const called = new Set(operations);
    for (const name of REFUSED_UNDER_A_CEILING) expect(called.has(name), name).toBe(true);
    // The table's last column lists the refused operations by name, where its middle one explains them.
    const row = CLOSED_SURFACE.match(/^\| `Refused` \(\d+\).*$/m)?.[0] ?? '';
    // "the directory but `list_users`" names the one directory operation that is not refused.
    const listed = (row.split('|').map((cell) => cell.trim()).filter(Boolean).at(-1) ?? '').replace(/but `[a-z_]+`/, '');
    const refusedByPolicy = new Set([...listed.matchAll(/`([a-z][a-z_]+)`/g)].map((m) => m[1]!));
    expect(refusedByPolicy.has('upload_attachment')).toBe(true);
    expect([...called].filter((o) => refusedByPolicy.has(o)).sort()).toEqual([...REFUSED_UNDER_A_CEILING].sort());
  });

  it('never include a group the closed surface refuses whole', async () => {
    const { operations } = await recordEverything();
    expect(operations.filter((o) => /webhook|notification|batch_run/.test(o))).toEqual([]);
  });
});
