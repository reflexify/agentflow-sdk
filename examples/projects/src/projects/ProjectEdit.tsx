import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useProjects, useProjectsBase, useT } from '../data/context.js';
import { freshestProject, useProjectMutation, useUnits } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { isProjectsError } from '../api/projects-api.js';
import { GROUPS } from '../board/Toolbar.js';
import { Tooltip, useToast } from '../kit/elements.js';
import { can } from '../model/roles.js';
import type { GroupBy, Project, ProjectChanges } from '../model/types.js';
import { MentionedIn } from '../shared/MentionedIn.js';
import { DescriptionEditor } from '../shared/DescriptionEditor.js';
import { escapeTaken, leaveField } from '../shared/focus.js';
import { ChevronDown, LockIcon, XIcon } from '../shared/icons.js';
import { LockedValue, lockOf } from '../task/fields.js';
import type { TextKey } from '../text.js';

/** The drawer's row each change is shown in. */
const FIELD_OF: Record<keyof ProjectChanges, string | null> = {
  name: 'name', unit: 'unit', defaultGroupBy: 'group', description: 'description', status: null, managers: null, members: null,
};

/**
 * The drawer's writes, one at a time, each from the version last read. A change shows at once and is put back if it is
 * refused, and its row flashes. A stale write reloads the project and says so, with no flash: it is not the viewer's
 * error.
 */
function useWriter(project: Project) {
  const qc = useQueryClient();
  const key = keys.project(project.id);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const lastError = useRef<unknown>(null);
  const { update } = useProjectMutation({ onError: (e) => { lastError.current = e; } });
  const [rolledBack, setRolledBack] = useState<string | null>(null);
  const latest = useRef(project);
  latest.current = project;

  const save = useCallback((changes: ProjectChanges): Promise<Project | null> => {
    // Shown before the write is queued, so the field never flashes the old value while it waits its turn.
    void qc.cancelQueries({ queryKey: key });
    const before = qc.getQueryData<Project>(key) ?? latest.current;
    qc.setQueryData<Project>(key, { ...before, ...changes });
    // The cache keeps its own copy, so it is that copy a later read would have replaced.
    const shown = qc.getQueryData<Project>(key);
    const next = queue.current.then(async () => {
      lastError.current = null;
      const saved = await update(freshestProject(qc, latest.current), changes);
      // A refetch already under way brings the server's values; only a value nothing replaced is put back.
      if (!saved && qc.getQueryData(key) === shown) qc.setQueryData(key, before);
      const field = (Object.keys(changes) as (keyof ProjectChanges)[]).map((k) => FIELD_OF[k]).find(Boolean);
      if (!saved && field && !isProjectsError(lastError.current, 'stale')) setRolledBack(field);
      return saved;
    });
    queue.current = next.catch(() => undefined);
    return next;
  }, [qc, key, update]);

  const settled = useCallback((field: string) => setRolledBack((f) => (f === field ? null : f)), []);
  return { save, rolledBack, settled };
}

type Writer = ReturnType<typeof useWriter>;

/**
 * The project edit drawer: name, description, unit and default grouping, each saved as it changes. It sits in the page's
 * body beside the screen, as a task's drawer does, though the project menu opens it and the address does not name it.
 */
export function ProjectEdit({ project, open, onClose }: { project: Project; open: boolean; onClose(): void }) {
  const anchor = useRef<HTMLSpanElement>(null);
  // The body the screen and the task drawer share; undefined until looked for, null where the module has none.
  const [body, setBody] = useState<HTMLElement | null | undefined>(undefined);
  useLayoutEffect(() => {
    if (!open) return setBody(undefined);
    setBody(anchor.current?.closest('.app')?.querySelector<HTMLElement>(':scope > .body') ?? null);
  }, [open]);
  const writer = useWriter(project);

  const drawer = open && body !== undefined ? <Drawer project={project} writer={writer} onClose={onClose} /> : null;
  return (
    <>
      <span ref={anchor} hidden />
      {drawer && (body ? createPortal(drawer, body) : drawer)}
    </>
  );
}

