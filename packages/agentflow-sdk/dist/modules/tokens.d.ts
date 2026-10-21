import type { AppTheme } from './contract.js';
/** The custom properties a host sets for a module: the whole of the theming contract. */
export declare const AF_TOKENS: readonly ['--af-bg', '--af-surface', '--af-fg', '--af-muted-fg', '--af-border', '--af-primary', '--af-primary-fg', '--af-danger', '--af-warning', '--af-success', '--af-ring', '--af-radius', '--af-font-sans', '--af-font-mono'];
export type AfToken = (typeof AF_TOKENS)[number];
export type AfPalette = Record<AfToken, string>;
/** AgentFlow's default look (its azure brand), for a standalone host to inject. */
export declare const AF_DEFAULT_PALETTE: {
    light: AfPalette;
    dark: AfPalette;
};
/**
 * Says the theme on the element that holds a module's shadow root: `data-theme` and `data-brand`,
 * which module CSS reads as `:host([data-theme=dark])`, and, given a palette, every token's value.
 * AgentFlow passes no palette, because its stylesheet maps the tokens.
 */
export declare function applyTheme(element: HTMLElement, theme: AppTheme, palette?: {
    light: AfPalette;
    dark: AfPalette;
}): void;
//# sourceMappingURL=tokens.d.ts.map