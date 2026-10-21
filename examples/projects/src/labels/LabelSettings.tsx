import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { ProjectsError } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { labelDeleteRefusalText } from '../data/failure.js';
import { isCascadeRefusal, useLabelWrites } from '../data/hooks.js';
import { Confirm, Dialog, Tooltip, useToast } from '../kit/elements.js';
import { canManageLabels } from '../model/roles.js';
import type { Status, TaskLabel } from '../model/types.js';
import { BanIcon, LockIcon, PlusIcon, StatusGlyph } from '../shared/icons.js';
import { useNavigate } from '../shell/RouteContext.js';
import { Empty } from '../shell/States.js';
import type { TextKey } from '../text.js';

const STATUSES: readonly Status[] = ['todo', 'doing', 'done', 'cancelled'];
const WORD: Record<Status, TextKey> = { todo: 'statusTodo', doing: 'statusDoing', done: 'statusDone', cancelled: 'statusCancelled' };

/** A delete the platform refused whole: the label, and the refusal, which is said in the language shown when it is drawn. */
interface Refusal { label: TaskLabel; error: ProjectsError }

/**
 * Sub-labels for project admins: the four statuses, each with its labels. A name is edited where it stands, and a
 * delete is asked about first. Anyone else sees that the page is not theirs.
 */
export function LabelSettings() {
  const { viewer, online, labels, lang } = useProjects();
  const tr = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const verdict = canManageLabels(viewer, online);
  const writes = useLabelWrites();
  const reasonId = useId();
  const root = useRef<HTMLElement>(null);
  const [pending, setPending] = useState<TaskLabel | null>(null);
  const [working, setWorking] = useState(false);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [focusOn, setFocusOn] = useState<string | null>(null);
  // Set in the press's own tick, before React has rendered: a second press finds it.
  const inFlight = useRef(false);
  // What a dialog said last, so it keeps its words while it closes.
  const lastPending = useRef<TaskLabel | null>(null);
  const lastRefusal = useRef<Refusal | null>(null);
  if (pending) lastPending.current = pending;
  if (refusal) lastRefusal.current = refusal;

  // The dialog is modal: while it closes the page is inert, and the kit then puts focus back where it was before the
  // dialog opened. The field takes focus a frame or two after that, or the kit's restore would win.
  useEffect(() => {
    if (!focusOn) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const input = root.current?.querySelector<HTMLInputElement>(`[data-label="${focusOn}"] [data-part="name"]`);
        setFocusOn(null);
        input?.focus();
        input?.select();
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusOn]);

  if (!viewer.projectAdmin) {
    return (
      <div className="label-settings-forbidden" data-state="forbidden">
        <Empty
          icon={<LockIcon size={32} />}
          text={tr('labelsForbidden')}
          action={<button type="button" className="af-button secondary" onClick={() => navigate('/projects')}>{tr('breadcrumbProjects')}</button>}
        />
      </div>
    );
  }

  const lock: TextKey | null = verdict.ok ? null : verdict.reason;

  const confirmDelete = async () => {
    if (!pending || inFlight.current || lock) return;
    inFlight.current = true;
    setWorking(true);
    const label = pending;
    try {
      const result = await writes.remove(label);
      if (result.ok) {
        toast({ kind: 'success', text: result.cleared > 0 ? tr('labelDeletedCleared', { n: result.cleared }) : tr('labelDeleted') });
      } else if (isCascadeRefusal(result.error)) {
        setRefusal({ label, error: result.error });
      }
    } finally {
      inFlight.current = false;
      setWorking(false);
      setPending(null);
    }
  };

  const shownPending = pending ?? lastPending.current;
  const shownRefusal = refusal ?? lastRefusal.current;
  const refusalLine = shownRefusal ? labelDeleteRefusalText(shownRefusal.error, tr) : null;
  return (
    <section className="label-settings" ref={root}>
      <header className="label-settings-head">
        <h2 className="label-settings-title">{tr('labelSettings')}</h2>
        <p className="label-settings-hint">{tr('labelSettingsHint')}</p>
      </header>
      {lock && <span id={reasonId} className="sr-only">{tr(lock)}</span>}
      <div className="label-groups">
        {STATUSES.map((status) => (
          <Group
            key={status}
            status={status}
            labels={labels.filter((l) => l.baseStatus === status).sort((a, b) => a.name.localeCompare(b.name, 'vi'))}
            lock={lock}
            reasonId={reasonId}
            onAdd={(name) => void writes.create(name, status)}
            onRename={(label, name) => void writes.rename(label, name)}
            onDelete={(label) => { if (!lock) setPending(label); }}
          />
        ))}
      </div>
      <div className="label-modal">
        <Confirm
          open={pending !== null}
          heading={shownPending ? tr('deleteLabelHeading', { name: shownPending.name }) : ''}
          message={tr('deleteLabelConfirm')}
          confirmLabel={tr('deleteLabel')}
          danger
          busy={working}
          locale={lang}
          strings={{ cancel: tr('goBack') }}
          onConfirm={() => void confirmDelete()}
          onCancel={() => { if (!working) setPending(null); }}
        />
        <Dialog
          open={refusal !== null}
          heading={tr('labelInUse')}
          locale={lang}
          onClose={() => setRefusal(null)}
          actions={
            <>
              <button type="button" className="af-button secondary" onClick={() => setRefusal(null)}>{tr('goBack')}</button>
              <button
                type="button"
                className="af-button primary"
                onClick={() => {
                  const id = shownRefusal?.label.id ?? null;
                  setRefusal(null);
                  setFocusOn(id);
                }}
              >
                {tr('rename')}
              </button>
            </>
          }
        >
          {shownRefusal && (
            <div className="label-refusal">
              {refusalLine && <p className="label-refusal-reason">{refusalLine}</p>}
              <p className="label-refusal-hint">{tr('labelInUseHint')}</p>
            </div>
          )}
        </Dialog>
      </div>
    </section>
  );
}

