import { useState } from 'react';
import { isProjectsError } from '../api/projects-api.js';
import { TasksTab } from '../board/TasksTab.js';
import { useProjects, useT } from '../data/context.js';
import { useProject, useTask } from '../data/hooks.js';
import { ToastRegion } from '../kit/elements.js';
import { LabelSettings } from '../labels/LabelSettings.js';
import { MembersTab } from '../members/MembersTab.js';
import { MyWork } from '../mywork/MyWork.js';
import { CreateProject } from '../projects/CreateProject.js';
import { ProjectList } from '../projects/ProjectList.js';
import { PROJECT_PANEL_ID, ProjectTabs, projectTabId, tabOf } from '../projects/ProjectTabs.js';
import { LockIcon } from '../shared/icons.js';
import { TaskDrawer } from '../task/TaskDrawer.js';
import { Header } from './Header.js';
import { useRoute } from './RouteContext.js';
import { type Route } from './route.js';
import { ErrorState, Loading, NotFound } from './States.js';

type ProjectRoute = Extract<Route, { screen: 'project' }>;

/** A record that is missing and one the viewer may not read are the same answer. */
const isMissing = (e: unknown) => isProjectsError(e, 'not_found') || isProjectsError(e, 'forbidden');

/**
 * The module's frame: the header, the strips under it, and the body, which holds the screen the route names and the
 * drawer of the task it names. The screen is the scroller, so the header and a drawer never scroll away with it, and
 * it stays mounted while a drawer opens and closes beside it, so it keeps its scroll and what is typed in it.
 */
export function App() {
  const route = useRoute();
  const { lang } = useProjects();
  return (
    <ToastRegion locale={lang}>
      <div className="app">
        <Header />
        <div className="body">
          {route.screen === 'project' ? <ProjectPage route={route} /> : (
            <>
              <main className="screen" data-screen={route.screen} tabIndex={-1}>
                {route.screen === 'mywork' ? <MyWork /> : route.screen === 'labels' ? <LabelSettings /> : <ProjectsScreen />}
              </main>
              {route.task && <TaskDrawer taskId={route.task} route={route} />}
            </>
          )}
        </div>
      </div>
    </ToastRegion>
  );
}

/** The project list, and the create project modal its Tạo project opens. */
function ProjectsScreen() {
  const [creating, setCreating] = useState(false);
  return (
    <>
      <ProjectList onCreate={() => setCreating(true)} />
      <CreateProject open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

/** `/t/<task>` names no project: the task says whose it is, and then the page is that project's. */
function ProjectPage({ route }: { route: ProjectRoute }) {
  const task = useTask(route.project ? null : route.task ?? null);
  if (route.project) return <KnownProjectPage route={route} />;
  if (task.data) return <KnownProjectPage route={{ ...route, project: task.data.project }} reachedByTask />;
  return (
    <main className="screen" data-screen="project" tabIndex={-1}>
      {task.isError ? isMissing(task.error) ? <NotFound /> : <ErrorState error={task.error} onRetry={() => void task.refetch()} /> : <Loading kind="columns" />}
    </main>
  );
}

/**
 * A project's page. Reached through one of its tasks, by someone who may read the task but not the project (a
 * collaborator from outside it), the page says so and the drawer still opens, closing to My Work.
 */
function KnownProjectPage({ route, reachedByTask = false }: { route: ProjectRoute; reachedByTask?: boolean }) {
  const project = useProject(route.project);
  // Held once known: the drawer's own read of the project mounts here and asks again, which would otherwise flip the
  // page back to loading and unmount the drawer that asked.
  const [unreachable, setUnreachable] = useState(false);
  if (!unreachable && reachedByTask && project.isError && isMissing(project.error)) setUnreachable(true);
  if (!project.data && unreachable && route.task) {
    return (
      <>
        <main className="screen" data-screen="project" tabIndex={-1}>
          <ProjectUnavailable />
        </main>
        <TaskDrawer taskId={route.task} route={{ screen: 'mywork', task: route.task }} />
      </>
    );
  }
  if (!project.data) {
    return (
      <main className="screen" data-screen="project" tabIndex={-1}>
        {project.isError
          ? isMissing(project.error) ? <NotFound /> : <ErrorState error={project.error} onRetry={() => void project.refetch()} />
          : <Loading kind="columns" />}
      </main>
    );
  }
  return (
    <>
      <main className="screen" data-screen="project" tabIndex={-1}>
        <ProjectTabs route={route} />
        <div className="project-panel" role="tabpanel" id={PROJECT_PANEL_ID} aria-labelledby={projectTabId(tabOf(route))} data-tab={tabOf(route)}>
          {route.tab === 'members' ? <MembersTab project={project.data} /> : <TasksTab route={route} />}
        </div>
      </main>
      {route.task && <TaskDrawer taskId={route.task} route={route} />}
    </>
  );
}

function ProjectUnavailable() {
  const tr = useT();
  return (
    <div className="state empty project-unavailable">
      <span className="state-icon"><LockIcon size={32} /></span>
      <p className="state-title">{tr('projectUnavailable')}</p>
    </div>
  );
}
