import { AlertTriangle, InfoIcon, LockIcon } from '../shared/icons.js';
import { t, type Lang } from '../text.js';
import { Empty } from './States.js';

/** The page's own words while it finds out what it is. */
export function SiteLoading({ lang }: { lang: Lang }) {
  return <div className="state" role="status"><p>{t(lang, 'loading')}</p></div>;
}

/** The site has no usable configuration: the page says so, and who can mend it. */
export function SiteNotSetUp({ lang }: { lang: Lang }) {
  return <Empty icon={<InfoIcon size={32} />} text={t(lang, 'siteNotSetUp')} line={t(lang, 'siteNotSetUpHint')} />;
}

/** AgentFlow could not be reached, which signing in again would not mend. */
export function HostFailed({ lang, onRetry }: { lang: Lang; onRetry(): void }) {
  return (
    <div className="state error" role="alert">
      <span className="state-icon"><AlertTriangle size={32} /></span>
      <p className="state-title">{t(lang, 'hostFailed')}</p>
      <button type="button" className="af-button secondary" onClick={onRetry}>{t(lang, 'retry')}</button>
    </div>
  );
}

/** AgentFlow answered and refused: the app is off for this person. Retrying or signing in again would get the same answer. */
export function AccessRefused({ lang }: { lang: Lang }) {
  return <Empty icon={<LockIcon size={32} />} text={t(lang, 'accessRefused')} line={t(lang, 'accessRefusedHint')} />;
}
