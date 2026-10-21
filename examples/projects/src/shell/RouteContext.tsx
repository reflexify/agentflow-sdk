import type { AppHost } from '@reflexify/agentflow-sdk';
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { parseRoute, type Route } from './route.js';

/** Where the module is. The host owns the address bar: the module reads it and moves it only through this. */
export interface ModuleLocation {
  /** The module's path under its host's base path: pathname and query. */
  current(): string;
  subscribe(listener: () => void): () => void;
  navigate(path: string): void;
  /** The address-bar `href` of a module path, for a real link; without one, the path itself. */
  href?(path: string): string;
}

/** The host's location as a store React reads: one subscription to the host, which `close` releases. */
export function hostLocation(host: Pick<AppHost, 'navigate' | 'onLocationChange' | 'basePath'>): ModuleLocation & { close(): void; href(path: string): string } {
  let current = '/';
  const listeners = new Set<() => void>();
  const tell = () => {
    for (const listener of [...listeners]) listener();
  };
  // The host calls at once with where the module is, so the first render already shows the right screen.
  const stop = host.onLocationChange((path) => {
    if (path === current) return;
    current = path;
    tell();
  });
  return {
    current: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    navigate(path) {
      // Shown at once, without waiting for the host to report the move; a host that reports it reports this same path.
      current = path;
      tell();
      host.navigate(path);
    },
    href(path) {
      const base = host.basePath.replace(/\/+$/, '');
      return base ? `${base}${path === '/' ? '' : path}` || '/' : path;
    },
    close() {
      stop();
      listeners.clear();
    },
  };
}

const RouteContext = createContext<{ route: Route; navigate: (path: string) => void; href: (path: string) => string } | null>(null);

export function RouteProvider({ location, children }: { location: ModuleLocation; children: ReactNode }) {
  const path = useSyncExternalStore(location.subscribe, location.current);
  const route = useMemo(() => parseRoute(path), [path]);
  const value = useMemo(() => ({
    route,
    navigate: (next: string) => location.navigate(next),
    href: (next: string) => location.href?.(next) ?? next,
  }), [route, location]);
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

function useRouteContext() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('outside RouteProvider');
  return ctx;
}
export const useRoute = (): Route => useRouteContext().route;
export const useNavigate = (): ((path: string) => void) => useRouteContext().navigate;
export const useHref = (): ((path: string) => string) => useRouteContext().href;
