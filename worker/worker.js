// Cloudflare Worker for the Math Tutoring Booking System.
//
// What it does:
//   1. Receives the student booking form POST.
//   2. Validates the slot against availability.json + bookings.json (no double-booking).
//   3. Creates a Google Calendar event with the student as attendee (Phase 2; optional).
//   4. Appends the booking to bookings.json on GitHub via the Contents API.
//   5. Redirects the student back to the booking page with ?booked=1.
//
// Secrets the Worker reads from `env`:
//   GITHUB_TOKEN          (required) fine-grained PAT, Contents read+write on this repo
//   GOOGLE_CLIENT_ID      (Phase 2) OAuth client id from Google Cloud
//   GOOGLE_CLIENT_SECRET  (Phase 2) OAuth client secret
//   GOOGLE_REFRESH_TOKEN  (Phase 2) refresh token from auth-helper.js
//
// If the GOOGLE_* secrets are missing, the Worker still saves the booking — just no calendar event.

const CFG = {
  // Allowed origins for CORS. Must match the GitHub Pages origin.
  allowedOrigin: 'https://jathanhaskell.github.io',
  // Where to send the user after success / error (the public booking page).
  successUrl: 'https://jathanhaskell.github.io/Math-Tutoring-Booking-System/?booked=1',
  errorUrlBase: 'https://jathanhaskell.github.io/Math-Tutoring-Booking-System/?error=',
  // GitHub repo + paths.
  ghOwner:  'jathanhaskell',
  ghRepo:   'Math-Tutoring-Booking-System',
  ghBranch: 'main',
  bookingsPath:     'data/bookings.json',
  availabilityPath: 'data/availability.json',
  // Calendar event title prefix.
  calendarSummaryPrefix: 'Maths tutoring — ',
  // Max retry on optimistic-concurrency 409 from GitHub.
  maxRetries: 3
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    const url = new URL(req.url);
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        ok: true,
        github: !!env.GITHUB_TOKEN,
        calendar: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN)
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }
    if (url.pathname !== '/book') {
      return new Response('Not found', { status: 404, headers: corsHeaders() });
    }
    if (req.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: corsHeaders() });
    }
    try {
      return await handleBook(req, env);
    } catch (e) {
      console.error('handleBook error:', e && e.stack || e);
      return redirect(CFG.errorUrlBase + encodeURIComponent('server error — please try again'));
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': CFG.allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function redirect(target) {
  return new Response(null, { status: 302, headers: { Location: target, ...corsHeaders() } });
}

