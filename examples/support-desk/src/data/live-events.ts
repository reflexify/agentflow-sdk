import type { PublicEvent } from '@reflexify/agentflow-sdk';
import type { QueryClient } from '@tanstack/react-query';
import { ENTITY_KEYS, type DeskIds, type EntityKey } from '../../shared/contract.js';

/** What a change means for the desk's lists. Ids only, never values: the browser refetches with its own session. */
export type LiveChange = { t: 'changed'; ticket: string | null; entity: EntityKey; id: string } | { t: 'queue' };

export function applyChange(qc: QueryClient, change: LiveChange): void {
  const refresh = (...prefixes: (readonly unknown[])[]) => {
    for (const queryKey of prefixes) void qc.invalidateQueries({ queryKey });
  };
  if (change.t === 'queue') {
    refresh(['tasks'], ['ticket-count']);
    return;
  }
  const thread = change.ticket ? ['thread', change.ticket] : ['thread'];
  switch (change.entity) {
    case 'ticket':
      refresh(['ticket', change.id], ['tickets'], ['ticket-count'], ['contact-tickets']);
      break;
    case 'reply':
      refresh(thread, ['drafts'], ['held'], ['ai-replies']);
      break;
    case 'note':
      refresh(thread, ['mentions']);
      break;
    case 'contact':
      refresh(['contact', change.id], ['contacts'], ['contact-count'], ['tickets'], ['ticket']);
      break;
    case 'canned_reply':
      refresh(['canned']);
      break;
    case 'autopilot_rule':
      refresh(['rules']);
      break;
  }
}

/**
 * What an event from AgentFlow's stream means for the desk's lists. A reply's or a note's event names the record,
 * not its ticket, so it refreshes every thread; only the one on screen is refetched.
 */
export function changesOf(event: PublicEvent, ids: DeskIds): LiveChange[] {
  // A Handling task's record and work events name its workflow; nothing else of a Workflow task matters here.
  if (event.subject.workflow_id === ids.workflows.handling && (event.subject.kind === 'work' || event.subject.kind === 'record')) {
    return [{ t: 'queue' }];
  }
  const entityId = event.subject.entity_id;
  if (event.subject.kind !== 'record' || !entityId) return [];
  const entity = ENTITY_KEYS.find((k) => ids.entities[k] === entityId);
  if (!entity) return [];
  const id = event.subject.id;
  if (entity === 'ticket') return [{ t: 'changed', ticket: id, entity, id }, { t: 'queue' }];
  return [{ t: 'changed', ticket: null, entity, id }];
}
