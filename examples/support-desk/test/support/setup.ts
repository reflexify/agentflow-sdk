import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// A loaded CI runner renders well past testing-library's one-second default; a find that succeeds still returns at once.
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
});
