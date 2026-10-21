import { useMemo, useState } from 'react';
import { useDesk, useT } from '../data/desk-context.js';
import { authorship, splitQuoted } from '../model/thread.js';
import type { Note, Reply } from '../model/types.js';
import { formatWhen } from '../model/when.js';
import type { TextKey } from '../text.js';

function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</>;
}

/** A message's text. Its quoted history stays out of the page until it is asked for, so a long chain costs one paragraph. */
function Body({ body }: { body: string }) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  const split = useMemo(() => (body.trim() ? splitQuoted(body) : null), [body]);
  if (!split) return <div className="tx"><p className="muted">{tr('noText')}</p></div>;
  const { visible, quoted } = split;
  const foldable = quoted !== null && quoted !== body;
  return (
    <>
      <div className="tx"><Paragraphs text={foldable ? visible : body} /></div>
      {foldable && open && <div className="tx muted"><Paragraphs text={quoted} /></div>}
      {foldable && <button className="quoted" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{tr(open ? 'hideQuoted' : 'showQuoted')}</button>}
    </>
  );
}

function Files({ reply }: { reply: Reply }) {
  const { api } = useDesk();
  if (!reply.attachments.length) return null;
  return (
    <div className="files">
      {reply.attachments.map((f) => (
        <a key={f.id} className="file" href={api.downloadUrl(f.id)} target="_blank" rel="noreferrer">
          <span className="ext">{(f.name.split('.').pop() ?? '').slice(0, 4).toUpperCase()}</span>{f.name}
        </a>
      ))}
    </div>
  );
}

export function CustomerCard({ reply, name, fresh, now }: { reply: Reply; name: string; fresh: boolean; now: Date }) {
  const tr = useT();
  const { lang } = useDesk();
  return (
    <article className={fresh ? 'card cust fresh' : 'card cust'}>
      <div className="hd">
        <b>{name}</b>{reply.fromAddress && <span>{reply.fromAddress}</span>}
        <span className="mono">{formatWhen(reply.postedAt, now, lang)}</span>
        {fresh && <span className="chip">{tr('fresh')}</span>}
      </div>
      <Body body={reply.body} />
      <Files reply={reply} />
    </article>
  );
}

export function OurCard({ reply, now }: { reply: Reply; now: Date }) {
  const tr = useT();
  const { lang } = useDesk();
  const how = authorship(reply);
  const bot = how === 'autopilot';
  return (
    <article className={bot ? 'card bot' : 'card ours'}>
      <div className="hd">
        <b>{bot ? tr('autopilotName') : reply.authorUserName ?? tr('support')}</b>
        {bot && <span className="chip ai">{tr('sentByAutopilot')}</span>}
        {how === 'ai_edited' && <span className="chip">{tr('aiEdited')}</span>}
        {how === 'ai_unchanged' && <span className="chip">{tr('aiUnchanged')}</span>}
        <span className="mono">{formatWhen(reply.postedAt, now, lang)}</span>
      </div>
      <Body body={reply.body} />
      <Files reply={reply} />
      <div className="ft">
        {reply.status === 'sending' && <span>{tr('sending')}</span>}
        {reply.status === 'sent' && <span className="ok">{tr('sentAt', { at: formatWhen(reply.postedAt, now, lang) })}</span>}
        {reply.status === 'failed' && <span className="bad">{tr('notDelivered')}</span>}
      </div>
    </article>
  );
}

export function NoteCard({ note, now }: { note: Note; now: Date }) {
  const tr = useT();
  const { lang } = useDesk();
  return (
    <article className="notecard">
      <div className="hd">{tr('noteBy', { name: note.authorUserName ?? tr('someone'), at: formatWhen(note.createdAt, now, lang) })}</div>
      {note.body}
    </article>
  );
}

export function EventLine({ note, now }: { note: Note; now: Date }) {
  const { lang } = useDesk();
  const who = note.authorUserName ? `${note.authorUserName}: ` : '';
  return <article className="event">{`${who}${note.body} · ${formatWhen(note.createdAt, now, lang)}`}</article>;
}

export function HeldCard(props: { reply: Reply; now: Date; busy: boolean; onAccept(): void; onMove(): void }) {
  const tr = useT();
  const { lang } = useDesk();
  const { reply } = props;
  const why = reply.heldReason ? tr(`held_${reply.heldReason}` as TextKey) : tr('held_not_a_participant');
  return (
    <article className="heldcard">
      <div className="why">{tr('heldWhy', { why })}</div>
      <div className="small muted">
        {reply.fromAddress ?? ''} · <span className="mono">{formatWhen(reply.postedAt, props.now, lang)}</span>
        {reply.matchedBy && ` · ${tr(`matched_${reply.matchedBy}` as TextKey)}`}
      </div>
      <div className="tx"><Paragraphs text={reply.body || tr('noText')} /></div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className="btn" disabled={props.busy} onClick={props.onAccept}>{tr('accept')}</button>
        <button className="btn" disabled={props.busy} onClick={props.onMove}>{tr('move')}</button>
      </div>
    </article>
  );
}
