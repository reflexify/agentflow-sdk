import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { isProjectsError, type BoardTasks } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { refusalText } from '../data/failure.js';
import { boardScopes, keys } from '../data/keys.js';
import { Confirm, Dialog, Menu, RichEditor, Tooltip, useToast, type MenuItem } from '../kit/elements.js';
import { plainText } from '../model/format.js';
import { between } from '../model/positions.js';
import { can, rolesOf, type Verdict } from '../model/roles.js';
import type { Project, Section } from '../model/types.js';
import { GripVertical, InfoIcon, MoreHorizontal, PlusIcon } from '../shared/icons.js';
import type { SectionHandle } from './Column.js';

/**
 * A section write, one at a time: a second press while one is in flight does nothing. Whatever the answer, the
 * sections and the board are read again, so a refusal shows what the server holds.
 */
function useSectionWrite(projectId: string): { run<T>(write: () => Promise<T>): Promise<T | null>; busy: boolean } {
  const qc = useQueryClient();
  const toast = useToast();
  const tr = useT();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = useCallback(async <T,>(write: () => Promise<T>): Promise<T | null> => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setBusy(true);
    try {
      return await write();
    } catch (e) {
      if (isProjectsError(e, 'stale')) toast({ kind: 'info', text: tr('sectionUpdatedElsewhere') });
      else if (isProjectsError(e, 'offline')) toast({ kind: 'error', text: tr('offlineLocked') });
      else {
        if (!isProjectsError(e)) console.error(e);
        toast({ kind: 'error', text: refusalText(e, tr) || tr('saveFailed') });
      }
      return null;
    } finally {
      inFlight.current = false;
      setBusy(false);
      void qc.invalidateQueries({ queryKey: keys.sections(projectId) });
      void qc.invalidateQueries({ queryKey: ['board', projectId] });
    }
  }, [qc, toast, tr, projectId]);
  return { run, busy };
}

/** How many cancelled tasks the section has, from a board already read with cancelled tasks shown; null if none was. */
function cachedCancelled(qc: QueryClient, project: string, section: string): number | null {
  for (const scope of boardScopes(project).filter((sc) => sc.cancelled)) {
    const board = qc.getQueryData<BoardTasks>(keys.board(scope));
    if (board) return board.tasks.filter((t) => t.status === 'cancelled' && t.section === section).length;
  }
  return null;
}

/**
 * A one-line name typed in place: Enter or leaving commits, Esc restores, and a blank name writes nothing. `refocus`
 * says the input's own focus has nowhere to go once it unmounts: a key ended the edit, or focus left for nothing.
 * Leaving for another control keeps focus there.
 */
function NameInput(p: { initial: string; onCommit(name: string, refocus: boolean): void; onCancel(refocus: boolean): void }) {
  const tr = useT();
  const settled = useRef(false);
  const commit = (value: string, refocus: boolean) => {
    if (settled.current) return;
    settled.current = true;
    const name = value.trim();
    if (name && name !== p.initial) p.onCommit(name, refocus);
    else p.onCancel(refocus);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(e.currentTarget.value, true);
    } else if (e.key === 'Escape') {
      // Marked handled, so the drawer's own Escape leaves it open.
      e.preventDefault();
      settled.current = true;
      p.onCancel(true);
    }
  };
  return (
    <input
      className="column-name-input"
      aria-label={tr('sectionName')}
      placeholder={tr('sectionName')}
      defaultValue={p.initial}
      autoFocus
      onKeyDown={onKeyDown}
      onBlur={(e) => commit(e.currentTarget.value, e.relatedTarget === null)}
    />
  );
}

/**
 * The head of a section's column: its name with how many of its tasks are done, the description behind an info
 * icon, and for managers a menu to rename, describe or delete it. After an inline rename the heading takes focus back.
 * With a `handle`, the head is what a manager drags to reorder the sections, and its grip is the keyboard's handle.
 */
