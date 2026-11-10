class NoResize { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;
class NoIntersection { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
globalThis.IntersectionObserver ??= NoIntersection as unknown as typeof IntersectionObserver;
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.scrollTo ??= function () {} as Element['scrollTo'];
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
// jsdom's selector engine adds window key listeners on its first query; make it before any test watches for listeners.
document.querySelector('*');
document.execCommand ??= () => false;
// jsdom's ElementInternals has no form value or validity; record what the kit writes, where a browser would keep it.
type Recorded = ElementInternals & { __value?: unknown; __validity?: ValidityStateFlags; __message?: string };
if (typeof ElementInternals !== 'undefined' && !('setFormValue' in ElementInternals.prototype)) {
  Object.assign(ElementInternals.prototype, {
    setFormValue(this: Recorded, value: unknown) { this.__value = value; },
    setValidity(this: Recorded, flags: ValidityStateFlags = {}, message = '') {
      // As a browser does: a flag needs a message.
      if (Object.values(flags).some(Boolean) && !message) throw new TypeError('setValidity: a flag needs a non-empty message');
      this.__validity = flags;
      this.__message = message;
    },
    checkValidity(this: Recorded) { return !Object.values(this.__validity ?? {}).some(Boolean); },
  });
}
// jsdom has no DataTransfer. A browser's drop carries one whose items are the dropped files and whose types say so.
if (typeof DataTransfer === 'undefined') {
  class FileDataTransfer {
    dropEffect = 'none';
    effectAllowed = 'all';
    readonly files: File[] = [];
    readonly items = Object.assign([] as { kind: 'file'; type: string; getAsFile(): File; webkitGetAsEntry(): { isFile: true; isDirectory: false; name: string } }[], {
      add: (file: File) => {
        this.files.push(file);
        this.items.push({ kind: 'file', type: file.type, getAsFile: () => file, webkitGetAsEntry: () => ({ isFile: true, isDirectory: false, name: file.name }) });
        return null;
      },
    });
    get types(): string[] { return this.files.length ? ['Files'] : []; }
  }
  globalThis.DataTransfer = FileDataTransfer as unknown as typeof DataTransfer;
}
