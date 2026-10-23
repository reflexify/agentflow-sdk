// The keys the desk's package fixes. Ids differ per org: the module reads them from its installation, and a
// standalone host from its desk config.

import type { EntityKey as PackageEntityKey, WorkflowKey as PackageWorkflowKey } from '../src/generated/app.js';

export const ENTITY_KEYS = ['ticket', 'reply', 'note', 'contact', 'canned_reply', 'autopilot_rule'] as const satisfies readonly PackageEntityKey[];
export type EntityKey = (typeof ENTITY_KEYS)[number];

export const WORKFLOW_KEYS = ['handling', 'draft_reply', 'send_reply', 'accept_message', 'move_message'] as const;
export type WorkflowKey = (typeof WORKFLOW_KEYS)[number];

/** Handling's four "Handle ticket" steps, one per priority pool. */
export const HANDLING_STEPS = ['handle_urgent', 'handle_high', 'handle_normal', 'handle_low'] as const;

export interface DeskIds {
  entities: Record<EntityKey, string>;
  workflows: Record<WorkflowKey, string>;
  supportGroupId: string;
}

/** Each workflow's local key in the package: the part of its logical key (`workflow:<key>`) that `GET /app/objects` lists it under. */
export const INSTALLED_WORKFLOW = {
  handling: 'support_handling',
  draft_reply: 'support_draft_reply',
  send_reply: 'support_send_reply',
  accept_message: 'support_accept_message',
  move_message: 'support_move_message',
} as const satisfies Record<WorkflowKey, PackageWorkflowKey>;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads a standalone host's desk config (`{entities, workflows, support_group_id}`). Lists every
 * missing or malformed id, so one run of `check-setup` shows them all. */
export function parseDeskIds(json: unknown): { ids?: DeskIds; problems: string[] } {
  const problems: string[] = [];
  const obj = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});
  const root = obj(json);
  const id = (where: string, v: unknown) => {
    if (typeof v === 'string' && UUID.test(v)) return v;
    problems.push(`${where} must be a UUID`);
    return '';
  };
  const entities = Object.fromEntries(
    ENTITY_KEYS.map((k) => [k, id(`entities.${k}`, obj(root.entities)[k])]),
  ) as Record<EntityKey, string>;
  const workflows = Object.fromEntries(
    WORKFLOW_KEYS.map((k) => [k, id(`workflows.${INSTALLED_WORKFLOW[k]}`, obj(root.workflows)[INSTALLED_WORKFLOW[k]])]),
  ) as Record<WorkflowKey, string>;
  const supportGroupId = id('support_group_id', root.support_group_id);
  return problems.length ? { problems } : { ids: { entities, workflows, supportGroupId }, problems };
}
