import { createFakeProjects } from '../../src/api/fake.js';
import type { ProjectsApi, TaskChanges } from '../../src/api/projects-api.js';

/** The seeded fake acting as `you`, with lookups by name and title. */
export function seeded(you: string) {
  const fake = createFakeProjects({ you });
  const project = (name: string) => fake.server.records('project').find((r) => r.body.name === name)!.id;
  const record = (title: string) => fake.server.records('task').find((r) => r.body.title === title)!;
  const task = (title: string) => record(title).id;
  const stored = (id: string) => fake.server.records('task').find((r) => r.id === id)!.body;
  const label = (name: string) => fake.server.records('task_label').find((r) => r.body.name === name)!.id;
  return { fake, project, record, task, stored, label };
}

/** The API with every task patch recorded, in order. */
export function recordingPatches(): { patches: TaskChanges[]; api: (api: ProjectsApi) => ProjectsApi } {
  const patches: TaskChanges[] = [];
  return {
    patches,
    api: (api) => ({
      ...api,
      updateTask: (task, changes) => {
        patches.push(changes);
        return api.updateTask(task, changes);
      },
    }),
  };
}

export const LAUNCH = 'Ra mắt ứng dụng';
export const LOGIN_DESIGN = 'Thiết kế màn hình đăng nhập';
