import { describe, expect, it } from 'vitest';
import DropGuard from './fixtures/DropGuard.svelte';
import KeyLeak from './fixtures/KeyLeak.svelte';
import { acceptedCaller, settle, shadow, watchDocumentKeyListeners, watchDocumentListeners } from '../support.js';

customElements.get('kit-key-leak') ?? customElements.define('kit-key-leak', (KeyLeak as unknown as { element: CustomElementConstructor }).element);
customElements.get('kit-drop-guard') ?? customElements.define('kit-drop-guard', (DropGuard as unknown as { element: CustomElementConstructor }).element);

const at = (fn: string, file: string) => `    at ${fn} (/repo/node_modules/.pnpm/${file})`;
const DOM_QUERY = '@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/event.mjs:111:9';
const DISMISSABLE = '@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs:9:10';
const POPOVER = '@zag-js+popover@1.43.3/node_modules/@zag-js/popover/dist/popover.machine.mjs:288:9';
const RENDER = 'svelte@5.57.1/node_modules/svelte/src/internal/client/render.js:248:12';

async function leak(inScript: boolean) {
  document.body.innerHTML = '';
  const el = document.createElement('kit-key-leak');
  if (inScript) el.setAttribute('data-leak-in-script', '');
  document.body.append(el);
  await settle();
  return el;
}

describe('the document key listener guard', () => {
  it('judges a listener by the code that added it, not by a frame further up', () => {
    expect(acceptedCaller([at('addDomEvent', DOM_QUERY), at('trackEscapeKeydown', DISMISSABLE)])).toBe(true);
    expect(acceptedCaller([at('event_handle', RENDER), at('_mount', RENDER)])).toBe(true);
    expect(acceptedCaller([at('leak', 'kit/Element.svelte:3:1'), at('invokeOnClose', POPOVER)])).toBe(false);
    expect(acceptedCaller([at('script', 'kit/Element.svelte:3:1'), at('_mount', RENDER)])).toBe(false);
    expect(acceptedCaller([at('addDomEvent', DOM_QUERY), at('runAnimationFrameCallbacks', 'jsdom/lib/Window.js:1:1')])).toBe(false);
  });

  it('reports a key listener a component adds from its own script', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      await leak(true);
      expect(watch.fromKit()).toEqual(['document:keydown']);
    } finally {
      watch.restore();
    }
  });

  it('reports a key listener added from a callback Zag invokes', async () => {
    const el = await leak(false);
    const watch = watchDocumentKeyListeners();
    try {
      (shadow(el).querySelector('[data-testid="leak-inside"]') as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }),
      );
      await settle();
      expect(watch.fromKit()).toEqual(['document:keydown']);
    } finally {
      watch.restore();
    }
  });

  it("reports the document drop guard Ark's file upload adds by default, once its drop zone is dragged over", async () => {
    const watch = watchDocumentListeners((type) => type.startsWith('drag') || type === 'drop');
    try {
      document.body.innerHTML = '';
      const el = document.createElement('kit-drop-guard');
      document.body.append(el);
      await settle();
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(['x'], 'a.pdf', { type: 'application/pdf' }));
      const over = Object.assign(new Event('dragover', { bubbles: true, cancelable: true, composed: true }), { dataTransfer });
      shadow(el).querySelector('[data-testid="zone"]')!.dispatchEvent(over);
      await settle();
      expect(watch.fromKit()).toEqual(['document:dragover', 'document:drop']);
    } finally {
      watch.restore();
    }
  });
});
