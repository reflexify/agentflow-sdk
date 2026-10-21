import type { components } from '@reflexify/agentflow-sdk';
import {
  ENTITY_KEYS, INSTALLED_WORKFLOW, UUID, WORKFLOW_KEYS, type DeskIds, type EntityKey, type WorkflowKey,
} from './contract.js';

export type AppObjectsBody = components['schemas']['AppObjects'];
type AppObject = components['schemas']['AppObject'];

/** The installation parameter that names the support group. */
export const SUPPORT_GROUP_PARAMETER = 'support_group_id';

export const entityLogicalKey = (key: EntityKey): string => `entity:${key}`;
export const workflowLogicalKey = (key: WorkflowKey): string => `workflow:${INSTALLED_WORKFLOW[key]}`;

const own = (kind: 'entity' | 'workflow', logicalKey: string, key: string, id: string): AppObject => ({
  logical_key: logicalKey,
  kind,
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

/** The body a standalone host's server and the in-memory AgentFlow answer: every object live and own. */
export function appObjectsFor(ids: DeskIds): AppObjectsBody {
  return {
    // This answer is built from a config and not read from a ledger, so it has no real revision: the lowest one the published schema allows.
    revision: 1,
    objects: [
      ...ENTITY_KEYS.map((k) => own('entity', entityLogicalKey(k), k, ids.entities[k])),
      ...WORKFLOW_KEYS.map((k) => own('workflow', workflowLogicalKey(k), INSTALLED_WORKFLOW[k], ids.workflows[k])),
    ],
    parameters: { [SUPPORT_GROUP_PARAMETER]: ids.supportGroupId },
  };
}

export type DeskObjects = { ids: DeskIds; missing: [] } | { ids: null; missing: string[] };

/**
 * The ids the desk takes, from what `GET /app/objects` answered. An object counts only while it is live or
 * deprecated and carries a UUID. Anything else is named in `missing`, in a fixed order, and then there are no ids at
 * all: the desk never sends a request with an empty one.
 */
export function deskIdsFrom(body: AppObjectsBody): DeskObjects {
  const objects = Array.isArray(body?.objects) ? body.objects : [];
  const byKey = new Map(objects.map((o) => [o.logical_key, o] as const));
  const missing: string[] = [];
  const idOf = (logicalKey: string): string => {
    const o = byKey.get(logicalKey);
    if (o && (o.state === 'live' || o.state === 'deprecated') && typeof o.id === 'string' && UUID.test(o.id)) return o.id;
    missing.push(logicalKey);
    return '';
  };
  const entities = Object.fromEntries(ENTITY_KEYS.map((k) => [k, idOf(entityLogicalKey(k))])) as Record<EntityKey, string>;
  const workflows = Object.fromEntries(WORKFLOW_KEYS.map((k) => [k, idOf(workflowLogicalKey(k))])) as Record<WorkflowKey, string>;
  // An AgentFlow from before parameters were listed answers without them.
  const group = body?.parameters?.[SUPPORT_GROUP_PARAMETER];
  const supportGroupId = typeof group === 'string' && UUID.test(group) ? group : '';
  if (!supportGroupId) missing.push(`parameters.${SUPPORT_GROUP_PARAMETER}`);
  return missing.length > 0 ? { ids: null, missing } : { ids: { entities, workflows, supportGroupId }, missing: [] };
}
