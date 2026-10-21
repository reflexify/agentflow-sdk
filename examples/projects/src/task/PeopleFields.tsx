import { useId, useMemo, useRef, type ReactNode } from 'react';
import { useProjects, useT } from '../data/context.js';
import { usePeople } from '../data/hooks.js';
import { useClaim } from '../data/useClaim.js';
import { PersonPicker, type Person as KitPerson } from '../kit/elements.js';
import { hueOf, initials } from '../model/format.js';
import { can } from '../model/roles.js';
import type { Person, Project, Task } from '../model/types.js';
import { FieldRow, Locked, LockedValue, type DrawerWriter } from './fields.js';

/** Chips past this many fold into "+n". */
const CHIPS = 5;

function PersonChip({ person, size }: { person: Person; size?: 'lg' }) {
  return (
    <span className={size ? `person-chip ${size}` : 'person-chip'}>
      <span className="af-avatar" data-hue={hueOf(person.id)} role="img" aria-label={person.name}>{initials(person.name)}</span>
      <span className="person-name" aria-hidden="true">{person.name}</span>
    </span>
  );
}

function Chips({ people, empty }: { people: Person[]; empty: string }) {
  if (people.length === 0) return <span className="field-empty">{empty}</span>;
  const shown = people.slice(0, CHIPS);
  return (
    <span className="person-chips">
      {shown.map((p) => <PersonChip key={p.id} person={p} />)}
      {people.length > CHIPS && <span className="person-more">+{people.length - CHIPS}</span>}
    </span>
  );
}

/**
 * Người chính and Người phối hợp. The primary changes only through the work operations: Nhận task while nobody holds
 * the task, and for managers alone a picker that assigns, reassigns or releases. Collaborators are a field the primary
 * and managers write.
 */
export function PeopleFields({ task, project, writer }: { task: Task; project: Project | null; writer: DrawerWriter }) {
  const { viewer, online, people, lang, api } = useProjects();
  const tr = useT();
  const primaryId = useId();
  const collaboratorsId = useId();
  const ctx = { viewer, project, task, online };
  const { claim: take, isPending } = useClaim();
  // The drawer's writes wait their turn, so the claim's own guard hears a second press only once the first is over.
  const claiming = useRef<string | null>(null);
  const press = () => {
    if (claiming.current === task.id) return;
    const id = task.id;
    claiming.current = id;
    void writer.run('primary', (t) => take(t), { holder: viewer.id }).finally(() => {
      if (claiming.current === id) claiming.current = null;
    });
  };
  const personOf = (id: string): Person => people.get(id) ?? { id, name: id, email: null };
  const peopleLoading = !usePeople().data;

  // The project's people, and anyone the task already names who is not one of them, so a chip never shows a bare id.
  const choices = useMemo<KitPerson[]>(() => {
    const ids = [...new Set([...(project?.managers ?? []), ...(project?.members ?? []), ...(task.holder ? [task.holder] : []), ...task.collaborators])];
    return ids.map((id) => {
      const p = people.get(id) ?? { id, name: id, email: null };
      return { id: p.id, name: p.name, email: p.email };
    });
  }, [project, task.holder, task.collaborators, people]);

  const pick = can('pick_primary', ctx);
  const claim = can('claim', ctx);
  const edit = can('edit_content', ctx);
  const holder = task.holder ? personOf(task.holder) : null;

  let primary: ReactNode;
  if (pick.ok) {
    primary = (
      <PersonPicker
        people={choices}
        value={task.holder}
        placeholder={tr('noPrimary')}
        label={tr('primary')}
        loading={peopleLoading}
        locale={lang}
        onChange={({ value }) => {
          const next = typeof value === 'string' ? value : null;
          if (next === task.holder) return;
          void writer.run('primary', (t) => (next ? api.assign(t, next) : api.release(t)));
        }}
      />
    );
  } else if (!pick.hidden || holder) {
    // A manager locked out by the project's state, or anyone once someone holds the task: the holder as text.
    primary = holder
      ? (pick.hidden ? <PersonChip person={holder} size="lg" /> : <LockedValue reason={pick.reason} labelId={primaryId}><PersonChip person={holder} size="lg" /></LockedValue>)
      : <LockedValue reason={pick.reason} labelId={primaryId}><span className="field-empty">{tr('noPrimary')}</span></LockedValue>;
  } else {
    const button = (describedBy?: string) => (
      <button
        type="button"
        className="af-button secondary sm claim-button"
        aria-disabled={claim.ok && !isPending(task.id) ? undefined : 'true'}
        aria-busy={isPending(task.id) || undefined}
        aria-describedby={describedBy}
        onClick={() => { if (claim.ok && !isPending(task.id)) press(); }}
      >
        {tr('claim')}
      </button>
    );
    primary = claim.ok ? button() : <Locked reason={claim.reason}>{button}</Locked>;
  }

  const collaborators = task.collaborators.map(personOf);
  return (
    <>
      <FieldRow field="primary" label={tr('primary')} labelId={primaryId} writer={writer} lock={pick.ok || pick.hidden ? null : pick.reason}>
        {primary}
      </FieldRow>
      <FieldRow field="collaborators" label={tr('collaborators')} labelId={collaboratorsId} writer={writer} lock={edit.ok ? null : edit.reason}>
        {edit.ok
          ? (
            <PersonPicker
              people={choices}
              value={task.collaborators}
              multiple
              placeholder={tr('addPeople')}
              label={tr('collaborators')}
              loading={peopleLoading}
              locale={lang}
              onChange={({ value }) => {
                const next = Array.isArray(value) ? value : value ? [value] : [];
                if (next.length === task.collaborators.length && next.every((id, i) => id === task.collaborators[i])) return;
                void writer.save({ collaborators: next }, 'collaborators');
              }}
            />
          )
          : (
            <LockedValue reason={edit.reason} labelId={collaboratorsId}>
              <Chips people={collaborators} empty={tr('noCollaborators')} />
            </LockedValue>
          )}
      </FieldRow>
    </>
  );
}
