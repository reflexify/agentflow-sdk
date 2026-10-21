import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { isDeskError, type QueueTask, type RunResult } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { keys } from '../data/keys.js';
import { isAbort, sleep } from '../model/abortable.js';
import { OUTBOX_DONE_LINGER_MS, PENDING_POLL_MS, PENDING_WATCH_MS, SEND_WAIT_MS, UNDO_SEND_MS } from '../model/timing.js';
import { useNavigate, useRoute } from '../shell/RouteContext.js';
import type { TextKey } from '../text.js';
import { errorText } from '../ticket/messages.js';
import { markTask } from '../ticket/useTicketActions.js';

export type SendChoice = 'send' | 'send_waiting' | 'send_solved' | 'send_next';

/** What the Solved or Waiting a choice asks for is, and what the countdown says will follow. */
export const markOf = (choice: SendChoice) => (choice === 'send_waiting' ? 'waiting' : choice === 'send_solved' ? 'solved' : null);
export const statusAfter = (choice: SendChoice): TextKey | undefined =>
  choice === 'send_waiting' ? 'status_pending' : choice === 'send_solved' ? 'status_solved' : undefined;

export type JobPhase =
  | { kind: 'counting'; left: number }
  | { kind: 'sending' }
  /** The send outlasted the desk's wait, or could not be followed. It may still go out; the outbox keeps looking. */
  | { kind: 'pending' }
  | { kind: 'done'; text: string }
  | { kind: 'failed'; text: string };

export interface OutboxJob {
  id: number;
  ticketId: string;
  /** Who the reply is to, for the bar's one line. */
  ticketName: string;
  draftId: string;
  /** The draft's version the person confirmed; the claim refuses a draft that has moved. */
  version: number;
  choice: SendChoice;
  task: QueueTask | null;
  meId: string;
  endsAt: number;
  phase: JobPhase;
  /** The reply is confirmed sent. The box of that ticket, if it is open, clears its draft. */
  sent: boolean;
  /** It was not known to have gone in time, so nothing was marked and nothing follows from it. */
  late: boolean;
}

export type JobInput = Pick<OutboxJob, 'ticketId' | 'ticketName' | 'draftId' | 'version' | 'choice' | 'task' | 'meId'>;

export const isActive = (j: OutboxJob) => j.phase.kind === 'counting' || j.phase.kind === 'sending' || j.phase.kind === 'pending';

interface OutboxControl {
  /** Every job, for the bar. */
  jobs: OutboxJob[];
  /** One ticket's job, as it is this moment. */
  job(ticketId: string): OutboxJob | undefined;
  /** Starts the ten seconds for a reply the person has confirmed. False when that ticket already has a send going. */
  start(input: JobInput): boolean;
  /** A send that could not begin, said where the person will see it. */
  refuse(ticketId: string, ticketName: string, text: string): void;
  undo(ticketId: string): void;
  /** Takes a finished or failed job away, or lets go of one that never lands. */
  dismiss(ticketId: string): void;
}

const OutboxContext = createContext<OutboxControl | null>(null);

export function useOutbox(): OutboxControl {
  const outbox = useContext(OutboxContext);
  if (!outbox) throw new Error('outside OutboxProvider');
  return outbox;
}

const TICK_MS = 250;

/**
 * Every reply the person has confirmed with Send, from the first of its ten seconds to the news of how it went.
 * It lives above the screens, so going to another ticket (or another screen) neither cancels a send nor skips its
 * mark. Closing the page cancels a countdown (the page asks first). Leaving the desk without closing the page sends
 * every countdown at once and lets each send under way finish, its mark included: inside AgentFlow leaving is a move
 * to another of its pages, which `beforeunload` never sees, and a reply dropped there would be lost without a word.
 * Only the watching of a send that outlasted its wait stops then, since nobody is left to be told.
 */
