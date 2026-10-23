import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { isProjectsError, type BoardScope, type ProjectsError, type TaskChanges } from '../api/projects-api.js';
import { STEP } from '../model/positions.js';
import type { TemplateSection } from '../model/templates.js';
import type { NewProject, Project, ProjectChanges, ProjectStatus, Section, Status, Task, TaskLabel } from '../model/types.js';
import { useToast } from '../kit/elements.js';
import { useLive } from '../live/LiveProvider.js';
import { useProjects, useProjectsBase, useT } from './context.js';
import { refusalText, useReportFailure } from './failure.js';
import { keys } from './keys.js';

/** How often a read on screen runs again while the stream cannot tell it what changed. */
const POLL_MS = 30_000;

function usePoll(): number | false {
  return useLive().status === 'polling' ? POLL_MS : false;
}

export function useViewer() {
  const { api } = useProjectsBase();
  return useQuery({ queryKey: keys.viewer, queryFn: () => api.viewer(), staleTime: Infinity });
}

export function usePeople() {
  const { api } = useProjectsBase();
  return useQuery({ queryKey: keys.people, queryFn: () => api.people(), staleTime: 5 * 60_000 });
}

export function useLabels() {
  const { api } = useProjectsBase();
  return useQuery({ queryKey: keys.labels, queryFn: () => api.labels(), staleTime: 5 * 60_000 });
}

export function useUnits() {
  const { api } = useProjectsBase();
  return useQuery({ queryKey: keys.units, queryFn: () => api.units(), staleTime: 5 * 60_000 });
}

export function useProjectsList(statuses: ProjectStatus[], enabled = true) {
  const { api } = useProjectsBase();
  return useQuery({ queryKey: keys.projects(statuses), queryFn: () => api.projects(statuses), enabled, refetchInterval: usePoll() });
}

export function useProject(id: string | null) {
  const { api } = useProjectsBase();
  return useQuery({ queryKey: keys.project(id ?? ''), queryFn: () => api.project(id!), enabled: !!id, refetchInterval: usePoll() });
}

export function useSections(project: string | null) {
  const { api } = useProjectsBase();
  return useQuery({ queryKey: keys.sections(project ?? ''), queryFn: () => api.sections(project!), enabled: !!project, refetchInterval: usePoll() });
}

export function useBoard(scope: BoardScope | null) {
  const { api } = useProjectsBase();
  return useQuery({
    queryKey: keys.board(scope ?? { project: '', done: '30', cancelled: false }),
    queryFn: () => api.boardTasks(scope!),
    enabled: !!scope?.project,
    refetchInterval: usePoll(),
  });
}

/** `seed` shows a task some list already holds while its own read is on the way; nothing writes from it. */
export function useTask(id: string | null, seed?: () => Task | undefined) {
  const { api } = useProjectsBase();
  return useQuery({
    queryKey: keys.task(id ?? ''), queryFn: () => api.task(id!), enabled: !!id, refetchInterval: usePoll(),
    ...(seed ? { placeholderData: seed } : {}),
  });
}

export function useMyWork() {
  const { api, viewer } = useProjects();
  return useQuery({ queryKey: keys.mywork, queryFn: () => api.myWork(viewer.id), refetchInterval: usePoll() });
}

/**
 * The newer of a list's copy of `task` and the task's own read, by `updated_at`: a list's copy lags a write made from
 * the drawer until the list reads itself again, and a write from it would meet a 409 the viewer caused.
 */
export function freshestTask(qc: QueryClient, task: Task): Task {
  const own = qc.getQueryData<Task>(keys.task(task.id));
  return own && Date.parse(own.updatedAt) > Date.parse(task.updatedAt) ? own : task;
}

/**
 * One task write, with what every write path does after it: the answer goes into the cache, and a refusal is said in a
 * toast. Resolves to the stored task, or to null when the write did not happen.
 */
export function useTaskMutation(opts: {
  /** Hears a failure before it is reported, to tell a stale reload from someone else's change. */
  onError?: (e: unknown) => void;
} = {}): { update(task: Task, changes: TaskChanges): Promise<Task | null>; busy: boolean } {
  const { api } = useProjectsBase();
  const qc = useQueryClient();
  const report = useReportFailure();
  const [pending, setPending] = useState(0);
  const onError = useRef(opts.onError);
  onError.current = opts.onError;

  const update = useCallback(async (task: Task, changes: TaskChanges): Promise<Task | null> => {
    setPending((n) => n + 1);
    try {
      const saved = await api.updateTask(task, changes);
      qc.setQueryData(keys.task(saved.id), saved);
      void qc.invalidateQueries({ queryKey: ['board'] });
      void qc.invalidateQueries({ queryKey: keys.mywork });
      return saved;
    } catch (e) {
      onError.current?.(e);
      report(e, task.id);
      return null;
    } finally {
      setPending((n) => n - 1);
    }
  }, [api, qc, report]);

  return { update, busy: pending > 0 };
}

