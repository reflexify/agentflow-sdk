import { isOlder } from './version.js';

export type Compiled = { element: CustomElementConstructor };
type Stamp = 'elementsVersion' | 'kitVersion';

// The copies already reported, so a page is told once however often a tag is asked for.
const reported = new WeakSet<CustomElementConstructor>();

/** Reports a copy of `tag` that another, older copy of this package registered first. The page keeps that copy. */
export function reportOlder(tag: string, existing: CustomElementConstructor, stamp: Stamp, loaded: string, name: string): void {
  const theirs = (existing as { elementsVersion?: unknown; kitVersion?: unknown })[stamp];
  if (!isOlder(theirs, loaded) || reported.has(existing)) return;
  reported.add(existing);
  console.warn(`An older copy of the AgentFlow ${name} registered ${tag} first; this page uses it, not this copy.`, { tag, registered: theirs ?? null, loaded });
}

/** Defines each tag that is not defined yet, and leaves one another copy registered first. */
export function define(registry: CustomElementRegistry, tags: Record<string, Compiled>, stamp: Stamp, loaded: string, name: string): void {
  for (const [tag, component] of Object.entries(tags)) {
    const existing = registry.get(tag);
    if (!existing) registry.define(tag, component.element);
    else if (existing !== component.element) reportOlder(tag, existing, stamp, loaded, name);
  }
}
