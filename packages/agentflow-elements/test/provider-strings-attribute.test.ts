import { expect, it, onTestFinished, vi } from 'vitest';
import { consumeContext, type AgentFlowContext } from '../src/context.js';
import { CALLER, json, mount, stubApi } from './support.js';

// props.ts warns once per prop name for the life of the module, and vitest gives each
// test file its own modules, so this test has that count to itself.
it('a strings attribute is ignored, with one console.warn however often it is seen', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => {
    warn.mockRestore();
  });
  const api = stubApi({ 'GET /caller': () => json(200, CALLER) });

  for (let i = 0; i < 2; i++) {
    const p = await mount('<span></span>', api, { strings: '{"inbox.empty":"From markup"}' });
    let t: AgentFlowContext['t'] | undefined;
    consumeContext(p.querySelector('span')!, (value) => (t = value.t));
    expect(t?.('inbox.empty')).toBe('No tasks to show.');
  }

  expect(warn.mock.calls).toEqual([['agentflow: `strings` is a property, not an attribute; set it from JavaScript.']]);
});