export function SectionHeader(p: { section: Section; project: Project; headingId: string; handle?: SectionHandle | undefined }) {
  const { section, project } = p;
  const { api, viewer, online, lang } = useProjects();
  const tr = useT();
  const qc = useQueryClient();
  const { run, busy } = useSectionWrite(project.id);
  const [editing, setEditing] = useState(false);
  const [describing, setDescribing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const refocus = useRef(false);
  // Read when Lưu is pressed: the editor reports its last change on blur, in the same task as that press.
  const draft = useRef(section.description);

  const manager = rolesOf(viewer, project).manager;
  const verdict = can('sections', { viewer, project, online });
  const lockedItem = (id: string, label: string, danger = false): MenuItem =>
    verdict.ok ? { id, label, danger } : { id, label, danger, disabled: true, reason: tr(verdict.reason) };
  const items = [
    lockedItem('rename', tr('renameSection')),
    lockedItem('describe', tr('describeSection')),
    lockedItem('delete', tr('deleteSection'), true),
  ];

  const onSelect = ({ id }: { id: string }) => {
    if (!verdict.ok) return;
    if (id === 'rename') setEditing(true);
    else if (id === 'describe') {
      draft.current = section.description;
      setDescribing(true);
    } else if (id === 'delete') void confirmDelete();
  };

  // Once the input has gone, focus returns to the heading, where the rename began from the reader's point of view.
  useLayoutEffect(() => {
    if (editing || !refocus.current) return;
    refocus.current = false;
    heading.current?.focus();
  }, [editing]);
  const endEdit = (again: boolean) => {
    refocus.current = again;
    setEditing(false);
  };

  // The section's total leaves out its cancelled tasks, which a delete moves too; the board shows them only on request.
  const confirmDelete = async () => {
    let cancelled = cachedCancelled(qc, project.id, section.id);
    if (cancelled === null) {
      try {
        const read = await api.boardTasks({ project: project.id, done: 'hide', cancelled: true });
        cancelled = read.tasks.filter((t) => t.status === 'cancelled' && t.section === section.id).length;
      } catch {
        cancelled = 0;
      }
    }
    setMoving(section.total + cancelled);
    setDeleting(true);
  };

  const rename = (name: string, again: boolean) => {
    endEdit(again);
    // Shown at once; the read that follows the write puts back the stored name if it was refused.
    qc.setQueryData<Section[]>(keys.sections(project.id), (list) => list?.map((s) => (s.id === section.id ? { ...s, name } : s)));
    void run(() => api.updateSection(section, { name }));
  };
  const saveDescription = async () => {
    const saved = await run(() => api.updateSection(section, { description: draft.current }));
    if (saved) setDescribing(false);
  };
  const remove = async () => {
    await run(() => api.deleteSection(section));
    setDeleting(false);
  };

  const ratio = section.total > 0 ? section.done / section.total : 0;
  const handle = p.handle;
  // A name being typed in place is not a handle: a press in it selects text.
  const dragFrom = handle?.movable && !editing ? handle.listeners : undefined;
  const gripReason = `section-grip-reason-${section.id}`;
  const grip = handle && (
    <button
      type="button"
      ref={handle.setActivator}
      className="column-grip"
      data-part="section-grip"
      {...(handle.movable ? handle.attributes : {})}
      aria-label={tr('reorderSection', { name: section.name })}
      aria-disabled={handle.movable ? undefined : 'true'}
      aria-describedby={handle.movable ? handle.attributes['aria-describedby'] : gripReason}
    >
      <GripVertical size={14} />
    </button>
  );
  return (
    <div className="column-head" data-kind="section" data-section={section.id} data-movable={dragFrom ? 'true' : undefined} {...dragFrom}>
      <div className="column-head-row">
        <h3 className="column-title" id={p.headingId} ref={heading} tabIndex={-1}>
          {editing
            ? <NameInput initial={section.name} onCommit={rename} onCancel={endEdit} />
            : <Tooltip text={section.name} locale={lang}><span className="column-name">{section.name}</span></Tooltip>}
          {/* The heading says its count; the figure shown after the info icon is the same words for the eye. */}
          {' '}<span className="sr-only">{`· ${section.done}/${section.total}`}</span>
        </h3>
        {section.description && !editing && (
          <Tooltip text={plainText(section.description)} locale={lang}>
            <span className="section-info" data-part="section-info" tabIndex={0} role="img" aria-label={plainText(section.description)}>
              <InfoIcon size={14} />
            </span>
          </Tooltip>
        )}
        {!editing && <span className="column-count" aria-hidden="true">{`${section.done}/${section.total}`}</span>}
        {(grip || manager) && (
          <span className="column-tools">
            {grip && (verdict.ok ? grip : (
              <>
                <Tooltip text={tr(verdict.reason)} locale={lang}>{grip}</Tooltip>
                <span id={gripReason} className="sr-only">{tr(verdict.reason)}</span>
              </>
            ))}
            {manager && (
              <span className="column-menu">
                <Menu items={items} label={tr('sectionActions', { name: section.name })} locale={lang} onSelect={onSelect}>
                  <MoreHorizontal size={16} />
                </Menu>
              </span>
            )}
          </span>
        )}
      </div>
      <div className="section-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${ratio})` }} />
      </div>
      {manager && (
        <>
          <Dialog
            open={describing}
            heading={tr('describeSectionHeading', { name: section.name })}
            locale={lang}
            onClose={() => setDescribing(false)}
            actions={
              <>
                <button type="button" className="af-button secondary" onClick={() => setDescribing(false)}>{tr('cancel')}</button>
                <button
                  type="button"
                  className="af-button primary"
                  aria-disabled={busy ? 'true' : undefined}
                  aria-busy={busy ? 'true' : undefined}
                  onClick={() => { if (!busy) void saveDescription(); }}
                >
                  {tr('save')}
                </button>
              </>
            }
          >
            {describing && (
              <RichEditor value={section.description} locale={lang} onChange={({ value }) => { draft.current = value; }} />
            )}
          </Dialog>
          <Confirm
            open={deleting}
            heading={tr('deleteSectionHeading', { name: section.name })}
            impact={tr('sectionDeleteImpact', { n: moving })}
            confirmLabel={tr('confirmDeleteSection')}
            danger
            busy={busy}
            locale={lang}
            strings={{ cancel: tr('goBack') }}
            onConfirm={() => void remove()}
            onCancel={() => setDeleting(false)}
          />
        </>
      )}
    </div>
  );
}

/**
 * The ghost last column a manager adds a section from: it goes after the last one. When the name input closes, focus
 * comes back to the button, and `onAdded` hands the new section to the board, which moves focus to its column.
 */
export function AddSection({ project, sections, onAdded }: { project: Project; sections: Section[]; onAdded(id: string): void }) {
  const { api, viewer, online, lang } = useProjects();
  const tr = useT();
  const qc = useQueryClient();
  const { run } = useSectionWrite(project.id);
  const [adding, setAdding] = useState(false);
  const verdict: Verdict = can('sections', { viewer, project, online });
  const button = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);

  useLayoutEffect(() => {
    if (adding || !refocus.current) return;
    refocus.current = false;
    button.current?.focus();
  }, [adding]);
  const close = (again: boolean) => {
    refocus.current = again;
    setAdding(false);
  };

  const create = async (name: string, again: boolean) => {
    close(again);
    const positions = sections.flatMap((s) => (s.position === null ? [] : [s.position]));
    const last = positions.length > 0 ? Math.max(...positions) : null;
    const saved = await run(() => api.createSection(project.id, name, between(last, null)!));
    if (!saved) return;
    qc.setQueryData<Section[]>(keys.sections(project.id), (list) => (list && !list.some((s) => s.id === saved.id) ? [...list, saved] : list));
    if (again) onAdded(saved.id);
  };

  if (adding) {
    return (
      <div className="add-section" data-state="editing">
        <NameInput initial="" onCommit={(name, again) => void create(name, again)} onCancel={close} />
      </div>
    );
  }
  const reason = `add-section-reason-${project.id}`;
  const control = (
    <button
      ref={button}
      type="button"
      className="add-section"
      aria-disabled={verdict.ok ? undefined : 'true'}
      aria-describedby={verdict.ok ? undefined : reason}
      onClick={() => { if (verdict.ok) setAdding(true); }}
    >
      <PlusIcon size={16} />
      {tr('addSection')}
    </button>
  );
  if (verdict.ok) return control;
  return (
    <>
      <Tooltip text={tr(verdict.reason)} locale={lang}>{control}</Tooltip>
      <span id={reason} className="sr-only">{tr(verdict.reason)}</span>
    </>
  );
}
