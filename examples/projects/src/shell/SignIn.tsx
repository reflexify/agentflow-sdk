import { LockIcon } from '../shared/icons.js';
import { t, type Lang } from '../text.js';
import { Empty } from './States.js';

/** Where signing in leads back to: the page the person is on, so a link to a task still opens it. The site's root needs no telling. */
export function signInHref(basePath: string, location: Pick<Location, 'pathname' | 'search'>): string {
  const login = `${basePath}/auth/login`;
  const here = location.pathname + location.search;
  return here === '/' ? login : `${login}?returnTo=${encodeURIComponent(here)}`;
}

/** The page when no one is signed in, in the module's own look. */
export function SignIn({ lang, basePath, location = window.location }: { lang: Lang; basePath: string; location?: Pick<Location, 'pathname' | 'search'> }) {
  return (
    <Empty
      icon={<LockIcon size={32} />}
      text={t(lang, 'signInTitle')}
      line={t(lang, 'signInBody')}
      action={<a className="af-button primary" href={signInHref(basePath, location)}>{t(lang, 'signIn')}</a>}
    />
  );
}
