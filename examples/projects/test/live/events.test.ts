import type { PublicEvent } from '@reflexify/agentflow-sdk';
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { keys } from '../../src/data/keys.js';
import { applyChange, changesOf } from '../../src/live/events.js';
import { TEST_IDS } from '../support/ids.js';

const event = (type: string, subject: PublicEvent['subject']): PublicEvent => ({
  id: 'e1', type, occurred_at: '2026-10-21T03:00:00Z', org_id: 'org', position: 1, subject,
});

describe('what a live event changes', () => {
  it('reads a Task record event as that task', () => {
    const e = event('record.updated', { kind: 'record', id: 't1', entity_id: TEST_IDS.entities.task });
    expect(changesOf(e, TEST_IDS)).toEqual([{ entity: 'task', id: 't1' }]);
  });

  it('reads Section and Project record events as theirs', () => {
    expect(changesOf(event('record.created', { kind: 'record', id: 's1', entity_id: TEST_IDS.entities.section }), TEST_IDS))
      .toEqual([{ entity: 'section', id: 's1' }]);
    expect(changesOf(event('record.deleted', { kind: 'record', id: 'p1', entity_id: TEST_IDS.entities.project }), TEST_IDS))
      .toEqual([{ entity: 'project', id: 'p1' }]);
  });

  it('ignores an entity outside the package', () => {
    const e = event('record.updated', { kind: 'record', id: 'x1', entity_id: '00000000-0000-4000-8000-00000000ffff' });
    expect(changesOf(e, TEST_IDS)).toEqual([]);
  });

  it('reads a work event on a task as a change to that task', () => {
    const e = event('work.claimed', { kind: 'work', id: 't2', entity_id: TEST_IDS.entities.task });
    expect(changesOf(e, TEST_IDS)).toEqual([{ entity: 'task', id: 't2' }]);
  });

  it('reads a comment event on a task as a change to its thread alone', () => {
    const e = event('comment.created', { kind: 'record', id: 't3', entity_id: TEST_IDS.entities.task });
    expect(changesOf(e, TEST_IDS)).toEqual([{ entity: 'task', id: 't3', comment: true }]);
  });

  it('ignores an event that names no record', () => {
    expect(changesOf(event('instance.completed', { kind: 'instance', id: 'i1', entity_id: TEST_IDS.entities.task }), TEST_IDS)).toEqual([]);
  });
});

describe('applying a change', () => {
  const seeded = () => {
    const qc = new QueryClient();
    const all = [
      keys.task('t1'), keys.task('t2'),
      keys.board({ project: 'p1', done: '30', cancelled: false }), keys.board({ project: 'p2', done: 'all', cancelled: true }),
      keys.mywork, keys.sections('p1'), keys.project('p1'), keys.project('p2'), keys.projects(['active', 'paused']), keys.labels,
    ];
    for (const k of all) qc.setQueryData(k, {});
    const stale = () => all.filter((k) => qc.getQueryState(k)?.isInvalidated).map((k) => JSON.stringify(k));
    return { qc, stale };
  };
  const json = (...ks: (readonly unknown[])[]) => ks.map((k) => JSON.stringify(k));

  it('refreshes only the thread for a comment change', () => {
    const { qc, stale } = seeded();
    qc.setQueryData(keys.comments('t1'), {});
    qc.setQueryData(keys.comments('t2'), {});
    applyChange(qc, { entity: 'task', id: 't1', comment: true });
    expect(qc.getQueryState(keys.comments('t1'))?.isInvalidated).toBe(true);
    expect(qc.getQueryState(keys.comments('t2'))?.isInvalidated).toBe(false);
    expect(stale()).toEqual([]);
  });

  it('refreshes a task, every board and My Work for a task', () => {
    const { qc, stale } = seeded();
    applyChange(qc, { entity: 'task', id: 't1' });
    const s = stale();
    expect(s).toEqual(expect.arrayContaining(json(
      keys.task('t1'), keys.board({ project: 'p1', done: '30', cancelled: false }), keys.board({ project: 'p2', done: 'all', cancelled: true }), keys.mywork,
    )));
    expect(s).not.toContain(JSON.stringify(keys.task('t2')));
    expect(s).not.toContain(JSON.stringify(keys.labels));
  });

  it('refreshes the sections and the boards for a section', () => {
    const { qc, stale } = seeded();
    applyChange(qc, { entity: 'section', id: 's1' });
    expect(stale()).toEqual(expect.arrayContaining(json(keys.sections('p1'), keys.board({ project: 'p1', done: '30', cancelled: false }))));
    expect(stale()).not.toContain(JSON.stringify(keys.task('t1')));
  });

  it('refreshes the project and the project lists for a project', () => {
    const { qc, stale } = seeded();
    applyChange(qc, { entity: 'project', id: 'p1' });
    expect(stale()).toEqual(expect.arrayContaining(json(keys.project('p1'), keys.projects(['active', 'paused']))));
    expect(stale()).not.toContain(JSON.stringify(keys.project('p2')));
    expect(stale()).not.toContain(JSON.stringify(keys.task('t1')));
  });
});
