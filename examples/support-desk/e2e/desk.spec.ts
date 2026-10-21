import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    /** Demo mode's handle (src/demo.tsx), typed here for the two calls the specs make. */
    __desk?: {
      server: { write(entity: 'reply', id: string | null, body: Record<string, unknown>): unknown };
      live: { setPresence(ticket: string, viewers: string[]): void };
    };
  }
}

const ANA = '30000000-0000-4000-8000-000000000002';

async function open(page: Page, path = '/') {
  await page.clock.install();
  await page.goto(`${path}?demo&script=off`);
  await expect(page.getByTestId('desk')).toBeVisible();
}
const rows = (page: Page) => page.getByRole('listbox', { name: 'Tickets' }).getByRole('option');
const reply = (page: Page) => page.getByRole('textbox', { name: 'Reply' });

test('works a ticket from the queue to Waiting on customer, all from the keyboard', async ({ page }) => {
  await open(page);
  await expect(rows(page)).toHaveCount(6);
  await page.keyboard.press('j');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Where is my order? It was due Friday' })).toBeVisible();
  await expect(reply(page)).toHaveValue(/Good news: your parcel was mislabelled/);

  await page.getByRole('button', { name: 'Shorter' }).click();
  await expect(page.getByText(/^Writing a new version/)).toBeVisible();
  await page.clock.fastForward(2000);
  const shorter = await reply(page).inputValue();
  expect(shorter.length).toBeLessThan(250);
  await page.getByRole('button', { name: 'Undo redraft' }).click();
  await expect(reply(page)).toHaveValue(/in time for Saturday/);

  await reply(page).focus();
  await page.keyboard.press('ControlOrMeta+Shift+Enter');
  await expect(page.getByText(/then marking the ticket Waiting on customer\.$/)).toBeVisible();
  await page.clock.fastForward(11_000);
  await expect(page.getByText('Sent. Ticket marked Waiting on customer.')).toBeVisible();
  await expect(rows(page)).toHaveCount(5);
  // Undo brought back text that differs from the latest AI draft, so the reply counts as edited.
  await expect(page.getByRole('log', { name: 'Conversation' }).getByText('AI draft, edited').last()).toBeVisible();
});

test('pauses a send when the customer writes again', async ({ page }) => {
  await open(page, `/f/mine/t/${ANA}`);
  await expect(reply(page)).toHaveValue(/Good news/);
  await page.evaluate((ticket) => {
    window.__desk!.server.write('reply', null, {
      ticket, author_kind: 'customer', status: 'received', body: 'Also, my office please.',
      posted_at: new Date(Date.now() + 1000).toISOString(), key: '<e2e@x>',
    });
  }, ANA);
  await expect(page.getByText('Also, my office please.')).toBeVisible();
  await page.getByRole('button', { name: /^Send ⌘↵/ }).click();
  await expect(page.getByText('Send paused.')).toBeVisible();
  await page.getByRole('button', { name: 'Send anyway' }).click();
  await page.clock.fastForward(11_000);
  await expect(page.getByText('Sent.', { exact: true })).toBeVisible();
});

test('keeps sending when the person moves on to the next ticket', async ({ page }) => {
  await open(page, `/f/mine/t/${ANA}`);
  await expect(reply(page)).toHaveValue(/Good news/);
  await page.getByRole('button', { name: /^Send ⌘↵/ }).click();
  await expect(page.getByText(/^Sending to Ana Lima in \d+ s\.$/)).toBeVisible();

  // J and Enter, with the countdown running: the next ticket opens, and the countdown moves to the bar.
  await page.keyboard.press('j');
  await page.keyboard.press('Enter');
  await expect(page).not.toHaveURL(new RegExp(ANA));
  const bar = page.getByRole('status').filter({ hasText: 'Ana Lima' });
  await expect(bar).toContainText(/^Sending to Ana Lima in \d+ s\./);

  await page.clock.fastForward(11_000);
  await expect(bar).toContainText('Ana Lima · Sent.');
  await bar.getByRole('button', { name: 'Open' }).click();
  await expect(page).toHaveURL(new RegExp(ANA));
  await expect(page.getByRole('log', { name: 'Conversation' }).getByText('Good news: your parcel was mislabelled').last()).toBeVisible();
  await expect(reply(page)).toHaveValue('');
});

test('lets a finished send go from the bar by itself', async ({ page }) => {
  await open(page, `/f/mine/t/${ANA}`);
  await expect(reply(page)).toHaveValue(/Good news/);
  await page.getByRole('button', { name: /^Send ⌘↵/ }).click();
  await expect(page.getByText(/^Sending to Ana Lima in \d+ s\.$/)).toBeVisible();
  await page.keyboard.press('j');
  await page.keyboard.press('Enter');
  await expect(page).not.toHaveURL(new RegExp(ANA));

  const bar = page.getByRole('status').filter({ hasText: 'Ana Lima' });
  await page.clock.fastForward(11_000);
  await expect(bar).toContainText('Ana Lima · Sent.');
  await page.clock.fastForward(9_000);
  await expect(bar).toHaveCount(0);
});

