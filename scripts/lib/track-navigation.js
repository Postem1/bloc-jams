// Pure index / song-number math for "play next song" /
// "play previous song". No DOM, no audio object — just the
// arithmetic the album controller uses to know which song to
// load next and which song-row button needs its pause icon
// reverted to a plain number.
//
// Indices are 0-based (matches the JS Array). Song NUMBERS are
// 1-based (matches what users see in the song list).
//
// Cold-start convention: callers pass currentIndex = -1 to
// indicate "nothing playing yet" (matches the result of
// Array.indexOf for an unset currentSongFromAlbum).

/**
 * @typedef {object} Positions
 * @property {number} nextIndex — the new 0-based array index to load
 * @property {number} nextNumber — the new 1-based song number
 * @property {number|null} previousNumber — the 1-based number of the
 *           song that was playing BEFORE this transition (whose UI
 *           button needs its pause icon reverted). null when nothing
 *           was playing yet (cold start).
 */

/**
 * Decide which song "Next" should advance to.
 *
 * @param {number} currentIndex
 * @param {number} length — number of songs in the album
 * @returns {Positions}
 */
export function getNextSongPositions(currentIndex, length) {
  if (length <= 0) {
    return { nextIndex: 0, nextNumber: 0, previousNumber: null };
  }

  let nextIndex = currentIndex + 1;
  if (nextIndex >= length || nextIndex < 0) {
    // Wrap from the last track to the first, OR snap a very-negative
    // currentIndex (defensive) back to the start.
    nextIndex = 0;
  }

  return {
    nextIndex,
    nextNumber: nextIndex + 1,
    previousNumber: hadPrevious(currentIndex, length)
      ? currentIndex + 1
      : null
  };
}

/**
 * Decide which song "Previous" should rewind to.
 *
 * @param {number} currentIndex
 * @param {number} length
 * @returns {Positions}
 */
export function getPreviousSongPositions(currentIndex, length) {
  if (length <= 0) {
    return { nextIndex: 0, nextNumber: 0, previousNumber: null };
  }

  let nextIndex = currentIndex - 1;
  if (nextIndex < 0) {
    // Wrap from the first track to the last. Also catches cold-start
    // (-1 → -2 → length-1), matching the original album.js behavior:
    // "previous" with no song loaded lands on the LAST track.
    nextIndex = length - 1;
  }

  return {
    nextIndex,
    nextNumber: nextIndex + 1,
    previousNumber: hadPrevious(currentIndex, length)
      ? currentIndex + 1
      : null
  };
}

function hadPrevious(currentIndex, length) {
  return currentIndex >= 0 && currentIndex < length;
}
