export const CHAT_CSS = `
:host {
  all: initial;
  --afc-bg: #ffffff;
  --afc-fg: #111827;
  --afc-muted: #5b6472;
  --afc-line: #dfe3e8;
  --afc-bubble: #f1f3f5;
  --afc-danger: #b42318;
  --afc-shadow: 0 12px 32px rgb(15 23 42 / 0.18), 0 2px 6px rgb(15 23 42 / 0.12);
}
@media (prefers-color-scheme: dark) {
  :host {
    --afc-bg: #17191c;
    --afc-fg: #f2f4f7;
    --afc-muted: #a3abb7;
    --afc-line: #30353b;
    --afc-bubble: #24282d;
    --afc-danger: #f97066;
    --afc-shadow: 0 12px 32px rgb(0 0 0 / 0.5);
  }
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
button { font: inherit; color: inherit; cursor: pointer; }
:focus-visible { outline: 2px solid var(--afc-fg); outline-offset: 2px; }
[part='launcher'], [part='panel'] {
  position: fixed;
  z-index: 2147483000;
  font: 15px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
[part='launcher'] {
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--afc-accent);
  color: var(--afc-on-accent);
  box-shadow: var(--afc-shadow);
}
[part='panel'] {
  right: 20px;
  bottom: 88px;
  width: min(380px, calc(100vw - 40px));
  height: min(600px, calc(100vh - 108px));
  height: min(600px, calc(100dvh - 108px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--afc-bg);
  color: var(--afc-fg);
  border: 1px solid var(--afc-line);
  border-radius: 14px;
  box-shadow: var(--afc-shadow);
}
[part='header'] {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 8px 8px 8px 16px;
  background: var(--afc-accent);
  color: var(--afc-on-accent);
}
[part='header'] :focus-visible { outline-color: var(--afc-on-accent); outline-offset: -4px; }
[part='logo'] { width: 28px; height: 28px; border-radius: 6px; object-fit: contain; flex: none; }
[part='title'] {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
[part='end'] {
  flex: none;
  min-height: 32px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: transparent;
}
[part='close'] {
  flex: none;
  width: 40px;
  height: 40px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
}
[part='log'] {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
[part='log']:focus-visible { outline-offset: -2px; }
[part='greeting'], [part='message'] {
  max-width: 85%;
  margin: 0;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--afc-bubble);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
[part='message'][data-author='visitor'] {
  align-self: flex-end;
  background: var(--afc-accent);
  color: var(--afc-on-accent);
}
[part='message'][data-state='failed'] { outline: 1px solid var(--afc-danger); outline-offset: 1px; }
[part='author'] { display: block; margin-bottom: 2px; font-size: 12px; font-weight: 600; color: var(--afc-muted); }
[part='text'] { margin: 0; }
[part='status'] { display: block; margin-top: 2px; font-size: 12px; opacity: 0.85; text-align: end; }
[part='retry'] {
  display: block;
  margin: 4px 0 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
}
[part='label'], [part='line'], [part='resent'] { display: block; margin-top: 4px; font-size: 12px; color: var(--afc-muted); }
[part='message'][data-author='visitor'][data-resent] { background: var(--afc-bubble); color: var(--afc-fg); box-shadow: inset 0 0 0 1px var(--afc-line); }
[part='message'][data-author='visitor'] [part='resent'] { text-align: end; }
[part='message'][data-state='unsent'], [part='note'][data-state='unsent'] { color: var(--afc-danger); }
[part='note'] {
  max-width: 85%;
  margin: -4px 0 0;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 12px;
  color: var(--afc-muted);
}
[part='note'] [part='label'] { margin-top: 0; }
[part='note'] [part='text'] { font-size: 13px; }
[part='email-offer'], [part='sheet'] .link {
  padding: 2px 0;
  border: 0;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
}
[part='sheet'] {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60%;
  overflow-y: auto;
  padding: 12px;
  border-top: 1px solid var(--afc-line);
  font-size: 14px;
}
[part='sheet'] form { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; margin: 0; }
[part='sheet'] p { margin: 0; }
[part='sheet-title'] { margin: 0; font-size: 15px; font-weight: 600; }
[part='sheet'] label { font-size: 13px; font-weight: 500; }
[part='sheet'] .row { display: flex; flex-wrap: wrap; gap: 8px; align-self: stretch; }
[part='sheet'] input {
  flex: 1 1 140px;
  min-width: 0;
  min-height: 40px;
  margin: 0;
  padding: 8px 12px;
  font: inherit;
  font-size: 16px;
  color: inherit;
  background: var(--afc-bg);
  border: 1px solid var(--afc-line);
  border-radius: 10px;
}
[part='sheet'] .primary, [part='sheet'] .secondary {
  flex: none;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 600;
}
[part='sheet'] .primary { border: 0; background: var(--afc-accent); color: var(--afc-on-accent); }
[part='sheet'] .secondary { align-self: flex-start; border: 1px solid var(--afc-line); background: transparent; }
[part='sheet'][aria-busy] button { opacity: 0.6; cursor: progress; }
[part='or'] { font-size: 12px; color: var(--afc-muted); }
[part='sign-in-link'] { color: inherit; font-size: 13px; }
[part='sheet-error'] { color: var(--afc-danger); font-size: 13px; }
[part='later'] { align-self: flex-start; }
[part='typing'], [part='notice'] { margin: 0; padding: 4px 16px 8px; font-size: 13px; color: var(--afc-muted); }
[part='composer'] {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--afc-line);
}
[part='input'] {
  flex: 1;
  min-width: 0;
  min-height: 40px;
  max-height: 120px;
  field-sizing: content;
  resize: none;
  margin: 0;
  padding: 8px 12px;
  font: inherit;
  font-size: 16px;
  color: inherit;
  background: var(--afc-bg);
  border: 1px solid var(--afc-line);
  border-radius: 10px;
}
[part='input']::placeholder { color: var(--afc-muted); opacity: 1; }
[part='send'] {
  flex: none;
  width: 40px;
  height: 40px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: var(--afc-accent);
  color: var(--afc-on-accent);
}
[part='input']:disabled, [part='send']:disabled { opacity: 0.5; cursor: not-allowed; }
.label, [part='live'] {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 479.98px) {
  [part='panel'] {
    inset: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border: 0;
    border-radius: 0;
  }
}
`;
