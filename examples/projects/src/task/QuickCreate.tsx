import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { isProjectsError, type BoardScope, type BoardTasks, type NewTask, type ProjectsApi, type TaskChanges } from '../api/projects-api.js';
import { PRIORITY_TEXT } from '../board/marks.js';
import { useProjects, useT } from '../data/context.js';
import { refusalText } from '../data/failure.js';
import { usePeople, useProject, useProjectsList, useSections } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { DateInput, Dialog, PersonPicker, Tooltip, useToast, type Person as KitPerson } from '../kit/elements.js';
import { formatBytes } from '../model/format.js';
import { defaultGroup, topOf } from '../model/grouping.js';
import { can } from '../model/roles.js';
import type { GroupBy, Person, Priority, Project, Section, Task } from '../model/types.js';
import { ChevronDown, Paperclip, XIcon } from '../shared/icons.js';
import { useNavigate, useRoute } from '../shell/RouteContext.js';
import { DEFAULT_QUERY, routePath, withTask, type Route } from '../shell/route.js';
import type { TextKey } from '../text.js';

const PRIORITIES: readonly Priority[] = ['urgent', 'high', 'medium', 'low'];
/** A press that has not settled by then shows its spinner; a quicker one never flashes it. */
const SPINNER_MS = 400;

const bySectionOrder = (a: Section, b: Section) => {
  if (a.position === null && b.position === null) return a.name.localeCompare(b.name, 'vi');
  if (a.position === null) return 1;
  if (b.position === null) return -1;
  return a.position - b.position || a.name.localeCompare(b.name, 'vi');
};

/**
 * Tạo task: a modal form over the page it was opened from. It closes only once the task exists, and then opens the
 * new task's drawer. `project` is the project being viewed, chosen to start with.
 */
export function QuickCreate(p: { open: boolean; project?: string; onClose(): void }) {
  const { lang } = useProjects();
  const tr = useT();
  const navigate = useNavigate();
  const route = useRoute();
  // Closed by the form itself once the task exists, whatever the opener does with onClose.
  const [done, setDone] = useState(false);
  const [session, setSession] = useState(0);
  // While the create is in flight the dialog stays: a dismiss then would leave a task made behind a closed form.
  const busy = useRef(false);
  useEffect(() => {
    if (p.open) return;
    busy.current = false;
    setDone(false);
    setSession((n) => n + 1);
  }, [p.open]);
  const open = p.open && !done;
  const dismiss = () => { if (!busy.current) p.onClose(); };

  const finish = (task: Task) => {
    busy.current = false;
    // The dialog is modal: the drawer's heading can take focus only once the dialog has closed and handed focus back.
    flushSync(() => setDone(true));
    p.onClose();
    const path = route.screen === 'project' && route.project === task.project
      ? withTask(route, task.id)
      : routePath({ screen: 'project', project: task.project, view: DEFAULT_QUERY, task: task.id });
    setTimeout(() => navigate(path), 0);
  };

  return (
    <div className="quick-create">
      <Dialog open={open} heading={tr('newTask')} locale={lang} onClose={dismiss}>
        {open && (
          <QuickCreateForm
            key={session}
            initialProject={p.project ?? ''}
            route={route}
            onBusy={(b) => { busy.current = b; }}
            onCancel={dismiss}
            onCreated={finish}
          />
        )}
      </Dialog>
    </div>
  );
}

