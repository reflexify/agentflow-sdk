import { useQueryClient } from '@tanstack/react-query';
import { useId, useRef, useState } from 'react';
import { isProjectsError } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { useComments } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { Confirm, Menu, Tooltip, useToast } from '../kit/elements.js';
import { scanMentions } from '../model/mentions.js';
import { viewerTimeZone } from '../model/dates.js';
import { formatBytes, formatCount, formatDateTime, formatWhen, hueOf, initials } from '../model/format.js';
import type { Comment, CommentFile, CommentThread, Task, Unnotified } from '../model/types.js';
import { FileIcon, LockIcon, MoreHorizontal } from '../shared/icons.js';
import { CommentBody } from './CommentBody.js';
import { CommentComposer } from './CommentComposer.js';
import { commentReason } from './comment-reasons.js';

let pendingSeq = 0;

/** A comment as it reads while the server has not answered: what was written, by the viewer, with each person's chip as typed. */
function pendingComment(body: string, files: CommentFile[], authorId: string, authorName: string): Comment {
  const mentions: Comment['mentions'] = {};
  for (const t of scanMentions(body)) {
    mentions[t.target] = t.kind === 'user' ? { state: 'ok', kind: 'user', label: t.label, href: null } : { state: 'restricted', kind: 'record' };
  }
  return {
    id: `pending-${++pendingSeq}`, authorId, authorName, body, createdAt: new Date().toISOString(), editedAt: null, canEdit: false, canDelete: false, files, mentions,
  };
}

/**
 * Bình luận: the task's conversation under its attachments. The thread reads oldest first with the newest next to the
 * composer; the author edits and deletes their own, and whoever may update the task deletes anyone's. A frozen task keeps its comments
 * to read. A task whose entity takes no comments (an older package, a ceiling without them) shows nothing at all.
 */
