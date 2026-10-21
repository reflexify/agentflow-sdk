import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { DeskError, isDeskError, type DeskErrorKind } from '../../api/desk-api.js';
import { useDesk, useT } from '../../data/desk-context.js';
import { keys } from '../../data/keys.js';
import { withDraftText } from '../../model/text-tools.js';
import { draftOf } from '../../model/thread.js';
import { AUTOSAVE_MS, OFFLINE_RETRY_MS, REDRAFT_TIMEOUT_MS } from '../../model/timing.js';
import type { FileRef, Note, Reply } from '../../model/types.js';
import { errorText } from '../messages.js';
import type { TextKey } from '../../text.js';
import { storeDraft, storedBase, storedDraft } from './draft-storage.js';

export type SaveState = 'idle' | 'saving' | 'saved' | 'offline' | 'failed';

type ThreadData = { replies: Reply[]; notes: Note[] };

/** Someone else's version of the draft, which the person's unsaved text now stands against. */
export interface DraftConflict {
  /** Who saved it; null when nobody is named. */
  by: string | null;
  /** The text is the AI's own: a redraft, not a person's edit. */
  byAi: boolean;
  theirs: Reply;
}
const conflictOf = (theirs: Reply): DraftConflict => ({
  by: theirs.authorUserName, byAi: theirs.aiBody !== null && theirs.body === theirs.aiBody, theirs,
});

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

/**
 * The reply draft of one ticket, and the rules that keep the person's words safe:
 * 1. Their text wins until they choose: it is kept in `sessionStorage` on every keystroke and removed only once
 *    the server holds exactly that text. A refetch never overwrites unsaved text.
 * 2. A save names its writer (`author_user`), so when someone else's save lands the desk can say who, and offer
 *    Keep mine or Use theirs.
 * 3. No unsaved edits, no question: the server's new text is taken quietly.
 * 4. Offline is not an error: a save that can't reach the server waits and goes again.
 * 5. A lost session keeps the text, and the composer saves it on the way back.
 */
