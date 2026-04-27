// ── Data ─────────────────────────────────────────────────────────────────────

const GREETINGS = [
  "Let's go shopping, Ahmed.",
  'What are we getting today, Ahmed?',
  'Ready to stock up, Ahmed?',
  'Back again, Ahmed.',
  "What's on the list, Ahmed?",
  'Time to shop, Ahmed.',
  'Welcome back, Ahmed.',
];

const LISTS = [
  {
    id: 'list-weekly', label: 'Weekly groceries', status: 'active',
    group: 'Household', itemCount: 14,
    items: [
      { name: 'Oat milk',         qty: '2 × 1L', checked: true },
      { name: 'Free-range eggs',  qty: '12' },
      { name: 'Sourdough bread',  qty: '1 loaf' },
      { name: 'Greek yoghurt',    qty: '500g' },
      { name: 'Cherry tomatoes',  qty: '250g' },
      { name: 'Pasta (penne)',    qty: '500g' },
    ],
  },
  {
    id: 'list-pharmacy', label: 'Pharmacy run', status: 'shopping',
    group: 'Personal', itemCount: 4,
    items: [
      { name: 'Ibuprofen 400mg', qty: '1 pack' },
      { name: 'Vitamin D3',      qty: '1 bottle' },
      { name: 'Hand cream',      qty: '1' },
      { name: 'Plasters',        qty: '1 box' },
    ],
  },
  {
    id: 'list-bbq', label: 'Weekend BBQ', status: 'completed',
    date: 'Apr 19', snapshot: true,
    items: [
      { name: 'Burger buns',    qty: '8',     checked: true },
      { name: 'Beef mince 500g', qty: '3',    checked: true },
      { name: 'Charcoal',       qty: '1 bag', checked: true },
      { name: 'Ketchup',        qty: '1',     checked: true },
    ],
  },
  {
    id: 'list-monthly', label: 'Monthly stock-up', status: 'completed',
    date: 'Apr 3', itemCount: 38,
  },
];

const GROUPS = [
  { id: 'group-household', label: 'Household',    listCount: 6 },
  { id: 'group-personal',  label: 'Personal',     listCount: 3 },
  { id: 'group-work',      label: 'Work snacks',  listCount: 1 },
];

const SHARED = [
  { id: 'shared-family', label: 'Family shop', status: 'active', sharedBy: 'Lena', role: 'viewer' },
];

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
    const meta = [l.itemCount ? `${l.itemCount} items` : null, l.date].filter(Boolean).join(' · ');
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
    const action    = l.snapshot ? '' : '<button class="add-btn">+ Add item</button>';
    const header    = l.snapshot ? `<p class="section-label">Snapshot — ${l.date}</p>` : '';
    const items     = l.items.map(listItem).join('');
    return viewShell(l.id, titleHtml, action, `${header}<div class="list-items">${items}</div>`);
  }).join('');
}

function buildGroupsView() {
  const cards = GROUPS.map(g =>
    card(g.label, `${g.listCount} lists`, null)
  ).join('');
  return viewShell(
    'groups', 'Groups',
    '<button class="add-btn">+ New group</button>',
    `<div class="card-grid">${cards}</div>`,
  );
}

function buildSharedView() {
  const cards = SHARED.map(s =>
    card(`${s.label}${badge(s.status)}`, `Shared by ${s.sharedBy} · ${s.role}`, null)
  ).join('');
  return viewShell('shared', 'Shared with me', '', `<div class="card-grid">${cards}</div>`);
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
    buildSharedView(),
    buildProfileView(),
  ].join('');
  content.insertAdjacentHTML('beforeend', html);
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

const LABELS = {
  home: 'easy shopping', lists: 'Lists', groups: 'Groups',
  shared: 'Shared', profile: 'Profile',
  ...Object.fromEntries(LISTS.map(l => [l.id, l.label])),
};

let trail = [{ id: 'home', label: 'easy shopping' }];

function renderBreadcrumb() {
  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = '';
  trail.forEach((crumb, i) => {
    const isLast = i === trail.length - 1;
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '/';
      bc.appendChild(sep);
    }
    const btn = document.createElement('button');
    btn.className = 'crumb' + (isLast ? ' current' : '');
    btn.textContent = crumb.label;
    if (!isLast) btn.onclick = () => navigateTo(crumb.id, true);
    bc.appendChild(btn);
  });
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

// Navigate from hub/lists directly into a list detail, inserting 'Lists'
// into the trail first if missing so breadcrumb reads:
//   easy shopping / Lists / Weekly groceries
function navigateToList(id, label) {
  if (!trail.find(c => c.id === 'lists')) {
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

function syncBottomNav(id) {
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('bnav-' + id);
  if (target) target.classList.add('active');
  else document.getElementById('bnav-home').classList.add('active');
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

// ── Init ──────────────────────────────────────────────────────────────────────

renderViews();
document.getElementById('hub-greeting').textContent =
  GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
renderBreadcrumb();
