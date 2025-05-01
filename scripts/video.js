const video = document.getElementById('clouds');
const source = document.getElementById('videoSrc');

const local = "media/clouds.mp4";
const github = "https://raw.githubusercontent.com/skyecielomusic/website-assets/main/clouds.mp4";
const dropbox = "https://www.dropbox.com/scl/fi/1smryxq9lc2x8t3dkv0oq/clouds.mp4?rlkey=jyfn3kqr8v5xbg57pb20yezqb&st=jiiqkfy4&raw=1";

function trySource(srcList) {
  if (!srcList.length) return; // no sources left

  const src = srcList.shift();
  source.src = src;

  video.load();
  video.play().catch(() => {
    // Try next source on error
    trySource(srcList);
  });
}

const isLocal = location.hostname === "localhost" || location.hostname === "";

// Start trying sources in order
const sources = isLocal ? [local, github, dropbox] : [github, dropbox];
trySource([...sources]);