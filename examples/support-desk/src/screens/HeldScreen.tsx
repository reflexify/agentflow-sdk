import { useQueries } from '@tanstack/react-query';
import { useDesk, useT } from '../data/desk-context.js';
import { useHeld } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { firstLine } from '../model/text-tools.js';
import { formatWhen } from '../model/when.js';
import { useNavigate } from '../shell/RouteContext.js';
import type { TextKey } from '../text.js';
import { useHeldActions } from '../ticket/useHeldActions.js';

export function HeldScreen({ now }: { now: Date }) {
  const tr = useT();
  const { api, lang } = useDesk();
  const navigate = useNavigate();
  const held = useHeld();
  const actions = useHeldActions();
  const ticketIds = [...new Set((held.data ?? []).map((r) => r.ticketId))];
  const tickets = useQueries({ queries: ticketIds.map((id) => ({ queryKey: keys.ticket(id), queryFn: () => api.ticket(id) })) });
  const ticketOf = (id: string) => tickets.find((q) => q.data?.id === id)?.data;
  const open = (ticketId: string) => navigate({ screen: 'queue', folder: 'open', ticketId });

  return (
    <>
      <div className="screenhead"><h2>{tr('screen_held')}</h2><span className="small muted">{tr('heldIntro')}</span></div>
      <div className="scroll">
        {actions.error && <div className="banner bad" role="alert" style={{ margin: '12px 20px 0' }}><span>{actions.error}</span></div>}
        {actions.note && <div className="banner info" role="status" style={{ margin: '12px 20px 0' }}><span>{actions.note}</span></div>}
        {actions.movedTo && (
          <div className="banner info" role="status" style={{ margin: '12px 20px 0' }}>
            <span>{tr('movedTo')}</span><button className="btn" onClick={() => open(actions.movedTo!)}>{tr('openMoved')}</button>
          </div>
        )}
        {held.data && held.data.length === 0 ? (
          <div className="empty"><h3>{tr('heldEmpty')}</h3><p>{tr('heldEmptyBody')}</p></div>
        ) : (
          <div className="tw" style={{ paddingTop: 12 }}>
            <table>
              <thead>
                <tr><th>{tr('colFrom')}</th><th>{tr('colTicket')}</th><th>{tr('colWhy')}</th><th>{tr('colMessage')}</th><th>{tr('colReceived')}</th><th /></tr>
              </thead>
              <tbody>
                {(held.data ?? []).map((r) => {
                  const t = ticketOf(r.ticketId);
                  const reason = r.heldReason ?? 'not_a_participant';
                  const why = reason === 'dmarc_failed' ? tr('dmarcWhy') : r.matchedBy ? tr(`matched_${r.matchedBy}` as TextKey) : '';
                  return (
                    <tr key={r.id}>
                      <td>{r.fromAddress ?? ''}</td>
                      <td>
                        <button className="link mono small" onClick={() => open(r.ticketId)}>{t?.number ?? '…'}</button><br />
                        {t?.requesterName ?? ''}
                      </td>
                      <td><span className="chip held">{tr(`chip_${reason}` as TextKey)}</span><br /><span className="small muted">{why}</span></td>
                      <td className="small" style={{ maxWidth: 280 }}>{firstLine(r.body, 160)}</td>
                      <td className="mono small">{formatWhen(r.postedAt, now, lang)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="btn" disabled={actions.busy !== null} onClick={() => void actions.accept(r)}>{tr('acceptShort')}</button>
                          <button className="btn" disabled={actions.busy !== null} onClick={() => void actions.move(r)}>{tr('moveShort')}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
