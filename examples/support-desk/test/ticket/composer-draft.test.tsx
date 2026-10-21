// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeskError, type DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { Desk } from '../../src/shell/Desk.js';
import { HA, renderDesk, TEST_NOW } from '../support/render.js';

const ANA = '30000000-0000-4000-8000-000000000002';
const KHOA = '30000000-0000-4000-8000-000000000001';
const DRAFT = '40000000-0000-4000-8000-000000000005';
const SLOW = { timeout: 3000 };

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.pushState({}, '', `/f/mine/t/${ANA}`);
});
afterEach(() => vi.useRealTimers());

const box = () => screen.getByRole('textbox', { name: 'Reply' }) as HTMLTextAreaElement;
const serverBody = (fake: ReturnType<typeof createFakeDesk>) => fake.server.records('reply').find((r) => r.id === DRAFT)?.body;

async function opened() {
  await waitFor(() => expect(box().value).toContain('Good news: your parcel was mislabelled'));
}

describe('a composer that cannot tell who is writing', () => {
  it('says the reply box is not available, in either language, when the profile cannot be loaded', async () => {
    const broken = (api: DeskApi): DeskApi => ({ ...api, me: () => Promise.reject(new DeskError('failed', 500, 'INTERNAL_ERROR')) });
    const first = renderDesk(<Desk />, { api: broken });
    const line = await screen.findByText('Couldn\'t load your profile, so the reply box isn\'t available. Reload the page.', {}, SLOW);
    expect(line.closest('[role="alert"]')).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Reply' })).toBeNull();
    first.unmount();
    renderDesk(<Desk />, { api: broken, lang: 'vi' });
    expect(await screen.findByText('Không tải được hồ sơ của bạn nên chưa dùng được ô trả lời. Hãy tải lại trang.', {}, SLOW)).toBeTruthy();
  });

  it('leaves the lost-session banner to say so when the profile fails because the session ended', async () => {
    renderDesk(<Desk />, { api: (api) => ({ ...api, me: () => Promise.reject(new DeskError('signed_out', 401, 'NOT_SIGNED_IN')) }) });
    expect(await screen.findByText(/You were signed out/, {}, SLOW)).toBeTruthy();
    expect(screen.queryByText(/Couldn't load your profile/)).toBeNull();
    expect(screen.queryByRole('textbox', { name: 'Reply' })).toBeNull();
  });
});

describe('the draft', () => {
  it('opens with the AI draft, its age and its sources', async () => {
    renderDesk(<Desk />);
    await opened();
    expect(screen.getByText(/^AI draft · .+ ago$/)).toBeTruthy();
    for (const s of ['Shipping times and carriers', 'Lost or delayed parcels', 'Team note']) expect(screen.getByText(s)).toBeTruthy();
    expect(screen.getByText('Ana Lima <ana@example.com>')).toBeTruthy();
  });

  it('saves what the person types, as them', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Hi Ana, it ships today.' } });
    expect(window.sessionStorage.getItem(`support-desk:draft:${DEMO_PEOPLE.bo}:${ANA}`)).toBe('Hi Ana, it ships today.');
    await waitFor(() => expect(serverBody(fake)).toMatchObject({ body: 'Hi Ana, it ships today.', author_user: DEMO_PEOPLE.bo }), SLOW);
    expect(screen.getByText('Saved just now')).toBeTruthy();
    expect(window.sessionStorage.getItem(`support-desk:draft:${DEMO_PEOPLE.bo}:${ANA}`)).toBeNull();
  });

  it('asks before replacing unsaved text with a teammate\'s edit, and keeps mine on request', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Bo\'s version' } });
    act(() => { fake.server.write('reply', DRAFT, { body: 'Hà\'s version', author_user: DEMO_PEOPLE.ha }); });
    expect(await screen.findByText('Hà Nguyễn edited this draft.')).toBeTruthy();
    expect(box().value).toBe('Bo\'s version');
    fireEvent.click(screen.getByRole('button', { name: 'Keep mine' }));
    await waitFor(() => expect(serverBody(fake)).toMatchObject({ body: 'Bo\'s version', author_user: DEMO_PEOPLE.bo }), SLOW);
  });

  it('uses theirs on request', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Bo\'s version' } });
    act(() => { fake.server.write('reply', DRAFT, { body: 'Hà\'s version', author_user: DEMO_PEOPLE.ha }); });
    fireEvent.click(await screen.findByRole('button', { name: 'Use theirs' }));
    expect(box().value).toBe('Hà\'s version');
  });

  it('takes a teammate\'s edit quietly when nothing is unsaved', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    act(() => { fake.server.write('reply', DRAFT, { body: 'Hà\'s version', author_user: DEMO_PEOPLE.ha }); });
    await waitFor(() => expect(box().value).toBe('Hà\'s version'));
    expect(screen.queryByText(/edited this draft/)).toBeNull();
  });

  it('says the AI rewrote the draft, rather than crediting the last person to type', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Bo\'s version' } });
    // A redraft keeps the last editor as `author_user`, so the text being the AI's own is what tells it apart.
    act(() => { fake.server.write('reply', DRAFT, { body: 'A fresh AI version', ai_body: 'A fresh AI version', author_user: DEMO_PEOPLE.bo }); });
    expect(await screen.findByText('The AI rewrote this draft.')).toBeTruthy();
    expect(screen.queryByText(/Bo Tran edited this draft/)).toBeNull();
    expect(box().value).toBe('Bo\'s version');
  });

  it('redrafts shorter from the text on the screen, and Undo redraft brings the old text back', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    const before = box().value;
    fireEvent.click(screen.getByRole('button', { name: 'Shorter' }));
    await waitFor(() => expect(box().value.length).toBeLessThan(before.length), SLOW);
    // The drafting agent never reads the saved draft, so the instruction carries what to revise.
    expect(fake.server.runs().at(-1)).toMatchObject({
      workflow: 'draft_reply', subjectId: ANA, params: { instruction: `Make it shorter.\n\nThe draft to revise:\n${before}` },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Undo redraft' }));
    expect(box().value).toBe(before);
    await waitFor(() => expect(serverBody(fake)?.body).toBe(before), SLOW);
  });

  it('redrafts what the person has typed, not what the server last held', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Hi Ana,\n\nIt ships today. It is express. It arrives Thursday.\n\nBo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Shorter' }));
    await waitFor(() => expect(box().value).toBe('Hi Ana,\n\nIt ships today.\n\nBo'), SLOW);
    expect(fake.server.runs().at(-1)?.params.instruction).toContain('The draft to revise:\nHi Ana,\n\nIt ships today. It is express.');
  });

  it('shows a redraft the moment it is pushed, and stops polling for it', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    let signal: AbortSignal | undefined;
    // The poll never answers, so only the live push can show the new text.
    const hanging = (api: DeskApi): DeskApi => ({
      ...api,
      waitForRun: (_id, opts) => new Promise((_, reject) => {
        signal = opts.signal;
        opts.signal?.addEventListener('abort', () => reject(new DOMException('cancelled', 'AbortError')));
      }),
    });
    renderDesk(<Desk />, { fake, api: hanging });
    await opened();
    const before = box().value;
    fireEvent.click(screen.getByRole('button', { name: 'Shorter' }));
    await screen.findByText(/^Writing a new version \(Shorter\)/);
    await act(async () => { await fake.server.settle(); });
    await waitFor(() => expect(box().value.length).toBeLessThan(before.length), SLOW);
    expect(screen.queryByText(/^Writing a new version/)).toBeNull();
    expect(signal?.aborted).toBe(true);
  });

  it('names a redraft in the person\'s language, and shows a typed instruction as it was typed', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fake = createFakeDesk({ now: TEST_NOW, draftDelayMs: 60_000 });
    renderDesk(<Desk />, { fake, lang: 'vi' });
    const vietnameseBox = () => screen.getByRole('textbox', { name: 'Câu trả lời' }) as HTMLTextAreaElement;
    await waitFor(() => expect(vietnameseBox().value).toContain('Good news'));
    fireEvent.click(screen.getByRole('button', { name: 'Ngắn hơn' }));
    expect(await screen.findByText(/^Đang viết phiên bản mới \(Ngắn hơn\)/)).toBeTruthy();
    expect(screen.queryByText(/Make it shorter/)).toBeNull();
    // The agent still gets its instruction in English.
    expect(String(fake.server.runs().at(-1)?.params.instruction)).toMatch(/^Make it shorter\./);
    await act(async () => { await fake.server.settle(); });
    await waitFor(() => expect(screen.queryByText(/^Đang viết phiên bản mới/)).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Tùy chỉnh…' }));
    const custom = screen.getByRole('textbox', { name: 'Tùy chỉnh…' });
    fireEvent.change(custom, { target: { value: 'Nói gọn hơn nữa' } });
    fireEvent.keyDown(custom, { key: 'Enter' });
    expect(await screen.findByText(/^Đang viết phiên bản mới \(Nói gọn hơn nữa\)/)).toBeTruthy();
    await act(async () => { await fake.server.settle(); });
  });

  it('keeps the reply editable while a teammate has the ticket open, and saves what is typed', async () => {
    const { fake, live } = renderDesk(<Desk />);
    await opened();
    // A teammate with the ticket open leaves the reply this person's to edit and save.
    act(() => live.setPresence(ANA, [HA.id]));
    expect(box().readOnly).toBe(false);
    expect(screen.queryByText(/is replying to this ticket/)).toBeNull();
    expect(screen.queryByText('Only you are writing')).toBeNull();
    fireEvent.change(box(), { target: { value: 'Mine now.' } });
    await waitFor(() => expect(serverBody(fake)).toMatchObject({ body: 'Mine now.' }), SLOW);
  });

  it('names the Alt+S redraft in the person\'s language too', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fake = createFakeDesk({ now: TEST_NOW, draftDelayMs: 60_000 });
    renderDesk(<Desk />, { fake, lang: 'vi' });
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Câu trả lời' }) as HTMLTextAreaElement).value).toContain('Good news'));
    fireEvent.keyDown(document.body, { key: 's', code: 'KeyS', altKey: true });
    expect(await screen.findByText(/^Đang viết phiên bản mới \(Ngắn hơn\)/)).toBeTruthy();
    await act(async () => { await fake.server.settle(); });
  });

  it('says the redraft was not saved when the run ends "Not saved", and keeps the text', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    const before = box().value;
    fake.server.nextDraftOutcome('Not saved');
    fireEvent.click(screen.getByRole('button', { name: 'Shorter' }));
    expect(await screen.findByText('The redraft wasn\'t saved: the draft or the conversation changed while the AI was writing.', {}, SLOW)).toBeTruthy();
    expect(box().value).toBe(before);
    expect(screen.queryByRole('button', { name: 'Undo redraft' })).toBeNull(); // nothing was redrafted
  });

  it('says so, without the run\'s own message, when the run fails', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fake.server.nextDraftOutcome('failed');
    fireEvent.click(screen.getByRole('button', { name: 'Friendlier' }));
    expect(await screen.findByText('The AI couldn\'t write a redraft. Try again.', {}, SLOW)).toBeTruthy();
    expect(screen.queryByText(/Scripted failure/)).toBeNull();
    expect(box().value).toContain('Good news');
  });

  it('gives up on a redraft that takes over a minute, and leaves the draft as it was', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fake = createFakeDesk({ now: TEST_NOW, draftDelayMs: 120_000 });
    renderDesk(<Desk />, { fake });
    await opened();
    const before = box().value;
    fireEvent.click(screen.getByRole('button', { name: 'Shorter' }));
    await screen.findByText(/^Writing a new version/);
    await act(async () => { await vi.advanceTimersByTimeAsync(61_000); });
    expect(await screen.findByText('The redraft is taking longer than usual. Your draft is unchanged.')).toBeTruthy();
    expect(box().value).toBe(before);
    await act(async () => { await fake.server.settle(); });
  });

  it('stops waiting for a redraft when the ticket is closed', async () => {
    const signals: (AbortSignal | undefined)[] = [];
    const fake = createFakeDesk({ now: TEST_NOW, draftDelayMs: 60_000 });
    const watching = (api: DeskApi): DeskApi => ({
      ...api,
      waitForRun: (id, opts) => { signals.push(opts.signal); return api.waitForRun(id, opts); },
    });
    const view = renderDesk(<Desk />, { fake, api: watching });
    await opened();
    fireEvent.click(screen.getByRole('button', { name: 'Shorter' }));
    await waitFor(() => expect(signals).toHaveLength(1), SLOW);
    expect(signals[0]?.aborted).toBe(false);
    view.unmount();
    expect(signals[0]?.aborted).toBe(true);
    await fake.server.settle();
  });

  it('keeps typing through a dropped network and saves when back online (Review Focus 2)', async () => {
    let offline = true;
    const { fake } = renderDesk(<Desk />, {
      api: (api) => ({
        ...api,
        saveDraft: (...args) => (offline ? Promise.reject(new DeskError('offline', 0, 'NETWORK')) : api.saveDraft(...args)),
      }),
    });
    await opened();
    fireEvent.change(box(), { target: { value: 'Typed on the train' } });
    expect(await screen.findByText('Not saved: you\'re offline. It saves when you\'re back.', {}, SLOW)).toBeTruthy();
    // The socket comes back and the thread is refetched: the unsaved text stays.
    act(() => { fake.server.write('note', null, { ticket: ANA, kind: 'staff', body: 'meanwhile' }); });
    await screen.findByText('meanwhile');
    expect(box().value).toBe('Typed on the train');
    offline = false;
    act(() => { window.dispatchEvent(new Event('online')); });
    await waitFor(() => expect(serverBody(fake)?.body).toBe('Typed on the train'), SLOW);
  });

  it('keeps the text through a lost session and saves it after signing in again (Review Focus 3)', async () => {
    const first = renderDesk(<Desk />, {
      api: (api) => ({ ...api, saveDraft: () => Promise.reject(new DeskError('signed_out', 401, 'NOT_SIGNED_IN')) }),
    });
    await opened();
    fireEvent.change(box(), { target: { value: 'Half a reply' } });
    expect(await screen.findByRole('button', { name: 'Sign in again' }, SLOW)).toBeTruthy();
    expect(window.sessionStorage.getItem(`support-desk:draft:${DEMO_PEOPLE.bo}:${ANA}`)).toBe('Half a reply');
    first.unmount();

    const fake = createFakeDesk({ now: TEST_NOW });
    renderDesk(<Desk />, { fake });
    await waitFor(() => expect(box().value).toBe('Half a reply'));
    await waitFor(() => expect(serverBody(fake)?.body).toBe('Half a reply'), SLOW);
  });

  describe('text kept from before the draft was last read (Review Focus 3)', () => {
    /** A first desk where the person types and the save never lands, then a fresh one the text is restored into. */
    async function leaveWithUnsavedText(text: string, failure: DeskError) {
      const first = renderDesk(<Desk />, { api: (api) => ({ ...api, saveDraft: () => Promise.reject(failure) }) });
      await opened();
      fireEvent.change(box(), { target: { value: text } });
      await waitFor(() => expect(window.sessionStorage.getItem(`support-desk:draft:${DEMO_PEOPLE.bo}:${ANA}`)).toBe(text));
      await act(async () => { await new Promise((r) => setTimeout(r, 1000)); }); // the save has been tried
      first.unmount();
    }

    it('does not hand one person\'s unsent text to the next person who signs in to the tab', async () => {
      const first = renderDesk(<Desk />, { api: (api) => ({ ...api, saveDraft: () => Promise.reject(new DeskError('signed_out', 401, 'NOT_SIGNED_IN')) }) });
      await opened();
      fireEvent.change(box(), { target: { value: 'Bo was halfway through this' } });
      const kept = () => Array.from({ length: window.sessionStorage.length }, (_, i) => window.sessionStorage.getItem(window.sessionStorage.key(i)!));
      await waitFor(() => expect(kept()).toContain('Bo was halfway through this'));
      first.unmount();

      const fake = createFakeDesk({ now: TEST_NOW });
      renderDesk(<Desk />, {
        fake,
        api: (api): DeskApi => ({ ...api, me: async () => ({ ...(await api.me()), id: DEMO_PEOPLE.ha, displayName: 'Hà Nguyễn', email: 'ha@example.com' }) }),
      });
      await opened();
      expect(box().value).not.toContain('Bo was halfway');
      await act(async () => { await new Promise((r) => setTimeout(r, 1500)); });
      expect(serverBody(fake)?.body).toContain('Good news: your parcel was mislabelled'); // nothing of Bo's was saved as Hà
    });

    it('asks instead of overwriting when a teammate edited the draft while the session was lost', async () => {
      await leaveWithUnsavedText('Half a reply', new DeskError('signed_out', 401, 'NOT_SIGNED_IN'));
      const fake = createFakeDesk({ now: TEST_NOW });
      fake.server.write('reply', DRAFT, { body: 'Hà\'s version, written meanwhile', author_user: DEMO_PEOPLE.ha });
      renderDesk(<Desk />, { fake });
      expect(await screen.findByText('Hà Nguyễn edited this draft.')).toBeTruthy();
      expect(box().value).toBe('Half a reply');
      await act(async () => { await new Promise((r) => setTimeout(r, 1500)); });
      expect(serverBody(fake)?.body).toBe('Hà\'s version, written meanwhile'); // not overwritten
      fireEvent.click(screen.getByRole('button', { name: 'Keep mine' }));
      await waitFor(() => expect(serverBody(fake)).toMatchObject({ body: 'Half a reply', author_user: DEMO_PEOPLE.bo }), SLOW);
    });

    it('saves it without asking when the draft is the one it was typed on', async () => {
      await leaveWithUnsavedText('Half a reply', new DeskError('signed_out', 401, 'NOT_SIGNED_IN'));
      const fake = createFakeDesk({ now: TEST_NOW });
      renderDesk(<Desk />, { fake });
      await waitFor(() => expect(serverBody(fake)?.body).toBe('Half a reply'), SLOW);
      expect(screen.queryByRole('button', { name: 'Keep mine' })).toBeNull();
    });

    it('saves it as a new draft, without asking, when the draft is gone', async () => {
      await leaveWithUnsavedText('Half a reply', new DeskError('signed_out', 401, 'NOT_SIGNED_IN'));
      const fake = createFakeDesk({ now: TEST_NOW });
      fake.server.remove('reply', DRAFT);
      renderDesk(<Desk />, { fake });
      await waitFor(() => expect(fake.server.records('reply').some((r) => r.body.key === `draft:${ANA}` && r.body.body === 'Half a reply')).toBe(true), SLOW);
      expect(screen.queryByRole('button', { name: 'Keep mine' })).toBeNull();
    });

    it('asks, next time, when the save made as the ticket was left met someone else\'s edit', async () => {
      const fake = createFakeDesk({ now: TEST_NOW });
      const racing = (api: DeskApi): DeskApi => ({
        ...api,
        saveDraft: async (...args) => { fake.server.write('reply', DRAFT, { body: 'Hà got in first', author_user: DEMO_PEOPLE.ha }); return api.saveDraft(...args); },
      });
      const first = renderDesk(<Desk />, { fake, api: racing });
      await opened();
      fireEvent.change(box(), { target: { value: 'Typed, then left' } });
      first.unmount(); // the save goes as the box closes, and is refused as stale
      await act(async () => { await new Promise((r) => setTimeout(r, 500)); });
      expect(serverBody(fake)?.body).toBe('Hà got in first');
      expect(window.sessionStorage.getItem(`support-desk:draft:${DEMO_PEOPLE.bo}:${ANA}`)).toBe('Typed, then left');
      renderDesk(<Desk />, { fake });
      expect(await screen.findByText('Hà Nguyễn edited this draft.')).toBeTruthy();
      expect(box().value).toBe('Typed, then left');
    });

    it('does not make a draft behind the person\'s back when the save made as the ticket was left finds the draft already sent', async () => {
      const fake = createFakeDesk({ now: TEST_NOW });
      const sentFirst = (api: DeskApi): DeskApi => ({
        ...api,
        saveDraft: async (...args) => {
          fake.server.write('reply', DRAFT, { status: 'sent', key: 'outbound:elsewhere', author_user: DEMO_PEOPLE.ha });
          return api.saveDraft(...args);
        },
      });
      const first = renderDesk(<Desk />, { fake, api: sentFirst });
      await opened();
      fireEvent.change(box(), { target: { value: 'Typed, then left' } });
      first.unmount();
      await act(async () => { await new Promise((r) => setTimeout(r, 1500)); });
      expect(fake.server.records('reply').some((r) => r.body.key === `draft:${ANA}`)).toBe(false);
      expect(window.sessionStorage.getItem(`support-desk:draft:${DEMO_PEOPLE.bo}:${ANA}`)).toBe('Typed, then left');
      // Next time, the draft is gone, which is not a question: the text becomes the ticket's draft.
      renderDesk(<Desk />, { fake });
      await waitFor(() => expect(fake.server.records('reply').some((r) => r.body.key === `draft:${ANA}` && r.body.body === 'Typed, then left')).toBe(true), SLOW);
    });

    it('saves text left behind offline once the ticket is opened again', async () => {
      await leaveWithUnsavedText('Typed on the train', new DeskError('offline', 0, 'NETWORK'));
      const fake = createFakeDesk({ now: TEST_NOW });
      renderDesk(<Desk />, { fake });
      await waitFor(() => expect(serverBody(fake)?.body).toBe('Typed on the train'), SLOW);
    });
  });

  it('says "Not saved" while a teammate\'s edit and this person\'s text wait on a choice', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Bo\'s version' } });
    act(() => { fake.server.write('reply', DRAFT, { body: 'Hà\'s version', author_user: DEMO_PEOPLE.ha }); });
    await screen.findByText('Hà Nguyễn edited this draft.');
    expect(screen.getByText('Not saved: choose Keep mine or Use theirs.')).toBeTruthy();
    expect(screen.queryByText('Saved just now')).toBeNull();
  });

  it('says who sent the draft out from under the text, and keeps the text as a new draft', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'My follow-up thoughts' } });
    act(() => { fake.server.write('reply', DRAFT, { status: 'sent', key: 'outbound:elsewhere', author_user: DEMO_PEOPLE.ha }); });
    expect(await screen.findByText('Hà Nguyễn just sent a reply. Your text is kept as a new draft.')).toBeTruthy();
    expect(box().value).toBe('My follow-up thoughts');
    await waitFor(() => expect(fake.server.records('reply').some((r) => r.body.key === `draft:${ANA}` && r.body.body === 'My follow-up thoughts')).toBe(true), SLOW);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText(/just sent a reply/)).toBeNull();
  });

  it('does not let a draft that was deleted from under the text lose it: the text becomes a new draft', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Still mine' } });
    // Gone before the autosave runs, and with no change event reaching the page first.
    fake.server.remove('reply', DRAFT);
    await waitFor(() => expect(fake.server.records('reply').some((r) => r.body.key === `draft:${ANA}` && r.body.body === 'Still mine')).toBe(true), SLOW);
    expect(box().value).toBe('Still mine');
  });

  it('saves the last words typed when the person moves to another ticket straight away', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.change(box(), { target: { value: 'Typed, then gone' } });
    act(() => { window.history.pushState({}, '', `/f/mine/t/${KHOA}`); window.dispatchEvent(new PopStateEvent('popstate')); });
    await waitFor(() => expect(serverBody(fake)?.body).toBe('Typed, then gone'), SLOW);
    expect(window.sessionStorage.getItem(`support-desk:draft:${DEMO_PEOPLE.bo}:${ANA}`)).toBeNull();
  });

  it('attaches a file to the draft', async () => {
    // jsdom's FormData is not the one Node's fetch reads, so the upload itself is stubbed here;
    // the multipart request is covered by the node-environment tests in test/api.
    const fake = createFakeDesk({ now: TEST_NOW });
    renderDesk(<Desk />, { fake, api: (api) => ({ ...api, upload: async (f: File) => ({ id: fake.server.addFile(f.name), name: f.name }) }) });
    await opened();
    const input = screen.getByLabelText('+ Attach', { selector: 'input' });
    fireEvent.change(input, { target: { files: [new File(['%PDF'], 'invoice.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText('invoice.pdf')).toBeTruthy();
    expect((serverBody(fake)?.attachments as string[]).length).toBe(1);
  });

  it('says so when a file cannot be attached, and keeps the draft', async () => {
    renderDesk(<Desk />, { api: (api) => ({ ...api, upload: () => Promise.reject(new DeskError('failed', 500, 'UPLOAD')) }) });
    await opened();
    fireEvent.change(screen.getByLabelText('+ Attach', { selector: 'input' }), { target: { files: [new File(['x'], 'big.bin')] } });
    expect(await screen.findByText('That didn\'t work. Try again.')).toBeTruthy();
    expect(box().value).toContain('Good news');
  });
});
