import { define, reportOlder, type Compiled } from './define.js';
import { KIT_VERSION } from './kit/version.js';

/**
 * Defines one kit tag these elements draw, loading its code the first time it is asked for. A page whose own kit registered
 * the tag keeps its copy, and then nothing is loaded.
 */
export async function defineKitTag(tag: string, load: () => Promise<{ default: unknown }>, registry: CustomElementRegistry = customElements): Promise<void> {
  const existing = registry.get(tag);
  if (existing) return reportOlder(tag, existing, 'kitVersion', KIT_VERSION, 'UI kit');
  const component = (await load()).default as Compiled;
  // The kit's own entry stamps the same class the same way, whichever of the two loads first.
  Object.defineProperty(component.element, 'kitVersion', { value: KIT_VERSION });
  // Asked again: the page's kit may have registered the tag while this copy was on its way.
  define(registry, { [tag]: component }, 'kitVersion', KIT_VERSION, 'UI kit');
}
