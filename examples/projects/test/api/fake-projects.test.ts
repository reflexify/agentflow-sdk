import { describe, expect, it } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { isProjectsError, type ProjectsApi } from '../../src/api/projects-api.js';
import { HOA, KHOA, LAN, MAI, MINH, TUAN, UNITS } from '../../src/api/seed.js';
import type { NewProject, Task } from '../../src/model/types.js';

// A Friday morning in Hanoi.
const NOW = new Date('2026-10-16T03:00:00Z');
const fake = (you: string) => createFakeProjects({ you, now: () => NOW });

async function projectNamed(api: ProjectsApi, name: string) {
  const all = await api.projects(['active', 'paused', 'closed']);
  const p = all.find((x) => x.name === name);
  if (!p) throw new Error(`no project ${name}`);
  return p;
}

async function taskTitled(api: ProjectsApi, project: string, title: string): Promise<Task> {
  const { tasks } = await api.boardTasks({ project, done: 'all', cancelled: true });
  const t = tasks.find((x) => x.title === title);
  if (!t) throw new Error(`no task ${title}`);
  return t;
}

describe('the fake projects', () => {
  it('shows each person the projects they are in, and the admin all of them', async () => {
    const names = async (you: string) => (await fake(you).api.projects(['active', 'paused', 'closed'])).map((p) => p.name).sort();
    expect(await names(LAN)).toEqual(['Kế hoạch quý 3', 'Nâng cấp kho', 'Ra mắt ứng dụng', 'Văn phòng']);
    expect(await names(HOA)).toEqual(['Kế hoạch quý 3', 'Ra mắt ứng dụng', 'Văn phòng']);
    expect(await names(TUAN)).toEqual([]);
    expect(await names(KHOA)).toEqual([]);
  });

  it('knows who is a project admin and who may create projects', async () => {
    expect(await fake(LAN).api.viewer()).toEqual({ id: LAN, projectAdmin: true, projectCreator: true });
    expect(await fake(MAI).api.viewer()).toEqual({ id: MAI, projectAdmin: false, projectCreator: true });
    expect(await fake(HOA).api.viewer()).toEqual({ id: HOA, projectAdmin: false, projectCreator: false });
  });

  it('learns from the members a group lists that a person is not in it', async () => {
    const { server, api, ids } = fake(HOA);
    const admins = await server.fetch(new Request(`http://projects.memory/agentflow/api/groups/${ids.groups.admins}`));
    expect(admins.status).toBe(200);
    expect(((await admins.json()) as { members: { id: string }[] }).members.map((m) => m.id)).toEqual([LAN]);
    expect(await api.viewer()).toEqual({ id: HOA, projectAdmin: false, projectCreator: false });
  });

  it('answers a task that does not exist as not found', async () => {
    const error = await fake(MINH).api.task('00000000-0000-4000-8000-00000000dead').catch((e) => e);
    expect([error.kind, error.code]).toEqual(['not_found', 'ENTITY_RECORD_NOT_FOUND']);
  });

  it('pages a board by the done window and the cancelled toggle', async () => {
    const { api } = fake(MINH);
    const launch = await projectNamed(api, 'Ra mắt ứng dụng');
    expect(launch.defaultGroupBy).toBe('section');
    const count = async (done: 'hide' | '7' | '30' | 'all', cancelled: boolean) =>
      (await api.boardTasks({ project: launch.id, done, cancelled })).tasks.length;
    const live = await count('hide', false);
    expect(live).toBe(5);
    expect(await count('7', false)).toBe(live + 1);
    expect(await count('30', false)).toBe(live + 2);
    expect(await count('all', true)).toBe(live + 3);
    expect((await api.sections(launch.id)).map((s) => s.name)).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']);
  });

  it('builds Hoa\'s work', async () => {
    const { api } = fake(HOA);
    const mine = await api.myWork(HOA);
    expect(mine.primary.map((t) => t.title).sort()).toEqual([
      'Cập nhật danh bạ nhân viên', 'Mua văn phòng phẩm', 'Thiết kế luồng thanh toán', 'Thiết kế màn hình đăng nhập', 'Xây dựng API đăng nhập',
    ]);
    expect(mine.collaborating.map((t) => t.title)).toEqual(['Tích hợp cổng thanh toán']);
    expect(mine.claimableTasks.map((t) => t.title)).toEqual(['Chuẩn bị tài liệu bàn giao']);
    expect(mine.workflow.map((w) => [w.title, w.workflow, w.claimable])).toEqual(expect.arrayContaining([
      ['Duyệt đề xuất mua sắm', 'Mua sắm', false],
      [expect.any(String), 'Mua sắm', true],
    ]));
    expect(mine.workflow).toHaveLength(2);
  });

  it('gives Tuấn the task he collaborates on and nothing else', async () => {
    const mine = await fake(TUAN).api.myWork(TUAN);
    expect(mine.collaborating.map((t) => t.title)).toEqual(['Xây dựng API đăng nhập']);
    expect(mine.primary).toEqual([]);
    expect(mine.claimableTasks).toEqual([]);
  });

  it('updates a task, and refuses a second write from the same read as stale', async () => {
    const { api } = fake(HOA);
    const launch = await projectNamed(api, 'Ra mắt ứng dụng');
    const read = await taskTitled(api, launch.id, 'Thiết kế màn hình đăng nhập');
    const first = await api.updateTask(read, { title: 'Thiết kế màn hình đăng nhập (bản 2)' });
    expect(first.title).toBe('Thiết kế màn hình đăng nhập (bản 2)');
    expect(first.updatedAt).not.toBe(read.updatedAt);
    const second = await api.updateTask(read, { title: 'ghi đè' }).catch((e) => e);
    expect(isProjectsError(second, 'stale')).toBe(true);
    expect((await api.task(read.id)).title).toBe('Thiết kế màn hình đăng nhập (bản 2)');
  });

  it('carries a rule\'s reason when it refuses an update', async () => {
    const { api } = fake(MAI);
    const launch = await projectNamed(api, 'Ra mắt ứng dụng');
    const theirs = await taskTitled(api, launch.id, 'Thiết kế màn hình đăng nhập');
    const refused = await api.updateTask(theirs, { title: 'x' }).catch((e) => e);
    expect([refused.kind, refused.reason]).toEqual(['refused', 'Only the owner or a project manager changes this']);
  });

  it('turns the server\'s rule refusal into refused, with the first broken rule\'s message', async () => {
    const { api } = fake(MAI);
    const launch = await projectNamed(api, 'Ra mắt ứng dụng');
    const theirs = await taskTitled(api, launch.id, 'Thiết kế màn hình đăng nhập');
    const refused = await api.updateTask(theirs, { title: 'x', position: 1 }).catch((e) => e);
    expect([refused.kind, refused.code, refused.reason]).toEqual(['refused', 'ENTITY_VALIDATION_RULE_FAILED', 'Only the owner or a project manager changes this']);
    const moved = await api.updateTask(theirs, { status: 'done' }).catch((e) => e);
    expect([moved.kind, moved.code]).toEqual(['refused', 'STAGE_TRANSITION_NOT_ALLOWED']);
    expect(moved.reason).toBe("the move from 'doing' to 'done' is limited to: the work's holder");
  });

  it('answers a task in a project the viewer is not in as not found', async () => {
    const minh = fake(MINH);
    const launch = await projectNamed(minh.api, 'Ra mắt ứng dụng');
    const t = await taskTitled(minh.api, launch.id, 'Thiết kế màn hình đăng nhập');
    minh.server.actAs(KHOA);
    const error = await minh.api.task(t.id).catch((e) => e);
    expect(isProjectsError(error, 'not_found')).toBe(true);
  });

  it('keeps the closed project\'s tasks frozen and counted', async () => {
    const { api } = fake(MINH);
    const q3 = await projectNamed(api, 'Kế hoạch quý 3');
    expect(q3.status).toBe('closed');
    expect(q3.counts).toEqual({ todo: 1, doing: 0, done: 1 });
    const { tasks } = await api.boardTasks({ project: q3.id, done: 'all', cancelled: true });
    expect(tasks.map((t) => t.frozen)).toEqual([true, true]);
  });

  it('reads the seeded attachment', async () => {
    const { api } = fake(MINH);
    const launch = await projectNamed(api, 'Ra mắt ứng dụng');
    const t = await taskTitled(api, launch.id, 'Tích hợp cổng thanh toán');
    expect(t.attachments).toHaveLength(1);
    const meta = await api.attachment(t.attachments[0]!);
    expect(meta.type).toBe('image/png');
    expect(t.fileNames[meta.id]).toBe(meta.name);
    const blob = await api.fileBlob(meta.id);
    expect(blob.size).toBe(meta.size);
  });
});

