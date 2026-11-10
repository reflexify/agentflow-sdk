<svelte:options customElement={{ shadow: 'open', props: { open: { attribute: 'open', type: 'Boolean' }, placement: { attribute: 'placement', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Popover } from '@ark-ui/svelte/popover';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { isClaimed } from './escape.js';
  import type { KitStrings } from './index.js';

  type Placement = NonNullable<NonNullable<Popover.RootProps['positioning']>['placement']>;

  let { open = false, placement = 'bottom-start' }: { open?: boolean | null; placement?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  let positioner = $state<HTMLElement | null>(null);
  let reason: 'escape' | 'outside' = 'outside';
  $effect(() => raise(positioner, !!open, self));

  const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Where focus goes as the popover closes: the first control in what the anchor slot holds, itself or inside it (a
  // button wrapped in an af-tooltip). Zag asks only once the page has set `open` back, by which time it no longer knows
  // whether an outside press landed on a control, so focus is moved only while it is still inside the popover or has
  // fallen to the page. Inside is read in the popover's own tree, since in a module's shadow root the document's active
  // element is the module's host.
  // A press outside settles where focus goes itself: on the control it landed on, or on the page for plain text. Only an
  // Escape or the page's own close sends focus back to the anchor.
  let pressedOutside = false;
  $effect(() => {
    if (open) pressedOutside = false;
  });

  const anchorSlot = () => self.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="anchor"]');

  // A press on what the anchor slot holds is not a press outside: zag excludes only a trigger, and an anchor is not
  // one, so without this a press held longer than a frame would close the popover and the anchor's own click reopen it.
  // The press's target is read from zag's detail, taken at the press: the pointer event's own path is empty by the time
  // zag asks, a frame later. The walk climbs out of shadow roots, so a press inside an af-tooltip wrapping the anchor counts.
  function onAnchor(target: Node | null): boolean {
    const assigned = anchorSlot()?.assignedElements() ?? [];
    for (let node: Node | null = target; node; node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)) {
      if (assigned.includes(node as Element)) return true;
    }
    return false;
  }

  function anchorTarget(): HTMLElement | null {
    if (pressedOutside) return null;
    const doc = self.ownerDocument;
    const fallen = !doc.activeElement || doc.activeElement === doc.body;
    const active = (self.getRootNode() as Document | ShadowRoot).activeElement;
    if (!fallen && !(active && self.contains(active))) return null;
    for (const el of anchorSlot()?.assignedElements() ?? []) {
      if (el.matches(FOCUSABLE)) return el as HTMLElement;
      const inner = el.querySelector<HTMLElement>(FOCUSABLE);
      if (inner) return inner;
    }
    return null;
  }

  // A tooltip shown inside the popover is the layer above it, so an Escape pressed on its anchor closes the tooltip alone
  // and the popover stays. An Escape pressed elsewhere is not the tooltip's (it closes only on its own anchor), so it
  // closes the popover, or a tooltip shown by hover would keep every Escape.
  const fromShownTooltip = (event: Event) =>
    event.composedPath().some((node) => node instanceof HTMLElement && node.localName === 'af-tooltip' && node.dataset.raised === 'true' && self.contains(node));
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit">
    <Popover.Root
      open={!!open}
      closeOnEscape
      portalled={false}
      positioning={{ strategy: 'fixed', placement: (placement || 'bottom-start') as Placement }}
      finalFocusEl={anchorTarget}
      onEscapeKeyDown={(event) => {
        if (fromShownTooltip(event)) event.preventDefault();
        else if (isClaimed(event) && event.defaultPrevented) emit(self, 'close', { reason: 'escape' });
        else reason = 'escape';
      }}
      onInteractOutside={(event) => {
        const target: EventTarget | null = event.detail.target ?? null;
        if (onAnchor(target instanceof Node ? target : null)) {
          event.preventDefault();
          return;
        }
        reason = 'outside';
        pressedOutside = true;
      }}
      onOpenChange={(d) => {
        if (d.open) return;
        emit(self, 'close', { reason });
        reason = 'outside';
      }}
    >
      <Popover.Anchor part="anchor"><slot name="anchor" /></Popover.Anchor>
      <Popover.Positioner bind:ref={positioner} popover="manual">
        <Popover.Content class="af-overlay popover" part="content"><slot name="content" /></Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  </div>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - AgentFlow's PopoverContent: 288px wide and 16px in, with no ring of its own on focus. The 288px is a least width
    here, so wider content grows the popover up to 28rem (less a 16px margin each side on a narrow screen) rather than
    spilling past its border. An app that wants another width sets it on ::part(content).
-->
<style>
  :global([data-scope='popover'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='popover'][data-part='anchor']) { display: inline-block; }
  :global([data-scope='popover'][data-part='content']) { min-width: 18rem; max-width: min(28rem, calc(100vw - 32px)); padding: 16px; outline: none; }
  @media (forced-colors: active) { :global([data-scope='popover'][data-part='content']:focus-visible) { outline: 2px solid; outline-offset: 2px; } }
</style>
