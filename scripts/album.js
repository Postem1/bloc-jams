'use strict';

// ---- inner-content snippets (swap into existing <button> wrappers) ----
var PLAY_ICON = '<span class="ion-play" aria-hidden="true"></span>';
var PAUSE_ICON = '<span class="ion-pause" aria-hidden="true"></span>';

// ---- module state ----
var currentlyPlayingSongNumber = null;
var currentAlbum = null;
var currentSongFromAlbum = null;
var currentSoundFile = null; // buzz.sound instance
var currentVolume = 50;

// ---- cached player-bar selectors ----
var $previousButton = $('.main-controls .previous');
var $playPauseButton = $('.main-controls .play-pause');
var $nextButton = $('.main-controls .next');

// ---- low-level player ops ----
var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

// ---- per-song button helpers ----
//
// Each song row's number cell contains a real <button> (not an <a>), so
// keyboard users can tab to it and press Enter/Space to play. Its
// visible content swaps between the song number (idle), play icon
// (hover/focus), and pause icon (currently playing).
var songButtonMarkup = function(songNumber) {
    return '<button type="button" class="album-song-button" data-song-number="'
        + songNumber + '" aria-label="Play song ' + songNumber + '">'
        + songNumber + '</button>';
};

var getSongButton = function(songNumber) {
    return $('.album-song-button[data-song-number="' + songNumber + '"]');
};

// Drive the button's visible content + aria-label from a single state
// argument so the icon and the announced label can't drift apart.
var setSongButton = function($btn, state) {
    var songNumber = parseInt($btn.attr('data-song-number'), 10);
    if (state === 'play') {
        $btn.html(PLAY_ICON).attr('aria-label', 'Play song ' + songNumber);
    } else if (state === 'pause') {
        $btn.html(PAUSE_ICON).attr('aria-label', 'Pause song ' + songNumber);
    } else { // 'number'
        $btn.html(songNumber).attr('aria-label', 'Play song ' + songNumber);
    }
};

// ---- player-bar play-pause helper ----
var setPlayPauseButton = function(state) {
    // state: 'playing' or 'paused'
    if (state === 'playing') {
        $playPauseButton.html(PAUSE_ICON).attr('aria-label', 'Pause');
    } else {
        $playPauseButton.html(PLAY_ICON).attr('aria-label', 'Play');
    }
};

// ---- main playback ops ----
// assigns value to currentlyPlayingSongNumber and currentSoundFile.  Sets volume level
var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    setVolume(currentVolume);
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    setPlayPauseButton('playing');

    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};

// Creates a row for a song with the song's number in the album, name of the song, the song's length
var createSongRow = function(songNumber, songName, songLength) {

    var template =
        '<tr class="album-view-song-item">'
        + '<td class="song-item-number">' + songButtonMarkup(songNumber) + '</td>'
        + '<td class="song-item-title">' + songName + '</td>'
        + '<td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
        + '</tr>';

    var $row = $(template);

    // Click handler: bound to the inner <button>. Enter/Space on the
    // focused button fires a click event natively, so mouse + keyboard
    // share this path.
    var clickHandler = function() {
        var $btn = $(this);
        var songNumber = parseInt($btn.attr('data-song-number'), 10);

        // Revert the previously playing button to its number, if any.
        if (currentlyPlayingSongNumber !== null && currentlyPlayingSongNumber !== songNumber) {
            setSongButton(getSongButton(currentlyPlayingSongNumber), 'number');
        }

        if (currentlyPlayingSongNumber !== songNumber) {
            // Picking a new song.
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            setSongButton($btn, 'pause');

            // Re-anchor the volume slider visuals to currentVolume.
            var $volumeBar = $('.volume .seek-bar');
            $volumeBar.find('.fill').width(currentVolume + '%');
            $volumeBar.find('.thumb').css({left: currentVolume + '%'});
            $volumeBar.attr('aria-valuenow', currentVolume);

            updatePlayerBarSong();

        } else {
            // Re-clicked the currently-loaded song: toggle play/pause.
            if (currentSoundFile.isPaused()) {
                setSongButton($btn, 'pause');
                setPlayPauseButton('playing');
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                setSongButton($btn, 'play');
                setPlayPauseButton('paused');
                currentSoundFile.pause();
            }
        }
    };

    // Show play icon on hover OR focus (keyboard parity). focusin/out
    // bubble (unlike focus/blur), so they fire when a descendant — i.e.
    // the song's button — gains/loses focus.
    var onActivate = function() {
        var $btn = $(this).find('.album-song-button');
        var songNumber = parseInt($btn.attr('data-song-number'), 10);
        if (songNumber !== currentlyPlayingSongNumber) {
            setSongButton($btn, 'play');
        }
    };

    var onDeactivate = function() {
        var $btn = $(this).find('.album-song-button');
        var songNumber = parseInt($btn.attr('data-song-number'), 10);
        if (songNumber !== currentlyPlayingSongNumber) {
            setSongButton($btn, 'number');
        }
    };

    $row.find('.album-song-button').click(clickHandler);
    $row.on('mouseenter focusin', onActivate);
    $row.on('mouseleave focusout', onDeactivate);

    return $row;
};

