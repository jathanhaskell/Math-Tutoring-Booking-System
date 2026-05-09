// Shared logic for the booking system.
// Loaded by both index.html (student) and admin.html (tutor).

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

async function loadJSON(path) {
  const res = await fetch(path + '?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load ' + path + ': ' + res.status);
  return res.json();
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(mins) {
  return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
}

function isoDate(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function parseISODate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function dayName(d) { return DAY_NAMES[d.getDay()]; }

function formatDateLong(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(hhmm) { return hhmm; }

// Returns array of {date: 'YYYY-MM-DD', startTime: 'HH:MM', endTime: 'HH:MM', durationMinutes}
// for every candidate slot in the next `horizonWeeks`, given availability and confirmed bookings.
// `now` lets us inject current time for testing; defaults to real now.
function buildAvailableSlots(availability, bookings, now = new Date()) {
  const slots = [];
  const horizonDays = availability.bookingHorizonWeeks * 7;
  const granularity = availability.slotGranularityMinutes;
  const minNoticeMs = (availability.minNoticeHours || 0) * 60 * 60 * 1000;
  const earliestBookable = new Date(now.getTime() + minNoticeMs);

  // Index bookings by date for quick lookup.
  const bookingsByDate = {};
  for (const b of bookings) {
    if (b.status === 'cancelled') continue;
    (bookingsByDate[b.date] = bookingsByDate[b.date] || []).push(b);
  }

  // Index exceptions by date.
  const exceptionsByDate = {};
  for (const e of (availability.exceptions || [])) {
    exceptionsByDate[e.date] = e;
  }

  for (let i = 0; i < horizonDays; i++) {
    const day = addDays(now, i);
    const dateStr = isoDate(day);
    const dn = dayName(day);

    let windows = availability.weekly[dn] || [];
    const ex = exceptionsByDate[dateStr];
    if (ex) {
      if (ex.blocked) windows = [];
      else if (ex.windows) windows = ex.windows;
    }
    if (windows.length === 0) continue;

    const dayBookings = bookingsByDate[dateStr] || [];

    for (const w of windows) {
      const wStart = toMinutes(w.start);
      const wEnd = toMinutes(w.end);

      for (const duration of availability.sessionLengths) {
        for (let t = wStart; t + duration <= wEnd; t += granularity) {
          const slotStart = t;
          const slotEnd = t + duration;
          const startStr = fromMinutes(slotStart);
          const endStr = fromMinutes(slotEnd);

          // min notice check
          const slotDate = new Date(day);
          const [sh, sm] = startStr.split(':').map(Number);
          slotDate.setHours(sh, sm, 0, 0);
          if (slotDate < earliestBookable) continue;

          // overlap check
          let overlaps = false;
          for (const b of dayBookings) {
            const bStart = toMinutes(b.startTime);
            const bEnd = toMinutes(b.endTime);
            if (slotStart < bEnd && slotEnd > bStart) { overlaps = true; break; }
          }
          if (overlaps) continue;

          slots.push({
            date: dateStr,
            startTime: startStr,
            endTime: endStr,
            durationMinutes: duration,
            label: formatDateLong(day) + ' · ' + startStr + '–' + endStr + ' (' + duration + ' min)'
          });
        }
      }
    }
  }
  // Sort by date, then start time, then duration so same-time options are adjacent.
  slots.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.startTime !== b.startTime) return a.startTime < b.startTime ? -1 : 1;
    return a.durationMinutes - b.durationMinutes;
  });
  return slots;
}

// Group slots by date for rendering.
function groupSlotsByDate(slots) {
  const groups = {};
  for (const s of slots) {
    (groups[s.date] = groups[s.date] || []).push(s);
  }
  return groups;
}

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

window.BookingShared = {
  loadJSON, toMinutes, fromMinutes, isoDate, parseISODate, addDays,
  dayName, formatDateLong, buildAvailableSlots, groupSlotsByDate, uuid, pad
};
