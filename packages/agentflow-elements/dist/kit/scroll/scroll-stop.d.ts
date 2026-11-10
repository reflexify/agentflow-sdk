/**
 * Makes a scrolling region a tab stop while its content overflows, either way, and holds nothing a keyboard can reach by
 * Tab, and not otherwise. That is the browsers' own rule for a scroller, which Safari does not apply by itself: a region of
 * plain text needs the stop, or a keyboard could not scroll it, while one holding a field or a link is scrolled by tabbing
 * through what it holds, and a stop of its own would be one more, unnamed, before them.
 *
 * What it holds is read through slots and open shadow roots, so a page's slotted form or a kit element inside counts. It is
 * read again when the region or its first child resizes, when what is inside it changes (a node added or removed, or an
 * attribute that makes a node reachable by Tab or not), and when a slot inside it is given other nodes. Layout is read at
 * attach and in those callbacks, never while rendering. `onChange` hears whether the region is a stop, each time that is
 * decided.
 */
export declare function scrollStop(node: HTMLElement, onChange?: (stop: boolean) => void): () => void;
/** Whether anything under `root`, through slots and open shadow roots, is reached by Tab. */
export declare function holdsTabbable(root: ParentNode): boolean;
//# sourceMappingURL=scroll-stop.d.ts.map