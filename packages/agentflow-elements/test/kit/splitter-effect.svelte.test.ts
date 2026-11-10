import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

afterEach(() => vi.restoreAllMocks());

describe('<af-splitter> set from a Svelte page', () => {
  it('follows a size an effect gives it, without that effect depending on the element', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, 600, 160));
    document.body.innerHTML = '';
    const el = document.createElement('af-splitter') as HTMLElement & { size: number };
    el.innerHTML = '<p slot="start">Start</p><p slot="end">End</p>';
    document.body.append(el);
    await settle();

    let wanted = $state(40);
    let runs = 0;
    const stop = $effect.root(() => {
      $effect(() => {
        // A dependency on the element's own counter would make this run again and again; stop it after a few.
        if (++runs > 5) throw new Error('the effect depends on the splitter');
        el.size = wanted;
      });
    });
    onTestFinished(stop);
    flushSync();
    await settle();
    expect(runs).toBe(1);
    expect(shadow(el).querySelector('[part~="handle"]')!.getAttribute('aria-valuenow')).toBe('40');

    wanted = 55;
    flushSync();
    await settle();
    expect(runs).toBe(2);
    expect(shadow(el).querySelector('[part~="handle"]')!.getAttribute('aria-valuenow')).toBe('55');
  });
});
