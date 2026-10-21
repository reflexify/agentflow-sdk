// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeskError } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { createSeed, DEMO_PEOPLE } from '../../src/api/seed.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
  window.history.pushState({}, '', '/autopilot');
});
afterEach(() => vi.useRealTimers());

const row = (intent: string) => screen.getByRole('row', { name: new RegExp(`^${intent}`) });
const rule = (fake: ReturnType<typeof createFakeDesk>, intent: string) => fake.server.records('autopilot_rule').find((x) => x.body.intent === intent);

describe('the Autopilot screen', () => {
  it('shows the last 30 days\' figures', async () => {
    renderDesk(<Desk />);
    const stat = (await screen.findByText('AI drafts')).closest('.stat') as HTMLElement;
    await waitFor(() => expect(within(stat).getByText('7')).toBeTruthy());
    expect(within(stat).getByText('50%')).toBeTruthy();
    expect(within(stat).getByText('1')).toBeTruthy();
  });

  it('lists each intent with its mode, drafts and unchanged share', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Shadow' }).getAttribute('aria-pressed')).toBe('true'));
    expect(within(row('Order status')).getByText('4')).toBeTruthy();
    expect(within(row('Order status')).getByText('50%')).toBeTruthy();
    expect(within(row('Invoice request')).getByRole('button', { name: 'Live' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(row('Refund request')).getByText('Never automatic: a person must act')).toBeTruthy();
    expect(within(row('Refund request')).queryByRole('button')).toBeNull();
    expect(within(row('Cancellation')).getByText('Never automatic: a person must act')).toBeTruthy();
    expect(within(row('Account access')).getByRole('button', { name: 'Off' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('switches an intent live as a Support admins member, and creates the rule the first time', async () => {
    const { fake } = renderDesk(<Desk />);
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Shadow' }).getAttribute('aria-pressed')).toBe('true'));
    fireEvent.click(within(row('Order status')).getByRole('button', { name: 'Live' }));
    await waitFor(() => expect(rule(fake, 'order_status')?.body.mode).toBe('live'));
    fireEvent.click(within(row('Account access')).getByRole('button', { name: 'Shadow' }));
    await waitFor(() => expect(rule(fake, 'account_access')?.body).toMatchObject({ enabled: true, mode: 'shadow' }));
    // The screen follows what was saved.
    await waitFor(() => expect(within(row('Account access')).getByRole('button', { name: 'Shadow' }).getAttribute('aria-pressed')).toBe('true'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('switches an intent off', async () => {
    const { fake } = renderDesk(<Desk />);
    await waitFor(() => expect(within(row('Invoice request')).getByRole('button', { name: 'Live' }).getAttribute('aria-pressed')).toBe('true'));
    fireEvent.click(within(row('Invoice request')).getByRole('button', { name: 'Off' }));
    await waitFor(() => expect(rule(fake, 'invoice_request')?.body.enabled).toBe(false));
    await waitFor(() => expect(within(row('Invoice request')).getByRole('button', { name: 'Off' }).getAttribute('aria-pressed')).toBe('true'));
  });

  it('shows the switches to everyone, whatever their permissions, and says who can save', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    fake.server.actAs(DEMO_PEOPLE.ha);
    renderDesk(<Desk />, { fake });
    expect(await screen.findByText('Only people in Support admins can save a change; for anyone else the switches turn into labels.')).toBeTruthy();
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Shadow' }).getAttribute('aria-pressed')).toBe('true'));
    expect(within(row('Order status')).getAllByRole('button')).toHaveLength(3);
    expect(screen.queryByText('Your account can\'t change autopilot rules, so the modes are shown as labels.')).toBeNull();
  });

  it('turns the switches into labels when a change is refused, and leaves the rule as it was', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    fake.server.actAs(DEMO_PEOPLE.ha); // not in Support admins: the server answers 403
    renderDesk(<Desk />, { fake });
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Shadow' }).getAttribute('aria-pressed')).toBe('true'));
    fireEvent.click(within(row('Order status')).getByRole('button', { name: 'Live' }));
    expect(await screen.findByText('Your account can\'t change autopilot rules, so the modes are shown as labels.')).toBeTruthy();
    expect(screen.queryByText(/Only people in Support admins can save/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(within(row('Order status')).queryByRole('button')).toBeNull();
    expect(within(row('Order status')).getByText('Shadow').className).toBe('chip');
    expect(within(row('Invoice request')).getByText('Live')).toBeTruthy();
    expect(rule(fake, 'order_status')?.body.mode).toBe('shadow');
  });

  it('says when someone else changed the rule first, and shows theirs', async () => {
    // Saved a month ago, so the other person's save is a later instant than the one this screen holds.
    const seed = createSeed(TEST_NOW);
    seed.records.autopilot_rule![0]!.updatedAt = new Date(TEST_NOW.getTime() - 30 * 86_400_000).toISOString();
    const { fake } = renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed }) });
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Shadow' }).getAttribute('aria-pressed')).toBe('true'));
    const theirs = rule(fake, 'order_status')!;
    act(() => { fake.server.write('autopilot_rule', theirs.id, { enabled: false }); }); // rules are never announced, so the screen has not heard
    fireEvent.click(within(row('Order status')).getByRole('button', { name: 'Live' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Someone else changed this just now. It has been reloaded.');
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Off' }).getAttribute('aria-pressed')).toBe('true'));
    expect(rule(fake, 'order_status')?.body.enabled).toBe(false);
    // The switches are still there: this was not a refusal.
    expect(within(row('Order status')).getAllByRole('button')).toHaveLength(3);
  });

  it('does not let a switch be pressed before the rules are read, nor show them all off', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const { fake } = renderDesk(<Desk />, { api: (api) => ({ ...api, autopilotRules: async () => { await gate; return api.autopilotRules(); } }) });
    const live = await within(await screen.findByRole('row', { name: /^Order status/ })).findByRole('button', { name: 'Live' });
    expect(live.hasAttribute('disabled')).toBe(true);
    expect(live.hasAttribute('aria-pressed')).toBe(false);
    fireEvent.click(live);
    expect(fake.server.records('autopilot_rule')).toHaveLength(3);
    release();
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Shadow' }).getAttribute('aria-pressed')).toBe('true'));
    expect(within(row('Order status')).getByRole('button', { name: 'Live' }).hasAttribute('disabled')).toBe(false);
  });

  it('says so when the rules can not be read, instead of showing every intent off', async () => {
    renderDesk(<Desk />, { api: (api) => ({ ...api, autopilotRules: () => Promise.reject(new DeskError('offline', 0, 'NETWORK')) }) });
    expect((await screen.findByRole('alert')).textContent).toBe('You\'re offline. Try again when you\'re back.');
    expect(within(row('Order status')).getByRole('button', { name: 'Live' }).hasAttribute('disabled')).toBe(true);
  });

  it('keeps the switches as labels for the session: leave the screen and come back', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    fake.server.actAs(DEMO_PEOPLE.ha);
    renderDesk(<Desk />, { fake });
    await waitFor(() => expect(within(row('Order status')).getByRole('button', { name: 'Live' }).hasAttribute('disabled')).toBe(false));
    fireEvent.click(within(row('Order status')).getByRole('button', { name: 'Live' }));
    await screen.findByText('Your account can\'t change autopilot rules, so the modes are shown as labels.');
    fireEvent.click(screen.getByRole('button', { name: /^Contacts/ }));
    await screen.findByRole('heading', { name: 'Contacts' });
    fireEvent.click(screen.getByRole('button', { name: /^Autopilot/ }));
    expect(await screen.findByText('Your account can\'t change autopilot rules, so the modes are shown as labels.')).toBeTruthy();
    await waitFor(() => expect(within(row('Order status')).getByText('Shadow')).toBeTruthy());
    expect(within(row('Order status')).queryByRole('button')).toBeNull();
  });

  it('shows what people changed before sending', async () => {
    renderDesk(<Desk />);
    const table = (await screen.findByText(/^Recent drafts · Order status/)).closest('h3')!.nextElementSibling as HTMLElement;
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(3));
    const [, unchanged, edited] = within(table).getAllByRole('row');
    expect(within(unchanged!).getByText('Sent unchanged')).toBeTruthy();
    expect(within(unchanged!).getByText('Hà Nguyễn')).toBeTruthy();
    expect(within(edited!).getByText('TK-2026-0418')).toBeTruthy();
    expect([...edited!.querySelectorAll('ins')].some((i) => i.textContent?.includes('Wednesday'))).toBe(true);
  });

  it('shows another intent\'s recent drafts when picked, or says there are none', async () => {
    renderDesk(<Desk />);
    await screen.findByText(/^Recent drafts · Order status/);
    fireEvent.change(screen.getByRole('combobox', { name: 'Intent' }), { target: { value: 'feedback' } });
    expect(await screen.findByText(/^Recent drafts · Feedback/)).toBeTruthy();
    expect(screen.getByText('Nothing sent for this intent in the last 30 days.')).toBeTruthy();
  });
});
