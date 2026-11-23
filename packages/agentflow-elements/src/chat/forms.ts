import { h, setText } from './dom.js';
import type { ChatKey } from './strings.js';
import { ChatRefusal, type VerifyMethod } from './transport.js';

export interface SheetActions {
  sendCode(email: string): Promise<void>;
  confirmCode(code: string): Promise<void>;
  startSignIn(): Promise<string>;
  confirmSignIn(code: string): Promise<void>;
  giveEmail(email: string): Promise<void>;
  verified(): void;
  emailGiven(): void;
  hidden(): void;
}

type SignIn = { kind: 'idle' } | { kind: 'started'; url: string; blocked: boolean };

type Sheet =
  | { kind: 'hidden' }
  | { kind: 'verify'; methods: VerifyMethod[]; sentTo: string | null; signIn: SignIn }
  | { kind: 'email' };

const SIGN_IN_WINDOW = 'popup,width=480,height=640';

function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  return `${email.slice(0, 1)}•••${email.slice(at)}`;
}

function webUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function field(name: string, attributes: Record<string, string>) {
  const input = h('input', { id: `sheet-${name}`, name, ...attributes });
  const label = h('label', { for: `sheet-${name}` });
  return { label, input };
}

export class ChatSheet {
  readonly node = h('section', { part: 'sheet', hidden: '' });
  #state: Sheet = { kind: 'hidden' };
  #error: ChatKey | null = null;
  #busy = false;
  readonly #t: (key: ChatKey) => string;
  readonly #actions: SheetActions;
  readonly #title = h('h3', { part: 'sheet-title' });
  readonly #intro = h('p', { part: 'sheet-intro' });
  readonly #address = field('email', { type: 'email', autocomplete: 'email', inputmode: 'email', spellcheck: 'false' });
  readonly #addressSubmit = h('button', { type: 'submit', class: 'primary' });
  readonly #addressCancel = h('button', { type: 'button', class: 'link' });
  readonly #addressForm = h('form', { part: 'address-form', novalidate: '' });
  readonly #code = field('code', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '9' });
  readonly #codeSent = h('p', { part: 'code-sent' });
  readonly #codeSubmit = h('button', { type: 'submit', class: 'primary' });
  readonly #codeAgain = h('button', { type: 'button', class: 'link' });
  readonly #codeForm = h('form', { part: 'code-form', novalidate: '' });
  readonly #or = h('p', { part: 'or' });
  readonly #signIn = h('button', { part: 'sign-in', type: 'button', class: 'secondary' });
  readonly #signInHint = h('p', { part: 'sign-in-hint' });
  readonly #signInLink = h('a', { part: 'sign-in-link', target: '_blank', rel: 'noopener noreferrer' });
  readonly #signInCode = field('sign-in-code', { autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', maxlength: '12' });
  readonly #signInSubmit = h('button', { type: 'submit', class: 'primary' });
  readonly #signInForm = h('form', { part: 'sign-in-form', novalidate: '' });
  readonly #errorLine = h('p', { part: 'sheet-error', role: 'alert' });
  readonly #later = h('button', { part: 'later', type: 'button', class: 'link' });

