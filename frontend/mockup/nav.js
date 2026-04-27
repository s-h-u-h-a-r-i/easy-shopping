// ── Breadcrumb ────────────────────────────────────────────────────────────────

const LABELS = {
  home: 'easy shopping', lists: 'Lists', groups: 'Groups',
  shared: 'Shared', profile: 'Profile',
  ...Object.fromEntries(LISTS.map(l => [l.id, l.label])),
  ...Object.fromEntries(GROUPS.map(g => [g.id, g.label])),
  ...Object.fromEntries(SHARED.map(s => [s.id, s.label])),
};

let trail = [{ id: 'home', label: 'easy shopping' }];

function renderBreadcrumb() {
  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = '';

  // Drop the current page (last item) — breadcrumb is navigation context only.
  // At home (depth 1) there is nothing to drop, just show home.
  const ancestors      = trail.length > 1 ? trail.slice(0, -1) : trail;
  const hasCurrentPage = trail.length > 1;

  // Truncate long trails: keep [first, '..', last-1, last]
  const display = ancestors.length > 3
    ? [ancestors[0], null, ancestors[ancestors.length - 2], ancestors[ancestors.length - 1]]
    : ancestors;

  display.forEach((crumb, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '/';
      bc.appendChild(sep);
    }
    if (crumb === null) {
      const el = document.createElement('span');
      el.className = 'crumb-ellipsis';
      el.textContent = '..';
      bc.appendChild(el);
    } else {
      const btn = document.createElement('button');
      btn.className = 'crumb';
      btn.textContent = crumb.label;
      btn.onclick = () => navigateTo(crumb.id, true);
      bc.appendChild(btn);
    }
  });

  if (hasCurrentPage) {
    const sep = document.createElement('span');
    sep.className = 'crumb-sep';
    sep.textContent = '/';
    bc.appendChild(sep);
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function navigateTo(id, fromBreadcrumb = false) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');

  if (fromBreadcrumb) {
    const idx = trail.findIndex(c => c.id === id);
    if (idx !== -1) trail = trail.slice(0, idx + 1);
  } else if (id === 'home') {
    trail = [{ id: 'home', label: 'easy shopping' }];
  } else {
    if (trail[trail.length - 1].id !== id) {
      trail.push({ id, label: LABELS[id] || id });
    }
  }

  renderBreadcrumb();
  syncBottomNav(id);
}

// Inserts 'Lists' into the trail unless already inside a group context.
// Breadcrumb: easy shopping / Lists / Weekly groceries
function navigateToList(id, label) {
  const inGroup = trail.some(c => GROUPS.some(g => g.id === c.id));
  if (!inGroup && !trail.find(c => c.id === 'lists')) {
    trail.push({ id: 'lists', label: 'Lists' });
  }
  if (trail[trail.length - 1].id !== id) {
    trail.push({ id, label });
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  renderBreadcrumb();
  syncBottomNav('lists');
}

// Inserts 'Groups' into the trail if missing.
// Breadcrumb: easy shopping / Groups / Household
function navigateToGroup(id, label) {
  if (!trail.find(c => c.id === 'groups')) {
    trail.push({ id: 'groups', label: 'Groups' });
  }
  if (trail[trail.length - 1].id !== id) {
    trail.push({ id, label });
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  renderBreadcrumb();
  syncBottomNav('groups');
}

// Inserts 'Shared' into the trail if missing.
// Breadcrumb: easy shopping / Shared / Family shop
function navigateToSharedList(id, label) {
  if (!trail.find(c => c.id === 'shared')) {
    trail.push({ id: 'shared', label: 'Shared' });
  }
  if (trail[trail.length - 1].id !== id) {
    trail.push({ id, label });
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  renderBreadcrumb();
  syncBottomNav('shared');
}

function syncBottomNav(id) {
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('bnav-' + id);
  if (target) target.classList.add('active');
  else document.getElementById('bnav-home').classList.add('active');
}
