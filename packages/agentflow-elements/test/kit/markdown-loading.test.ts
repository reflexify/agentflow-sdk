import { describe, expect, it, vi } from 'vitest';

// The view's chunk is held until the test lets it land, so the state before it is seen whatever ran first.
const gate = vi.hoisted(() => {
  let open!: () => void;
  const landed = new Promise<void>((resolve) => (open = resolve));
  return { landed, open };
});
vi.mock('../../src/kit/prose/markdown-view.js', async (importOriginal) => {
  await gate.landed;
  return importOriginal();
});

await import('../../src/kit/index.js');

type MarkdownElement = HTMLElement & { value: string | null };
const content = (el: Element) => el.shadowRoot?.querySelector<HTMLElement>('[part~="content"]') ?? null;

describe('af-markdown before its view lands', () => {
  it('shows nothing, busy, and then the value set last', async () => {
    const el = document.createElement('af-markdown') as MarkdownElement;
    el.value = '**first**';
    document.body.append(el);
    await expect.poll(() => content(el)?.getAttribute('aria-busy')).toBe('true');
    expect(content(el)!.textContent).toBe('');

    el.value = '**latest**';
    gate.open();
    await expect.poll(() => content(el)?.getAttribute('aria-busy') ?? 'loaded', { timeout: 5000 }).toBe('loaded');
    expect(content(el)!.querySelector('strong')?.textContent).toBe('latest');
    expect(content(el)!.textContent).not.toContain('first');
  });
});
