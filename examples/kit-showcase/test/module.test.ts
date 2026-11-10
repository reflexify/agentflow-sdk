// @vitest-environment jsdom
import { createModuleContainer, createStandaloneHost, type StandaloneHost } from '@reflexify/agentflow-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';

// What jsdom lacks and the kit's elements or the standalone host use.
class NoResize { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function () {};
HTMLElement.prototype.showPopover ??= function (this: HTMLElement) { this.dataset.shown = 'true'; };
HTMLElement.prototype.hidePopover ??= function (this: HTMLElement) { this.dataset.shown = 'false'; };
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
document.elementFromPoint ??= () => null;
Range.prototype.getBoundingClientRect ??= () => new DOMRect();
Range.prototype.getClientRects ??= () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
document.execCommand ??= () => false;
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;

const { KIT_TAGS } = await import('@reflexify/agentflow-elements/kit');
const { mount } = await import('../src/module/module.js');

const CALLER = { id: 'u1', kind: 'person', display_name: 'Bo Tran', email: 'bo@example.com', org_id: 'o1', org_name: 'Acme' };

let host: StandaloneHost | undefined;

// Mounting draws every kit element in jsdom, which takes seconds here and longer on a loaded
// runner; these tests check what mounts, not how fast.
const MOUNT_MS = 60_000;

async function mountShowcase() {
  const element = document.createElement('div');
  document.body.append(element);
  const { root, portalRoot } = createModuleContainer(element);
  const fetch = vi.fn(async (request: Request) =>
    new URL(request.url).pathname.endsWith('/caller') ? Response.json(CALLER) : new Response(null, { status: 404 }));
  host = await createStandaloneHost({ container: element, portalRoot, fetch });
  const unmount = mount(root, host);
  // React renders on its own schedule; the page is there once its first section is.
  await vi.waitFor(() => expect(root.querySelector('section')).not.toBeNull(), { timeout: MOUNT_MS });
  return { root, unmount };
}

afterEach(() => {
  host?.close();
  host = undefined;
  document.body.replaceChildren();
});

describe('the kit showcase', () => {
  it('mounts without throwing, with every kit tag and a heading for each section', { timeout: MOUNT_MS }, async () => {
    const { root } = await mountShowcase();
    for (const tag of KIT_TAGS) expect(root.querySelector(tag), tag).not.toBeNull();
    const sections = [...root.querySelectorAll('section')];
    expect(sections.length).toBeGreaterThanOrEqual(4);
    for (const section of sections) {
      const heading = root.querySelector(`#${section.getAttribute('aria-labelledby')}`);
      expect(heading?.textContent?.trim(), section.outerHTML.slice(0, 80)).toBeTruthy();
      expect(section.contains(heading)).toBe(true);
    }
    expect(root.querySelector('[data-testid="showcase-events"]')).not.toBeNull();
  });

  it('empties its root when unmounted', { timeout: MOUNT_MS }, async () => {
    const { root, unmount } = await mountShowcase();
    unmount();
    expect(root.childNodes.length).toBe(0);
    expect(root.getRootNode() instanceof ShadowRoot && (root.getRootNode() as ShadowRoot).querySelector('style')).toBe(null);
  });
});
