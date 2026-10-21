import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { QueueTask } from '../../api/desk-api.js';
import { useDesk, useT } from '../../data/desk-context.js';
import { useMe } from '../../data/hooks.js';
import { keys } from '../../data/keys.js';
import { instantMs } from '../../model/instant.js';
import { newestCustomerAt } from '../../model/thread.js';
import type { Ticket } from '../../model/types.js';
import { formatWhen } from '../../model/when.js';
import { isActive, useOutbox, type OutboxJob, type SendChoice } from '../../outbox/Outbox.js';
import type { DraftState } from './useDraft.js';

export type { SendChoice };
export type SendPhase =
  | { kind: 'idle' }
  | { kind: 'checking'; choice: SendChoice }
  | { kind: 'paused'; choice: SendChoice; newestAt: string }
  | { kind: 'counting'; choice: SendChoice; left: number }
  | { kind: 'sending'; choice: SendChoice }
  /** The send outlasted the desk's wait. It may still go out: the outbox keeps looking, and the box stays shut. */
  | { kind: 'pending' }
  | { kind: 'done'; text: string }
  | { kind: 'failed'; text: string };

const DEFAULT_KEY = 'support-desk:send-default';
const CHOICES: SendChoice[] = ['send', 'send_waiting', 'send_solved', 'send_next'];
/** What the drafting agent is asked when the customer wrote again while a reply was being checked. */
const ALSO_ANSWER_NEWEST = 'Also answer the customer\'s newest message.';

function readDefault(): SendChoice {
  try {
    const v = window.localStorage.getItem(DEFAULT_KEY);
    return CHOICES.includes(v as SendChoice) ? (v as SendChoice) : 'send';
  } catch {
    return 'send';
  }
}
function writeDefault(c: SendChoice) {
  try {
    window.localStorage.setItem(DEFAULT_KEY, c);
  } catch {
    // The default then lasts only this page view.
  }
}

/** From the first press until the reply is known to have gone: nothing may be sent again, and nothing edited. */
export const isSending = (p: SendPhase) =>
  p.kind === 'checking' || p.kind === 'paused' || p.kind === 'counting' || p.kind === 'sending' || p.kind === 'pending';

type Before = { kind: 'idle' } | { kind: 'checking'; choice: SendChoice } | { kind: 'paused'; choice: SendChoice; newestAt: string };

function phaseOf(job: OutboxJob): SendPhase {
  const { phase } = job;
  switch (phase.kind) {
    case 'counting': return { kind: 'counting', choice: job.choice, left: phase.left };
    case 'sending': return { kind: 'sending', choice: job.choice };
    case 'pending': return { kind: 'pending' };
    case 'done': return { kind: 'done', text: phase.text };
    case 'failed': return { kind: 'failed', text: phase.text };
  }
}

interface SendOptions {
  ticket: Ticket;
  /** Who the reply is to, for the one line the desk shows when this ticket is not open. */
  ticketName: string;
  task: QueueTask | null;
  draft: DraftState;
  /** The reply is not this person's to send now: a redraft is being written, or it hasn't loaded. */
  blocked: boolean;
  /** The newest customer message this person has seen ('' when none); null until the thread has loaded. */
  seenCustomerAt: string | null;
  acknowledge(at: string): void;
  openNext(): void;
}

/**
 * Sending, from the box's side: check the customer hasn't written again, save and pin the draft's version, and
 * hand the reply to the outbox, which counts the ten seconds, sends, marks, and says how it went, whether or not
 * this box is still on the screen. What this hook keeps is what only an open ticket can do: ask the person about a
 * customer who wrote again, and clear its draft once the reply has gone.
 */