function Drawer({ project, writer, onClose }: { project: Project; writer: Writer; onClose(): void }) {
  const { viewer, online, lang } = useProjects();
  const tr = useT();
  const aside = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const ids = { name: useId(), description: useId(), unit: useId(), group: useId() };
  const lock = lockOf(can('project_edit', { viewer, project, online }));

  // Each version of someone else's change is announced once.
  const toast = useToast();
  const announced = useRef<string | null>(null);
  const announce = (version: string) => {
    if (announced.current === version) return;
    announced.current = version;
    toast({ kind: 'info', text: tr('projectStale') });
  };

  const close = () => {
    leaveField(aside.current);
    onClose();
  };
  const closeRef = useRef(close);
  closeRef.current = close;

  // Focus goes to the heading once, when the drawer opens, not to the name, which would start an edit.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  // Closed some other way than close(), such as the project page going away: what is typed is saved all the same.
  useLayoutEffect(() => {
    const el = aside.current;
    return () => { leaveField(el); };
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || escapeTaken(e.nativeEvent)) return;
    e.stopPropagation();
    closeRef.current();
  };

  return (
    <aside ref={aside} className="drawer project-edit" role="dialog" aria-modal="false" aria-labelledby={headingId} onKeyDown={onKeyDown}>
      <div className="drawer-top">
        <div className="drawer-head">
          <h2 ref={heading} id={headingId} className="drawer-heading" tabIndex={-1}>{tr('editProject')}</h2>
          <Tooltip text={tr('close')} locale={lang}>
            <button type="button" className="icon-button" aria-label={tr('close')} onClick={close}>
              <XIcon />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="drawer-body">
        <section className="drawer-section">
          <Row field="name" writer={writer} label={tr('projectName')} labelId={ids.name} lock={lock}>
            <NameField project={project} writer={writer} lock={lock} labelId={ids.name} />
          </Row>
          <Row field="unit" writer={writer} label={tr('unit')} labelId={ids.unit} lock={lock}>
            <UnitField project={project} writer={writer} lock={lock} labelId={ids.unit} />
          </Row>
          <Row field="group" writer={writer} label={tr('defaultGrouping')} labelId={ids.group} lock={lock}>
            <GroupField project={project} writer={writer} lock={lock} labelId={ids.group} />
          </Row>
        </section>
        <section className="drawer-section">
          <Row field="description" writer={writer} label={tr('description')} labelId={ids.description} lock={lock} stacked reasonOnLabel>
            {lock && !project.description.trim()
              ? <span className="field-empty">{tr('noDescription')}</span>
              : (
                <DescriptionEditor
                  value={project.description}
                  mention={{ target: { entity: 'project', record: project.id }, map: project.mentions }}
                  version={project.updatedAt}
                  readonly={!!lock}
                  labelId={ids.description}
                  label={tr('description')}
                  placeholder={tr('descriptionPlaceholder')}
                  lang={lang}
                  save={(value) => writer.save({ description: value })}
                  announce={announce}
                />
              )}
          </Row>
        </section>
        <MentionedIn target={{ entity: 'project', record: project.id }} />
      </div>
    </aside>
  );
}

/** A labelled row of the drawer: the label is a heading, and a locked row shows a lock by it. */
function Row(p: {
  field: string; label: string; labelId: string; lock: TextKey | null; writer: Writer; stacked?: boolean; reasonOnLabel?: boolean; children: ReactNode;
}) {
  const tr = useT();
  const { lang } = useProjectsBase();
  const hint = p.lock && (p.reasonOnLabel
    ? (
      <Tooltip text={tr(p.lock)} locale={lang}>
        <span className="lock-hint" tabIndex={0} role="img" aria-label={tr(p.lock)}><LockIcon size={12} /></span>
      </Tooltip>
    )
    : <span className="lock-hint"><LockIcon size={12} /></span>);
  return (
    <div
      className={p.stacked ? 'field-row stacked' : 'field-row'}
      data-field={p.field}
      data-locked={p.lock ? '' : undefined}
      data-rolled-back={p.writer.rolledBack === p.field ? '' : undefined}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget) p.writer.settled(p.field); }}
    >
      <div className="field-label">
        <h3 id={p.labelId}>{p.label}</h3>
        {hint}
      </div>
      <div className="field-value">{p.children}</div>
    </div>
  );
}

