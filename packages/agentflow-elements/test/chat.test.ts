import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import '../src/chat/index.js';
import { chatApi, logoUrl, type FollowHandlers, type FollowState, type LoggedMessage } from '../src/chat/transport.js';
import { CHAT_CONFIG, CHAT_ORIGIN, PUBLIC_KEY, answer, fakeChat, row, until } from './chat-support.js';

type Chat = ReturnType<typeof fakeChat>;
type ChatElement = HTMLElement & { fetchImpl?: typeof fetch };

function follower(chat: Chat) {
  const sleep = vi.fn(async (_ms: number, _signal?: AbortSignal) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  const states: FollowState[] = [];
  const on: FollowHandlers = {
    message: vi.fn(),
    typing: vi.fn(),
    reply: vi.fn(),
    verify: vi.fn(),
    closed: vi.fn(),
    invalid: vi.fn(),
    unavailable: vi.fn(),
    unreachable: vi.fn(),
    state: (state) => states.push(state),
  };
  const api = chatApi(CHAT_ORIGIN, PUBLIC_KEY, chat.fetch, { sleep, random: () => 1 });
  const follow = api.follow('afv_1', 0, on);
  onTestFinished(() => follow.stop());
  return { sleep, states, on, follow };
}

async function mountChat(chat: Chat, alongside = false): Promise<{ element: ChatElement; root: ShadowRoot; send(text: string): Promise<HTMLElement> }> {
  if (!alongside) document.body.innerHTML = '';
  const element = document.createElement('agentflow-chat') as ChatElement;
  element.setAttribute('connection', PUBLIC_KEY);
  element.setAttribute('api-base', `${CHAT_ORIGIN}/api/v1/`);
  element.fetchImpl = chat.fetch;
  document.body.append(element);
  const root = element.shadowRoot!;
  const part = (name: string) => root.querySelector<HTMLElement>(`[part='${name}']`)!;
  await until(() => !part('launcher').hidden, 'the launcher');
  part('launcher').click();
  const send = async (text: string) => {
    const before = root.querySelectorAll("[part='message']").length;
    (part('input') as HTMLTextAreaElement).value = text;
    part('composer').dispatchEvent(new Event('submit', { cancelable: true }));
    const bubbles = root.querySelectorAll<HTMLElement>("[part='message']");
    expect(bubbles.length, 'the bubble shows at once').toBe(before + 1);
    return bubbles[bubbles.length - 1]!;
  };
  return { element, root, send };
}

const posts = (chat: Chat) => chat.calls.filter((c) => c.method === 'POST' && c.path === 'messages');
const problem = (status: number, type: string, headers: Record<string, string> = {}) => answer(status, { type, title: type, status }, headers);
const sse = (body: ReadableStream<Uint8Array> | string) => new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
const shown = (root: ShadowRoot, name: string) => {
  const node = root.querySelector<HTMLElement>(`[part='${name}']`)!;
  return node.hidden ? null : node.textContent;
};
const input = (root: ShadowRoot) => root.querySelector<HTMLTextAreaElement>("[part='input']")!;
const settle = async () => {
  for (let i = 0; i < 20; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  localStorage.clear();
});

const CASES: { name: string; run(): Promise<void> }[] = [
  {
    name: 'a reconnect sends Last-Event-ID with the last position',
    async run() {
      const chat = fakeChat();
      const { sleep } = follower(chat);
      await until(() => chat.streams.length === 1, 'the first connect');
      expect(chat.streams[0]!.headers.has('last-event-id'), 'nothing to resume from at position 0').toBe(false);
      chat.streams[0]!.push('message', row(3, 'agent', 'Hi'), 3);
      chat.streams[0]!.end();
      await until(() => chat.streams.length === 2, 'the reconnect');
      expect(chat.streams[1]!.headers.get('last-event-id')).toBe('3');
      expect(sleep).toHaveBeenCalledWith(1000, expect.anything());
    },
  },
  {
    name: 'a 429 is waited out by its Retry-After, at most 30 s, before connecting again',
    async run() {
      const waits = ['5', '3600'];
      const chat = fakeChat((call) => {
        const wait = call.path === 'stream' ? waits.shift() : undefined;
        return wait === undefined ? undefined : problem(429, 'CHAT_RATE_LIMITED', { 'retry-after': wait });
      });
      const { sleep, states } = follower(chat);
      await until(() => chat.streams.length === 1, 'the connect after the waits');
      expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([5000, 30000]);
      expect(states).toEqual(['waiting', 'connecting', 'waiting', 'connecting', 'live']);
    },
  },
  {
    name: 'only an event stream is live, and the backoff resets after a parsed frame or 15 s connected, never on bytes alone',
    async run() {
      let clock = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => clock);
      const encoder = new TextEncoder();
      const answers = [
        () => new Response('<html>maintenance</html>', { status: 200, headers: { 'content-type': 'text/html' } }),
        () => sse(': keep-alive\n\n'),
        () => sse(`id: 1\nevent: message\ndata: ${JSON.stringify(row(1, 'agent', 'Hi'))}\n\n`),
        () => sse(new ReadableStream<Uint8Array>({ pull: (c) => void ((clock += 15_000), c.enqueue(encoder.encode(': keep-alive\n\n')), c.close()) }, { highWaterMark: 0 })),
      ];
      const chat = fakeChat((call) => (call.path === 'stream' ? answers.shift()?.() : undefined));
      const { sleep, states, on } = follower(chat);
      await until(() => chat.streams.length === 1, 'the fifth connect');
      expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([1000, 2000, 1000, 1000]);
      expect(states[0], 'a page that is not an event stream is never live').toBe('waiting');
      expect(on.message).toHaveBeenCalledTimes(1);
    },
  },
  {
    name: 'a closed event stops the loop with no further connect and cancels the body',
    async run() {
      const chat = fakeChat();
      const { on, states } = follower(chat);
      await until(() => chat.streams.length === 1, 'the connect');
      chat.streams[0]!.push('closed', { reason: 'thread_closed' });
      await until(() => chat.streams[0]!.cancelled, 'the body cancelled');
      for (let i = 0; i < 20; i++) await new Promise((resolve) => setTimeout(resolve, 0));
      expect(on.closed).toHaveBeenCalledWith('thread_closed');
      expect(states.at(-1)).toBe('ended');
      expect(chat.calls.filter((c) => c.path === 'stream')).toHaveLength(1);
    },
  },
  ...[403, 404].map((status) => ({
    name: `a ${status} on the stream ends it with the unavailable notice and no reconnect`,
    async run() {
      const chat = fakeChat((call) => (call.path === 'stream' ? problem(status, status === 403 ? 'CHAT_ORIGIN_REFUSED' : 'NOT_FOUND') : undefined));
      const { root, send } = await mountChat(chat);
      await send('hello');
      await until(() => shown(root, 'notice') !== null, 'the notice');
      await settle();
      expect(shown(root, 'notice')).toBe('Chat is unavailable right now.');
      expect(input(root).disabled).toBe(true);
      expect(shown(root, 'end')).toBeNull();
      expect(chat.calls.filter((c) => c.path === 'stream')).toHaveLength(1);
    },
  })),
  {
    name: 'connects that get no answer report the stream unreachable once, at the third in a row',
    async run() {
      let failures = 4;
      const chat = fakeChat((call) => {
        if (call.path === 'stream' && failures-- > 0) throw new TypeError('Failed to fetch');
        return undefined;
      });
      const { on, sleep } = follower(chat);
      await until(() => chat.streams.length === 1, 'the connect that is answered');
      expect(sleep).toHaveBeenCalledTimes(4);
      expect(on.unreachable).toHaveBeenCalledTimes(1);
    },
  },
  ...[
    { how: 'answers 404', refuse: () => problem(404, 'NOT_FOUND') },
    { how: 'gets no answer, as a cross-origin refusal does,', refuse: () => Promise.reject(new TypeError('Failed to fetch')) },
  ].map(({ how, refuse }) => ({
    name: `writing after the key was rotated, when opening a session ${how} shows the unavailable notice, not a silent Not sent`,
    async run() {
      let rotated = false;
      const chat = fakeChat((call) => (rotated && (call.path === 'sessions' || call.path === 'config') ? refuse() : undefined));
      const { root, send } = await mountChat(chat);
      rotated = true;
      const bubble = await send('hello again');
      await until(() => bubble.getAttribute('data-state') === 'failed', 'the failed bubble');
      expect(shown(root, 'notice')).toBe('Chat is unavailable right now.');
      expect(input(root).disabled).toBe(true);
      expect(bubble.querySelector("[part='retry']")).toBeNull();
    },
  })),
  {
    name: 'a 503 on config is retried after its Retry-After, and the window then opens as usual',
    async run() {
      let refused = false;
      const chat = fakeChat((call) => {
        if (call.path !== 'config' || refused) return undefined;
        refused = true;
        return problem(503, 'SERVICE_UNAVAILABLE', { 'retry-after': '0' });
      });
      const { element, root } = await mountChat(chat);
      await until(() => !input(root).disabled, 'the input enabled');
      expect(chat.calls.filter((c) => c.path === 'config')).toHaveLength(2);
      expect(shown(root, 'greeting')).toBe('Hello there');
      expect(shown(root, 'notice')).toBeNull();
      expect(element.style.getPropertyValue('--afc-accent')).toBe('#0f766e');
    },
  },
  {
    name: 'a 429 on opening a session says too many chats were started, not too many messages',
    async run() {
      const chat = fakeChat((call) => (call.path === 'sessions' ? problem(429, 'CHAT_RATE_LIMITED', { 'retry-after': '600' }) : undefined));
      const { root, send } = await mountChat(chat);
      const bubble = await send('hello');
      await until(() => bubble.getAttribute('data-state') === 'failed', 'the failed bubble');
      expect(shown(root, 'notice')).toBe('Too many chats were started from this network. Try again later.');
    },
  },
  {
    name: 'Escape while an input method is composing leaves the panel open; Escape after it closes the panel',
    async run() {
      const chat = fakeChat();
      const { root } = await mountChat(chat);
      const escape = (init: KeyboardEventInit, keyCode?: number) => {
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true, ...init });
        if (keyCode !== undefined) Object.defineProperty(event, 'keyCode', { get: () => keyCode });
        input(root).dispatchEvent(event);
      };
      const panelOpen = () => !root.querySelector<HTMLElement>("[part='panel']")!.hidden;
      escape({ isComposing: true });
      expect(panelOpen(), 'isComposing').toBe(true);
      escape({}, 229);
      expect(panelOpen(), 'keyCode 229').toBe(true);
      escape({});
      expect(panelOpen()).toBe(false);
    },
  },
  {
    name: 'a post the closing thread refuses goes to a new session on a clean log, with the same id',
    async run() {
      let release!: () => void;
      const held = new Promise<void>((resolve) => (release = resolve));
      const chat = fakeChat((call) => {
        if (call.path !== 'messages' || call.headers.get('authorization') !== 'Bearer afv_1' || posts(chat).length < 2) return undefined;
        return held.then(() => answer(409, { type: 'MESSAGE_THREAD_CLOSED', title: 'Conflict', status: 409 }));
      });
      const { root, send } = await mountChat(chat);
      const first = await send('first');
      await until(() => chat.streams.length === 1, 'the stream');
      chat.streams[0]!.push('message', row(1, 'visitor', 'first', first.getAttribute('data-client-id')), 1);
      chat.streams[0]!.push('message', row(2, 'agent', 'Hello'), 2);
      await until(() => root.querySelector("[data-position='2']") !== null, 'the reply');
      const second = await send('second');
      await until(() => posts(chat).length === 2, 'the refused post');
      chat.streams[0]!.push('closed', { reason: 'thread_closed' });
      await until(() => chat.streams[0]!.cancelled, 'the closed stream');
      release();
      await until(() => chat.streams.length === 2, 'the new stream');
      const clientId = second.getAttribute('data-client-id');
      expect(posts(chat).at(-1)!.body).toEqual({ text: 'second', client_message_id: clientId });
      expect(posts(chat).at(-1)!.headers.get('authorization')).toBe('Bearer afv_2');
      chat.streams[1]!.push('message', row(1, 'visitor', 'second', clientId), 1);
      await until(() => second.getAttribute('data-position') === '1', 'the new thread logs the message');
      expect(Array.from(root.querySelectorAll("[part='message'] [part='text']"), (n) => n.textContent)).toEqual(['second']);
    },
  },
  {
    name: "storage that throws still sends, and keeps the token for the page's life",
    async run() {
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });
      const chat = fakeChat();
      const { send } = await mountChat(chat);
      await send('first');
      await until(() => posts(chat).length === 1, 'the first post');
      await send('second');
      await until(() => posts(chat).length === 2, 'the second post');
      expect(chat.calls.filter((c) => c.path === 'sessions')).toHaveLength(1);
      expect(posts(chat).map((c) => c.headers.get('authorization'))).toEqual(['Bearer afv_1', 'Bearer afv_1']);
    },
  },
  {
    name: 'an optimistic bubble meeting its log row is the same node, now with its position and no status',
    async run() {
      const chat = fakeChat();
      const { send } = await mountChat(chat);
      const bubble = await send('Where is my order?');
      const status = () => bubble.querySelector("[part='status']")?.textContent;
      expect(status()).toBe('Sending…');
      await until(() => status() === 'Sent', 'Sent');
      await until(() => chat.streams.length === 1, 'the stream');
      const clientId = bubble.getAttribute('data-client-id')!;
      expect(clientId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      chat.streams[0]!.push('message', row(1, 'visitor', 'Where is my order?', clientId), 1);
      await until(() => bubble.hasAttribute('data-position'), 'the log row');
      expect(bubble.isConnected).toBe(true);
      expect(bubble.getAttribute('data-position')).toBe('1');
      expect(bubble.querySelector("[part='status']")).toBeNull();
    },
  },
  {
    name: 'a message whose text is markup is drawn as that literal text',
    async run() {
      const chat = fakeChat();
      const { root, send } = await mountChat(chat);
      await send('hello');
      await until(() => chat.streams.length === 1, 'the stream');
      const markup = '<img src=x onerror=alert(1)>';
      chat.streams[0]!.push('message', { ...row(2, 'person', markup), author_display: markup }, 2);
      await until(() => root.querySelector("[data-position='2']") !== null, 'the reply');
      const reply = root.querySelector("[data-position='2']")!;
      expect(reply.querySelector("[part='text']")!.textContent).toBe(markup);
      expect(reply.querySelector("[part='author']")!.textContent).toBe(markup);
      expect(root.querySelector("[part='live']")!.textContent).toBe(`${markup}: ${markup}`);
      expect(root.querySelectorAll('img')).toHaveLength(0);
    },
  },
];

