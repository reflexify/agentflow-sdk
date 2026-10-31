import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadFonts } from '../../src/kit/fonts.js';

const REGISTRY = Symbol.for('@reflexify/agentflow-elements/kit/fonts');

/** Records what it was made with; `load` rejects for a source naming `missing`, and a weight a browser would not parse throws as one does. */
class FakeFontFace {
  constructor(readonly family: string, readonly source: string, readonly descriptors?: FontFaceDescriptors) {
    if (descriptors?.weight === 'heavy-ish') throw new SyntaxError(`invalid weight ${descriptors.weight}`);
  }
  load(): Promise<this> {
    return this.source.includes('missing') ? Promise.reject(new Error('NetworkError')) : Promise.resolve(this);
  }
}

let fonts: Set<FakeFontFace>;

beforeEach(() => {
  delete (globalThis as Record<symbol, unknown>)[REGISTRY];
  fonts = new Set();
  Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });
  vi.stubGlobal('FontFace', FakeFontFace);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('loadFonts', () => {
  it('adds a face once per page however often it is asked, and a second weight as its own face', async () => {
    const face = { family: 'Display', url: '/display.woff2' };
    await loadFonts([face, face]);
    await loadFonts([face]);
    await loadFonts([{ ...face, url: '/display-bold.woff2', descriptors: { weight: '700' } }]);
    expect([...fonts].map((f) => [f.family, f.descriptors?.weight])).toEqual([['Display', undefined], ['Display', '700']]);
  });

  it('shares what it added with another copy of the kit on the page', async () => {
    await loadFonts([{ family: 'Display', url: '/display.woff2' }]);
    vi.resetModules();
    const other = await import('../../src/kit/fonts.js');
    // The second copy must know the first copy's face is the kit's, not the host's: its new weight is added.
    await other.loadFonts([{ family: 'Display', url: '/display.woff2' }, { family: 'Display', url: '/display-bold.woff2', descriptors: { weight: '700' } }]);
    expect([...fonts].map((f) => f.descriptors?.weight)).toEqual([undefined, '700']);
  });

  it('skips a family the host provides, however it is spelled, and adds one it lacks', async () => {
    fonts.add(new FakeFontFace('Geist', 'url(/host.woff2)'));
    await loadFonts([{ family: '"geist"', url: '/geist.woff2' }, { family: 'Display', url: '/display.woff2' }]);
    expect([...fonts].map((f) => f.family)).toEqual(['Geist', 'Display']);
  });

  it('warns once and resolves when a face does not load, or cannot be made', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(loadFonts([{ family: 'Gone', url: '/missing.woff2' }])).resolves.toBeUndefined();
    await loadFonts([{ family: 'Gone', url: '/missing.woff2' }]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![1]).toMatchObject({ family: 'Gone', url: '/missing.woff2' });
    await expect(
      loadFonts([{ family: 'Odd', url: '/odd.woff2', descriptors: { weight: 'heavy-ish' } }, { family: 'Display', url: '/display.woff2' }]),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
    expect([...fonts].map((f) => f.family)).toContain('Display');
  });

  it('does nothing where the page has no document.fonts', async () => {
    Object.defineProperty(document, 'fonts', { value: undefined, configurable: true });
    await expect(loadFonts([{ family: 'Display', url: '/display.woff2' }])).resolves.toBeUndefined();
  });
});