export function Comments({ task }: { task: Task }) {
  const { api, lang, today, viewer, people } = useProjects();
  const tr = useT();
  const qc = useQueryClient();
  const toast = useToast();
  const headingId = useId();
  const thread = useComments(task.id);
  const [loaded, setOlder] = useState<{ comments: Comment[]; cursor: string | null; anchor: string | undefined } | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Comment | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [pending, setPending] = useState<Comment[]>([]);
  const [notes, setNotes] = useState<Record<string, Unnotified[]>>({});
  // One Idempotency-Key per draft until it settles, so Send pressed again after a lost answer cannot post it twice. A
  // draft changed since is a new write.
  const unsettled = useRef<{ draft: string; key: string } | null>(null);
  const tz = viewerTimeZone();

  const refresh = () => qc.invalidateQueries({ queryKey: keys.comments(task.id) });
  const change = (fn: (page: CommentThread) => CommentThread) => qc.setQueryData<CommentThread>(keys.comments(task.id), (d) => (d ? fn(d) : d));

  if (thread.isError && !thread.data) {
    const e = thread.error;
    if (isProjectsError(e, 'conflict') || isProjectsError(e, 'forbidden') || isProjectsError(e, 'not_found')) return null;
    return (
      <section className="drawer-section comments" data-part="comments">
        <p className="field-error" role="alert">{tr('commentsLoadFailed')}</p>
        <button type="button" className="af-button secondary" onClick={() => void thread.refetch()}>{tr('retry')}</button>
      </section>
    );
  }
  if (!thread.data) {
    return <section className="drawer-section comments" data-part="comments" aria-busy="true"><span className="af-skeleton comments-skeleton" aria-hidden="true" /></section>;
  }

  const page = thread.data;
  // Older pages hang on the newest page's first comment; when a refetch moves that, they would leave a gap, so they go.
  const older = loaded && loaded.anchor === page.comments[0]?.id ? loaded : null;
  const all = [...(older?.comments ?? []), ...page.comments];
  const olderCursor = older ? older.cursor : page.olderCursor;
  const count = page.total + pending.length;
  const closedWord = task.frozen ? tr('commentsFrozen') : tr('commentsClosed');

  const loadOlder = async () => {
    if (!olderCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const before = await api.comments(task.id, olderCursor);
      setOlder((o) => ({ comments: [...before.comments, ...(o && o.anchor === page.comments[0]?.id ? o.comments : [])], cursor: before.olderCursor, anchor: page.comments[0]?.id }));
    } catch (e) {
      toast({ kind: 'error', text: commentReason(e, tr) });
    } finally {
      setLoadingOlder(false);
    }
  };

  const noteFor = (comment: Comment, unnotified: Unnotified[]) =>
    setNotes((n) => (unnotified.length > 0 ? { ...n, [comment.id]: unnotified } : (({ [comment.id]: _, ...rest }) => rest)(n)));

  const post = async (value: { body: string; files: CommentFile[] }) => {
    const mine = pendingComment(value.body, value.files, viewer.id, people.get(viewer.id)?.name ?? '');
    setPending((all) => [...all, mine]);
    try {
      const files = value.files.map((f) => f.id);
      const draft = JSON.stringify([value.body, files]);
      if (unsettled.current?.draft !== draft) unsettled.current = { draft, key: crypto.randomUUID() };
      const key = unsettled.current.key;
      const done = await api.postComment(task.id, { body: value.body, files, key });
      if (unsettled.current?.key === key) unsettled.current = null;
      change((d) => ({ ...d, total: d.total + 1, comments: [...d.comments, done.comment] }));
      noteFor(done.comment, done.unnotified);
      void refresh();
    } finally {
      setPending((all) => all.filter((c) => c !== mine));
    }
  };

  const edit = (comment: Comment) => async (value: { body: string; files: CommentFile[] }) => {
    try {
      const done = await api.editComment(task.id, comment, { body: value.body, files: value.files.map((f) => f.id) });
      const swap = (list: Comment[]) => list.map((c) => (c.id === comment.id ? done.comment : c));
      change((d) => ({ ...d, comments: swap(d.comments) }));
      setOlder((o) => (o ? { ...o, comments: swap(o.comments) } : o));
      noteFor(done.comment, done.unnotified);
      setEditing(null);
      void refresh();
    } catch (e) {
      if (isProjectsError(e, 'stale') || isProjectsError(e, 'not_found')) void refresh();
      throw e;
    }
  };

  const remove = async () => {
    if (!deleting || deletingBusy) return;
    const gone = deleting;
    setDeletingBusy(true);
    try {
      await api.deleteComment(task.id, gone.id);
      const without = (list: Comment[]) => list.filter((c) => c.id !== gone.id);
      change((d) => ({ ...d, total: Math.max(0, d.total - 1), comments: without(d.comments) }));
      setOlder((o) => (o ? { ...o, comments: without(o.comments) } : o));
      setDeleting(null);
    } catch (e) {
      setDeleting(null);
      toast({ kind: 'error', text: tr('commentDeleteFailed', { reason: commentReason(e, tr, 'delete') }) });
    } finally {
      setDeletingBusy(false);
      void refresh();
    }
  };

  const canWrite = !page.closed && page.canComment;
  return (
    <section className="drawer-section comments" data-part="comments">
      <div className="field-label">
        <h3 id={headingId}>{tr('commentsCount', { n: formatCount(count, lang) })}</h3>
      </div>
      {page.closed && <p className="comment-closed" role="status"><LockIcon size={12} />{closedWord}</p>}
      {!page.closed && !page.canComment && <p className="comment-closed" role="status"><LockIcon size={12} />{tr('commentsReadOnly')}</p>}
      {olderCursor && (
        <button type="button" className="af-button ghost comment-older" aria-busy={loadingOlder || undefined} onClick={() => void loadOlder()}>
          {tr('commentsOlder')}
        </button>
      )}
      {count === 0
        ? <p className="field-empty comment-empty">{tr('commentsEmpty')}</p>
        : (
          <ol className="comment-list" aria-labelledby={headingId}>
            {all.map((c) => (
              <li key={c.id} id={`comment-${c.id}`} className="comment" data-comment={c.id}>
                <span className="af-avatar" data-hue={hueOf(c.authorId)} aria-hidden="true">{initials(c.authorName || '?')}</span>
                <div className="comment-main">
                  <div className="comment-head">
                    <strong className="comment-author">{c.authorName || '—'}</strong>
                    <Tooltip text={formatDateTime(c.createdAt, tz)} locale={lang}>
                      <time dateTime={c.createdAt}>{formatWhen(c.createdAt, today, lang, tz)}</time>
                    </Tooltip>
                    {c.editedAt && (
                      <span className="comment-edited" title={tr('commentEditedAt', { when: formatDateTime(c.editedAt, tz) })}>· {tr('commentEdited')}</span>
                    )}
                    {editing !== c.id && (c.canEdit || c.canDelete) && (
                      <span className="comment-menu">
                        <Menu
                          items={[
                            ...(c.canEdit ? [{ id: 'edit', label: tr('commentEdit') }] : []),
                            ...(c.canDelete ? [{ id: 'delete', label: tr('commentDelete'), danger: true }] : []),
                          ]}
                          label={tr('commentMenu')}
                          locale={lang}
                          onSelect={({ id }) => { if (id === 'edit') setEditing(c.id); else setDeleting(c); }}
                        >
                          <MoreHorizontal size={16} />
                        </Menu>
                      </span>
                    )}
                  </div>
                  {editing === c.id
                    ? (
                      <CommentComposer
                        taskId={task.id}
                        mode="edit"
                        initialBody={c.body}
                        initialFiles={c.files}
                        autoFocus
                        onSubmit={edit(c)}
                        onCancel={() => setEditing(null)}
                      />
                    )
                    : (
                      <>
                        {c.body.trim() !== '' && <CommentBody comment={c} />}
                        {c.files.length > 0 && (
                          <ul className="comment-files">
                            {c.files.map((f) => (
                              <li key={f.id}>
                                <a className="comment-file-chip" href={api.fileUrl(f.id)} download={f.name}>
                                  <FileIcon size={14} />
                                  <span className="comment-file-name">{f.name}</span>
                                  <span className="file-size">{formatBytes(f.size, lang)}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  {notes[c.id] && (
                    <p className="comment-note" role="status">
                      {tr('commentUnnotified', { names: notes[c.id]!.map((u) => u.name).filter(Boolean).join(', ') || '—' })}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      {pending.length > 0 && (
        <ol className="comment-list comment-pending" aria-label={tr('commentSending')}>
          {pending.map((c) => (
            <li key={c.id} className="comment" data-pending="" aria-busy="true">
              <span className="af-avatar" data-hue={hueOf(c.authorId)} aria-hidden="true">{initials(c.authorName || '?')}</span>
              <div className="comment-main">
                <div className="comment-head">
                  <strong className="comment-author">{c.authorName || '—'}</strong>
                  <span className="comment-edited">{tr('commentSending')}</span>
                </div>
                {c.body.trim() !== '' && <CommentBody comment={c} />}
                {c.files.length > 0 && (
                  <ul className="comment-files">
                    {c.files.map((f) => <li key={f.id}><span className="comment-file-chip"><FileIcon size={14} /><span className="comment-file-name">{f.name}</span></span></li>)}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {canWrite && <CommentComposer key={task.id} taskId={task.id} mode="new" onSubmit={post} />}
      <Confirm
        open={deleting !== null}
        heading={tr('commentDeleteHeading')}
        message={tr('commentDeleteMessage')}
        confirmLabel={tr('commentDelete')}
        danger
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        busy={deletingBusy}
        onCancel={() => { if (!deletingBusy) setDeleting(null); }}
        onConfirm={() => void remove()}
      />
    </section>
  );
}
