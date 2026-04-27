// ── Dev panel — mockup-only scaffolding, not part of the real app ─────────────

// ── State ─────────────────────────────────────────────────────────────────────

const DEV = {
  greeting: 'random',
};

// ── Pending invites strip ─────────────────────────────────────────────────────

function renderPendingInvites() {
  const container = document.getElementById('pending-invites-strip');
  if (!container) return;
  const invites = dbPendingInvitesForMe();
  if (invites.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="recent-strip" style="margin-bottom:0;padding-bottom:20px;border-bottom:1px solid var(--border)">
      <p class="section-label" style="margin-bottom:12px">Invites</p>
      ${invites.map(inv => `
        <div class="invite-row">
          <div class="invite-row-info">
            <span class="avatar collab-avatar" style="flex-shrink:0">${inv.ownerInitials}</span>
            <span class="invite-row-text">
              <span>${inv.ownerName}</span>
              <span class="card-meta"> shared </span>
              <span>${inv.listLabel}</span>
              <span class="card-meta"> · ${inv.role}</span>
            </span>
          </div>
          <div class="invite-row-actions">
            <button class="add-btn" onclick="acceptInvite('${inv.listId}')">Accept</button>
            <button class="share-btn" onclick="declineInvite('${inv.listId}')">Decline</button>
          </div>
        </div>`).join('')}
    </div>`;
}

// ── Recent strip ──────────────────────────────────────────────────────────────

function renderRecentList() {
  const container = document.getElementById('recent-list');
  if (!container) return;
  const recent = dbRecentLists();
  if (recent.length === 0) {
    container.innerHTML =
      '<p class="card-meta" style="padding:6px 0">No recently visited lists.</p>';
    return;
  }
  const sharedIds = new Set(dbSharedWithMe().map(s => s.id));
  container.innerHTML = recent
    .map((l) => {
      const isShared = sharedIds.has(l.id);
      const b = l.status === 'shopping'
        ? `<span class="badge shopping">shopping</span>` : '';
      const itemCount = l.itemCount ?? l.items?.length ?? 0;
      const meta = isShared
        ? `${itemCount} items · shared`
        : `${itemCount} items`;
      const nav = isShared
        ? `navigateToSharedList('${l.id}', '${l.label.replace(/'/g, "\\'")}')`
        : `navigateToList('${l.id}', '${l.label.replace(/'/g, "\\'")}')`;
      return `
      <div class="recent-row" onclick="${nav}">
        <span class="recent-name">${l.label} ${b}</span>
        <span class="recent-meta">${meta}</span>
      </div>`;
    })
    .join('');
}

// ── Apply ─────────────────────────────────────────────────────────────────────

function dpApply() {
  const user = getCurrentUser();

  // Remember which view is active before wiping dynamic views
  const activeId = document.querySelector('#content .view.active')?.id;

  // Re-render all dynamic views (they read from DB via CURRENT_USER_ID)
  document
    .querySelectorAll('#content .view:not(#view-home)')
    .forEach((v) => v.remove());
  renderViews();

  // Restore the active view (fall back to home if it was wiped)
  const restored = activeId ? document.getElementById(activeId) : null;
  if (restored) {
    restored.classList.add('active');
  } else {
    document.getElementById('view-home')?.classList.add('active');
  }

  // Sync avatars
  document.querySelectorAll('.avatar:not(.collab-avatar)').forEach((el) => {
    el.textContent = user.initials;
  });

  // Sync greeting
  const greetingEl = document.getElementById('hub-greeting');
  if (greetingEl) {
    const pool = GREETINGS.map((g) => g.replace(/Ahmed/g, user.name));
    greetingEl.textContent =
      DEV.greeting === 'random'
        ? pool[Math.floor(Math.random() * pool.length)]
        : DEV.greeting.replace(/Ahmed/g, user.name);
  }

  // Sync home hub stats
  const lists         = dbLists();
  const groups        = dbGroups();
  const shoppingCount = lists.filter(l => l.status === 'shopping').length;

  const hubSub = document.querySelector('.hub-sub');
  if (hubSub) hubSub.textContent = shoppingCount
    ? `${shoppingCount} list${shoppingCount !== 1 ? 's' : ''} in progress.`
    : 'No active shopping trips.';
  const hubCards = document.querySelectorAll('.hub-card .hub-card-meta');
  if (hubCards[0]) hubCards[0].textContent = `${lists.length} list${lists.length !== 1 ? 's' : ''}`;
  if (hubCards[1]) hubCards[1].textContent = `${groups.length} group${groups.length !== 1 ? 's' : ''}`;
  if (hubCards[2]) hubCards[2].textContent = `@${user.username}`;

  // Sync home dynamic strips
  renderPendingInvites();
  renderRecentList();

  // Sync data-scale sliders to this user's settings
  dpSyncScaleUI(DB.settings[CURRENT_USER_ID]);
}

