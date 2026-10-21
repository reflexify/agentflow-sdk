import { describe, expect, it } from 'vitest';
import { keepQuery } from '../src/demo-host.js';

describe('the demo host keeps the page\'s own flag on a path the module goes to', () => {
  it.each([
    ['/projects', '?demo', '/projects?demo'],
    ['/p/abc?view=list', '?demo', '/p/abc?view=list&demo'],
    ['/p/abc?view=list#top', '?demo', '/p/abc?view=list&demo#top'],
    ['/', '', '/'],
    ['/', '?other=1', '/'],
    // The module's own query belongs to the path: what the page shows now never comes back into a later one.
    ['/p/abc', '?view=list&demo', '/p/abc?demo'],
    ['/p/abc?view=list', '?demo&view=board', '/p/abc?view=list&demo'],
    ['/p/abc', '?view=list&done=7&demo', '/p/abc?demo'],
  ])('%s with %s is %s', (path, search, expected) => {
    expect(keepQuery(path, search, ['demo'])).toBe(expected);
  });
});
