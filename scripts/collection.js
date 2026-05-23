// Renders the collection grid from the album catalog. Each tile
// links to album.html?album=<id> so clicking through actually opens
// the right album (previously every tile was an identical placeholder).

import { albums, albumOrder } from './fixtures.js';

function buildCollectionTile(albumId, album) {
    var href = 'album.html?album=' + encodeURIComponent(albumId);

    var $tile = $('<div>').addClass('collection-album-container column fourth');

    var $img = $('<img>').attr({
        src: album.albumArtUrl,
        alt: album.title + ' album cover'
    });
    $tile.append($img);

    // Caption: built with $('<a>').text(...) so album titles and
    // artist names from the fixture are inserted as text, not HTML.
    // If the catalog ever comes from a server or user input, this
    // structure stays safe.
    var $info = $('<div>').addClass('collection-album-info caption');
    var $p = $('<p>');

    $p
        .append($('<a>').addClass('album-name').attr('href', href).text(album.title))
        .append('<br>')
        .append($('<a>').attr('href', href).text(album.artist))
        .append('<br>')
        .append(document.createTextNode(album.songs.length + ' songs'));

    $info.append($p);
    $tile.append($info);

    return $tile;
}

$(window).on('load', function() {
    var $container = $('.album-covers');
    $container.empty();

    albumOrder.forEach(function(albumId) {
        var album = albums[albumId];
        if (album) {
            $container.append(buildCollectionTile(albumId, album));
        }
    });
});
