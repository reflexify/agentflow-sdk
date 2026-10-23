export type Status = 'todo' | 'doing' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type GroupBy = 'status' | 'section' | 'owner' | 'due' | 'priority';
export type ProjectStatus = 'active' | 'paused' | 'closed';
export type Origin = 'manual' | 'assistant' | 'document' | 'workflow';

import type { ResolvedMention } from '@reflexify/agentflow-sdk';

/** What each mention token in a record's texts names, as the viewer may read it, keyed by `<kind>/<id>`. */
export type MentionMap = Record<string, ResolvedMention>;

export interface ChecklistItem { id: string; text: string; done: boolean }

export interface Task {
  id: string; version: number; updatedAt: string; createdAt: string; createdBy: string | null;
  title: string; project: string; section: string | null; position: number | null; description: string;
  status: Status; blocked: boolean; label: string | null; collaborators: string[]; priority: Priority | null;
  due: string | null; checklist: ChecklistItem[]; showChecklistOnCard: boolean; origin: Origin;
  completedAt: string | null; frozen: boolean; holder: string | null; attachments: string[];
  fileNames: Record<string, string>;
  mentions: MentionMap;
}

export interface Project {
  id: string; version: number; updatedAt: string; name: string; description: string; managers: string[]; members: string[];
  status: ProjectStatus; unit: string | null; defaultGroupBy: GroupBy | null; counts: { todo: number; doing: number; done: number };
  mentions: MentionMap;
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

/** What a mention token in a comment names, as the viewer may read it. */
export type MentionTarget =
  | { state: 'ok'; kind: 'user' | 'record'; label: string; href: string | null }
  | { state: 'restricted' | 'deleted'; kind: string };

export interface CommentFile { id: string; name: string; size: number; type: string }

export interface Comment {
  id: string; authorId: string; authorName: string; body: string; createdAt: string; editedAt: string | null;
  canEdit: boolean; canDelete: boolean; files: CommentFile[];
  /** Keyed `<kind>/<id>`; a token missing from it is restricted. */
  mentions: Record<string, MentionTarget>;
}

/** One page of a task's thread, oldest first. */
export interface CommentThread {
  comments: Comment[];
  /** How many comments the whole thread holds, every page together. */
  total: number;
  /** The thread is read only. */
  closed: boolean;
  canComment: boolean;
  /** Reads the comments before this page, or null when this page starts the thread. */
  olderCursor: string | null;
}

/** A person a comment mentions who cannot read the task, so was not told. */
export interface Unnotified { id: string; name: string }
