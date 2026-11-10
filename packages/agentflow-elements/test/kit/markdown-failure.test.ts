import { describe, expect, it, vi } from 'vitest';

// The view's chunk fails to load the first time it is asked for, as a 404 during a redeploy would, and loads after.
const chunk = vi.hoisted(() => ({ calls: 0 }));
vi.mock('../../src/kit/prose/markdown-view.js', async (importOriginal) => {
  chunk.calls += 1;
  if (chunk.calls === 1) throw new TypeError('Failed to fetch dynamically imported module');
  return importOriginal();
});

await import('../../src/kit/index.js');

type MarkdownElement = HTMLElement & { value: string | null };
const content = (el: Element) => el.shadowRoot?.querySelector<HTMLElement>('[part~="content"]') ?? null;

describe('af-markdown when its view cannot load', () => {
  it('shows the value as written, not busy, and loads the view on the next connect', async () => {
    const el = document.createElement('af-markdown') as MarkdownElement;
    el.value = '**Due** Friday\nsecond line';
    document.body.append(el);
    await expect.poll(() => content(el)?.classList.contains('plain')).toBe(true);
    expect(content(el)!.hasAttribute('aria-busy')).toBe(false);
    expect(content(el)!.textContent).toBe('**Due** Friday\nsecond line');
    expect(getComputedStyle(content(el)!).whiteSpace).toBe('pre-wrap');

    el.remove();
    await new Promise((r) => setTimeout(r, 0));
    document.body.append(el);
    await expect.poll(() => content(el)?.querySelector('strong')?.textContent, { timeout: 5000 }).toBe('Due');
  });
});
