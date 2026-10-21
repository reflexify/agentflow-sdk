import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useT } from '../data/context.js';
import type { GroupBy } from '../model/types.js';
import { ChevronDown, KanbanIcon, ListIcon } from '../shared/icons.js';
import { useNavigate } from '../shell/RouteContext.js';
import { routePath, type Query, type Route } from '../shell/route.js';
import type { TextKey } from '../text.js';

export const GROUPS: { value: GroupBy; label: TextKey }[] = [
  { value: 'status', label: 'groupStatus' },
  { value: 'section', label: 'groupSection' },
  { value: 'owner', label: 'groupOwner' },
  { value: 'due', label: 'groupDue' },
  { value: 'priority', label: 'groupPriority' },
];
const DONE: { value: Query['done']; label: TextKey }[] = [
  { value: 'hide', label: 'doneHide' },
  { value: '7', label: 'done7' },
  { value: '30', label: 'done30' },
  { value: 'all', label: 'doneAll' },
];
const VIEWS: { value: Query['view']; label: TextKey; icon: ReactNode }[] = [
  { value: 'list', label: 'viewList', icon: <ListIcon /> },
  { value: 'board', label: 'viewBoard', icon: <KanbanIcon /> },
];

export const viewTabId = (view: Query['view']) => `tasks-view-${view}`;
export const VIEW_PANEL_ID = 'tasks-view-panel';

type ProjectRoute = Extract<Route, { screen: 'project' }>;

/**
 * The Tasks tab's choices: the view, the grouping, which completed tasks to show and whether to show cancelled ones.
 * Each lives in the address, so a change is a navigation and a link reproduces the view.
 */
export function Toolbar({ route, groupBy }: { route: ProjectRoute; groupBy: GroupBy }) {
  const tr = useT();
  const navigate = useNavigate();
  const tabs = useRef<Partial<Record<Query['view'], HTMLButtonElement | null>>>({});
  const go = (changes: Partial<Query>) => navigate(routePath({ ...route, view: { ...route.view, ...changes } }));

  // One tab stop for the pair; the arrows move between them, and moving selects.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, at: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? VIEWS.length - 1 : step ? (at + step + VIEWS.length) % VIEWS.length : -1;
    if (to < 0) return;
    e.preventDefault();
    const next = VIEWS[to]!.value;
    if (next !== route.view.view) go({ view: next });
    tabs.current[next]?.focus();
  };

  return (
    <div className="tasks-toolbar">
      <div className="af-tabs view-switch" role="tablist" aria-label={tr('viewSwitch')}>
        {VIEWS.map(({ value, label, icon }, i) => {
          const selected = route.view.view === value;
          return (
            <button
              key={value}
              ref={(el) => { tabs.current[value] = el; }}
              type="button"
              role="tab"
              id={viewTabId(value)}
              aria-selected={selected}
              aria-controls={VIEW_PANEL_ID}
              tabIndex={selected ? 0 : -1}
              onClick={() => { if (!selected) go({ view: value }); }}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {icon}
              {tr(label)}
            </button>
          );
        })}
      </div>
      <label className="select">
        <span className="select-label" aria-hidden="true">{tr('groupBy')}:</span>
        <select className="select-control" aria-label={tr('groupBy')} value={groupBy} onChange={(e) => go({ group: e.target.value as GroupBy })}>
          {GROUPS.map(({ value, label }) => <option key={value} value={value}>{tr(label)}</option>)}
        </select>
        <ChevronDown className="select-chevron" />
      </label>
      <label className="select">
        <span className="select-label" aria-hidden="true">{tr('doneWindow')}:</span>
        <select className="select-control" aria-label={tr('doneWindow')} value={route.view.done} onChange={(e) => go({ done: e.target.value as Query['done'] })}>
          {DONE.map(({ value, label }) => <option key={value} value={value}>{tr(label)}</option>)}
        </select>
        <ChevronDown className="select-chevron" />
      </label>
      <label className="check">
        <input type="checkbox" className="check-box" checked={route.view.cancelled} onChange={(e) => go({ cancelled: e.target.checked })} />
        {tr('showCancelled')}
      </label>
    </div>
  );
}
