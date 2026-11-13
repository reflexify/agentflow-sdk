import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// A tag a server drew is undefined until the kit loads. kit.css gives it the box it will have, so the page does not jump when it
// does. The tags are measured in a frame with no script, whose registry is its own and empty, and again in the gallery's page,
// where the kit has defined them.
interface Case {
  /** What a failure calls it. */
  name: string;
  tag: string;
  attributes?: string;
  content?: string;
  /** Properties the page sets once the tag is defined, as a server cannot write them: a tab list is as tall as its tabs. */
  props?: Record<string, unknown>;
  /** The height it has once defined, where the kit fixes one: AgentFlow's Input is 36px, its small size 32px, a copy button 24px. */
  height?: number;
}

const plain = (tag: string, height?: number, more: Partial<Case> = {}): Case => ({ name: tag, tag, height, ...more });
const variant = (tag: string, attributes: string, height: number, more: Partial<Case> = {}): Case => ({ name: `${tag} ${attributes}`, tag, attributes, height, ...more });
const TABS = { items: [{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity' }] };

// Every tag with nothing set, and each attribute that changes how tall a fixed-height tag is once defined, or that could.
const CASES: Case[] = [
  plain('af-dialog'),
  plain('af-confirm'),
  plain('af-menu', 36, { attributes: 'label="Menu"', content: '<span>Open</span>' }),
  plain('af-popover', undefined, { content: '<button slot="anchor">Open</button>' }),
  plain('af-tooltip', undefined, { attributes: 'text="Copy link"', content: '<button>Share</button>' }),
  plain('af-toast'),
  plain('af-date', 36),
  plain('af-person-picker', 36),
  plain('af-number-input', 36),
  plain('af-select', 36),
  plain('af-combobox', 36),
  plain('af-rich-editor'),
  plain('af-tile'),
  plain('af-field'),
  plain('af-fieldset'),
  plain('af-form'),
  plain('af-scroll-area'),
  plain('af-tabs', 36, { props: TABS }),
  plain('af-splitter'),
  plain('af-pager'),
  plain('af-copy-button', 24),
  plain('af-markdown'),
  plain('af-tree-picker', 36),
  plain('af-bulk-bar'),
  plain('af-file-upload'),
  plain('af-signature-pad'),
  plain('af-folder-source'),
  variant('af-select', 'size="sm"', 32),
  variant('af-select', 'multiple', 36),
  variant('af-tabs', 'variant="line"', 36, { props: TABS }),
  variant('af-tabs', 'variant="segmented"', 32, { props: TABS }),
  variant('af-date', 'range', 36),
  variant('af-combobox', 'multiple', 36),
  variant('af-person-picker', 'multiple', 36),
  variant('af-tree-picker', 'multiple', 36),
  variant('af-number-input', 'steppers', 36),
];

test('a kit tag that is not defined yet is as tall as it will be, and never taller', async ({ page }) => {
  await page.goto('/gallery/');
  const css = readFileSync(new URL('../src/kit/kit.css', import.meta.url), 'utf8');
  const { before, after } = await page.evaluate(
    async ({ css, cases }) => {
      const html = (c: (typeof cases)[number], i: number) => `<div data-case="${i}"><${c.tag} ${c.attributes ?? ''}>${c.content ?? ''}</${c.tag}></div>`;
      const frame = document.createElement('iframe');
      frame.style.cssText = 'position:absolute;left:0;top:0;width:700px;height:900px;border:0';
      frame.srcdoc = `<!doctype html><style>${css}</style><body class="af-kit" style="margin:0;width:700px">${cases.map(html).join('')}</body>`;
      await new Promise((done) => {
        frame.onload = done;
        document.body.append(frame);
      });
      const defined = document.createElement('div');
      defined.className = 'af-kit';
      defined.style.cssText = 'position:absolute;left:0;top:1000px;width:700px';
      defined.innerHTML = cases.map(html).join('');
      document.body.append(defined);
      const tags = [...new Set(cases.map((c) => c.tag))];
      await Promise.all(tags.map((tag) => customElements.whenDefined(tag)));
      await new Promise((frameDone) => requestAnimationFrame(() => setTimeout(frameDone, 500)));
      cases.forEach((c, i) => Object.assign(defined.querySelector(`[data-case="${i}"] > ${c.tag}`)!, c.props));
      await new Promise((frameDone) => requestAnimationFrame(() => setTimeout(frameDone, 300)));
      const read = (root: ParentNode) => cases.map((c, i) => root.querySelector(`[data-case="${i}"] > ${c.tag}`)!.getBoundingClientRect().height);
      const stray = tags.filter((tag) => frame.contentWindow!.customElements.get(tag));
      if (stray.length) throw new Error(`the frame defined ${stray.join(', ')}`);
      return { before: read(frame.contentDocument!), after: read(defined) };
    },
    { css, cases: CASES },
  );
  // Soft, so one run reports every variant that is off.
  CASES.forEach((c, i) => {
    if (c.height !== undefined) {
      expect.soft(after[i], `${c.name} is ${c.height}px once defined`).toBeCloseTo(c.height, 0);
      expect.soft(before[i], `${c.name} reserves ${before[i]}px before it is defined; ${c.height}px once it is`).toBeCloseTo(c.height, 0);
    }
    expect.soft(before[i], `${c.name} reserves ${before[i]}px and is ${after[i]}px once defined`).toBeLessThanOrEqual(after[i]! + 0.5);
  });
});

// A tag that draws no box leaves a flex parent's gap alone: it is display: contents before it is defined (kit.css) and after
// (its own host rule). Left as an inline host once defined, it would be an item of its own and open a second gap.
test('a kit tag that draws no box is display: contents before and after it is defined, and takes no gap in a flex row', async ({ page }) => {
  await page.goto('/gallery/');
  const css = readFileSync(new URL('../src/kit/kit.css', import.meta.url), 'utf8');
  const tags = ['af-dialog', 'af-confirm', 'af-toast', 'af-bulk-bar'];
  const { before, after } = await page.evaluate(
    async ({ css, tags }) => {
      const html = `<div class="row" style="display:flex;gap:20px;align-items:flex-start;width:700px"><span class="a">A</span>${tags.map((tag) => `<${tag}></${tag}>`).join('')}<span class="b">B</span></div>`;
      const frame = document.createElement('iframe');
      frame.style.cssText = 'position:absolute;left:0;top:0;width:700px;height:300px;border:0';
      frame.srcdoc = `<!doctype html><style>${css}</style><body class="af-kit" style="margin:0">${html}</body>`;
      await new Promise((done) => {
        frame.onload = done;
        document.body.append(frame);
      });
      const defined = document.createElement('div');
      defined.className = 'af-kit';
      defined.style.cssText = 'position:absolute;left:0;top:400px;width:700px';
      defined.innerHTML = html;
      document.body.append(defined);
      await Promise.all(tags.map((tag) => customElements.whenDefined(tag)));
      await new Promise((frameDone) => requestAnimationFrame(() => setTimeout(frameDone, 500)));
      const stray = tags.filter((tag) => frame.contentWindow!.customElements.get(tag));
      if (stray.length) throw new Error(`the frame defined ${stray.join(', ')}`);
      const read = (root: ParentNode, view: Window) => ({
        gap: root.querySelector('.b')!.getBoundingClientRect().left - root.querySelector('.a')!.getBoundingClientRect().right,
        display: tags.map((tag) => view.getComputedStyle(root.querySelector(tag)!).display),
      });
      return { before: read(frame.contentDocument!, frame.contentWindow!), after: read(defined, window) };
    },
    { css, tags },
  );
  expect(before.display, 'each tag before it is defined').toEqual(tags.map(() => 'contents'));
  expect(after.display, 'each tag once defined').toEqual(tags.map(() => 'contents'));
  expect(before.gap, 'the gap between the siblings before').toBeCloseTo(20, 0);
  expect(after.gap, 'the gap between the siblings once defined').toBeCloseTo(20, 0);
});
