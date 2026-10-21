import { page } from '../data/session.js';
import { t, type Lang } from '../text.js';

/** The page when AgentFlow could not say who is signed in: it is down or not reachable, which signing in again would not mend. */
export function HostFailed({ lang }: { lang: Lang }) {
  return (
    <div className="empty" role="alert" style={{ height: '100%' }}>
      <p style={{ maxWidth: '52ch', margin: 0 }}>{t(lang, 'hostFailed')}</p>
      <button className="btn primary" onClick={() => page.reload()}>{t(lang, 'reload')}</button>
    </div>
  );
}
