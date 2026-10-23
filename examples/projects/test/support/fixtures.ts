import type { Project, Section, Task, Viewer } from '../../src/model/types.js';

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${++counter}`;
const STAMP = '2026-10-01T00:00:00Z';

export function viewer(id: string, extra: Partial<Viewer> = {}): Viewer {
  return { id, projectAdmin: false, projectCreator: false, ...extra };
}

export function aProject(over: Partial<Project> = {}): Project {
  return {
    id: nextId('project'), version: 1, updatedAt: STAMP, name: 'Project', description: '', managers: [], members: [],
    status: 'active', unit: null, defaultGroupBy: null, counts: { todo: 0, doing: 0, done: 0 }, mentions: {}, ...over,
  };
}

export function aSection(over: Partial<Section> = {}): Section {
  return {
    id: nextId('section'), updatedAt: STAMP, project: 'project-0', name: 'Section', description: '', position: null,
    done: 0, total: 0, ...over,
  };
}

export function aTask(over: Partial<Task> = {}): Task {
  return {
    id: nextId('task'), version: 1, updatedAt: STAMP, createdAt: STAMP, createdBy: null,
    title: 'Task', project: 'project-0', section: null, position: null, description: '',
    status: 'todo', blocked: false, label: null, collaborators: [], priority: 'medium',
    due: null, checklist: [], showChecklistOnCard: false, origin: 'manual',
    completedAt: null, frozen: false, holder: null, attachments: [], fileNames: {}, mentions: {}, ...over,
  };
}
