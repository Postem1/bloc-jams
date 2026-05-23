// Player controller for album.html. Vanilla DOM + native <audio>;
// no jQuery, no Buzz. Imports the pure helpers extracted in Phase 2
// for time formatting, URL → album resolution, and next/prev index
// math (all covered by the vitest suite).

import { albums, defaultAlbumId, albumPicasso } from './fixtures.js';
import { filterTimeCode } from './lib/format.js';
import { resolveAlbumFromUrl } from './lib/album-selection.js';
import {
  getNextSongPositions,
  getPreviousSongPositions
} from './lib/track-navigation.js';

// ---- inner-content snippets (swap into existing <button> wrappers) ----
const PLAY_ICON = '<span class="ion-play" aria-hidden="true"></span>';
const PAUSE_ICON = '<span class="ion-pause" aria-hidden="true"></span>';

// ---- module state ----
let currentlyPlayingSongNumber = null;
let currentAlbum = null;
let currentSongFromAlbum = null;
let currentSoundFile = null; // HTMLAudioElement
let currentVolume = 50;      // 0–100; converted to 0–1 for audio.volume

// HTMLAudioElement doesn't have an .unbind('event') that drops every
// listener for a given event name (like Buzz did), so we keep a
// reference to the active timeupdate listener and remove it
// explicitly before adding a new one.
let timeUpdateHandler = null;

// ---- cached DOM refs (populated by init()) ----
let previousButton = null;
let playPauseButton = null;
let nextButton = null;

// ---- tiny DOM helpers ----
function $(selector, root = document) {
  return root.querySelector(selector);
}

function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

// Parse a snippet of HTML into a single detached element. Uses a
// <template> so things like <tr> outside a <table> parse correctly.
function elementFromHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

// ---- low-level audio ops ----
function seek(time) {
  if (currentSoundFile) {
    currentSoundFile.currentTime = time;
  }
}

function setVolume(volume) {
  if (currentSoundFile) {
    // HTMLAudioElement.volume is 0–1 and throws on out-of-range;
    // callers pass 0–100 to match the UI percentage.
    currentSoundFile.volume = Math.max(0, Math.min(1, volume / 100));
  }
}

// ---- per-song button helpers ----
//
// Each song row's number cell contains a real <button>, so keyboard
// users can tab to it and press Enter/Space to play. Its visible
// content swaps between the song number (idle), play icon
// (hover/focus), and pause icon (currently playing).

function songButtonMarkup(songNumber) {
  return `<button type="button" class="album-song-button" data-song-number="${songNumber}" aria-label="Play song ${songNumber}">${songNumber}</button>`;
}

function getSongButton(songNumber) {
  return $(`.album-song-button[data-song-number="${songNumber}"]`);
}

function setSongButton(btn, state) {
  if (!btn) return;
  const songNumber = parseInt(btn.getAttribute('data-song-number'), 10);
  if (state === 'play') {
    btn.innerHTML = PLAY_ICON;
    btn.setAttribute('aria-label', `Play song ${songNumber}`);
  } else if (state === 'pause') {
    btn.innerHTML = PAUSE_ICON;
    btn.setAttribute('aria-label', `Pause song ${songNumber}`);
  } else {
    btn.textContent = String(songNumber);
    btn.setAttribute('aria-label', `Play song ${songNumber}`);
  }
}

// ---- player-bar play-pause helper ----
function setPlayPauseButton(state) {
  if (state === 'playing') {
    playPauseButton.innerHTML = PAUSE_ICON;
    playPauseButton.setAttribute('aria-label', 'Pause');
  } else {
    playPauseButton.innerHTML = PLAY_ICON;
    playPauseButton.setAttribute('aria-label', 'Play');
  }
}

// ---- main playback ops ----
function setSong(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.pause();
  }
  // New audio element → reset the listener ref so
  // updateSeekBarWhileSongPlays doesn't try to remove a stale handler.
  timeUpdateHandler = null;

  currentlyPlayingSongNumber = parseInt(songNumber, 10);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new Audio(currentSongFromAlbum.audioUrl);
  currentSoundFile.preload = 'auto';
  setVolume(currentVolume);
}

function updatePlayerBarSong() {
  $('.currently-playing .song-name').textContent = currentSongFromAlbum.title;
  $('.currently-playing .artist-name').textContent = currentAlbum.artist;
  $('.currently-playing .artist-song-mobile').textContent =
    `${currentSongFromAlbum.title} - ${currentAlbum.artist}`;
  setPlayPauseButton('playing');
  setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
}

