<svelte:options runes />

<script module lang="ts">
  /**
   * Zag scrolls a highlighted item into view only inside a content that scrolls itself. A list whose scrolling is a
   * scroller's viewport passes this as its `scrollToIndexFn`, so a highlight moved by a key still comes into view.
   * It moves that viewport alone, to the nearest edge and not at all when the item shows: the native scrollIntoView
   * would scroll every scrolling box around it too, the page included.
   */
  export const revealItem = ({ getElement }: { getElement: () => HTMLElement | null }): void => {
    const item = getElement();
    const viewport = item?.closest<HTMLElement>('[data-scope="scroll-area"][data-part="viewport"]');
    if (!item || !viewport) return;
    const axis = viewport.parentElement?.getAttribute('data-orientation');
    const box = viewport.getBoundingClientRect();
    const at = item.getBoundingClientRect();
    // The distance to move so [start, end] shows inside [from, to], the start winning when the item is the larger.
    const by = (start: number, end: number, from: number, to: number) => (start < from ? start - from : end > to ? Math.min(end - to, start - from) : 0);
    if (axis !== 'horizontal') {
      const dy = by(at.top, at.bottom, box.top, box.top + viewport.clientHeight);
      if (dy) viewport.scrollTop += dy;
    }
    if (axis === 'horizontal' || axis === 'both') {
      const dx = by(at.left, at.right, box.left, box.left + viewport.clientWidth);
      if (dx) viewport.scrollLeft += dx;
    }
  };
</script>

<script lang="ts">
  import { EnvironmentProvider, useEnvironmentContext } from '@ark-ui/svelte/environment';
  import { ScrollArea } from '@ark-ui/svelte/scroll-area';
  import type { Snippet } from 'svelte';
  import { scrollStop } from './scroll-stop.js';

  // `contentPart` names the content box as a part. Only af-scroll-area names it: an element that holds a scroller often
  // has a `content` part of its own, which `::part(content)` would then style twice.
  // `tabStop={false}` is for a list inside a composite (a menu, a listbox): the composite is the one stop, its arrow keys
  // scroll the highlight, and Tab closes it. The viewport is then never focusable by Tab, Chromium's own rule that makes a
  // scroller with nothing focusable inside a stop included.
  // `heading` names a viewport that has no `label` from a heading in the same element (the heading and its text), while
  // it is a tab stop: a stop must have a name, and a region that is no stop needs none.
  let { axis = 'vertical', label = null, heading = null, viewport = $bindable(null), contentPart = false, tabStop = true, children }: {
    axis?: 'vertical' | 'horizontal' | 'both'; label?: string | null; heading?: { element: HTMLElement | null; text: string } | null; viewport?: HTMLElement | null; contentPart?: boolean;
    tabStop?: boolean; children?: Snippet;
  } = $props();

  // Zag looks its parts up by id in the root node it is given. The scroller finds its own, so it works in an element that
  // provides none; until it is mounted it asks whoever is around it.
  const around = useEnvironmentContext();
  let root = $state<HTMLElement | null>(null);
  const rootNode = () => (root?.getRootNode() as ShadowRoot | Document | undefined) ?? around().getRootNode();

  const OVERFLOW = { vertical: 'overflow-x: hidden; overflow-y: auto', horizontal: 'overflow-x: auto; overflow-y: hidden', both: 'overflow: auto' };
  // Zag sizes the content to fit what it holds, so it can grow past the viewport sideways. Scrolling only up and down,
  // it stays as wide as the viewport instead, and a wide table inside scrolls in a scroller of its own.
  const CONTENT = { vertical: 'min-width: 0', horizontal: undefined, both: undefined };
  // Zag's scroll area needs both observers. Without them, as in jsdom where a module's own tests run, the scroller is the
  // same boxes without Zag: it scrolls and is a tab stop, and draws no scrollbar.
  const drawn = typeof IntersectionObserver !== 'undefined' && typeof ResizeObserver !== 'undefined';
  const vertical = $derived(axis !== 'horizontal');
  const horizontal = $derived(axis === 'horizontal' || axis === 'both');

  // Zag makes the viewport a tab stop only when both axes overflow and rewrites the attribute as that changes. The kit's
  // rule is either axis with nothing tabbable inside, so Zag's value is overridden with a constant, which Svelte writes
  // once, and the stop is scrollStop's alone.
  const tabindex = $derived(tabStop ? null : -1);
  let stop = $state(false);
  $effect(() => (viewport && tabStop ? scrollStop(viewport, (now) => (stop = now)) : undefined));
  // An id reaches only its own tree, so the heading is linked by element reflection, or by its text where that is missing.
  // An empty heading names nothing, and a region with no name is no landmark worth announcing, so it makes none.
  const headingText = $derived(heading?.text.trim() ?? '');
  const named = $derived(!label && stop && headingText !== '');
  const reflects = $derived(!!viewport && 'ariaLabelledByElements' in viewport);
  const linked = $derived(named && reflects && !!heading?.element);
  const role = $derived(label || named ? 'region' : null);
  const ariaLabel = $derived(label || (named && !linked ? headingText : null));
  $effect(() => {
    if (viewport && reflects) (viewport as HTMLElement & { ariaLabelledByElements: Element[] | null }).ariaLabelledByElements = linked ? [heading!.element!] : null;
  });

  // A native scrollbar never takes focus: a press on the drawn one leaves it where it was, in a combobox's input say.
  const keepFocus = (e: MouseEvent) => e.preventDefault();
  // The markup below has no whitespace between its boxes: a scroller can sit inside a <pre>, where a space would draw.
</script>

