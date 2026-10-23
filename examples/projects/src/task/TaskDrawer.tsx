import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { isProjectsError, type BoardTasks, type MyWork, type TaskChanges } from '../api/projects-api.js';
import { useProjects, useProjectsBase, useT } from '../data/context.js';
import { useReportFailure } from '../data/failure.js';
import { useProject, useSections, useTask, useTaskMutation } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { DateInput, Tooltip, useToast } from '../kit/elements.js';
import { useLive } from '../live/LiveProvider.js';
import { isOverdue } from '../model/dates.js';
import { formatDay } from '../model/format.js';
import { can } from '../model/roles.js';
import type { Priority, Project, Task } from '../model/types.js';
import { PriorityMark } from '../board/marks.js';
import { ClosedBanner } from '../projects/ClosedBanner.js';
import { CalendarX2, ChevronDown, ChevronRight, PriorityGlyph, TrashIcon, XIcon } from '../shared/icons.js';
import { useHref, useNavigate, useRoute } from '../shell/RouteContext.js';
import { DEFAULT_QUERY, routePath, withTask, type Route } from '../shell/route.js';
import { ErrorState, Loading, NotFound } from '../shell/States.js';
import type { TextKey } from '../text.js';
import { FieldRow, LockedValue, lockOf, type DrawerWriter, type FieldKey } from './fields.js';
import { PeopleFields } from './PeopleFields.js';
import { StatusField } from './StatusField.js';
import { Attachments } from './Attachments.js';
import { Comments } from './Comments.js';
import { Checklist } from './Checklist.js';
import { DescriptionEditor } from '../shared/DescriptionEditor.js';
import { escapeTaken, leaveField, useLeaveOnUnmount } from '../shared/focus.js';
import { TaskActions, TaskOrigin } from './TaskActions.js';

const PRIORITIES: readonly Priority[] = ['urgent', 'high', 'medium', 'low'];
const PRIORITY_WORD: Record<Priority, TextKey> = { urgent: 'priorityUrgent', high: 'priorityHigh', medium: 'priorityMedium', low: 'priorityLow' };
/** A move into or out of done is followed by the completion stamp, a write of the package's own a moment later. */
const FOLLOW_UP_TRIES = 6;
const FOLLOW_UP_WAIT_MS = 300;

/** A record that is missing and one the viewer may not read are the same answer. */
const isMissing = (e: unknown) => isProjectsError(e, 'not_found') || isProjectsError(e, 'forbidden');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const crossesDone = (from: Task['status'], to: Task['status']) => (from === 'done') !== (to === 'done');

/** What the drawer shows of a task: a change to anything else (the stamp, the order on the board) is not news. */
function shownChanged(a: Task, b: Task): boolean {
  const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);
  return (['title', 'description', 'status', 'blocked', 'label', 'collaborators', 'priority', 'due', 'checklist',
    'showChecklistOnCard', 'holder', 'attachments', 'section', 'frozen'] as const).some((k) => !same(a[k], b[k]));
}

/** The shadow root the module renders in, so a key typed in the host's own page never reaches it; outside one, the module's own element. */
function keyScopeOf(element: HTMLElement): ShadowRoot | HTMLElement {
  const node = element.getRootNode();
  return node instanceof ShadowRoot ? node : (element.closest<HTMLElement>('.projects') ?? element.closest<HTMLElement>('.app') ?? element);
}

/** The task as a list already on screen holds it, so the drawer's first frame has its fields. */
function cachedTask(qc: QueryClient, id: string): Task | undefined {
  for (const [, data] of qc.getQueriesData<BoardTasks>({ queryKey: ['board'] })) {
    const found = data?.tasks.find((t) => t.id === id);
    if (found) return found;
  }
  const mine = qc.getQueryData<MyWork>(keys.mywork);
  return [...(mine?.primary ?? []), ...(mine?.collaborating ?? []), ...(mine?.claimableTasks ?? [])].find((t) => t.id === id);
}

/**
 * The drawer's writes, one at a time. Each write starts from the version last read and remembers the version it
 * stored, so a later read can tell the drawer's own change from someone else's. A write that moves the task into or
 * out of done is followed by the package's completion stamp, which moves the version again: the next write reads
 * the task first, so it does not meet a 409 it caused itself.
 */
