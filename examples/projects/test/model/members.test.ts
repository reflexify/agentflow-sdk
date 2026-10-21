import { describe, expect, it } from 'vitest';
import { addPeople, demote, handOver, lastManager, promote, removePerson } from '../../src/model/members.js';
import { aProject } from '../support/fixtures.js';

const [MINH, HOA, MAI, TUAN, KHOA] = ['minh', 'hoa', 'mai', 'tuan', 'khoa'];
const project = aProject({ managers: [MINH], members: [HOA, MAI] });
const two = aProject({ managers: [MINH, HOA], members: [MAI] });

describe('changing who is in a project', () => {
  it('adds people as members once, leaving those already in alone', () => {
    expect(addPeople(project, [TUAN, HOA, TUAN])).toEqual({ ok: true, changes: { managers: [MINH], members: [HOA, MAI, TUAN] } });
    expect(addPeople(project, [MINH])).toEqual({ ok: true, changes: { managers: [MINH], members: [HOA, MAI] } });
  });

  it('promotes a member to manager', () => {
    expect(promote(project, HOA)).toEqual({ ok: true, changes: { managers: [MINH, HOA], members: [MAI] } });
  });

  it('refuses to demote or remove the last manager', () => {
    expect(demote(project, MINH)).toEqual({ ok: false, reason: 'lastManagerStays' });
    expect(removePerson(project, MINH)).toEqual({ ok: false, reason: 'lastManagerStays' });
  });

  it('demotes one of two managers to member, and removes a person from both lists', () => {
    expect(demote(two, MINH)).toEqual({ ok: true, changes: { managers: [HOA], members: [MAI, MINH] } });
    expect(removePerson(two, MINH)).toEqual({ ok: true, changes: { managers: [HOA], members: [MAI] } });
    expect(removePerson(project, HOA)).toEqual({ ok: true, changes: { managers: [MINH], members: [MAI] } });
  });

  it('hands management over to someone already in the project', () => {
    expect(handOver(project, MINH, HOA)).toEqual({ ok: true, changes: { managers: [HOA], members: [MAI, MINH] } });
    expect(handOver(two, MINH, MAI)).toEqual({ ok: true, changes: { managers: [HOA, MAI], members: [MINH] } });
  });

  it('refuses to hand over to someone outside the project', () => {
    expect(handOver(project, MINH, KHOA)).toEqual({ ok: false, reason: 'handOverToMember' });
  });

  it('knows who the last manager is', () => {
    expect(lastManager(project, MINH)).toBe(true);
    expect(lastManager(project, HOA)).toBe(false);
    expect(lastManager(two, MINH)).toBe(false);
  });
});
