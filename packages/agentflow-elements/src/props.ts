const warned = new Set<string>();

function refuse(name: string, value: unknown) {
  if (typeof value === 'string' && !warned.has(name)) {
    warned.add(name);
    console.warn(`agentflow: \`${name}\` is a property, not an attribute; set it from JavaScript.`);
  }
}

/** An object-valued prop, or undefined; a string (an attribute in markup) is ignored. */
export function objectProp<T extends object>(value: unknown, name: string): T | undefined {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) return value as T;
  refuse(name, value);
  return undefined;
}

/**
 * A page size the API accepts, 1 to 200. A removed attribute arrives as null, which a `$props`
 * default does not cover, so null, undefined and anything that is not a number mean 25.
 */
export function pageSizeProp(value: unknown): number {
  const size = value === null || value === undefined ? Number.NaN : Math.trunc(Number(value));
  return Number.isNaN(size) ? 25 : Math.min(200, Math.max(1, size));
}

/** A function-valued prop, or undefined; a string (an attribute in markup) is ignored. */
export function functionProp<T extends (...args: never[]) => unknown>(value: unknown, name: string): T | undefined {
  if (typeof value === 'function') return value as T;
  refuse(name, value);
  return undefined;
}
