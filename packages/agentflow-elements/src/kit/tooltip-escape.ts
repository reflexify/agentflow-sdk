// Kept out of environment.ts, which the elements bundle loads: that bundle may name no kit tag but the folder source.
/**
 * Whether an Escape was pressed inside a shown `af-tooltip` that `host` holds. That tooltip is the layer above the
 * host's overlay, so it takes the Escape alone and the overlay stays. An Escape pressed elsewhere is not the tooltip's
 * (it closes only on its own anchor), so it closes the overlay, or a tooltip shown by hover would keep every Escape.
 */
export function fromShownTooltip(host: HTMLElement, event: Event): boolean {
  return event.composedPath().some((node) => node instanceof HTMLElement && node.localName === 'af-tooltip' && node.dataset.raised === 'true' && host.contains(node));
}
