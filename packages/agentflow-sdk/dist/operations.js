import { PUBLISHED_OPERATIONS } from './generated/operations.js';
const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const compiled = PUBLISHED_OPERATIONS.map((op) => ({
    op: op,
    re: new RegExp('^' + op.path.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{[^}]+\}/g, UUID) + '$'),
}));
/** The published operation a request targets, or undefined. `path` is relative to /api/v1. */
export function matchOperation(method, path) {
    const upper = method.toUpperCase();
    return compiled.find((c) => c.op.method === upper && c.re.test(path))?.op;
}
//# sourceMappingURL=operations.js.map