// ---- song row construction ----
function createSongRow(songNumber, songName, songLength) {
  const html =
    '<tr class="album-view-song-item">'
    + '<td class="song-item-number">' + songButtonMarkup(songNumber) + '</td>'
    + '<td class="song-item-title">' + songName + '</td>'
    + '<td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    + '</tr>';

  const row = elementFromHtml(html);

  // Click handler — bound to the inner <button>. Enter/Space on the
  // focused button fires a click natively, so mouse + keyboard share
  // this path.
  function clickHandler() {
    const btn = this;
    const songNumber = parseInt(btn.getAttribute('data-song-number'), 10);

    // Revert the previously playing button to its number, if any.
    if (currentlyPlayingSongNumber !== null && currentlyPlayingSongNumber !== songNumber) {
      setSongButton(getSongButton(currentlyPlayingSongNumber), 'number');
    }

    if (currentlyPlayingSongNumber !== songNumber) {
      // Picking a new song.
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
      setSongButton(btn, 'pause');

      // Re-anchor the volume slider visuals to currentVolume.
      const volumeBar = $('.volume .seek-bar');
      volumeBar.querySelector('.fill').style.width = currentVolume + '%';
      volumeBar.querySelector('.thumb').style.left = currentVolume + '%';
      volumeBar.setAttribute('aria-valuenow', String(currentVolume));

      updatePlayerBarSong();
    } else {
      // Re-clicked the currently-loaded song: toggle play/pause.
      if (currentSoundFile.paused) {
        setSongButton(btn, 'pause');
        setPlayPauseButton('playing');
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
      } else {
        setSongButton(btn, 'play');
        setPlayPauseButton('paused');
        currentSoundFile.pause();
      }
    }
  }

  // Show play icon on hover OR focus (keyboard parity). focusin/out
  // bubble (unlike focus/blur), so they fire when a descendant — the
  // song's button — gains/loses focus.
  function onActivate() {
    const btn = this.querySelector('.album-song-button');
    const songNumber = parseInt(btn.getAttribute('data-song-number'), 10);
    if (songNumber !== currentlyPlayingSongNumber) {
      setSongButton(btn, 'play');
    }
  }

  function onDeactivate() {
    const btn = this.querySelector('.album-song-button');
    const songNumber = parseInt(btn.getAttribute('data-song-number'), 10);
    if (songNumber !== currentlyPlayingSongNumber) {
      setSongButton(btn, 'number');
    }
  }

  row.querySelector('.album-song-button').addEventListener('click', clickHandler);
  row.addEventListener('mouseenter', onActivate);
  row.addEventListener('focusin', onActivate);
  row.addEventListener('mouseleave', onDeactivate);
  row.addEventListener('focusout', onDeactivate);

  return row;
}

function setCurrentAlbum(album) {
  currentAlbum = album;
  $('.album-view-title').textContent = album.title;
  $('.album-view-artist').textContent = album.artist;
  $('.album-view-release-info').textContent = `${album.year} ${album.label}`;
  $('.album-cover-art').setAttribute('src', album.albumArtUrl);

  const songList = $('.album-view-song-list');
  songList.replaceChildren(); // clear any prior rows
  for (let i = 0; i < album.songs.length; i++) {
    songList.append(createSongRow(i + 1, album.songs[i].title, album.songs[i].duration));
  }
}

// ---- seek bar plumbing ----
function updateSeekBarWhileSongPlays() {
  if (!currentSoundFile) return;

  if (timeUpdateHandler) {
    currentSoundFile.removeEventListener('timeupdate', timeUpdateHandler);
  }

  timeUpdateHandler = function() {
    // duration is NaN until metadata loads — guard.
    const duration = currentSoundFile.duration;
    const ratio = (duration > 0 && Number.isFinite(duration))
      ? currentSoundFile.currentTime / duration
      : 0;
    updateSeekPercentage($('.seek-control .seek-bar'), ratio);
    setCurrentTimeInPlayerBar(currentSoundFile.currentTime);
  };
  currentSoundFile.addEventListener('timeupdate', timeUpdateHandler);
}

function updateSeekPercentage(seekBar, ratio) {
  const percent = Math.max(0, Math.min(100, ratio * 100));
  const percentString = percent + '%';
  seekBar.querySelector('.fill').style.width = percentString;
  seekBar.querySelector('.thumb').style.left = percentString;
  // Keep aria-valuenow in sync for screen readers / keyboard.
  seekBar.setAttribute('aria-valuenow', String(Math.round(percent)));
}

// Returns 'seek' for the song-progress bar, 'volume' for the volume
// bar — both use the same .seek-bar class so we look at the parent.
function seekBarKind(seekBar) {
  return seekBar.parentElement.classList.contains('seek-control') ? 'seek' : 'volume';
}

