import type { ProjectIds } from '../shared/app-objects.js';

export const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** Fixed ids for the demo seed. The module itself reads its ids from `GET /app/objects`. */
export const DEMO_IDS: ProjectIds = {
  entities: { project: id(101), section: id(102), task: id(103), task_label: id(104) },
  groups: { users: id(201), creators: id(202), admins: id(203) },
};
