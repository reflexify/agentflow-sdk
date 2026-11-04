import { describe, expect, it, vi } from 'vitest';
import { setAssistantContext, type AppAssistant, type AppAssistantItem } from '../src/index.js';

const record: AppAssistantItem = { kind: 'record', entity: 'case', record: 'r1' };
const other: AppAssistantItem = { kind: 'record', entity: 'case', record: 'r2' };
const text: AppAssistantItem = { kind: 'text', text: 'hello', label: 'Note' };
const dashboard: AppAssistantItem = { kind: 'dashboard', dashboard: 'overview' };

describe('setAssistantContext', () => {
  it.each([
    ['sends the list to a host with kinds', true, [text, record, other], [text, record, other]],
    ['sends an empty list to a host with kinds', true, [], []],
    ['sends the first record to one without kinds', false, [text, record, other], { entity: 'case', record: 'r1' }],
    ['clears one without kinds when no item is a record', false, [text, dashboard], null],
    ['clears one without kinds when there are no items', false, [], null],
  ] as const)('%s', (_name, withKinds, items, expected) => {
    const setContext = vi.fn();
    const assistant: AppAssistant = withKinds ? { kinds: ['record', 'text'], setContext } : { setContext };
    setAssistantContext(assistant, items);
    expect(setContext).toHaveBeenCalledTimes(1);
    expect(setContext.mock.calls[0]![0]).toEqual(expected);
    if (withKinds) expect(setContext.mock.calls[0]![0]).toBe(items);
  });

  it('is a no-op without an assistant, and costs the caller nothing when the host throws', () => {
    expect(() => setAssistantContext(undefined, [record])).not.toThrow();
    const setContext = vi.fn(() => {
      throw new Error('host failed');
    });
    expect(() => setAssistantContext({ kinds: [], setContext }, [record])).not.toThrow();
    expect(() => setAssistantContext({ setContext }, [record])).not.toThrow();
    expect(setContext).toHaveBeenCalledTimes(2);
  });
});
