// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import type { ProjectsApi } from '../../src/api/projects-api.js';
import { createSeed, GROUPS, HOA, KHOA, LAN, MAI, MINH, TUAN } from '../../src/api/seed.js';
import { scanMentions } from '../../src/model/mentions.js';
import { App } from '../../src/shell/App.js';
import { CommentBody } from '../../src/task/CommentBody.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW, toasts } from '../support/render.js';
import { useNodeUploads } from '../support/uploads.js';
import { LAUNCH, seeded } from './support.js';

const vi_ = TEXT.vi;
const PAYMENT_FLOW = 'Thiết kế luồng thanh toán';
const FROZEN = 'Báo cáo ngân sách quý 3';
const PDF_ID = '60000000-0000-4000-8000-000000000099';

useNodeUploads();
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type MenuEl = HTMLElement & { items: { id: string; label: string }[] };
type ConfirmEl = HTMLElement & { open: boolean };

async function open(you: string, title = PAYMENT_FLOW, opts: { project?: string; standalone?: boolean; seed?: ReturnType<typeof createSeed>; api?: (api: ProjectsApi) => ProjectsApi } = {}) {
  const s = opts.seed ? { ...seeded(you), fake: createFakeProjects({ you, seed: opts.seed }) } : seeded(you);
  const task = s.fake.server.records('task').find((r) => r.body.title === title)!.id;
  const project = s.fake.server.records('project').find((r) => r.body.name === (opts.project ?? LAUNCH))!.id;
  const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${project}/t/${task}`, standalone: opts.standalone, api: opts.api });
  const drawer = await screen.findByRole('dialog', { name: title });
  const section = await waitFor(() => {
    const el = drawer.querySelector<HTMLElement>('[data-part="comments"]:not([aria-busy])');
    if (!el) throw new Error('the comments have not loaded');
    return el;
  });
  return { ...view, fake: s.fake, task, drawer, section };
}

const box = (section: HTMLElement) => within(section).getByLabelText(vi_.commentLabel) as HTMLTextAreaElement;
const type = (el: HTMLTextAreaElement, value: string) => {
  fireEvent.change(el, { target: { value } });
  el.setSelectionRange(value.length, value.length);
  fireEvent.click(el);
};
const send = async (section: HTMLElement) => {
  await act(async () => { fireEvent.click(within(section).getByRole('button', { name: vi_.commentSend })); });
};
const menuOf = (section: HTMLElement, text: string) =>
  [...section.querySelectorAll<HTMLElement>('.comment')].find((c) => c.textContent?.includes(text))?.querySelector<MenuEl>('af-menu') ?? null;
const choose = (menu: MenuEl, id: string) => act(() => { menu.dispatchEvent(new CustomEvent('select', { detail: { id }, bubbles: true })); });

describe('the comments in the task drawer', () => {
  it('lists and posts comments', async () => {
    const { section, fake, task } = await open(MINH);
    expect(within(section).getByRole('heading', { name: 'Bình luận · 2' })).toBeTruthy();
    expect(within(section).getByText('Mình đã chuẩn bị xong giao diện, chờ tài khoản là nối vào được.')).toBeTruthy();
    // A person's token is drawn as the name the server gave, not as the token.
    expect(section.querySelector('.mention-chip[data-state="user"]')?.textContent).toBe('@Lê Thị Hoa');
    expect(section.textContent).not.toContain('mention:user');

    type(box(section), 'Đã gửi **bản duyệt** cho khách');
    await send(section);
    await waitFor(() => expect(within(section).getByRole('heading', { name: 'Bình luận · 3' })).toBeTruthy());
    expect(section.querySelector('strong:not(.comment-author)')?.textContent).toBe('bản duyệt');
    expect(box(section).value).toBe('');
    const thread = await fake.api.comments(task);
    expect(thread.comments.at(-1)?.body).toBe('Đã gửi **bản duyệt** cho khách');
    expect(thread.comments.at(-1)?.authorId).toBe(MINH);
  });

  it('shows a sent comment at once, dimmed, and swaps it for the server\'s copy', async () => {
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const { section } = await open(MINH, PAYMENT_FLOW, { api: (a) => ({ ...a, postComment: async (...args) => { await held; return a.postComment(...args); } }) });
    type(box(section), 'Gửi ngay');
    await send(section);
    const pending = section.querySelector('.comment[data-pending]')!;
    expect(pending.textContent).toContain('Gửi ngay');
    expect(pending.textContent).toContain(vi_.commentSending);
    expect(box(section).value).toBe('');
    await act(async () => { release(); });
    await waitFor(() => expect(section.querySelector('.comment[data-pending]')).toBeNull());
    expect(within(section).getAllByText('Gửi ngay')).toHaveLength(1);
  });

  it('keeps the text and says why when a send is refused', async () => {
    const { section, fake } = await open(MINH);
    fake.server.failNext('POST', /\/comments$/, 409, { type: 'COMMENTS_CLOSED', title: 'Conflict', status: 409, detail: 'COMMENTS_CLOSED: closed' });
    type(box(section), 'Nội dung ở lại');
    await send(section);
    expect((await within(section).findByRole('alert')).textContent).toBe('Không gửi được: bình luận của task này đã đóng');
    expect(box(section).value).toBe('Nội dung ở lại');
  });

  it('retries a failed send with the same idempotency key, and a changed draft with a new one', async () => {
    const keys: (string | undefined)[] = [];
    let lose = true;
    const { section, fake, task } = await open(MINH, PAYMENT_FLOW, {
      api: (a) => ({
        ...a,
        postComment: async (id, input) => {
          keys.push(input.key);
          const done = await a.postComment(id, input);
          if (lose) { lose = false; throw new TypeError('Failed to fetch'); }
          return done;
        },
      }),
    });
    type(box(section), 'Chỉ một lần');
    await send(section);
    await within(section).findByRole('alert');
    expect(box(section).value).toBe('Chỉ một lần');
    await send(section);
    await waitFor(() => expect(keys).toHaveLength(2));
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
    await waitFor(() => expect(within(section).getByRole('heading', { name: 'Bình luận · 3' })).toBeTruthy());
    expect((await fake.api.comments(task)).comments.filter((c) => c.body === 'Chỉ một lần')).toHaveLength(1);

    type(box(section), 'Một bình luận khác');
    await send(section);
    await waitFor(() => expect(keys).toHaveLength(3));
    expect(keys[2]).not.toBe(keys[0]);
  });

  it('offers people after an @ and sends the one chosen as a mention', async () => {
    const { section, fake, task } = await open(MINH);
    type(box(section), 'Nhờ @Mai');
    const option = await within(section).findByRole('option', { name: /Vũ Thị Mai/ });
    // Only people who may read the task are offered, so a search for a person outside the project finds no one.
    fireEvent.mouseDown(option);
    expect(box(section).value).toBe('Nhờ @Vũ Thị Mai ');
    expect(section.querySelector('.mention-menu')).toBeNull();
    type(box(section), `${box(section).value}xem giúp`);
    await send(section);
    await waitFor(() => expect(within(section).getByRole('heading', { name: 'Bình luận · 3' })).toBeTruthy());
    expect((await fake.api.comments(task)).comments.at(-1)?.body).toBe(`Nhờ @[Vũ Thị Mai](mention:user/${MAI}) xem giúp`);
    expect(section.querySelectorAll('.mention-chip[data-state="user"]')).toHaveLength(2);
  });

  it('finds people by the start of any word of their name, accents and case ignored', async () => {
    const { section } = await open(MINH);
    type(box(section), '@thi');
    const options = await within(section).findAllByRole('option');
    expect(options.map((o) => o.querySelector('.mention-name')?.textContent)).toEqual(['Nguyễn Thị Lan', 'Lê Thị Hoa', 'Vũ Thị Mai']);
    type(box(section), '@zzz');
    expect(await within(section).findByText(vi_.mentionNone)).toBeTruthy();
  });

  it('says who was not told when a mention names someone who cannot read the task', async () => {
    const { section } = await open(MINH);
    const el = box(section);
    // Khoa is in no project, so the menu does not offer him; a hand-written mention still reaches the server.
    type(el, `@[Đỗ Đăng Khoa](mention:user/${KHOA}) xem giúp`);
    await send(section);
    expect((await within(section).findByRole('status', { name: '' })).textContent).toBe('Đỗ Đăng Khoa không xem được task này nên không nhận thông báo');
  });

  it('shows the frozen line and no composer on a frozen task', async () => {
    const { section } = await open(HOA, FROZEN, { project: 'Kế hoạch quý 3' });
    expect(within(section).getByText('Task đã đóng băng: không thể bình luận')).toBeTruthy();
    expect(within(section).getByText('Ngân sách đã chốt cùng kế toán; quý này đóng.')).toBeTruthy();
    expect(within(section).queryByRole('textbox')).toBeNull();
    expect(section.querySelector('af-menu')).toBeNull();
  });

  it('lets only the author edit, and whoever may update the task delete another\'s comment', async () => {
    const mine = await open(MINH);
    expect(menuOf(mine.section, 'ngân hàng hẹn')!.items.map((i) => i.id)).toEqual(['edit', 'delete']);
    expect(menuOf(mine.section, 'Mình đã chuẩn bị')!.items.map((i) => i.id)).toEqual(['delete']);
    mine.unmount();
    const member = await open(HOA);
    expect(menuOf(member.section, 'ngân hàng hẹn')!.items.map((i) => i.id)).toEqual(['delete']);
    member.unmount();
    // The project admins read every task but write none of them: they may comment and may not touch another's comment.
    const admin = await open(LAN);
    expect(within(admin.section).getByRole('textbox', { name: vi_.commentLabel })).toBeTruthy();
    expect(admin.section.querySelector('af-menu')).toBeNull();
  });

  it('edits the author\'s comment with the mention intact, and marks it edited', async () => {
    const { section, fake, task } = await open(MINH);
    await choose(menuOf(section, 'ngân hàng hẹn')!, 'edit');
    const editor = within(section).getByRole('textbox', { name: vi_.commentEditLabel }) as HTMLTextAreaElement;
    expect(editor.value.startsWith('@Lê Thị Hoa ngân hàng hẹn')).toBe(true);
    type(editor, editor.value.replace('thứ Năm', 'thứ Sáu'));
    await act(async () => { fireEvent.click(within(section).getByRole('button', { name: vi_.commentSave })); });
    await waitFor(() => expect(within(section).getByText(/thứ Sáu/)).toBeTruthy());
    expect(within(section).getByText('· đã sửa')).toBeTruthy();
    const stored = (await fake.api.comments(task)).comments[0]!;
    expect(stored.body).toBe(`@[Lê Thị Hoa](mention:user/${HOA}) ngân hàng hẹn thứ Sáu gửi tài khoản thử nghiệm, mình đánh dấu Bị chặn tới lúc đó.`);
  });

  it('deletes a comment after a confirmation', async () => {
    const { section, fake, task } = await open(MINH);
    await choose(menuOf(section, 'Mình đã chuẩn bị')!, 'delete');
    const dialog = section.querySelector<ConfirmEl>('af-confirm')!;
    expect(dialog.open).toBe(true);
    await act(async () => { dialog.dispatchEvent(new CustomEvent('confirm', { bubbles: true })); });
    await waitFor(() => expect(within(section).queryByText(/chuẩn bị xong giao diện/)).toBeNull());
    expect((await fake.api.comments(task)).comments).toHaveLength(1);
  });

  it('lists a comment\'s file in the attachments, marked as in a comment', async () => {
    const seed = createSeed(TEST_NOW);
    seed.files.push({ id: PDF_ID, name: 'bao-gia.pdf', type: 'application/pdf', bytes: new TextEncoder().encode('%PDF') });
    seed.comments!.push({ id: '90000000-0000-4000-8000-0000000000aa', record: seed.records.task!.find((r) => r.body.title === PAYMENT_FLOW)!.id, author: HOA, at: TEST_NOW.toISOString(), body: '', files: [PDF_ID] });
    const { drawer, section } = await open(MINH, PAYMENT_FLOW, { seed });
    const row = await waitFor(() => {
      const el = drawer.querySelector<HTMLElement>('[data-field="attachments"] [data-file][data-source="comment"]');
      if (!el) throw new Error('not listed yet');
      return el;
    });
    expect(row.dataset.file).toBe(PDF_ID);
    expect(row.textContent).toContain('bao-gia.pdf');
    expect(row.textContent).toContain('trong bình luận');
    // And in the comment that holds it.
    expect(section.querySelector(`.comment-files a[href$="${PDF_ID}/download"]`)).toBeTruthy();
  });

  it('attaches a file to a comment', async () => {
    const { section, fake, task } = await open(MINH);
    const input = section.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['%PDF-1.4'], 'bien-ban.pdf', { type: 'application/pdf' });
    await act(async () => { fireEvent.change(input, { target: { files: [file] } }); });
    expect(await within(section).findByRole('button', { name: 'Bỏ tệp bien-ban.pdf' })).toBeTruthy();
    await send(section);
    await waitFor(() => expect(within(section).getByRole('heading', { name: 'Bình luận · 3' })).toBeTruthy());
    expect((await fake.api.comments(task)).comments.at(-1)?.files.map((f) => f.name)).toEqual(['bien-ban.pdf']);
  });

  it('hides the file button on a standalone host', async () => {
    const standalone = await open(MINH, PAYMENT_FLOW, { standalone: true });
    expect(standalone.section.querySelector('input[type="file"]')).toBeNull();
    expect(within(standalone.section).queryByText(vi_.commentAttach)).toBeNull();
    standalone.unmount();
    const embedded = await open(MINH);
    expect(embedded.section.querySelector('input[type="file"]')).toBeTruthy();
  });

  it('shows another person\'s comment as it arrives', async () => {
    const { section, fake, task } = await open(MINH);
    fake.server.actAs(HOA);
    await act(async () => { await fake.api.postComment(task, { body: 'Tin mới từ Hoa', files: [] }); });
    fake.server.actAs(MINH);
    expect(await within(section).findByText('Tin mới từ Hoa')).toBeTruthy();
  });

  it('draws a record mention by what the server says of it: a link, restricted, or deleted', async () => {
    const seed = createSeed(TEST_NOW);
    const idOf = (title: string) => seed.records.task!.find((r) => r.body.title === title)!.id;
    const entity = seed.ids.entities.task;
    seed.comments!.push({
      id: '90000000-0000-4000-8000-0000000000bb', record: idOf(PAYMENT_FLOW), author: HOA, at: TEST_NOW.toISOString(),
      body: `Xem @[Cũ](mention:record/${entity}/${idOf('Thu thập yêu cầu từ khách hàng')}), `
        + `@[Mật](mention:record/${entity}/${idOf('Gia hạn hợp đồng thuê văn phòng')}) và @[Đã xoá](mention:record/${entity}/00000000-0000-4000-8000-0000000000ee)`,
    });
    const { section } = await open(MINH, PAYMENT_FLOW, { seed });
    const chips = [...section.querySelectorAll<HTMLElement>('.comment:last-child .mention-chip')];
    expect(chips.map((c) => [c.dataset.state, c.textContent])).toEqual([
      ['record', 'Thu thập yêu cầu từ khách hàng'], ['restricted', vi_.commentRestricted], ['deleted', vi_.commentRecordDeleted],
    ]);
    expect(chips[0]!.getAttribute('href')).toContain(`/entities/${entity}/records/`);
    for (const word of ['Gia hạn hợp đồng', 'Mật', 'Đã xoá', 'Cũ']) expect(section.textContent).not.toContain(word);
  });

  it('draws a mention missing from the server\'s map as restricted', async () => {
    const comment = {
      id: 'c1', authorId: MINH, authorName: 'Trần Văn Minh', body: `Nhờ @[Lộ tên](mention:user/${TUAN}) xem`, createdAt: TEST_NOW.toISOString(),
      editedAt: null, canEdit: false, canDelete: false, files: [], mentions: {},
    };
    renderProjects(<CommentBody comment={comment} />, { lang: 'vi' });
    const chip = await screen.findByText(vi_.commentRestricted);
    expect(chip.closest('.mention-chip')?.getAttribute('data-state')).toBe('restricted');
    expect(document.body.textContent).not.toContain('Lộ tên');
  });

  it('tells two people of one name apart, in a new comment', async () => {
    const seed = twinSeed();
    const { section, fake, task } = await open(MINH, PAYMENT_FLOW, { seed });
    for (const email of ['hoa@example.com', 'hoa.le@example.com']) {
      type(box(section), `${box(section).value}@Lê Thị Hoa`);
      const options = await within(section).findAllByRole('option', { name: new RegExp(email.replace('.', '\\.')) });
      fireEvent.mouseDown(options[0]!);
    }
    expect(box(section).value).toBe('@Lê Thị Hoa @Lê Thị Hoa (hoa.le) ');
    await send(section);
    await waitFor(() => expect(section.querySelectorAll('.comment').length).toBe(3));
    const body = (await fake.api.comments(task)).comments.at(-1)!.body;
    // The thread shows each person's current name, so the two read alike there; the ids are what was told apart.
    expect(scanMentions(body).map((t) => t.target)).toEqual([`user/${HOA}`, `user/${TWIN}`]);
  });

  it('keeps two same-named people raw when their comment is edited, so a save names the same two', async () => {
    const seed = twinSeed();
    const body = `@[Lê Thị Hoa](mention:user/${HOA}) và @[Lê Thị Hoa](mention:user/${TWIN}) xem giúp`;
    seed.comments!.push({ id: '90000000-0000-4000-8000-0000000000cc', record: seed.records.task!.find((r) => r.body.title === PAYMENT_FLOW)!.id, author: MINH, at: TEST_NOW.toISOString(), body });
    const { section, fake, task } = await open(MINH, PAYMENT_FLOW, { seed });
    await choose([...section.querySelectorAll<HTMLElement>('.comment')].at(-1)!.querySelector<MenuEl>('af-menu')!, 'edit');
    const editor = within(section).getByLabelText(vi_.commentEditLabel) as HTMLTextAreaElement;
    expect(editor.value).toBe(body);
    type(editor, `${body}, cảm ơn`);
    await act(async () => { fireEvent.click(within(section).getByRole('button', { name: vi_.commentSave })); });
    await waitFor(() => expect(within(section).getByText(/cảm ơn/)).toBeTruthy());
    expect((await fake.api.comments(task)).comments.at(-1)!.body).toBe(`${body}, cảm ơn`);
  });

  it('draws raw HTML and a javascript link as text', async () => {
    const { section } = await open(MINH);
    type(box(section), '<img src=x onerror=alert(1)> [x](javascript:alert(1)) <b>đậm</b>');
    await send(section);
    const mine = await waitFor(() => {
      const el = [...section.querySelectorAll<HTMLElement>('.comment-text')].find((c) => c.textContent?.includes('onerror'));
      if (!el) throw new Error('not yet');
      return el;
    });
    expect(mine.textContent).toBe('<img src=x onerror=alert(1)> [x](javascript:alert(1)) <b>đậm</b>');
    expect(mine.querySelector('img, b, a')).toBeNull();
  });

  it('says a refused delete is for the author or an editor of the task', async () => {
    const { section, fake } = await open(MINH);
    fake.server.failNext('DELETE', /\/comments\//, 403, { type: 'COMMENT_NOT_AUTHOR', title: 'Forbidden', status: 403, detail: 'COMMENT_NOT_AUTHOR: x' });
    await choose(menuOf(section, 'Mình đã chuẩn bị')!, 'delete');
    await act(async () => { section.querySelector('af-confirm')!.dispatchEvent(new CustomEvent('confirm', { bubbles: true })); });
    await waitFor(() => expect(toasts()).toContain(`Không xoá được: ${vi_.commentReasonCannotDelete}`));
  });

  it('drops the older pages it loaded when a refetch moves the newest page', async () => {
    const seed = createSeed(TEST_NOW);
    const record = seed.records.task!.find((r) => r.body.title === PAYMENT_FLOW)!.id;
    for (let i = 0; i < 52; i++) {
      seed.comments!.push({ id: `91000000-0000-4000-8000-${String(i).padStart(12, '0')}`, record, author: MINH, at: new Date(TEST_NOW.getTime() - (60 - i) * 60_000).toISOString(), body: `bình luận ${i}` });
    }
    const { section, fake, task } = await open(MINH, PAYMENT_FLOW, { seed });
    await act(async () => { fireEvent.click(within(section).getByRole('button', { name: vi_.commentsOlder })); });
    await waitFor(() => expect(section.querySelectorAll('.comment').length).toBe(54));
    expect(within(section).queryByRole('button', { name: vi_.commentsOlder })).toBeNull();
    fake.server.actAs(HOA);
    await act(async () => { await fake.api.postComment(task, { body: 'mới nhất', files: [] }); });
    fake.server.actAs(MINH);
    await waitFor(() => expect(within(section).getByText('mới nhất')).toBeTruthy());
    expect(section.querySelectorAll('.comment').length).toBe(50);
    expect(within(section).getByRole('button', { name: vi_.commentsOlder })).toBeTruthy();
  });
});

const TWIN = '00000000-0000-4000-8000-0000000000f7';
function twinSeed() {
  const seed = createSeed(TEST_NOW);
  seed.people = [...seed.people, { id: TWIN, name: 'Lê Thị Hoa', email: 'hoa.le@example.com' }];
  seed.groups.users = [...GROUPS.users, TWIN];
  const launch = seed.records.project!.find((r) => r.body.name === LAUNCH)!;
  launch.body.members = [...(launch.body.members as string[]), TWIN];
  return seed;
}
