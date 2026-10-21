import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { consumeContext, provideContext, type AgentFlowContext } from '../src/context.js';

const ctx = (state: AgentFlowContext['state']) => ({ state }) as AgentFlowContext;

describe('context protocol', () => {
  it('answers the nearest provider and pushes updates', () => {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    const child = document.createElement('span');
    inner.append(child);
    outer.append(inner);
    document.body.append(outer);
    provideContext(outer, ctx('error'));
    const near = provideContext(inner, ctx('loading'));
    const seen: string[] = [];
    consumeContext(child, (v) => seen.push(v.state));
    near.set(ctx('ready'));
    expect(seen).toEqual(['loading', 'ready']);
  });
  it('a consumer connected before its provider gets context when the provider arrives', () => {
    const host = document.createElement('div');
    const child = document.createElement('span');
    host.append(child);
    document.body.append(host);
    const seen: string[] = [];
    consumeContext(child, (v) => seen.push(v.state));
    expect(seen).toEqual([]);
    provideContext(host, ctx('loading'));
    expect(seen).toEqual(['loading']);
  });
  it('stops pushing after the consumer disposes', () => {
    const host = document.createElement('div');
    const child = document.createElement('span');
    host.append(child);
    document.body.append(host);
    const p = provideContext(host, ctx('loading'));
    const seen: string[] = [];
    const dispose = consumeContext(child, (v) => seen.push(v.state));
    dispose();
    p.set(ctx('ready'));
    expect(seen).toEqual(['loading']);
  });
  it('keeps pushing to the other consumers when one of them throws', () => {
    const reported: unknown[] = [];
    vi.stubGlobal('reportError', (error: unknown) => reported.push(error));
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const host = document.createElement('div');
    const first = document.createElement('span');
    const second = document.createElement('span');
    host.append(first, second);
    document.body.append(host);
    const p = provideContext(host, ctx('loading'));
    const boom = new Error('consumer failed');
    consumeContext(first, (v) => {
      if (v.state === 'signed-out') throw boom;
    });
    const seen: string[] = [];
    consumeContext(second, (v) => seen.push(v.state));
    p.set(ctx('signed-out'));
    expect(seen).toEqual(['loading', 'signed-out']);
    expect(reported).toEqual([boom]);
  });
});
