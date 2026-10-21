import { describe, expect, it } from 'vitest';
import { appObjectsFor, LOGICAL_KEYS, projectIdsFrom } from '../src/shared/app-objects.js';
import { TEST_IDS } from './support/ids.js';

describe('the ids from /app/objects', () => {
  it('reads what appObjectsFor writes', () => {
    expect(projectIdsFrom(appObjectsFor(TEST_IDS))).toEqual({ ids: TEST_IDS, missing: [] });
  });
  it('names each missing key in a fixed order, and refuses an off object', () => {
    const body = appObjectsFor(TEST_IDS);
    body.objects = body.objects.filter((o) => o.logical_key !== 'entity:task').map((o) => (o.logical_key === 'entity:section' ? { ...o, state: 'off' as const } : o));
    delete (body.parameters as Record<string, unknown>).project_admins;
    expect(projectIdsFrom(body)).toEqual({ ids: null, missing: ['entity:section', 'entity:task', 'project_admins'] });
  });
  it('asks for keys the package declares', async () => {
    const fs = await import('node:fs');
    const manifest = JSON.parse(fs.readFileSync(new URL('../config/package-manifest.json', import.meta.url), 'utf8'));
    const params = manifest.parameters.map((p: { key: string }) => p.key);
    for (const key of LOGICAL_KEYS) {
      if (key.startsWith('entity:')) expect(fs.existsSync(new URL(`../config/entities/${key.slice(7)}.json`, import.meta.url)), key).toBe(true);
      else expect(params, key).toContain(key);
    }
  });
});
