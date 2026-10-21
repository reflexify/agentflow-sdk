// @vitest-environment jsdom
import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MINH } from '../../src/api/seed.js';
import { useProjects } from '../../src/data/context.js';
import { msUntilNextDay } from '../../src/model/dates.js';
import { renderProjects } from '../support/render.js';

afterEach(() => vi.useRealTimers());

function Today() {
  const { today } = useProjects();
  return <p data-testid="today">{today}</p>;
}

describe("the viewer's day", () => {
  it('turns at their midnight with nothing else rendering, and stops counting once the module goes', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    // 23:59:58 in Hanoi.
    vi.setSystemTime(new Date('2026-10-21T16:59:58Z'));
    const view = renderProjects(<Today />, { you: MINH });
    await waitFor(() => expect(screen.getByTestId('today').textContent).toBe('2026-10-21'));
    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
    expect(screen.getByTestId('today').textContent).toBe('2026-10-22');
    const timers = vi.getTimerCount();
    view.unmount();
    expect(vi.getTimerCount()).toBeLessThan(timers);
  });

  it("counts to the next midnight in the viewer's time zone", () => {
    expect(msUntilNextDay('Asia/Ho_Chi_Minh', new Date('2026-10-21T16:59:58.250Z'))).toBe(1750);
    expect(msUntilNextDay('UTC', new Date('2026-10-21T00:00:00.000Z'))).toBe(86_400_000);
    expect(msUntilNextDay('Asia/Ho_Chi_Minh', new Date('2026-10-21T17:00:00.000Z'))).toBe(86_400_000);
  });
});
