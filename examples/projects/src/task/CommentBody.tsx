import { Fragment, type ReactNode } from 'react';
import { useProjects, useT } from '../data/context.js';
import { scanMentions } from '../model/mentions.js';
import type { Comment, MentionTarget } from '../model/types.js';
import { LockIcon } from '../shared/icons.js';

const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\s][^*\n]*\*)|(https?:\/\/[^\s<>]+)/g;
const TRAILING = /[.,;:!?)\]]+$/;

/** A text's bold, italic, code and links; anything else is written as typed. Never HTML. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > at) out.push(text.slice(at, m.index));
    const key = `${keyPrefix}-${n++}`;
    if (m[1]) out.push(<code key={key}>{m[1].slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{m[2].slice(2, -2)}</strong>);
    else if (m[3]) out.push(<em key={key}>{m[3].slice(1, -1)}</em>);
    else {
      const url = m[4]!;
      const tail = TRAILING.exec(url)?.[0] ?? '';
      const href = url.slice(0, url.length - tail.length);
      out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer">{href}</a>, tail);
    }
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

/**
 * A mention as the viewer may read it. The server's map is the only source of a name: a target it does not list, or
 * lists as restricted, is drawn restricted whatever label the stored text carries.
 */
function Chip({ target, map }: { target: string; map: Comment['mentions'] }) {
  const { agentflowUrl } = useProjects();
  const tr = useT();
  const known: MentionTarget | undefined = map[target];
  if (known?.state === 'deleted') return <span className="mention-chip" data-state="deleted">{tr('commentRecordDeleted')}</span>;
  if (known?.state !== 'ok' || !known.label) {
    return <span className="mention-chip" data-state="restricted"><LockIcon size={11} />{tr('commentRestricted')}</span>;
  }
  if (known.kind === 'record' && known.href) {
    return (
      <a className="mention-chip" data-state="record" href={agentflowUrl(known.href)} target="_blank" rel="noopener noreferrer">{known.label}</a>
    );
  }
  return <span className="mention-chip" data-state={known.kind}>{known.kind === 'user' ? `@${known.label}` : known.label}</span>;
}

export function CommentBody({ comment }: { comment: Comment }) {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const t of scanMentions(comment.body)) {
    if (t.start > at) parts.push(<Fragment key={`t${at}`}>{inline(comment.body.slice(at, t.start), `t${at}`)}</Fragment>);
    parts.push(<Chip key={`m${t.start}`} target={t.target} map={comment.mentions} />);
    at = t.end;
  }
  if (at < comment.body.length) parts.push(<Fragment key={`t${at}`}>{inline(comment.body.slice(at), `t${at}`)}</Fragment>);
  return <div className="comment-text">{parts}</div>;
}
