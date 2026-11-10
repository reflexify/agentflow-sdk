import type { AgentFlowClient } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { AfDrillDetail, AfPageDetail, AfTilePaging, AfTileResult, AfTileSpec } from '../src/kit/index.js';

export const ok = (
  <agentflow-provider base-path="/agentflow" locale="vi" onsigned-out={() => {}} onaccess-lost={(e) => e.detail.code}>
    <agentflow-task-inbox view="mine" page-size={10} signs="true" ontask-select={(e) => e.detail.recordId} />
    <agentflow-task-detail
      entity-id="e"
      record-id="x"
      ontask-submitted={(e) => e.detail.actionId}
      onagentflow-signed={(e) => e.detail.entityId}
      onagentflow-declined={(e) => e.detail.recordId}
      onagentflow-task-changed={(e) => e.detail.entityId}
    />
    <agentflow-record-table entity-id="x" filter={{ field_filters: [] }} onrecord-created={(e) => e.detail.recordId} />
    <agentflow-start-form onworkflow-started={(e) => e.detail.instanceId} />
  </agentflow-provider>
);
// @ts-expect-error agentflow-task-changed carries no actionId
export const changedAction = <agentflow-task-detail entity-id="e" record-id="x" onagentflow-task-changed={(e) => e.detail.actionId} />;
export const taskPage = (
  <agentflow-provider tasks={{ open: () => { throw new Error('unused'); } }}>
    <agentflow-task record="r" entity="e" onagentflow-task-submitted={(e) => e.detail.actionId} onagentflow-task-changed={(e) => e.detail.recordId}>
      <div />
    </agentflow-task>
  </agentflow-provider>
);
// @ts-expect-error record is required
export const taskNoRecord = <agentflow-task />;
// @ts-expect-error tasks is an object, never a string
export const stringTasks = <agentflow-provider tasks="host.tasks" />;
export const signing = <agentflow-provider signing={{ sign: async () => 'signed' }} />;
export const hostClient = (client: AgentFlowClient) => <agentflow-provider client={client} />;
// @ts-expect-error client is an object, never a string
export const stringClient = <agentflow-provider client="host.api" />;
// @ts-expect-error signing is an object, never a string
export const stringSigning = <agentflow-provider signing="host.signing" />;
// @ts-expect-error one of entity-id or entity-key is required, and record-id
export const missing = <agentflow-task-detail />;
// @ts-expect-error one of entity-id or entity-key is required
export const noEntity = <agentflow-task-detail record-id="x" />;
// @ts-expect-error not both entity-id and entity-key
export const bothEntity = <agentflow-task-detail entity-id="e" entity-key="ticket" record-id="x" />;
// @ts-expect-error not both entity-id and entity-key
export const bothTable = <agentflow-record-table entity-id="e" entity-key="ticket" />;
export const keyed = (
  <>
    <agentflow-task-detail entity-key="ticket" record-id="x" />
    <agentflow-record-table entity-key="ticket" />
    <agentflow-start-form workflow-key="intake" />
  </>
);
// @ts-expect-error record-id is required
export const noRecord = <agentflow-task-detail entity-id="e" />;
// @ts-expect-error one of entity-id or entity-key is required
export const noTableEntity = <agentflow-record-table />;
// @ts-expect-error filter is an object, never a string
export const stringFilter = <agentflow-record-table entity-id="x" filter="status=open" />;

