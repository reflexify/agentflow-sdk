/** The package version, stamped on every element and kit class. A test keeps it equal to package.json. */
export const VERSION = '0.12.0';

/** Whether a version a registered class carries is older than `ours`; a class with none counts as older. */
export function isOlder(theirs: unknown, ours: string): boolean {
  if (typeof theirs !== 'string') return true;
  const a = theirs.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const b = ours.split('.').map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0);
  return false;
}
