import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useKeys } from '../keys/KeyboardProvider.js';
import { useRoute } from '../shell/RouteContext.js';
import { useNextTicket } from './useQueue.js';

type NextTicketControl = ReturnType<typeof useNextTicket>;
const NextTicketContext = createContext<NextTicketControl | null>(null);

/**
 * "Next ticket" and its key, ⇧N, for the whole desk: the queue pane that shows the button goes away when
 * the queue is clear, and the key is still wanted on Held messages, Autopilot and Contacts.
 */
export function NextTicketProvider({ children }: { children: ReactNode }) {
  const control = useNextTicket();
  const route = useRoute();
  useKeys({ claimNext: () => void control.next() });
  // What it said belongs to the screen it was said on.
  const { dismiss } = control;
  useEffect(() => dismiss(), [route, dismiss]);
  return <NextTicketContext.Provider value={control}>{children}</NextTicketContext.Provider>;
}

export function useNextTicketControl(): NextTicketControl {
  const control = useContext(NextTicketContext);
  if (!control) throw new Error('outside NextTicketProvider');
  return control;
}

/** Why "Next ticket" did nothing, when it did nothing. */
export function NextTicketNotice() {
  const { message } = useNextTicketControl();
  return message ? <div className="banner info" role="status">{message}</div> : null;
}