export function useSend(options: SendOptions) {
  const { api, lang } = useDesk();
  const tr = useT();
  const qc = useQueryClient();
  const me = useMe().data;
  const outbox = useOutbox();
  const [before, setBeforeState] = useState<Before>({ kind: 'idle' });
  const beforeRef = useRef(before);
  const [defaultChoice, setDefaultChoice] = useState(readDefault);
  // The latest of everything, for what runs after an await: the person may have left, and the page moved on.
  const latest = useRef({ options, me, outbox });
  latest.current = { options, me, outbox };
  const mounted = useRef(true);
  const setBefore = (b: Before) => { beforeRef.current = b; setBeforeState(b); };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const job = outbox.job(options.ticket.id);
  const phase: SendPhase = job ? phaseOf(job) : before;

  // The reply for this ticket has gone: this box clears its draft.
  const cleared = useRef(0);
  useEffect(() => {
    if (!job?.sent || !options.draft.ready || cleared.current === job.id) return;
    cleared.current = job.id;
    // Only the draft that was sent is cleared away. A newer one (the AI's answer to the customer's next message) is not
    // this job's to empty, however often the ticket is opened while "Sent." is still up.
    const shown = options.draft.draft;
    if (shown !== null && shown.id !== job.draftId) return;
    options.draft.reset();
  }, [job?.id, job?.sent, options.draft.ready]);

  // "Send and open next ticket", for a person who was here for it: not one who has gone elsewhere since, nor a send
  // that was only known to have gone late.
  const watched = useRef(0);
  const opened = useRef(0);
  useEffect(() => {
    if (!job) return;
    if (isActive(job)) watched.current = job.id;
    else if (job.phase.kind === 'done' && job.choice === 'send_next' && !job.late && watched.current === job.id && opened.current !== job.id) {
      opened.current = job.id;
      options.openNext();
      outbox.dismiss(options.ticket.id);
    }
  }, [job?.id, job?.phase.kind]);

  /** Whether a send may begin from this box now. */
  function may() {
    const { options: o, outbox: out } = latest.current;
    const current = out.job(o.ticket.id);
    return !o.blocked && beforeRef.current.kind === 'idle' && !(current && isActive(current))
      && o.draft.text.trim() !== '' && o.ticket.requesterId !== null;
  }

  async function begin(choice: SendChoice, checkFirst: boolean) {
    const { ticket, ticketName } = latest.current.options;
    const refuse = (text: string) => {
      setBefore({ kind: 'idle' });
      latest.current.outbox.refuse(ticket.id, ticketName, text);
    };
    setBefore({ kind: 'checking', choice });
    try {
      if (checkFirst) {
        let fresh;
        try {
          fresh = await qc.fetchQuery({ queryKey: keys.thread(ticket.id), queryFn: () => api.thread(ticket.id), staleTime: 0 });
        } catch {
          return refuse(tr('pauseCheckFailed')); // not the draft: it is the look for new messages that failed
        }
        const newest = newestCustomerAt(fresh.replies);
        const seen = latest.current.options.seenCustomerAt;
        if (newest && seen !== null && (instantMs(newest) ?? 0) > (instantMs(seen) ?? Number.NEGATIVE_INFINITY)) {
          if (mounted.current) setBefore({ kind: 'paused', choice, newestAt: newest });
          // The person has gone to another ticket: there is no box to ask in, so it is said where they will see it.
          else refuse(`${tr('paused')} ${tr('pausedWhy', { name: ticketName, at: formatWhen(newest, new Date(), lang) })}`);
          return;
        }
      }
      const saved = await latest.current.options.draft.flush();
      if (!saved) throw new Error('no draft');
      const { options: o, me: who, outbox: out } = latest.current;
      setBefore({ kind: 'idle' });
      out.start({ ticketId: o.ticket.id, ticketName: o.ticketName, draftId: saved.id, version: saved.version, choice, task: o.task, meId: who?.id ?? '' });
    } catch {
      refuse(tr('notSentUnsaved'));
    }
  }

  return {
    phase,
    defaultChoice,
    send(choice: SendChoice = defaultChoice) {
      if (may()) void begin(choice, true);
    },
    pick(choice: SendChoice) {
      setDefaultChoice(choice);
      writeDefault(choice);
      if (may()) void begin(choice, true);
    },
    undo() {
      outbox.undo(options.ticket.id);
    },
    sendAnyway() {
      const p = beforeRef.current;
      if (p.kind !== 'paused' || latest.current.options.blocked) return;
      options.acknowledge(p.newestAt);
      void begin(p.choice, false);
    },
    redraftWithIt() {
      const p = beforeRef.current;
      if (p.kind !== 'paused' || latest.current.options.blocked) return;
      options.acknowledge(p.newestAt);
      setBefore({ kind: 'idle' });
      void options.draft.redraft(ALSO_ANSWER_NEWEST, 'redraftWithIt');
    },
    /** Closes what the last send said, or lets go of a send that never landed. */
    dismiss() {
      const current = latest.current.outbox.job(options.ticket.id);
      if (current && (current.phase.kind === 'done' || current.phase.kind === 'failed' || current.phase.kind === 'pending')) {
        latest.current.outbox.dismiss(options.ticket.id);
      }
    },
  };
}
