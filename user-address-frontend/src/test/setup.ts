import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library keeps the rendered tree in the document; without this
// one test's markup leaks into the queries of the next.
afterEach(() => {
  cleanup();
});
