// @vitest-environment jsdom
import { createModuleContainer } from '@reflexify/agentflow-sdk';
import { act, fireEvent, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ANA_WRITES_AFTER_MS, mountDemo } from '../src/demo.js';
import { stubColorScheme } from './support/media.js';

const ANA = '30000000-0000-4000-8000-000000000002';
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
let element: HTMLElement;
let stop: (() => void) | undefined;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.pushState({}, '', `/f/mine/t/${ANA}?demo`);
  stubColorScheme(false);
  element = document.body.appendChild(document.createElement('div'));
});
afterEach(() => {
  if (stop) act(() => stop!());
  stop = undefined;
  element.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function start(scripted: boolean) {
  const container = createModuleContainer(element);
  await act(async () => { stop = mountDemo({ element, ...container }, { scripted }); });
  return within(container.root);
}

describe('demo mode', () => {
  it('shows Hà viewing Ana\'s ticket, and 45 seconds in, Ana writes again', async () => {
    const desk = await start(true);
    await desk.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    expect(await desk.findAllByTitle(/Hà Nguyễn/)).not.toHaveLength(0);
    expect(desk.queryByText(/could you send it to my office/)).toBeNull();
    await advance(ANA_WRITES_AFTER_MS + 1000);
    expect(await desk.findByText(/could you send it to my office instead/)).toBeTruthy();
  });

  it('stays quiet when the script is off, and still hands the tests its controls', async () => {
    const desk = await start(false);
    await desk.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    await advance(ANA_WRITES_AFTER_MS + 1000);
    expect(desk.queryByText(/could you send it to my office/)).toBeNull();
    expect(Object.keys(window.__desk ?? {}).sort()).toEqual(['live', 'server']);
  });

  it('keeps ?demo in the address as the desk moves, so a reload stays in the demo', async () => {
    const desk = await start(false);
    // The rail's folder, which ends in its count: the open ticket's own "Waiting on customer" button ends in its key.
    fireEvent.click(await desk.findByRole('button', { name: /^Waiting on customer\s*\d+$/ }));
    expect(window.location.pathname + window.location.search).toBe('/f/waiting?demo');
  });

  it('leaves nothing behind when it stops', async () => {
    const desk = await start(false);
    await desk.findByRole('button', { name: /^Mine/ });
    act(() => stop!());
    stop = undefined;
    expect(window.__desk).toBeUndefined();
    expect(element.shadowRoot!.querySelector('.desk')).toBeNull();
  });
});
