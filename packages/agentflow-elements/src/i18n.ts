export type Locale = 'en' | 'vi';

const en = {
  'common.loading': 'Loading…',
  'common.load_more': 'Load more',
  'common.error': 'Something went wrong ({code}).',
  'common.request_id': 'Request id: {id}',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.cancel': 'Cancel',
  'inbox.empty': 'No tasks to show.',
  'inbox.column.task': 'Task',
  'inbox.column.workflow': 'Workflow',
  'inbox.column.status': 'Status',
  'inbox.column.due': 'Due',
  'task.claim': 'Claim',
  'task.release': 'Release',
  'task.submit': 'Submit',
  'task.claimed_by': 'Claimed by {name}',
  'task.claimed_by_someone': 'Someone else is working on this task.',
  'task.withheld': 'Only the people this task is assigned to can see its form.',
  'task.done': 'This task is complete.',
  'task.cancelled': 'This task was withdrawn.',
  'task.signed_waiting': "This task is signed and waiting on the workflow's owner to finish it.",
  'task.no_actions': 'There is no decision you can make on this task right now.',
  'task.sign_elsewhere': "Signing this task isn't available here. Open it in AgentFlow to sign.",
  'task.select_elsewhere': "Choosing records for this task isn't available here. Open it in AgentFlow to choose them.",
  'form.required': 'Required',
  'form.unsupported': "This field can't be edited here.",
  'form.unsupported_required': "This form has a required field that can't be edited here.",
  'records.search': 'Search',
  'records.create': 'New record',
  'records.save': 'Create',
  'records.empty': 'No records.',
  notInstalled: 'This app has no {key}.',
  'start.choose': 'Choose a workflow',
  'start.name': 'Case name',
  'start.submit': 'Start',
  'start.not_startable': "This workflow can't be started here.",
  'start.started': 'Started.',
  'status.open': 'Open',
  'status.claimed': 'Claimed',
  'status.submitted': 'Submitted',
  'status.cancelled': 'Cancelled',
} as const;

export type StringKey = keyof typeof en;
export type Strings = Partial<Record<StringKey, string>>;
export type Translate = (key: StringKey, vars?: Record<string, string | number>) => string;

const vi: Record<StringKey, string> = {
  'common.loading': 'Đang tải…',
  'common.load_more': 'Tải thêm',
  'common.error': 'Đã có lỗi xảy ra ({code}).',
  'common.request_id': 'Mã yêu cầu: {id}',
  'common.yes': 'Có',
  'common.no': 'Không',
  'common.cancel': 'Hủy',
  'inbox.empty': 'Không có công việc nào.',
  'inbox.column.task': 'Công việc',
  'inbox.column.workflow': 'Quy trình',
  'inbox.column.status': 'Trạng thái',
  'inbox.column.due': 'Hạn',
  'task.claim': 'Nhận việc',
  'task.release': 'Trả lại',
  'task.submit': 'Gửi',
  'task.claimed_by': 'Đã được {name} nhận',
  'task.claimed_by_someone': 'Người khác đang xử lý công việc này.',
  'task.withheld': 'Chỉ những người được giao công việc này mới xem được biểu mẫu.',
  'task.done': 'Công việc đã hoàn tất.',
  'task.cancelled': 'Công việc này đã bị rút lại.',
  'task.signed_waiting': 'Công việc này đã được ký và đang chờ chủ sở hữu quy trình hoàn tất.',
  'task.no_actions': 'Hiện bạn không có quyết định nào để thực hiện cho công việc này.',
  'task.sign_elsewhere': 'Không thể ký công việc này ở đây. Hãy mở công việc trong AgentFlow để ký.',
  'task.select_elsewhere': 'Không thể chọn bản ghi cho công việc này ở đây. Hãy mở công việc trong AgentFlow để chọn.',
  'form.required': 'Bắt buộc',
  'form.unsupported': 'Không thể nhập trường này ở đây.',
  'form.unsupported_required': 'Biểu mẫu có trường bắt buộc không nhập được ở đây.',
  'records.search': 'Tìm kiếm',
  'records.create': 'Thêm bản ghi',
  'records.save': 'Tạo',
  'records.empty': 'Không có bản ghi nào.',
  notInstalled: 'Ứng dụng này không có {key}.',
  'start.choose': 'Chọn quy trình',
  'start.name': 'Tên hồ sơ',
  'start.submit': 'Bắt đầu',
  'start.not_startable': 'Không thể bắt đầu quy trình này ở đây.',
  'start.started': 'Đã bắt đầu.',
  'status.open': 'Mới',
  'status.claimed': 'Đã nhận',
  'status.submitted': 'Đã gửi',
  'status.cancelled': 'Đã hủy',
};

export const STRINGS: Record<Locale, Record<StringKey, string>> = { en, vi };

export function resolveLocale(requested: string | null | undefined, navigatorLanguage: string | undefined): Locale {
  if (requested === 'en' || requested === 'vi') return requested;
  return navigatorLanguage?.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

export function translator(locale: Locale, overrides: Strings): Translate {
  return (key, vars) => {
    // A key the API grows later, such as a new task status, has no string yet: show the key, not `undefined`.
    const template = overrides[key] ?? STRINGS[locale][key] ?? key;
    return template.replace(/\{(\w+)\}/g, (whole, name: string) => (vars && name in vars ? String(vars[name]) : whole));
  };
}
