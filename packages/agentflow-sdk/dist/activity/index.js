import { ok } from '../errors.js';
export const ACTIVITY_KINDS = ['field', 'stage', 'record', 'run', 'work'];
/** A record's activity, newest first. `next_cursor` reads the older lines; `prev_cursor` is always null. */
export async function list(client, params) {
    const query = {};
    if (params.kinds && params.kinds.length > 0)
        query.kinds = params.kinds.join(',');
    if (params.cursor)
        query.cursor = params.cursor;
    if (params.limit !== undefined)
        query.limit = params.limit;
    return ok(client.GET('/entities/{entity_id}/records/{record_id}/activity', {
        params: { path: { entity_id: params.entity_id, record_id: params.record_id }, query },
    }));
}
const RUN_PREFIXES = ['instance.', 'task.', 'node_run.', 'agent.'];
/** The kind a line of the feed, or an event of the stream, belongs to; null for a type the feed never shows. */
export function kindOf(event_type) {
    if (event_type === 'record.updated')
        return 'field';
    if (event_type === 'record.stage.transitioned')
        return 'stage';
    if (event_type === 'record.created' || event_type === 'record.series.raised')
        return 'record';
    if (event_type.startsWith('work.'))
        return 'work';
    if (RUN_PREFIXES.some((prefix) => event_type.startsWith(prefix)))
        return 'run';
    return null;
}
/**
 * Whether an event from the stream may change the record's feed: one about the record itself (a record or work subject, whose
 * id is the record's) or about one of its runs, which the caller names in `knownRuns` because an instance subject carries the
 * run's id and not the record's.
 */
export function isAbout(event, record, knownRuns) {
    const { kind, id } = event.subject;
    if (kind === 'record' || kind === 'work')
        return id === record.record_id;
    if (kind === 'instance')
        return knownRuns.has(id);
    return false;
}
//# sourceMappingURL=index.js.map