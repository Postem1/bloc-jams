# Bloc Jams

A Spotify-style digital music player built with vanilla HTML, CSS, and JavaScript. Originally a Bloc front-end curriculum project; modernized to drop jQuery and Buzz in favor of native DOM and `<audio>`, with a Vitest test suite and a Vite dev server.

## Run it locally

Install once, then either serve via Vite or run the tests:

```bash
npm install            # one-time

npm run dev            # Vite dev server with hot module reload
                       #   → http://localhost:5173/

npm test               # run the vitest suite once

npm run test:watch     # vitest in watch mode

npm run build          # production build into dist/

npm run preview        # serve the production build
```

ES modules require a real HTTP server (CORS), so `file://` open-in-browser is no longer viable. Use `npm run dev` or any static server pointed at the project root.

## Pages

| URL | What's there |
| --- | --- |
| `/` (or `/index.html`) | Landing page — hero plus three animated selling points |
| `/collection.html` | Catalog grid — one tile per album, links into the player |
| `/album.html?album=<id>` | Player — track list, cover art, transport controls, seek + volume sliders |

`?album=<id>` selects which album to load. Valid ids live in `scripts/fixtures.js` — currently `picasso` (default), `marconi`, `lovelace`, and `tesla`. Missing or unknown ids fall back to the default.

## Project layout

```
.
├── index.html                landing page
├── collection.html           album grid
├── album.html                player
├── package.json              npm scripts + devDeps
├── vite.config.js            multi-page Vite config
├── vitest.config.js          test runner config
├── scripts/
│   ├── landing.js            landing-page reveal animation
│   ├── collection.js         renders the grid from fixtures
│   ├── fixtures.js           album catalog (data only)
│   ├── album.js              player controller — state, playback, seek + volume
│   └── lib/                  pure helpers, unit-tested
│       ├── format.js         filterTimeCode (M:SS formatting)
│       ├── album-selection.js  URL → album resolution
│       └── track-navigation.js  next/previous song index math
├── tests/                    vitest suites mirroring scripts/lib/
├── styles/                   one stylesheet per page + normalize + player_bar
└── assets/
    ├── images/               backgrounds, logo, album covers
    └── music/                .mp3 audio files
```

## How it fits together

1. **`scripts/fixtures.js`** is an ES module that exports the album catalog: `albums` (map keyed by id), `albumOrder` (display order), `defaultAlbumId`.
2. **`scripts/collection.js`** iterates `albumOrder` and renders one tile per album. Each tile links to `album.html?album=<id>`.
3. **`scripts/album.js`** reads `?album=` from the URL via `resolveAlbumFromUrl()` (a pure helper from `scripts/lib/album-selection.js`), looks the id up in `albums`, and drives the player UI. Audio playback uses native `HTMLAudioElement`.
4. **`scripts/landing.js`** does the staggered reveal of the selling points on the landing page.

State in `album.js` lives in a handful of module-level `let` bindings: `currentAlbum`, `currentSongFromAlbum`, `currentSoundFile` (the `<audio>` element), `currentlyPlayingSongNumber`, `currentVolume`, `timeUpdateHandler`. Keep mutations inside the helper functions already in the file.

## Dependencies

**Zero runtime dependencies.** All third-party JS that used to ship over CDN (jQuery, Buzz) is gone. The only remaining third-party assets are:

- **Ionicons 2.0.1** — icon font, loaded over HTTPS with SRI.
- **Open Sans** — via Google Fonts CSS, HTTPS only (CSS body varies per User-Agent so SRI doesn't apply).

Dev dependencies (`npm install` pulls these into `node_modules/`):

- **Vite ^7** — dev server with HMR + production bundler
- **Vitest ^4** — test runner

## Testing

The pure helpers in `scripts/lib/` are covered by vitest. `npm test` runs the full suite once and exits.

```
tests/
├── smoke.test.js               1  test
├── format.test.js              8  tests — filterTimeCode
├── album-selection.test.js    20  tests — URL parser + catalog lookup
└── track-navigation.test.js   15  tests — next/prev song index math
                              ───
                               44  tests total, < 500ms
```

DOM-touching code (the body of `album.js`, `collection.js`, `landing.js`) is not yet covered — exercising it from tests would mean spinning up jsdom and asserting against the DOM tree, which is a bigger undertaking. Manual browser verification is still the right test strategy for those.

## Accessibility

- Transport controls are real `<button>` elements with `aria-label`s.
- The seek and volume bars implement the WAI-ARIA slider pattern (`role="slider"`, `aria-valuemin/max/now`) and support keyboard control:
  - **←/→ or ↑/↓**: ±5%
  - **PageUp/PageDown**: ±10%
  - **Home/End**: 0% / 100%
- Song rows are keyboard-reachable — tab to a row and the play icon appears the same way it does on hover; **Enter** or **Space** plays/pauses.

## Known gaps

- **Touch / pointer events.** The slider drag handlers listen for `mousedown`/`mousemove`/`mouseup`, so dragging on touch devices doesn't update the bar. Tapping on the bar (which fires a `click`) still works. A pointer-events rewrite would unify mouse and touch.
- **DOM-touching code lacks tests.** See note above — `album.js` and `collection.js` are exercised manually in the browser.
- **No ESLint / Prettier.** The codebase is small enough that formatting drift hasn't been a problem yet.
- **Icon font is third-party.** Ionicons is unmaintained as of years ago; a future pass could replace icon font with inline SVGs (or a maintained icon set).

## License

No explicit license file. Originally a Bloc curriculum exercise — treat this as personal practice code.
