// A .tsx file though it has no markup: it reaches desk-context.tsx, and only the browser project sets --jsx.
import { describe, expect, it, vi } from 'vitest';
import { DeskError, type DeskApi, type DeskErrorKind, type QueueTask, type RunResult, type TaskRef } from '../../src/api/desk-api.js';
import { ACTION_WAIT_MS } from '../../src/model/timing.js';
import { TEXT, t, type TextKey } from '../../src/text.js';
import { errorText } from '../../src/ticket/messages.js';
import { markTask } from '../../src/ticket/useTicketActions.js';

const task = (over: Partial<QueueTask> = {}): QueueTask => ({
  id: 'task-1', entityId: 'e-wt', ticketId: 't1', nodeId: 'handle_normal', status: 'open', claimedByUserId: null, dueAt: null, createdAt: '2026-10-06T08:00:00Z', ...over,
});

/** `runId` is what the submit answers: the Handling run the task belongs to. */
function recorder(ending: Partial<Extract<RunResult, { state: 'done' }>> | 'unreadable' | 'running' = { outcome: 'Done' }, runId = 'run-1') {
  const calls: string[] = [];
  const api = {
    claim: vi.fn(async (t: TaskRef) => { calls.push(`claim ${t.id}`); }),
    submit: vi.fn(async (t: TaskRef, action: string, by: string) => { calls.push(`submit ${t.id} ${action} ${by}`); return runId; }),
    waitForRun: vi.fn(async (id: string): Promise<RunResult> => {
      calls.push(`wait ${id}`);
      if (ending === 'unreadable') throw new DeskError('offline', 0, 'NETWORK');
      if (ending === 'running') return { state: 'running', runId: id };
      return { state: 'done', runId: id, status: 'completed', output: {}, outcome: 'Done', error: null, ...ending };
    }),
  } as unknown as DeskApi;
  return { api, calls };
}

