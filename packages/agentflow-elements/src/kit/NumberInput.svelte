<svelte:options customElement={{ shadow: { mode: 'open', delegatesFocus: true }, extend: numberAssociate, props: { value: { attribute: 'value', type: 'Number' }, min: { attribute: 'min', type: 'Number' }, max: { attribute: 'max', type: 'Number' }, step: { attribute: 'step', type: 'Number' }, precision: { attribute: 'precision', type: 'Number' }, fractional: { attribute: 'fractional', type: 'Boolean' }, unscaled: { attribute: 'unscaled', type: 'Boolean' }, format: { attribute: 'format', type: 'String' }, currency: { attribute: 'currency', type: 'String' }, steppers: { attribute: 'steppers', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, locale: { attribute: 'locale', type: 'String' }, separators: { attribute: 'separators', type: 'String' }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' } } }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';

  type AttributeHost = HTMLElement & { attributeChangedCallback(name: string, before: string | null, after: string | null): void };
  /** Svelte's Number converter reads a blank `value` attribute as 0; a blank value is no value, as reset reads it. */
  function numberAssociate<T extends new () => HTMLElement>(base: T): T {
    const Base = formAssociate(base) as unknown as new () => AttributeHost;
    return class extends Base {
      attributeChangedCallback(name: string, before: string | null, after: string | null): void {
        super.attributeChangedCallback(name, before, name === 'value' && after !== null && after.trim() === '' ? null : after);
      }
    } as unknown as T;
  }

  const finite = (n: unknown): number | null => (typeof n === 'number' && Number.isFinite(n) ? n : null);
  /** The fraction digits a currency is written with, or null for a code Intl does not know. */
  function currencyDigits(code: string): number | null {
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits ?? 0;
    } catch {
      return null;
    }
  }
  function decimalsOf(n: number): number {
    const [mantissa = '', exponent] = String(n).split('e');
    return Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - Number(exponent ?? 0));
  }
  /** `n` times ten to the `places`, moved in the digits so that 33.3 over 100 is 0.333 and no float noise comes with it. */
  function shift(n: number, places: number): number {
    if (!Number.isFinite(n)) return n;
    const [mantissa = '', exponent] = String(n).split('e');
    return Number(`${mantissa}e${Number(exponent ?? 0) + places}`);
  }
  // Intl keeps up to 20 fraction digits; Ark's parser reads a percent's only to 18, and warns past that.
  const FREE_DIGITS = 20;
  const FREE_PERCENT_DIGITS = 18;
  /** Whether `text` holds the language's separators where a number written in it cannot: a group separator in the
   *  whole part anywhere but between groups of three, as a Vietnamese "1234.5" has (read in Vietnamese the dot groups,
   *  so the parser would take it for 12345), a group separator in the fraction, as an English "1,234.5" read in
   *  Vietnamese has, or a second decimal separator. Without `grouping`, any group separator is out of place, and a
   *  comma or a point that is neither the locale's group nor its decimal always is: French groups with a space, yet its
   *  parser takes a lone point for the decimal, so "1.234" would read as 1.234. */
  function misgrouped(text: string, locale: string, grouping: boolean): boolean {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
    const group = parts.find((p) => p.type === 'group')?.value;
    const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';
    if ([...text].some((c) => (c === '.' || c === ',') && c !== group && c !== decimal)) return true;
    const [whole = '', ...fractions] = text.split(decimal);
    if (fractions.length > 1) return true;
    if (!group) return false;
    // A number written without groups has no place for a group separator; the parser would read it as no number.
    if (!grouping) return text.includes(group);
    if (fractions.some((f) => f.includes(group))) return true;
    if (!whole.includes(group)) return false;
    const groups = whole.split(group).map((g) => g.replace(/[^0-9]/g, ''));
    return !/^[1-9][0-9]{0,2}$/.test(groups[0] ?? '') || groups.slice(1).some((g) => !/^[0-9]{3}$/.test(g));
  }
  // The locale each separators preset reads and writes in; the others keep the element's language.
  const SEPARATOR_LOCALES: Record<string, string> = { comma_dot: 'en-US', dot_comma: 'de-DE', space_comma: 'fr-FR' };
  // PageUp and PageDown move ten steps, as Ark's large step does.
  const STEP_KEYS: Record<string, [direction: 1 | -1, steps: number]> = { ArrowUp: [1, 1], ArrowDown: [-1, 1], PageUp: [1, 10], PageDown: [-1, 10] };
</script>

<script lang="ts">
  import { useNumberInput, NumberInput } from '@ark-ui/svelte/number-input';
  import { untrack } from 'svelte';
  import KitStyles from './KitStyles.svelte';
  import { emit } from './environment.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import { fill, isVi, kitText, orEnglish } from './text.js';
  import type { KitStrings } from './index.js';

  let {
    value = null, min = null, max = null, step = null, precision = null, fractional = false, unscaled = false, format = 'plain', currency = 'VND', steppers = false,
    placeholder = null, label = null, disabled = false, locale = null, separators = null, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false,
  }: {
    value?: number | null; min?: number | null; max?: number | null; step?: number | null; precision?: number | null;
    fractional?: boolean | null; unscaled?: boolean | null;
    format?: 'plain' | 'currency' | 'percent' | null; currency?: string | null; steppers?: boolean | null;
    placeholder?: string | null; label?: string | null; disabled?: boolean | null; locale?: string | null;
    separators?: 'locale' | 'comma_dot' | 'dot_comma' | 'space_comma' | 'none' | null; strings?: Partial<KitStrings> | null;
    name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null; invalid?: boolean | null;
  } = $props();
  const self = $host();
  const id = $props.id();
  const inputId = `${id}-input`;
  const text = $derived(kitText(locale, strings ?? undefined));
  const intlLocale = $derived(isVi(locale) ? 'vi-VN' : 'en-GB');
  const presetLocale = $derived(separators && Object.hasOwn(SEPARATOR_LOCALES, separators) ? SEPARATOR_LOCALES[separators]! : intlLocale);
  const grouping = $derived(separators !== 'none');
  const current = $derived(finite(value));
  const lowest = $derived(finite(min));
  const highest = $derived(finite(max));
  const style = $derived(format === 'currency' || format === 'percent' ? format : 'decimal');
  // An unscaled percent's value is the percentage itself: 12.5 is 12.5%, where a scaled one's is the fraction 0.125.
  const points = $derived(style === 'percent' && !!unscaled);
  // A scaled percent steps by one point unless `step` says otherwise: its value is a fraction, so a step of 1 would be 100 points.
  const stride = $derived(finite(step) !== null && step! > 0 ? step! : style === 'percent' && !points ? 0.01 : 1);
  // Whether the step is whole is judged in the units shown, so a scaled percent's 0.01 is one point and shows no fraction.
  const shownStride = $derived(style === 'percent' && !points ? Number((stride * 100).toFixed(10)) : stride);
  // With no `precision`, a `fractional` number or an unscaled percent shows and keeps the digits it has.
  const exact = $derived(finite(precision) !== null && precision! >= 0);
  const free = $derived(!exact && (!!fractional || points));
  const digits = $derived(
    exact ? Math.min(20, Math.floor(precision!))
    : free ? (style === 'percent' ? FREE_PERCENT_DIGITS : FREE_DIGITS)
    : Number.isInteger(shownStride) ? 0 : 2,
  );
  const code = $derived(currency && currencyDigits(currency) !== null ? currency.toUpperCase() : 'VND');
  // A currency written with more digits than `precision` allows shows at most `precision`. The grouping is always
  // named: Ark keeps one parser for every number input on the page and finds options unchanged when the new ones
  // carry no key the old ones lack, so a field without it would go on reading with a `none` field's parser.
  const formatOptions = $derived<Intl.NumberFormatOptions>({
    ...(style === 'currency'
      ? { style, currency: code, minimumFractionDigits: Math.min(currencyDigits(code) ?? 0, digits), maximumFractionDigits: digits }
      : { style, maximumFractionDigits: digits }),
    useGrouping: grouping,
  });
  const formatter = $derived(new Intl.NumberFormat(presetLocale, formatOptions));
  // The formatter reads a percent as a fraction, so an unscaled one is shown a hundredth of its value.
  const display = (n: number) => formatter.format(points ? shift(n, -2) : n);
  const shown = $derived(current === null ? '' : display(current));
  // A scaled percent's value has two more digits than it shows; a step finer than `precision` keeps its own.
  const valueDigits = $derived(Math.min(20, Math.max(digits + (style === 'percent' && !points ? 2 : 0), decimalsOf(stride))));
  const round = (n: number, places = valueDigits) => Number(n.toFixed(places));

  // What the input holds: the shown value, or what the person is typing until they commit it.
  let input = $state<HTMLInputElement | null>(null);
  let draft = $state('');
  // French groups with a narrow no-break space no keyboard has, so a typed space or no-break space between digits is one.
  const readable = $derived(separators === 'space_comma' ? draft.replace(/(?<=[0-9])[ \u00a0](?=[0-9])/g, '\u202f') : draft);
  let editing = $state(false);
  // Typed text whose grouping does not read stays in the input, marked, until text that reads or a new value replaces it.
  let unparsed = $state(false);
  let refusedText = '';
  let lastShown: string | null = null;
  $effect.pre(() => {
    const next = shown;
    if (next !== lastShown) {
      lastShown = next;
      untrack(() => {
        if (unparsed) {
          unparsed = false;
          editing = false;
        }
      });
    }
    if (editing) return;
    draft = next;
    // Svelte skips writing the value it last wrote, so text typed and dropped before it next rendered would stay.
    if (input && input.value !== next) input.value = next;
  });

  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const described = $derived([description, error].filter(Boolean).join(' '));

  // Ark reads the draft as its value and parses it with the locale's separators; the element decides when to commit.
  const api = useNumberInput(() => ({
    id,
    ids: { input: inputId },
    getRootNode: () => self.shadowRoot!,
    locale: presetLocale,
    dir: 'ltr' as const,
    value: readable,
    formatOptions,
    step: stride,
    min: lowest ?? undefined,
    max: highest ?? undefined,
    // Ark would clamp a typed value on blur; a value outside min and max is the form's rangeUnderflow or rangeOverflow.
    allowOverflow: true,
    allowMouseWheel: false,
    spinOnPress: false,
    focusInputOnChange: false,
    disabled: locked,
    readOnly: !!readonly,
    invalid: !!invalid,
  }));

  $effect(() => {
    self.toggleAttribute('data-unparsed', unparsed);
  });

  const validity = $derived(
    unparsed ? { badInput: true }
    : required && current === null ? { valueMissing: true }
    : current !== null && lowest !== null && current < lowest ? { rangeUnderflow: true }
    : current !== null && highest !== null && current > highest ? { rangeOverflow: true }
    : {},
  );
  const message = $derived(
    'badInput' in validity ? fill(orEnglish(text, 'badNumber'), { example: new Intl.NumberFormat(presetLocale, { useGrouping: grouping }).format(1234.5) })
    : 'valueMissing' in validity ? orEnglish(text, 'valueMissing')
    : 'rangeUnderflow' in validity ? fill(orEnglish(text, 'numberUnderflow'), { min: display(lowest!) })
    : 'rangeOverflow' in validity ? fill(orEnglish(text, 'numberOverflow'), { max: display(highest!) })
    : '',
  );
  // `name`, `disabled` and `readonly` reflect to their attributes: the browser reads the host's attributes, not its
  // properties, to submit a string value, to leave a disabled control out, and to bar a read-only one from validation.
  $effect(() => writeForm(self, { name, value: current === null ? null : String(current), validity, message, anchor: input }));
  // A controlled element cannot reset itself, so a form's reset asks the page for the value it was written with.
  onFormEvents(self, {
    reset() {
      const written = self.getAttribute('value');
      const initial = written === null || written.trim() === '' ? null : finite(Number(written));
      if (initial !== current) emit(self, 'change', { value: initial });
    },
    disabled(next) { formDisabled = next; },
  });

  // A commit after a refusal is heard even when it is the value the element has: the page may hold the refused text.
  function commit(next: number | null) {
    const wasUnparsed = unparsed;
    unparsed = false;
    if (next !== current || wasUnparsed) emit(self, 'change', { value: next });
  }

  /** The typed number, null for empty text, NaN for text that is not a number. */
  const typed = () => {
    if (draft.trim() === '') return null;
    const n = api().valueAsNumber;
    return points ? shift(n, 2) : n;
  };

  function commitTyped() {
    if (!editing) return;
    if (misgrouped(readable, presetLocale, grouping)) {
      // Each text refused is told once: a blur after Enter refuses the same text again.
      if (!unparsed || draft !== refusedText) emit(self, 'unparsed', { text: draft });
      refusedText = draft;
      unparsed = true;
      return;
    }
    const next = typed();
    editing = false;
    // Text that is not a number is dropped, and the shown value comes back; after a refusal the page hears that value.
    if (next === null || Number.isFinite(next)) commit(next === null ? null : round(next));
    else if (unparsed) commit(current);
  }

  function stepBy(direction: 1 | -1, steps = 1) {
    if (locked || readonly) return;
    const from = editing && !misgrouped(readable, presetLocale, grouping) ? typed() : current;
    editing = false;
    const base = from !== null && Number.isFinite(from) ? from : 0;
    // Digits kept without a precision are as many as the number and the step have, so a step adds no binary noise.
    let next = round(base + direction * steps * stride, free ? Math.min(valueDigits, Math.max(decimalsOf(base), decimalsOf(stride))) : valueDigits);
    if (lowest !== null) next = Math.max(next, lowest);
    if (highest !== null) next = Math.min(next, highest);
    commit(next);
  }

  // Captured on the control, so Ark's own key handling, which would step its draft without a commit, never runs.
  function onKey(e: KeyboardEvent) {
    if (e.target !== input || e.isComposing) return;
    const stepping = STEP_KEYS[e.key];
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTyped();
    } else if (stepping) {
      e.preventDefault();
      stepBy(...stepping);
    }
  }

  // Ark's own props for the input, less the two it would act on itself. Its key handling would step or commit its draft
  // without the element (Enter, the arrows, and Home and End, which jump to min and max where they should move the
  // caret), so it is not wired; the element handles those keys on the control. Its focusout rewrites the input with
  // what it parsed, which for refused text is not what was typed, so it hears only text that reads. Nothing is stopped:
  // the page hears every key and focusout as from any input.
  const inputProps = $derived.by(() => {
    type Handler = ((e: Event) => void) | undefined;
    const { onkeydown: _keys, onfocusout, oninput, ...rest } = api().getInputProps() as Record<string, unknown>;
    return {
      ...rest,
      onfocusout(e: FocusEvent) {
        if (!unparsed) (onfocusout as Handler)?.(e);
      },
      oninput(e: Event) {
        draft = (e.currentTarget as HTMLInputElement).value;
        editing = true;
        (oninput as Handler)?.(e);
      },
    };
  });

  const atMin = $derived(current !== null && lowest !== null && current <= lowest);
  const atMax = $derived(current !== null && highest !== null && current >= highest);
</script>

{#snippet chevron(d: string)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path {d} /></svg>
{/snippet}

<KitStyles />
<div class="af-kit">
  {#if described}<span id="af-described" hidden>{described}</span>{/if}
  <NumberInput.RootProvider value={api}>
    <NumberInput.Control part="control" data-steppers={steppers ? '' : undefined} onkeydowncapture={onKey}>
      <input
        {...inputProps}
        bind:this={input}
        part="input"
        value={draft}
        placeholder={placeholder || undefined}
        aria-label={label || placeholder || undefined}
        aria-describedby={described ? 'af-described' : undefined}
        aria-invalid={invalid || unparsed ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-valuenow={current ?? undefined}
        aria-valuemin={lowest ?? undefined}
        aria-valuemax={highest ?? undefined}
        aria-valuetext={draft || undefined}
        onblur={commitTyped}
      />
      {#if steppers}
        <!-- A press keeps focus in the input, so typed text is stepped from rather than committed by a blur first. -->
        <button type="button" part="decrement" class="af-button ghost icon xs" tabindex="-1" aria-label={text.decrease} aria-controls={inputId}
          disabled={locked || !!readonly || atMin} onmousedown={(e) => e.preventDefault()} onclick={() => stepBy(-1)}>{@render chevron('m6 9 6 6 6-6')}</button>
        <button type="button" part="increment" class="af-button ghost icon xs" tabindex="-1" aria-label={text.increase} aria-controls={inputId}
          disabled={locked || !!readonly || atMax} onmousedown={(e) => e.preventDefault()} onclick={() => stepBy(1)}>{@render chevron('m18 15-6-6-6 6')}</button>
      {/if}
    </NumberInput.Control>
  </NumberInput.RootProvider>
</div>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The field is AgentFlow's Input: the control is the bordered box and the input inside it is bare, so the box rings
    when the text in it has focus, and turns to the danger tone when `invalid` is set, as the Input does.
  - The steppers sit inside the control's end, where the box gives up its end padding to them.
  - Forced colours drop box-shadow, so a focused field falls back to an outline.
-->
<style>
  :host { display: inline-block; max-width: 100%; vertical-align: middle; }
  :global([data-scope='number-input'][data-part='root']) { display: block; }
  :global([data-scope='number-input'][data-part='control']) { display: flex; align-items: center; box-sizing: border-box; width: 100%; height: 36px;
    padding: 4px 12px; border: 1px solid var(--k-input); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 16px; line-height: 24px;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  @media (min-width: 48rem) { :global([data-scope='number-input'][data-part='control']) { font-size: 14px; line-height: 20px; } }
  :global([data-scope='number-input'][data-part='control'][data-steppers]) { padding-right: 4px; }
  :global([data-scope='number-input'][data-part='control']:has(input:focus-visible)) { border-color: var(--k-focus-border);
    box-shadow: 0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  :global([data-scope='number-input'][data-part='control']:has(input[aria-invalid='true'])) { border-color: var(--k-danger); }
  :global([data-scope='number-input'][data-part='control']:has(input[aria-invalid='true']:focus-visible)) {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  :global([data-scope='number-input'][data-part='control'][data-disabled]) { opacity: 0.5; cursor: not-allowed; }
  :global([data-scope='number-input'][data-part='input']) { flex: 1; min-width: 0; width: 8em; height: 100%; padding: 0; border: 0; outline: none;
    background: transparent; color: inherit; font: inherit; }
  :global([data-scope='number-input'][data-part='input']::placeholder) { color: var(--k-muted); opacity: 1; }
  :global([data-scope='number-input'][data-part='input']::selection) { background: var(--k-primary); color: var(--k-primary-fg); }
  :global([data-scope='number-input'][data-part='input']:disabled) { pointer-events: none; cursor: not-allowed; }
  .af-button { flex: none; }
  @media (prefers-reduced-motion: reduce) { :global([data-scope='number-input'][data-part='control']) { transition: none; } }
  @media (forced-colors: active) {
    :global([data-scope='number-input'][data-part='control']:has(input:focus-visible)) { outline: 2px solid; outline-offset: 2px; }
  }
</style>
