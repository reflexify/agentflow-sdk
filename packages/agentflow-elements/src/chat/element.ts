import { VERSION } from '../version.js';
import { h, setAttributes, setText } from './dom.js';
import {
  EMPTY_CONVERSATION,
  lastPosition,
  reduce,
  storedRow,
  type Conversation,
  type ConversationAction,
  type Pending,
  type PendingState,
  type Reply,
} from './conversation.js';
import { ChatSheet } from './forms.js';
import { sessionStore, type SessionMarks, type SessionStore } from './session-store.js';
import { CHAT_LANGUAGES, CHAT_STRINGS, chatLocale, type ChatKey, type ChatLanguage } from './strings.js';
import { CHAT_CSS } from './styles.js';
import { ChatRefusal, apiOrigin, chatApi, type Author, type ChatApi, type ChatConfig, type Follow, type LoggedMessage, type ReplyEvent } from './transport.js';

type Session =
  | { kind: 'none' }
  | { kind: 'opening'; token: Promise<string> }
  | { kind: 'open'; token: string; follow: Follow | null }
  | { kind: 'ended' };

/** Why the window is unavailable: a `403` or `404` it could read is final, anything else may be an outage. */
type Down = 'refused' | 'unreachable';
type Notice = 'unavailable' | 'ended' | 'reconnecting' | 'rateLimited' | 'sessionLimited' | 'tooLong';
type Flash = 'rateLimited' | 'sessionLimited' | 'tooLong';

const NOTICE_TEXT: Record<Notice, ChatKey> = {
  unavailable: 'noticeUnavailable',
  ended: 'noticeEnded',
  reconnecting: 'noticeReconnecting',
  rateLimited: 'noticeRateLimited',
  sessionLimited: 'noticeSessionLimited',
  tooLong: 'noticeTooLong',
};
const AUTHOR_TEXT: Record<Exclude<Author, 'visitor'>, ChatKey> = { agent: 'authorAgent', person: 'authorPerson', system: 'authorSystem' };
const STATUS_TEXT: Record<PendingState, ChatKey> = { sending: 'sending', sent: 'sent', failed: 'failed' };
const RESTART_ON = new Set(['MESSAGE_THREAD_CLOSED', 'CHAT_SESSION_INVALID']);
const TEXT_MAX_BYTES = 4096;
const NEUTRAL_ACCENT = '#374151';
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const NEAR_BLACK_LUMINANCE = 0.0056;
const NO_MARKS: SessionMarks = { resentIds: [], hasEmail: false, verified: false };
// After the tries give up on an API that does not answer: one more try every 2.5 to 5 minutes while the page is
// visible, and one when the page wakes but not within 30 s of the last, since every visitor on the site does the same.
const RECHECK_MS = 5 * 60_000;
const RECHECK_GAP_MS = 30_000;

type Confirming = { after: number; taken: 'pending' | 'yes' | 'maybe' };

const identityAlreadySet = (error: unknown) => error instanceof ChatRefusal && error.code === 'CHAT_IDENTITY_ALREADY_SET';

type Item =
  | { kind: 'row'; key: string; anchor: number; row: LoggedMessage }
  | { kind: 'pending'; key: string; anchor: number; pending: Pending }
  | { kind: 'draft'; key: string; anchor: number; reply: Reply }
  | { kind: 'note'; key: string; anchor: number; reply: Reply };