describe('website chat', () => {
  it.each(CASES)('$name', ({ run }) => run());
});

type Frame =
  | ['started' | 'activity', number, string | null]
  | ['delta', number, string]
  | ['done' | 'abandoned', number]
  | ['row' | 'park', number, string, number]
  | ['reconnect'];

const STREAM = 'run:reply:0';

function push(chat: Chat, frame: Frame): void {
  const stream = chat.streams.at(-1)!;
  switch (frame[0]) {
    case 'started':
    case 'activity':
      return stream.push(`reply.${frame[0]}`, { stream_id: STREAM, segment: frame[1], label: frame[2] });
    case 'delta':
      return stream.push('reply.delta', { stream_id: STREAM, segment: frame[1], text: frame[2] });
    case 'done':
    case 'abandoned':
      return stream.push(`reply.${frame[0]}`, { stream_id: STREAM, segment: frame[1] });
    case 'row':
    case 'park':
      return stream.push('message', { ...row(frame[1], 'agent', frame[2]), stream_id: STREAM, stream_segment: frame[3], ...(frame[0] === 'park' && { stream_parked: true }) }, frame[1]);
    case 'reconnect':
      return stream.end();
  }
}

function drawn(root: ShadowRoot): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[part='log'] > [part='message'], [part='log'] > [part='note']"), (node) => {
    const part = (name: string) => Array.from(node.children).find((child) => child.getAttribute('part') === name)?.textContent;
    const label = part('label');
    if (node.getAttribute('part') === 'note') return ['note:', label && `[${label}]`, part('line'), part('email-offer') && '<offer>', part('text')].filter(Boolean).join(' ');
    const kind = node.hasAttribute('data-draft') ? 'draft' : node.getAttribute('data-state') === 'unsent' ? 'unsent' : node.getAttribute('data-author');
    return [`${kind}:`, part('text'), label && `[${label}]`, node.hasAttribute('data-resent') && `(${part('resent')})`].filter(Boolean).join(' ');
  });
}

