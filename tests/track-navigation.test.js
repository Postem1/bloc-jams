import { describe, it, expect } from 'vitest';
import {
  getNextSongPositions,
  getPreviousSongPositions
} from '../scripts/lib/track-navigation.js';

describe('getNextSongPositions', () => {
  it('advances by one in the middle of an album', () => {
    expect(getNextSongPositions(0, 5)).toEqual({
      nextIndex: 1, nextNumber: 2, previousNumber: 1
    });
    expect(getNextSongPositions(2, 5)).toEqual({
      nextIndex: 3, nextNumber: 4, previousNumber: 3
    });
  });

  it('wraps from the last track to the first', () => {
    expect(getNextSongPositions(4, 5)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: 5
    });
  });

  it('treats cold start (-1) as "play the first track"', () => {
    // No song loaded yet; "next" should land on track 1 with no
    // previous song to revert.
    expect(getNextSongPositions(-1, 5)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: null
    });
  });

  it('snaps a deeply-negative currentIndex back to track 1 (defensive)', () => {
    expect(getNextSongPositions(-10, 5)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: null
    });
  });

  it('snaps an out-of-range positive currentIndex back to track 1 (defensive)', () => {
    expect(getNextSongPositions(100, 5)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: null
    });
  });

  it('handles a single-song album by staying on track 1', () => {
    expect(getNextSongPositions(0, 1)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: 1
    });
  });

  it('handles a two-song album', () => {
    expect(getNextSongPositions(0, 2)).toEqual({
      nextIndex: 1, nextNumber: 2, previousNumber: 1
    });
    expect(getNextSongPositions(1, 2)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: 2
    });
  });

  it('returns null positions for an empty album', () => {
    expect(getNextSongPositions(0, 0)).toEqual({
      nextIndex: 0, nextNumber: 0, previousNumber: null
    });
    expect(getNextSongPositions(-1, 0)).toEqual({
      nextIndex: 0, nextNumber: 0, previousNumber: null
    });
  });
});

describe('getPreviousSongPositions', () => {
  it('decrements by one in the middle of an album', () => {
    expect(getPreviousSongPositions(2, 5)).toEqual({
      nextIndex: 1, nextNumber: 2, previousNumber: 3
    });
    expect(getPreviousSongPositions(4, 5)).toEqual({
      nextIndex: 3, nextNumber: 4, previousNumber: 5
    });
  });

  it('wraps from the first track to the last', () => {
    expect(getPreviousSongPositions(0, 5)).toEqual({
      nextIndex: 4, nextNumber: 5, previousNumber: 1
    });
  });

  it('treats cold start (-1) as "play the last track" — matches original album.js', () => {
    // The original code did currentIndex--, then "if < 0, reset to
    // length-1". For cold start (-1), that lands on length-1 = the
    // last track. Documenting that behavior here so any future
    // refactor preserves it (or knowingly changes it).
    expect(getPreviousSongPositions(-1, 5)).toEqual({
      nextIndex: 4, nextNumber: 5, previousNumber: null
    });
  });

  it('handles a single-song album by staying on track 1', () => {
    expect(getPreviousSongPositions(0, 1)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: 1
    });
  });

  it('handles a two-song album', () => {
    expect(getPreviousSongPositions(1, 2)).toEqual({
      nextIndex: 0, nextNumber: 1, previousNumber: 2
    });
    expect(getPreviousSongPositions(0, 2)).toEqual({
      nextIndex: 1, nextNumber: 2, previousNumber: 1
    });
  });

  it('returns null positions for an empty album', () => {
    expect(getPreviousSongPositions(0, 0)).toEqual({
      nextIndex: 0, nextNumber: 0, previousNumber: null
    });
  });
});

describe('round-trip — next then previous returns to start', () => {
  // Property test: for any starting index, getNext then
  // getPrevious should land on the original index (or a position
  // equivalent under wrap).
  it('next-then-previous from each track of a 5-song album', () => {
    for (let i = 0; i < 5; i++) {
      const next = getNextSongPositions(i, 5);
      const back = getPreviousSongPositions(next.nextIndex, 5);
      expect(back.nextIndex).toBe(i);
    }
  });
});