  constructor(t: (key: ChatKey) => string, actions: SheetActions) {
    this.#t = t;
    this.#actions = actions;
    this.#addressForm.append(this.#address.label, h('div', { class: 'row' }, this.#address.input, this.#addressSubmit), this.#addressCancel);
    this.#codeForm.append(this.#codeSent, this.#code.label, h('div', { class: 'row' }, this.#code.input, this.#codeSubmit), this.#codeAgain);
    this.#signInForm.append(this.#signInHint, this.#signInLink, this.#signInCode.label, h('div', { class: 'row' }, this.#signInCode.input, this.#signInSubmit));
    this.node.append(this.#title, this.#intro, this.#addressForm, this.#codeForm, this.#or, this.#signIn, this.#signInForm, this.#errorLine, this.#later);
    this.#addressForm.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.#submitAddress();
    });
    this.#codeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.#submitCode(this.#code.input.value.replace(/\s/g, ''), /^\d{6}$/, (code) => this.#actions.confirmCode(code));
    });
    this.#signInForm.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.#submitCode(this.#signInCode.input.value.replace(/[\s-]/g, ''), /^[0-9a-z]{8}$/i, (code) => this.#actions.confirmSignIn(code));
    });
    this.#signIn.addEventListener('click', () => this.#startSignIn());
    this.#codeAgain.addEventListener('click', () => this.#update({ sentTo: null }, this.#address.input));
    this.#addressCancel.addEventListener('click', () => this.hide());
    this.#later.addEventListener('click', () => this.hide());
  }

  askVerify(methods: VerifyMethod[]): void {
    if (this.#state.kind === 'verify') this.#state = { ...this.#state, methods };
    else this.#state = { kind: 'verify', methods, sentTo: null, signIn: { kind: 'idle' } };
    this.paint();
  }

  askEmail(): void {
    this.#state = { kind: 'email' };
    this.#error = null;
    this.paint();
    this.#address.input.focus();
  }

  hide(): void {
    const focused = this.node.contains((this.node.getRootNode() as ShadowRoot | Document).activeElement);
    this.#state = { kind: 'hidden' };
    this.#error = null;
    this.paint();
    if (focused) this.#actions.hidden();
  }

  /** The next visitor on a shared device never sees this one's address. */
  clear(): void {
    for (const input of [this.#address.input, this.#code.input, this.#signInCode.input]) input.value = '';
    this.hide();
  }

  paint(): void {
    const state = this.#state;
    const t = this.#t;
    this.node.hidden = state.kind === 'hidden';
    const verify = state.kind === 'verify' ? state : null;
    const byEmail = verify?.methods.includes('email_code') ?? false;
    const bySignIn = verify?.methods.includes('agentflow') ?? false;
    const signIn = verify?.signIn ?? { kind: 'idle' };
    this.#title.hidden = this.#intro.hidden = this.#later.hidden = !verify;
    this.#addressForm.hidden = !(state.kind === 'email' || (byEmail && verify!.sentTo === null));
    this.#addressCancel.hidden = state.kind !== 'email';
    this.#codeForm.hidden = !(byEmail && verify!.sentTo !== null);
    this.#or.hidden = !(byEmail && bySignIn);
    this.#signIn.hidden = !bySignIn;
    this.#signInForm.hidden = !bySignIn || signIn.kind !== 'started';
    this.#signInLink.hidden = signIn.kind !== 'started' || !signIn.blocked;
    if (signIn.kind === 'started') this.#signInLink.href = signIn.url;
    this.#errorLine.hidden = this.#error === null;
    this.node.toggleAttribute('aria-busy', this.#busy);

    setText(this.#title, t('verifyTitle'));
    setText(this.#intro, t('verifyIntro'));
    setText(this.#address.label, t('emailLabel'));
    setText(this.#addressSubmit, t(state.kind === 'email' ? 'emailSave' : 'sendCode'));
    setText(this.#addressCancel, t('cancel'));
    setText(this.#codeSent, t('codeSent').replace('{email}', maskEmail(verify?.sentTo ?? '')));
    setText(this.#code.label, t('codeLabel'));
    setText(this.#codeSubmit, t('confirm'));
    setText(this.#codeAgain, t('otherAddress'));
    setText(this.#or, t('or'));
    setText(this.#signIn, t('signIn'));
    setText(this.#signInHint, t('signInHint'));
    setText(this.#signInLink, t('signInOpen'));
    setText(this.#signInCode.label, t('signInCodeLabel'));
    setText(this.#signInSubmit, t('confirm'));
    setText(this.#errorLine, this.#error === null ? '' : t(this.#error));
    setText(this.#later, t('verifyLater'));
  }

  #update(patch: Partial<Extract<Sheet, { kind: 'verify' }>>, focus?: HTMLElement): void {
    if (this.#state.kind !== 'verify') return;
    this.#state = { ...this.#state, ...patch };
    this.#error = null;
    this.paint();
    focus?.focus();
  }

  async #run(work: () => Promise<void>, invalid: ChatKey, focus?: HTMLElement): Promise<void> {
    if (this.#busy) return;
    this.#busy = true;
    this.#error = null;
    this.paint();
    let refusal: unknown = null;
    try {
      await work();
    } catch (error) {
      refusal = error;
    }
    this.#busy = false;
    if (refusal instanceof ChatRefusal && refusal.code === 'CHAT_IDENTITY_ALREADY_SET') return this.hide();
    if (refusal !== null) {
      const status = refusal instanceof ChatRefusal ? refusal.status : 0;
      this.#error = status === 422 ? invalid : status === 429 ? 'tooManyTries' : 'verifyFailed';
    }
    this.paint();
    if (refusal === null) focus?.focus();
  }

  async #submitAddress(): Promise<void> {
    const email = this.#address.input.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.#error = 'emailInvalid';
      return this.paint();
    }
    if (this.#state.kind === 'email') {
      return this.#run(async () => {
        await this.#actions.giveEmail(email);
        this.hide();
        this.#actions.emailGiven();
      }, 'emailInvalid');
    }
    return this.#run(
      async () => {
        await this.#actions.sendCode(email);
        this.#code.input.value = '';
        this.#update({ sentTo: email });
      },
      'emailInvalid',
      this.#code.input,
    );
  }

  async #submitCode(code: string, shape: RegExp, confirm: (code: string) => Promise<void>): Promise<void> {
    if (!shape.test(code)) {
      this.#error = 'codeInvalid';
      return this.paint();
    }
    return this.#run(async () => {
      await confirm(code);
      this.hide();
      this.#actions.verified();
    }, 'codeInvalid');
  }

  #startSignIn(): void {
    if (this.#busy) return;
    // Safari opens a window only while the click is being handled, so it is opened blank before the request.
    const popup = window.open('', 'agentflow-chat-sign-in', SIGN_IN_WINDOW);
    try {
      if (popup) popup.opener = null;
    } catch {
      // A second click reaches the first window, by now on the identity provider's origin.
    }
    void this.#run(
      async () => {
        try {
          const url = webUrl(await this.#actions.startSignIn());
          if (!url) throw new Error('sign-in answered no web address');
          const blocked = !popup || popup.closed;
          if (!blocked) popup.location.href = url;
          this.#signInCode.input.value = '';
          this.#update({ signIn: { kind: 'started', url, blocked } });
        } catch (error) {
          popup?.close();
          throw error;
        }
      },
      'verifyFailed',
      this.#signInCode.input,
    );
  }
}
