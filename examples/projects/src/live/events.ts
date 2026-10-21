import type { PublicEvent } from '@reflexify/agentflow-sdk';
import type { QueryClient } from '@tanstack/react-query';
import type { ProjectIds } from '../shared/app-objects.js';

export type EntityKey = keyof ProjectIds['entities'];
/** A record of the package's that changed. Ids only: what changed is read again with the viewer's own session. */
export interface LiveChange { entity: EntityKey; id: string }

const ENTITY_KEYS: readonly EntityKey[] = ['project', 'section', 'task', 'task_label'];

/** What an event from AgentFlow's stream means for the module: a record's own events and its work's both name the record. */
export function changesOf(event: PublicEvent, ids: ProjectIds): LiveChange[] {
  const { kind, id, entity_id: entityId } = event.subject;
  if ((kind !== 'record' && kind !== 'work') || !entityId) return [];
  const entity = ENTITY_KEYS.find((k) => ids.entities[k] === entityId);
  return entity ? [{ entity, id }] : [];
}

export function applyChange(qc: QueryClient, change: LiveChange): void {
  const refresh = (...prefixes: (readonly unknown[])[]) => {
    for (const queryKey of prefixes) void qc.invalidateQueries({ queryKey });
  };
  switch (change.entity) {
    case 'task':
      // A task's change also moves the rollups its section and project show.
      refresh(['task', change.id], ['board'], ['mywork'], ['sections'], ['projects']);
      break;
    case 'section':
      // The event names the section, not its project, so every project's sections are stale; only those on screen refetch.
      refresh(['sections'], ['board']);
      break;
    case 'project':
      refresh(['project', change.id], ['projects']);
      break;
    case 'task_label':
      refresh(['labels']);
      break;
  }
}