// Apply a 0–1 ratio to whichever bar was interacted with: jumps the
// song position or sets player volume. Also updates the visual fill +
// aria-valuenow via updateSeekPercentage.
function applySeekRatio(seekBar, ratio) {
  ratio = Math.max(0, Math.min(1, ratio));
  if (seekBarKind(seekBar) === 'seek') {
    if (currentSoundFile) {
      seek(ratio * currentSoundFile.duration);
    }
  } else {
    const volume = ratio * 100;
    setVolume(volume);
    currentVolume = volume; // persist so the next setSong() respects it
  }
  updateSeekPercentage(seekBar, ratio);
}

function ratioFromPointerEvent(seekBar, event) {
  const rect = seekBar.getBoundingClientRect();
  // pageX includes scroll; rect.left is viewport-relative.
  const offsetX = event.pageX - (rect.left + window.scrollX);
  return offsetX / rect.width;
}

function setupSeekBars() {
  const seekBars = $$('.player-bar .seek-bar');

  seekBars.forEach((seekBar) => {
    // Click anywhere along the bar.
    seekBar.addEventListener('click', function(event) {
      applySeekRatio(this, ratioFromPointerEvent(this, event));
    });

    // Drag the thumb. Listeners on document, scoped to this drag
    // gesture — they remove themselves on mouseup.
    seekBar.querySelector('.thumb').addEventListener('mousedown', () => {
      const bar = seekBar;

      function onMove(event) {
        applySeekRatio(bar, ratioFromPointerEvent(bar, event));
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Keyboard support — WAI-ARIA slider pattern. Arrows nudge 5%,
    // PageUp/Down jump 10%, Home/End jump to extremes.
    seekBar.addEventListener('keydown', function(event) {
      let step;
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          step = -5; break;
        case 'ArrowRight':
        case 'ArrowUp':
          step = 5; break;
        case 'PageDown':
          step = -10; break;
        case 'PageUp':
          step = 10; break;
        case 'Home':
          step = -100; break; // clamps to 0
        case 'End':
          step = 100; break;  // clamps to 100
        default:
          return;
      }
      event.preventDefault();

      const currentValue = parseInt(this.getAttribute('aria-valuenow'), 10) || 0;
      const newValue = Math.max(0, Math.min(100, currentValue + step));
      applySeekRatio(this, newValue / 100);
    });
  });
}

// ---- player bar readouts ----
function setCurrentTimeInPlayerBar(currentTime) {
  if (currentSoundFile) {
    $('.current-time').textContent = filterTimeCode(currentTime);
  }
}

function setTotalTimeInPlayerBar(totalTime) {
  if (currentSoundFile) {
    $('.total-time').textContent = filterTimeCode(totalTime);
  }
}

// ---- player bar control handlers ----
function togglePlayFromPlayerBar() {
  // Cold start: nothing loaded yet. Treat the first ▶ click as
  // "start the album" — load song 1 and play it.
  if (!currentSoundFile) {
    setSong(1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    setSongButton(getSongButton(currentlyPlayingSongNumber), 'pause');
    updatePlayerBarSong(); // flips play-pause to 'playing' too
    return;
  }

  const currentSongBtn = getSongButton(currentlyPlayingSongNumber);

  if (currentSoundFile.paused) {
    setSongButton(currentSongBtn, 'pause');
    setPlayPauseButton('playing');
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
  } else {
    setSongButton(currentSongBtn, 'play');
    setPlayPauseButton('paused');
    currentSoundFile.pause();
  }
}

function trackIndex(album, song) {
  return album.songs.indexOf(song);
}

function nextSong() {
  const currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  const { nextIndex, previousNumber } = getNextSongPositions(currentIndex, currentAlbum.songs.length);

  setSong(nextIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

  setSongButton(getSongButton(currentlyPlayingSongNumber), 'pause');
  if (previousNumber !== null) {
    setSongButton(getSongButton(previousNumber), 'number');
  }
}

function previousSong() {
  const currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  const { nextIndex, previousNumber } = getPreviousSongPositions(currentIndex, currentAlbum.songs.length);

  setSong(nextIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

  setSongButton(getSongButton(currentlyPlayingSongNumber), 'pause');
  if (previousNumber !== null) {
    setSongButton(getSongButton(previousNumber), 'number');
  }
}

// ---- init ----
function init() {
  previousButton = $('.main-controls .previous');
  playPauseButton = $('.main-controls .play-pause');
  nextButton = $('.main-controls .next');

  const album = resolveAlbumFromUrl(window.location.search, albums, defaultAlbumId)
    || albumPicasso;
  if (album) {
    setCurrentAlbum(album);
  } else {
    console.error('No album available — fixtures.js may not have loaded.');
  }

  setupSeekBars();
  previousButton.addEventListener('click', previousSong);
  nextButton.addEventListener('click', nextSong);
  playPauseButton.addEventListener('click', togglePlayFromPlayerBar);
}

// Module scripts are deferred by default, so the DOM is parsed by the
// time this runs. Guard the readyState transition anyway.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
