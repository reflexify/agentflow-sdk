import { describe, expect, it } from 'vitest';
import { compareVersions } from '../src/app/version.js';

describe('compareVersions', () => {
  it.each([
    ['1.0.0', '1.0.0', 0],
    ['1.3.0', '1.2.9', 1],
    ['1.10.0', '1.9.0', 1],
    ['2.0.0', '10.0.0', -1],
    ['1.0.0-rc.1', '1.0.0', -1],
    ['1.0.0-alpha', '1.0.0-alpha.1', -1],
    ['1.0.0-alpha.beta', '1.0.0-beta', -1],
    ['1.0.0-beta.2', '1.0.0-beta.11', -1],
    ['1.0.0-rc.1', '1.0.0-beta.11', 1],
    ['1.0.0+build.5', '1.0.0', 0],
  ])('%s against %s is %i', (a, b, sign) => {
    expect(Math.sign(compareVersions(a, b))).toBe(sign);
  });

  it('refuses a string that is not a version', () => {
    expect(() => compareVersions('1.0', '1.0.0')).toThrow(TypeError);
    expect(() => compareVersions('v1.0.0', '1.0.0')).toThrow(TypeError);
  });
});
