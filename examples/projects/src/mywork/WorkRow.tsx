import { useQuery } from '@tanstack/react-query';
import { useProjects, useProjectsBase, useT } from '../data/context.js';
import { DueDate } from '../board/DueDate.js';
import { Tooltip } from '../kit/elements.js';
import type { WorkflowTask } from '../model/types.js';
import { ExternalLink, WorkflowIcon } from '../shared/icons.js';

/** The names of the groups a piece of work is offered to, from the one call that turns ids into names. */
function useGroupNames(ids: string[], enabled: boolean): string[] {
  const { api } = useProjectsBase();
  const key = [...ids].sort();
  const names = useQuery({
    queryKey: ['names', 'groups', ...key],
    queryFn: () => api.names({ groups: key }),
    enabled: enabled && key.length > 0,
    staleTime: 5 * 60_000,
  });
  return ids.flatMap((id) => names.data?.groups.get(id) ?? []);
}

/**
 * A workflow task: AgentFlow owns its form, so the row links there. Its step badge sits where a task's tick does, so a
 * workflow row stands out before it is read.
 */
export function WorkRow({ work }: { work: WorkflowTask }) {
  const { agentflowUrl, lang } = useProjects();
  const tr = useT();
  const groups = useGroupNames(work.groups, work.claimable);
  const href = agentflowUrl(`/inbox?record=${encodeURIComponent(work.id)}&entity=${encodeURIComponent(work.entityId)}`);
  return (
    <article className="work-row" aria-label={work.title} data-work={work.id}>
      <span className="work-badge" aria-hidden="true"><WorkflowIcon size={14} /></span>
      <Tooltip text={work.step} locale={lang} className="card-tip" whenCutShort>
        <span className="work-step" data-part="step">{work.step}</span>
      </Tooltip>
      <span className="card-project" data-part="workflow">{work.workflow}</span>
      <span className="card-chips">
        <span className="tag" data-tone="info" data-part="role">{tr('roleWorkflow')}</span>
        {work.claimable && groups.length > 0 && (
          <Tooltip text={groups.join(', ')} locale={lang} className="work-groups-tip" whenCutShort>
            <span className="work-groups" data-part="groups">{groups.join(', ')}</span>
          </Tooltip>
        )}
      </span>
      {work.due && <span className="card-due" data-part="due"><DueDate task={{ due: work.due, status: 'todo' }} /></span>}
      <a className="af-button secondary sm open-form" data-part="open-form" href={href}>
        {tr('openForm')}
        <ExternalLink size={14} />
      </a>
    </article>
  );
}