async function handleBook(req, env) {
  if (!env.GITHUB_TOKEN) {
    return redirect(CFG.errorUrlBase + encodeURIComponent('Worker not configured — missing GITHUB_TOKEN'));
  }

  const ct = req.headers.get('content-type') || '';
  let form;
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    form = await req.formData();
  } else if (ct.includes('application/json')) {
    const j = await req.json();
    form = { get: (k) => (j && k in j ? j[k] : null) };
  } else {
    return redirect(CFG.errorUrlBase + encodeURIComponent('unsupported content type'));
  }

  // Honeypot — bots tend to fill every field. Pretend success so they don't retry.
  if (String(form.get('_honey') || '').trim() !== '') {
    return redirect(CFG.successUrl);
  }

  const data = {
    date:            String(form.get('date') || '').trim(),
    startTime:       String(form.get('startTime') || '').trim(),
    endTime:         String(form.get('endTime') || '').trim(),
    durationMinutes: parseInt(form.get('durationMinutes'), 10),
    name:            String(form.get('name') || '').trim(),
    email:           String(form.get('email') || '').trim().toLowerCase(),
    topic:           String(form.get('topic') || '').trim(),
    notes:           String(form.get('notes') || '').trim()
  };

  const fieldErr = validatePayload(data);
  if (fieldErr) return redirect(CFG.errorUrlBase + encodeURIComponent(fieldErr));

  // Optimistic-concurrency loop: re-fetch + re-validate + PUT, retrying on 409.
  let lastErr = null;
  for (let attempt = 0; attempt < CFG.maxRetries; attempt++) {
    try {
      const [availFile, bookingsFile] = await Promise.all([
        ghGet(env, CFG.availabilityPath),
        ghGet(env, CFG.bookingsPath)
      ]);
      const availability = JSON.parse(availFile.content);
      const bookingsDoc  = JSON.parse(bookingsFile.content);

      const slotErr = validateSlot(data, availability, bookingsDoc.bookings);
      if (slotErr) return redirect(CFG.errorUrlBase + encodeURIComponent(slotErr));

      // Phase 2 — try to create the calendar event. Failures here don't block the booking.
      let gcalEventId = null;
      let syncedToGcal = false;
      const tz = availability.timeZone || 'Africa/Johannesburg';
      if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN) {
        try {
          gcalEventId = await createCalendarEvent(env, data, tz);
          syncedToGcal = !!gcalEventId;
        } catch (e) {
          console.error('Calendar event creation failed:', e && e.message || e);
        }
      }

      const newBooking = {
        id: crypto.randomUUID(),
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        studentName: data.name,
        studentEmail: data.email,
        topic: data.topic,
        notes: data.notes,
        status: 'confirmed',
        syncedToGcal,
        gcalEventId,
        createdAt: new Date().toISOString(),
        source: 'student-form'
      };
      bookingsDoc.bookings.push(newBooking);

      const newContent = JSON.stringify(bookingsDoc, null, 2) + '\n';
      const message = (syncedToGcal ? '[booking+cal] ' : '[booking] ') +
        data.name + ' — ' + data.date + ' ' + data.startTime + '-' + data.endTime +
        ' (' + data.durationMinutes + 'm)';
      await ghPut(env, CFG.bookingsPath, newContent, bookingsFile.sha, message);

      return redirect(CFG.successUrl);
    } catch (e) {
      lastErr = e;
      const m = String(e && e.message || '');
      if (m.includes(' 409 ') || m.includes(' 422 ')) {
        // Retry: someone else just committed — re-fetch and try again.
        await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  console.error('Failed after retries:', lastErr && lastErr.message);
  return redirect(CFG.errorUrlBase + encodeURIComponent('couldn\'t save booking after multiple tries — please try again'));
}

// ---------- Validation ----------

function validatePayload(d) {
  if (!d.date || !d.startTime || !d.endTime) return 'missing slot info';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return 'invalid date';
  if (!/^\d{2}:\d{2}$/.test(d.startTime) || !/^\d{2}:\d{2}$/.test(d.endTime)) return 'invalid time';
  if (![60, 90].includes(d.durationMinutes)) return 'invalid duration';
  if (!d.name || d.name.length < 2) return 'name required';
  if (d.name.length > 100) return 'name too long';
  if (!d.email) return 'email required';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return 'invalid email';
  if (d.email.length > 200) return 'email too long';
  if (!d.topic) return 'topic required';
  if (d.topic.length > 200) return 'topic too long';
  if (d.notes.length > 1000) return 'notes too long';
  return null;
}

function toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function dayOfDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  // Use UTC to avoid Worker server-time-zone surprises. Local-day mapping via Date with no tz.
  const dt = new Date(Date.UTC(y, m - 1, d));
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dt.getUTCDay()];
}

