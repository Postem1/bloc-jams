'use strict';

// Static album catalog. In a real app this would come from a server;
// here it's a hardcoded fixture exposed via a single global namespace
// (window.BlocJams) so collection.js can iterate the catalog and
// album.js can resolve an id from the URL ?album= query string.

(function(global) {
    var albumPicasso = {
        title: 'The Colors',
        artist: 'Pablo Picasso',
        label: 'Cubism',
        year: '1881',
        albumArtUrl: 'assets/images/album_covers/01.png',
        songs: [
            { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue' },
            { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green' },
            { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red' },
            { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink' },
            { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta' }
        ]
    };

    var albumMarconi = {
        title: 'The Telephone',
        artist: 'Guglielmo Marconi',
        label: 'EM',
        year: '1909',
        albumArtUrl: 'assets/images/album_covers/20.png',
        songs: [
            { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue' },
            { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green' },
            { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red' },
            { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink' },
            { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta' }
        ]
    };

    var albumLovelace = {
        title: 'The Algorithm',
        artist: 'Ada Lovelace',
        label: 'Analytical',
        year: '1843',
        albumArtUrl: 'assets/images/album_covers/05.png',
        songs: [
            { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue' },
            { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green' },
            { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red' },
            { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink' },
            { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta' }
        ]
    };

    var albumTesla = {
        title: 'The Currents',
        artist: 'Nikola Tesla',
        label: 'Alternating',
        year: '1888',
        albumArtUrl: 'assets/images/album_covers/10.png',
        songs: [
            { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue' },
            { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green' },
            { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red' },
            { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink' },
            { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta' }
        ]
    };

    // Public surface.
    //
    // albums: map keyed by the stable id used in album.html?album=<id>.
    // albumOrder: deterministic list for the collection page grid.
    // defaultAlbumId: shown when the URL has no album= param or an
    //                  unknown one.
    global.BlocJams = global.BlocJams || {};
    global.BlocJams.albums = {
        picasso: albumPicasso,
        marconi: albumMarconi,
        lovelace: albumLovelace,
        tesla: albumTesla
    };
    global.BlocJams.albumOrder = ['picasso', 'marconi', 'lovelace', 'tesla'];
    global.BlocJams.defaultAlbumId = 'picasso';

    // Backward-compat alias: album.js may still reference this global
    // directly in some checkout/branch states. Safe to drop once the
    // codebase is fully on BlocJams.albums.
    global.albumPicasso = albumPicasso;
})(this);
