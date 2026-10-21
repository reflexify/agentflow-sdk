import { PUBLISHED_OPERATIONS } from './generated/operations.js';

export type PublishedOperation = { method: string; path: string; idempotent: boolean };

const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

const compiled = PUBLISHED_OPERATIONS.map((op) => ({
  op: op as PublishedOperation,
  re: new RegExp(
    '^' + op.path.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{[^}]+\}/g, UUID) + '$',
  ),
}));

/** The published operation a request targets, or undefined. `path` is relative to /api/v1. */
export function matchOperation(method: string, path: string): PublishedOperation | undefined {
  const upper = method.toUpperCase();
  return compiled.find((c) => c.op.method === upper && c.re.test(path))?.op;
}
