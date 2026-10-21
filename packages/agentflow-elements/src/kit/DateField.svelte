<svelte:options customElement={{ shadow: 'open', props: { value: { attribute: 'value', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, min: { attribute: 'min', type: 'String' }, max: { attribute: 'max', type: 'String' }, clearable: { attribute: 'clearable', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean' }, strings: { type: 'Object' } } }} />

<script module lang="ts">
  const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
  const DMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const pad = (n: number) => String(n).padStart(2, '0');

  function isoOf(year: number, month: number, day: number): string | null {
    const probe = new Date(Date.UTC(2000, month - 1, day));
    probe.setUTCFullYear(year);
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
    return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
  }

  function validIso(text: string | null | undefined): string | null {
    const m = ISO.exec(text ?? '');
    return m ? isoOf(Number(m[1]), Number(m[2]), Number(m[3])) : null;
  }

  function parseText(text: string): string | null {
    const trimmed = text.trim();
    const dmy = DMY.exec(trimmed);
    return dmy ? isoOf(Number(dmy[3]), Number(dmy[2]), Number(dmy[1])) : validIso(trimmed);
  }

  const isVi = (locale: string | null | undefined) => /^vi(-|$)/i.test(locale ?? '');

  function formatIso(iso: string, locale: string | null | undefined): string {
    const vi = isVi(locale);
    const options: Intl.DateTimeFormatOptions = vi
      ? { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }
      : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' };
    return new Intl.DateTimeFormat(vi ? 'vi-VN' : 'en-GB', options).format(new Date(`${iso}T00:00:00Z`));
  }

  function todayIso(): string {
    const now = new Date();
    return `${String(now.getFullYear()).padStart(4, '0')}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
</script>

<script lang="ts">
  import { DatePicker, parseDate } from '@ark-ui/svelte/date-picker';
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';

  let {
    value = null, locale = null, min = null, max = null, clearable = false, placeholder = null, label = null, disabled = false, strings = null,
  }: {
    value?: string | null; locale?: string | null; min?: string | null; max?: string | null; clearable?: boolean | null;
    placeholder?: string | null; label?: string | null; disabled?: boolean | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  const zagLocale = $derived(isVi(locale) ? 'vi-VN' : 'en-GB');
  const current = $derived(validIso(value));
  const lowest = $derived(validIso(min));
  const highest = $derived(validIso(max));
  const shown = $derived(current ? formatIso(current, locale) : '');
  const stranded = $derived(current !== null && ((lowest !== null && current < lowest) || (highest !== null && current > highest)));
  // Zag clamps a value outside min and max and rewrites the input with the clamped date, so it is never handed one.
  const selection = $derived(current && !stranded ? [parseDate(current)] : []);
  const viewName = (view: string) => (view === 'month' ? text.viewMonth : view === 'year' ? text.viewYear : text.viewDay);
  let open = $state(false);
  let positioner = $state<HTMLElement | null>(null);
  let input = $state<HTMLInputElement | null>(null);
  let dirty = false;
  $effect(() => raise(positioner, open, self));

  const outside = (iso: string) => (lowest !== null && iso < lowest) || (highest !== null && iso > highest);

  // Zag clamps a date outside min and max instead of refusing it, so the range is checked here, before any event.
  function commit(next: string | null): boolean {
    if (next !== null && outside(next)) return false;
    if (next !== current) emit(self, 'change', { value: next });
    return true;
  }

  function commitTyped() {
    if (!input || !dirty) return;
    dirty = false;
    const typed = input.value.trim();
    const next = typed === '' ? (clearable ? null : undefined) : (parseText(typed) ?? undefined);
    if (next !== undefined && next !== current) commit(next);
    input.value = shown;
  }

  function closeCalendar(api: () => { setOpen(open: boolean): void }) {
    api().setOpen(false);
    self.shadowRoot?.querySelector<HTMLElement>('[part="trigger"]')?.focus();
  }
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit">
    <DatePicker.Root
      bind:value={() => selection, () => {}}
      locale={zagLocale}
      selectionMode="single"
      min={lowest ? parseDate(lowest) : undefined}
      max={highest ? parseDate(highest) : undefined}
      disabled={!!disabled}
      fixedWeeks
      positioning={{ strategy: 'fixed', placement: 'bottom-start' }}
      format={(date) => formatIso(date.toString(), locale)}
      translations={{
        trigger: (isOpen) => (isOpen ? text.closeCalendar : text.openCalendar),
        content: text.calendar,
        clearTrigger: text.clear,
        dayCell: (state) => fill(state.selected ? text.selectedDate : text.chooseDate, { date: state.valueText }),
        viewTrigger: (view, next) => fill(next ? text.switchView : text.currentView, { view: viewName(next ?? view) }),
        prevTrigger: (view) => (view === 'day' ? text.previousMonth : view === 'month' ? text.previousYear : text.previousDecade),
        nextTrigger: (view) => (view === 'day' ? text.nextMonth : view === 'month' ? text.nextYear : text.nextDecade),
      }}
      onValueChange={(d) => commit(d.value[0]?.toString() ?? null)}
      onOpenChange={(d) => (open = d.open)}
    >
      <DatePicker.Control part="control">
        <input
          bind:this={input}
          part="input"
          data-scope="date-picker"
          data-part={stranded ? undefined : 'input'}
          autocomplete="off"
          spellcheck="false"
          value={shown}
          placeholder={placeholder || 'dd/mm/yyyy'}
          aria-label={label || placeholder || undefined}
          disabled={!!disabled}
          onkeydown={(e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); commitTyped(); } }}
          oninput={() => (dirty = true)}
          onblur={commitTyped}
        />
        <DatePicker.Trigger part="trigger" class="af-button ghost">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
          </svg>
        </DatePicker.Trigger>
      </DatePicker.Control>
      <DatePicker.Positioner bind:ref={positioner} popover="manual">
        <DatePicker.Content class="af-overlay date" part="content">
          <DatePicker.Context>
            {#snippet render(api)}
              <DatePicker.View view="day">
                <DatePicker.ViewControl>
                  <DatePicker.PrevTrigger class="af-button ghost">‹</DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger class="af-button ghost"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger class="af-button ghost">›</DatePicker.NextTrigger>
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
                  <DatePicker.PrevTrigger class="af-button ghost">‹</DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger class="af-button ghost"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger class="af-button ghost">›</DatePicker.NextTrigger>
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
                  <DatePicker.PrevTrigger class="af-button ghost">‹</DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger class="af-button ghost"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger class="af-button ghost">›</DatePicker.NextTrigger>
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
                <button type="button" part="today" class="af-button ghost" disabled={outside(todayIso())}
                  onclick={() => { if (commit(todayIso())) closeCalendar(api); }}>{text.today}</button>
                {#if clearable}
                  <!-- Zag hides Clear and sees no change when it clears the empty selection it was given for a stored date outside min and max. -->
                  <DatePicker.ClearTrigger part="clear" class="af-button ghost" {...(stranded ? { hidden: false } : {})}
                    onclick={() => { if (stranded) commit(null); closeCalendar(api); }}>{text.clear}</DatePicker.ClearTrigger>
                {/if}
              </footer>
            {/snippet}
          </DatePicker.Context>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </DatePicker.Root>
  </div>
</EnvironmentProvider>

<style>
  :host { display: inline-block; max-width: 100%; vertical-align: middle; }
  input { flex: 1; min-width: 0; width: 8.5em; border: 0; outline: none; background: transparent; color: inherit; font: inherit; }
  input::placeholder { color: var(--k-muted); }
  footer { display: flex; justify-content: space-between; gap: 8px; margin-top: 4px; }
  :global([data-scope='date-picker'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='date-picker'][hidden]) { display: none !important; }
  :global([data-scope='date-picker'][data-part='control']) { display: flex; align-items: center; gap: 2px; box-sizing: border-box; width: 100%; min-height: 32px; padding: 0 2px 0 10px;
    border: 1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%); border-radius: max(0px, calc(var(--k-radius) - 2px)); background: var(--k-surface); }
  :global([data-scope='date-picker'][data-part='control']:focus-within) { outline: 2px solid var(--k-ring); outline-offset: 2px; }
  :global([data-scope='date-picker'][data-part='content']) { padding: 8px; }
  :global([data-scope='date-picker'][data-part='content']:focus-visible) { outline: 2px solid var(--k-ring); outline-offset: 2px; }
  :global([data-scope='date-picker'][data-part='view-control']) { display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px; }
  :global([data-scope='date-picker'][data-part='range-text']) { font-weight: 600; }
  :global([data-scope='date-picker'][data-part='table']) { border-collapse: collapse; }
  :global([data-scope='date-picker'][data-part='table-header']) { padding: 4px 0; color: var(--k-muted); font-size: 12px; font-weight: 500; }
  :global([data-scope='date-picker'][data-part='table-cell']) { padding: 1px; text-align: center; }
  :global([data-scope='date-picker'][data-part='table-cell-trigger']) { display: inline-grid; place-items: center; min-width: 32px; min-height: 32px; padding: 0 4px; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month']), :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year']) { min-width: 56px; }
  :global([data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled])) { background: color-mix(in oklab, var(--k-primary) 10%, transparent); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible) { outline: 2px solid var(--k-ring); outline-offset: 1px; }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-today]) { box-shadow: inset 0 0 0 1px var(--k-primary); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-selected]) { background: var(--k-primary); color: var(--k-primary-fg); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range]) { color: var(--k-muted); }
  :global([data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled]) { opacity: 0.4; cursor: not-allowed; }
</style>
