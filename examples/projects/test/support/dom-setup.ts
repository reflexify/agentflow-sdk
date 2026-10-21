// The stubs jsdom lacks that the kit and the module's previews need. The kit's own test setup holds the same lines:
// the duplication across the two packages is accepted test scaffolding.
if (typeof window !== 'undefined') {
  class NoResize { observe() {} unobserve() {} disconnect() {} }
  globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= function () {};
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= function () {};
  Element.prototype.releasePointerCapture ??= function () {};
  HTMLElement.prototype.showPopover ??= function (this: HTMLElement) { this.dataset.shown = 'true'; };
  HTMLElement.prototype.hidePopover ??= function (this: HTMLElement) { this.dataset.shown = 'false'; };
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
  document.elementFromPoint ??= () => null;
  Range.prototype.getBoundingClientRect ??= () => new DOMRect();
  Range.prototype.getClientRects ??= () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
  let blobs = 0;
  URL.createObjectURL ??= () => `blob:test/${++blobs}`;
  URL.revokeObjectURL ??= () => {};
  // jsdom's selector engine adds window key listeners on its first query; make it before any test watches for listeners.
  document.querySelector('*');
  await import('@reflexify/agentflow-elements/kit');
}
export {};