const ITEM_RANK: Record<Item['kind'], number> = { row: 0, draft: 1, note: 1, pending: 2 };
const draftKey = (streamId: string, segment: number) => `s:${streamId}#${segment}`;

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICON_ATTRIBUTES = {
  'aria-hidden': 'true',
  viewBox: '0 0 24 24',
  width: '24',
  height: '24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

function icon(d: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  setAttributes(svg, ICON_ATTRIBUTES);
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

function adoptStyles(root: ShadowRoot): void {
  if ('adoptedStyleSheets' in root && typeof CSSStyleSheet.prototype.replaceSync === 'function') {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CHAT_CSS);
    root.adoptedStyleSheets = [sheet];
    return;
  }
  const style = document.createElement('style');
  style.textContent = CHAT_CSS;
  root.append(style);
}

function uuidV4(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** The id with its version digit set to 8, RFC 9562's custom layout, which no id the element makes (version 4) carries. */
const resendId = (clientId: string) => `${clientId.slice(0, 14)}8${clientId.slice(15)}`;

function readableTextOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / (NEAR_BLACK_LUMINANCE + 0.05) ? '#ffffff' : '#111111';
}

const performanceMark = (name: string) => performance.mark?.(name);
const performanceMeasure = (name: string, start: number) => {
  try {
    performance.measure?.(name, { start, end: performance.now() });
  } catch {
    // Firefox before 103 reads the options as a mark name and throws; a metric never stops a send.
  }
};

function setAttr(node: Element, name: string, value: string | null): void {
  if (value === null) node.removeAttribute(name);
  else if (node.getAttribute(name) !== value) node.setAttribute(name, value);
}

const SLOT_ORDER = ['author', 'text', 'label', 'line', 'email-offer', 'status', 'retry', 'resent'];

function slot(node: HTMLElement, part: string, tag: string, text: string | null): void {
  const children = Array.from(node.children);
  let child = children.find((c): c is HTMLElement => c.getAttribute('part') === part);
  if (text === null) return child?.remove();
  if (!child) {
    child = document.createElement(tag);
    child.setAttribute('part', part);
    if (tag === 'button') child.setAttribute('type', 'button');
    const order = SLOT_ORDER.indexOf(part);
    node.insertBefore(child, children.find((c) => SLOT_ORDER.indexOf(c.getAttribute('part') ?? '') > order) ?? null);
  }
  setText(child, text);
}

interface Ui {
  launcher: HTMLButtonElement;
  panel: HTMLElement;
  title: HTMLElement;
  end: HTMLButtonElement;
  close: HTMLButtonElement;
  log: HTMLElement;
  greeting: HTMLElement;
  typing: HTMLElement;
  notice: HTMLElement;
  sheet: ChatSheet;
  composer: HTMLFormElement;
  label: HTMLLabelElement;
  input: HTMLTextAreaElement;
  send: HTMLButtonElement;
  live: HTMLElement;
}

export class AgentFlowChat extends HTMLElement {
  static elementsVersion = VERSION;
  static scriptOrigin: string | null = null;

  fetchImpl: typeof fetch | undefined;

  #ui: Ui | null = null;
  #api: ChatApi | null = null;
  #store: SessionStore | null = null;
  #config: ChatConfig | Down | null = null;
  #locale: ChatLanguage = 'en';
  #conversation: Conversation = EMPTY_CONVERSATION;
  #session: Session = { kind: 'none' };
  #reconnecting = false;
  #flash: Flash | null = null;
  #opened = false;
  #checking = false;
  #checkedAt = 0;
  #recheck: ReturnType<typeof setTimeout> | undefined;
  #nodes = new Map<string, HTMLElement>();
  #drawn = 0;
  #typingTimer: ReturnType<typeof setTimeout> | undefined;
  #marks: SessionMarks = NO_MARKS;
  #confirming: Confirming | null = null;
  #answer: { sent: number; words: boolean } | null = null;
  #announcing = false;
  #storageChanged = (event: StorageEvent) => {
    if (!this.#store || event.key !== this.#store.marksKey || event.newValue === null) return;
    this.#marks = this.#store.marks();
    if (this.#marks.verified) this.#ui!.sheet.hide();
    this.#render();
  };
  #wake = () => {
    const due = this.#config === 'unreachable' && this.isConnected && document.visibilityState === 'visible';
    if (due && Date.now() - this.#checkedAt >= RECHECK_GAP_MS) void this.#check(1);
  };

  connectedCallback(): void {
    const key = this.getAttribute('connection');
    if (!key) return;
    this.#ui ??= this.#build();
    window.addEventListener('storage', this.#storageChanged);
    window.addEventListener('online', this.#wake);
    window.addEventListener('focus', this.#wake);
    document.addEventListener('visibilitychange', this.#wake);
    if (!this.#api) {
      const origin = apiOrigin(this.getAttribute('api-base'), AgentFlowChat.scriptOrigin, location.origin);
      this.#api = chatApi(origin, key, this.fetchImpl ?? ((input, init) => fetch(input, init)));
      this.#store = sessionStore(key);
      this.#marks = this.#store.marks();
      void this.#check();
    } else if (this.#session.kind === 'open' && this.#opened) {
      this.#follow(this.#session.token);
    }
    if (this.#config === 'unreachable') this.#recheckLater();
  }

  disconnectedCallback(): void {
    window.removeEventListener('storage', this.#storageChanged);
    window.removeEventListener('online', this.#wake);
    window.removeEventListener('focus', this.#wake);
    document.removeEventListener('visibilitychange', this.#wake);
    if (this.#session.kind === 'open') {
      this.#session.follow?.stop();
      this.#session = { ...this.#session, follow: null };
    }
    clearTimeout(this.#typingTimer);
    clearTimeout(this.#recheck);
  }

  #build(): Ui {
    const root = this.attachShadow({ mode: 'open' });
    adoptStyles(root);
    const ui: Ui = {
      launcher: h('button', { part: 'launcher', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'panel', hidden: '' }, icon('M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12Z')),
      panel: h('section', { part: 'panel', id: 'panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'title', hidden: '' }),
      title: h('h2', { part: 'title', id: 'title' }),
      end: h('button', { part: 'end', type: 'button', hidden: '' }),
      close: h('button', { part: 'close', type: 'button' }, icon('M6 6l12 12M18 6 6 18')),
      log: h('div', { part: 'log', role: 'region', tabindex: '0' }),
      greeting: h('p', { part: 'greeting' }),
      typing: h('p', { part: 'typing', hidden: '' }),
      notice: h('p', { part: 'notice', role: 'status', hidden: '' }),
      sheet: new ChatSheet((key) => this.#t(key), {
        sendCode: (email) => this.#unlessVerified((token) => this.#api!.sendCode(token, email).then(() => undefined)),
        confirmCode: (code) => this.#confirm((token) => this.#api!.confirmCode(token, code, this.#locale)),
        startSignIn: () => this.#unlessVerified((token) => this.#api!.startSignIn(token).then(({ authorize_url }) => authorize_url)),
        confirmSignIn: (code) => this.#confirm((token) => this.#api!.confirmSignIn(token, code, this.#locale)),
        giveEmail: (email) => this.#withToken((token) => this.#api!.giveEmail(token, email)),
        verified: () => this.#mark(() => ({ hasEmail: true })),
        emailGiven: () => this.#mark(() => ({ hasEmail: true })),
        hidden: () => this.#ui!.input.focus(),
      }),
      composer: h('form', { part: 'composer', novalidate: '' }),
      label: h('label', { class: 'label', for: 'input' }),
      input: h('textarea', { part: 'input', id: 'input', rows: '1' }),
      send: h('button', { part: 'send', type: 'submit' }, icon('M5 12h14M13 6l6 6-6 6')),
      live: h('div', { part: 'live', 'aria-live': 'polite' }),
    };
    ui.log.append(ui.greeting);
    ui.composer.append(ui.label, ui.input, ui.send);
    ui.panel.append(h('header', { part: 'header' }, ui.title, ui.end, ui.close), ui.log, ui.typing, ui.notice, ui.sheet.node, ui.composer);
    root.append(ui.launcher, ui.panel, ui.live);
    ui.launcher.addEventListener('click', () => (ui.panel.hidden ? this.#open() : this.#close()));
    ui.close.addEventListener('click', () => this.#close());
    ui.end.addEventListener('click', () => this.#endChat());
    ui.panel.addEventListener('keydown', (event) => this.#keydown(event));
    ui.composer.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#submit();
    });
    ui.input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      this.#submit();
    });
    ui.log.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (target.closest("[part='email-offer']")) return ui.sheet.askEmail();
      const clientId = target.closest("[part='retry']")?.parentElement?.getAttribute('data-client-id');
      if (clientId) this.#retry(clientId);
    });
    return ui;
  }

  #t(key: ChatKey): string {
    return CHAT_STRINGS[this.#locale][key];
  }

  /** What one task announces is kept together, since a live region read once a task hears only its last text. */
  #announce(text: string): void {
    const live = this.#ui!.live;
    if (!this.#announcing) {
      this.#announcing = true;
      live.replaceChildren();
      setTimeout(() => (this.#announcing = false));
    }
    live.append(h('p', {}, document.createTextNode(text)));
  }

  async #check(attempts?: number): Promise<void> {
    if (this.#checking) return;
    this.#checking = true;
    const fail = (down: Down) => (this.#config === null ? this.#apply(down) : this.#unavailable(down));
    const answer = await this.#api!.config(() => fail('unreachable'), attempts).catch(
      (error: unknown): Down => (error instanceof ChatRefusal && error.unavailable ? 'refused' : 'unreachable'),
    );
    this.#checking = false;
    this.#checkedAt = Date.now();
    if (typeof answer === 'object') return this.#apply(answer);
    fail(answer);
    if (answer === 'unreachable') this.#recheckLater();
  }

  #recheckLater(): void {
    clearTimeout(this.#recheck);
    this.#recheck = setTimeout(this.#wake, RECHECK_MS * (0.5 + Math.random() / 2));
  }

  get #down(): boolean {
    return this.#config === 'refused' || this.#config === 'unreachable';
  }

  #apply(answer: ChatConfig | Down): void {
    const ui = this.#ui!;
    this.#config = answer;
    const config = typeof answer === 'object' ? answer : null;
    this.#locale = chatLocale(this.getAttribute('lang'), navigator.languages, config ? config.branding.languages : CHAT_LANGUAGES);
    const color = config?.branding.color;
    const accent = color && HEX_COLOR.test(color) ? color : NEUTRAL_ACCENT;
    this.style.setProperty('--afc-accent', accent);
    this.style.setProperty('--afc-on-accent', readableTextOn(accent));
    const logo = config?.branding.logo_url;
    if (logo && !ui.panel.querySelector("[part='logo']")) {
      const img = document.createElement('img');
      img.setAttribute('part', 'logo');
      img.alt = '';
      img.addEventListener('error', () => img.remove());
      img.src = logo;
      ui.title.before(img);
    }
    for (const node of [ui.launcher, ui.panel, ui.live]) node.lang = this.#locale;
    ui.launcher.setAttribute('aria-label', this.#t('title'));
    ui.title.textContent = this.#t('title');
    ui.end.textContent = this.#t('endChat');
    ui.close.setAttribute('aria-label', this.#t('closePanel'));
    ui.log.setAttribute('aria-label', this.#t('log'));
    ui.greeting.textContent = config?.branding.greetings[this.#locale] || this.#t('greeting');
    ui.typing.textContent = this.#t('typing');
    ui.label.textContent = this.#t('inputLabel');
    ui.input.placeholder = this.#t('placeholder');
    ui.send.setAttribute('aria-label', this.#t('send'));
    ui.sheet.paint();
    this.#render();
    if (config && this.#opened && this.#session.kind === 'open' && !this.#session.follow) this.#follow(this.#session.token);
    if (!ui.panel.hidden) this.#start();
    if (!ui.launcher.hidden) return;
    ui.launcher.hidden = false;
    performanceMark('agentflow-chat:launcher');
  }

  #open(): void {
    const ui = this.#ui!;
    this.#wake();
    ui.panel.hidden = false;
    ui.launcher.setAttribute('aria-expanded', 'true');
    (ui.input.disabled ? ui.close : ui.input).focus();
    ui.log.scrollTop = ui.log.scrollHeight;
    this.#start();
  }

  #start(): void {
    if (this.#opened || this.#down) return;
    this.#opened = true;
    const token = this.#store!.load();
    if (token && this.#session.kind === 'none') void this.#restore(token);
  }

  #close(): void {
    const ui = this.#ui!;
    ui.panel.hidden = true;
    ui.launcher.setAttribute('aria-expanded', 'false');
    ui.launcher.focus();
  }

  #keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (event.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      this.#close();
      return;
    }
    if (event.key !== 'Tab') return;
    const ui = this.#ui!;
    const controls = Array.from(ui.panel.querySelectorAll<HTMLElement>('button, textarea, input, a[href], [tabindex="0"]')).filter(
      (el) => !el.closest('[hidden]') && !(el as HTMLButtonElement).disabled,
    );
    // Every Tab is moved here, not only at the ends: Safari's own Tab skips buttons and would leave the panel.
    const at = controls.indexOf(this.shadowRoot!.activeElement as HTMLElement);
    const step = event.shiftKey ? -1 : 1;
    const next = controls[at < 0 ? (step > 0 ? 0 : controls.length - 1) : (at + step + controls.length) % controls.length];
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  #isCurrent(token: string): boolean {
    return this.#session.kind === 'open' && this.#session.token === token;
  }

  async #restore(token: string): Promise<void> {
    this.#session = { kind: 'open', token, follow: null };
    this.#render();
    let rows: LoggedMessage[] = [];
    try {
      rows = await this.#api!.history(token, 0);
    } catch (error) {
      if (error instanceof ChatRefusal && error.status === 401) {
        if (this.#isCurrent(token)) this.#discard(token);
        return;
      }
    }
    if (!this.#isCurrent(token)) return;
    this.#dispatch(...rows.map((row): ConversationAction => ({ type: 'logged', row })));
    this.#follow(token);
  }

  #follow(token: string): void {
    const session = this.#session;
    if (session.kind !== 'open' || session.token !== token || !this.isConnected || this.#down) return;
    session.follow?.stop();
    const follow = this.#api!.follow(token, lastPosition(this.#conversation), {
      message: (row) => this.#logged(row),
      typing: (until) => this.#dispatch({ type: 'typing', until }),
      reply: (event) => this.#reply(event),
      verify: (methods) => {
        if (methods.length === 0) return;
        this.#ui!.sheet.askVerify(methods);
        this.#announce(this.#t('verifyTitle'));
      },
      closed: () => this.#ended(token),
      invalid: () => this.#ended(token),
      unavailable: () => this.#unavailable('refused'),
      unreachable: () => void this.#check(),
      state: (state) => {
        if (state === 'live') this.#dispatch({ type: 'reconnected' });
        if (state === 'waiting') this.#reconnecting = true;
        else if (state !== 'connecting') this.#reconnecting = false;
        this.#render();
      },
    });
    if (this.#isCurrent(token)) this.#session = { kind: 'open', token, follow };
    else follow.stop();
  }

  #logged(row: LoggedMessage): void {
    const fresh = !this.#conversation.rows.some((r) => r.position === row.position);
    // Before the row is drawn, so a park's line drawn with it is heard after its words.
    if (fresh && row.author !== 'visitor') this.#announce(`${this.#authorName(row.author, row.author_display)}: ${row.text}`);
    this.#dispatch({ type: 'logged', row });
    if (!fresh || row.author === 'visitor') return;
    if (row.author === 'system' && this.#confirming && row.position > this.#confirming.after) {
      if (this.#confirming.taken !== 'pending') this.#settle();
    } else if (row.author !== 'system' && this.#answer) {
      performanceMeasure('agentflow-chat:answered', this.#answer.sent);
      this.#answer = null;
    }
  }

  #reply(event: ReplyEvent): void {
    const before = this.#conversation;
    this.#dispatch({ type: 'reply', event });
    if (event.kind !== 'delta' || before === this.#conversation || !this.#answer || this.#answer.words) return;
    this.#answer.words = true;
    performanceMeasure('agentflow-chat:first-words', this.#answer.sent);
  }

  #mark(change: (marks: SessionMarks) => Partial<SessionMarks>): void {
    const marks = this.#store!.marks();
    this.#marks = { ...marks, ...change(marks) };
    this.#store!.mark(this.#marks);
    this.#render();
  }

  #withToken<T>(call: (token: string) => Promise<T>): Promise<T> {
    const session = this.#session;
    if (session.kind !== 'open') return Promise.reject(new ChatRefusal(409, 'MESSAGE_THREAD_CLOSED', null));
    return call(session.token);
  }

  async #confirm(call: (token: string) => Promise<void>): Promise<void> {
    const earlier = this.#confirming;
    const confirming: Confirming = { after: earlier?.after ?? lastPosition(this.#conversation), taken: 'pending' };
    this.#confirming = confirming;
    let refusal: unknown = null;
    try {
      await this.#withToken(call);
    } catch (error) {
      refusal = error;
    }
    if (this.#confirming !== confirming) {
      if (refusal !== null) throw refusal;
      return;
    }
    // A confirm whose answer was lost may have taken the code, so a later refusal of the same code proves nothing.
    if (refusal === null || identityAlreadySet(refusal)) this.#confirming = { ...confirming, taken: 'yes' };
    else if (!(refusal instanceof ChatRefusal) || earlier?.taken === 'maybe') this.#confirming = { ...confirming, taken: 'maybe' };
    else {
      this.#confirming = null;
      throw refusal;
    }
    if (refusal === null) {
      if (this.#identityRow()) this.#settle();
      return;
    }
    await this.#settleByLog();
    if (this.#confirming !== null) throw refusal;
  }

  async #unlessVerified<T>(call: (token: string) => Promise<T>): Promise<T> {
    try {
      return await this.#withToken(call);
    } catch (error) {
      if (identityAlreadySet(error) && this.#confirming?.taken === 'maybe') {
        this.#confirming = { ...this.#confirming, taken: 'yes' };
        await this.#settleByLog();
      }
      throw error;
    }
  }

  #identityRow(): boolean {
    const confirming = this.#confirming;
    return confirming !== null && this.#conversation.rows.some((r) => r.author === 'system' && r.position > confirming.after);
  }

  /** The identity and its system row commit together, so once the log is read a known identity with no row is not this tab's. */
  async #settleByLog(): Promise<void> {
    if (this.#identityRow()) return this.#settle();
    const session = this.#session;
    const confirming = this.#confirming;
    if (session.kind !== 'open' || !confirming) return;
    const rows = await this.#api!.history(session.token, confirming.after).catch(() => null);
    if (!rows || !this.#isCurrent(session.token)) return;
    for (const row of rows) this.#logged(row);
    if (this.#confirming === confirming && confirming.taken === 'yes') this.#confirming = null;
  }

  #settle(): void {
    this.#confirming = null;
    this.#ui!.sheet.hide();
    this.#mark(() => ({ hasEmail: true, verified: true }));
    this.#resend();
  }

  #resend(): void {
    const rows = this.#conversation.rows;
    const visitor = rows.filter((r) => r.author === 'visitor');
    const last = visitor.at(-1);
    if (!last) return;
    // One id a thread, so another tab that settles too sends the same message, and the server answers it with the row it holds.
    const clientId = resendId(visitor[0]!.client_message_id ?? uuidV4());
    if (rows.some((r) => r.client_message_id === clientId)) return;
    this.#mark((marks) => ({ resentIds: [...marks.resentIds, clientId] }));
    this.#dispatch({ type: 'write', clientId, text: last.text });
    void this.#deliver(clientId, last.text, performance.now(), false);
  }

  #ended(token: string): void {
    const session = this.#session;
    if (session.kind !== 'open' || session.token !== token) return;
    session.follow?.stop();
    this.#forget();
    this.#session = { kind: 'ended' };
    this.#reconnecting = false;
    this.#dispatch({ type: 'typing', until: null });
  }

  #discard(token: string): void {
    const session = this.#session;
    if (session.kind !== 'open' || session.token !== token) return;
    session.follow?.stop();
    this.#forget();
    this.#session = { kind: 'none' };
    this.#reconnecting = false;
    this.#reset();
  }

  #forget(): void {
    this.#store!.forget();
    this.#confirming = null;
    this.#ui!.sheet.clear();
  }

  #reset(): void {
    this.#marks = NO_MARKS;
    this.#dispatch({ type: 'reset' });
  }

  #unavailable(down: Down): void {
    if (this.#session.kind === 'open') {
      this.#session.follow?.stop();
      this.#session = { ...this.#session, follow: null };
    }
    this.#config = down;
    this.#reconnecting = false;
    this.#dispatch({ type: 'typing', until: null });
  }

  #endChat(): void {
    const session = this.#session;
    if (session.kind !== 'open') return;
    this.#api!.close(session.token).catch(() => undefined);
    this.#ended(session.token);
  }

  #token(): Promise<string> {
    const session = this.#session;
    if (session.kind === 'open') return Promise.resolve(session.token);
    if (session.kind === 'opening') return session.token;
    if (session.kind === 'ended') {
      this.#session = { kind: 'none' };
      this.#reset();
    }
    const opening = this.#api!.openSession(this.getAttribute('identity-token') ?? undefined).then(
      ({ token }) => {
        this.#store!.save(token);
        this.#session = { kind: 'open', token, follow: null };
        this.#follow(token);
        return token;
      },
      (error: unknown) => {
        this.#session = { kind: 'none' };
        throw error;
      },
    );
    this.#session = { kind: 'opening', token: opening };
    return opening;
  }

  #submit(): void {
    const ui = this.#ui!;
    const text = ui.input.value.replace(/\0/g, '');
    if (!text.trim() || this.#down) return;
    if (new TextEncoder().encode(text).length > TEXT_MAX_BYTES) {
      this.#flash = 'tooLong';
      this.#render();
      return;
    }
    const clicked = performance.now();
    const clientId = uuidV4();
    ui.input.value = '';
    ui.input.focus();
    this.#flash = null;
    this.#answer = { sent: clicked, words: false };
    this.#dispatch({ type: 'write', clientId, text });
    void this.#deliver(clientId, text, clicked, true);
  }

  #retry(clientId: string): void {
    const pending = this.#conversation.pending.find((p) => p.clientId === clientId);
    if (!pending || pending.state !== 'failed') return;
    this.#flash = null;
    this.#dispatch({ type: 'retry', clientId });
    void this.#deliver(clientId, pending.text, performance.now(), true);
  }

  async #deliver(clientId: string, text: string, clicked: number, mayRestart: boolean): Promise<void> {
    let token: string | null = null;
    try {
      token = await this.#token();
      await this.#api!.post(token, text, clientId);
    } catch (error) {
      if (mayRestart && token !== null && error instanceof ChatRefusal && RESTART_ON.has(error.code)) {
        this.#discard(token);
        return this.#deliver(clientId, text, clicked, false);
      }
      if (error instanceof ChatRefusal && error.status === 429) this.#flash = token === null ? 'sessionLimited' : 'rateLimited';
      if (error instanceof ChatRefusal && error.unavailable) this.#unavailable('refused');
      else if (!(error instanceof ChatRefusal)) void this.#check();
      this.#dispatch({ type: 'failed', clientId });
      return;
    }
    this.#dispatch({ type: 'posted', clientId });
    performanceMeasure('agentflow-chat:sent', clicked);
  }

  #dispatch(...actions: ConversationAction[]): void {
    this.#conversation = actions.reduce(reduce, this.#conversation);
    this.#render();
  }

  #authorName(author: Exclude<Author, 'visitor'>, display: string | null): string {
    return display ?? this.#t(AUTHOR_TEXT[author]);
  }

  #items(): Item[] {
    const c = this.#conversation;
    const items: Item[] = c.rows.map((row) => ({
      kind: 'row',
      key: row.client_message_id ? `c:${row.client_message_id}` : row.stream_id !== undefined ? draftKey(row.stream_id, row.stream_segment ?? 0) : `p:${row.position}`,
      anchor: row.position,
      row,
    }));
    for (const reply of c.replies) {
      const row = storedRow(c.rows, reply.streamId, reply.segment);
      if (!row) items.push({ kind: 'draft', key: draftKey(reply.streamId, reply.segment), anchor: reply.afterPosition, reply });
      else if (reply.shown !== 'unsent') items.push({ kind: 'note', key: `n:${reply.streamId}`, anchor: row.position, reply });
    }
    items.push(...c.pending.map((pending): Item => ({ kind: 'pending', key: `c:${pending.clientId}`, anchor: Infinity, pending })));
    return items.sort((a, b) => a.anchor - b.anchor || ITEM_RANK[a.kind] - ITEM_RANK[b.kind]);
  }

  #render(): void {
    const ui = this.#ui;
    if (!ui || this.#config === null) return;
    const c = this.#conversation;
    const now = Date.now();
    const focused = this.shadowRoot!.activeElement;
    const items = this.#items();
    const keys = new Set(items.map((item) => item.key));
    for (const [key, node] of this.#nodes) {
      if (keys.has(key)) continue;
      node.remove();
      this.#nodes.delete(key);
    }
    const atEnd = ui.log.scrollHeight - ui.log.scrollTop - ui.log.clientHeight < 32;
    let previous: Element = ui.greeting;
    for (const item of items) {
      const part = item.kind === 'note' ? 'note' : 'message';
      let node = this.#nodes.get(item.key);
      if (!node || node.getAttribute('part') !== part) {
        node?.remove();
        node = document.createElement('div');
        node.setAttribute('part', part);
        this.#nodes.set(item.key, node);
      }
      this.#paint(node, item);
      if (previous.nextElementSibling !== node) previous.after(node);
      previous = node;
    }
    if (items.length !== this.#drawn || atEnd) {
      this.#drawn = items.length;
      ui.log.scrollTop = ui.log.scrollHeight;
    }
    if (focused && !focused.isConnected) ui.input.focus();

    clearTimeout(this.#typingTimer);
    const until = c.typingUntil;
    const writing = c.replies.some((r) => r.shown === 'live' && !r.done && r.text !== '');
    const typing = until !== null && until > now && !writing;
    ui.typing.hidden = !typing;
    if (until !== null && until > now) this.#typingTimer = setTimeout(() => this.#render(), Math.min(until - now, 2 ** 31 - 1));

    const unavailable = this.#down;
    const notice: Notice | null = unavailable
      ? 'unavailable'
      : this.#session.kind === 'ended'
        ? 'ended'
        : (this.#flash ?? (this.#reconnecting ? 'reconnecting' : null));
    ui.notice.hidden = notice === null;
    setText(ui.notice, notice === null ? '' : this.#t(NOTICE_TEXT[notice]));
    ui.end.hidden = unavailable || this.#session.kind !== 'open';
    ui.input.disabled = ui.send.disabled = unavailable;
  }

  #paint(node: HTMLElement, item: Item): void {
    if (item.kind === 'note') return this.#paintNote(node, item.reply);
    const row = item.kind === 'row' ? item.row : null;
    const pending = item.kind === 'pending' ? item.pending : null;
    const reply = item.kind === 'draft' ? item.reply : null;
    const author: Author = row ? row.author : reply ? 'agent' : 'visitor';
    const clientId = row?.client_message_id ?? pending?.clientId ?? null;
    const resent = clientId !== null && this.#marks.resentIds.includes(clientId);
    const named = reply ? this.#conversation.rows.filter((r) => r.stream_id === reply.streamId).at(-1)?.author_display : row?.author_display;
    if (reply?.shown === 'unsent' && node.getAttribute('data-state') !== 'unsent') this.#announce(this.#t('replyUnsent'));
    setAttr(node, 'data-author', author);
    setAttr(node, 'data-position', row ? String(row.position) : null);
    setAttr(node, 'data-client-id', pending ? pending.clientId : null);
    setAttr(node, 'data-state', pending ? pending.state : reply?.shown === 'unsent' ? 'unsent' : null);
    setAttr(node, 'data-draft', reply?.shown === 'live' ? '' : null);
    setAttr(node, 'data-resent', resent ? '' : null);
    slot(node, 'author', 'span', author === 'visitor' ? null : this.#authorName(author, named ?? null));
    const text = row?.text ?? pending?.text ?? (reply!.shown === 'unsent' ? this.#t('replyUnsent') : reply!.text);
    slot(node, 'text', 'p', text === '' ? null : text);
    slot(node, 'label', 'span', reply?.shown === 'live' && !reply.done ? (reply.label ?? this.#t('working')) : null);
    slot(node, 'status', 'span', pending ? this.#t(STATUS_TEXT[pending.state]) : null);
    slot(node, 'retry', 'button', pending?.state === 'failed' && !this.#down ? this.#t('retry') : null);
    slot(node, 'resent', 'span', resent ? this.#t('resent') : null);
  }

  #paintNote(node: HTMLElement, reply: Reply): void {
    const failed = reply.shown === 'restUnsent';
    const line = !failed && reply.parked;
    const lineText = line ? this.#t(this.#marks.hasEmail ? 'replyComingEmail' : 'replyComing') : null;
    const offer = line && !this.#marks.hasEmail && this.#session.kind === 'open' ? this.#t('emailOffer') : null;
    if (failed && node.getAttribute('data-state') !== 'unsent') this.#announce(this.#t('replyRestUnsent'));
    if (lineText && !node.querySelector("[part='line']")) this.#announce(offer ? `${lineText} ${offer}` : lineText);
    setAttr(node, 'data-state', failed ? 'unsent' : null);
    slot(node, 'label', 'span', failed ? null : (reply.label ?? this.#t('working')));
    slot(node, 'line', 'span', lineText);
    slot(node, 'email-offer', 'button', offer);
    slot(node, 'text', 'p', failed ? this.#t('replyRestUnsent') : null);
  }
}
