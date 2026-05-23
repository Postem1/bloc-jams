// Renders the collection grid from the album catalog. Each tile
// links to album.html?album=<id> so clicking through opens that
// specific album. Vanilla DOM — no jQuery.

import { albums, albumOrder } from './fixtures.js';

function buildCollectionTile(albumId, album) {
  const href = `album.html?album=${encodeURIComponent(albumId)}`;

  const tile = document.createElement('div');
  // Grid handles sizing now (see styles/collection.css). The
  // .column.fourth float-layout classes are gone — they hardcoded
  // a 4-column grid which only looked balanced when the catalog
  // size was a multiple of 4.
  tile.className = 'collection-album-container';

  const img = document.createElement('img');
  img.src = album.albumArtUrl;
  img.alt = `${album.title} album cover`;
  tile.append(img);

  // Caption is structurally identical to the old jQuery version so
  // collection.css's selectors (.caption p, .caption p a.album-name)
  // still apply. Text content is set via .textContent / a TextNode,
  // never via innerHTML — keeps the tile XSS-safe even if the
  // catalog ever comes from a server.
  const info = document.createElement('div');
  info.className = 'collection-album-info caption';

  const p = document.createElement('p');

  const titleLink = document.createElement('a');
  titleLink.className = 'album-name';
  titleLink.href = href;
  titleLink.textContent = album.title;
  p.append(titleLink);

  p.append(document.createElement('br'));

  const artistLink = document.createElement('a');
  artistLink.href = href;
  artistLink.textContent = album.artist;
  p.append(artistLink);

  p.append(document.createElement('br'));
  p.append(document.createTextNode(`${album.songs.length} songs`));

  info.append(p);
  tile.append(info);

  return tile;
}

function init() {
  const container = document.querySelector('.album-covers');
  if (!container) return;
  container.replaceChildren();

  albumOrder.forEach((albumId) => {
    const album = albums[albumId];
    if (album) {
      container.append(buildCollectionTile(albumId, album));
    }
  });
}

// Match the prior $(window).on('load', ...) timing — wait for the
// full window load so any background images styling the page are in
// place before the grid renders. Modules are auto-deferred, so we
// won't miss the load event.
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
