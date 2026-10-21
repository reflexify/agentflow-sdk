import { signInHref } from '../data/session.js';
import { t, type Lang, type TextKey } from '../text.js';

/** The refusals a person can act on, by the code AgentFlow puts at the end of the address. Any other code gets the general line. */
const REFUSALS: Record<string, TextKey> = {
  APP_NOT_ASSIGNED: 'signInNotAssigned',
  APP_NOT_INSTALLED: 'signInNotInstalled',
  INVALID_TOKEN: 'signInInvalidToken',
};

/** What a refused sign-in says, or null when the page was not reached by one. The code itself is for the administrator, so it is never shown. */
export function refusalOf(search: string): TextKey | null {
  const code = new URLSearchParams(search).get('agentflow_error');
  if (code === null) return null;
  return Object.hasOwn(REFUSALS, code) ? REFUSALS[code]! : 'signInFailed';
}

export function SignIn({ lang, search = window.location.search }: { lang: Lang; search?: string }) {
  const refusal = refusalOf(search);
  return (
    <div className="empty" style={{ height: '100%' }}>
      <h3>{t(lang, 'signInTitle')}</h3>
      {refusal && <div className="banner bad" role="alert" style={{ maxWidth: '52ch' }}><span>{t(lang, refusal)}</span></div>}
      <p style={{ maxWidth: '52ch', margin: 0 }}>{t(lang, 'signInBody')}</p>
      <a className="btn primary" href={signInHref(window.location)}>{t(lang, 'signIn')}</a>
    </div>
  );
}