/** The projects a task can be created in now: the list, with the one being viewed even before the list has loaded. */
function useCreatableProjects(viewed: string): Project[] {
  const { viewer, online } = useProjects();
  const list = useProjectsList(['active', 'paused']);
  const current = useProject(viewed || null);
  return useMemo(() => {
    const all = new Map<string, Project>();
    for (const project of list.data ?? []) all.set(project.id, project);
    if (current.data && !all.has(current.data.id)) all.set(current.data.id, current.data);
    return [...all.values()]
      .filter((project) => can('create_task', { viewer, project, online }).ok)
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [list.data, current.data, viewer, online]);
}

/** What a failed create says: the server's sentence when it gave one. */
function reasonOf(e: unknown, tr: (key: TextKey) => string, fallback: TextKey): string {
  if (isProjectsError(e, 'offline')) return tr('offlineLocked');
  const refusal = refusalText(e, tr);
  if (refusal) return refusal;
  if (!isProjectsError(e)) console.error(e);
  return tr(fallback);
}

/** A follow-up write to a task just created; a stale answer reads the task again and writes once more. */
async function patchCreated(api: ProjectsApi, task: Task, changes: (t: Task) => TaskChanges): Promise<Task> {
  try {
    return await api.updateTask(task, changes(task));
  } catch (e) {
    if (!isProjectsError(e, 'stale')) throw e;
    const fresh = await api.task(task.id);
    return api.updateTask(fresh, changes(fresh));
  }
}

/**
 * Where a new task goes: first in the column it joins on its project's board. The board is read from the cache, and
 * read once when it is not there, as for a project other than the one on screen.
 */
async function newPosition(
  qc: QueryClient, api: ProjectsApi, route: Route, project: Project, draft: Task, ctx: { people: Map<string, Person>; today: string },
): Promise<number | null> {
  const cached = qc.getQueriesData<BoardTasks>({ queryKey: ['board', project.id] }).flatMap(([, data]) => (data ? [data.tasks] : []));
  let tasks: Task[];
  if (cached.length > 0) {
    tasks = [...new Map(cached.flat().map((t) => [t.id, t] as const)).values()];
  } else {
    const scope: BoardScope = { project: project.id, done: DEFAULT_QUERY.done, cancelled: DEFAULT_QUERY.cancelled };
    tasks = (await qc.fetchQuery({ queryKey: keys.board(scope), queryFn: () => api.boardTasks(scope) })).tasks;
  }
  const sections = await qc.fetchQuery({ queryKey: keys.sections(project.id), queryFn: () => api.sections(project.id) });
  const viewed = route.screen === 'project' && route.project === project.id ? route.view.group : null;
  const groupBy: GroupBy = viewed ?? defaultGroup(project, sections);
  return topOf(groupBy, tasks, draft, { sections, people: ctx.people, today: ctx.today, showCancelled: true });
}

function QuickCreateForm(p: {
  initialProject: string; route: Route; onBusy(busy: boolean): void; onCancel(): void; onCreated(task: Task): void;
}) {
  const { api, viewer, online, lang, people, today } = useProjects();
  const peopleLoading = !usePeople().data;
  const tr = useT();
  const qc = useQueryClient();
  const toast = useToast();
  const ids = { title: useId(), project: useId(), section: useId(), due: useId(), priority: useId(), collaborators: useId(), primary: useId(), files: useId(), reason: useId(), cancelReason: useId() };

  const projects = useCreatableProjects(p.initialProject);
  const [projectId, setProjectId] = useState(p.initialProject);
  const project = projects.find((pr) => pr.id === projectId) ?? null;
  const sections = useSections(project?.id ?? null);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('');
  const [due, setDue] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | ''>('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [primary, setPrimary] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);

  // Locked in the same tick as the press, before React has rendered anything: a second press finds it set.
  const inFlight = useRef(false);
  const [busy, setBusyState] = useState(false);
  // Set once a task exists: the form never creates again, even when it stays open to say what went wrong.
  const [spent, setSpent] = useState(false);
  const { onBusy } = p;
  const setBusy = (b: boolean) => {
    onBusy(b);
    setBusyState(b);
  };
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) return setSlow(false);
    const timer = setTimeout(() => setSlow(true), SPINNER_MS);
    return () => clearTimeout(timer);
  }, [busy]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  // The dialog opens after this form mounts and puts focus on its own close button, so the title takes it afterwards.
  const titleRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    let frame = 0;
    const focus = () => titleRef.current?.focus({ preventScroll: true });
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(focus); });
    return () => cancelAnimationFrame(frame);
  }, []);

  const pick = can('pick_primary', { viewer, project, online });
  const choices = useMemo<KitPerson[]>(() => {
    const members = [...new Set([...(project?.managers ?? []), ...(project?.members ?? [])])];
    return members.map((id) => {
      const person = people.get(id) ?? { id, name: id, email: null };
      return { id: person.id, name: person.name, email: person.email };
    });
  }, [project, people]);
  const sectionList = useMemo(() => [...(sections.data ?? [])].sort(bySectionOrder), [sections.data]);

  const chooseProject = (id: string) => {
    setProjectId(id);
    setSection('');
    const next = projects.find((pr) => pr.id === id);
    const allowed = new Set([...(next?.managers ?? []), ...(next?.members ?? [])]);
    setCollaborators((list) => list.filter((person) => allowed.has(person)));
    setPrimary(null);
  };

  const missing: TextKey | null = !online ? 'offlineLocked' : !title.trim() ? 'quickCreateNeedsTitle' : !project ? 'quickCreateNeedsProject' : null;
  const locked = busy || spent || missing !== null;
  const lockReason: TextKey | null = busy ? null : spent ? 'quickCreateDone' : missing;

  const addFiles = (list: FileList | File[] | null | undefined) => {
    const added = [...(list ?? [])];
    if (added.length) setFiles((current) => [...current, ...added]);
  };

  const attach = async (task: Task, unsaved: string[]): Promise<Task> => {
    const settled = await Promise.allSettled(files.map((f) => api.upload(f)));
    const uploaded = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value.id] : []));
    const failedNames = files.filter((_, i) => settled[i]!.status === 'rejected').map((f) => f.name);
    let failure: unknown = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')?.reason;
    let saved = task;
    if (uploaded.length) {
      try {
        saved = await patchCreated(api, task, (t) => ({ attachments: [...t.attachments, ...uploaded] }));
      } catch (e) {
        failure = e;
        failedNames.splice(0, failedNames.length, ...files.map((f) => f.name));
      }
    }
    if (failedNames.length) {
      unsaved.push(tr('quickCreateFilesNotSaved', { files: failedNames.join(', '), reason: reasonOf(failure, tr, 'saveFailed') }));
    }
    return saved;
  };

  const submit = async () => {
    if (inFlight.current || missing !== null || !project) return;
    inFlight.current = true;
    setBusy(true);
    setRefusal(null);
    const fields = {
      project: project.id, title: title.trim(), section: section || null, due, priority: priority || null, collaborators,
      primary: pick.ok ? primary : null,
    };
    const unsaved: string[] = [];
    // The task as it will be stored: an unset priority is stored as the field's default, medium.
    const draft: Task = {
      id: '', version: 0, updatedAt: '', createdAt: new Date().toISOString(), createdBy: viewer.id, title: fields.title,
      project: project.id, section: fields.section, position: null, description: '', status: 'todo', blocked: false,
      label: null, collaborators, priority: fields.priority ?? 'medium', due, checklist: [], showChecklistOnCard: false,
      origin: 'manual', completedAt: null, frozen: false, holder: fields.primary ?? viewer.id, attachments: [], fileNames: {},
    };
    // Placement is best effort: a board that cannot be read leaves the card where the server sorts it, after the rest.
    let position: number | null = null;
    try {
      position = await newPosition(qc, api, p.route, project, draft, { people, today });
    } catch (e) {
      if (!isProjectsError(e)) console.error(e);
    }
    // A partial answer is the follow-up write after the create, which holds the collaborators and the place.
    const followUp: TextKey = collaborators.length
      ? position !== null ? 'quickCreateCollaboratorsAndPlaceNotSaved' : 'quickCreateCollaboratorsNotSaved'
      : 'quickCreatePlaceNotSaved';
    let task: Task;
    try {
      const input: NewTask = { ...fields, position };
      task = await api.createTask(input);
    } catch (e) {
      if (isProjectsError(e, 'partial') && e.task) {
        task = e.task;
        unsaved.push(tr(followUp, { reason: reasonOf(e, tr, 'saveFailed') }));
      } else if (isProjectsError(e, 'partial')) {
        // A task exists that the answer does not name: the form stays locked and says so, and can only be closed.
        if (mounted.current) {
          setSpent(true);
          setBusy(false);
          setRefusal(tr(followUp, { reason: reasonOf(e, tr, 'saveFailed') }));
        }
        return;
      } else {
        inFlight.current = false;
        if (mounted.current) {
          setBusy(false);
          setRefusal(reasonOf(e, tr, 'quickCreateFailed'));
        }
        return;
      }
    }
    // The task exists from here on, so the form never unlocks again: another press would create a second one.
    if (files.length) task = await attach(task, unsaved);
    qc.setQueryData(keys.task(task.id), task);
    void qc.invalidateQueries({ queryKey: ['board', task.project] });
    void qc.invalidateQueries({ queryKey: keys.project(task.project) });
    void qc.invalidateQueries({ queryKey: keys.sections(task.project) });
    void qc.invalidateQueries({ queryKey: ['projects'] });
    void qc.invalidateQueries({ queryKey: keys.mywork });
    for (const text of unsaved) toast({ kind: 'error', text });
    if (mounted.current) p.onCreated(task);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    addFiles(e.dataTransfer?.files);
  };

  const submitButton = (
    <button
      type="submit"
      className="af-button primary qc-submit"
      aria-disabled={locked ? 'true' : undefined}
      aria-busy={busy ? 'true' : undefined}
      aria-describedby={lockReason ? ids.reason : undefined}
      data-slow={slow ? 'true' : undefined}
    >
      <span className="qc-submit-label">{tr('create')}</span>
      <span className="qc-submit-label" data-part="creating" aria-hidden={slow ? undefined : 'true'}>
        <span className="qc-spinner" aria-hidden="true" />
        {tr('creating')}
      </span>
    </button>
  );

  return (
    <form className="qc-form" onSubmit={onSubmit} noValidate aria-busy={busy ? 'true' : undefined}>
      {refusal && <div className="af-banner danger qc-refusal" role="alert">{refusal}</div>}
      <div className="qc-field" data-field="title">
        <label className="qc-label" htmlFor={ids.title}>{tr('title')}</label>
        <input
          id={ids.title}
          className="qc-input qc-title"
          placeholder={tr('taskTitle')}
          ref={titleRef}
          value={title}
          autoComplete="off"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="qc-grid">
        <div className="qc-field" data-field="project">
          <label className="qc-label" htmlFor={ids.project}>{tr('project')}</label>
          <span className="qc-select">
            <select id={ids.project} className="qc-select-control" value={project ? project.id : ''} onChange={(e) => chooseProject(e.target.value)}>
              <option value="" disabled>{tr('quickCreateChooseProject')}</option>
              {projects.map((pr) => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
            </select>
            <ChevronDown size={14} className="qc-select-chevron" />
          </span>
        </div>
        <div className="qc-field" data-field="section">
          <label className="qc-label" htmlFor={ids.section}>{tr('section')}</label>
          <span className="qc-select">
            <select id={ids.section} className="qc-select-control" value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="">{tr('noSection')}</option>
              {sectionList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown size={14} className="qc-select-chevron" />
          </span>
        </div>
        <div className="qc-field" data-field="due" role="group" aria-labelledby={ids.due}>
          <span className="qc-label" id={ids.due}>{tr('due')}</span>
          <DateInput value={due} clearable placeholder={tr('quickCreateChooseDate')} label={tr('due')} locale={lang} onChange={({ value }) => setDue(value)} />
        </div>
        <div className="qc-field" data-field="priority">
          <label className="qc-label" htmlFor={ids.priority}>{tr('priority')}</label>
          <span className="qc-select">
            <select id={ids.priority} className="qc-select-control" value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')}>
              <option value="">{tr('priorityNone')}</option>
              {PRIORITIES.map((pr) => <option key={pr} value={pr}>{tr(PRIORITY_TEXT[pr])}</option>)}
            </select>
            <ChevronDown size={14} className="qc-select-chevron" />
          </span>
        </div>
      </div>
      <div className="qc-field" data-field="collaborators" role="group" aria-labelledby={ids.collaborators}>
        <span className="qc-label" id={ids.collaborators}>{tr('collaborators')}</span>
        <PersonPicker
          people={choices}
          value={collaborators}
          multiple
          placeholder={tr('addPeople')}
          label={tr('collaborators')}
          loading={peopleLoading}
          locale={lang}
          onChange={({ value }) => setCollaborators(Array.isArray(value) ? value : value ? [value] : [])}
        />
      </div>
      {(pick.ok || !pick.hidden) && (
        <div className="qc-field" data-field="primary" role="group" aria-labelledby={ids.primary}>
          <span className="qc-label" id={ids.primary}>{tr('primary')}</span>
          <PersonPicker
            people={choices}
            value={primary}
            placeholder={tr('noPrimary')}
            disabled={!pick.ok}
            label={tr('primary')}
            loading={peopleLoading}
            locale={lang}
            onChange={({ value }) => setPrimary(typeof value === 'string' ? value : null)}
          />
        </div>
      )}
      <div className="qc-field" data-field="files">
        <label
          className="qc-dropzone"
          data-part="dropzone"
          data-over={over ? 'true' : undefined}
          onDragEnter={(e) => { e.preventDefault(); setOver(true); }}
          onDragOver={(e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false); }}
          onDrop={onDrop}
        >
          <input
            id={ids.files}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <Paperclip size={16} />
          <span>{tr('dropFiles')}</span>
        </label>
        {files.length > 0 && (
          <ul className="qc-files">
            {files.map((file, i) => (
              <li key={`${i}:${file.name}`} className="qc-file">
                <Paperclip size={14} />
                <Tooltip text={file.name} locale={lang} className="qc-file-name-wrap"><span className="qc-file-name">{file.name}</span></Tooltip>
                <span className="qc-file-size">{formatBytes(file.size, lang)}</span>
                <button
                  type="button"
                  className="af-button ghost qc-file-remove"
                  aria-label={tr('quickCreateRemoveFile', { name: file.name })}
                  onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                >
                  <XIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="qc-actions">
        <Tooltip text={busy ? tr('quickCreateWait') : ''} locale={lang}>
          <button
            type="button"
            className="af-button secondary"
            aria-disabled={busy ? 'true' : undefined}
            aria-describedby={busy ? ids.cancelReason : undefined}
            onClick={() => { if (!busy) p.onCancel(); }}
          >
            {tr('cancel')}
          </button>
        </Tooltip>
        {busy && <span id={ids.cancelReason} className="sr-only">{tr('quickCreateWait')}</span>}
        {/* Always inside the tooltip, which shows nothing without text, so the button is one element from press to answer. */}
        <Tooltip text={lockReason ? tr(lockReason) : ''} locale={lang}>{submitButton}</Tooltip>
        {lockReason && <span id={ids.reason} className="sr-only">{tr(lockReason)}</span>}
      </div>
    </form>
  );
}
