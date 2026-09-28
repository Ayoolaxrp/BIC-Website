const pad = (n) => String(n).padStart(2, '0');

/** UTC iCalendar basic-format stamp (20261024T110000Z) from a Date */
const icsStamp = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}${pad(d.getUTCMinutes())}00Z`;

/** Leniently parse "Nov 28, 2026" + "12:00 PM" (or DB "12:00 PM - 5:00 PM" ranges). */
const parseWhen = (dateText, timeText) => {
  if (!dateText) return null;
  const t = (timeText || '10:00 AM').split(/\s*[–-]\s*/)[0].trim();
  const d = new Date(`${dateText} ${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const escapeText = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

/**
 * Add to Calendar — real functionality, no service dependency.
 * Works with DB events (event_date/event_time/location) or seed events
 * (display-text date/time/location). Renders a quiet inline control:
 * an .ics download (Apple Calendar, Outlook, Android) plus a Google
 * Calendar link.
 */
export default function AddToCalendar({
  event,
  title,
  dateText,
  timeText,
  locationText,
  descriptionText,
}) {
  const name = title || event?.title || 'BIC Event';
  const start = parseWhen(
    dateText || event?.event_date,
    timeText || event?.event_time,
  );
  if (!start) return null; // no usable date → nothing to add

  const endSource = (timeText || event?.event_time || '').split(/\s*[–-]\s*/)[1];
  const end = parseWhen(dateText || event?.event_date, endSource || '6:00 PM');
  const location = locationText || event?.location || 'Babcock University';
  const description = descriptionText || event?.description || 'Babcock Investors Club event.';
  const dates = `${icsStamp(start)}/${icsStamp(end)}`;

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    name,
  )}&dates=${dates}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(description)}`;

  const downloadIcs = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Babcock Investors Club//Site//EN',
      'BEGIN:VEVENT',
      `UID:bic-${Date.now()}@babcockinvestorsclub`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${escapeText(name)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `LOCATION:${escapeText(location)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="atc">
      <button type="button" className="atc-btn" onClick={downloadIcs}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Add to Calendar
      </button>
      <a className="atc-link" href={googleUrl} target="_blank" rel="noreferrer">
        Google ↗
      </a>
    </div>
  );
}