function useWriter(taskId: string) {
  const qc = useQueryClient();
  const { api } = useProjectsBase();
  const report = useReportFailure();
  const key = keys.task(taskId);
  const lastError = useRef<unknown>(null);
  /** A stale write's reload is announced by the failure report; the drawer must not say it again. */
  const staleReload = useRef(false);
  const lastWritten = useRef<string | null>(null);
  const writing = useRef(0);
  const followUp = useRef(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const [rolledBack, setRolledBack] = useState<FieldKey | null>(null);
  const { update } = useTaskMutation({
    onError: (e) => {
      lastError.current = e;
      if (isProjectsError(e, 'stale')) staleReload.current = true;
    },
  });

  const enqueue = <T,>(fn: () => Promise<T>): Promise<T> => {
    const next = queue.current.then(fn, fn);
    queue.current = next.catch(() => undefined);
    return next;
  };

  const base = async (): Promise<Task | null> => {
    let current = qc.getQueryData<Task>(key);
    if (followUp.current && current && current.updatedAt === lastWritten.current) {
      for (let i = 0; i < FOLLOW_UP_TRIES; i++) {
        const fresh = await api.task(taskId).catch(() => null);
        if (fresh && fresh.updatedAt !== current.updatedAt) {
          qc.setQueryData(key, fresh);
          current = fresh;
          break;
        }
        if (i < FOLLOW_UP_TRIES - 1) await sleep(FOLLOW_UP_WAIT_MS);
      }
    }
    followUp.current = false;
    current ??= await qc.fetchQuery({ queryKey: key, queryFn: () => api.task(taskId) }).catch(() => undefined);
    return current ?? null;
  };

  const save = (changes: TaskChanges, field: FieldKey) => enqueue(async () => {
    writing.current++;
    try {
      const from = await base();
      if (!from) return null;
      await qc.cancelQueries({ queryKey: key });
      const before = qc.getQueryData<Task>(key) ?? from;
      qc.setQueryData<Task>(key, { ...before, ...changes });
      // The cache keeps its own copy, so it is that copy a later read would have replaced.
      const shown = qc.getQueryData<Task>(key);
      lastError.current = null;
      const saved = await update(from, changes);
      if (saved) {
        lastWritten.current = saved.updatedAt;
        if (crossesDone(from.status, saved.status)) followUp.current = true;
        return saved;
      }
      // A refetch already under way brings the server's values; only a value nothing replaced is put back.
      if (qc.getQueryData(key) === shown) qc.setQueryData(key, before);
      if (!isProjectsError(lastError.current, 'stale')) setRolledBack(field);
      return null;
    } finally {
      writing.current--;
    }
  });

  const run = (field: FieldKey, write: (task: Task) => Promise<unknown>, shows?: Partial<Task>) => enqueue(async () => {
    writing.current++;
    try {
      const from = await base();
      if (!from) return false;
      let shown: Task | undefined;
      let before: Task | undefined;
      if (shows) {
        await qc.cancelQueries({ queryKey: key });
        before = qc.getQueryData<Task>(key) ?? from;
        qc.setQueryData<Task>(key, { ...before, ...shows });
        shown = qc.getQueryData<Task>(key);
      }
      const putBack = () => {
        if (before && qc.getQueryData(key) === shown) qc.setQueryData(key, before);
      };
      try {
        const answer = await write(from);
        // `false` is a refusal the operation has already reported.
        if (answer === false) {
          putBack();
          setRolledBack(field);
          void qc.invalidateQueries({ queryKey: key });
          return false;
        }
        // Work operations answer with no record, so the drawer reads its own write back.
        const saved = answer && typeof answer === 'object' && (answer as Task).id === taskId
          ? (answer as Task)
          : await qc.fetchQuery({ queryKey: key, queryFn: () => api.task(taskId), staleTime: 0 });
        qc.setQueryData(key, saved);
        lastWritten.current = saved.updatedAt;
        void qc.invalidateQueries({ queryKey: ['board'] });
        void qc.invalidateQueries({ queryKey: keys.mywork });
        return true;
      } catch (e) {
        putBack();
        if (isProjectsError(e, 'stale')) staleReload.current = true;
        else setRolledBack(field);
        void qc.invalidateQueries({ queryKey: key });
        report(e, taskId);
        return false;
      }
    } finally {
      writing.current--;
    }
  });

  // Another task's marks say nothing about this one.
  useLayoutEffect(() => {
    lastError.current = null;
    staleReload.current = false;
    lastWritten.current = null;
    followUp.current = false;
    setRolledBack(null);
  }, [taskId]);

  const writer: DrawerWriter = { save, run, rolledBack, settled: (field) => setRolledBack((f) => (f === field ? null : f)) };
  return { writer, lastWritten, writing, staleReload };
}

/**
 * The drawer of `taskId`, over the page `route` names: closing it goes back to that page, which stays mounted
 * behind, so it keeps its scroll. It reloads on a live change to its task and says so when someone else made it.
 */
export function TaskDrawer({ taskId, route: over }: { taskId: string; route?: Route }) {
  const current = useRoute();
  const route = over ?? current;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { ids, lang } = useProjectsBase();
  const { watch } = useLive();
  const tr = useT();
  const toast = useToast();
  const seed = useCallback(() => cachedTask(qc, taskId), [qc, taskId]);
  const task = useTask(taskId, seed);
  const project = useProject(task.data?.project ?? null);
  const aside = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const { writer, lastWritten, writing, staleReload } = useWriter(taskId);

  // Whether focus was in the drawer when close() left the field it was in, so it can still be given back.
  const focusWasInside = useRef(false);
  const close = useCallback(() => {
    focusWasInside.current = !!leaveField(aside.current);
    navigate(withTask(route, null));
  }, [navigate, route]);
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    watch({ entityId: ids.entities.task, recordId: taskId });
    return () => watch(null);
  }, [watch, ids, taskId]);

  // Escape is heard on the module's own scope, after anything inside that took it for itself.
  useEffect(() => {
    const el = aside.current;
    if (!el) return;
    const scope = keyScopeOf(el);
    const onKey = (e: Event) => {
      if ((e as KeyboardEvent).key !== 'Escape' || escapeTaken(e)) return;
      closeRef.current();
    };
    scope.addEventListener('keydown', onKey);
    return () => scope.removeEventListener('keydown', onKey);
  }, []);

  // Focus goes to the heading once, when the drawer opens; switching task leaves it where the viewer put it.
  const focused = useRef(false);
  const loaded = !!task.data;
  const failed = task.isError && !task.data;
  useEffect(() => {
    if (focused.current) return;
    const target = loaded ? heading.current : failed ? closeButton.current : null;
    if (!target) return;
    focused.current = true;
    target.focus({ preventScroll: true });
  }, [loaded, failed]);

  // On close, focus goes back to the card the task was opened from, else to the page. Run only when the drawer goes,
  // not on a task switch, and only once it has gone: React's development double run keeps it connected.
  const openTask = useRef(taskId);
  openTask.current = taskId;
  useLayoutEffect(() => {
    const el = aside.current;
    if (!el) return;
    return () => {
      // Closed some other way than close(), such as the browser's back: what is typed is saved all the same.
      const left = leaveField(el);
      const inside = !!left || focusWasInside.current;
      focusWasInside.current = false;
      const root = el.getRootNode() as Document | ShadowRoot;
      if (!inside) return;
      setTimeout(() => {
        if (el.isConnected) {
          // Still open: React's development double run took the drawer down and put it back. The field it left, the
          // heading focused on open included, takes focus back unless something else has it now.
          const now = root.activeElement;
          if (left?.isConnected && (!now || now === el.ownerDocument.body)) left.focus({ preventScroll: true });
          return;
        }
        const card = root.querySelector<HTMLElement>(`[data-task="${CSS.escape(openTask.current)}"] [data-part="title"]`);
        (card ?? root.querySelector<HTMLElement>('main.screen'))?.focus({ preventScroll: true });
      }, 0);
    };
  }, []);

  // What the drawer last showed, to tell a reload that brings someone else's change from one that brings its own.
  const shown = useRef<{ task: Task; placeholder: boolean } | null>(null);
  // Each version of someone else's is announced once, whichever path finds it first.
  const announced = useRef<string | null>(null);
  const announce = useCallback((version: string) => {
    if (announced.current === version) return;
    announced.current = version;
    toast({ kind: 'info', text: tr('taskUpdatedElsewhere') });
  }, [toast, tr]);
  useEffect(() => {
    const next = task.data;
    if (!next) return;
    const prev = shown.current;
    shown.current = { task: next, placeholder: task.isPlaceholderData };
    if (!prev || prev.placeholder || prev.task.id !== next.id || prev.task.updatedAt === next.updatedAt) return;
    if (next.updatedAt === lastWritten.current) return;
    if (staleReload.current) {
      staleReload.current = false;
      announced.current = next.updatedAt;
      return;
    }
    if (writing.current > 0 || !shownChanged(prev.task, next)) return;
    announce(next.updatedAt);
  }, [task.data, task.isPlaceholderData, lastWritten, staleReload, writing, announce]);

  const gone = !!task.data && task.isError && isMissing(task.error);
  const data = gone ? null : task.data;
  const projectUnavailable = project.isError && isMissing(project.error);
  // Named in every state, so a screen reader always hears what the panel is.
  const stateName = data ? undefined
    : gone ? tr('taskGone')
      : task.isError ? tr(isMissing(task.error) ? 'notFound' : 'loadFailed')
        : tr('loading');

  return (
    <aside ref={aside} className="drawer" role="dialog" aria-modal="false" aria-labelledby={data ? headingId : undefined} aria-label={stateName}>
      <div className="drawer-top">
        <div className="drawer-head">
          <p className="drawer-crumb">
            {data && project.data ? <Crumb task={data} project={project.data} /> : data && projectUnavailable ? <span className="drawer-crumb-text">{tr('projectUnavailable')}</span> : null}
          </p>
          <Tooltip text={tr('close')} locale={lang}>
            <button ref={closeButton} type="button" className="icon-button" aria-label={tr('close')} onClick={close}>
              <XIcon />
            </button>
          </Tooltip>
        </div>
        {data && project.data && <ClosedBanner project={project.data} />}
      </div>
      {gone
        ? (
          <div className="state empty drawer-gone" role="status">
            <span className="state-icon"><TrashIcon size={32} /></span>
            <p className="state-title">{tr('taskGone')}</p>
          </div>
        )
        : data
          ? <DrawerBody task={data} project={project.data ?? null} writer={writer} headingId={headingId} heading={heading} close={close} announce={announce} />
          : task.isError
            ? isMissing(task.error) ? <NotFound /> : <ErrorState error={task.error} onRetry={() => void task.refetch()} />
            : <Loading kind="form" />}
    </aside>
  );
}

