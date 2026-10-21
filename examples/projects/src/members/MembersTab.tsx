import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useProjectMutation } from '../data/hooks.js';
import { Confirm, Dialog, Menu, PersonPicker, Tooltip, useToast, type MenuItem, type Person as KitPerson } from '../kit/elements.js';
import { hueOf, initials } from '../model/format.js';
import { addPeople, demote, handOver, lastManager, promote, removePerson, type PeopleWrite } from '../model/members.js';
import { can, rolesOf } from '../model/roles.js';
import type { Person, Project } from '../model/types.js';
import { MoreHorizontal, PlusIcon } from '../shared/icons.js';
import { useNavigate } from '../shell/RouteContext.js';
import type { TextKey } from '../text.js';

type Pending = { kind: 'remove' | 'handover'; person: string };

const toKit = (p: Person): KitPerson => ({ id: p.id, name: p.name, email: p.email });

/**
 * Who is in the project: its managers, then its members. Anyone who can read the project sees the list; only a manager
 * has controls. A people change is one write of the managers and the members together.
 */
export function MembersTab({ project }: { project: Project }) {
  const { viewer, online, people, lang } = useProjects();
  const tr = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const { update } = useProjectMutation();
  const addReasonId = useId();
  const [adding, setAdding] = useState(false);
  const [handingOver, setHandingOver] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [working, setWorking] = useState(false);
  // Set in the press's own tick, before React has rendered: a second press finds it.
  const inFlight = useRef(false);
  // What the confirmation said last, so it keeps its words while it closes.
  const lastPending = useRef<Pending | null>(null);
  if (pending) lastPending.current = pending;

  const verdict = can('members', { viewer, project, online });
  const manager = rolesOf(viewer, project).manager;
  const lock: TextKey | null = verdict.ok ? null : verdict.reason;

  const personOf = (id: string): Person => people.get(id) ?? { id, name: id, email: null };
  const candidates = useMemo(() => {
    const inside = new Set([...project.managers, ...project.members]);
    return [...people.values()].filter((p) => !inside.has(p.id)).map(toKit);
  }, [people, project.managers, project.members]);

  /** Writes a people change. Resolves to whether it was stored; a manager who left goes to the project list. */
  const apply = async (write: PeopleWrite): Promise<boolean> => {
    if (inFlight.current || !manager || lock) return false;
    if (!write.ok) {
      toast({ kind: 'error', text: tr(write.reason) });
      return false;
    }
    inFlight.current = true;
    try {
      const saved = await update(project, write.changes);
      if (!saved) return false;
      if (!saved.managers.includes(viewer.id) && !saved.members.includes(viewer.id)) {
        navigate('/projects');
        toast({ kind: 'info', text: tr('youLeftProject') });
      }
      return true;
    } finally {
      inFlight.current = false;
    }
  };

  // Removing oneself is leaving, and says so.
  const removeLabel = (id: string) => tr(id === viewer.id ? 'leaveProject' : 'removeFromProject');
  const itemsFor = (id: string): MenuItem[] => {
    const item = (itemId: string, label: string, reason: TextKey | null): MenuItem =>
      reason ? { id: itemId, label, disabled: true, reason: tr(reason) } : { id: itemId, label };
    if (!project.managers.includes(id)) {
      return [item('promote', tr('makeManager'), lock), item('remove', removeLabel(id), lock)];
    }
    const sole = lastManager(project, id) ? 'lastManagerStays' : null;
    const items = [item('demote', tr('makeMember'), lock ?? sole), item('remove', removeLabel(id), lock ?? sole)];
    // Handing over is the viewer's own act, from their own row: the new manager must already be in the project.
    if (id === viewer.id) items.push(item('handover', tr('handOverManagement'), lock ?? (project.members.length === 0 ? 'handOverToMember' : null)));
    return items;
  };

  const onSelect = (id: string, itemId: string) => {
    if (lock || !manager) return;
    if (itemId === 'promote') void apply(promote(project, id));
    else if (itemId === 'demote') void apply(demote(project, id));
    else if (itemId === 'remove') {
      if (lastManager(project, id)) toast({ kind: 'error', text: tr('lastManagerStays') });
      else setPending({ kind: 'remove', person: id });
    } else if (itemId === 'handover' && project.members.length > 0) setHandingOver(true);
  };

  const confirmPending = async () => {
    if (!pending || inFlight.current) return;
    const { kind, person } = pending;
    setWorking(true);
    try {
      await apply(kind === 'remove' ? removePerson(project, person) : handOver(project, viewer.id, person));
    } finally {
      setWorking(false);
      setPending(null);
    }
  };

  const shown = pending ?? lastPending.current;
  const shownName = shown ? personOf(shown.person).name : '';
  const handOverLabel = tr('handOverManagement').replace(/…$/, '');
  const leaving = shown?.kind === 'remove' && shown.person === viewer.id;

  return (
    <section className="members">
      {manager && (
        <div className="members-bar">
          <AddButton lock={lock} reasonId={addReasonId} onPress={() => setAdding(true)} />
        </div>
      )}
      <Group name="managers" heading={tr('managers')} ids={project.managers} empty={null} personOf={personOf} viewerId={viewer.id}
        menu={manager ? (id) => <RowMenu id={id} name={personOf(id).name} items={itemsFor(id)} onSelect={onSelect} /> : null} />
      <Group name="members" heading={tr('members')} ids={project.members} empty={tr('noMembersYet')} personOf={personOf} viewerId={viewer.id}
        menu={manager ? (id) => <RowMenu id={id} name={personOf(id).name} items={itemsFor(id)} onSelect={onSelect} /> : null} />
      {manager && (
        <>
          <div className="members-modal">
            <AddDialog
              open={adding}
              candidates={candidates}
              onClose={() => setAdding(false)}
              onAdd={async (ids) => {
                const saved = await apply(addPeople(project, ids));
                if (saved) setAdding(false);
              }}
            />
            <Dialog open={handingOver} heading={tr('handOverManagement')} locale={lang} onClose={() => setHandingOver(false)}>
              {handingOver && (
                <PersonPicker
                  people={project.members.map((id) => toKit(personOf(id)))}
                  value={null}
                  label={tr('pickMember')}
                  placeholder={tr('pickMember')}
                  locale={lang}
                  onChange={({ value }) => {
                    if (typeof value !== 'string') return;
                    setHandingOver(false);
                    setPending({ kind: 'handover', person: value });
                  }}
                />
              )}
            </Dialog>
          </div>
          <Confirm
            open={pending !== null}
            heading={shown?.kind === 'handover' ? handOverLabel : leaving ? tr('leaveProject') : tr('removeFromProject')}
            message={!shown ? '' : shown.kind === 'handover' ? tr('handOverConfirm', { name: shownName }) : leaving ? tr('leaveProjectConfirm') : tr('removeMemberConfirm', { name: shownName })}
            confirmLabel={shown?.kind === 'handover' ? handOverLabel : leaving ? tr('leaveProject') : tr('removeFromProject')}
            busy={working}
            locale={lang}
            strings={{ cancel: tr('goBack') }}
            onConfirm={() => void confirmPending()}
            onCancel={() => { if (!working) setPending(null); }}
          />
        </>
      )}
    </section>
  );
}

