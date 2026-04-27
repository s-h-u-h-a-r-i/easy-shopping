const GREETINGS = [
  "Let's go shopping, Ahmed.",
  'What are we getting today, Ahmed?',
  'Ready to stock up, Ahmed?',
  'Back again, Ahmed.',
  "What's on the list, Ahmed?",
  'Time to shop, Ahmed.',
  'Welcome back, Ahmed.',
];

// ── Registered users ──────────────────────────────────────────────────────────

const REGISTERED_USERS = [
  { username: 'lena', name: 'Lena', initials: 'LE' },
  { username: 'sara', name: 'Sara', initials: 'SA' },
  { username: 'tom',  name: 'Tom',  initials: 'TM' },
  { username: 'mia',  name: 'Mia',  initials: 'MI' },
  { username: 'jake', name: 'Jake', initials: 'JK' },
  { username: 'alex', name: 'Alex', initials: 'AL' },
  { username: 'emma', name: 'Emma', initials: 'EM' },
  { username: 'noah', name: 'Noah', initials: 'NO' },
];

function findRegisteredUser(username) {
  const normalized = username.toLowerCase().replace(/^@/, '');
  return REGISTERED_USERS.find(u => u.username === normalized);
}

// ── Seed pools ────────────────────────────────────────────────────────────────

const DB_LIST_NAMES = [
  'Weekly groceries', 'Pharmacy run', 'Weekend BBQ', 'Monthly stock-up',
  'Birthday party', 'Office supplies', 'Hardware store', 'Farmers market',
  'Baby essentials', 'Camping trip', 'Holiday feast', 'Meal prep Sunday',
  'Quick snack run', 'Electronics run', 'Garden centre', 'Cleaning supplies',
  'Pet supplies', 'Sports gear', 'Book shopping', 'Travel essentials',
  'Back-to-school', 'Date night', 'Picnic prep', 'Winter wardrobe',
  'Gym bag refill', 'Movie night', 'Car service', 'Work lunches',
  'Rainy day stock', 'New year haul',
];

const DB_GROUP_NAMES = [
  'Household', 'Personal', 'Work snacks', 'Family', 'Sports',
  'Travel', 'Health', 'Hobbies', 'School', 'Finance',
];

const DB_ITEMS = [
  { name: 'Oat milk 1L',        qty: '2' },
  { name: 'Free-range eggs',    qty: '12' },
  { name: 'Sourdough bread',    qty: '1' },
  { name: 'Greek yoghurt 500g', qty: '1' },
  { name: 'Cherry tomatoes 250g', qty: '1' },
  { name: 'Pasta penne 500g',   qty: '1' },
  { name: 'Ibuprofen 400mg',    qty: '1' },
  { name: 'Vitamin D3',         qty: '1' },
  { name: 'Hand cream',         qty: '1' },
  { name: 'Plasters',           qty: '1' },
  { name: 'Burger buns',        qty: '8' },
  { name: 'Beef mince 500g',    qty: '3' },
  { name: 'Charcoal',           qty: '1' },
  { name: 'Whole milk 2L',      qty: '1' },
  { name: 'Sliced bread',       qty: '1' },
  { name: 'Cheddar cheese 400g', qty: '1' },
  { name: 'Orange juice 1L',    qty: '1' },
  { name: 'Bananas',            qty: '6' },
  { name: 'Shampoo',            qty: '1' },
  { name: 'Toothpaste',         qty: '2' },
];

// ── Database ──────────────────────────────────────────────────────────────────
// Single source of truth. Nothing outside this file mutates DB.lists or
// DB.groups — only DB.collaborators is written to (by the share modal).

const DB = {
  lists:         {},  // { [userId]: List[] }
  groups:        {},  // { [userId]: Group[] }
  collaborators: {},  // { [listId]: { username, name, initials, role }[] }
  invites:       {},  // { [listId]: { username, name, initials, role, status, invitedBy }[] }
  settings:      {},  // { [userId]: { listCount, groupCount, itemsPerList, shoppingRatio } }
  recentLists:   {},  // { [userId]: listId[] } — ordered most-recent first, max 5
};

// Record a list visit for the current user
function dbRecordVisit(listId) {
  const uid = CURRENT_USER_ID;
  if (!DB.recentLists[uid]) DB.recentLists[uid] = [];
  const recent = DB.recentLists[uid].filter(id => id !== listId);
  recent.unshift(listId);
  DB.recentLists[uid] = recent.slice(0, 5);
}

// Resolve the recent list entries to actual list objects (own + shared)
function dbRecentLists() {
  const uid = CURRENT_USER_ID;
  const ids = DB.recentLists[uid] || [];
  const allLists = [...dbLists(), ...dbSharedWithMe()];
  return ids.map(id => allLists.find(l => l.id === id)).filter(Boolean);
}

// ── Invite helpers ────────────────────────────────────────────────────────────