const VISITOR = 'visitor: Where is my order?';
const ASKED: Frame[] = [
  ['started', 0, 'Writing'],
  ['delta', 0, 'Your order'],
  ['delta', 0, ' shipped.'],
];
const PARKED: Frame[] = [['started', 0, 'Writing'], ['delta', 0, 'Let me check.'], ['activity', 0, 'Looking up your order'], ['park', 2, 'Let me check.', 0]];
const COMING = 'note: [Looking up your order] The rest of this reply will appear here. <offer>';
const SHIPPED = 'agent: Your order shipped.';

const REPLY_CASES: { name: string; steps: [Frame[], string[]][]; sameNode?: true }[] = [
  { name: 'reply.started opens a draft with its label', steps: [[[['started', 0, 'Writing']], [VISITOR, 'draft: [Writing]']]] },
  {
    name: 'deltas grow the one draft, and a null activity label reads Working on it',
    steps: [
      [ASKED, [VISITOR, 'draft: Your order shipped. [Writing]']],
      [[['activity', 0, null]], [VISITOR, 'draft: Your order shipped. [Working on it…]']],
    ],
  },
  { name: 'reply.done keeps the words and takes the label down', steps: [[[...ASKED, ['done', 0]], [VISITOR, 'draft: Your order shipped.']]] },
  {
    name: 'the stored row swaps into the draft in place',
    steps: [
      [[...ASKED, ['done', 0]], [VISITOR, 'draft: Your order shipped.']],
      [[['row', 2, 'Your order shipped.', 0]], [VISITOR, SHIPPED]],
    ],
    sameNode: true,
  },
  { name: 'reply.abandoned before reply.done removes the draft', steps: [[[...ASKED, ['abandoned', 0]], [VISITOR]]] },
  {
    name: 'a label-only step ends at reply.done',
    steps: [
      [[['started', 0, 'Checking stock']], [VISITOR, 'draft: [Checking stock]']],
      [[['done', 0]], [VISITOR]],
    ],
  },
  {
    name: 'a stored row ends its reply at once, so a reply.done lost or late leaves no label and no line',
    steps: [
      [[...ASKED, ['row', 2, 'Your order shipped.', 0]], [VISITOR, SHIPPED]],
      [[['done', 0], ['abandoned', 0]], [VISITOR, SHIPPED]],
    ],
  },
  {
    name: 'a parked segment stays stored with its label and the line at once, and the resumed step opens a new bubble',
    steps: [
      [PARKED, [VISITOR, 'agent: Let me check.', COMING]],
      [[['started', 1, 'Writing'], ['delta', 1, 'It shipped on Friday.']], [VISITOR, 'agent: Let me check.', 'draft: It shipped on Friday. [Writing]']],
      [[['done', 1], ['row', 3, 'It shipped on Friday.', 1]], [VISITOR, 'agent: Let me check.', 'agent: It shipped on Friday.']],
    ],
  },
  {
    name: 'a resume that parks again keeps the line, and its failure leaves the notice',
    steps: [
      [PARKED, [VISITOR, 'agent: Let me check.', COMING]],
      [[['started', 1, 'Writing']], [VISITOR, 'agent: Let me check.', 'note: [Writing] The rest of this reply will appear here. <offer>']],
      [[['abandoned', 1]], [VISITOR, 'agent: Let me check.', 'note: The rest of this reply could not be sent. Please try again.']],
    ],
  },
  {
    name: 'a second reply.started for a segment restarts its words',
    steps: [
      [ASKED, [VISITOR, 'draft: Your order shipped. [Writing]']],
      [[['started', 0, 'Writing'], ['delta', 0, 'Your order']], [VISITOR, 'draft: Your order [Writing]']],
    ],
  },
  {
    name: 'a stored row before the last delta draws its words once',
    steps: [[[['started', 0, 'Writing'], ['delta', 0, 'Your order'], ['row', 2, 'Your order shipped.', 0], ['delta', 0, ' shipped.']], [VISITOR, SHIPPED]]],
  },
  {
    name: 'a reconnect drops a step still running, which the replay draws again',
    steps: [
      [[['started', 0, 'Checking stock']], [VISITOR, 'draft: [Checking stock]']],
      [[['reconnect']], [VISITOR]],
    ],
  },
  {
    name: 'a reconnect keeps a park, whose frames the stream may no longer hold',
    steps: [
      [PARKED, [VISITOR, 'agent: Let me check.', COMING]],
      [[['reconnect']], [VISITOR, 'agent: Let me check.', COMING]],
      [[['started', 0, 'Writing'], ['delta', 0, 'Let me check.'], ['activity', 0, 'Checking stock']], [VISITOR, 'agent: Let me check.', COMING.replace('Looking up your order', 'Checking stock')]],
    ],
  },
  {
    name: 'reply.done at or past a park lets it go, as when its resumed step had nothing to add',
    steps: [
      [PARKED, [VISITOR, 'agent: Let me check.', COMING]],
      [[['started', 1, 'Writing'], ['done', 1]], [VISITOR, 'agent: Let me check.']],
    ],
  },
  {
    name: 'reply.done at the segment of a park the stream told a reconnected window was sent whole',
    steps: [
      [PARKED, [VISITOR, 'agent: Let me check.', COMING]],
      [[['done', 0]], [VISITOR, 'agent: Let me check.']],
    ],
  },
  {
    name: 'a server older than the park marker: the park reads as a whole reply, and the resumed step opens a new bubble',
    steps: [
      [[...PARKED.slice(0, 3), ['row', 2, 'Let me check.', 0]], [VISITOR, 'agent: Let me check.']],
      [[['started', 1, 'Writing'], ['delta', 1, 'It shipped.']], [VISITOR, 'agent: Let me check.', 'draft: It shipped. [Writing]']],
    ],
  },
  {
    name: 'a reconnect keeps words already read, so an abandon after it still leaves the notice',
    steps: [
      [[...ASKED, ['done', 0], ['reconnect']], [VISITOR, 'draft: Your order shipped.']],
      [[['abandoned', 0]], [VISITOR, 'unsent: This reply could not be sent. Please try again.']],
    ],
  },
  {
    name: 'replayed frames of a stored segment draw nothing of it, not even its label',
    steps: [
      [[['row', 2, 'Your order shipped.', 0], ...ASKED], [VISITOR, SHIPPED]],
      [[['done', 0]], [VISITOR, SHIPPED]],
    ],
  },
  { name: 'reply.abandoned after reply.done replaces the words with a notice', steps: [[[...ASKED, ['done', 0], ['abandoned', 0]], [VISITOR, 'unsent: This reply could not be sent. Please try again.']]] },
  {
    name: 'a stored row after that notice replaces it in place',
    steps: [
      [[...ASKED, ['done', 0], ['abandoned', 0]], [VISITOR, 'unsent: This reply could not be sent. Please try again.']],
      [[['row', 2, 'Your order shipped.', 0]], [VISITOR, SHIPPED]],
    ],
    sameNode: true,
  },
  {
    name: 'reply.abandoned while a parked line shows replaces the line with its notice',
    steps: [
      [PARKED, [VISITOR, 'agent: Let me check.', COMING]],
      [[['abandoned', 1]], [VISITOR, 'agent: Let me check.', 'note: The rest of this reply could not be sent. Please try again.']],
    ],
  },
];

