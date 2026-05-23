// Decide which album to render given the URL the user landed on
// plus the catalog from fixtures.
//
// All three exports are pure — no window, no DOM access. The
// thin wrapper in album.js that reads window.location.search and
// window.BlocJams.albums will go away in Phase 5.

/**
 * Extract the value of the `album` query parameter from a search
 * string. Returns null when missing, empty, or malformed.
 *
 * @param {string|null|undefined} searchString — e.g. "?album=picasso&foo=bar"
 * @returns {string|null}
 */
export function parseAlbumIdFromQuery(searchString) {
  if (!searchString) return null;
  const match = /[?&]album=([^&]*)/.exec(searchString);
  if (!match) return null;
  const raw = match[1];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    // Malformed percent-encoding — treat as missing.
    return null;
  }
}

/**
 * Pick the album to load: prefer the requested id, fall back to
 * the catalog's default, return null if neither resolves.
 *
 * @param {string|null} requestedId
 * @param {object|null|undefined} catalog — { [id]: albumObject }
 * @param {string|null|undefined} defaultId
 * @returns {object|null}
 */
export function selectAlbum(requestedId, catalog, defaultId) {
  if (!catalog || typeof catalog !== 'object') return null;
  if (requestedId && catalog[requestedId]) return catalog[requestedId];
  if (defaultId && catalog[defaultId]) return catalog[defaultId];
  return null;
}

/**
 * Convenience wrapper that composes the two — what album.js's
 * old getRequestedAlbum() did, but with all dependencies passed
 * in so it's trivially testable.
 *
 * @param {string|null|undefined} searchString
 * @param {object|null|undefined} catalog
 * @param {string|null|undefined} defaultId
 * @returns {object|null}
 */
export function resolveAlbumFromUrl(searchString, catalog, defaultId) {
  return selectAlbum(parseAlbumIdFromQuery(searchString), catalog, defaultId);
}
