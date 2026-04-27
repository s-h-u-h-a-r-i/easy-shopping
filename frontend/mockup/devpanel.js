// ── Dev panel — mockup-only scaffolding, not part of the real app ─────────────

// ── Seed pools ────────────────────────────────────────────────────────────────

const DP_LIST_NAMES = [
  'Weekly groceries', 'Pharmacy run', 'Weekend BBQ', 'Monthly stock-up',
  'Birthday party', 'Office supplies', 'Hardware store', 'Farmers market',
  'Baby essentials', 'Camping trip', 'Holiday feast', 'Meal prep Sunday',
  'Quick snack run', 'Electronics run', 'Garden centre', 'Cleaning supplies',
  'Pet supplies', 'Sports gear', 'Book shopping', 'Travel essentials',
  'Back-to-school', 'Date night', 'Picnic prep', 'Winter wardrobe',
  'Gym bag refill', 'Movie night', 'Car service', 'Work lunches',
  'Rainy day stock', 'New year haul',
];

const DP_GROUP_NAMES = [
  'Household', 'Personal', 'Work snacks', 'Family', 'Sports',
  'Travel', 'Health', 'Hobbies', 'School', 'Finance',
];

const DP_SHARED_PEOPLE = [
  { name: 'Lena', initials: 'LE' },
  { name: 'Sara', initials: 'SA' },
  { name: 'Tom',  initials: 'TM' },
  { name: 'Mia',  initials: 'MI' },
  { name: 'Jake', initials: 'JK' },
];

const DP_SHARED_NAMES = [
  'Family shop', 'Office run', 'Party prep', 'Weekend trip', 'Movie night snacks',
];

const DP_ITEMS = [
  { name: 'Oat milk',         qty: '2 × 1L'  },
  { name: 'Free-range eggs',  qty: '12'       },
  { name: 'Sourdough bread',  qty: '1 loaf'   },
  { name: 'Greek yoghurt',    qty: '500g'     },
  { name: 'Cherry tomatoes',  qty: '250g'     },
  { name: 'Pasta (penne)',    qty: '500g'     },
  { name: 'Ibuprofen 400mg',  qty: '1 pack'   },
  { name: 'Vitamin D3',       qty: '1 bottle' },
  { name: 'Hand cream',       qty: '1'        },
  { name: 'Plasters',         qty: '1 box'    },
  { name: 'Burger buns',      qty: '8'        },
  { name: 'Beef mince 500g',  qty: '3'        },
  { name: 'Charcoal',         qty: '1 bag'    },
  { name: 'Whole milk',       qty: '2L'       },
  { name: 'Sliced bread',     qty: '1 loaf'   },
  { name: 'Cheddar cheese',   qty: '400g'     },
  { name: 'Orange juice',     qty: '1L'       },
  { name: 'Bananas',          qty: '6'        },
  { name: 'Shampoo',          qty: '1 bottle' },
  { name: 'Toothpaste',       qty: '2'        },
];

// ── State ─────────────────────────────────────────────────────────────────────

const DEV = {
  listCount:      4,
  groupCount:     3,
  sharedCount:    1,
  sharedByMeCount: 1,
  itemsPerList: 6,
  activeRatio: 50,   // % of lists that are active (rest = completed)
  username:    'Ahmed',
  greeting:    'random',
  role:        'owner', // owner | editor | viewer
};

// ── Generators ────────────────────────────────────────────────────────────────

function dpGenerateLists() {
  const activeCount = Math.round(DEV.listCount * DEV.activeRatio / 100);
  const statuses    = ['active', 'shopping'];
  const baseItems   = DP_ITEMS.slice(0, DEV.itemsPerList).map(it => ({ ...it }));
  const groupSlots  = Math.max(1, DEV.groupCount);

  return Array.from({ length: DEV.listCount }, (_, i) => {
    const name  = DP_LIST_NAMES[i % DP_LIST_NAMES.length];
    const id    = `list-gen-${i}`;
    const group = DP_GROUP_NAMES[i % groupSlots];

    if (i < activeCount) {
      return {
        id, label: name,
        status: statuses[i % statuses.length],
        group,
        itemCount: DEV.itemsPerList,
        items: baseItems,
      };
    }
    return {
      id, label: name,
      status: 'completed',
      date: `Apr ${1 + (i % 28)}`,
      itemCount: DEV.itemsPerList,
      items: baseItems.length ? baseItems.map(it => ({ ...it, checked: true })) : undefined,
    };
  });
}

function dpGenerateGroups() {
  return DP_GROUP_NAMES.slice(0, DEV.groupCount).map((name, i) => ({
    id:        `group-gen-${i}`,
    label:     name,
    listCount: Math.max(1, Math.round(DEV.listCount / Math.max(1, DEV.groupCount))),
  }));
}

