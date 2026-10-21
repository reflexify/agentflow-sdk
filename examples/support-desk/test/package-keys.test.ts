import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ENTITY_KEYS, WORKFLOW_KEYS } from '../shared/contract';
import { SUPPORT_GROUP_PARAMETER, deskIdsFrom, entityLogicalKey, workflowLogicalKey } from '../shared/app-objects';

const manifest = JSON.parse(readFileSync(new URL('../package/manifest.json', import.meta.url), 'utf8'));
const keys = new Set<string>(manifest.objects.map((o: { key: string }) => o.key));

describe('the package the desk is shipped in', () => {
  it('names every object the desk asks for', () => {
    for (const k of ENTITY_KEYS) expect(keys).toContain(entityLogicalKey(k));
    for (const k of WORKFLOW_KEYS) expect(keys).toContain(workflowLogicalKey(k));
    expect(manifest.parameters.map((p: { key: string }) => p.key)).toContain(SUPPORT_GROUP_PARAMETER);
  });

  it('gives the desk every id when each of its objects is live', () => {
    const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
    const objects = [...keys].map((key, n) => ({ logical_key: key, kind: key.split(':')[0], state: 'live', id: id(n) }));
    const found = deskIdsFrom({ revision: 1, objects, parameters: { [SUPPORT_GROUP_PARAMETER]: id(999) } } as never);
    expect(found.missing).toEqual([]);
  });
});
