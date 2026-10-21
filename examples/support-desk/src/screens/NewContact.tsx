import { useState } from 'react';
import { isDeskError } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { cleanEmail, looksLikeEmail } from '../model/email.js';
import { errorText } from '../ticket/messages.js';

export function NewContact({ onCreated, onCancel }: { onCreated(id: string): void; onCancel(): void }) {
  const tr = useT();
  const { api } = useDesk();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    const address = cleanEmail(email);
    if (!looksLikeEmail(address)) { setError(tr('emailRequired')); setExisting(null); return; }
    setBusy(true);
    setError(null);
    setExisting(null);
    try {
      const c = await api.createContact({ email: address, ...(name.trim() ? { name: name.trim() } : {}), ...(organization.trim() ? { organization: organization.trim() } : {}) });
      onCreated(c.id);
    } catch (e) {
      if (isDeskError(e, 'conflict')) {
        setError(tr('contactExists'));
        const match = (await api.contacts(address).catch(() => null))?.items.find((c) => c.email.toLowerCase() === address);
        setExisting(match?.id ?? null);
      } else setError(errorText(tr, e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="box form" style={{ margin: '12px 20px 0' }} onSubmit={(e) => { e.preventDefault(); void create(); }}>
      <div className="field"><label htmlFor="nc-email">{tr('email')}</label><input id="nc-email" type="text" inputMode="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="nc-name">{tr('name')}</label><input id="nc-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="nc-org">{tr('organization')}</label><input id="nc-org" placeholder={tr('orgPlaceholder')} value={organization} onChange={(e) => setOrganization(e.target.value)} /></div>
      {error && (
        <div className="banner bad" role="alert"><span>{error}</span>
          {existing && <button type="button" className="btn" onClick={() => onCreated(existing)}>{tr('openExisting')}</button>}</div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn primary" type="submit" disabled={busy}>{tr('create')}</button>
        <button className="btn" type="button" onClick={onCancel}>{tr('cancel')}</button>
      </div>
    </form>
  );
}
