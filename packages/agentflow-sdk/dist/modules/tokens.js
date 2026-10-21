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
    '--af-radius',
    '--af-font-sans',
    '--af-font-mono',
];
const SHARED = {
    '--af-warning': 'oklch(0.666 0.179 58.318)',
    '--af-success': 'oklch(0.596 0.145 163.225)',
    '--af-radius': '0.625rem',
    '--af-font-sans': 'ui-sans-serif, system-ui, sans-serif',
    '--af-font-mono': 'ui-monospace, SFMono-Regular, Menlo, monospace',
};
/** AgentFlow's default look (its azure brand), for a standalone host to inject. */
export const AF_DEFAULT_PALETTE = {
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
        ...SHARED,
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
        ...SHARED,
    },
};
/**
 * Says the theme on the element that holds a module's shadow root: `data-theme` and `data-brand`,
 * which module CSS reads as `:host([data-theme=dark])`, and, given a palette, every token's value.
 * AgentFlow passes no palette, because its stylesheet maps the tokens.
 */
export function applyTheme(element, theme, palette) {
    element.dataset.theme = theme.mode;
    element.dataset.brand = theme.brand;
    if (!palette)
        return;
    for (const token of AF_TOKENS)
        element.style.setProperty(token, palette[theme.mode][token]);
}
//# sourceMappingURL=tokens.js.map