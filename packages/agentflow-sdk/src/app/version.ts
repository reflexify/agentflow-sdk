const VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

interface Parsed {
  core: number[];
  pre: string[];
}

function parse(s: string): Parsed {
  const m = typeof s === 'string' ? VERSION.exec(s) : null;
  const core = m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [];
  if (!m || !core.every(Number.isSafeInteger)) throw new TypeError(`not a version: ${s}`);
  return { core, pre: m[4] ? m[4].split('.') : [] };
}

const NUMERIC = /^\d+$/;

function compareIdentifier(a: string, b: string): number {
  const an = NUMERIC.test(a);
  const bn = NUMERIC.test(b);
  if (an && bn) return Math.sign(Number(a) - Number(b));
  if (an) return -1;
  if (bn) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** SemVer 2.0 precedence: negative, zero or positive. Throws a TypeError on a string that is not a version. */
export function compareVersions(a: string, b: string): number {
  const x = parse(a);
  const y = parse(b);
  for (let i = 0; i < 3; i++) {
    if (x.core[i] !== y.core[i]) return x.core[i] < y.core[i] ? -1 : 1;
  }
  if (x.pre.length === 0 || y.pre.length === 0) return Math.sign(y.pre.length - x.pre.length);
  for (let i = 0; i < Math.min(x.pre.length, y.pre.length); i++) {
    const c = compareIdentifier(x.pre[i], y.pre[i]);
    if (c !== 0) return c;
  }
  return Math.sign(x.pre.length - y.pre.length);
}
