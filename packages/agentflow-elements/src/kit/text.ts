export type KitLocale = 'vi' | 'en';

export interface KitStrings {
  close: string;
  cancel: string;
  confirm: string;
  today: string;
  clear: string;
  remove?: string;
  unknownPerson?: string;
  noResults: string;
  bold: string;
  italic: string;
  bulletList: string;
  numberedList: string;
  link: string;
  mentionMenu?: string;
  mentionRestricted?: string;
  mentionRestrictedPerson?: string;
  mentionDeleted?: string;
  previousMonth: string;
  nextMonth: string;
  notifications: string;
  openCalendar: string;
  closeCalendar: string;
  calendar: string;
  chooseDate: string;
  selectedDate: string;
  previousYear: string;
  nextYear: string;
  previousDecade: string;
  nextDecade: string;
  switchView: string;
  currentView: string;
  viewDay: string;
  viewMonth: string;
  viewYear: string;
}

export const KIT_TEXT: Record<KitLocale, Required<KitStrings>> = {
  en: {
    close: 'Close', cancel: 'Cancel', confirm: 'Confirm', today: 'Today', clear: 'Clear', remove: 'Remove', unknownPerson: 'Unknown person', noResults: 'No matches',
    bold: 'Bold', italic: 'Italic', bulletList: 'Bulleted list', numberedList: 'Numbered list', link: 'Link',
    mentionMenu: 'Mention suggestions', mentionRestricted: 'Restricted record', mentionRestrictedPerson: 'Restricted person', mentionDeleted: 'Deleted record',
    previousMonth: 'Previous month', nextMonth: 'Next month', notifications: 'Notifications',
    openCalendar: 'Open calendar', closeCalendar: 'Close calendar', calendar: 'Calendar', chooseDate: 'Choose {date}', selectedDate: 'Selected date. {date}',
    previousYear: 'Previous year', nextYear: 'Next year', previousDecade: 'Previous decade', nextDecade: 'Next decade',
    switchView: 'Switch to {view} view', currentView: '{view} view', viewDay: 'day', viewMonth: 'month', viewYear: 'year',
  },
  vi: {
    close: 'Đóng', cancel: 'Huỷ', confirm: 'Xác nhận', today: 'Hôm nay', clear: 'Xoá', remove: 'Bỏ', unknownPerson: 'Người không rõ', noResults: 'Không có kết quả',
    bold: 'Đậm', italic: 'Nghiêng', bulletList: 'Danh sách', numberedList: 'Danh sách số', link: 'Liên kết',
    mentionMenu: 'Gợi ý nhắc đến', mentionRestricted: 'Bản ghi bị hạn chế', mentionRestrictedPerson: 'Người bị hạn chế', mentionDeleted: 'Bản ghi đã xoá',
    previousMonth: 'Tháng trước', nextMonth: 'Tháng sau', notifications: 'Thông báo',
    openCalendar: 'Mở lịch', closeCalendar: 'Đóng lịch', calendar: 'Lịch', chooseDate: 'Chọn {date}', selectedDate: 'Đã chọn {date}',
    previousYear: 'Năm trước', nextYear: 'Năm sau', previousDecade: 'Thập kỷ trước', nextDecade: 'Thập kỷ sau',
    switchView: 'Chuyển sang xem {view}', currentView: 'Xem {view}', viewDay: 'ngày', viewMonth: 'tháng', viewYear: 'năm',
  },
};

export function kitText(locale: string | null | undefined, overrides?: Partial<KitStrings>): Required<KitStrings> {
  const base = KIT_TEXT[/^vi(-|$)/i.test(locale ?? '') ? 'vi' : 'en'];
  // An override left undefined keeps the language's own string.
  const given = Object.fromEntries(Object.entries(overrides ?? {}).filter(([, v]) => v !== undefined));
  return { ...base, ...given };
}
