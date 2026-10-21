import { useState } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useProject, useTask } from '../data/hooks.js';
import { Tooltip } from '../kit/elements.js';
import { can } from '../model/roles.js';
import type { Project } from '../model/types.js';
import { ClosedBanner } from '../projects/ClosedBanner.js';
import { ProjectMenu } from '../projects/ProjectMenu.js';
import { ChevronRight, LockIcon, PlusIcon, WifiOff } from '../shared/icons.js';
import { QuickCreate } from '../task/QuickCreate.js';
import { useNavigate, useRoute } from './RouteContext.js';

/**
 * The breadcrumb, the project's status and Tạo task; under it the strips: offline, then the page's project closed. The
 * strips sit outside the header, so its height never changes with them. A drawer shows its own closed strip.
 */
export function Header() {
  const route = useRoute();
  const navigate = useNavigate();
  const { viewer, online, lang } = useProjects();
  const tr = useT();
  // `/t/<task>` names its project only through the task.
  const onProject = route.screen === 'project';
  const known = onProject && route.project ? route.project : null;
  const task = useTask(onProject && !known && route.task ? route.task : null);
  const project = useProject(onProject ? known ?? task.data?.project ?? null : null);
  const shown: Project | null = project.data ?? null;

  return (
    <>
      <header className="header">
        <div className="header-row">
          <nav className="breadcrumb">
            <ol>
              {route.screen === 'mywork' && <li><span className="crumb-current" aria-current="page">{tr('myWork')}</span></li>}
              {route.screen === 'projects' && <li><span className="crumb-current" aria-current="page">{tr('breadcrumbProjects')}</span></li>}
              {(route.screen === 'project' || route.screen === 'labels') && (
                <li className="crumb-parent">
                  <Tooltip text={tr('breadcrumbProjects')} locale={lang} whenCutShort>
                    <button type="button" className="crumb" onClick={() => navigate('/projects')}>
                      <ChevronRight size={16} className="crumb-back" />
                      <span className="crumb-text">{tr('breadcrumbProjects')}</span>
                    </button>
                  </Tooltip>
                </li>
              )}
              {route.screen === 'labels' && (
                <li className="crumb-leaf">
                  <span className="crumb-sep" aria-hidden="true"><ChevronRight size={14} /><span className="sr-only"> › </span></span>
                  <span className="crumb-current" aria-current="page">{tr('labelSettings')}</span>
                </li>
              )}
              {shown && (
                <li className="crumb-leaf">
                  {/* Drawn as a chevron; the text is what the trail reads as when copied. */}
                  <span className="crumb-sep" aria-hidden="true"><ChevronRight size={14} /><span className="sr-only"> › </span></span>
                  <Tooltip text={shown.name} locale={lang} className="crumb-tip" whenCutShort>
                    <span className="crumb-current" aria-current="page">{shown.name}</span>
                  </Tooltip>
                </li>
              )}
            </ol>
          </nav>
          {shown && shown.status !== 'active' && (
            <span className="pill project-status" data-status={shown.status}>
              {shown.status === 'closed' && <LockIcon size={12} />}
              {tr(shown.status === 'paused' ? 'projectPaused' : 'projectClosed')}
            </span>
          )}
          {shown && <ProjectMenu key={shown.id} project={shown} />}
          {shown && <CreateTask project={shown} viewer={viewer} online={online} lang={lang} />}
        </div>
      </header>
      <div className="banners">
        {!online && (
          <div className="strip offline-banner" data-tone="neutral" role="status">
            <WifiOff size={14} />
            <span>{tr('offlineBanner')}</span>
          </div>
        )}
        {shown && <ClosedBanner project={shown} />}
      </div>
    </>
  );
}

function CreateTask(p: { project: Project; viewer: ReturnType<typeof useProjects>['viewer']; online: boolean; lang: string }) {
  const tr = useT();
  const [creating, setCreating] = useState(false);
  const verdict = can('create_task', { viewer: p.viewer, project: p.project, online: p.online });
  if (!verdict.ok && verdict.hidden) return null;
  const button = (
    <button
      type="button"
      className="af-button primary create-task"
      aria-disabled={verdict.ok ? undefined : 'true'}
      aria-describedby={verdict.ok ? undefined : 'header-create-reason'}
      onClick={() => { if (verdict.ok) setCreating(true); }}
    >
      <PlusIcon />
      {tr('createTask')}
    </button>
  );
  return (
    <>
      {verdict.ok ? button : (
        <>
          <Tooltip text={tr(verdict.reason)} locale={p.lang}>{button}</Tooltip>
          <span id="header-create-reason" className="sr-only">{tr(verdict.reason)}</span>
        </>
      )}
      <QuickCreate open={creating} project={p.project.id} onClose={() => setCreating(false)} />
    </>
  );
}