describe('a streamed reply', () => {
  it.each(REPLY_CASES)('$name', async ({ steps, sameNode }) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], shouldAdvanceTime: true, advanceTimeDelta: 1 });
    onTestFinished(() => void vi.useRealTimers());
    const chat = fakeChat();
    const { root, send } = await mountChat(chat);
    const bubble = await send('Where is my order?');
    await until(() => chat.streams.length === 1, 'the stream');
    chat.streams[0]!.push('message', row(1, 'visitor', 'Where is my order?', bubble.getAttribute('data-client-id')), 1);
    await until(() => bubble.hasAttribute('data-position'), 'the logged question');
    const nodes: HTMLElement[][] = [];
    for (const [frames, expected] of steps) {
      for (const frame of frames) {
        const connects = chat.streams.length;
        push(chat, frame);
        if (frame[0] === 'reconnect') await until(() => (vi.advanceTimersByTime(250), chat.streams.length > connects), 'the reconnect');
      }
      await until(() => JSON.stringify(drawn(root)) === JSON.stringify(expected), `${JSON.stringify(expected)}, drawn ${JSON.stringify(drawn(root))}`);
      nodes.push(Array.from(root.querySelectorAll<HTMLElement>("[part='log'] > [part='message']:not([data-author='visitor'])")));
    }
    if (sameNode) expect(nodes[1]![0], 'the stored row is drawn in the same node').toBe(nodes[0]![0]);
  });

  it('draws a message sent again after the visitor confirmed faded with its label, also after a reload', async () => {
    localStorage.setItem(`agentflow-chat:${PUBLIC_KEY}`, 'afv_9');
    localStorage.setItem(`agentflow-chat:${PUBLIC_KEY}:marks`, JSON.stringify({ resentIds: ['again-1'], hasEmail: true }));
    const history = [row(1, 'visitor', 'Where is my order?', 'first-1'), row(2, 'system', 'Verified as a•••@example.org'), row(3, 'visitor', 'Where is my order?', 'again-1')];
    const chat = fakeChat((call) => (call.path.startsWith('messages?') ? answer(200, { messages: history }) : undefined));
    const { root } = await mountChat(chat);
    await until(() => drawn(root).length === 3, 'the restored log');
    expect(drawn(root)).toEqual([VISITOR, 'system: Verified as a•••@example.org', `${VISITOR} (Sent again after you confirmed)`]);
  });

  it('a reload during a park draws its row with the line from the marker alone', async () => {
    localStorage.setItem(`agentflow-chat:${PUBLIC_KEY}`, 'afv_9');
    const history = [row(1, 'visitor', 'Where is my order?', 'first-1'), { ...row(2, 'agent', 'Let me check.'), stream_id: STREAM, stream_segment: 0, stream_parked: true as const }];
    const chat = fakeChat((call) => (call.path.startsWith('messages?') ? answer(200, { messages: history }) : undefined));
    const { root } = await mountChat(chat);
    await until(() => drawn(root).length === 3, 'the restored park');
    expect(drawn(root)).toEqual([VISITOR, 'agent: Let me check.', 'note: [Working on it…] The rest of this reply will appear here. <offer>']);
  });
});

async function askedToVerify(chat: Chat, methods: string[]) {
  const mounted = await mountChat(chat);
  const bubble = await mounted.send('Where is my order?');
  await until(() => chat.streams.length === 1, 'the stream');
  const clientId = bubble.getAttribute('data-client-id');
  chat.streams[0]!.push('message', row(1, 'visitor', 'Where is my order?', clientId), 1);
  chat.streams[0]!.push('message', row(2, 'agent', 'I need to confirm it’s you first.'), 2);
  chat.streams[0]!.push('verify.requested', { methods, requested_at: '2026-11-23T00:00:00Z' });
  const sheet = () => mounted.root.querySelector<HTMLElement>("[part='sheet']")!;
  await until(() => !sheet().hidden, 'the form');
  const field = (name: string) => mounted.root.querySelector<HTMLInputElement>(`#sheet-${name}`)!;
  const submit = (name: string) => field(name).form!.dispatchEvent(new Event('submit', { cancelable: true }));
  return { ...mounted, clientId, sheet, field, submit };
}

