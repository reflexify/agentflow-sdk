import { isObject } from "../core.js";

function equal(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => equal(item, b[i]));
  }
  if (isObject(a) || isObject(b)) {
    if (!isObject(a) || !isObject(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key]));
  }
  return a === b;
}

// The pack route writes a manifest's objects and grants sorted by key, where the builder orders them by kind.
function objectsAndGrantsByKey(manifest: unknown): unknown {
  if (!isObject(manifest)) return manifest;
  const out: Record<string, unknown> = { ...manifest };
  for (const member of ["objects", "grants"]) {
    const list = manifest[member];
    if (!Array.isArray(list)) continue;
    const keyOf = (entry: unknown): string => (isObject(entry) && typeof entry.key === "string" ? entry.key : "");
    out[member] = [...list].sort((x, y) => (keyOf(x) < keyOf(y) ? -1 : keyOf(x) > keyOf(y) ? 1 : 0));
  }
  return out;
}

function parsed(bytes: Buffer): { value: unknown } | undefined {
  try {
    return { value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    return undefined;
  }
}

function same(file: string, a: Buffer, b: Buffer): boolean {
  if (file.startsWith("ui/")) return a.equals(b);
  const x = parsed(a);
  const y = parsed(b);
  if (!x || !y) return a.equals(b);
  if (file === "manifest.json") return equal(objectsAndGrantsByKey(x.value), objectsAndGrantsByKey(y.value));
  return equal(x.value, y.value);
}

// Every path in either set of package files where the two differ: a file only one holds, a ui/ file whose
// bytes differ, or a file whose JSON value differs, member order aside.
export function compareDraft(draft: Map<string, Buffer>, built: Map<string, Buffer>): string[] {
  const paths = [...new Set([...draft.keys(), ...built.keys()])].sort();
  return paths.filter((file) => {
    const a = draft.get(file);
    const b = built.get(file);
    return !a || !b || !same(file, a, b);
  });
}

const SHOWN_POINTERS = 5;

const escaped = (key: string): string => key.replace(/~/g, "~0").replace(/\//g, "~1");

function pointersDiffering(a: unknown, b: unknown, pointer: string, out: string[]): void {
  if (equal(a, b)) return;
  if (isObject(a) && isObject(b)) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      pointersDiffering(a[key], b[key], `${pointer}/${escaped(key)}`, out);
    }
  } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    a.forEach((item, i) => pointersDiffering(item, b[i], `${pointer}/${i}`, out));
  } else {
    out.push(pointer === "" ? "/" : pointer);
  }
}

// One line per file `compareDraft` reports, saying where it differs: the JSON Pointers of the members
// (at most a handful, then "and N more"), or that only one side has the file, or that bytes differ.
export function describeDifferences(draft: Map<string, Buffer>, built: Map<string, Buffer>): string[] {
  return compareDraft(draft, built).map((file) => {
    const a = draft.get(file);
    const b = built.get(file);
    if (!a) return `${file} (the draft does not have it, the build writes it)`;
    if (!b) return `${file} (the draft has it, the build does not write it)`;
    const x = parsed(a);
    const y = parsed(b);
    if (file.startsWith("ui/") || !x || !y) return `${file} (bytes differ)`;
    const [left, right] = file === "manifest.json" ? [objectsAndGrantsByKey(x.value), objectsAndGrantsByKey(y.value)] : [x.value, y.value];
    const pointers: string[] = [];
    pointersDiffering(left, right, "", pointers);
    const shown = pointers.slice(0, SHOWN_POINTERS).map((p) => `${file}#${p}`).join(", ");
    return pointers.length > SHOWN_POINTERS ? `${shown} and ${pointers.length - SHOWN_POINTERS} more` : shown;
  });
}
