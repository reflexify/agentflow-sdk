import type { GroupBy } from '../model/types.js';

/** The Tasks tab's choices, carried in the query so a link reproduces the view. */
export interface Query {
  view: 'board' | 'list';
  group: GroupBy | null;
  done: 'hide' | '7' | '30' | 'all';
  cancelled: boolean;
}

/**
 * A screen, and the task whose drawer is open over it. `project` is empty for `/t/<task>` until the task says whose it
 * is. `tab` names a project's tab other than Tasks; the Tasks tab is the page with none, and the only one that has a query.
 */
export type Route =
  & ({ screen: 'mywork' } | { screen: 'projects' } | { screen: 'labels' } | { screen: 'project'; project: string; view: Query; tab?: 'members' })
  & { task?: string };

export const DEFAULT_QUERY: Query = { view: 'board', group: null, done: '30', cancelled: false };

const GROUPS: readonly GroupBy[] = ['status', 'section', 'owner', 'due', 'priority'];
const DONE: readonly Query['done'][] = ['hide', '7', '30', 'all'];
const HOME: Route = { screen: 'mywork' };

function readQuery(search: string): Query {
  const q = new URLSearchParams(search);
  const group = q.get('group');
  const done = q.get('done');
  return {
    view: q.get('view') === 'list' ? 'list' : 'board',
    group: GROUPS.includes(group as GroupBy) ? (group as GroupBy) : null,
    done: DONE.includes(done as Query['done']) ? (done as Query['done']) : DEFAULT_QUERY.done,
    cancelled: q.get('cancelled') === '1',
  };
}

function writeQuery(view: Query): string {
  const parts: string[] = [];
  if (view.view !== DEFAULT_QUERY.view) parts.push(`view=${view.view}`);
  if (view.group) parts.push(`group=${view.group}`);
  if (view.done !== DEFAULT_QUERY.done) parts.push(`done=${view.done}`);
  if (view.cancelled) parts.push('cancelled=1');
  return parts.length ? `?${parts.join('&')}` : '';
}

const withOpen = <R extends Route>(route: R, task: string | undefined): R => (task ? { ...route, task } : route);

/** The screen a module path names. Anything it does not know opens My Work. */
export function parseRoute(path: string): Route {
  const [pathname = '', rest = ''] = path.replace(/#[\s\S]*$/, '').split('?', 2);
  let segments: string[];
  try {
    segments = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return HOME;
  }
  const [a, b, c] = segments;
  // `/x/t/<task>` over a screen, or the screen alone.
  const drawer = (at: number): string | undefined | null => {
    const tail = segments.slice(at);
    if (tail.length === 0) return undefined;
    return tail.length === 2 && tail[0] === 't' && tail[1] ? tail[1] : null;
  };
  if (a === undefined) return HOME;
  if (a === 'mine' || a === 'projects') {
    const task = drawer(1);
    if (task === null) return HOME;
    return withOpen(a === 'mine' ? { screen: 'mywork' } : { screen: 'projects' }, task);
  }
  if (a === 'p' && b) {
    if (c === 'members') {
      const task = drawer(3);
      if (task === null) return HOME;
      return withOpen({ screen: 'project', project: b, view: DEFAULT_QUERY, tab: 'members' }, task);
    }
    const task = drawer(2);
    if (task === null) return HOME;
    return withOpen({ screen: 'project', project: b, view: readQuery(rest) }, task);
  }
  if (a === 'settings' && b === 'labels' && segments.length === 2) return { screen: 'labels' };
  if (a === 't' && b && c === undefined) return { screen: 'project', project: '', view: readQuery(rest), task: b };
  return HOME;
}

export function routePath(route: Route): string {
  const open = route.task ? `/t/${encodeURIComponent(route.task)}` : '';
  switch (route.screen) {
    case 'mywork':
      return open ? `/mine${open}` : '/';
    case 'projects':
      return `/projects${open}`;
    case 'labels':
      return '/settings/labels';
    case 'project': {
      if (route.tab === 'members') return `/p/${encodeURIComponent(route.project)}/members${open}`;
      if (!route.project) return open ? `${open}${writeQuery(route.view)}` : '/';
      return `/p/${encodeURIComponent(route.project)}${open}${writeQuery(route.view)}`;
    }
  }
}

/** The path of `route` with `task`'s drawer open over it, or with no drawer for `null`. */
export function withTask(route: Route, task: string | null): string {
  const next: Route = { ...route };
  delete next.task;
  if (task) next.task = task;
  return routePath(next);
}
