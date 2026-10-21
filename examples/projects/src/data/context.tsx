import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isProjectsError, type ProjectsApi } from '../api/projects-api.js';
import { msUntilNextDay, todayIn, viewerTimeZone } from '../model/dates.js';
import type { Person, TaskLabel, Viewer } from '../model/types.js';
import { useLive } from '../live/LiveProvider.js';
import type { ProjectIds } from '../shared/app-objects.js';
import { ErrorState, Loading } from '../shell/States.js';
import { t, type Lang, type TextKey } from '../text.js';
import { useLabels, usePeople, useViewer } from './hooks.js';

interface Base {
  api: ProjectsApi;
  ids: ProjectIds;
  lang: Lang;
  /** An address on AgentFlow's own origin, for a link the browser follows. */
  agentflowUrl: (path: string) => string;
}

export interface Projects extends Base {
  viewer: Viewer;
  people: Map<string, Person>;
  labels: TaskLabel[];
  online: boolean;
  /** The viewer's calendar day, `YYYY-MM-DD`. */
  today: string;
}

const BaseContext = createContext<Base | null>(null);
const LoadedContext = createContext<{ viewer: Viewer; people: Map<string, Person>; labels: TaskLabel[]; today: string } | null>(null);

/**
 * The API, the ids and the language, and below them, once they have loaded, who the viewer is, the people and the
 * sub-labels: everything a screen reads on every render.
 */
export function ProjectsProvider(props: {
  api: ProjectsApi;
  ids: ProjectIds;
  lang: Lang;
  agentflowUrl: (path: string) => string;
  /** Tests turn retries off so a failure shows at once. */
  retry?: boolean;
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        // A refusal is an answer, not a failure: asking again changes nothing.
        retry: props.retry === false ? false : (count, e) =>
          count < 2 && !isProjectsError(e, 'signed_out') && !isProjectsError(e, 'forbidden') && !isProjectsError(e, 'not_found'),
      },
    },
  }));
  // The cache holds what the viewer may read; nothing of it outlives the module.
  useEffect(() => () => queryClient.clear(), [queryClient]);
  const value = useMemo<Base>(
    () => ({ api: props.api, ids: props.ids, lang: props.lang, agentflowUrl: props.agentflowUrl }),
    [props.api, props.ids, props.lang, props.agentflowUrl],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <BaseContext.Provider value={value}>
        <Loaded>{props.children}</Loaded>
      </BaseContext.Provider>
    </QueryClientProvider>
  );
}

/** The viewer's calendar day, which turns at their midnight whether or not anything renders then. */
function useToday(): string {
  const [today, setToday] = useState(() => todayIn(viewerTimeZone()));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      // Read again when it fires: a clock change or a daylight-saving shift can move the day's end meanwhile.
      timer = setTimeout(() => {
        setToday(todayIn(viewerTimeZone()));
        next();
      }, msUntilNextDay(viewerTimeZone()));
    };
    next();
    return () => clearTimeout(timer);
  }, []);
  return today;
}

function Loaded({ children }: { children: ReactNode }) {
  const today = useToday();
  const viewer = useViewer();
  const people = usePeople();
  const labels = useLabels();
  const byId = useMemo(() => new Map((people.data ?? []).map((p) => [p.id, p] as const)), [people.data]);
  const value = useMemo(
    () => (viewer.data && people.data && labels.data ? { viewer: viewer.data, people: byId, labels: labels.data, today } : null),
    [viewer.data, people.data, labels.data, byId, today],
  );
  const failed = [viewer, people, labels].find((q) => q.isError && !q.data);
  if (failed) {
    return <ErrorState error={failed.error} onRetry={() => [viewer, people, labels].forEach((q) => q.isError && void q.refetch())} />;
  }
  if (!value) return <Loading kind="rows" />;
  return <LoadedContext.Provider value={value}>{children}</LoadedContext.Provider>;
}

/** The API, ids and language, which a screen can read before the viewer has loaded. */
export function useProjectsBase(): Base {
  const base = useContext(BaseContext);
  if (!base) throw new Error('useProjectsBase outside ProjectsProvider');
  return base;
}

export function useProjects(): Projects {
  const base = useProjectsBase();
  const loaded = useContext(LoadedContext);
  const { online } = useLive();
  if (!loaded) throw new Error('useProjects outside ProjectsProvider');
  // One object while nothing in it changes, so a screen can list it in an effect's deps.
  return useMemo(() => ({ ...base, ...loaded, online }), [base, loaded, online]);
}

export function useT(): (key: TextKey, vars?: Record<string, string | number>) => string {
  const { lang } = useProjectsBase();
  return useCallback((key: TextKey, vars?: Record<string, string | number>) => t(lang, key, vars), [lang]);
}
