/** The item operations of a `list` field, with the server's exact rules, so a
 *  client can apply them locally before the server answers and roll back if
 *  it refuses. The server is the authority; this mirrors it. */
export const LIST_MAX_OPS = 100;
export class ListOpError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'ListOpError';
    }
}
/** A UUIDv7: 48 bits of milliseconds, then random bits, so ids sort by time. */
export function newItemId(now = Date.now()) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    let ts = now;
    for (let i = 5; i >= 0; i--) {
        b[i] = ts % 256;
        ts = Math.floor(ts / 256);
    }
    b[6] = (b[6] & 0x0f) | 0x70;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const indexOf = (list, id) => list.findIndex((i) => i.id === id);
function insertAfter(list, after, item) {
    let at;
    if (after === null)
        at = 0;
    else if (after === undefined)
        at = list.length;
    else {
        const p = indexOf(list, after);
        at = p < 0 ? list.length : p + 1;
    }
    list.splice(at, 0, item);
}
/** Apply `ops` in order. Returns a new array; never mutates `current`. */
export function applyListOps(current, ops, mint = newItemId) {
    if (ops.length > LIST_MAX_OPS)
        throw new ListOpError('TOO_MANY_OPS', `at most ${LIST_MAX_OPS} ops per call`);
    const list = (current ?? []).map((i) => ({ ...i }));
    for (const op of ops) {
        switch (op.op) {
            case 'add': {
                if ('id' in op.values)
                    throw new ListOpError('ID_IN_VALUES', 'an item id is set by the op');
                const id = op.id ?? mint();
                if (indexOf(list, id) >= 0)
                    throw new ListOpError('ID_TAKEN', `an item ${id} is already in this list`);
                insertAfter(list, 'after' in op ? op.after : undefined, { ...op.values, id });
                break;
            }
            case 'set': {
                if ('id' in op.values)
                    throw new ListOpError('ID_IN_VALUES', 'an item id is set by the op');
                const at = indexOf(list, op.id);
                if (at < 0)
                    throw new ListOpError('LIST_ITEM_NOT_FOUND', `no item ${op.id}`);
                list[at] = { ...list[at], ...op.values, id: op.id };
                break;
            }
            case 'move': {
                const at = indexOf(list, op.id);
                if (at < 0)
                    throw new ListOpError('LIST_ITEM_NOT_FOUND', `no item ${op.id}`);
                const [item] = list.splice(at, 1);
                // The item is out of the list before the anchor is looked up, so
                // moving an item after itself sends it to the end, as on the server.
                const anchor = op.after == null ? null : indexOf(list, op.after) >= 0 ? op.after : undefined;
                insertAfter(list, anchor, item);
                break;
            }
            case 'remove': {
                const at = indexOf(list, op.id);
                if (at >= 0)
                    list.splice(at, 1);
                break;
            }
        }
    }
    return list;
}
//# sourceMappingURL=index.js.map