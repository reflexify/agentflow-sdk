import type { Attachment, NewProject, Person, Priority, Project, ProjectChanges, ProjectStatus, Section, Status, Task, TaskLabel, Unit, Viewer, WorkflowTask } from '../model/types.js';

export type ProjectsErrorKind = 'signed_out' | 'forbidden' | 'not_found' | 'stale' | 'conflict' | 'invalid' | 'refused' | 'failed' | 'offline' | 'partial';

export interface CascadeFacts { forbidden?: number; found?: number; cap?: number }

export class ProjectsError extends Error {
  constructor(
    readonly kind: ProjectsErrorKind,
    readonly status: number,
    readonly code: string,
    readonly reason: string | null,
    message?: string,
    /** On `partial`: the record the first write created. */
    readonly task: Task | null = null,
    /** On `partial`: the kind of the failure that followed. */
    readonly underlying: ProjectsErrorKind | null = null,
    /** On `partial`: the project the first write created. */
    readonly project: Project | null = null,
    /** On a refused cascading delete: how many records the deleter cannot edit, or how many it would touch and the most one delete may. */
    readonly cascade?: CascadeFacts,
  ) {
    super(message ?? (reason ? `${code}: ${reason}` : code));
    this.name = 'ProjectsError';
  }
}

export const isProjectsError = (e: unknown, kind?: ProjectsErrorKind): e is ProjectsError =>
  e instanceof ProjectsError && (kind === undefined || e.kind === kind);

export interface BoardScope { project: string; done: 'hide' | '7' | '30' | 'all'; cancelled: boolean }
export interface BoardTasks { tasks: Task[]; truncated: boolean }
export interface MyWork { primary: Task[]; collaborating: Task[]; claimableTasks: Task[]; workflow: WorkflowTask[] }
export interface NewTask {
  project: string; title: string; section?: string | null; due?: string | null; priority?: Priority | null;
  collaborators?: string[]; primary?: string | null;
  /** Where the card sorts in its column; absent or null sorts it after every placed card. */
  position?: number | null;
}
export type TaskChanges = Partial<Pick<Task, 'title' | 'description' | 'due' | 'priority' | 'collaborators' | 'status' | 'label' | 'blocked' | 'section' | 'position' | 'showChecklistOnCard' | 'attachments'>>;
export type ChecklistOp =
  | { op: 'add'; text: string; after: string | null }
  | { op: 'set'; id: string; text?: string; done?: boolean }
  | { op: 'move'; id: string; after: string | null }
  | { op: 'remove'; id: string };

export interface ProjectsApi {
  viewer(): Promise<Viewer>;
  people(): Promise<Person[]>;
  names(ids: { users?: string[]; groups?: string[] }): Promise<{ users: Map<string, string>; groups: Map<string, string> }>;
  projects(statuses: ProjectStatus[]): Promise<Project[]>;
  project(id: string): Promise<Project>;
  sections(project: string): Promise<Section[]>;
  labels(): Promise<TaskLabel[]>;
  boardTasks(scope: BoardScope): Promise<BoardTasks>;
  task(id: string): Promise<Task>;
  myWork(viewerId: string): Promise<MyWork>;
  createTask(input: NewTask): Promise<Task>;
  updateTask(task: Task, changes: TaskChanges): Promise<Task>;
  checklist(task: Task, ops: ChecklistOp[]): Promise<Task>;
  claim(task: Task): Promise<void>;
  assign(task: Task, userId: string): Promise<void>;
  release(task: Task): Promise<void>;
  deleteTask(task: Task): Promise<void>;
  createSection(project: string, name: string, position: number, description?: string): Promise<Section>;
  updateSection(section: Section, changes: Partial<Pick<Section, 'name' | 'description' | 'position'>>): Promise<Section>;
  deleteSection(section: Section): Promise<void>;
  createProject(input: NewProject): Promise<Project>;
  updateProject(project: Project, changes: ProjectChanges): Promise<Project>;
  units(): Promise<Unit[]>;
  createLabel(name: string, baseStatus: Status): Promise<TaskLabel>;
  updateLabel(label: TaskLabel, changes: { name: string }): Promise<TaskLabel>;
  /** The tasks that lost the label; the delete is all or nothing. */
  deleteLabel(label: TaskLabel): Promise<{ cleared: number }>;
  upload(file: File): Promise<Attachment>;
  attachment(id: string): Promise<Attachment>;
  /** The download link; it always answers as an attachment, so a preview reads `fileBlob` instead. */
  fileUrl(id: string): string;
  fileBlob(id: string): Promise<Blob>;
}
