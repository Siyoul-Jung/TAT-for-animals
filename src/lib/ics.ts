// Minimal RFC 5545 (.ics) generator for a single timed event.
//
// Start/end are emitted in UTC ("…Z"), so every calendar app (Apple, Google,
// Outlook) renders the event in the *recipient's own* timezone automatically.
// That's the whole point: members never have to convert "11:00 AM PT" by hand.

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

// RFC 5545 text escaping: backslash, semicolon, comma, and newlines.
function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Fold lines longer than ~75 chars onto continuation lines (leading space).
// Char-based folding never splits a JS code unit, so multi-byte glyphs stay intact.
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 74) {
    parts.push((i === 0 ? '' : ' ') + line.slice(i, i + 74));
  }
  return parts.join('\r\n');
}

export type IcsEvent = {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  url?: string;
  location?: string;
};

export function buildIcs(ev: IcsEvent): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TAT for Animals//Live Webinar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.uid}`,
    `DTSTAMP:${toIcsUtc(ev.start)}`,
    `DTSTART:${toIcsUtc(ev.start)}`,
    `DTEND:${toIcsUtc(ev.end)}`,
    `SUMMARY:${escapeText(ev.title)}`,
    ev.description ? `DESCRIPTION:${escapeText(ev.description)}` : '',
    ev.location ? `LOCATION:${escapeText(ev.location)}` : '',
    ev.url ? `URL:${escapeText(ev.url)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .map(fold)
    .join('\r\n');
}
