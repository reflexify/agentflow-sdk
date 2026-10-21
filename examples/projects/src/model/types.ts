export type Status = 'todo' | 'doing' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type GroupBy = 'status' | 'section' | 'owner' | 'due' | 'priority';
export type ProjectStatus = 'active' | 'paused' | 'closed';
export type Origin = 'manual' | 'assistant' | 'document' | 'workflow';

export interface ChecklistItem { id: string; text: string; done: boolean }

export interface Task {
  id: string; version: number; updatedAt: string; createdAt: string; createdBy: string | null;
  title: string; project: string; section: string | null; position: number | null; description: string;
  status: Status; blocked: boolean; label: string | null; collaborators: string[]; priority: Priority | null;
  due: string | null; checklist: ChecklistItem[]; showChecklistOnCard: boolean; origin: Origin;
  completedAt: string | null; frozen: boolean; holder: string | null; attachments: string[];
  fileNames: Record<string, string>;
}

export interface Project {
  id: string; version: number; updatedAt: string; name: string; description: string; managers: string[]; members: string[];
  status: ProjectStatus; unit: string | null; defaultGroupBy: GroupBy | null; counts: { todo: number; doing: number; done: number };
}

export interface Section {
  id: string; updatedAt: string; project: string; name: string; description: string; position: number | null;
  done: number; total: number;
}

export interface TaskLabel { id: string; updatedAt: string; name: string; baseStatus: Status }
export interface Unit { id: string; name: string; code: string | null }

export interface NewProject {
  name: string; description: string; unit: string | null; managers: string[]; members: string[];
  defaultGroupBy?: GroupBy | null;
}
export type ProjectChanges = Partial<Pick<Project, 'name' | 'description' | 'unit' | 'defaultGroupBy' | 'managers' | 'members' | 'status'>>;
export interface Person { id: string; name: string; email: string | null }
export interface Viewer { id: string; projectAdmin: boolean; projectCreator: boolean }

export interface WorkflowTask {
  id: string; entityId: string; title: string; workflow: string; step: string; due: string | null; groups: string[];
  claimable: boolean;
}

export interface Attachment { id: string; name: string; size: number; type: string; uploadedAt: string }
