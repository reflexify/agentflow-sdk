import { ok } from '../errors.js';
export const ENGLISH_MENU_COPY = {
    recent: 'Recently mentioned',
    people: 'People',
    you: 'You',
    willBeNotified: 'Will be notified',
    matchedBy: (field) => `Matched by ${field}`,
    more: (count, entity) => `${count} more in ${entity}`,
    results: (count, entity) => `${entity} · ${count} results`,
    searchIn: 'Search in',
};
export const VIETNAMESE_MENU_COPY = {
    recent: 'Nhắc gần đây',
    people: 'Người',
    you: 'Bạn',
    willBeNotified: 'Sẽ nhận thông báo',
    matchedBy: (field) => `Khớp theo ${field}`,
    more: (count, entity) => `Xem thêm ${count} trong ${entity}`,
    results: (count, entity) => `${entity} · ${count} kết quả`,
    searchIn: 'Tìm trong',
};
export const PEOPLE_GROUP = 'people';
export const RECENT_GROUP = 'recent';
/**
 * The `@` menu: what the caller mentioned recently when nothing is typed, otherwise the people who can read the record and
 * the records of each entity with hits, best first. `group` asks for one of those groups alone.
 */
export async function menu(client, params) {
    const query = { entity_id: params.entity_id };
    if (params.record_id)
        query.record_id = params.record_id;
    if (params.parent_record_id)
        query.parent_record_id = params.parent_record_id;
    if (params.q)
        query.q = params.q;
    if (params.group)
        query.group = params.group;
    if (params.limit !== undefined)
        query.limit = params.limit;
    const found = await ok(client.GET('/mentions', { params: { query } }));
    return fromResponse(found, params);
}
/** The server's menu as the kit's `<af-rich-editor>` draws it. */
export function fromResponse(found, params = {}) {
    const copy = { ...ENGLISH_MENU_COPY, ...params.copy };
    const unsearched = unsearchedOf(found, copy);
    return {
        groups: found.groups.map((g) => {
            const isEntity = g.key !== PEOPLE_GROUP && g.key !== RECENT_GROUP;
            const title = g.key === PEOPLE_GROUP
                ? (params.peopleTitle ?? copy.people)
                : g.key === RECENT_GROUP
                    ? copy.recent
                    : params.group === g.key && g.total != null
                        ? copy.results(g.total, g.label)
                        : g.label;
            const items = g.items.map((item) => item.kind === 'user'
                ? {
                    kind: 'user',
                    ref: `user/${item.id}`,
                    label: item.name,
                    meta: item.is_self ? copy.you : item.will_be_notified ? copy.willBeNotified : (item.email ?? null),
                    self: item.is_self,
                }
                : {
                    kind: 'record',
                    ref: `record/${item.entity_id}/${item.id}`,
                    label: item.label,
                    entity_label: item.entity_label,
                    meta: item.matched_field ? copy.matchedBy(item.matched_field) : null,
                });
            const more = isEntity && g.more ? { count: g.more, group: g.key, label: copy.more(g.more, g.label) } : null;
            return { key: g.key, title, items, more };
        }),
        ...(unsearched ? { unsearched } : {}),
    };
}
function unsearchedOf(found, copy) {
    const scopes = (found.unsearched ?? []).map((e) => ({ group: e.key, label: e.label }));
    return scopes.length > 0 ? { title: copy.searchIn, scopes } : undefined;
}
/** A source for the kit's `<af-rich-editor>` `mentions` property, bound to the record being written about. */
export function menuSource(client, context) {
    return (q, group) => menu(client, { ...context, q, group });
}
/** The people a record write named in a mention field who cannot read it and so were not told; null means nobody. */
export function unnotifiedOf(written) {
    return written.unnotified ?? [];
}
/**
 * The records that mention a record, newest mention first, one row each with its count and where it mentions. Only sources
 * the caller may read are listed, so a page can be shorter than `limit` while `next_cursor` is set.
 */
export async function mentionedIn(client, params) {
    const query = {};
    if (params.cursor)
        query.cursor = params.cursor;
    if (params.limit !== undefined)
        query.limit = params.limit;
    return ok(client.GET('/entities/{entity_id}/records/{record_id}/mentioned-in', {
        params: { path: { entity_id: params.entity_id, record_id: params.record_id }, query },
    }));
}
//# sourceMappingURL=index.js.map