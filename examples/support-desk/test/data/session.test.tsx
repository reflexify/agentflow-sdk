// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeskError } from '../../src/api/desk-api.js';
import { useMe } from '../../src/data/hooks.js';
import { usePollInterval, LiveStatusContext } from '../../src/data/live-status.js';
import { page, signInHref } from '../../src/data/session.js';
import { SignedOutBanner } from '../../src/data/SignedOutBanner.js';
import { renderDesk } from '../support/render.js';

function Me() {
  const me = useMe();
  return <p>{me.data?.displayName ?? 'loading'}</p>;
}

describe('the lost session', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows the banner the moment any call answers signed out, and signs in again by reloading the page', async () => {
    const reload = vi.spyOn(page, 'reload').mockImplementation(() => {});
    renderDesk(<><SignedOutBanner /><Me /></>, {
      api: (api) => ({ ...api, me: () => Promise.reject(new DeskError('signed_out', 401, 'NOT_SIGNED_IN')) }),
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Sign in again' }));
    expect(reload).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert').textContent).toContain('your unsent reply is kept');
    // Standalone the reload leads to the sign-in page; inside AgentFlow the host has already taken the person there.
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('does not mistake another failure for a lost session', async () => {
    let asked = false;
    renderDesk(<><SignedOutBanner /><Me /></>, {
      api: (api) => ({ ...api, me: () => { asked = true; return Promise.reject(new DeskError('forbidden', 403, 'FORBIDDEN')); } }),
    });
    await waitFor(() => expect(asked).toBe(true));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows nothing while signed in', async () => {
    renderDesk(<><SignedOutBanner /><Me /></>);
    await waitFor(() => expect(screen.getByText('Bo Tran')).toBeTruthy());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('builds the return address from the path and query only', () => {
    expect(signInHref({ pathname: '/held', search: '', hash: '#x' })).toBe('/agentflow/auth/login?returnTo=%2Fheld');
  });
});

describe('polling', () => {
  function Interval() {
    return <p>{String(usePollInterval())}</p>;
  }
  it('polls every 30 seconds unless live updates are on', () => {
    const { unmount } = renderDesk(<LiveStatusContext.Provider value="polling"><Interval /></LiveStatusContext.Provider>);
    expect(screen.getByText('30000')).toBeTruthy();
    unmount();
    renderDesk(<LiveStatusContext.Provider value="live"><Interval /></LiveStatusContext.Provider>);
    expect(screen.getByText('false')).toBeTruthy();
  });
});