export const dialog = <af-dialog open heading="Đổi tên" class="x" part="p" onclose={(e) => e.detail.reason}><p slot="actions">ok</p></af-dialog>;
export const sidePanel = <af-dialog open placement="end" heading="Bộ lọc" onclose={(e) => e.detail.reason} />;
// @ts-expect-error placement is center or end
export const badPlacement = <af-dialog placement="left" />;
export const confirm = <af-confirm open heading="Xoá?" confirm-label="Xoá" danger busy={false} onconfirm={() => {}} oncancel={(e) => e.detail.reason} />;
export const menu = <af-menu items={[{ id: 'a', label: 'A', disabled: true, reason: 'no' }]} label="Actions" onselect={(e) => e.detail.id}>⋯</af-menu>;
export const checkableMenu = (
  <af-menu items={[{ id: 'sort', heading: 'Sort by', items: [{ id: 'due', label: 'Due', type: 'radio', checked: true }] }, { id: 'archived', label: 'Archived', type: 'checkbox' }]} onselect={(e) => e.detail.checked} />
);
// @ts-expect-error a checkable item is a checkbox or a radio
export const badCheckable = <af-menu items={[{ id: 'a', label: 'A', type: 'switch' }]} />;
export const lockedMenu = <af-menu disabled reason="Saving the step" label="More actions" items={[{ id: 'a', label: 'A' }]} />;
export const tonedMenu = (
  <af-menu items={[{ id: 'ok', label: 'Approve', tone: 'success' }, { id: 'hold', label: 'Hold', tone: 'warning' }, { id: 'fyi', label: 'Note', tone: 'info' }, { id: 'no', label: 'Reject', tone: 'danger' }, { id: 'old', label: 'Delete', danger: true }]} />
);
// @ts-expect-error a tone is success, warning, info or danger
export const badTone = <af-menu items={[{ id: 'a', label: 'A', tone: 'purple' }]} />;
export const popover = <af-popover open placement="bottom-start" onclose={(e) => e.detail.reason} />;
export const tooltip = <af-tooltip text="Hint" locale="vi"><button>?</button></af-tooltip>;
export const toast = <af-toast ref={(el) => { el?.show({ kind: 'error', text: 'x', action: { id: 'retry', label: 'Retry' } }); }} onaction={(e) => e.detail.action} />;
export const date = <af-date value="2026-10-16" min="2026-01-01" clearable strings={{ today: 'Nay' }} onchange={(e) => e.detail.value} />;
export const maskedDate = <af-date value="2026-10-16" format="DD.MM.YYYY" strings={{ badDate: 'Nhập ngày dạng {format}' }} onchange={(e) => e.detail.value} />;
export const people = <af-person-picker people={[{ id: 'p', name: 'Lan' }]} value={['p']} multiple onchange={(e) => e.detail.value} onsearch={(e) => e.detail.query} />;
export const dateRange = <af-date range start="2026-11-01" end={null} name="window" strings={{ rangeStart: 'Từ', rangeEnd: 'Đến' }} onchange={(e) => `${e.detail.start}/${e.detail.end}`} />;
// @ts-expect-error a range's change carries start and end, never a value
export const rangeValue = <af-date range onchange={(e) => e.detail.value} />;
export const formDate = <af-date name="due" required readonly={false} description="By Friday" error="Too late" invalid />;
export const formPeople = <af-person-picker name="who" required readonly={false} description="Who handles it" error={null} invalid={false} />;
export const amount = <af-number-input value={1500000} min={0} step={1000} precision={0} format="currency" currency="VND" steppers strings={{ increase: 'Thêm' }} onchange={(e) => e.detail.value?.toFixed(0)} />;
export const rate = <af-number-input value={12.5} format="percent" unscaled fractional min={0} max={100} locale="vi" />;
// @ts-expect-error fractional is a flag, not a digit count
export const fractionalDigits = <af-number-input fractional={3} />;
export const formAmount = <af-number-input name="qty" value={null} required readonly={false} description="At most 10" error="Too many" invalid />;
// @ts-expect-error a number input's value is a number, never a string
export const stringAmount = <af-number-input value="3" />;
// @ts-expect-error format is plain, currency or percent
export const badFormat = <af-number-input format="decimal" />;
export const germanAmount = <af-number-input value={1234.5} fractional separators="dot_comma" locale="en" />;
// @ts-expect-error separators is a preset, never a pair of characters
export const badSeparators = <af-number-input separators=".," />;
export const status = <af-select options={[{ value: 'open', label: 'Mở' }, { value: 'done', label: 'Xong', disabled: true, reason: 'Chưa duyệt' }]} value="open" placeholder="Chọn" label="Trạng thái" strings={{ noOptions: 'Trống' }} onchange={(e) => e.detail.value} />;
export const formStatus = <af-select name="status" value={['open']} multiple required readonly={false} description="Một hoặc nhiều" error={null} invalid={false} size="sm" />;
// @ts-expect-error a select is sm or the default size
export const largeStatus = <af-select size="lg" />;
// @ts-expect-error an option has a value and a label
export const badOption = <af-select options={[{ value: 'open' }]} />;
const places = Object.assign(async ({ q }: { q: string }) => ({ items: [{ value: 'hn', label: 'Hà Nội', description: q }], next: null }), {
  resolve: async (ids: string[]) => ids.map((value) => ({ value, label: value })),
});
export const city = <af-combobox options={[{ value: 'dn', label: 'Đà Nẵng', description: 'Miền Trung' }, { value: 'hue', label: 'Huế', disabled: true, reason: 'Đóng' }]} value="dn" placeholder="Tìm" label="Thành phố" strings={{ loadMore: 'Thêm' }} onchange={(e) => e.detail.value} onsearch={(e) => e.detail.query} />;
export const formCities = <af-combobox source={places} name="cities" value={['hn']} multiple loading required readonly={false} description="Một hoặc nhiều" error={null} invalid={false} />;
// @ts-expect-error a source answers a page, not a list
export const badSource = <af-combobox source={async () => [{ value: 'hn', label: 'Hà Nội' }]} />;
export const editor = <af-rich-editor value="**b**" readonly={false} label="Mô tả" onchange={(e) => e.detail.value} />;
// @ts-expect-error the editor's Tiptap instance is not part of the contract
export const editorInstance = <af-rich-editor ref={(el) => { el?.editor; }} />;
export const labelled = <><af-date label="Hạn" /><af-person-picker label="Người làm" loading /></>;
// @ts-expect-error a menu's items are objects, never a string
export const badMenu = <af-menu items="a,b" />;
// @ts-expect-error a toast's kind is success, error or info
export const badToast = <af-toast ref={(el) => { el?.show({ kind: 'warning', text: 'x' }); }} />;
export const tile = (spec: AfTileSpec, result: AfTileResult, fields: FigureField[]) => (
  <af-tile spec={spec} result={result} fields={fields} drill locale="vi" onaf-drill={(e) => e.detail.drill.field_filters} />
);
export const tileDrilled = <af-tile onaf-drill={(e: CustomEvent<AfDrillDetail>) => e.detail.bucket ?? e.detail.segment ?? e.detail.measure} />;
// @ts-expect-error the drill detail has the kit's one name, never a second one
export type { AfTileDrillDetail } from '../jsx';
// @ts-expect-error a tile's spec is an object, never a string
export const stringSpec = <af-tile spec="number" />;
// @ts-expect-error af-drill carries no value
export const drillValue = <af-tile onaf-drill={(e) => e.detail.value} />;
export const tilePaged = (paging: AfTilePaging | null) => (
  <af-tile rows={[]} columns={[]} paging={paging} onaf-page={(e) => e.detail.direction} onaf-drill={(e) => e.detail.newTab} onaf-open-record={(e) => e.detail.newTab} />
);
export const tilePage = <af-tile paging={{ prev: false, next: true, busy: true }} onaf-page={(e: CustomEvent<AfPageDetail>) => e.detail.direction} />;
// @ts-expect-error a direction is prev or next
export const pageDirection = <af-tile onaf-page={(e) => e.detail.direction === 'up'} />;
// @ts-expect-error paging is an object, never a string
export const stringPaging = <af-tile paging="next" />;
export const fieldset = (
  <af-fieldset heading="Liên hệ" description="Cách liên lạc" columns={2} locale="vi">
    <fieldset disabled={false}>
      <af-field label="Email" description="Công việc" error={null} invalid={false} required readonly={false} name="email" data-span={2}><input /></af-field>
      <af-field label="Người phụ trách" lockedReason="Quy trình đặt" strings={{ locked: 'Khoá' }}><af-select /></af-field>
      <af-field label="Ngày" locked-reason="Quy trình đặt"><af-date /></af-field>
      <af-field label="Số tiền" edited><input /></af-field>
    </fieldset>
  </af-fieldset>
);
export const fourColumns = <af-fieldset columns={4} />;
// @ts-expect-error a section has one to four columns
export const tooWideSection = <af-fieldset columns={5} />;
// @ts-expect-error edited is a boolean
export const stringEdited = <af-field edited="yes" />;
export const form = (
  <af-form errors={[{ path: '/email', message: 'Đã dùng' }]} busy dirty={false} locale="vi" strings={{ formErrors: 'Sửa' }}
    onaf-submit={(e) => e.detail.formData.get('email') ?? e.detail.submitter?.localName}>
    <form><button>Lưu</button></form>
  </af-form>
);
// @ts-expect-error an error names its field by path
export const fieldError = <af-form errors={[{ field: 'email', message: 'Đã dùng' }]} />;
export const scrollArea = (
  <af-scroll-area axis="both" label="Bộ lọc" locale="vi" ref={(el) => el?.viewport?.addEventListener('scroll', () => {})}>
    <ul><li>Một</li></ul>
  </af-scroll-area>
);
// @ts-expect-error axis is vertical, horizontal or both
export const diagonal = <af-scroll-area axis="diagonal" />;
export const tabs = (
  <af-tabs items={[{ value: 'overview', label: 'Tổng quan' }, { value: 'audit', label: 'Nhật ký', disabled: true, reason: 'Chỉ quản trị viên' }]} value="overview"
    label="Các phần" variant="line" ontab-change={(e) => e.detail.value.toUpperCase()}>
    <div slot="overview">Một</div>
  </af-tabs>
);
// @ts-expect-error variant is pill, line or segmented
export const vertical = <af-tabs variant="vertical" />;
export const splitter = (
  <af-splitter size={38} min={20} max={80} orientation="vertical" label="Đổi kích thước" locale="vi" onsize-change={(e) => e.detail.size.toFixed(0)}>
    <ul slot="start"><li>Một</li></ul>
    <div slot="end">Hai</div>
  </af-splitter>
);
// @ts-expect-error orientation is horizontal or vertical
export const diagonalSplit = <af-splitter orientation="diagonal" />;
export const pager = (
  <af-pager hasPrev hasNext={false} busy={false} pageSize={25} pageSizes={[25, 50, 100]} rangeStart={26} rangeEnd={50} total={1240} controls="rows" locale="vi"
    strings={{ previous: 'Trước', pageRange: '{start}–{end} / {total}' }} onprev={() => {}} onnext={() => {}} onpage-size-change={(e) => e.detail.pageSize.toFixed(0)} />
);
export const loadMore = <af-pager mode="more" hasMore shown={50} focusNew controls="rows" onmore={() => {}} />;
// @ts-expect-error mode is pages or more
export const infinite = <af-pager mode="infinite" />;
// @ts-expect-error the page size is a number
export const pageSizeText = <af-pager pageSize="25" />;
export const copyButton = (
  <af-copy-button value="INV-0042" label="Sao chép số hóa đơn" locale="vi" strings={{ copied: 'Xong' }} onaf-copy={(e) => e.detail.ok && e.detail.value.toUpperCase()} />
);
// @ts-expect-error the value is text
export const copyNumber = <af-copy-button value={42} />;
export const markdown = (
  <af-markdown value="**Xong** @[Lan](mention:user/0b6c1f4e-1a2b-4c3d-8e9f-0123456789ab)" mentions={{ 'user/0b6c1f4e-1a2b-4c3d-8e9f-0123456789ab': { state: 'restricted', kind: 'user' } }}
    schemes={['af-mention:']} locale="vi" strings={{ mentionDeleted: 'Đã xoá' }} onaf-link={(e) => e.detail.href.startsWith('mention:') && e.preventDefault()} />
);
// @ts-expect-error schemes is a list
export const oneScheme = <af-markdown schemes="af-mention:" />;
const units = Object.assign(async ({ q, cursor }: { q: string; cursor: string | null }) => ({ items: [{ id: 'hq', parentId: null, label: q || 'HQ', code: cursor }], next: null }), {
  resolve: async (ids: string[]) => ids.map((id) => ({ id, parentId: null, label: id, archived: true })),
});
export const unit = (
  <af-tree-picker nodes={[{ id: 'hq', parentId: null, label: 'HQ' }, { id: 'north', parentId: 'hq', label: 'North', code: 'N', disabled: true, reason: 'Đóng' }]} value="hq" placeholder="Tìm"
    label="Đơn vị" strings={{ archived: 'Lưu trữ', maxPicked: 'Tối đa {max}' }} onchange={(e) => e.detail.value} onsearch={(e) => e.detail.query.trim()} />
);
export const formUnits = <af-tree-picker source={units} name="units" value={['hq']} multiple max={2} loading required readonly={false} description="Một hoặc hai" error={null} invalid={false} />;
// @ts-expect-error a node has a parentId, null at a root
export const badNode = <af-tree-picker nodes={[{ id: 'hq', label: 'HQ' }]} />;
// @ts-expect-error max is a number
export const maxText = <af-tree-picker max="2" />;
export const bulkBar = (
  <af-bulk-bar count={3} total={40} label={null} locale="vi" strings={{ selectedCount: '{count} đã chọn', moreActions: 'Thêm' }} onclear={() => {}}
    ref={(el) => el?.focus()}>
    <button slot="actions" type="button" className="af-button ghost sm">Giao việc</button>
  </af-bulk-bar>
);
// @ts-expect-error count is a number
export const countText = <af-bulk-bar count="3" />;
export const fileUpload = (
  <af-file-upload items={[{ id: 'f1', name: 'contract.pdf', size: 1536, status: 'uploading', progress: 40, href: null, preview: null }]} accept="image/*,.pdf" multiple maxFiles={3}
    name="attachments" required locale="vi" strings={{ browse: 'chọn' }} onfiles-add={(e) => e.detail.files[0]?.name} onremove={(e) => e.detail.id} />
);
export const singleUpload = <af-file-upload replace label="Hồ sơ" locale="vi" onfiles-add={(e) => e.detail.files[0]?.name} />;
// @ts-expect-error a label is text
export const uploadLabelNumber = <af-file-upload label={3} />;
// @ts-expect-error an item's status is uploading, done or failed
export const badStatus = <af-file-upload items={[{ id: 'f1', name: 'a.pdf', status: 'queued' }]} />;
export const signaturePad = (
  <af-signature-pad value="data:image/png;base64,AA==" label="Approver signature" name="signature" required locale="vi" strings={{ signHint: 'Ký vào đây' }}
    onchange={(e) => e.detail.value?.startsWith('data:image/png')} ref={(el) => el?.clear()} />
);
// @ts-expect-error value is a data URL, not a number
export const signatureNumber = <af-signature-pad value={3} />;
export const folderSource = (
  <af-folder-source workflow="wf1" field="files" version="v2" folder={{ grain: 'folder', depth: 1 }} resumeSet="set-1" offer={['computer', 'watched']} locale="vi" strings={{ folderRetry: 'Thử lại' }}
    onaf-folder-upload-started={(e) => e.detail.setId.length} onaf-folder-progress={(e) => e.detail.stored / e.detail.total} onaf-folder-busy={(e) => !e.detail.busy}
    onaf-folder-change={(e) => [e.detail.value?.$fileSet, e.detail.preview?.group_count]} onaf-folder-error={(e) => (e.detail.status ?? 0) + e.detail.during.length + (e.detail.code ?? '').length} />
);
// @ts-expect-error a folder's grain is folder, with a depth, or file
export const folderGrain = <af-folder-source folder={{ grain: 'page' }} />;
export const refusedNumber = <af-number-input locale="vi" onunparsed={(e) => e.detail.text.toUpperCase()} />;
export const refusedDate = <af-date format="DD/MM/YYYY" onunparsed={(e) => e.detail.text.toUpperCase()} />;
