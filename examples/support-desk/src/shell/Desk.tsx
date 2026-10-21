import { SignedOutBanner } from '../data/SignedOutBanner.js';
import { KeyboardProvider, useKeys } from '../keys/KeyboardProvider.js';
import { NextTicketNotice, NextTicketProvider } from '../queue/NextTicket.js';
import { OutboxBar, OutboxProvider } from '../outbox/Outbox.js';
import { useNow } from '../queue/QueuePane.js';
import { Workspace } from '../queue/Workspace.js';
import { AutopilotAccessProvider } from '../screens/AutopilotAccess.js';
import { AutopilotScreen } from '../screens/AutopilotScreen.js';
import { ContactScreen } from '../screens/ContactScreen.js';
import { ContactsScreen } from '../screens/ContactsScreen.js';
import { HeldScreen } from '../screens/HeldScreen.js';
import { KeysSheet } from './KeysSheet.js';
import { Palette } from './Palette.js';
import { Rail } from './Rail.js';
import type { Route } from './route.js';
import { RouteProvider, useNavigate, useRoute } from './RouteContext.js';
import { useDeskShell } from './shell-context.js';

function Screen({ route, now }: { route: Route; now: Date }) {
  switch (route.screen) {
    case 'queue':
      return <Workspace folder={route.folder} ticketId={route.ticketId} />;
    case 'held':
      return <HeldScreen now={now} />;
    case 'autopilot':
      return <AutopilotScreen now={now} />;
    case 'contacts':
      return <ContactsScreen now={now} />;
    case 'contact':
      return <ContactScreen key={route.id} id={route.id} now={now} />;
  }
}

function Shell() {
  const route = useRoute();
  const navigate = useNavigate();
  const now = useNow();
  useKeys({
    goMine: () => navigate({ screen: 'queue', folder: 'mine', ticketId: null }),
    goUnclaimed: () => navigate({ screen: 'queue', folder: 'unclaimed', ticketId: null }),
    goHeld: () => navigate({ screen: 'held' }),
  });
  return (
    <div className="app" data-testid="desk">
      <Rail />
      <section className="view">
        <SignedOutBanner />
        <NextTicketNotice />
        <OutboxBar />
        <Screen route={route} now={now} />
      </section>
      <Palette />
      <KeysSheet />
    </div>
  );
}

export function Desk() {
  const shell = useDeskShell();
  return (
    <RouteProvider location={shell.location}>
      <KeyboardProvider scope={shell.keyScope}>
        <NextTicketProvider>
          {/* Above the screens: a send goes on when the person goes to another ticket. */}
          <OutboxProvider>
            {/* Also above the screens: a refused change to an Autopilot rule is remembered for the session. */}
            <AutopilotAccessProvider>
              <Shell />
            </AutopilotAccessProvider>
          </OutboxProvider>
        </NextTicketProvider>
      </KeyboardProvider>
    </RouteProvider>
  );
}
