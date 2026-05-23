// Pure formatting helpers. Imported by album.js (in Phase 5) and
// exercised directly by tests/format.test.js.

/**
 * Format a duration in seconds as M:SS — e.g. 65 → "1:05".
 *
 * Seconds are always zero-padded to two digits; minutes are not.
 * Fractional seconds are floored. Invalid / negative input clamps
 * to "0:00".
 *
 * Note: this also fixes a bug in the original inline copy in
 * album.js, which checked `roundedTime < 10` (total time) instead
 * of `seconds < 10` (the part being zero-padded). The old code
 * rendered 65s as "1:5" instead of "1:05".
 */
export function filterTimeCode(timeInSeconds) {
  const parsed = parseFloat(timeInSeconds);
  const total = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return seconds < 10 ? `${minutes}:0${seconds}` : `${minutes}:${seconds}`;
}
