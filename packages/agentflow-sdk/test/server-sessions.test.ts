import { describe, expect, it } from 'vitest';
import { seal, unseal } from '../src/server/seal.js';
import { MemorySessionStore } from '../src/server/sessions.js';
import { cookieHeader, readCookie } from '../src/server/cookies.js';

const KEY = Buffer.alloc(32, 7).toString('base64url');

describe('seal', () => {
  it('round-trips and refuses a tampered value', async () => {
    const s = await seal(KEY, { a: 1 });
    expect(await unseal(KEY, s)).toEqual({ a: 1 });
    expect(await unseal(KEY, s.slice(0, -2) + 'AA')).toBeUndefined();
    expect(await unseal(Buffer.alloc(32, 8).toString('base64url'), s)).toBeUndefined();
  });

  it('throws a clear error when the key does not decode to 32 bytes', async () => {
    await expect(seal(Buffer.alloc(16, 1).toString('base64url'), { a: 1 })).rejects.toThrow(/32 bytes/);
  });

  it('unseal returns undefined (never throws) for a wrong-length key or garbage input', async () => {
    const s = await seal(KEY, { a: 1 });
    await expect(unseal(Buffer.alloc(16, 1).toString('base64url'), s)).resolves.toBeUndefined();
    await expect(unseal(KEY, 'not-a-valid-sealed-value')).resolves.toBeUndefined();
    await expect(unseal(KEY, '')).resolves.toBeUndefined();
  });
});

describe('MemorySessionStore', () => {
  it('deletes every session of a sid and forgets expired ones', async () => {
    const store = new MemorySessionStore();
    await store.set('s1', { sid: 'x', sealed: 'a', expiresAt: Date.now() + 60_000 });
    await store.set('s2', { sid: 'x', sealed: 'b', expiresAt: Date.now() + 60_000 });
    await store.set('s3', { sid: 'y', sealed: 'c', expiresAt: Date.now() - 1 });
    expect(await store.deleteBySid('x')).toBe(2);
    expect(await store.get('s1')).toBeUndefined();
    expect(await store.get('s3')).toBeUndefined();
  });

  it('moves an id to its new sid bucket on re-set and drops the old bucket once empty', async () => {
    const store = new MemorySessionStore();
    await store.set('s1', { sid: 'x', sealed: 'a', expiresAt: Date.now() + 60_000 });
    await store.set('s1', { sid: 'y', sealed: 'b', expiresAt: Date.now() + 60_000 });
    expect(await store.deleteBySid('x')).toBe(0);
    expect(await store.deleteBySid('y')).toBe(1);
  });

  it('delete removes a single id without disturbing siblings under the same sid', async () => {
    const store = new MemorySessionStore();
    await store.set('s1', { sid: 'x', sealed: 'a', expiresAt: Date.now() + 60_000 });
    await store.set('s2', { sid: 'x', sealed: 'b', expiresAt: Date.now() + 60_000 });
    await store.delete('s1');
    expect(await store.get('s1')).toBeUndefined();
    expect(await store.get('s2')).toBeDefined();
    expect(await store.deleteBySid('x')).toBe(1);
  });

  it('deleteBySid on an unknown sid is a no-op that returns 0', async () => {
    const store = new MemorySessionStore();
    expect(await store.deleteBySid('nope')).toBe(0);
  });
});

describe('cookies', () => {
  it('uses the __Host- prefix only when secure', () => {
    expect(cookieHeader('__Host-agentflow_session', 'v', { maxAge: 10, secure: true }))
      .toBe('__Host-agentflow_session=v; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=10');
    const req = new Request('https://x.test/', { headers: { cookie: 'a=1; __Host-agentflow_session=abc' } });
    expect(readCookie(req, '__Host-agentflow_session')).toBe('abc');
  });

  it('omits Secure when the cookie is not secure', () => {
    expect(cookieHeader('agentflow_session', 'v', { maxAge: 5, secure: false }))
      .toBe('agentflow_session=v; Path=/; HttpOnly; SameSite=Lax; Max-Age=5');
  });

  it('does not match a cookie whose name merely ends with the requested name', () => {
    const req = new Request('https://x.test/', {
      headers: { cookie: 'other__Host-agentflow_session=wrong; __Host-agentflow_session=right' },
    });
    expect(readCookie(req, '__Host-agentflow_session')).toBe('right');
  });

  it('returns undefined when the cookie header is absent or the name is missing', () => {
    expect(readCookie(new Request('https://x.test/'), '__Host-agentflow_session')).toBeUndefined();
    const req = new Request('https://x.test/', { headers: { cookie: 'a=1' } });
    expect(readCookie(req, '__Host-agentflow_session')).toBeUndefined();
  });
});
