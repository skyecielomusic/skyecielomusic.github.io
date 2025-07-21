async function loadShows() {
  try {
    const response = await fetch('data/shows.json', { cache: 'no-store' });
    const shows = await response.json();

    const container = document.getElementById('shows');

    shows.forEach(show => {
      const card = document.createElement('div');
      card.classList.add('show-card');

      const timesList = show.times.map(t => {
        const local = getLocalDayTime(t.day, t.time);
        return `
          <li>
            <strong>${t.day}:</strong> ${t.time} UTC
            <a href="#" onclick="addToCalendar('${t.day}', '${t.time}', '${show.calendar.name}', '${show.calendar.description}'); return false;" class="calendar-link">📅</a>
            <br>
            <span class="local-time">(Local time: ${local})</span>
          </li>`;
      }).join('');

      const [lead, rest] = show.description.split('\n');

      card.innerHTML = `
        <h3>${show.title}</h3>
        <p><em>${lead}</em></p>
        <p>${rest}</p>
        <h4>Broadcast Times</h4>
        <ul class="broadcast-times">${timesList}</ul>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading shows:', error);
    document.getElementById('shows').innerHTML = '<p>Unable to load shows.</p>';
  }
}

function getLocalDayTime(utcDay, utcTime) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayIndex = daysOfWeek.indexOf(utcDay);
  if (dayIndex === -1) return 'Invalid day';

  const refDate = new Date(Date.UTC(2024, 0, 7 + dayIndex)); // Jan 7, 2024 is a Sunday
  const [hours, minutes] = utcTime.split(':');
  refDate.setUTCHours(parseInt(hours));
  refDate.setUTCMinutes(parseInt(minutes));

  const local = new Date(refDate.toLocaleString('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }));

  const localDay = daysOfWeek[local.getDay()];
  const localTime = local.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  return `${localDay}, ${localTime}`;
}

function addToCalendar(day, time, title, desc) {
  const start = getNextUTCDate(day, time);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // assume 1 hour
  const filename = `${title}-${day}-${time}.ics`.replace(/\s+/g, '-');
  generateICS(title, desc, start, end, filename);
}

function generateICS(title, desc, start, end, filename) {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Skye Cielo Music//Artists Now
BEGIN:VEVENT
UID:${Date.now()}@skyecielomusic.com
DTSTAMP:${toICSDateStr(new Date())}
DTSTART:${toICSDateStr(start)}
DTEND:${toICSDateStr(end)}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:https://skyecielomusic.com
RRULE:FREQ=WEEKLY
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function getNextUTCDate(dayOfWeek, timeStr) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const today = now.getUTCDay();
  const targetDay = daysOfWeek.indexOf(dayOfWeek);

  let diff = targetDay - today;
  if (diff < 0 || (diff === 0 && now.getUTCHours() >= parseInt(timeStr.split(':')[0]))) {
    diff += 7;
  }

  const nextDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff));
  const [hours, minutes] = timeStr.split(':');
  nextDate.setUTCHours(parseInt(hours));
  nextDate.setUTCMinutes(parseInt(minutes));
  nextDate.setUTCSeconds(0);

  return nextDate;
}

function toICSDateStr(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}