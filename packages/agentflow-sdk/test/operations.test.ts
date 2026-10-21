import { describe, expect, it } from 'vitest';
import { PUBLISHED_OPERATIONS } from '../src/generated/operations.js';
import { matchOperation } from '../src/operations.js';

describe('published operations', () => {
  it('lists GET /caller and marks a record create as idempotent', () => {
    expect(PUBLISHED_OPERATIONS).toContainEqual({ method: 'GET', path: '/caller', idempotent: false });
    expect(matchOperation('POST', '/entities/0190f0a8-1b2c-7d3e-8f40-123456789abc/records')).toEqual({
      method: 'POST', path: '/entities/{entity_id}/records', idempotent: true,
    });
  });
  it('does not match internal or unknown operations', () => {
    expect(matchOperation('GET', '/admin/apps')).toBeUndefined();
    expect(matchOperation('GET', '/work/counts')).toBeUndefined();
    expect(matchOperation('DELETE', '/caller')).toBeUndefined();
  });
  it('matches one path segment per parameter', () => {
    expect(matchOperation('GET', '/instances/a/b')).toBeUndefined();
  });
  it('does not match a non-UUID id', () => {
    expect(matchOperation('POST', '/entities/not-a-uuid/records')).toBeUndefined();
  });

  it('lists the app objects operation', () => {
    expect(matchOperation('GET', '/app/objects')).toEqual({
      method: 'GET',
      path: '/app/objects',
      idempotent: false,
    });
  });

  it('lists My Work and the four work operations, and not unassign', () => {
    const work =
      '/entities/0190f0a8-1b2c-7d3e-8f40-123456789abc/records/0190f0a8-1b2c-7d3e-8f40-123456789abd/work';
    expect(matchOperation('GET', '/work')).toEqual({ method: 'GET', path: '/work', idempotent: false });
    for (const verb of ['claim', 'release', 'reassign', 'assign']) {
      expect(matchOperation('POST', `${work}/${verb}`)).toEqual({
        method: 'POST',
        path: `/entities/{entity_id}/records/{record_id}/work/${verb}`,
        idempotent: false,
      });
    }
    expect(matchOperation('POST', `${work}/unassign`)).toBeUndefined();
  });

  it('lists the event operations', () => {
    expect(matchOperation('GET', '/events')).toEqual({ method: 'GET', path: '/events', idempotent: false });
    expect(matchOperation('GET', '/events/stream')).toEqual({
      method: 'GET',
      path: '/events/stream',
      idempotent: false,
    });
  });

  it('lists the presence operations', () => {
    const record =
      '/entities/0190f0a8-1b2c-7d3e-8f40-123456789abc/records/0190f0a8-1b2c-7d3e-8f40-123456789abd/presence';
    expect(matchOperation('POST', record)?.path).toBe('/entities/{entity_id}/records/{record_id}/presence');
    expect(matchOperation('DELETE', record)?.path).toBe('/entities/{entity_id}/records/{record_id}/presence');
    expect(matchOperation('GET', '/entities/0190f0a8-1b2c-7d3e-8f40-123456789abc/presence')?.path).toBe(
      '/entities/{entity_id}/presence',
    );
  });

  it('lists the publishing operations, with create_app_deployment idempotent', () => {
    const id = '0190f0a8-1b2c-7d3e-8f40-123456789abc';
    expect(matchOperation('GET', '/platform')).toEqual({ method: 'GET', path: '/platform', idempotent: false });
    expect(matchOperation('POST', '/app-packages/lint')?.path).toBe('/app-packages/lint');
    expect(matchOperation('POST', '/app-packages')?.path).toBe('/app-packages');
    expect(matchOperation('GET', '/app-deployments')?.path).toBe('/app-deployments');
    expect(matchOperation('POST', '/app-deployments')).toEqual({
      method: 'POST',
      path: '/app-deployments',
      idempotent: true,
    });
    for (const verb of ['plan', 'approve', 'cancel']) {
      expect(matchOperation('POST', `/app-deployments/${id}/${verb}`)?.path).toBe(
        `/app-deployments/{deployment_id}/${verb}`,
      );
    }
    expect(matchOperation('GET', `/app-deployments/${id}`)?.path).toBe('/app-deployments/{deployment_id}');
  });
});
