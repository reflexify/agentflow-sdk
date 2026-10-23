import { todayIn, viewerTimeZone, weekEnd } from '../model/dates.js';
import { DEMO_IDS, id } from './demo-ids.js';
import type { Seed, SeedRecord, SeedUnit } from './memory-server.js';

/** The project admin. */
export const LAN = id(1);
/** The manager of "Ra mắt ứng dụng" and "Kế hoạch quý 3". */
export const MINH = id(2);
/** A member, and the primary of several tasks. */
export const HOA = id(3);
/** A collaborator on one task, and a member of no project. */
export const TUAN = id(4);
/** In no project at all. */
export const KHOA = id(5);
/** A project creator, who manages "Văn phòng". */
export const MAI = id(6);

export const PEOPLE: Seed['people'] = [
  { id: LAN, name: 'Nguyễn Thị Lan', email: 'lan@example.com' },
  { id: MINH, name: 'Trần Văn Minh', email: 'minh@example.com' },
  { id: HOA, name: 'Lê Thị Hoa', email: 'hoa@example.com' },
  { id: TUAN, name: 'Phạm Minh Tuấn', email: 'tuan@example.com' },
  { id: KHOA, name: 'Đỗ Đăng Khoa', email: 'khoa@example.com' },
  { id: MAI, name: 'Vũ Thị Mai', email: 'mai@example.com' },
];

export const GROUPS: Seed['groups'] = {
  users: [LAN, MINH, HOA, TUAN, KHOA, MAI],
  creators: [LAN, MAI],
  admins: [LAN],
};

/** The organisation's units, in no order a reader should rely on. */
export const UNITS: SeedUnit[] = [
  { id: id(401), name: 'Khối Kinh doanh', code: 'KD' },
  { id: id(402), name: 'Khối Kỹ thuật', code: 'KT' },
  { id: id(403), name: 'Phòng Hành chính', code: 'HC' },
];

