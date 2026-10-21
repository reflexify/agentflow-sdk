import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { isDeskError, type AutopilotMode } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { useAiReplies, useRules } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { aggregateAutopilot, intentLabel, intentOf, INTENTS, modeOf, NEVER_AUTOMATIC, unchangedShare } from '../model/autopilot.js';
import { wordDiff } from '../model/text-tools.js';
import type { TextKey } from '../text.js';
import { errorText } from '../ticket/messages.js';
import { useAutopilotAccess } from './AutopilotAccess.js';

const MODES: AutopilotMode[] = ['off', 'shadow', 'live'];
const pct = (share: number | null) => (share === null ? null : `${Math.round(share * 100)}%`);
const known = (intent: string) => (INTENTS as readonly string[]).includes(intent);
const place = (intent: string) => (known(intent) ? (INTENTS as readonly string[]).indexOf(intent) : INTENTS.length);

export function AutopilotScreen({ now }: { now: Date }) {
  const tr = useT();
  const { api } = useDesk();
  const qc = useQueryClient();
  // Rounded to the hour so the query key, and the cache, hold for a while.
  const since = useMemo(() => {
    const d = new Date(now.getTime() - 30 * 86_400_000);
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }, [Math.floor(now.getTime() / 3_600_000)]);
  const ai = useAiReplies(since).data;
  const rulesRead = useRules();
  const rules = rulesRead.data ?? [];
  // Until the rules have been read every intent looks off, and a switch would try to create a rule that may exist.
  const ready = rulesRead.data !== undefined;
  // Everyone is shown the switches. The server decides who may save (the Support admins group), and the first
  // refusal turns them into labels for the rest of the session.
  const { refused, refuse } = useAutopilotAccess();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const problem = error ?? (rulesRead.isError && !ready ? errorText(tr, rulesRead.error) : null);

  const stats = aggregateAutopilot(ai?.replies ?? []);
  const label = (i: string) => intentLabel(tr, i);
  const intents = [...new Set<string>([...INTENTS, ...rules.map((r) => r.intent), ...stats.byIntent.keys()])]
    .sort((a, b) => (stats.byIntent.get(b)?.drafts ?? 0) - (stats.byIntent.get(a)?.drafts ?? 0) || place(a) - place(b));
  const [picked, setPicked] = useState<string | null>(null);
  const recentIntent = picked ?? intents.find((i) => (stats.byIntent.get(i)?.sentByPerson ?? 0) > 0) ?? intents[0]!;
  const recent = (ai?.replies ?? []).filter((r) => intentOf(r) === recentIntent && r.status === 'sent' && r.authorKind === 'agent').slice(0, 10);
  const recentTickets = useQueries({ queries: [...new Set(recent.map((r) => r.ticketId))].map((id) => ({ queryKey: keys.ticket(id), queryFn: () => api.ticket(id) })) });
  const ticketOf = (id: string) => recentTickets.find((q) => q.data?.id === id)?.data;

  async function setMode(intent: string, mode: AutopilotMode) {
    if (busy) return;
    setBusy(intent);
    setError(null);
    try {
      await api.setAutopilotMode(intent, mode, rules.find((r) => r.intent === intent) ?? null);
    } catch (e) {
      if (isDeskError(e, 'forbidden')) refuse();
      else setError(errorText(tr, e));
    } finally {
      // Whatever happened, the rules as they now are: a refused or stale change leaves the screen showing the truth.
      await qc.invalidateQueries({ queryKey: keys.rules });
      setBusy(null);
    }
  }

  return (
    <>
      <div className="screenhead"><h2>{tr('screen_autopilot')}</h2><span className="small muted">{tr('autopilotIntro')}</span></div>
      <div className="scroll">
        <div className="stat">
          <div><b>{stats.drafts}</b><span>{tr('statDrafts')}</span></div>
          <div><b>{pct(unchangedShare(stats)) ?? '—'}</b><span>{tr('statUnchanged')}</span></div>
          <div><b>{stats.autopilotSent}</b><span>{tr('statAutopilot')}</span></div>
        </div>
        <p className="small muted" style={{ padding: '0 20px', margin: '4px 0 0' }}>
          {refused ? tr('refusedNote') : tr('switchesNote')}
          {ai?.capped ? ` ${tr('capped')}` : ''}
        </p>
        {problem && <div className="banner bad" role="alert" style={{ margin: '8px 20px 0' }}><span>{problem}</span></div>}
        <div className="tw">
          <table>
            <thead><tr><th>{tr('colIntent')}</th><th>{tr('colMode')}</th><th>{tr('colDrafts')}</th><th>{tr('colUnchanged')}</th><th>{tr('colAutopilot')}</th></tr></thead>
            <tbody>
              {intents.map((intent) => {
                const s = stats.byIntent.get(intent);
                const mode = modeOf(rules.find((r) => r.intent === intent));
                const share = s ? unchangedShare(s) : null;
                return (
                  <tr key={intent} aria-label={label(intent)}>
                    <td><b>{label(intent)}</b></td>
                    <td>
                      {NEVER_AUTOMATIC.includes(intent) ? <span className="small muted">{tr('neverAutomatic')}</span>
                        : !refused ? (
                          <div className="toggle" role="group" aria-label={tr('modeFor', { intent: label(intent) })}>
                            {MODES.map((m) => (
                              <button key={m} aria-pressed={ready ? mode === m : undefined} disabled={busy !== null || !ready} onClick={() => mode !== m && void setMode(intent, m)}>{tr(`mode_${m}` as TextKey)}</button>
                            ))}
                          </div>
                        ) : <span className="chip">{tr(`mode_${mode}` as TextKey)}</span>}
                    </td>
                    <td className="mono">{s?.drafts ?? 0}</td>
                    <td>
                      {share === null ? <span className="mono small muted">—</span> : (
                        <div className="meter"><span className="bar"><i className={share < 0.7 ? 'low' : undefined} style={{ width: `${Math.round(share * 100)}%` }} /></span><span className="mono small">{pct(share)}</span></div>
                      )}
                    </td>
                    <td className="mono">{s?.autopilotSent ? s.autopilotSent : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="tw">
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: '8px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{tr('recentTitle', { intent: label(recentIntent) })}</span>
            <select aria-label={tr('colIntent')} value={recentIntent} onChange={(e) => setPicked(e.target.value)}>
              {intents.map((i) => <option key={i} value={i}>{label(i)}</option>)}
            </select>
          </h3>
          <table>
            <thead><tr><th>{tr('ticketsLabel')}</th><th>{tr('colChanged')}</th><th>{tr('colSentBy')}</th></tr></thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan={3} className="small muted">{tr('noRecent')}</td></tr>}
              {recent.map((r) => {
                const t = ticketOf(r.ticketId);
                return (
                  <tr key={r.id}>
                    <td><span className="mono small">{t?.number ?? '…'}</span><br />{t?.requesterName ?? ''}</td>
                    {r.aiUnchanged
                      ? <td className="diff small muted">{tr('sentUnchangedCell')}</td>
                      : <td className="diff">{wordDiff(r.aiBody ?? '', r.body).map((p, i) => (p.kind === 'ins' ? <ins key={i}>{p.text}</ins> : p.kind === 'del' ? <del key={i}>{p.text}</del> : <span key={i}>{p.text}</span>))}</td>}
                    <td>{r.authorUserName ?? tr('someone')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
