import { describe, expect, it } from 'vitest';
import { parseRoute, routePath, withTask } from '../../src/shell/route.js';

describe('routes', () => {
  it('reads every screen', () => {
    expect(parseRoute('/')).toEqual({ screen: 'mywork' });
    expect(parseRoute('/projects')).toEqual({ screen: 'projects' });
    expect(parseRoute('/p/abc?view=list&group=owner&done=7&cancelled=1')).toEqual({ screen: 'project', project: 'abc', view: { view: 'list', group: 'owner', done: '7', cancelled: true } });
    expect(parseRoute('/p/abc/t/t1')).toEqual({ screen: 'project', project: 'abc', view: { view: 'board', group: null, done: '30', cancelled: false }, task: 't1' });
    expect(parseRoute('/projects/t/t1')).toEqual({ screen: 'projects', task: 't1' });
    expect(parseRoute('/t/t1')).toEqual({ screen: 'project', project: '', view: { view: 'board', group: null, done: '30', cancelled: false }, task: 't1' });
    expect(parseRoute('/mine/t/t1')).toEqual({ screen: 'mywork', task: 't1' });
    expect(parseRoute('/mine')).toEqual({ screen: 'mywork' });
  });
  it('reads the Members tab and the label settings, and keeps the Tasks tab\'s query off the Members tab', () => {
    const base = { view: 'board', group: null, done: '30', cancelled: false };
    expect(parseRoute('/p/abc/members')).toEqual({ screen: 'project', project: 'abc', view: base, tab: 'members' });
    expect(parseRoute('/p/abc/members?view=list&group=owner')).toEqual({ screen: 'project', project: 'abc', view: base, tab: 'members' });
    expect(parseRoute('/p/abc/members/t/t1')).toEqual({ screen: 'project', project: 'abc', view: base, tab: 'members', task: 't1' });
    expect(parseRoute('/settings/labels')).toEqual({ screen: 'labels' });
    expect(parseRoute('/p/abc/members/x')).toEqual({ screen: 'mywork' });
    expect(parseRoute('/settings/labels/x')).toEqual({ screen: 'mywork' });
    expect(routePath(parseRoute('/p/abc/members?view=list'))).toBe('/p/abc/members');
    expect(withTask(parseRoute('/p/abc/members'), 't2')).toBe('/p/abc/members/t/t2');
    expect(withTask(parseRoute('/p/abc/members/t/t2'), null)).toBe('/p/abc/members');
  });
  it('opens My Work for an unknown path and ignores unknown values', () => {
    expect(parseRoute('/nowhere/at/all')).toEqual({ screen: 'mywork' });
    expect(parseRoute('/settings/x')).toEqual({ screen: 'mywork' });
    expect(parseRoute('/settings')).toEqual({ screen: 'mywork' });
    expect(parseRoute('/p/abc?view=grid&group=colour&done=99')).toMatchObject({ view: { view: 'board', group: null, done: '30' } });
  });
  it('writes a path that reads back the same, keeping defaults out of the query', () => {
    for (const path of ['/', '/projects', '/p/abc', '/p/abc?view=list&group=section&done=all&cancelled=1', '/p/abc/t/t1?group=due', '/t/t1', '/mine/t/t1', '/projects/t/t1', '/p/abc/members', '/p/abc/members/t/t1', '/settings/labels'])
      expect(routePath(parseRoute(path))).toBe(path);
    expect(withTask(parseRoute('/p/abc?group=due'), 't2')).toBe('/p/abc/t/t2?group=due');
    expect(withTask(parseRoute('/p/abc/t/t2?group=due'), null)).toBe('/p/abc?group=due');
    expect(withTask({ screen: 'mywork' }, 't3')).toBe('/mine/t/t3');
    expect(withTask(parseRoute('/mine/t/t3'), null)).toBe('/');
    expect(routePath(parseRoute('/mine'))).toBe('/');
  });
});
