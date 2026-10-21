import { useCallback, useMemo } from 'react';
import { useProjects } from '../data/context.js';
import { useBoard, useProject, useSections } from '../data/hooks.js';
import { columnsFor, defaultGroup, type Column } from '../model/grouping.js';
import type { GroupBy, Project, Section } from '../model/types.js';
import type { Query } from '../shell/route.js';

export interface BoardData {
  state: 'loading' | 'error' | 'ready';
  error?: unknown;
  project?: Project;
  sections: Section[];
  groupBy: GroupBy;
  columns: Column[];
  /** The board holds only the first tasks the server returned. */
  truncated: boolean;
  retry(): void;
}

const NO_SECTIONS: Section[] = [];

/** What the Tasks tab shows of `projectId` under the address's choices: the board and the list read the same. */
export function useBoardData(projectId: string, query: Query): BoardData {
  const { people, today } = useProjects();
  const project = useProject(projectId);
  const sections = useSections(projectId);
  const scope = useMemo(() => ({ project: projectId, done: query.done, cancelled: query.cancelled }), [projectId, query.done, query.cancelled]);
  const board = useBoard(scope);

  const sectionList = sections.data ?? NO_SECTIONS;
  // A project with no grouping of its own is grouped by whether it has sections, so that waits for them.
  const groupBy: GroupBy = query.group
    ?? project.data?.defaultGroupBy
    ?? (project.data && sections.data ? defaultGroup(project.data, sections.data) : 'status');

  const tasks = board.data?.tasks;
  const columns = useMemo(
    () => (tasks && sections.data ? columnsFor(groupBy, tasks, { sections: sections.data, people, today, showCancelled: query.cancelled }) : []),
    [groupBy, tasks, sections.data, people, today, query.cancelled],
  );

  const reads = [project, sections, board] as const;
  // A read that has data keeps showing it while a refetch fails; only a read with nothing to show is an error.
  const failed = reads.find((r) => r.isError && !r.data);
  const state = failed ? 'error' : project.data && sections.data && board.data ? 'ready' : 'loading';

  const { refetch: refetchProject } = project;
  const { refetch: refetchSections } = sections;
  const { refetch: refetchBoard } = board;
  const projectFailed = project.isError;
  const sectionsFailed = sections.isError;
  const boardFailed = board.isError;
  const retry = useCallback(() => {
    if (projectFailed) void refetchProject();
    if (sectionsFailed) void refetchSections();
    if (boardFailed) void refetchBoard();
  }, [projectFailed, sectionsFailed, boardFailed, refetchProject, refetchSections, refetchBoard]);

  return {
    state,
    ...(failed ? { error: failed.error } : {}),
    ...(project.data ? { project: project.data } : {}),
    sections: sectionList,
    groupBy,
    columns,
    truncated: board.data?.truncated ?? false,
    retry,
  };
}
