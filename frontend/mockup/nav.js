// ── Breadcrumb ────────────────────────────────────────────────────────────────

// Resolved at call time so IDs are always current for the active user.
function resolveLabel(id) {
  const fixed = { home: 'easy shopping', lists: 'Lists', groups: 'Groups', shared: 'Shared', profile: 'Profile' };
  if (fixed[id]) return fixed[id];
  const list  = dbLists().find(l => l.id === id) || dbSharedWithMe().find(s => s.id === id);
  if (list)  return list.label;
  const group = dbGroups().find(g => g.id === id);
  if (group) return group.label;
  return id;
}

let trail = [{ id: 'home', label: 'easy shopping' }];

function renderBreadcrumb() {
  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = '';

  const current   = trail[trail.length - 1];
  const ancestors = trail.slice(0, -1);  // everything before the current page

  // Truncate long ancestor chains: keep [first, '..', last]
  const display = ancestors.length > 2
    ? [ancestors[0], null, ancestors[ancestors.length - 1]]
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

  // Always show the current page as a non-clickable label
  if (ancestors.length > 0) {
    const sep = document.createElement('span');
    sep.className = 'crumb-sep';
    sep.textContent = '/';
    bc.appendChild(sep);
  }
  const cur = document.createElement('span');
  cur.className = 'crumb crumb-current';
  cur.textContent = current.label;
  bc.appendChild(cur);
}

// ── Navigation ────────────────────────────────────────────────────────────────

function navigateTo(id, fromBreadcrumb = false) {
  const target = document.getElementById('view-' + id);
  if (!target) return;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  target.classList.add('active');

  if (fromBreadcrumb) {
    const idx = trail.findIndex(c => c.id === id);
    if (idx !== -1) trail = trail.slice(0, idx + 1);
  } else if (id === 'home') {
    trail = [{ id: 'home', label: 'easy shopping' }];
  } else {
    if (trail[trail.length - 1].id !== id) {
      trail.push({ id, label: resolveLabel(id) });
    }
  }

  renderBreadcrumb();
  syncBottomNav(id);
}

// Inserts 'Lists' into the trail unless already inside a group context.
// Breadcrumb: easy shopping / Lists / Weekly groceries
function navigateToList(id, label) {
  dbRecordVisit(id);
  const inGroup = trail.some(c => dbGroups().some(g => g.id === c.id));
  if (!inGroup && !trail.find(c => c.id === 'lists')) {
    trail.push({ id: 'lists', label: 'Lists' });
  }
  if (trail[trail.length - 1].id !== id) {
    trail.push({ id, label });
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  renderRecentList();
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
  dbRecordVisit(id);
  if (!trail.find(c => c.id === 'lists')) {
    trail.push({ id: 'lists', label: 'Lists' });
  }
  if (trail[trail.length - 1].id !== id) {
    trail.push({ id, label });
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  renderRecentList();
  renderBreadcrumb();
  syncBottomNav('shared');
}

function syncBottomNav(id) {
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('bnav-' + id);
  if (target) target.classList.add('active');
  else document.getElementById('bnav-home').classList.add('active');
}
