import { describe, it, expect } from 'vitest';

// Tiny smoke test — confirms the runner discovers tests, the config
// resolves, and `npm test` exits 0 on a fresh install. Phase 2 will
// add real tests for filterTimeCode, the URL parser, and the
// next/previous song index math.
describe('vitest setup', () => {
  it('runs and reports passing tests', () => {
    expect(1 + 1).toBe(2);
  });
});
