import { useState, type CSSProperties } from 'react';
import { RichEditor, Tile, type SectionProps } from './kit.js';
import { COLUMN_STACKED, NUMBER_GOAL } from './tiles.js';

const PLUS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
const BOLD = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
  </svg>
);
const INFO = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
  </svg>
);

const VARIANTS = ['primary', 'outline', 'secondary', 'ghost', 'danger', 'link'] as const;
const SIZES = ['xs', 'sm', '', 'lg'] as const;
const CHIPS = ['primary', 'secondary', 'danger', 'outline', 'neutral', 'success', 'warning', 'info'] as const;
const BANNERS = ['plain', 'info', 'warning', 'danger'] as const;
const AVATARS: [initials: string, size: string, hue?: number][] = [['LM', 'sm'], ['TH', '', 3], ['PL', 'lg', 6], ['ĐĐ', '', 1]];

/** Every class of the kit's stylesheet, with the rich editor and two tiles. */
export function Display({ t, log, locale, theme }: SectionProps) {
  const c = { locale, theme };
  const [tab, setTab] = useState<'overview' | 'activity'>('overview');
  const [pressed, setPressed] = useState(false);
  const [notes, setNotes] = useState(t.editorValue);
  const cls = (...names: string[]) => names.filter(Boolean).join(' ');

  return (
    <section aria-labelledby="showcase-display" className="card">
      <h2 id="showcase-display">{t.display}</h2>

      <h3>{t.buttons}</h3>
      <div className="row" data-testid="display-buttons">
        {VARIANTS.map((v) => (
          <button key={v} type="button" className={cls('af-button', v === 'outline' ? '' : v)}>{t.variants[v]}</button>
        ))}
        <button type="button" className="af-button primary" aria-disabled="true">{t.locked}</button>
      </div>
      <div className="row">
        {SIZES.map((size) => (
          <button key={size || 'default'} type="button" className={cls('af-button primary', size)}>{PLUS}{size || 'default'}</button>
        ))}
        {SIZES.map((size) => (
          <button key={size || 'default'} type="button" className={cls('af-button icon', size)} aria-label={`${t.add}, ${size || 'default'}`}>{PLUS}</button>
        ))}
      </div>

      <h3>{t.controls}</h3>
      <div className="stack narrow">
        <label className="af-label" htmlFor="display-name">{t.name}</label>
        <input id="display-name" className="af-input" placeholder="Ada Lovelace" />
        <label className="af-label" htmlFor="display-email">{t.email}</label>
        <input id="display-email" className="af-input" type="email" defaultValue="ada@" aria-invalid="true" aria-describedby="display-email-error" />
        <span id="display-email-error" className="field-error">{t.emailError}</span>
        <input className="af-input sm" placeholder={t.compact} aria-label={t.compact} />
        <textarea className="af-textarea" placeholder={t.notes} aria-label={t.notes} />
        <textarea className="af-textarea sm" placeholder={t.compact} aria-label={t.compact} />
        <input className="af-input" defaultValue={t.locked} disabled aria-label={t.locked} />
      </div>
      <div className="row">
        <span className="pair"><input id="display-c1" type="checkbox" className="af-checkbox" /><label className="af-label" htmlFor="display-c1">{t.unchecked}</label></span>
        <span className="pair"><input id="display-c2" type="checkbox" className="af-checkbox" defaultChecked /><label className="af-label" htmlFor="display-c2">{t.checked}</label></span>
        <span className="pair">
          <input id="display-c3" type="checkbox" className="af-checkbox" ref={(el) => void (el && (el.indeterminate = true))} />
          <label className="af-label" htmlFor="display-c3">{t.some}</label>
        </span>
        <span className="pair"><input id="display-c4" type="checkbox" className="af-checkbox" defaultChecked disabled /><label className="af-label" htmlFor="display-c4">{t.locked}</label></span>
        <span className="pair"><input id="display-r1" type="radio" name="display-r" className="af-radio" defaultChecked /><label className="af-label" htmlFor="display-r1">{t.chosen}</label></span>
        <span className="pair"><input id="display-r2" type="radio" name="display-r" className="af-radio" /><label className="af-label" htmlFor="display-r2">{t.other}</label></span>
        <span className="pair"><input id="display-r3" type="radio" name="display-r" className="af-radio" disabled /><label className="af-label" htmlFor="display-r3">{t.locked}</label></span>
      </div>
      <div className="row">
        <span className="pair"><input id="display-s1" type="checkbox" role="switch" className="af-switch" /><label className="af-label" htmlFor="display-s1">{t.off}</label></span>
        <span className="pair"><input id="display-s2" type="checkbox" role="switch" className="af-switch" defaultChecked /><label className="af-label" htmlFor="display-s2">{t.on}</label></span>
        <span className="pair"><input id="display-s3" type="checkbox" role="switch" className="af-switch sm" defaultChecked /><label className="af-label" htmlFor="display-s3">{t.small}</label></span>
        <span className="pair"><input id="display-s4" type="checkbox" role="switch" className="af-switch" disabled /><label className="af-label" htmlFor="display-s4">{t.locked}</label></span>
      </div>
      <div className="row">
        <button type="button" className="af-toggle" aria-pressed={pressed} onClick={() => setPressed(!pressed)}>{t.bold}</button>
        <button type="button" className="af-toggle outline" aria-pressed="true">{t.pressed}</button>
        <button type="button" className="af-toggle sm" aria-pressed="false">sm</button>
        <button type="button" className="af-toggle lg" aria-pressed="false">lg</button>
        <button type="button" className="af-toggle" aria-pressed="false" aria-label={t.bold}>{BOLD}</button>
        <button type="button" className="af-toggle" aria-pressed="false" disabled>{t.locked}</button>
        <div className="af-segmented" role="radiogroup" aria-label={t.range}>
          <label><input type="radio" name="display-range" value="day" /><span>{t.day}</span></label>
          <label><input type="radio" name="display-range" value="week" defaultChecked /><span>{t.week}</span></label>
          <label><input type="radio" name="display-range" value="month" /><span>{t.month}</span></label>
        </div>
      </div>

      <div className="row" data-testid="display-chips">
        {CHIPS.map((chip) => <span key={chip} className={cls('af-chip', chip === 'primary' ? '' : chip)}>{t.chips[chip]}</span>)}
        <span className="af-chip outline" aria-invalid="true">{t.emailError}</span>
      </div>
      <div className="stack">
        {BANNERS.map((kind) => (
          <div key={kind} className={cls('af-banner', kind === 'plain' ? '' : kind)} role="status">
            {INFO}
            <div className="af-banner-title">{t.banners[kind][0]}</div>
            <div className="af-banner-description">{t.banners[kind][1]}</div>
          </div>
        ))}
        <div className="af-banner" role="status">{t.bareBanner}</div>
      </div>
      <div className="row">
        {AVATARS.map(([initials, size, hue]) => (
          <span key={initials} className={cls('af-avatar', size)} data-hue={hue}><span className="af-avatar-initials">{initials}</span></span>
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((hue) => <span key={hue} className="af-avatar" data-hue={hue}>H{hue}</span>)}
      </div>
      <div className="row">
        <progress className="af-progress bar" value={40} max={100} aria-label={t.upload} />
        {[0, 25, 75, 100].map((n) => (
          <progress key={n} className="af-progress circular" value={n} max={100} style={{ '--af-progress': n / 100 } as CSSProperties} aria-label={`${t.upload} ${n}%`} />
        ))}
        <span className="af-spinner" aria-hidden="true" />
        <span>{t.loading}</span>
      </div>
      <div className="row">
        <div role="tablist" className="af-tabs" aria-label={t.sections}>
          {(['overview', 'activity'] as const).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)}>{t.tabs[key]}</button>
          ))}
          <button type="button" role="tab" aria-selected="false" tabIndex={-1} disabled>{t.locked}</button>
        </div>
        <div role="tablist" className="af-tabs line" aria-label={t.sections}>
          {(['overview', 'activity'] as const).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)}>{t.tabs[key]}</button>
          ))}
        </div>
        <div role="tablist" className="af-tabs segmented" aria-label={t.range}>
          <button type="button" role="tab" aria-selected="true">{t.day}</button>
          <button type="button" role="tab" aria-selected="false" tabIndex={-1}>{t.week}</button>
        </div>
      </div>
      <div className="stack" aria-hidden="true">
        <div className="af-skeleton" />
        <div className="af-skeleton row" />
        <div className="af-skeleton card" />
        <div className="af-skeleton block" />
        <div className="af-skeleton column" />
      </div>
      <div className="af-overlay panel">{t.overlay}</div>

      <RichEditor
        {...c}
        value={notes}
        label={t.editor}
        placeholder={t.editorPlaceholder}
        onChange={(value) => {
          log('af-rich-editor', 'change', { value });
          setNotes(value);
        }}
      />

      <h3>{t.tiles}</h3>
      <div className="tiles">
        {[NUMBER_GOAL, COLUMN_STACKED].map((tile, i) => (
          <Tile key={i} {...c} spec={tile.spec} result={tile.result} fields={tile.fields} onDrill={(detail) => log('af-tile', 'af-drill', detail)} />
        ))}
      </div>
    </section>
  );
}
