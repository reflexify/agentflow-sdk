import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../data/desk-context.js';
import { useTickets } from '../data/hooks.js';
import { useOverlays, type Command } from '../keys/KeyboardProvider.js';
import type { TextKey } from '../text.js';
import type { Folder } from './route.js';
import { useNavigate, useRoute } from './RouteContext.js';

/** Mounted only while the palette is open, so its read of the open tickets happens when it is wanted. */
export function Palette() {
  const overlays = useOverlays();
  return overlays.palette ? <PaletteDialog /> : null;
}

function PaletteDialog() {
  const tr = useT();
  const overlays = useOverlays();
  const navigate = useNavigate();
  const route = useRoute();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const tickets = useTickets(['new', 'open', 'pending']).data ?? [];

  useEffect(() => {
    const focus = setTimeout(() => input.current?.focus(), 0);
    return () => clearTimeout(focus);
  }, []);

  const folderOf = route.screen === 'queue' ? route.folder : 'open';
  const items = useMemo<Command[]>(() => {
    const go = (f: Folder, hint?: string): Command => ({
      id: `go-${f}`, section: 'go', label: tr(`folder_${f}` as TextKey), hint,
      run: () => navigate({ screen: 'queue', folder: f, ticketId: null }),
    });
    const all: Command[] = [
      ...overlays.commands(),
      go('mine', 'G M'), go('unclaimed', 'G U'), go('mentions'), go('waiting'), go('open'),
      { id: 'go-held', section: 'go', label: tr('screen_held'), hint: 'G H', run: () => navigate({ screen: 'held' }) },
      { id: 'go-autopilot', section: 'go', label: tr('screen_autopilot'), run: () => navigate({ screen: 'autopilot' }) },
      { id: 'go-contacts', section: 'go', label: tr('screen_contacts'), run: () => navigate({ screen: 'contacts' }) },
    ];
    const needle = q.trim().toLowerCase();
    const matching = all.filter((c) => c.label.toLowerCase().includes(needle));
    const ticketHits: Command[] = needle.length < 2 ? [] : tickets
      .filter((t) => t.number.toLowerCase().includes(needle) || t.subject.toLowerCase().includes(needle))
      .slice(0, 6)
      .map((t) => ({
        id: `ticket-${t.id}`, section: 'go', label: `${t.number} · ${t.subject}`, hint: t.requesterName ?? undefined,
        run: () => navigate({ screen: 'queue', folder: folderOf, ticketId: t.id }),
      }));
    return [...matching, ...ticketHits];
  }, [overlays, q, tickets, tr, navigate, folderOf]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    overlays.close();
    c.run();
  };
  const groups = (['ticket', 'go'] as const)
    .map((section) => ({ section, items: items.filter((c) => c.section === section) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) overlays.close(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={tr('paletteLabel')}>
        <input ref={input} value={q} aria-label={tr('paletteLabel')}
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
            if (e.key === 'Enter') { e.preventDefault(); run(items[sel]); }
          }} />
        <div className="menu" role="listbox">
          {items.length === 0 && <div className="sec">{tr('paletteNothing')}</div>}
          {groups.map(({ section, items: group }) => [
            <div key={`sec-${section}`} className="sec">{section === 'go' ? tr('paletteGoTo') : group[0]!.title ?? ''}</div>,
            ...group.map((c) => {
              const i = items.indexOf(c);
              return (
                <button key={c.id} className={i === sel ? 'mi sel' : 'mi'} role="option" aria-selected={i === sel}
                  onMouseEnter={() => setSel(i)} onClick={() => run(c)}>
                  <span>{c.label}</span><span className="sub">{c.hint ?? ''}</span>
                </button>
              );
            }),
          ])}
        </div>
      </div>
    </div>
  );
}
