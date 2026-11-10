import type { AppTheme } from './contract.js';

/** The custom properties a host sets for a module: the whole of the theming contract. */
export const AF_TOKENS = [
  '--af-bg',
  '--af-surface',
  '--af-fg',
  '--af-muted-fg',
  '--af-border',
  '--af-primary',
  '--af-primary-fg',
  '--af-danger',
  '--af-warning',
  '--af-success',
  '--af-ring',
  '--af-secondary',
  '--af-secondary-fg',
  '--af-accent',
  '--af-accent-fg',
  '--af-muted',
  '--af-input',
  '--af-popover',
  '--af-popover-fg',
  '--af-radius',
  '--af-font-sans',
  '--af-font-mono',
  '--af-chart-1',
  '--af-chart-2',
  '--af-chart-3',
  '--af-chart-4',
  '--af-chart-5',
  '--af-chart-6',
  '--af-chart-7',
  '--af-chart-8',
  '--af-chart-other',
  '--af-chart-hatch',
  '--af-chart-grid',
  '--af-chart-axis',
] as const;

export type AfToken = (typeof AF_TOKENS)[number];
type ChartToken = Extract<AfToken, `--af-chart-${string}`>;
type SurfaceToken =
  | '--af-secondary'
  | '--af-secondary-fg'
  | '--af-accent'
  | '--af-accent-fg'
  | '--af-muted'
  | '--af-input'
  | '--af-popover'
  | '--af-popover-fg';
type OptionalToken = ChartToken | SurfaceToken;
/** A value for every token, except that the chart's and the eight surface tokens may be left out. A
 *  module's fallbacks then hold: AgentFlow's validated chart palette, and in the UI kit surfaces made from
 *  the palette's own surface, border and text colours. */
export type AfPalette = Record<Exclude<AfToken, OptionalToken>, string> & Partial<Record<OptionalToken, string>>;

const SHARED = {
  '--af-warning': 'oklch(0.666 0.179 58.318)',
  '--af-success': 'oklch(0.596 0.145 163.225)',
  '--af-radius': '0.625rem',
  '--af-font-sans': 'ui-sans-serif, system-ui, sans-serif',
  '--af-font-mono': 'ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

/**
 * The chart palette: eight categorical slots in a fixed order, the hatched `other` ground and its
 * stroke, and the grid and axis lines. Checked with the dataviz palette validator against AgentFlow's
 * chart surfaces, `#ffffff` in light mode and `#19191e` in dark; run it again before changing any
 * value. Every brand shares it.
 */
const CHART = {
  light: {
    '--af-chart-1': '#2a78d6',
    '--af-chart-2': '#eb6834',
    '--af-chart-3': '#1baf7a',
    '--af-chart-4': '#eda100',
    '--af-chart-5': '#e87ba4',
    '--af-chart-6': '#008300',
    '--af-chart-7': '#6250d6',
    '--af-chart-8': '#e34948',
    '--af-chart-other': '#f0efec',
    '--af-chart-hatch': '#898781',
    '--af-chart-grid': '#e1e0d9',
    '--af-chart-axis': '#c3c2b7',
  },
  dark: {
    '--af-chart-1': '#3987e5',
    '--af-chart-2': '#d95926',
    '--af-chart-3': '#199e70',
    '--af-chart-4': '#c98500',
    '--af-chart-5': '#d55181',
    '--af-chart-6': '#008300',
    '--af-chart-7': '#9085e9',
    '--af-chart-8': '#e66767',
    '--af-chart-other': '#383835',
    '--af-chart-hatch': '#898781',
    '--af-chart-grid': '#2c2c2a',
    '--af-chart-axis': '#383835',
  },
} as const;

/** AgentFlow's default look (its azure brand), for a standalone host to inject. */
export const AF_DEFAULT_PALETTE: { light: Required<AfPalette>; dark: Required<AfPalette> } = {
  light: {
    '--af-bg': 'oklch(0.984 0.003 248)',
    '--af-surface': 'oklch(1 0 0)',
    '--af-fg': 'oklch(0.21 0.035 255)',
    '--af-muted-fg': 'oklch(0.5 0.035 257)',
    '--af-border': 'oklch(0.922 0.013 255)',
    '--af-primary': 'oklch(0.55 0.17 254)',
    '--af-primary-fg': 'oklch(0.99 0.004 250)',
    '--af-danger': 'oklch(0.577 0.245 27.325)',
    '--af-ring': 'oklch(0.55 0.17 254 / 0.4)',
    '--af-secondary': 'oklch(0.965 0.008 250)',
    '--af-secondary-fg': 'oklch(0.21 0.035 255)',
    '--af-accent': 'oklch(0.965 0.008 250)',
    '--af-accent-fg': 'oklch(0.21 0.035 255)',
    '--af-muted': 'oklch(0.965 0.008 250)',
    '--af-input': 'oklch(0.922 0.013 255)',
    '--af-popover': 'oklch(1 0 0)',
    '--af-popover-fg': 'oklch(0.21 0.035 255)',
    ...SHARED,
    ...CHART.light,
  },
  dark: {
    '--af-bg': 'oklch(0.18 0.022 255)',
    '--af-surface': 'oklch(0.218 0.024 255)',
    '--af-fg': 'oklch(0.962 0.006 250)',
    '--af-muted-fg': 'oklch(0.76 0.02 255)',
    '--af-border': 'oklch(1 0 0 / 11%)',
    '--af-primary': 'oklch(0.74 0.13 248)',
    '--af-primary-fg': 'oklch(0.2 0.035 252)',
    '--af-danger': 'oklch(0.704 0.191 22.216)',
    '--af-ring': 'oklch(0.74 0.13 248 / 0.5)',
    '--af-secondary': 'oklch(0.268 0.025 255)',
    '--af-secondary-fg': 'oklch(0.962 0.006 250)',
    '--af-accent': 'oklch(0.278 0.026 255)',
    '--af-accent-fg': 'oklch(0.962 0.006 250)',
    '--af-muted': 'oklch(0.258 0.024 255)',
    '--af-input': 'oklch(1 0 0 / 16%)',
    '--af-popover': 'oklch(0.238 0.025 255)',
    '--af-popover-fg': 'oklch(0.962 0.006 250)',
    ...SHARED,
    ...CHART.dark,
  },
};

/**
 * Says the theme on the element that holds a module's shadow root: `data-theme` and `data-brand`,
 * which module CSS reads as `:host([data-theme=dark])`, and, given a palette, every token's value (a
 * chart or surface token the palette leaves out is cleared).
 * AgentFlow passes no palette, because its stylesheet maps the tokens.
 */
export function applyTheme(element: HTMLElement, theme: AppTheme, palette?: { light: AfPalette; dark: AfPalette }): void {
  element.dataset.theme = theme.mode;
  element.dataset.brand = theme.brand;
  if (!palette) return;
  for (const token of AF_TOKENS) {
    const value = palette[theme.mode][token];
    if (value === undefined) element.style.removeProperty(token);
    else element.style.setProperty(token, value);
  }
}
