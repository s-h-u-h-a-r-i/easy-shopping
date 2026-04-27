// ── Render helpers ────────────────────────────────────────────────────────────

function badge(status) {
  return '';
}

function card(label, metaText, onclick, status = '') {
  const handler = onclick ? `onclick="${onclick}"` : '';
  const cls = status === 'shopping' ? ' card--shopping' : '';
  return `
    <div class="card${cls}" ${handler}>
      <div class="card-title">${label}</div>
      <div class="card-meta">${metaText}</div>
    </div>`;
}

// Active list item. canCheck = false when list isn't in shopping mode.
function listItem({ name, qty, checked }, readonly = false, listId = null, itemIdx = 0, canCheck = true) {
  const interactive = !readonly && listId !== null;
  const checkHandler = (interactive && canCheck)
    ? ` onclick="toggle(this, '${listId}', ${itemIdx})"`
    : '';
  const skipBtn = interactive
    ? `<button class="item-action-btn" onclick="skipItem('${listId}', ${itemIdx})" title="Set aside">—</button>`
    : '';
  const cls = [
    'list-item',
    readonly ? 'readonly' : '',
    (interactive && !canCheck) ? 'no-check' : '',
  ].filter(Boolean).join(' ');

  return `
    <div class="${cls}">
      <div class="checkbox${checked ? ' checked' : ''}"${checkHandler}>${checked ? '✓' : ''}</div>
      <span class="item-name">${name}</span>
      <span class="item-qty">${qty}</span>
      ${skipBtn}
    </div>`;
}

// Skipped item row — no checkbox, restore button on the right.
function skippedListItem({ name, qty }, listId, itemIdx, readonly = false) {
  const restoreBtn = !readonly
    ? `<button class="item-action-btn item-restore-btn" onclick="restoreItem('${listId}', ${itemIdx})" title="Restore">+</button>`
    : '';
  return `
    <div class="list-item skipped">
      <span class="item-name">${name}</span>
      <span class="item-qty">${qty}</span>
      ${restoreBtn}
    </div>`;
}

function viewShell(id, titleHtml, actionHtml, bodyHtml) {
  return `
    <div class="view" id="view-${id}">
      <div class="view-inner">
        <div class="view-header">
          <span class="view-title">${titleHtml}</span>
          ${actionHtml}
        </div>
        ${bodyHtml}
      </div>
    </div>`;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

// Only checks when list is in shopping mode — silently ignores otherwise.
function toggle(el, listId, itemIdx) {
  for (const uid of Object.keys(DB.lists)) {
    const list = DB.lists[uid].find(l => l.id === listId);
    if (list && list.items?.[itemIdx] !== undefined) {
      if (list.status !== 'shopping') return;
      list.items[itemIdx].checked = !list.items[itemIdx].checked;
      el.classList.toggle('checked');
      el.textContent = el.classList.contains('checked') ? '✓' : '';
      break;
    }
  }
}

function toggleTheme() {
  document.getElementById('shell').classList.toggle('dark');
  document.body.classList.toggle('dark');
}

// ── DB mutations ──────────────────────────────────────────────────────────────

function setListStatus(listId, status) {
  for (const uid of Object.keys(DB.lists)) {
    const list = DB.lists[uid].find(l => l.id === listId);
    if (list) {
      list.status = status;
      // Reset checked state when beginning a new shopping trip,
      // but preserve skipped — items set aside before shopping should stay aside.
      if (status === 'shopping' && list.items) {
        list.items.forEach(it => { it.checked = false; });
      }
      break;
    }
  }
  refreshViews('view-' + listId);
}

function skipItem(listId, itemIdx) {
  for (const uid of Object.keys(DB.lists)) {
    const list = DB.lists[uid].find(l => l.id === listId);
    if (list?.items?.[itemIdx]) {
      list.items[itemIdx].isSkipped = true;
      list.items[itemIdx].checked = false;
      break;
    }
  }
  refreshViews('view-' + listId);
}

function restoreItem(listId, itemIdx) {
  for (const uid of Object.keys(DB.lists)) {
    const list = DB.lists[uid].find(l => l.id === listId);
    if (list?.items?.[itemIdx]) {
      list.items[itemIdx].isSkipped = false;
      break;
    }
  }
  refreshViews('view-' + listId);
}

function acceptInvite(listId) {
  dbAcceptInvite(listId);
  refreshViews();
  renderPendingInvites();
  renderRecentList();
}

function declineInvite(listId) {
  dbDeclineInvite(listId);
  renderPendingInvites();
}

// Rebuilds all dynamic views and restores a specific view without going home.
function refreshViews(restoreViewId) {
  document.querySelectorAll('#content .view:not(#view-home)').forEach(v => v.remove());
  renderViews();
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = restoreViewId ? document.getElementById(restoreViewId) : null;
  if (target) {
    target.classList.add('active');
  } else {
    document.getElementById('view-home').classList.add('active');
    trail = [{ id: 'home', label: 'easy shopping' }];
    syncBottomNav('home');
  }
  renderBreadcrumb();
}
