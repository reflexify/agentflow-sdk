// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { forwardStrayKeys } from '../src/page-keys.js';

afterEach(() => document.body.replaceChildren());

/** A module on a page: its root inside a shadow root, a button in it, and a field of the page's own outside it. */
function page() {
  const host = document.body.appendChild(document.createElement('div'));
  const shadow = host.attachShadow({ mode: 'open' });
  const root = shadow.appendChild(document.createElement('div'));
  const inside = root.appendChild(document.createElement('button'));
  const outside = document.body.appendChild(document.createElement('input'));
  const heard: string[] = [];
  shadow.addEventListener('keydown', (e) => heard.push((e as KeyboardEvent).key));
  return { shadow, root, inside, outside, heard };
}
const press = (target: EventTarget, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, composed: true }));

describe('forwardStrayKeys', () => {
  it('gives the module a key pressed while nothing has focus, once, and leaves every other key where it was typed', () => {
    const { root, inside, outside, heard } = page();
    const stop = forwardStrayKeys(document, root);
    press(document.body, 'j');
    press(outside, 'k');
    press(inside, 'n');
    expect(heard).toEqual(['j', 'n']);
    stop();
    press(document.body, 'j');
    expect(heard).toEqual(['j', 'n']);
  });

  it('tells the page a key was taken when the module took it', () => {
    const { shadow, root } = page();
    shadow.addEventListener('keydown', (e) => e.preventDefault());
    forwardStrayKeys(document, root);
    expect(press(document.body, '/')).toBe(false);
  });
});
