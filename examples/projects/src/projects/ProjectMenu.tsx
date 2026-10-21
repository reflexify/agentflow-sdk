import { useEffect, useRef, useState } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useProjectMutation } from '../data/hooks.js';
import { Confirm, Menu, type MenuItem } from '../kit/elements.js';
import { can, rolesOf, type Verdict } from '../model/roles.js';
import type { Project, ProjectStatus } from '../model/types.js';
import { MoreHorizontal } from '../shared/icons.js';
import { useRoute } from '../shell/RouteContext.js';
import { ProjectEdit } from './ProjectEdit.js';

/**
 * The project's actions, in the header: edit it, pause or resume it, close it (confirmed) and reopen it. It is for those
 * who may change the project's state, its managers and the project admins; anyone else sees no menu.
 */
export function ProjectMenu({ project }: { project: Project }) {
  const { viewer, online, lang } = useProjects();
  const tr = useT();
  const route = useRoute();
  const { update } = useProjectMutation();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [closing, setClosing] = useState(false);
  const holder = useRef<HTMLSpanElement>(null);
  // Set in the press's own tick, before React has rendered: a second press finds it.
  const inFlight = useRef(false);

  // The task drawer takes the drawer's place beside the screen.
  const taskOpen = route.screen === 'project' && !!route.task;
  useEffect(() => {
    if (taskOpen) setEditing(false);
  }, [taskOpen]);

  const roles = rolesOf(viewer, project);
  if (!roles.manager && !roles.admin) return null;

  const edit = can('project_edit', { viewer, project, online });
  const move = can('project_close', { viewer, project, online });
  const item = (id: string, label: string, verdict: Verdict): MenuItem =>
    verdict.ok ? { id, label } : { id, label, disabled: true, reason: tr(verdict.reason) };
  const items: MenuItem[] = project.status === 'closed'
    ? [item('reopen', tr('reopenProject'), move)]
    : [
      item('edit', tr('editProject'), edit),
      project.status === 'paused' ? item('resume', tr('resumeProject'), move) : item('pause', tr('pauseProject'), move),
      item('close', tr('closeProject'), move),
    ];

  const moveTo = async (status: ProjectStatus): Promise<void> => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await update(project, { status });
    } finally {
      inFlight.current = false;
    }
  };

  const onSelect = ({ id }: { id: string }) => {
    if (id === 'edit') {
      if (edit.ok) setEditing(true);
    } else if (!move.ok) {
      return;
    } else if (id === 'pause') void moveTo('paused');
    else if (id === 'resume' || id === 'reopen') void moveTo('active');
    else if (id === 'close') setConfirming(true);
  };

  const confirmClose = async () => {
    if (inFlight.current) return;
    setClosing(true);
    try {
      await moveTo('closed');
    } finally {
      setClosing(false);
      setConfirming(false);
    }
  };

  const closeEdit = () => {
    setEditing(false);
    holder.current?.querySelector('af-menu')?.shadowRoot?.querySelector<HTMLElement>('[part="trigger"]')?.focus({ preventScroll: true });
  };

  return (
    <>
      <span ref={holder} className="project-menu">
        <Menu items={items} label={tr('projectMenu')} locale={lang} onSelect={onSelect}>
          <MoreHorizontal size={16} />
        </Menu>
      </span>
      <ProjectEdit project={project} open={editing} onClose={closeEdit} />
      <Confirm
        open={confirming}
        heading={tr('closeProject')}
        message={tr('closeProjectConfirm')}
        confirmLabel={tr('closeProject')}
        busy={closing}
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        onConfirm={() => void confirmClose()}
        onCancel={() => { if (!closing) setConfirming(false); }}
      />
    </>
  );
}
