// ── View builders ─────────────────────────────────────────────────────────────

function buildListsView() {
  const lists    = dbLists();
  const shopping = lists.filter(l => l.status === 'shopping');
  const idle     = lists.filter(l => l.status === 'idle');
  const shared   = dbSharedWithMe();
  const groups   = dbGroups();

  const emptyMsg = text => `<p class="card-meta" style="padding:8px 0">${text}</p>`;

  const groupLabel = l => {
    const g = groups.find(g => g.id === l.groupId);
    return g ? ' · ' + g.label : '';
  };

  const ownCard = l => card(
    l.label,
    `${l.itemCount ?? l.items?.length ?? 0} items${groupLabel(l)}`,
    `navigateToList('${l.id}', '${l.label}')`,
    l.status,
  );

  const sharedCard = s => `
    <div class="card${s.status === 'shopping' ? ' card--shopping' : ''}" onclick="navigateToSharedList('${s.id}', '${s.label.replace(/'/g, "\\'")}')">
      <div class="card-title">${s.label}</div>
      <div class="card-shared-attr">
        <span class="avatar collab-avatar">${s.sharedByInitials}</span>
        <span>${s.sharedBy}</span>
      </div>
    </div>`;

  const sep = `style="margin-top:28px"`;

  const shoppingSection = shopping.length
    ? `<p class="section-label">Shopping</p><div class="card-grid">${shopping.map(ownCard).join('')}</div>`
    : '';

  const yourSection = `<p class="section-label"${shoppingSection ? ` ${sep}` : ''}>Your lists</p>
    <div class="card-grid">${idle.map(ownCard).join('') || emptyMsg('No lists yet.')}</div>`;

  const sharedSection = shared.length
    ? `<p class="section-label" ${sep}>Shared with you</p><div class="card-grid">${shared.map(sharedCard).join('')}</div>`
    : '';

  return viewShell(
    'lists', 'Lists',
    '<button class="add-btn">+ New list</button>',
    shoppingSection + yourSection + sharedSection,
  );
}

function buildListDetailViews() {
  return dbLists().filter(l => l.items).map(l => {
    const canCheck  = l.status === 'shopping';
    const titleHtml = l.label;
    const statusBanner = l.status === 'shopping'
      ? `<div class="shopping-banner">
           <span class="shopping-banner-label">Shopping in progress</span>
           <button class="end-shopping-btn" onclick="setListStatus('${l.id}', 'idle')">End shopping</button>
         </div>`
      : `<div class="shopping-banner-idle">
           <button class="begin-shopping-btn" onclick="setListStatus('${l.id}', 'shopping')">Begin shopping</button>
         </div>`;
    const action = `<div class="view-actions">
        <button class="add-btn">+ Add item</button>
        <button class="share-btn" onclick="openShareModal('${l.id}')">Share</button>
      </div>`;

    const activeItems  = l.items.filter(it => !it.isSkipped);
    const skippedItems = l.items.filter(it => it.isSkipped);

    const activeHtml = activeItems.map(it =>
      listItem(it, false, l.id, l.items.indexOf(it), canCheck)
    ).join('');

    const skippedHtml = skippedItems.length
      ? `<p class="section-label section-label--skipped">Set aside</p>
         <div class="list-items">
           ${skippedItems.map(it => skippedListItem(it, l.id, l.items.indexOf(it))).join('')}
         </div>`
      : '';

    const body = `${statusBanner}<div class="list-items">${activeHtml}</div>${skippedHtml}`;
    return viewShell(l.id, titleHtml, action, body);
  }).join('');
}

function buildGroupsView() {
  const cards = dbGroups().map(g =>
    card(g.label, `${g.listCount} lists`, `navigateToGroup('${g.id}', '${g.label}')`)
  ).join('');
  return viewShell(
    'groups', 'Groups',
    '<button class="add-btn">+ New group</button>',
    `<div class="card-grid">${cards}</div>`,
  );
}

function buildGroupDetailView(group) {
  const lists = dbLists().filter(l => l.groupId === group.id);
  const cards = lists.map(l =>
    card(
      l.label,
      `${l.itemCount} items`,
      `navigateToList('${l.id}', '${l.label}')`,
      l.status,
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
  return dbGroups().map(buildGroupDetailView).join('');
}


function buildSharedListViews() {
  return dbSharedWithMe().filter(s => s.items).map(s => {
    const readonly = s.role === 'viewer';
    const canCheck = !readonly && s.status === 'shopping';

    const activeItems  = s.items.filter(it => !it.isSkipped);
    const skippedItems = s.items.filter(it => it.isSkipped);

    const activeHtml = activeItems.map(it =>
      listItem(it, readonly, readonly ? null : s.id, s.items.indexOf(it), canCheck)
    ).join('');

    const skippedHtml = skippedItems.length
      ? `<p class="section-label section-label--skipped">Set aside</p>
         <div class="list-items">
           ${skippedItems.map(it => skippedListItem(it, s.id, s.items.indexOf(it), readonly)).join('')}
         </div>`
      : '';

    const body  = `<div class="list-items">${activeHtml}</div>${skippedHtml}`;
    const byTag = `<span class="shared-by-tag">
      <span class="avatar collab-avatar" style="vertical-align:middle;margin-right:6px">${s.sharedByInitials}</span>${s.sharedBy}<span class="badge" style="margin-left:8px">${s.role}</span>
    </span>`;
    return viewShell(s.id, s.label, byTag, body);
  }).join('');
}

function buildProfileView() {
  const user = getCurrentUser();
  return viewShell(
    'profile', 'Profile', '',
    `<p class="card-meta" style="margin-bottom:8px">Username</p>
     <p style="margin-bottom:20px">@${user.username}</p>
     <p class="card-meta" style="margin-bottom:8px">Display name</p>
     <p style="margin-bottom:28px">${user.name}</p>
     <div style="border-top:1px solid var(--border);padding-top:20px">
       <p class="card-meta" style="margin-bottom:12px">Appearance</p>
       <button class="theme-btn" onclick="toggleTheme()">Toggle theme</button>
     </div>`,
  );
}

function renderViews() {
  const content = document.getElementById('content');
  const html = [
    buildListsView(),
    buildListDetailViews(),
    buildGroupsView(),
    buildGroupDetailViews(),
    buildSharedListViews(),
    buildProfileView(),
  ].join('');
  content.insertAdjacentHTML('beforeend', html);
}
