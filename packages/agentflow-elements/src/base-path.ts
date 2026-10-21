export const DEFAULT_BASE_PATH = '/agentflow';

// One leading slash, not two: after the origin, `@evil.example` or `.evil.example` names another
// host, and so does `//evil.example` as a relative URL.
const ONE_LEADING_SLASH = /^\/(?!\/)/;

// The URL parser also folds `/\host` and a tab or newline after the slash into `//host`, which
// the pattern alone lets through to signIn and signOut, so the path must resolve here as well.
function resolvesHere(path: string): boolean {
  try {
    return new URL(path, location.origin).origin === location.origin;
  } catch {
    return false;
  }
}

/** The base path to reach AgentFlow under, without trailing slashes; `/agentflow`, with one warning, for anything off this origin. */
export function basePathOf(value: string | null | undefined): string {
  if (value === undefined || value === null) return DEFAULT_BASE_PATH;
  if (ONE_LEADING_SLASH.test(value) && resolvesHere(value)) return value.replace(/\/+$/, '');
  console.warn(`agentflow: base-path ${JSON.stringify(value)} is not a path on this origin; using ${DEFAULT_BASE_PATH}.`);
  return DEFAULT_BASE_PATH;
}