/** The project, and the section when there is one, of the task: where it lives, at a glance. */
function Crumb({ task, project }: { task: Task; project: Project }) {
  const sections = useSections(task.section ? project.id : null);
  const section = task.section ? sections.data?.find((s) => s.id === task.section) : undefined;
  const navigate = useNavigate();
  const href = useHref();
  const path = routePath({ screen: 'project', project: project.id, view: DEFAULT_QUERY });
  return (
    <>
      <a
        className="drawer-crumb-link"
        href={href(path)}
        onClick={(e) => {
          // A plain click stays in the module; a modified one is the browser's, for a new tab or window.
          if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          navigate(path);
        }}
      >
        {project.name}
      </a>
      {section && (
        <>
          {/* Drawn as a chevron; the text is what the trail reads as when copied. */}
          <span className="drawer-crumb-sep" aria-hidden="true"><ChevronRight size={12} /><span className="sr-only"> › </span></span>
          <span className="drawer-crumb-section">{section.name}</span>
        </>
      )}
    </>
  );
}

function DrawerBody(p: {
  task: Task; project: Project | null; writer: DrawerWriter; headingId: string; heading: RefObject<HTMLHeadingElement | null>; close(): void;
  announce(version: string): void;
}) {
  const { task, project, writer } = p;
  const { viewer, online, lang, today } = useProjects();
  const tr = useT();
  const priorityId = useId();
  const dueId = useId();
  const descriptionId = useId();
  const content = can('edit_content', { viewer, project, task, online });
  const lock = lockOf(content);

  return (
    <div className="drawer-body">
      <section className="drawer-section">
        <TitleField key={task.id} task={task} writer={writer} editable={content.ok} headingId={p.headingId} heading={p.heading} />
      </section>

      <section className="drawer-section">
        <FieldRow field="priority" label={tr('priority')} labelId={priorityId} writer={writer} lock={lock}>
          {lock
            ? (
              <LockedValue reason={lock} labelId={priorityId}><PriorityMark priority={task.priority} /></LockedValue>
            )
            : (
              <span className="ghost-select" data-priority={task.priority ?? 'none'}>
                <PriorityGlyph priority={task.priority} />
                <select
                  className="ghost-select-control"
                  aria-labelledby={priorityId}
                  value={task.priority ?? ''}
                  onChange={(e) => void writer.save({ priority: e.target.value as Priority }, 'priority')}
                >
                  {task.priority === null && <option value="" disabled>{tr('priorityNone')}</option>}
                  {PRIORITIES.map((pr) => <option key={pr} value={pr}>{tr(PRIORITY_WORD[pr])}</option>)}
                </select>
                <ChevronDown size={14} className="ghost-select-chevron" />
              </span>
            )}
        </FieldRow>
        <FieldRow field="due" label={tr('due')} labelId={dueId} writer={writer} lock={lock}>
          <span className="due-value">
            {lock
              ? <LockedValue reason={lock} labelId={dueId}>{task.due ? formatDay(task.due, today) : tr('dueNone')}</LockedValue>
              : (
                <DateInput
                  value={task.due}
                  clearable
                  placeholder={tr('dueNone')}
                  label={tr('due')}
                  locale={lang}
                  onChange={({ value }) => { if (value !== task.due) void writer.save({ due: value }, 'due'); }}
                />
              )}
            {isOverdue(task, today) && <span className="tag" data-tone="danger"><CalendarX2 size={12} />{tr('dueOverdue')}</span>}
          </span>
        </FieldRow>
      </section>

      <section className="drawer-section">
        <FieldRow field="description" label={tr('description')} labelId={descriptionId} writer={writer} lock={lock} reasonOnLabel stacked>
          {lock && !task.description.trim()
            ? <span className="field-empty">{tr('noDescription')}</span>
            : (
              <DescriptionEditor
                key={task.id}
                value={task.description}
                mention={{ target: { entity: 'task', record: task.id }, map: task.mentions }}
                version={task.updatedAt}
                readonly={!!lock}
                labelId={descriptionId}
                label={tr('description')}
                placeholder={tr('descriptionPlaceholder')}
                lang={lang}
                save={(value) => writer.save({ description: value }, 'description')}
                announce={p.announce}
              />
            )}
        </FieldRow>
      </section>

      <section className="drawer-section">
        <PeopleFields task={task} project={project} writer={writer} />
      </section>

      <section className="drawer-section">
        <StatusField task={task} project={project} writer={writer} />
      </section>

      <section className="drawer-section">
        <Checklist task={task} project={project} writer={writer} />
      </section>

      <section className="drawer-section">
        <TaskOrigin task={task} />
      </section>

      <section className="drawer-section">
        <Attachments task={task} project={project} writer={writer} />
      </section>

      <Comments key={task.id} task={task} />

      <TaskActions task={task} project={project} writer={writer} onClose={p.close} />
    </div>
  );
}

