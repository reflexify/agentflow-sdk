import type { MenuEntry } from '@reflexify/agentflow-elements/kit';
import { useState } from 'react';
import { Confirm, Dialog, Menu, Popover, Tooltip, useToasts, type SectionProps } from './kit.js';

const MORE = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

/** Every overlay of the kit. The menu sits at the row's far end, so it opens against the module's right edge. */
export function Overlays({ t, log, locale, theme }: SectionProps) {
  const c = { locale, theme };
  const [dialog, setDialog] = useState(false);
  const [panel, setPanel] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [popover, setPopover] = useState(false);
  const toasts = useToasts({ ...c, onAction: (detail) => log('af-toast', 'action', detail) });
  const [sort, setSort] = useState('sort-due');
  const [archived, setArchived] = useState(false);
  const sorts = [{ id: 'sort-due', label: t.menu.sortDue }, { id: 'sort-priority', label: t.menu.sortPriority }, { id: 'sort-title', label: t.menu.sortTitle }];
  const items: MenuEntry[] = [
    { id: 'open', label: t.menu.open },
    { id: 'rename', label: t.menu.rename },
    { id: 'archive', label: t.menu.archive, disabled: true, reason: t.menu.archiveReason },
    { id: 'delete', label: t.menu.delete, danger: true },
    { id: 'sort', heading: t.menu.sortBy, items: sorts.map((s) => ({ ...s, type: 'radio', checked: s.id === sort })) },
    { id: 'view', items: [{ id: 'show-archived', label: t.menu.showArchived, type: 'checkbox', checked: archived }] },
  ];

  return (
    <section aria-labelledby="showcase-overlays" className="card">
      <h2 id="showcase-overlays">{t.overlays}</h2>
      <div className="row">
        <button type="button" className="af-button primary" data-testid="open-dialog" onClick={() => setDialog(true)}>{t.openDialog}</button>
        <button type="button" className="af-button secondary" data-testid="open-side-panel" onClick={() => setPanel(true)}>{t.openSidePanel}</button>
        <button type="button" className="af-button danger" data-testid="open-confirm" onClick={() => setConfirm(true)}>{t.openConfirm}</button>
        <Popover
          {...c}
          open={popover}
          onClose={(detail) => {
            log('af-popover', 'close', detail);
            setPopover(false);
          }}
          anchor={<button type="button" className="af-button secondary" data-testid="open-popover" onClick={() => setPopover(true)}>{t.filters}</button>}
        >
          <input className="af-input" aria-label={t.search} placeholder={t.search} />
        </Popover>
        <Tooltip {...c} text={t.tooltip}>
          <button type="button" className="af-button ghost" data-testid="tooltip-anchor">{t.tooltipAnchor}</button>
        </Tooltip>
        <button
          type="button"
          className="af-button secondary"
          data-testid="show-toast"
          onClick={() => toasts.show({ kind: 'success', text: t.toastText, action: { id: 'undo', label: t.undo } })}
        >
          {t.showToast}
        </button>
        <span className="grow" />
        <Menu
          {...c}
          items={items}
          label={t.menuLabel}
          onSelect={(detail) => {
            log('af-menu', 'select', detail);
            // A checkable item shows its new state once the page sets it back.
            if (sorts.some((s) => s.id === detail.id)) setSort(detail.id);
            else if (detail.id === 'show-archived') setArchived(!!detail.checked);
          }}
        >
          {MORE}
        </Menu>
      </div>
      <Dialog
        {...c}
        open={dialog}
        heading={t.dialogHeading}
        onClose={(detail) => {
          log('af-dialog', 'close', detail);
          setDialog(false);
        }}
        actions={
          <>
            <button type="button" className="af-button secondary" onClick={() => setDialog(false)}>{t.cancel}</button>
            <button type="button" className="af-button primary" onClick={() => setDialog(false)}>{t.save}</button>
          </>
        }
      >
        <p>{t.dialogBody}</p>
        <input className="af-input" aria-label={t.dialogField} placeholder={t.dialogField} data-testid="dialog-field" />
      </Dialog>
      <Dialog
        {...c}
        open={panel}
        placement="end"
        heading={t.sidePanelHeading}
        onClose={(detail) => {
          log('af-dialog', 'close', detail);
          setPanel(false);
        }}
        actions={<button type="button" className="af-button primary" onClick={() => setPanel(false)}>{t.save}</button>}
      >
        <p data-testid="side-panel-body">{t.sidePanelBody}</p>
      </Dialog>
      <Confirm
        {...c}
        open={confirm}
        heading={t.confirmHeading}
        message={t.confirmMessage}
        impact={t.confirmImpact}
        confirmLabel={t.confirmLabel}
        danger
        onConfirm={() => {
          log('af-confirm', 'confirm', {});
          setConfirm(false);
        }}
        onCancel={(detail) => {
          log('af-confirm', 'cancel', detail);
          setConfirm(false);
        }}
      />
      {toasts.region}
    </section>
  );
}
