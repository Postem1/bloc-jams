## Purpose

This repository is a small static front-end demo (HTML/CSS/JS) that implements a simple music player UI. These instructions give an AI coding agent the minimal, concrete, and project-specific knowledge needed to be productive without guesswork.

## Big Picture

- Structure: three main pages — `index.html` (landing), `collection.html` (gallery), and `album.html` (player). Core logic lives in `scripts/` and styles in `styles/`.
- Data: `scripts/fixtures.js` contains sample album objects (e.g. `albumPicasso`) used by `album.js` and `collection.js` to render UI.
- Audio: `scripts/album.js` manages playback state via global variables (`currentAlbum`, `currentSongFromAlbum`, `currentSoundFile`, `currentlyPlayingSongNumber`) and uses the Buzz audio library (included in `album.html`).

## Key Files & Patterns (quick reference)

- `index.html` — landing page; includes `scripts/landing.js` and jQuery.
- `collection.html` — builds album thumbnails via `scripts/collection.js`.
- `album.html` — audio player markup and includes `fixtures.js`, `album.js`, and `buzz.min.js`.
- `scripts/fixtures.js` — canonical source for album/sample data objects and `audioUrl` paths.
- `scripts/album.js` — player logic: DOM manipulation with jQuery, seek/volume controls, play/pause/next/prev, and uses Buzz API (`new buzz.sound(...)`).
- `scripts/collection.js` — simple template strings appended to DOM on window load.

## Conventions & Developer Expectations

- No build tool: this is a plain static site. Changes are tested by serving the directory and opening pages in a browser.
- DOM-first jQuery style: templates are plain HTML strings, appended with jQuery. Event handlers are attached directly to those elements.
- Global state is used in `album.js`. When modifying playback logic, update all usages of `currentSoundFile`, `currentlyPlayingSongNumber`, and `currentAlbum` consistently.
- Audio paths point to `assets/music/*` (check `fixtures.js` for examples). The project expects `.mp3` audio and the Buzz library for playback control.

## How to Run / Debug Locally

1. From the repo root run a static server (examples):

   - `python3 -m http.server 8000`
   - or `npx http-server` (if node installed)

2. Open `http://localhost:8000/index.html` (or open `album.html` directly) and use browser DevTools Console for logging and breakpoints.

3. To test player flows, open `album.html` (it includes Buzz) so audio playback features are available.

## Common Code Tasks — What to change and where

- Add/edit sample data: update `scripts/fixtures.js` (album objects and `audioUrl` fields).
- Change player UI behavior: modify `scripts/album.js` (search for `setSong`, `updatePlayerBarSong`, `createSongRow`). Pay attention to DOM selectors like `.album-view-song-list` and `.main-controls .play-pause`.
- Change collection thumbnails: update `scripts/collection.js` and the HTML template returned by `buildCollectionItemTemplate`.

## Helpful Examples (copyable)

- Set the current album in tests/dev console:

  `setCurrentAlbum(albumPicasso);`

- Play the next song from the console:

  `nextSong();`

## Do/Don't

- Do: Keep changes simple and DOM-focused; follow existing jQuery/template patterns.
- Don't: Introduce a bundler or module system unless you update all pages and add a clear migration path — this project is intentionally unbundled.

## If You Need More Context

- Inspect `album.html` for the player markup and where libraries are included.
- Use browser DevTools to trace event handlers (search for `.album-song-button`, `.play-pause`, `.seek-bar`).

If any of these sections are unclear or you'd like additional examples, tell me which area to expand.