const verifyCalls = (chat: Chat) => chat.calls.filter((c) => c.path.startsWith('session/'));

describe('confirming who the visitor is', () => {
  it('by an email code: the address, the masked address and the code, then the last message is posted once more and drawn faded', async () => {
    let codes = 0;
    const chat = fakeChat((call) => {
      if (call.path === 'session/verify/email') return answer(202, { expires_in_seconds: 600 });
      if (call.path === 'session/verify/email/confirm') return codes++ === 0 ? problem(422, 'CHAT_VERIFY_CODE_INVALID') : new Response(null, { status: 204 });
      return undefined;
    });
    const { root, clientId, sheet, field, submit } = await askedToVerify(chat, ['email_code', 'site']);
    expect(root.querySelector<HTMLElement>("[part='sign-in']")!.hidden, 'only the methods the element can draw').toBe(true);
    field('email').value = ' Ada@Example.org ';
    submit('email');
    await until(() => !field('code').closest('form')!.hidden, 'the code form');
    expect(root.querySelector("[part='code-sent']")!.textContent).toBe('We sent a 6-digit code to a•••@example.org.');
    expect(root.activeElement).toBe(field('code'));
    field('code').value = '12 34 56';
    submit('code');
    await until(() => shown(root, 'sheet-error') !== null, 'the refusal');
    expect(shown(root, 'sheet-error')).toBe('That code is wrong or has expired. Check it, or ask for a new one.');
    expect(root.activeElement, 'focus stays in the code field').toBe(field('code'));
    submit('code');
    await until(() => sheet().hidden === true, 'the form closed');
    expect(root.activeElement, 'focus goes back to the composer').toBe(input(root));
    expect(verifyCalls(chat).map((c) => [c.path, c.body])).toEqual([
      ['session/verify/email', { email: 'ada@example.org' }],
      ['session/verify/email/confirm', { code: '123456' }],
      ['session/verify/email/confirm', { code: '123456' }],
    ]);
    expect(posts(chat), 'nothing is sent again before the system row').toHaveLength(1);
    chat.streams[0]!.push('message', row(3, 'system', 'Verified as a•••@example.org'), 3);
    await until(() => posts(chat).length === 2, 'the message sent again');
    const again = posts(chat)[1]!.body as { text: string; client_message_id: string };
    expect(again.text).toBe('Where is my order?');
    expect(again.client_message_id).not.toBe(clientId);
    chat.streams[0]!.push('message', row(4, 'system', 'A person joined the chat'), 4);
    chat.streams[0]!.push('message', row(5, 'visitor', 'Where is my order?', again.client_message_id), 5);
    await until(() => drawn(root).length === 5, 'the log');
    expect(posts(chat), 'posted once').toHaveLength(2);
    expect(drawn(root).at(-1)).toBe(`${VISITOR} (Sent again after you confirmed)`);
    expect(JSON.parse(localStorage.getItem(`agentflow-chat:${PUBLIC_KEY}:marks`)!)).toEqual({ resentIds: [again.client_message_id], hasEmail: true, verified: true });
  });

  it.each([
    { popup: true, how: 'opens the popup before the request and points it at the authorize URL after' },
    { popup: false, how: 'offers a link when the browser blocked the popup' },
  ])('by AgentFlow sign-in $how, and posts the code the popup shows with the thread’s token', async ({ popup }) => {
    const order: string[] = [];
    const window_ = { opener: {} as unknown, closed: false, location: { href: '' }, close: vi.fn() };
    vi.spyOn(window, 'open').mockImplementation(() => {
      order.push('open');
      return popup ? (window_ as unknown as Window) : null;
    });
    const chat = fakeChat((call) => {
      if (call.path === 'session/verify/agentflow') {
        order.push('request');
        return answer(200, { authorize_url: 'https://id.test/authorize?state=s' });
      }
      if (call.path === 'session/verify/agentflow/confirm') return new Response(null, { status: 204 });
      return undefined;
    });
    const { root, sheet, field, submit } = await askedToVerify(chat, ['agentflow']);
    root.querySelector<HTMLButtonElement>("[part='sign-in']")!.click();
    await until(() => !field('sign-in-code').closest('form')!.hidden, 'the code field');
    expect(order).toEqual(['open', 'request']);
    const link = root.querySelector<HTMLAnchorElement>("[part='sign-in-link']")!;
    if (popup) {
      expect(window_.location.href).toBe('https://id.test/authorize?state=s');
      expect(window_.opener).toBeNull();
      expect(link.hidden).toBe(true);
    } else {
      expect(link.hidden).toBe(false);
      expect(link.href).toBe('https://id.test/authorize?state=s');
    }
    field('sign-in-code').value = 'abcd efgh';
    submit('sign-in-code');
    await until(() => sheet().hidden === true, 'the form closed');
    const confirm = verifyCalls(chat).at(-1)!;
    expect([confirm.path, confirm.body, confirm.headers.get('authorization'), confirm.headers.get('accept-language')]).toEqual([
      'session/verify/agentflow/confirm',
      { code: 'abcdefgh' },
      'Bearer afv_1',
      'en',
    ]);
    chat.streams[0]!.push('message', row(3, 'system', 'Verified as a•••@example.org'), 3);
    await until(() => posts(chat).length === 2, 'the message sent again');
  });

  it('a code refused for too many asks says to try later, not in a moment', async () => {
    const chat = fakeChat((call) => (call.path === 'session/verify/email' ? problem(429, 'CHAT_RATE_LIMITED', { 'retry-after': '3600' }) : undefined));
    const { root, field, submit } = await askedToVerify(chat, ['email_code']);
    field('email').value = 'ada@example.org';
    submit('email');
    await until(() => shown(root, 'sheet-error') !== null, 'the refusal');
    expect(shown(root, 'sheet-error')).toBe('Too many tries. Try again later.');
  });

  it('Get the reply by email posts session/email, and the parked line then promises email', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], shouldAdvanceTime: true, advanceTimeDelta: 1 });
    onTestFinished(() => void vi.useRealTimers());
    const chat = fakeChat((call) => (call.path === 'session/email' ? new Response(null, { status: 204 }) : undefined));
    const { root, send } = await mountChat(chat);
    const bubble = await send('Where is my order?');
    await until(() => chat.streams.length === 1, 'the stream');
    chat.streams[0]!.push('message', row(1, 'visitor', 'Where is my order?', bubble.getAttribute('data-client-id')), 1);
    for (const frame of PARKED) push(chat, frame);
    await until(() => drawn(root).at(-1) === COMING, 'the line');
    root.querySelector<HTMLButtonElement>("[part='email-offer']")!.click();
    const email = root.querySelector<HTMLInputElement>('#sheet-email')!;
    expect(root.activeElement).toBe(email);
    email.value = 'ada@example.org';
    email.form!.dispatchEvent(new Event('submit', { cancelable: true }));
    await until(() => drawn(root).at(-1) === 'note: [Looking up your order] The rest of this reply will appear here, or by email if you leave.', 'the promise');
    expect(verifyCalls(chat).map((c) => [c.method, c.path, c.body])).toEqual([['POST', 'session/email', { email: 'ada@example.org' }]]);
  });
});

