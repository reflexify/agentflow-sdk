import { useQuery } from '@tanstack/react-query';
import { useProjects, useT } from '../data/context.js';
import { keys } from '../data/keys.js';
import type { MentionedIn as Mentioned } from '../api/mentioned-in.js';
import type { MentionTarget } from '../api/projects-api.js';
import { DEFAULT_QUERY, routePath } from '../shell/route.js';
import { useNavigate } from '../shell/RouteContext.js';

type MentionedInPlaces = Mentioned['places'];

const places = (all: MentionedInPlaces, tr: ReturnType<typeof useT>): string | null => {
  const names = [...new Set(all.map((p) => (p.kind === 'comment' ? tr('mentionedInComment') : p.label)))];
  return names.length ? names.join(', ') : null;
};

/**
 * "Liên quan · Task nhắc đến bản ghi này (N)": the tasks whose texts mention a record, among those the viewer may read.
 * Nothing at all while there are none, or while they cannot be read.
 */
export function MentionedIn({ target }: { target: MentionTarget }) {
  const { api, ids } = useProjects();
  const tr = useT();
  const navigate = useNavigate();
  const found = useQuery({ queryKey: keys.mentionedIn(target.record), queryFn: () => api.mentionedIn(target), staleTime: 0, retry: false });
  const tasks = (found.data ?? []).filter((m) => m.entityId === ids.entities.task);
  if (tasks.length === 0) return null;
  return (
    <section className="drawer-section mentioned-in" data-part="mentioned-in" aria-label={tr('mentionedInTasks', { count: tasks.length })}>
      <h3 className="mentioned-in-title">{tr('mentionedInTasks', { count: tasks.length })}</h3>
      <ul className="mentioned-in-list">
        {tasks.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              className="mentioned-in-row"
              onClick={() => navigate(routePath({ screen: 'project', project: '', view: DEFAULT_QUERY, task: m.id }))}
            >
              <span className="mentioned-in-name">{m.title}</span>
              <span className="mentioned-in-meta">
                {[places(m.places, tr), m.count > 1 ? tr('mentionedInCount', { count: m.count }) : null, m.author].filter(Boolean).join(' · ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
