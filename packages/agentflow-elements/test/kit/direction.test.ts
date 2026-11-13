import { describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import { directionOf } from '../../src/kit/environment.js';
import { settle, shadow } from '../support.js';

// Each element that builds a Zag machine, with the least it needs to draw. Zag writes the machine's `dir` on the parts it
// draws, so the parts in the shadow root say which direction the machine was given.
const ELEMENTS: Record<string, Record<string, unknown>> = {
  'af-tabs': { items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'a' },
  'af-menu': { items: [{ id: 'a', label: 'A' }], label: 'Actions' },
  'af-select': { options: [{ value: 'a', label: 'A' }], value: null },
  'af-combobox': { options: [{ value: 'a', label: 'A' }], value: null },
  'af-person-picker': { people: [{ id: 'u1', name: 'Bình', email: null }] },
  'af-date': {},
  'af-splitter': {},
  'af-number-input': {},
  'af-tree-picker': { nodes: [{ id: 'hq', parentId: null, label: 'HQ' }] },
};

async function mountIn(tag: string, dir: string | null) {
  document.body.innerHTML = '';
  const wrap = document.createElement('div');
  if (dir) wrap.setAttribute('dir', dir);
  const el = document.createElement(tag);
  Object.assign(el, ELEMENTS[tag]);
  wrap.append(el);
  document.body.append(wrap);
  await settle();
  return el;
}

// Each Zag part's scope and dir, as `scope:dir`, for the parts whose dir is not `want`; the element's own machine comes
// first, and a scroll area inside its list counts too.
const astray = (el: Element, want: string) =>
  [...shadow(el).querySelectorAll<HTMLElement>('[data-scope][dir]')].filter((n) => n.getAttribute('dir') !== want).map((n) => `${n.dataset.scope}:${n.dataset.part}:${n.getAttribute('dir')}`);

describe('the page’s text direction', () => {
  it('reaches the machine of every element that builds one', async () => {
    for (const tag of Object.keys(ELEMENTS)) {
      expect(astray(await mountIn(tag, 'rtl'), 'rtl'), `${tag} under dir="rtl"`).toEqual([]);
      expect(astray(await mountIn(tag, null), 'ltr'), `${tag} with no dir`).toEqual([]);
    }
  });

  it('is the closest dir attribute, else the computed direction', () => {
    document.body.innerHTML = '<div dir="rtl"><section dir="ltr"><span id="inner"></span></section><span id="outer"></span></div><p id="none"></p>';
    expect(directionOf(document.getElementById('inner')!)).toBe('ltr');
    expect(directionOf(document.getElementById('outer')!)).toBe('rtl');
    expect(directionOf(document.getElementById('none')!)).toBe('ltr');
  });
});
