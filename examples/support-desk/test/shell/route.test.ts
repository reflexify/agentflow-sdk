import { describe, expect, it } from 'vitest';
import { parseRoute, routePath, type Route } from '../../src/shell/route.js';

describe('routes', () => {
  const cases: [string, Route][] = [
    ['/', { screen: 'queue', folder: 'mine', ticketId: null }],
    ['/f/unclaimed', { screen: 'queue', folder: 'unclaimed', ticketId: null }],
    ['/f/mine/t/abc', { screen: 'queue', folder: 'mine', ticketId: 'abc' }],
    ['/held', { screen: 'held' }],
    ['/autopilot', { screen: 'autopilot' }],
    ['/contacts', { screen: 'contacts' }],
    ['/contacts/c1', { screen: 'contact', id: 'c1' }],
  ];
  it.each(cases)('reads %s', (path, route) => expect(parseRoute(path)).toEqual(route));
  it.each(cases.slice(1))('writes %s back', (path, route) => expect(routePath(route)).toBe(path));
  it('sends anything unknown to Mine', () => {
    expect(parseRoute('/f/nope/t/x')).toEqual({ screen: 'queue', folder: 'mine', ticketId: null });
    expect(parseRoute('/what')).toEqual({ screen: 'queue', folder: 'mine', ticketId: null });
  });
  it('sends a malformed address to Mine instead of throwing', () => {
    for (const path of ['/f/mine/t/%', '/contacts/%E0%A4%A', '/f/%zz', '/%']) {
      expect(parseRoute(path), path).toEqual({ screen: 'queue', folder: 'mine', ticketId: null });
    }
  });
  it('reads an encoded id back', () => {
    expect(parseRoute('/f/mine/t/a%20b')).toEqual({ screen: 'queue', folder: 'mine', ticketId: 'a b' });
    expect(parseRoute(routePath({ screen: 'contact', id: 'a/b c' }))).toEqual({ screen: 'contact', id: 'a/b c' });
  });

  it('reads the path only: a query or a fragment opens the same screen', () => {
    expect(parseRoute('/f/mine/t/42?from=mail#reply')).toEqual({ screen: 'queue', folder: 'mine', ticketId: '42' });
    expect(parseRoute('/f/mine/t/42#reply')).toEqual({ screen: 'queue', folder: 'mine', ticketId: '42' });
    expect(parseRoute('/f/unclaimed?demo&script=off')).toEqual({ screen: 'queue', folder: 'unclaimed', ticketId: null });
    expect(parseRoute('/held#top')).toEqual({ screen: 'held' });
    expect(parseRoute('/?demo')).toEqual({ screen: 'queue', folder: 'mine', ticketId: null });
    expect(parseRoute('/contacts/c1?tab=notes')).toEqual({ screen: 'contact', id: 'c1' });
  });

  it('still sends a stray % in the path to Mine, and never decodes the query or the fragment', () => {
    expect(parseRoute('/f/mine/t/%?from=mail')).toEqual({ screen: 'queue', folder: 'mine', ticketId: null });
    expect(parseRoute('/f/mine/t/42?q=%#%')).toEqual({ screen: 'queue', folder: 'mine', ticketId: '42' });
    expect(parseRoute('/f/mine/t/a%20b?x=1#y')).toEqual({ screen: 'queue', folder: 'mine', ticketId: 'a b' });
  });
});
