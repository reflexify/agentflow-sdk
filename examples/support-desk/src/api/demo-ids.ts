import type { DeskIds } from '../../shared/contract.js';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** Fixed ids for the tests and the demo seed. A real desk reads its ids from its installation, or a standalone host from its desk config. */
export const DEMO_IDS: DeskIds = {
  entities: { ticket: id(1), reply: id(2), note: id(3), contact: id(4), canned_reply: id(5), autopilot_rule: id(6) },
  workflows: { handling: id(7), draft_reply: id(8), send_reply: id(9), accept_message: id(10), move_message: id(11) },
  supportGroupId: id(13),
};