describe('markTask', () => {
  it('claims first when the person does not hold the task, then submits with who chose it', async () => {
    const { api, calls } = recorder();
    await markTask(api, task(), 'me', 'solved');
    expect(calls).toEqual(['claim task-1', 'submit task-1 solved me', 'wait run-1']);
  });

  it('claims a task someone else holds before submitting too, and lets the platform refuse it', async () => {
    const { api, calls } = recorder();
    await markTask(api, task({ status: 'claimed', claimedByUserId: 'ha' }), 'me', 'waiting');
    expect(calls).toEqual(['claim task-1', 'submit task-1 waiting me', 'wait run-1']);
  });

  it('submits straight away when the person already holds it', async () => {
    const { api, calls } = recorder();
    await markTask(api, task({ status: 'claimed', claimedByUserId: 'me' }), 'me', 'escalate');
    expect(calls).toEqual(['submit task-1 escalate me']);
  });

  it('does not submit when the claim is refused', async () => {
    const { api, calls } = recorder();
    vi.mocked(api.claim).mockRejectedValueOnce(new DeskError('conflict', 409, 'WORK_ALREADY_CLAIMED'));
    await expect(markTask(api, task(), 'me', 'solved')).rejects.toMatchObject({ kind: 'conflict' });
    expect(calls).toEqual([]);
  });

  it('hands the platform the task itself, its record and its entity', async () => {
    const { api } = recorder();
    const t = task({ status: 'claimed', claimedByUserId: 'me' });
    await markTask(api, t, 'me', 'escalate');
    expect(api.submit).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-1', entityId: 'e-wt' }), 'escalate', 'me');
    const other = recorder();
    await markTask(other.api, task(), 'me', 'escalate');
    expect(other.api.claim).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-1', entityId: 'e-wt' }));
  });

  describe('the run the submit names', () => {
    const mine = (over: Partial<QueueTask> = {}) => task({ status: 'claimed', claimedByUserId: 'me', ...over });

    it('says "marked" when the run ends "Done", having waited for it no longer than an action is given', async () => {
      const { api, calls } = recorder({ outcome: 'Done' });
      const signal = new AbortController().signal;
      await expect(markTask(api, mine(), 'me', 'solved', { signal })).resolves.toBe('marked');
      expect(calls).toEqual(['submit task-1 solved me', 'wait run-1']);
      expect(api.waitForRun).toHaveBeenCalledWith('run-1', { timeoutMs: ACTION_WAIT_MS, signal });
    });

    it.each(['solved', 'waiting'] as const)('says the customer wrote when %s ends "Customer wrote meanwhile"', async (action) => {
      const { api } = recorder({ outcome: 'Customer wrote meanwhile' });
      await expect(markTask(api, mine(), 'me', action)).resolves.toBe('customer_wrote');
    });

    it('does not look at the run for Escalate, which does not expect the customer to be quiet', async () => {
      const { api, calls } = recorder({ outcome: 'Customer wrote meanwhile' });
      await expect(markTask(api, mine(), 'me', 'escalate')).resolves.toBe('marked');
      expect(calls).toEqual(['submit task-1 escalate me']);
    });

    it('says "marked" when it cannot tell: no run named, still going, unreadable, or the wait stopped', async () => {
      const none = recorder('running', '');
      await expect(markTask(none.api, mine(), 'me', 'solved')).resolves.toBe('marked');
      expect(none.calls).toEqual(['submit task-1 solved me']);
      await expect(markTask(recorder('running').api, mine(), 'me', 'solved')).resolves.toBe('marked');
      await expect(markTask(recorder('unreadable').api, mine(), 'me', 'solved')).resolves.toBe('marked');
      const stopped = recorder();
      vi.mocked(stopped.api.waitForRun).mockRejectedValueOnce(new DOMException('The wait was cancelled.', 'AbortError'));
      await expect(markTask(stopped.api, mine(), 'me', 'solved')).resolves.toBe('marked');
    });

    it('does not read the run when the submit is refused', async () => {
      const { api, calls } = recorder();
      vi.mocked(api.submit).mockRejectedValueOnce(new DeskError('forbidden', 403, 'WORK_NOT_CLAIMANT'));
      await expect(markTask(api, mine(), 'me', 'solved')).rejects.toMatchObject({ kind: 'forbidden' });
      expect(calls).toEqual([]);
    });
  });

  it('refuses when there is no task to mark', async () => {
    const { api, calls } = recorder();
    await expect(markTask(api, null, 'me', 'solved')).rejects.toMatchObject({ kind: 'forbidden' });
    expect(calls).toEqual([]);
  });
});

describe('errorText', () => {
  const tr = (k: TextKey) => t('en', k);
  const kinds: [DeskErrorKind, string][] = [
    ['stale', 'Someone else changed this just now. It has been reloaded.'],
    ['not_found', 'Someone else changed this just now. It has been reloaded.'],
    ['forbidden', 'Your account can\'t do that here.'],
    ['conflict', 'Someone else got there first.'],
    ['offline', 'You\'re offline. Try again when you\'re back.'],
    ['signed_out', 'You were signed out.'],
    ['invalid', 'That didn\'t work. Try again.'],
    ['failed', 'That didn\'t work. Try again.'],
  ];
  it.each(kinds)('says one sentence for %s, from the person\'s side', (kind, text) => {
    expect(errorText(tr, new DeskError(kind, 400, 'X', 'a status line the person must never see'))).toBe(text);
  });

  it('says the generic sentence for anything that is not a DeskError', () => {
    expect(errorText(tr, new TypeError('x is not a function'))).toBe('That didn\'t work. Try again.');
    expect(errorText(tr, 'boom')).toBe('That didn\'t work. Try again.');
  });

  it('has the same sentences in Vietnamese', () => {
    for (const key of ['errStale', 'errForbidden', 'errConflict', 'errOffline', 'errSignedOut', 'errFailed'] as const) {
      expect(TEXT.vi[key]).not.toBe(TEXT.en[key]);
    }
  });
});