/** The newer of the caller's copy of `project` and the project's own read, by `updated_at`: a write made from a stale copy would meet a 409 the viewer caused. */
export function freshestProject(qc: QueryClient, project: Project): Project {
  const own = qc.getQueryData<Project>(keys.project(project.id));
  return own && Date.parse(own.updatedAt) > Date.parse(project.updatedAt) ? own : project;
}

/**
 * One project write, with what every project write does after it: the answer goes into the cache, and a refusal is said
 * in a toast. A success says nothing: the screen already shows it. Resolves to the stored project, or to null when the
 * write did not happen. A stale write reads the project again, and never writes over the newer version.
 */
export function useProjectMutation(opts: {
  /** Hears a failure before it is reported. */
  onError?: (e: unknown) => void;
} = {}): { update(project: Project, changes: ProjectChanges): Promise<Project | null>; busy: boolean } {
  const { api } = useProjectsBase();
  const qc = useQueryClient();
  const toast = useToast();
  const tr = useT();
  const [pending, setPending] = useState(0);
  const onError = useRef(opts.onError);
  onError.current = opts.onError;

  const update = useCallback(async (project: Project, changes: ProjectChanges): Promise<Project | null> => {
    setPending((n) => n + 1);
    try {
      const saved = await api.updateProject(freshestProject(qc, project), changes);
      qc.setQueryData(keys.project(saved.id), saved);
      void qc.invalidateQueries({ queryKey: ['projects'] });
      if (changes.status !== undefined) {
        void qc.invalidateQueries({ queryKey: ['board'] });
        void qc.invalidateQueries({ queryKey: keys.mywork });
      }
      return saved;
    } catch (e) {
      onError.current?.(e);
      if (isProjectsError(e, 'stale')) {
        void qc.invalidateQueries({ queryKey: keys.project(project.id) });
        void qc.invalidateQueries({ queryKey: ['projects'] });
        toast({ kind: 'info', text: tr('projectStale') });
      } else if (isProjectsError(e, 'not_found') || isProjectsError(e, 'forbidden')) {
        void qc.invalidateQueries({ queryKey: keys.project(project.id) });
        toast({ kind: 'error', text: tr('refusedAccess') });
      } else if (isProjectsError(e, 'offline')) {
        toast({ kind: 'error', text: tr('offlineLocked') });
      } else {
        if (!isProjectsError(e)) console.error(e);
        toast({ kind: 'error', text: refusalText(e, tr) || tr('saveFailed') });
      }
      return null;
    } finally {
      setPending((n) => n - 1);
    }
  }, [api, qc, toast, tr]);

  return { update, busy: pending > 0 };
}

const ALL_PROJECT_STATUSES: ProjectStatus[] = ['active', 'paused', 'closed'];

export interface CreateOutcome { project: Project; failed: { name: string; reason: string | null }[] }

/**
 * Creates a project, then its sections one by one, in order: the platform has no batch create. The first section
 * refused stops the rest, which it would most likely meet too, and the outcome names it with the server's reason and
 * every section after it with none. The project is kept, so `retry` creates only what is missing and a project is
 * never made twice: a second `run`, or one while a call is in flight, does not create another.
 *
 * A write lost to the network may still have landed. A project whose create answered nothing is looked for before it
 * is called a failure; when the list cannot be read then, the next press reads it and takes that project before it
 * creates anything. A retry after a section's create answered nothing first reads which sections exist.
 */
