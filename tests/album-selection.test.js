import { describe, it, expect } from 'vitest';
import {
  parseAlbumIdFromQuery,
  selectAlbum,
  resolveAlbumFromUrl
} from '../scripts/lib/album-selection.js';

describe('parseAlbumIdFromQuery', () => {
  it('returns the album id from a simple query', () => {
    expect(parseAlbumIdFromQuery('?album=picasso')).toBe('picasso');
  });

  it('finds album= when other params are present, in either order', () => {
    expect(parseAlbumIdFromQuery('?foo=bar&album=tesla')).toBe('tesla');
    expect(parseAlbumIdFromQuery('?album=tesla&foo=bar')).toBe('tesla');
    expect(parseAlbumIdFromQuery('?a=1&album=lovelace&b=2')).toBe('lovelace');
  });

  it('decodes percent-encoded values', () => {
    expect(parseAlbumIdFromQuery('?album=hello%20world')).toBe('hello world');
    expect(parseAlbumIdFromQuery('?album=ed%20sheeran')).toBe('ed sheeran');
  });

  it('returns null for missing or empty query', () => {
    expect(parseAlbumIdFromQuery('')).toBeNull();
    expect(parseAlbumIdFromQuery(null)).toBeNull();
    expect(parseAlbumIdFromQuery(undefined)).toBeNull();
    expect(parseAlbumIdFromQuery('?foo=bar')).toBeNull();
  });

  it('returns null when album= is present but empty', () => {
    expect(parseAlbumIdFromQuery('?album=')).toBeNull();
    expect(parseAlbumIdFromQuery('?foo=bar&album=&baz=qux')).toBeNull();
  });

  it('returns the first occurrence if album= appears multiple times', () => {
    expect(parseAlbumIdFromQuery('?album=tesla&album=picasso')).toBe('tesla');
  });

  it('returns null for malformed percent-encoding', () => {
    expect(parseAlbumIdFromQuery('?album=%XX')).toBeNull();
    expect(parseAlbumIdFromQuery('?album=%E0%A4%A')).toBeNull(); // truncated UTF-8 sequence
  });

  it('requires the ? or & prefix — bare "album=x" does not match', () => {
    // Documents the regex behavior: callers should pass the whole
    // search string, not just the param.
    expect(parseAlbumIdFromQuery('album=picasso')).toBeNull();
  });
});

describe('selectAlbum', () => {
  const catalog = {
    picasso: { title: 'The Colors', artist: 'Pablo Picasso' },
    marconi: { title: 'The Telephone', artist: 'Guglielmo Marconi' }
  };

  it('returns the requested album when present in the catalog', () => {
    expect(selectAlbum('picasso', catalog, 'marconi')).toEqual(catalog.picasso);
  });

  it('falls back to default when requested id is null', () => {
    expect(selectAlbum(null, catalog, 'marconi')).toEqual(catalog.marconi);
  });

  it('falls back to default when requested id is unknown', () => {
    expect(selectAlbum('nonexistent', catalog, 'picasso')).toEqual(catalog.picasso);
  });

  it('returns null when neither requested nor default is in catalog', () => {
    expect(selectAlbum('nonexistent', catalog, 'also-missing')).toBeNull();
  });

  it('returns null when catalog is empty', () => {
    expect(selectAlbum('picasso', {}, 'marconi')).toBeNull();
  });

  it('returns null when catalog is missing', () => {
    expect(selectAlbum('picasso', null, 'marconi')).toBeNull();
    expect(selectAlbum('picasso', undefined, 'marconi')).toBeNull();
  });

  it('returns null when default is null and no requested id', () => {
    expect(selectAlbum(null, catalog, null)).toBeNull();
  });
});

describe('resolveAlbumFromUrl', () => {
  const catalog = {
    picasso: { title: 'The Colors' },
    tesla: { title: 'The Currents' }
  };

  it('resolves a valid url + id pair', () => {
    expect(resolveAlbumFromUrl('?album=tesla', catalog, 'picasso')).toEqual(catalog.tesla);
  });

  it('falls back to default for missing query', () => {
    expect(resolveAlbumFromUrl('', catalog, 'picasso')).toEqual(catalog.picasso);
  });

  it('falls back to default for unknown id', () => {
    expect(resolveAlbumFromUrl('?album=bogus', catalog, 'picasso')).toEqual(catalog.picasso);
  });

  it('returns null when nothing resolves', () => {
    expect(resolveAlbumFromUrl('?album=bogus', catalog, 'also-bogus')).toBeNull();
  });

  it('returns null when both query and catalog are empty', () => {
    expect(resolveAlbumFromUrl('', {}, null)).toBeNull();
  });
});
