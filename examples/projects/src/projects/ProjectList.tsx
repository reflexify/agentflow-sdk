import { useId, useState, type ReactNode } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useProjectsList } from '../data/hooks.js';
import { Tooltip } from '../kit/elements.js';
import { formatCount, hueOf, initials } from '../model/format.js';
import { canCreateProject, canManageLabels, type Verdict } from '../model/roles.js';
import type { Person, Project, ProjectStatus, Status } from '../model/types.js';
import { FilterChip } from '../shared/FilterChip.js';
import { FolderKanban, LockIcon, PlusIcon, StatusGlyph, TagIcon } from '../shared/icons.js';
import { useNavigate } from '../shell/RouteContext.js';
import { Empty, ErrorState, Loading } from '../shell/States.js';
import type { TextKey } from '../text.js';

const FILTERS: { status: ProjectStatus; label: TextKey }[] = [
  { status: 'active', label: 'projectActive' },
  { status: 'paused', label: 'projectPaused' },
  { status: 'closed', label: 'projectClosed' },
];
const ALL_STATUSES: ProjectStatus[] = ['active', 'paused', 'closed'];
const DEFAULT_STATUSES: ProjectStatus[] = ['active', 'paused'];
const STATUS_LABEL: Record<ProjectStatus, TextKey> = { active: 'projectActive', paused: 'projectPaused', closed: 'projectClosed' };
/** How many managers a card shows before it says how many more there are. */
const STACKED = 3;

/** The projects the viewer can read, as cards with what is left to do, filtered by status. */
export function ProjectList({ onCreate }: { onCreate(): void }) {
  const [statuses, setStatuses] = useState<ProjectStatus[]>(DEFAULT_STATUSES);
  const list = useProjectsList(statuses);
  // An empty answer to a narrowed filter does not say the viewer is in no project: ask for all three to find out.
  const narrowed = statuses.length < ALL_STATUSES.length;
  const everything = useProjectsList(ALL_STATUSES, narrowed && list.data?.length === 0);
  const { viewer, online, lang } = useProjects();
  const tr = useT();

  // At least one status stays chosen: an empty filter would ask for nothing.
  const toggle = (status: ProjectStatus) =>
    setStatuses((now) => (now.includes(status) ? (now.length > 1 ? now.filter((s) => s !== status) : now) : [...now, status]));

  const navigate = useNavigate();
  const create = viewer.projectCreator ? canCreateProject(viewer, online) : null;
  const labels = canManageLabels(viewer, online);
  const keepId = useId();
  const createId = useId();
  const labelsId = useId();
  const emptyCreateId = useId();
  return (
    <section className="projects-screen">
      <div className="project-toolbar">
        <div className="filter-chips project-filter" role="group" aria-label={tr('projectStatusFilter')}>
          {FILTERS.map(({ status, label }) => {
            const last = statuses.length === 1 && statuses[0] === status;
            const chip = (
              <FilterChip key={status} pressed={statuses.includes(status)} describedBy={last ? keepId : undefined} onToggle={() => toggle(status)}>
                {tr(label)}
              </FilterChip>
            );
            return last ? <Tooltip key={status} text={tr('keepOneStatus')} locale={lang}>{chip}</Tooltip> : chip;
          })}
          <span id={keepId} className="sr-only">{tr('keepOneStatus')}</span>
        </div>
        <div className="project-actions">
          {viewer.projectAdmin && (
            <ActionButton
              className="af-button secondary labels-link"
              verdict={labels}
              reasonId={labelsId}
              locale={lang}
              onPress={() => navigate('/settings/labels')}
            >
              <TagIcon />
              {tr('labelSettings')}
            </ActionButton>
          )}
          {create && (
            <ActionButton className="af-button primary create-project" verdict={create} reasonId={createId} locale={lang} onPress={onCreate}>
              <PlusIcon />
              {tr('createProject')}
            </ActionButton>
          )}
        </div>
      </div>
      {list.isError && !list.data ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : !list.data ? (
        <Loading kind="cards" />
      ) : list.data.length === 0 ? (
        narrowed && !everything.data ? (
          everything.isError ? <ErrorState error={everything.error} onRetry={() => void everything.refetch()} /> : <Loading kind="cards" />
        ) : (
          narrowed && everything.data!.length > 0 ? (
            <Empty icon={<FolderKanban size={32} />} text={tr('noProjectsMatch')} />
          ) : (
            <Empty
              icon={<FolderKanban size={32} />}
              text={tr('noProjects')}
              action={create && (
                <ActionButton className="af-button primary" verdict={create} reasonId={emptyCreateId} locale={lang} onPress={onCreate}>
                  <PlusIcon />
                  {tr('createProject')}
                </ActionButton>
              )}
            />
          )
        )
      ) : (
        <ul className="project-grid">
          {list.data.map((p) => <li key={p.id}><ProjectCard project={p} /></li>)}
        </ul>
      )}
    </section>
  );
}