/**
 * The title, edited in place in its own font so nothing moves. Enter or leaving the field saves it; Escape puts it
 * back. It is never empty: a blank title goes back to the one stored, and nothing is written.
 */
function TitleField(p: { task: Task; writer: DrawerWriter; editable: boolean; headingId: string; heading: RefObject<HTMLHeadingElement | null> }) {
  const { task, writer } = p;
  const tr = useT();
  // A draft started from one stored title; if the server's title moves while it is being edited, the server's wins.
  const [draft, setDraft] = useState<{ from: string; text: string } | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const box = useRef<HTMLTextAreaElement>(null);
  useLeaveOnUnmount(box);
  const live = draft && draft.from === task.title ? draft : null;
  const value = live ? live.text : task.title;
  const titleRef = useRef(task.title);
  titleRef.current = task.title;

  const commit = useCallback(() => {
    const d = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (!d || d.from !== titleRef.current) return;
    const next = d.text.trim();
    if (!next || next === titleRef.current) return;
    void writer.save({ title: next }, 'title');
  }, [writer]);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  // Heard on the field itself, so Escape here never reaches the drawer's own Escape.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') {
        // With nothing typed, Escape is the drawer's.
        if (!draftRef.current || draftRef.current.text === draftRef.current.from) return;
        e.preventDefault();
        draftRef.current = null;
        setDraft(null);
        el.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!e.shiftKey) el.blur();
      }
    };
    // A native listener, not React's: when the drawer closes, it still hears the blur that saves the draft.
    const onBlur = () => commitRef.current();
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('blur', onBlur);
    };
  }, [p.editable]);

  const blank = !!live && live.text.trim() === '';
  return (
    <>
      <h2 ref={p.heading} id={p.headingId} className="drawer-title" tabIndex={-1}>
        {p.editable
          ? (
            <textarea
              ref={box}
              className="title-input"
              rows={1}
              aria-label={tr('taskTitle')}
              aria-invalid={blank || undefined}
              aria-describedby={blank ? `${p.headingId}-required` : undefined}
              value={value}
              onChange={(e) => setDraft({ from: live?.from ?? task.title, text: e.target.value.replace(/\n/g, ' ') })}
            />
          )
          : <span className="title-text">{task.title}</span>}
      </h2>
      {blank && <p id={`${p.headingId}-required`} className="field-error" role="status">{tr('titleRequired')}</p>}
    </>
  );
}
