import type { DeskIds } from '../shared/contract.js';

export interface PublicConfig { basePath: string; ids: DeskIds }

export type Boot = { kind: 'demo' } | { kind: 'signed-out' } | { kind: 'ready'; config: PublicConfig } | { kind: 'no-config' };

function isPublicConfig(v: unknown): v is PublicConfig {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.basePath === 'string' && c.basePath.startsWith('/') && typeof c.ids === 'object' && c.ids !== null;
}

/** The desk's public config, or null when the server has none to give: it is down, not set up, or answered with a page (Vite's fallback is index.html with a 200). */
async function readConfig(): Promise<PublicConfig | null> {
  const res = await fetch('/support-desk/config.json').catch(() => null);
  if (!res?.ok) return null;
  const body: unknown = await res.json().catch(() => null);
  return isPublicConfig(body) ? body : null;
}

/** Demo mode, or the desk's config and whether this browser is signed in. */
export async function bootDesk(search: string, demoBuild: boolean): Promise<Boot> {
  if (demoBuild || new URLSearchParams(search).has('demo')) return { kind: 'demo' };
  const config = await readConfig();
  if (!config) return { kind: 'no-config' };
  const session = await fetch(`${config.basePath}/session`).then((r) => r.json() as Promise<{ signedIn: boolean }>).catch(() => ({ signedIn: false }));
  return session.signedIn ? { kind: 'ready', config } : { kind: 'signed-out' };
}
