import type { AfPalette } from '@reflexify/agentflow-sdk';

const SHARED = {
  '--af-radius': '6px',
  '--af-font-sans': '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  '--af-font-mono': '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

/**
 * The desk's own look as the tokens a host injects, for its own site and its demo: the same values `desk.css` falls
 * back to, so standalone it looks as it always has. Inside AgentFlow, AgentFlow's tokens replace them.
 */
export const DESK_PALETTE: { light: AfPalette; dark: AfPalette } = {
  light: {
    '--af-bg': '#f3f6f5',
    '--af-surface': '#ffffff',
    '--af-fg': '#13201e',
    '--af-muted-fg': '#5a6a67',
    '--af-border': '#d8e1df',
    '--af-primary': '#0f766e',
    '--af-primary-fg': '#ffffff',
    '--af-danger': '#b42318',
    '--af-warning': '#b54708',
    '--af-success': '#067647',
    '--af-ring': '#0f766e',
    ...SHARED,
  },
  dark: {
    '--af-bg': '#0d1312',
    '--af-surface': '#131b1a',
    '--af-fg': '#e3ecea',
    '--af-muted-fg': '#94a5a2',
    '--af-border': '#25302e',
    '--af-primary': '#2bb3a4',
    '--af-primary-fg': '#052420',
    '--af-danger': '#ff8b7c',
    '--af-warning': '#f7b267',
    '--af-success': '#6fd9a1',
    '--af-ring': '#2bb3a4',
    ...SHARED,
  },
};

/** The desk's `data-brand` on its own site. */
export const DESK_BRAND = 'support-desk';
