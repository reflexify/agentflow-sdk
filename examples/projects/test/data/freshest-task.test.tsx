import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { freshestTask } from '../../src/data/hooks.js';
import { keys } from '../../src/data/keys.js';
import { aTask } from '../support/fixtures.js';

describe('the version a list write starts from', () => {
  it("is the task's own read when it is newer than the list's copy, and the list's copy otherwise", () => {
    const qc = new QueryClient();
    const listed = aTask({ id: 't1', updatedAt: '2026-10-21T03:00:00.000Z', priority: 'medium' });
    expect(freshestTask(qc, listed)).toBe(listed);
    const edited = { ...listed, updatedAt: '2026-10-21T03:00:05.000Z', priority: 'low' as const };
    qc.setQueryData(keys.task('t1'), edited);
    expect(freshestTask(qc, listed)).toBe(edited);
    const relisted = { ...edited, updatedAt: '2026-10-21T03:00:09.000Z' };
    expect(freshestTask(qc, relisted)).toBe(relisted);
  });
});
