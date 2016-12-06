    //create Javascript objects to represent albums
    var albumPicasso = {
        title: 'The Colors',
        artist: 'Pablo Picasso',
        label: 'Cubism',
        year: '1881',
        albumArtUrl: 'assets/images/album_covers/01.png',
        songs: [
            { title: 'Blue', duration: '4:26' },
            { title: 'Green', duration: '3:14' },
            { title: 'Red', duration: '5:01' },
            { title: 'Pink', duration: '3:21'},
            { title: 'Magenta', duration: '2:15'}
        ]
    };

    var albumMarconi = {
        title: 'The Telephone',
        artist: 'Guglielmo Marconi',
        label: 'EM',
        year: '1909',
        albumArtUrl: 'assets/images/album_covers/20.png',
        songs: [
            { title: 'Hello, Operator?', duration: '1:01' },
            { title: 'Ring, ring, ring', duration: '5:01' },
            { title: 'Fits in your pocket', duration: '3:21'},
            { title: 'Can you hear me now?', duration: '3:14' },
            { title: 'Wrong phone number', duration: '2:15'}
        ]
    };

    //function to generate song row content
    // will use information stored in album objects
    var createSongRow = function(songNumber, songName, songLength) {
        var template =
            '<tr class="album-view-song-item">'
            + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
            + '  <td class="song-item-title">' + songName + '</td>'
            + '  <td class="song-item-duration">' + songLength + '</td>'
            + '</tr>'
        ;
        return $(template);
    };

    //Will take one our album objects as an argument
    //will utilize the object's stored information by injecting it into the template
    var setCurrentAlbum = function(album) {

        var $albumTitle = $('.album-view-title');
        var $albumArtist = $('.album-view-artist');
        var $albumReleaseInfo =$('.album-view-release-info');
        var $albumImage = $('.album-cover-art');
        var $albumSongList = $('.album-view-song-list');

        //nodeValue used to set the value of the text node
        $albumTitle.text(album.title);
        $albumArtist.text(album.artist);
        $albumReleaseInfo.text(album.year + ' ' + album.label);
        $albumImage.attr('src', album.albumArtUrl);

        $albumSongList.empty;

        // to go through all the songs from the specified album object
        //insert them into the HTML using the innerHTML property.
        for (var i = 0; i < album.songs.length; i++) {
            var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
            $albumSongList.append($newRow);        
        }
    };

    // select the table containing all the songs in the album
    var songListContainer = document.getElementsByClassName('album-view-song-list')[0];

    // HTML Collection of all the songs in the album
    var songRows = document.getElementsByClassName('album-view-song-item');

    var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';

    var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

    //  // Store which song is playing
    var currentlyPlayingSong = null;

// When we click to play, switch, or pause a song (anywhere in the row),
//change the innerHTML of the element with the .song-item-number class to show play, pause, etc.
//must traverse the dom to see if the clicked element matches a particular class

var findParentByClassName = function(element, targetClass) {
    if (element) {

        var currentParent = element.parentElement;

        while (currentParent.className != targetClass && currentParent.className !== null) {
            currentParent = currentParent.parentElement;
        }
        return currentParent;
    }
};

// find and select .song-item-number (td node element) depending on what element is clicked in a song row
var getSongItem = function(element) {
    switch (element.className) {
        case 'album-song-button':
        case 'ion-play':
        case 'ion-pause':
            return findParentByClassName(element, 'song-item-number');
        case 'album-view-song-item':
            return element.querySelector('.song-item-number');
        case 'song-item-title':
        case 'song-item-duration':
            return findParentByClassName(element, 'album-view-song-item').querySelector('.song-item-number');
        case 'song-item-number':
            return element;
        default:
            return;
    }
};

var clickHandler = function(targetElement) {

    //Selects the td node element(.song-item-number) if any element is clicked in a row
    var songItem = getSongItem(targetElement);

    //if no song is playing, and a click happens
    // sets .song-item-number to a pause button
    //variable of currentlyPlayingSong is the td's data-song-number

    if (currentlyPlayingSong === null) {
        songItem.innerHTML = pauseButtonTemplate;
        currentlyPlayingSong = songItem.getAttribute('data-song-number');

        // if the playing song is clicked again.
        // conditional to revert the button back to a play button
        // Set currentlyPlayingSong to null after

    } else if (currentlyPlayingSong === songItem.getAttribute('data-song-number')) {
        songItem.innerHTML = playButtonTemplate;
        currentlyPlayingSong = null;

        //If the clicked song is not the active song,
        //set the content of the new song to the pause button

    } else if (currentlyPlayingSong !== songItem.getAttribute('data-song-number')) {
        var currentlyPlayingSongElement = document.querySelector('[data-song-number="' + currentlyPlayingSong + '"]');
        currentlyPlayingSongElement.innerHTML = currentlyPlayingSongElement.getAttribute('data-song-number');
        songItem.innerHTML = pauseButtonTemplate;
        currentlyPlayingSong = songItem.getAttribute('data-song-number');
    }

};


window.onload = function() {
    setCurrentAlbum(albumPicasso);

    //add mouseover event listener to table of songs.
    //on mouse over, Select td of .song-item-number.
    //Change td into play button if song isnt currently playing

    songListContainer.addEventListener('mouseover', function(event) {
        if (event.target.parentElement.className === 'album-view-song-item') {
            var songItem = getSongItem(event.target);
            if (songItem.getAttribute('data-song-number') !== currentlyPlayingSong) {
                songItem.innerHTML = playButtonTemplate;
            }
        }
    });

    // add mouseleave event listener to each row
    // After mouse leaves the song row, unclicked,
    //set the content of the song-item-number table data to the song number
    // if song isn't currently playing

    for (var i = 0; i < songRows.length; i++) {
        songRows[i].addEventListener('mouseleave', function(event) {
            var songItem = getSongItem(event.target);
            var songItemNumber = songItem.getAttribute('data-song-number');
            if (songItemNumber !== currentlyPlayingSong) {
                songItem.innerHTML = songItemNumber;
            }
        });

        // If user clicks anywhere in the table,
        // clickHandler runs for that particular element
        songRows[i].addEventListener('click', function(event) {
            clickHandler(event.target);
        });
    };
};
