import type { TextKey } from '../text.js';
import type { Project, Task, Viewer } from './types.js';

export type Control =
  | 'create_task' | 'claim' | 'pick_primary' | 'complete' | 'move_status' | 'label' | 'blocked'
  | 'edit_content' | 'cancel' | 'restore' | 'reopen' | 'delete' | 'checklist' | 'attachments' | 'move_card'
  | 'sections' | 'project_edit' | 'project_close' | 'members';

export type Verdict = { ok: true } | { ok: false; reason: TextKey; hidden: boolean };

export interface Roles {
  admin: boolean; creator: boolean; manager: boolean; member: boolean; primary: boolean; collaborator: boolean;
}

const ACTIVE: readonly Task['status'][] = ['todo', 'doing'];

export function rolesOf(viewer: Viewer, project: Project | null, task?: Task | null): Roles {
  return {
    admin: viewer.projectAdmin,
    creator: viewer.projectCreator,
    manager: !!project && project.managers.includes(viewer.id),
    member: !!project && project.members.includes(viewer.id),
    // A done or cancelled task keeps its holder, who has no owner rights left: the server counts the work's holder
    // only while the work is live.
    primary: !!task && task.holder === viewer.id && ACTIVE.includes(task.status),
    collaborator: !!task && task.collaborators.includes(viewer.id),
  };
}

const OK: Verdict = { ok: true };
const no = (reason: TextKey, hidden = false): Verdict => ({ ok: false, reason, hidden });
const when = (allowed: boolean, reason: TextKey, hidden = false): Verdict => (allowed ? OK : no(reason, hidden));


// A status action exists only in the status it acts on; elsewhere the control is not shown at all.
const STATUS_OF: Partial<Record<Control, readonly Task['status'][]>> = {
  complete: ACTIVE,
  cancel: ACTIVE,
  move_status: ACTIVE,
  blocked: ['doing'],
  reopen: ['done'],
  restore: ['cancelled'],
};

export function can(
  control: Control,
  ctx: { viewer: Viewer; project: Project | null; task?: Task | null; online: boolean },
): Verdict {
  const { viewer, project, task, online } = ctx;
  const r = rolesOf(viewer, project, task);

  // Refusals that hide the control come first: a lock must not show a control that is hidden anyway.
  const allowedStatuses = STATUS_OF[control];
  if (allowedStatuses && task && !allowedStatuses.includes(task.status)) return no('wrongStatus', true);
  if (control === 'pick_primary' && !r.manager) return no('onlyManagers', true);
  if (control === 'delete' && !r.manager) return no('onlyManagersDelete', true);

  if (!online) return no('offlineLocked');
  if (project?.status === 'closed' && control !== 'project_close') return no('projectClosedLocked');
  if (task?.frozen && control !== 'project_close') return no('taskFrozenLocked');

  const participant = r.primary || r.collaborator || r.manager;
  const ownerOrManager = r.primary || r.manager;
  // A finished task has no owner, so its refusals name who is left.
  const finished = !!task && !ACTIVE.includes(task.status);

  switch (control) {
    case 'create_task': return when(r.manager || r.member, 'onlyMembersCreate');
    case 'claim':
      if (!(r.manager || r.member)) return no('onlyMembersClaim');
      return when(!!task && task.holder === null, 'alreadyHeld');
    case 'pick_primary': return when(r.manager, 'onlyManagers', true);
    case 'complete': return when(r.primary, 'onlyPrimaryCompletes');
    case 'move_status':
    case 'label':
    case 'blocked':
    case 'checklist':
    case 'attachments':
    case 'move_card': return when(participant, finished ? 'onlyParticipantsFinished' : 'onlyParticipants');
    case 'edit_content':
    case 'cancel': return when(ownerOrManager, finished ? 'onlyManagersFinished' : 'onlyOwnerOrManager');
    case 'restore':
    case 'reopen':
    case 'sections':
    case 'members':
    case 'project_edit': return when(r.manager, 'onlyManagers');
    case 'delete': return when(r.manager, 'onlyManagersDelete', true);
    case 'project_close': return when(r.manager || r.admin, 'onlyManagers');
  }
}

export function canCreateProject(viewer: Viewer, online: boolean): Verdict {
  if (!online) return no('offlineLocked');
  return when(viewer.projectCreator, 'onlyCreatorsCreate');
}

export function canManageLabels(viewer: Viewer, online: boolean): Verdict {
  if (!online) return no('offlineLocked');
  return when(viewer.projectAdmin, 'onlyAdminsLabels');
}