const uuid = (prefix: number) => (n: number) => `${prefix}0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const P = uuid(2);
const S = uuid(3);
const T = uuid(4);
const L = uuid(5);
const F = uuid(6);
const W = uuid(7);
const ITEM = uuid(8);
const C = uuid(9);

// A 1×1 PNG, enough for a preview to load.
const PNG = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
  (c) => c.charCodeAt(0),
);

/** A mention token as the platform stores it: the target a label was read from when it was written. */
const mention = (kind: 'user' | 'record', target: string, label: string) => `@[${label}](mention:${kind}/${target})`;

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export function createSeed(today: Date): Seed {
  const at = (days: number) => new Date(today.getTime() + days * 86_400_000).toISOString();
  const day = todayIn(viewerTimeZone(), today);
  const due = {
    overdue: addDays(day, -2),
    longOverdue: addDays(day, -5),
    today: day,
    // On a Sunday nothing after today is still this week, so this week is today.
    thisWeek: addDays(day, 1) <= weekEnd(day) ? addDays(day, 1) : day,
    later: addDays(weekEnd(day), 3),
  };
  const rec = (rid: string, body: Record<string, unknown>, createdBy: string, createdDaysAgo: number, offeredTo?: string[]): SeedRecord =>
    ({ id: rid, body, createdBy, createdAt: at(-createdDaysAgo), ...(offeredTo ? { offeredTo } : {}) });

  const launch = P(1);
  const office = P(2);
  const q3 = P(3);
  const warehouse = P(4);
  const [analysis, design, build, testing] = [S(1), S(2), S(3), S(4)];
  const [waiting, thisWeekLabel] = [L(1), L(2)];

  const projects: SeedRecord[] = [
    rec(launch, {
      name: 'Ra mắt ứng dụng', description: 'Ra mắt ứng dụng di động phiên bản đầu tiên.',
      managers: [MINH], members: [HOA, MAI], status: 'active', default_group_by: 'section',
    }, MINH, 40),
    rec(office, {
      name: 'Văn phòng', description: 'Việc hành chính của văn phòng.', managers: [MAI], members: [HOA], status: 'active',
    }, MAI, 60),
    rec(q3, { name: 'Kế hoạch quý 3', managers: [MINH], members: [HOA], status: 'closed' }, MINH, 120),
    rec(warehouse, { name: 'Nâng cấp kho', managers: [MAI], members: [MINH], status: 'paused' }, MAI, 50),
  ];

  const section = (sid: string, name: string, description: string, n: number) =>
    rec(sid, { project: launch, name, description, position: n * 1024 }, MINH, 40);
  const sections: SeedRecord[] = [
    section(analysis, 'Phân tích', 'Thu thập và làm rõ yêu cầu, phạm vi và tiêu chí nghiệm thu', 1),
    section(design, 'Thiết kế', 'Thiết kế giải pháp, giao diện và kiến trúc trước khi phát triển', 2),
    section(build, 'Phát triển', 'Xây dựng tính năng theo thiết kế đã thống nhất', 3),
    section(testing, 'Kiểm thử', 'Chạy kịch bản kiểm thử, ghi nhận và xác nhận sửa lỗi trước khi bàn giao', 4),
  ];

  const labels: SeedRecord[] = [
    rec(waiting, { name: 'Chờ duyệt', base_status: 'doing' }, LAN, 90),
    rec(thisWeekLabel, { name: 'Ưu tiên tuần', base_status: 'todo' }, LAN, 90),
  ];

  const checklist = ['Phác thảo bố cục', 'Chọn bảng màu', 'Thiết kế trạng thái lỗi', 'Kiểm tra trên di động', 'Gửi duyệt']
    .map((text, i) => ({ id: ITEM(i + 1), text, done: i < 2 }));

  const tasks: SeedRecord[] = [
    rec(T(1), {
      title: 'Thu thập yêu cầu từ khách hàng', project: launch, section: analysis, position: 1024, status: 'done', claimed_by: MINH,
      priority: 'high', due: addDays(day, -22), completed_at: at(-20),
    }, MINH, 30),
    rec(T(2), {
      title: 'Viết tài liệu đặc tả', project: launch, section: analysis, position: 2048, status: 'done', claimed_by: HOA, completed_at: at(-3),
    }, HOA, 25),
    rec(T(3), {
      title: 'Thiết kế màn hình đăng nhập', project: launch, section: design, position: 1024, status: 'doing', claimed_by: HOA,
      priority: 'high', due: due.today, label: waiting, checklist, show_checklist_on_card: true,
      description: 'Màn hình đăng nhập bằng email và **mã OTP**.',
    }, HOA, 14),
    rec(T(4), {
      title: 'Thiết kế luồng thanh toán', project: launch, section: design, position: 2048, status: 'doing', blocked: true,
      claimed_by: HOA, priority: 'urgent', due: due.overdue,
    }, HOA, 12),
    rec(T(5), {
      title: 'Xây dựng API đăng nhập', project: launch, section: build, position: 1024, status: 'todo', claimed_by: HOA,
      collaborators: [TUAN], due: due.thisWeek, label: thisWeekLabel,
    }, MINH, 10, [HOA]),
    rec(T(6), {
      title: 'Tích hợp cổng thanh toán', project: launch, section: build, position: 2048, status: 'todo', claimed_by: MINH,
      collaborators: [HOA], due: due.later, attachments: [F(1)],
    }, MINH, 9),
    rec(T(7), {
      title: 'Chuẩn bị tài liệu bàn giao', project: launch, section: testing, position: 1024, status: 'todo', priority: 'low',
      description: [
        `Phối hợp với ${mention('user', HOA, 'Lê Thị Hoa')} về bộ tài liệu bàn giao.`,
        `Đối chiếu với ${mention('record', `${DEMO_IDS.entities.task}/${T(15)}`, 'Khảo sát kệ kho mới')} và ${mention('record', `${DEMO_IDS.entities.task}/${T(99)}`, 'Biên bản bàn giao cũ')}.`,
        `Thuộc dự án ${mention('record', `${DEMO_IDS.entities.project}/${launch}`, 'Ra mắt ứng dụng')}.`,
      ].join('\n\n'),
    }, MINH, 5, [HOA]),
    rec(T(8), { title: 'Viết kịch bản kiểm thử', project: launch, section: testing, position: 2048, status: 'cancelled' }, MAI, 8),
    rec(T(9), {
      title: 'Gia hạn hợp đồng thuê văn phòng', project: office, position: 1024, status: 'todo', claimed_by: MAI, priority: 'high', due: due.longOverdue,
    }, MAI, 20),
    rec(T(10), { title: 'Mua văn phòng phẩm', project: office, position: 2048, status: 'doing', claimed_by: HOA, due: due.thisWeek }, MAI, 6, [HOA]),
    rec(T(11), { title: 'Đặt lịch họp giao ban', project: office, position: 3072, status: 'todo', due: due.later }, MAI, 4),
    rec(T(12), { title: 'Cập nhật danh bạ nhân viên', project: office, position: 4096, status: 'todo', claimed_by: HOA, priority: 'low' }, HOA, 3),
    rec(T(13), {
      title: 'Tổng kết quý 3', project: q3, position: 1024, status: 'done', claimed_by: MINH, completed_at: at(-30), frozen: true,
    }, MINH, 100),
    rec(T(14), { title: 'Báo cáo ngân sách quý 3', project: q3, position: 2048, status: 'todo', claimed_by: HOA, frozen: true }, MINH, 100, [HOA]),
    rec(T(15), { title: 'Khảo sát kệ kho mới', project: warehouse, position: 1024, status: 'todo', claimed_by: MINH }, MAI, 45, [MINH]),
  ];

  const comments: Seed['comments'] = [
    {
      id: C(1), record: T(4), author: MINH, at: at(-1),
      body: `@[Lê Thị Hoa](mention:user/${HOA}) ngân hàng hẹn thứ Năm gửi tài khoản thử nghiệm, mình đánh dấu Bị chặn tới lúc đó.`,
    },
    { id: C(2), record: T(4), author: HOA, at: at(-0.2), body: 'Mình đã chuẩn bị xong giao diện, chờ tài khoản là nối vào được.' },
    { id: C(3), record: T(14), author: MINH, at: at(-60), body: 'Ngân sách đã chốt cùng kế toán; quý này đóng.' },
  ];

  const purchasing = { id: id(301), name: 'Mua sắm' };
  return {
    ids: DEMO_IDS,
    people: PEOPLE,
    // Copies: the server reads a seed's groups by reference, and one seed's changes must not reach another's.
    groups: { users: [...GROUPS.users], creators: [...GROUPS.creators], admins: [...GROUPS.admins] },
    records: { project: projects, section: sections, task_label: labels, task: tasks },
    workflowTasks: [
      {
        id: W(1), workflow: purchasing, step: { key: 'approve', label: 'Duyệt đề xuất mua sắm' },
        claimedBy: HOA, users: [HOA], groups: [], dueAt: at(1), startedAt: at(-1),
      },
      {
        id: W(2), workflow: purchasing, step: { key: 'receive', label: 'Xác nhận nhận hàng' },
        claimedBy: null, users: [], groups: [DEMO_IDS.groups.users], dueAt: at(3), startedAt: at(-2),
      },
    ],
    units: UNITS,
    comments,
    files: [{ id: F(1), name: 'so-do-thanh-toan.png', type: 'image/png', bytes: PNG }],
  };
}