describe('the message sent again after confirming', () => {
  const lost = () => Promise.reject(new TypeError('Failed to fetch'));
  const VERIFIED = row(3, 'system', 'Verified as a•••@example.org');

  async function codeEntered(confirm: () => Promise<Response>, override: (call: { path: string }) => Response | undefined = () => undefined) {
    let release!: () => void;
    let held = new Promise<void>((resolve) => (release = resolve));
    const chat = fakeChat((call) => {
      const overridden = override(call);
      if (overridden) return overridden;
      if (call.path === 'session/verify/email') return answer(202, { expires_in_seconds: 600 });
      if (call.path === 'session/verify/email/confirm') return held.then(confirm);
      return undefined;
    });
    const verifying = await askedToVerify(chat, ['email_code']);
    verifying.field('email').value = 'ada@example.org';
    verifying.submit('email');
    await until(() => !verifying.field('code').closest('form')!.hidden, 'the code form');
    verifying.field('code').value = '123456';
    verifying.submit('code');
    await until(() => verifyCalls(chat).length === 2, 'the confirm');
    const answerNow = () => {
      release();
      held = Promise.resolve();
    };
    return { chat, ...verifying, answerNow };
  }

  it.each([
    { name: 'a confirm whose answer was lost after its system row came sends it again once', confirm: lost, logged: VERIFIED, again: 2 },
    { name: 'a wrong code sends nothing again, though a system row came while it was checked', confirm: () => Promise.resolve(problem(422, 'CHAT_VERIFY_CODE_INVALID')), logged: row(3, 'system', 'A person joined the chat'), again: 1 },
  ])('$name', async ({ confirm, logged, again }) => {
    const { chat, root, sheet, answerNow } = await codeEntered(confirm);
    chat.streams[0]!.push('message', logged, 3);
    await until(() => root.querySelector("[data-position='3']") !== null, 'the system row');
    answerNow();
    await until(() => (again === 2 ? posts(chat).length === 2 : shown(root, 'sheet-error') !== null), 'the answer');
    await settle();
    expect(posts(chat)).toHaveLength(again);
    expect(sheet().hidden).toBe(again === 2);
  });

  it.each([
    { name: 'the same code retried after a lost answer is refused as used, and the log shows it was taken', retry: 'code' },
    { name: 'a new code asked for after a lost answer is refused as already set, and the log shows it was taken', retry: 'email' },
  ])('$name', async ({ retry }) => {
    let reads = 0;
    const { chat, root, sheet, field, submit, answerNow } = await codeEntered(
      () => (reads === 0 ? lost() : Promise.resolve(problem(422, 'CHAT_VERIFY_CODE_INVALID'))),
      (call) => {
        if (call.path === 'session/verify/email' && reads > 0) return problem(409, 'CHAT_IDENTITY_ALREADY_SET');
        if (!call.path.startsWith('messages?after=2')) return undefined;
        reads++;
        return answer(200, { messages: reads === 1 ? [] : [VERIFIED] });
      },
    );
    answerNow();
    await until(() => shown(root, 'sheet-error') !== null, 'the lost answer');
    expect(posts(chat), 'nothing sent again on a lost answer with no system row').toHaveLength(1);
    if (retry === 'code') {
      submit('code');
    } else {
      root.querySelector<HTMLButtonElement>("[part='code-form'] .link")!.click();
      field('email').value = 'bo@example.org';
      submit('email');
    }
    await until(() => posts(chat).length === 2, 'the message sent again');
    chat.streams[0]!.push('message', VERIFIED, 3);
    await settle();
    expect(posts(chat), 'sent again once').toHaveLength(2);
    expect(sheet().hidden).toBe(true);
    expect(drawn(root).filter((line) => line.startsWith('system:'))).toEqual(['system: Verified as a•••@example.org']);
  });
});

describe('two tabs confirming one thread', () => {
  const VERIFIED = row(3, 'system', 'Verified as a•••@example.org');
  const ASKED_LOG = [VISITOR, 'agent: I need to confirm it’s you first.', 'system: Verified as a•••@example.org'];

  /** Two windows on one stored token, both asked to confirm, over a server that logs a client id once. */
  async function bothAsked(confirm: (tab: number) => Response) {
    localStorage.setItem(`agentflow-chat:${PUBLIC_KEY}`, 'afv_9');
    const log = [row(1, 'visitor', 'Where is my order?', '3f0c2a1e-7b4d-4c8a-9e21-5d6f7a8b9c0d'), row(2, 'agent', 'I need to confirm it’s you first.')];
    const logged = (message: LoggedMessage) => {
      log.push(message);
      for (const stream of chat.streams) stream.push('message', message, message.position);
    };
    const answers: (() => void)[] = [];
    const chat = fakeChat((call) => {
      if (call.path.startsWith('messages?')) return answer(200, { messages: log.filter((r) => r.position > Number(/after=(\d+)/.exec(call.path)![1])) });
      if (call.path === 'session/verify/email') return answer(202, { expires_in_seconds: 600 });
      if (call.path === 'messages') {
        const { text, client_message_id: id } = call.body as { text: string; client_message_id: string };
        if (!log.some((r) => r.client_message_id === id)) logged(row(log.length + 1, 'visitor', text, id));
        return answer(200, { position: log.find((r) => r.client_message_id === id)!.position });
      }
      if (call.path !== 'session/verify/email/confirm') return undefined;
      const tab = answers.length;
      return new Promise<Response>((resolve) =>
        answers.push(() => {
          const response = confirm(tab);
          if (response.status === 204) logged(VERIFIED);
          resolve(response);
        }),
      );
    });
    const tabs: Awaited<ReturnType<typeof mountChat>>[] = [];
    for (const n of [0, 1]) {
      const mounted = await mountChat(chat, n === 1);
      await until(() => chat.streams.length === n + 1, `tab ${n}'s stream`);
      tabs.push(mounted);
    }
    for (const stream of chat.streams) stream.push('verify.requested', { methods: ['email_code'], requested_at: '2026-11-23T00:00:00Z' });
    const sheet = (root: ShadowRoot) => root.querySelector<HTMLElement>("[part='sheet']")!;
    await until(() => tabs.every(({ root }) => !sheet(root).hidden), 'both forms');
    const enterCode = async (root: ShadowRoot) => {
      const field = (name: string) => root.querySelector<HTMLInputElement>(`#sheet-${name}`)!;
      field('email').value = 'ada@example.org';
      field('email').form!.dispatchEvent(new Event('submit', { cancelable: true }));
      await until(() => !field('code').closest('form')!.hidden, 'the code form');
      field('code').value = '123456';
      field('code').form!.dispatchEvent(new Event('submit', { cancelable: true }));
    };
    return { log, tabs, sheet, enterCode, answers };
  }

  it('the second tab closes its form when the first confirms', async () => {
    const { tabs, sheet, enterCode, answers } = await bothAsked(() => new Response(null, { status: 204 }));
    await enterCode(tabs[0]!.root);
    await until(() => answers.length === 1, 'the confirm');
    answers[0]!();
    await until(() => drawn(tabs[1]!.root).length === 4, 'the message sent again, in the second tab');
    const marksKey = `agentflow-chat:${PUBLIC_KEY}:marks`;
    window.dispatchEvent(new StorageEvent('storage', { key: marksKey, newValue: localStorage.getItem(marksKey) }));
    expect(sheet(tabs[0]!.root).hidden).toBe(true);
    expect(sheet(tabs[1]!.root).hidden).toBe(true);
  });

  it.each([
    { when: 'at the same moment', meanwhile: 0 },
    { when: 'after the first tab’s message came back', meanwhile: 1 },
    { when: 'after the visitor wrote again in the first tab', meanwhile: 2 },
  ])('two tabs that confirm $when post the message once more between them', async ({ meanwhile }) => {
    const { log, tabs, enterCode, answers } = await bothAsked((tab) => (tab === 0 ? new Response(null, { status: 204 }) : problem(409, 'CHAT_IDENTITY_ALREADY_SET')));
    await Promise.all(tabs.map(({ root }) => enterCode(root)));
    await until(() => answers.length === 2, 'both confirms in flight');
    answers[0]!();
    if (meanwhile > 0) await until(() => drawn(tabs[1]!.root).length === 4, 'the message sent again, in the second tab');
    if (meanwhile > 1) {
      await tabs[0]!.send('And my refund?');
      await until(() => drawn(tabs[1]!.root).length === 5, 'the new message, in the second tab');
    }
    answers[1]!();
    const expected = JSON.stringify([...ASKED_LOG, `${VISITOR} (Sent again after you confirmed)`, ...(meanwhile > 1 ? ['visitor: And my refund?'] : [])]);
    for (const { root } of tabs) await until(() => JSON.stringify(drawn(root)) === expected, `${expected}, drawn ${JSON.stringify(drawn(root))}`);
    await settle();
    expect(log.filter((r) => r.author === 'visitor').map((r) => r.text)).toEqual(['Where is my order?', 'Where is my order?', ...(meanwhile > 1 ? ['And my refund?'] : [])]);
    expect(tabs.map(({ root }) => root.querySelectorAll("[part='status']").length), 'no bubble left sending').toEqual([0, 0]);
  });
});

