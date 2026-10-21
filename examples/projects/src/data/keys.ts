import type { BoardScope } from '../api/projects-api.js';
import type { ProjectStatus } from '../model/types.js';

/** React Query keys. Each list's first element is the prefix a live change invalidates. */
export const keys = {
  viewer: ['viewer'] as const,
  people: ['people'] as const,
  labels: ['labels'] as const,
  units: ['units'] as const,
  // Sorted, so the same set of statuses is one cache entry whatever order a screen lists them in.
  projects: (statuses: readonly ProjectStatus[]) => ['projects', ...[...statuses].sort()] as const,
  project: (id: string) => ['project', id] as const,
  sections: (project: string) => ['sections', project] as const,
  board: (scope: BoardScope) => ['board', scope.project, scope.done, scope.cancelled] as const,
  task: (id: string) => ['task', id] as const,
  mywork: ['mywork'] as const,
};

/** Every board a project can be read as: each done window, with and without its cancelled tasks. */
export function boardScopes(project: string): BoardScope[] {
  return (['hide', '7', '30', 'all'] as const).flatMap((done) => [false, true].map((cancelled) => ({ project, done, cancelled })));
}