test('leaves a note that mentions a teammate', async ({ page }) => {
  await open(page, `/f/mine/t/${ANA}`);
  await expect(reply(page)).toHaveValue(/Good news/);
  await page.keyboard.press('n');
  const note = page.getByRole('textbox', { name: 'Note' });
  await note.pressSequentially('@Hà');
  await page.keyboard.press('Enter');
  await note.pressSequentially('can you check the office address?');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByRole('log', { name: 'Conversation' }).getByText('@Hà Nguyễn can you check the office address?')).toBeVisible();
});

test('inserts a saved reply with the customer\'s name', async ({ page }) => {
  await open(page, `/f/mine/t/${ANA}`);
  await expect(reply(page)).toHaveValue(/Good news/);
  await reply(page).fill('');
  await reply(page).pressSequentially('/deliv');
  await expect(page.getByText('Saved replies · "deliv"')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(reply(page)).toHaveValue(/^Hi Ana, your parcel was delayed/);
});

test('accepts a held message', async ({ page }) => {
  await open(page);
  await page.keyboard.press('g');
  await page.keyboard.press('h');
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(3);
  await table.getByRole('row', { name: /eve@mailbox\.test/ }).getByRole('button', { name: 'Accept' }).click();
  await expect(table.getByRole('row')).toHaveCount(2);
});

test('switches an autopilot intent live', async ({ page }) => {
  await open(page, '/autopilot');
  const row = page.getByRole('row', { name: /^Order status/ });
  await row.getByRole('button', { name: 'Live' }).click();
  await expect(row.getByRole('button', { name: 'Live' })).toHaveAttribute('aria-pressed', 'true');
});

test('finds a contact and saves the team\'s notes', async ({ page }) => {
  await open(page, '/contacts');
  await page.getByRole('textbox', { name: 'Name, email or organization' }).fill('nguyen');
  await page.clock.fastForward(300);
  await page.getByRole('button', { name: 'Lan Phạm' }).click();
  await page.getByRole('textbox', { name: 'Notes for the team' }).fill('Needs VAT invoices to Nguyen & Co.');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
});

test('opens the palette and the keyboard sheet', async ({ page }) => {
  await open(page);
  await page.keyboard.press('ControlOrMeta+k');
  // No command's label contains "0418", so the ticket is the first item.
  await page.getByRole('textbox', { name: 'Command' }).fill('0418');
  // The palette reads the open tickets when it opens, so until that read lands "0418" matches nothing and Enter runs nothing.
  // Scoped to the palette: the queue behind it lists the same ticket as an option.
  await expect(page.getByRole('dialog', { name: 'Command' }).getByRole('option', { name: /0418/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Where is my order? It was due Friday' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('body').click();
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
});

test('rings a ticket a teammate has open', async ({ page }) => {
  await open(page, '/f/mine');
  const ana = rows(page).filter({ hasText: 'Where is my order? It was due Friday' });
  await expect(ana).toHaveCount(1);
  await page.evaluate((ticket) => {
    window.__desk!.live.setPresence(ticket, ['10000000-0000-4000-8000-000000000002']);
  }, ANA);
  await expect(ana.getByTitle('Hà Nguyễn is viewing')).toBeVisible();
});

test('opens the ticket a link with a query and a fragment names', async ({ page }) => {
  await page.clock.install();
  await page.goto(`/f/mine/t/${ANA}?demo&script=off&from=mail#reply`);
  await expect(page.getByRole('heading', { name: 'Where is my order? It was due Friday' })).toBeVisible();
});

test('keeps its keys to itself: typing in the reply, or in the page around it, starts no shortcut', async ({ page }) => {
  await open(page, `/f/mine/t/${ANA}`);
  await expect(reply(page)).toHaveValue(/Good news/);
  const sheet = page.getByRole('dialog', { name: 'Keyboard shortcuts' });

  const before = await reply(page).inputValue();
  await reply(page).focus();
  await page.keyboard.press('?');
  await expect(sheet).toHaveCount(0);
  await expect(reply(page)).not.toHaveValue(before);

  await page.evaluate(() => {
    const field = document.createElement('input');
    field.setAttribute('aria-label', 'Outside');
    document.body.prepend(field);
  });
  await page.getByRole('textbox', { name: 'Outside' }).focus();
  for (const key of ['?', 'g', 'h']) await page.keyboard.press(key);
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(ANA));

  // A click on text in the desk, on nothing focusable, puts focus inside it: inside AgentFlow, where nothing forwards
  // keys, that is how its shortcuts start to work. The document's active element is then the shadow's host.
  await page.getByRole('heading', { name: 'Where is my order? It was due Friday' }).click();
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('root');
  await page.keyboard.press('?');
  await expect(sheet).toBeVisible();
});
