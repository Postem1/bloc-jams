import { defineConfig } from 'vitest/config';

// Phase 2 tests are pure functions (filterTimeCode, the URL parser,
// next/prev index math) so the default `node` environment is enough.
// When Phase 5 starts testing DOM-touching code, switch to 'jsdom'
// (already a transitive dep via vitest).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
});
