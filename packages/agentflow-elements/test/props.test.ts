import { describe, expect, it } from 'vitest';
import { pageSizeProp } from '../src/props.js';

describe('pageSizeProp', () => {
  it('keeps a size the API accepts', () => {
    expect([1, 10, 200].map(pageSizeProp)).toEqual([1, 10, 200]);
  });

  it('clamps to 1 to 200 and drops a fraction', () => {
    expect([0, -5, 201, 500, 10.7].map(pageSizeProp)).toEqual([1, 1, 200, 200, 10]);
  });

  it('means the default of 25 for a removed attribute or no number at all', () => {
    expect([null, undefined, Number.NaN, 'many'].map(pageSizeProp)).toEqual([25, 25, 25, 25]);
  });
});
