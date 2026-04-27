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
      <div id="modal-pending-section"></div>
      <div class="modal-divider"></div>
      <div class="modal-invite-row">
        <input id="modal-invite-input" class="invite-input" placeholder="@username"
               onkeydown="if(event.key==='Enter') sendInvite()" />
        <select id="modal-role-select" class="role-select">
          <option value="viewer">viewer</option>
          <option value="editor">editor</option>
        </select>
        <button class="add-btn" onclick="sendInvite()">Invite</button>
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
  const collabs  = DB.collaborators[activeShareListId] || [];
  const pending  = dbPendingInvitesForList(activeShareListId);
  const collabEl = document.getElementById('modal-collaborators');
  const pendEl   = document.getElementById('modal-pending-section');

  // Active collaborators
  if (collabs.length === 0) {
    collabEl.innerHTML = '<p class="card-meta" style="padding:4px 0 12px">Only you have access.</p>';
  } else {
    collabEl.innerHTML = collabs.map((c, i) => `
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

  // Pending invites
  if (pending.length === 0) {
    pendEl.innerHTML = '';
  } else {
    pendEl.innerHTML = `
      <p class="section-label" style="margin-top:16px;margin-bottom:10px">Pending invites</p>
      ${pending.map((inv, i) => `
        <div class="collab-row">
          <div class="avatar collab-avatar">${inv.initials}</div>
          <span class="collab-name">${inv.name} <span class="card-meta">(pending)</span></span>
          <span class="card-meta">${inv.role}</span>
          <button class="collab-remove" onclick="revokeInvite(${i})" title="Cancel invite">✕</button>
        </div>`).join('')}`;
  }
}

function sendInvite() {
  const input    = document.getElementById('modal-invite-input');
  const role     = document.getElementById('modal-role-select').value;
  const feedback = document.getElementById('modal-invite-feedback');
  const raw      = input.value.trim();
  if (!raw) return;

  const usernameInput = raw.replace(/^@/, '');
  const user = findRegisteredUser(usernameInput);
  if (!user) {
    setFeedback(feedback, `User "${usernameInput}" not found.`, 'error');
    return;
  }

  if (user.username === CURRENT_USER_ID) {
    setFeedback(feedback, "You can't share a list with yourself.", 'error');
    return;
  }

  const alreadyCollaborator = (DB.collaborators[activeShareListId] || []).find(c => c.username === user.username);
  if (alreadyCollaborator) {
    setFeedback(feedback, `${user.name} already has access.`, 'error');
    return;
  }

  const alreadyInvited = (DB.invites[activeShareListId] || []).find(
    inv => inv.username === user.username && inv.status === 'pending'
  );
  if (alreadyInvited) {
    setFeedback(feedback, `${user.name} already has a pending invite.`, 'error');
    return;
  }

  if (!DB.invites[activeShareListId]) DB.invites[activeShareListId] = [];
  DB.invites[activeShareListId].push({
    username:      user.username,
    name:          user.name,
    initials:      user.initials,
    role,
    status:        'pending',
    invitedBy:     CURRENT_USER_ID,
  });

  input.value = '';
  renderModalCollaborators();
  setFeedback(feedback, `Invite sent to ${user.name}.`, 'success');
}

function revokeInvite(idx) {
  const pending = dbPendingInvitesForList(activeShareListId);
  const inv = pending[idx];
  if (!inv) return;
  const entry = (DB.invites[activeShareListId] || []).find(
    i => i.username === inv.username && i.status === 'pending'
  );
  if (entry) entry.status = 'declined';
  renderModalCollaborators();
}

function removeCollaborator(idx) {
  DB.collaborators[activeShareListId]?.splice(idx, 1);
  renderModalCollaborators();
}

function changeRole(idx, role) {
  const entry = DB.collaborators[activeShareListId]?.[idx];
  if (entry) entry.role = role;
}

function setFeedback(el, msg, type) {
  el.textContent = msg;
  el.className = `modal-feedback ${type}`;
  setTimeout(() => { el.textContent = ''; el.className = 'modal-feedback'; }, 2500);
}
