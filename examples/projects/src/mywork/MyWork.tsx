import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { type MyWork as MyWorkData } from '../api/projects-api.js';
import { TaskCard } from '../board/TaskCard.js';
import { useProjects, useProjectsBase, useT } from '../data/context.js';
import { freshestTask, useMyWork, useProjectsList, useTaskMutation } from '../data/hooks.js';
import { useClaim } from '../data/useClaim.js';
import { DateInput, useToast } from '../kit/elements.js';
import { dueBucket, todayIn, viewerTimeZone, type DueBucket } from '../model/dates.js';
import { formatCount } from '../model/format.js';
import { statusChanges } from '../model/status.js';
import type { Task, WorkflowTask } from '../model/types.js';
import { useNavigate, useRoute } from '../shell/RouteContext.js';
import { withTask } from '../shell/route.js';
import { Empty, ErrorState, Loading } from '../shell/States.js';
import { FilterChip } from '../shared/FilterChip.js';
import { CheckCircle2, ChevronDown, SearchX } from '../shared/icons.js';
import type { TextKey } from '../text.js';
import { WorkRow } from './WorkRow.js';

type Role = 'primary' | 'collaborator' | 'workflow';
type Sort = 'due' | 'created';

type Item =
  | { kind: 'task'; task: Task; role: Role | null }
  | { kind: 'work'; work: WorkflowTask };

const ROLES: { role: Role; label: TextKey }[] = [
  { role: 'primary', label: 'rolePrimary' },
  { role: 'collaborator', label: 'roleCollaborator' },
  { role: 'workflow', label: 'roleWorkflow' },
];
const ROLE_TEXT: Record<Role, TextKey> = { primary: 'rolePrimary', collaborator: 'roleCollaborator', workflow: 'roleWorkflow' };

const BUCKETS: { bucket: DueBucket; label: TextKey }[] = [
  { bucket: 'overdue', label: 'dueOverdue' },
  { bucket: 'today', label: 'dueToday' },
  { bucket: 'this_week', label: 'dueThisWeek' },
  { bucket: 'later', label: 'dueLater' },
  { bucket: 'none', label: 'dueNone' },
];

const dueOf = (i: Item) => (i.kind === 'task' ? i.task.due : i.work.due);
const createdOf = (i: Item) => (i.kind === 'task' ? i.task.createdAt : '');
const roleOf = (i: Item): Role | null => (i.kind === 'task' ? i.role : 'workflow');

function compareItems(sort: Sort): (a: Item, b: Item) => number {
  if (sort === 'created') {
    // Newest first; a workflow task has no creation date and follows the tasks.
    return (a, b) => createdOf(b).localeCompare(createdOf(a));
  }
  return (a, b) => (dueOf(a) ?? '9999').localeCompare(dueOf(b) ?? '9999') || createdOf(a).localeCompare(createdOf(b));
}

function itemsOf(data: MyWorkData): { due: Item[]; claimable: Item[] } {
  const due: Item[] = [
    ...data.primary.map((task): Item => ({ kind: 'task', task, role: 'primary' })),
    ...data.collaborating.map((task): Item => ({ kind: 'task', task, role: 'collaborator' })),
    ...data.workflow.filter((w) => !w.claimable).map((work): Item => ({ kind: 'work', work })),
  ];
  const claimable: Item[] = [
    ...data.claimableTasks.map((task): Item => ({ kind: 'task', task, role: null })),
    ...data.workflow.filter((w) => w.claimable).map((work): Item => ({ kind: 'work', work })),
  ];
  return { due, claimable };
}

/** The viewer's day for an instant. */
const dayOf = (instant: string) => todayIn(viewerTimeZone(), new Date(instant));

