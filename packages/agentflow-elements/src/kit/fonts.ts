export interface KitFontFace { family: string; url: string; descriptors?: FontFaceDescriptors }

interface Registry { faces: Map<string, Promise<void>>; ours: WeakSet<FontFace> }

// On globalThis, not in this module: every module bundles its own copy of the kit, and a face must be added once per page.
// Every kit copy on a page reads this shape, so a later version may add members but never change these two.
const REGISTRY = Symbol.for('@reflexify/agentflow-elements/kit/fonts');

function registry(): Registry {
  const g = globalThis as Record<symbol, Registry | undefined>;
  return (g[REGISTRY] ??= { faces: new Map(), ours: new WeakSet() });
}

function familyName(family: string): string {
  return family.trim().replace(/^(["'])(.*)\1$/, '$2').trim().toLowerCase();
}

function keyOf(face: KitFontFace): string {
  const descriptors = Object.entries(face.descriptors ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify([face.family, face.url, descriptors]);
}

function warn(face: KitFontFace, error: unknown): void {
  console.warn("A font face did not load; text falls back to the module's font stack.", { family: face.family, url: face.url, error: String(error) });
}

/**
 * Registers each face on `document.fonts`, which a shadow root shares, because a shadow root ignores `@font-face`. A face is
 * added once per page, keyed by family, url and descriptors; a family the host already provides is left alone. Resolves when
 * the faces have loaded. A face that fails is one warning and never a rejection: text falls back to the module's font stack.
 */
export function loadFonts(faces: readonly KitFontFace[]): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts || typeof FontFace === 'undefined') return Promise.resolve();
  const { faces: added, ours } = registry();
  const pending = faces.map((face) => {
    const key = keyOf(face);
    const known = added.get(key);
    if (known) return known;
    const family = familyName(face.family);
    for (const existing of document.fonts) {
      if (!ours.has(existing) && familyName(existing.family) === family) return Promise.resolve();
    }
    let loaded: Promise<void>;
    try {
      const font = new FontFace(face.family, `url(${JSON.stringify(face.url)})`, face.descriptors);
      document.fonts.add(font);
      ours.add(font);
      loaded = font.load().then(() => undefined, (error: unknown) => warn(face, error));
    } catch (error) {
      warn(face, error);
      loaded = Promise.resolve();
    }
    added.set(key, loaded);
    return loaded;
  });
  return Promise.all(pending).then(() => undefined);
}