function dpSyncScaleUI(s) {
  const entries = {
    listCount:     s.listCount,
    groupCount:    s.groupCount,
    itemsPerList:  s.itemsPerList,
    shoppingRatio: s.shoppingRatio,
  };
  for (const [key, val] of Object.entries(entries)) {
    const slider = document.querySelector(`[oninput*="'${key}'"]`);
    if (slider) slider.value = val;
    const badge = document.getElementById(`dp-val-${key}`);
    if (badge) badge.textContent = key === 'shoppingRatio' ? `${val}%` : val;
  }
}

// ── Controls ──────────────────────────────────────────────────────────────────

const DP_SCALE_KEYS = new Set(['listCount', 'groupCount', 'itemsPerList', 'shoppingRatio']);

function dpSet(key, rawValue) {
  if (key === 'userId') {
    CURRENT_USER_ID = rawValue;
  } else if (DP_SCALE_KEYS.has(key)) {
    DB.settings[CURRENT_USER_ID][key] = +rawValue;
    dbSeedUserLists(CURRENT_USER_ID);
    const badge = document.getElementById(`dp-val-${key}`);
    if (badge)
      badge.textContent = key === 'shoppingRatio' ? `${rawValue}%` : rawValue;
  } else {
    DEV[key] = rawValue;
  }
  dpApply();
}

// ── Open / close ──────────────────────────────────────────────────────────────

function dpOpen() {
  document.getElementById('dp-overlay').classList.add('active');
  document.getElementById('dp-drawer').classList.add('active');
}
function dpClose() {
  document.getElementById('dp-overlay').classList.remove('active');
  document.getElementById('dp-drawer').classList.remove('active');
}

// ── Init ──────────────────────────────────────────────────────────────────────

function dpInitDragHandle() {
  const handle = document.querySelector('.devpanel-handle');
  const drawer = document.getElementById('dp-drawer');
  let startY = 0;
  let startH = 0;

  function onMove(e) {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = startY - y;
    const clamped = Math.max(
      120,
      Math.min(window.innerHeight * 0.94, startH + delta),
    );
    drawer.style.maxHeight = clamped + 'px';
    e.preventDefault();
  }
  function onEnd() {
    handle.classList.remove('dragging');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchend', onEnd);
  }
  function onStart(e) {
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startH = drawer.offsetHeight;
    handle.classList.add('dragging');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    e.preventDefault();
  }

  handle.addEventListener('mousedown', onStart);
  handle.addEventListener('touchstart', onStart, { passive: false });
}

function initDevPanel() {
  const s = DB.settings[CURRENT_USER_ID];

  const greetingOptions = GREETINGS.map(
    (g) =>
      `<option value="${g}">${g.replace(/Ahmed/g, getCurrentUser().name)}</option>`,
  ).join('');

  const userOptions = REGISTERED_USERS.map(
    (u) =>
      `<option value="${u.username}"${u.username === CURRENT_USER_ID ? ' selected' : ''}>${u.name} (@${u.username})</option>`,
  ).join('');

  const html = `
    <button class="devpanel-trigger" onclick="dpOpen()">⚙ Dev panel</button>

    <div class="devpanel-overlay" id="dp-overlay" onclick="dpClose()"></div>

    <div class="devpanel-drawer" id="dp-drawer">
      <div class="devpanel-handle"></div>

      <div class="devpanel-header">
        <span class="devpanel-title">Dev panel</span>
        <button class="devpanel-close" onclick="dpClose()">✕ close</button>
      </div>

      <!-- ── Current User ── -->
      <div class="devpanel-section">
        <p class="devpanel-section-label">Current User</p>

        <div class="devpanel-row">
          <span class="devpanel-label">Logged in as</span>
          <select class="devpanel-select" id="dp-user-select" onchange="dpSet('userId', this.value)">
            ${userOptions}
          </select>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Greeting</span>
          <select class="devpanel-select" onchange="dpSet('greeting', this.value)">
            <option value="random">Random</option>
            ${greetingOptions}
          </select>
        </div>
      </div>

      <!-- ── Data scale ── -->
      <div class="devpanel-section">
        <p class="devpanel-section-label">Data scale <span class="devpanel-section-note">(current user)</span></p>

        <div class="devpanel-row">
          <span class="devpanel-label">Lists</span>
          <input class="devpanel-range" type="range" min="0" max="30"
            value="${s.listCount}" oninput="dpSet('listCount', this.value)">
          <span class="devpanel-value" id="dp-val-listCount">${s.listCount}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Groups</span>
          <input class="devpanel-range" type="range" min="0" max="10"
            value="${s.groupCount}" oninput="dpSet('groupCount', this.value)">
          <span class="devpanel-value" id="dp-val-groupCount">${s.groupCount}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Items per list</span>
          <input class="devpanel-range" type="range" min="0" max="20"
            value="${s.itemsPerList}" oninput="dpSet('itemsPerList', this.value)">
          <span class="devpanel-value" id="dp-val-itemsPerList">${s.itemsPerList}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Shopping ratio</span>
          <input class="devpanel-range" type="range" min="0" max="100" step="10"
            value="${s.shoppingRatio}" oninput="dpSet('shoppingRatio', this.value)">
          <span class="devpanel-value" id="dp-val-shoppingRatio">${s.shoppingRatio}%</span>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  dpInitDragHandle();
  dpApply();
}
