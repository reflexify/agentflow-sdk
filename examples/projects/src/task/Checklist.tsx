import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { isProjectsError, ProjectsError, type ChecklistOp } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { keys } from '../data/keys.js';
import { Tooltip } from '../kit/elements.js';
import { can } from '../model/roles.js';
import type { ChecklistItem, Project, Task } from '../model/types.js';
import { ArrowDown, ArrowUp, CheckIcon, LockIcon, PlusIcon, XIcon } from '../shared/icons.js';
import type { TextKey } from '../text.js';
import { Locked, type DrawerWriter } from './fields.js';

/** The package's limit on the checklist: the server refuses a list that grows past it. */
const MAX_ITEMS = 20;
/** An item added here that the server has not yet given an id. */
const PENDING = 'pending:';
const isPending = (item: ChecklistItem) => item.id.startsWith(PENDING);
/** The server's sentence for a list grown past its limit (`VALIDATION_ERROR`, rule `maxItems` on `/checklist`). */
const TOO_MANY = 'has more entries than this field allows';

type Transform = (list: ChecklistItem[]) => ChecklistItem[];

type Part = 'up' | 'down' | 'remove' | 'check';

/**
 * Checklist: "2/5" and a bar, a tick per item, each item's text edited in place, ↑ and ↓ to reorder, delete, Thêm mục
 * (at most twenty, refused before any call), and Hiện trên thẻ. The primary, collaborators and managers change it;
 * anyone else reads it. Every change shows at once and is put back if the server refuses it.
 */
