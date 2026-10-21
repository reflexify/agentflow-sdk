import { afterEach, describe, expect, it, vi } from 'vitest';
import { signIn, signOut } from '../src/session.js';

// Each of these, put after the origin or resolved against it, names another host.
const OFF_ORIGIN = ['@evil.example', '.evil.example', '//evil.example', 'evil.example', '/\\evil.example', '/\t/evil.example', ''];

describe('session helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });
  it('signIn sends the person to the login route with a relative returnTo', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/cases', search: '?x=1', hash: '', assign });
    signIn();
    expect(assign).toHaveBeenCalledWith('/agentflow/auth/login?returnTo=%2Fcases%3Fx%3D1');
    signIn('/inbox', '/af');
    expect(assign).toHaveBeenLastCalledWith('/af/auth/login?returnTo=%2Finbox');
    signIn(undefined, '/af/');
    expect(assign).toHaveBeenLastCalledWith('/af/auth/login?returnTo=%2Fcases%3Fx%3D1');
  });
  it('signIn returns a hash-routed page to the same view', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/app', search: '?x=1', hash: '#/cases/7', assign });
    signIn();
    expect(assign).toHaveBeenCalledWith(`/agentflow/auth/login?returnTo=${encodeURIComponent('/app?x=1#/cases/7')}`);
  });
  it('signOut posts a form to the logout route', () => {
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
    signOut();
    const form = document.querySelector('form[data-agentflow-sign-out]') as HTMLFormElement;
    expect(form.method).toBe('post');
    expect(new URL(form.action).pathname).toBe('/agentflow/auth/logout');
    expect(submit).toHaveBeenCalledOnce();
  });
  it('signOut takes a base path with a trailing slash', () => {
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
    signOut('/af/');
    const form = document.querySelector('form[data-agentflow-sign-out]') as HTMLFormElement;
    expect(new URL(form.action).pathname).toBe('/af/auth/logout');
  });

  describe('a base path that is not a path on this origin', () => {
    it('makes signIn fall back to /agentflow, with one warning', () => {
      for (const basePath of OFF_ORIGIN) {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const assign = vi.fn();
        vi.stubGlobal('location', { ...window.location, origin: window.location.origin, pathname: '/cases', search: '', hash: '', assign });
        signIn('/inbox', basePath);
        expect(assign, JSON.stringify(basePath)).toHaveBeenCalledWith('/agentflow/auth/login?returnTo=%2Finbox');
        expect(warn, JSON.stringify(basePath)).toHaveBeenCalledOnce();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
      }
    });

    it('makes signOut fall back to /agentflow, with one warning', () => {
      for (const basePath of OFF_ORIGIN) {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
        document.body.innerHTML = '';
        signOut(basePath);
        const action = new URL((document.querySelector('form[data-agentflow-sign-out]') as HTMLFormElement).action);
        expect([action.origin, action.pathname], JSON.stringify(basePath)).toEqual([window.location.origin, '/agentflow/auth/logout']);
        expect(warn, JSON.stringify(basePath)).toHaveBeenCalledOnce();
        vi.restoreAllMocks();
      }
    });

    it('warns about nothing when the base path is left out or is a path here', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
      vi.stubGlobal('location', { ...window.location, origin: window.location.origin, pathname: '/', search: '', hash: '', assign: vi.fn() });
      signIn();
      signIn('/x', '/portal/af');
      signOut();
      signOut('/');
      expect(warn).not.toHaveBeenCalled();
      expect(new URL((document.querySelectorAll('form[data-agentflow-sign-out]')[1] as HTMLFormElement).action).pathname).toBe('/auth/logout');
    });
  });
});
