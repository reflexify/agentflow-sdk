import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { DeskError, type DeskApi, type HandlingAction, type QueueTask } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { useMe } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { ACTION_WAIT_MS } from '../model/timing.js';
import type { Priority, Ticket } from '../model/types.js';
import { errorText } from './messages.js';

/** How Handling's End step labels a run whose Solved or Waiting write skipped because the customer wrote meanwhile. */
const CUSTOMER_WROTE = 'Customer wrote meanwhile';

export type Marked = 'marked' | 'customer_wrote';

/**
 * Claims the task if this person doesn't hold it yet, then submits the action with who chose it. The submit
 * succeeds either way, so for Solved and Waiting it then reads how the Handling run the submit names ended: when the customer
 * wrote after the task opened, the write skipped, nothing was marked, and a fresh task has opened.
 * Anything it cannot read, or that is still going, counts as marked.
 */
export async function markTask(
  api: DeskApi, task: QueueTask | null, meId: string, action: HandlingAction, opts: { signal?: AbortSignal } = {},
): Promise<Marked> {
  if (!task) throw new DeskError('forbidden', 403, 'NO_TASK');
  if (task.claimedByUserId !== meId) await api.claim(task);
  const runId = await api.submit(task, action, meId);
  if (action === 'escalate' || !runId) return 'marked';
  try {
    const run = await api.waitForRun(runId, { timeoutMs: ACTION_WAIT_MS, signal: opts.signal });
    return run.state === 'done' && run.outcome === CUSTOMER_WROTE ? 'customer_wrote' : 'marked';
  } catch {
    return 'marked'; // the mark went through; the run's ending is only the news about it
  }
}

export function useTicketActions(ticket: Ticket | undefined, task: QueueTask | null) {
  const { api } = useDesk();
  const tr = useT();
  const qc = useQueryClient();
  const me = useMe().data;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A second press while the first is in flight does nothing.
  const inFlight = useRef(false);
  // Leaving the ticket stops waiting on a run; there is nobody left to tell.
  const leave = useRef<AbortController | null>(null);
  useEffect(() => {
    const own = new AbortController();
    leave.current = own;
    return () => own.abort();
  }, []);

  const mine = !!task && !!me && task.claimedByUserId === me.id;
  const canMark = !!task && !!me && (task.status === 'open' || mine);

  async function run(name: string, fn: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(name);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorText(tr, e));
      await qc.invalidateQueries({ queryKey: keys.tasks });
      if (ticket) await qc.invalidateQueries({ queryKey: keys.ticket(ticket.id) });
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  const refreshTask = () => qc.invalidateQueries({ queryKey: keys.tasks });
  const refreshTicket = async () => {
    if (!ticket) return;
    await Promise.all([
      qc.invalidateQueries({ queryKey: keys.ticket(ticket.id) }),
      qc.invalidateQueries({ queryKey: keys.thread(ticket.id) }),
      qc.invalidateQueries({ queryKey: ['tickets'] }),
    ]);
  };

  return {
    canMark,
    mine,
    busy,
    error,
    mark: (action: HandlingAction) => run(action, async () => {
      if (!me || !canMark) return;
      const result = await markTask(api, task, me.id, action, { signal: leave.current?.signal });
      await Promise.all([refreshTask(), refreshTicket()]);
      if (result === 'customer_wrote' && !leave.current?.signal.aborted) setError(tr('notMarkedCustomerWrote'));
    }),
    claim: () => run('claim', async () => {
      if (!task) return;
      await api.claim(task);
      await refreshTask();
    }),
    release: () => run('release', async () => {
      if (!task) return;
      await api.release(task);
      await refreshTask();
    }),
    handOver: (userId: string) => run('handOver', async () => {
      if (!task) return;
      await api.handOver(task, userId);
      await refreshTask();
    }),
    setPriority: (priority: Priority) => run('priority', async () => {
      if (!ticket || !me || priority === ticket.priority) return;
      const updated = await api.updateTicket(ticket, { priority });
      qc.setQueryData(keys.ticket(updated.id), updated);
      await api.createNote({ ticketId: ticket.id, kind: 'event', body: `Priority changed to ${priority}`, authorUserId: me.id });
      await refreshTicket();
    }),
  };
}
