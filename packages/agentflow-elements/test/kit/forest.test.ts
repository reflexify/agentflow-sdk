import { describe, expect, it } from 'vitest';
import type { TreeNode } from '@reflexify/agentflow-sdk';
import { forest, matching, type Branch } from '../../src/kit/picker/forest.js';

const node = (id: string, parentId: string | null, label = id, code?: string): TreeNode => ({ id, parentId, label, code });
// Each branch as `id@depth`, depth first, with its children inside.
const shape = (branches: Branch[]): unknown[] => branches.map((b) => (b.children.length ? [`${b.node.id}@${b.depth}`, shape(b.children)] : `${b.node.id}@${b.depth}`));

describe('forest', () => {
  it('keeps the roots and each node’s children in input order, with their depths and ancestry', () => {
    const roots = forest([
      node('b', null, 'B'), node('b2', 'b'), node('a', null, 'A'), node('a2', 'a', 'A2'), node('a1', 'a'),
      node('c', null), node('a2x', 'a2'), node('b1', 'b'),
    ]);
    expect(shape(roots)).toEqual([['b@0', ['b2@1', 'b1@1']], ['a@0', [['a2@1', ['a2x@2']], 'a1@1']], 'c@0']);
    expect(roots[1]!.children[0]!.children[0]!.ancestry).toEqual(['A', 'A2']);
    expect(roots[0]!.ancestry).toEqual([]);
  });

  it('makes a node whose parent is absent a root', () => {
    expect(shape(forest([node('a', null), node('orphan', 'gone'), node('a1', 'a')]))).toEqual([['a@0', ['a1@1']], 'orphan@0']);
  });

  it('cuts a cycle at the node first seen, once each and without looping', () => {
    expect(shape(forest([node('a', 'b'), node('b', 'a')]))).toEqual([['a@0', ['b@1']]]);
    expect(shape(forest([node('self', 'self'), node('r', null)]))).toEqual(['self@0', 'r@0']);
  });
});

describe('matching', () => {
  const roots = forest([node('hq', null, 'HQ'), node('north', 'hq', 'North'), node('sales', 'north', 'Sales', 'NS-1'), node('south', 'hq', 'South')]);

  it('shows each match with its ancestors and opens the ancestors', () => {
    expect(matching(roots, 'nor')).toEqual({ shown: new Set(['hq', 'north']), open: new Set(['hq']) });
    expect(matching(roots, 'sal')).toEqual({ shown: new Set(['hq', 'north', 'sales']), open: new Set(['hq', 'north']) });
  });

  it('matches a code too, without accents or case', () => {
    expect(matching(roots, 'ns-1').shown).toEqual(new Set(['hq', 'north', 'sales']));
    const vi = forest([node('dn', null, 'Đà Nẵng')]);
    expect(matching(vi, 'da nang').shown).toEqual(new Set(['dn']));
    expect(matching(roots, 'zzz')).toEqual({ shown: new Set(), open: new Set() });
  });
});
