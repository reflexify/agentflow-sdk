import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { isDeskError, type QueueTask } from '../../api/desk-api.js';
import { useDesk, useT } from '../../data/desk-context.js';
import { useCanned, useContact, useMe, usePeople, useThread } from '../../data/hooks.js';
import { useKeys } from '../../keys/KeyboardProvider.js';
import { intentLabel } from '../../model/autopilot.js';
import { fillPlaceholders, mentionAt } from '../../model/text-tools.js';
import { newestCustomerAt } from '../../model/thread.js';
import type { Person, Ticket } from '../../model/types.js';
import { formatWhen } from '../../model/when.js';
import { statusAfter } from '../../outbox/Outbox.js';
import type { TextKey } from '../../text.js';
import { AiBar, SHORTER } from './AiBar.js';
import { AttachButton, AttachedFiles } from './Attachments.js';
import { MentionMenu } from './MentionMenu.js';
import { SendButton } from './SendButton.js';
import { matchCanned, slashAt, SlashMenu } from './SlashMenu.js';
import { useDraft } from './useDraft.js';
import { useNoteDraft } from './useNoteDraft.js';
import { isSending, useSend } from './useSend.js';

interface ComposerProps { ticket: Ticket; task: QueueTask | null; now: Date; openNext(): void }

/**
 * What a person has typed and not saved is kept under their name, so the composer waits to know whose it is. When that
 * cannot be learned it says so, rather than leaving a gap where the reply box was. A lost session is left to the
 * banner above the screens, which says what to do about it.
 */
export function Composer(props: ComposerProps) {
  const tr = useT();
  const me = useMe();
  if (me.data) return <ComposerBody meId={me.data.id} {...props} />;
  if (me.isError && !isDeskError(me.error, 'signed_out')) {
    return (
      <div className="composer">
        <div className="banner bad" role="alert"><span>{tr('composerNoProfile')}</span></div>
      </div>
    );
  }
  return null;
}

