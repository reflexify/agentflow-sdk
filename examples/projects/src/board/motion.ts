/** The board's motion that JavaScript drives, on the stylesheet's timings: `--dur-4` for a drop, `--ease-move`. */
export const DROP_MS = 300;
export const SORT_MS = 200;
export const EASE_MOVE = 'cubic-bezier(0.25, 1, 0.5, 1)';

// A preference, not a size: read when the motion starts, so nothing listens for it.
export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** How the cards and the sections part around the one being dragged; none under reduced motion. */
export const sortTransition = () => (reducedMotion() ? null : { duration: SORT_MS, easing: EASE_MOVE });
