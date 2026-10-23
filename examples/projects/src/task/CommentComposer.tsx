import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useToast } from '../kit/elements.js';
import { hueOf, initials } from '../model/format.js';
import { bodyOf, draftOf, labelFor, stillPicked, type Picked } from '../model/mentions.js';
import type { CommentFile, Person } from '../model/types.js';
import { FileIcon, Paperclip, XIcon } from '../shared/icons.js';
import { commentReason } from './comment-reasons.js';

const SEARCH_DELAY_MS = 120;
/** A name is a few words: past this a lone `@` in a sentence is not a mention being typed. */
const MAX_QUERY_WORDS = 3;
const MENTION_AT = /(^|\s)@(\S[^@\n]{0,40}|)$/u;
const IS_MAC = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

interface Typing { from: number; query: string }

/** The `@` being typed before the caret, or null. */
function typingAt(text: string, caret: number): Typing | null {
  const m = MENTION_AT.exec(text.slice(0, caret));
  if (!m) return null;
  const query = m[2] ?? '';
  if (query.trim().split(/\s+/).filter(Boolean).length > MAX_QUERY_WORDS) return null;
  return { from: caret - query.length - 1, query };
}

type Found = { state: 'loading' } | { state: 'ready'; people: Person[] } | { state: 'failed' };

/**
 * The text box of a comment, new or being edited: people are offered after an `@` from the platform's people list for
 * the task, files are attached with the paperclip (not on an app's own site, where the app's token cannot upload),
 * and Ctrl/⌘+Enter sends. What is sent is the text with each picked `@Name` written as the platform's mention token.
 */
