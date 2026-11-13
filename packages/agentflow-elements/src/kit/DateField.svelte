<svelte:options customElement={{ shadow: { mode: 'open', delegatesFocus: true }, extend: formAssociate, props: { value: { attribute: 'value', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, min: { attribute: 'min', type: 'String' }, max: { attribute: 'max', type: 'String' }, clearable: { attribute: 'clearable', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' }, range: { attribute: 'range', type: 'Boolean' }, start: { attribute: 'start', type: 'String' }, end: { attribute: 'end', type: 'String' }, format: { attribute: 'format', type: 'String' } } }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';
  import { isVi } from './text.js';
</script>

<script lang="ts">
  import { DatePicker, parseDate, useDatePicker, type DateValue } from '@ark-ui/svelte/date-picker';
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { formatDate, formatMasked, isDateMask, parseDateInput, parseMasked, todayIsoDate, validIsoDate } from '@reflexify/agentflow-sdk';
  import Direction from './Direction.svelte';
  import KitStyles from './KitStyles.svelte';
  import { directionOf, emit, raise } from './environment.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import { fill, kitText, orEnglish } from './text.js';
  import type { KitStrings } from './index.js';

  let {
    value = null, locale = null, min = null, max = null, clearable = false, placeholder = null, label = null, disabled = false, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false,
    range = false, start = null, end = null, format = null,
  }: {
    value?: string | null; locale?: string | null; min?: string | null; max?: string | null; clearable?: boolean | null;
    placeholder?: string | null; label?: string | null; disabled?: boolean | null; strings?: Partial<KitStrings> | null;
    name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null; invalid?: boolean | null;
    range?: boolean | null; start?: string | null; end?: string | null; format?: string | null;
  } = $props();
  const self = $host();
  const dir = directionOf(self);
  const text = $derived(kitText(locale, strings ?? undefined));
  const zagLocale = $derived(isVi(locale) ? 'vi-VN' : 'en-GB');
  const current = $derived(validIsoDate(value));
  const lowest = $derived(validIsoDate(min));
  const highest = $derived(validIsoDate(max));
  // A mask it cannot read, and range mode, leave the element as it is without one.
  const mask = $derived(!range && isDateMask(format) ? format : null);
  const write = (iso: string) => (mask ? (formatMasked(iso, mask) ?? '') : formatDate(iso, locale));
  const readTyped = (typed: string) => (mask ? parseMasked(typed, mask) : null) ?? validIsoDate(typed.trim());
  const shown = $derived(current ? write(current) : '');
  // Masked text that does not parse stays in the input, marked, until a commit or a new value replaces it.
  let unparsed = $state(false);
  $effect(() => {
    void shown;
    void mask;
    unparsed = false;
  });
  $effect(() => {
    self.toggleAttribute('data-unparsed', unparsed);
  });
  const stranded = $derived(current !== null && ((lowest !== null && current < lowest) || (highest !== null && current > highest)));
  // Zag clamps a value outside min and max and rewrites the input with the clamped date, so it is never handed one.
  const singleSelection = $derived(current && !stranded ? [parseDate(current)] : []);

  // In range mode `value` is ignored: the two ends are `start` and `end`, and either may be null, an open end.
  const first = $derived(validIsoDate(start));
  const last = $derived(validIsoDate(end));
  const shownFirst = $derived(first ? formatDate(first, locale) : '');
  const shownLast = $derived(last ? formatDate(last, locale) : '');
  const firstOut = $derived(first !== null && outside(first));
  const lastOut = $derived(last !== null && outside(last));
  const rangeStranded = $derived(firstOut || lastOut);
  // The calendar picks a start and then an end, but the element emits only once both are chosen; until then the half
  // range is held here, so the calendar shows the chosen start while the page still holds the old range.
  let draft = $state<DateValue[] | null>(null);
  const rangeSelection = $derived(
    draft ?? (rangeStranded ? [] : first && last ? [parseDate(first), parseDate(last)] : first ? [parseDate(first)] : []),
  );
  const selection = $derived(range ? rangeSelection : singleSelection);
  // Zag hides Clear while its selection is empty, which a stored range it was never handed (an end alone, or an end
  // outside min and max) leaves it.
  const clearForced = $derived(range ? first !== null || last !== null : stranded);
  const viewName = (view: string) => (view === 'month' ? text.viewMonth : view === 'year' ? text.viewYear : text.viewDay);
  let open = $state(false);
  let positioner = $state<HTMLElement | null>(null);
  let input = $state<HTMLInputElement | null>(null);
  let firstInput = $state<HTMLInputElement | null>(null);
  let lastInput = $state<HTMLInputElement | null>(null);
  let dirty = false;
  const dirtyEnd = { start: false, end: false };
  $effect(() => raise(positioner, open, self));

  // An ancestor <fieldset disabled> disables the control without touching its own `disabled`.
  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const described = $derived([description, error].filter(Boolean).join(' '));
  const below = (iso: string | null) => iso !== null && lowest !== null && iso < lowest;
  const above = (iso: string | null) => iso !== null && highest !== null && iso > highest;
  const validity = $derived(
    range
      ? required && first === null && last === null ? { valueMissing: true }
        : below(first) || below(last) ? { rangeUnderflow: true }
        : above(first) || above(last) ? { rangeOverflow: true }
        : {}
      : unparsed ? { badInput: true }
        : required && current === null ? { valueMissing: true }
        : below(current) ? { rangeUnderflow: true }
        : above(current) ? { rangeOverflow: true }
        : {},
  );
  const message = $derived(
    'badInput' in validity ? fill(orEnglish(text, 'badDate'), { format: mask ?? '' })
    : 'valueMissing' in validity ? orEnglish(text, 'valueMissing')
    : 'rangeUnderflow' in validity ? fill(orEnglish(text, 'rangeUnderflow'), { min: formatDate(lowest!, locale) })
    : 'rangeOverflow' in validity ? fill(orEnglish(text, 'rangeOverflow'), { max: formatDate(highest!, locale) })
    : '',
  );
  // `name`, `disabled` and `readonly` reflect to their attributes: the browser reads the host's attributes, not its
  // properties, to submit a string value, to leave a disabled control out, and to bar a read-only one from validation.
  const formValue = $derived(range ? (first === null && last === null ? null : `${first ?? ''}/${last ?? ''}`) : current);
  // The browser points at the input that holds the problem: the end when only the end is out of bounds.
  const anchor = $derived(range ? (!firstOut && lastOut ? lastInput : firstInput) : input);
  $effect(() => writeForm(self, { name, value: formValue, validity, message, anchor }));
  // A controlled element cannot reset itself, so a form's reset asks the page for the value it was written with.
  onFormEvents(self, {
    reset() {
      if (range) {
        const initial = { start: validIsoDate(self.getAttribute('start')), end: validIsoDate(self.getAttribute('end')) };
        if (initial.start !== first || initial.end !== last) emit(self, 'change', initial);
        return;
      }
      const initial = validIsoDate(self.getAttribute('value'));
      if (initial !== current) emit(self, 'change', { value: initial });
    },
    disabled(next) { formDisabled = next; },
  });

  function outside(iso: string) { return (lowest !== null && iso < lowest) || (highest !== null && iso > highest); }

  // Zag clamps a date outside min and max instead of refusing it, so the range is checked here, before any event.
  // After a refusal the page hears the commit even when it keeps the value: the page may hold the refused text.
  function commit(next: string | null): boolean {
    const refused = next !== null && outside(next);
    if (refused ? unparsed : next !== current || unparsed) emit(self, 'change', { value: refused ? current : next });
    if (refused) return false;
    if (unparsed && input) input.value = shown;
    unparsed = false;
    return true;
  }

  function commitTyped() {
    if (!input || !dirty) return;
    dirty = false;
    const typed = input.value.trim();
    // A masked input commits an empty value without `clearable`, and keeps text it cannot read, marked.
    if (mask) {
      const read = typed === '' ? null : readTyped(typed);
      if (typed !== '' && read === null) {
        unparsed = true;
        emit(self, 'unparsed', { text: input.value });
        return;
      }
      commit(read);
      unparsed = false;
      input.value = shown;
      return;
    }
    const next = typed === '' ? (clearable ? null : undefined) : (parseDateInput(typed) ?? undefined);
    if (next !== undefined && next !== current) commit(next);
    input.value = shown;
  }

  // A changed end outside min and max, or an end before the start, is refused. An end the page already holds is not
  // checked again, so the other end can still be corrected while one sits outside the bounds.
  function commitRange(nextFirst: string | null, nextLast: string | null): boolean {
    if (nextFirst !== null && nextFirst !== first && outside(nextFirst)) return false;
    if (nextLast !== null && nextLast !== last && outside(nextLast)) return false;
    if (nextFirst !== null && nextLast !== null && nextLast < nextFirst) return false;
    if (nextFirst !== first || nextLast !== last) emit(self, 'change', { start: nextFirst, end: nextLast });
    return true;
  }

  function commitTypedEnd(which: 'start' | 'end') {
    const el = which === 'start' ? firstInput : lastInput;
    if (!el || !dirtyEnd[which]) return;
    dirtyEnd[which] = false;
    const typed = el.value.trim();
    // An emptied input is an open end, so range mode needs no `clearable` to empty one.
    const next = typed === '' ? null : parseDateInput(typed);
    if (typed === '' || next !== null) {
      if (which === 'start') commitRange(next, last);
      else commitRange(first, next);
    }
    el.value = which === 'start' ? shownFirst : shownLast;
  }

  // Zag reports the half range after the first pick and the whole one after the second; only the whole one is emitted.
  // An emptied selection is ignored: Clear emits on its own click, as Zag sees no change when it clears a stored range
  // it was never handed.
  function pickRange(dates: DateValue[]) {
    const [a, b] = dates;
    if (!a) return;
    if (!b) {
      draft = [a];
      return;
    }
    draft = null;
    commitRange(a.toString(), b.toString());
  }

  // In range mode Today brings today's day into view and onto focus; the person picks it as a start or an end.
  function showToday(api: () => { setFocusedValue(value: DateValue): void }) {
    const today = todayIsoDate();
    api().setFocusedValue(parseDate(today));
    requestAnimationFrame(() =>
      self.shadowRoot?.querySelector<HTMLElement>(`[data-part="table-cell-trigger"][data-view="day"][data-value="${today}"]`)?.focus(),
    );
  }

  function closeCalendar(api: () => { setOpen(open: boolean): void }) {
    api().setOpen(false);
    self.shadowRoot?.querySelector<HTMLElement>('[part="trigger"]')?.focus();
  }

  const id = $props.id();
  const picker = useDatePicker(() => ({
    id,
    dir,
    getRootNode: () => self.shadowRoot!,
    value: selection,
    locale: zagLocale,
    selectionMode: range ? ('range' as const) : ('single' as const),
    min: lowest ? parseDate(lowest) : undefined,
    max: highest ? parseDate(highest) : undefined,
    disabled: locked,
    readOnly: !!readonly,
    fixedWeeks: true,
    positioning: { strategy: 'fixed' as const, placement: 'bottom-start' as const },
    format: (date: DateValue) => write(date.toString()),
    translations: {
      trigger: (isOpen: boolean) => (isOpen ? text.closeCalendar : text.openCalendar),
      content: text.calendar,
      clearTrigger: text.clear,
      dayCell: (state: { selected: boolean; valueText: string }) => fill(state.selected ? text.selectedDate : text.chooseDate, { date: state.valueText }),
      viewTrigger: (view: string, next?: string) => fill(next ? text.switchView : text.currentView, { view: viewName(next ?? view) }),
      prevTrigger: (view: string) => (view === 'day' ? text.previousMonth : view === 'month' ? text.previousYear : text.previousDecade),
      nextTrigger: (view: string) => (view === 'day' ? text.nextMonth : view === 'month' ? text.nextYear : text.nextDecade),
    },
    onValueChange: (d: { value: DateValue[] }) => (range ? pickRange(d.value) : commit(d.value[0]?.toString() ?? null)),
    onOpenChange: (d: { open: boolean }) => {
      open = d.open;
      if (!d.open) draft = null;
      // A masked date typed and not yet committed is where the person means to look.
      else if (mask && input) {
        const typed = readTyped(input.value);
        if (typed) picker().setFocusedValue(parseDate(typed));
      }
    },
  }));
</script>

{#snippet chevron(d: string)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path {d} /></svg>
{/snippet}

{#snippet rangeInput(which: 'start' | 'end')}
  <input
    bind:this={() => (which === 'start' ? firstInput : lastInput), (el) => { if (which === 'start') firstInput = el; else lastInput = el; }}
    part="input {which}"
    data-scope="date-picker"
    data-part={rangeStranded ? undefined : 'input'}
    autocomplete="off"
    spellcheck="false"
    value={which === 'start' ? shownFirst : shownLast}
    placeholder={placeholder || 'dd/mm/yyyy'}
    aria-label={label ? `${label}: ${which === 'start' ? text.rangeStart : text.rangeEnd}` : which === 'start' ? text.rangeStart : text.rangeEnd}
    aria-describedby={described ? 'af-described' : undefined}
    aria-invalid={invalid ? 'true' : undefined}
    aria-required={required ? 'true' : undefined}
    readonly={!!readonly}
    disabled={locked}
    onkeydown={(e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); commitTypedEnd(which); } }}
    oninput={() => (dirtyEnd[which] = true)}
    onblur={() => commitTypedEnd(which)}
  />
{/snippet}

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
<Direction {dir}>
  <div class="af-kit">
    {#if described}<span id="af-described" hidden>{described}</span>{/if}
    <DatePicker.RootProvider value={picker}>
      <DatePicker.Control part="control" class={range ? 'range' : undefined}>
        {#if range}
          {@render rangeInput('start')}
          <span part="separator" class="separator" aria-hidden="true">–</span>
          {@render rangeInput('end')}
        {:else}
        <input
          bind:this={input}
          part="input"
          data-scope="date-picker"
          data-part={stranded ? undefined : 'input'}
          autocomplete="off"
          spellcheck="false"
          value={shown}
          placeholder={placeholder || mask || 'dd/mm/yyyy'}
          aria-label={label || placeholder || undefined}
          aria-describedby={described ? 'af-described' : undefined}
          aria-invalid={invalid || unparsed ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          readonly={!!readonly}
          disabled={locked}
          onkeydown={(e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); commitTyped(); } }}
          oninput={() => (dirty = true)}
          onblur={commitTyped}
        />
        {/if}
        <DatePicker.Trigger part="trigger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
          </svg>
        </DatePicker.Trigger>
      </DatePicker.Control>
      <DatePicker.Positioner bind:ref={positioner} popover="manual">
        <DatePicker.Content class="af-overlay date" part="content">
          <DatePicker.Context>
            {#snippet render(api)}
              <DatePicker.View view="day">
                <DatePicker.ViewControl>
                  <DatePicker.PrevTrigger class="af-button ghost icon sm">{@render chevron("m15 18-6-6 6-6")}</DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger class="af-button ghost sm"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger class="af-button ghost icon sm">{@render chevron("m9 18 6-6-6-6")}</DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table>
                  <DatePicker.TableHead>
                    <DatePicker.TableRow>
                      {#each api().weekDays as weekDay, i (i)}
                        <DatePicker.TableHeader>{weekDay.narrow}</DatePicker.TableHeader>
                      {/each}
                    </DatePicker.TableRow>
                  </DatePicker.TableHead>
                  <DatePicker.TableBody>
                    {#each api().weeks as _, w (w)}
                      <DatePicker.TableRow>
                        {#each api().getDaysInWeek(w) as day (day.toString())}
                          <DatePicker.TableCell value={day}>
                            <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        {/each}
                      </DatePicker.TableRow>
                    {/each}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </DatePicker.View>
              <DatePicker.View view="month">
                <DatePicker.ViewControl>
                  <DatePicker.PrevTrigger class="af-button ghost icon sm">{@render chevron("m15 18-6-6 6-6")}</DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger class="af-button ghost sm"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger class="af-button ghost icon sm">{@render chevron("m9 18 6-6-6-6")}</DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table>
                  <DatePicker.TableBody>
                    {#each api().getMonthsGrid({ columns: 4, format: 'short' }) as months, r (r)}
                      <DatePicker.TableRow>
                        {#each months as month (month.value)}
                          <DatePicker.TableCell value={month.value}>
                            <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        {/each}
                      </DatePicker.TableRow>
                    {/each}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </DatePicker.View>
              <DatePicker.View view="year">
                <DatePicker.ViewControl>
                  <DatePicker.PrevTrigger class="af-button ghost icon sm">{@render chevron("m15 18-6-6 6-6")}</DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger class="af-button ghost sm"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger class="af-button ghost icon sm">{@render chevron("m9 18 6-6-6-6")}</DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table>
                  <DatePicker.TableBody>
                    {#each api().getYearsGrid({ columns: 4 }) as years, r (r)}
                      <DatePicker.TableRow>
                        {#each years as year (year.value)}
                          <DatePicker.TableCell value={year.value}>
                            <DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        {/each}
                      </DatePicker.TableRow>
                    {/each}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </DatePicker.View>
              <footer>
                <button type="button" part="today" class="af-button ghost sm" disabled={outside(todayIsoDate())}
                  onclick={() => { if (range) showToday(api); else if (commit(todayIsoDate())) closeCalendar(api); }}>{text.today}</button>
                {#if clearable}
                  <!-- Zag hides Clear and sees no change when it clears the empty selection it was given for a stored date outside min and max. -->
                  <DatePicker.ClearTrigger part="clear" class="af-button ghost sm" {...(clearForced ? { hidden: false } : {})}
                    onclick={() => { if (range) commitRange(null, null); else if (stranded) commit(null); closeCalendar(api); }}>{text.clear}</DatePicker.ClearTrigger>
                {/if}
              </footer>
            {/snippet}
          </DatePicker.Context>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </DatePicker.RootProvider>
  </div>
</Direction>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The field is AgentFlow's MaskedDateInput: an Input with the calendar button inside its end, which rings when the
    text in it has focus, as the Input does.
  - AgentFlow draws this button in Tailwind's neutral greys, which no token holds; the muted tokens stand in for
    them.
  - The calendar is AgentFlow's Calendar in its popover: 12px in, the month between its arrows, and 32px days.
  - AgentFlow's arrows keep the inline padding of a button with an icon, around an icon that overflows it evenly.
  - In range mode each input is a field of its own, drawn as the single field is, and the control around them only
    lays them out, with no transition of its own: an input would inherit its colour mid-transition; the calendar button sits inside the end field's end. A day between the two ends is AgentFlow's
    range middle: square, in the accent colour.
  - Forced colours drop box-shadow and backgrounds: focus (the field, its button, a day or the calendar itself) falls back to an outline, the chosen day is painted in the
    system's highlight, and today keeps an edge.
-->
<style>
  :host { display: inline-block; max-width: 100%; vertical-align: middle; }
  input { flex: 1; min-width: 0; width: 8.5em; padding: 0; border: 0; outline: none; background: transparent; color: inherit; font: inherit; }
  input::placeholder { color: var(--k-muted); opacity: 1; }
  .separator { flex: none; color: var(--k-muted); }
  footer { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; }
  :global([data-scope='date-picker'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='date-picker'][hidden]) { display: none !important; }
  :global([data-scope='date-picker'][data-part='control']) { position: relative; display: flex; align-items: center; box-sizing: border-box; width: 100%; height: 36px;
    padding: 4px 36px 4px 12px; border: 1px solid var(--k-input); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 16px; line-height: 24px;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  @media (min-width: 48rem) { :global([data-scope='date-picker'][data-part='control']) { font-size: 14px; line-height: 20px; } }
  :global([data-scope='date-picker'][data-part='control']:has(input:focus-visible)) { border-color: var(--k-focus-border);
    box-shadow: 0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  :global([data-scope='date-picker'][data-part='control'][data-disabled]) { opacity: 0.5; cursor: not-allowed; }
  :global([data-scope='date-picker'][data-part='control'].range) { gap: 8px; height: auto; padding: 0; border: 0; border-radius: 0; background: none; box-shadow: none;
    transition: none; }
  :global([data-scope='date-picker'][data-part='control'].range:has(input:focus-visible)) { box-shadow: none; }
  :global([data-scope='date-picker'][data-part='control'].range) input { box-sizing: border-box; flex: 1 1 auto; width: calc(8.5em + 26px); height: 36px; min-height: 0;
    padding: 4px 12px; border: 1px solid var(--k-input); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  :global([data-scope='date-picker'][data-part='control'].range) input:last-of-type { width: calc(8.5em + 50px); padding-right: 36px; }
  :global([data-scope='date-picker'][data-part='control'].range) input:focus-visible { border-color: var(--k-focus-border);
    box-shadow: 0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  :global([data-scope='date-picker'][data-part='trigger']) { position: absolute; top: 50%; right: 4px; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0;
    border: 0 solid var(--k-line); border-radius: 4px; background: transparent; color: var(--k-muted); outline: none; cursor: pointer; transform: translateY(-50%); }
  :global([data-scope='date-picker'][data-part='trigger']) svg { width: 14px; height: 14px; pointer-events: none; }
  @media (hover: hover) { :global([data-scope='date-picker'][data-part='trigger']:not(:disabled):hover) { background-color: var(--k-muted-bg); color: color-mix(in oklab, var(--k-fg) 55%, var(--k-muted)); } }
  :global([data-scope='date-picker'][data-part='trigger']:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([data-scope='date-picker'][data-part='trigger']:disabled) { opacity: 0.5; pointer-events: none; }
  :global([data-scope='date-picker'][data-part='content']) { padding: 12px; outline: none; }
  :global(.af-button.icon[data-scope='date-picker'][data-part='prev-trigger']), :global(.af-button.icon[data-scope='date-picker'][data-part='next-trigger']) { padding-inline: 12px; }
  :global([data-scope='date-picker'][data-part='view-control']) { display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 16px; }
  :global([data-scope='date-picker'][data-part='table']) { border-collapse: collapse; }
  :global([data-scope='date-picker'][data-part='table-header']) { padding: 0; color: var(--k-muted); font-size: 0.8rem; font-weight: 400; }
  :global([data-scope='date-picker'][data-part='table-cell']) { padding: 8px 0 0; text-align: center; }
  :global([data-scope='date-picker'][data-part='table-cell-trigger']) { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
    width: 32px; height: 32px; padding: 0; border: 0 solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 2px)); background: transparent;
    color: inherit; outline: none; font: inherit; font-size: 14px; font-weight: 400; line-height: 1; cursor: pointer; -webkit-user-select: none; user-select: none;
    transition: background-color 100ms cubic-bezier(0.2, 0, 0, 1), color 100ms cubic-bezier(0.2, 0, 0, 1), box-shadow 100ms cubic-bezier(0.2, 0, 0, 1); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month']), :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year']) { width: auto; min-width: 56px; padding: 0 8px; }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-today]) { background-color: var(--k-accent); color: var(--k-accent-fg); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range]) { color: var(--k-muted); }
  @media (hover: hover) {
    :global([data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled], [data-selected])) {
      background-color: color-mix(in oklab, var(--k-accent) calc(100% - var(--k-dark, 0) * 50%), transparent); color: var(--k-accent-fg); }
  }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected])) { border-radius: 0; background-color: var(--k-accent); color: var(--k-accent-fg); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-selected]) { background-color: var(--k-primary); color: var(--k-primary-fg); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible) { border-color: var(--k-focus-border); box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled]:not([data-outside-range])) { opacity: 0.5; color: var(--k-muted); cursor: not-allowed; }
  @media (prefers-reduced-motion: reduce) { :global([data-scope='date-picker'][data-part='control']) input, :global([data-scope='date-picker'][data-part='control']), :global([data-scope='date-picker'][data-part='table-cell-trigger']) { transition: none; } }
  @media (forced-colors: active) {
    :global([data-scope='date-picker'][data-part='control']:has(input:focus-visible)), :global([data-scope='date-picker'][data-part='trigger']:focus-visible),
    :global([data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible),
    :global([data-scope='date-picker'][data-part='content']:focus-visible),
    :global([data-scope='date-picker'][data-part='control'].range) input:focus-visible { outline: 2px solid; outline-offset: 2px; }
    :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected])) { border: 1px dashed CanvasText; }
    :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-selected]) { forced-color-adjust: none; background-color: Highlight; color: HighlightText; }
    :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-today]:not([data-selected])) { border: 1px solid CanvasText; }
  }
</style>
