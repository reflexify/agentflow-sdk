import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { isDeskError, type RunResult } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { keys } from '../data/keys.js';
import { cancelled, isAbort, sleep } from '../model/abortable.js';
import { ACTION_WAIT_MS, POLL_INTERVAL_MS, REDRAFT_TIMEOUT_MS } from '../model/timing.js';
import type { Reply } from '../model/types.js';
import { errorText } from './messages.js';

type Workflow = 'accept_message' | 'move_message';
type Done = Extract<RunResult, { state: 'done' }>;

/**
 * Accept and Move on a held message. Both runs outlast the start (Move's apply and the Draft reply for the
 * message run on workers), so the desk starts the run, waits on it, and says what became of it in its own words.
 */
export function useHeldActions() {
  const { api } = useDesk();
  const tr = useT();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [movedTo, setMovedTo] = useState<string | null>(null);
  const inFlight = useRef(false);
  // Aborted when the screen goes away: the wait stops. The run carries on, and the live pushes show what it did.
  const leave = useRef<AbortController | null>(null);
  useEffect(() => {
    const own = new AbortController();
    leave.current = own;
    return () => own.abort();
  }, []);

  /** The ticket a Move put the message on, as soon as the message itself names it (before the run, which also waits for a draft, ends). */
  async function movedAway(reply: Reply, signal: AbortSignal): Promise<string> {
    for (;;) {
      await sleep(POLL_INTERVAL_MS, signal);
      try {
        const seen = await api.reply(reply.id);
        if (seen.ticketId && seen.ticketId !== reply.ticketId) return seen.ticketId;
      } catch (e) {
        if (signal.aborted) throw cancelled();
        if (isDeskError(e, 'signed_out')) throw e;
        // A read that fails now is tried again; the run's own wait reports what matters.
      }
    }
  }

  /** Waits for the run: to its end, or for a Move until the message has visibly moved, whichever comes first. */
  async function follow(workflow: Workflow, reply: Reply, runId: string): Promise<{ result: RunResult; movedTicket: string | null }> {
    const waiting = new AbortController();
    const stop = () => waiting.abort();
    const left = leave.current?.signal;
    left?.addEventListener('abort', stop, { once: true });
    try {
      const ended = api.waitForRun(runId, { timeoutMs: REDRAFT_TIMEOUT_MS, signal: waiting.signal });
      if (workflow === 'accept_message') return { result: await ended, movedTicket: null };
      const first = await Promise.race([
        ended.then((result) => ({ result, movedTicket: null as string | null })),
        movedAway(reply, waiting.signal).then(async (movedTicket) => ({ result: await api.run(runId), movedTicket: movedTicket as string | null })),
      ]);
      return first;
    } finally {
      left?.removeEventListener('abort', stop);
      waiting.abort(); // whichever lost the race stops here
    }
  }

  function verdict(workflow: Workflow, result: Done, movedTicket: string | null) {
    if (result.status !== 'completed') setError(tr(workflow === 'move_message' ? 'couldntMove' : 'couldntAccept'));
    else if (result.outcome === 'Already decided') setNote(tr('alreadyDecided'));
    else if (workflow === 'move_message' && result.outcome === 'Moved') {
      const made = result.output.ticket_id;
      const id = typeof made === 'string' && made ? made : movedTicket;
      if (id) setMovedTo(id);
    }
  }

  async function run(workflow: Workflow, reply: Reply) {
    if (inFlight.current) return;
    inFlight.current = true;
    const signal = leave.current?.signal ?? new AbortController().signal;
    setBusy(reply.id);
    setError(null);
    setNote(null);
    setMovedTo(null);
    try {
      const started = await api.start(workflow, reply.id, {}, ACTION_WAIT_MS);
      const { result, movedTicket } = started.state === 'running'
        ? await follow(workflow, reply, started.runId)
        : { result: started, movedTicket: null };
      if (result.state === 'done') verdict(workflow, result, movedTicket);
      else if (movedTicket) setMovedTo(movedTicket); // moved; the draft for it is still being written
      else setNote(tr('stillWorking'));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['thread'] }),
        qc.invalidateQueries({ queryKey: keys.held }),
        qc.invalidateQueries({ queryKey: ['tickets'] }),
      ]);
    } catch (e) {
      if (isAbort(e) || signal.aborted) return; // the person left; nothing to say
      setError(isDeskError(e, 'invalid') && e.code === 'SUBJECT_BINDING_MISMATCH' ? tr('messageGone') : errorText(tr, e));
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  return {
    accept: (reply: Reply) => run('accept_message', reply),
    move: (reply: Reply) => run('move_message', reply),
    busy, error, note, movedTo,
  };
}
