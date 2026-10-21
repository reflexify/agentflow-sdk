import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface AutopilotAccess {
  /** The server has refused a change to a rule: this person can't save one, so the modes are shown as labels. */
  refused: boolean;
  refuse(): void;
}

const AutopilotAccessContext = createContext<AutopilotAccess | null>(null);

/**
 * Held by the desk, not by the Autopilot screen, so a refusal lasts for the session: the person who has been told
 * they can't change a rule isn't offered the switches again by leaving the screen and coming back.
 */
export function AutopilotAccessProvider({ children }: { children: ReactNode }) {
  const [refused, setRefused] = useState(false);
  const value = useMemo(() => ({ refused, refuse: () => setRefused(true) }), [refused]);
  return <AutopilotAccessContext.Provider value={value}>{children}</AutopilotAccessContext.Provider>;
}

export function useAutopilotAccess(): AutopilotAccess {
  const access = useContext(AutopilotAccessContext);
  if (!access) throw new Error('outside AutopilotAccessProvider');
  return access;
}
