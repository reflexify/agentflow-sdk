import { isDeskError, type DeskApi } from '../api/desk-api.js';

/** The same API; a call that fails because the session ended also calls `onSignedOut`. */
export function watchSession(api: DeskApi, onSignedOut: () => void): DeskApi {
  return new Proxy(api, {
    get(target, prop, receiver) {
      const value: unknown = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;
      return (...args: unknown[]) => {
        const out: unknown = (value as (...a: unknown[]) => unknown).apply(target, args);
        return out instanceof Promise
          ? out.catch((e: unknown) => {
              if (isDeskError(e, 'signed_out')) onSignedOut();
              throw e;
            })
          : out;
      };
    },
  });
}

/** Where signing in leads back to: the page the person is on, less the refusal that may have brought them to the sign-in page. */
export function signInHref(location: Pick<Location, 'pathname' | 'search' | 'hash'>): string {
  // The other parameters are kept as written (a bare `?demo` stays `?demo`).
  const kept = location.search.replace(/^\?/, '').split('&').filter((part) => part !== '' && part.split('=')[0] !== 'agentflow_error');
  const search = kept.length > 0 ? `?${kept.join('&')}` : '';
  return `/agentflow/auth/login?returnTo=${encodeURIComponent(location.pathname + search)}`;
}

export const SIGN_OUT_PATH = '/agentflow/auth/logout';

/**
 * The desk's own site's sign-out. The SDK answers with a redirect to the identity provider, which `fetch` cannot
 * follow, so this is a form post, like the SDK's own sign-out.
 */
export function postSignOut(): void {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = SIGN_OUT_PATH;
  form.hidden = true;
  document.body.append(form);
  form.submit();
}

/** Reloads the page; an object, so a test can see it called. */
export const page = { reload: (): void => window.location.reload() };
