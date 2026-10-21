import { describe, expect, it } from 'vitest';
import { hostLocation } from '../../src/shell/RouteContext.js';

const host = (basePath: string) => ({ basePath, navigate() {}, onLocationChange(listener: (path: string) => void) { listener('/'); return () => {}; } });

describe("the host location's links", () => {
  it('puts a module path under the base path the host gives', () => {
    expect(hostLocation(host('/apps/projects')).href('/p/1')).toBe('/apps/projects/p/1');
    expect(hostLocation(host('/apps/projects/')).href('/p/1?view=list')).toBe('/apps/projects/p/1?view=list');
    expect(hostLocation(host('/apps/projects')).href('/')).toBe('/apps/projects');
  });

  it('leaves a path alone for a module standing alone', () => {
    expect(hostLocation(host('/')).href('/p/1')).toBe('/p/1');
    expect(hostLocation(host('/')).href('/')).toBe('/');
  });
});