function validateSlot(d, availability, bookings) {
  // Date must be in the future + within booking horizon, with min-notice.
  // We compare against the slot's local time in the configured time zone, approximating with UTC offsets isn't worth it here —
  // the JS engine on the Worker uses UTC; we treat the date+time as local-of-tutor-tz ≈ what the student sees.
  const slotMs = Date.UTC(
    parseInt(d.date.slice(0, 4), 10),
    parseInt(d.date.slice(5, 7), 10) - 1,
    parseInt(d.date.slice(8, 10), 10),
    parseInt(d.startTime.slice(0, 2), 10),
    parseInt(d.startTime.slice(3, 5), 10)
  );
  const tzOffsetMin = guessTzOffset(availability.timeZone || 'Africa/Johannesburg');
  const slotEpoch = slotMs - tzOffsetMin * 60000;
  const now = Date.now();
  const minNoticeMs = (availability.minNoticeHours || 12) * 3600 * 1000;
  if (slotEpoch < now + minNoticeMs) return 'too soon — needs at least ' + (availability.minNoticeHours || 12) + ' hours notice';
  const horizonMs = (availability.bookingHorizonWeeks || 4) * 7 * 86400 * 1000;
  if (slotEpoch > now + horizonMs) return 'too far in the future';

  const dn = dayOfDate(d.date);
  const exception = (availability.exceptions || []).find(e => e.date === d.date);
  let windows = availability.weekly[dn] || [];
  if (exception) {
    if (exception.blocked) return 'date unavailable';
    if (exception.windows) windows = exception.windows;
  }
  if (windows.length === 0) return 'no availability on that day';

  const sStart = toMin(d.startTime);
  const sEnd = toMin(d.endTime);
  if (sEnd - sStart !== d.durationMinutes) return 'duration / time mismatch';

  const granularity = availability.slotGranularityMinutes || 30;
  const fits = windows.some(w => {
    const wStart = toMin(w.start);
    const wEnd = toMin(w.end);
    return sStart >= wStart && sEnd <= wEnd && (sStart - wStart) % granularity === 0;
  });
  if (!fits) return 'slot not within availability';

  for (const b of bookings || []) {
    if (b.status === 'cancelled') continue;
    if (b.date !== d.date) continue;
    const bStart = toMin(b.startTime);
    const bEnd = toMin(b.endTime);
    if (sStart < bEnd && sEnd > bStart) return 'slot already booked';
  }
  return null;
}

// Best-effort hardcoded timezone offset map. The Worker sees UTC; we just need an approximate
// SAST/UTC offset to filter past-or-imminent slots correctly. SAST is fixed UTC+2 with no DST.
function guessTzOffset(tz) {
  const map = {
    'Africa/Johannesburg': 120,
    'Europe/London': 0,         // approx; doesn't observe DST in our minNotice math
    'Europe/Paris': 60,
    'America/New_York': -300,
    'America/Los_Angeles': -480,
    'Asia/Kolkata': 330,
    'Australia/Sydney': 600,
    'UTC': 0
  };
  return map[tz] != null ? map[tz] : 0;
}

// ---------- GitHub helpers ----------

async function ghGet(env, path) {
  const url = `https://api.github.com/repos/${CFG.ghOwner}/${CFG.ghRepo}/contents/${encodeURIComponent(path)}?ref=${CFG.ghBranch}&t=${Date.now()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'math-tutor-booking-worker'
    }
  });
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { sha: data.sha, content: atob(data.content.replace(/\n/g, '')) };
}

async function ghPut(env, path, content, sha, message) {
  const url = `https://api.github.com/repos/${CFG.ghOwner}/${CFG.ghRepo}/contents/${encodeURIComponent(path)}`;
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: CFG.ghBranch,
    sha
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'math-tutor-booking-worker'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

// ---------- Google Calendar helpers ----------

async function getAccessToken(env) {
  const params = new URLSearchParams();
  params.set('client_id', env.GOOGLE_CLIENT_ID);
  params.set('client_secret', env.GOOGLE_CLIENT_SECRET);
  params.set('refresh_token', env.GOOGLE_REFRESH_TOKEN);
  params.set('grant_type', 'refresh_token');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!res.ok) throw new Error('Google token refresh: ' + res.status + ' ' + (await res.text()));
  const data = await res.json();
  return data.access_token;
}

async function createCalendarEvent(env, d, tz) {
  const token = await getAccessToken(env);
  const event = {
    summary: CFG.calendarSummaryPrefix + d.name,
    description: 'Topic: ' + d.topic + (d.notes ? '\n\nNotes: ' + d.notes : '') + '\n\nBooked via the tutoring system.',
    start: { dateTime: d.date + 'T' + d.startTime + ':00', timeZone: tz },
    end:   { dateTime: d.date + 'T' + d.endTime   + ':00', timeZone: tz },
    attendees: [{ email: d.email, displayName: d.name }],
    reminders: { useDefault: true },
    guestsCanInviteOthers: false,
    guestsCanModify: false
  };
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });
  if (!res.ok) throw new Error('Calendar create: ' + res.status + ' ' + (await res.text()));
  const data = await res.json();
  return data.id;
}
