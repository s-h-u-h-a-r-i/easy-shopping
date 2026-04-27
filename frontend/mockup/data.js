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
      { name: 'Burger buns',     qty: '8',     checked: true },
      { name: 'Beef mince 500g', qty: '3',     checked: true },
      { name: 'Charcoal',        qty: '1 bag', checked: true },
      { name: 'Ketchup',         qty: '1',     checked: true },
    ],
  },
  {
    id: 'list-monthly', label: 'Monthly stock-up', status: 'completed',
    date: 'Apr 3', itemCount: 38,
  },
];

const GROUPS = [
  { id: 'group-household', label: 'Household',   listCount: 6 },
  { id: 'group-personal',  label: 'Personal',    listCount: 3 },
  { id: 'group-work',      label: 'Work snacks', listCount: 1 },
];

const SHARED = [
  {
    id: 'shared-family', label: 'Family shop', status: 'active',
    sharedBy: 'Lena', sharedByInitials: 'LE', role: 'viewer',
    items: [
      { name: 'Whole milk',     qty: '2L',     checked: true },
      { name: 'Sliced bread',   qty: '1 loaf' },
      { name: 'Cheddar cheese', qty: '400g' },
      { name: 'Orange juice',   qty: '1L',     checked: true },
      { name: 'Bananas',        qty: '6' },
    ],
  },
];

// Mutable: modified live by the share modal
const COLLABORATORS = {
  'list-weekly': [
    { name: 'Sara', initials: 'SA', role: 'editor' },
    { name: 'Tom',  initials: 'TM', role: 'viewer' },
  ],
};
