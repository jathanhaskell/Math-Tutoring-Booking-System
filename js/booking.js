// Student-facing booking page logic.
(async function () {
  const S = window.BookingShared;
  const slotList = document.getElementById('slot-list');
  const slotCard = document.getElementById('slot-card');
  const formCard = document.getElementById('form-card');
  const banner = document.getElementById('banner');
  const pill = document.getElementById('selected-pill');
  const tzEl = document.getElementById('tz');
  const form = document.getElementById('booking-form');
  const subjEl = document.getElementById('subj');

  let selected = null;

  function showBanner(msg, kind) {
    banner.innerHTML = '<div class="' + (kind === 'error' ? 'error-banner' : 'success-banner') + '">' + msg + '</div>';
  }

  function render(slots) {
    if (slots.length === 0) {
      slotList.innerHTML = '<p class="empty">No times available in the next 4 weeks. Please check back soon.</p>';
      return;
    }
    const groups = S.groupSlotsByDate(slots);
    const dates = Object.keys(groups).sort();
    let html = '';
    for (const dateStr of dates) {
      const d = S.parseISODate(dateStr);
      html += '<div class="day-group">';
      html += '<h3>' + S.formatDateLong(d) + '<span class="date-sub">' + dateStr + '</span></h3>';
      html += '<div class="slot-grid">';
      for (const slot of groups[dateStr]) {
        html += '<button type="button" class="slot-btn" '
          + 'data-date="' + slot.date + '" '
          + 'data-start="' + slot.startTime + '" '
          + 'data-end="' + slot.endTime + '" '
          + 'data-duration="' + slot.durationMinutes + '">'
          + slot.startTime + '–' + slot.endTime
          + '<span class="duration">' + slot.durationMinutes + ' min</span>'
          + '</button>';
      }
      html += '</div></div>';
    }
    slotList.innerHTML = html;

    slotList.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => selectSlot(btn));
    });
  }

  function selectSlot(btn) {
    selected = {
      date: btn.dataset.date,
      startTime: btn.dataset.start,
      endTime: btn.dataset.end,
      durationMinutes: parseInt(btn.dataset.duration, 10)
    };
    document.getElementById('f-date').value = selected.date;
    document.getElementById('f-start').value = selected.startTime;
    document.getElementById('f-end').value = selected.endTime;
    document.getElementById('f-duration').value = selected.durationMinutes;

    const d = S.parseISODate(selected.date);
    const label = S.formatDateLong(d) + ' · ' + selected.startTime + '–' + selected.endTime + ' (' + selected.durationMinutes + ' min)';
    pill.textContent = label;
    subjEl.value = 'New tutoring booking — ' + label;

    slotCard.style.display = 'none';
    formCard.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('back-btn').addEventListener('click', () => {
    formCard.style.display = 'none';
    slotCard.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Friendly post-submit redirect (Formsubmit will handle this).
  // We append _next dynamically so it works on whatever host the page is on.
  form.addEventListener('submit', () => {
    const next = window.location.origin + window.location.pathname.replace(/index\.html$/, '') + 'index.html?booked=1';
    let nextEl = form.querySelector('input[name="_next"]');
    if (!nextEl) {
      nextEl = document.createElement('input');
      nextEl.type = 'hidden';
      nextEl.name = '_next';
      form.appendChild(nextEl);
    }
    nextEl.value = next;
  });

  if (new URLSearchParams(window.location.search).get('booked') === '1') {
    showBanner('Thanks! Your request has been sent. You\'ll get a calendar invite by email once it\'s confirmed (usually within 24 hours).');
  }

  try {
    const [availability, bookingsDoc] = await Promise.all([
      S.loadJSON('data/availability.json'),
      S.loadJSON('data/bookings.json')
    ]);
    const tz = availability.timeZone || 'Africa/Johannesburg';
    tzEl.textContent = tz;
    const tzBanner = document.getElementById('tz-banner');
    if (tzBanner) tzBanner.textContent = tz;
    const slots = S.buildAvailableSlots(availability, bookingsDoc.bookings || []);
    render(slots);
  } catch (e) {
    slotList.innerHTML = '<p class="empty">Couldn\'t load availability. Please try again later.</p>';
    console.error(e);
  }
})();
