import { useId, useRef } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useProjectMutation } from '../data/hooks.js';
import { Tooltip } from '../kit/elements.js';
import { can, rolesOf } from '../model/roles.js';
import type { Project } from '../model/types.js';
import { LockIcon } from '../shared/icons.js';

/** A closed project is read only; those who may reopen it are offered Mở lại at the strip's end. */
export function ClosedBanner({ project }: { project: Project }) {
  const { viewer, online, lang } = useProjects();
  const tr = useT();
  const { update, busy } = useProjectMutation();
  // Set in the press's own tick, before React has rendered: a second press finds it.
  const inFlight = useRef(false);
  const reasonId = useId();
  if (project.status !== 'closed') return null;
  const verdict = can('project_close', { viewer, project, online });
  const roles = rolesOf(viewer, project);
  const offered = roles.manager || roles.admin;

  const reopen = async () => {
    if (inFlight.current || !verdict.ok) return;
    inFlight.current = true;
    try {
      await update(project, { status: 'active' });
    } finally {
      inFlight.current = false;
    }
  };

  const button = (
    <button
      type="button"
      className="af-button secondary sm"
      aria-disabled={verdict.ok && !busy ? undefined : 'true'}
      aria-busy={busy ? 'true' : undefined}
      aria-describedby={verdict.ok ? undefined : reasonId}
      onClick={() => void reopen()}
    >
      {tr('reopenProject')}
    </button>
  );
  return (
    <div className="strip closed-banner" data-tone="warn" role="status">
      <LockIcon size={14} />
      <strong>{tr('closedReadOnly')}</strong>
      {offered && (
        <span className="closed-action">
          {verdict.ok ? button : (
            <>
              <Tooltip text={tr(verdict.reason)} locale={lang}>{button}</Tooltip>
              <span id={reasonId} className="sr-only">{tr(verdict.reason)}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