export function Checklist({ task, project, writer }: { task: Task; project: Project | null; writer: DrawerWriter }) {
  const { viewer, online, lang, api } = useProjects();
  const tr = useT();
  const qc = useQueryClient();
  const headingId = useId();
  const reasonId = useId();
  const limitId = useId();
  const verdict = can('checklist', { viewer, project, task, online });
  const editable = verdict.ok;
  const lock: TextKey | null = verdict.ok ? null : verdict.reason;
  const items = task.checklist;
  const done = items.filter((i) => i.done).length;
  const full = items.length >= MAX_ITEMS;
  const [adding, setAdding] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<{ id: string; part: Part } | 'add' | null>(null);
  const pendingCount = useRef(0);
  /** The changes of the writes still waiting their turn or their answer, oldest first. */
  const queued = useRef<{ apply: Transform }[]>([]);

  /**
   * One list operation: the cache shows `next` at once, then the drawer's writer sends it after any write before it.
   * `ops` is built from the task as it stands when the write goes out, so an add lands after whatever is last by then.
   * Each answer is the server's list with every change still queued laid over it again, so an answer never takes
   * back a later change the viewer can already see.
   */
  const write = (ops: (from: Task) => ChecklistOp[], next: Transform) => {
    const key = keys.task(task.id);
    // A read already on its way would bring a list without this change.
    void qc.cancelQueries({ queryKey: key });
    const entry = { apply: next };
    queued.current.push(entry);
    const before = qc.getQueryData<Task>(key);
    let shown: Task | undefined;
    if (before) {
      qc.setQueryData<Task>(key, { ...before, checklist: next(before.checklist) });
      shown = qc.getQueryData<Task>(key);
    }
    const settle = () => { queued.current = queued.current.filter((q) => q !== entry); };
    void writer.run('checklist', async (from) => {
      try {
        const saved = await api.checklist(from, ops(from));
        settle();
        return { ...saved, checklist: queued.current.reduce((l, q) => q.apply(l), saved.checklist) };
      } catch (e) {
        settle();
        // A read or a later change that replaced what this one showed already says more than `before` would.
        if (before && qc.getQueryData(key) === shown) qc.setQueryData(key, before);
        if (isProjectsError(e) && e.code === 'VALIDATION_ERROR' && e.reason === TOO_MANY) {
          throw new ProjectsError(e.kind, e.status, e.code, tr('checklistMax'), e.message);
        }
        throw e;
      }
    });
  };

  const toggle = (item: ChecklistItem) => {
    write(() => [{ op: 'set', id: item.id, done: !item.done }], (l) => l.map((i) => (i.id === item.id ? { ...i, done: !item.done } : i)));
  };
  const rename = (item: ChecklistItem, text: string) => {
    write(() => [{ op: 'set', id: item.id, text }], (l) => l.map((i) => (i.id === item.id ? { ...i, text } : i)));
  };
  const move = (index: number, by: -1 | 1) => {
    const item = items[index]!;
    const to = index + by;
    const order = items.filter((i) => i.id !== item.id);
    order.splice(to, 0, item);
    const after = to === 0 ? null : order[to - 1]!.id;
    // The pressed arrow keeps focus, locked at an end, so pressing again never sends the item back.
    focusNext.current = { id: item.id, part: by < 0 ? 'up' : 'down' };
    write(() => [{ op: 'move', id: item.id, after }], (l) => {
      const rest = l.filter((i) => i.id !== item.id);
      const at = after === null ? 0 : rest.findIndex((i) => i.id === after) + 1;
      rest.splice(at, 0, item);
      return rest;
    });
  };
  const remove = (index: number) => {
    const item = items[index]!;
    const neighbour = items[index + 1] ?? items[index - 1];
    focusNext.current = neighbour && !isPending(neighbour) ? { id: neighbour.id, part: 'check' } : 'add';
    write(() => [{ op: 'remove', id: item.id }], (l) => l.filter((i) => i.id !== item.id));
  };
  const add = (text: string) => {
    const pending: ChecklistItem = { id: `${PENDING}${++pendingCount.current}`, text, done: false };
    write(
      (from) => [{ op: 'add', text, after: from.checklist.filter((i) => !isPending(i)).at(-1)?.id ?? null }],
      (l) => [...l, pending],
    );
  };

  // A moved or removed row's focus goes where the viewer would look next, after the list has been redrawn.
  useLayoutEffect(() => {
    const want = focusNext.current;
    if (!want) return;
    focusNext.current = null;
    if (want === 'add') {
      addButton.current?.focus();
      return;
    }
    const row = list.current?.querySelector(`[data-item="${CSS.escape(want.id)}"]`);
    row?.querySelector<HTMLElement>(`[data-part="${want.part}"]`)?.focus();
  }, [items, adding]);

  // Full while the add field is open: it closes, and the focus goes to the locked Thêm mục, which says why.
  useEffect(() => {
    if (adding && full) {
      setAdding(false);
      addButton.current?.focus();
    }
  }, [adding, full]);

  const showOnCard = (describedBy?: string) => (
    <button
      type="button"
      role="switch"
      className="switch"
      aria-checked={task.showChecklistOnCard}
      aria-disabled={editable ? undefined : 'true'}
      aria-describedby={describedBy}
      onClick={() => { if (editable) void writer.save({ showChecklistOnCard: !task.showChecklistOnCard }, 'checklist'); }}
    >
      <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
      <span>{tr('showOnCard')}</span>
    </button>
  );

  const addReason: TextKey | null = lock ?? (full ? 'checklistMax' : null);
  const addControl = adding && !addReason
    ? <AddItem onAdd={add} onDone={(refocus) => { if (refocus) focusNext.current = 'add'; setAdding(false); }} />
    : (
      <Tooltip text={addReason ? tr(addReason) : tr('addItem')} locale={lang}>
        <button
          ref={addButton}
          type="button"
          className="af-button ghost sm checklist-add"
          aria-disabled={addReason ? 'true' : undefined}
          aria-describedby={addReason ? (addReason === 'checklistMax' ? limitId : reasonId) : undefined}
          onClick={() => { if (!addReason) setAdding(true); }}
        >
          <PlusIcon size={16} />
          <span>{tr('addItem')}</span>
        </button>
      </Tooltip>
    );

  return (
    <div
      className="field-row stacked checklist"
      data-field="checklist"
      data-locked={lock ? '' : undefined}
      data-rolled-back={writer.rolledBack === 'checklist' ? '' : undefined}
      onAnimationEnd={() => writer.settled('checklist')}
    >
      <div className="checklist-head">
        <div className="field-label">
          <h3 id={headingId}>{tr('checklist')}</h3>
          {lock && (
            <Tooltip text={tr(lock)} locale={lang}>
              <span className="lock-hint" tabIndex={0} role="img" aria-label={tr(lock)}><LockIcon size={12} /></span>
            </Tooltip>
          )}
        </div>
        {items.length > 0 && (
          <>
            <span className="checklist-count" data-part="count">{`${done}/${items.length}`}</span>
            <span className="checklist-bar" aria-hidden="true">
              <span style={{ transform: `scaleX(${done / items.length})` }} />
            </span>
          </>
        )}
        <span className="checklist-switch">
          {editable ? showOnCard() : <Tooltip text={tr(lock!)} locale={lang}>{showOnCard(reasonId)}</Tooltip>}
        </span>
      </div>
      {lock && <span id={reasonId} className="sr-only">{tr(lock)}</span>}
      {items.length === 0 && !editable
        ? <p className="field-empty checklist-empty">{tr('noChecklist')}</p>
        : (
          <ul ref={list} className="checklist-items" aria-labelledby={headingId}>
            {items.map((item, i) => (
              <Row
                key={item.id}
                item={item}
                editable={editable}
                lock={lock}
                reasonId={reasonId}
                first={i === 0}
                last={i === items.length - 1 || isPending(items[i + 1]!)}
                onToggle={() => toggle(item)}
                onRename={(text) => rename(item, text)}
                onMove={(by) => move(i, by)}
                onRemove={() => remove(i)}
              />
            ))}
          </ul>
        )}
      <div className="checklist-foot">
        {addControl}
        {full && !lock && <span id={limitId} className="checklist-limit">{tr('checklistMax')}</span>}
      </div>
    </div>
  );
}

