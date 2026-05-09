// Tutor admin page logic.
(function () {
  const S = window.BookingShared;

  // ---------- Storage helpers ----------
  const LS = {
    pwHash:  'mt_admin_pw_hash',
    bookings:'mt_bookings',
    ghOwner: 'mt_gh_owner',
    ghRepo:  'mt_gh_repo',
    ghBranch:'mt_gh_branch',
    ghToken: 'mt_gh_token',
    unlocked:'mt_unlocked',
    lastPushedHash: 'mt_last_pushed_hash'
  };

  async function hashString(s) {
    const buf = new TextEncoder().encode(s);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  }
  function bookingsContent() { return JSON.stringify(bookingsDoc, null, 2) + '\n'; }

  async function sha256(s) {
    const buf = new TextEncoder().encode(s);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function getBookings() {
    try {
      const raw = localStorage.getItem(LS.bookings);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }
  function saveBookings(doc) {
    localStorage.setItem(LS.bookings, JSON.stringify(doc));
  }

  // ---------- Lock / unlock ----------
  const lockEl = document.getElementById('lock');
  const appEl  = document.getElementById('app');
  const lockError = document.getElementById('lock-error');

  async function checkUnlocked() {
    const stored = localStorage.getItem(LS.pwHash);
    if (!stored) {
      // First run — no password set; admin opens directly. Prompt to set in settings.
      lockEl.style.display = 'none';
      appEl.style.display  = 'block';
      sessionStorage.setItem(LS.unlocked, '1');
      return true;
    }
    if (sessionStorage.getItem(LS.unlocked) === '1') {
      lockEl.style.display = 'none';
      appEl.style.display  = 'block';
      return true;
    }
    lockEl.style.display = 'block';
    appEl.style.display  = 'none';
    return false;
  }

  document.getElementById('unlock-btn').addEventListener('click', async () => {
    const pw = document.getElementById('pw').value;
    const stored = localStorage.getItem(LS.pwHash);
    const hash = await sha256(pw);
    if (hash === stored) {
      sessionStorage.setItem(LS.unlocked, '1');
      lockError.innerHTML = '';
      checkUnlocked();
      init();
    } else {
      lockError.innerHTML = '<div class="error-banner">Wrong password.</div>';
    }
  });
  document.getElementById('pw').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('unlock-btn').click();
  });
  document.getElementById('lock-btn').addEventListener('click', () => {
    sessionStorage.removeItem(LS.unlocked);
    location.reload();
  });

  // ---------- Tabs ----------
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'add') renderAddSlots();
      if (btn.dataset.tab === 'sync') renderUnsynced();
      if (btn.dataset.tab === 'settings') renderSchedule();
    });
  });

  // ---------- Banner ----------
  const banner = document.getElementById('banner');
  function showBanner(msg, kind) {
    banner.innerHTML = '<div class="' + (kind === 'error' ? 'error-banner' : 'success-banner') + '">' + msg + '</div>';
    if (kind !== 'error') setTimeout(() => banner.innerHTML = '', 4000);
  }

  // ---------- State ----------
  let availability = null;
  let bookingsDoc = { bookings: [] };

  async function loadData() {
    availability = await S.loadJSON('data/availability.json');

    // Prefer localStorage (the "live" admin state) over the file on disk.
    const local = getBookings();
    if (local && local.bookings) {
      bookingsDoc = local;
    } else {
      try {
        bookingsDoc = await S.loadJSON('data/bookings.json');
      } catch {
        bookingsDoc = { bookings: [] };
      }
      saveBookings(bookingsDoc);
    }
    // First-run baseline: assume the freshly-loaded state matches what's on GitHub.
    // (If creds are set, the auto-pull right after will update this.)
    if (!localStorage.getItem(LS.lastPushedHash)) {
      localStorage.setItem(LS.lastPushedHash, await hashString(bookingsContent()));
    }
  }

  // ---------- Status bar ----------
  async function renderStatusBar() {
    const bar = document.getElementById('status-bar');
    if (!bar) return;
    const now = new Date();
    const unsynced = bookingsDoc.bookings.filter(b => b.status === 'confirmed' && !b.syncedToGcal && bookingDateTime(b) >= now).length;
    const cancelStillOnCal = bookingsDoc.bookings.filter(b => b.status === 'cancelled' && b.syncedToGcal).length;
    const currentHash = await hashString(bookingsContent());
    const lastPushed = localStorage.getItem(LS.lastPushedHash);
    const unpushed = currentHash !== lastPushed;

    const pills = [];
    if (unpushed) pills.push('<span class="status-pill warn"><span class="dot"></span>Local changes not on GitHub — go to <strong>GitHub sync</strong> tab</span>');
    else pills.push('<span class="status-pill ok"><span class="dot"></span>GitHub up to date</span>');
    if (unsynced > 0) pills.push('<span class="status-pill warn"><span class="dot"></span>' + unsynced + ' booking' + (unsynced===1?'':'s') + ' ' + (unsynced===1?'needs':'need') + ' calendar sync</span>');
    if (cancelStillOnCal > 0) pills.push('<span class="status-pill warn"><span class="dot"></span>' + cancelStillOnCal + ' cancelled booking' + (cancelStillOnCal===1?'':'s') + ' still on calendar — remove via Claude</span>');
    bar.innerHTML = pills.join(' ');
  }

  // ---------- Render bookings tab ----------
  function bookingDateTime(b) {
    const d = S.parseISODate(b.date);
    const [h, m] = b.startTime.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  }

  function renderBookings() {
    const now = new Date();
    const upcoming = bookingsDoc.bookings
      .filter(b => b.status !== 'cancelled' && bookingDateTime(b) >= now)
      .sort((a, b) => bookingDateTime(a) - bookingDateTime(b));
    const past = bookingsDoc.bookings
      .filter(b => bookingDateTime(b) < now || b.status === 'cancelled')
      .sort((a, b) => bookingDateTime(b) - bookingDateTime(a));

    const upcomingEl = document.getElementById('upcoming-list');
    const pastEl = document.getElementById('past-list');
    upcomingEl.innerHTML = upcoming.length
      ? upcoming.map(bookingRowHTML).join('')
      : '<p class="empty">No upcoming bookings.</p>';
    pastEl.innerHTML = past.length
      ? past.map(bookingRowHTML).join('')
      : '<p class="empty">No past bookings.</p>';

    wireBookingRowActions(upcomingEl);
    wireBookingRowActions(pastEl);
    renderStatusBar();
  }

  function wireBookingRowActions(container) {
    container.querySelectorAll('[data-cancel-id]').forEach(b => {
      b.addEventListener('click', () => cancelBooking(b.dataset.cancelId));
    });
    container.querySelectorAll('[data-delete-id]').forEach(b => {
      b.addEventListener('click', () => deleteBooking(b.dataset.deleteId));
    });
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function bookingRowHTML(b) {
    const d = S.parseISODate(b.date);
    const when = S.formatDateLong(d) + ' · ' + b.startTime + '–' + b.endTime + ' (' + b.durationMinutes + 'm)';
    const who = (b.studentName || '?') + ' · ' + (b.studentEmail || '?') + (b.topic ? ' · ' + b.topic : '');
    const statusBadge = '<span class="badge ' + b.status + '">' + b.status + '</span>';
    const syncBadge = '<span class="badge ' + (b.syncedToGcal ? 'synced' : 'unsynced') + '">' + (b.syncedToGcal ? 'on calendar' : 'not on calendar') + '</span>';
    const actions = b.status === 'cancelled'
      ? '<button class="secondary" data-delete-id="' + b.id + '">Delete</button>'
      : '<button class="secondary" data-cancel-id="' + b.id + '">Cancel</button>';
    return '<div class="booking-row">'
      + '<div class="info">'
      +   '<div class="when">' + escapeHTML(when) + '</div>'
      +   '<div class="who">'  + escapeHTML(who)  + '</div>'
      +   (b.notes ? '<div class="who"><em>' + escapeHTML(b.notes) + '</em></div>' : '')
      + '</div>'
      + '<div class="badges">' + statusBadge + syncBadge + '</div>'
      + '<div>' + actions + '</div>'
      + '</div>';
  }

  function cancelBooking(id) {
    const b = bookingsDoc.bookings.find(x => x.id === id);
    if (!b) return;
    const wasOnCal = b.syncedToGcal;
    const msg = wasOnCal
      ? 'Cancel this booking? It IS on Google Calendar — you\'ll need to remove the calendar event separately (use the "Sync" tab to copy a removal payload for Claude).'
      : 'Cancel this booking?';
    if (!confirm(msg)) return;
    b.status = 'cancelled';
    b.cancelledAt = new Date().toISOString();
    saveBookings(bookingsDoc);
    renderBookings();
    if (document.getElementById('tab-sync').classList.contains('active')) renderUnsynced();
    if (wasOnCal) {
      showBanner('Cancelled. <strong>Calendar event still exists</strong> — push to GitHub, then go to the Sync tab to remove it from Calendar.', 'error');
    } else {
      showBanner('Booking cancelled. Remember to push to GitHub.');
    }
  }

  function deleteBooking(id) {
    if (!confirm('Permanently delete this booking?')) return;
    bookingsDoc.bookings = bookingsDoc.bookings.filter(b => b.id !== id);
    saveBookings(bookingsDoc);
    renderBookings();
  }

  function generateCancelPayload() {
    // Bookings that were synced to GCal but are now cancelled — events still exist on calendar.
    const stale = bookingsDoc.bookings.filter(b => b.status === 'cancelled' && b.syncedToGcal);
    if (stale.length === 0) return '';
    const tz = availability.timeZone || 'Africa/Johannesburg';
    const lines = stale.map(b =>
      '- ' + b.date + ' ' + b.startTime + '–' + b.endTime + ' (' + tz + ') · ' + b.studentName + ' <' + b.studentEmail + '> · id=' + b.id + (b.gcalEventId ? ' · event=' + b.gcalEventId : '')
    );
    return 'Please find and DELETE these maths-tutoring Google Calendar events (each has the student as an attendee). Notify all attendees so they get removal notices.\n\n' + lines.join('\n');
  }

  // ---------- Add booking tab ----------
  let addSelected = null;

  function renderAddSlots() {
    const slots = S.buildAvailableSlots(availability, bookingsDoc.bookings);
    if (slots.length === 0) {
      document.getElementById('add-slot-list').innerHTML = '<p class="empty">No free slots in the next ' + availability.bookingHorizonWeeks + ' weeks.</p>';
      return;
    }
    const groups = S.groupSlotsByDate(slots);
    let html = '';
    for (const dateStr of Object.keys(groups).sort()) {
      const d = S.parseISODate(dateStr);
      html += '<div class="day-group"><h3>' + S.formatDateLong(d) + '<span class="date-sub">' + dateStr + '</span></h3><div class="slot-grid">';
      for (const slot of groups[dateStr]) {
        html += '<button type="button" class="slot-btn" '
          + 'data-date="' + slot.date + '" data-start="' + slot.startTime + '" data-end="' + slot.endTime + '" data-duration="' + slot.durationMinutes + '">'
          + slot.startTime + '–' + slot.endTime
          + '<span class="duration">' + slot.durationMinutes + ' min</span>'
          + '</button>';
      }
      html += '</div></div>';
    }
    document.getElementById('add-slot-list').innerHTML = html;
    document.querySelectorAll('#add-slot-list .slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addSelected = {
          date: btn.dataset.date,
          startTime: btn.dataset.start,
          endTime: btn.dataset.end,
          durationMinutes: parseInt(btn.dataset.duration, 10)
        };
        const d = S.parseISODate(addSelected.date);
        document.getElementById('add-pill').textContent =
          S.formatDateLong(d) + ' · ' + addSelected.startTime + '–' + addSelected.endTime + ' (' + addSelected.durationMinutes + ' min)';
        document.getElementById('add-form-card').style.display = 'block';
        document.getElementById('add-form-card').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  document.getElementById('add-back-btn').addEventListener('click', () => {
    document.getElementById('add-form-card').style.display = 'none';
    addSelected = null;
  });

  document.getElementById('add-save-btn').addEventListener('click', () => {
    if (!addSelected) return;
    const name = document.getElementById('add-name').value.trim();
    const email = document.getElementById('add-email').value.trim();
    const topic = document.getElementById('add-topic').value.trim();
    const notes = document.getElementById('add-notes').value.trim();
    if (!name || !email) { alert('Name and email are required.'); return; }

    bookingsDoc.bookings.push({
      id: S.uuid(),
      date: addSelected.date,
      startTime: addSelected.startTime,
      endTime: addSelected.endTime,
      durationMinutes: addSelected.durationMinutes,
      studentName: name,
      studentEmail: email,
      topic, notes,
      status: 'confirmed',
      syncedToGcal: false,
      gcalEventId: null,
      createdAt: new Date().toISOString()
    });
    saveBookings(bookingsDoc);

    document.getElementById('add-name').value = '';
    document.getElementById('add-email').value = '';
    document.getElementById('add-topic').value = '';
    document.getElementById('add-notes').value = '';
    document.getElementById('add-form-card').style.display = 'none';
    addSelected = null;

    showBanner('Booking saved locally. Don\'t forget to: (1) push to GitHub, (2) sync to Google Calendar.');
    renderBookings();
    renderAddSlots();
  });

  // ---------- Sync tab ----------
  function renderUnsynced() {
    const unsynced = bookingsDoc.bookings.filter(b => b.status === 'confirmed' && !b.syncedToGcal);
    const list = document.getElementById('unsynced-list');
    const actions = document.getElementById('sync-actions');
    const payload = document.getElementById('sync-payload');

    if (unsynced.length === 0) {
      list.innerHTML = '<p class="empty">All bookings are synced.</p>';
      actions.style.display = 'none';
      payload.style.display = 'none';
      return;
    }
    list.innerHTML = unsynced.map(bookingRowHTML).join('');
    wireBookingRowActions(list);

    const tz = availability.timeZone || 'Africa/Johannesburg';
    const lines = unsynced.map(b => {
      return '- ' + b.date + ' ' + b.startTime + '–' + b.endTime + ' (' + tz + ') · '
        + b.studentName + ' <' + b.studentEmail + '>'
        + (b.topic ? ' · ' + b.topic : '')
        + (b.notes ? ' · notes: ' + b.notes : '')
        + ' · id=' + b.id;
    });
    let payloadStr =
      'Please create Google Calendar events for the following maths tutoring bookings.\n' +
      'For each: summary "Maths tutoring — <student name>", add the student email as an attendee, notificationLevel=ALL, time zone ' + tz + '.\n' +
      'After creating each event, tell me to mark it synced and report any conflicts.\n\n' +
      lines.join('\n');

    const cancelPayload = generateCancelPayload();
    if (cancelPayload) {
      payloadStr += '\n\n---\n\nALSO: ' + cancelPayload;
    }
    payload.value = payloadStr;
    actions.style.display = 'flex';
  }

  document.getElementById('copy-sync-btn').addEventListener('click', async () => {
    const ta = document.getElementById('sync-payload');
    ta.style.display = 'block';
    ta.select();
    try {
      await navigator.clipboard.writeText(ta.value);
      showBanner('Copied. Paste it into Claude.');
    } catch {
      showBanner('Couldn\'t auto-copy — please copy manually from the text area.', 'error');
    }
  });

  document.getElementById('mark-synced-btn').addEventListener('click', () => {
    if (!confirm('Mark all unsynced confirmed bookings as on-calendar AND clear the syncedToGcal flag for any cancelled bookings (i.e. their calendar events have been deleted)?')) return;
    bookingsDoc.bookings.forEach(b => {
      if (b.status === 'confirmed' && !b.syncedToGcal) b.syncedToGcal = true;
      else if (b.status === 'cancelled' && b.syncedToGcal) b.syncedToGcal = false;
    });
    saveBookings(bookingsDoc);
    renderUnsynced();
    renderBookings();
    showBanner('Updated calendar state. Push to GitHub to persist.');
  });

  // ---------- GitHub sync ----------
  function ghCfg() {
    return {
      owner:  localStorage.getItem(LS.ghOwner)  || '',
      repo:   localStorage.getItem(LS.ghRepo)   || '',
      branch: localStorage.getItem(LS.ghBranch) || 'main',
      token:  localStorage.getItem(LS.ghToken)  || ''
    };
  }

  async function ghGetFileSha(cfg, path) {
    const url = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + path + '?ref=' + cfg.branch;
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + cfg.token, Accept: 'application/vnd.github+json' } });
    if (res.status === 404) return { sha: null, content: null };
    if (!res.ok) throw new Error('GitHub GET failed: ' + res.status + ' ' + (await res.text()));
    const data = await res.json();
    return { sha: data.sha, content: atob(data.content.replace(/\n/g, '')) };
  }

  async function ghPutFile(cfg, path, contentStr, sha, message) {
    const url = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + path;
    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(contentStr))),
      branch: cfg.branch
    };
    if (sha) body.sha = sha;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + cfg.token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('GitHub PUT failed: ' + res.status + ' ' + (await res.text()));
    return res.json();
  }

  document.getElementById('gh-push-btn').addEventListener('click', async () => {
    const cfg = ghCfg();
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      showBanner('Set GitHub owner, repo, and token in Settings first.', 'error'); return;
    }
    const status = document.getElementById('gh-status');
    status.innerHTML = '<p class="helper">Pushing…</p>';
    try {
      const path = 'data/bookings.json';
      const existing = await ghGetFileSha(cfg, path);
      // Staleness check: if remote content hash differs from what we last pushed, warn.
      if (existing.content) {
        const remoteHash = await hashString(existing.content);
        const lastPushed = localStorage.getItem(LS.lastPushedHash);
        if (lastPushed && remoteHash !== lastPushed) {
          if (!confirm('GitHub has changes you haven\'t pulled. Pushing now will OVERWRITE the remote copy and lose those changes. Continue anyway?\n\nClick Cancel, then click "Pull latest from GitHub" to merge.')) {
            status.innerHTML = '';
            return;
          }
        }
      }
      const content = bookingsContent();
      await ghPutFile(cfg, path, content, existing.sha, 'Update bookings.json from admin (' + new Date().toISOString() + ')');
      const newHash = await hashString(content);
      localStorage.setItem(LS.lastPushedHash, newHash);
      status.innerHTML = '<div class="success-banner">Pushed. Public booking page will update within ~1 minute.</div>';
      renderStatusBar();
    } catch (e) {
      status.innerHTML = '<div class="error-banner">' + escapeHTML(e.message) + '</div>';
    }
  });

  async function pullFromGitHub({ silent = false } = {}) {
    const cfg = ghCfg();
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      if (!silent) showBanner('Set GitHub owner, repo, and token in Settings first.', 'error');
      return { ok: false, reason: 'no-creds' };
    }
    const status = document.getElementById('gh-status');
    if (!silent && status) status.innerHTML = '<p class="helper">Pulling…</p>';
    try {
      const path = 'data/bookings.json';
      const existing = await ghGetFileSha(cfg, path);
      if (!existing.content) throw new Error('File not found in repo.');
      const remote = JSON.parse(existing.content);
      const remoteHash = await hashString(existing.content);
      const localHash = await hashString(bookingsContent());

      if (silent) {
        // Auto-pull on load: only replace if remote differs AND local has no unpushed changes.
        const lastPushed = localStorage.getItem(LS.lastPushedHash);
        const localHasUnpushed = lastPushed !== localHash;
        if (remoteHash === localHash) return { ok: true, changed: false };
        if (localHasUnpushed) {
          // Conflict: don't silently overwrite. Surface a banner.
          showBanner('Heads up: GitHub has different bookings than your local copy, AND you have unpushed local changes. Decide which to keep — use Push (your local wins) or Pull (GitHub wins) on the GitHub sync tab.', 'error');
          return { ok: true, changed: false, conflict: true };
        }
        bookingsDoc = remote;
        saveBookings(bookingsDoc);
        localStorage.setItem(LS.lastPushedHash, remoteHash);
        renderBookings();
        renderStatusBar();
        return { ok: true, changed: true };
      } else {
        if (!confirm('This will replace your local bookings with the GitHub copy (' + (remote.bookings || []).length + ' bookings). Continue?')) {
          if (status) status.innerHTML = '';
          return { ok: false, reason: 'cancelled' };
        }
        bookingsDoc = remote;
        saveBookings(bookingsDoc);
        localStorage.setItem(LS.lastPushedHash, remoteHash);
        renderBookings();
        renderStatusBar();
        if (status) status.innerHTML = '<div class="success-banner">Pulled.</div>';
        return { ok: true, changed: true };
      }
    } catch (e) {
      if (!silent && status) status.innerHTML = '<div class="error-banner">' + escapeHTML(e.message) + '</div>';
      return { ok: false, reason: 'error', error: e.message };
    }
  }

  document.getElementById('gh-pull-btn').addEventListener('click', () => pullFromGitHub({ silent: false }));

  // ---------- Settings ----------
  function loadSettings() {
    document.getElementById('gh-owner').value  = localStorage.getItem(LS.ghOwner)  || '';
    document.getElementById('gh-repo').value   = localStorage.getItem(LS.ghRepo)   || '';
    document.getElementById('gh-branch').value = localStorage.getItem(LS.ghBranch) || 'main';
    document.getElementById('gh-token').value  = localStorage.getItem(LS.ghToken)  || '';
  }

  function renderSchedule() {
    document.getElementById('schedule-pre').textContent = JSON.stringify(availability, null, 2);
  }

  document.getElementById('settings-save-btn').addEventListener('click', async () => {
    localStorage.setItem(LS.ghOwner,  document.getElementById('gh-owner').value.trim());
    localStorage.setItem(LS.ghRepo,   document.getElementById('gh-repo').value.trim());
    localStorage.setItem(LS.ghBranch, document.getElementById('gh-branch').value.trim() || 'main');
    localStorage.setItem(LS.ghToken,  document.getElementById('gh-token').value.trim());
    const newPw = document.getElementById('pw-set').value;
    if (newPw) {
      localStorage.setItem(LS.pwHash, await sha256(newPw));
      document.getElementById('pw-set').value = '';
    }
    showBanner('Settings saved.');
  });

  document.getElementById('settings-export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(bookingsDoc, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bookings.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('settings-clear-btn').addEventListener('click', () => {
    if (!confirm('Clear all local data (bookings, GitHub credentials, password)? This is irreversible.')) return;
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem(LS.unlocked);
    location.reload();
  });

  // ---------- Init ----------
  async function init() {
    try {
      await loadData();
      loadSettings();
      renderBookings();
      renderSchedule();
      renderStatusBar();
      // Auto-pull from GitHub if creds set, to avoid working off stale data.
      const cfg = ghCfg();
      if (cfg.owner && cfg.repo && cfg.token) {
        const r = await pullFromGitHub({ silent: true });
        if (r.changed) showBanner('Pulled latest bookings from GitHub.');
      }
    } catch (e) {
      showBanner('Failed to initialise: ' + e.message, 'error');
    }
  }

  (async function start() {
    if (await checkUnlocked()) {
      init();
    }
  })();
})();
