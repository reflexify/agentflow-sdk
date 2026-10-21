// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignIn } from '../../src/shell/SignIn.js';
import { TEXT } from '../../src/text.js';

const alert = () => screen.queryByRole('alert');

describe('the sign-in page', () => {
  it('says nothing of a refusal when there was none', () => {
    render(<SignIn lang="en" search="" />);
    expect(alert()).toBeNull();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy();
  });

  it.each([
    ['APP_NOT_ASSIGNED', 'signInNotAssigned'],
    ['APP_NOT_INSTALLED', 'signInNotInstalled'],
    ['INVALID_TOKEN', 'signInInvalidToken'],
  ] as const)('names a refusal for %s, in either language, without the code', (code, key) => {
    const { unmount } = render(<SignIn lang="en" search={`?agentflow_error=${code}`} />);
    expect(alert()!.textContent).toBe(TEXT.en[key]);
    expect(alert()!.textContent).not.toContain(code);
    unmount();
    render(<SignIn lang="vi" search={`?agentflow_error=${code}`} />);
    expect(alert()!.textContent).toBe(TEXT.vi[key]);
  });

  it('says only that sign-in did not complete for any other code, and never echoes it', () => {
    render(<SignIn lang="en" search="?agentflow_error=USER_NOT_PROJECTED&x=1" />);
    expect(alert()!.textContent).toBe(TEXT.en.signInFailed);
    expect(alert()!.textContent).not.toContain('USER_NOT_PROJECTED');
  });

  it('treats an empty or hostile code the same way', () => {
    const { unmount } = render(<SignIn lang="en" search="?agentflow_error=" />);
    expect(alert()!.textContent).toBe(TEXT.en.signInFailed);
    unmount();
    render(<SignIn lang="en" search={`?agentflow_error=${encodeURIComponent('<b>x</b>')}`} />);
    expect(alert()!.textContent).toBe(TEXT.en.signInFailed);
  });

  it('does not carry the refusal into the address a new sign-in returns to', () => {
    window.history.replaceState(null, '', '/f/mine?agentflow_error=APP_NOT_ASSIGNED&keep=1');
    render(<SignIn lang="en" />);
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/agentflow/auth/login?returnTo=%2Ff%2Fmine%3Fkeep%3D1');
    window.history.replaceState(null, '', '/');
  });
});
