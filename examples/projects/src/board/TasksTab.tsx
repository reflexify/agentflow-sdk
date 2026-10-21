import { useState } from 'react';
import { useProjects, useT } from '../data/context.js';
import { Tooltip } from '../kit/elements.js';
import { can } from '../model/roles.js';
import type { Project } from '../model/types.js';
import { ClipboardList, InfoIcon, PlusIcon } from '../shared/icons.js';
import type { Query, Route } from '../shell/route.js';
import { Empty, ErrorState, Loading } from '../shell/States.js';
import { QuickCreate } from '../task/QuickCreate.js';
import { Board } from './Board.js';
import { TaskList } from './TaskList.js';
import { Toolbar, VIEW_PANEL_ID, viewTabId } from './Toolbar.js';
import { useBoardData, type BoardData } from './useBoardData.js';

type ProjectRoute = Extract<Route, { screen: 'project' }>;

/**
 * A board with sections still shows its columns with nothing in them, so a manager sees where tasks will go, and a
 * manager's board by section shows the column they add the first section from.
 */
function isEmpty(data: BoardData, view: 'board' | 'list', viewerId: string): boolean {
  if (view === 'board' && data.sections.length > 0) return false;
  if (view === 'board' && data.groupBy === 'section' && data.project?.managers.includes(viewerId)) return false;
  return data.columns.every((c) => c.tasks.length === 0 && c.done.length === 0);
}

/**
 * The project has tasks that the address's choices leave out. Its rollups count open and done tasks, so a project whose
 * only tasks are cancelled reads as having none.
 */
function hidesTasks(project: Project, query: Query): boolean {
  const { todo, doing, done } = project.counts;
  return (query.done !== 'all' || !query.cancelled) && todo + doing + done > 0;
}

/** The project's Tasks tab: the toolbar, then its tasks as the board or the list. */
export function TasksTab({ route }: { route: ProjectRoute }) {
  const tr = useT();
  const { viewer } = useProjects();
  const data = useBoardData(route.project, route.view);
  const { view } = route.view;
  // Held here, not in the empty state: the create's own change refills the board and unmounts the empty state while
  // the dialog is still working.
  const [creating, setCreating] = useState(false);

  let body;
  if (data.state === 'error') body = <ErrorState error={data.error} onRetry={data.retry} />;
  else if (data.state === 'loading') body = <Loading kind={view === 'board' ? 'columns' : 'rows'} />;
  else if (isEmpty(data, view, viewer.id)) body = <NoTasks project={data.project!} filtered={hidesTasks(data.project!, route.view)} onCreate={() => setCreating(true)} />;
  else if (view === 'list') body = <TaskList data={data} route={route} />;
  else body = <Board data={data} />;

  return (
    <div className="tasks-tab" data-view={view}>
      <Toolbar route={route} groupBy={data.groupBy} />
      {data.truncated && (
        <div className="info-strip" role="status">
          <InfoIcon size={14} />
          {tr('truncatedNotice')}
        </div>
      )}
      <div className="tasks-view" role="tabpanel" id={VIEW_PANEL_ID} aria-labelledby={viewTabId(view)}>
        {body}
      </div>
      <QuickCreate open={creating} project={route.project} onClose={() => setCreating(false)} />
    </div>
  );
}

function NoTasks({ project, filtered, onCreate }: { project: Project; filtered: boolean; onCreate(): void }) {
  const tr = useT();
  const text = tr(filtered ? 'noTasksMatch' : 'noTasks');
  const { viewer, online, lang } = useProjects();
  const verdict = can('create_task', { viewer, project, online });
  if (!verdict.ok && verdict.hidden) return <Empty icon={<ClipboardList size={32} />} text={text} />;
  const button = (
    <button
      type="button"
      className="af-button primary"
      aria-disabled={verdict.ok ? undefined : 'true'}
      aria-describedby={verdict.ok ? undefined : 'no-tasks-create-reason'}
      onClick={() => { if (verdict.ok) onCreate(); }}
    >
      <PlusIcon />
      {tr('createTask')}
    </button>
  );
  const action = verdict.ok ? button : (
    <>
      <Tooltip text={tr(verdict.reason)} locale={lang}>{button}</Tooltip>
      <span id="no-tasks-create-reason" className="sr-only">{tr(verdict.reason)}</span>
    </>
  );
  return <Empty icon={<ClipboardList size={32} />} text={text} action={action} />;
}
