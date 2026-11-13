<svelte:options runes />

<script lang="ts"></script>

<!-- The look af-person-picker and af-combobox share: their control, chips and list. Each element renders this beside
  KitStyles, so the rules land in its own shadow root.
  - The control is AgentFlow's Input, grown a row for each row of chips, ringed while the text in it has focus. A
    chip is a secondary Badge holding a remove button inside the badge's own height, and a 16px avatar in the person
    picker.
  - The list is AgentFlow's command list in its popover: items as CommandItem draws them, the highlighted one in the
    accent.
  - With a source, the loading row is muted; the load-more row is a full-width row in the list's own type, highlighted
    on hover and ringed on focus. Each is inset as the list's options are: 12px in af-combobox, 8px in the person picker.
  - Forced colours drop box-shadow and backgrounds: focus falls back to an outline and the highlighted item is
    painted in the system's highlight.
  - The chip rules carry the specificity they had as an element's scoped rules, so they win and lose where they did.
-->
<style>
  :global([data-scope='combobox'] [part='chip'] .af-avatar) { width: 16px; height: 16px; margin-left: -4px; font-size: 8px; line-height: 1; }
  :global([data-scope='combobox'] [part='chip'] button) { display: inline-grid; flex: none; place-items: center; width: 16px; height: 16px; margin-right: -4px; padding: 0; border: 0;
    border-radius: calc(infinity * 1px); background: transparent; color: inherit; outline: none; cursor: pointer; }
  @media (hover: hover) { :global([data-scope='combobox'] [part='chip'] button:hover:not(:disabled)) { background-color: color-mix(in oklab, currentColor 10%, transparent); } }
  :global([data-scope='combobox'] [part='chip'] button:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([data-scope='combobox'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='combobox'][hidden]) { display: none !important; }
  :global([data-scope='combobox'][data-part='control']) { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; box-sizing: border-box; width: 100%;
    min-width: 14em; min-height: 36px; padding: 4px 12px; border: 1px solid var(--k-input); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 16px; line-height: 24px;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  @media (min-width: 48rem) { :global([data-scope='combobox'][data-part='control']) { font-size: 14px; line-height: 20px; } }
  :global([data-scope='combobox'][data-part='control']:has(input:focus-visible)) { border-color: var(--k-focus-border);
    box-shadow: 0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  :global([data-scope='combobox'][data-part='control'][data-disabled]) { opacity: 0.5; cursor: not-allowed; }
  :global([data-scope='combobox'][data-part='input']) { flex: 1; min-width: 6em; padding: 0; border: 0; outline: none; background: transparent; color: inherit; font: inherit; }
  :global([data-scope='combobox'][data-part='input']::placeholder) { color: var(--k-muted); opacity: 1; }
  :global([data-scope='combobox'][data-part='content']) { display: flex; flex-direction: column; width: var(--reference-width, auto); max-height: 300px; padding: 4px; }
  :global([data-scope='combobox'][data-part='item']) { position: relative; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 0 solid var(--k-line);
    border-radius: max(0px, calc(var(--k-radius) - 4px)); outline: none; font-size: 14px; line-height: 20px; cursor: default; -webkit-user-select: none; user-select: none; }
  :global([data-scope='combobox'][data-part='item'][data-highlighted]) { background-color: var(--k-accent); color: var(--k-accent-fg); }
  :global([data-scope='combobox'][data-part='item'][data-state='checked']) { font-weight: 600; }
  :global([data-scope='combobox'][data-part='item'] .lines) { display: flex; flex-direction: column; min-width: 0; }
  :global([data-scope='combobox'][data-part='item'] .detail) { color: var(--k-muted); font-size: 12px; line-height: 16px; }
  :global([data-scope='combobox'][data-part='empty']) { padding: 24px 0; font-size: 14px; line-height: 20px; text-align: center; }
  :global([data-scope='combobox'] [part='loading']) { padding: 6px 12px; color: var(--k-muted); font-size: 14px; line-height: 20px; }
  :global([data-scope='combobox'] [part='load-more']) { display: flex; box-sizing: border-box; gap: 8px; width: 100%; margin: 0; padding: 6px 12px; border: 0 solid var(--k-line);
    border-radius: max(0px, calc(var(--k-radius) - 4px)); background: transparent; color: inherit; font: inherit; font-size: 14px; line-height: 20px; text-align: start; outline: none; cursor: pointer; }
  :global([data-scope='combobox'].people [part='loading']), :global([data-scope='combobox'].people [part='load-more']) { padding-left: 8px; padding-right: 8px; }
  @media (hover: hover) { :global([data-scope='combobox'] [part='load-more']:hover) { background-color: var(--k-accent); color: var(--k-accent-fg); } }
  :global([data-scope='combobox'] [part='load-more']:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  @media (prefers-reduced-motion: reduce) { :global([data-scope='combobox'][data-part='control']) { transition: none; } }
  @media (forced-colors: active) {
    :global([data-scope='combobox'][data-part='control']:has(input:focus-visible)), :global([data-scope='combobox'] [part='chip'] button:focus-visible),
    :global([data-scope='combobox'] [part='load-more']:focus-visible) { outline: 2px solid; outline-offset: 2px; }
    :global([data-scope='combobox'][data-part='item'][data-highlighted]) { forced-color-adjust: none; background-color: Highlight; color: HighlightText; }
  }
</style>