describe('an API that stops answering', () => {
  async function gaveUp() {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], shouldAdvanceTime: true, advanceTimeDelta: 1 });
    onTestFinished(() => void vi.useRealTimers());
    let down = false;
    const chat = fakeChat((call) => (down && (call.path === 'config' || call.path === 'stream') ? Promise.reject(new TypeError('Failed to fetch')) : undefined));
    const mounted = await mountChat(chat);
    await mounted.send('hello');
    await until(() => chat.streams.length === 1, 'the stream');
    const configs = () => chat.calls.filter((c) => c.path === 'config').length;
    down = true;
    chat.streams[0]!.end();
    await vi.advanceTimersByTimeAsync(150_000);
    expect(configs(), 'the first check and eight tries after the stream went unanswered').toBe(9);
    expect(shown(mounted.root, 'notice')).toBe('Chat is unavailable right now.');
    expect(input(mounted.root).disabled).toBe(true);
    return { ...mounted, chat, configs, up: () => void (down = false) };
  }

  it.each([
    { wake: 'a slow re-check while the page is visible', run: () => vi.advanceTimersByTimeAsync(5 * 60_000) },
    { wake: 'the browser coming back online', run: () => window.dispatchEvent(new Event('online')) },
    { wake: 'the page becoming visible', run: () => document.dispatchEvent(new Event('visibilitychange')) },
    { wake: 'the window taking focus', run: () => window.dispatchEvent(new Event('focus')) },
    {
      wake: 'the visitor opening the window',
      run: (root: ShadowRoot) => {
        root.querySelector<HTMLButtonElement>("[part='close']")!.click();
        root.querySelector<HTMLButtonElement>("[part='launcher']")!.click();
      },
    },
  ])('recovers with no reload after giving up, on $wake', async ({ run }) => {
    const { root, chat, configs, up } = await gaveUp();
    up();
    await run(root);
    await until(() => !input(root).disabled, 'the input enabled');
    expect(configs()).toBe(10);
    expect(shown(root, 'notice')).toBeNull();
    await until(() => chat.streams.length === 2, 'the stream resumed');
  });

  it('asks again at most once in 30 s however often the page wakes, and never while it is hidden', async () => {
    const { configs } = await gaveUp();
    const wake = async () => {
      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
      await settle();
    };
    await wake();
    await wake();
    expect(configs(), 'one check for many wakes').toBe(10);
    await vi.advanceTimersByTimeAsync(30_000);
    await wake();
    expect(configs()).toBe(11);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    await wake();
    expect(configs(), 'nothing while hidden').toBe(11);
  });

  it('a window taken off the page while its tries run stops asking', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], shouldAdvanceTime: true, advanceTimeDelta: 1 });
    onTestFinished(() => void vi.useRealTimers());
    const chat = fakeChat((call) => (call.path === 'config' ? Promise.reject(new TypeError('Failed to fetch')) : undefined));
    const { element } = await mountChat(chat);
    element.remove();
    await vi.advanceTimersByTimeAsync(20 * 60_000);
    expect(chat.calls.filter((c) => c.path === 'config'), 'the eight tries, then nothing').toHaveLength(8);
  });

  it('a key the server refuses is never asked for again', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], shouldAdvanceTime: true, advanceTimeDelta: 1 });
    onTestFinished(() => void vi.useRealTimers());
    const chat = fakeChat((call) => (call.path === 'config' ? problem(404, 'NOT_FOUND') : undefined));
    const { root } = await mountChat(chat);
    expect(shown(root, 'notice')).toBe('Chat is unavailable right now.');
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    window.dispatchEvent(new Event('online'));
    await settle();
    expect(chat.calls.filter((c) => c.path === 'config')).toHaveLength(1);
  });
});

describe('two tabs and an ended chat', () => {
  async function restored() {
    localStorage.setItem(`agentflow-chat:${PUBLIC_KEY}`, 'afv_9');
    const history = [row(1, 'visitor', 'Where is my order?', 'first-1'), row(2, 'system', 'Verified as a•••@example.org'), row(3, 'visitor', 'Where is my order?', 'again-1')];
    const chat = fakeChat((call) => (call.path.startsWith('messages?') ? answer(200, { messages: history }) : undefined));
    const mounted = await mountChat(chat);
    await until(() => drawn(mounted.root).length === 3, 'the restored log');
    return mounted;
  }

  it('a message another tab sent again is drawn faded here too', async () => {
    const { root } = await restored();
    expect(drawn(root).at(-1)).toBe(VISITOR);
    const marks = JSON.stringify({ resentIds: ['again-1'], hasEmail: true });
    localStorage.setItem(`agentflow-chat:${PUBLIC_KEY}:marks`, marks);
    window.dispatchEvent(new StorageEvent('storage', { key: `agentflow-chat:${PUBLIC_KEY}:marks`, newValue: marks }));
    expect(drawn(root).at(-1)).toBe(`${VISITOR} (Sent again after you confirmed)`);
  });

  it('End chat keeps the label on the ended log and empties the sheet', async () => {
    localStorage.setItem(`agentflow-chat:${PUBLIC_KEY}:marks`, JSON.stringify({ resentIds: ['again-1'], hasEmail: true }));
    const { root } = await restored();
    const address = root.querySelector<HTMLInputElement>('#sheet-email')!;
    address.value = 'ada@example.org';
    root.querySelector<HTMLButtonElement>("[part='end']")!.click();
    expect(drawn(root).at(-1)).toBe(`${VISITOR} (Sent again after you confirmed)`);
    expect(address.value).toBe('');
  });
});