export function useCreateProject(): { run(input: NewProject, sections: TemplateSection[]): Promise<CreateOutcome>; retry(): Promise<CreateOutcome> } {
  const { api, viewer } = useProjects();
  const qc = useQueryClient();
  const tr = useT();
  const state = useRef<{
    project: Project | null; missing: (TemplateSection & { position: number })[]; inFlight: Promise<CreateOutcome> | null;
    /** The last section create answered nothing: it may have been stored. */
    unsure: boolean;
    /** A project create answered nothing and the list could not be read after it: the project may exist. */
    unsureProject: { input: NewProject; before: Set<string> } | null;
  }>({ project: null, missing: [], inFlight: null, unsure: false, unsureProject: null });

  const reasonOf = useCallback((e: unknown): string | null => {
    if (isProjectsError(e, 'offline')) return tr('offlineLocked');
    if (!isProjectsError(e)) console.error(e);
    return refusalText(e, tr);
  }, [tr]);

  const createSections = useCallback(async (project: Project): Promise<CreateOutcome> => {
    const s = state.current;
    const failedFrom = (e: unknown): CreateOutcome =>
      ({ project, failed: s.missing.map((m, i) => ({ name: m.name, reason: i === 0 ? reasonOf(e) : null })) });
    try {
      if (s.unsure) {
        let stored: Section[];
        try {
          stored = await api.sections(project.id);
        } catch (e) {
          return failedFrom(e);
        }
        s.missing = s.missing.filter((m) => !stored.some((x) => x.name === m.name && x.position === m.position));
        s.unsure = false;
      }
      while (s.missing.length > 0) {
        const next = s.missing[0]!;
        try {
          await api.createSection(project.id, next.name, next.position, next.description || undefined);
        } catch (e) {
          s.unsure = isProjectsError(e, 'offline');
          return failedFrom(e);
        }
        s.missing.shift();
      }
      return { project, failed: [] };
    } finally {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: keys.sections(project.id) });
    }
  }, [api, qc, reasonOf]);

  const once = useCallback((work: () => Promise<CreateOutcome>): Promise<CreateOutcome> => {
    const s = state.current;
    if (s.inFlight) return s.inFlight;
    const call = work().finally(() => { s.inFlight = null; });
    s.inFlight = call;
    return call;
  }, []);

  const retry = useCallback((): Promise<CreateOutcome> => once(async () => {
    const project = state.current.project;
    if (!project) throw new Error('retry before any project was created');
    return createSections(project);
  }), [once, createSections]);

  /** A project this create made though its answer was lost: new since `before`, with this name, managed by the viewer. */
  const landed = useCallback((now: Project[], input: NewProject, before: Set<string>): Project | null =>
    now.find((pr) => !before.has(pr.id) && pr.name === input.name && pr.managers.includes(viewer.id)) ?? null, [viewer.id]);

  const run = useCallback((input: NewProject, sections: TemplateSection[]): Promise<CreateOutcome> => {
    if (state.current.project) return retry();
    return once(async () => {
      const s = state.current;
      const begin = (project: Project): Promise<CreateOutcome> => {
        s.unsureProject = null;
        s.project = project;
        s.missing = sections.map((m, i) => ({ ...m, position: (i + 1) * STEP }));
        return createSections(project);
      };
      // What the viewer could see before, so a project the lost answer made can be told from one that was there.
      let now: Project[] | null = null;
      try {
        now = await api.projects(ALL_PROJECT_STATUSES);
      } catch (e) {
        // There is no idempotency key on the create: with no list to compare against, a project an earlier lost
        // answer made, or this one makes, could not be found again, so nothing is created while the network is down.
        if (s.unsureProject || isProjectsError(e, 'offline')) throw e;
      }
      if (now && s.unsureProject) {
        const found = landed(now, s.unsureProject.input, s.unsureProject.before);
        s.unsureProject = null;
        if (found) return begin(found);
      }
      const before = now ? new Set(now.map((pr) => pr.id)) : null;
      let project: Project;
      try {
        project = await api.createProject(input);
      } catch (e) {
        if (isProjectsError(e, 'partial') && e.project) {
          // A follow-up write after the create failed: the project exists all the same.
          project = e.project;
        } else {
          if (!isProjectsError(e, 'offline') || !before) throw e;
          let after: Project[];
          try {
            after = await api.projects(ALL_PROJECT_STATUSES);
          } catch {
            s.unsureProject = { input, before };
            throw e;
          }
          const found = landed(after, input, before);
          if (!found) throw e;
          project = found;
        }
      }
      return begin(project);
    });
  }, [api, once, retry, createSections, landed]);

  return { run, retry };
}

/** The platform refuses a clearing delete whole: the deleter cannot edit every record it would change, or too many would change. */
export const isCascadeRefusal = (e: unknown): e is ProjectsError =>
  isProjectsError(e) && (e.code === 'ENTITY_RECORD_CASCADE_FORBIDDEN' || e.code === 'ENTITY_RECORD_CASCADE_TOO_LARGE');

export type LabelRemoval = { ok: true; cleared: number } | { ok: false; error: unknown };

