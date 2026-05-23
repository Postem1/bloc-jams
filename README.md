# Bloc Jams

A Spotify-style digital music player built with vanilla HTML, CSS, and JavaScript. Originally a Bloc front-end curriculum project — since cleaned up for accessibility, security, and a real (instead of placeholder) album catalog.

## Run it locally

There's no build step. Serve the directory with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

(or `npx http-server`, `php -S localhost:8000`, etc.)

Opening `index.html` directly via `file://` mostly works, but some browsers restrict audio playback over `file://` — serving over HTTP is more reliable.

## Pages

| URL | What's there |
| --- | --- |
| `/` (or `index.html`) | Landing page — hero plus three animated selling points |
| `/collection.html` | Catalog grid — one tile per album, links into the player |
| `/album.html?album=<id>` | Player — track list, cover art, transport controls, seek + volume sliders |

`?album=<id>` selects which album to load. Valid ids live in `scripts/fixtures.js` — currently `picasso` (default), `marconi`, `lovelace`, and `tesla`. Missing or unknown ids fall back to the default.

## Project layout

```
.
├── index.html         landing page
├── collection.html    album grid
├── album.html         player
├── scripts/
│   ├── landing.js     reveal animation on landing
│   ├── collection.js  renders the grid from fixtures
│   ├── fixtures.js    album catalog (data only)
│   └── album.js       player controller — state, playback, seek + volume
├── styles/            one stylesheet per page + normalize + player_bar
└── assets/
    ├── images/        backgrounds, logo, album covers
    └── music/         audio files
```

## How it fits together

1. **`fixtures.js`** defines the album catalog and exposes it on a single global namespace: `window.BlocJams.albums`, `window.BlocJams.albumOrder`, and `window.BlocJams.defaultAlbumId`.
2. **`collection.js`** iterates `BlocJams.albumOrder` and renders one tile per album. Each tile links to `album.html?album=<id>`.
3. **`album.js`** reads `?album=` from the URL, looks the id up in `BlocJams.albums`, and drives the player UI. Uses jQuery for DOM manipulation and the [Buzz](https://buzz.jaysalvat.com/) library (loaded from CDN) for audio playback.
4. **`landing.js`** does the staggered reveal of the selling points on the landing page.

State in `album.js` lives in a small set of module-level `var`s: `currentAlbum`, `currentSongFromAlbum`, `currentSoundFile`, `currentlyPlayingSongNumber`, `currentVolume`. Keep mutations inside the helper functions that already touch them.

## Dependencies

All third-party code loads from CDN, with [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) (SRI) hashes for verification:

- jQuery 2.1.3 (HTTPS + SRI)
- Buzz 1.1.10 (HTTPS + SRI) — HTML5 audio wrapper
- Ionicons 2.0.1 (HTTPS + SRI) — icon font
- Open Sans via Google Fonts (HTTPS only; the CSS body varies per User-Agent so SRI doesn't apply)

There's no `package.json` because there's no build pipeline, no JS dependencies to install, and no test suite to run.

## Accessibility

- Transport controls are real `<button>` elements with `aria-label`s.
- The seek and volume bars implement the WAI-ARIA slider pattern (`role="slider"`, `aria-valuemin/max/now`) and support keyboard control:
  - **←/→ or ↑/↓**: ±5%
  - **PageUp/PageDown**: ±10%
  - **Home/End**: 0% / 100%
- Song rows are keyboard-reachable — tab to a row and the play icon appears the same way it does on hover; **Enter** or **Space** plays/pauses.

## Known gaps

- jQuery 2.1.3 and Buzz are both years out of date but currently work as expected. A modern rewrite would drop Buzz in favor of the native `<audio>` API and replace jQuery with vanilla DOM.
- There's no test suite. A small set of vitest/jest unit tests around `filterTimeCode`, `nextSong`/`previousSong` index math, and the `getRequestedAlbum` URL parser would be a sensible next step.
- The collection grid uses a `.fourth` CSS class for layout regardless of how many albums are in the catalog, so the grid only looks balanced when album count is a multiple of 4.

## License

No explicit license file. Originally a Bloc curriculum exercise — treat this as personal practice code.
