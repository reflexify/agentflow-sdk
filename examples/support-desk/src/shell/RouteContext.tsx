import type { AppHost } from '@reflexify/agentflow-sdk';
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { parseRoute, routePath, type Route } from './route.js';

/** Where the desk is. The host owns the address bar: the desk reads it and moves it only through this. */
export interface DeskLocation {
  /** The desk's path under its host's base path: pathname, query and fragment. */
  path(): string;
  subscribe(listener: () => void): () => void;
  navigate(path: string): void;
}

/** The host's location as a store React reads: one subscription to the host, which `close` releases. */
export function hostLocation(host: Pick<AppHost, 'navigate' | 'onLocationChange'>): DeskLocation & { close(): void } {
  let current = '/';
  const listeners = new Set<() => void>();
  const tell = () => {
    for (const listener of [...listeners]) listener();
  };
  // The host calls at once with where the desk is, so the first render already shows the right screen.
  const stop = host.onLocationChange((path) => {
    if (path === current) return;
    current = path;
    tell();
  });
  return {
    path: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    navigate(path) {
      // Shown at once, without waiting for the host to report the move. A host that does report it (AgentFlow's does,
      // at once, and drops its router's later report of the same path) reports this same path, which changes nothing.
      current = path;
      tell();
      host.navigate(path);
    },
    close() {
      stop();
      listeners.clear();
    },
  };
}

type Navigate = (route: Route) => void;
const RouteContext = createContext<{ route: Route; navigate: Navigate } | null>(null);

export function RouteProvider({ location, children }: { location: DeskLocation; children: ReactNode }) {
  const path = useSyncExternalStore(location.subscribe, location.path);
  const route = useMemo(() => parseRoute(path), [path]);
  const navigate = useCallback<Navigate>((next) => location.navigate(routePath(next)), [location]);
  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

function useRouteContext() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('outside RouteProvider');
  return ctx;
}
export const useRoute = () => useRouteContext().route;
export const useNavigate = () => useRouteContext().navigate;
