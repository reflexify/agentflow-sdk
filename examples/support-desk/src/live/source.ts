import { ok, type AgentFlowClient, type AppHost, type RealtimeChannel, type RecordPresence } from '@reflexify/agentflow-sdk';

/**
 * Every record change, and every change to a Handling task's work. A Handling task is a Workflow task
 * record: its record events and its work events carry the workflow it belongs to. Runs are not on the
 * desk's screens.
 */
export const DESK_EVENT_TYPES = [
  'record.created', 'record.updated', 'record.stage_changed', 'record.deleted',
  'work.assigned', 'work.claimed', 'work.released', 'work.reassigned', 'work.completed',
] as const;

/** Where the live provider gets its channel, and the presence it starts from; tests hand it a fake. */
export interface LiveSource {
  /** The channel to listen on. It is not the live provider's: whoever gives it closes it. */
  channel(): RealtimeChannel;
  /** Who has which record of the entity open now. Presence frames are never replayed, so a page asks after each connect. */
  readPresence(entityId: string): Promise<RecordPresence[]>;
}

async function presenceOf(client: AgentFlowClient, entityId: string): Promise<RecordPresence[]> {
  const page = await ok(client.GET('/entities/{entity_id}/presence', { params: { path: { entity_id: entityId } } }));
  return page.records;
}

/** The live layer on its host's channel: the host opens it, with presence and every event type, and closes it. */
export function hostLiveSource(host: AppHost): LiveSource {
  return {
    // Read when the live layer starts and not before: a host opens its stream the first time `realtime` is read.
    channel: () => host.realtime,
    readPresence: (entityId) => presenceOf(host.api, entityId),
  };
}
