import type { components } from '@reflexify/agentflow-sdk';

export type AppObjects = components['schemas']['AppObjects'];
type AppObject = components['schemas']['AppObject'];

export interface ProjectIds {
  entities: { project: string; section: string; task: string; task_label: string };
  groups: { users: string; creators: string; admins: string };
}

export const LOGICAL_KEYS = [
  'entity:project', 'entity:section', 'entity:task', 'entity:task_label', 'project_users', 'project_creators', 'project_admins',
] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ENTITY_KEYS = ['project', 'section', 'task', 'task_label'] as const;
const GROUP_PARAMETERS = { users: 'project_users', creators: 'project_creators', admins: 'project_admins' } as const;

const own = (key: string, id: string): AppObject => ({
  logical_key: `entity:${key}`,
  kind: 'entity',
  key,
  id,
  state: 'live',
  source: 'own',
  parent: null,
  feature: null,
  customized: false,
  contract: null,
  contract_version: null,
});

/** The body the in-memory AgentFlow answers: every object live and own. */
export function appObjectsFor(ids: ProjectIds): AppObjects {
  return {
    // Built from ids and not read from a ledger, so it has no real revision: the lowest one the published schema allows.
    revision: 1,
    objects: ENTITY_KEYS.map((k) => own(k, ids.entities[k])),
    parameters: {
      project_users: ids.groups.users,
      project_creators: ids.groups.creators,
      project_admins: ids.groups.admins,
    },
  };
}

/**
 * The ids the module takes, from what `GET /app/objects` answered. An object counts only while it is live or
 * deprecated and carries a UUID, and a parameter only when it is a UUID string. Anything else is named in `missing`, in
 * a fixed order, and then there are no ids at all: the module never sends a request with an empty one.
 */
export function projectIdsFrom(body: AppObjects): { ids: ProjectIds; missing: [] } | { ids: null; missing: string[] } {
  const objects = Array.isArray(body?.objects) ? body.objects : [];
  const byKey = new Map(objects.map((o) => [o.logical_key, o] as const));
  const missing: string[] = [];
  const entityId = (key: (typeof ENTITY_KEYS)[number]): string => {
    const o = byKey.get(`entity:${key}`);
    if (o && (o.state === 'live' || o.state === 'deprecated') && typeof o.id === 'string' && UUID.test(o.id)) return o.id;
    missing.push(`entity:${key}`);
    return '';
  };
  const groupId = (parameter: string): string => {
    const value = body?.parameters?.[parameter];
    if (typeof value === 'string' && UUID.test(value)) return value;
    missing.push(parameter);
    return '';
  };
  const ids: ProjectIds = {
    entities: { project: entityId('project'), section: entityId('section'), task: entityId('task'), task_label: entityId('task_label') },
    groups: { users: groupId(GROUP_PARAMETERS.users), creators: groupId(GROUP_PARAMETERS.creators), admins: groupId(GROUP_PARAMETERS.admins) },
  };
  return missing.length > 0 ? { ids: null, missing } : { ids, missing: [] };
}

/**
 * The ids a standalone host reads from its config file: `{ entities: { project, section, task, task_label }, groups: { users, creators, admins } }`,
 * each a UUID. Throws one error naming every id that is missing or malformed, so one run shows them all.
 */
export function parseProjectIds(json: unknown): ProjectIds {
  const problems: string[] = [];
  const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
  const root = obj(json);
  const id = (where: string, v: unknown): string => {
    if (typeof v === 'string' && UUID.test(v)) return v;
    problems.push(`${where} must be a UUID`);
    return '';
  };
  const ids: ProjectIds = {
    entities: {
      project: id('entities.project', obj(root.entities).project),
      section: id('entities.section', obj(root.entities).section),
      task: id('entities.task', obj(root.entities).task),
      task_label: id('entities.task_label', obj(root.entities).task_label),
    },
    groups: {
      users: id('groups.users', obj(root.groups).users),
      creators: id('groups.creators', obj(root.groups).creators),
      admins: id('groups.admins', obj(root.groups).admins),
    },
  };
  if (problems.length > 0) throw new ProjectIdsError(problems);
  return ids;
}

export class ProjectIdsError extends Error {
  override name = 'ProjectIdsError';
  constructor(readonly problems: string[]) {
    super(problems.join('\n'));
  }
}
