import { describe, expectTypeOf, it } from 'vitest';
import type { components, operations, paths } from '../src/index.js';

describe('generated API types', () => {
  it('are exported for apps that call the typed client', () => {
    expectTypeOf<components['schemas']['WorkListItem']>().toHaveProperty('due_at');
    expectTypeOf<paths['/work']['get']>().toHaveProperty('parameters');
    expectTypeOf<operations['query_records']>().toHaveProperty('requestBody');
  });
});
