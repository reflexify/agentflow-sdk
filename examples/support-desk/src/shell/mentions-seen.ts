import { useSyncExternalStore } from 'react';

const key = (userId: string) => `support-desk:mentions-seen:${userId}`;
const listeners = new Set<() => void>();

export function mentionsSeenAt(userId: string): string {
  try {
    return window.localStorage.getItem(key(userId)) ?? '';
  } catch {
    return '';
  }
}

export function markMentionsSeen(userId: string, iso: string): void {
  try {
    window.localStorage.setItem(key(userId), iso);
  } catch {
    // Private windows may refuse storage; the count then stays.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab of the desk reading its mentions counts here too.
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/** `mentionsSeenAt`, kept current: the rail's count follows the person reading the mentions. */
export function useMentionsSeenAt(userId: string | null): string {
  return useSyncExternalStore(subscribe, () => (userId ? mentionsSeenAt(userId) : ''), () => '');
}
