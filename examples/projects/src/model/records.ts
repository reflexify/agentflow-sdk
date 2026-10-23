import type { components } from '@reflexify/agentflow-sdk';
import type { ChecklistItem, MentionMap, GroupBy, Origin, Priority, Project, ProjectStatus, Section, Status, Task, TaskLabel, Unit } from './types.js';

export type WireRecord = components['schemas']['EntityRecord'];

const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const count = (v: unknown): number => num(v) ?? 0;
const oneOf = <T extends string>(v: unknown, values: readonly T[], fallback: T): T =>
  (values as readonly unknown[]).includes(v) ? (v as T) : fallback;
const maybeOneOf = <T extends string>(v: unknown, values: readonly T[]): T | null =>
  (values as readonly unknown[]).includes(v) ? (v as T) : null;
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x !== '') : []);

// A date names a day; a stray time part must not move it.
const day = (v: unknown): string | null => {
  const s = str(v);
  return s && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
};

// Instants are compared and sorted, and the same moment can arrive as `…Z` or with an offset.
const instant = (v: unknown): string | null => {
  const s = str(v);
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
};

const STATUSES = ['todo', 'doing', 'done', 'cancelled'] as const satisfies readonly Status[];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const satisfies readonly Priority[];
const ORIGINS = ['manual', 'assistant', 'document', 'workflow'] as const satisfies readonly Origin[];
const PROJECT_STATUSES = ['active', 'paused', 'closed'] as const satisfies readonly ProjectStatus[];
const GROUPS = ['status', 'section', 'owner', 'due', 'priority'] as const satisfies readonly GroupBy[];

function checklist(v: unknown): ChecklistItem[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item): ChecklistItem[] => {
    if (!item || typeof item !== 'object') return [];
    const o = item as Record<string, unknown>;
    return typeof o.id === 'string' ? [{ id: o.id, text: text(o.text), done: o.done === true }] : [];
  });
}

const mentionsOf = (r: WireRecord): MentionMap => r.mentions ?? {};

function fileNames(r: WireRecord): Record<string, string> {
  const labels = r.file_labels?.attachments ?? {};
  return Object.fromEntries(Object.entries(labels).filter((e): e is [string, string] => typeof e[1] === 'string'));
}

export function toTask(r: WireRecord): Task {
  const b = r.body;
  return {
    id: r.id,
    version: r.version,
    updatedAt: r.updated_at,
    createdAt: r.created_at,
    createdBy: r.created_by ?? null,
    title: text(b.title),
    project: text(b.project),
    section: str(b.section),
    position: num(b.position),
    description: text(b.description),
    status: oneOf(b.status, STATUSES, 'todo'),
    blocked: b.blocked === true,
    label: str(b.label),
    collaborators: strings(b.collaborators),
    priority: maybeOneOf(b.priority, PRIORITIES),
    due: day(b.due),
    checklist: checklist(b.checklist),
    showChecklistOnCard: b.show_checklist_on_card === true,
    origin: oneOf(b.origin, ORIGINS, 'manual'),
    completedAt: instant(b.completed_at),
    frozen: b.frozen === true,
    holder: str(b.claimed_by),
    attachments: strings(b.attachments),
    fileNames: fileNames(r),
    mentions: mentionsOf(r),
  };
}

export function toProject(r: WireRecord): Project {
  const b = r.body;
  return {
    id: r.id,
    version: r.version,
    updatedAt: r.updated_at,
    name: text(b.name),
    description: text(b.description),
    managers: strings(b.managers),
    members: strings(b.members),
    status: oneOf(b.status, PROJECT_STATUSES, 'active'),
    unit: str(b.unit),
    defaultGroupBy: maybeOneOf(b.default_group_by, GROUPS),
    counts: { todo: count(b.tasks_todo), doing: count(b.tasks_doing), done: count(b.tasks_done) },
    mentions: mentionsOf(r),
  };
}

export function toSection(r: WireRecord): Section {
  const b = r.body;
  return {
    id: r.id,
    updatedAt: r.updated_at,
    project: text(b.project),
    name: text(b.name),
    description: text(b.description),
    position: num(b.position),
    done: count(b.tasks_done),
    total: count(b.tasks_total),
  };
}

export function toLabel(r: WireRecord): TaskLabel {
  return { id: r.id, updatedAt: r.updated_at, name: text(r.body.name), baseStatus: oneOf(r.body.base_status, STATUSES, 'todo') };
}

export function toUnit(u: { id: string; name: string; code?: string | null }): Unit {
  return { id: u.id, name: u.name, code: str(u.code) };
}