interface FieldProps { project: Project; writer: Writer; lock: TextKey | null; labelId: string }

/**
 * The name, edited in place. Enter or leaving the field saves it; Escape puts it back. It is never empty: a blank name
 * says so while it is blank, then goes back to the stored one, and nothing is written.
 */
function NameField({ project, writer, lock, labelId }: FieldProps) {
  const tr = useT();
  const requiredId = useId();
  // A draft started from one stored name; if the stored name moves while it is being edited, the stored one wins.
  const [draft, setDraft] = useState<{ from: string; text: string } | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const stored = useRef(project.name);
  stored.current = project.name;
  const live = draft && draft.from === project.name ? draft : null;
  const blank = !!live && live.text.trim() === '';

  const commit = () => {
    const d = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (!d || d.from !== stored.current) return;
    const next = d.text.trim();
    if (!next || next === stored.current) return;
    void writer.save({ name: next });
  };
  const commitRef = useRef(commit);
  commitRef.current = commit;

  // A native listener, not React's: when the drawer closes, it still hears the blur that saves the draft.
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onBlur = () => commitRef.current();
    el.addEventListener('blur', onBlur);
    return () => el.removeEventListener('blur', onBlur);
  }, [lock]);

  if (lock) return <LockedValue reason={lock} labelId={labelId}>{project.name}</LockedValue>;
  return (
    <>
      <input
        ref={box}
        className="ghost-input"
        aria-labelledby={labelId}
        aria-invalid={blank || undefined}
        aria-describedby={blank ? requiredId : undefined}
        autoComplete="off"
        value={live ? live.text : project.name}
        onChange={(e) => setDraft({ from: live?.from ?? project.name, text: e.target.value })}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          } else if (e.key === 'Escape' && draftRef.current && draftRef.current.text !== draftRef.current.from) {
            // A typed change is put back first; with nothing typed, Escape is the drawer's.
            e.stopPropagation();
            draftRef.current = null;
            setDraft(null);
          }
        }}
      />
      {blank && <p id={requiredId} className="field-error" role="status">{tr('nameRequired')}</p>}
    </>
  );
}

function UnitField({ project, writer, lock, labelId }: FieldProps) {
  const tr = useT();
  const units = useUnits();
  const known = units.data?.find((u) => u.id === project.unit);
  if (lock) return <LockedValue reason={lock} labelId={labelId}>{project.unit ? known?.name ?? tr('loading') : tr('noUnit')}</LockedValue>;
  return (
    <>
      <span className="ghost-select" data-plain="">
        <select
          className="ghost-select-control"
          aria-labelledby={labelId}
          value={project.unit ?? ''}
          onChange={(e) => void writer.save({ unit: e.target.value || null })}
        >
          <option value="">{tr('noUnit')}</option>
          {/* A unit the list has not brought yet, or the viewer cannot list, still shows as chosen. */}
          {project.unit && !known && <option value={project.unit}>{tr('loading')}</option>}
          {(units.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <ChevronDown size={14} className="ghost-select-chevron" />
      </span>
      {units.isError && <p className="field-error" role="status">{tr('unitsFailed')}</p>}
    </>
  );
}

function GroupField({ project, writer, lock, labelId }: FieldProps) {
  const tr = useT();
  const current = GROUPS.find((g) => g.value === project.defaultGroupBy);
  if (lock) return <LockedValue reason={lock} labelId={labelId}>{tr(current?.label ?? 'groupAuto')}</LockedValue>;
  return (
    <span className="ghost-select" data-plain="">
      <select
        className="ghost-select-control"
        aria-labelledby={labelId}
        value={project.defaultGroupBy ?? ''}
        onChange={(e) => void writer.save({ defaultGroupBy: (e.target.value || null) as GroupBy | null })}
      >
        <option value="">{tr('groupAuto')}</option>
        {GROUPS.map(({ value, label }) => <option key={value} value={value}>{tr(label)}</option>)}
      </select>
      <ChevronDown size={14} className="ghost-select-chevron" />
    </span>
  );
}