export function OutboxProvider({ children }: { children: ReactNode }) {
  const { api } = useDesk();
  const tr = useT();
  const qc = useQueryClient();
  const [jobs, setJobs] = useState<Record<string, OutboxJob>>({});
  const book = useRef(jobs); // the same jobs, readable the moment they change
  const clocks = useRef(new Map<string, ReturnType<typeof setInterval>>());
  const watchers = useRef(new Map<number, AbortController>());
  const closing = useRef<AbortController | null>(null);
  const counter = useRef(0);
  const settled = useRef(new Set<number>()); // jobs whose ending has been taken: a job ends once
  const latest = useRef({ api, tr, qc });
  latest.current = { api, tr, qc };

  useEffect(() => {
    const own = new AbortController();
    closing.current = own;
    const running = clocks.current;
    return () => {
      for (const clock of running.values()) clearInterval(clock);
      running.clear();
      for (const job of Object.values(book.current)) {
        if (job.phase.kind === 'counting') void deliver(job);
      }
      own.abort();
    };
  }, []);

  // A page that closes mid-send asks first: the countdown has not sent yet, and a send in flight may not have been marked.
  const anyActive = Object.values(jobs).some(isActive);
  useEffect(() => {
    if (!anyActive) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [anyActive]);

  const put = (job: OutboxJob) => { book.current = { ...book.current, [job.ticketId]: job }; setJobs(book.current); };
  const take = (ticketId: string) => {
    const { [ticketId]: gone, ...rest } = book.current;
    if (gone) settled.current.delete(gone.id);
    book.current = rest;
    setJobs(rest);
  };
  /** Changes a job, if it is still the one that was asked about. */
  const change = (job: OutboxJob, f: (j: OutboxJob) => OutboxJob) => {
    const now = book.current[job.ticketId];
    if (now?.id === job.id) put(f(now));
  };
  const setPhase = (job: OutboxJob, phase: JobPhase) => change(job, (j) => ({ ...j, phase }));
  const stop = (ticketId: string) => {
    const clock = clocks.current.get(ticketId);
    if (clock !== undefined) clearInterval(clock);
    clocks.current.delete(ticketId);
  };

  const refresh = (ticketId: string) => Promise.all([
    latest.current.qc.invalidateQueries({ queryKey: keys.thread(ticketId) }),
    latest.current.qc.invalidateQueries({ queryKey: keys.drafts }),
    latest.current.qc.invalidateQueries({ queryKey: keys.tasks }),
    latest.current.qc.invalidateQueries({ queryKey: keys.ticket(ticketId) }),
    latest.current.qc.invalidateQueries({ queryKey: ['tickets'] }),
    latest.current.qc.invalidateQueries({ queryKey: ['ticket-count'] }),
  ]);

  const fail = (job: OutboxJob, text: string) => setPhase(job, { kind: 'failed', text });

  /** Why a send that did not happen did not: the draft is read again, since the run's own words are not the person's. */
  async function refusedBecause(draftId: string, reason: unknown): Promise<string> {
    const { api: desk, tr: say } = latest.current;
    if (!['changed', 'edited', 'superseded'].includes(String(reason))) return say('notSentFailed');
    try {
      return (await desk.reply(draftId)).status === 'draft' ? say('notSentChanged') : say('notSentAlready');
    } catch (e) {
      return isDeskError(e, 'not_found') ? say('notSentGone') : say('notSentChanged');
    }
  }

  async function failedBecause(draftId: string): Promise<string> {
    const { api: desk, tr: say } = latest.current;
    try {
      await desk.reply(draftId);
      return say('notSentFailed');
    } catch (e) {
      return isDeskError(e, 'not_found') ? say('notSentGone') : say('notSentFailed');
    }
  }

  /** The reply has gone. When it went in time, and the choice asks for it, the ticket is marked; then the job is done. */
  async function sent(job: OutboxJob, mark: boolean) {
    const { api: desk, tr: say, qc: cache } = latest.current;
    change(job, (j) => ({ ...j, sent: true }));
    // A send confirmed late is never marked; when the person asked for a mark, that is what they need to be told.
    let text = say(!mark && markOf(job.choice) !== null ? 'sentLateNotMarked' : 'sentDone');
    const action = mark ? markOf(job.choice) : null;
    if (action) {
      try {
        if (!job.meId) throw new Error('not signed in');
        // The task as the page knows it now: ten seconds is long enough for it to have been claimed, or marked.
        const task = cache.getQueryData<QueueTask[]>(keys.tasks)?.find((t) => t.ticketId === job.ticketId) ?? job.task;
        const marked = await markTask(desk, task, job.meId, action);
        text = marked === 'customer_wrote'
          ? say('sentNotMarkedCustomerWrote')
          : say(action === 'waiting' ? 'sentMarkedWaiting' : 'sentMarkedSolved');
      } catch (e) {
        text = say('sentNotMarked', { why: errorText(say, e) });
      }
    }
    await refresh(job.ticketId);
    setPhase(job, { kind: 'done', text });
  }

  async function conclude(job: OutboxJob, result: Extract<RunResult, { state: 'done' }>, mark: boolean) {
    if (settled.current.has(job.id) || book.current[job.ticketId]?.id !== job.id) return;
    settled.current.add(job.id);
    if (result.status !== 'completed') fail(job, await failedBecause(job.draftId));
    else if (result.output.status === 'sent') return sent(job, mark);
    else if (result.output.status === 'skipped') fail(job, await refusedBecause(job.draftId, result.output.skip_reason));
    else fail(job, latest.current.tr('notSentFailed'));
    await refresh(job.ticketId);
  }

  /** Takes a job's ending, unless it has been taken. */
  async function ending(job: OutboxJob, how: () => Promise<void> | void) {
    if (settled.current.has(job.id) || book.current[job.ticketId]?.id !== job.id) return;
    settled.current.add(job.id);
    await how();
  }

  /** A send the desk could not follow to its end: look at the run, and at the draft, until one of them says. */
  async function watch(job: OutboxJob, run: { id: string | null }) {
    // The desk has been left: nobody is here to be told how it went.
    if (closing.current?.signal.aborted) return;
    const { api: desk, tr: say } = latest.current;
    const own = new AbortController();
    watchers.current.set(job.id, own);
    const onClose = () => own.abort();
    closing.current?.signal.addEventListener('abort', onClose, { once: true });
    const { signal } = own;
    const until = Date.now() + PENDING_WATCH_MS;
    try {
      while (Date.now() < until) {
        await sleep(PENDING_POLL_MS, signal);
        // Someone else has ended it (a late answer to the start, or the draft showing it): nothing left to look for.
        const now = book.current[job.ticketId];
        if (now?.id !== job.id || now.phase.kind !== 'pending') return;
        const read = run.id ? await desk.run(run.id).catch(() => null) : null;
        if (signal.aborted) return;
        if (read?.state === 'done') return await conclude(job, read, false);
        try {
          const draft = await desk.reply(job.draftId);
          if (signal.aborted) return;
          if (draft.status === 'sending' || draft.status === 'sent') return await ending(job, () => sent(job, false));
          if (draft.status === 'failed') return await ending(job, async () => fail(job, say('notSentFailed')));
          // The claim will refuse a draft that has moved on.
          if (draft.status === 'draft' && draft.version !== job.version) return await ending(job, async () => fail(job, say('notSentChanged')));
        } catch (e) {
          if (isDeskError(e, 'not_found')) return await ending(job, async () => fail(job, say('notSentGone')));
          // Anything else is the connection: the next look is another try.
        }
      }
    } catch (e) {
      if (!isAbort(e)) throw e;
    } finally {
      closing.current?.signal.removeEventListener('abort', onClose);
      watchers.current.delete(job.id);
    }
  }

  async function deliver(job: OutboxJob) {
    // Not tied to the desk being open: a send that has begun goes to its end, mark included, even once the desk is left.
    const { api: desk, tr: say } = latest.current;
    setPhase(job, { kind: 'sending' });
    const startedAt = Date.now();
    const asked = desk.start('send_reply', job.draftId, { version: job.version }, SEND_WAIT_MS);
    // An answer that never comes must not keep the person waiting for ever: after the wait the desk stops holding its breath.
    const patience = new AbortController();
    let started: RunResult | null;
    try {
      started = await Promise.race([asked, sleep(SEND_WAIT_MS, patience.signal).then(() => null)]);
    } catch (e) {
      // A draft deleted before the run could start: the start itself is refused.
      return fail(job, isDeskError(e, 'invalid') && e.code === 'SUBJECT_BINDING_MISMATCH'
        ? say('notSentGone')
        : say('notSentError', { why: errorText(say, e) }));
    } finally {
      patience.abort();
    }
    const run: { id: string | null } = { id: null };
    if (started === null) {
      // No answer yet: the send may be under way. Look at the draft, and take the answer up if it comes late.
      change(job, (j) => ({ ...j, late: true, phase: { kind: 'pending' } }));
      void asked.then((late) => {
        if (late.state === 'running') run.id = late.runId;
        else void conclude(job, late, false);
      }, () => undefined);
      return watch(job, run);
    }
    let result: RunResult = started;
    if (started.state === 'running') {
      run.id = started.runId;
      // Send's claim runs on a worker, so the start almost always answers "running": wait for the end.
      try {
        result = await desk.waitForRun(started.runId, { timeoutMs: Math.max(0, SEND_WAIT_MS - (Date.now() - startedAt)) });
      } catch {
        // The reading of the run failed, not the send: it is under way and unknown, which is what "pending" is for.
      }
    }
    if (result.state === 'running') {
      // Not known to have gone. Mark nothing; the box stays shut until the draft stops being a draft.
      change(job, (j) => ({ ...j, late: true, phase: { kind: 'pending' } }));
      return watch(job, run);
    }
    await conclude(job, result, true);
  }

  function tick(job: OutboxJob, own: ReturnType<typeof setInterval>) {
    // Only the newest countdown of a ticket may tick or send: an older one that outlived an Undo would send early.
    const current = book.current[job.ticketId];
    if (clocks.current.get(job.ticketId) !== own || current?.id !== job.id || current.phase.kind !== 'counting') {
      clearInterval(own);
      return;
    }
    const left = Math.ceil((job.endsAt - Date.now()) / 1000);
    if (left > 0) {
      if (current.phase.left !== left) setPhase(current, { kind: 'counting', left });
      return;
    }
    clearInterval(own);
    clocks.current.delete(job.ticketId);
    void deliver(current);
  }

  const control: OutboxControl = {
    jobs: Object.values(jobs),
    job: (ticketId) => book.current[ticketId],
    start(input) {
      if (closing.current?.signal.aborted) return false; // the page has been closed; there is no one to send for
      const existing = book.current[input.ticketId];
      if (existing && isActive(existing)) return false;
      stop(input.ticketId);
      const job: OutboxJob = {
        ...input, id: ++counter.current, endsAt: Date.now() + UNDO_SEND_MS, sent: false, late: false,
        phase: { kind: 'counting', left: Math.ceil(UNDO_SEND_MS / 1000) },
      };
      put(job);
      const own: ReturnType<typeof setInterval> = setInterval(() => tick(job, own), TICK_MS);
      clocks.current.set(input.ticketId, own);
      return true;
    },
    refuse(ticketId, ticketName, text) {
      if (closing.current?.signal.aborted) return;
      // A box that was left finishes its check or its save after the person came back and started a send of their own:
      // its refusal is about a send nobody is waiting for now, and must not cancel the one they are.
      const existing = book.current[ticketId];
      if (existing && isActive(existing)) return;
      stop(ticketId);
      put({
        id: ++counter.current, ticketId, ticketName, draftId: '', version: 0, choice: 'send', task: null, meId: '', endsAt: 0,
        phase: { kind: 'failed', text }, sent: false, late: false,
      });
    },
    undo(ticketId) {
      if (book.current[ticketId]?.phase.kind !== 'counting') return;
      stop(ticketId);
      take(ticketId);
    },
    dismiss(ticketId) {
      const job = book.current[ticketId];
      if (!job || job.phase.kind === 'counting' || job.phase.kind === 'sending') return;
      watchers.current.get(job.id)?.abort();
      take(ticketId);
    },
  };
  // The functions only touch refs and setters, so which render's are in the value does not matter; `jobs` is what changes.
  const value = useMemo(() => control, [jobs]);

  return <OutboxContext.Provider value={value}>{children}</OutboxContext.Provider>;
}

/** Of the sends that are not counting down, the bar shows this many at most, the newest; a count says how many more there are. */
const BAR_ROWS = 3;

/**
 * The sends of tickets that are not open, one line each: the countdown with Undo, or how it went, and a way to the ticket.
 * A send that went well is let go of a few seconds after it first shows here; one that failed, or is not known to have
 * gone, stays until the person closes it. Of those, at most the newest few show, so a run of sends cannot fill the
 * screen; a countdown always shows, because its Undo must stay in reach.
 */
export function OutboxBar() {
  const tr = useT();
  const outbox = useOutbox();
  const route = useRoute();
  const navigate = useNavigate();
  const open = route.screen === 'queue' ? route.ticketId : null;
  const folder = route.screen === 'queue' ? route.folder : 'open';
  const [letGo, setLetGo] = useState<ReadonlySet<number>>(() => new Set());
  const lingering = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const notOpen = outbox.jobs.filter((j) => j.ticketId !== open);

  useEffect(() => {
    for (const j of notOpen) {
      if (j.phase.kind !== 'done' || lingering.current.has(j.id)) continue;
      lingering.current.set(j.id, setTimeout(() => setLetGo((gone) => new Set(gone).add(j.id)), OUTBOX_DONE_LINGER_MS));
    }
  });
  useEffect(() => () => {
    for (const timer of lingering.current.values()) clearTimeout(timer);
    lingering.current.clear();
  }, []);

  const rows = notOpen.filter((j) => !letGo.has(j.id)).sort((a, b) => a.id - b.id);
  if (!rows.length) return null;
  const others = rows.filter((j) => j.phase.kind !== 'counting');
  const kept = new Set(others.slice(-BAR_ROWS));
  const shown = rows.filter((j) => j.phase.kind === 'counting' || kept.has(j));
  const more = others.length - kept.size;
  return (
    <>
      {shown.map((j) => {
        const { phase } = j;
        const status = statusAfter(j.choice);
        const text = phase.kind === 'counting'
          ? (status ? tr('countdownMark', { name: j.ticketName, s: phase.left, status: tr(status) }) : tr('countdown', { name: j.ticketName, s: phase.left }))
          : phase.kind === 'sending' ? tr('outboxSending', { name: j.ticketName })
          : phase.kind === 'pending' ? tr('outboxPending', { name: j.ticketName })
          : `${j.ticketName} · ${phase.text}`;
        return (
          <div key={j.ticketId} className="undo" role="status" style={{ margin: '8px 20px 0' }}>
            <span>{text}</span>
            <span style={{ display: 'flex', gap: 6 }}>
              {phase.kind === 'counting' && <button onClick={() => outbox.undo(j.ticketId)}>{tr('undo')}</button>}
              <button onClick={() => navigate({ screen: 'queue', folder, ticketId: j.ticketId })}>{tr('outboxOpen')}</button>
              {phase.kind !== 'counting' && phase.kind !== 'sending' && <button onClick={() => outbox.dismiss(j.ticketId)}>{tr('close')}</button>}
            </span>
          </div>
        );
      })}
      {more > 0 && <div className="small muted" style={{ margin: '4px 20px 0' }}>{tr('outboxMore', { n: more })}</div>}
    </>
  );
}