function Group(p: {
  status: Status; labels: TaskLabel[]; lock: TextKey | null; reasonId: string;
  onAdd(name: string): void; onRename(label: TaskLabel, name: string): void; onDelete(label: TaskLabel): void;
}) {
  const tr = useT();
  const headingId = useId();
  const builtIn = p.status === 'doing';
  const count = p.labels.length + (builtIn ? 1 : 0);
  return (
    <section className="label-group" data-group={p.status} aria-labelledby={headingId}>
      <h3 id={headingId} className="label-group-head">
        <span className="group-mark" data-status={p.status}><StatusGlyph status={p.status} size={14} /></span>
        <span className="label-group-name">{tr(WORD[p.status])}</span>
        <span className="sr-only">, </span>
        <span className="label-count">{count}</span>
      </h3>
      {count === 0 && <p className="label-empty">{tr('noLabelsYet')}</p>}
      {count > 0 && (
        <ul className="label-list">
          {p.labels.map((label) => (
            <LabelRow key={label.id} label={label} lock={p.lock} reasonId={p.reasonId} onRename={p.onRename} onDelete={p.onDelete} />
          ))}
          {builtIn && (
            <li className="label-row" data-label="built-in-blocked" data-built-in="true">
              <span className="label-builtin"><BanIcon size={14} />{tr('blocked')}</span>
              <span className="tag label-chip">{tr('builtIn')}</span>
            </li>
          )}
        </ul>
      )}
      <AddLabel status={p.status} lock={p.lock} reasonId={p.reasonId} onAdd={p.onAdd} />
    </section>
  );
}

/** A control that is locked keeps its place, says why in a tooltip, and is described by the page's one reason. */
function Guarded(p: { lock: TextKey | null; children(locked: boolean): ReactNode }) {
  const tr = useT();
  const { lang } = useProjects();
  if (!p.lock) return <>{p.children(false)}</>;
  return <Tooltip text={tr(p.lock)} locale={lang}>{p.children(true)}</Tooltip>;
}

