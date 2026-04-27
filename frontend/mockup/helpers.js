// ── Render helpers ────────────────────────────────────────────────────────────

function badge(status) {
  if (!status || status === 'completed') return '';
  return `<span class="badge ${status}">${status}</span>`;
}

function card(label, metaText, onclick) {
  const handler = onclick ? `onclick="${onclick}"` : '';
  return `
    <div class="card" ${handler}>
      <div class="card-title">${label}</div>
      <div class="card-meta">${metaText}</div>
    </div>`;
}

function listItem({ name, qty, checked }) {
  return `
    <div class="list-item">
      <div class="checkbox${checked ? ' checked' : ''}" onclick="toggle(this)">${checked ? '✓' : ''}</div>
      <span class="item-name">${name}</span>
      <span class="item-qty">${qty}</span>
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

function toggle(el) {
  el.classList.toggle('checked');
  el.textContent = el.classList.contains('checked') ? '✓' : '';
}

function toggleTheme() {
  document.getElementById('shell').classList.toggle('dark');
  document.body.classList.toggle('dark');
}
