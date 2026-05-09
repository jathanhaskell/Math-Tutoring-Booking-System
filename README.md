# Maths Tutor Booking System

A simple, no-server booking system. Two pages:

- **`index.html`** — public student-facing page. Students pick a free slot and submit; you get an email.
- **`admin.html`** — your private dashboard. Add/cancel bookings, push updates to GitHub, sync to Google Calendar via Claude.

Data lives in `data/availability.json` (your weekly schedule) and `data/bookings.json` (confirmed bookings).

---

## How it works

1. **Student opens the public page** (hosted on GitHub Pages). Page reads `bookings.json` from your repo and shows free slots.
2. **Student picks a slot** and fills in name/email/topic. Form submits to **Formsubmit.co**, which emails you the booking.
3. **You open `admin.html`** (locally), click *Add booking*, pick the same slot, paste the student's name/email/topic.
4. **Click *Push bookings.json*** → the public page updates within ~1 min so no one else can double-book.
5. **Open the *Calendar sync* tab**, click *Copy sync payload*, paste it into Claude, and say "sync these to my Google Calendar." Claude creates the events with the student as an attendee — they get a Google Calendar invite by email automatically. Click *Mark all as synced*.

That's the whole loop.

---

## One-time setup

### 1. Create a GitHub repo

1. Go to <https://github.com/new>
2. Name it (e.g. `math-tutor-booking`), set it **Public** (required for free GitHub Pages), no README.
3. Click *Create repository*.

### 2. Push this folder to GitHub

Open PowerShell in this `booking-system` folder and run:

```powershell
git init
git add .
git commit -m "Initial booking system"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/math-tutor-booking.git
git push -u origin main
```

### 3. Turn on GitHub Pages

1. In your repo on GitHub, go to **Settings → Pages**.
2. Under *Source*, pick **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**. Save.
4. Wait ~1 minute, then your public URL is:
   `https://YOUR-USERNAME.github.io/math-tutor-booking/`

Send that URL to students.

### 4. Create a fine-grained Personal Access Token (PAT)

So the admin page can push `bookings.json` updates to GitHub.

1. Go to <https://github.com/settings/personal-access-tokens/new>
2. *Token name:* `math-tutor-booking-admin`
3. *Expiration:* 1 year (or whatever you prefer)
4. *Repository access:* **Only select repositories** → pick `math-tutor-booking`.
5. *Permissions → Repository permissions → Contents:* **Read and write**.
6. Click *Generate token*. Copy it (starts with `github_pat_…`).
7. Open `admin.html` locally. Go to **Settings tab**:
   - GitHub username: your username
   - Repo name: `math-tutor-booking`
   - Branch: `main`
   - Token: paste it
   - Set an admin password (locks the page on this device).
   - Click **Save settings**.

### 5. Formsubmit.co activation

The first time a student submits the form, Formsubmit will email you a confirmation link to verify your address. Click it once — after that, all bookings go straight to your inbox.

You can also set up filters in Gmail: any email with subject containing "New tutoring booking" → label "Bookings".

---

## Daily usage

### When a student books on the public page

1. You get an email from Formsubmit with the slot, name, email, topic.
2. Open `admin.html`. The status bar at the top tells you what's outstanding (unpushed changes, unsynced calendar events). If GitHub credentials are set, the page auto-pulls the latest `bookings.json` on load so you don't work off stale data.
3. *Add booking* tab → click the slot they chose → paste their details → **Save booking**.
4. *GitHub sync* tab → **Push bookings.json**. (This stops anyone else booking that slot.)
5. *Calendar sync* tab → **Copy sync payload** → paste to Claude → "sync these to my Google Calendar". The payload also includes a "DELETE these" section for any cancelled-but-still-on-calendar bookings.
6. Click **Mark all as synced**. Push to GitHub again so the synced flag is saved.

### Cancelling a booking that's already on the calendar

When you click *Cancel*, you'll be warned that the calendar event still exists. After cancelling, the status bar shows "X cancelled bookings still on calendar". Open the *Calendar sync* tab — the sync payload will include a removal section for Claude to delete the events (which sends a removal notice to the student).

### Booking yourself a slot (e.g. blocking out a day)

Same as above — just put your own name in. Skip the calendar sync step (or sync if you want a personal reminder).

### Cancelling a booking

In *Bookings* tab, click **Cancel**. Push to GitHub. Tell Claude "cancel the calendar event for {student} on {date}" so the invite is withdrawn.

---

## Editing your weekly schedule

Edit `data/availability.json`. Format:

```json
{
  "weekly": {
    "monday":    [{ "start": "16:30", "end": "18:30" }],
    "tuesday":   [{ "start": "16:30", "end": "18:30" }],
    ...
  },
  "sessionLengths": [60, 90],
  "exceptions": [
    { "date": "2026-05-15", "blocked": true },
    { "date": "2026-05-20", "windows": [{ "start": "10:00", "end": "12:00" }] }
  ]
}
```

After editing, commit + push:

```powershell
git add data/availability.json
git commit -m "Update availability"
git push
```

---

## Files

```
booking-system/
├── index.html          # Public student-facing booking page
├── admin.html          # Tutor admin page (private)
├── css/style.css
├── js/
│   ├── shared.js       # Slot calculation logic
│   ├── booking.js      # Student page
│   └── admin.js        # Admin page
└── data/
    ├── availability.json
    └── bookings.json
```

---

## Security notes

- The admin password is hashed (SHA-256) and stored in `localStorage`. It's a soft lock to keep casual visitors out — anyone with file access to your machine can bypass it. **Do not deploy `admin.html` to GitHub Pages** (it's there in the repo, but the password gate plus the URL not being shared is your protection). For real privacy, host `admin.html` only locally and `.gitignore` it, or move it to a separate private repo.
- The PAT is stored in `localStorage`. Anyone with access to the same browser profile could read it. Use a fine-grained token scoped to one repo only, with a 1-year expiry.
- Formsubmit posts go through their service — your email is not exposed in the page source (Formsubmit hashes it after activation).
