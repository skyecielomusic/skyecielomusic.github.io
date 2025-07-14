const artist = document.getElementById("artist");
const title = document.getElementById("title");
const artwork = document.getElementById("artwork");
const play = document.getElementById("play");

const streamUrl = "https://ec7.yesstreaming.net:1965";
const imageURL = "https://ec7.yesstreaming.net:1950"
const interval = 10000;

const audio = document.getElementById('audioPlayer');

audio.addEventListener('play', () => {
  play.style.backgroundImage = "url('images/pause.png')";
});

audio.addEventListener('pause', () => {
  play.style.backgroundImage = "url('images/play.png')";
});

play.addEventListener('click', () => {
  if (audio.paused) {
    audio.src = streamUrl + "/stream";
    audio.load();
    audio.play();
  } else {
    audio.pause();
  }
});

let playlist = [];

async function getPlaylist() {
  try {
    const response = await fetch('data/playlist.json');
    if (!response.ok) throw new Error('Failed to load playlist.');

    playlist = await response.json();
//console.log('Playlist loaded:', playlist);

  } catch (error) {
//console.error('Error loading playlist.json:', error);
    playlist = [];
  }
}

let roster = [];

async function getRoster() {
  try {
    const response = await fetch('data/roster.json');
    if (!response.ok) throw new Error('Failed to load roster.');

    roster = await response.json();
//console.log('Roster loaded:', roster);

  } catch (error) {
//console.error('Error loading roster.json:', error);
    roster = [];
  }
}

async function getTrack() {
  try {

    const response = await fetch(streamUrl + "/status-json.xsl");
    const data = await response.json();

    let fullTitle = "Unknown - Unknown";

    if (Array.isArray(data.icestats.source)) {
      fullTitle = data.icestats.source[0].title || fullTitle;
    } else {
      fullTitle = data.icestats.source.title || fullTitle;
    }

    let [currentArtist, currentTitle] = fullTitle.split(' - ');

    if (!currentTitle) {
      currentArtist = "Unknown";
      currentTitle = fullTitle;
    }

    setArtistName(currentArtist)

    title.textContent = currentTitle.trim();
    updateTitleScroll();

    getArtwork(currentArtist, currentTitle);

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTitle.trim(),
        artist: currentArtist.trim(),
        album: 'Skye Cielo Music',
        artwork: [
          { src: artwork.src, sizes: '512x512', type: 'image/png' }
        ]
      });
    }

  } catch (error) {
    console.error('Error getting track info:', error);
  }

}

function getArtwork(artist, title) {
//console.log(playlist);
  if (!playlist || !playlist.length) {
    artwork.src = 'images/SCM-White.png';
    return;
  }

  const track = playlist.find(item =>
    item.author.trim().toLowerCase() === artist.toLowerCase() &&
    item.title.trim().toLowerCase() === title.toLowerCase()
  );

  if (track && track.image) {
    artwork.src = imageURL + track.image;
  } else {
    artwork.src = 'images/SCM-White.png'; // fallback if artwork missing
  }
}

function setArtistName(currentArtist) {

    const entry = roster.find(item =>
        item.name.trim().toLowerCase() === currentArtist.toLowerCase()
    );

    if (entry && entry.website) {
        artist.textContent = "";
        let link = artist.querySelector("a");
        if (!link) {
            link = document.createElement('a');
        }
        link.href = entry.website;
        link.target = '_blank';
        link.textContent = currentArtist;
        artist.appendChild(link);
    } else {
        artist.textContent = currentArtist.trim();
    }
}

function updateTitleScroll() {
  const wrapper = document.querySelector('.title-wrapper');
  const title = document.getElementById('title');

  // Stop animation and reset styles first
  title.style.animation = 'none';
  title.style.transform = 'translateX(0)';
  title.offsetHeight; // Force reflow

  if (title.scrollWidth > wrapper.clientWidth) {
    // Enable animation again if needed
    title.style.animation = 'scrollTitle 10s linear infinite';
    title.style.animationPlayState = 'running';
  } else {
    title.style.animationPlayState = 'paused';
  }
}

async function startPlayer() {
  await getPlaylist();
  await getRoster();
  await getTrack();
  setInterval(getTrack, interval);
}

startPlayer();