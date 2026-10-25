import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import type { LeaveApi, LeaveRequest, LeaveType } from './leave-api.js';
import { DateInput, Dialog, type ThemeMode } from './kit.js';
import { errorText, TEXT, type Lang } from './text.js';

interface Props {
  open: boolean;
  api: LeaveApi;
  lang: Lang;
  locale: string;
  theme: ThemeMode;
  onSent(made: LeaveRequest): void;
  onClose(): void;
}

/** The "New request" dialog: the create form's four fields. A failed send keeps what was typed and says why. */
export function NewRequestDialog({ open, api, lang, locale, theme, onSent, onClose }: Props) {
  const t = TEXT[lang];
  const ids = useId();
  const [type, setType] = useState<LeaveType>('annual');
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [datesMissing, setDatesMissing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Read and set in the same tick as the press, so a double press sends one request.
  const sending = useRef(false);
  // Counts closings: a send that answers after its dialog closed must not write into the next one.
  const session = useRef(0);
  const typeInput = useRef<HTMLSelectElement>(null);

  const reset = () => {
    setType('annual');
    setFrom(null);
    setTo(null);
    setReason('');
    setDatesMissing(false);
    setFailure(null);
    setBusy(false);
    sending.current = false;
  };

  useEffect(() => {
    if (!open) return;
    reset();
    // The dialog puts focus on its close button as it opens; the first field is where the person starts.
    const timer = setTimeout(() => typeInput.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open]);

  const close = () => {
    session.current += 1;
    reset();
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current) return;
    if (!from || !to) {
      setDatesMissing(true);
      return;
    }
    const mine = session.current;
    sending.current = true;
    setBusy(true);
    setFailure(null);
    try {
      const made = await api.send({ type, from, to, reason: reason.trim() });
      if (mine === session.current) close();
      // The request exists even when the dialog was closed meanwhile, so the list still shows it.
      onSent(made);
    } catch (error) {
      if (mine === session.current) setFailure(errorText(error, t, t.sendFailed));
    } finally {
      if (mine === session.current) {
        sending.current = false;
        setBusy(false);
      }
    }
  };

  const formId = `${ids}form`;
  const typeId = `${ids}type`;
  const reasonId = `${ids}reason`;
  const datesHelp = `${ids}dates-help`;
  return (
    <Dialog open={open} heading={t.newRequest} locale={locale} theme={theme} onClose={close}
      actions={<>
        <button type="button" className="af-button secondary" onClick={close}>{t.cancel}</button>
        <button type="submit" form={formId} className="af-button primary" aria-disabled={busy || undefined}>
          {busy ? t.sending : t.send}
        </button>
      </>}>
      <form id={formId} className="form" noValidate onSubmit={submit}>
        {failure && <div className="af-banner danger" role="alert">{failure}</div>}
        <div className="field">
          <label htmlFor={typeId}>{t.typeLabel}</label>
          <select id={typeId} ref={typeInput} className="input" value={type} onChange={(e) => setType(e.target.value as LeaveType)}>
            {(['annual', 'sick', 'unpaid'] as const).map((value) => <option key={value} value={value}>{t.type[value]}</option>)}
          </select>
        </div>
        <div className="field">
          <span className="label" aria-hidden="true">{t.from}</span>
          <DateInput value={from} label={t.from} locale={locale} theme={theme} onChange={(value) => { setFrom(value); setDatesMissing(false); }} />
        </div>
        <div className="field">
          <span className="label" aria-hidden="true">{t.to}</span>
          <DateInput value={to} label={t.to} locale={locale} theme={theme} onChange={(value) => { setTo(value); setDatesMissing(false); }} />
          {datesMissing && <p id={datesHelp} className="field-error" role="alert">{t.datesMissing}</p>}
        </div>
        <div className="field">
          <label htmlFor={reasonId}>{t.reason}</label>
          <textarea id={reasonId} className="input area" rows={3} value={reason} placeholder={t.reasonPlaceholder}
            onChange={(e) => setReason(e.target.value)} />
        </div>
      </form>
    </Dialog>
  );
}
