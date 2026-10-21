import { basePathOf } from './base-path.js';

export function signIn(returnTo?: string, basePath?: string): void {
  const base = basePathOf(basePath);
  const target = returnTo ?? `${location.pathname}${location.search}${location.hash}`;
  location.assign(`${base}/auth/login?returnTo=${encodeURIComponent(target)}`);
}

/** Sign-out answers with a redirect to the identity provider, which `fetch` cannot follow, so it is a form post. */
export function signOut(basePath?: string): void {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = `${basePathOf(basePath)}/auth/logout`;
  form.dataset.agentflowSignOut = '';
  form.hidden = true;
  document.body.append(form);
  form.submit();
}