/**
 * Sub-label writes, one at a time in the order they were asked: a second rename starts from the label the first one
 * stored, so it never meets a 409 the viewer caused. The cache takes a rename at once and the stored answer after it; a
 * refusal reads the labels again, so the page shows what the server holds. A delete that goes through reads again every
 * task, because the tasks that used the label lost it. A delete the platform refuses whole is the caller's to show.
 */
export function useLabelWrites(): {
  create(name: string, baseStatus: Status): Promise<TaskLabel | null>;
  rename(label: TaskLabel, name: string): Promise<TaskLabel | null>;
  remove(label: TaskLabel): Promise<LabelRemoval>;
} {
  const { api } = useProjectsBase();
  const qc = useQueryClient();
  const toast = useToast();
  const tr = useT();
  const tail = useRef<Promise<unknown>>(Promise.resolve());
  /** The name last asked for, per label, until the write that stores it has answered. */
  const wanted = useRef(new Map<string, string>());

  const serial = useCallback(<T,>(work: () => Promise<T>): Promise<T> => {
    const run = tail.current.then(work);
    tail.current = run.catch(() => undefined);
    return run;
  }, []);
  const latest = useCallback((label: TaskLabel): TaskLabel | null =>
    qc.getQueryData<TaskLabel[]>(keys.labels)?.find((l) => l.id === label.id) ?? null, [qc]);
  const reread = useCallback(() => { void qc.invalidateQueries({ queryKey: keys.labels }); }, [qc]);

  const report = useCallback((e: unknown) => {
    reread();
    if (isProjectsError(e, 'stale')) toast({ kind: 'info', text: tr('labelUpdatedElsewhere') });
    else if (isProjectsError(e, 'not_found')) toast({ kind: 'error', text: tr('labelGone') });
    else if (isProjectsError(e, 'offline')) toast({ kind: 'error', text: tr('offlineLocked') });
    else {
      if (!isProjectsError(e)) console.error(e);
      toast({ kind: 'error', text: refusalText(e, tr) || tr('saveFailed') });
    }
  }, [reread, toast, tr]);

  const create = useCallback((name: string, baseStatus: Status): Promise<TaskLabel | null> => serial(async () => {
    try {
      const saved = await api.createLabel(name, baseStatus);
      qc.setQueryData<TaskLabel[]>(keys.labels, (list) => (list && !list.some((l) => l.id === saved.id) ? [...list, saved] : list));
      reread();
      return saved;
    } catch (e) {
      report(e);
      return null;
    }
  }), [api, qc, serial, reread, report]);

  const rename = useCallback((label: TaskLabel, name: string): Promise<TaskLabel | null> => {
    wanted.current.set(label.id, name);
    qc.setQueryData<TaskLabel[]>(keys.labels, (list) => list?.map((l) => (l.id === label.id ? { ...l, name } : l)));
    const settle = () => { if (wanted.current.get(label.id) === name) wanted.current.delete(label.id); };
    return serial(async () => {
      const current = latest(label);
      if (!current) return null;
      try {
        const saved = await api.updateLabel(current, { name });
        settle();
        // A rename asked for since keeps showing; this answer brings only the version it must be followed from.
        const next = wanted.current.get(label.id);
        qc.setQueryData<TaskLabel[]>(keys.labels, (list) => list?.map((l) => (l.id === saved.id ? { ...saved, name: next ?? saved.name } : l)));
        return saved;
      } catch (e) {
        settle();
        report(e);
        return null;
      }
    });
  }, [api, qc, serial, latest, report]);

  const remove = useCallback((label: TaskLabel): Promise<LabelRemoval> => serial(async (): Promise<LabelRemoval> => {
    try {
      const { cleared } = await api.deleteLabel(latest(label) ?? label);
      qc.setQueryData<TaskLabel[]>(keys.labels, (list) => list?.filter((l) => l.id !== label.id));
      reread();
      for (const queryKey of [['task'], ['board'], keys.mywork]) void qc.invalidateQueries({ queryKey });
      return { ok: true, cleared };
    } catch (e) {
      if (!isCascadeRefusal(e)) report(e);
      return { ok: false, error: e };
    }
  }), [api, qc, serial, latest, reread, report]);

  return { create, rename, remove };
}

/**
 * A task's comments, newest page. A task whose entity takes no comments (an older package, or a ceiling without them)
 * answers a refusal that is not retried and that the section reads as "nothing to show".
 */
export function useComments(taskId: string) {
  const { api } = useProjectsBase();
  return useQuery({
    queryKey: keys.comments(taskId),
    queryFn: () => api.comments(taskId),
    refetchInterval: usePoll(),
  });
}