function dpGenerateCollaborators(lists) {
  // Wipe existing keys
  Object.keys(COLLABORATORS).forEach(k => delete COLLABORATORS[k]);
  const count = Math.min(DEV.sharedByMeCount, lists.length);
  for (let i = 0; i < count; i++) {
    const person = DP_SHARED_PEOPLE[i % DP_SHARED_PEOPLE.length];
    COLLABORATORS[lists[i].id] = [{ name: person.name, initials: person.initials, role: 'editor' }];
  }
}

function dpGenerateShared() {
  return DP_SHARED_PEOPLE.slice(0, DEV.sharedCount).map((person, i) => ({
    id:              `shared-gen-${i}`,
    label:           DP_SHARED_NAMES[i % DP_SHARED_NAMES.length],
    status:          'active',
    sharedBy:        person.name,
    sharedByInitials: person.initials,
    role:            'viewer',
    items:           DP_ITEMS.slice(0, Math.max(1, DEV.itemsPerList)).map(it => ({ ...it })),
  }));
}

// ── Constraint sync ───────────────────────────────────────────────────────────
// Keeps slider max/value/badge in sync when one value constrains another.

const DP_CONSTRAINTS = [
  // { key, maxFn } — maxFn returns the current ceiling for that key
  { key: 'sharedByMeCount', maxFn: () => DEV.listCount },
  { key: 'sharedCount',     maxFn: () => 5 },           // static, here for completeness
];

function dpSyncConstraints() {
  for (const { key, maxFn } of DP_CONSTRAINTS) {
    const max = maxFn();
    const clamped = Math.min(DEV[key], max);

    // Clamp the state value silently (no re-apply loop)
    DEV[key] = clamped;

    // Update the slider element
    const slider = document.querySelector(`[oninput*="'${key}'"]`);
    if (slider) {
      slider.max   = max;
      slider.value = clamped;
    }

    // Update the badge
    const badge = document.getElementById(`dp-val-${key}`);
    if (badge) badge.textContent = clamped;
  }
}

// ── Apply ─────────────────────────────────────────────────────────────────────

function dpApply() {
  // Mutate the global data arrays in-place so views.js keeps reading them
  LISTS.splice(0, LISTS.length,  ...dpGenerateLists());
  GROUPS.splice(0, GROUPS.length, ...dpGenerateGroups());
  SHARED.splice(0, SHARED.length, ...dpGenerateShared());
  dpGenerateCollaborators(LISTS);

  // Remember which view is active before wiping dynamic views
  const activeId = document.querySelector('#content .view.active')?.id;

  // Re-render all dynamic views
  document.querySelectorAll('#content .view:not(#view-home)').forEach(v => v.remove());
  renderViews();

  // Restore the active view (fall back to home if it was wiped)
  const restored = activeId ? document.getElementById(activeId) : null;
  if (restored) {
    restored.classList.add('active');
  } else {
    document.getElementById('view-home')?.classList.add('active');
  }

  // Sync username in top-bar avatar + breadcrumb avatar
  const name = DEV.username.trim() || 'You';
  const initials = name.slice(0, 2).toUpperCase();
  document.querySelectorAll('.avatar:not(.collab-avatar)').forEach(el => {
    el.textContent = initials;
  });

  // Sync greeting on home view
  const greetingEl = document.getElementById('hub-greeting');
  if (greetingEl) {
    const pool = GREETINGS.map(g => g.replace(/Ahmed/g, name));
    greetingEl.textContent =
      DEV.greeting === 'random'
        ? pool[Math.floor(Math.random() * pool.length)]
        : DEV.greeting.replace(/Ahmed/g, name);
  }

  // Sync home hub stats (active list count, group count, shared count)
  const activeCount = LISTS.filter(l => l.status !== 'completed').length;
  const hubSub = document.querySelector('.hub-sub');
  if (hubSub) {
    hubSub.textContent =
      `You have ${activeCount} active list${activeCount !== 1 ? 's' : ''}.`;
  }
  const hubCards = document.querySelectorAll('.hub-card .hub-card-meta');
  if (hubCards[0]) hubCards[0].textContent = `${activeCount} active`;
  if (hubCards[1]) hubCards[1].textContent = `${GROUPS.length} group${GROUPS.length !== 1 ? 's' : ''}`;
  if (hubCards[2]) hubCards[2].textContent = `${SHARED.length} shared`;
  if (hubCards[3]) hubCards[3].textContent = `@${DEV.username.toLowerCase().replace(/\s+/g, '') || 'you'}`;

  // Apply role class to shell
  const shell = document.getElementById('shell');
  shell.classList.remove('devpanel-role-owner', 'devpanel-role-editor', 'devpanel-role-viewer');
  if (DEV.role !== 'owner') shell.classList.add(`devpanel-role-${DEV.role}`);

  // Sync slider constraints — clamp dependent values and update slider max/value/badge
  dpSyncConstraints();
}

