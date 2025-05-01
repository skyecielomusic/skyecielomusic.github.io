async function loadRoster() {
  try {
    const response = await fetch('data/playlist.json', { cache: 'no-store' });
    const playlist = await response.json();

    let cleanedArtists = {};
    playlist.forEach(item => {
      let name = item.artist.trim();
      name = name.split(/\s*(ft|feat|featuring)\.?\s+/i)[0].trim();
      name = name.split(',')[0].trim();
      let normalized = name.toLowerCase();
      if (normalized.endsWith('s')) {
        normalized = normalized.slice(0, -1);
      }
      if (!cleanedArtists[normalized]) {
        cleanedArtists[normalized] = name;
      }
    });

    let artists = Object.values(cleanedArtists);
    artists.sort((a, b) => a.localeCompare(b));

    const midIndex = Math.ceil(artists.length / 2);
    const leftColumn = artists.slice(0, midIndex);
    const rightColumn = artists.slice(midIndex);

    let tableHTML = '<table id="rosterTable"><tbody>';

    for (let i = 0; i < midIndex; i++) {
      tableHTML += '<tr>';
      tableHTML += `<td class="artist-cell">${leftColumn[i] || ''}</td>`;
      tableHTML += `<td class="artist-cell">${rightColumn[i] || ''}</td>`;
      tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';

    document.getElementById('artistTable').innerHTML = tableHTML;

  } catch (error) {
    console.error('Error loading roster:', error);
    document.getElementById('artistTable').innerHTML = '<p>Unable to load artist roster.</p>';
  }
}