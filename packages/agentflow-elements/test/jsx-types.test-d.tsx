import type {} from '../jsx';

export const ok = (
  <agentflow-provider base-path="/agentflow" locale="vi" onsigned-out={() => {}} onaccess-lost={(e) => e.detail.code}>
    <agentflow-task-inbox view="mine" page-size={10} ontask-select={(e) => e.detail.recordId} />
    <agentflow-task-detail entity-id="e" record-id="x" ontask-submitted={(e) => e.detail.actionId} />
    <agentflow-record-table entity-id="x" filter={{ field_filters: [] }} onrecord-created={(e) => e.detail.recordId} />
    <agentflow-start-form onworkflow-started={(e) => e.detail.instanceId} />
  </agentflow-provider>
);
// @ts-expect-error entity-id and record-id are required
export const missing = <agentflow-task-detail />;
// @ts-expect-error record-id is required
export const noRecord = <agentflow-task-detail entity-id="e" />;
// @ts-expect-error filter is an object, never a string
export const stringFilter = <agentflow-record-table entity-id="x" filter="status=open" />;

export const dialog = <af-dialog open heading="Đổi tên" class="x" part="p" onclose={(e) => e.detail.reason}><p slot="actions">ok</p></af-dialog>;
export const confirm = <af-confirm open heading="Xoá?" confirm-label="Xoá" danger busy={false} onconfirm={() => {}} oncancel={(e) => e.detail.reason} />;
export const menu = <af-menu items={[{ id: 'a', label: 'A', disabled: true, reason: 'no' }]} label="Actions" onselect={(e) => e.detail.id}>⋯</af-menu>;
export const popover = <af-popover open placement="bottom-start" onclose={(e) => e.detail.reason} />;
export const tooltip = <af-tooltip text="Hint" locale="vi"><button>?</button></af-tooltip>;
export const toast = <af-toast ref={(el) => { el?.show({ kind: 'error', text: 'x', action: { id: 'retry', label: 'Retry' } }); }} onaction={(e) => e.detail.action} />;
export const date = <af-date value="2026-10-16" min="2026-01-01" clearable strings={{ today: 'Nay' }} onchange={(e) => e.detail.value} />;
export const people = <af-person-picker people={[{ id: 'p', name: 'Lan' }]} value={['p']} multiple onchange={(e) => e.detail.value} onsearch={(e) => e.detail.query} />;
export const editor = <af-rich-editor value="**b**" readonly={false} label="Mô tả" onchange={(e) => e.detail.value} />;
// @ts-expect-error the editor's Tiptap instance is not part of the contract
export const editorInstance = <af-rich-editor ref={(el) => { el?.editor; }} />;
export const labelled = <><af-date label="Hạn" /><af-person-picker label="Người làm" loading /></>;
// @ts-expect-error a menu's items are objects, never a string
export const badMenu = <af-menu items="a,b" />;
// @ts-expect-error a toast's kind is success, error or info
export const badToast = <af-toast ref={(el) => { el?.show({ kind: 'warning', text: 'x' }); }} />;
