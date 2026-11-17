import { ok } from '../errors.js';
/** The record's comments, oldest first within a page. */
export async function list(client, params) {
    const query = {};
    if (params.cursor)
        query.cursor = params.cursor;
    if (params.before)
        query.before = params.before;
    if (params.limit !== undefined)
        query.limit = params.limit;
    return ok(client.GET('/entities/{entity_id}/records/{record_id}/comments', {
        params: { path: { entity_id: params.entity_id, record_id: params.record_id }, query },
    }));
}
export async function create(client, params) {
    const body = { body: params.body };
    if (params.attachment_ids)
        body.attachment_ids = params.attachment_ids;
    return ok(client.POST('/entities/{entity_id}/records/{record_id}/comments', {
        params: {
            path: { entity_id: params.entity_id, record_id: params.record_id },
            header: { 'Idempotency-Key': params.idempotency_key },
        },
        body,
    }));
}
/** Edits a comment. A comment changed since it was read is refused as `STALE_VERSION`. */
export async function update(client, params) {
    const body = {};
    if (params.body !== undefined)
        body.body = params.body;
    if (params.attachment_ids !== undefined)
        body.attachment_ids = params.attachment_ids;
    return ok(client.PATCH('/entities/{entity_id}/records/{record_id}/comments/{comment_id}', {
        params: {
            path: { entity_id: params.entity_id, record_id: params.record_id, comment_id: params.comment.id },
            header: { 'If-Match': params.comment.edited_at ?? params.comment.created_at },
        },
        body,
    }));
}
/** Deletes a comment and its files. */
export async function remove(client, params) {
    await ok(client.DELETE('/entities/{entity_id}/records/{record_id}/comments/{comment_id}', {
        params: { path: { entity_id: params.entity_id, record_id: params.record_id, comment_id: params.comment_id } },
    }));
}
/** Whether an event from the stream is a comment event of this record, so its thread may have changed. */
export function isAbout(event, record) {
    return event.type.startsWith('comment.') && event.subject.kind === 'record' && event.subject.id === record.record_id;
}
//# sourceMappingURL=index.js.map