// Pending invites where the current user is the invitee
function dbPendingInvitesForMe() {
  const result = [];
  for (const [listId, invites] of Object.entries(DB.invites)) {
    for (const inv of invites) {
      if (inv.username !== CURRENT_USER_ID || inv.status !== 'pending') continue;
      // Find list and its owner
      for (const uid of Object.keys(DB.lists)) {
        const list = DB.lists[uid].find(l => l.id === listId);
        if (list) {
          const owner = REGISTERED_USERS.find(u => u.username === uid);
          result.push({ ...inv, listId, listLabel: list.label, ownerName: owner?.name, ownerInitials: owner?.initials });
          break;
        }
      }
    }
  }
  return result;
}

// Pending invites sent by the current user for a specific list
function dbPendingInvitesForList(listId) {
  return (DB.invites[listId] || []).filter(inv => inv.status === 'pending');
}

function dbAcceptInvite(listId) {
  const inv = (DB.invites[listId] || []).find(i => i.username === CURRENT_USER_ID && i.status === 'pending');
  if (!inv) return;
  inv.status = 'accepted';
  if (!DB.collaborators[listId]) DB.collaborators[listId] = [];
  if (!DB.collaborators[listId].find(c => c.username === inv.username)) {
    DB.collaborators[listId].push({ username: inv.username, name: inv.name, initials: inv.initials, role: inv.role });
  }
}

function dbDeclineInvite(listId) {
  const inv = (DB.invites[listId] || []).find(i => i.username === CURRENT_USER_ID && i.status === 'pending');
  if (inv) inv.status = 'declined';
}

// ── Active user ───────────────────────────────────────────────────────────────
// This is the only thing that changes when "switching accounts".

let CURRENT_USER_ID = REGISTERED_USERS[0].username;

function getCurrentUser() {
  return REGISTERED_USERS.find(u => u.username === CURRENT_USER_ID) || REGISTERED_USERS[0];
}

// ── DB accessors (always fresh, no caching needed) ────────────────────────────

function dbLists()  { return DB.lists[CURRENT_USER_ID]  || []; }
function dbGroups() { return DB.groups[CURRENT_USER_ID] || []; }

function dbSharedWithMe() {
  const result = [];
  for (const otherUser of REGISTERED_USERS) {
    if (otherUser.username === CURRENT_USER_ID) continue;
    for (const list of (DB.lists[otherUser.username] || [])) {
      const entry = (DB.collaborators[list.id] || []).find(c => c.username === CURRENT_USER_ID);
      if (entry) {
        result.push({
          ...list,
          sharedBy:         otherUser.name,
          sharedByInitials: otherUser.initials,
          role:             entry.role,
        });
      }
    }
  }
  return result;
}


// ── Seeding ───────────────────────────────────────────────────────────────────

function dbDefaultSettings(userIdx) {
  return {
    listCount:     [3, 5, 2, 4, 6, 3, 4, 2][userIdx % 8],
    groupCount:    [2, 3, 1, 2, 3, 1, 2, 1][userIdx % 8],
    itemsPerList:  [5, 4, 6, 3, 5, 4, 6, 4][userIdx % 8],
    shoppingRatio: [33, 20, 50, 25, 33, 0, 25, 50][userIdx % 8],
  };
}

function dbSeedUserLists(userId) {
  const userIdx       = REGISTERED_USERS.findIndex(u => u.username === userId);
  const s             = DB.settings[userId];
  const nameOffset    = userIdx * 3;
  const shoppingCount = Math.round(s.listCount * s.shoppingRatio / 100);
  const groupSlots    = Math.max(1, s.groupCount);

  // Seed groups first so lists can reference their IDs
  DB.groups[userId] = DB_GROUP_NAMES.slice(0, s.groupCount).map((label, i) => ({
    id:        `group-${userId}-${i}`,
    label,
    listCount: Math.max(1, Math.round(s.listCount / Math.max(1, s.groupCount))),
  }));

  DB.lists[userId] = Array.from({ length: s.listCount }, (_, i) => {
    const label   = DB_LIST_NAMES[(nameOffset + i) % DB_LIST_NAMES.length];
    const id      = `list-${userId}-${i}`;
    const groupId = `group-${userId}-${i % groupSlots}`;
    const items   = DB_ITEMS.slice(0, s.itemsPerList).map(it => ({ ...it, isSkipped: false }));
    const status  = i < shoppingCount ? 'shopping' : 'idle';
    return { id, label, status, groupId, itemCount: s.itemsPerList, items };
  });
}

function dbSeedCollaborators() {
  // Each user shares their first list with the next user in the circle
  REGISTERED_USERS.forEach((user, userIdx) => {
    const lists = DB.lists[user.username] || [];
    if (!lists.length) return;
    const peer = REGISTERED_USERS[(userIdx + 1) % REGISTERED_USERS.length];
    DB.collaborators[lists[0].id] = [{
      username: peer.username,
      name:     peer.name,
      initials: peer.initials,
      role:     'editor',
    }];
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

REGISTERED_USERS.forEach((u, i) => {
  DB.settings[u.username] = dbDefaultSettings(i);
  dbSeedUserLists(u.username);
});
dbSeedCollaborators();