/**
 * A button that a refusal locks rather than hides: it stays, says why in a tooltip, and does nothing when pressed. It is
 * always inside the tooltip, which shows nothing without text, so going offline and back never moves it, nor the focus.
 */
function ActionButton(p: { className: string; verdict: Verdict; reasonId: string; locale: string; onPress(): void; children: ReactNode }) {
  const tr = useT();
  const reason = p.verdict.ok ? null : tr(p.verdict.reason);
  return (
    <>
      <Tooltip text={reason ?? ''} locale={p.locale}>
        <button
          type="button"
          className={p.className}
          aria-disabled={reason ? 'true' : undefined}
          aria-describedby={reason ? p.reasonId : undefined}
          onClick={() => { if (!reason) p.onPress(); }}
        >
          {p.children}
        </button>
      </Tooltip>
      {reason && <span id={p.reasonId} className="sr-only">{reason}</span>}
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { people, lang } = useProjects();
  const navigate = useNavigate();
  const tr = useT();
  const managers = project.managers.map((id) => people.get(id)).filter((p): p is Person => !!p);
  const { todo, doing, done } = project.counts;
  const total = todo + doing + done;
  const shownManagers = managers.slice(0, STACKED);
  const more = managers.length - shownManagers.length;
  return (
    <article className="project-card" data-project={project.id} data-status={project.status}>
      <div className="project-card-head">
        {/* The tooltip holds the name only while two lines cut it short; the button still covers the whole card. */}
        <Tooltip text={project.name} locale={lang} className="project-name-tip" whenCutShort>
          <button type="button" className="project-name" onClick={() => navigate(`/p/${encodeURIComponent(project.id)}`)}>
            {project.name}
          </button>
        </Tooltip>
        <span className="pill project-status" data-status={project.status}>
          {project.status === 'closed' && <LockIcon size={12} />}
          {tr(STATUS_LABEL[project.status])}
        </span>
      </div>
      <div className="project-body">
        {managers.length > 0 && (
          <div className="avatar-stack" role="img" aria-label={tr('managersLabel', { names: managers.map((m) => m.name).join(', ') })}>
            {shownManagers.map((m) => (
              <span key={m.id} className="af-avatar" data-hue={hueOf(m.id)} title={m.name}>{initials(m.name)}</span>
            ))}
            {more > 0 && <span className="af-avatar avatar-more">+{formatCount(more, lang)}</span>}
          </div>
        )}
        {total > 0 ? (
          <div className="project-progress">
            <span className="progress-bar" aria-hidden="true"><span style={{ transform: `scaleX(${done / total})` }} /></span>
            <span className="progress-ratio">{`${formatCount(done, lang)}/${formatCount(total, lang)}`}</span>
          </div>
        ) : (
          <p className="project-empty">{tr('noTasks')}</p>
        )}
        <dl className="project-counts">
          <Count label={tr('statusTodo')} value={formatCount(todo, lang)} kind="todo" />
          <Count label={tr('statusDoing')} value={formatCount(doing, lang)} kind="doing" />
          <Count label={tr('statusDone')} value={formatCount(done, lang)} kind="done" />
        </dl>
      </div>
    </article>
  );
}

function Count({ label, value, kind }: { label: string; value: string; kind: Status }) {
  return (
    <div className="project-count" data-kind={kind}>
      <dt><span className="count-mark" data-status={kind}><StatusGlyph status={kind} size={12} /></span>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