export function useDraft(ticketId: string, meId: string, replies: Reply[] | undefined) {
  const { api } = useDesk();
  const tr = useT();
  const qc = useQueryClient();
  // undefined: not loaded yet; null: the ticket has no draft.
  const server = replies === undefined ? undefined : draftOf(replies, ticketId);

  const [text, setTextState] = useState(() => storedDraft(meId, ticketId) ?? '');
  const textRef = useRef(text);
  const base = useRef<Reply | null>(null); // the server draft our text was last read from or saved to
  const saved = useRef<string | null>(null); // `base`'s body; null until the thread first loads
  const inFlight = useRef<string | null>(null);
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timerPending = useRef(false);
  const latest = useRef({ meId });
  latest.current = { meId };
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [conflict, setConflictState] = useState<DraftConflict | null>(null);
  const conflictRef = useRef(conflict);
  const [drafting, setDraftingState] = useState<{ instruction: string; label: TextKey | null } | null>(null);
  const draftingRef = useRef(drafting);
  const redrafting = useRef<AbortController | undefined>(undefined);
  const [undoText, setUndoText] = useState<string | null>(null);
  const [redraftError, setRedraftError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  // Why the last save failed, and whether saving again by itself can help (a refusal will not change its mind).
  const [saveError, setSaveError] = useState<{ retrying: boolean; why: string } | null>(null);
  // Someone else sent the draft this person was writing on.
  const [sentBy, setSentBy] = useState<{ name: string | null } | null>(null);
  const mounted = useRef(true);

  const setText = (next: string) => { textRef.current = next; setTextState(next); };
  const setConflict = (c: DraftConflict | null) => { conflictRef.current = c; setConflictState(c); };
  const setDrafting = (d: { instruction: string; label: TextKey | null } | null) => { draftingRef.current = d; setDraftingState(d); };
  const unsaved = () => saved.current !== null && textRef.current !== saved.current;

  /** Runs `job` after every job before it, so two saves of one draft never overlap and stale each other. */
  function exclusive<T>(job: () => Promise<T>): Promise<T> {
    const run = chain.current.then(job, job);
    chain.current = run.catch(() => undefined);
    return run;
  }

  /** Takes the server's record as the draft our text stands on, keeping the file names a save's answer leaves out. */
  function remember(r: Reply, uploaded: FileRef[] = []) {
    const known = new Map([...(base.current?.attachments ?? []), ...uploaded].map((a) => [a.id, a.name]));
    const next: Reply = { ...r, attachments: r.attachments.map((a) => ({ id: a.id, name: a.name === 'file' ? (known.get(a.id) ?? a.name) : a.name })) };
    base.current = next;
    saved.current = next.body;
    // What is still unsaved now stands on this version of the draft.
    if (textRef.current !== next.body) storeDraft(meId, ticketId, textRef.current, next.updatedAt);
    // Keep the cached thread in step, so its refetch is not mistaken for someone else's edit.
    qc.setQueryData<ThreadData>(keys.thread(ticketId), (old) => (old ? { ...old, replies: [...old.replies.filter((x) => x.id !== next.id), next] } : old));
  }

  /** Takes `r` (or no draft) as the text, the way a person who had nothing unsaved gets a teammate's. */
  function adopt(r: Reply | null) {
    base.current = r;
    saved.current = r?.body ?? '';
    setText(saved.current);
    storeDraft(meId, ticketId, null);
  }

  function schedule(ms = AUTOSAVE_MS) {
    clearTimeout(timer.current);
    timerPending.current = true;
    timer.current = setTimeout(() => { timerPending.current = false; void save(); }, ms);
  }

  /** The draft is gone from under the text (sent, or deleted): the text becomes the ticket's next draft. */
  function startOver() {
    base.current = null;
    saved.current = '';
    storeDraft(meId, ticketId, textRef.current, null);
    setState('idle');
    // A person who has left is not saved a draft they did not ask for: the text waits for them, and is asked about next time.
    if (mounted.current) schedule(0);
  }

  async function createOrAdopt(body: string): Promise<Reply | null> {
    try {
      return await api.createDraft({ ticketId, body, authorUserId: latest.current.meId });
    } catch (e) {
      if (!isDeskError(e, 'conflict')) throw e;
      // Someone (or the drafting agent) created the draft a moment ago.
      const fresh = await qc.fetchQuery({ queryKey: keys.thread(ticketId), queryFn: () => api.thread(ticketId), staleTime: 0 });
      const theirs = draftOf(fresh.replies, ticketId);
      if (!theirs) throw e;
      if (theirs.body === body) return theirs;
      base.current = theirs;
      saved.current = theirs.body;
      setConflict(conflictOf(theirs));
      return null;
    }
  }

  async function doSave(): Promise<void> {
    const { meId: me } = latest.current;
    if (conflictRef.current || saved.current === null || !me) return;
    const body = textRef.current;
    if (body === saved.current) return;
    setState('saving');
    inFlight.current = body;
    const used = base.current; // what this save is written onto, whatever a push does to `base` meanwhile
    try {
      const next = used ? await api.saveDraft(used, { body }, me) : await createOrAdopt(body);
      if (!next) {
        setState('idle');
        return;
      }
      remember(next);
      if (textRef.current === next.body) storeDraft(meId, ticketId, null);
      setState('saved');
      setSaveError(null);
      setSavedAt(Date.now());
    } catch (e) {
      if (isDeskError(e, 'stale') && used) {
        const theirs = await api.reply(used.id).catch(() => null);
        if (!theirs) {
          // Not knowing what is there is not the same as the draft being sent: try again.
          setState('failed');
          setSaveError({ retrying: true, why: errorText(tr, e) });
        } else if (theirs.status === 'draft') {
          setConflict(conflictOf(theirs));
          setState('idle');
        } else {
          setSentBy({ name: theirs.authorUserName });
          startOver(); // it was sent meanwhile
        }
      } else if (isDeskError(e, 'not_found') && used) {
        startOver();
      } else if (isDeskError(e, 'offline')) {
        setState('offline');
      } else {
        const kind: DeskErrorKind | null = isDeskError(e) ? e.kind : null;
        setState('failed');
        setSaveError({ retrying: kind !== 'forbidden' && kind !== 'invalid', why: errorText(tr, e) });
      }
    } finally {
      inFlight.current = null;
    }
  }

  const save = () => exclusive(doSave);

  // The server's draft arrived, or changed.
  useEffect(() => {
    if (server === undefined) return;
    if (saved.current === null) {
      base.current = server;
      saved.current = server?.body ?? '';
      setReady(true);
      if (storedDraft(meId, ticketId) === null) setText(saved.current);
      else if (textRef.current !== saved.current) {
        // Unsaved text from before a sign-in or a reload. It goes back to the server only if the draft is still the one
        // it was typed on, or is gone; if someone changed the draft meanwhile, that is a choice for the person.
        const was = storedBase(meId, ticketId);
        if (server && was !== undefined && was !== server.updatedAt) setConflict(conflictOf(server));
        else schedule(0);
      } else storeDraft(meId, ticketId, null);
      return;
    }
    if (server?.updatedAt === base.current?.updatedAt) return;
    if (server && inFlight.current !== null && server.body === inFlight.current) return; // our own save, early
    if (draftingRef.current && server) {
      finishRedraft(server);
      return;
    }
    if (!unsaved()) {
      adopt(server);
      return;
    }
    if (server) setConflict(conflictOf(server));
    else {
      // Sent from elsewhere while this person typed: keep the text as the next draft, and say so.
      const was = base.current;
      const gone = was ? replies?.find((r) => r.id === was.id) : undefined;
      if (gone && gone.status !== 'draft') setSentBy({ name: gone.authorUserName });
      base.current = null;
      saved.current = '';
      storeDraft(meId, ticketId, textRef.current, null);
      schedule(0);
    }
  }, [server?.id, server?.updatedAt, server === null, server === undefined]);

  // A save held back until there was someone to name as the writer goes once there is.
  useEffect(() => {
    if (meId && unsaved()) schedule(0);
  }, [meId]);

  // Offline: try again when the browser says it's back, and every 10 seconds anyway.
  const retryable = state === 'offline' || (state === 'failed' && saveError?.retrying !== false);
  useEffect(() => {
    if (!retryable) return;
    const retry = () => void save();
    window.addEventListener('online', retry);
    const id = setInterval(retry, OFFLINE_RETRY_MS);
    return () => {
      window.removeEventListener('online', retry);
      clearInterval(id);
    };
  }, [retryable]);

  // Leaving the ticket: the last half second of typing is saved, and a redraft is no longer waited on.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
      if (timerPending.current) void save();
      redrafting.current?.abort();
    };
  }, []);

  async function flush(): Promise<Reply | null> {
    clearTimeout(timer.current);
    timerPending.current = false;
    await save();
    if (conflictRef.current || unsaved()) throw new DeskError('failed', 0, 'NOT_SAVED');
    return base.current;
  }

  /** The draft the next change goes onto, made from the text so far when the ticket has none yet. */
  async function ensureDraft(): Promise<Reply> {
    if (!base.current) {
      const created = await createOrAdopt(textRef.current);
      if (!created) throw new DeskError('conflict', 409, 'DRAFT_TAKEN');
      remember(created);
    }
    return base.current!;
  }

  /** The redraft arrived: its text replaces the draft, and the wait for it ends. */
  function finishRedraft(next: Reply | null) {
    redrafting.current?.abort();
    redrafting.current = undefined;
    setDrafting(null);
    if (next) adopt(next);
  }

  function metaFailed(e: unknown) {
    if (isDeskError(e, 'stale')) void qc.invalidateQueries({ queryKey: keys.thread(ticketId) });
    setMetaError(errorText(tr, e));
  }

  return {
    text,
    /** The thread has loaded, so what the box shows is the ticket's draft and typing in it can't bury one. */
    ready,
    state,
    savedAt,
    conflict,
    drafting,
    undoText,
    redraftError,
    /** Attachments or Cc that couldn't be saved. */
    metaError,
    /** The last save failed for a reason other than being offline; `retrying` is whether it will be tried again by itself. */
    saveError: state === 'failed' ? saveError : null,
    /** Text that has not reached the server, whatever the reason (a save under way, held, or waiting on a choice). */
    dirty: ready && text !== saved.current,
    /** Someone sent the draft this text was written on; the text is kept as a new draft. */
    sentBy,
    dismissSentBy() { setSentBy(null); },
    draft: server ?? null,
    edit(next: string) {
      setText(next);
      storeDraft(meId, ticketId, next === saved.current ? null : next, base.current?.updatedAt ?? null);
      schedule();
    },
    resolveConflict(choice: 'mine' | 'theirs') {
      const c = conflictRef.current;
      if (!c) return;
      setConflict(null);
      if (choice === 'theirs') {
        adopt(c.theirs);
        setState('idle');
      } else {
        base.current = c.theirs;
        saved.current = c.theirs.body;
        storeDraft(meId, ticketId, textRef.current, c.theirs.updatedAt);
        void save();
      }
    },
    async redraft(instruction: string, label: TextKey | null = null) {
      if (draftingRef.current) return;
      setRedraftError(null);
      try {
        await flush();
      } catch {
        return; // nothing is sent to the agent while the person's text is unsaved
      }
      const current = textRef.current;
      const own = new AbortController();
      redrafting.current = own;
      setUndoText(current);
      setDrafting({ instruction, label });
      const gaveUp = (message: string) => {
        finishRedraft(null);
        setUndoText(null); // nothing was redrafted, so there is nothing to undo
        setRedraftError(message);
      };
      try {
        // The drafting agent never reads the saved draft, so the text to revise goes with the instruction.
        const started = await api.start('draft_reply', ticketId, { instruction: withDraftText(instruction, current) }, null);
        const result = started.state === 'running'
          ? await api.waitForRun(started.runId, { timeoutMs: REDRAFT_TIMEOUT_MS, signal: own.signal })
          : started;
        if (own.signal.aborted) return;
        if (result.state === 'running') return gaveUp(tr('redraftSlow'));
        if (result.status !== 'completed') return gaveUp(tr('redraftFailedGeneric'));
        if (result.outcome === 'Not saved') return gaveUp(tr('redraftNotSaved'));
        // It is saved; a live push may have shown it already, and this makes sure.
        const fresh = await qc.fetchQuery({ queryKey: keys.thread(ticketId), queryFn: () => api.thread(ticketId), staleTime: 0 });
        if (own.signal.aborted) return;
        finishRedraft(draftOf(fresh.replies, ticketId));
      } catch (e) {
        if (isAbort(e) || own.signal.aborted) return; // adopted by a push, or the person left
        gaveUp(tr('redraftFailed', { why: errorText(tr, e) }));
      }
    },
    undoRedraft() {
      if (undoText === null) return;
      const back = undoText;
      setUndoText(null);
      setText(back);
      storeDraft(meId, ticketId, back === saved.current ? null : back, base.current?.updatedAt ?? null);
      schedule(0);
    },
    async attach(files: File[]) {
      setMetaError(null);
      try {
        // The upload is outside the queue: a big file must not hold up the text's autosave.
        const uploaded = await Promise.all(files.map((f) => api.upload(f)));
        await exclusive(async () => {
          const draft = await ensureDraft();
          const next = await api.saveDraft(draft, { attachments: [...draft.attachments.map((a) => a.id), ...uploaded.map((u) => u.id)] }, latest.current.meId);
          remember(next, uploaded);
        });
      } catch (e) {
        metaFailed(e);
      }
    },
    async detach(attachmentId: string) {
      setMetaError(null);
      try {
        await exclusive(async () => {
          const draft = base.current;
          if (!draft) return;
          remember(await api.saveDraft(draft, { attachments: draft.attachments.filter((a) => a.id !== attachmentId).map((a) => a.id) }, latest.current.meId));
        });
      } catch (e) {
        metaFailed(e);
      }
    },
    async saveCc(cc: string) {
      const next = cc.trim() || null;
      setMetaError(null);
      try {
        await exclusive(async () => {
          if (next === (base.current?.cc ?? null)) return;
          remember(await api.saveDraft(await ensureDraft(), { cc: next }, latest.current.meId));
        });
      } catch (e) {
        metaFailed(e);
      }
    },
    flush,
    /** After a send: the composer starts empty and the ticket has no draft until the next one is written. */
    reset() {
      clearTimeout(timer.current);
      timerPending.current = false;
      setUndoText(null);
      setConflict(null);
      setSentBy(null);
      adopt(null);
      setState('idle');
    },
  };
}

export type DraftState = ReturnType<typeof useDraft>;
