import { describe, it, expect } from 'vitest';
import { filterTimeCode } from '../scripts/lib/format.js';

describe('filterTimeCode', () => {
  it('zero-pads seconds under 10 when no minutes', () => {
    expect(filterTimeCode(0)).toBe('0:00');
    expect(filterTimeCode(5)).toBe('0:05');
    expect(filterTimeCode(9)).toBe('0:09');
  });

  it('does not zero-pad seconds 10 and above when no minutes', () => {
    expect(filterTimeCode(10)).toBe('0:10');
    expect(filterTimeCode(59)).toBe('0:59');
  });

  it('zero-pads seconds when minutes are present (regression for the bug in the original)', () => {
    // The original inline copy in album.js checked `roundedTime < 10`
    // (total time) instead of `seconds < 10` (the part being padded),
    // so 1:05 came out as "1:5". These cases lock the fix in.
    expect(filterTimeCode(65)).toBe('1:05');
    expect(filterTimeCode(125)).toBe('2:05');
    expect(filterTimeCode(3601)).toBe('60:01');
  });

  it('formats exact minute marks with :00 seconds', () => {
    expect(filterTimeCode(60)).toBe('1:00');
    expect(filterTimeCode(600)).toBe('10:00');
  });

  it('floors fractional seconds', () => {
    expect(filterTimeCode(0.9)).toBe('0:00');
    expect(filterTimeCode(59.99)).toBe('0:59');
    expect(filterTimeCode(161.71)).toBe('2:41');
  });

  it('accepts numeric strings', () => {
    expect(filterTimeCode('65')).toBe('1:05');
    expect(filterTimeCode('161.71')).toBe('2:41');
  });

  it('clamps invalid input to 0:00', () => {
    expect(filterTimeCode(NaN)).toBe('0:00');
    expect(filterTimeCode(-5)).toBe('0:00');
    expect(filterTimeCode('not a number')).toBe('0:00');
    expect(filterTimeCode(null)).toBe('0:00');
    expect(filterTimeCode(undefined)).toBe('0:00');
    expect(filterTimeCode(Infinity)).toBe('0:00');
  });

  it('renders the fixture catalog durations correctly', () => {
    // Real durations from scripts/fixtures.js — sanity check that
    // every song in the default album renders as expected.
    expect(filterTimeCode(161.71)).toBe('2:41'); // Blue
    expect(filterTimeCode(103.96)).toBe('1:43'); // Green
    expect(filterTimeCode(268.45)).toBe('4:28'); // Red
    expect(filterTimeCode(153.14)).toBe('2:33'); // Pink
    expect(filterTimeCode(374.22)).toBe('6:14'); // Magenta
  });
});
