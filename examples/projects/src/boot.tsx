import { parseProjectIds, ProjectIdsError, type ProjectIds } from './shared/app-objects.js';

/** What the site's server tells the page: where the SDK routes are, which objects are Projects', and where AgentFlow's own pages are. */
export interface SiteConfig {
  basePath: string;
  ids: ProjectIds;
  agentflowUrl: string;
}

export type Boot =
  | { mode: 'demo' }
  | { mode: 'no-config' }
  | { mode: 'signed-out'; basePath: string }
  | { mode: 'ready'; config: SiteConfig };

function httpUrl(text: string): boolean {
  try {
    const { protocol } = new URL(text);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** The config the page can use, or null for anything else: the server is down, has none, or a dev server answered with its page. */
function readSiteConfig(body: unknown): SiteConfig | null {
  if (typeof body !== 'object' || body === null) return null;
  const { basePath, ids, agentflowUrl } = body as Record<string, unknown>;
  if (typeof basePath !== 'string' || !basePath.startsWith('/') || typeof agentflowUrl !== 'string' || !httpUrl(agentflowUrl)) return null;
  try {
    return { basePath: basePath.replace(/\/+$/, ''), ids: parseProjectIds(ids), agentflowUrl };
  } catch (error) {
    if (error instanceof ProjectIdsError) return null;
    throw error;
  }
}

/**
 * What this page is: the demo, a site whose server has no usable config, a site whose visitor must sign in, or the site
 * ready to mount. Never rejects.
 */
export async function boot(location: Pick<Location, 'search'>, get: typeof fetch = fetch): Promise<Boot> {
  if (import.meta.env.VITE_PROJECTS_DEMO === '1' || new URLSearchParams(location.search).has('demo')) return { mode: 'demo' };
  const response = await get('/site/config.json', { cache: 'no-store' }).catch(() => null);
  const config = response?.ok ? readSiteConfig(await response.json().catch(() => null)) : null;
  if (!config) return { mode: 'no-config' };
  const session = await get(`${config.basePath}/session`, { cache: 'no-store' })
    .then((r) => r.json() as Promise<{ signedIn?: unknown }>)
    .catch(() => ({ signedIn: false }));
  return session.signedIn === true ? { mode: 'ready', config } : { mode: 'signed-out', basePath: config.basePath };
}
