import { useRef, type KeyboardEvent } from 'react';
import { useT } from '../data/context.js';
import { useNavigate } from '../shell/RouteContext.js';
import { routePath, type Route } from '../shell/route.js';
import type { TextKey } from '../text.js';

type ProjectRoute = Extract<Route, { screen: 'project' }>;
type Tab = 'tasks' | 'members';

const TABS: { value: Tab; label: TextKey }[] = [
  { value: 'tasks', label: 'tabTasks' },
  { value: 'members', label: 'tabMembers' },
];

export const projectTabId = (tab: Tab) => `project-tab-${tab}`;
export const PROJECT_PANEL_ID = 'project-tab-panel';

/** The tab a route is on: Tasks is the page with none named. */
export const tabOf = (route: ProjectRoute): Tab => route.tab ?? 'tasks';

/**
 * A project's tabs, Task and Thành viên. The address holds the choice, so a tab is a navigation; the arrows, Home and
 * End move between the tabs and select, as the Tasks tab's view switch does.
 */
export function ProjectTabs({ route }: { route: ProjectRoute }) {
  const tr = useT();
  const navigate = useNavigate();
  const tabs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const current = tabOf(route);

  const go = (tab: Tab) => {
    if (tab === current) return;
    const page: ProjectRoute = { screen: 'project', project: route.project, view: route.view };
    navigate(routePath(tab === 'members' ? { ...page, tab: 'members' } : page));
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, at: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : step ? (at + step + TABS.length) % TABS.length : -1;
    if (to < 0) return;
    e.preventDefault();
    const next = TABS[to]!.value;
    go(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="af-tabs project-tabs" role="tablist" aria-label={tr('projectTabs')}>
      {TABS.map(({ value, label }, i) => {
        const selected = current === value;
        return (
          <button
            key={value}
            ref={(el) => { tabs.current[value] = el; }}
            type="button"
            role="tab"
            id={projectTabId(value)}
            aria-selected={selected}
            aria-controls={PROJECT_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            onClick={() => go(value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {tr(label)}
          </button>
        );
      })}
    </div>
  );
}