/** Thêm thành viên: a locked button keeps its place and says why in a tooltip. */
function AddButton({ lock, reasonId, onPress }: { lock: TextKey | null; reasonId: string; onPress(): void }) {
  const tr = useT();
  const { lang } = useProjects();
  const button = (
    <button
      type="button"
      className="af-button primary"
      aria-disabled={lock ? 'true' : undefined}
      aria-describedby={lock ? reasonId : undefined}
      onClick={() => { if (!lock) onPress(); }}
    >
      <PlusIcon />
      {tr('addMembers')}
    </button>
  );
  if (!lock) return button;
  return (
    <>
      <Tooltip text={tr(lock)} locale={lang}>{button}</Tooltip>
      <span id={reasonId} className="sr-only">{tr(lock)}</span>
    </>
  );
}

function Group(p: {
  name: 'managers' | 'members'; heading: string; ids: string[]; empty: string | null; viewerId: string;
  personOf(id: string): Person; menu: ((id: string) => ReactNode) | null;
}) {
  const { lang } = useProjects();
  const tr = useT();
  const headingId = useId();
  return (
    <section className="member-group" data-group={p.name} aria-labelledby={headingId}>
      <h3 id={headingId} className="member-group-head">
        {p.heading}
        <span className="sr-only">, </span>
        <span className="member-count">{p.ids.length}</span>
      </h3>
      {p.ids.length === 0 && p.empty ? <p className="member-empty">{p.empty}</p> : (
        <ul className="member-list">
          {p.ids.map((id) => {
            const person = p.personOf(id);
            return (
              <li key={id} className="member-row" data-person={id}>
                <span className="af-avatar" data-hue={hueOf(id)} aria-hidden="true">{initials(person.name)}</span>
                <span className="member-text">
                  <span className="member-line">
                    <Tooltip text={person.name} locale={lang} whenCutShort className="member-clip">
                      <span className="person-name">{person.name}</span>
                    </Tooltip>
                    {id === p.viewerId && <span className="member-you">{tr('youTag')}</span>}
                  </span>
                  {person.email && (
                    <Tooltip text={person.email} locale={lang} whenCutShort className="member-clip">
                      <span className="member-email">{person.email}</span>
                    </Tooltip>
                  )}
                </span>
                {p.menu?.(id)}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RowMenu(p: { id: string; name: string; items: MenuItem[]; onSelect(id: string, item: string): void }) {
  const { lang } = useProjects();
  const tr = useT();
  return (
    <span className="member-menu">
      <Menu items={p.items} label={tr('memberActions', { name: p.name })} locale={lang} onSelect={({ id }) => p.onSelect(p.id, id)}>
        <MoreHorizontal size={16} />
      </Menu>
    </span>
  );
}

function AddDialog(p: { open: boolean; candidates: KitPerson[]; onClose(): void; onAdd(ids: string[]): Promise<void> }) {
  const { lang } = useProjects();
  const tr = useT();
  const [chosen, setChosen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  useEffect(() => {
    if (!p.open) setChosen([]);
  }, [p.open]);

  const add = async () => {
    if (busyRef.current || chosen.length === 0) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await p.onAdd(chosen);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={p.open}
      heading={tr('addMembers')}
      locale={lang}
      onClose={() => { if (!busyRef.current) p.onClose(); }}
      actions={
        <>
          <button type="button" className="af-button secondary" onClick={() => { if (!busyRef.current) p.onClose(); }}>{tr('cancel')}</button>
          <button
            type="button"
            className="af-button primary"
            aria-disabled={busy || chosen.length === 0 ? 'true' : undefined}
            aria-busy={busy ? 'true' : undefined}
            onClick={() => void add()}
          >
            {tr('addToProject')}
          </button>
        </>
      }
    >
      {p.open && (
        <PersonPicker
          people={p.candidates}
          value={chosen}
          multiple
          label={tr('addMembers')}
          placeholder={tr('addPeople')}
          locale={lang}
          onChange={({ value }) => setChosen(Array.isArray(value) ? value : value ? [value] : [])}
        />
      )}
    </Dialog>
  );
}