// ── Controls ──────────────────────────────────────────────────────────────────

function dpSet(key, rawValue) {
  const value = typeof DEV[key] === 'number' ? +rawValue : rawValue;
  DEV[key] = value;

  // Update the numeric badge next to range sliders
  const badge = document.getElementById(`dp-val-${key}`);
  if (badge) {
    badge.textContent = key === 'activeRatio' ? `${value}%` : value;
  }

  dpApply();
}

// ── Open / close ──────────────────────────────────────────────────────────────

function dpOpen()  {
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
    const delta = startY - y; // drag up → positive → taller
    const clamped = Math.max(120, Math.min(window.innerHeight * 0.94, startH + delta));
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
  // Bootstrap DEV state from the original seed data sizes
  DEV.listCount       = LISTS.length;
  DEV.groupCount      = GROUPS.length;
  DEV.sharedCount     = SHARED.length;
  DEV.sharedByMeCount = Object.keys(COLLABORATORS).length;
  DEV.itemsPerList    = LISTS[0]?.items?.length ?? 6;

  const greetingOptions = GREETINGS.map(
    (g, i) => `<option value="${g}">${g.replace(/Ahmed/g, '…')}</option>`
  ).join('');

  const html = `
    <!-- Trigger pill -->
    <button class="devpanel-trigger" onclick="dpOpen()">⚙ Dev panel</button>

    <!-- Backdrop -->
    <div class="devpanel-overlay" id="dp-overlay" onclick="dpClose()"></div>

    <!-- Drawer -->
    <div class="devpanel-drawer" id="dp-drawer">
      <div class="devpanel-handle"></div>

      <div class="devpanel-header">
        <span class="devpanel-title">Dev panel</span>
        <button class="devpanel-close" onclick="dpClose()">✕ close</button>
      </div>

      <!-- ── Data scale ── -->
      <div class="devpanel-section">
        <p class="devpanel-section-label">Data scale</p>

        <div class="devpanel-row">
          <span class="devpanel-label">Lists</span>
          <input class="devpanel-range" type="range" min="0" max="30"
            value="${DEV.listCount}"
            oninput="dpSet('listCount', this.value)">
          <span class="devpanel-value" id="dp-val-listCount">${DEV.listCount}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Groups</span>
          <input class="devpanel-range" type="range" min="0" max="10"
            value="${DEV.groupCount}"
            oninput="dpSet('groupCount', this.value)">
          <span class="devpanel-value" id="dp-val-groupCount">${DEV.groupCount}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Shared with me</span>
          <input class="devpanel-range" type="range" min="0" max="5"
            value="${DEV.sharedCount}"
            oninput="dpSet('sharedCount', this.value)">
          <span class="devpanel-value" id="dp-val-sharedCount">${DEV.sharedCount}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Shared by me</span>
          <input class="devpanel-range" type="range" min="0" max="5"
            value="${DEV.sharedByMeCount}"
            oninput="dpSet('sharedByMeCount', this.value)">
          <span class="devpanel-value" id="dp-val-sharedByMeCount">${DEV.sharedByMeCount}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Items per list</span>
          <input class="devpanel-range" type="range" min="0" max="20"
            value="${DEV.itemsPerList}"
            oninput="dpSet('itemsPerList', this.value)">
          <span class="devpanel-value" id="dp-val-itemsPerList">${DEV.itemsPerList}</span>
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Active ratio</span>
          <input class="devpanel-range" type="range" min="0" max="100" step="10"
            value="${DEV.activeRatio}"
            oninput="dpSet('activeRatio', this.value)">
          <span class="devpanel-value" id="dp-val-activeRatio">${DEV.activeRatio}%</span>
        </div>
      </div>

      <!-- ── User ── -->
      <div class="devpanel-section">
        <p class="devpanel-section-label">User</p>

        <div class="devpanel-row">
          <span class="devpanel-label">Display name</span>
          <input class="devpanel-input" type="text"
            value="${DEV.username}"
            oninput="dpSet('username', this.value)"
            placeholder="Ahmed">
        </div>

        <div class="devpanel-row">
          <span class="devpanel-label">Greeting</span>
          <select class="devpanel-select" onchange="dpSet('greeting', this.value)">
            <option value="random">Random</option>
            ${greetingOptions}
          </select>
        </div>
      </div>

      <!-- ── Permissions ── -->
      <div class="devpanel-section">
        <p class="devpanel-section-label">Permissions</p>

        <div class="devpanel-row">
          <span class="devpanel-label">Role</span>
          <select class="devpanel-select" onchange="dpSet('role', this.value)">
            <option value="owner">Owner — full access</option>
            <option value="editor">Editor — no sharing</option>
            <option value="viewer">Viewer — read only</option>
          </select>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  dpInitDragHandle();
}
