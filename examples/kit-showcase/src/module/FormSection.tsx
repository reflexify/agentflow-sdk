import type { AfSubmitDetail, FileItem } from '@reflexify/agentflow-elements/kit';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Combobox, DateInput, DateRange, FileUpload, NumberInput, PersonPicker, Select, SignaturePad, type SectionProps } from './kit.js';
import { PEOPLE } from './Pickers.js';

/** How long the made-up save takes. */
const SAVE_MS = 300;
/** How long the made-up upload of a file takes. */
const UPLOAD_MS = 800;

/**
 * A native `<form>` around kit controls and a native input: Submit shows what the form would send, Reset empties it, and
 * the checkbox disables the fieldset. The attachments are the module's, so Reset empties them itself. The signature pad
 * reports each stroke, which the module keeps in a hidden field the form sends. The checkbox and the result sit outside
 * the form, so a reset leaves them alone.
 * `af-fieldset` draws the section around the native fieldset, and each `af-field` labels the control written inside it.
 * `af-form` turns the submit into `af-submit`; the handler sets `busy` at once, so a second press while the made-up save
 * runs sends nothing, and clears it when the save is done.
 */
export function FormSection({ t, log, locale, theme }: SectionProps) {
  const c = { locale, theme };
  const [due, setDue] = useState<string | null>(null);
  const [span, setSpan] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [who, setWho] = useState<string[]>([]);
  const [qty, setQty] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const uploads = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // The module uploads: each file shows as uploading, and is marked done once the made-up upload ends.
  const addFiles = (added: File[]) => {
    log('af-file-upload', 'files-add', { files: added.map((file) => file.name) });
    for (const file of added) {
      const id = `file-${++uploads.current}`;
      setFiles((now) => [...now, { id, name: file.name, size: file.size, status: 'uploading', progress: 50 }]);
      timers.current.push(setTimeout(() => setFiles((now) => now.map((item) => (item.id === id ? { ...item, status: 'done', progress: null } : item))), UPLOAD_MS));
    }
  };
  const cityOptions = useMemo(() => [
    { value: 'hn', label: 'Hà Nội' },
    { value: 'hcm', label: 'Thành phố Hồ Chí Minh' },
    { value: 'dn', label: 'Đà Nẵng' },
    { value: 'hp', label: 'Hải Phòng' },
    { value: 'ct', label: 'Cần Thơ' },
    { value: 'hue', label: 'Huế', disabled: true, reason: t.cityClosedReason },
  ], [t]);
  const [locked, setLocked] = useState(false);
  const [sent, setSent] = useState('');

  const formRef = useRef<HTMLElement & { busy: boolean }>(null);
  const logRef = useRef(log);
  logRef.current = log;
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const submit = (e: Event) => {
      const entries = [...(e as CustomEvent<AfSubmitDetail>).detail.formData];
      el.busy = true;
      logRef.current('af-form', 'af-submit', entries);
      timer = setTimeout(() => {
        setSent(JSON.stringify(entries));
        el.busy = false;
      }, SAVE_MS);
    };
    el.addEventListener('af-submit', submit);
    return () => {
      el.removeEventListener('af-submit', submit);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section aria-labelledby="showcase-form" className="card">
      <h2 id="showcase-form">{t.form}</h2>
      <af-form ref={formRef} locale={locale}>
        <form className="stack" data-testid="showcase-form" onReset={() => {
          setFiles([]);
          setSignature(null);
        }}>
          <af-fieldset heading={t.formSection} description={t.formSectionHint} columns={2} locale={locale}>
            <fieldset disabled={locked} data-testid="showcase-fieldset">
              <af-field label={t.formDue} required>
                <DateInput
                  {...c}
                  name="due"
                  required
                  label={t.formDue}
                  value={due}
                  testId="form-date"
                  onChange={(value) => {
                    log('af-date', 'change', { value });
                    setDue(value);
                  }}
                />
              </af-field>
              <af-field label={t.formWindow}>
                <DateRange
                  {...c}
                  name="window"
                  label={t.formWindow}
                  start={span.start}
                  end={span.end}
                  testId="form-window"
                  onChange={(detail) => {
                    log('af-date', 'change', detail);
                    setSpan(detail);
                  }}
                />
              </af-field>
              <af-field label={t.formWho} data-span={2}>
                <PersonPicker
                  {...c}
                  name="who"
                  multiple
                  people={PEOPLE}
                  value={who}
                  label={t.formWho}
                  testId="form-who"
                  onChange={(value) => {
                    log('af-person-picker', 'change', { value });
                    setWho(value);
                  }}
                />
              </af-field>
              <af-field label={t.formQty}>
                <NumberInput
                  {...c}
                  name="qty"
                  min={1}
                  steppers
                  label={t.formQty}
                  value={qty}
                  testId="form-qty"
                  onChange={(value) => {
                    log('af-number-input', 'change', { value });
                    setQty(value);
                  }}
                />
              </af-field>
              <af-field label={t.formStatus} data-testid="field-status">
                <Select
                  {...c}
                  name="status"
                  options={[
                    { value: 'open', label: t.status.open },
                    { value: 'pending', label: t.status.pending },
                    { value: 'closed', label: t.status.closed },
                    { value: 'archived', label: t.status.archived, disabled: true, reason: t.status.archivedReason },
                  ]}
                  label={t.formStatus}
                  placeholder={t.formStatusPlaceholder}
                  value={status}
                  testId="form-status"
                  onChange={(value) => {
                    log('af-select', 'change', { value });
                    setStatus(value);
                  }}
                />
              </af-field>
              <af-field label={t.formCities} data-span={2}>
                <Combobox
                  {...c}
                  name="cities"
                  multiple
                  options={cityOptions}
                  label={t.formCities}
                  placeholder={t.formCitiesPlaceholder}
                  value={cities}
                  testId="form-cities"
                  onChange={(value) => {
                    log('af-combobox', 'change', { value });
                    setCities(value);
                  }}
                />
              </af-field>
              <af-field label={t.formFiles} data-span={2}>
                <FileUpload
                  {...c}
                  name="files"
                  multiple
                  maxFiles={3}
                  accept="image/*,.pdf"
                  items={files}
                  testId="form-files"
                  onAdd={addFiles}
                  onRemove={(id) => {
                    log('af-file-upload', 'remove', { id });
                    setFiles((now) => now.filter((item) => item.id !== id));
                  }}
                />
              </af-field>
              <af-field label={t.formSignature} data-span={2}>
                <SignaturePad
                  {...c}
                  label={t.formSignature}
                  value={signature}
                  testId="form-signature"
                  onChange={(value) => {
                    log('af-signature-pad', 'change', { value: value && `${value.slice(0, 22)}…` });
                    setSignature(value);
                  }}
                />
              </af-field>
              <af-field label={t.formTitle} required data-span={2}>
                <input className="af-input" name="title" placeholder={t.formTitlePlaceholder} data-testid="form-title" />
              </af-field>
              <af-field label={t.formReference} locked-reason={t.formReferenceLocked} locale={locale} data-testid="field-reference">
                <input className="af-input" defaultValue="REQ-0042" />
              </af-field>
            </fieldset>
          </af-fieldset>
          {signature && <input type="hidden" name="signature" value={signature} />}
          <div className="row">
            <button type="reset" className="af-button" data-testid="form-reset">{t.reset}</button>
            <button type="submit" className="af-button primary" data-testid="form-submit">{t.submit}</button>
          </div>
        </form>
      </af-form>
      <div className="row">
        <input id="showcase-lock" type="checkbox" className="af-checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
        <label className="af-label" htmlFor="showcase-lock">{t.lockFieldset}</label>
      </div>
      <output className="sent" data-testid="showcase-form-data">{sent}</output>
    </section>
  );
}
