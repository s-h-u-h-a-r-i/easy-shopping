// ── Share modal ───────────────────────────────────────────────────────────────

let activeShareListId = null;

function initShareModal() {
  const el = document.createElement('div');
  el.id = 'share-modal';
  el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="modal-card" onclick="event.stopPropagation()">
      <div class="modal-header">
        <span class="modal-title">Share list</span>
        <button class="modal-close" onclick="closeShareModal()">✕</button>
      </div>
      <p class="section-label" style="margin-bottom:14px">People with access</p>
      <div id="modal-collaborators"></div>
      <div class="modal-divider"></div>
      <div class="modal-invite-row">
        <input id="modal-invite-input" class="invite-input" placeholder="@username or email"
               onkeydown="if(event.key==='Enter') inviteCollaborator()" />
        <select id="modal-role-select" class="role-select">
          <option value="viewer">viewer</option>
          <option value="editor">editor</option>
        </select>
        <button class="add-btn" onclick="inviteCollaborator()">Invite</button>
      </div>
      <p id="modal-invite-feedback" class="modal-feedback"></p>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) closeShareModal(); });
  document.getElementById('shell').appendChild(el);
}

function openShareModal(listId) {
  activeShareListId = listId;
  renderModalCollaborators();
  document.getElementById('modal-invite-input').value = '';
  document.getElementById('modal-invite-feedback').textContent = '';
  document.getElementById('share-modal').classList.add('active');
  setTimeout(() => document.getElementById('modal-invite-input').focus(), 50);
}

function closeShareModal() {
  document.getElementById('share-modal').classList.remove('active');
  activeShareListId = null;
}

function renderModalCollaborators() {
  const collabs    = COLLABORATORS[activeShareListId] || [];
  const container  = document.getElementById('modal-collaborators');
  if (collabs.length === 0) {
    container.innerHTML = '<p class="card-meta" style="padding:4px 0 12px">Only you have access.</p>';
    return;
  }
  container.innerHTML = collabs.map((c, i) => `
    <div class="collab-row">
      <div class="avatar collab-avatar">${c.initials}</div>
      <span class="collab-name">${c.name}</span>
      <select class="role-select" onchange="changeRole(${i}, this.value)">
        <option value="viewer"${c.role === 'viewer' ? ' selected' : ''}>viewer</option>
        <option value="editor"${c.role === 'editor' ? ' selected' : ''}>editor</option>
      </select>
      <button class="collab-remove" onclick="removeCollaborator(${i})" title="Remove access">✕</button>
    </div>`).join('');
}

function inviteCollaborator() {
  const input    = document.getElementById('modal-invite-input');
  const role     = document.getElementById('modal-role-select').value;
  const feedback = document.getElementById('modal-invite-feedback');
  const raw      = input.value.trim();
  if (!raw) return;

  const name     = raw.replace(/^@/, '');
  const initials = name.slice(0, 2).toUpperCase();
  if (!COLLABORATORS[activeShareListId]) COLLABORATORS[activeShareListId] = [];

  COLLABORATORS[activeShareListId].push({ name, initials, role });
  input.value = '';
  renderModalCollaborators();
  feedback.textContent = `Invite sent to ${name}.`;
  setTimeout(() => { feedback.textContent = ''; }, 2500);
}

function removeCollaborator(idx) {
  COLLABORATORS[activeShareListId].splice(idx, 1);
  renderModalCollaborators();
}

function changeRole(idx, role) {
  COLLABORATORS[activeShareListId][idx].role = role;
}
