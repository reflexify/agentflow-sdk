import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDesk, useT } from '../data/desk-context.js';
import { useContacts, useMe } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { cleanEmail, looksLikeEmail } from '../model/email.js';
import { SEARCH_PAUSE_MS } from '../model/timing.js';
import type { Contact, Ticket } from '../model/types.js';
import { t } from '../text.js';
import { errorText } from './messages.js';

export function ChangeRequester({ ticket, onDone }: { ticket: Ticket; onDone(): void }) {
  const tr = useT();
  const { api } = useDesk();
  const qc = useQueryClient();
  const me = useMe().data;
  const [typed, setTyped] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setQ(typed.trim()), SEARCH_PAUSE_MS);
    return () => clearTimeout(id);
  }, [typed]);
  const search = useContacts(q);
  const found = search.data?.items.filter((c) => c.id !== ticket.requesterId) ?? [];
  // Contacts are keyed by their lowercased address, so that is the one added (and the one matched against).
  const address = cleanEmail(q);
  // Offered only once the search for exactly what is typed has answered: until then an address that has a contact looks like one that doesn't.
  const canAdd = looksLikeEmail(q) && typed.trim() === q && search.data !== undefined
    && !search.data.items.some((c) => c.email.toLowerCase() === address);

  async function choose(pick: () => Promise<Contact>) {
    if (busy || !me) return;
    setBusy(true);
    setError(null);
    try {
      const contact = await pick();
      const updated = await api.updateTicket(ticket, { requester: contact.id });
      qc.setQueryData(keys.ticket(updated.id), updated);
      await api.createNote({
        ticketId: ticket.id, kind: 'event', authorUserId: me.id,
        body: t('en', 'requesterChanged', { name: contact.name ?? contact.email }),
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.ticket(ticket.id) }),
        qc.invalidateQueries({ queryKey: keys.thread(ticket.id) }),
        qc.invalidateQueries({ queryKey: ['tickets'] }),
      ]);
      onDone();
    } catch (e) {
      setError(errorText(tr, e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 6, position: 'relative' }}>
      <input role="combobox" aria-expanded={found.length > 0 || canAdd} aria-label={tr('findContact')} placeholder={tr('findContact')}
        autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') onDone(); }} />
      {(found.length > 0 || canAdd) && (
        <div className="menu" role="listbox" aria-label={tr('findContact')} style={{ position: 'static' }}>
          {found.slice(0, 6).map((c) => (
            <button key={c.id} role="option" aria-selected={false} className="mi" disabled={busy} onClick={() => void choose(async () => c)}>
              <span>{c.name ?? c.email}</span><span className="sub">{c.email}</span>
            </button>
          ))}
          {canAdd && (
            <button role="option" aria-selected={false} className="mi" disabled={busy} onClick={() => void choose(() => api.createContact({ email: address }))}>
              <span>{tr('addContact', { email: address })}</span>
            </button>
          )}
        </div>
      )}
      {error && <div className="banner bad" role="alert"><span>{error}</span></div>}
    </div>
  );
}
