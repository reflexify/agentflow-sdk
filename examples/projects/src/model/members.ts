import type { TextKey } from '../text.js';
import type { Project } from './types.js';

export type PeopleWrite =
  | { ok: true; changes: { managers: string[]; members: string[] } }
  | { ok: false; reason: TextKey };

const unique = (ids: string[]) => [...new Set(ids)];
const done = (managers: string[], members: string[]): PeopleWrite => ({ ok: true, changes: { managers: unique(managers), members: unique(members) } });
const refuse = (reason: TextKey): PeopleWrite => ({ ok: false, reason });

export function lastManager(project: Project, person: string): boolean {
  return project.managers.length === 1 && project.managers[0] === person;
}

export function addPeople(project: Project, ids: string[]): PeopleWrite {
  const present = new Set([...project.managers, ...project.members]);
  return done(project.managers, [...project.members, ...ids.filter((id) => !present.has(id))]);
}

export function promote(project: Project, person: string): PeopleWrite {
  if (project.managers.includes(person)) return done(project.managers, project.members);
  return done([...project.managers, person], project.members.filter((id) => id !== person));
}

export function demote(project: Project, person: string): PeopleWrite {
  if (lastManager(project, person)) return refuse('lastManagerStays');
  if (!project.managers.includes(person)) return done(project.managers, project.members);
  return done(project.managers.filter((id) => id !== person), [...project.members, person]);
}

export function removePerson(project: Project, person: string): PeopleWrite {
  if (lastManager(project, person)) return refuse('lastManagerStays');
  return done(project.managers.filter((id) => id !== person), project.members.filter((id) => id !== person));
}

/** The new manager joins the managers and the old one becomes a member: nobody leaves the project. */
export function handOver(project: Project, from: string, to: string): PeopleWrite {
  if (from === to) return done(project.managers, project.members);
  const inside = project.managers.includes(to) || project.members.includes(to);
  if (!inside) return refuse('handOverToMember');
  const managers = project.managers.filter((id) => id !== from);
  return done(
    managers.includes(to) ? managers : [...managers, to],
    [...project.members.filter((id) => id !== to), ...(project.managers.includes(from) ? [from] : [])],
  );
}