export function MyWork() {
  const { today, people, labels } = useProjects();
  const { lang } = useProjectsBase();
  const tr = useT();
  const navigate = useNavigate();
  const route = useRoute();
  const toast = useToast();
  const { claim, isPending } = useClaim();
  const work = useMyWork();
  const projects = useProjectsList(['active', 'paused', 'closed']);
  const { update } = useTaskMutation();
  const qc = useQueryClient();
  const [roles, setRoles] = useState<ReadonlySet<Role>>(new Set());
  const [project, setProject] = useState('');
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('due');
  const [ticking, setTicking] = useState<ReadonlySet<string>>(new Set());
  // State lags a render behind a press; this is what stops a second press in the same tick.
  const inFlight = useRef(new Set<string>());

  const lock = useCallback((id: string, on: boolean) => {
    if (on) inFlight.current.add(id);
    else inFlight.current.delete(id);
    setTicking(new Set(inFlight.current));
  }, []);

  const tick = useCallback(async (task: Task) => {
    if (inFlight.current.has(task.id)) return;
    lock(task.id, true);
    try {
      const from = freshestTask(qc, task);
      const saved = await update(from, statusChanges(from, 'done', labels));
      if (saved) toast({ kind: 'success', text: tr('taskCompleted') });
    } finally {
      lock(task.id, false);
    }
  }, [update, labels, toast, tr, lock, qc]);

  const { due, claimable } = useMemo(() => (work.data ? itemsOf(work.data) : { due: [], claimable: [] }), [work.data]);
  const projectById = useMemo(() => new Map((projects.data ?? []).map((p) => [p.id, p] as const)), [projects.data]);

  const visible = useCallback((items: Item[]): Item[] => {
    const narrowed = items.filter((i) => {
      const role = roleOf(i);
      if (roles.size > 0 && (!role || !roles.has(role))) return false;
      // A filter on something a row does not have leaves that row out.
      if (project && (i.kind !== 'task' || i.task.project !== project)) return false;
      if (from || to) {
        if (i.kind !== 'task') return false;
        const created = dayOf(i.task.createdAt);
        if ((from && created < from) || (to && created > to)) return false;
      }
      return true;
    });
    return narrowed.sort(compareItems(sort));
  }, [roles, project, from, to, sort]);

  if (work.isError && !work.data) return <ErrorState error={work.error} onRetry={() => void work.refetch()} />;
  if (projects.isError && !projects.data) return <ErrorState error={projects.error} onRetry={() => void projects.refetch()} />;
  if (!work.data || !projects.data) return <Loading kind="rows" />;

  const data = work.data;
  const inProgress = data.primary.filter((t) => t.status === 'todo' || t.status === 'doing').length;
  const waiting = data.workflow.filter((w) => !w.claimable).length;
  const projectOptions = [...new Map([...data.primary, ...data.collaborating, ...data.claimableTasks].map((t) => [t.project, projectById.get(t.project)] as const))]
    .flatMap(([id, p]) => (p ? [{ id, name: p.name }] : []));

  const shown = visible(due);
  const shownClaimable = visible(claimable);
  const toggle = (role: Role) => setRoles((now) => {
    const next = new Set(now);
    if (!next.delete(role)) next.add(role);
    return next;
  });

  const row = (i: Item, offered = false) => {
    if (i.kind === 'work') return <li key={i.work.id}><WorkRow work={i.work} /></li>;
    const { task } = i;
    return (
      <li key={task.id}>
        <TaskCard
          task={task}
          project={projectById.get(task.project)}
          people={people}
          labels={labels}
          today={today}
          roleChip={i.role ? tr(ROLE_TEXT[i.role]) : undefined}
          claimOffered={offered}
          busy={ticking.has(task.id) || isPending(task.id)}
          ticking={ticking.has(task.id)}
          selected={'task' in route && route.task === task.id}
          onOpen={() => navigate(withTask({ screen: 'mywork' }, task.id))}
          onTick={() => void tick(task)}
          onClaim={() => void claim(task)}
        />
      </li>
    );
  };

  const group = (label: string, items: Item[], offered = false, hint?: string) =>
    items.length === 0 ? null : (
      <section key={label} className="work-group" data-group={offered ? 'claimable' : undefined} aria-label={label}>
        <div className="work-group-head">
          <h2>{label} <span className="group-count">{formatCount(items.length, lang)}</span></h2>
          {hint && <p className="work-group-hint">{hint}</p>}
        </div>
        <ul className="work-list">{items.map((i) => row(i, offered))}</ul>
      </section>
    );

  const anyFilter = roles.size > 0 || !!project || !!from || !!to;
  const filtering = anyFilter && due.length + claimable.length > 0;
  const empty = shown.length === 0 && shownClaimable.length === 0;
  const clearFilters = () => {
    setRoles(new Set());
    setProject('');
    setFrom(null);
    setTo(null);
  };
  const clearButton = (
    <button type="button" className="af-button ghost clear-filters" onClick={clearFilters}>{tr('clearFilters')}</button>
  );
  return (
    <div className="mywork">
      <div className="mywork-stats">
        <Stat n={inProgress} label="myWorkProjectCount" part="project-count" />
        <span className="stat-divider" aria-hidden="true" />
        <Stat n={waiting} label="myWorkWorkflowCount" part="workflow-count" />
      </div>
      <div className="mywork-filters">
        <div className="filter-chips role-filters" role="group" aria-label={tr('roleGroup')}>
          {ROLES.map(({ role, label }) => (
            <FilterChip key={role} pressed={roles.has(role)} onToggle={() => toggle(role)}>{tr(label)}</FilterChip>
          ))}
        </div>
        <label className="select" data-empty={project === '' ? 'true' : undefined}>
          <select className="select-control" aria-label={tr('filterProject')} value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="">{tr('filterProject')}</option>
            {projectOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <ChevronDown size={16} className="select-chevron" />
        </label>
        {/* The dates and the sort wrap as one, so the sort never ends up alone on a line. */}
        <div className="filter-tail">
          <div className="date-range" role="group" aria-label={`${tr('createdFrom')} – ${tr('createdTo')}`}>
            <DateInput value={from} max={to} clearable placeholder={tr('createdFrom')} locale={lang} onChange={(d) => setFrom(d.value)} />
            <span className="date-range-sep" aria-hidden="true">–</span>
            <DateInput value={to} min={from} clearable placeholder={tr('createdTo')} locale={lang} onChange={(d) => setTo(d.value)} />
          </div>
          <label className="select">
            <span className="select-label">{tr('sortBy')}:</span>
            <select className="select-control" aria-label={tr('sortBy')} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="due">{tr('sortDue')}</option>
              <option value="created">{tr('sortCreated')}</option>
            </select>
            <ChevronDown size={16} className="select-chevron" />
          </label>
        </div>
        {/* With nothing left to show, the empty state offers the one Xoá bộ lọc. */}
        {anyFilter && !(empty && filtering) && clearButton}
      </div>
      {empty && (
        filtering
          ? <Empty icon={<SearchX size={32} />} text={tr('emptyWorkFiltered')} action={clearButton} />
          : <Empty icon={<CheckCircle2 size={32} />} text={tr('emptyWork')} />
      )}
      {BUCKETS.map(({ bucket, label }) =>
        group(tr(label), shown.filter((i) => dueBucket({ due: dueOf(i), status: 'todo' }, today) === bucket)))}
      {group(tr('claimable'), shownClaimable, true, tr('claimableHint'))}
    </div>
  );
}

/** A count in large figures and its words after it; a screen reader hears the one sentence. */
function Stat({ n, label, part }: { n: number; label: TextKey; part: string }) {
  const { lang } = useProjectsBase();
  const tr = useT();
  const [before = '', after = ''] = tr(label, { n: '\u0000' }).split('\u0000');
  return (
    <p className="stat">
      <span className="stat-shown" aria-hidden="true">
        {before && <span className="stat-words">{before}</span>}
        <span className="stat-n">{formatCount(n, lang)}</span>
        {after && <span className="stat-words">{after.trim()}</span>}
      </span>
      <span className="sr-only" data-part={part}>{tr(label, { n })}</span>
    </p>
  );
}