function Row(p: {
  item: ChecklistItem; editable: boolean; lock: TextKey | null; reasonId: string; first: boolean; last: boolean;
  onToggle(): void; onRename(text: string): void; onMove(by: -1 | 1): void; onRemove(): void;
}) {
  const { item, editable } = p;
  const { lang } = useProjects();
  const tr = useT();
  const pending = isPending(item);
  const live = editable && !pending;
  const savingId = useId();
  const box = (
    <button
      type="button"
      role="checkbox"
      className="checklist-tick"
      data-part="check"
      aria-checked={item.done}
      aria-label={item.text}
      aria-disabled={live ? undefined : 'true'}
      aria-describedby={p.lock ? p.reasonId : pending ? savingId : undefined}
      onClick={() => { if (live) p.onToggle(); }}
    >
      <span className="checklist-box" aria-hidden="true">{item.done && <CheckIcon size={12} />}</span>
    </button>
  );
  const tool = (part: 'up' | 'down' | 'remove', label: TextKey, icon: ReactNode, off: boolean, act: () => void) => {
    const name = tr(label, { text: item.text });
    const render = (describedBy?: string) => (
      <button
        type="button"
        className="icon-button sm"
        data-part={part}
        aria-label={name}
        aria-disabled={off || pending ? 'true' : undefined}
        aria-describedby={describedBy}
        onClick={() => { if (!off && !pending) act(); }}
      >
        {icon}
      </button>
    );
    // An item the server has not stored yet cannot be moved or removed until it has; the lock says so.
    return pending ? <Locked reason="itemSaving">{render}</Locked> : <Tooltip text={name} locale={lang}>{render()}</Tooltip>;
  };
  return (
    <li className="checklist-item" data-item={item.id} data-done={item.done ? '' : undefined} aria-busy={pending || undefined}>
      {p.lock ? <Tooltip text={tr(p.lock)} locale={lang}>{box}</Tooltip> : pending ? <Tooltip text={tr('itemSaving')} locale={lang}>{box}</Tooltip> : box}
      {pending && !p.lock && <span id={savingId} className="sr-only">{tr('itemSaving')}</span>}
      {live ? <ItemText item={item} onCommit={p.onRename} /> : <span className="checklist-text">{item.text}</span>}
      {editable && (
        <span className="checklist-tools">
          {tool('up', 'moveUp', <ArrowUp size={14} />, p.first, () => p.onMove(-1))}
          {tool('down', 'moveDown', <ArrowDown size={14} />, p.last, () => p.onMove(1))}
          {tool('remove', 'removeItem', <XIcon size={14} />, false, p.onRemove)}
        </span>
      )}
    </li>
  );
}

/**
 * An item's text as a ghost input in the item's own type. Enter or leaving it saves; Escape puts it back and leaves.
 * A blank text goes back to the stored one and writes nothing. If the stored text moves while it is being edited,
 * the stored text wins.
 */
function ItemText({ item, onCommit }: { item: ChecklistItem; onCommit(text: string): void }) {
  const tr = useT();
  const [draft, setDraft] = useState<{ from: string; text: string } | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const textRef = useRef(item.text);
  textRef.current = item.text;
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  const input = useRef<HTMLInputElement>(null);
  const live = draft && draft.from === item.text ? draft : null;

  // Heard on the field itself, so the drawer's Escape never sees one that put an edit back. The blur is a native
  // listener, not React's, so a drawer closing with focus here still saves what is typed.
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur();
      } else if (e.key === 'Escape') {
        const d = draftRef.current;
        if (!d || d.text === d.from) return;
        e.preventDefault();
        draftRef.current = null;
        setDraft(null);
        el.blur();
      }
    };
    const onBlur = () => {
      const d = draftRef.current;
      draftRef.current = null;
      setDraft(null);
      if (!d || d.from !== textRef.current) return;
      const next = d.text.trim();
      if (next && next !== textRef.current) commitRef.current(next);
    };
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <input
      ref={input}
      className="checklist-input"
      aria-label={tr('checklistItem', { text: item.text })}
      value={live ? live.text : item.text}
      onChange={(e) => {
        const next = { from: live?.from ?? item.text, text: e.target.value };
        draftRef.current = next;
        setDraft(next);
      }}
    />
  );
}

/** The field Thêm mục opens: Enter adds and keeps it open for the next item; Escape, or leaving it empty, closes it. */
function AddItem({ onAdd, onDone }: { onAdd(text: string): void; onDone(refocus: boolean): void }) {
  const tr = useT();
  const [text, setText] = useState('');
  const textRef = useRef(text);
  textRef.current = text;
  const done = useRef(onDone);
  done.current = onDone;
  const added = useRef(onAdd);
  added.current = onAdd;
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        const next = textRef.current.trim();
        if (!next) return;
        textRef.current = '';
        setText('');
        added.current(next);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        textRef.current = '';
        done.current(true);
      }
    };
    // Native, as the item's own field: a drawer closing with focus here still adds what is typed.
    const onBlur = () => {
      const next = textRef.current.trim();
      textRef.current = '';
      if (next) added.current(next);
      done.current(false);
    };
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <span className="checklist-new">
      <PlusIcon size={16} className="checklist-new-icon" />
      <input
        ref={input}
        className="checklist-input"
        aria-label={tr('addItem')}
        placeholder={tr('addItem')}
        value={text}
        onChange={(e) => {
          textRef.current = e.target.value;
          setText(e.target.value);
        }}
      />
    </span>
  );
}
