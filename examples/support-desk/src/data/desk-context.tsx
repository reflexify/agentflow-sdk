import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DeskIds } from '../../shared/contract.js';
import { isDeskError, type DeskApi } from '../api/desk-api.js';
import { t, type Lang, type TextKey } from '../text.js';
import { watchSession } from './session.js';

interface Desk {
  api: DeskApi;
  ids: DeskIds;
  lang: Lang;
  demo: boolean;
  signedOut: boolean;
}

const DeskContext = createContext<Desk | null>(null);

export function DeskProvider(props: {
  api: DeskApi;
  ids: DeskIds;
  lang: Lang;
  demo?: boolean;
  /** Tests turn retries off so a failure shows at once. */
  retry?: boolean;
  queryClient?: QueryClient;
  children: ReactNode;
}) {
  const [signedOut, setSignedOut] = useState(false);
  const [queryClient] = useState(() => props.queryClient ?? new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        retry: props.retry === false ? false : (count, e) =>
          count < 2 && !isDeskError(e, 'signed_out') && !isDeskError(e, 'forbidden') && !isDeskError(e, 'not_found'),
      },
    },
  }));
  const api = useMemo(() => watchSession(props.api, () => setSignedOut(true)), [props.api]);
  const value = useMemo(
    () => ({ api, ids: props.ids, lang: props.lang, demo: props.demo ?? false, signedOut }),
    [api, props.ids, props.lang, props.demo, signedOut],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <DeskContext.Provider value={value}>{props.children}</DeskContext.Provider>
    </QueryClientProvider>
  );
}

export function useDesk(): Desk {
  const desk = useContext(DeskContext);
  if (!desk) throw new Error('useDesk outside DeskProvider');
  return desk;
}

export function useT() {
  const { lang } = useDesk();
  return (key: TextKey, vars?: Record<string, string | number>) => t(lang, key, vars);
}
