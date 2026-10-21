export type KeyAction =
  | 'next' | 'prev' | 'open' | 'claimNext' | 'reply' | 'note' | 'saved'
  | 'solved' | 'waiting' | 'escalate' | 'send' | 'sendWaiting' | 'shorter'
  | 'palette' | 'help' | 'escape' | 'goMine' | 'goUnclaimed' | 'goHeld';

export interface KeyLike { key: string; code?: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }

const SINGLE: Record<string, KeyAction> = {
  j: 'next', k: 'prev', Enter: 'open', r: 'reply', n: 'note', '/': 'saved',
  s: 'solved', w: 'waiting', e: 'escalate', '?': 'help',
};
const AFTER_G: Record<string, KeyAction> = { m: 'goMine', u: 'goUnclaimed', h: 'goHeld' };

/** The desk's keyboard map (plan decision 13). `'g'` means "wait for the next key". */
export function keyAction(e: KeyLike, ctx: { typing: boolean; afterG: boolean }): KeyAction | 'g' | null {
  const mod = e.metaKey || e.ctrlKey;
  if (e.key === 'Escape') return 'escape';
  if (mod && e.key === 'Enter') return e.shiftKey ? 'sendWaiting' : 'send';
  if (mod && e.key.toLowerCase() === 'k') return 'palette';
  if (e.altKey && !mod && e.code === 'KeyS') return 'shorter';
  if (ctx.typing || mod || e.altKey) return null;
  if (ctx.afterG) return AFTER_G[e.key.toLowerCase()] ?? null;
  if (e.key === 'g') return 'g';
  if (e.shiftKey && e.key === 'N') return 'claimNext';
  return SINGLE[e.key] ?? null;
}
