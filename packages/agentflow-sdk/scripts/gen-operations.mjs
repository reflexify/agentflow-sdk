import { readFileSync, writeFileSync } from 'node:fs';

const doc = JSON.parse(readFileSync(new URL('../../../../openapi.json', import.meta.url), 'utf8'));
const METHODS = ['get', 'put', 'post', 'delete', 'patch'];
const PATH_PARAM = /\{([^}]+)\}/g;

function pathParamSchema(item, op, name) {
  const fromOp = (op.parameters ?? []).find((p) => p.in === 'path' && p.name === name);
  if (fromOp) return fromOp.schema;
  const fromPath = (item.parameters ?? []).find((p) => p.in === 'path' && p.name === name);
  return fromPath?.schema;
}

const rows = [];
for (const [path, item] of Object.entries(doc.paths)) {
  for (const m of METHODS) {
    const op = item[m];
    if (!op) continue;
    for (const match of path.matchAll(PATH_PARAM)) {
      const name = match[1];
      const schema = pathParamSchema(item, op, name);
      if (schema?.format !== 'uuid') {
        throw new Error(
          `path parameter "${name}" on ${m.toUpperCase()} ${path} must have schema.format === "uuid" ` +
            `(found ${JSON.stringify(schema)})`,
        );
      }
    }
    rows.push({ method: m.toUpperCase(), path, idempotent: op['x-idempotent'] === true });
  }
}
rows.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
const out = `// Generated from openapi.json by scripts/gen-operations.mjs. Do not edit.
export const PUBLISHED_OPERATIONS = ${JSON.stringify(rows, null, 2)} as const satisfies readonly { method: string; path: string; idempotent: boolean }[];
`;
writeFileSync(new URL('../src/generated/operations.ts', import.meta.url), out);