function LabelRow(p: {
  label: TaskLabel; lock: TextKey | null; reasonId: string; onRename(label: TaskLabel, name: string): void; onDelete(label: TaskLabel): void;
}) {
  const { label } = p;
  const tr = useT();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(label.name);
  // A key ended the edit, so the blur that follows is not a commit.
  const skipBlur = useRef(false);

  // A name that changed elsewhere shows at once, unless it is being typed over.
  useEffect(() => {
    const el = input.current;
    const focused = !!el && (el.getRootNode() as Document | ShadowRoot).activeElement === el;
    if (!focused) setValue(label.name);
  }, [label.name]);

  const commit = (typed: string) => {
    const name = typed.trim();
    if (!name || name === label.name) {
      setValue(label.name);
      return;
    }
    setValue(name);
    p.onRename(label, name);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      skipBlur.current = true;
      setValue(label.name);
      e.currentTarget.blur();
    }
  };

  return (
    <li className="label-row" data-label={label.id}>
      <input
        ref={input}
        className="label-name-input"
        data-part="name"
        value={value}
        autoComplete="off"
        readOnly={!!p.lock}
        aria-label={tr('labelNameField')}
        aria-describedby={p.lock ? p.reasonId : undefined}
        onFocus={() => { skipBlur.current = false; }}
        onChange={(e) => { skipBlur.current = false; setValue(e.target.value); }}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (skipBlur.current) {
            skipBlur.current = false;
            return;
          }
          if (!p.lock) commit(e.currentTarget.value);
        }}
      />
      <span className="label-actions">
        <Guarded lock={p.lock}>
          {(locked) => (
            <button
              type="button"
              className="af-button ghost sm"
              aria-label={tr('renameLabelOf', { name: label.name })}
              aria-disabled={locked ? 'true' : undefined}
              aria-describedby={locked ? p.reasonId : undefined}
              onClick={() => { if (!locked) { input.current?.focus(); input.current?.select(); } }}
            >
              {tr('rename')}
            </button>
          )}
        </Guarded>
        <Guarded lock={p.lock}>
          {(locked) => (
            <button
              type="button"
              className="af-button ghost sm action-delete"
              aria-label={tr('deleteLabelOf', { name: label.name })}
              aria-disabled={locked ? 'true' : undefined}
              aria-describedby={locked ? p.reasonId : undefined}
              onClick={() => { if (!locked) p.onDelete(label); }}
            >
              {tr('deleteLabel')}
            </button>
          )}
        </Guarded>
      </span>
    </li>
  );
}

/** Thêm nhãn: a button that becomes a name field until Enter, Esc or leaving; a blank name writes nothing. */
function AddLabel(p: { status: Status; lock: TextKey | null; reasonId: string; onAdd(name: string): void }) {
  const tr = useT();
  const [adding, setAdding] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const settled = useRef(false);

  useLayoutEffect(() => {
    if (adding || !refocus.current) return;
    refocus.current = false;
    button.current?.focus();
  }, [adding]);

  const finish = (typed: string | null, again: boolean) => {
    if (settled.current) return;
    settled.current = true;
    refocus.current = again;
    setAdding(false);
    const name = typed?.trim();
    if (name) p.onAdd(name);
  };

  if (adding) {
    return (
      <div className="label-add" data-state="editing">
        <input
          className="label-name-input"
          data-part="new"
          autoFocus
          autoComplete="off"
          aria-label={tr('newLabelName')}
          placeholder={tr('newLabelName')}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              finish(e.currentTarget.value, true);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              finish(null, true);
            }
          }}
          onBlur={(e) => finish(e.currentTarget.value, e.relatedTarget === null)}
        />
      </div>
    );
  }
  return (
    <div className="label-add">
      <Guarded lock={p.lock}>
        {(locked) => (
          <button
            ref={button}
            type="button"
            className="af-button ghost sm label-add-button"
            aria-disabled={locked ? 'true' : undefined}
            aria-describedby={locked ? p.reasonId : undefined}
            onClick={() => {
              if (locked) return;
              settled.current = false;
              setAdding(true);
            }}
          >
            <PlusIcon size={14} />
            {tr('addLabel')}
          </button>
        )}
      </Guarded>
    </div>
  );
}
