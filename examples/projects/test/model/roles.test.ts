import { describe, expect, it } from 'vitest';
import { can, canCreateProject, canManageLabels, rolesOf } from '../../src/model/roles.js';
import { aProject, aTask, viewer } from '../support/fixtures.js';

const project = aProject({ managers: ['m'], members: ['b', 'h'] });
const task = aTask({ project: project.id, holder: 'b', collaborators: ['c'], status: 'doing' });
const done = aTask({ project: project.id, holder: null, status: 'done' });
const cancelled = aTask({ project: project.id, holder: null, status: 'cancelled' });
const as = (id: string, extra = {}) => ({ viewer: viewer(id, extra), project, task, online: true });
const allowed = (control: Parameters<typeof can>[0], who: string, extra = {}) => can(control, as(who, extra)).ok;
const on = (control: Parameters<typeof can>[0], who: string, t: ReturnType<typeof aTask>) => can(control, { viewer: viewer(who), project, task: t, online: true });

describe('who may do what', () => {
  it.each([
    ['create_task', { m: true, b: true, h: true, c: false, x: false }],
    ['complete', { m: false, b: true, h: false, c: false, x: false }],
    ['move_status', { m: true, b: true, h: false, c: true, x: false }],
    ['label', { m: true, b: true, h: false, c: true, x: false }],
    ['blocked', { m: true, b: true, h: false, c: true, x: false }],
    ['edit_content', { m: true, b: true, h: false, c: false, x: false }],
    ['cancel', { m: true, b: true, h: false, c: false, x: false }],
    ['checklist', { m: true, b: true, h: false, c: true, x: false }],
    ['attachments', { m: true, b: true, h: false, c: true, x: false }],
    ['move_card', { m: true, b: true, h: false, c: true, x: false }],
    ['pick_primary', { m: true, b: false, h: false, c: false, x: false }],
    ['delete', { m: true, b: false, h: false, c: false, x: false }],
    ['sections', { m: true, b: false, h: false, c: false, x: false }],
    ['project_edit', { m: true, b: false, h: false, c: false, x: false }],
  ] as const)('%s', (control, expected) => {
    for (const [who, ok] of Object.entries(expected)) expect(allowed(control, who), `${control} by ${who}`).toBe(ok);
  });

  it('works out the roles from the project and the task', () => {
    expect(rolesOf(viewer('b'), project, task)).toEqual({ admin: false, creator: false, manager: false, member: true, primary: true, collaborator: false });
    expect(rolesOf(viewer('c', { projectAdmin: true }), project, task)).toMatchObject({ admin: true, member: false, collaborator: true });
    expect(rolesOf(viewer('m'), null)).toMatchObject({ manager: false, primary: false });
  });

  it('lets managers and members claim only an unheld task', () => {
    const free = aTask({ project: project.id, holder: null });
    expect(can('claim', { viewer: viewer('h'), project, task: free, online: true }).ok).toBe(true);
    expect(can('claim', { viewer: viewer('m'), project, task: free, online: true }).ok).toBe(true);
    expect(can('claim', { viewer: viewer('c'), project, task: free, online: true }).ok).toBe(false);
    expect(can('claim', { viewer: viewer('h'), project, task, online: true })).toEqual({ ok: false, reason: 'alreadyHeld', hidden: false });
  });

  it('lets only managers reopen a done task and restore a cancelled one', () => {
    expect([on('reopen', 'm', done).ok, on('reopen', 'b', done)]).toEqual([true, { ok: false, reason: 'onlyManagers', hidden: false }]);
    expect([on('restore', 'm', cancelled).ok, on('restore', 'b', cancelled)]).toEqual([true, { ok: false, reason: 'onlyManagers', hidden: false }]);
  });

  it('gives the holder of a finished task no owner rights, and says only managers may change it', () => {
    const held = aTask({ project: project.id, holder: 'b', status: 'done' });
    expect(rolesOf(viewer('b'), project, held).primary).toBe(false);
    expect(on('edit_content', 'b', held)).toEqual({ ok: false, reason: 'onlyManagersFinished', hidden: false });
    expect(on('checklist', 'b', held)).toEqual({ ok: false, reason: 'onlyParticipantsFinished', hidden: false });
    expect(on('edit_content', 'm', held).ok).toBe(true);
    expect(on('checklist', 'c', aTask({ project: project.id, holder: 'b', status: 'cancelled', collaborators: ['c'] })).ok).toBe(true);
  });

  it('lets the primary complete from to do or in progress', () => {
    const todo = aTask({ project: project.id, holder: 'b', status: 'todo' });
    expect([on('complete', 'b', todo).ok, on('complete', 'b', task).ok]).toEqual([true, true]);
    expect(on('complete', 'm', todo)).toEqual({ ok: false, reason: 'onlyPrimaryCompletes', hidden: false });
  });

  it('offers each status action only in its own status, and hides it elsewhere', () => {
    expect(on('reopen', 'm', task)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
    expect(on('restore', 'm', task)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
    expect(on('complete', 'b', done)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
    expect(on('cancel', 'm', done)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
    expect(on('cancel', 'm', cancelled)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
  });

  it('closes and reopens a project for managers and project admins', () => {
    expect(allowed('project_close', 'm')).toBe(true);
    expect(allowed('project_close', 'x', { projectAdmin: true })).toBe(true);
    expect(allowed('project_close', 'b')).toBe(false);
    expect(allowed('project_edit', 'x', { projectAdmin: true })).toBe(false);
  });

  it('hides delete and the primary picker from anyone but a manager, and locks the rest with a reason', () => {
    expect(can('delete', as('b'))).toEqual({ ok: false, reason: 'onlyManagersDelete', hidden: true });
    expect(can('pick_primary', as('b'))).toMatchObject({ ok: false, hidden: true });
    expect(can('complete', as('c'))).toEqual({ ok: false, reason: 'onlyPrimaryCompletes', hidden: false });
    expect(can('edit_content', as('c'))).toEqual({ ok: false, reason: 'onlyOwnerOrManager', hidden: false });
    expect(can('label', as('h'))).toEqual({ ok: false, reason: 'onlyParticipants', hidden: false });
  });

  it('decides the hidden refusals before any lock', () => {
    const closed = aProject({ managers: ['m'], members: ['b'], status: 'closed' });
    const frozenTask = aTask({ project: closed.id, holder: 'b', status: 'doing', frozen: true });
    expect(can('delete', { viewer: viewer('b'), project: closed, task: frozenTask, online: true })).toEqual({ ok: false, reason: 'onlyManagersDelete', hidden: true });
    expect(can('pick_primary', { viewer: viewer('b'), project: closed, task: frozenTask, online: false })).toMatchObject({ ok: false, hidden: true });
    expect(can('delete', { viewer: viewer('m'), project: closed, task: frozenTask, online: true })).toEqual({ ok: false, reason: 'projectClosedLocked', hidden: false });
    expect(can('reopen', { viewer: viewer('m'), project, task, online: false })).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
    expect(can('reopen', { viewer: viewer('m'), project, task: done, online: false })).toEqual({ ok: false, reason: 'offlineLocked', hidden: false });
  });

  it('offers a status move only for to do and in progress, and blocked only in progress', () => {
    const todo = aTask({ project: project.id, holder: 'b', status: 'todo' });
    expect(on('move_status', 'b', todo).ok).toBe(true);
    expect(on('move_status', 'b', done)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
    expect(on('move_status', 'm', cancelled)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
    expect(on('blocked', 'b', task).ok).toBe(true);
    expect(on('blocked', 'b', todo)).toEqual({ ok: false, reason: 'wrongStatus', hidden: true });
  });

  it('locks every write while offline, in a closed project and on a frozen task', () => {
    expect(can('edit_content', { ...as('b'), online: false })).toMatchObject({ ok: false, reason: 'offlineLocked' });
    const closed = aProject({ managers: ['m'], members: ['b'], status: 'closed' });
    expect(can('edit_content', { viewer: viewer('b'), project: closed, task, online: true })).toMatchObject({ ok: false, reason: 'projectClosedLocked' });
    expect(can('project_close', { viewer: viewer('m'), project: closed, task: null, online: true }).ok).toBe(true);
    const frozen = aTask({ project: project.id, holder: 'b', frozen: true });
    expect(can('edit_content', { viewer: viewer('b'), project, task: frozen, online: true })).toMatchObject({ ok: false, reason: 'taskFrozenLocked' });
  });

  it('lets project creators create projects', () => {
    expect(canCreateProject(viewer('x', { projectCreator: true }), true).ok).toBe(true);
    expect(canCreateProject(viewer('x'), true)).toMatchObject({ ok: false, reason: 'onlyCreatorsCreate' });
    expect(canCreateProject(viewer('x', { projectCreator: true }), false)).toMatchObject({ ok: false, reason: 'offlineLocked' });
  });

  it('lets only a project\'s managers change its members', () => {
    expect(allowed('members', 'm')).toBe(true);
    expect(can('members', as('b'))).toEqual({ ok: false, reason: 'onlyManagers', hidden: false });
    expect(can('members', as('x', { projectAdmin: true }))).toEqual({ ok: false, reason: 'onlyManagers', hidden: false });
    const closed = aProject({ managers: ['m'], members: ['b'], status: 'closed' });
    expect(can('members', { viewer: viewer('m'), project: closed, task: null, online: true })).toEqual({ ok: false, reason: 'projectClosedLocked', hidden: false });
  });

  it('lets only project admins manage sub-labels', () => {
    expect(canManageLabels(viewer('x', { projectAdmin: true }), true).ok).toBe(true);
    expect(canManageLabels(viewer('m'), true)).toEqual({ ok: false, reason: 'onlyAdminsLabels', hidden: false });
    expect(canManageLabels(viewer('x', { projectAdmin: true }), false)).toMatchObject({ ok: false, reason: 'offlineLocked' });
  });
});