{#if drawn}
  <EnvironmentProvider value={rootNode}>
    <ScrollArea.Root bind:ref={root} data-orientation={axis}><ScrollArea.Viewport bind:ref={viewport} part="viewport" style={OVERFLOW[axis]} {tabindex}
        {role} aria-label={ariaLabel}><ScrollArea.Content part={contentPart ? 'content' : null} style={CONTENT[axis]}>{@render children?.()}</ScrollArea.Content></ScrollArea.Viewport
      >{#if vertical}<ScrollArea.Scrollbar orientation="vertical" part="scrollbar" onmousedown={keepFocus}><ScrollArea.Thumb part="thumb" /></ScrollArea.Scrollbar>{/if
      }{#if horizontal}<ScrollArea.Scrollbar orientation="horizontal" part="scrollbar" onmousedown={keepFocus}><ScrollArea.Thumb part="thumb" /></ScrollArea.Scrollbar>{/if
      }{#if axis === 'both'}<ScrollArea.Corner part="corner" />{/if}</ScrollArea.Root>
  </EnvironmentProvider>
{:else}
  <div data-scope="scroll-area" data-part="root" data-orientation={axis} style="position: relative"><!-- svelte-ignore a11y_no_noninteractive_tabindex (it is only ever -1 here) --><div bind:this={viewport} data-scope="scroll-area" data-part="viewport"
      part="viewport" style={OVERFLOW[axis]} {tabindex} {role} aria-label={ariaLabel}><div data-scope="scroll-area" data-part="content"
        part={contentPart ? 'content' : null} style={CONTENT[axis]}>{@render children?.()}</div></div></div>
{/if}

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The scroller fills what holds it: a box with a height, or a flex column that shrinks it (min-height: 0). It takes a
    max-height its holder has, so a holder with only a max-height still bounds it.
  - The viewport keeps the browser's own scrolling and hides the native scrollbars; Ark's are drawn over it, as
    AgentFlow's ScrollArea draws Radix's: a 10px gutter with 1px of padding and a transparent border on its inner edge,
    and a fully rounded thumb in the border colour, with no track. The viewport is its own stacking context, so a z-index
    inside the content (a sticky header's, say) stays inside it and the scrollbars, which come after it, always paint above.
  - The scrollbars show while the pointer is over the area or it scrolls, and fade 150 ms after both end. Reduced motion
    and forced colours keep them shown. A scrollbar whose axis does not overflow is not drawn.
  - The viewport's focus indicator is the kit's 3px ring, as AgentFlow's ScrollArea viewport draws it, and a 1px outline
    in the text colour, which AgentFlow does not draw: the ring alone is too faint over a borderless box to show where
    focus is. Forced colours draw a 2px outline instead. The tile draws its own, as it always has.
  - Zag writes four custom properties on the viewport on every scroll event. The content sets them back to nothing, so
    they stop there and a scroll does not restyle everything inside (a board of 2,400 cards scrolled about 5 ms a frame
    slower in WebKit without this).
-->
<style>
  :global([data-scope='scroll-area'][data-part='root']) { display: flex; flex: 1 1 auto; flex-direction: column; box-sizing: border-box; height: 100%; min-width: 0;
    min-height: 0; max-height: inherit; border-radius: inherit; }
  :global([data-scope='scroll-area'][data-part='viewport']) { flex: 1 1 auto; box-sizing: border-box; min-height: 0; border-radius: inherit; outline: none;
    isolation: isolate; scrollbar-width: none; transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  :global([data-scope='scroll-area'][data-part='viewport']::-webkit-scrollbar) { display: none; }
  :global([data-scope='scroll-area'][data-part='content']) { --scroll-area-overflow-x-start: initial; --scroll-area-overflow-x-end: initial;
    --scroll-area-overflow-y-start: initial; --scroll-area-overflow-y-end: initial; }
  :global([data-scope='scroll-area'][data-part='viewport']:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); outline: 1px solid currentColor; }
  :global([data-scope='scroll-area'][data-part='scrollbar']) { z-index: 1; display: flex; box-sizing: border-box; padding: 1px; border: 0 solid transparent;
    visibility: hidden; opacity: 0; transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 150ms; }
  :global([data-scope='scroll-area'][data-part='scrollbar'][data-orientation='vertical']) { width: 10px; border-inline-start-width: 1px; }
  :global([data-scope='scroll-area'][data-part='scrollbar'][data-orientation='horizontal']) { flex-direction: column; height: 10px; border-top-width: 1px; }
  :global([data-scope='scroll-area'][data-part='scrollbar']:is([data-hover], [data-scrolling], [data-dragging])) { visibility: visible; opacity: 1;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s; }
  :global([data-scope='scroll-area'][data-part='scrollbar'][data-orientation='vertical']:not([data-overflow-y])),
  :global([data-scope='scroll-area'][data-part='scrollbar'][data-orientation='horizontal']:not([data-overflow-x])) { display: none; }
  :global([data-scope='scroll-area'][data-part='thumb']) { position: relative; flex: 1; border-radius: calc(infinity * 1px); background-color: var(--k-line); }
  @media (prefers-reduced-motion: reduce) {
    :global([data-scope='scroll-area'][data-part='scrollbar']) { visibility: visible; opacity: 1; transition: none; }
    :global([data-scope='scroll-area'][data-part='viewport']) { transition: none; }
  }
  @media (forced-colors: active) {
    :global([data-scope='scroll-area'][data-part='scrollbar']) { visibility: visible; opacity: 1; transition: none; }
    :global([data-scope='scroll-area'][data-part='thumb']) { background-color: CanvasText; }
    :global([data-scope='scroll-area'][data-part='viewport']:focus-visible) { outline: 2px solid; outline-offset: -2px; }
  }
</style>
