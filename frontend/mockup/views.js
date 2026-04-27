// ── View builders ─────────────────────────────────────────────────────────────

function buildListsView() {
  const active    = LISTS.filter(l => l.status !== 'completed');
  const completed = LISTS.filter(l => l.status === 'completed');

  const activeCards = active.map(l =>
    card(
      `${l.label}${badge(l.status)}`,
      `${l.itemCount} items${l.group ? ' · ' + l.group : ''}`,
      `navigateToList('${l.id}', '${l.label}')`,
    )
  ).join('');

  const completedCards = completed.map(l => {
    const meta    = [l.itemCount ? `${l.itemCount} items` : null, l.date].filter(Boolean).join(' · ');
    const handler = l.items ? `navigateToList('${l.id}', '${l.label}')` : null;
    return card(l.label, meta, handler);
  }).join('');

  return viewShell(
    'lists', 'Lists',
    '<button class="add-btn">+ New list</button>',
    `<p class="section-label">Active</p>
     <div class="card-grid">${activeCards}</div>
     <p class="section-label" style="margin-top:28px">Completed</p>
     <div class="card-grid">${completedCards}</div>`,
  );
}

function buildListDetailViews() {
  return LISTS.filter(l => l.items).map(l => {
    const titleHtml = `${l.label}${badge(l.status)}`;
    const action = l.snapshot
      ? ''
      : `<div class="view-actions">
           <button class="add-btn">+ Add item</button>
           <button class="share-btn" onclick="openShareModal('${l.id}')">Share</button>
         </div>`;
    const header = l.snapshot ? `<p class="section-label">Snapshot — ${l.date}</p>` : '';
    const items  = l.items.map(listItem).join('');
    return viewShell(l.id, titleHtml, action, `${header}<div class="list-items">${items}</div>`);
  }).join('');
}

function buildGroupsView() {
  const cards = GROUPS.map(g =>
    card(g.label, `${g.listCount} lists`, `navigateToGroup('${g.id}', '${g.label}')`)
  ).join('');
  return viewShell(
    'groups', 'Groups',
    '<button class="add-btn">+ New group</button>',
    `<div class="card-grid">${cards}</div>`,
  );
}

function buildGroupDetailView(group) {
  const lists = LISTS.filter(l => l.group === group.label);
  const cards = lists.map(l =>
    card(
      `${l.label}${badge(l.status)}`,
      `${l.itemCount} items`,
      `navigateToList('${l.id}', '${l.label}')`,
    )
  ).join('');
  const empty = '<p class="card-meta" style="padding:8px 0">No lists in this group yet.</p>';
  return viewShell(
    group.id, group.label,
    '<button class="add-btn">+ New list</button>',
    `<div class="card-grid">${cards || empty}</div>`,
  );
}

function buildGroupDetailViews() {
  return GROUPS.map(buildGroupDetailView).join('');
}

function buildSharedView() {
  const withMeCards = SHARED.map(s =>
    card(
      `${s.label}${badge(s.status)}`,
      `<span class="avatar collab-avatar" style="vertical-align:middle;margin-right:6px">${s.sharedByInitials}</span>${s.sharedBy} · ${s.role}`,
      `navigateToSharedList('${s.id}', '${s.label}')`,
    )
  ).join('');

  const byMeLists = LISTS.filter(l => COLLABORATORS[l.id]);
  const byMeCards = byMeLists.map(l => {
    const collabs = COLLABORATORS[l.id];
    const avatars = collabs.map(c =>
      `<span class="avatar collab-avatar" style="vertical-align:middle">${c.initials}</span>`
    ).join('');
    const names = collabs.map(c => c.name).join(', ');
    return card(
      `${l.label}${badge(l.status)}`,
      `${avatars} <span style="margin-left:6px">${names}</span>`,
      `navigateToList('${l.id}', '${l.label}')`,
    );
  }).join('');

  return viewShell(
    'shared', 'Shared',
    '',
    `<p class="section-label">Shared with me</p>
     <div class="card-grid">${withMeCards}</div>
     <p class="section-label" style="margin-top:28px">Shared by me</p>
     <div class="card-grid">${byMeCards}</div>`,
  );
}

function buildSharedListViews() {
  return SHARED.filter(s => s.items).map(s => {
    const items = s.items.map(listItem).join('');
    const byTag = `<span class="shared-by-tag">
      <span class="avatar collab-avatar" style="vertical-align:middle;margin-right:6px">${s.sharedByInitials}</span>${s.sharedBy} · ${s.role}
    </span>`;
    return viewShell(s.id, `${s.label}${badge(s.status)}`, byTag, `<div class="list-items">${items}</div>`);
  }).join('');
}

function buildProfileView() {
  return viewShell(
    'profile', 'Profile', '',
    `<p class="card-meta" style="margin-bottom:8px">Username</p>
     <p style="margin-bottom:20px">@ahmose</p>
     <p class="card-meta" style="margin-bottom:8px">Display name</p>
     <p>Ahmed</p>`,
  );
}

function renderViews() {
  const content = document.getElementById('content');
  const html = [
    buildListsView(),
    buildListDetailViews(),
    buildGroupsView(),
    buildGroupDetailViews(),
    buildSharedView(),
    buildSharedListViews(),
    buildProfileView(),
  ].join('');
  content.insertAdjacentHTML('beforeend', html);
}
