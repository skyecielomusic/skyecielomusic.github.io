async function loadRoster() {
  try {
    const response = await fetch('data/roster.json', { cache: 'no-store' });
    const roster = await response.json();

    const midIndex = Math.ceil(roster.length / 2);
    const leftColumn = roster.slice(0, midIndex);
    const rightColumn = roster.slice(midIndex);

    let tableHTML = '<table id="rosterTable"><tbody>';

    for (let i = 0; i < midIndex; i++) {
      tableHTML += '<tr>';

      let leftColumnValue = leftColumn[i].name
      if (leftColumn[i].website) {
        leftColumnValue = `<a href="${leftColumn[i].website}" target="_blank">${leftColumn[i].name}</a>`
      }
      tableHTML += `<td class="artist-cell">${leftColumnValue || ''}</td>`;

      let rightColumnValue = rightColumn[i].name
      if (rightColumn[i].website) {
        rightColumnValue = `<a href="${rightColumn[i].website}" target="_blank">${rightColumn[i].name}</a>`
      }
      tableHTML += `<td class="artist-cell">${rightColumnValue || ''}</td>`;
      tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';

    document.getElementById('artistTable').innerHTML = tableHTML;

  } catch (error) {
    console.error('Error loading roster:', error);
    document.getElementById('artistTable').innerHTML = '<p>Unable to load artist roster.</p>';
  }
}