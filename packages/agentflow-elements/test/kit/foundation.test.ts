import { afterEach, describe, expect, it, vi } from 'vitest';
import { AF_DEFAULT_PALETTE } from '@reflexify/agentflow-sdk';
import { KIT_CSS, KIT_TAGS, KIT_VERSION, defineKitElements } from '../../src/kit/index.js';
import { kitText } from '../../src/kit/text.js';
import pkg from '../../package.json';
import { emit, raise } from '../../src/kit/environment.js';

afterEach(() => vi.restoreAllMocks());

describe('the kit', () => {
  it('registers its twenty-seven tags once', () => {
    expect([...KIT_TAGS]).toEqual(['af-dialog', 'af-confirm', 'af-menu', 'af-popover', 'af-tooltip', 'af-toast', 'af-date', 'af-person-picker', 'af-number-input', 'af-select', 'af-combobox', 'af-rich-editor', 'af-tile', 'af-field', 'af-fieldset', 'af-form', 'af-scroll-area', 'af-tabs', 'af-splitter', 'af-pager', 'af-copy-button', 'af-markdown', 'af-tree-picker', 'af-bulk-bar', 'af-file-upload', 'af-signature-pad', 'af-folder-source']);
    const before = KIT_TAGS.map((t) => customElements.get(t));
    expect(() => defineKitElements()).not.toThrow();
    KIT_TAGS.forEach((t, i) => expect(customElements.get(t), t).toBe(before[i]));
    KIT_TAGS.forEach((t) => expect(customElements.get(t), t).toBeDefined());
  });

  it('registers into a registry it is given', () => {
    const defined: string[] = [];
    const registry = { get: () => undefined, define: (tag: string) => defined.push(tag) } as unknown as CustomElementRegistry;
    defineKitElements(registry);
    expect(defined).toEqual([...KIT_TAGS]);
  });

  it('stamps the package version on every element class', () => {
    expect(KIT_VERSION).toBe(pkg.version);
    for (const tag of KIT_TAGS) expect((customElements.get(tag) as unknown as { kitVersion: string }).kitVersion, tag).toBe(KIT_VERSION);
  });

  it('warns once for each tag an older kit registered first, and stays quiet for its own or a newer one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const older = Object.assign(class extends HTMLElement {}, { kitVersion: '0.0.9' });
    const unversioned = class extends HTMLElement {};
    const newer = Object.assign(class extends HTMLElement {}, { kitVersion: '99.0.0' });
    const theirs: Record<string, CustomElementConstructor> = { 'af-menu': older, 'af-date': unversioned, 'af-dialog': newer };
    const registry = { get: (tag: string) => theirs[tag] ?? customElements.get(tag), define: () => {} } as unknown as CustomElementRegistry;
    defineKitElements(registry);
    expect(warn.mock.calls.map((c) => (c[1] as { tag: string }).tag)).toEqual(['af-menu', 'af-date']);
    expect(warn.mock.calls[0]![1]).toEqual({ tag: 'af-menu', registered: '0.0.9', loaded: KIT_VERSION });
  });

  it('registers each tag on its own, skipping one another module defined first', () => {
    const defined: string[] = [];
    const theirs = class extends HTMLElement {};
    const registry = { get: (tag: string) => (tag === 'af-menu' ? theirs : undefined), define: (tag: string) => defined.push(tag) } as unknown as CustomElementRegistry;
    defineKitElements(registry);
    expect(defined).toEqual(KIT_TAGS.filter((t) => t !== 'af-menu'));
  });

  it('styles through tokens with fallbacks and never on :host or the page', () => {
    for (const cls of ['.af-button', '.af-button.primary', '.af-button.secondary', '.af-button.danger', '.af-button.ghost', '.af-button.link', '.af-button.xs', '.af-button.lg', '.af-input', '.af-textarea', '.af-checkbox', '.af-radio', '.af-switch', '.af-label', '.af-toggle', '.af-segmented', '.af-chip', '.af-chip.secondary', '.af-chip.danger', '.af-chip.outline', '.af-chip.neutral', '.af-chip.success', '.af-chip.warning', '.af-chip.info', '.af-banner', '.af-banner.danger', '.af-banner.info', '.af-banner.success', '.af-banner.warning', '.af-banner-title', '.af-banner-description', '.af-avatar', '.af-avatar-initials', '.af-progress', '.af-progress.circular', '.af-tabs', '.af-tabs.line', '.af-tabs.segmented', '.af-skeleton', '.af-skeleton.row', '.af-skeleton.card', '.af-skeleton.column', '.af-skeleton.block', '.af-spinner', '.af-empty', '.af-empty.boxed', '.af-empty-title', '.af-empty-body', '.af-error', '.af-error-icon', '.af-error-title', '.af-error-body', '.af-error-actions', '.af-error-details', '.af-repeater', '.af-repeater-row', '.af-repeater-head', '.af-repeater-remove', '.af-repeater-fields', '.af-repeater-empty', '.af-drag-handle', '.af-repeater-row.line', '.af-field[edited]', '.af-file-chip', '.af-file-chip-name', '.af-file-chip-download', '.af-table', '.af-table.compact', '.af-table.sticky', '.af-table-sort', '.af-table-group', '.af-table-group-header', '.af-table-group-row', '.af-table-group-toggle', '.af-table-group-count', '.af-table-group-actions', '.af-table-more', '.af-table-loading', '.af-table-empty', '.af-breadcrumb', '.af-breadcrumb.eyebrow', '.af-disclosure', '.af-disclosure.eyebrow', '.af-disclosure-toggle', '.af-disclosure-body', '.af-dl', '.af-dl-item', '.af-stat', '.af-stat.plain', '.af-stat-label', '.af-stat-dot', '.af-stat-value', '.af-stat-note', '.af-timeline', '.af-timeline.icons', '.af-timeline-item', '.af-timeline-dot', '.af-timeline-body', '.af-timeline-text', '.af-timeline-time', '.af-steps', '.af-step', '.af-step-marker', '.af-step-label', '.af-toolbar', '.af-toolbar-lead', '.af-toolbar-divider', '.af-toolbar-trail', '.af-card', '.af-card.compact', '.af-card-grid', '.af-card-link', '.af-card-check', '.af-card-media', '.af-card-title', '.af-card-rows', '.af-card-row', '.af-board', '.af-board-column', '.af-board-column.dashed', '.af-board-column.compact', '.af-board-column-header', '.af-board-column-title', '.af-board-dot', '.af-board-count', '.af-board-cards', '.af-board-empty', '.af-list', '.af-list-row', '.af-list-row.compact', '.af-cal', '.af-cal-header', '.af-cal-period', '.af-cal-weekdays', '.af-cal-grid', '.af-cal-day', '.af-cal-day.outside', '.af-cal-day-button', '.af-cal-date', '.af-cal-date.today', '.af-cal-events', '.af-cal-more', '.af-cal-week', '.af-cal-allday-label', '.af-cal-hours', '.af-cal-hour-label', '.af-cal-hour', '.af-event', '.af-event.continues', '.af-event.continued', '.af-event.block', '.af-event-time', '.af-filter-bar', '.af-filter-row', '.af-filter-chip', '.af-filter-chip.preset', '.af-filter-chip.aside', '.af-filter-chip-edit', '.af-filter-chip-field', '.af-filter-chip-remove', '.af-filter-clear', '.af-search', '.af-search.xs', '.af-search-clear', '.af-facet-bar', '.af-facet', '.af-facet-header', '.af-facet-note', '.af-facet-list', '.af-facet-option', '.af-facet-dot', '.af-facet-count', '.af-facet-stats', '.af-facet-more', '.af-chip.toggle', '.af-chip.toggle.compact']) {
      expect(KIT_CSS, cls).toContain(cls);
    }
    expect(KIT_CSS).not.toMatch(/(^|[\s,}]):root\b|(^|[\s,}])html\b|(^|[\s,}])body\b/);
    expect(KIT_CSS).not.toMatch(/:host\s*\{[^}]*--/);
    for (const use of KIT_CSS.matchAll(/var\((--af-[a-z-]+)\s*([,)])/g)) expect(use[2], use[1]).toBe(',');
    expect(KIT_CSS).toContain('[aria-disabled="true"]');
    // A page that is itself the .af-kit container keeps its own popovers' box: the reset reaches shadow roots only.
    const popoverRules = [...KIT_CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]*\[popover\][^{}]*)\{/g)].map((m) => m[1]!.trim());
    expect(popoverRules.length).toBeGreaterThan(0);
    for (const prelude of popoverRules) expect(prelude).toMatch(/^:host\b/);
  });

  it('draws the state classes with their states', () => {
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    document.body.innerHTML = '<div class="af-kit"><div class="af-empty boxed"></div><button class="af-drag-handle"></button><span class="af-file-chip"><button class="af-file-chip-name"></button></span></div>';
    expect(getComputedStyle(document.querySelector('.af-empty.boxed')!).borderTopStyle).toBe('dashed');
    expect(getComputedStyle(document.querySelector('.af-drag-handle')!).cursor).toBe('grab');
    expect(getComputedStyle(document.querySelector('.af-file-chip-name')!).textOverflow).toBe('ellipsis');
    style.remove();
    document.body.replaceChildren();
  });

  it('draws a line repeater row only where it is marked, and every other row as it always was', () => {
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    document.body.innerHTML = '<div class="af-kit">' +
      '<div class="af-repeater">' +
      '<div class="af-repeater-row line" id="line"><button class="af-drag-handle" id="line-handle"></button><div id="line-fields"></div><div id="line-more"></div><button class="af-button ghost icon sm" id="line-remove"></button></div>' +
      '<div class="af-repeater-row" id="headed"><div class="af-repeater-head"><button class="af-drag-handle" id="headed-handle"></button></div></div>' +
      '<div class="af-repeater-row" id="headless"><div class="af-repeater-fields" id="headless-fields"></div></div>' +
      '<div class="af-repeater-row" id="loose"><button class="af-drag-handle" id="loose-handle"></button><div></div><button class="af-button ghost icon sm" id="loose-remove"></button></div>' +
      '</div>' +
      '<button class="af-drag-handle" id="pressed" aria-pressed="true"></button><button class="af-drag-handle" id="idle" aria-pressed="false"></button>' +
      '</div>';
    const css = (id: string) => getComputedStyle(document.getElementById(id)!);
    expect(css('line').display).toBe('grid');
    expect(css('line').paddingTop).toBe('8px');
    expect(css('line-handle').width).toBe('24px');
    expect(css('line-handle').height).toBe('24px');
    expect(css('line-handle').cursor).toBe('grab');
    expect(css('line-handle').gridColumn, 'the handle is the first track').toBe('1');
    expect(css('line-fields').gridColumn, 'the fields are the middle track').toBe('2');
    expect(css('line-more').gridColumn, 'a second child is in the middle track too').toBe('2');
    expect(css('line-remove').gridColumn, 'the remove button is the last track').toBe('3');
    expect(css('line-handle').marginInlineEnd, 'the 8 px after the handle is the handle\'s own margin').toBe('8px');
    expect(css('line-remove').marginInlineStart, 'and the 8 px before the remove button is its own').toBe('8px');
    for (const id of ['line-fields', 'line-more']) {
      expect(css(id).marginInlineStart || '0', `${id} has no margin of its own, so the middle children start together`).toMatch(/^0(px)?$/);
    }
    for (const id of ['headed', 'headless', 'loose']) {
      expect(css(id).display, `${id} has no line class and is drawn as before`).toBe('flex');
      expect(css(id).paddingTop, id).toBe('12px');
    }
    expect(css('headless-fields').display, 'a head-less row keeps its fields grid').toBe('grid');
    for (const id of ['headed-handle', 'loose-handle']) expect(css(id).width, `${id} keeps its own size`).not.toBe('24px');
    expect(css('loose-remove').gridColumn, 'a button in an unmarked row is not placed').not.toBe('3');
    expect(css('pressed').cursor).toBe('grabbing');
    expect(css('idle').cursor, 'only a pressed handle is held').toBe('grab');
    style.remove();
    document.body.replaceChildren();
  });

  it('a collapsed group shows only its header', () => {
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    document.body.innerHTML = `<div class="af-kit"><table class="af-table"><tbody class="af-table-group" data-collapsed>
      <tr class="af-table-group-header"><th scope="rowgroup" colspan="2"><div class="af-table-group-row"><button type="button" class="af-table-group-toggle" aria-expanded="false">Open</button></div></th></tr>
      <tr id="row"><td>Name</td><td>1.240</td></tr>
      <tr class="af-table-more"><td colspan="2">More</td></tr>
    </tbody><tbody class="af-table-group"><tr id="open-row"><td>Name</td><td>2</td></tr></tbody></table></div>`;
    const display = (selector: string) => getComputedStyle(document.querySelector(selector)!).display;
    expect(display('#row')).toBe('none');
    expect(display('.af-table-more')).toBe('none');
    expect(display('.af-table-group-header')).not.toBe('none');
    expect(display('#open-row')).not.toBe('none');
    style.remove();
    document.body.replaceChildren();
  });

  it('a closed disclosure hides its body', () => {
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    document.body.innerHTML = `<div class="af-kit"><div class="af-disclosure">
      <button type="button" class="af-disclosure-toggle" aria-expanded="false" aria-controls="shut"><span>Details</span></button><div id="shut" class="af-disclosure-body">Hidden</div>
    </div><div class="af-disclosure">
      <button type="button" class="af-disclosure-toggle" aria-expanded="true" aria-controls="open"><span>Details</span></button><div id="open" class="af-disclosure-body">Shown</div>
    </div></div>`;
    const display = (selector: string) => getComputedStyle(document.querySelector(selector)!).display;
    expect(display('#shut')).toBe('none');
    expect(display('#open')).not.toBe('none');
    style.remove();
    document.body.replaceChildren();
  });

  it("a card's checkbox is hidden until the card is hovered, focused or checked", () => {
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    document.body.innerHTML = `<div class="af-kit"><article class="af-card">
      <a class="af-card-link" href="#one" aria-label="Open one"></a><input type="checkbox" class="af-checkbox af-card-check" aria-label="Select one"><h3 class="af-card-title">One</h3>
    </article><article class="af-card" aria-selected="true">
      <a class="af-card-link" href="#two" aria-label="Open two"></a><input type="checkbox" class="af-checkbox af-card-check" aria-label="Select two" checked><h3 class="af-card-title">Two</h3>
    </article></div>`;
    const [resting, checked] = [...document.querySelectorAll<HTMLElement>('.af-card-check')];
    expect(getComputedStyle(resting!).opacity).toBe('0');
    expect(getComputedStyle(checked!).opacity).toBe('1');
    style.remove();
    document.body.replaceChildren();
  });

  it('a list row chosen by aria-current draws as a selected one', () => {
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    document.body.innerHTML = `<div class="af-kit"><ul class="af-list"><li class="af-list-row">Resting</li>
      <li class="af-list-row" aria-current="true">Current</li><li class="af-list-row" aria-selected="true">Selected</li></ul></div>`;
    const [resting, current, selected] = [...document.querySelectorAll<HTMLElement>('.af-list-row')].map((row) => getComputedStyle(row).backgroundColor);
    expect(current).toBe(selected);
    expect(current).not.toBe(resting);
    // jsdom computes neither ::before nor forced colours, so the rest is read from the text: every rule for a selected
    // row names a current one beside it.
    const css = KIT_CSS.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [...css.matchAll(/([^{}]*)\{/g)].map((m) => m[1]!.trim());
    const forSelected = selectors.filter((sel) => sel.includes('.af-list-row[aria-selected="true"]'));
    expect(forSelected.length).toBeGreaterThan(0);
    for (const sel of forSelected) {
      const parts = sel.split(',').map((p) => p.trim());
      for (const part of parts.filter((p) => p.includes('.af-list-row[aria-selected="true"]'))) {
        expect(parts, sel).toContain(part.replaceAll('.af-list-row[aria-selected="true"]', '.af-list-row[aria-current="true"]'));
      }
    }
    style.remove();
    document.body.replaceChildren();
  });

  it("a search's clear button hides while its input is empty", () => {
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    document.body.innerHTML = `<div class="af-kit"><label class="af-search"><svg aria-hidden="true"></svg><input type="search" class="af-input" placeholder="Search" aria-label="Empty"><button type="button" class="af-search-clear" aria-label="Clear empty"></button></label>
      <label class="af-search"><svg aria-hidden="true"></svg><input type="search" class="af-input" placeholder="Search" aria-label="Typed" value="INV-0042"><button type="button" class="af-search-clear" aria-label="Clear typed"></button></label></div>`;
    const [empty, typed] = [...document.querySelectorAll<HTMLElement>('.af-search-clear')];
    expect(getComputedStyle(empty!).display).toBe('none');
    expect(getComputedStyle(typed!).display).not.toBe('none');
    style.remove();
    document.body.replaceChildren();
  });

  it('draws focus on a tab or a chip as the ring AgentFlow draws, not the old 2px outline', () => {
    const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const selector of ['.af-tabs [role="tab"]:focus-visible', '.af-chip:focus-visible']) {
      const rule = new RegExp(`${escape(selector)}\\s*\\{([^}]*)\\}`).exec(KIT_CSS)?.[1];
      expect(rule, selector).toContain('box-shadow: 0 0 0 3px');
      expect(rule, selector).not.toMatch(/outline:\s*2px solid var\(--k-ring\)/);
    }
    // Forced colours drop the shadow, so there the outline returns, and the chosen tab and the spinner stay visible.
    const forced = KIT_CSS.slice(KIT_CSS.indexOf('@media (forced-colors: active) {\n  .af-chip'));
    for (const piece of ['.af-chip:focus-visible, .af-tabs [role="tab"]:focus-visible { outline: 2px solid', '[aria-selected="true"] { forced-color-adjust: none', '.af-spinner { forced-color-adjust: none; }']) {
      expect(forced, piece).toContain(piece);
    }
  });

  it('keeps a selector naming one engine\'s pseudo-element out of every list', () => {
    // A selector list holding a pseudo-element the engine does not know is dropped whole, so the rest of the list goes
    // with it: `::-webkit-progress-value, ::-moz-progress-bar` styles nothing in either engine.
    const css = KIT_CSS.replace(/\/\*[\s\S]*?\*\//g, '');
    const lists = [...css.matchAll(/([^{}]+)\{/g)].map((m) => m[1]!.trim()).filter((prelude) => !prelude.startsWith('@'));
    const split = (list: string) => {
      const parts: string[] = [];
      let depth = 0;
      let current = '';
      for (const ch of list) {
        if ('(['.includes(ch)) depth++;
        else if (')]'.includes(ch)) depth--;
        if (ch === ',' && depth === 0) {
          parts.push(current.trim());
          current = '';
        } else current += ch;
      }
      return [...parts, current.trim()];
    };
    const vendor = lists.filter((list) => /::?-(webkit|moz|ms)-/.test(list));
    expect(vendor.length, 'the kit styles a native progress bar').toBeGreaterThan(0);
    for (const list of vendor) expect(split(list), list).toHaveLength(1);
  });

  it("falls back from a surface token the palette leaves out to the palette's own colours, and to the default palette last", () => {
    // A token the host does not set takes the palette's surface, border or text colour, so a palette that leaves the
    // surface tokens out keeps its own look; only a host that sets none of them lands on the default palette's literal.
    for (const [inner, token, via] of [['--k-secondary-fg', '--af-secondary-fg', '--af-fg'], ['--k-accent-fg', '--af-accent-fg', '--af-fg'], ['--k-input', '--af-input', '--af-border'], ['--k-popover', '--af-popover', '--af-surface'], ['--k-popover-fg', '--af-popover-fg', '--af-fg']] as const) {
      const values = [...KIT_CSS.matchAll(new RegExp(`${inner}:\\s*var\\(${token},\\s*var\\(${via},\\s*([^)]+\\)?)\\)\\)`, 'g'))].map((m) => m[1]!.trim());
      expect(values, inner).toEqual([AF_DEFAULT_PALETTE.light[token], AF_DEFAULT_PALETTE.dark[token]]);
    }
    // The grounds are the text colour mixed into the surface, by amounts that land on the default palette's values.
    const oklab = (value: string) => {
      const [l, c, h] = /oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/.exec(value)!.slice(1).map(Number) as [number, number, number];
      return [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
    };
    for (const [inner, token] of [['--k-secondary', '--af-secondary'], ['--k-accent', '--af-accent'], ['--k-muted-bg', '--af-muted']] as const) {
      const shares = [...KIT_CSS.matchAll(new RegExp(`${inner}:\\s*var\\(${token},\\s*color-mix\\(in oklab, var\\(--k-fg\\) ([\\d.]+)%, var\\(--k-surface\\)\\)\\)`, 'g'))].map((m) => Number(m[1]) / 100);
      expect(shares, inner).toHaveLength(2);
      (['light', 'dark'] as const).forEach((mode, i) => {
        const fg = oklab(AF_DEFAULT_PALETTE[mode]['--af-fg']);
        const surface = oklab(AF_DEFAULT_PALETTE[mode]['--af-surface']);
        const want = oklab(AF_DEFAULT_PALETTE[mode][token]);
        const got = fg.map((f, k) => f * shares[i]! + surface[k]! * (1 - shares[i]!));
        expect(Math.hypot(...got.map((g, k) => g - want[k]!)), `${inner} ${mode}`).toBeLessThan(0.01);
      });
    }
  });

  it("reads the host's soft ring in both modes", () => {
    const values = [...KIT_CSS.matchAll(/--k-ring:\s*var\(--af-ring,\s*([^)]+\)?)\)/g)].map((m) => m[1]!.trim());
    expect(values).toEqual([AF_DEFAULT_PALETTE.light['--af-ring'], AF_DEFAULT_PALETTE.dark['--af-ring']]);
  });

  it('follows one dark switch that a dark host and a dark light-DOM container both set', () => {
    // Exactly one rule is keyed on a dark host, and it is the shared dark block: dark-only values come from the
    // switch, never from a :host rule that a light-DOM page cannot match.
    const hostRules = [...KIT_CSS.matchAll(/([^{}]*:host\(\[data-theme="dark"\]\)[^{]*)\{([^}]*)\}/g)];
    expect(hostRules).toHaveLength(1);
    expect(hostRules[0]![1]).toContain('.af-kit[data-theme="dark"]');
    expect(hostRules[0]![2]).toMatch(/--k-dark:\s*1/);
    // A plain .af-kit rule never sets it, so an element's inner .af-kit inherits the page's value.
    expect(KIT_CSS).not.toMatch(/(^|\})\s*\.af-kit\s*\{[^}]*--k-dark\s*:/);
    for (const user of ['--k-info:', '.af-avatar[data-hue]', '.af-overlay']) expect(KIT_CSS, user).toContain(user);
    expect(KIT_CSS).toMatch(/var\(--k-dark,\s*0\)/);
  });

  it('speaks Vietnamese for vi and vi-VN, English otherwise, and takes overrides', () => {
    expect(kitText('vi').close).toBe('Đóng');
    expect(kitText('vi-VN').cancel).toBe('Huỷ');
    expect(kitText('en-GB').confirm).toBe('Confirm');
    expect(kitText(null).today).toBe('Today');
    expect(kitText('vi', { today: 'Bữa nay' }).today).toBe('Bữa nay');
  });

  it('emits a bubbling, uncomposed event with plain detail', () => {
    const el = document.createElement('div');
    const seen: Event[] = [];
    document.body.append(el);
    document.body.addEventListener('change', (e) => seen.push(e));
    emit(el, 'change', { value: 1 });
    expect(seen).toHaveLength(1);
    expect((seen[0] as CustomEvent).detail).toEqual({ value: 1 });
    expect(seen[0]!.composed).toBe(false);
  });

  it('raises and lowers a popover, and tolerates none', () => {
    const host = document.createElement('div');
    const el = document.createElement('div');
    el.setAttribute('popover', 'manual');
    host.append(el);
    document.body.append(host);
    raise(el, true, host);
    expect(host.dataset.raised).toBe('true');
    expect(el.dataset.raised).toBeUndefined();
    raise(el, false, host);
    expect(host.dataset.raised).toBe('false');
    expect(() => raise(null, true, host)).not.toThrow();
  });
});
