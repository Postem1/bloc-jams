// Static album catalog. ES module — consumers import what they need:
//
//   import { albums, albumOrder, defaultAlbumId } from './fixtures.js';
//
// In a real app this would come from a server; here it's a hardcoded
// fixture sized to fit on one collection-page row (4 albums).

export const albumPicasso = {
    title: 'The Colors',
    artist: 'Pablo Picasso',
    label: 'Cubism',
    year: '1881',
    albumArtUrl: 'assets/images/album_covers/01.png',
    songs: [
        { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue.mp3' },
        { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green.mp3' },
        { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red.mp3' },
        { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink.mp3' },
        { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta.mp3' }
    ]
};

export const albumMarconi = {
    title: 'The Telephone',
    artist: 'Guglielmo Marconi',
    label: 'EM',
    year: '1909',
    albumArtUrl: 'assets/images/album_covers/20.png',
    songs: [
        { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue.mp3' },
        { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green.mp3' },
        { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red.mp3' },
        { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink.mp3' },
        { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta.mp3' }
    ]
};

export const albumLovelace = {
    title: 'The Algorithm',
    artist: 'Ada Lovelace',
    label: 'Analytical',
    year: '1843',
    albumArtUrl: 'assets/images/album_covers/05.png',
    songs: [
        { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue.mp3' },
        { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green.mp3' },
        { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red.mp3' },
        { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink.mp3' },
        { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta.mp3' }
    ]
};

export const albumTesla = {
    title: 'The Currents',
    artist: 'Nikola Tesla',
    label: 'Alternating',
    year: '1888',
    albumArtUrl: 'assets/images/album_covers/10.png',
    songs: [
        { title: 'Blue', duration: 161.71, audioUrl: 'assets/music/blue.mp3' },
        { title: 'Green', duration: 103.96, audioUrl: 'assets/music/green.mp3' },
        { title: 'Red', duration: 268.45, audioUrl: 'assets/music/red.mp3' },
        { title: 'Pink', duration: 153.14, audioUrl: 'assets/music/pink.mp3' },
        { title: 'Magenta', duration: 374.22, audioUrl: 'assets/music/magenta.mp3' }
    ]
};

// Public surface for consumers.
//
//   albums          : map keyed by the stable id used in album.html?album=<id>
//   albumOrder      : deterministic list for the collection page grid
//   defaultAlbumId  : shown when the URL has no album= param or an unknown one
export const albums = {
    picasso: albumPicasso,
    marconi: albumMarconi,
    lovelace: albumLovelace,
    tesla: albumTesla
};
export const albumOrder = ['picasso', 'marconi', 'lovelace', 'tesla'];
export const defaultAlbumId = 'picasso';
