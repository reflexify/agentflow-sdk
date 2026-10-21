import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  appObjectsFor, deskIdsFrom, entityLogicalKey, workflowLogicalKey, type AppObjectsBody,
} from '../../shared/app-objects.js';
import { ENTITY_KEYS, WORKFLOW_KEYS } from '../../shared/contract.js';
import { DEMO_IDS } from '../../src/api/demo-ids.js';

/** The key of every object of one kind in the desk's package, without its kind. */
function packageKeys(kind: 'entity' | 'workflow'): string[] {
  const manifest = JSON.parse(readFileSync(new URL('../../package/manifest.json', import.meta.url), 'utf8')) as {
    objects: { key: string; kind: string }[];
  };
  return manifest.objects.filter((o) => o.kind === kind).map((o) => o.key.slice(kind.length + 1));
}

describe('the keys the desk ships with', () => {
  it('names each object by the key the ticket app installs it under', () => {
    expect(entityLogicalKey('canned_reply')).toBe('entity:canned_reply');
    expect(workflowLogicalKey('handling')).toBe('workflow:support_handling');
    expect(workflowLogicalKey('move_message')).toBe('workflow:support_move_message');
  });

  it('matches the keys in the ticket app\'s package', () => {
    const entities = packageKeys('entity');
    for (const k of ENTITY_KEYS) expect(entities, k).toContain(entityLogicalKey(k).slice('entity:'.length));
    const workflows = packageKeys('workflow');
    for (const k of WORKFLOW_KEYS) expect(workflows, k).toContain(workflowLogicalKey(k).slice('workflow:'.length));
  });
});

describe('appObjectsFor', () => {
  it('lists every object live and the app\'s own, and the support group as a parameter', () => {
    const body = appObjectsFor(DEMO_IDS);
    expect(body.objects.map((o) => [o.logical_key, o.kind, o.key, o.id, o.state, o.source])).toEqual([
      ['entity:ticket', 'entity', 'ticket', DEMO_IDS.entities.ticket, 'live', 'own'],
      ['entity:reply', 'entity', 'reply', DEMO_IDS.entities.reply, 'live', 'own'],
      ['entity:note', 'entity', 'note', DEMO_IDS.entities.note, 'live', 'own'],
      ['entity:contact', 'entity', 'contact', DEMO_IDS.entities.contact, 'live', 'own'],
      ['entity:canned_reply', 'entity', 'canned_reply', DEMO_IDS.entities.canned_reply, 'live', 'own'],
      ['entity:autopilot_rule', 'entity', 'autopilot_rule', DEMO_IDS.entities.autopilot_rule, 'live', 'own'],
      ['workflow:support_handling', 'workflow', 'support_handling', DEMO_IDS.workflows.handling, 'live', 'own'],
      ['workflow:support_draft_reply', 'workflow', 'support_draft_reply', DEMO_IDS.workflows.draft_reply, 'live', 'own'],
      ['workflow:support_send_reply', 'workflow', 'support_send_reply', DEMO_IDS.workflows.send_reply, 'live', 'own'],
      ['workflow:support_accept_message', 'workflow', 'support_accept_message', DEMO_IDS.workflows.accept_message, 'live', 'own'],
      ['workflow:support_move_message', 'workflow', 'support_move_message', DEMO_IDS.workflows.move_message, 'live', 'own'],
    ]);
    expect(body.parameters).toEqual({ support_group_id: DEMO_IDS.supportGroupId });
  });

  it('reports a revision the published schema allows: no lower than 1', () => {
    expect(appObjectsFor(DEMO_IDS).revision).toBeGreaterThanOrEqual(1);
  });
});

describe('deskIdsFrom', () => {
  it('reads back exactly the ids it was given', () => {
    expect(deskIdsFrom(appObjectsFor(DEMO_IDS))).toEqual({ ids: DEMO_IDS, missing: [] });
  });

  it('reads an installation as AgentFlow lists it: other kinds of object, any order, a deprecated one, other parameters', () => {
    const body = appObjectsFor(DEMO_IDS);
    const field = { ...body.objects[0]!, logical_key: 'entity_field:ticket/subject', kind: 'entity_field' as const, id: null, key: null, parent: 'entity:ticket' };
    const objects = [...body.objects].reverse()
      .map((o) => (o.logical_key === 'workflow:support_draft_reply' ? { ...o, state: 'deprecated' as const } : o));
    const parameters = { ...body.parameters, inbound_domain: 'support.example.com' };
    expect(deskIdsFrom({ ...body, objects: [field, ...objects], parameters })).toEqual({ ids: DEMO_IDS, missing: [] });
  });

  it('names what is missing, in a fixed order, and gives no ids at all when anything is', () => {
    const body = appObjectsFor(DEMO_IDS);
    const objects = body.objects
      // gone from the listing
      .filter((o) => o.logical_key !== 'entity:note')
      // an optional feature that is off: no key, no id
      .map((o) => (o.logical_key === 'entity:canned_reply' ? { ...o, state: 'off' as const, id: null, key: null } : o))
      // an id that is not one
      .map((o) => (o.logical_key === 'workflow:support_send_reply' ? { ...o, id: 'not-a-uuid' } : o));
    expect(deskIdsFrom({ ...body, objects, parameters: {} })).toEqual({
      ids: null,
      missing: ['entity:note', 'entity:canned_reply', 'workflow:support_send_reply', 'parameters.support_group_id'],
    });
  });

  it('counts an off object as missing even when it still carries an id', () => {
    const body = appObjectsFor(DEMO_IDS);
    const objects = body.objects.map((o) => (o.logical_key === 'entity:autopilot_rule' ? { ...o, state: 'off' as const } : o));
    expect(deskIdsFrom({ ...body, objects }).missing).toEqual(['entity:autopilot_rule']);
  });

  it('refuses a support group that is not a UUID, and names everything for a body of another shape', () => {
    expect(deskIdsFrom({ ...appObjectsFor(DEMO_IDS), parameters: { support_group_id: 42 } }).missing)
      .toEqual(['parameters.support_group_id']);
    expect(deskIdsFrom({} as AppObjectsBody).missing).toHaveLength(ENTITY_KEYS.length + WORKFLOW_KEYS.length + 1);
  });
});
