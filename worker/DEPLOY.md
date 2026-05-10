# Worker deployment guide

This deploys the Cloudflare Worker that captures student booking submissions, writes them directly to GitHub, and creates Google Calendar events with the student as an attendee. After deploy, the Formsubmit dependency is gone and bookings are end-to-end automatic.

Total time: ~30 min. Total cost: free.

---

## Part A — Cloudflare account + Worker (Phase 1)

### A1. Create a Cloudflare account
1. Go to <https://dash.cloudflare.com/sign-up>.
2. Email + password. No card required for Workers.

### A2. Create the Worker
1. From the Cloudflare dashboard, click **Workers & Pages** → **Create application** → **Create Worker**.
2. Name it `math-tutor-booking` (or anything; this becomes part of the URL).
3. Click **Deploy** to accept the placeholder. Then click **Edit code** (or **Quick edit**).
4. **Replace all** the editor contents with the contents of `worker/worker.js` from this repo.
5. Click **Save and deploy**.
6. Top-right of the Worker page, copy the URL — looks like `https://math-tutor-booking.YOUR-SUBDOMAIN.workers.dev`. Note it down.

### A3. Add the GitHub secret
1. Same Worker page → **Settings** → **Variables and Secrets**.
2. Click **Add variable**, type **Secret**:
   - Name: `GITHUB_TOKEN`
   - Value: paste your GitHub fine-grained PAT (the one you rotated earlier). Same token, same repo, same permissions.
3. Click **Save**.

### A4. Smoke-test Phase 1
Open `https://YOUR-WORKER-URL/health` in a browser. You should see:
```json
{"ok":true,"github":true,"calendar":false}
```
`calendar:false` is expected at this point — Phase 2 isn't set up yet.

### A5. Wire the form to the Worker
1. Tell Claude your Worker URL — Claude will edit `index.html` to point the form at it and push to GitHub.
2. Wait ~1 min for GitHub Pages to redeploy.
3. Hard-refresh the public booking page and submit a test booking. The student is redirected back to `?booked=1`. The booking should appear in `data/bookings.json` on GitHub within seconds, and admin should auto-pull it.

**Phase 1 done.** You can stop here if you don't want auto-Calendar — bookings now bypass email entirely. Or continue to Part B for the calendar invite.

---

## Part B — Google Calendar API (Phase 2)

### B1. Create a Google Cloud project
1. Go to <https://console.cloud.google.com/projectcreate>.
2. Project name: `math-tutor-booking` (or anything). Location: *No organization*.
3. Click **Create**, wait a few seconds, then make sure that project is selected (top-left dropdown).

### B2. Enable the Calendar API
1. Go to <https://console.cloud.google.com/apis/library/calendar-json.googleapis.com>.
2. Make sure the right project is selected (top dropdown).
3. Click **Enable**.

### B3. Configure the OAuth consent screen
1. Go to <https://console.cloud.google.com/apis/credentials/consent>.
2. *User Type:* **External** → Create.
3. Fill in:
   - App name: `Math Tutor Booking`
   - User support email: your Gmail
   - Developer contact email: your Gmail
   - Leave everything else blank → Save and continue.
4. *Scopes:* click **Add or remove scopes** → search `calendar.events` → check the row that says `https://www.googleapis.com/auth/calendar.events` → Update → Save and continue.
5. *Test users:* **Add users** → add your own Gmail (`jathanhaskell@gmail.com`) → Save and continue.
6. Back to dashboard. The app will stay in *Testing* mode — that's fine; only the test users you added (i.e. you) can authorize, which is exactly what we want.

### B4. Create the OAuth Client ID
1. Go to <https://console.cloud.google.com/apis/credentials>.
2. **+ Create Credentials** → **OAuth client ID**.
3. *Application type:* **Web application**.
4. Name: `math-tutor-booking-worker`.
5. *Authorized redirect URIs:* click **Add URI** → enter exactly: `http://localhost:8888/callback`
6. Create. A modal pops up with:
   - **Client ID** — copy it
   - **Client secret** — copy it

### B5. Run the OAuth helper script (one-time)
This is a tiny Node script in the repo that opens a browser, you grant consent, it prints a long-lived refresh token.

In PowerShell, from the `booking-system/worker` folder:
```powershell
node auth-helper.js
```
- Paste the Client ID when prompted.
- Paste the Client Secret when prompted.
- A browser opens → sign in with your Gmail → grant the Calendar permission → see "Done." page.
- The terminal prints `GOOGLE_REFRESH_TOKEN=…`. Copy that long string.

### B6. Add the three Google secrets to the Worker
Cloudflare Worker → **Settings** → **Variables and Secrets** → **Add variable** (×3, all type **Secret**):
- `GOOGLE_CLIENT_ID` — the Client ID from B4
- `GOOGLE_CLIENT_SECRET` — the Client Secret from B4
- `GOOGLE_REFRESH_TOKEN` — the value from B5
Click **Save** after adding each.

### B7. Verify Phase 2
Open `https://YOUR-WORKER-URL/health` again. You should now see:
```json
{"ok":true,"github":true,"calendar":true}
```

Submit another test booking on the public page. Within a few seconds:
- The booking appears in `data/bookings.json` with `syncedToGcal: true` and a `gcalEventId`.
- The "student" email gets a Google Calendar invite (with cancel/accept buttons).
- The event also appears on your tutor calendar.

**Phase 2 done.** You're now fully automated.

---

## What stays manual

- **Cancellations** still go through admin. When you cancel a booking that has a `gcalEventId`, the *Calendar sync* tab still produces a Claude payload to delete the event. (We can automate this in a Phase 3 if you want — small Worker change.)
- **Schedule changes** (`data/availability.json`) are still git commits.

---

## Troubleshooting

**`/health` shows `github:false`.**
GITHUB_TOKEN secret missing or malformed. Re-add as a *Secret* (not a Variable).

**Form submit shows an error in URL.**
The page now reads the `error` URL parameter. Common causes:
- `slot already booked` — race with another student or admin add.
- `too soon` — `minNoticeHours` (default 12h) blocked it.
- `slot not within availability` — date/time mismatch with availability.json.

**Worker logs.**
Cloudflare Worker page → **Logs** → **Begin log stream**. Submit a test booking and watch live.

**`Calendar create: 401`.**
The refresh token expired or was revoked (rare, but happens if you've manually removed the app's permissions in Google account, or after long inactivity). Re-run `auth-helper.js` and update the `GOOGLE_REFRESH_TOKEN` secret.

**`Calendar create: 403 dailyLimitExceededUnreg`.**
You're still in *Testing* mode (good) but the test-user list doesn't include the email of the student you're sending to. Calendar API actually only needs YOUR consent (the calendar owner) — the student gets an invite via email, no Google account required. If you see this, the refresh token might be wrong scope. Re-run helper.

**Bookings stop appearing in admin.**
Hard-refresh admin (Ctrl+Shift+R), then *GitHub sync* → *Pull latest from GitHub*. Worker writes to GitHub; admin's localStorage takes ~30s to a minute to auto-sync after that.

---

## Costs

- Cloudflare Workers free tier: 100,000 requests/day. You'll use ~5/day in production.
- Google Calendar API: free for personal Gmail; quota is per-user-per-day, well above any human tutoring volume.
- GitHub Pages: free for public repos. (Already what you're on.)

Total expected ongoing cost: **$0**.
