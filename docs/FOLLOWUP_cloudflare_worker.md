# Follow-up: Cloudflare Worker upgrade

## What this fixes

The current v1 has two known gaps:

1. **Student form submissions only exist as email** until you manually re-enter them in admin. If an email is missed, the booking is lost.
2. **Calendar sync is manual** — bookings need to be copy-pasted to Claude.

A small Cloudflare Worker (free tier) closes both gaps.

---

## Phase 1 — Capture form submissions to GitHub

**Effort:** ~1 hour. **Cost:** free (100k requests/day on Cloudflare's free plan).

### What it does

1. Student fills the form on `index.html`.
2. Form POSTs to the Worker (instead of Formsubmit).
3. Worker validates the payload (slot fits availability, no overlap with existing bookings, email looks real).
4. Worker uses the GitHub Contents API to append the booking to `data/bookings.json` with `status: "pending"`.
5. Worker emails the tutor a notification (via Resend free tier, or MailChannels which is free on Cloudflare).
6. Student is redirected to `index.html?booked=1`.

The booking is now durably saved before the student even leaves the page. The tutor logs into admin, sees the pending booking with one click changes status to `confirmed`, and pushes (or the Worker can mark it confirmed automatically — config choice).

### Files needed

- `worker/index.js` — the Worker code (~150 lines)
- `wrangler.toml` — Cloudflare config
- `.dev.vars.example` — example secrets file

### Secrets the Worker needs

- `GITHUB_TOKEN` — the same fine-grained PAT (Contents read/write on the booking repo)
- `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`
- `NOTIFY_EMAIL` — your email
- `MAILCHANNELS_FROM` — sender address (only needed if using MailChannels)

### Setup steps you'd take

1. Sign up for Cloudflare (free, 2 min, no card needed for Workers).
2. Run `npm install -g wrangler` then `wrangler login`.
3. Edit `worker/index.js` for any custom logic.
4. `wrangler secret put GITHUB_TOKEN` (and the others).
5. `wrangler deploy` → Worker gets a URL like `https://tutor-bookings.YOUR-SUBDOMAIN.workers.dev`.
6. Update `index.html`: change `<form action="https://formsubmit.co/…">` to point at the Worker URL.
7. Test once with a real submission to confirm.

### Validation logic the Worker enforces

- Date is in the future and within `bookingHorizonWeeks`.
- Start time matches a valid slot for that day given `availability.json`.
- Duration is in `sessionLengths`.
- No overlap with any non-cancelled booking already in `bookings.json`.
- Email looks real (regex + optional MX check).
- Honeypot field is empty.
- Rate limit by IP (Cloudflare KV or Durable Object): max 3 submissions per hour.

If validation fails, returns a 400 with an error message the page displays inline.

### Race-condition handling

GitHub's Contents API uses optimistic concurrency via SHA. If two students submit at the same instant, the second Worker invocation gets a 409, retries with the new SHA, and succeeds. We add a short retry loop (max 3 attempts, ~50ms apart). At your booking volume this will essentially never matter, but it's correct behaviour for free.

---

## Phase 2 — Auto-create Google Calendar events

**Effort:** 2–4 hours including Google Cloud project setup. **Optional**, only worth doing if you want full hands-off booking.

### What it does

After Phase 1 saves the booking to GitHub, the same Worker:

1. Calls the Google Calendar API to create the event on your calendar.
2. Adds the student email as an attendee with `notificationLevel: "ALL"`.
3. Google emails the student an invite — they accept, it lands on their calendar.
4. Saves the returned `eventId` to `bookings.json` so cancellations can find it later.

The student gets a calendar invite within seconds of submitting the form. No Claude session, no manual sync.

### Setup overhead (the reason this is Phase 2 not Phase 1)

You'd need to:

1. Create a Google Cloud project (free).
2. Enable the Calendar API.
3. Create an OAuth 2.0 client (web application).
4. Run a one-time auth flow (a small script, runs on your machine) that gets a long-lived refresh token.
5. Store the refresh token as a Worker secret.
6. The Worker exchanges the refresh token for a short-lived access token on each invocation.

The first three steps are clicky-but-fast (~15 min total). Step 4 needs a small helper script I'd write.

Alternative: a Google service account with domain-wide delegation. Faster setup but requires a Google Workspace account (paid). Not the right fit for a personal Gmail.

### What can go wrong

- Refresh tokens occasionally expire (rare, but Google can revoke them on policy changes). Worker should email you on auth failure so you re-run the auth script.
- Calendar API has quotas. At your volume, irrelevant.
- Time-zone handling: the booking's date+time are in SAST, the API call sets `timeZone: "Africa/Johannesburg"` explicitly. Already correct.

### Cancellation flow (Phase 2)

When admin cancels a booking, the Worker:
1. Looks up the saved `eventId`.
2. Calls Calendar API to delete the event with `sendUpdates: "all"` so the student gets a removal notice.

---

## Decision points before I build this

1. **Cloudflare account.** OK to make one (free, no card needed for Workers)?
2. **Email notification path** — MailChannels (free, Cloudflare-native) or Resend (3000 free emails/month, prettier templates)?
3. **Pending vs auto-confirmed.** Should student bookings land as `pending` (you confirm) or `confirmed` (saved instantly, you reject only if needed)? I'd lean confirmed-by-default for low-friction students; you can always cancel.
4. **Phase 2 yes/no.** Is automatic Google Calendar event creation worth the 2–4 hour setup, or is the existing manual-via-Claude flow good enough?

Once you've decided 1–4 above, I can build Phase 1 in one session. Phase 2 is a second session.
