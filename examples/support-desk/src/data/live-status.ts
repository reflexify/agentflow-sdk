import type { RealtimeStatus } from '@reflexify/agentflow-sdk';
import { createContext, useContext } from 'react';
import { POLL_MS } from '../model/timing.js';

export type LiveStatus = RealtimeStatus;

/** The live provider sets this; without one the desk polls. */
export const LiveStatusContext = createContext<LiveStatus>('polling');

export function usePollInterval(): number | false {
  return useContext(LiveStatusContext) === 'live' ? false : POLL_MS;
}