var setCurrentAlbum = function(album) { // album is an object with many properties

    currentAlbum = album;

    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    //uses the properties from album object to generate appropriate html for a given album
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    $albumSongList.empty(); // be sure no songs are currently in the element

    // goes through all the songs from the specified album object. Insert them into the HTML, one by one.
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // Unbind any previously-attached timeupdate handler before
        // re-binding — otherwise pause/resume cycles on the same
        // buzz.sound instance accumulate listeners.
        currentSoundFile.unbind('timeupdate');
        //timeupdate is a custom Buzz event that fires repeatedly while time elapses during song playback
        currentSoundFile.bind('timeupdate', function() {
        // We use Buzz's getTime()  to get the current time of the song and
        // getDuration() method for getting the total length of the song. Both values return time in seconds.
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(this.getTime()); // current time element updates with song playback.
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;

    offsetXPercent = Math.max(0, offsetXPercent); // make sure offsetXPercent isn't less than zero
    offsetXPercent = Math.min(100, offsetXPercent);  //make  our percentage isn't greater than 100

    var percentageString = offsetXPercent + '%'; // converts percentage to string to use css

    $seekBar.find('.fill').width(percentageString); //fills bar with background appropriately
    $seekBar.find('.thumb').css({left: percentageString}); // moves the thumb to porportion

    // Keep aria-valuenow in sync with the visual fill so screen readers
    // announce the current position when the slider is focused.
    $seekBar.attr('aria-valuenow', Math.round(offsetXPercent));
};

// Returns 'volume' or 'seek' for a given $seekBar — both use the same
// .seek-bar class so we have to look at the parent control-group.
var seekBarKind = function($seekBar) {
    return $seekBar.parent().hasClass('seek-control') ? 'seek' : 'volume';
};

// Apply a 0–1 ratio to whichever bar was just interacted with: jumps
// the song position or sets the player volume. Also updates the visual
// fill + aria-valuenow via updateSeekPercentage.
var applySeekRatio = function($seekBar, ratio) {
    ratio = Math.max(0, Math.min(1, ratio));
    if (seekBarKind($seekBar) === 'seek') {
        if (currentSoundFile) {
            seek(ratio * currentSoundFile.getDuration());
        }
    } else {
        var volume = ratio * 100;
        setVolume(volume);
        currentVolume = volume; // persist so the next setSong() respects it
    }
    updateSeekPercentage($seekBar, ratio);
};

var setupSeekBars = function() {

    //selects both seek bars
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function(event) { // respond to clicking on a seekbar
        // subtracting $(this).offset().left from the event.pageX value gives us a proportion of the seek bar
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        applySeekRatio($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function() { // place the white ball on a specific location on the seek bar when user press down and drags

        var $seekBar = $(this).parent();  // selects the seekbar that the mousedown event fired on

        // we want to be able to move around the entire document to choose a certain song duration
        $(document).bind('mousemove.thumb', function(event){
        //bind allows us to namespace event listeners.
        //jQuery event namespaces are offset with a period and followed by a string.
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            applySeekRatio($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });

    // Keyboard support — WAI-ARIA slider pattern. Arrow keys nudge by
    // 5%, PageUp/PageDown jump 10%, Home/End jump to extremes.
    $seekBars.on('keydown', function(event) {
        var step;
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

        var currentValue = parseInt($(this).attr('aria-valuenow'), 10) || 0;
        var newValue = Math.max(0, Math.min(100, currentValue + step));
        applySeekRatio($(this), newValue / 100);
    });
};

//takes in time in seconds and return the time in the format X:XX
var filterTimeCode = function(timeInSeconds) {
    var roundedTime = Math.floor(parseFloat(timeInSeconds));
    var minutes = Math.floor(roundedTime / 60);
    var seconds = Math.floor(roundedTime % 60);
    if (roundedTime < 10) {
        return minutes + ':0' + seconds;
    } else {
        return minutes + ':' + seconds;
    }
};

var setCurrentTimeInPlayerBar = function(currentTime) {
    if (currentSoundFile) {
        $('.current-time').text(filterTimeCode(currentTime));
    }
};

//sets the text of the element with the .total-time class to the length of the song
var setTotalTimeInPlayerBar = function(totalTime) {
    if (currentSoundFile) {
        $('.total-time').text(filterTimeCode(totalTime));
    }
};

var togglePlayFromPlayerBar = function() {
    if (!currentSoundFile) return;

    var $currentSongBtn = getSongButton(currentlyPlayingSongNumber);

    if (currentSoundFile.isPaused()) {
        setSongButton($currentSongBtn, 'pause');
        setPlayPauseButton('playing');
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
    } else {
        setSongButton($currentSongBtn, 'play');
        setPlayPauseButton('paused');
        currentSoundFile.pause();
    }
};

//helper function to get a songs position in the songs array
var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

// used for player bar
var nextSong = function() {

    //returns the number of the song that was playing _before_ this transition.
    //If we just wrapped around (new index 0), the previously playing track is the last one.
    var getPreviousSongNumber = function(newIndex) {
        return newIndex === 0 ? currentAlbum.songs.length : newIndex;
    };

    //return (array) index position of current song
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);

    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    var previousSongNumber = getPreviousSongNumber(currentSongIndex);

    // Assigns a new current song number
    setSong(currentSongIndex + 1);

    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();

    //update song buttons after choosing new song
    setSongButton(getSongButton(currentlyPlayingSongNumber), 'pause');
    setSongButton(getSongButton(previousSongNumber), 'number');
};

var previousSong = function() {

    var getPreviousSongNumber = function(newIndex) {
        return newIndex === currentAlbum.songs.length - 1 ? 1 : newIndex + 2;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);

    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    var previousSongNumber = getPreviousSongNumber(currentSongIndex);

    // Set a new current song. assigns value to currentlyPlayingSongNumber and currentSoundFile.  Sets volume level
    setSong(currentSongIndex + 1);

    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();

    setSongButton(getSongButton(currentlyPlayingSongNumber), 'pause');
    setSongButton(getSongButton(previousSongNumber), 'number');
};

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);
});