export function CommentComposer(p: {
  taskId: string;
  mode: 'new' | 'edit';
  initialBody?: string;
  initialFiles?: CommentFile[];
  autoFocus?: boolean;
  onSubmit(value: { body: string; files: CommentFile[] }): Promise<void>;
  onCancel?(): void;
}) {
  const { api, standalone, online } = useProjects();
  const tr = useT();
  const toast = useToast();
  const [initial] = useState(() => draftOf(p.initialBody ?? ''));
  const [text, setText] = useState(initial.text);
  const [picks, setPicks] = useState<Picked[]>(initial.picks);
  const [files, setFiles] = useState<CommentFile[]>(p.initialFiles ?? []);
  const [uploading, setUploading] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState<Typing | null>(null);
  const [found, setFound] = useState<Found>({ state: 'loading' });
  const [active, setActive] = useState(0);
  const box = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);
  const listId = useId();
  const hintId = useId();
  const open = typing !== null;

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  useLayoutEffect(() => {
    if (caret.current === null || !box.current) return;
    box.current.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  useEffect(() => {
    if (p.autoFocus) box.current?.focus();
  }, [p.autoFocus]);

  const query = typing?.query;
  useEffect(() => {
    if (query === undefined) return;
    let live = true;
    setFound({ state: 'loading' });
    const timer = setTimeout(() => {
      api.mentionPeople(p.taskId, query).then(
        (people) => { if (live) { setFound({ state: 'ready', people }); setActive(0); } },
        () => { if (live) setFound({ state: 'failed' }); },
      );
    }, SEARCH_DELAY_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [api, p.taskId, query]);

  const people = found.state === 'ready' ? found.people : [];

  const choose = (person: Person) => {
    if (!typing) return;
    const el = box.current;
    const end = el?.selectionStart ?? text.length;
    const label = labelFor(person, picks);
    const inserted = `@${label} `;
    setText(text.slice(0, typing.from) + inserted + text.slice(end));
    setPicks((all) => (all.some((x) => x.id === person.id && x.label === label) ? all : [...all, { label, id: person.id }]));
    caret.current = typing.from + inserted.length;
    setTyping(null);
  };

  const sync = (el: HTMLTextAreaElement) => setTyping(typingAt(el.value, el.selectionStart));

  const attach = useCallback(async (list: File[]) => {
    if (list.length === 0) return;
    const names = list.map((f) => f.name);
    setUploading((u) => [...u, ...names]);
    setError(null);
    const results = await Promise.allSettled(list.map((f) => api.upload(f)));
    setUploading((u) => u.filter((n) => !names.includes(n)));
    const added: CommentFile[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') added.push({ id: r.value.id, name: r.value.name, size: r.value.size, type: r.value.type });
      else toast({ kind: 'error', text: tr('commentUploadFailed', { name: names[i]!, reason: commentReason(r.reason, tr) }) });
    });
    if (added.length > 0) setFiles((all) => [...all, ...added]);
  }, [api, toast, tr]);

  const empty = text.trim() === '' && files.length === 0;
  const blocked = busy || uploading.length > 0 || empty || !online;

  const send = async () => {
    if (blocked) return;
    const sent = { text, picks, files };
    setBusy(true);
    setError(null);
    // A new comment leaves the box at once, as it shows in the thread at once; a refusal puts it back.
    if (p.mode === 'new') {
      setText('');
      setPicks([]);
      setFiles([]);
    }
    try {
      await p.onSubmit({ body: bodyOf(sent.text, stillPicked(sent.text, sent.picks)), files: sent.files });
    } catch (e) {
      if (p.mode === 'new') {
        setText((now) => (now === '' ? sent.text : `${sent.text}\n${now}`));
        setPicks((now) => [...sent.picks, ...now.filter((x) => !sent.picks.some((y) => y.id === x.id && y.label === x.label))]);
        setFiles((now) => [...sent.files, ...now]);
      }
      setError(tr(p.mode === 'new' ? 'commentSendFailed' : 'commentSaveFailed', { reason: commentReason(e, tr) }));
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // An IME is composing (Vietnamese input does): its keys are not ours.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (people.length === 0) return;
        e.preventDefault();
        setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + people.length) % people.length);
        return;
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey && !e.metaKey && people[active]) {
        e.preventDefault();
        choose(people[active]!);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setTyping(null);
        return;
      }
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void send();
    } else if (e.key === 'Escape' && text !== '') {
      // What is typed is kept; Escape with nothing typed is the drawer's.
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const label = p.mode === 'new' ? tr('commentLabel') : tr('commentEditLabel');
  return (
    <div className="comment-composer" data-mode={p.mode}>
      <div className="comment-box" data-busy={busy && p.mode === 'edit' ? '' : undefined}>
        <textarea
          ref={box}
          className="comment-input"
          rows={p.mode === 'new' ? 2 : 3}
          value={text}
          readOnly={busy && p.mode === 'edit'}
          aria-label={label}
          aria-describedby={hintId}
          placeholder={tr('commentPlaceholder')}
          role={open ? 'combobox' : undefined}
          aria-expanded={open ? true : undefined}
          aria-controls={open ? listId : undefined}
          aria-haspopup={open ? 'listbox' : undefined}
          aria-autocomplete={open ? 'list' : undefined}
          aria-activedescendant={open && people[active] ? `${listId}-${people[active]!.id}` : undefined}
          onChange={(e) => { setText(e.target.value); sync(e.target); }}
          onKeyUp={(e) => { if (e.key.startsWith('Arrow') && !open) sync(e.currentTarget); }}
          onClick={(e) => sync(e.currentTarget)}
          onBlur={() => setTyping(null)}
          onKeyDown={onKeyDown}
        />
        {open && (
          <ul id={listId} className="mention-menu" role="listbox" aria-label={tr('mentionMenuLabel')}>
            {found.state === 'loading' && <li className="mention-note" role="presentation">{tr('mentionSearching')}</li>}
            {found.state === 'failed' && <li className="mention-note" role="presentation">{tr('mentionFailed')}</li>}
            {found.state === 'ready' && people.length === 0 && <li className="mention-note" role="presentation">{tr('mentionNone')}</li>}
            {people.map((person, i) => (
              <li
                key={person.id}
                id={`${listId}-${person.id}`}
                role="option"
                aria-selected={i === active}
                className="mention-option"
                // The textarea keeps focus: a press on the option must not blur it.
                onMouseDown={(e) => { e.preventDefault(); choose(person); }}
                onMouseMove={() => setActive(i)}
              >
                <span className="af-avatar sm" data-hue={hueOf(person.id)} aria-hidden="true">{initials(person.name)}</span>
                <span className="mention-name">{person.name}</span>
                {person.email && <span className="mention-email">{person.email}</span>}
              </li>
            ))}
          </ul>
        )}
        {(files.length > 0 || uploading.length > 0) && (
          <ul className="comment-files" data-part="composer-files">
            {files.map((f) => (
              <li key={f.id} className="comment-file-chip">
                <FileIcon size={14} />
                <span className="comment-file-name">{f.name}</span>
                <button type="button" className="chip-remove" aria-label={tr('commentRemoveFile', { name: f.name })} disabled={busy}
                  onClick={() => setFiles((all) => all.filter((x) => x.id !== f.id))}>
                  <XIcon size={12} />
                </button>
              </li>
            ))}
            {uploading.map((n, i) => (
              <li key={`up-${i}-${n}`} className="comment-file-chip" aria-busy="true" data-uploading="">
                <FileIcon size={14} />
                <span className="comment-file-name">{n}</span>
                <span className="sr-only">{tr('commentUploading', { name: n })}</span>
                <span className="upload-bar" aria-hidden="true"><span /></span>
              </li>
            ))}
          </ul>
        )}
        <div className="comment-bar">
          <span id={hintId} className="comment-hint">{IS_MAC ? tr('commentHintMac') : tr('commentHint')}</span>
          {!standalone && (
            <label className="comment-attach" title={tr('commentAttach')}>
              <Paperclip size={16} />
              <span className="sr-only">{tr('commentAttach')}</span>
              <input
                type="file"
                multiple
                className="dropzone-input"
                disabled={busy}
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  e.target.value = '';
                  void attach(list);
                }}
              />
            </label>
          )}
          {p.onCancel && (
            <button type="button" className="af-button ghost" disabled={busy} onClick={p.onCancel}>{tr('commentCancel')}</button>
          )}
          <button
            type="button"
            className="af-button primary"
            aria-disabled={blocked ? 'true' : undefined}
            aria-busy={busy ? 'true' : undefined}
            onClick={() => void send()}
          >
            {busy ? tr('commentSending') : tr(p.mode === 'new' ? 'commentSend' : 'commentSave')}
          </button>
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