function ComposerBody({ meId, ticket, task, now, openNext }: ComposerProps & { meId: string }) {
  const tr = useT();
  const { lang } = useDesk();
  const me = useMe().data;
  const people = usePeople().data ?? [];
  const canned = useCanned().data ?? [];
  const thread = useThread(ticket.id).data;
  const contact = useContact(ticket.requesterId).data;
  const draft = useDraft(ticket.id, meId, thread?.replies);
  const note = useNoteDraft(ticket.id, meId);
  const [mode, setMode] = useState<'reply' | 'note'>('reply');
  const [caret, setCaret] = useState(0);
  const [menuSel, setMenuSel] = useState(0);
  const [menuClosedAt, setMenuClosedAt] = useState<string | null>(null);
  const [showCc, setShowCc] = useState(false);
  const replyBox = useRef<HTMLTextAreaElement>(null);
  const noteBox = useRef<HTMLTextAreaElement>(null);
  const attachButton = useRef<HTMLButtonElement>(null);
  // Where the caret goes once the text a menu inserted has been drawn.
  const caretTo = useRef<{ box: 'reply' | 'note'; at: number } | null>(null);

  // The newest customer message this person has seen; a later one pauses Send.
  const [seenCustomerAt, setSeenCustomerAt] = useState<string | null>(null);
  useEffect(() => {
    if (seenCustomerAt === null && thread) setSeenCustomerAt(newestCustomerAt(thread.replies) ?? '');
  }, [thread, seenCustomerAt]);

  const name = contact?.name ?? contact?.email ?? ticket.requesterName ?? tr('someone');
  // The reply is not this person's to send, or to change, while a redraft is being written or it hasn't loaded.
  const blocked = draft.drafting !== null || !draft.ready;
  const send = useSend({
    ticket, ticketName: name, task, draft, blocked, seenCustomerAt,
    acknowledge: setSeenCustomerAt,
    openNext,
  });
  const sending = isSending(send.phase);
  const noRequester = ticket.requesterId === null;
  const replyReadOnly = blocked || sending;
  const ctx = { contact: { name: contact?.name ?? null, email: contact?.email ?? '', locale: contact?.locale ?? null }, ticket: { number: ticket.number }, agent: { name: me?.displayName ?? '' } };

  const slash = mode === 'reply' && !replyReadOnly ? slashAt(draft.text, caret) : null;
  const slashOpen = slash !== null && menuClosedAt !== draft.text;
  const slashMatches = slashOpen ? matchCanned(canned, slash.query) : [];
  const mention = mode === 'note' ? mentionAt(note.text, caret) : null;
  const mentionMatches: Person[] = mention && menuClosedAt !== note.text
    ? people.filter((p) => p.id !== me?.id && p.displayName.toLowerCase().includes(mention.query.toLowerCase())).slice(0, 6)
    : [];

  useLayoutEffect(() => {
    const target = caretTo.current;
    if (!target) return;
    caretTo.current = null;
    const el = target.box === 'reply' ? replyBox.current : noteBox.current;
    el?.setSelectionRange(target.at, target.at);
  });

  const toNote = () => { setMode('note'); setTimeout(() => noteBox.current?.focus(), 0); };
  const toReply = () => { setMode('reply'); setTimeout(() => replyBox.current?.focus(), 0); };

  /** Every change to the reply, typed or inserted, is the person writing it: it clears the last send's message. */
  function writeReply(next: string, at: number) {
    draft.edit(next);
    send.dismiss();
    setCaret(at);
    setMenuSel(0);
  }

  useKeys({
    reply: toReply,
    note: toNote,
    saved: () => {
      toReply();
      if (!replyReadOnly && (draft.text === '' || draft.text.endsWith('\n'))) writeReply(`${draft.text}/`, draft.text.length + 1);
    },
    send: () => (mode === 'note' ? void note.submit(people) : send.send()),
    sendWaiting: () => mode === 'reply' && send.send('send_waiting'),
    shorter: () => !replyReadOnly && void draft.redraft(SHORTER, 'tuneShorter'),
    escape: () => setMenuClosedAt(mode === 'reply' ? draft.text : note.text),
  });

  function insertCanned(body: string) {
    if (!slash) return;
    const filled = fillPlaceholders(body, ctx);
    caretTo.current = { box: 'reply', at: slash.start + filled.length };
    writeReply(draft.text.slice(0, slash.start) + filled + draft.text.slice(caret), slash.start + filled.length);
  }

  function insertMention(p: Person) {
    if (!mention) return;
    const inserted = `@${p.displayName} `;
    caretTo.current = { box: 'note', at: mention.start + inserted.length };
    note.setText(note.text.slice(0, mention.start) + inserted + note.text.slice(caret));
    setCaret(mention.start + inserted.length);
    setMenuSel(0);
  }

  function menuKeys(e: KeyboardEvent, count: number, pick: () => void) {
    if (!count) return false;
    if (e.key === 'ArrowDown') { e.preventDefault(); setMenuSel((s) => Math.min(s + 1, count - 1)); return true; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setMenuSel((s) => Math.max(s - 1, 0)); return true; }
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); pick(); return true; }
    return false;
  }

  const counting = send.phase.kind === 'counting' ? send.phase : null;
  const status = counting ? statusAfter(counting.choice) : undefined;
  const conflictText = draft.conflict?.byAi ? tr('aiRewrote')
    : draft.conflict?.by ? tr('editedBy', { name: draft.conflict.by }) : tr('editedBySomeone');

  return (
    <div className={send.phase.kind === 'paused' ? 'composer paused' : 'composer'}>
      <div className="ctabs">
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={mode === 'reply'} onClick={toReply}>{tr('reply')} <kbd>R</kbd></button>
          <button role="tab" className="note" aria-selected={mode === 'note'} onClick={toNote}>{tr('note')} <kbd>N</kbd></button>
        </div>
      </div>
      <div className={mode === 'note' ? 'cbody notemode' : 'cbody'}>
        {mode === 'reply' && send.phase.kind === 'paused' && (
          <div className="banner bad" role="alert">
            <span><b>{tr('paused')}</b> {tr('pausedWhy', { name, at: formatWhen(send.phase.newestAt, now, lang) })}</span>
            <div className="acts">
              <button className="btn ai" disabled={blocked} onClick={send.redraftWithIt}>{tr('redraftWithIt')}</button>
              <button className="btn" disabled={blocked} onClick={send.sendAnyway}>{tr('sendAnyway')}</button>
            </div>
          </div>
        )}
        {mode === 'reply' && draft.draft?.autopilot === 'would_send' && (
          <div className="banner info" style={{ background: 'var(--ai-soft)', borderColor: 'var(--ai-line)' }}>
            <span style={{ color: 'var(--ai)' }}><b>{tr('shadowTitle')}</b> {tr('shadowBody', { intent: intentLabel(tr, draft.draft.intent) })}</span>
          </div>
        )}
        {mode === 'reply' && draft.conflict && (
          <div className="banner bad" role="alert">
            <span>{conflictText}</span>
            <div className="acts">
              <button className="btn" onClick={() => draft.resolveConflict('mine')}>{tr('keepMine')}</button>
              <button className="btn" onClick={() => draft.resolveConflict('theirs')}>{tr('useTheirs')}</button>
            </div>
          </div>
        )}
        {mode === 'reply' && draft.sentBy && (
          <div className="banner warn" role="status">
            <span>{tr('sentByOther', { name: draft.sentBy.name ?? tr('someone') })}</span>
            <div className="acts"><button className="btn" onClick={draft.dismissSentBy}>{tr('close')}</button></div>
          </div>
        )}
        {mode === 'reply' && draft.redraftError && <div className="banner warn" role="status"><span>{draft.redraftError}</span></div>}
        {mode === 'reply' && draft.metaError && <div className="banner warn" role="alert"><span>{draft.metaError}</span></div>}

        {mode === 'reply' ? (
          <>
            <div className="to">
              {tr('to')} {contact && <span className="chip">{contact.name ? `${contact.name} <${contact.email}>` : contact.email}</span>}
              {!showCc && <button className="link" onClick={() => setShowCc(true)}>{tr('cc')}</button>}
              {showCc && <input aria-label={tr('cc')} placeholder={tr('ccPlaceholder')} defaultValue={draft.draft?.cc ?? ''} disabled={replyReadOnly} onBlur={(e) => void draft.saveCc(e.target.value)} />}
            </div>
            <AiBar draft={draft.draft} now={now} busy={draft.drafting !== null || replyReadOnly} canUndo={draft.undoText !== null && draft.drafting === null && !replyReadOnly}
              onTune={(i, label) => { if (!replyReadOnly) void draft.redraft(i, label); }} onUndo={() => draft.undoRedraft()} />
            {draft.drafting
              ? <div className="drafting" role="status"><span className="spin" aria-hidden="true" />{tr('drafting', { what: draft.drafting.label ? tr(draft.drafting.label) : draft.drafting.instruction })}</div>
              : <textarea ref={replyBox} className="draft" aria-label={tr('replyLabel')} value={draft.text} readOnly={replyReadOnly}
                  onChange={(e) => writeReply(e.target.value, e.target.selectionStart ?? e.target.value.length)}
                  onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
                  onKeyDown={(e) => {
                    if (slashOpen && menuKeys(e, slashMatches.length, () => { const c = slashMatches[menuSel]; if (c) insertCanned(c.body); })) return;
                    if (slashOpen && e.key === 'Escape') { e.stopPropagation(); setMenuClosedAt(draft.text); }
                  }} />}
            {slashOpen && slash && (
              <SlashMenu query={slash.query} matches={slashMatches} sel={menuSel} ctx={ctx}
                onPick={(c) => insertCanned(c.body)} onNote={toNote} onAttach={() => attachButton.current?.click()} />
            )}
            <AttachedFiles files={draft.draft?.attachments ?? []} disabled={replyReadOnly} onRemove={(id) => void draft.detach(id)} />
            {draft.draft && draft.draft.citations.length > 0 && !draft.drafting && (
              <div className="sources"><span>{tr('used')}</span>{draft.draft.citations.map((c) => <span key={c.sourceId || c.title} className="chip">{c.title}</span>)}</div>
            )}
            {counting && (
              <div className="undo" role="status">
                <span>{status ? tr('countdownMark', { name, s: counting.left, status: tr(status) }) : tr('countdown', { name, s: counting.left })}</span>
                <button onClick={send.undo}>{tr('undo')}</button>
              </div>
            )}
            {send.phase.kind === 'sending' && <div className="undo" role="status"><span>{tr('sendingNow')}</span></div>}
            {send.phase.kind === 'pending' && (
              <div className="banner warn" role="status">
                <span>{tr('stillSending')}</span>
                <div className="acts"><button className="btn" onClick={send.dismiss}>{tr('close')}</button></div>
              </div>
            )}
            {send.phase.kind === 'done' && (
              <div className="undo" role="status"><span>{send.phase.text}</span><button onClick={send.dismiss}>{tr('close')}</button></div>
            )}
            {send.phase.kind === 'failed' && (
              <div className="banner bad" role="alert"><span>{send.phase.text}</span><div className="acts"><button className="btn" onClick={send.dismiss}>{tr('close')}</button></div></div>
            )}
          </>
        ) : (
          <>
            <textarea ref={noteBox} className="draft" aria-label={tr('noteLabel')} value={note.text}
              onChange={(e) => { note.setText(e.target.value); setCaret(e.target.selectionStart ?? e.target.value.length); setMenuSel(0); }}
              onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
              onKeyDown={(e) => {
                if (menuKeys(e, mentionMatches.length, () => { const p = mentionMatches[menuSel]; if (p) insertMention(p); })) return;
                if (mentionMatches.length && e.key === 'Escape') { e.stopPropagation(); setMenuClosedAt(note.text); }
              }} />
            <MentionMenu matches={mentionMatches} sel={menuSel} onPick={insertMention} />
            {note.error && <div className="banner bad" role="alert"><span>{note.error}</span></div>}
          </>
        )}
      </div>
      <div className="cfoot">
        <div className="left">
          {mode === 'reply' && <AttachButton ref={attachButton} disabled={replyReadOnly} onFiles={(f) => void draft.attach(f)} />}
          {mode === 'reply' && <span><kbd>/</kbd> {tr('savedReplies')}</span>}
          {mode === 'reply' && <span>{saveLabel(tr, draft, now, lang)}</span>}
          {mode === 'reply' && noRequester && <span className="bad">{tr('needsRequester')}</span>}
        </div>
        {mode === 'reply'
          ? <SendButton disabled={replyReadOnly || noRequester || !draft.text.trim()} current={send.defaultChoice}
              onSend={() => send.send()} onPick={send.pick} />
          : <button className="btn primary" disabled={note.busy || !note.text.trim()} onClick={() => void note.submit(people)}>{tr('addNote')}</button>}
      </div>
    </div>
  );
}

function saveLabel(tr: (k: TextKey, v?: Record<string, string | number>) => string, d: ReturnType<typeof useDraft>, now: Date, lang: 'en' | 'vi') {
  if (d.state === 'saving') return tr('saving');
  if (d.state === 'offline') return tr('notSavedOffline');
  if (d.state === 'failed' && d.saveError) return d.saveError.retrying ? tr('notSaved') : tr('notSavedWhy', { why: d.saveError.why });
  if (d.state === 'failed') return tr('notSaved');
  // Text that is waiting on someone else is not saved, whatever the last save said.
  if (d.dirty && d.conflict) return tr('notSavedConflict');
  if (d.state === 'saved' && d.savedAt) {
    return Date.now() - d.savedAt < 60_000 ? tr('savedJustNow') : tr('savedAt', { at: formatWhen(new Date(d.savedAt).toISOString(), now, lang) });
  }
  return '';
}