describe('the fake projects, writing projects, people and labels', () => {
  const draft = (over: Partial<NewProject> = {}): NewProject => ({ name: 'Dự án mới', description: '', unit: null, managers: [MAI], members: [], ...over });
  const projectsOf = async (api: ProjectsApi) => (await api.projects(['active', 'paused', 'closed'])).map((p) => p.name);
  const launchOf = async (api: ProjectsApi) => projectNamed(api, 'Ra mắt ứng dụng');

  it('lets a creator make a project, which the managers she names then list, and refuses a person who is not a creator', async () => {
    const mai = fake(MAI);
    const created = await mai.api.createProject(draft({ managers: [MAI, TUAN], members: [HOA], unit: UNITS[0]!.id }));
    expect(created).toMatchObject({ name: 'Dự án mới', managers: [MAI, TUAN], members: [HOA], unit: UNITS[0]!.id, status: 'active' });
    mai.server.actAs(TUAN);
    expect(await projectsOf(mai.api)).toContain('Dự án mới');
    const refused = await fake(HOA).api.createProject(draft({ managers: [HOA] })).catch((e) => e);
    expect([refused.kind, refused.status, refused.code]).toEqual(['forbidden', 403, 'ENTITY_ACCESS_DENIED']);
  });

  it('stores the creator as the only manager when the create names none', async () => {
    const { api } = fake(MAI);
    const made = await api.createProject({ ...draft(), managers: undefined as unknown as string[] });
    expect(made.managers).toEqual([MAI]);
    expect((await api.project(made.id)).managers).toEqual([MAI]);
  });

  it('stores exactly the managers given, so a creator left out cannot add a section to her own project', async () => {
    const { api } = fake(MAI);
    const made = await api.createProject(draft({ managers: [TUAN] }));
    expect(made.managers).toEqual([TUAN]);
    const refused = await api.createSection(made.id, 'Phân tích', 1024).catch((e) => e);
    expect([refused.kind, refused.code, refused.reason]).toEqual([
      'forbidden', 'ENTITY_ACCESS_DENIED', 'no parent this record points to names you in a field your create scope follows',
    ]);
  });

  it('stores the description a section is created with', async () => {
    const { api } = fake(MAI);
    const made = await api.createProject(draft());
    const section = await api.createSection(made.id, 'Phân tích', 1024, 'Làm rõ yêu cầu');
    expect([section.name, section.description, section.position]).toEqual(['Phân tích', 'Làm rõ yêu cầu', 1024]);
  });

  it('refuses to clear the managers with the platform\'s reason', async () => {
    const { api } = fake(MINH);
    const launch = await launchOf(api);
    const refused = await api.updateProject(launch, { managers: [] }).catch((e) => e);
    expect([refused.kind, refused.status, refused.code, refused.reason]).toEqual([
      'invalid', 422, 'VALIDATION_ERROR', "required field 'managers' cannot be cleared",
    ]);
    expect((await api.project(launch.id)).managers).toEqual([MINH]);
  });

  it('lets a manager hand the project over and then not read it, and a member cannot edit it at all', async () => {
    const { api, server } = fake(HOA);
    const launch = await launchOf(api);
    const member = await api.updateProject(launch, { name: 'x' }).catch((e) => e);
    expect(member.kind).toBe('not_found');
    server.actAs(MINH);
    const handed = await api.updateProject(launch, { managers: [MAI], members: [HOA, MINH] });
    expect(handed.managers).toEqual([MAI]);
    server.actAs(TUAN);
    expect(await api.project(launch.id).catch((e) => e)).toMatchObject({ kind: 'not_found', code: 'ENTITY_RECORD_NOT_FOUND' });
  });

  it('answers a manager who removes themselves with the project gone on the next read', async () => {
    const { api } = fake(MINH);
    const launch = await launchOf(api);
    await api.updateProject(launch, { managers: [MAI], members: [HOA] });
    expect(await api.project(launch.id).catch((e) => e)).toMatchObject({ kind: 'not_found' });
  });

  it('stores a project edit and refuses a second write from the same read as stale', async () => {
    const { api } = fake(MINH);
    const launch = await launchOf(api);
    const edited = await api.updateProject(launch, { name: 'Ra mắt v2', description: 'Mô tả mới', defaultGroupBy: 'status', unit: UNITS[1]!.id });
    expect(edited).toMatchObject({ name: 'Ra mắt v2', description: 'Mô tả mới', defaultGroupBy: 'status', unit: UNITS[1]!.id });
    expect(await api.updateProject(launch, { name: 'ghi đè' }).catch((e) => e)).toMatchObject({ kind: 'stale' });
  });

  it('lists the three units sorted by name', async () => {
    const units = await fake(HOA).api.units();
    expect(units.map((u) => [u.name, u.code])).toEqual([['Khối Kinh doanh', 'KD'], ['Khối Kỹ thuật', 'KT'], ['Phòng Hành chính', 'HC']]);
    expect(units).toHaveLength(UNITS.length);
  });

  it('lets Lan alone create, rename and delete a label', async () => {
    const lan = fake(LAN);
    const made = await lan.api.createLabel('Cần xem lại', 'todo');
    expect([made.name, made.baseStatus]).toEqual(['Cần xem lại', 'todo']);
    const renamed = await lan.api.updateLabel(made, { name: 'Xem lại' });
    expect(renamed.name).toBe('Xem lại');
    expect(await lan.api.deleteLabel(renamed)).toEqual({ cleared: 0 });
    expect((await lan.api.labels()).map((l) => l.name)).not.toContain('Xem lại');

    const minh = fake(MINH);
    const refused = await minh.api.createLabel('Của Minh', 'todo').catch((e) => e);
    expect([refused.kind, refused.status]).toEqual(['forbidden', 403]);
    const [existing] = await minh.api.labels();
    expect(await minh.api.updateLabel(existing!, { name: 'đổi' }).catch((e) => e)).toMatchObject({ kind: 'not_found' });
    expect(await minh.api.deleteLabel(existing!).catch((e) => e)).toMatchObject({ kind: 'not_found' });
  });

  it('refuses Lan a delete of a label a task in Minh\'s project uses, and clears it once she manages that project', async () => {
    const { api, server } = fake(LAN);
    const launch = await launchOf(api);
    const label = (await api.labels()).find((l) => l.name === 'Chờ duyệt')!;
    const task = await taskTitled(api, launch.id, 'Thiết kế màn hình đăng nhập');
    expect([task.label, task.status]).toEqual([label.id, 'doing']);
    const seen: unknown[] = [];
    server.onChange((c) => seen.push(c));

    const refused = await api.deleteLabel(label).catch((e) => e);
    expect([refused.kind, refused.status, refused.code, refused.reason]).toEqual([
      'forbidden', 403, 'ENTITY_RECORD_CASCADE_FORBIDDEN', 'deleting this record would change records you cannot edit',
    ]);
    expect((await api.task(task.id)).label).toBe(label.id);
    expect((await api.labels()).map((l) => l.id)).toContain(label.id);
    expect(seen).toEqual([]);

    server.write('project', launch.id, { managers: [MINH, LAN] }, undefined, { notify: false });
    expect(await api.deleteLabel(label)).toEqual({ cleared: 1 });
    const after = await api.task(task.id);
    expect([after.label, after.status]).toEqual([null, 'doing']);
    expect(seen).toContainEqual({ entity: 'task', id: task.id, kind: 'updated' });
    expect((await api.labels()).map((l) => l.id)).not.toContain(label.id);
  });
});
