import { createContext, useContext } from 'react';
import type { KeyScope } from '../keys/KeyboardProvider.js';
import type { DeskLocation } from './RouteContext.js';

/** What the desk's shell takes from whoever mounts it. */
export interface DeskShell {
  /** Where the desk is in the address bar, which its host owns. */
  location: DeskLocation;
  /** Where the desk hears keys. */
  keyScope: KeyScope;
  /** Ends the session, on the desk's own site only. The rail offers "Sign out" only when it is given. */
  signOut?: () => void;
}

export const DeskShellContext = createContext<DeskShell | null>(null);

export function useDeskShell(): DeskShell {
  const shell = useContext(DeskShellContext);
  if (!shell) throw new Error('outside DeskShellContext');
  return shell;
}
