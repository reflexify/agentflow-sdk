import { useDesk, useT } from '../data/desk-context.js';
import { forgetKeptText } from '../ticket/composer/draft-storage.js';
import { useContactCount, useHeld, useMe, useMentions, useTasks, useTicketCount } from '../data/hooks.js';
import { useOverlays } from '../keys/KeyboardProvider.js';
import { useLive } from '../live/live-context.js';
import { instantMs } from '../model/instant.js';
import type { TextKey } from '../text.js';
import { useMentionsSeenAt } from './mentions-seen.js';
import { initials } from './people.js';
import type { Folder, Route } from './route.js';
import { useNavigate, useRoute } from './RouteContext.js';
import { useDeskShell } from './shell-context.js';

function Fold(props: { label: string; count?: number | string; alert?: boolean; current: boolean; onClick(): void }) {
  return (
    <button className="fold" aria-current={props.current ? 'page' : undefined} onClick={props.onClick}>
      <span>{props.label}</span>
      <span className={props.alert ? 'n alert' : 'n'}>{props.count ?? ''}</span>
    </button>
  );
}

export function Rail() {
  const tr = useT();
  const { lang, demo } = useDesk();
  const { signOut } = useDeskShell();
  const route = useRoute();
  const navigate = useNavigate();
  const overlays = useOverlays();
  const live = useLive();
  const me = useMe().data;
  const tasks = useTasks().data ?? [];
  const held = useHeld().data ?? [];
  const mentions = useMentions(me?.id ?? null).data ?? [];
  const waiting = useTicketCount(['pending']).data;
  const open = useTicketCount(['new', 'open']).data;
  const contacts = useContactCount().data;

  const seenMs = instantMs(useMentionsSeenAt(me?.id ?? null)) ?? 0;
  const counts: Record<Folder, number | undefined> = {
    mine: tasks.filter((t) => t.claimedByUserId === me?.id).length,
    unclaimed: tasks.filter((t) => t.status === 'open').length,
    mentions: mentions.filter((n) => (instantMs(n.createdAt) ?? 0) > seenMs).length || undefined,
    waiting,
    open,
  };
  const folderCurrent = (f: Folder) => route.screen === 'queue' && route.folder === f;
  const go = (r: Route) => navigate(r);
  const folder = (f: Folder) => (
    <Fold key={f} label={tr(`folder_${f}` as TextKey)} count={counts[f]} current={folderCurrent(f)}
      onClick={() => go({ screen: 'queue', folder: f, ticketId: null })} />
  );
  const org = me?.orgName ?? tr('appName');

  return (
    <aside className="rail" aria-label={tr('appName')}>
      <div className="brand"><span className="mark">{initials(org)}</span>{org}</div>
      <button className="cmd" onClick={() => overlays.open('palette')}><span>{tr('searchOrJump')}</span><kbd>⌘K</kbd></button>
      <div className="group">{tr('groupWork')}</div>
      {folder('mine')}
      {folder('unclaimed')}
      <Fold label={tr('screen_held')} count={held.length || undefined} alert={held.length > 0}
        current={route.screen === 'held'} onClick={() => go({ screen: 'held' })} />
      {folder('mentions')}
      <div className="group">{tr('groupTickets')}</div>
      {folder('waiting')}
      {folder('open')}
      <div className="group">{tr('groupTeam')}</div>
      <Fold label={tr('screen_autopilot')} current={route.screen === 'autopilot'} onClick={() => go({ screen: 'autopilot' })} />
      <Fold label={tr('screen_contacts')} count={contacts?.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-GB')}
        current={route.screen === 'contacts' || route.screen === 'contact'} onClick={() => go({ screen: 'contacts' })} />
      <div className="spacer" />
      {demo && <span className="small muted">{tr('demoBanner')}</span>}
      <span className={live.status === 'live' ? 'status-live' : 'status-live off'} role="status">
        {live.status === 'live' ? tr('live') : tr('polling')}
      </span>
      {me && (
        <div className="me"><span className="av">{initials(me.displayName)}</span>
          <span className="who">{me.displayName}<br /><span className="muted small">{me.email ?? ''}</span></span>
          {/* What this person kept unsent in the tab goes first: the next person to sign in here is not offered it. */}
          {signOut && <button className="link signout" onClick={() => { forgetKeptText(me.id); signOut(); }}>{tr('signOut')}</button>}</div>
      )}
    </aside>
  );
}
