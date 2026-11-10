<svelte:options customElement={{ shadow: 'open', props: { value: { attribute: 'value', type: 'String' }, label: { attribute: 'label', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' } }, extend: (ce) => class extends formAssociate(ce) {
  // The drawing surface is the control a label, a form or the page means; it has no input part for formAssociate to find.
  focus(options?: FocusOptions): void {
    const control = this.shadowRoot?.querySelector<HTMLElement>('[part~="control"]');
    if (control) control.focus(options);
    else super.focus(options);
  }
  // A method from construction, as the table promises; before the element connects there is nothing to clear.
  clear(): void { clearers.get(this)?.(); }
} }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';

  const clearers = new WeakMap<HTMLElement, () => void>();

  // perfect-freehand draws a stroke `size × (1 − thinning × (1 − 2p))` wide at pressure p, from 0 to 1, so these hold
  // every width between AgentFlow's 0.7 px and 2.6 px pen. Zag hands it no pointer pressure, so p is 0.5 and the ink
  // 1.65 px; its simulated pressure is off, since it scales with the 1.65 px size and would thin every real stroke to 0.7 px.
  const PEN_MIN = 0.7;
  const PEN_MAX = 2.6;
  const PEN_SIZE = (PEN_MIN + PEN_MAX) / 2;
  const PEN_THINNING = (PEN_MAX - PEN_MIN) / (PEN_MAX + PEN_MIN);
  // AgentFlow's pen colour. Zag writes it into the drawing's own style, which the exported image carries, and a stored
  // signature is seen in every reader's theme, so the ink is fixed rather than a token.
  const INK = '#0f172a';
</script>

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { SignaturePad, useSignaturePad } from '@ark-ui/svelte/signature-pad';
  import { untrack } from 'svelte';
  import KitStyles from './KitStyles.svelte';
  import { emit } from './environment.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import { kitText, orEnglish } from './text.js';
  import type { KitStrings } from './index.js';

  let {
    value = null, label = null, disabled = false, locale = null, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false,
  }: {
    value?: string | null; label?: string | null; disabled?: boolean | null; locale?: string | null; strings?: Partial<KitStrings> | null;
    name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null; invalid?: boolean | null;
  } = $props();
  const self = $host();
  const id = $props.id();
  const text = $derived(kitText(locale, strings ?? undefined));
  const accessibleName = $derived(label || text.signaturePad);

  // An ancestor <fieldset disabled> disables the control without touching its own `disabled`.
  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const described = $derived([description, error].filter(Boolean).join(' '));
  let control = $state<HTMLElement | null>(null);

  // The data URL of the strokes on the pad, once the last stroke's export has come back.
  let drawn = $state<string | null>(null);
  // The `value` a clear took off the pad: it stays off until the page sets `value` again.
  let dismissed = $state<string | null>(null);
  $effect.pre(() => {
    void value;
    untrack(() => (dismissed = null));
  });
  // Each stroke's export resolves later; one a clear or a newer stroke has overtaken is dropped.
  let exports = 0;
  // A form's reset empties the pad without reporting the clear Zag reports.
  let quietClears = 0;

  const pad = useSignaturePad(() => ({
    id,
    getRootNode: () => self.shadowRoot!,
    disabled: locked,
    readOnly: !!readonly,
    drawing: { size: PEN_SIZE, thinning: PEN_THINNING, simulatePressure: false, fill: INK },
    translations: { control: accessibleName, clearTrigger: text.clear },
    onDrawEnd: (details) => {
      const turn = ++exports;
      if (!details.paths.length) {
        drawn = null;
        if (quietClears) {
          quietClears--;
          return;
        }
        dismissed = value;
        emit(self, 'change', { value: null });
        return;
      }
      // Zag's export can also throw before it returns a promise; either failure leaves the pad with no image to submit
      // rather than the one before this stroke.
      void new Promise<string>((resolve) => resolve(details.getDataUrl('image/png'))).then((url) => {
        if (turn !== exports) return;
        drawn = url || null;
        if (url) emit(self, 'change', { value: url });
      }, (error: unknown) => {
        if (turn !== exports) return;
        drawn = null;
        console.warn('A signature could not be exported as an image; the pad reports no value.', { error: String(error) });
      });
    },
  }));

  const marked = $derived(pad().paths.length > 0 || !!pad().currentPath);
  const showImage = $derived(!!value && !marked && value !== dismissed);
  const current = $derived(marked ? drawn : showImage ? value : null);

  clearers.set(self, () => pad().clear());

  // `name`, `disabled` and `readonly` reflect to their attributes: the browser reads the host's attributes to submit, to
  // leave a disabled control out, and to bar a read-only one from validation.
  $effect(() => {
    const missing = !!required && !current;
    writeForm(self, {
      name,
      value: current,
      validity: missing ? { valueMissing: true } : {},
      message: missing ? orEnglish(text, 'valueMissing') : '',
      anchor: control,
    });
  });
  // A controlled element cannot reset itself: the strokes go, and the page is asked for the value it was written with.
  onFormEvents(self, {
    reset() {
      const initial = self.getAttribute('value') || null;
      const before = current;
      if (!pad().empty) {
        quietClears++;
        pad().clear();
      }
      dismissed = null;
      if (before !== initial) emit(self, 'change', { value: initial });
    },
    disabled(next) { formDisabled = next; },
  });
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit signature">
    {#if described}<span id="af-described" hidden>{described}</span>{/if}
    {#if readonly}
      <div class="frame" role="img" aria-label={accessibleName}>
        {#if value}<img part="image" src={value} alt="" />{/if}
      </div>
    {:else}
      <SignaturePad.RootProvider value={pad} class="root">
        <SignaturePad.Control bind:ref={control} part="control" aria-describedby={described ? 'af-hint af-described' : 'af-hint'}
          aria-invalid={invalid ? 'true' : undefined}>
          {#if showImage}<img part="image" src={value} alt="" />{/if}
          <SignaturePad.Segment part="segment" aria-hidden="true" />
          <SignaturePad.Guide part="guide" />
        </SignaturePad.Control>
        <div class="footer">
          <p part="hint" id="af-hint">{text.signHint}</p>
          <SignaturePad.ClearTrigger part="clear" class="af-button ghost sm" hidden={false} disabled={locked || (!marked && !showImage)}>{text.clear}</SignaturePad.ClearTrigger>
        </div>
      </SignaturePad.RootProvider>
    {/if}
  </div>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - AgentFlow's drawing pane in BlockRenderer: a 288px canvas inside a 1px neutral 300 edge at the medium radius on white,
    and the hint 8px below in 11px neutral 500. The edge is the line token and the hint the muted text.
  - The pad's ground is white and its ink AgentFlow's #0f172a in every theme, on purpose and not tokens: the export is
    stored data that other readers see in their own themes, so it must not depend on the theme it was drawn in. The
    image of `value` sits on the same white, and the guide on it is neutral 300 (#d4d4d4), since a line on a fixed
    ground cannot follow the theme either.
  - The control takes the host's height less the footer when the page sets one, and otherwise draws on 288px inside its edge.
  - The guide is a dashed baseline a quarter of the way up, under the strokes.
  - The image of `value` fills the control from its top left corner, as it was drawn, and keeps its proportions.
-->
<style>
  :host { display: block; }
  .signature { display: flex; flex-direction: column; height: 100%; }
  .signature > :global(.root) { display: contents; }
  .frame, :global([part~='control']) { position: relative; box-sizing: border-box; flex: 1 1 290px; min-height: 0; overflow: hidden; border: 1px solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: #fff; outline: none; touch-action: none; }
  :global([part~='control']) { cursor: crosshair; }
  :global([part~='control']:focus-visible) { border-color: var(--k-focus-border); box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([part~='control'][data-disabled]) { opacity: 0.5; cursor: not-allowed; }
  :global([part~='control'][aria-invalid='true']) { border-color: var(--k-danger); }
  :global([part~='image']) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: left top; pointer-events: none; }
  :global([part~='guide']) { position: absolute; right: 24px; bottom: 25%; left: 24px; border-bottom: 1px dashed #d4d4d4; pointer-events: none; }
  .footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; }
  :global([part~='hint']) { margin: 0; color: var(--k-muted); font-size: 11px; }
  :global([part~='clear']) { flex: none; }
  @media (forced-colors: active) {
    :global([part~='control']:focus-visible) { outline: 2px solid; outline-offset: 2px; }
  }
</style>
