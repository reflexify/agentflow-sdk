import { describe, expect, it } from 'vitest';
import { statusChanges } from '../../src/model/status.js';
import { aTask } from '../support/fixtures.js';

const labels = [{ id: 'waiting', updatedAt: '2026-10-01T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' as const }, { id: 'week', updatedAt: '2026-10-01T00:00:00Z', name: 'Ưu tiên tuần', baseStatus: 'todo' as const }];

describe('a status write', () => {
  it('is only the status for a plain task', () => {
    expect(statusChanges(aTask({ status: 'todo' }), 'done', labels)).toEqual({ status: 'done' });
  });
  it('clears blocked when a blocked task leaves in progress', () => {
    expect(statusChanges(aTask({ status: 'doing', blocked: true }), 'todo', labels)).toEqual({ status: 'todo', blocked: false });
    expect(statusChanges(aTask({ status: 'doing', blocked: true }), 'done', labels)).toEqual({ status: 'done', blocked: false });
    expect(statusChanges(aTask({ status: 'doing', blocked: true }), 'doing', labels)).toEqual({ status: 'doing' });
  });
  it('clears a sub-label that does not belong to the new status, and keeps one that does', () => {
    expect(statusChanges(aTask({ status: 'doing', label: 'waiting' }), 'todo', labels)).toEqual({ status: 'todo', label: null });
    expect(statusChanges(aTask({ status: 'todo', label: 'week' }), 'todo', labels)).toEqual({ status: 'todo' });
    expect(statusChanges(aTask({ status: 'todo', label: 'gone' }), 'doing', labels)).toEqual({ status: 'doing', label: null });
  });
  it('clears both when a blocked, labelled task is cancelled', () => {
    expect(statusChanges(aTask({ status: 'doing', blocked: true, label: 'waiting' }), 'cancelled', labels))
      .toEqual({ status: 'cancelled', blocked: false, label: null });
  });
});