describe('around the streamed reply', () => {
  async function asked() {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], shouldAdvanceTime: true, advanceTimeDelta: 1 });
    onTestFinished(() => void vi.useRealTimers());
    const chat = fakeChat();
    const mounted = await mountChat(chat);
    const bubble = await mounted.send('Where is my order?');
    await until(() => chat.streams.length === 1, 'the stream');
    chat.streams[0]!.push('message', row(1, 'visitor', 'Where is my order?', bubble.getAttribute('data-client-id')), 1);
    await until(() => bubble.hasAttribute('data-position'), 'the logged question');
    const live = () => Array.from(mounted.root.querySelector("[part='live']")!.children, (p) => p.textContent);
    return { chat, ...mounted, live };
  }

  it('two replies drawn after one row keep their order as either grows', async () => {
    const { chat, root } = await asked();
    const reply = (event: string, stream: string, data: object) => chat.streams[0]!.push(`reply.${event}`, { stream_id: stream, segment: 0, ...data });
    reply('started', 'run:a:0', { label: 'Checking stock' });
    reply('started', 'run:b:0', { label: 'Writing' });
    reply('delta', 'run:b:0', { text: 'One moment' });
    await until(() => drawn(root).length === 3, 'both drafts');
    reply('activity', 'run:a:0', { label: 'Checking the warehouse' });
    await until(() => drawn(root)[1] === 'draft: [Checking the warehouse]', 'the new label');
    expect(drawn(root)).toEqual([VISITOR, 'draft: [Checking the warehouse]', 'draft: One moment [Writing]']);
  });

  it('a resumed segment keeps the name its stored segment showed', async () => {
    const { chat, root } = await asked();
    for (const frame of PARKED.slice(0, 3)) push(chat, frame);
    chat.streams[0]!.push('message', { ...row(2, 'agent', 'Let me check.'), author_display: 'Mai', stream_id: STREAM, stream_segment: 0, stream_parked: true }, 2);
    push(chat, ['started', 1, 'Writing']);
    push(chat, ['delta', 1, 'It shipped.']);
    await until(() => drawn(root).at(-1) === 'draft: It shipped. [Writing]', 'the resumed draft');
    const names = Array.from(root.querySelectorAll("[part='log'] > [data-author='agent'] > [part='author']"), (n) => n.textContent);
    expect(names).toEqual(['Mai', 'Mai']);
  });

  it('a request to verify is announced with the row before it, and the notices and the park line are announced', async () => {
    const { chat, root, live } = await asked();
    chat.streams[0]!.push('message', row(2, 'agent', 'I need to confirm it’s you first.'), 2);
    chat.streams[0]!.push('verify.requested', { methods: ['email_code'], requested_at: '2026-11-23T00:00:00Z' });
    await until(() => live().includes('Confirm it’s you'), 'the request announced');
    expect(live()).toEqual(['Assistant: I need to confirm it’s you first.', 'Confirm it’s you']);
    root.querySelector<HTMLButtonElement>("[part='later']")!.click();
    vi.advanceTimersByTime(10);
    for (const frame of PARKED.slice(0, 3)) push(chat, frame);
    push(chat, ['park', 3, 'Let me check.', 0]);
    await until(() => live().at(-1) === 'The rest of this reply will appear here. Get the reply by email', 'the line announced');
    vi.advanceTimersByTime(10);
    push(chat, ['abandoned', 1]);
    await until(() => live().at(-1) === 'The rest of this reply could not be sent. Please try again.', 'the notice announced');
  });

  it('words that could not be sent are announced as the notice', async () => {
    const { chat, live } = await asked();
    for (const frame of [...ASKED, ['done', 0], ['abandoned', 0]] as Frame[]) push(chat, frame);
    await until(() => live().at(-1) === 'This reply could not be sent. Please try again.', 'the notice announced');
  });

  it('focus stays in the panel when the resumed reply takes the email offer away', async () => {
    const { chat, root } = await asked();
    for (const frame of PARKED) push(chat, frame);
    await until(() => root.querySelector("[part='email-offer']") !== null, 'the offer');
    root.querySelector<HTMLButtonElement>("[part='email-offer']")!.focus();
    push(chat, ['started', 1, 'Writing']);
    push(chat, ['delta', 1, 'It shipped.']);
    await until(() => root.querySelector("[part='email-offer']") === null, 'the offer gone');
    expect(root.activeElement).toBe(input(root));
  });
});

describe('the logo', () => {
  it.each([
    ['an uploaded logo, relative to the config', 'logo/9f2c', 'https://api.test/api/v1/chat/pub_test/config', 'https://api.test/api/v1/chat/pub_test/logo/9f2c'],
    ['under an api-base with a path', 'logo/9f2c', 'https://host.test/af/api/v1/chat/pub_test/config', 'https://host.test/af/api/v1/chat/pub_test/logo/9f2c'],
    ['on the API origin over http', 'logo/9f2c', 'http://localhost:8080/api/v1/chat/pub_test/config', 'http://localhost:8080/api/v1/chat/pub_test/logo/9f2c'],
    ['an https URL', 'https://cdn.test/l.png', 'http://localhost:8080/api/v1/chat/pub_test/config', 'https://cdn.test/l.png'],
    ['an http URL on another host', 'http://cdn.test/l.png', 'http://localhost:8080/api/v1/chat/pub_test/config', null],
    ['a script URL', 'javascript:alert(1)', 'https://api.test/api/v1/chat/pub_test/config', null],
    ['a data URL', 'data:image/png;base64,iVBORw0KGgo=', 'https://api.test/api/v1/chat/pub_test/config', null],
    ['none', null, 'https://api.test/api/v1/chat/pub_test/config', null],
  ])('%s', (_name, value, configUrl, want) => {
    expect(logoUrl(value, configUrl)).toBe(want);
  });

  it('draws the logo the config names relative to itself from the API', async () => {
    const chat = fakeChat((call) =>
      call.method === 'GET' && call.path === 'config' ? answer(200, { ...CHAT_CONFIG, branding: { ...CHAT_CONFIG.branding, logo_url: 'logo/9f2c' } }) : undefined
    );
    const { root } = await mountChat(chat);
    await until(() => root.querySelector("[part='logo']") !== null, 'the logo');
    expect(root.querySelector<HTMLImageElement>("[part='logo']")!.src).toBe(`${CHAT_ORIGIN}/api/v1/chat/${PUBLIC_KEY}/logo/9f2c`);
  });
});
