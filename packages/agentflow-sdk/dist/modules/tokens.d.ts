import type { AppTheme } from './contract.js';
/** The custom properties a host sets for a module: the whole of the theming contract. */
export declare const AF_TOKENS: readonly ['--af-bg', '--af-surface', '--af-fg', '--af-muted-fg', '--af-border', '--af-primary', '--af-primary-fg', '--af-danger', '--af-warning', '--af-success', '--af-ring', '--af-secondary', '--af-secondary-fg', '--af-accent', '--af-accent-fg', '--af-muted', '--af-input', '--af-popover', '--af-popover-fg', '--af-radius', '--af-font-sans', '--af-font-mono', '--af-chart-1', '--af-chart-2', '--af-chart-3', '--af-chart-4', '--af-chart-5', '--af-chart-6', '--af-chart-7', '--af-chart-8', '--af-chart-other', '--af-chart-hatch', '--af-chart-grid', '--af-chart-axis'];
export type AfToken = (typeof AF_TOKENS)[number];
type ChartToken = Extract<AfToken, `--af-chart-${string}`>;
type SurfaceToken = '--af-secondary' | '--af-secondary-fg' | '--af-accent' | '--af-accent-fg' | '--af-muted' | '--af-input' | '--af-popover' | '--af-popover-fg';
type OptionalToken = ChartToken | SurfaceToken;
/** A value for every token, except that the chart's and the eight surface tokens may be left out. A
 *  module's fallbacks then hold: AgentFlow's validated chart palette, and in the UI kit surfaces made from
 *  the palette's own surface, border and text colours. */
export type AfPalette = Record<Exclude<AfToken, OptionalToken>, string> & Partial<Record<OptionalToken, string>>;
/** AgentFlow's default look (its azure brand), for a standalone host to inject. */
export declare const AF_DEFAULT_PALETTE: {
    light: Required<AfPalette>;
    dark: Required<AfPalette>;
};
/**
 * Says the theme on the element that holds a module's shadow root: `data-theme` and `data-brand`,
 * which module CSS reads as `:host([data-theme=dark])`, and, given a palette, every token's value (a
 * chart or surface token the palette leaves out is cleared).
 * AgentFlow passes no palette, because its stylesheet maps the tokens.
 */
export declare function applyTheme(element: HTMLElement, theme: AppTheme, palette?: {
    light: AfPalette;
    dark: AfPalette;
}): void;
export {};
//# sourceMappingURL=tokens.d.ts.map