export type Folder = 'mine' | 'unclaimed' | 'mentions' | 'waiting' | 'open';
export const FOLDERS: readonly Folder[] = ['mine', 'unclaimed', 'mentions', 'waiting', 'open'];

export type Route =
  | { screen: 'queue'; folder: Folder; ticketId: string | null }
  | { screen: 'held' }
  | { screen: 'autopilot' }
  | { screen: 'contacts' }
  | { screen: 'contact'; id: string };

const HOME: Route = { screen: 'queue', folder: 'mine', ticketId: null };
const isFolder = (v: string | undefined): v is Folder => (FOLDERS as readonly string[]).includes(v ?? '');

/** The screen a desk path names. Only its pathname counts: a query or a fragment never changes the screen. */
export function parseRoute(path: string): Route {
  const pathname = path.replace(/[?#][\s\S]*$/, '');
  let segments: string[];
  try {
    segments = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return HOME; // an address with a stray %, typed or mangled by a mail client
  }
  const [a, b, c, d] = segments;
  if (a === undefined) return HOME;
  if (a === 'f' && isFolder(b)) {
    if (c === undefined) return { screen: 'queue', folder: b, ticketId: null };
    if (c === 't' && d) return { screen: 'queue', folder: b, ticketId: d };
  }
  if (a === 'held' && b === undefined) return { screen: 'held' };
  if (a === 'autopilot' && b === undefined) return { screen: 'autopilot' };
  if (a === 'contacts') return b ? { screen: 'contact', id: b } : { screen: 'contacts' };
  return HOME;
}

export function routePath(route: Route): string {
  switch (route.screen) {
    case 'queue':
      return `/f/${route.folder}${route.ticketId ? `/t/${encodeURIComponent(route.ticketId)}` : ''}`;
    case 'contact':
      return `/contacts/${encodeURIComponent(route.id)}`;
    default:
      return `/${route.screen}`;
  }
}
