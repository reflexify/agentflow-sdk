import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useDesk, useT } from '../../data/desk-context.js';
import { keys } from '../../data/keys.js';
import { mentionIds } from '../../model/text-tools.js';
import type { Person } from '../../model/types.js';
import { errorText } from '../messages.js';
import { storedNote, storeNote } from './draft-storage.js';

/** The note being written for a ticket: kept in this tab as it is typed, and gone once it is added. */
export function useNoteDraft(ticketId: string, meId: string) {
  const { api } = useDesk();
  const tr = useT();
  const qc = useQueryClient();
  const [text, setTextState] = useState(() => storedNote(meId, ticketId) ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  return {
    text,
    busy,
    error,
    setText(next: string) {
      setTextState(next);
      storeNote(meId, ticketId, next);
    },
    /** `mentionIds` reads the names in the text, so a mention typed by hand counts as much as one picked. */
    async submit(people: Person[]) {
      const body = text.trim();
      if (!body || !meId || inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setError(null);
      try {
        await api.createNote({ ticketId, kind: 'staff', body, authorUserId: meId, mentions: mentionIds(body, people) });
        setTextState('');
        storeNote(meId, ticketId, null);
        await qc.invalidateQueries({ queryKey: keys.thread(ticketId) });
      } catch (e) {
        setError(errorText(tr, e));
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
  };
}
