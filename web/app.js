/**
 * CandyEstimator SitePro - Core Business Logic
 * Multi-Project Daily Site Productivity & Profit/Loss Optimization System
 */

// Utility HTML & JS escaping helpers
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsString(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// --- 1. DEFAULT MASTER RESOURCES & HOURLY RATES (AED) ---
const DEFAULT_LABOUR_TRADES = [
  { id: 'helper', name: 'Helper', short: 'Helper', rate: 9.98, unit: 'Hrs' },
  { id: 'mason', name: 'Mason', short: 'Mason', rate: 14.64, unit: 'Hrs' },
  { id: 'charge_hand', name: 'Charge Hand', short: 'CH', rate: 14.70, unit: 'Hrs' },
  { id: 'carpenter', name: 'Carpenter', short: 'Carp.', rate: 14.20, unit: 'Hrs' },
  { id: 'steel_fitter', name: 'Steel Fitter', short: 'SF', rate: 14.68, unit: 'Hrs' },
  { id: 'pipe_fitter', name: 'Pipe Fitter', short: 'PF', rate: 14.44, unit: 'Hrs' },
  { id: 'electrician', name: 'Electrician', short: 'Ele.', rate: 13.57, unit: 'Hrs' },
  { id: 'plumber', name: 'Plumber', short: 'Plum.', rate: 14.95, unit: 'Hrs' },
  { id: 'gardener', name: 'Gardener', short: 'Gardner', rate: 13.31, unit: 'Hrs' },
];

const DEFAULT_PLANT_EQUIPMENT = [
  { id: 'jcb', name: 'JCB (Back Hoe Loader)', short: 'JCB', rate: 61, unit: 'Hrs' },
  { id: 'truck_20', name: '6 Wheel Truck 20m3', short: '6W 20m3', rate: 73, unit: 'Hrs' },
  { id: 'shovel_966', name: 'Shovel 966', short: 'Shovel 966', rate: 114, unit: 'Hrs' },
  { id: 'truck_35_45', name: '6 Wheel Truck 35/45m3', short: '6W 35/45m3', rate: 73, unit: 'Hrs' },
  { id: 'bobcat', name: 'Bobcat (Skid Steer Loader)', short: 'Bobcat', rate: 46, unit: 'Hrs' },
  { id: 'boom_loader', name: 'Boom Loader 17m', short: 'Boom 17m', rate: 75, unit: 'Hrs' },
  { id: 'hand_roller_3t', name: '3 Ton - Hand Roller', short: '3T Roller', rate: 45, unit: 'Hrs' },
  { id: 'pickup_7t_crane', name: 'Pick-up: 7 Ton with Crane', short: '7T w/ Crane', rate: 75, unit: 'Hrs' },
  { id: 'pickup_5t_crane', name: 'Pick-up: 5 Ton with Crane', short: '5T w/ Crane', rate: 69, unit: 'Hrs' },
  { id: 'pickup_7t', name: 'Pick-up: 7 Ton', short: '7T', rate: 50, unit: 'Hrs' },
  { id: 'flatbed_trailer_hr', name: 'Flat bed Trailer 40 feet (Hrs)', short: 'Trailer 40ft', rate: 72, unit: 'Hrs' },
  { id: 'flatbed_trailer_trip', name: 'Flat bed Trailer 40 feet (Trip)', short: 'Trailer Trip', rate: 660, unit: 'Trip' },
  { id: 'shotcrete_pump', name: 'Shotcrete pump', short: 'Shotcrete', rate: 97, unit: 'Hrs' },
  { id: 'manlift_20m', name: 'Manlift - Boom lift 20m', short: 'Manlift 20m', rate: 35, unit: 'Hrs' },
  { id: 'concrete_pump', name: 'Concrete pump', short: 'Conc Pump', rate: 35, unit: 'Hrs' },
  { id: 'mobile_crane_5t', name: 'Mobile crane 5T', short: 'Mobile Crane 5T', rate: 55, unit: 'Hrs' },
  { id: 'water_tanker_10k', name: 'Water Tanker without Water 10,000gln', short: 'Water Tanker', rate: 106, unit: 'Hrs' },
  { id: 'concrete_vibrator', name: 'Concrete vibrator', short: 'Vibrator', rate: 15, unit: 'Hrs' },
  { id: 'pickup_3t', name: 'Pick-up: 3 Ton', short: 'Pick-up 3T', rate: 40, unit: 'Hrs' },
  { id: 'crane_25t', name: '25ton crane', short: '25T crane', rate: 95, unit: 'Hrs' },
];

const DEFAULT_UNITS = ['m3', 'No', 'LM', 'm2', 'Ton', 'Trip', 'Hrs', 'Day', 'LS', 'Bag'];

const DEFAULT_MAIN_ACTIVITIES = [
  {
    code: 'S00100',
    description: 'Red Dune sand filling in ground covers/succulents/grasses.',
    workoutQty: 200,
    labourHours: { helper: 100, charge_hand: 10 },
    plantHours: { jcb: 10, bobcat: 10 }
  },
  {
    code: 'S00102',
    description: 'Red Dune sand filling in tree pits',
    workoutQty: 150,
    labourHours: { helper: 80, charge_hand: 10 },
    plantHours: { jcb: 10, bobcat: 8 }
  },
  {
    code: 'S00105',
    description: 'Planting specimen trees and palms complete with sweet soil backfill',
    workoutQty: 10,
    labourHours: { helper: 30, gardener: 10, charge_hand: 10 },
    plantHours: { boom_loader: 10, truck_20: 10 }
  },
  {
    code: 'S00108',
    description: 'Irrigation main pipe lines and lateral distribution trenching and testing',
    workoutQty: 100,
    labourHours: { helper: 30, pipe_fitter: 20, charge_hand: 10 },
    plantHours: { jcb: 10, pickup_3t: 10 }
  }
];

const GANG_PRESETS = {
  sand_filling: {
    workoutQty: 200,
    labour: { helper: 100, charge_hand: 10 },
    plant: { jcb: 10, bobcat: 10 },
  },
  tree_planting: {
    workoutQty: 10,
    labour: { helper: 30, gardener: 10, charge_hand: 10 },
    plant: { boom_loader: 10, truck_20: 10 },
  },
  pipe_trenching: {
    workoutQty: 100,
    labour: { helper: 30, pipe_fitter: 20, charge_hand: 10 },
    plant: { jcb: 10, pickup_3t: 10 },
  },
  grass_turf: {
    workoutQty: 500,
    labour: { helper: 40, gardener: 20, charge_hand: 10 },
    plant: { hand_roller_3t: 10, water_tanker_10k: 5 },
  }
};

// Default initial dataset matching user prompt exactly
const DEFAULT_PROJECTS = [
  {
    id: 'prj-1',
    code: 'PRJ-2211',
    name: 'Dubai Hills Community - Soft Landscaping Phase 1',
    client: 'Emaar Properties',
    startDate: '2026-09-01',
    targetEndDate: '2026-12-31',
    shiftHours: 10,
    lossThreshold: 0,
    labourRates: DEFAULT_LABOUR_TRADES.reduce((acc, t) => { acc[t.id] = t.rate; return acc; }, {}),
    plantRates: DEFAULT_PLANT_EQUIPMENT.reduce((acc, p) => { acc[p.id] = p.rate; return acc; }, {}),
    fixedActivities: [
      {
        id: 'act-1',
        code: '22110001',
        mainActivityCode: 'S00100',
        mainActivityDesc: 'Red Dune sand filling in ground covers/succulents/grasses.',
        division: 'SL',
        zone: 'Zone 1',
        subActivity: 'Red dune sand (Sweet Soil Filling) filling Ground Covers and in shrubs /SUC,grasses',
        unit: 'm3',
        totalQty: 14040,
        workoutQty: 200,
        allowableRate: 11.08,
        labourHours: { helper: 100, charge_hand: 10 },
        plantHours: { jcb: 10, bobcat: 10 }
      },
      {
        id: 'act-2',
        code: '22110002',
        mainActivityCode: 'S00105',
        mainActivityDesc: 'Planting specimen trees and palms complete with sweet soil backfill',
        division: 'SL',
        zone: 'Zone 1',
        subActivity: 'Planting of specimen Date Palms (Phoenix dactylifera) complete with pit excavation and sweet soil backfill',
        unit: 'No',
        totalQty: 180,
        workoutQty: 10,
        allowableRate: 195.00,
        labourHours: { helper: 30, gardener: 10, charge_hand: 10 },
        plantHours: { boom_loader: 10, truck_20: 10 }
      },
      {
        id: 'act-3',
        code: '22120005',
        mainActivityCode: 'S00108',
        mainActivityDesc: 'Irrigation main pipe lines and lateral distribution trenching and testing',
        division: 'IR',
        zone: 'Zone 2',
        subActivity: 'uPVC Main Line 110mm dia trench excavation, laying & jointing complete with pressure test',
        unit: 'LM',
        totalQty: 3500,
        workoutQty: 100,
        allowableRate: 24.50,
        labourHours: { helper: 30, pipe_fitter: 20, charge_hand: 10 },
        plantHours: { jcb: 10, pickup_3t: 10 }
      }
    ],
    dailyLogs: [
      {
        id: 'log-1',
        date: '2026-09-23',
        activityId: 'act-1',
        actualQty: 220,
        actualLabourHours: { helper: 100, charge_hand: 10 },
        actualPlantHours: { jcb: 10, bobcat: 10 },
        notes: 'Optimal soil moisture and efficient truck turnaround.'
      },
      {
        id: 'log-2',
        date: '2026-09-24',
        activityId: 'act-1',
        actualQty: 120, // Loss Day!
        actualLabourHours: { helper: 100, charge_hand: 10 },
        actualPlantHours: { jcb: 10, bobcat: 10 },
        notes: 'Sand delivery trucks stuck at security gate for 2.5 hrs. Machinery idling.'
      },
      {
        id: 'log-3',
        date: '2026-09-25',
        activityId: 'act-1',
        actualQty: 195,
        actualLabourHours: { helper: 100, charge_hand: 10 },
        actualPlantHours: { jcb: 10, bobcat: 10 },
        notes: 'Standard progress achieved.'
      },
      {
        id: 'log-4',
        date: '2026-09-25',
        activityId: 'act-2',
        actualQty: 8, // Loss Day!
        actualLabourHours: { helper: 30, gardener: 10, charge_hand: 10 },
        actualPlantHours: { boom_loader: 10, truck_20: 10 },
        notes: 'Encountered unexpected underground services in 2 tree pits.'
      }
    ]
  },
  {
    id: 'prj-2',
    code: 'PRJ-2212',
    name: 'Palm Jumeirah Villa Gardens & Hardscape',
    client: 'Nakheel',
    startDate: '2026-10-01',
    targetEndDate: '2027-02-28',
    shiftHours: 10,
    lossThreshold: 0,
    labourRates: DEFAULT_LABOUR_TRADES.reduce((acc, t) => { acc[t.id] = t.rate; return acc; }, {}),
    plantRates: DEFAULT_PLANT_EQUIPMENT.reduce((acc, p) => { acc[p.id] = p.rate; return acc; }, {}),
    fixedActivities: [
      {
        id: 'act-201',
        code: '22110010',
        mainActivityCode: 'S00102',
        mainActivityDesc: 'Red Dune sand filling in tree pits',
        division: 'HL',
        zone: 'Perimeter',
        subActivity: 'Precast concrete curbstone installation 150x300mm on concrete bed',
        unit: 'LM',
        totalQty: 2400,
        workoutQty: 80,
        allowableRate: 48.00,
        labourHours: { helper: 20, mason: 20, charge_hand: 10 },
        plantHours: { pickup_3t: 10, concrete_vibrator: 5 }
      }
    ],
    dailyLogs: []
  }
];

// --- 2. APPLICATION STATE & SAFE LOCAL STORAGE WRAPPER ---
const safeStorage = {
  _mem: {},
  getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {}
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const val = window.sessionStorage.getItem(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {}
    return this._mem[key] || null;
  },
  setItem(key, val) {
    const str = String(val);
    this._mem[key] = str;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, str);
      }
    } catch (e) {}
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, str);
      }
    } catch (e) {}
  },
  removeItem(key) {
    delete this._mem[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {}
  },
  clear() {
    this._mem = {};
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.clear();
      if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.clear();
    } catch (e) {}
  }
};

function loadInitialProjects() {
  try {
    const raw = safeStorage.getItem('candy_site_projects');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach(p => {
          if (!Array.isArray(p.fixedActivities)) p.fixedActivities = [];
          if (!Array.isArray(p.dailyLogs)) p.dailyLogs = [];
          p.fixedActivities.forEach(a => {
            if (a.mainActivityCode === undefined) {
              a.mainActivityCode = '';
              a.mainActivityDesc = '';
            }
          });
          if (!p.labourRates) p.labourRates = DEFAULT_LABOUR_TRADES.reduce((acc, t) => { acc[t.id] = t.rate; return acc; }, {});
          if (!p.plantRates) p.plantRates = DEFAULT_PLANT_EQUIPMENT.reduce((acc, pl) => { acc[pl.id] = pl.rate; return acc; }, {});
        });
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading projects from storage, using defaults:', e);
  }
  const cloned = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
  safeStorage.setItem('candy_site_projects', JSON.stringify(cloned));
  return cloned;
}

// Master Resources Loaders & Helpers
function loadInitialUnits() {
  try {
    const raw = safeStorage.getItem('candy_site_units');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const cloned = [...DEFAULT_UNITS];
  safeStorage.setItem('candy_site_units', JSON.stringify(cloned));
  return cloned;
}

function loadInitialLabourTrades() {
  try {
    const raw = safeStorage.getItem('candy_site_labour_trades');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const cloned = JSON.parse(JSON.stringify(DEFAULT_LABOUR_TRADES));
  safeStorage.setItem('candy_site_labour_trades', JSON.stringify(cloned));
  return cloned;
}

function loadInitialPlantEquipment() {
  try {
    const raw = safeStorage.getItem('candy_site_plant_equipment');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const cloned = JSON.parse(JSON.stringify(DEFAULT_PLANT_EQUIPMENT));
  safeStorage.setItem('candy_site_plant_equipment', JSON.stringify(cloned));
  return cloned;
}

function loadInitialMainActivities() {
  try {
    const raw = safeStorage.getItem('candy_site_main_activities');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const cloned = JSON.parse(JSON.stringify(DEFAULT_MAIN_ACTIVITIES));
  safeStorage.setItem('candy_site_main_activities', JSON.stringify(cloned));
  return cloned;
}

function getActiveUnits() {
  return (appState && appState.units && appState.units.length > 0) ? appState.units : DEFAULT_UNITS;
}

function getActiveLabourTrades() {
  return (appState && appState.labourTrades && appState.labourTrades.length > 0) ? appState.labourTrades : DEFAULT_LABOUR_TRADES;
}

function getActivePlantEquipment() {
  return (appState && appState.plantEquipment && appState.plantEquipment.length > 0) ? appState.plantEquipment : DEFAULT_PLANT_EQUIPMENT;
}

function getActiveMainActivities() {
  return (appState && appState.mainActivities && appState.mainActivities.length > 0) ? appState.mainActivities : DEFAULT_MAIN_ACTIVITIES;
}

// --- 1.2 USER AUTHENTICATION & ACCESS CONTROL (ADMINISTRATORS VS SITE USERS) ---
// Configured with individual accounts as requested:
// 1 admin = 123456788, 2 admin = 7645332, 1 user = 1254, 2 user = 146563
const DEFAULT_USERS = [
  { id: 'admin1', name: '1 Administrator', password: '123456788', role: 'admin' },
  { id: 'admin2', name: '2 Administrator', password: '7645332', role: 'admin' },
  { id: 'user1', name: '1 Site User', password: '1254', role: 'user' },
  { id: 'user2', name: '2 Site User', password: '146563', role: 'user' },
  { id: 'admin', name: 'Master Admin', password: 'admin', role: 'admin' },
  { id: 'user', name: 'Field Operator', password: 'user', role: 'user' }
];

function loadInitialUsers() {
  let list = [];
  try {
    const raw = safeStorage.getItem('candy_site_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }

  // Ensure all default users (including admin/admin and admin1) are always present
  DEFAULT_USERS.forEach(def => {
    const idx = list.findIndex(u => u.id.toLowerCase() === def.id.toLowerCase());
    if (idx === -1) {
      list.push({ ...def });
    }
  });

  if (list.length === 0) list = JSON.parse(JSON.stringify(DEFAULT_USERS));
  safeStorage.setItem('candy_site_users', JSON.stringify(list));
  return list;
}

function loadInitialCurrentUser(users) {
  try {
    const raw = safeStorage.getItem('candy_auth_user_id');
    if (raw) {
      const u = users.find(x => x.id.toLowerCase() === raw.toLowerCase());
      if (u) return u;
    }
  } catch (e) {}
  return null; // When null, system forces Login Screen on start!
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getEffectiveUser() {
  return appState?.currentUser || (appState?.users && appState.users[0]) || { id: 'admin1', name: '1 Administrator', role: 'admin' };
}

function isCurrentUserAdmin() {
  const u = getEffectiveUser();
  return (u?.role || 'admin') === 'admin';
}

function showAccessDenied(actionDescription = 'perform this administrator action') {
  const modal = document.getElementById('modal-access-denied');
  const msgEl = document.getElementById('access-denied-message');
  const userEl = document.getElementById('access-denied-current-user');
  const actionEl = document.getElementById('access-denied-action-name');

  if (actionEl) actionEl.textContent = actionDescription;
  if (userEl) {
    const cur = getEffectiveUser();
    userEl.textContent = cur ? `👷 ${cur.name} (${cur.id})` : 'Site User';
  }
  if (msgEl) {
    msgEl.innerHTML = `You are currently logged in as a <strong>Site User</strong>. You do not have administrator permissions to <strong>${actionDescription}</strong>. Please switch to an Administrator account to proceed.`;
  }

  if (modal) {
    showModal('modal-access-denied');
  } else {
    alert(`ACCESS DENIED: Administrator Privileges Required.\n\nYou do not have permission to ${actionDescription}. Please log in as an Administrator.`);
  }

  showToast(`⛔ Access Denied: Admin Privilege Required to ${actionDescription}`, 4000);
}

function closeAccessDeniedModal() {
  hideModal('modal-access-denied');
}

// ========================================================
// DIVISIONS MASTER (CUSTOM DIVISIONS SUPPORT)
// ========================================================
const DEFAULT_DIVISIONS = [
  { code: 'SL', name: 'Soft Landscaping' },
  { code: 'HL', name: 'Hard Landscaping' },
  { code: 'IR', name: 'Irrigation' },
  { code: 'CW', name: 'Civil Works' },
  { code: 'EW', name: 'Earth Works & Grading' },
  { code: 'MEP', name: 'Mechanical, Electrical & Plumbing' },
  { code: 'ST', name: 'Structural Works' }
];

function loadInitialDivisions() {
  try {
    const raw = safeStorage.getItem('candy_site_divisions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const cloned = JSON.parse(JSON.stringify(DEFAULT_DIVISIONS));
  safeStorage.setItem('candy_site_divisions', JSON.stringify(cloned));
  return cloned;
}

function getActiveDivisions() {
  return (appState && appState.divisions && appState.divisions.length > 0) ? appState.divisions : DEFAULT_DIVISIONS;
}

function renderSettingsDivisions() {
  const tbody = document.getElementById('settings-divisions-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const divs = getActiveDivisions();
  const isAdmin = isCurrentUserAdmin();

  divs.forEach(d => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100';
    tr.innerHTML = `
      <td class="py-2 px-3 font-mono font-black text-sky-800 text-xs">${escapeHtml(d.code)}</td>
      <td class="py-2 px-3 text-slate-800 text-xs font-semibold">${escapeHtml(d.name)}</td>
      <td class="py-2 px-3 text-center">
        ${isAdmin ? `
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" onclick="editDivisionFromSettings('${escapeJsString(d.code)}')" class="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer" title="Edit division">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" onclick="deleteDivisionFromSettings('${escapeJsString(d.code)}')" class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Delete division">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        ` : '<span class="text-slate-300">--</span>'}
      </td>
    `;
    tbody.appendChild(tr);
  });
  if (window.lucide) { try { lucide.createIcons(); } catch (e) {} }
}

function editDivisionFromSettings(code) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('edit divisions');
    return;
  }
  const divs = getActiveDivisions();
  const d = divs.find(item => item.code === code);
  if (!d) return;

  const origInp = document.getElementById('inp-edit-div-original-code');
  const codeInp = document.getElementById('inp-new-div-code');
  const nameInp = document.getElementById('inp-new-div-name');
  const titleEl = document.getElementById('title-div-form');
  const btnCancel = document.getElementById('btn-cancel-edit-div');
  const btnLabel = document.getElementById('btn-label-save-div');
  const iconSave = document.getElementById('icon-save-div');

  if (origInp) origInp.value = d.code;
  if (codeInp) codeInp.value = d.code;
  if (nameInp) nameInp.value = d.name;
  if (titleEl) titleEl.innerHTML = `<i data-lucide="edit-3" class="w-4 h-4 text-sky-600"></i><span>Editing Division [${escapeHtml(d.code)}]</span>`;
  if (btnCancel) btnCancel.classList.remove('hidden');
  if (btnLabel) btnLabel.textContent = 'Update Division';
  if (iconSave) iconSave.setAttribute('data-lucide', 'check');
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function resetDivisionForm() {
  const origInp = document.getElementById('inp-edit-div-original-code');
  const codeInp = document.getElementById('inp-new-div-code');
  const nameInp = document.getElementById('inp-new-div-name');
  const titleEl = document.getElementById('title-div-form');
  const btnCancel = document.getElementById('btn-cancel-edit-div');
  const btnLabel = document.getElementById('btn-label-save-div');
  const iconSave = document.getElementById('icon-save-div');

  if (origInp) origInp.value = '';
  if (codeInp) codeInp.value = '';
  if (nameInp) nameInp.value = '';
  if (titleEl) titleEl.innerHTML = `<i data-lucide="tag" class="w-4 h-4 text-sky-600"></i><span>Add / Edit Project Division</span>`;
  if (btnCancel) btnCancel.classList.add('hidden');
  if (btnLabel) btnLabel.textContent = '+ Add Division';
  if (iconSave) iconSave.setAttribute('data-lucide', 'plus');
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function saveDivisionFromSettings() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('add or edit divisions');
    return;
  }
  const origInp = document.getElementById('inp-edit-div-original-code');
  const codeInp = document.getElementById('inp-new-div-code');
  const nameInp = document.getElementById('inp-new-div-name');
  const origCode = (origInp?.value || '').trim();
  const code = (codeInp?.value || '').trim().toUpperCase();
  const name = (nameInp?.value || '').trim();

  if (!code || !name) {
    alert('Please enter both Division Code (e.g. EW) and Name (e.g. Earth Works).');
    return;
  }

  let divs = getActiveDivisions();
  if (origCode) {
    // Editing existing division
    const idx = divs.findIndex(d => d.code === origCode);
    if (idx !== -1) {
      if (origCode !== code && divs.some(d => d.code.toUpperCase() === code && d.code !== origCode)) {
        alert(`Division code "${code}" already exists.`);
        return;
      }
      divs[idx].code = code;
      divs[idx].name = name;

      // Cascade update to projects if code changed
      if (origCode !== code) {
        (appState.projects || []).forEach(p => {
          (p.fixedActivities || []).forEach(a => {
            if (a.division === origCode) a.division = code;
          });
          (p.dailyLogs || []).forEach(l => {
            if (l.division === origCode) l.division = code;
          });
        });
      }
      logAuditAction('SETTINGS', 'Division Master', `Updated division: ${origCode} -> ${code} - ${name}`);
      showToast(`Updated division ${code} - ${name}`);
    }
  } else {
    // Adding new division
    if (divs.some(d => d.code.toUpperCase() === code)) {
      alert(`Division code "${code}" already exists.`);
      return;
    }
    divs.push({ code, name });
    logAuditAction('SETTINGS', 'Division Master', `Added new division: ${code} - ${name}`);
    showToast(`Added division ${code} - ${name}`);
  }

  appState.divisions = divs;
  saveState();
  resetDivisionForm();
  renderSettingsDivisions();
  populateFixedDivisionDropdown();
  renderApp();
}

function addDivisionFromSettings() {
  saveDivisionFromSettings();
}

function deleteDivisionFromSettings(code) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete divisions');
    return;
  }
  let divs = getActiveDivisions();
  if (divs.length <= 1) {
    alert('Cannot delete the last remaining division.');
    return;
  }
  if (confirm(`Delete division ${code}?`)) {
    divs = divs.filter(d => d.code !== code);
    appState.divisions = divs;
    saveState();
    resetDivisionForm();
    renderSettingsDivisions();
    populateFixedDivisionDropdown();
    renderApp();
    logAuditAction('SETTINGS', 'Division Master', `Deleted division: ${code}`);
    showToast(`Deleted division ${code}`);
  }
}

function saveResourceRatesFromSettings() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('save Candy baseline resource rates');
    return;
  }
  const prj = getCurrentProject();
  if (!prj) return;

  document.querySelectorAll('.inp-set-labour').forEach(inp => {
    if (!prj.labourRates) prj.labourRates = {};
    prj.labourRates[inp.dataset.tradeId] = parseFloat(inp.value) || 10;
  });

  document.querySelectorAll('.inp-set-plant').forEach(inp => {
    if (!prj.plantRates) prj.plantRates = {};
    prj.plantRates[inp.dataset.plantId] = parseFloat(inp.value) || 50;
  });

  saveState();
  renderApp();
  logAuditAction('SETTINGS', 'Resource Rates', 'Saved updated hourly labour and plant equipment rates');
  showToast('Saved resource rates and recalculated project costs.');
}

function quickPromptNewDivision() {
  const code = prompt('Enter New Division Code (e.g. EW, MEP, ST):');
  if (!code || !code.trim()) return;
  const cleanCode = code.trim().toUpperCase();
  const name = prompt(`Enter Full Name for Division ${cleanCode}:`, cleanCode);
  const cleanName = (name && name.trim()) ? name.trim() : cleanCode;

  const divs = getActiveDivisions();
  if (!divs.some(d => d.code.toUpperCase() === cleanCode)) {
    divs.push({ code: cleanCode, name: cleanName });
    appState.divisions = divs;
    saveState();
  }
  populateFixedDivisionDropdown(cleanCode);
  selectFixedDivision(cleanCode, `${cleanCode} - ${cleanName}`);
  logAuditAction('SETTINGS', 'Division Master', `Quick added division: ${cleanCode} - ${cleanName}`);
}

function populateFixedDivisionDropdown(selectedCode = null) {
  const container = document.getElementById('options-fixed-division');
  const label = document.getElementById('label-fixed-division');
  const inp = document.getElementById('inp-division');
  if (!container) return;
  container.innerHTML = '';
  const divs = getActiveDivisions();
  const cur = selectedCode || inp?.value || (divs[0]?.code) || 'SL';

  divs.forEach(d => {
    const isSel = d.code === cur;
    if (isSel) {
      if (label) label.textContent = `${d.code} - ${d.name}`;
      if (inp) inp.value = d.code;
    }
    const item = document.createElement('div');
    item.className = `dropdown-item p-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium text-xs ${isSel ? 'is-selected font-bold bg-sky-50 text-sky-950' : 'text-slate-800'}`;
    item.dataset.search = `${d.code} ${d.name}`.toLowerCase();
    item.onclick = () => selectFixedDivision(d.code, `${d.code} - ${d.name}`);
    item.textContent = `${d.code} - ${d.name}`;
    container.appendChild(item);
  });
}

// ========================================================
// DASHBOARD & HEADINGS CUSTOMIZER ENGINE
// ========================================================
const DEFAULT_DASHBOARD_CUSTOMIZATION = {
  headerTitle: 'CandyEstimator <span class="text-sky-400">SitePro</span>',
  headerSubtitle: 'P&L Engine',
  card1Title: 'Net Profit / Loss Status',
  card1Subtitle: 'Earned budget vs actual site expenditure',
  card2Title: 'Site Productivity Index (PI)',
  card2Subtitle: 'Output efficiency ratio (>1.0 = Efficient)',
  card3Title: 'Physical Progress Completed',
  card3Subtitle: 'Total executed vs contract BOQ volume',
  card4Title: "Today's Daily Output Spend",
  card4Subtitle: 'Actual labour & machinery spent today',
  navDashboard: 'Dashboard & Results',
  navFixed: 'Fixed Candy Budgets (With Daily Logs Underneath)',
  navDaily: 'All Daily Site Logs (Actuals)',
  navMatrix: 'Excel Template View',
  dashboardTabEnabled: true,
  allowManualFixedRate: true,
  allowManualDailyRate: true
};

function loadInitialDashboardCustomization() {
  try {
    const raw = safeStorage.getItem('candy_site_dashboard_customization');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_DASHBOARD_CUSTOMIZATION, ...parsed };
      }
    }
  } catch (e) {}
  return { ...DEFAULT_DASHBOARD_CUSTOMIZATION };
}

function getActiveDashboardCustomization() {
  return appState?.dashboardCustomization || DEFAULT_DASHBOARD_CUSTOMIZATION;
}

function isDashboardVisibleToCurrentUser() {
  if (isCurrentUserAdmin()) return true;
  const cust = getActiveDashboardCustomization();
  return cust.dashboardTabEnabled !== false;
}

function isManualFixedRateEnabled() {
  const cust = getActiveDashboardCustomization();
  return cust.allowManualFixedRate !== false;
}

function isManualDailyRateEnabled() {
  const cust = getActiveDashboardCustomization();
  return cust.allowManualDailyRate !== false;
}

function updateDashboardTabVisibilityBadge(enabled) {
  const badge = document.getElementById('badge-dash-tab-status');
  const text = document.getElementById('badge-dash-tab-status-text');
  if (!badge || !text) return;
  if (enabled) {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800';
    text.textContent = 'Dashboard Tab is Currently Visible to All Users';
  } else {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800';
    text.textContent = 'Dashboard Tab is Restricted (Visible to Administrators Only)';
  }
}

function toggleDashboardTabVisibilitySetting(enabled) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('modify Dashboard tab visibility settings');
    const cb = document.getElementById('set-dashboard-tab-enabled');
    if (cb) cb.checked = !enabled;
    return;
  }
  if (!appState.dashboardCustomization) {
    appState.dashboardCustomization = { ...DEFAULT_DASHBOARD_CUSTOMIZATION };
  }
  appState.dashboardCustomization.dashboardTabEnabled = !!enabled;
  saveState();
  updateDashboardTabVisibilityBadge(enabled);
  applyDashboardCustomization();
  logAuditAction('SETTINGS', 'Dashboard Access', enabled ? 'Enabled Dashboard View Tab for all users' : 'Disabled Dashboard View Tab for non-admin users');
  showToast(enabled ? 'Dashboard tab enabled for all users' : 'Dashboard tab hidden for non-admin users');
}

function toggleManualFixedRateSetting(enabled) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('change Manual Fixed Rate entry setting');
    const cb = document.getElementById('set-allow-manual-fixed-rate');
    if (cb) cb.checked = !enabled;
    return;
  }
  if (!appState.dashboardCustomization) {
    appState.dashboardCustomization = { ...DEFAULT_DASHBOARD_CUSTOMIZATION };
  }
  appState.dashboardCustomization.allowManualFixedRate = !!enabled;
  saveState();
  logAuditAction('SETTINGS', 'Manual Rate Entry', enabled ? 'Enabled manual fixed rate baseline entry' : 'Disabled manual fixed rate baseline entry');
  showToast(enabled ? 'Manual Fixed Rate Entry Enabled' : 'Manual Fixed Rate Entry Disabled');
}

function toggleManualDailyRateSetting(enabled) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('change Manual Daily Rate entry setting');
    const cb = document.getElementById('set-allow-manual-daily-rate');
    if (cb) cb.checked = !enabled;
    return;
  }
  if (!appState.dashboardCustomization) {
    appState.dashboardCustomization = { ...DEFAULT_DASHBOARD_CUSTOMIZATION };
  }
  appState.dashboardCustomization.allowManualDailyRate = !!enabled;
  saveState();
  logAuditAction('SETTINGS', 'Manual Rate Entry', enabled ? 'Enabled direct actual rate / spend entry for daily logs' : 'Disabled direct actual rate / spend entry for daily logs');
  showToast(enabled ? 'Direct Actual Rate/Spend Entry Enabled' : 'Direct Actual Rate/Spend Entry Disabled');
}

function applyDashboardCustomization() {
  const cust = getActiveDashboardCustomization();

  // App Title & Subtitle
  const hTitle = document.getElementById('header-app-title');
  const hSub = document.getElementById('header-app-subtitle');
  if (hTitle && cust.headerTitle) hTitle.innerHTML = cust.headerTitle;
  if (hSub && cust.headerSubtitle) hSub.textContent = cust.headerSubtitle;

  // KPI Cards
  const c1t = document.getElementById('kpi-card1-title');
  const c1s = document.getElementById('kpi-card1-sub');
  if (c1t && cust.card1Title) c1t.textContent = cust.card1Title;
  if (c1s && cust.card1Subtitle) c1s.textContent = cust.card1Subtitle;

  const c2t = document.getElementById('kpi-card2-title');
  const c2s = document.getElementById('kpi-card2-sub');
  if (c2t && cust.card2Title) c2t.textContent = cust.card2Title;
  if (c2s && cust.card2Subtitle) c2s.textContent = cust.card2Subtitle;

  const c3t = document.getElementById('kpi-card3-title');
  const c3s = document.getElementById('kpi-card3-sub');
  if (c3t && cust.card3Title) c3t.textContent = cust.card3Title;
  if (c3s && cust.card3Subtitle) c3s.textContent = cust.card3Subtitle;

  const c4t = document.getElementById('kpi-card4-title');
  const c4s = document.getElementById('kpi-card4-sub');
  if (c4t && cust.card4Title) c4t.textContent = cust.card4Title;
  if (c4s && cust.card4Subtitle) c4s.textContent = cust.card4Subtitle;

  // Nav tabs
  const nDash = document.getElementById('nav-label-dashboard');
  const nFix = document.getElementById('nav-label-fixed');
  const nDaily = document.getElementById('nav-label-daily');
  const nMat = document.getElementById('nav-label-matrix');
  if (nDash && cust.navDashboard) nDash.textContent = cust.navDashboard;
  if (nFix && cust.navFixed) nFix.textContent = cust.navFixed;
  if (nDaily && cust.navDaily) nDaily.textContent = cust.navDaily;
  if (nMat && cust.navMatrix) nMat.textContent = cust.navMatrix;

  // Dashboard Tab Visibility for Site Users (Admin Only Control)
  const navDashBtn = document.getElementById('nav-dashboard');
  const isDashVisible = isDashboardVisibleToCurrentUser();
  if (navDashBtn) {
    navDashBtn.style.display = isDashVisible ? 'flex' : 'none';
  }
  if (!isDashVisible && appState.activeNavTab === 'dashboard') {
    switchNavTab('fixed');
  }
}

function populateDashboardCustomizerForm() {
  const cust = getActiveDashboardCustomization();
  const isAdmin = isCurrentUserAdmin();
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  setVal('inp-cust-header-title', cust.headerTitle);
  setVal('inp-cust-header-subtitle', cust.headerSubtitle);
  setVal('inp-cust-card1-title', cust.card1Title);
  setVal('inp-cust-card1-sub', cust.card1Subtitle);
  setVal('inp-cust-card2-title', cust.card2Title);
  setVal('inp-cust-card2-sub', cust.card2Subtitle);
  setVal('inp-cust-card3-title', cust.card3Title);
  setVal('inp-cust-card3-sub', cust.card3Subtitle);
  setVal('inp-cust-card4-title', cust.card4Title);
  setVal('inp-cust-card4-sub', cust.card4Subtitle);
  setVal('inp-cust-nav-dashboard', cust.navDashboard);
  setVal('inp-cust-nav-fixed', cust.navFixed);
  setVal('inp-cust-nav-daily', cust.navDaily);
  setVal('inp-cust-nav-matrix', cust.navMatrix);

  // Settings Toggles (Dashboard visibility & manual rate modes)
  const chkFixedRate = document.getElementById('set-allow-manual-fixed-rate');
  if (chkFixedRate) {
    chkFixedRate.checked = cust.allowManualFixedRate !== false;
    chkFixedRate.disabled = !isAdmin;
  }
  const chkDailyRate = document.getElementById('set-allow-manual-daily-rate');
  if (chkDailyRate) {
    chkDailyRate.checked = cust.allowManualDailyRate !== false;
    chkDailyRate.disabled = !isAdmin;
  }
  const chkDashTab = document.getElementById('set-dashboard-tab-enabled');
  if (chkDashTab) {
    chkDashTab.checked = cust.dashboardTabEnabled !== false;
    chkDashTab.disabled = !isAdmin;
  }
  updateDashboardTabVisibilityBadge(cust.dashboardTabEnabled !== false);
}

function saveDashboardCustomizationFromTab() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('customize dashboard headings');
    return;
  }
  const getVal = (id, fallback) => {
    const el = document.getElementById(id);
    return el && el.value.trim() ? el.value.trim() : fallback;
  };
  const chkDashTab = document.getElementById('set-dashboard-tab-enabled');
  const dashEnabled = chkDashTab ? chkDashTab.checked : (appState.dashboardCustomization?.dashboardTabEnabled !== false);
  const chkFixedRate = document.getElementById('set-allow-manual-fixed-rate');
  const fixedRateEnabled = chkFixedRate ? chkFixedRate.checked : (appState.dashboardCustomization?.allowManualFixedRate !== false);
  const chkDailyRate = document.getElementById('set-allow-manual-daily-rate');
  const dailyRateEnabled = chkDailyRate ? chkDailyRate.checked : (appState.dashboardCustomization?.allowManualDailyRate !== false);

  appState.dashboardCustomization = {
    headerTitle: getVal('inp-cust-header-title', DEFAULT_DASHBOARD_CUSTOMIZATION.headerTitle),
    headerSubtitle: getVal('inp-cust-header-subtitle', DEFAULT_DASHBOARD_CUSTOMIZATION.headerSubtitle),
    card1Title: getVal('inp-cust-card1-title', DEFAULT_DASHBOARD_CUSTOMIZATION.card1Title),
    card1Subtitle: getVal('inp-cust-card1-sub', DEFAULT_DASHBOARD_CUSTOMIZATION.card1Subtitle),
    card2Title: getVal('inp-cust-card2-title', DEFAULT_DASHBOARD_CUSTOMIZATION.card2Title),
    card2Subtitle: getVal('inp-cust-card2-sub', DEFAULT_DASHBOARD_CUSTOMIZATION.card2Subtitle),
    card3Title: getVal('inp-cust-card3-title', DEFAULT_DASHBOARD_CUSTOMIZATION.card3Title),
    card3Subtitle: getVal('inp-cust-card3-sub', DEFAULT_DASHBOARD_CUSTOMIZATION.card3Subtitle),
    card4Title: getVal('inp-cust-card4-title', DEFAULT_DASHBOARD_CUSTOMIZATION.card4Title),
    card4Subtitle: getVal('inp-cust-card4-sub', DEFAULT_DASHBOARD_CUSTOMIZATION.card4Subtitle),
    navDashboard: getVal('inp-cust-nav-dashboard', DEFAULT_DASHBOARD_CUSTOMIZATION.navDashboard),
    navFixed: getVal('inp-cust-nav-fixed', DEFAULT_DASHBOARD_CUSTOMIZATION.navFixed),
    navDaily: getVal('inp-cust-nav-daily', DEFAULT_DASHBOARD_CUSTOMIZATION.navDaily),
    navMatrix: getVal('inp-cust-nav-matrix', DEFAULT_DASHBOARD_CUSTOMIZATION.navMatrix),
    dashboardTabEnabled: dashEnabled,
    allowManualFixedRate: fixedRateEnabled,
    allowManualDailyRate: dailyRateEnabled
  };
  saveState();
  applyDashboardCustomization();
  logAuditAction('SETTINGS', 'Dashboard Customizer', 'Updated custom dashboard headings and navigation labels');
  showToast('Dashboard headings saved and applied live!');
}

function resetDashboardCustomizationToDefault() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('reset dashboard headings');
    return;
  }
  if (confirm('Reset all dashboard headings and navigation labels to standard factory defaults?')) {
    appState.dashboardCustomization = { ...DEFAULT_DASHBOARD_CUSTOMIZATION };
    saveState();
    populateDashboardCustomizerForm();
    applyDashboardCustomization();
    logAuditAction('SETTINGS', 'Dashboard Customizer', 'Reset dashboard headings to factory defaults');
    showToast('Reset dashboard headings to default');
  }
}

// ========================================================
// AUDIT TRAIL ENGINE ("WHO DID WHAT")
// ========================================================
function loadInitialAuditTrail() {
  try {
    const raw = safeStorage.getItem('candy_site_audit_trail');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [
    {
      id: 'aud-seed-1',
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString(),
      user: '1 Administrator',
      role: 'admin',
      action: 'SYSTEM_INIT',
      target: 'Candy Site Tracker',
      details: 'Initialized Candy system database & baseline master'
    }
  ];
}

function logAuditAction(action, target, details) {
  const user = getEffectiveUser();
  const entry = {
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleString(),
    user: user.name || user.id || 'User',
    role: user.role || 'user',
    action: action,
    target: target || 'General',
    details: details || ''
  };
  if (!Array.isArray(appState.auditTrail)) {
    appState.auditTrail = [];
  }
  appState.auditTrail.unshift(entry);
  if (appState.auditTrail.length > 1000) {
    appState.auditTrail = appState.auditTrail.slice(0, 1000);
  }
  try {
    safeStorage.setItem('candy_site_audit_trail', JSON.stringify(appState.auditTrail));
  } catch (e) {}
}

function renderAuditTrailTable(filterKeyword = '', filterCategory = 'ALL') {
  const tbody = document.getElementById('settings-audit-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const trail = appState.auditTrail || [];
  const kw = (filterKeyword || '').toLowerCase().trim();

  const filtered = trail.filter(entry => {
    if (filterCategory !== 'ALL') {
      if (!entry.action.toUpperCase().includes(filterCategory.toUpperCase())) return false;
    }
    if (!kw) return true;
    const combined = `${entry.formattedTime} ${entry.user} ${entry.role} ${entry.action} ${entry.target} ${entry.details}`.toLowerCase();
    return combined.includes(kw);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-slate-400">No audit log records match the search criteria.</td></tr>';
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs';
    const roleBadge = item.role === 'admin' 
      ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">👑 Admin</span>' 
      : '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">👷 Site User</span>';
    
    let actionBadgeClass = 'bg-slate-100 text-slate-800';
    if (item.action.includes('CREATE') || item.action.includes('ADD')) actionBadgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
    else if (item.action.includes('UPDATE') || item.action.includes('EDIT')) actionBadgeClass = 'bg-sky-100 text-sky-800 font-bold';
    else if (item.action.includes('DELETE') || item.action.includes('RESET')) actionBadgeClass = 'bg-rose-100 text-rose-800 font-bold';
    else if (item.action.includes('EXPORT') || item.action.includes('BACKUP')) actionBadgeClass = 'bg-amber-100 text-amber-800 font-bold';

    tr.innerHTML = `
      <td class="py-2.5 px-3 font-mono-numbers text-slate-500 whitespace-nowrap">${item.formattedTime}</td>
      <td class="py-2.5 px-3">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="font-bold text-slate-800">${item.user}</span>
          ${roleBadge}
        </div>
      </td>
      <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] ${actionBadgeClass}">${item.action}</span></td>
      <td class="py-2.5 px-3 font-semibold text-slate-700">${item.target}</td>
      <td class="py-2.5 px-3 text-slate-600 font-sans">${item.details}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterAuditTrailTable() {
  const kw = document.getElementById('inp-search-audit')?.value || '';
  const cat = document.getElementById('sel-filter-audit-action')?.value || 'ALL';
  renderAuditTrailTable(kw, cat);
}

function clearAuditTrailHistory() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('clear the system audit trail');
    return;
  }
  if (confirm('Clear all audit logs history? This action cannot be undone.')) {
    appState.auditTrail = [];
    saveState();
    renderAuditTrailTable();
    showToast('Audit trail history cleared');
  }
}

function exportAuditTrailCSV() {
  const trail = appState.auditTrail || [];
  if (trail.length === 0) {
    alert('No audit trail records to export.');
    return;
  }
  const headers = ['Timestamp', 'Date & Time', 'User Name', 'User Role', 'Action', 'Target Entity', 'Details'];
  const rows = trail.map(t => [
    `"${t.timestamp}"`,
    `"${t.formattedTime}"`,
    `"${t.user}"`,
    `"${t.role}"`,
    `"${t.action}"`,
    `"${(t.target || '').replace(/"/g, '""')}"`,
    `"${(t.details || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, `candy_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
  logAuditAction('EXPORT', 'Audit Trail', 'Exported audit trail to CSV file');
}

function exportAuditTrailJSON() {
  const trail = appState.auditTrail || [];
  const jsonStr = JSON.stringify(trail, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  triggerBlobDownload(blob, `candy_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
  logAuditAction('EXPORT', 'Audit Trail', 'Exported audit trail to JSON file');
}

// ========================================================
// PYTHON & ADMIN CODE STUDIO
// ========================================================
function renderCodeStudioPanel() {
  const selSub = document.getElementById('sel-code-sub-act');
  const selMain = document.getElementById('sel-code-main-act');
  const prj = getCurrentProject();
  if (!prj) return;

  if (selSub) {
    selSub.innerHTML = '';
    (prj.fixedActivities || []).forEach(act => {
      const opt = document.createElement('option');
      opt.value = act.id;
      opt.textContent = `[${act.code}] ${act.subActivity.slice(0, 50)}...`;
      selSub.appendChild(opt);
    });
    if (prj.fixedActivities && prj.fixedActivities.length > 0) {
      onCodeSelectSubActChange(prj.fixedActivities[0].id);
    }
  }

  if (selMain) {
    selMain.innerHTML = '';
    getActiveMainActivities().forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.code;
      opt.textContent = `[${m.code}] ${m.description.slice(0, 50)}...`;
      selMain.appendChild(opt);
    });
    const mains = getActiveMainActivities();
    if (mains.length > 0) {
      onCodeSelectMainActChange(mains[0].code);
    }
  }
}

function onCodeSelectSubActChange(activityId) {
  const prj = getCurrentProject();
  if (!prj) return;
  const act = (prj.fixedActivities || []).find(a => a.id === activityId);
  const codeInp = document.getElementById('inp-code-sub-act-code');
  const descInp = document.getElementById('inp-code-sub-act-desc');
  if (act) {
    if (codeInp) codeInp.value = act.code;
    if (descInp) descInp.value = act.subActivity;
  }
}

function saveSubActivityDescriptionFromStudio() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('edit sub-activity descriptions from Admin Studio');
    return;
  }
  const selSub = document.getElementById('sel-code-sub-act');
  const descInp = document.getElementById('inp-code-sub-act-desc');
  const actId = selSub?.value;
  const newDesc = descInp?.value.trim();
  if (!actId || !newDesc) {
    alert('Please enter a valid description.');
    return;
  }
  const prj = getCurrentProject();
  const act = (prj.fixedActivities || []).find(a => a.id === actId);
  if (!act) return;

  const oldDesc = act.subActivity;
  act.subActivity = newDesc;
  saveState();
  renderApp();
  renderCodeStudioPanel();
  logAuditAction('UPDATE_FIXED_ACTIVITY', act.code, `Updated description from: "${oldDesc.slice(0, 40)}" to: "${newDesc.slice(0, 40)}"`);
  showToast(`Updated description for [${act.code}]`);
}

function onCodeSelectMainActChange(mainCode) {
  const main = getActiveMainActivities().find(m => m.code === mainCode);
  const descInp = document.getElementById('inp-code-main-act-desc');
  if (main && descInp) {
    descInp.value = main.description;
  }
}

function saveMainActivityDescriptionFromStudio() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('edit Main Activity descriptions from Admin Studio');
    return;
  }
  const selMain = document.getElementById('sel-code-main-act');
  const descInp = document.getElementById('inp-code-main-act-desc');
  const code = selMain?.value;
  const newDesc = descInp?.value.trim();
  if (!code || !newDesc) {
    alert('Please enter a valid description.');
    return;
  }
  const mains = getActiveMainActivities();
  const main = mains.find(m => m.code === code);
  if (!main) return;

  const oldDesc = main.description;
  main.description = newDesc;
  const prj = getCurrentProject();
  (prj.fixedActivities || []).forEach(a => {
    if (a.mainActivityCode === code) a.mainActivityDesc = newDesc;
  });
  saveState();
  renderApp();
  renderCodeStudioPanel();
  logAuditAction('UPDATE_MAIN_ACTIVITY', code, `Updated description from: "${oldDesc.slice(0, 40)}" to: "${newDesc.slice(0, 40)}"`);
  showToast(`Updated Main Activity [${code}]`);
}

function exportStateForPython() {
  const prj = getCurrentProject();
  const exportPayload = {
    timestamp: new Date().toISOString(),
    activeProjectId: appState.currentProjectId,
    projects: appState.projects,
    mainActivities: getActiveMainActivities(),
    labourTrades: getActiveLabourTrades(),
    plantEquipment: getActivePlantEquipment(),
    divisions: getActiveDivisions(),
    auditTrail: appState.auditTrail || [],
    dashboardCustomization: getActiveDashboardCustomization()
  };
  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  triggerBlobDownload(blob, 'candy_state_backup.json');
  logAuditAction('EXPORT', 'Python State', 'Downloaded candy_state_backup.json for Python script execution');
  showToast('Downloaded candy_state_backup.json for Python script use');
}

function importPythonStateFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.projects && Array.isArray(data.projects)) {
        appState.projects = data.projects;
      }
      if (data.mainActivities && Array.isArray(data.mainActivities)) {
        appState.mainActivities = data.mainActivities;
      }
      if (data.divisions && Array.isArray(data.divisions)) {
        appState.divisions = data.divisions;
      }
      if (data.auditTrail && Array.isArray(data.auditTrail)) {
        appState.auditTrail = data.auditTrail;
      }
      saveState();
      renderApp();
      renderCodeStudioPanel();
      logAuditAction('IMPORT', 'Python State', 'Imported updated state from Python script');
      showToast('Successfully imported state updated by Python script!');
    } catch (err) {
      alert('Error parsing JSON state file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function togglePythonScriptViewer() {
  const box = document.getElementById('box-python-code-viewer');
  if (!box) return;
  if (box.classList.contains('hidden')) {
    box.classList.remove('hidden');
    const pre = document.getElementById('pre-python-script-code');
    if (pre) {
      pre.textContent = `# admin_config.py is located at:\n# c:\\Users\\Kavin Raj\\Desktop\\web\\admin_config.py\n\nimport json, os, sys\n\n# CLI Usage:\n# python admin_config.py --list\n# python admin_config.py --edit-desc 22110001 "New Sub Activity Name"\n# python admin_config.py --edit-main "S00147 (A,B,C)" "Sweeting Sand filling..."\n# python admin_config.py --audit`;
    }
  } else {
    box.classList.add('hidden');
  }
}

// Inline Labour and Plant in modal-activity
function toggleAddLabourInline(forceState) {
  const form = document.getElementById('inline-add-labour-form');
  if (!form) return;
  if (typeof forceState === 'boolean') {
    if (forceState) form.classList.remove('hidden');
    else form.classList.add('hidden');
  } else {
    form.classList.toggle('hidden');
  }
}

function addLabourInlineToActivity() {
  const nameInp = document.getElementById('inp-inline-labour-name');
  const shortInp = document.getElementById('inp-inline-labour-short');
  const rateInp = document.getElementById('inp-inline-labour-rate');
  const name = (nameInp?.value || '').trim();
  const short = (shortInp?.value || '').trim();
  const rate = parseFloat(rateInp?.value);

  if (!name || !short || isNaN(rate) || rate <= 0) {
    alert('Please enter a valid trade name, short code, and hourly rate.');
    return;
  }

  const tradeId = 'lab_' + short.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const trades = getActiveLabourTrades();
  if (!trades.some(t => t.id === tradeId)) {
    trades.push({ id: tradeId, name, short, rate });
    appState.labourTrades = trades;
  }

  const prj = getCurrentProject();
  if (prj) {
    if (!prj.labourRates) prj.labourRates = {};
    prj.labourRates[tradeId] = rate;
  }
  saveState();

  const currentHours = {};
  document.querySelectorAll('.inp-modal-labour-hrs').forEach(inp => {
    currentHours[inp.dataset.tradeId] = parseFloat(inp.value) || 0;
  });
  currentHours[tradeId] = currentHours[tradeId] || 10;
  populateModalLabourInputs(currentHours);
  triggerFixedModalCalculation();

  if (nameInp) nameInp.value = '';
  if (shortInp) shortInp.value = '';
  if (rateInp) rateInp.value = '';
  toggleAddLabourInline(false);
  logAuditAction('SETTINGS', 'Labour Trade', `Added trade [${short}] ${name} at ${rate} AED/hr`);
  showToast(`Added labour trade "${name}" to activity crew!`);
}

function toggleAddPlantInline(forceState) {
  const form = document.getElementById('inline-add-plant-form');
  if (!form) return;
  if (typeof forceState === 'boolean') {
    if (forceState) form.classList.remove('hidden');
    else form.classList.add('hidden');
  } else {
    form.classList.toggle('hidden');
  }
}

function addPlantInlineToActivity() {
  const nameInp = document.getElementById('inp-inline-plant-name');
  const shortInp = document.getElementById('inp-inline-plant-short');
  const rateInp = document.getElementById('inp-inline-plant-rate');
  const name = (nameInp?.value || '').trim();
  const short = (shortInp?.value || '').trim();
  const rate = parseFloat(rateInp?.value);

  if (!name || !short || isNaN(rate) || rate <= 0) {
    alert('Please enter a valid equipment name, short code, and hourly rate.');
    return;
  }

  const plantId = 'pl_' + short.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const plants = getActivePlantEquipment();
  if (!plants.some(p => p.id === plantId)) {
    plants.push({ id: plantId, name, short, unit: 'Hrs', rate });
    appState.plantEquipment = plants;
  }

  const prj = getCurrentProject();
  if (prj) {
    if (!prj.plantRates) prj.plantRates = {};
    prj.plantRates[plantId] = rate;
  }
  saveState();

  const currentHours = {};
  document.querySelectorAll('.inp-modal-plant-hrs').forEach(inp => {
    currentHours[inp.dataset.plantId] = parseFloat(inp.value) || 0;
  });
  currentHours[plantId] = currentHours[plantId] || 10;
  populateModalPlantInputs(currentHours);
  triggerFixedModalCalculation();

  if (nameInp) nameInp.value = '';
  if (shortInp) shortInp.value = '';
  if (rateInp) rateInp.value = '';
  toggleAddPlantInline(false);
  logAuditAction('SETTINGS', 'Plant Equipment', `Added equipment [${short}] ${name} at ${rate} AED/hr`);
  showToast(`Added equipment "${name}" to activity machinery!`);
}

function toggleCustomMainActInput(forceState) {
  const row = document.getElementById('row-custom-main-act');
  if (!row) return;
  if (typeof forceState === 'boolean') {
    if (forceState) row.classList.remove('hidden');
    else row.classList.add('hidden');
  } else {
    row.classList.toggle('hidden');
  }
}

function applyCustomMainActivityInput() {
  const codeInp = document.getElementById('inp-custom-main-code');
  const descInp = document.getElementById('inp-custom-main-desc');
  const code = (codeInp?.value || '').trim();
  const desc = (descInp?.value || '').trim();

  if (!code || !desc) {
    alert('Please enter both Main Activity Code (e.g. S00147 (A,B,C)) and Description.');
    return;
  }

  const hidCode = document.getElementById('inp-fixed-main-code');
  const hidDesc = document.getElementById('inp-fixed-main-desc');
  const label = document.getElementById('label-fixed-main-act');
  if (hidCode) hidCode.value = code;
  if (hidDesc) hidDesc.value = desc;
  if (label) label.textContent = `${code} - ${desc}`;

  const mains = getActiveMainActivities();
  if (!mains.some(m => m.code === code)) {
    mains.push({
      code: code,
      description: desc,
      workoutQty: parseFloat(document.getElementById('inp-workout-qty')?.value) || 200,
      labourHours: { helper: 100, charge_hand: 10 },
      plantHours: { jcb: 10, bobcat: 10 }
    });
    appState.mainActivities = mains;
    saveState();
  }

  toggleCustomMainActInput(false);
  populateFixedMainActivityDropdown(code);
  showToast(`Custom Main Activity set: [${code}]`);
}

let appState = {
  projects: loadInitialProjects(),
  currentProjectId: safeStorage.getItem('candy_active_project_id') || 'prj-1',
  users: loadInitialUsers(),
  units: loadInitialUnits(),
  divisions: loadInitialDivisions(),
  labourTrades: loadInitialLabourTrades(),
  plantEquipment: loadInitialPlantEquipment(),
  mainActivities: loadInitialMainActivities(),
  dashboardCustomization: loadInitialDashboardCustomization(),
  auditTrail: loadInitialAuditTrail(),
  currentUser: null,
  isAuthenticated: false,
  activeNavTab: 'dashboard',
  dashboardFilterDate: 'ALL', // 'ALL' or 'YYYY-MM-DD'
  dashboardDisplayMode: 'both', // 'both', 'date', 'overall'
  searchFixedQuery: '',
  filterDailyActivityId: 'ALL',
  filterDailyDate: '',
  matrixFilterActivityId: 'ALL',
  matrixFilterDate: 'ALL', // 'ALL' or 'YYYY-MM-DD'
  matrixExpandedActivityIds: new Set(['act-1', 'act-2', 'act-3']),
  matrixAllExpanded: true,
  editingFixedActivityId: null,
  editingDailyLogId: null,
  expandedActivityIds: new Set(['act-1'])
};
appState.currentUser = loadInitialCurrentUser(appState.users);
appState.isAuthenticated = !!appState.currentUser;

let chartEarnedVsActual = null;
let chartPnlByActivity = null;

function saveState() {
  try {
    safeStorage.setItem('candy_site_projects', JSON.stringify(appState.projects));
    safeStorage.setItem('candy_active_project_id', appState.currentProjectId);
    safeStorage.setItem('candy_site_users', JSON.stringify(appState.users));
    safeStorage.setItem('candy_site_units', JSON.stringify(appState.units));
    safeStorage.setItem('candy_site_divisions', JSON.stringify(appState.divisions));
    safeStorage.setItem('candy_site_labour_trades', JSON.stringify(appState.labourTrades));
    safeStorage.setItem('candy_site_plant_equipment', JSON.stringify(appState.plantEquipment));
    safeStorage.setItem('candy_site_main_activities', JSON.stringify(appState.mainActivities));
    safeStorage.setItem('candy_site_dashboard_customization', JSON.stringify(appState.dashboardCustomization));
    safeStorage.setItem('candy_site_audit_trail', JSON.stringify(appState.auditTrail));
    if (appState.currentUser) {
      safeStorage.setItem('candy_auth_user_id', appState.currentUser.id);
    } else {
      safeStorage.removeItem('candy_auth_user_id');
    }
    updateSaveIndicator();
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function updateSaveIndicator() {
  const dot = document.getElementById('status-save-dot');
  const txt = document.getElementById('status-save-text');
  if (dot) {
    dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
    setTimeout(() => {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
    }, 600);
  }
  if (txt) {
    txt.textContent = 'Saved!';
    setTimeout(() => {
      txt.textContent = 'Auto-Saved';
    }, 2000);
  }
}

function manualSaveWithFeedback() {
  saveState();
  const prj = getCurrentProject();
  const actCount = prj?.fixedActivities?.length || 0;
  const logCount = prj?.dailyLogs?.length || 0;
  const prjCount = appState.projects.length;
  const now = new Date().toLocaleTimeString();
  showToast(`✓ All data auto-saved at ${now}! (${prjCount} project(s), ${actCount} baseline(s), ${logCount} daily log(s))`);
}

function getCurrentProject() {
  if (!Array.isArray(appState.projects) || appState.projects.length === 0) {
    appState.projects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
  }
  let prj = appState.projects.find(p => p.id === appState.currentProjectId);
  if (!prj && appState.projects.length > 0) {
    prj = appState.projects[0];
    appState.currentProjectId = prj.id;
  }
  if (prj) {
    if (!Array.isArray(prj.fixedActivities)) prj.fixedActivities = [];
    if (!Array.isArray(prj.dailyLogs)) prj.dailyLogs = [];
    if (!prj.labourRates) prj.labourRates = DEFAULT_LABOUR_TRADES.reduce((acc, t) => { acc[t.id] = t.rate; return acc; }, {});
    if (!prj.plantRates) prj.plantRates = DEFAULT_PLANT_EQUIPMENT.reduce((acc, pl) => { acc[pl.id] = pl.rate; return acc; }, {});
  }
  return prj;
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-slate-900 text-emerald-400 border-emerald-500/40' : (type === 'error' ? 'bg-rose-900 text-rose-200 border-rose-500/40' : 'bg-slate-900 text-sky-300 border-sky-500/40');
  toast.className = `${bgClass} border px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all transform duration-300 translate-y-2 opacity-0 pointer-events-auto`;
  
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : (type === 'error' ? 'bg-rose-400' : 'bg-sky-400')}"></span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 3500);
}

// Format numbers
function formatAED(num, decimals = 2) {
  if (isNaN(num) || num === null || num === undefined) return 'AED 0.00';
  return 'AED ' + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatNum(num, decimals = 2) {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// --- 3. MATHEMATICAL ENGINE ---

// Pure Baseline Calculation (Never touches daily logs)
function calculateFixedActivityBaseline(activity, project) {
  const prj = project || getCurrentProject();
  const workoutQty = parseFloat(activity.workoutQty) || 1;
  const totalQty = parseFloat(activity.totalQty) || 0;
  const scale = workoutQty > 0 ? (totalQty / workoutQty) : 0;
  const allowableRate = parseFloat(activity.allowableRate) || 0;
  const isManualMode = (activity.rateMode === 'manual');

  let workoutLabourCost = 0;
  const detailedLabour = {};

  getActiveLabourTrades().forEach(t => {
    const rate = prj?.labourRates?.[t.id] ?? t.rate;
    const workoutHrs = parseFloat(activity.labourHours?.[t.id]) || 0;
    const projectHrs = workoutHrs * scale;
    const workoutCost = workoutHrs * rate;
    const projectCost = projectHrs * rate;

    workoutLabourCost += workoutCost;
    detailedLabour[t.id] = { workoutHrs, projectHrs, rate, workoutCost, projectCost };
  });

  const totalLabourAmount = workoutLabourCost * scale;
  const unitLabourCost = workoutQty > 0 ? (workoutLabourCost / workoutQty) : 0;

  let workoutPlantCost = 0;
  const detailedPlant = {};

  getActivePlantEquipment().forEach(p => {
    const rate = prj?.plantRates?.[p.id] ?? p.rate;
    const workoutHrs = parseFloat(activity.plantHours?.[p.id]) || 0;
    const projectHrs = workoutHrs * scale;
    const workoutCost = workoutHrs * rate;
    const projectCost = projectHrs * rate;

    workoutPlantCost += workoutCost;
    detailedPlant[p.id] = { workoutHrs, projectHrs, rate, workoutCost, projectCost };
  });

  const totalPlantAmount = workoutPlantCost * scale;
  const unitPlantCost = workoutQty > 0 ? (workoutPlantCost / workoutQty) : 0;

  const gangUnitRate = unitLabourCost + unitPlantCost;

  let budgetUnitRate = gangUnitRate;
  if (isManualMode && allowableRate > 0) {
    budgetUnitRate = allowableRate;
  } else if (gangUnitRate === 0 && allowableRate > 0) {
    budgetUnitRate = allowableRate;
  }
  const totalBudgetAmount = totalQty * budgetUnitRate;

  return {
    scale,
    rateMode: activity.rateMode || (isManualMode ? 'manual' : 'norms'),
    allowableRate,
    workoutLabourCost,
    totalLabourAmount,
    unitLabourCost,
    detailedLabour,
    workoutPlantCost,
    totalPlantAmount,
    unitPlantCost,
    detailedPlant,
    budgetUnitRate,
    totalBudgetAmount
  };
}

// Daily Log Calculation (Calls ONLY calculateFixedActivityBaseline, NEVER calculateFixedActivity)
function calculateDailyLog(log, activity, project) {
  const prj = project || getCurrentProject();
  const act = activity || (prj?.fixedActivities || []).find(a => a.id === log.activityId);
  const actualQty = parseFloat(log.actualQty) || 0;

  const baseline = act ? calculateFixedActivityBaseline(act, prj) : { budgetUnitRate: 0, unitLabourCost: 0, unitPlantCost: 0 };
  const budgetUnitRate = baseline.budgetUnitRate;

  let actualLabourCost = 0;
  let actualLabourHours = 0;
  const detailedLabour = {};
  getActiveLabourTrades().forEach(t => {
    const rate = prj?.labourRates?.[t.id] ?? t.rate;
    const hrs = parseFloat(log.actualLabourHours?.[t.id]) || 0;
    actualLabourCost += hrs * rate;
    actualLabourHours += hrs;
    detailedLabour[t.id] = { actualHrs: hrs, rate, cost: hrs * rate };
  });

  let actualPlantCost = 0;
  let actualPlantHours = 0;
  const detailedPlant = {};
  getActivePlantEquipment().forEach(p => {
    const rate = prj?.plantRates?.[p.id] ?? p.rate;
    const hrs = parseFloat(log.actualPlantHours?.[p.id]) || 0;
    actualPlantCost += hrs * rate;
    actualPlantHours += hrs;
    detailedPlant[p.id] = { actualHrs: hrs, rate, cost: hrs * rate };
  });

  let actualCost = actualLabourCost + actualPlantCost;
  let actualUnitCost = actualQty > 0 ? (actualCost / actualQty) : 0;
  const actualUnitLabour = actualQty > 0 ? (actualLabourCost / actualQty) : 0;
  const actualUnitPlant = actualQty > 0 ? (actualPlantCost / actualQty) : 0;

  const isManualDaily = (log.costMode === 'manual') || ((parseFloat(log.manualUnitCost) > 0 || parseFloat(log.manualTotalCost) > 0) && (actualLabourCost + actualPlantCost === 0));
  if (isManualDaily) {
    if (parseFloat(log.manualTotalCost) > 0) {
      actualCost = parseFloat(log.manualTotalCost);
      actualUnitCost = actualQty > 0 ? (actualCost / actualQty) : (parseFloat(log.manualUnitCost) || 0);
    } else if (parseFloat(log.manualUnitCost) > 0) {
      actualUnitCost = parseFloat(log.manualUnitCost);
      actualCost = actualQty * actualUnitCost;
    }
  }

  const earnedBudget = actualQty * budgetUnitRate;
  const profitLossAED = earnedBudget - actualCost;
  const profitLossPercent = earnedBudget > 0 ? (profitLossAED / earnedBudget) * 100 : (actualCost > 0 ? -100 : 0);
  const productivityIndex = actualUnitCost > 0 ? (budgetUnitRate / actualUnitCost) : 1;

  const labourVarianceAED = (actualQty * baseline.unitLabourCost) - actualLabourCost;
  const plantVarianceAED = (actualQty * baseline.unitPlantCost) - actualPlantCost;

  return {
    actualQty,
    budgetUnitRate,
    costMode: log.costMode || (isManualDaily ? 'manual' : 'gang'),
    manualUnitCost: parseFloat(log.manualUnitCost) || 0,
    manualTotalCost: parseFloat(log.manualTotalCost) || 0,
    actualLabourCost,
    actualLabourHours,
    actualPlantCost,
    actualPlantHours,
    detailedLabour,
    detailedPlant,
    actualCost,
    actualUnitCost,
    actualUnitLabour,
    actualUnitPlant,
    budgetUnitLabour: baseline.unitLabourCost,
    budgetUnitPlant: baseline.unitPlantCost,
    earnedBudget,
    profitLossAED,
    profitLossPercent,
    productivityIndex,
    labourVarianceAED,
    plantVarianceAED,
    isLoss: profitLossAED < -(prj?.lossThreshold || 0)
  };
}

// Full Fixed Activity Calculation (Aggregates Baseline + Daily Actuals)
function calculateFixedActivity(activity, project) {
  const prj = project || getCurrentProject();
  const baseline = calculateFixedActivityBaseline(activity, prj);

  // Actual cumulative progress from daily logs under this activity
  const logs = (prj?.dailyLogs || []).filter(l => l.activityId === activity.id);
  let totalDoneQty = 0;
  let totalActualSpend = 0;

  logs.forEach(l => {
    totalDoneQty += parseFloat(l.actualQty) || 0;
    const logCalc = calculateDailyLog(l, activity, prj);
    totalActualSpend += logCalc.actualCost;
  });

  const totalQty = parseFloat(activity.totalQty) || 0;
  const percentDone = totalQty > 0 ? (totalDoneQty / totalQty) * 100 : 0;
  const earnedBudgetToDate = totalDoneQty * baseline.budgetUnitRate;
  const cumulativeProfitLoss = earnedBudgetToDate - totalActualSpend;
  const cumulativeProfitLossPercent = earnedBudgetToDate > 0 ? (cumulativeProfitLoss / earnedBudgetToDate) * 100 : 0;

  return {
    ...baseline,
    totalDoneQty,
    percentDone,
    totalActualSpend,
    earnedBudgetToDate,
    cumulativeProfitLoss,
    cumulativeProfitLossPercent,
    logsCount: logs.length
  };
}

// Solutions Engine
function generateSolutionForLoss(log, activity, prj) {
  const calc = calculateDailyLog(log, activity, prj);
  const solutions = [];

  const labourExcessPercent = calc.budgetUnitLabour > 0 ? ((calc.actualUnitLabour - calc.budgetUnitLabour) / calc.budgetUnitLabour) * 100 : 0;
  const plantExcessPercent = calc.budgetUnitPlant > 0 ? ((calc.actualUnitPlant - calc.budgetUnitPlant) / calc.budgetUnitPlant) * 100 : 0;

  if (calc.labourVarianceAED < 0) {
    solutions.push({
      category: 'Labour Productivity & Gang Balancing',
      severity: labourExcessPercent > 30 ? 'CRITICAL' : 'HIGH',
      finding: `Labour cost today was ${formatAED(calc.actualUnitLabour)}/${activity.unit} vs budget ${formatAED(calc.budgetUnitLabour)}/${activity.unit} (+${formatNum(labourExcessPercent, 1)}% excess).`,
      rootCause: `Gang manpower size was oversized for today's delivered output of ${formatNum(calc.actualQty, 0)} ${activity.unit}. Workers experienced standby or task delays.`,
      recommendedActions: [
        `Rebalance Gang: Reduce gang headcount by 2–3 helpers (or assign to secondary tasks like raking/tamping) to match a daily output target of ${formatNum(calc.actualQty, 0)} ${activity.unit}.`,
        `Pre-Shift Work Briefing: Set hourly production targets (e.g. ${formatNum(calc.actualQty / 8, 1)} ${activity.unit}/hour) supervised by the Charge Hand.`,
        `Daily Standby Tracking: Ensure waiting time for material trucks is logged as client delay if access or gate permits were the cause.`
      ]
    });
  }

  if (calc.plantVarianceAED < 0) {
    solutions.push({
      category: 'Machinery & Equipment Optimization',
      severity: plantExcessPercent > 30 ? 'CRITICAL' : 'HIGH',
      finding: `Plant unit cost today was ${formatAED(calc.actualUnitPlant)}/${activity.unit} vs budget ${formatAED(calc.budgetUnitPlant)}/${activity.unit} (+${formatNum(plantExcessPercent, 1)}% excess).`,
      rootCause: `Heavy equipment (JCB / Trucks / Loaders) operated for full shift hours but suffered low production cycle rate (${formatNum(calc.actualQty, 0)} ${activity.unit} vs ${activity.workoutQty} norm).`,
      recommendedActions: [
        `Synchronize Material Deliveries: Schedule Dune Sand / Soil delivery trucks in 2 distinct batches (morning & midday) to avoid equipment idling.`,
        `Shared Equipment Protocol: When loader finishes primary filling, redeploy machine to adjacent Zone preparation rather than leaving on standby.`,
        `Review Haulage Distance: If travel distance from site stockyard increased, introduce an additional 20m3 truck to eliminate loader waiting cycles.`
      ]
    });
  }

  if (solutions.length === 0) {
    solutions.push({
      category: 'General Production Rhythm',
      severity: 'MODERATE',
      finding: `Minor variance below standard budget norm (${formatNum(calc.profitLossPercent, 1)}%).`,
      rootCause: `Slight mismatch between daily output volume and crew capacity.`,
      recommendedActions: [
        `Monitor progress across the next 2 site shifts to confirm if production rate returns to baseline.`
      ]
    });
  }

  return {
    activityName: activity.subActivity,
    activityCode: activity.code,
    date: log.date,
    actualQty: calc.actualQty,
    unit: activity.unit,
    profitLossAED: calc.profitLossAED,
    profitLossPercent: calc.profitLossPercent,
    productivityIndex: calc.productivityIndex,
    solutions
  };
}

// --- 3.5 ROLE-BASED ACCESS CONTROL, PROJECT MANAGEMENT & 3-DOT MENU ---

function applyRolePermissions() {
  const user = appState.currentUser || appState.users[0];
  const isAdmin = isCurrentUserAdmin();

  // Top Navbar User Role Badge
  const navUserBadge = document.getElementById('nav-user-badge');
  const navUserIcon = document.getElementById('nav-user-icon');
  const navUserLabel = document.getElementById('nav-user-label');
  if (navUserIcon) navUserIcon.textContent = isAdmin ? '👑' : '👷';
  if (navUserLabel) navUserLabel.textContent = user.name ? user.name.split(' ')[0] : (isAdmin ? 'Admin' : 'User');
  if (navUserBadge) {
    navUserBadge.className = `px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${isAdmin ? 'bg-slate-800 text-sky-300 border-sky-600/40 hover:bg-slate-700' : 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:bg-amber-900/40'}`;
  }

  // 3-Dot Top Menu User Header
  const topAvatar = document.getElementById('top-menu-user-avatar');
  const topName = document.getElementById('top-menu-user-name');
  const topBadge = document.getElementById('top-menu-user-role-badge');
  if (topAvatar) {
    topAvatar.textContent = (user.name || user.id).slice(0, 2).toUpperCase();
    topAvatar.className = `w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${isAdmin ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`;
  }
  if (topName) topName.textContent = user.name || user.id;
  if (topBadge) {
    topBadge.textContent = isAdmin ? '👑 Administrator' : '👷 Site User (Today Only)';
    topBadge.className = `px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase ${isAdmin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`;
  }

  // Settings Active User Card
  const setAvatar = document.getElementById('settings-active-user-avatar');
  const setName = document.getElementById('settings-active-user-name');
  const setId = document.getElementById('settings-active-user-id');
  const setBadge = document.getElementById('settings-active-user-role-badge');
  if (setAvatar) setAvatar.textContent = (user.name || user.id).slice(0, 2).toUpperCase();
  if (setName) setName.textContent = user.name || user.id;
  if (setId) setId.textContent = user.id;
  if (setBadge) {
    setBadge.textContent = isAdmin ? '👑 Administrator (Full Control)' : '👷 Site User (Today Only & No Deletions)';
    setBadge.className = `px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase ${isAdmin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`;
  }

  // Admin-Only UI Controls Visibility & Behavior
  const btnAddAct = document.getElementById('btn-add-activity');
  const btnAddAct2 = document.getElementById('btn-add-activity-2');
  const btnDelPrj = document.getElementById('btn-delete-project');
  const btnMenuDelPrj = document.getElementById('btn-menu-delete-project');
  const lockedNotice = document.getElementById('settings-fixed-locked-notice');
  const addUserSec = document.getElementById('settings-add-user-section');
  const resetRatesBtn = document.getElementById('btn-reset-rates-defaults');

  if (btnAddAct) {
    btnAddAct.classList.remove('hidden');
    if (!isAdmin) {
      btnAddAct.title = 'Administrator Privilege Required: Click to view details';
      btnAddAct.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i><span>+ Add Fixed Activity</span>';
    } else {
      btnAddAct.title = 'Add Fixed Candy Baseline Activity';
      btnAddAct.innerHTML = '<i data-lucide="plus-circle" class="w-4 h-4"></i><span>+ Add Fixed Activity</span>';
    }
  }
  if (btnAddAct2) {
    btnAddAct2.classList.remove('hidden');
    if (!isAdmin) {
      btnAddAct2.title = 'Administrator Privilege Required: Click to view details';
      btnAddAct2.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i><span>+ Add Fixed Activity</span>';
    } else {
      btnAddAct2.title = 'Add Fixed Candy Baseline Activity';
      btnAddAct2.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i><span>+ Add Fixed Activity</span>';
    }
  }
  if (btnDelPrj) {
    btnDelPrj.classList.remove('hidden');
  }
  if (btnMenuDelPrj) {
    btnMenuDelPrj.classList.remove('hidden');
  }
  if (lockedNotice) {
    if (isAdmin) lockedNotice.classList.add('hidden');
    else lockedNotice.classList.remove('hidden');
  }
  if (addUserSec) {
    if (isAdmin) addUserSec.classList.remove('hidden');
    else addUserSec.classList.add('hidden');
  }
  if (resetRatesBtn) {
    resetRatesBtn.onclick = () => {
      if (!isCurrentUserAdmin()) {
        showAccessDenied('reset Candy baseline resource rates');
      } else {
        resetSettingsToDefaults();
      }
    };
  }

  // Hourly rates inputs in settings modal
  document.querySelectorAll('.inp-set-labour, .inp-set-plant').forEach(inp => {
    inp.readOnly = !isAdmin;
    if (!isAdmin) {
      inp.classList.add('bg-slate-100', 'cursor-not-allowed');
      inp.onclick = () => showAccessDenied('modify standard Candy baseline hourly rates');
    } else {
      inp.classList.remove('bg-slate-100', 'cursor-not-allowed');
      inp.onclick = null;
    }
  });
}

// 3-DOT MASTER CONTROL MENU
function toggleTopControlMenu(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const menu = document.getElementById('menu-top-control');
  if (!menu) return;
  const isHidden = menu.style.display === 'none' || menu.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) {
    menu.style.display = 'block';
    menu.classList.remove('hidden');
  } else {
    menu.style.display = 'none';
    menu.classList.add('hidden');
  }
}

function closeTopControlMenu() {
  const menu = document.getElementById('menu-top-control');
  if (menu) {
    menu.style.display = 'none';
    menu.classList.add('hidden');
  }
}

// PROJECT DELETION & MANAGEMENT
function deleteCurrentProject() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete projects');
    return;
  }
  if (appState.projects.length <= 1) {
    alert('Cannot delete: At least one project must remain in the system. Create a new project before deleting this one.');
    return;
  }
  const prj = getCurrentProject();
  if (!prj) return;

  const confirmMsg = `Are you sure you want to permanently remove project:\n"${prj.name}" (${prj.code})?\n\nAll baseline activities and daily logs for this project will be deleted.`;
  if (confirm(confirmMsg)) {
    const deletedName = prj.name;
    appState.projects = appState.projects.filter(p => p.id !== prj.id);
    appState.currentProjectId = appState.projects[0].id;
    saveState();
    renderApp();
    showToast(`Project "${deletedName}" was permanently removed.`, 'error');
  }
}

function deleteProjectById(projectId) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete projects');
    return;
  }
  if (appState.projects.length <= 1) {
    alert('Cannot delete: At least one project must remain in the system.');
    return;
  }
  const prj = appState.projects.find(p => p.id === projectId);
  if (!prj) return;

  if (confirm(`Permanently delete project "${prj.name}" (${prj.code})?`)) {
    const deletedName = prj.name;
    appState.projects = appState.projects.filter(p => p.id !== projectId);
    if (appState.currentProjectId === projectId) {
      appState.currentProjectId = appState.projects[0].id;
    }
    saveState();
    renderApp();
    populateManageProjectsModal();
    showToast(`Removed project: ${deletedName}`, 'error');
  }
}

function openManageProjectsModal() {
  populateManageProjectsModal();
  showModal('modal-manage-projects');
}

function closeManageProjectsModal() {
  hideModal('modal-manage-projects');
}

function populateManageProjectsModal() {
  const tbody = document.getElementById('manage-projects-tbody');
  const countEl = document.getElementById('manage-proj-count');
  if (countEl) countEl.textContent = appState.projects.length;
  if (!tbody) return;
  tbody.innerHTML = '';

  const isAdmin = isCurrentUserAdmin();

  appState.projects.forEach(p => {
    const isActive = p.id === appState.currentProjectId;
    const actCount = p.fixedActivities?.length || 0;
    const logCount = p.dailyLogs?.length || 0;

    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-50 transition-colors ${isActive ? 'bg-sky-50/50' : ''}`;

    tr.innerHTML = `
      <td class="py-2.5 px-3 font-bold text-slate-900 font-mono-numbers">${p.code}</td>
      <td class="py-2.5 px-3 font-semibold text-slate-800">
        <div>${p.name}</div>
        <div class="text-[10px] text-slate-400 font-normal">${p.client || 'Client N/A'}</div>
      </td>
      <td class="py-2.5 px-2 text-center font-mono-numbers text-slate-700">${actCount}</td>
      <td class="py-2.5 px-2 text-center font-mono-numbers text-slate-700">${logCount}</td>
      <td class="py-2.5 px-3 text-center">
        ${isActive
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-100">Inactive</span>'
        }
      </td>
      <td class="py-2.5 px-3 text-center">
        <div class="flex items-center justify-center gap-1.5">
          ${!isActive
            ? `<button onclick="handleProjectChange('${p.id}'); closeManageProjectsModal();" class="px-2 py-1 text-[11px] font-bold text-sky-700 hover:text-white bg-sky-50 hover:bg-sky-600 rounded border border-sky-200 transition-colors cursor-pointer">
                Switch
              </button>`
            : `<span class="text-[11px] text-emerald-600 font-bold px-2 py-1">Current</span>`
          }
          ${isAdmin
            ? `<button onclick="deleteProjectById('${p.id}')" ${appState.projects.length <= 1 ? 'disabled title="Cannot delete the only project"' : 'title="Delete project"'} class="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer ${appState.projects.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>`
            : ''
          }
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

// USER LOGIN, AUTHENTICATION & CREDENTIALS MANAGEMENT

function checkAuthAndRoute() {
  const screenLogin = document.getElementById('screen-login');
  const screenApp = document.getElementById('screen-app');
  
  if (appState.isAuthenticated && appState.currentUser) {
    if (screenLogin) screenLogin.style.display = 'none';
    if (screenApp) screenApp.style.display = 'flex';
    renderApp();
  } else {
    if (screenApp) screenApp.style.display = 'none';
    if (screenLogin) screenLogin.style.display = 'flex';
  }
}

function renderLoginScreenCredentials() {
  const container = document.getElementById('login-screen-credentials-list');
  if (container) container.innerHTML = '';
}

function handleLoginScreenSubmit(e) {
  if (e) e.preventDefault();
  const userId = document.getElementById('inp-login-screen-user')?.value.trim();
  const pass = document.getElementById('inp-login-screen-pass')?.value;
  const errBox = document.getElementById('login-screen-error');
  const errTxt = document.getElementById('login-screen-error-text');

  if (!userId || !pass) {
    if (errBox) errBox.classList.remove('hidden');
    if (errTxt) errTxt.textContent = 'Please enter both User ID and Password.';
    return;
  }

  const ok = loginUser(userId, pass);
  if (!ok) {
    if (errBox) errBox.classList.remove('hidden');
    if (errTxt) errTxt.textContent = 'Invalid User ID or Password. Please check your credentials and try again.';
  } else {
    if (errBox) errBox.classList.add('hidden');
  }
}

function quickLogin(userId, password) {
  // Deprecated: fast-fill cards have been removed per security policy.
  showToast('Please type your User ID and Password to sign in.');
}

function loginUser(userId, password) {
  const user = (appState.users || []).find(u => u.id.toLowerCase() === userId.toLowerCase() && u.password === password);
  if (!user) {
    return false;
  }
  appState.currentUser = user;
  appState.isAuthenticated = true;
  saveState();
  closeLoginModal();
  checkAuthAndRoute();
  showToast(`Welcome, ${user.name}! Access granted as ${user.role === 'admin' ? 'Administrator' : 'Site User'}.`);
  return true;
}

function logoutUser() {
  appState.currentUser = null;
  appState.isAuthenticated = false;
  safeStorage.removeItem('candy_auth_user_id');
  const inpUser = document.getElementById('inp-login-screen-user');
  const inpPass = document.getElementById('inp-login-screen-pass');
  if (inpUser) inpUser.value = '';
  if (inpPass) inpPass.value = '';
  const errBox = document.getElementById('login-screen-error');
  if (errBox) errBox.classList.add('hidden');
  checkAuthAndRoute();
  showToast('Logged out of system. Please sign in to resume.');
}

function togglePasswordVisibility(inputId, btnId) {
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (btn) btn.textContent = 'Hide';
  } else {
    inp.type = 'password';
    if (btn) btn.textContent = 'Show';
  }
}

function openLoginModal() {
  const user = appState.currentUser || appState.users[0];
  const curUserEl = document.getElementById('login-modal-current-user');
  const curRoleEl = document.getElementById('login-modal-current-role');
  if (curUserEl) curUserEl.textContent = user.name || user.id;
  if (curRoleEl) {
    const isAdmin = user.role === 'admin';
    curRoleEl.className = `px-2 py-0.5 rounded text-[10px] font-extrabold ${isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} uppercase`;
    curRoleEl.textContent = isAdmin ? '👑 Admin' : '👷 Site User';
  }
  const inpUser = document.getElementById('inp-login-modal-user');
  const inpPass = document.getElementById('inp-login-modal-pass');
  if (inpUser) inpUser.value = '';
  if (inpPass) inpPass.value = '';
  showModal('modal-login');
}

function closeLoginModal() {
  hideModal('modal-login');
}

function handleLoginFormSubmit(e) {
  if (e) e.preventDefault();
  const userId = document.getElementById('inp-login-modal-user')?.value.trim();
  const pass = document.getElementById('inp-login-modal-pass')?.value;
  if (!userId || !pass) {
    alert('Please enter both User ID and Password.');
    return;
  }
  const ok = loginUser(userId, pass);
  if (!ok) {
    alert('Invalid User ID or Password.');
  }
}

function switchRoleQuick(role) {
  // Deprecated: fast role bypass disabled. User must authenticate via User ID & Password.
  showToast('Please enter your credentials to authenticate and switch accounts.');
}

// --- DEDICATED USER CREDENTIALS & PASSWORD MANAGEMENT MODAL ---

function openManageCredentialsModal() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('configure user accounts and passwords');
    return;
  }
  renderCredentialsModal();
  showModal('modal-manage-credentials');
}

function closeManageCredentialsModal() {
  hideModal('modal-manage-credentials');
}

function renderCredentialsModal() {
  const adminContainer = document.getElementById('cred-admins-container');
  const userContainer = document.getElementById('cred-users-container');
  if (!adminContainer || !userContainer) return;

  adminContainer.innerHTML = '';
  userContainer.innerHTML = '';

  const admins = (appState.users || []).filter(u => u.role === 'admin');
  const siteUsers = (appState.users || []).filter(u => u.role === 'user');

  admins.forEach((u, idx) => {
    adminContainer.appendChild(createCredentialCardElement('admin', idx + 1, u.id, u.name, u.password));
  });

  siteUsers.forEach((u, idx) => {
    userContainer.appendChild(createCredentialCardElement('user', idx + 1, u.id, u.name, u.password));
  });

  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function createCredentialCardElement(role, index, id = '', name = '', pass = '') {
  const div = document.createElement('div');
  const rowId = 'cred-row-' + Math.random().toString(36).substring(2, 9);
  div.id = rowId;
  div.className = `cred-edit-card p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${role === 'admin' ? 'bg-sky-50/50 border-sky-200' : 'bg-amber-50/50 border-amber-200'}`;
  div.dataset.role = role;

  const roleLabel = role === 'admin' ? `${index} Administrator` : `${index} Site User`;
  const roleBadge = role === 'admin' ? '👑 Admin' : '👷 User';

  div.innerHTML = `
    <div class="flex items-center gap-2 min-w-[140px]">
      <span class="text-xs font-bold ${role === 'admin' ? 'text-sky-900' : 'text-amber-900'}">${roleBadge}</span>
      <span class="text-[11px] text-slate-500 font-semibold">#${index}</span>
    </div>

    <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">User ID / Login *</label>
        <input type="text" value="${id}" class="inp-cred-id w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs font-bold" placeholder="e.g. ${role}1">
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Display Name *</label>
        <input type="text" value="${name || roleLabel}" class="inp-cred-name w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs font-medium" placeholder="e.g. ${roleLabel}">
      </div>
      <div>
        <div class="flex items-center justify-between mb-0.5">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password *</label>
          <button type="button" onclick="togglePasswordVisibility('${rowId}-pass', '${rowId}-toggle')" id="${rowId}-toggle" class="text-[10px] text-sky-600 hover:text-sky-700 font-bold cursor-pointer">Show</button>
        </div>
        <input type="password" id="${rowId}-pass" value="${pass}" class="inp-cred-pass w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs font-bold" placeholder="Password">
      </div>
    </div>

    <div class="flex items-center justify-end">
      <button type="button" onclick="deleteCredentialRow('${rowId}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete account">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  return div;
}

function addAdminCredentialRow() {
  const container = document.getElementById('cred-admins-container');
  if (!container) return;
  const count = container.querySelectorAll('.cred-edit-card').length + 1;
  const card = createCredentialCardElement('admin', count, `admin${count}`, `${count} Administrator`, `${count}3456788`);
  container.appendChild(card);
  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function addUserCredentialRow() {
  const container = document.getElementById('cred-users-container');
  if (!container) return;
  const count = container.querySelectorAll('.cred-edit-card').length + 1;
  const card = createCredentialCardElement('user', count, `user${count}`, `${count} Site User`, `${count}254`);
  container.appendChild(card);
  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function deleteCredentialRow(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const role = row.dataset.role;
  const container = row.parentElement;
  const allRowsOfRole = container.querySelectorAll('.cred-edit-card');

  if (role === 'admin' && allRowsOfRole.length <= 1) {
    alert('At least one Administrator account must always remain in the system.');
    return;
  }

  const idInp = row.querySelector('.inp-cred-id');
  const userId = idInp?.value.trim();

  if (userId && appState.currentUser?.id.toLowerCase() === userId.toLowerCase()) {
    alert('You cannot delete your own currently active account from here.');
    return;
  }

  row.remove();
}

function saveCredentialsFromModal() {
  const adminCards = document.querySelectorAll('#cred-admins-container .cred-edit-card');
  const userCards = document.querySelectorAll('#cred-users-container .cred-edit-card');

  if (adminCards.length === 0) {
    alert('At least one Administrator account is required.');
    return;
  }

  const updatedUsers = [];
  const seenIds = new Set();
  let hasError = false;

  const processCards = (cards, role) => {
    cards.forEach(card => {
      if (hasError) return;
      const id = card.querySelector('.inp-cred-id')?.value.trim();
      const name = card.querySelector('.inp-cred-name')?.value.trim();
      const password = card.querySelector('.inp-cred-pass')?.value.trim();

      if (!id || !name || !password) {
        alert('Please make sure all User ID, Name, and Password fields are filled in.');
        hasError = true;
        return;
      }

      const lowerId = id.toLowerCase();
      if (seenIds.has(lowerId)) {
        alert(`Duplicate User ID "${id}" detected. Each account must have a unique User ID.`);
        hasError = true;
        return;
      }
      seenIds.add(lowerId);

      updatedUsers.push({ id, name, password, role });
    });
  };

  processCards(adminCards, 'admin');
  if (hasError) return;
  processCards(userCards, 'user');
  if (hasError) return;

  appState.users = updatedUsers;

  // Refresh current user reference if active ID still exists, else switch to first admin
  if (appState.currentUser) {
    const updatedSelf = appState.users.find(u => u.id.toLowerCase() === appState.currentUser.id.toLowerCase());
    if (updatedSelf) {
      appState.currentUser = updatedSelf;
    } else {
      appState.currentUser = appState.users[0];
    }
  } else {
    appState.currentUser = appState.users[0];
  }

  saveState();
  renderLoginScreenCredentials();
  populateUserManagementTable();
  renderApp();
  closeManageCredentialsModal();
  showToast(`✓ Credentials and passwords saved! (${updatedUsers.length} total accounts active)`);
}

function handleAddNewUserFormSubmit(e) {
  if (e) e.preventDefault();
  if (!isCurrentUserAdmin()) {
    showAccessDenied('create new user credentials');
    return;
  }
  const id = document.getElementById('inp-new-user-id')?.value.trim().toLowerCase();
  const name = document.getElementById('inp-new-user-name')?.value.trim();
  const password = document.getElementById('inp-new-user-pass')?.value.trim();
  const role = document.getElementById('inp-new-user-role')?.value;

  if (!id || !name || !password) {
    alert('Please fill out all user credential fields.');
    return;
  }
  if (appState.users.some(u => u.id.toLowerCase() === id.toLowerCase())) {
    alert(`A user with ID "${id}" already exists. Please pick a unique User ID.`);
    return;
  }

  const newUser = { id, name, password, role };
  appState.users.push(newUser);
  saveState();
  populateUserManagementTable();
  renderLoginScreenCredentials();

  // Reset form
  const idInp = document.getElementById('inp-new-user-id');
  const nameInp = document.getElementById('inp-new-user-name');
  const passInp = document.getElementById('inp-new-user-pass');
  if (idInp) idInp.value = '';
  if (nameInp) nameInp.value = '';
  if (passInp) passInp.value = '';

  showToast(`Added new ${role === 'admin' ? 'Administrator' : 'Site User'} account: ${name}`);
}

function deleteUserAccount(userId) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete user accounts');
    return;
  }
  const admins = (appState.users || []).filter(u => u.role === 'admin');
  const isTargetAdmin = admins.some(a => a.id.toLowerCase() === userId.toLowerCase());
  if (isTargetAdmin && admins.length <= 1) {
    alert('The only remaining Administrator account cannot be deleted.');
    return;
  }
  if (appState.currentUser?.id === userId) {
    alert('You cannot delete your own currently active account.');
    return;
  }
  if (confirm(`Delete user account "${userId}"?`)) {
    appState.users = appState.users.filter(u => u.id !== userId);
    saveState();
    populateUserManagementTable();
    renderLoginScreenCredentials();
    showToast(`User account "${userId}" removed.`);
  }
}

function populateUserManagementTable() {
  const tbody = document.getElementById('settings-users-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const activeUser = appState.currentUser || appState.users[0];
  const isAdmin = isCurrentUserAdmin();

  appState.users.forEach(u => {
    const isSelf = activeUser && u.id === activeUser.id;
    const isUserAdmin = u.role === 'admin';

    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-50 transition-colors ${isSelf ? 'bg-sky-50/50' : ''}`;

    tr.innerHTML = `
      <td class="py-2.5 px-3 font-mono text-slate-900 font-bold">${u.id}</td>
      <td class="py-2.5 px-3 font-semibold text-slate-800">
        <div>${u.name}</div>
        <div class="text-[10px] text-slate-500 font-mono">Password: <span class="bg-slate-100 px-1 py-0.5 rounded font-bold">${u.password}</span></div>
      </td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${isUserAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} uppercase">
          ${isUserAdmin ? '👑 Administrator' : '👷 Site User'}
        </span>
      </td>
      <td class="py-2.5 px-3 text-slate-600 text-[11px]">
        ${isUserAdmin ? 'Full Access: baselines, all dates, rate modifications' : 'Restricted: today’s logs only, no baseline edits/deletes'}
      </td>
      <td class="py-2.5 px-3 text-center">
        ${isSelf
          ? '<span class="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">Active</span>'
          : (isAdmin
              ? `<button onclick="deleteUserAccount('${u.id}')" class="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer" title="Delete account">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>`
              : '<span class="text-slate-300 text-[10px]">-</span>'
            )
        }
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

// BACKUP & RESTORE
function exportBackupJSON() {
  const backup = {
    version: '2.5',
    exportDate: new Date().toISOString(),
    projects: appState.projects,
    currentProjectId: appState.currentProjectId,
    users: appState.users,
    divisions: getActiveDivisions(),
    mainActivities: getActiveMainActivities(),
    labourTrades: getActiveLabourTrades(),
    plantEquipment: getActivePlantEquipment(),
    units: getActiveUnits(),
    dashboardCustomization: getActiveDashboardCustomization(),
    auditTrail: appState.auditTrail || []
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const filename = `CandyEstimator_Backup_${getTodayDate()}.json`;
  triggerBlobDownload(blob, filename);
  logAuditAction('EXPORT', 'Full Backup', `Downloaded complete system backup: ${filename} (including audit trail)`);
  showToast(`Full database & audit trail backup downloaded: ${filename}`);
}

function handleBackupFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  importBackupJSON(file);
  event.target.value = '';
}

function importBackupJSON(file) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('restore or import backups');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error('Invalid file format: projects array not found.');
      }
      appState.projects = data.projects;
      if (data.currentProjectId) appState.currentProjectId = data.currentProjectId;
      if (Array.isArray(data.users) && data.users.length > 0) appState.users = data.users;
      if (Array.isArray(data.divisions) && data.divisions.length > 0) appState.divisions = data.divisions;
      if (Array.isArray(data.mainActivities) && data.mainActivities.length > 0) appState.mainActivities = data.mainActivities;
      if (Array.isArray(data.labourTrades) && data.labourTrades.length > 0) appState.labourTrades = data.labourTrades;
      if (Array.isArray(data.plantEquipment) && data.plantEquipment.length > 0) appState.plantEquipment = data.plantEquipment;
      if (Array.isArray(data.units) && data.units.length > 0) appState.units = data.units;
      if (data.dashboardCustomization) appState.dashboardCustomization = data.dashboardCustomization;
      if (Array.isArray(data.auditTrail)) appState.auditTrail = data.auditTrail;

      saveState();
      applyDashboardCustomization();
      renderApp();
      logAuditAction('IMPORT', 'Full Backup', `Restored system state from backup file: ${file.name}`);
      showToast('Project database & audit trail restored successfully!');
    } catch (err) {
      alert('Failed to import backup: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// --- 4. UI RENDER ENGINE ---

function renderApp() {
  applyDashboardCustomization();
  updateProjectSelector();
  applyRolePermissions();
  updateTopRibbonAndKPIs();
  renderSmartSolutionsBanner();
  renderFixedActivitiesTable();
  renderDailyLogsTable();
  renderMatrixTable();
  renderCharts();
  if (window.lucide) lucide.createIcons();
}

function updateProjectSelector() {
  const sel = document.getElementById('project-selector');
  if (sel) {
    sel.innerHTML = '';
    appState.projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.code} - ${p.name}`;
      if (p.id === appState.currentProjectId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  // Populate Custom Searchable Top Project Dropdown with Search Box
  const optionsContainer = document.getElementById('options-top-projects');
  const label = document.getElementById('label-top-project');
  const activePrj = getCurrentProject();

  if (label && activePrj) {
    label.textContent = `${activePrj.code} - ${activePrj.name}`;
  }

  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    appState.projects.forEach(p => {
      const isSel = p.id === appState.currentProjectId;
      const div = document.createElement('div');
      div.className = `dropdown-item p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer ${isSel ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200' : 'hover:bg-slate-50 text-slate-800'}`;
      div.dataset.search = `${p.code} ${p.name} ${p.client || ''}`.toLowerCase();
      div.onclick = () => {
        closeAllDropdowns();
        handleProjectChange(p.id);
      };
      div.innerHTML = `
        <div class="flex flex-col truncate pr-2">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-bold text-sky-700">${p.code}</span>
            <span class="text-[10px] text-slate-400 font-normal truncate">${p.client || 'Client'}</span>
          </div>
          <span class="truncate text-slate-800 font-medium">${p.name}</span>
        </div>
        ${isSel ? '<i data-lucide="check" class="w-4 h-4 text-sky-600 shrink-0"></i>' : ''}
      `;
      optionsContainer.appendChild(div);
    });
  }
}

// --- DASHBOARD DATE CONTROLS & FILTERING ENGINE ---

function handleDashboardDateChange(date) {
  if (!date || date === 'ALL' || date.trim() === '') {
    appState.dashboardFilterDate = 'ALL';
  } else {
    appState.dashboardFilterDate = date.trim();
  }
  updateTopRibbonAndKPIs();
  renderSmartSolutionsBanner();
  renderCharts();
}

function setDashboardDateFilter(preset) {
  const prj = getCurrentProject();
  if (preset === 'ALL') {
    appState.dashboardFilterDate = 'ALL';
  } else if (preset === 'TODAY') {
    appState.dashboardFilterDate = getTodayDate();
  } else if (preset === 'LATEST') {
    if (prj && prj.dailyLogs && prj.dailyLogs.length > 0) {
      const sorted = [...prj.dailyLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
      appState.dashboardFilterDate = sorted[0].date;
    } else {
      appState.dashboardFilterDate = getTodayDate();
    }
  }
  updateTopRibbonAndKPIs();
  renderSmartSolutionsBanner();
  renderCharts();
}

function navigateDashboardDate(direction) {
  const prj = getCurrentProject();
  if (!prj || !prj.dailyLogs || prj.dailyLogs.length === 0) return;
  const uniqueDates = Array.from(new Set(prj.dailyLogs.map(l => l.date))).sort((a, b) => new Date(b.date) - new Date(a.date));
  if (uniqueDates.length === 0) return;

  let currentIndex = uniqueDates.indexOf(appState.dashboardFilterDate);
  if (currentIndex === -1) {
    appState.dashboardFilterDate = direction > 0 ? uniqueDates[0] : uniqueDates[uniqueDates.length - 1];
  } else {
    // direction > 0: newer date (-1 index), direction < 0: older date (+1 index)
    let newIndex = currentIndex - direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= uniqueDates.length) newIndex = uniqueDates.length - 1;
    appState.dashboardFilterDate = uniqueDates[newIndex];
  }
  updateTopRibbonAndKPIs();
  renderSmartSolutionsBanner();
  renderCharts();
}

function setDashboardDisplayMode(mode) {
  if (mode !== 'both' && mode !== 'date' && mode !== 'overall') mode = 'both';
  appState.dashboardDisplayMode = mode;
  applyDashboardDisplayModeStyles();
}

function applyDashboardDisplayModeStyles() {
  const mode = appState.dashboardDisplayMode || 'both';
  const datePanel = document.getElementById('dashboard-date-results-panel');
  const overallPanel = document.getElementById('dashboard-overall-results-panel');
  const btnBoth = document.getElementById('btn-dash-view-both');
  const btnDate = document.getElementById('btn-dash-view-date');
  const btnOverall = document.getElementById('btn-dash-view-overall');

  if (btnBoth) {
    btnBoth.className = mode === 'both' ? 'px-2.5 py-1 rounded-md bg-white text-slate-900 shadow-2xs font-bold cursor-pointer' : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
  }
  if (btnDate) {
    btnDate.className = mode === 'date' ? 'px-2.5 py-1 rounded-md bg-white text-slate-900 shadow-2xs font-bold cursor-pointer' : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
  }
  if (btnOverall) {
    btnOverall.className = mode === 'overall' ? 'px-2.5 py-1 rounded-md bg-white text-slate-900 shadow-2xs font-bold cursor-pointer' : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
  }

  if (datePanel) {
    datePanel.style.display = (mode === 'overall') ? 'none' : 'flex';
  }
  if (overallPanel) {
    overallPanel.style.display = (mode === 'date') ? 'none' : 'flex';
  }
}

function openDailyModalWithDate(date) {
  openDailyModal();
  if (date && date !== 'ALL') {
    setTimeout(() => {
      const dateInp = document.getElementById('inp-daily-date') || document.getElementById('daily-date');
      if (dateInp) {
        dateInp.value = date;
        triggerDailyModalCalculation();
      }
    }, 50);
  }
}

function populateDashboardLogDatesSelect(uniqueDates, activeDate) {
  const select = document.getElementById('dashboard-log-dates-select');
  if (!select) return;
  const prj = getCurrentProject();
  if (!prj) return;

  const currentVal = activeDate || appState.dashboardFilterDate || 'ALL';
  let html = `<option value="ALL" ${currentVal === 'ALL' ? 'selected' : ''}>-- All Dates (Overall) --</option>`;

  uniqueDates.forEach(d => {
    const count = (prj.dailyLogs || []).filter(l => l.date === d).length;
    const isSel = currentVal === d ? 'selected' : '';
    html += `<option value="${d}" ${isSel}>${d} (${count} log${count > 1 ? 's' : ''})</option>`;
  });

  select.innerHTML = html;
}

// --- MAIN DASHBOARD CALCULATION & RENDERING ---

function updateTopRibbonAndKPIs() {
  const prj = getCurrentProject();
  if (!prj) return;

  const allLogs = prj.dailyLogs || [];
  const uniqueDates = Array.from(new Set(allLogs.map(l => l.date))).sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestDate = uniqueDates.length > 0 ? uniqueDates[0] : getTodayDate();
  const isAllDates = !appState.dashboardFilterDate || appState.dashboardFilterDate === 'ALL';
  const selectedDate = isAllDates ? latestDate : appState.dashboardFilterDate;

  // 1. Populate Date Selector Controls
  populateDashboardLogDatesSelect(uniqueDates, appState.dashboardFilterDate);
  applyDashboardDisplayModeStyles();

  const datePicker = document.getElementById('dashboard-date-picker');
  if (datePicker) {
    datePicker.value = isAllDates ? '' : selectedDate;
  }

  const activeDateBadge = document.getElementById('dashboard-active-date-badge');
  if (activeDateBadge) {
    if (isAllDates) {
      activeDateBadge.textContent = `Viewing: Overall Project (All Dates)`;
      activeDateBadge.className = 'text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full inline-block border border-sky-200/60 font-mono-numbers';
    } else {
      const logsCountForDate = allLogs.filter(l => l.date === selectedDate).length;
      activeDateBadge.textContent = `Viewing Date: ${selectedDate} (${logsCountForDate} log${logsCountForDate === 1 ? '' : 's'})`;
      activeDateBadge.className = 'text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block border border-amber-300 font-mono-numbers';
    }
  }

  // Update preset buttons styling
  const btnAll = document.getElementById('btn-dash-date-all');
  const btnToday = document.getElementById('btn-dash-date-today');
  const btnLatest = document.getElementById('btn-dash-date-latest');
  const todayStr = getTodayDate();

  if (btnAll) {
    btnAll.className = isAllDates
      ? 'px-3 py-1.5 text-xs font-bold rounded-lg border border-sky-600 bg-sky-600 text-white shadow-xs cursor-pointer'
      : 'px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer';
  }
  if (btnToday) {
    btnToday.className = (!isAllDates && selectedDate === todayStr)
      ? 'px-3 py-1.5 text-xs font-bold rounded-lg border border-sky-600 bg-sky-600 text-white shadow-xs cursor-pointer'
      : 'px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer';
  }
  if (btnLatest) {
    btnLatest.className = (!isAllDates && selectedDate === latestDate && latestDate !== todayStr)
      ? 'px-3 py-1.5 text-xs font-bold rounded-lg border border-sky-600 bg-sky-600 text-white shadow-xs cursor-pointer'
      : 'px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer';
  }

  // ========================================================
  // PART A: CHOSEN DATE METRICS & ACTIVITIES TABLE
  // ========================================================
  const dateHeadingLabel = document.getElementById('dash-date-heading-label');
  const dateEntriesBadge = document.getElementById('dash-date-entries-badge');
  const dateTableTitle = document.getElementById('dash-date-table-title');
  const dateTableBadge = document.getElementById('dash-date-table-badge');

  if (dateHeadingLabel) dateHeadingLabel.textContent = selectedDate;
  if (dateTableTitle) dateTableTitle.textContent = selectedDate;

  const dateLogs = allLogs.filter(l => l.date === selectedDate);
  if (dateEntriesBadge) {
    dateEntriesBadge.textContent = `${dateLogs.length} Logged Activit${dateLogs.length === 1 ? 'y' : 'ies'}`;
  }
  if (dateTableBadge) {
    dateTableBadge.textContent = `${dateLogs.length} Record${dateLogs.length === 1 ? '' : 's'}`;
  }

  let dateEarned = 0;
  let dateActualCost = 0;
  let dateLabourCost = 0;
  let datePlantCost = 0;
  let dateTotalOutputQty = 0;

  dateLogs.forEach(l => {
    const act = (prj.fixedActivities || []).find(a => a.id === l.activityId);
    const c = calculateDailyLog(l, act, prj);
    dateEarned += c.earnedBudget;
    dateActualCost += c.actualCost;
    dateLabourCost += c.actualLabourCost;
    datePlantCost += c.actualPlantCost;
    dateTotalOutputQty += c.actualQty;
  });

  const dateProfitLoss = dateEarned - dateActualCost;
  const dateProfitLossPercent = dateEarned > 0 ? (dateProfitLoss / dateEarned) * 100 : 0;
  const datePI = dateActualCost > 0 ? (dateEarned / dateActualCost) : (dateEarned > 0 ? 1.0 : 0);

  // Populate Date KPI 1: Profit / Loss
  const datePnlAmount = document.getElementById('date-kpi-pnl-amount');
  const datePnlPercent = document.getElementById('date-kpi-pnl-percentage');
  const datePnlIcon = document.getElementById('date-kpi-pnl-icon');

  if (datePnlAmount) {
    datePnlAmount.textContent = `${dateProfitLoss >= 0 ? '+' : ''}${formatAED(dateProfitLoss)}`;
    datePnlAmount.className = `text-2xl font-extrabold font-mono-numbers ${dateProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
  }
  if (datePnlPercent) {
    datePnlPercent.textContent = `${dateProfitLoss >= 0 ? '+' : ''}${formatNum(dateProfitLossPercent, 1)}%`;
    datePnlPercent.className = `text-sm font-bold font-mono-numbers px-2 py-0.5 rounded-full ${dateProfitLoss >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`;
  }
  if (datePnlIcon) {
    if (dateProfitLoss >= 0) {
      datePnlIcon.className = 'w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0';
      datePnlIcon.innerHTML = '<i data-lucide="trending-up" class="w-7 h-7"></i>';
    } else {
      datePnlIcon.className = 'w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 animate-alert-pulse';
      datePnlIcon.innerHTML = '<i data-lucide="trending-down" class="w-7 h-7"></i>';
    }
  }

  // Populate Date KPI 2: Productivity Index
  const datePiVal = document.getElementById('date-kpi-productivity-index');
  const datePiLabel = document.getElementById('date-kpi-productivity-label');
  if (datePiVal) datePiVal.textContent = formatNum(datePI, 2);

  if (datePiLabel) {
    if (dateLogs.length === 0) {
      datePiLabel.textContent = 'No Shift Output';
      datePiLabel.className = 'text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full';
    } else if (datePI >= 1.05) {
      datePiLabel.textContent = 'High Efficiency';
      datePiLabel.className = 'text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full';
    } else if (datePI >= 0.95) {
      datePiLabel.textContent = 'On Target';
      datePiLabel.className = 'text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full';
    } else {
      datePiLabel.textContent = 'Sub-Optimal Loss';
      datePiLabel.className = 'text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full';
    }
  }

  // Populate Date KPI 3: Output Quantity
  const dateOutputQtyEl = document.getElementById('date-kpi-output-qty');
  const dateActivitiesCountEl = document.getElementById('date-kpi-activities-count');
  if (dateOutputQtyEl) dateOutputQtyEl.textContent = `${formatNum(dateTotalOutputQty, 0)} Units`;
  if (dateActivitiesCountEl) dateActivitiesCountEl.textContent = `${dateLogs.length} Activit${dateLogs.length === 1 ? 'y' : 'ies'} Logged`;

  // Populate Date KPI 4: Expenditure & Split
  const dateCostAmountEl = document.getElementById('date-kpi-cost-amount');
  const dateEarnedAmountEl = document.getElementById('date-kpi-earned-amount');
  const dateCostSplitEl = document.getElementById('date-kpi-cost-split');

  if (dateCostAmountEl) dateCostAmountEl.textContent = formatAED(dateActualCost);
  if (dateEarnedAmountEl) dateEarnedAmountEl.textContent = `Earned: ${formatAED(dateEarned)}`;
  if (dateCostSplitEl) dateCostSplitEl.textContent = `Labour: ${formatAED(dateLabourCost)} | Plant: ${formatAED(datePlantCost)}`;

  // Populate Date Activities Table Body
  const dateTbody = document.getElementById('dashboard-date-activities-tbody');
  if (dateTbody) {
    if (dateLogs.length === 0) {
      dateTbody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center py-8 text-slate-500 font-sans">
            <p class="font-medium text-xs text-slate-600 mb-2">No site activities recorded on <strong>${selectedDate}</strong>.</p>
            <button type="button" onclick="openDailyModalWithDate('${selectedDate}')" class="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>+ Record First Daily Log for ${selectedDate}</span>
            </button>
          </td>
        </tr>
      `;
    } else {
      let tRows = '';
      dateLogs.forEach((log, idx) => {
        const act = (prj.fixedActivities || []).find(a => a.id === log.activityId);
        const c = calculateDailyLog(log, act, prj);
        const pSign = c.profitLossAED >= 0 ? '+' : '';
        const pColor = c.profitLossAED >= 0 ? 'text-emerald-700' : 'text-rose-600 font-bold';

        tRows += `
          <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
            <td class="py-2.5 px-3 text-slate-400 text-center">${idx + 1}</td>
            <td class="py-2.5 px-3 font-bold text-slate-900">${act ? act.code : 'N/A'}</td>
            <td class="py-2.5 px-2 text-center">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${act && act.division === 'SL' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">${act ? act.division : '--'}</span>
            </td>
            <td class="py-2.5 px-4 font-sans text-slate-800 max-w-xs truncate" title="${act ? act.subActivity : 'Unknown'}">
              ${act ? act.subActivity : 'Unknown Activity'}
            </td>
            <td class="py-2.5 px-3 text-right font-bold text-slate-900">${formatNum(c.actualQty, 0)} ${act ? act.unit : ''}</td>
            <td class="py-2.5 px-3 text-right font-medium text-slate-800">${formatAED(c.actualCost)}</td>
            <td class="py-2.5 px-3 text-right text-slate-600">${formatAED(c.budgetUnitRate)}</td>
            <td class="py-2.5 px-3 text-right font-bold text-sky-800">${formatAED(c.earnedBudget)}</td>
            <td class="py-2.5 px-3 text-right font-extrabold ${pColor}">${pSign}${formatAED(c.profitLossAED)}</td>
            <td class="py-2.5 px-3 text-center">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${c.profitLossAED >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                ${pSign}${formatNum(c.profitLossPercent, 1)}%
              </span>
            </td>
            <td class="py-2.5 px-3 text-center font-bold ${c.productivityIndex >= 1.0 ? 'text-emerald-700' : 'text-rose-600'}">
              ${formatNum(c.productivityIndex, 2)}
            </td>
            <td class="py-2.5 px-3 text-center">
              <div class="flex items-center justify-center gap-1.5">
                ${c.isLoss ? `<button onclick="openSolutionModal('${log.id}')" class="px-2 py-0.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded shadow-xs cursor-pointer">Solution</button>` : `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">Target</span>`}
                <button onclick="editDailyLog('${log.id}', event)" class="p-1 text-slate-400 hover:text-sky-600 rounded cursor-pointer" title="Edit Log">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      dateTbody.innerHTML = tRows;
    }
  }

  // ========================================================
  // PART B: OVERALL PROJECT PERFORMANCE & CONTRACT TOTALS
  // ========================================================
  let totalBOQBudget = 0;
  let totalEarnedValue = 0;
  let totalActualCost = 0;
  let totalPlannedQty = 0;
  let totalCompletedQty = 0;

  prj.fixedActivities.forEach(act => {
    const calc = calculateFixedActivity(act, prj);
    totalBOQBudget += calc.totalBudgetAmount;
    totalEarnedValue += calc.earnedBudgetToDate;
    totalActualCost += calc.totalActualSpend;
    totalPlannedQty += parseFloat(act.totalQty) || 0;
    totalCompletedQty += calc.totalDoneQty;
  });

  const netProfitLoss = totalEarnedValue - totalActualCost;
  const netProfitLossPercent = totalEarnedValue > 0 ? (netProfitLoss / totalEarnedValue) * 100 : 0;
  const overallProductivityIndex = totalActualCost > 0 ? (totalEarnedValue / totalActualCost) : 1.0;
  const overallPercentDone = totalPlannedQty > 0 ? (totalCompletedQty / totalPlannedQty) * 100 : 0;

  const setElText = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  // Overall Contract Banner Headers
  setElText('dash-overall-header-budget', formatAED(totalBOQBudget));
  setElText('dash-overall-header-earned', formatAED(totalEarnedValue));
  setElText('dash-overall-header-spent', formatAED(totalActualCost));

  // Top Ribbon Summary
  setElText('ribbon-total-budget', formatAED(totalBOQBudget));
  setElText('ribbon-earned-value', formatAED(totalEarnedValue));
  setElText('ribbon-actual-cost', formatAED(totalActualCost));

  const ribbonPnl = document.getElementById('ribbon-profit-loss');
  if (ribbonPnl) {
    ribbonPnl.textContent = `${netProfitLoss >= 0 ? '+' : ''}${formatAED(netProfitLoss)} (${formatNum(netProfitLossPercent, 1)}%)`;
    ribbonPnl.className = `text-sm font-extrabold ${netProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
  }

  setElText('badge-fixed-count', prj.fixedActivities.length);
  setElText('badge-daily-count', prj.dailyLogs.length);

  // Overall KPI 1: Profit / Loss
  const kpiPnlAmount = document.getElementById('kpi-pnl-amount');
  const kpiPnlPercent = document.getElementById('kpi-pnl-percentage');
  const kpiPnlIcon = document.getElementById('kpi-pnl-icon');

  if (kpiPnlAmount) kpiPnlAmount.textContent = `${netProfitLoss >= 0 ? '+' : ''}${formatAED(netProfitLoss)}`;
  if (kpiPnlPercent) kpiPnlPercent.textContent = `${netProfitLoss >= 0 ? '+' : ''}${formatNum(netProfitLossPercent, 1)}%`;

  if (kpiPnlAmount && kpiPnlPercent && kpiPnlIcon) {
    if (netProfitLoss >= 0) {
      kpiPnlAmount.className = 'text-2xl font-extrabold text-emerald-600 font-mono-numbers';
      kpiPnlPercent.className = 'text-sm font-bold text-emerald-700 font-mono-numbers bg-emerald-100 px-2 py-0.5 rounded-full';
      kpiPnlIcon.className = 'w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0';
      kpiPnlIcon.innerHTML = '<i data-lucide="trending-up" class="w-7 h-7"></i>';
    } else {
      kpiPnlAmount.className = 'text-2xl font-extrabold text-rose-600 font-mono-numbers';
      kpiPnlPercent.className = 'text-sm font-bold text-rose-700 font-mono-numbers bg-rose-100 px-2 py-0.5 rounded-full';
      kpiPnlIcon.className = 'w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 animate-alert-pulse';
      kpiPnlIcon.innerHTML = '<i data-lucide="trending-down" class="w-7 h-7"></i>';
    }
  }

  // Overall KPI 2: Site Productivity Index
  const kpiPi = document.getElementById('kpi-productivity-index');
  const kpiPiLabel = document.getElementById('kpi-productivity-label');
  if (kpiPi) kpiPi.textContent = formatNum(overallProductivityIndex, 2);

  if (kpiPiLabel) {
    if (overallProductivityIndex >= 1.05) {
      kpiPiLabel.textContent = 'High Efficiency';
      kpiPiLabel.className = 'text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full';
    } else if (overallProductivityIndex >= 0.95) {
      kpiPiLabel.textContent = 'On Target';
      kpiPiLabel.className = 'text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full';
    } else {
      kpiPiLabel.textContent = 'Sub-Optimal';
      kpiPiLabel.className = 'text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full';
    }
  }

  // Overall KPI 3: Physical Work Completed
  setElText('kpi-progress-percent', `${formatNum(overallPercentDone, 1)}%`);
  setElText('kpi-progress-ratio', `${formatNum(totalCompletedQty, 0)} / ${formatNum(totalPlannedQty, 0)}`);
  const kpiProgressBar = document.getElementById('kpi-progress-bar');
  if (kpiProgressBar) kpiProgressBar.style.width = `${Math.min(100, overallPercentDone)}%`;

  // Overall KPI 4: Total Spend vs Today / Shift
  const todayLogs = allLogs.filter(l => l.date === todayStr);
  let todayCost = 0;
  let todayEarned = 0;
  todayLogs.forEach(l => {
    const c = calculateDailyLog(l, null, prj);
    todayCost += c.actualCost;
    todayEarned += c.earnedBudget;
  });
  const todayPnl = todayEarned - todayCost;

  setElText('kpi-today-cost', formatAED(todayCost));
  const kpiTodayPnl = document.getElementById('kpi-today-pnl');
  if (kpiTodayPnl) {
    kpiTodayPnl.textContent = `${todayPnl >= 0 ? '+' : ''}${formatAED(todayPnl)}`;
    kpiTodayPnl.className = `text-xs font-bold font-mono-numbers ${todayPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`;
  }

  if (window.lucide) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function renderSmartSolutionsBanner() {
  const container = document.getElementById('solutions-container');
  if (!container) return;
  container.innerHTML = '';
  const prj = getCurrentProject();
  if (!prj) return;

  const allLossLogs = [];
  (prj.dailyLogs || []).forEach(l => {
    const act = (prj.fixedActivities || []).find(a => a.id === l.activityId);
    if (!act) return;
    const calc = calculateDailyLog(l, act, prj);
    if (calc.isLoss) {
      allLossLogs.push({ log: l, activity: act, calc });
    }
  });

  const isDateFiltered = appState.dashboardFilterDate && appState.dashboardFilterDate !== 'ALL';
  const targetDate = isDateFiltered ? appState.dashboardFilterDate : null;

  const dateLossLogs = isDateFiltered ? allLossLogs.filter(item => item.log.date === targetDate) : [];
  const displayLogs = isDateFiltered ? dateLossLogs : allLossLogs;

  if (isDateFiltered && dateLossLogs.length === 0) {
    container.innerHTML = `
      <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <i data-lucide="check-circle-2" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-emerald-900">All Site Activities on ${targetDate} Operating at Target Productivity</h4>
            <p class="text-xs text-emerald-700">Zero losses recorded on this date. All work-out outputs matched or beat Candy budget norms.</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${allLossLogs.length > 0 ? `<button type="button" onclick="setDashboardDateFilter('ALL')" class="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs cursor-pointer">View Overall Project Losses (${allLossLogs.length})</button>` : '<span class="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200">Optimal Performance</span>'}
        </div>
      </div>
    `;
    if (window.lucide) { try { lucide.createIcons(); } catch (e) {} }
    return;
  }

  if (displayLogs.length === 0) {
    container.innerHTML = `
      <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <i data-lucide="check-circle-2" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-emerald-900">All Site Activities Operating at or Above Target Productivity</h4>
            <p class="text-xs text-emerald-700">No loss thresholds breached. Resource consumption matches or beats Candy budget norms across the project.</p>
          </div>
        </div>
        <span class="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200">Optimal Performance</span>
      </div>
    `;
    if (window.lucide) { try { lucide.createIcons(); } catch (e) {} }
    return;
  }

  displayLogs.sort((a, b) => a.calc.profitLossAED - b.calc.profitLossAED);

  const banner = document.createElement('div');
  banner.className = 'bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm';

  let alertListHtml = '';
  displayLogs.slice(0, 4).forEach(item => {
    alertListHtml += `
      <div class="bg-white p-3.5 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded font-mono-numbers">${item.log.date}</span>
            <span class="font-bold text-slate-900 text-xs">${item.activity.code} - ${item.activity.subActivity}</span>
          </div>
          <p class="text-xs text-rose-700 mt-1">
            Output: <span class="font-bold font-mono-numbers">${formatNum(item.calc.actualQty, 0)} ${item.activity.unit}</span> |
            Daily Loss: <span class="font-extrabold font-mono-numbers text-rose-700">${formatAED(item.calc.profitLossAED)} (${formatNum(item.calc.profitLossPercent, 1)}%)</span> |
            Productivity: <span class="font-bold font-mono-numbers">${formatNum(item.calc.productivityIndex, 2)}</span>
          </p>
        </div>
        <button onclick="openSolutionModal('${item.log.id}')" class="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer">
          <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i>
          <span>View Engineering Solution</span>
        </button>
      </div>
    `;
  });

  const headerTitle = isDateFiltered
    ? `Productivity Diagnostic Alert for ${targetDate} (${dateLossLogs.length} Loss Event${dateLossLogs.length > 1 ? 's' : ''} on this Date)`
    : `Productivity Diagnostic Alert (${allLossLogs.length} Site Loss Event${allLossLogs.length > 1 ? 's' : ''} Detected)`;

  banner.innerHTML = `
    <div class="flex items-center justify-between border-b border-rose-200/80 pb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
          <i data-lucide="alert-triangle" class="w-5 h-5"></i>
        </div>
        <div>
          <h4 class="text-sm font-bold text-rose-950 flex items-center gap-2">
            <span>${headerTitle}</span>
            <span class="px-2 py-0.5 text-[10px] font-bold bg-rose-200 text-rose-900 rounded-full animate-alert-pulse">Action Required</span>
          </h4>
          <p class="text-xs text-rose-800">Actual unit costs exceeded standard Candy budget. Review specific engineering solutions below to restore profit margin.</p>
        </div>
      </div>
    </div>

    <div class="space-y-2.5">
      ${alertListHtml}
    </div>
  `;

  container.appendChild(banner);
  if (window.lucide) { try { lucide.createIcons(); } catch (e) {} }
}

// Toggle expansion of an activity's daily logs
function toggleActivityExpand(actId, e) {
  if (e) e.stopPropagation();
  if (appState.expandedActivityIds.has(actId)) {
    appState.expandedActivityIds.delete(actId);
  } else {
    appState.expandedActivityIds.add(actId);
  }
  renderFixedActivitiesTable();
  if (window.lucide) lucide.createIcons();
}

// RENDER TAB 2: FIXED ACTIVITY BUDGETS TABLE WITH DAILY LOGS ACCORDION
function renderFixedActivitiesTable() {
  const tbody = document.getElementById('fixed-activities-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const prj = getCurrentProject();
  if (!prj) return;
  const isAdmin = isCurrentUserAdmin();
  const today = getTodayDate();

  const query = appState.searchFixedQuery.toLowerCase().trim();
  const list = (prj.fixedActivities || []).filter(a => {
    if (!query) return true;
    return (
      (a.code && a.code.toLowerCase().includes(query)) ||
      (a.subActivity && a.subActivity.toLowerCase().includes(query)) ||
      (a.zone && a.zone.toLowerCase().includes(query))
    );
  });

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" class="text-center py-8 text-slate-400 font-sans">No fixed activities found. Click "+ Add Fixed Activity" to add one.</td></tr>`;
    return;
  }

  const groups = {};
  list.forEach(item => {
    const rawMCode = (item.mainActivityCode || '').trim();
    const isStandalone = !rawMCode || rawMCode.toUpperCase() === 'NONE' || rawMCode === '-';
    const mCode = isStandalone ? '__STANDALONE__' : rawMCode;
    if (!groups[mCode]) {
      const mainItem = !isStandalone ? getActiveMainActivities().find(m => m.code === mCode) : null;
      groups[mCode] = {
        code: isStandalone ? '' : mCode,
        desc: isStandalone ? '' : (item.mainActivityDesc || mainItem?.description || 'Main Activity'),
        isStandalone: isStandalone,
        activities: []
      };
    }
    groups[mCode].activities.push(item);
  });

  let globalIndex = 0;
  // Always render standalone activities first, then grouped ones
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    if (a === '__STANDALONE__') return -1;
    if (b === '__STANDALONE__') return 1;
    return 0;
  });

  sortedGroupKeys.forEach(key => {
    const grp = groups[key];
    if (!grp.isStandalone) {
      // Main Activity Header in bold RED font matching Candy format (Image 2)
      const mainTr = document.createElement('tr');
      mainTr.className = 'bg-red-50/90 border-t-2 border-b border-red-200 text-red-900 select-none';
      mainTr.innerHTML = `
        <td colspan="13" class="py-2 px-3 font-bold text-xs">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-black text-xs tracking-wider">${grp.code}</span>
            <span class="text-red-900 font-extrabold text-xs uppercase tracking-wide">${grp.desc}</span>
            <span class="text-[11px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full ml-auto">
              ${grp.activities.length} Sub-Activity(s)
            </span>
          </div>
        </td>
      `;
      tbody.appendChild(mainTr);
    }

    grp.activities.forEach(item => {
      globalIndex++;
      const index = globalIndex - 1;
      const calc = calculateFixedActivity(item, prj);
      const isExpanded = appState.expandedActivityIds.has(item.id);
      const pnlColor = calc.cumulativeProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-600';
      const pnlSign = calc.cumulativeProfitLoss >= 0 ? '+' : '';

    // Main Fixed Activity Row
    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-50 transition-colors border-b border-slate-200 cursor-pointer ${isExpanded ? 'bg-slate-50/80 font-medium' : ''}`;
    tr.onclick = (e) => {
      if (e.target.closest('button')) return;
      toggleActivityExpand(item.id, e);
    };

    tr.innerHTML = `
      <td class="py-3 px-3 text-center text-slate-400">
        <button onclick="toggleActivityExpand('${item.id}', event)" class="p-1 text-slate-500 hover:text-slate-800 rounded">
          <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4"></i>
        </button>
      </td>
      <td class="py-3 px-3 font-bold text-slate-900 cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Baseline Activity Code or Budget'); } else { editFixedActivity('${item.id}', event); }" title="${isAdmin ? 'Click to edit Fixed Baseline' : 'Locked: Admin privilege required to modify baseline'}">${item.code}</td>
      <td class="py-3 px-2">
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${item.division === 'SL' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">${item.division}</span>
      </td>
      <td class="py-3 px-4 font-sans text-slate-800 max-w-xs truncate cursor-pointer" title="${item.subActivity}" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Baseline Description'); } else { editFixedActivity('${item.id}', event); }">
        ${item.subActivity}
      </td>
      <td class="py-3 px-2 text-center text-slate-600">${item.unit}</td>
      <td class="py-3 px-3 text-right font-medium text-slate-800 cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Baseline Quantity'); } else { editFixedActivity('${item.id}', event); }" title="${isAdmin ? 'Click to edit baseline quantity' : 'Locked: Admin privilege required'}">${formatNum(item.totalQty, 0)}</td>
      <td class="py-3 px-3 text-right font-bold text-slate-900 cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Baseline Unit Rate'); } else { editFixedActivity('${item.id}', event); }" title="${isAdmin ? 'Click to edit baseline unit rate' : 'Locked: Admin privilege required'}">${formatNum(calc.budgetUnitRate, 2)}</td>
      <td class="py-3 px-3 text-right font-extrabold text-slate-900 cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Baseline Total Budget'); } else { editFixedActivity('${item.id}', event); }" title="${isAdmin ? 'Click to edit baseline' : 'Locked: Admin privilege required'}">${formatNum(calc.totalBudgetAmount, 0)}</td>
      <td class="py-3 px-3 text-right font-bold text-sky-700 bg-sky-50/50">${formatNum(calc.totalDoneQty, 0)}</td>
      <td class="py-3 px-3 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${calc.percentDone >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}">
          ${formatNum(calc.percentDone, 1)}%
        </span>
      </td>
      <td class="py-3 px-3 text-right font-medium text-amber-900">${formatNum(calc.totalActualSpend, 0)}</td>
      <td class="py-3 px-3 text-right font-bold ${pnlColor}">
        ${pnlSign}${formatNum(calc.cumulativeProfitLoss, 0)}
      </td>
      <td class="py-3 px-3 text-center">
        <div class="flex items-center justify-center gap-1.5 flex-wrap">
          <button onclick="openDailyModalForActivity('${item.id}', event)" class="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer" title="Record site output for this activity">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>+ Daily Log</span>
          </button>
          <button onclick="toggleActivityExpand('${item.id}', event)" class="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-300 rounded-lg cursor-pointer" title="Toggle daily entries">
            ${calc.logsCount} logs
          </button>
          ${isAdmin ? `
            <button onclick="editFixedActivity('${item.id}', event)" class="p-1 text-slate-400 hover:text-sky-600 rounded cursor-pointer" title="Edit Baseline Budget">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="deleteFixedActivity('${item.id}', event)" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Delete Baseline">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : `
            <button type="button" onclick="showAccessDenied('edit or modify Fixed Candy Baseline budget values')" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Edit Baseline Budget (Locked: Admin Only)">
              <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
            </button>
            <button type="button" onclick="showAccessDenied('delete Fixed Candy Baselines')" class="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer" title="Delete Baseline (Locked: Admin Only)">
              <i data-lucide="trash-2" class="w-3.5 h-3.5 text-slate-300"></i>
            </button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);

    // Expandable Sub-Row (Shows the daily activities logged under this fixed activity)
    if (isExpanded) {
      const subTr = document.createElement('tr');
      subTr.className = 'bg-amber-50/20 border-b border-slate-300';
      
      const itemLogs = (prj.dailyLogs || []).filter(l => l.activityId === item.id);
      itemLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

      let logsTableHtml = '';
      if (itemLogs.length === 0) {
        logsTableHtml = `
          <div class="text-center py-5 bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 mb-2">No daily site logs recorded yet for <strong>${item.code}</strong>.</p>
            <button onclick="openDailyModalForActivity('${item.id}', event)" class="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm inline-flex items-center gap-1.5">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ Record First Daily Execution</span>
            </button>
          </div>
        `;
      } else {
        let rowsHtml = '';
        itemLogs.forEach((log, idx) => {
          const lCalc = calculateDailyLog(log, item, prj);
          const pSign = lCalc.profitLossAED >= 0 ? '+' : '';
          const pColor = lCalc.profitLossAED >= 0 ? 'text-emerald-700' : 'text-rose-600 font-bold';

          rowsHtml += `
            <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
              <td class="py-2 px-3 text-slate-400 text-center">${idx + 1}</td>
              <td class="py-2 px-3 font-semibold text-slate-900">${log.date}</td>
              <td class="py-2 px-3 text-right font-bold text-slate-900">${formatNum(lCalc.actualQty, 0)} ${item.unit}</td>
              <td class="py-2 px-3 text-right text-emerald-800">${formatAED(lCalc.actualLabourCost)}</td>
              <td class="py-2 px-3 text-right text-blue-800">${formatAED(lCalc.actualPlantCost)}</td>
              <td class="py-2 px-3 text-right font-bold text-slate-900">${formatAED(lCalc.actualCost)}</td>
              <td class="py-2 px-3 text-right font-bold ${lCalc.actualUnitCost > lCalc.budgetUnitRate ? 'text-rose-600' : 'text-emerald-700'}">${formatAED(lCalc.actualUnitCost)}</td>
              <td class="py-2 px-3 text-right text-slate-600">${formatAED(lCalc.budgetUnitRate)}</td>
              <td class="py-2 px-3 text-right font-extrabold ${pColor}">${pSign}${formatAED(lCalc.profitLossAED)}</td>
              <td class="py-2 px-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${lCalc.profitLossAED >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                  ${pSign}${formatNum(lCalc.profitLossPercent, 1)}%
                </span>
              </td>
              <td class="py-2 px-3 font-sans text-slate-600 max-w-xs truncate" title="${log.notes || ''}">
                ${log.notes || '-'}
              </td>
              <td class="py-2 px-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  ${lCalc.isLoss ? `<button onclick="openSolutionModal('${log.id}')" class="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-500 shadow-xs cursor-pointer">Solution</button>` : ''}
                  ${(isAdmin || log.date === today) ? `
                    <button onclick="editDailyLog('${log.id}', event)" class="p-1 text-slate-400 hover:text-sky-600 rounded cursor-pointer" title="Edit Log">
                      <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </button>
                  ` : `
                    <button type="button" onclick="showAccessDenied('edit past daily logs from ${log.date}. Site Users can only modify today\\'s logs (${today})')" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Past record (${log.date}): Click for info">
                      <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
                    </button>
                  `}
                  ${isAdmin ? `
                    <button onclick="deleteDailyLog('${log.id}', event)" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Delete">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  ` : `
                    <button type="button" onclick="showAccessDenied('delete daily site execution logs')" class="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer" title="Delete (Admin Only)">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  `}
                </div>
              </td>
            </tr>
          `;
        });

        logsTableHtml = `
          <div class="bg-white rounded-xl border border-amber-300/80 shadow-sm overflow-hidden p-3 flex flex-col gap-2.5">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span class="font-bold text-slate-800 text-xs font-sans">Daily Execution Logs Under <strong>${item.code}</strong> (${itemLogs.length} entries)</span>
              </div>
              <button onclick="openDailyModalForActivity('${item.id}', event)" class="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ Add Daily Activity Log</span>
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono-numbers">
                <thead>
                  <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <th class="py-1.5 px-3 text-center">#</th>
                    <th class="py-1.5 px-3">Date</th>
                    <th class="py-1.5 px-3 text-right">Qty Done</th>
                    <th class="py-1.5 px-3 text-right">Labour (AED)</th>
                    <th class="py-1.5 px-3 text-right">Plant (AED)</th>
                    <th class="py-1.5 px-3 text-right">Daily Cost</th>
                    <th class="py-1.5 px-3 text-right">Unit Cost</th>
                    <th class="py-1.5 px-3 text-right">Budget Rate</th>
                    <th class="py-1.5 px-3 text-right">Profit / Loss</th>
                    <th class="py-1.5 px-3 text-center">P&amp;L %</th>
                    <th class="py-1.5 px-3 font-sans">Notes</th>
                    <th class="py-1.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      subTr.innerHTML = `
        <td colspan="13" class="p-4">
          ${logsTableHtml}
        </td>
      `;
      tbody.appendChild(subTr);
    }
    });
  });
}

// RENDER TAB 3: ALL DAILY LOGS TABLE
// --- SEARCHABLE DROPDOWN CONTROLLERS ---

function toggleSearchDropdown(dropdownId) {
  const container = document.getElementById(dropdownId);
  if (!container) return;
  const menu = container.querySelector('.dropdown-menu');
  if (!menu) return;
  const isHidden = menu.style.display === 'none' || menu.classList.contains('hidden');

  closeAllDropdowns();

  if (isHidden) {
    menu.style.display = 'block';
    menu.classList.remove('hidden');
    const searchInput = container.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 60);
      filterDropdownList(dropdownId, '');
    }
  } else {
    menu.style.display = 'none';
    menu.classList.add('hidden');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.style.display = 'none';
    menu.classList.add('hidden');
  });
}

function filterDropdownList(dropdownId, query) {
  const container = document.getElementById(dropdownId);
  if (!container) return;
  const q = (query || '').toLowerCase().trim();
  const items = container.querySelectorAll('.dropdown-item');
  items.forEach(item => {
    const searchText = (item.dataset.search || item.textContent || '').toLowerCase();
    if (!q || searchText.includes(q)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

// Global click outside to dismiss open dropdown menus and top control menu
document.addEventListener('click', (e) => {
  if (!e.target.closest('.searchable-dropdown')) {
    closeAllDropdowns();
  }
  if (!e.target.closest('#top-control-menu-container') && !e.target.closest('#menu-top-control') && !e.target.closest('#btn-top-menu')) {
    closeTopControlMenu();
  }
});

function populateDailyFilterActivityDropdown() {
  const container = document.getElementById('options-filter-daily-act');
  const label = document.getElementById('label-filter-daily-act');
  if (!container) return;
  const prj = getCurrentProject();
  if (!prj) return;

  container.innerHTML = '';

  // ALL Option
  const isAllSelected = appState.filterDailyActivityId === 'ALL';
  const allDiv = document.createElement('div');
  allDiv.className = `dropdown-item p-2 rounded-lg flex items-center justify-between ${isAllSelected ? 'is-selected' : ''}`;
  allDiv.dataset.search = 'all all sub-activities everything';
  allDiv.onclick = () => {
    appState.filterDailyActivityId = 'ALL';
    if (label) label.textContent = 'All Sub-Activities';
    closeAllDropdowns();
    renderDailyLogsTable();
  };
  allDiv.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="font-bold text-slate-800">All Sub-Activities</span>
      <span class="text-[10px] text-slate-400">(${prj.dailyLogs?.length || 0} total logs)</span>
    </div>
    ${isAllSelected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-sky-600"></i>' : ''}
  `;
  container.appendChild(allDiv);

  if (isAllSelected && label) label.textContent = 'All Sub-Activities';

  (prj.fixedActivities || []).forEach(act => {
    const isSel = appState.filterDailyActivityId === act.id;
    if (isSel && label) label.textContent = `${act.code} - ${act.subActivity.slice(0, 30)}...`;

    const logsCount = (prj.dailyLogs || []).filter(l => l.activityId === act.id).length;
    const div = document.createElement('div');
    div.className = `dropdown-item p-2 rounded-lg flex items-center justify-between ${isSel ? 'is-selected' : ''}`;
    div.dataset.search = `${act.code} ${act.subActivity} ${act.division} ${act.zone}`.toLowerCase();
    div.onclick = () => {
      appState.filterDailyActivityId = act.id;
      if (label) label.textContent = `${act.code} - ${act.subActivity.slice(0, 30)}...`;
      closeAllDropdowns();
      renderDailyLogsTable();
    };
    div.innerHTML = `
      <div class="flex flex-col truncate pr-2">
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-amber-950 font-mono-numbers">${act.code}</span>
          <span class="text-[10px] px-1 bg-slate-100 rounded text-slate-600">${act.division}</span>
        </div>
        <span class="truncate text-slate-700 text-[11px]">${act.subActivity}</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">${logsCount} logs</span>
        ${isSel ? '<i data-lucide="check" class="w-3.5 h-3.5 text-sky-600"></i>' : ''}
      </div>
    `;
    container.appendChild(div);
  });

  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function clearDailyDateFilter() {
  appState.filterDailyDate = '';
  const dtInp = document.getElementById('filter-daily-date');
  if (dtInp) dtInp.value = '';
  renderDailyLogsTable();
}

function populateModalDailyActivityDropdown(selectedActId) {
  const container = document.getElementById('options-modal-daily-act');
  const label = document.getElementById('label-modal-daily-act');
  const hiddenInp = document.getElementById('inp-daily-activity-id');
  if (!container) return;
  const prj = getCurrentProject();
  if (!prj) return;

  container.innerHTML = '';
  const targetId = selectedActId || (prj.fixedActivities && prj.fixedActivities[0] ? prj.fixedActivities[0].id : '');
  if (hiddenInp) hiddenInp.value = targetId;

  // Group activities by Main Activity
  const groups = {};
  (prj.fixedActivities || []).forEach(act => {
    const mCode = act.mainActivityCode || 'S00100';
    if (!groups[mCode]) {
      const mainItem = getActiveMainActivities().find(m => m.code === mCode);
      groups[mCode] = {
        code: mCode,
        desc: act.mainActivityDesc || mainItem?.description || 'Main Activity',
        activities: []
      };
    }
    groups[mCode].activities.push(act);
  });

  Object.values(groups).forEach(grp => {
    const header = document.createElement('div');
    header.className = 'dropdown-item px-2.5 py-1.5 bg-red-50/90 border-y border-red-200 text-red-900 text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 pointer-events-none sticky top-0';
    header.dataset.search = `${grp.code} ${grp.desc}`.toLowerCase();
    header.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-red-600"></span>
      <span class="font-mono text-red-700 font-black">${grp.code}:</span>
      <span class="truncate">${grp.desc}</span>
    `;
    container.appendChild(header);

    grp.activities.forEach(act => {
      const isSel = act.id === targetId;
      if (isSel && label) label.textContent = `${act.code} - ${act.subActivity.slice(0, 45)}...`;

      const div = document.createElement('div');
      div.className = `dropdown-item p-2 pl-4 rounded-lg flex items-center justify-between cursor-pointer ${isSel ? 'is-selected bg-amber-50 text-amber-950 font-bold border border-amber-200' : 'hover:bg-slate-50 text-slate-800'}`;
      div.dataset.search = `${grp.code} ${grp.desc} ${act.code} ${act.subActivity} ${act.division} ${act.zone}`.toLowerCase();
      div.onclick = () => {
        if (hiddenInp) hiddenInp.value = act.id;
        if (label) label.textContent = `${act.code} - ${act.subActivity.slice(0, 45)}...`;
        closeAllDropdowns();
        handleDailyActivitySelection(act.id);
      };
      div.innerHTML = `
        <div class="flex flex-col truncate pr-2">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-amber-950 font-mono-numbers">${act.code}</span>
            <span class="text-[10px] px-1 bg-slate-100 rounded text-slate-600">${act.division} - ${act.zone || ''}</span>
            <span class="text-[10px] text-slate-500 font-mono-numbers">Budget: ${formatAED(act.allowableRate || 0)}/${act.unit}</span>
          </div>
          <span class="truncate text-slate-800 text-[11px] font-medium">${act.subActivity}</span>
        </div>
        ${isSel ? '<i data-lucide="check" class="w-4 h-4 text-amber-600 shrink-0"></i>' : ''}
      `;
      container.appendChild(div);
    });
  });

  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function populateMatrixDropdowns() {
  const prj = getCurrentProject();
  if (!prj) return;

  // 1. Date Filter Dropdown (options-matrix-date)
  const dateContainer = document.getElementById('options-matrix-date');
  const dateLabel = document.getElementById('label-matrix-date');
  if (dateContainer) {
    dateContainer.innerHTML = '';

    // "ALL Dates" Option
    const isAllDates = appState.matrixFilterDate === 'ALL';
    const allDateDiv = document.createElement('div');
    allDateDiv.className = `dropdown-item p-2 rounded-lg flex items-center justify-between ${isAllDates ? 'is-selected' : ''}`;
    allDateDiv.dataset.search = 'all all dates everything whole project';
    allDateDiv.onclick = () => {
      appState.matrixFilterDate = 'ALL';
      if (dateLabel) dateLabel.textContent = 'All Dates (All Daily Logs)';
      closeAllDropdowns();
      renderMatrixTable();
    };
    allDateDiv.innerHTML = `
      <div class="flex items-center gap-1.5">
        <i data-lucide="calendar" class="w-3.5 h-3.5 text-amber-600"></i>
        <span class="font-bold text-slate-900">ALL Dates (View All Daily Activities)</span>
      </div>
      ${isAllDates ? '<i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600"></i>' : ''}
    `;
    dateContainer.appendChild(allDateDiv);

    if (isAllDates && dateLabel) dateLabel.textContent = 'All Dates (All Daily Logs)';

    // Unique dates from daily logs
    const uniqueDates = [...new Set((prj.dailyLogs || []).map(l => l.date))].sort().reverse();
    uniqueDates.forEach(dt => {
      const isSel = appState.matrixFilterDate === dt;
      if (isSel && dateLabel) dateLabel.textContent = `Date: ${dt}`;
      const count = (prj.dailyLogs || []).filter(l => l.date === dt).length;
      const div = document.createElement('div');
      div.className = `dropdown-item p-2 rounded-lg flex items-center justify-between ${isSel ? 'is-selected' : ''}`;
      div.dataset.search = dt;
      div.onclick = () => {
        appState.matrixFilterDate = dt;
        if (dateLabel) dateLabel.textContent = `Date: ${dt}`;
        closeAllDropdowns();
        renderMatrixTable();
      };
      div.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-800 font-mono-numbers">${dt}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">${count} logs</span>
        </div>
        ${isSel ? '<i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600"></i>' : ''}
      `;
      dateContainer.appendChild(div);
    });
  }

  // 2. Activity Filter Dropdown (options-matrix-act)
  const actContainer = document.getElementById('options-matrix-act');
  const actLabel = document.getElementById('label-matrix-act');
  if (actContainer) {
    actContainer.innerHTML = '';

    // "ALL" Option
    const isAllActs = appState.matrixFilterActivityId === 'ALL';
    const allActDiv = document.createElement('div');
    allActDiv.className = `dropdown-item p-2 rounded-lg flex items-center justify-between ${isAllActs ? 'is-selected' : ''}`;
    allActDiv.dataset.search = 'all all activities whole project';
    allActDiv.onclick = () => {
      appState.matrixFilterActivityId = 'ALL';
      if (actLabel) actLabel.textContent = 'All Activities';
      closeAllDropdowns();
      renderMatrixTable();
    };
    allActDiv.innerHTML = `
      <div class="flex items-center gap-1.5">
        <span class="font-bold text-slate-900">All Activities</span>
        <span class="text-[10px] text-slate-400">(${prj.fixedActivities?.length || 0} activities)</span>
      </div>
      ${isAllActs ? '<i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600"></i>' : ''}
    `;
    actContainer.appendChild(allActDiv);

    if (isAllActs && actLabel) actLabel.textContent = 'All Activities';

    (prj.fixedActivities || []).forEach(act => {
      const isSel = appState.matrixFilterActivityId === act.id;
      if (isSel && actLabel) actLabel.textContent = `${act.code} - ${act.subActivity.slice(0, 25)}...`;

      const div = document.createElement('div');
      div.className = `dropdown-item p-2 rounded-lg flex items-center justify-between ${isSel ? 'is-selected' : ''}`;
      div.dataset.search = `${act.code} ${act.subActivity} ${act.division} ${act.zone}`.toLowerCase();
      div.onclick = () => {
        appState.matrixFilterActivityId = act.id;
        if (actLabel) actLabel.textContent = `${act.code} - ${act.subActivity.slice(0, 25)}...`;
        closeAllDropdowns();
        renderMatrixTable();
      };
      div.innerHTML = `
        <div class="flex flex-col truncate pr-2">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-indigo-900 font-mono-numbers">${act.code}</span>
            <span class="text-[10px] px-1 bg-slate-100 rounded text-slate-600">${act.division}</span>
          </div>
          <span class="truncate text-slate-700 text-[11px]">${act.subActivity}</span>
        </div>
        ${isSel ? '<i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600 shrink-0"></i>' : ''}
      `;
      actContainer.appendChild(div);
    });
  }

  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function handleMatrixDateFilter(dateVal) {
  appState.matrixFilterDate = dateVal;
  renderMatrixTable();
}

function handleMatrixActFilter(actId) {
  appState.matrixFilterActivityId = actId;
  renderMatrixTable();
}

function toggleAllMatrixLogs() {
  appState.matrixAllExpanded = !appState.matrixAllExpanded;
  const prj = getCurrentProject();
  if (appState.matrixAllExpanded && prj) {
    (prj.fixedActivities || []).forEach(a => appState.matrixExpandedActivityIds.add(a.id));
  } else {
    appState.matrixExpandedActivityIds.clear();
  }
  renderMatrixTable();
}

function toggleMatrixActivityExpand(actId, event) {
  if (event) event.stopPropagation();
  if (appState.matrixExpandedActivityIds.has(actId)) {
    appState.matrixExpandedActivityIds.delete(actId);
  } else {
    appState.matrixExpandedActivityIds.add(actId);
  }
  renderMatrixTable();
}

// RENDER TAB 3: ALL DAILY LOGS TABLE
function renderDailyLogsTable() {
  const tbody = document.getElementById('daily-logs-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const prj = getCurrentProject();
  if (!prj) return;
  const isAdmin = isCurrentUserAdmin();
  const today = getTodayDate();

  populateDailyFilterActivityDropdown();

  let list = [...(prj.dailyLogs || [])];
  if (appState.filterDailyActivityId !== 'ALL') {
    list = list.filter(l => l.activityId === appState.filterDailyActivityId);
  }
  if (appState.filterDailyDate) {
    list = list.filter(l => l.date === appState.filterDailyDate);
  }

  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="14" class="text-center py-8 text-slate-400 font-sans">No daily site logs found. Click "+ Log Daily Activity" to record site output.</td></tr>`;
    return;
  }

  list.forEach((log, index) => {
    const act = (prj.fixedActivities || []).find(a => a.id === log.activityId);
    const calc = calculateDailyLog(log, act, prj);
    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-50 transition-colors ${calc.isLoss ? 'bg-rose-50/20' : ''}`;

    const pnlColor = calc.profitLossAED >= 0 ? 'text-emerald-700' : 'text-rose-600 font-bold';
    const pnlSign = calc.profitLossAED >= 0 ? '+' : '';
    const pSign = pnlSign;

    tr.innerHTML = `
      <td class="py-3 px-3 text-center text-slate-400">${index + 1}</td>
      <td class="py-3 px-3 font-semibold text-slate-900">${log.date}</td>
      <td class="py-3 px-3 font-bold text-slate-800">${act ? act.code : '-'}</td>
      <td class="py-3 px-4 font-sans text-slate-800 max-w-xs truncate" title="${act ? act.subActivity : ''}">
        ${act ? act.subActivity : 'Unknown Activity'}
      </td>
      <td class="py-3 px-3 text-right font-bold text-slate-900">${formatNum(calc.actualQty, 0)} ${act ? act.unit : ''}</td>
      <td class="py-3 px-3 text-right text-emerald-800">${formatNum(calc.actualLabourCost, 0)}</td>
      <td class="py-3 px-3 text-right text-blue-800">${formatNum(calc.actualPlantCost, 0)}</td>
      <td class="py-3 px-3 text-right font-extrabold text-slate-900">${formatNum(calc.actualCost, 0)}</td>
      <td class="py-3 px-3 text-right font-bold ${calc.actualUnitCost > calc.budgetUnitRate ? 'text-rose-600' : 'text-emerald-700'}">
        ${formatNum(calc.actualUnitCost, 2)}
      </td>
      <td class="py-3 px-3 text-right font-semibold text-slate-600">${formatNum(calc.budgetUnitRate, 2)}</td>
      <td class="py-3 px-3 text-right font-extrabold ${pnlColor}">
        ${pnlSign}${formatNum(calc.profitLossAED, 2)}
      </td>
      <td class="py-3 px-3 text-center font-bold">
        <span class="px-2 py-0.5 rounded-full text-[10px] ${calc.profitLossAED >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
          ${pSign}${formatNum(calc.profitLossPercent, 1)}%
        </span>
      </td>
      <td class="py-3 px-3 text-center">
        ${calc.isLoss
          ? `<button onclick="openSolutionModal('${log.id}')" class="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-500 shadow-xs flex items-center gap-1 mx-auto cursor-pointer">
              <i data-lucide="lightbulb" class="w-3 h-3"></i> Solution
            </button>`
          : `<span class="text-[11px] font-semibold text-emerald-700">Profitable</span>`
        }
      </td>
      <td class="py-3 px-3 text-center">
        <div class="flex items-center justify-center gap-1.5">
          ${(isAdmin || log.date === today) ? `
            <button onclick="editDailyLog('${log.id}', event)" class="p-1 text-slate-400 hover:text-sky-600 rounded cursor-pointer" title="Edit Log">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
          ` : `
            <button type="button" onclick="showAccessDenied('edit past daily records from ${log.date}. Site Users can only modify today\\'s logs (${today})')" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Locked: Site Users can only edit today's records (${today})">
              <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
            </button>
          `}
          ${isAdmin ? `
            <button onclick="deleteDailyLog('${log.id}', event)" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Delete">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : `
            <button type="button" onclick="showAccessDenied('delete daily site execution logs')" class="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer" title="Delete (Admin Only)">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          `}
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function renderMatrixHeader() {
  const thead = document.querySelector('#sec-matrix table thead');
  if (!thead) return;
  const activeLabour = getActiveLabourTrades();
  const activePlant = getActivePlantEquipment();
  const prj = getCurrentProject();

  const lCount = activeLabour.length;
  const pCount = activePlant.length;
  const workoutColspan = 2 + lCount + 1 + pCount + 1 + 5;

  thead.innerHTML = `
    <!-- TIER 1: HIGH LEVEL SECTIONS -->
    <tr class="text-white text-center text-xs font-bold tracking-wider uppercase sticky-th">
      <th colspan="11" class="py-2.5 px-3 header-budget border-r border-slate-700 sticky-col-1">
        BUDGET COST BREAK DOWN FOR SUB ACTIVITY
      </th>
      <th colspan="${lCount}" class="py-2.5 px-3 header-labour border-r border-emerald-900">
        LABOUR HOURS - SUB ACTIVITY WISE
      </th>
      <th colspan="${pCount}" class="py-2.5 px-3 header-plant border-r border-blue-900">
        PLANT &amp; EQPT. HOURS - SUB ACTIVITY WISE
      </th>
      <th colspan="${workoutColspan}" class="py-2.5 px-3 header-workout">
        CANDY BUDGET - WORK OUT QTY AND RESOURCES BUDGETED
      </th>
    </tr>

    <!-- TIER 2: COLUMN HEADERS -->
    <tr class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-center sticky-th top-[34px]">
      <th class="p-2 border-r border-slate-200 sticky-col-1 bg-slate-100 w-12">S No</th>
      <th class="p-2 border-r border-slate-200 sticky-col-2 bg-slate-100">Candy Code</th>
      <th class="p-2 border-r border-slate-200">Division</th>
      <th class="p-2 border-r border-slate-200">Zone</th>
      <th class="p-2 border-r border-slate-200 text-left min-w-[240px]">Sub Activity</th>
      <th class="p-2 border-r border-slate-200">Unit</th>
      <th class="p-2 border-r border-slate-200 text-right">Qty</th>
      <th class="p-2 border-r border-slate-200 text-right">Unit Rate for Labour &amp; Plant</th>
      <th class="p-2 border-r border-slate-200 text-right">Total Labour &amp; Plant Amount</th>
      <th class="p-2 border-r border-slate-200 text-right text-emerald-700 bg-emerald-50/50">Labour Amount</th>
      <th class="p-2 border-r-2 border-slate-400 text-right text-sky-700 bg-sky-50/50">Plant Amount</th>

      <!-- Labour Hours -->
      ${activeLabour.map((t, idx) => `
        <th class="p-2 border-r ${idx === lCount - 1 ? 'border-r-2 border-emerald-600' : 'border-slate-200'} bg-emerald-50/30">Total ${t.short || t.name}</th>
      `).join('')}

      <!-- Plant Hours -->
      ${activePlant.map((p, idx) => `
        <th class="p-2 border-r ${idx === pCount - 1 ? 'border-r-2 border-blue-600' : 'border-slate-200'} bg-blue-50/30">Total ${p.short || p.name}</th>
      `).join('')}

      <!-- Workout Qty & Resources -->
      <th class="p-2 border-r border-slate-200 bg-amber-50">Unit</th>
      <th class="p-2 border-r border-slate-200 bg-amber-100 font-bold">WORK OUT QTY</th>

      <!-- Labour in Workout -->
      ${activeLabour.map(t => `
        <th class="p-2 border-r border-slate-200 bg-emerald-50">${t.short || t.name}</th>
      `).join('')}
      <th class="p-2 border-r-2 border-emerald-600 bg-emerald-100 font-bold">Total Labour Cost</th>

      <!-- Plant in Workout -->
      ${activePlant.map(p => `
        <th class="p-2 border-r border-slate-200 bg-blue-50">${p.short || p.name}</th>
      `).join('')}
      <th class="p-2 border-r-2 border-blue-600 bg-blue-100 font-bold">Total Plant Cost</th>

      <!-- Summary Columns -->
      <th class="p-2 border-r border-slate-200 bg-orange-100 font-bold text-slate-800">Labour Cost / Unit</th>
      <th class="p-2 border-r border-slate-200 bg-orange-100 font-bold text-slate-800">Plant Cost / Unit</th>
      <th class="p-2 border-r border-slate-200 bg-orange-200 font-extrabold text-slate-900">Cost per Unit</th>
      <th class="p-2 border-r border-slate-200 bg-emerald-100 font-extrabold text-emerald-900">TOTAL AMOUNT</th>
      <th class="p-2 bg-indigo-100 font-bold text-indigo-900">SAVING / LOSS</th>
    </tr>

    <!-- TIER 3: RATES ROW -->
    <tr class="bg-slate-200/80 text-slate-700 text-[10px] font-semibold text-center border-b border-slate-300 sticky-th top-[64px]">
      <td colspan="11" class="p-1 border-r border-slate-300 italic text-slate-500">Resource Rates (AED/hr) &rarr;</td>
      <td colspan="${lCount}" class="p-1 border-r-2 border-emerald-600"></td>
      <td colspan="${pCount}" class="p-1 border-r-2 border-blue-600"></td>
      <td colspan="2" class="p-1 border-r border-slate-300"></td>

      <!-- Labour Rates -->
      ${activeLabour.map((t, idx) => {
        const r = prj?.labourRates?.[t.id] ?? t.rate;
        const isLast = idx === lCount - 1;
        return `<td class="p-1 border-r ${isLast ? 'border-r-2 border-emerald-600' : 'border-slate-300'} bg-emerald-50 text-emerald-800">${formatNum(r, 2)}</td>`;
      }).join('')}

      <!-- Plant Rates -->
      ${activePlant.map((p, idx) => {
        const r = prj?.plantRates?.[p.id] ?? p.rate;
        const isLast = idx === pCount - 1;
        return `<td class="p-1 border-r ${isLast ? 'border-r-2 border-blue-600' : 'border-slate-300'} bg-blue-50 text-blue-800">${formatNum(r, 1)}</td>`;
      }).join('')}

      <td colspan="5" class="p-1 bg-orange-50"></td>
    </tr>
  `;
}

// RENDER TAB 4: EXCEL MATRIX TABLE (70+ COLS WITH DAILY ACTUALS UNDERNEATH)
function renderMatrixTable() {
  const tbody = document.getElementById('matrix-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  const prj = getCurrentProject();
  if (!prj) return;
  const isAdmin = isCurrentUserAdmin();

  renderMatrixHeader();
  populateMatrixDropdowns();

  const activeLabour = getActiveLabourTrades();
  const activePlant = getActivePlantEquipment();
  const lCount = activeLabour.length;
  const pCount = activePlant.length;
  const totalCols = 20 + 2 * lCount + 2 * pCount;
  const bannerColspan = totalCols - 2;

  let activities = prj.fixedActivities || [];
  if (appState.matrixFilterActivityId !== 'ALL') {
    activities = activities.filter(a => a.id === appState.matrixFilterActivityId);
  }

  let totalDailyRowsRendered = 0;

  // Group activities by Main Activity Code (Photo 2 Candy format)
  const groups = {};
  activities.forEach(item => {
    const rawMCode = (item.mainActivityCode || '').trim();
    const isStandalone = !rawMCode || rawMCode.toUpperCase() === 'NONE' || rawMCode === '-';
    const mCode = isStandalone ? '__STANDALONE__' : rawMCode;
    if (!groups[mCode]) {
      const mainItem = !isStandalone ? getActiveMainActivities().find(m => m.code === mCode) : null;
      groups[mCode] = {
        code: isStandalone ? '' : mCode,
        desc: isStandalone ? '' : (item.mainActivityDesc || mainItem?.description || 'Main Activity'),
        isStandalone: isStandalone,
        activities: []
      };
    }
    groups[mCode].activities.push(item);
  });

  let globalIndex = 0;

  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    if (a === '__STANDALONE__') return -1;
    if (b === '__STANDALONE__') return 1;
    return 0;
  });

  sortedGroupKeys.forEach(key => {
    const grp = groups[key];
    if (!grp.isStandalone) {
      // Candy Main Activity Header Row in Bold RED font matching Photo 2
      const mainTr = document.createElement('tr');
      mainTr.className = 'bg-red-50/90 border-t-2 border-b-2 border-red-300 text-red-900 select-none';
      mainTr.innerHTML = `
        <td class="p-2 text-center sticky-col-1 bg-red-100 border-r border-red-200 text-red-900 font-extrabold text-[11px]">MAIN</td>
        <td class="p-2 sticky-col-2 bg-red-100 border-r border-red-200 font-mono font-black text-red-700">
          <div class="flex items-center gap-1.5 justify-between">
            <span class="text-red-700 font-bold">${grp.code}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] bg-red-200 text-red-900 font-bold">${grp.activities.length} Sub-Act</span>
          </div>
        </td>
        <td colspan="${bannerColspan}" class="p-2 border-r border-red-200 font-extrabold text-red-700 text-xs uppercase tracking-wide bg-red-50/90">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shrink-0"></span>
            <span class="text-red-700 font-extrabold text-xs">${grp.desc}</span>
          </div>
        </td>
      `;
      tbody.appendChild(mainTr);
    }

    grp.activities.forEach(item => {
      globalIndex++;
      const index = globalIndex;
      const calc = calculateFixedActivity(item, prj);
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-amber-50/20 transition-colors border-b border-slate-200';

      // Check if this activity has daily logs matching date filter
      let activityDailyLogs = (prj.dailyLogs || []).filter(l => l.activityId === item.id);
      if (appState.matrixFilterDate !== 'ALL') {
        activityDailyLogs = activityDailyLogs.filter(l => l.date === appState.matrixFilterDate);
      }

      const hasLogs = activityDailyLogs.length > 0;
      const isExpanded = appState.matrixAllExpanded || appState.matrixExpandedActivityIds.has(item.id);

      let html = `
        <td class="p-2 text-center sticky-col-1 bg-white border-r border-slate-200 text-slate-500 font-sans">${index}</td>
        <td class="p-2 sticky-col-2 bg-white border-r border-slate-200 font-bold text-slate-900 cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Candy Baseline values in the Excel Matrix view'); } else { editFixedActivity('${item.id}', event); }" title="${isAdmin ? 'Click to edit baseline' : 'Locked: Admin privilege required'}">
          <div class="flex items-center gap-1.5 justify-between">
            <div class="flex items-center gap-1">
              <span class="px-1 py-0.2 rounded text-[9px] bg-red-100 text-red-700 font-black border border-red-200">BGT</span>
              <span class="font-mono text-slate-900 font-bold">${item.code}</span>
            </div>
            ${hasLogs ? `
              <button type="button" onclick="toggleMatrixActivityExpand('${item.id}', event)" class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isExpanded ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'} hover:bg-amber-200 cursor-pointer" title="${isExpanded ? 'Collapse daily logs' : 'Expand daily logs'}">
                ${isExpanded ? '▼' : '▶'} ${activityDailyLogs.length}
              </button>
            ` : ''}
          </div>
        </td>
        <td class="p-2 border-r border-slate-200 text-center font-bold text-slate-700">${item.division}</td>
        <td class="p-2 border-r border-slate-200 text-slate-600">${item.zone || 'Zone 1'}</td>
        <td class="p-2 border-r border-slate-200 font-sans text-slate-900 max-w-[280px] truncate cursor-pointer" title="${item.subActivity}" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Candy Baseline values in the Excel Matrix view'); } else { editFixedActivity('${item.id}', event); }">${item.subActivity}</td>
        <td class="p-2 border-r border-slate-200 text-center text-slate-700">${item.unit}</td>
        <td class="p-2 border-r border-slate-200 text-right font-medium cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Candy Baseline values in the Excel Matrix view'); } else { editFixedActivity('${item.id}', event); }">${formatNum(item.totalQty, 0)}</td>
        <td class="p-2 border-r border-slate-200 text-right font-bold text-slate-800 cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Candy Baseline values in the Excel Matrix view'); } else { editFixedActivity('${item.id}', event); }">${formatNum(calc.budgetUnitRate, 4)}</td>
        <td class="p-2 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50/50 cursor-pointer" onclick="if (!isCurrentUserAdmin()) { showAccessDenied('modify Fixed Candy Baseline values in the Excel Matrix view'); } else { editFixedActivity('${item.id}', event); }">${formatNum(calc.totalBudgetAmount, 0)}</td>
        <td class="p-2 border-r border-slate-200 text-right font-semibold text-emerald-800 bg-emerald-50/20">${formatNum(calc.totalLabourAmount, 0)}</td>
        <td class="p-2 border-r-2 border-slate-400 text-right font-semibold text-sky-800 bg-sky-50/20">${formatNum(calc.totalPlantAmount, 0)}</td>
      `;

      activeLabour.forEach((trade, i) => {
        const h = calc.detailedLabour[trade.id]?.projectHrs || 0;
        const isLast = i === lCount - 1;
        const borderClass = isLast ? 'border-r-2 border-emerald-600' : 'border-r border-slate-200';
        const cellContent = h > 0 ? `<span class="active-val">${formatNum(h, 0)}</span>` : `<span class="zero-val">-</span>`;
        html += `<td class="p-2 text-right bg-emerald-50/10 ${borderClass}">${cellContent}</td>`;
      });

      activePlant.forEach((plant, i) => {
        const h = calc.detailedPlant[plant.id]?.projectHrs || 0;
        const isLast = i === pCount - 1;
        const borderClass = isLast ? 'border-r-2 border-blue-600' : 'border-r border-slate-200';
        const cellContent = h > 0 ? `<span class="active-val text-blue-900 font-bold">${formatNum(h, 0)}</span>` : `<span class="zero-val">-</span>`;
        html += `<td class="p-2 text-right bg-blue-50/10 ${borderClass}">${cellContent}</td>`;
      });

      html += `
        <td class="p-2 border-r border-slate-200 text-center text-slate-700 bg-amber-50/30">${item.unit}</td>
        <td class="p-2 border-r border-slate-200 text-right font-bold text-amber-900 bg-amber-100/50">${formatNum(item.workoutQty, 1)}</td>
      `;

      activeLabour.forEach(trade => {
        const h = calc.detailedLabour[trade.id]?.workoutHrs || 0;
        const cell = h > 0 ? `<span class="active-val text-emerald-900">${formatNum(h, 0)}</span>` : `<span class="zero-val"></span>`;
        html += `<td class="p-2 text-right border-r border-slate-200 bg-emerald-50/20">${cell}</td>`;
      });
      html += `<td class="p-2 border-r-2 border-emerald-600 text-right font-bold text-emerald-900 bg-emerald-100/60">${formatNum(calc.workoutLabourCost, 0)}</td>`;

      activePlant.forEach(plant => {
        const h = calc.detailedPlant[plant.id]?.workoutHrs || 0;
        const cell = h > 0 ? `<span class="active-val text-blue-900">${formatNum(h, 0)}</span>` : `<span class="zero-val"></span>`;
        html += `<td class="p-2 text-right border-r border-slate-200 bg-blue-50/20">${cell}</td>`;
      });
      html += `<td class="p-2 border-r-2 border-blue-600 text-right font-bold text-blue-900 bg-blue-100/60">${formatNum(calc.workoutPlantCost, 0)}</td>`;

      html += `
        <td class="p-2 border-r border-slate-200 text-right font-semibold text-slate-800 bg-orange-50/50">${formatNum(calc.unitLabourCost, 2)}</td>
        <td class="p-2 border-r border-slate-200 text-right font-semibold text-slate-800 bg-orange-50/50">${formatNum(calc.unitPlantCost, 2)}</td>
        <td class="p-2 border-r border-slate-200 text-right font-extrabold text-slate-900 bg-orange-100/70">${formatNum(calc.budgetUnitRate, 2)}</td>
        <td class="p-2 border-r border-slate-200 text-right font-extrabold text-emerald-900 bg-emerald-100/80">${formatNum(calc.totalBudgetAmount, 2)}</td>
        <td class="p-2 text-right font-bold ${calc.cumulativeProfitLoss >= 0 ? 'text-indigo-900' : 'text-rose-700'} bg-indigo-50/80">${formatNum(calc.cumulativeProfitLoss, 2)}</td>
      `;

      tr.innerHTML = html;
      tbody.appendChild(tr);

      // Render Daily Actual Execution Rows under this Fixed Activity
      if (isExpanded) {
        if (activityDailyLogs.length > 0) {
          activityDailyLogs.forEach((log, logIdx) => {
            totalDailyRowsRendered++;
            const logCalc = calculateDailyLog(log, item, prj);
            const dTr = document.createElement('tr');
            dTr.className = 'matrix-daily-row transition-colors border-b border-amber-200/60 text-slate-800';

            let dHtml = `
              <td class="p-2 text-center sticky-col-1 text-amber-800 font-bold font-mono-numbers">↳ ${index}.${logIdx + 1}</td>
              <td class="p-2 sticky-col-2">
                <div class="flex items-center gap-1">
                  <span class="px-1 py-0.2 rounded text-[9px] bg-amber-200 text-amber-950 font-black border border-amber-300">Act</span>
                  <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-bold text-[10px] tracking-tight whitespace-nowrap">
                    ${log.date}
                  </span>
                </div>
              </td>
              <td class="p-2 border-r border-slate-200 text-center text-slate-500">${item.division}</td>
              <td class="p-2 border-r border-slate-200 text-slate-500">${item.zone || 'Zone 1'}</td>
              <td class="p-2 border-r border-slate-200 max-w-[280px] truncate" title="${log.notes || 'Daily site execution'}">
                <span class="font-bold text-amber-900">↳ ${log.date}:</span>
                <span class="text-slate-700 font-sans italic">${log.notes || 'Daily site output recorded'}</span>
              </td>
              <td class="p-2 border-r border-slate-200 text-center font-bold text-slate-700">${item.unit}</td>
              <td class="p-2 border-r border-slate-200 text-right font-extrabold text-amber-950 bg-amber-100/70">${formatNum(log.actualQty, 0)}</td>
              <td class="p-2 border-r border-slate-200 text-right font-bold text-slate-900">${formatNum(logCalc.actualUnitCost, 4)}</td>
              <td class="p-2 border-r border-slate-200 text-right font-bold text-amber-950 bg-amber-100/50">${formatNum(logCalc.actualCost, 2)}</td>
              <td class="p-2 border-r border-slate-200 text-right font-semibold text-emerald-800">${formatNum(logCalc.actualLabourCost, 2)}</td>
              <td class="p-2 border-r-2 border-slate-400 text-right font-semibold text-blue-800">${formatNum(logCalc.actualPlantCost, 2)}</td>
            `;

            activeLabour.forEach((trade, i) => {
              const h = parseFloat(log.actualLabourHours?.[trade.id]) || 0;
              const isLast = i === lCount - 1;
              const borderClass = isLast ? 'border-r-2 border-emerald-600' : 'border-r border-slate-200';
              const cell = h > 0 ? `<span class="font-bold text-emerald-950">${formatNum(h, 1)}</span>` : `<span class="zero-val">-</span>`;
              dHtml += `<td class="p-2 text-right bg-emerald-50/20 ${borderClass}">${cell}</td>`;
            });

            activePlant.forEach((plant, i) => {
              const h = parseFloat(log.actualPlantHours?.[plant.id]) || 0;
              const isLast = i === pCount - 1;
              const borderClass = isLast ? 'border-r-2 border-blue-600' : 'border-r border-slate-200';
              const cell = h > 0 ? `<span class="font-bold text-blue-950">${formatNum(h, 1)}</span>` : `<span class="zero-val">-</span>`;
              dHtml += `<td class="p-2 text-right bg-blue-50/20 ${borderClass}">${cell}</td>`;
            });

            dHtml += `
              <td class="p-2 border-r border-slate-200 text-center text-slate-700 bg-amber-50/40">${item.unit}</td>
              <td class="p-2 border-r border-slate-200 text-right font-bold text-amber-950 bg-amber-100/50">${formatNum(log.actualQty, 1)}</td>
            `;

            activeLabour.forEach(trade => {
              const h = parseFloat(log.actualLabourHours?.[trade.id]) || 0;
              const cell = h > 0 ? `<span class="font-bold text-emerald-900">${formatNum(h, 0)}</span>` : `<span class="zero-val"></span>`;
              dHtml += `<td class="p-2 text-right border-r border-slate-200 bg-emerald-50/10">${cell}</td>`;
            });
            dHtml += `<td class="p-2 border-r-2 border-emerald-600 text-right font-bold text-emerald-950 bg-emerald-100/40">${formatNum(logCalc.actualLabourCost, 0)}</td>`;

            activePlant.forEach(plant => {
              const h = parseFloat(log.actualPlantHours?.[plant.id]) || 0;
              const cell = h > 0 ? `<span class="font-bold text-blue-900">${formatNum(h, 0)}</span>` : `<span class="zero-val"></span>`;
              dHtml += `<td class="p-2 text-right border-r border-slate-200 bg-blue-50/10">${cell}</td>`;
            });
            dHtml += `<td class="p-2 border-r-2 border-blue-600 text-right font-bold text-blue-950 bg-blue-100/40">${formatNum(logCalc.actualPlantCost, 0)}</td>`;

            const pnlClass = logCalc.profitLossAED >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-800 font-extrabold';
            const pnlPrefix = logCalc.profitLossAED >= 0 ? '+' : '';

            dHtml += `
              <td class="p-2 border-r border-slate-200 text-right font-semibold text-slate-800">${formatNum(logCalc.actualUnitLabour, 2)}</td>
              <td class="p-2 border-r border-slate-200 text-right font-semibold text-slate-800">${formatNum(logCalc.actualUnitPlant, 2)}</td>
              <td class="p-2 border-r border-slate-200 text-right font-extrabold text-amber-950 bg-amber-100/60">${formatNum(logCalc.actualUnitCost, 2)}</td>
              <td class="p-2 border-r border-slate-200 text-right font-bold text-sky-950 bg-sky-50/70" title="Earned Budget">${formatNum(logCalc.earnedBudget, 2)}</td>
              <td class="p-2 text-right font-bold">
                <span class="px-2 py-0.5 rounded-full text-[10px] ${pnlClass} whitespace-nowrap">
                  ${pnlPrefix}${formatAED(logCalc.profitLossAED)} (${pnlPrefix}${formatNum(logCalc.profitLossPercent, 1)}%)
                </span>
              </td>
            `;

            dTr.innerHTML = dHtml;
            tbody.appendChild(dTr);
          });
        } else if (appState.matrixFilterDate !== 'ALL') {
          const noWorkTr = document.createElement('tr');
          noWorkTr.className = 'border-b border-slate-100 bg-slate-50/50 text-slate-400 italic text-xs';
          noWorkTr.innerHTML = `
            <td class="p-2 text-center sticky-col-1 bg-slate-50"></td>
            <td class="p-2 sticky-col-2 bg-slate-50 text-[10px] font-mono-numbers">↳ No log</td>
            <td colspan="${bannerColspan}" class="p-2 pl-4 text-slate-400">
              No site execution recorded for <strong>${item.code}</strong> on ${appState.matrixFilterDate}.
            </td>
          `;
          tbody.appendChild(noWorkTr);
        }
      }
    });
  });

  // Update matrix counter badge
  const badge = document.getElementById('matrix-counter-badge');
  if (badge) {
    const dateText = appState.matrixFilterDate === 'ALL' ? 'All Dates' : appState.matrixFilterDate;
    badge.textContent = `${activities.length} Fixed Activities | ${totalDailyRowsRendered} Daily Logs (${dateText})`;
  }

  // Update toggle all button text
  const toggleBtnLabel = document.getElementById('label-toggle-all-matrix-logs');
  if (toggleBtnLabel) {
    toggleBtnLabel.textContent = appState.matrixAllExpanded ? 'Collapse Daily Rows' : 'Expand Daily Rows';
  }

  if (window.lucide) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function renderCharts() {
  const prj = getCurrentProject();
  if (!prj) return;

  const isDateFiltered = appState.dashboardFilterDate && appState.dashboardFilterDate !== 'ALL';
  const filterDate = isDateFiltered ? appState.dashboardFilterDate : null;

  const ctxEarned = document.getElementById('chart-earned-vs-actual')?.getContext('2d');
  if (ctxEarned) {
    if (chartEarnedVsActual) chartEarnedVsActual.destroy();

    const dateMap = {};
    (prj.dailyLogs || []).forEach(l => {
      if (!dateMap[l.date]) dateMap[l.date] = { earned: 0, actual: 0 };
      const c = calculateDailyLog(l, null, prj);
      dateMap[l.date].earned += c.earnedBudget;
      dateMap[l.date].actual += c.actualCost;
    });

    const dates = Object.keys(dateMap).sort();
    let cumEarned = 0;
    let cumActual = 0;
    const earnedCurve = [];
    const actualCurve = [];
    const pointRadiiEarned = [];
    const pointRadiiActual = [];

    dates.forEach(d => {
      cumEarned += dateMap[d].earned;
      cumActual += dateMap[d].actual;
      earnedCurve.push(cumEarned);
      actualCurve.push(cumActual);

      if (isDateFiltered && d === filterDate) {
        pointRadiiEarned.push(7);
        pointRadiiActual.push(7);
      } else {
        pointRadiiEarned.push(3);
        pointRadiiActual.push(3);
      }
    });

    chartEarnedVsActual = new Chart(ctxEarned, {
      type: 'line',
      data: {
        labels: dates.length ? dates : ['Start'],
        datasets: [
          {
            label: 'Earned Budget (Value Done)',
            data: earnedCurve.length ? earnedCurve : [0],
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: pointRadiiEarned.length ? pointRadiiEarned : 3,
            pointHoverRadius: 8
          },
          {
            label: 'Actual Site Cost Spent',
            data: actualCurve.length ? actualCurve : [0],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: pointRadiiActual.length ? pointRadiiActual : 3,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { title: { display: true, text: 'AED' } }
        }
      }
    });
  }

  const ctxPnl = document.getElementById('chart-pnl-by-activity')?.getContext('2d');
  if (ctxPnl) {
    if (chartPnlByActivity) chartPnlByActivity.destroy();

    const actLabels = [];
    const actPnlValues = [];
    const actColors = [];
    let datasetLabel = 'Cumulative Profit / Loss %';

    if (isDateFiltered) {
      const dateLogs = (prj.dailyLogs || []).filter(l => l.date === filterDate);
      datasetLabel = `Daily Profit / Loss % on ${filterDate}`;

      if (dateLogs.length > 0) {
        dateLogs.forEach(l => {
          const act = (prj.fixedActivities || []).find(a => a.id === l.activityId);
          const c = calculateDailyLog(l, act, prj);
          actLabels.push(act ? act.code : 'Act');
          actPnlValues.push(Number(c.profitLossPercent.toFixed(1)));
          actColors.push(c.profitLossAED >= 0 ? '#10b981' : '#f43f5e');
        });
      } else {
        actLabels.push(`No logs on ${filterDate}`);
        actPnlValues.push(0);
        actColors.push('#cbd5e1');
      }
    } else {
      (prj.fixedActivities || []).forEach(a => {
        const calc = calculateFixedActivity(a, prj);
        actLabels.push(a.code);
        actPnlValues.push(calc.cumulativeProfitLossPercent);
        actColors.push(calc.cumulativeProfitLossPercent >= 0 ? '#10b981' : '#f43f5e');
      });
    }

    chartPnlByActivity = new Chart(ctxPnl, {
      type: 'bar',
      data: {
        labels: actLabels.length ? actLabels : ['No Activities'],
        datasets: [{
          label: datasetLabel,
          data: actPnlValues.length ? actPnlValues : [0],
          backgroundColor: actColors.length ? actColors : ['#cbd5e1'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { title: { display: true, text: '% Profit / Loss' } }
        }
      }
    });
  }
}

// --- 5. MODAL HANDLERS ---

function openSolutionModal(logId) {
  const prj = getCurrentProject();
  const log = (prj.dailyLogs || []).find(l => l.id === logId);
  if (!log) return;
  const act = (prj.fixedActivities || []).find(a => a.id === log.activityId);
  if (!act) return;

  const diag = generateSolutionForLoss(log, act, prj);
  const container = document.getElementById('modal-solution-body');

  let solutionsHtml = '';
  diag.solutions.forEach(s => {
    let recsHtml = '';
    s.recommendedActions.forEach(r => {
      recsHtml += `<li class="flex items-start gap-2"><span class="text-rose-600 font-bold mt-0.5">&bull;</span><span>${r}</span></li>`;
    });

    solutionsHtml += `
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900 text-xs">${s.category}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${s.severity}</span>
        </div>
        <p class="text-slate-700"><span class="font-semibold text-slate-900">Observed Variance:</span> ${s.finding}</p>
        <p class="text-slate-600"><span class="font-semibold text-slate-800">Root Cause:</span> ${s.rootCause}</p>
        <div class="mt-1 pt-2 border-t border-slate-200">
          <span class="font-bold text-emerald-800 uppercase text-[10px] tracking-wider block mb-1">Recommended Engineering Action:</span>
          <ul class="space-y-1 text-slate-800">
            ${recsHtml}
          </ul>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="bg-rose-50 p-4 rounded-xl border border-rose-200 flex flex-wrap items-center justify-between gap-3">
      <div>
        <span class="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">${diag.activityCode} &bull; ${diag.date}</span>
        <h4 class="text-sm font-bold text-slate-900">${diag.activityName}</h4>
        <span class="text-xs text-slate-600">Daily Quantity Executed: <strong>${formatNum(diag.actualQty, 0)} ${diag.unit}</strong></span>
      </div>
      <div class="text-right font-mono-numbers">
        <span class="block text-[10px] text-rose-700 uppercase font-bold">Daily Loss Incurred</span>
        <span class="text-xl font-extrabold text-rose-700">${formatAED(diag.profitLossAED)}</span>
        <span class="text-xs font-bold text-rose-800 bg-rose-200 px-2 py-0.5 rounded block mt-0.5">${formatNum(diag.profitLossPercent, 1)}% Variance</span>
      </div>
    </div>

    <div class="space-y-3">
      ${solutionsHtml}
    </div>
  `;

  showModal('modal-solution');
}

function closeSolutionModal() {
  hideModal('modal-solution');
}

// Modal Visibility Helpers (Safe against inline styles and CSS framework classes)
function showModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.style.display = 'flex';
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('hidden');
  el.style.display = 'none';
}

// Rate Mode Switchers & Handlers for Daily Log
function setDailyCostMode(mode) {
  const isManual = (mode === 'manual');
  const inpMode = document.getElementById('inp-daily-cost-mode');
  if (inpMode) inpMode.value = isManual ? 'manual' : 'gang';

  const btnGang = document.getElementById('btn-daily-cost-mode-gang');
  const btnManual = document.getElementById('btn-daily-cost-mode-manual');
  if (btnGang && btnManual) {
    if (isManual) {
      btnManual.className = 'px-3 py-1 rounded-md bg-sky-600 text-white font-bold shadow-2xs cursor-pointer';
      btnGang.className = 'px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
    } else {
      btnGang.className = 'px-3 py-1 rounded-md bg-sky-600 text-white font-bold shadow-2xs cursor-pointer';
      btnManual.className = 'px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
    }
  }

  const rowManual = document.getElementById('row-daily-manual-inputs');
  if (rowManual) {
    rowManual.classList.toggle('hidden', !isManual);
  }

  triggerDailyModalCalculation();
}

function handleDailyManualUnitCostInput(val) {
  const unitCost = parseFloat(val);
  const actualQty = parseFloat(document.getElementById('inp-daily-qty')?.value) || 0;
  const inpTotal = document.getElementById('inp-daily-manual-total-cost');
  if (inpTotal && !isNaN(unitCost) && unitCost >= 0 && actualQty > 0) {
    inpTotal.value = (unitCost * actualQty).toFixed(2);
  }
  triggerDailyModalCalculation();
}

function handleDailyManualTotalCostInput(val) {
  const totalCost = parseFloat(val);
  const actualQty = parseFloat(document.getElementById('inp-daily-qty')?.value) || 0;
  const inpUnit = document.getElementById('inp-daily-manual-unit-cost');
  if (inpUnit && !isNaN(totalCost) && totalCost >= 0 && actualQty > 0) {
    inpUnit.value = (totalCost / actualQty).toFixed(2);
  }
  triggerDailyModalCalculation();
}

// Log Daily Activity Modal
function openDailyModal(log = null, defaultActivityId = null) {
  const prj = getCurrentProject();
  if (!prj) return;

  const isAdmin = isCurrentUserAdmin();
  const today = getTodayDate();

  if (!Array.isArray(prj.fixedActivities) || prj.fixedActivities.length === 0) {
    if (isAdmin) {
      if (confirm('You must create at least one Fixed Candy Activity before logging daily actual work.\n\nWould you like to add a Fixed Activity now?')) {
        openFixedActivityModal();
      }
    } else {
      alert('No Fixed Candy Activities exist for this project. Please contact the Administrator to configure fixed baseline activities first.');
    }
    return;
  }

  const title = document.getElementById('modal-daily-title');
  const hiddenInp = document.getElementById('inp-daily-activity-id');
  const dtInp = document.getElementById('inp-daily-date');

  const isManualDailyAllowed = isManualDailyRateEnabled();
  const rowDailyCostMode = document.getElementById('row-daily-cost-mode');
  if (rowDailyCostMode) {
    rowDailyCostMode.style.display = isManualDailyAllowed ? 'flex' : 'none';
  }

  let targetMode = 'gang';

  if (log) {
    appState.editingDailyLogId = log.id;
    if (title) title.textContent = `Edit Daily Site Execution [${log.date}]`;
    if (dtInp) {
      dtInp.value = log.date;
      dtInp.disabled = false;
      dtInp.title = 'Execution date';
    }
    if (hiddenInp) hiddenInp.value = log.activityId;
    populateModalDailyActivityDropdown(log.activityId);
    const qtyInp = document.getElementById('inp-daily-qty');
    if (qtyInp) qtyInp.value = log.actualQty;
    const notesInp = document.getElementById('inp-daily-notes');
    if (notesInp) notesInp.value = log.notes || '';
    populateDailyLabourInputs(log.actualLabourHours || {});
    populateDailyPlantInputs(log.actualPlantHours || {});

    const unitInp = document.getElementById('inp-daily-manual-unit-cost');
    const totInp = document.getElementById('inp-daily-manual-total-cost');
    if (unitInp) unitInp.value = log.manualUnitCost !== undefined && log.manualUnitCost > 0 ? log.manualUnitCost : '';
    if (totInp) totInp.value = log.manualTotalCost !== undefined && log.manualTotalCost > 0 ? log.manualTotalCost : '';

    if (log.costMode === 'manual' || (parseFloat(log.manualUnitCost) > 0 || parseFloat(log.manualTotalCost) > 0)) {
      targetMode = 'manual';
    } else {
      targetMode = 'gang';
    }
  } else {
    appState.editingDailyLogId = null;
    if (title) title.textContent = 'Log Daily Site Execution & Productivity';
    if (dtInp) {
      dtInp.value = today;
      dtInp.disabled = false;
      dtInp.title = 'Execution date';
    }
    
    const targetActId = defaultActivityId || (prj.fixedActivities[0] ? prj.fixedActivities[0].id : '');
    if (hiddenInp) hiddenInp.value = targetActId;
    populateModalDailyActivityDropdown(targetActId);
    
    const act = prj.fixedActivities.find(a => a.id === targetActId) || prj.fixedActivities[0];
    const qtyInp = document.getElementById('inp-daily-qty');
    if (qtyInp) qtyInp.value = act ? (act.workoutQty || 100) : 100;
    const notesInp = document.getElementById('inp-daily-notes');
    if (notesInp) notesInp.value = '';
    populateDailyLabourInputs(act ? (act.labourHours || {}) : {});
    populateDailyPlantInputs(act ? (act.plantHours || {}) : {});

    const unitInp = document.getElementById('inp-daily-manual-unit-cost');
    const totInp = document.getElementById('inp-daily-manual-total-cost');
    if (unitInp) unitInp.value = '';
    if (totInp) totInp.value = '';
    targetMode = 'gang';
  }

  updateDailyModalLabels();
  setDailyCostMode(isManualDailyAllowed ? targetMode : 'gang');
  showModal('modal-daily');
}

function openDailyModalForActivity(actId, e) {
  if (e) e.stopPropagation();
  openDailyModal(null, actId);
}

function closeDailyModal() {
  hideModal('modal-daily');
  appState.editingDailyLogId = null;
}

function updateDailyModalLabels() {
  const prj = getCurrentProject();
  if (!prj) return;
  const actInp = document.getElementById('inp-daily-activity-id');
  if (!actInp) return;
  const actId = actInp.value;
  const act = (prj.fixedActivities || []).find(a => a.id === actId);
  if (!act) return;

  const calc = calculateFixedActivity(act, prj);
  const lblUnit = document.getElementById('label-daily-unit');
  const lblRate = document.getElementById('label-daily-budget-rate');
  if (lblUnit) lblUnit.textContent = act.unit;
  if (lblRate) lblRate.textContent = `${formatAED(calc.budgetUnitRate)} / ${act.unit}`;
}

function populateDailyLabourInputs(hours = {}) {
  const container = document.getElementById('daily-labour-container');
  if (!container) return;
  container.innerHTML = '';
  const prj = getCurrentProject();

  getActiveLabourTrades().forEach(trade => {
    const rate = prj.labourRates?.[trade.id] ?? trade.rate;
    const val = hours[trade.id] || '';
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200 gap-2';

    row.innerHTML = `
      <div class="flex-1">
        <span class="font-bold text-slate-800 text-xs block">${trade.name}</span>
        <span class="text-[10px] text-emerald-700 font-mono-numbers">${formatNum(rate, 2)} AED/hr</span>
      </div>
      <div class="flex items-center gap-1 font-mono-numbers">
        <input type="number" step="any" min="0" data-trade-id="${trade.id}" value="${val}"
          class="inp-daily-labour-hrs w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500" placeholder="0">
        <span class="text-[10px] text-slate-400">Hrs</span>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.inp-daily-labour-hrs').forEach(inp => {
    inp.addEventListener('input', triggerDailyModalCalculation);
  });
}

function populateDailyPlantInputs(hours = {}) {
  const container = document.getElementById('daily-plant-container');
  if (!container) return;
  container.innerHTML = '';
  const prj = getCurrentProject();

  getActivePlantEquipment().forEach(plant => {
    const rate = prj.plantRates?.[plant.id] ?? plant.rate;
    const val = hours[plant.id] || '';
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200 gap-2';

    row.innerHTML = `
      <div class="flex-1">
        <span class="font-bold text-slate-800 text-xs block truncate max-w-[150px]">${plant.name}</span>
        <span class="text-[10px] text-blue-700 font-mono-numbers">${formatNum(rate, 2)} AED/${plant.unit}</span>
      </div>
      <div class="flex items-center gap-1 font-mono-numbers">
        <input type="number" step="any" min="0" data-plant-id="${plant.id}" value="${val}"
          class="inp-daily-plant-hrs w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500" placeholder="0">
        <span class="text-[10px] text-slate-400">${plant.unit}</span>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.inp-daily-plant-hrs').forEach(inp => {
    inp.addEventListener('input', triggerDailyModalCalculation);
  });
}

function triggerDailyModalCalculation() {
  const prj = getCurrentProject();
  const actId = document.getElementById('inp-daily-activity-id')?.value;
  const act = prj?.fixedActivities?.find(a => a.id === actId);
  const actualQty = parseFloat(document.getElementById('inp-daily-qty')?.value) || 0;
  const actCalc = act ? calculateFixedActivity(act, prj) : { budgetUnitRate: 0 };
  const mode = document.getElementById('inp-daily-cost-mode')?.value || 'gang';

  let actualLabourCost = 0;
  document.querySelectorAll('.inp-daily-labour-hrs').forEach(inp => {
    const tid = inp.dataset.tradeId;
    const hrs = parseFloat(inp.value) || 0;
    const rate = prj?.labourRates?.[tid] ?? 10;
    actualLabourCost += hrs * rate;
  });

  let actualPlantCost = 0;
  document.querySelectorAll('.inp-daily-plant-hrs').forEach(inp => {
    const pid = inp.dataset.plantId;
    const hrs = parseFloat(inp.value) || 0;
    const rate = prj?.plantRates?.[pid] ?? 50;
    actualPlantCost += hrs * rate;
  });

  let actualCost = actualLabourCost + actualPlantCost;
  let actualUnitCost = actualQty > 0 ? (actualCost / actualQty) : 0;

  if (mode === 'manual') {
    const manualUnit = parseFloat(document.getElementById('inp-daily-manual-unit-cost')?.value);
    const manualTotal = parseFloat(document.getElementById('inp-daily-manual-total-cost')?.value);

    if (!isNaN(manualUnit) && manualUnit >= 0) {
      actualUnitCost = manualUnit;
      actualCost = (!isNaN(manualTotal) && manualTotal > 0) ? manualTotal : (actualQty * manualUnit);
    } else if (!isNaN(manualTotal) && manualTotal >= 0) {
      actualCost = manualTotal;
      actualUnitCost = actualQty > 0 ? (manualTotal / actualQty) : 0;
    }
  }

  const earnedBudget = actualQty * actCalc.budgetUnitRate;
  const pnlAED = earnedBudget - actualCost;
  const pnlPercent = earnedBudget > 0 ? (pnlAED / earnedBudget) * 100 : (actualCost > 0 ? -100 : 0);

  const elLabour = document.getElementById('badge-daily-actual-labour');
  if (elLabour) elLabour.textContent = formatAED(actualLabourCost);
  const elPlant = document.getElementById('badge-daily-actual-plant');
  if (elPlant) elPlant.textContent = formatAED(actualPlantCost);

  const elPnlVal = document.getElementById('daily-prev-pnl-val');
  if (elPnlVal) elPnlVal.textContent = `${pnlAED >= 0 ? '+' : ''}${formatAED(pnlAED)}`;
  const elPnlPct = document.getElementById('daily-prev-pnl-percent');
  if (elPnlPct) elPnlPct.textContent = `${pnlAED >= 0 ? '+' : ''}${formatNum(pnlPercent, 1)}%`;
  const elRate = document.getElementById('daily-prev-actual-rate');
  if (elRate) elRate.textContent = formatAED(actualUnitCost);
  const elEarned = document.getElementById('daily-prev-earned');
  if (elEarned) elEarned.textContent = formatAED(earnedBudget);
  const elCost = document.getElementById('daily-prev-cost');
  if (elCost) elCost.textContent = formatAED(actualCost);

  const previewBox = document.getElementById('daily-preview-box');
  if (previewBox) {
    if (pnlAED >= 0) {
      previewBox.className = 'p-4 rounded-xl border bg-emerald-50/60 border-emerald-200 font-mono-numbers flex flex-wrap items-center justify-between gap-4';
      if (elPnlVal) elPnlVal.className = 'text-2xl font-extrabold text-emerald-600';
      if (elPnlPct) elPnlPct.className = 'text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full';
    } else {
      previewBox.className = 'p-4 rounded-xl border bg-rose-50/60 border-rose-200 font-mono-numbers flex flex-wrap items-center justify-between gap-4';
      if (elPnlVal) elPnlVal.className = 'text-2xl font-extrabold text-rose-600';
      if (elPnlPct) elPnlPct.className = 'text-sm font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full';
    }
  }
}

// SAVE DAILY LOG
let isSavingDaily = false;
function saveDailyLogFromModal() {
  if (isSavingDaily) return;
  isSavingDaily = true;
  try {
    const prj = getCurrentProject();
    if (!prj) return;

    const date = document.getElementById('inp-daily-date').value;
    const activityId = document.getElementById('inp-daily-activity-id').value;
    const actualQty = parseFloat(document.getElementById('inp-daily-qty').value);
    const notes = document.getElementById('inp-daily-notes').value.trim();
    const costMode = document.getElementById('inp-daily-cost-mode')?.value || 'gang';
    const manualUnitCost = parseFloat(document.getElementById('inp-daily-manual-unit-cost')?.value) || 0;
    const manualTotalCost = parseFloat(document.getElementById('inp-daily-manual-total-cost')?.value) || 0;

    if (!date) {
      alert('Please enter a valid execution date.');
      return;
    }
    if (isNaN(actualQty) || actualQty <= 0) {
      alert('Please enter an actual quantity executed greater than 0.');
      return;
    }
    if (!activityId) {
      alert('Please select a fixed sub-activity.');
      return;
    }

    if (costMode === 'manual' && manualUnitCost <= 0 && manualTotalCost <= 0) {
      alert('Please enter Direct Actual Unit Cost or Total Spend Today.');
      return;
    }

    const actualLabourHours = {};
    document.querySelectorAll('.inp-daily-labour-hrs').forEach(inp => {
      const val = parseFloat(inp.value);
      if (val > 0) actualLabourHours[inp.dataset.tradeId] = val;
    });

    const actualPlantHours = {};
    document.querySelectorAll('.inp-daily-plant-hrs').forEach(inp => {
      const val = parseFloat(inp.value);
      if (val > 0) actualPlantHours[inp.dataset.plantId] = val;
    });

    if (!Array.isArray(prj.dailyLogs)) prj.dailyLogs = [];

    if (appState.editingDailyLogId) {
      const idx = prj.dailyLogs.findIndex(l => l.id === appState.editingDailyLogId);
      if (idx !== -1) {
        prj.dailyLogs[idx] = {
          ...prj.dailyLogs[idx],
          date,
          activityId,
          actualQty,
          actualLabourHours,
          actualPlantHours,
          notes,
          costMode,
          manualUnitCost,
          manualTotalCost
        };
        showToast('Daily activity updated successfully!');
      }
    } else {
      const newLog = {
        id: 'log-' + Date.now(),
        date,
        activityId,
        actualQty,
        actualLabourHours,
        actualPlantHours,
        notes,
        costMode,
        manualUnitCost,
        manualTotalCost
      };
      prj.dailyLogs.push(newLog);
      showToast(`Recorded daily execution of ${formatNum(actualQty, 0)} units successfully!`);
    }

    // Ensure this activity is expanded so user immediately sees their log in both baseline & matrix!
    appState.expandedActivityIds.add(activityId);
    appState.matrixExpandedActivityIds.add(activityId);

    // Reset daily filters so the newly logged entry is immediately visible in Tab 3 Daily Logs table
    appState.filterDailyActivityId = 'ALL';
    appState.filterDailyDate = '';
    const dtInp = document.getElementById('filter-daily-date');
    if (dtInp) dtInp.value = '';
    const actLabel = document.getElementById('label-filter-daily-act');
    if (actLabel) actLabel.textContent = 'All Sub-Activities';

    saveState();
    closeDailyModal();
    renderApp();
  } finally {
    setTimeout(() => { isSavingDaily = false; }, 350);
  }
}

function editDailyLog(id, e) {
  if (e) e.stopPropagation();
  const prj = getCurrentProject();
  const log = prj.dailyLogs.find(l => l.id === id);
  if (log) openDailyModal(log);
}

function deleteDailyLog(id, e) {
  if (e) e.stopPropagation();
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete daily site execution logs');
    return;
  }
  if (confirm('Are you sure you want to delete this daily site execution log?')) {
    const prj = getCurrentProject();
    prj.dailyLogs = prj.dailyLogs.filter(l => l.id !== id);
    saveState();
    renderApp();
    showToast('Daily site log removed.');
  }
}

// ========================================================
// FIXED ACTIVITY MODAL & SEARCHABLE DROPDOWNS
// ========================================================

function selectFixedDivision(code, label) {
  const inp = document.getElementById('inp-division');
  const lbl = document.getElementById('label-fixed-division');
  if (inp) inp.value = code;
  if (lbl) lbl.textContent = label || code;
  closeAllDropdowns();
}

function selectFixedUnit(unit) {
  const inp = document.getElementById('inp-unit');
  const lbl = document.getElementById('label-fixed-unit');
  const modalUnitLbl = document.getElementById('label-modal-unit');
  if (inp) inp.value = unit;
  if (lbl) lbl.textContent = unit;
  if (modalUnitLbl) modalUnitLbl.textContent = unit;
  closeAllDropdowns();
}

function populateFixedUnitDropdown(selectedUnit = 'm3') {
  const container = document.getElementById('options-fixed-unit');
  const label = document.getElementById('label-fixed-unit');
  const inp = document.getElementById('inp-unit');
  const modalUnitLbl = document.getElementById('label-modal-unit');
  if (!container) return;

  container.innerHTML = '';
  const units = getActiveUnits();
  const cur = selectedUnit || (inp?.value) || 'm3';

  units.forEach(u => {
    const isSel = u === cur;
    if (isSel) {
      if (label) label.textContent = u;
      if (inp) inp.value = u;
      if (modalUnitLbl) modalUnitLbl.textContent = u;
    }
    const div = document.createElement('div');
    div.className = `dropdown-item p-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium text-xs flex items-center justify-between ${isSel ? 'is-selected font-bold text-sky-700 bg-sky-50' : ''}`;
    div.dataset.search = u.toLowerCase();
    div.onclick = () => selectFixedUnit(u);
    div.innerHTML = `
      <span>${u}</span>
      ${isSel ? '<i data-lucide="check" class="w-3.5 h-3.5 text-sky-600"></i>' : ''}
    `;
    container.appendChild(div);
  });
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function selectFixedMainActivity(code, desc, batchQty) {
  const codeInp = document.getElementById('inp-fixed-main-code');
  const descInp = document.getElementById('inp-fixed-main-desc');
  const lbl = document.getElementById('label-fixed-main-act');
  const wQty = document.getElementById('inp-workout-qty');

  if (codeInp) codeInp.value = code;
  if (descInp) descInp.value = desc;
  if (lbl) lbl.textContent = `${code} - ${desc}`;
  if (batchQty && wQty) {
    wQty.value = batchQty;
    triggerFixedModalCalculation();
  }
  closeAllDropdowns();
}

function populateFixedMainActivityDropdown(selectedCode = null) {
  const container = document.getElementById('options-fixed-main-act');
  const label = document.getElementById('label-fixed-main-act');
  const codeInp = document.getElementById('inp-fixed-main-code');
  const descInp = document.getElementById('inp-fixed-main-desc');
  if (!container) return;

  container.innerHTML = '';
  const mains = getActiveMainActivities();
  const currentCode = (selectedCode !== null && selectedCode !== undefined) ? selectedCode : (codeInp?.value || '');
  const isNoneSelected = !currentCode || currentCode === 'NONE' || currentCode === '';

  // 1. Standalone Option
  const noneDiv = document.createElement('div');
  noneDiv.className = `dropdown-item p-2 rounded-lg flex items-start justify-between cursor-pointer gap-2 ${isNoneSelected ? 'is-selected bg-slate-100 text-slate-900 font-bold border border-slate-300' : 'hover:bg-slate-50 text-slate-700'}`;
  noneDiv.dataset.search = 'none standalone no main activity';
  noneDiv.onclick = () => {
    if (label) label.textContent = '-- None / Standalone Activity (No Main Activity) --';
    if (codeInp) codeInp.value = '';
    if (descInp) descInp.value = '';
    populateFixedMainActivityDropdown('');
  };
  noneDiv.innerHTML = `
    <div class="flex flex-col">
      <div class="flex items-center gap-1.5">
        <span class="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold text-xs">NONE</span>
        <span class="text-xs text-slate-800 font-bold">-- None / Standalone Activity --</span>
      </div>
      <span class="text-[10px] text-slate-500 mt-0.5">Standalone BOQ item with no parent Main Activity banner (Photo 3 Row 1)</span>
    </div>
    ${isNoneSelected ? '<i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>' : ''}
  `;
  container.appendChild(noneDiv);

  if (isNoneSelected) {
    if (label) label.textContent = '-- None / Standalone Activity (No Main Activity) --';
    if (codeInp) codeInp.value = '';
    if (descInp) descInp.value = '';
  }

  // 2. Master Main Activities
  mains.forEach(m => {
    const isSel = !isNoneSelected && (m.code === currentCode);
    if (isSel) {
      if (label) label.textContent = `${m.code} - ${m.description}`;
      if (codeInp) codeInp.value = m.code;
      if (descInp) descInp.value = m.description;
    }

    const div = document.createElement('div');
    div.className = `dropdown-item p-2 rounded-lg flex items-start justify-between cursor-pointer gap-2 ${isSel ? 'is-selected bg-red-50 text-red-950 font-bold border border-red-200' : 'hover:bg-slate-50 text-slate-800'}`;
    div.dataset.search = `${m.code} ${m.description}`.toLowerCase();
    div.onclick = () => selectFixedMainActivity(m.code, m.description, m.defaultBatchQty || m.workoutQty);

    div.innerHTML = `
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-mono font-bold text-xs">${m.code}</span>
          <span class="text-[10px] text-slate-500 font-mono-numbers">Batch: ${m.defaultBatchQty || m.workoutQty || 100}</span>
        </div>
        <span class="text-xs text-slate-900 font-semibold mt-0.5 leading-snug">${m.description}</span>
      </div>
      ${isSel ? '<i data-lucide="check" class="w-4 h-4 text-red-600 shrink-0"></i>' : ''}
    `;
    container.appendChild(div);
  });

  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function setFixedRateMode(mode) {
  const isManual = (mode === 'manual');
  const inpMode = document.getElementById('inp-fixed-rate-mode');
  if (inpMode) inpMode.value = isManual ? 'manual' : 'norms';

  const btnNorms = document.getElementById('btn-rate-mode-norms');
  const btnManual = document.getElementById('btn-rate-mode-manual');
  if (btnNorms && btnManual) {
    if (isManual) {
      btnManual.className = 'px-3 py-1 rounded-md bg-amber-600 text-white font-bold shadow-2xs cursor-pointer';
      btnNorms.className = 'px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
    } else {
      btnNorms.className = 'px-3 py-1 rounded-md bg-amber-600 text-white font-bold shadow-2xs cursor-pointer';
      btnManual.className = 'px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
    }
  }

  const badgeAllowable = document.getElementById('badge-allowable-active');
  if (badgeAllowable) {
    badgeAllowable.classList.toggle('hidden', !isManual);
  }

  const noteGang = document.getElementById('note-gang-optional');
  if (noteGang) {
    noteGang.classList.toggle('hidden', !isManual);
  }

  triggerFixedModalCalculation();
}

function openFixedActivityModal(activity = null) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied(activity ? 'edit Fixed Candy Baselines' : 'create Fixed Candy Baselines');
    return;
  }
  const modal = document.getElementById('modal-activity');
  const title = document.getElementById('modal-activity-title');
  const prj = getCurrentProject();

  populateFixedDivisionDropdown();

  const isManualAllowed = isManualFixedRateEnabled();
  const rowRateMode = document.getElementById('row-fixed-rate-mode');
  if (rowRateMode) {
    rowRateMode.style.display = isManualAllowed ? 'flex' : 'none';
  }

  let targetMode = 'norms';

  if (activity) {
    appState.editingFixedActivityId = activity.id;
    title.textContent = `Edit Fixed Activity Budget [${activity.code}]`;
    document.getElementById('inp-code').value = activity.code;
    selectFixedDivision(activity.division, activity.division);
    document.getElementById('inp-zone').value = activity.zone || '';
    populateFixedUnitDropdown(activity.unit);
    document.getElementById('inp-total-qty').value = activity.totalQty;
    document.getElementById('inp-allowable-rate').value = activity.allowableRate || '';
    document.getElementById('inp-description').value = activity.subActivity;
    document.getElementById('inp-workout-qty').value = activity.workoutQty;
    populateFixedMainActivityDropdown(activity.mainActivityCode || '');
    populateModalLabourInputs(activity.labourHours || {});
    populateModalPlantInputs(activity.plantHours || {});

    const hasLabour = Object.values(activity.labourHours || {}).some(v => parseFloat(v) > 0);
    const hasPlant = Object.values(activity.plantHours || {}).some(v => parseFloat(v) > 0);
    if (activity.rateMode === 'manual' || (parseFloat(activity.allowableRate) > 0 && !hasLabour && !hasPlant)) {
      targetMode = 'manual';
    } else {
      targetMode = 'norms';
    }
  } else {
    appState.editingFixedActivityId = null;
    title.textContent = 'Add New Fixed Activity Budget (Candy Baseline)';
    document.getElementById('inp-code').value = '2211' + (prj.fixedActivities.length + 1).toString().padStart(4, '0');
    const divs = getActiveDivisions();
    selectFixedDivision(divs[0]?.code || 'SL', divs[0]?.name || 'Soft Landscaping');
    document.getElementById('inp-zone').value = 'Zone 1';
    populateFixedUnitDropdown('m3');
    document.getElementById('inp-total-qty').value = 1000;
    document.getElementById('inp-allowable-rate').value = '';
    document.getElementById('inp-description').value = '';
    document.getElementById('inp-workout-qty').value = 200;
    populateFixedMainActivityDropdown(''); // default standalone
    populateModalLabourInputs({ helper: 100, charge_hand: 10 });
    populateModalPlantInputs({ jcb: 10, bobcat: 10 });
    targetMode = 'norms';
  }

  toggleAddLabourInline(false);
  toggleAddPlantInline(false);
  toggleCustomMainActInput(false);
  document.getElementById('label-modal-unit').textContent = document.getElementById('inp-unit').value;
  setFixedRateMode(isManualAllowed ? targetMode : 'norms');
  showModal('modal-activity');
}

function closeFixedActivityModal() {
  hideModal('modal-activity');
  appState.editingFixedActivityId = null;
}

function populateModalLabourInputs(hours = {}) {
  const container = document.getElementById('modal-labour-container');
  if (!container) return;
  container.innerHTML = '';
  const prj = getCurrentProject();

  getActiveLabourTrades().forEach(trade => {
    const rate = prj.labourRates?.[trade.id] ?? trade.rate;
    const val = hours[trade.id] || '';
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200 gap-2';

    row.innerHTML = `
      <div class="flex-1">
        <span class="font-bold text-slate-800 text-xs block">${trade.name}</span>
        <span class="text-[10px] text-emerald-700 font-mono-numbers">${formatNum(rate, 2)} AED/hr</span>
      </div>
      <div class="flex items-center gap-1 font-mono-numbers">
        <input type="number" step="any" min="0" data-trade-id="${trade.id}" value="${val}"
          class="inp-modal-labour-hrs w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500" placeholder="0">
        <span class="text-[10px] text-slate-400">Hrs</span>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.inp-modal-labour-hrs').forEach(inp => {
    inp.addEventListener('input', triggerFixedModalCalculation);
  });
}

function populateModalPlantInputs(hours = {}) {
  const container = document.getElementById('modal-plant-container');
  if (!container) return;
  container.innerHTML = '';
  const prj = getCurrentProject();

  getActivePlantEquipment().forEach(plant => {
    const rate = prj.plantRates?.[plant.id] ?? plant.rate;
    const val = hours[plant.id] || '';
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200 gap-2';

    row.innerHTML = `
      <div class="flex-1">
        <span class="font-bold text-slate-800 text-xs block truncate max-w-[150px]">${plant.name}</span>
        <span class="text-[10px] text-blue-700 font-mono-numbers">${formatNum(rate, 2)} AED/${plant.unit}</span>
      </div>
      <div class="flex items-center gap-1 font-mono-numbers">
        <input type="number" step="any" min="0" data-plant-id="${plant.id}" value="${val}"
          class="inp-modal-plant-hrs w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500" placeholder="0">
        <span class="text-[10px] text-slate-400">${plant.unit}</span>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.inp-modal-plant-hrs').forEach(inp => {
    inp.addEventListener('input', triggerFixedModalCalculation);
  });
}

function triggerFixedModalCalculation() {
  const prj = getCurrentProject();
  const workoutQty = parseFloat(document.getElementById('inp-workout-qty')?.value) || 1;
  const totalQty = parseFloat(document.getElementById('inp-total-qty')?.value) || 0;
  const allowableRate = parseFloat(document.getElementById('inp-allowable-rate')?.value) || 0;
  const mode = document.getElementById('inp-fixed-rate-mode')?.value || 'norms';

  let workoutLabourCost = 0;
  document.querySelectorAll('.inp-modal-labour-hrs').forEach(inp => {
    const tid = inp.dataset.tradeId;
    const hrs = parseFloat(inp.value) || 0;
    const rate = prj?.labourRates?.[tid] ?? 10;
    workoutLabourCost += hrs * rate;
  });

  let workoutPlantCost = 0;
  document.querySelectorAll('.inp-modal-plant-hrs').forEach(inp => {
    const pid = inp.dataset.plantId;
    const hrs = parseFloat(inp.value) || 0;
    const rate = prj?.plantRates?.[pid] ?? 50;
    workoutPlantCost += hrs * rate;
  });

  const unitLabourCost = workoutQty > 0 ? (workoutLabourCost / workoutQty) : 0;
  const unitPlantCost = workoutQty > 0 ? (workoutPlantCost / workoutQty) : 0;
  const gangUnitRate = unitLabourCost + unitPlantCost;

  let budgetUnitRate = gangUnitRate;
  if (mode === 'manual' && allowableRate > 0) {
    budgetUnitRate = allowableRate;
  } else if (gangUnitRate === 0 && allowableRate > 0) {
    budgetUnitRate = allowableRate;
  }
  const totalBudgetAmount = totalQty * budgetUnitRate;

  const bLab = document.getElementById('badge-workout-labour-cost');
  if (bLab) bLab.textContent = formatAED(workoutLabourCost);
  const bPlant = document.getElementById('badge-workout-plant-cost');
  if (bPlant) bPlant.textContent = formatAED(workoutPlantCost);

  const prevLabour = document.getElementById('prev-unit-labour');
  if (prevLabour) prevLabour.textContent = formatAED(unitLabourCost);
  const prevPlant = document.getElementById('prev-unit-plant');
  if (prevPlant) prevPlant.textContent = formatAED(unitPlantCost);
  const prevTotal = document.getElementById('prev-unit-total');
  if (prevTotal) {
    if (mode === 'manual' && allowableRate > 0) {
      prevTotal.textContent = `${formatAED(budgetUnitRate)} (Contract Unit Rate)`;
    } else {
      prevTotal.textContent = formatAED(budgetUnitRate);
    }
  }
  const prevAmount = document.getElementById('prev-total-amount');
  if (prevAmount) prevAmount.textContent = formatAED(totalBudgetAmount);
}

let isSavingFixed = false;
function saveFixedActivityFromModal() {
  if (isSavingFixed) return;
  if (!isCurrentUserAdmin()) {
    showAccessDenied('modify Fixed Candy Baselines');
    return;
  }
  isSavingFixed = true;
  try {
    const prj = getCurrentProject();
    if (!prj) return;
    const code = document.getElementById('inp-code').value.trim();
    const subActivity = document.getElementById('inp-description').value.trim();
    const division = document.getElementById('inp-division').value;
    const zone = document.getElementById('inp-zone').value.trim();
    const unit = document.getElementById('inp-unit').value;
    const totalQty = parseFloat(document.getElementById('inp-total-qty').value) || 0;
    const workoutQty = parseFloat(document.getElementById('inp-workout-qty').value) || 1;
    const allowableRate = parseFloat(document.getElementById('inp-allowable-rate').value) || 0;
    const rateMode = document.getElementById('inp-fixed-rate-mode')?.value || 'norms';
    let mainActivityCode = (document.getElementById('inp-fixed-main-code')?.value || '').trim();
    let mainActivityDesc = (document.getElementById('inp-fixed-main-desc')?.value || '').trim();

    if (mainActivityCode === 'NONE') {
      mainActivityCode = '';
      mainActivityDesc = '';
    }

    if (!code || !subActivity) {
      alert('Please enter Candy Code and Sub-Activity description.');
      return;
    }

    const labourHours = {};
    document.querySelectorAll('.inp-modal-labour-hrs').forEach(inp => {
      const val = parseFloat(inp.value);
      if (val > 0) labourHours[inp.dataset.tradeId] = val;
    });

    const plantHours = {};
    document.querySelectorAll('.inp-modal-plant-hrs').forEach(inp => {
      const val = parseFloat(inp.value);
      if (val > 0) plantHours[inp.dataset.plantId] = val;
    });

    if (!Array.isArray(prj.fixedActivities)) prj.fixedActivities = [];

    if (appState.editingFixedActivityId) {
      const idx = prj.fixedActivities.findIndex(a => a.id === appState.editingFixedActivityId);
      if (idx !== -1) {
        prj.fixedActivities[idx] = {
          ...prj.fixedActivities[idx],
          code,
          division,
          zone,
          subActivity,
          unit,
          totalQty,
          workoutQty,
          allowableRate,
          rateMode,
          mainActivityCode,
          mainActivityDesc,
          labourHours,
          plantHours
        };
        logAuditAction('UPDATE_FIXED_ACTIVITY', code, `Updated fixed baseline for: ${subActivity}`);
        showToast(`Updated activity ${code}`);
      }
    } else {
      const newAct = {
        id: 'act-' + Date.now(),
        code,
        division,
        zone,
        subActivity,
        unit,
        totalQty,
        workoutQty,
        allowableRate,
        rateMode,
        mainActivityCode,
        mainActivityDesc,
        labourHours,
        plantHours
      };
      prj.fixedActivities.push(newAct);
      appState.expandedActivityIds.add(newAct.id);
      appState.matrixExpandedActivityIds.add(newAct.id);
      logAuditAction('CREATE_FIXED_ACTIVITY', code, `Created new fixed baseline: ${subActivity}`);
      showToast(`Added new Fixed Candy Activity ${code}`);
    }

    saveState();
    closeFixedActivityModal();
    renderApp();
  } finally {
    setTimeout(() => { isSavingFixed = false; }, 350);
  }
}

function editFixedActivity(id, e) {
  if (e) e.stopPropagation();
  if (!isCurrentUserAdmin()) {
    showAccessDenied('edit Fixed Candy Baselines');
    return;
  }
  const prj = getCurrentProject();
  const act = prj.fixedActivities.find(a => a.id === id);
  if (act) openFixedActivityModal(act);
}

function deleteFixedActivity(id, e) {
  if (e) e.stopPropagation();
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete Fixed Candy Baselines');
    return;
  }
  if (confirm('Delete this fixed activity? This will also remove its associated daily site logs.')) {
    const prj = getCurrentProject();
    prj.fixedActivities = prj.fixedActivities.filter(a => a.id !== id);
    prj.dailyLogs = prj.dailyLogs.filter(l => l.activityId !== id);
    saveState();
    renderApp();
    showToast('Fixed activity deleted.');
  }
}

// ========================================================
// PROJECT MODAL & EDITING
// ========================================================

function openProjectModal() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('create new projects');
    return;
  }
  const title = document.getElementById('modal-project-title');
  const btnLabel = document.getElementById('btn-save-project-label');
  const editIdInp = document.getElementById('inp-proj-editing-id');
  if (title) title.textContent = 'Create New Construction Project';
  if (btnLabel) btnLabel.textContent = 'Create Project';
  if (editIdInp) editIdInp.value = '';

  document.getElementById('inp-proj-name').value = '';
  document.getElementById('inp-proj-code').value = 'PRJ-' + (appState.projects.length + 1).toString().padStart(4, '0');
  document.getElementById('inp-proj-client').value = '';
  document.getElementById('inp-proj-start').value = new Date().toISOString().slice(0, 10);
  document.getElementById('inp-proj-end').value = '';
  showModal('modal-project');
}

function openEditProjectModal() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('edit project profile details');
    return;
  }
  const prj = getCurrentProject();
  if (!prj) return;
  const title = document.getElementById('modal-project-title');
  const btnLabel = document.getElementById('btn-save-project-label');
  const editIdInp = document.getElementById('inp-proj-editing-id');

  if (title) title.textContent = `Edit Project Profile [${prj.code}]`;
  if (btnLabel) btnLabel.textContent = 'Update Project Details';
  if (editIdInp) editIdInp.value = prj.id;

  const nameInp = document.getElementById('inp-proj-name');
  const codeInp = document.getElementById('inp-proj-code');
  const clientInp = document.getElementById('inp-proj-client');
  const startInp = document.getElementById('inp-proj-start');
  const endInp = document.getElementById('inp-proj-end');

  if (nameInp) nameInp.value = prj.name || '';
  if (codeInp) codeInp.value = prj.code || '';
  if (clientInp) clientInp.value = prj.client || '';
  if (startInp) startInp.value = prj.startDate || '';
  if (endInp) endInp.value = prj.targetEndDate || '';

  showModal('modal-project');
}

function closeProjectModal() {
  hideModal('modal-project');
}

let isSavingProject = false;
function saveProjectFromModal() {
  if (isSavingProject) return;
  if (!isCurrentUserAdmin()) {
    showAccessDenied('create or edit projects');
    return;
  }
  isSavingProject = true;
  try {
    const editId = document.getElementById('inp-proj-editing-id')?.value;
    const name = document.getElementById('inp-proj-name').value.trim();
    const code = document.getElementById('inp-proj-code').value.trim();
    const client = document.getElementById('inp-proj-client').value.trim();
    const startDate = document.getElementById('inp-proj-start').value;
    const targetEndDate = document.getElementById('inp-proj-end').value;

    if (!name || !code) {
      alert('Please enter Project Name and Code.');
      return;
    }

    if (editId) {
      const existing = appState.projects.find(p => p.id === editId);
      if (existing) {
        existing.name = name;
        existing.code = code;
        existing.client = client;
        existing.startDate = startDate;
        existing.targetEndDate = targetEndDate;
        saveState();
        updateProjectSelector();
        closeProjectModal();
        renderApp();
        showToast(`Updated project details: ${name}`);
        return;
      }
    }

    const newProj = {
      id: 'prj-' + Date.now(),
      code,
      name,
      client,
      startDate,
      targetEndDate,
      shiftHours: 10,
      lossThreshold: 0,
      labourRates: DEFAULT_LABOUR_TRADES.reduce((acc, t) => { acc[t.id] = t.rate; return acc; }, {}),
      plantRates: DEFAULT_PLANT_EQUIPMENT.reduce((acc, p) => { acc[p.id] = p.rate; return acc; }, {}),
      fixedActivities: [],
      dailyLogs: []
    };

    appState.projects.push(newProj);
    appState.currentProjectId = newProj.id;
    saveState();
    closeProjectModal();
    renderApp();
    showToast(`Created & switched to project: ${name}`);
  } finally {
    setTimeout(() => { isSavingProject = false; }, 350);
  }
}

// ========================================================
// SETTINGS MODAL & 4 SUB-PANELS
// ========================================================

function renderSettingsMainActivities() {
  const tbody = document.getElementById('settings-main-activities-tbody');
  const countEl = document.getElementById('count-main-acts');
  if (!tbody) return;
  tbody.innerHTML = '';
  const mains = getActiveMainActivities();
  const prj = getCurrentProject();
  if (countEl) countEl.textContent = mains.length;

  mains.forEach(m => {
    const childCount = (prj?.fixedActivities || []).filter(a => a.mainActivityCode === m.code).length;
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100';
    tr.innerHTML = `
      <td class="py-2.5 px-3 font-mono font-black text-red-700 text-xs">${escapeHtml(m.code)}</td>
      <td class="py-2.5 px-3 font-medium text-slate-800 text-xs">${escapeHtml(m.description)}</td>
      <td class="py-2.5 px-3 text-right font-mono-numbers text-slate-700 text-xs">${m.defaultBatchQty || 100}</td>
      <td class="py-2.5 px-3 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${childCount > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'}">
          ${childCount} item(s)
        </span>
      </td>
      <td class="py-2.5 px-3 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <button type="button" onclick="editMainActivityFromSettings('${escapeJsString(m.code)}')" class="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer" title="Edit Main Activity">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" onclick="deleteMainActivityFromSettings('${escapeJsString(m.code)}')" class="p-1 rounded hover:bg-rose-100 text-rose-600 hover:text-rose-900 cursor-pointer" title="Delete Main Activity">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function saveMainActivityFromSettings() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('add or edit Main Activities master');
    return;
  }
  const editId = document.getElementById('inp-set-main-id')?.value;
  const codeInp = document.getElementById('inp-set-main-code');
  const descInp = document.getElementById('inp-set-main-desc');
  const qtyInp = document.getElementById('inp-set-main-qty');

  const code = (codeInp?.value || '').trim().toUpperCase();
  const desc = (descInp?.value || '').trim();
  const qty = parseFloat(qtyInp?.value) || 100;

  if (!code || !desc) {
    alert('Please enter both Main Activity Code (e.g. S00100) and Description.');
    return;
  }

  let list = getActiveMainActivities();
  if (editId) {
    const idx = list.findIndex(m => m.code === editId);
    if (idx !== -1) {
      list[idx].code = code;
      list[idx].description = desc;
      list[idx].defaultBatchQty = qty;

      // Cascade update to projects if code or description changed
      (appState.projects || []).forEach(p => {
        (p.fixedActivities || []).forEach(a => {
          if (a.mainActivityCode === editId) {
            a.mainActivityCode = code;
            a.mainActivityDesc = desc;
          }
        });
      });
      logAuditAction('SETTINGS', 'Main Activity Master', `Updated Main Activity: ${editId} -> ${code} - ${desc}`);
      showToast(`Updated Main Activity ${code}`);
    }
  } else {
    const existing = list.find(m => m.code === code);
    if (existing) {
      existing.description = desc;
      existing.defaultBatchQty = qty;
      (appState.projects || []).forEach(p => {
        (p.fixedActivities || []).forEach(a => {
          if (a.mainActivityCode === code) {
            a.mainActivityDesc = desc;
          }
        });
      });
      logAuditAction('SETTINGS', 'Main Activity Master', `Updated existing Main Activity: ${code} - ${desc}`);
      showToast(`Updated existing Main Activity ${code}`);
    } else {
      list.push({
        id: 'main-' + Date.now(),
        code,
        description: desc,
        defaultBatchQty: qty,
        unit: 'm3'
      });
      logAuditAction('SETTINGS', 'Main Activity Master', `Created new Main Activity: ${code} - ${desc}`);
      showToast(`Added new Main Activity ${code}`);
    }
  }

  appState.mainActivities = list;
  saveState();
  resetMainActivityForm();
  renderSettingsMainActivities();
  populateFixedMainActivityDropdown();
  renderCodeStudioPanel();
  renderApp();
}

function editMainActivityFromSettings(code) {
  const m = getActiveMainActivities().find(item => item.code === code);
  if (!m) return;
  document.getElementById('inp-set-main-id').value = m.code;
  document.getElementById('inp-set-main-code').value = m.code;
  document.getElementById('inp-set-main-desc').value = m.description;
  document.getElementById('inp-set-main-qty').value = m.defaultBatchQty || 100;

  const btnCancel = document.getElementById('btn-cancel-edit-main-act');
  const btnLabel = document.getElementById('btn-label-save-main-act');
  const formTitle = document.getElementById('title-main-act-form');

  if (btnCancel) btnCancel.classList.remove('hidden');
  if (btnLabel) btnLabel.textContent = 'Update Main Activity';
  if (formTitle) formTitle.innerHTML = `<i data-lucide="edit" class="w-4 h-4 text-red-600"></i><span>Editing Main Activity [${m.code}]</span>`;
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function resetMainActivityForm() {
  document.getElementById('inp-set-main-id').value = '';
  document.getElementById('inp-set-main-code').value = '';
  document.getElementById('inp-set-main-desc').value = '';
  document.getElementById('inp-set-main-qty').value = '';

  const btnCancel = document.getElementById('btn-cancel-edit-main-act');
  const btnLabel = document.getElementById('btn-label-save-main-act');
  const formTitle = document.getElementById('title-main-act-form');

  if (btnCancel) btnCancel.classList.add('hidden');
  if (btnLabel) btnLabel.textContent = '+ Save Main Activity';
  if (formTitle) formTitle.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-red-600"></i><span>Add / Edit Main Activity Description</span>`;
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function deleteMainActivityFromSettings(code) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete Main Activities master');
    return;
  }
  const prj = getCurrentProject();
  const childCount = (prj?.fixedActivities || []).filter(a => a.mainActivityCode === code).length;
  const msg = childCount > 0 
    ? `Warning: ${childCount} fixed sub-activities currently use Main Activity ${code}.\nAre you sure you want to delete this Main Activity?`
    : `Delete Main Activity ${code}?`;

  if (confirm(msg)) {
    let list = getActiveMainActivities().filter(m => m.code !== code);
    appState.mainActivities = list;
    saveState();
    resetMainActivityForm();
    renderSettingsMainActivities();
    showToast(`Removed Main Activity ${code}`);
  }
}

// Master Resources: Units of Measurement
function renderSettingsUnits() {
  const container = document.getElementById('settings-units-container');
  if (!container) return;
  container.innerHTML = '';
  const units = getActiveUnits();
  const isAdmin = isCurrentUserAdmin();

  units.forEach(u => {
    const badge = document.createElement('div');
    badge.className = 'px-2 py-1 rounded-lg bg-sky-100 text-sky-900 font-mono font-bold text-xs flex items-center gap-1.5 border border-sky-200';
    badge.innerHTML = `
      <span>${u}</span>
      ${isAdmin ? `
        <button type="button" onclick="deleteUnitFromSettings('${u}')" class="text-sky-400 hover:text-rose-600 cursor-pointer font-bold leading-none" title="Remove unit">
          &times;
        </button>
      ` : ''}
    `;
    container.appendChild(badge);
  });
}

function addUnitFromSettings() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('add new units of measurement');
    return;
  }
  const inp = document.getElementById('inp-new-unit-name');
  const val = (inp?.value || '').trim();
  if (!val) {
    alert('Please enter a unit name (e.g. Ton, Trip, LM).');
    return;
  }
  let units = getActiveUnits();
  if (!units.includes(val)) {
    units.push(val);
    appState.units = units;
    saveState();
    showToast(`Added unit: ${val}`);
  } else {
    showToast(`Unit ${val} already exists.`);
  }
  if (inp) inp.value = '';
  renderSettingsUnits();
}

function deleteUnitFromSettings(unitName) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete units of measurement');
    return;
  }
  let units = getActiveUnits().filter(u => u !== unitName);
  if (units.length === 0) units = ['m3'];
  appState.units = units;
  saveState();
  renderSettingsUnits();
  showToast(`Removed unit: ${unitName}`);
}

// Master Resources: Labour Trades
function renderSettingsLabourTrades() {
  const container = document.getElementById('settings-labour-rates');
  if (!container) return;
  container.innerHTML = '';
  const prj = getCurrentProject();
  if (!prj) return;
  const isAdmin = isCurrentUserAdmin();
  const trades = getActiveLabourTrades();

  trades.forEach(trade => {
    const rate = prj.labourRates?.[trade.id] ?? trade.rate;
    const isCustom = !DEFAULT_LABOUR_TRADES.some(dt => dt.id === trade.id);
    const div = document.createElement('div');
    div.className = 'bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-1';
    div.innerHTML = `
      <div class="flex flex-col truncate">
        <span class="font-medium text-slate-800 text-xs truncate" title="${trade.name}">${trade.name}</span>
        <span class="text-[10px] text-slate-400 font-mono">${trade.short || trade.id}</span>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <div class="flex items-center gap-1">
          <input type="number" step="0.01" data-trade-id="${trade.id}" value="${rate}" ${isAdmin ? '' : 'readonly onclick="showAccessDenied(\'modify Candy baseline labour rates\')'} class="inp-set-labour w-20 px-2 py-1 ${isAdmin ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-500 cursor-not-allowed'} border border-slate-300 rounded text-right font-bold text-xs">
          <span class="text-[10px] text-slate-500">AED</span>
        </div>
        ${(isAdmin && isCustom) ? `
          <button type="button" onclick="deleteLabourTradeFromSettings('${trade.id}')" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Remove custom trade">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        ` : ''}
      </div>
    `;
    container.appendChild(div);
  });
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function addLabourTradeFromSettings() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('add new labour trades');
    return;
  }
  const nameInp = document.getElementById('inp-new-labour-name');
  const shortInp = document.getElementById('inp-new-labour-short');
  const rateInp = document.getElementById('inp-new-labour-rate');

  const name = (nameInp?.value || '').trim();
  const short = (shortInp?.value || '').trim();
  const rate = parseFloat(rateInp?.value) || 0;

  if (!name || !short || rate <= 0) {
    alert('Please enter Trade Name, Short Code, and a positive hourly Rate.');
    return;
  }

  const id = 'labour_' + short.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
  let trades = getActiveLabourTrades();
  trades.push({ id, name, short, rate });
  appState.labourTrades = trades;

  const prj = getCurrentProject();
  if (prj) {
    if (!prj.labourRates) prj.labourRates = {};
    prj.labourRates[id] = rate;
  }

  saveState();
  if (nameInp) nameInp.value = '';
  if (shortInp) shortInp.value = '';
  if (rateInp) rateInp.value = '';
  renderSettingsLabourTrades();
  showToast(`Added labour trade: ${name} (${rate} AED/hr)`);
}

function deleteLabourTradeFromSettings(tradeId) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete labour trades');
    return;
  }
  let trades = getActiveLabourTrades().filter(t => t.id !== tradeId);
  appState.labourTrades = trades;
  saveState();
  renderSettingsLabourTrades();
  showToast('Removed custom labour trade.');
}

// Master Resources: Plant & Machinery
function renderSettingsPlantEquipment() {
  const container = document.getElementById('settings-plant-rates');
  if (!container) return;
  container.innerHTML = '';
  const prj = getCurrentProject();
  if (!prj) return;
  const isAdmin = isCurrentUserAdmin();
  const plants = getActivePlantEquipment();

  plants.forEach(plant => {
    const rate = prj.plantRates?.[plant.id] ?? plant.rate;
    const isCustom = !DEFAULT_PLANT_EQUIPMENT.some(dp => dp.id === plant.id);
    const div = document.createElement('div');
    div.className = 'bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-1';
    div.innerHTML = `
      <div class="flex flex-col truncate">
        <span class="font-medium text-slate-800 text-xs truncate max-w-[120px]" title="${plant.name}">${plant.short || plant.name}</span>
        <span class="text-[10px] text-slate-400 font-mono">${plant.unit}</span>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <div class="flex items-center gap-1">
          <input type="number" step="0.5" data-plant-id="${plant.id}" value="${rate}" ${isAdmin ? '' : 'readonly onclick="showAccessDenied(\'modify Candy baseline equipment rates\')'} class="inp-set-plant w-20 px-2 py-1 ${isAdmin ? 'bg-white text-blue-800' : 'bg-slate-100 text-slate-500 cursor-not-allowed'} border border-slate-300 rounded text-right font-bold text-xs">
          <span class="text-[10px] text-slate-500">${plant.unit}</span>
        </div>
        ${(isAdmin && isCustom) ? `
          <button type="button" onclick="deletePlantEquipmentFromSettings('${plant.id}')" class="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Remove custom plant">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        ` : ''}
      </div>
    `;
    container.appendChild(div);
  });
  if (window.lucide) { try { lucide.createIcons(); } catch(e) {} }
}

function addPlantEquipmentFromSettings() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('add new machinery / plant');
    return;
  }
  const nameInp = document.getElementById('inp-new-plant-name');
  const shortInp = document.getElementById('inp-new-plant-short');
  const unitInp = document.getElementById('inp-new-plant-unit');
  const rateInp = document.getElementById('inp-new-plant-rate');

  const name = (nameInp?.value || '').trim();
  const short = (shortInp?.value || '').trim();
  const unit = unitInp?.value || 'Hrs';
  const rate = parseFloat(rateInp?.value) || 0;

  if (!name || !short || rate <= 0) {
    alert('Please enter Equipment Name, Short Code, and a positive Rate.');
    return;
  }

  const id = 'plant_' + short.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
  let plants = getActivePlantEquipment();
  plants.push({ id, name, short, unit, rate });
  appState.plantEquipment = plants;

  const prj = getCurrentProject();
  if (prj) {
    if (!prj.plantRates) prj.plantRates = {};
    prj.plantRates[id] = rate;
  }

  saveState();
  if (nameInp) nameInp.value = '';
  if (shortInp) shortInp.value = '';
  if (rateInp) rateInp.value = '';
  renderSettingsPlantEquipment();
  showToast(`Added machinery: ${name} (${rate} AED/${unit})`);
}

function deletePlantEquipmentFromSettings(plantId) {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('delete plant equipment');
    return;
  }
  let plants = getActivePlantEquipment().filter(p => p.id !== plantId);
  appState.plantEquipment = plants;
  saveState();
  renderSettingsPlantEquipment();
  showToast('Removed custom plant equipment.');
}

// Project Profile Settings Save
function saveProjectSettingsFromTab() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('modify Project Profile details');
    return;
  }
  const prj = getCurrentProject();
  if (!prj) return;

  const name = document.getElementById('set-proj-name')?.value.trim();
  const code = document.getElementById('set-proj-code')?.value.trim();
  const client = document.getElementById('set-proj-client')?.value.trim();
  const start = document.getElementById('set-proj-start')?.value;
  const end = document.getElementById('set-proj-end')?.value;
  const threshold = parseFloat(document.getElementById('inp-loss-threshold')?.value) || 0;
  const shiftHours = parseFloat(document.getElementById('inp-shift-hours')?.value) || 10;

  if (!name || !code) {
    alert('Project Name and Code are required.');
    return;
  }

  prj.name = name;
  prj.code = code;
  prj.client = client;
  prj.startDate = start;
  prj.targetEndDate = end;
  prj.lossThreshold = threshold;
  prj.shiftHours = shiftHours;

  const chkFixedRate = document.getElementById('set-allow-manual-fixed-rate');
  const chkDailyRate = document.getElementById('set-allow-manual-daily-rate');
  if (chkFixedRate || chkDailyRate) {
    if (!appState.dashboardCustomization) {
      appState.dashboardCustomization = { ...DEFAULT_DASHBOARD_CUSTOMIZATION };
    }
    if (chkFixedRate) appState.dashboardCustomization.allowManualFixedRate = chkFixedRate.checked;
    if (chkDailyRate) appState.dashboardCustomization.allowManualDailyRate = chkDailyRate.checked;
  }

  saveState();
  updateProjectSelector();
  renderApp();
  showToast(`Saved Project Profile & Settings: ${name}`);
}

function openSettingsModal(defaultTab = 'main-act') {
  const prj = getCurrentProject();
  if (!prj) return;
  const isAdmin = isCurrentUserAdmin();

  // Alias legacy tab names
  let tabToOpen = defaultTab;
  if (tabToOpen === 'fixed') tabToOpen = 'resources';
  if (tabToOpen === 'daily') tabToOpen = 'project';

  // Check admin permission for admin-only tabs
  if (!isAdmin && (tabToOpen === 'dashboard' || tabToOpen === 'login' || tabToOpen === 'code')) {
    tabToOpen = 'resources';
  }

  // Populate active project profile inputs in Settings tab 3
  const pName = document.getElementById('set-proj-name');
  const pCode = document.getElementById('set-proj-code');
  const pClient = document.getElementById('set-proj-client');
  const pStart = document.getElementById('set-proj-start');
  const pEnd = document.getElementById('set-proj-end');
  const pThreshold = document.getElementById('inp-loss-threshold');
  const pShift = document.getElementById('inp-shift-hours');

  if (pName) pName.value = prj.name || '';
  if (pCode) pCode.value = prj.code || '';
  if (pClient) pClient.value = prj.client || '';
  if (pStart) pStart.value = prj.startDate || '';
  if (pEnd) pEnd.value = prj.targetEndDate || '';
  if (pThreshold) pThreshold.value = prj.lossThreshold || 0;
  if (pShift) pShift.value = prj.shiftHours || 10;

  // Manual rate toggles & dashboard access
  const cust = getActiveDashboardCustomization();
  const chkFixedRate = document.getElementById('set-allow-manual-fixed-rate');
  if (chkFixedRate) {
    chkFixedRate.checked = cust.allowManualFixedRate !== false;
    chkFixedRate.disabled = !isAdmin;
  }
  const chkDailyRate = document.getElementById('set-allow-manual-daily-rate');
  if (chkDailyRate) {
    chkDailyRate.checked = cust.allowManualDailyRate !== false;
    chkDailyRate.disabled = !isAdmin;
  }
  const chkDashTab = document.getElementById('set-dashboard-tab-enabled');
  if (chkDashTab) {
    chkDashTab.checked = cust.dashboardTabEnabled !== false;
    chkDashTab.disabled = !isAdmin;
  }
  updateDashboardTabVisibilityBadge(cust.dashboardTabEnabled !== false);

  // Active session card in Login tab 5
  const user = getEffectiveUser();
  const avatarEl = document.getElementById('settings-active-user-avatar');
  const nameEl = document.getElementById('settings-active-user-name');
  const idEl = document.getElementById('settings-active-user-id');
  const roleBadgeEl = document.getElementById('settings-active-user-role-badge');

  if (avatarEl) avatarEl.textContent = (user?.name || 'US').slice(0, 2).toUpperCase();
  if (nameEl) nameEl.textContent = user?.name || 'User';
  if (idEl) idEl.textContent = user?.id || 'user';
  if (roleBadgeEl) {
    if (isAdmin) {
      roleBadgeEl.className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase';
      roleBadgeEl.textContent = '👑 Administrator (Full Control)';
    } else {
      roleBadgeEl.className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase';
      roleBadgeEl.textContent = '👷 Site User (Restricted)';
    }
  }

  // Populate all sub-panels safely with error boundaries
  try { renderSettingsMainActivities(); } catch (e) { console.error('Settings: Main Activities error', e); }
  try { renderSettingsUnits(); } catch (e) { console.error('Settings: Units error', e); }
  try { renderSettingsLabourTrades(); } catch (e) { console.error('Settings: Labour Trades error', e); }
  try { renderSettingsPlantEquipment(); } catch (e) { console.error('Settings: Plant Equipment error', e); }
  try { renderSettingsDivisions(); } catch (e) { console.error('Settings: Divisions error', e); }
  try { populateDashboardCustomizerForm(); } catch (e) { console.error('Settings: Dashboard Customizer error', e); }
  try { populateUserManagementTable(); } catch (e) { console.error('Settings: User Management error', e); }
  try { renderAuditTrailTable(); } catch (e) { console.error('Settings: Audit Trail error', e); }
  try { renderCodeStudioPanel(); } catch (e) { console.error('Settings: Code Studio error', e); }

  switchSettingsTab(tabToOpen);
  showModal('modal-settings');
}

function closeSettingsModal() {
  hideModal('modal-settings');
}

function switchSettingsTab(tab) {
  const tabs = ['main-act', 'resources', 'project', 'dashboard', 'login', 'audit', 'code'];
  const activeBtn = 'px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-xs border border-slate-200 font-bold flex items-center gap-1.5 cursor-pointer';
  const inactiveBtn = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer';
  const isAdmin = isCurrentUserAdmin();

  // If a restricted user tries to switch to admin-only tabs, notify and stay
  if (!isAdmin && (tab === 'dashboard' || tab === 'login' || tab === 'code')) {
    showAccessDenied(`access the ${tab.toUpperCase()} settings tab`);
    tab = 'resources';
  }

  tabs.forEach(t => {
    const btn = document.getElementById(`settings-tab-${t}`);
    const panel = document.getElementById(`settings-panel-${t}`);
    if (btn) btn.className = inactiveBtn;
    if (panel) panel.classList.add('hidden');
  });

  const curBtn = document.getElementById(`settings-tab-${tab}`);
  const curPanel = document.getElementById(`settings-panel-${tab}`);
  if (curBtn) curBtn.className = activeBtn;
  if (curPanel) curPanel.classList.remove('hidden');

  // Update administrative locked notices
  const mainActLockNotice = document.getElementById('settings-main-act-locked-notice');
  if (mainActLockNotice) {
    if (isAdmin) mainActLockNotice.classList.add('hidden');
    else mainActLockNotice.classList.remove('hidden');
  }

  const dashLockNotice = document.getElementById('settings-dashboard-locked-notice');
  if (dashLockNotice) {
    if (isAdmin) dashLockNotice.classList.add('hidden');
    else dashLockNotice.classList.remove('hidden');
  }

  const addUserSection = document.getElementById('settings-add-user-section');
  if (addUserSection) {
    if (isAdmin) addUserSection.classList.remove('hidden');
    else addUserSection.classList.add('hidden');
  }

  // Refresh tab content safely
  try {
    if (tab === 'main-act') {
      renderSettingsMainActivities();
    } else if (tab === 'resources') {
      renderSettingsUnits();
      renderSettingsLabourTrades();
      renderSettingsPlantEquipment();
      renderSettingsDivisions();
    } else if (tab === 'project') {
      const prj = getCurrentProject();
      if (prj) {
        const pName = document.getElementById('set-proj-name');
        const pCode = document.getElementById('set-proj-code');
        const pClient = document.getElementById('set-proj-client');
        const pStart = document.getElementById('set-proj-start');
        const pEnd = document.getElementById('set-proj-end');
        const pThreshold = document.getElementById('inp-loss-threshold');
        const pShift = document.getElementById('inp-shift-hours');
        if (pName) { pName.value = prj.name || ''; pName.disabled = !isAdmin; }
        if (pCode) { pCode.value = prj.code || ''; pCode.disabled = !isAdmin; }
        if (pClient) { pClient.value = prj.client || ''; pClient.disabled = !isAdmin; }
        if (pStart) { pStart.value = prj.startDate || ''; pStart.disabled = !isAdmin; }
        if (pEnd) { pEnd.value = prj.targetEndDate || ''; pEnd.disabled = !isAdmin; }
        if (pThreshold) pThreshold.value = prj.lossThreshold || 0;
        if (pShift) pShift.value = prj.shiftHours || 10;
      }
      const cust = getActiveDashboardCustomization();
      const chkFixedRate = document.getElementById('set-allow-manual-fixed-rate');
      if (chkFixedRate) {
        chkFixedRate.checked = cust.allowManualFixedRate !== false;
        chkFixedRate.disabled = !isAdmin;
      }
      const chkDailyRate = document.getElementById('set-allow-manual-daily-rate');
      if (chkDailyRate) {
        chkDailyRate.checked = cust.allowManualDailyRate !== false;
        chkDailyRate.disabled = !isAdmin;
      }
    } else if (tab === 'dashboard') {
      populateDashboardCustomizerForm();
    } else if (tab === 'login') {
      populateUserManagementTable();
    } else if (tab === 'audit') {
      renderAuditTrailTable();
    } else if (tab === 'code') {
      renderCodeStudioPanel();
    }
  } catch (err) {
    console.error('Error switching settings tab:', tab, err);
  }

  if (window.lucide) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function saveSettingsFromModal() {
  const prj = getCurrentProject();
  if (!prj) return;
  const isAdmin = isCurrentUserAdmin();

  if (!isAdmin) {
    showAccessDenied('modify and save project configurations');
    closeSettingsModal();
    return;
  }

  // Auto-commit any pending inline form inputs if filled
  const pendingMainCode = document.getElementById('inp-set-main-code')?.value.trim();
  const pendingMainDesc = document.getElementById('inp-set-main-desc')?.value.trim();
  if (pendingMainCode && pendingMainDesc) {
    try { saveMainActivityFromSettings(); } catch (e) {}
  }

  const pendingDivCode = document.getElementById('inp-new-div-code')?.value.trim();
  const pendingDivName = document.getElementById('inp-new-div-name')?.value.trim();
  if (pendingDivCode && pendingDivName) {
    try { saveDivisionFromSettings(); } catch (e) {}
  }

  const pendingLabourName = document.getElementById('inp-new-labour-name')?.value.trim();
  const pendingLabourRate = parseFloat(document.getElementById('inp-new-labour-rate')?.value) || 0;
  if (pendingLabourName && pendingLabourRate > 0) {
    try { addLabourTradeFromSettings(); } catch (e) {}
  }

  const pendingPlantName = document.getElementById('inp-new-plant-name')?.value.trim();
  const pendingPlantRate = parseFloat(document.getElementById('inp-new-plant-rate')?.value) || 0;
  if (pendingPlantName && pendingPlantRate > 0) {
    try { addPlantEquipmentFromSettings(); } catch (e) {}
  }

  // 1. Labour & Plant Rates
  document.querySelectorAll('.inp-set-labour').forEach(inp => {
    if (!prj.labourRates) prj.labourRates = {};
    prj.labourRates[inp.dataset.tradeId] = parseFloat(inp.value) || 10;
  });

  document.querySelectorAll('.inp-set-plant').forEach(inp => {
    if (!prj.plantRates) prj.plantRates = {};
    prj.plantRates[inp.dataset.plantId] = parseFloat(inp.value) || 50;
  });

  // 2. Project Profile Details
  const nameInp = document.getElementById('set-proj-name');
  const codeInp = document.getElementById('set-proj-code');
  const clientInp = document.getElementById('set-proj-client');
  const startInp = document.getElementById('set-proj-start');
  const endInp = document.getElementById('set-proj-end');

  if (nameInp && nameInp.value.trim()) prj.name = nameInp.value.trim();
  if (codeInp && codeInp.value.trim()) prj.code = codeInp.value.trim();
  if (clientInp) prj.client = clientInp.value.trim();
  if (startInp) prj.startDate = startInp.value;
  if (endInp) prj.targetEndDate = endInp.value;

  // 3. Settings Toggles (Manual Rate modes & Dashboard tab access)
  if (!appState.dashboardCustomization) {
    appState.dashboardCustomization = { ...DEFAULT_DASHBOARD_CUSTOMIZATION };
  }
  const chkFixedRate = document.getElementById('set-allow-manual-fixed-rate');
  if (chkFixedRate) appState.dashboardCustomization.allowManualFixedRate = chkFixedRate.checked;

  const chkDailyRate = document.getElementById('set-allow-manual-daily-rate');
  if (chkDailyRate) appState.dashboardCustomization.allowManualDailyRate = chkDailyRate.checked;

  const chkDashTab = document.getElementById('set-dashboard-tab-enabled');
  if (chkDashTab) appState.dashboardCustomization.dashboardTabEnabled = chkDashTab.checked;

  // 4. Dashboard Customizer Headings & Labels (if modified)
  const getVal = (id, fallback) => {
    const el = document.getElementById(id);
    return el && el.value.trim() ? el.value.trim() : fallback;
  };
  const cust = appState.dashboardCustomization;
  cust.headerTitle = getVal('inp-cust-header-title', cust.headerTitle || DEFAULT_DASHBOARD_CUSTOMIZATION.headerTitle);
  cust.headerSubtitle = getVal('inp-cust-header-subtitle', cust.headerSubtitle || DEFAULT_DASHBOARD_CUSTOMIZATION.headerSubtitle);
  cust.card1Title = getVal('inp-cust-card1-title', cust.card1Title || DEFAULT_DASHBOARD_CUSTOMIZATION.card1Title);
  cust.card1Subtitle = getVal('inp-cust-card1-sub', cust.card1Subtitle || DEFAULT_DASHBOARD_CUSTOMIZATION.card1Subtitle);
  cust.card2Title = getVal('inp-cust-card2-title', cust.card2Title || DEFAULT_DASHBOARD_CUSTOMIZATION.card2Title);
  cust.card2Subtitle = getVal('inp-cust-card2-sub', cust.card2Subtitle || DEFAULT_DASHBOARD_CUSTOMIZATION.card2Subtitle);
  cust.card3Title = getVal('inp-cust-card3-title', cust.card3Title || DEFAULT_DASHBOARD_CUSTOMIZATION.card3Title);
  cust.card3Subtitle = getVal('inp-cust-card3-sub', cust.card3Subtitle || DEFAULT_DASHBOARD_CUSTOMIZATION.card3Subtitle);
  cust.card4Title = getVal('inp-cust-card4-title', cust.card4Title || DEFAULT_DASHBOARD_CUSTOMIZATION.card4Title);
  cust.card4Subtitle = getVal('inp-cust-card4-sub', cust.card4Subtitle || DEFAULT_DASHBOARD_CUSTOMIZATION.card4Subtitle);
  cust.navDashboard = getVal('inp-cust-nav-dashboard', cust.navDashboard || DEFAULT_DASHBOARD_CUSTOMIZATION.navDashboard);
  cust.navFixed = getVal('inp-cust-nav-fixed', cust.navFixed || DEFAULT_DASHBOARD_CUSTOMIZATION.navFixed);
  cust.navDaily = getVal('inp-cust-nav-daily', cust.navDaily || DEFAULT_DASHBOARD_CUSTOMIZATION.navDaily);
  cust.navMatrix = getVal('inp-cust-nav-matrix', cust.navMatrix || DEFAULT_DASHBOARD_CUSTOMIZATION.navMatrix);

  applyDashboardCustomization();
  updateProjectSelector();

  // 5. Shift Hours & Loss Thresholds
  prj.lossThreshold = parseFloat(document.getElementById('inp-loss-threshold')?.value) || 0;
  prj.shiftHours = parseFloat(document.getElementById('inp-shift-hours')?.value) || 10;

  saveState();
  closeSettingsModal();
  renderApp();
  logAuditAction('SETTINGS', 'Unified Settings Save', 'Persisted project configuration, resource rates, toggles, and live dashboard headings');
  showToast('Settings & configurations saved successfully.');
}

function resetSettingsToDefaults() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('reset Candy baseline resource rates');
    return;
  }
  if (confirm('Reset hourly labour and plant rates to default baseline rates for this project?')) {
    const prj = getCurrentProject();
    prj.labourRates = DEFAULT_LABOUR_TRADES.reduce((acc, t) => { acc[t.id] = t.rate; return acc; }, {});
    prj.plantRates = DEFAULT_PLANT_EQUIPMENT.reduce((acc, p) => { acc[p.id] = p.rate; return acc; }, {});
    saveState();
    openSettingsModal('resources');
    logAuditAction('SETTINGS', 'Resource Rates', 'Reset hourly labour and plant rates to factory default rates');
    showToast('Reset rates to default');
  }
}

// --- 6. EXCEL (.XLSX) AND CSV EXPORT ENGINE ---

function triggerBlobDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 300);
}

function exportToExcel() {
  const prj = getCurrentProject();
  if (!prj) return;

  try {
    if (typeof XLSX === 'undefined') {
      alert('SheetJS library is not available. Using CSV export fallback instead.');
      exportToCSV();
      return;
    }

    const wb = XLSX.utils.book_new();

    // Calculate Project Level KPIs
    let totalBOQBudget = 0;
    let totalEarnedValue = 0;
    let totalActualCost = 0;
    let totalPlannedQty = 0;
    let totalCompletedQty = 0;

    (prj.fixedActivities || []).forEach(act => {
      const calc = calculateFixedActivity(act, prj);
      totalBOQBudget += calc.totalBudgetAmount;
      totalEarnedValue += calc.earnedBudgetToDate;
      totalActualCost += calc.totalActualSpend;
      totalPlannedQty += parseFloat(act.totalQty) || 0;
      totalCompletedQty += calc.totalDoneQty;
    });

    const netProfitLoss = totalEarnedValue - totalActualCost;
    const netProfitLossPercent = totalEarnedValue > 0 ? (netProfitLoss / totalEarnedValue) * 100 : 0;
    const overallProductivityIndex = totalActualCost > 0 ? (totalEarnedValue / totalActualCost) : 1.0;
    const overallPercentDone = totalPlannedQty > 0 ? (totalCompletedQty / totalPlannedQty) * 100 : 0;

    const activeLabour = getActiveLabourTrades();
    const activePlant = getActivePlantEquipment();
    const lCount = activeLabour.length;
    const pCount = activePlant.length;
    const totalCols = 12 + lCount + pCount + 10;

    // =========================================================================
    // SHEET 1: CANDY BUDGET BREAKDOWN & SITE ACTUALS (MATCHING IMAGE 2 EXACTLY)
    // =========================================================================
    const candyHeaderRow1 = new Array(totalCols).fill('');
    candyHeaderRow1[0] = 'BUDGET COST BREAK DOWN FOR SUB ACTIVITY';
    candyHeaderRow1[12] = `LABOUR HOURS - SUB ACTIVITY WISE (${lCount} TRADES)`;
    candyHeaderRow1[12 + lCount] = `PLANT & EQUIPMENT HOURS - SUB ACTIVITY WISE (${pCount} MACHINES)`;
    candyHeaderRow1[12 + lCount + pCount] = 'CANDY BUDGET - WORK OUT QTY AND RESOURCES BUDGETED';

    const candyHeaderRow2 = [
      'Date',
      'Record Type',
      'Candy Code',
      'Division',
      'Zone',
      'Sub Activity Description',
      'Unit',
      'Total BOQ / Daily Qty',
      'Unit Rate for Labour & Plant (AED)',
      'Total Labour & Plant.Equip Amount (AED)',
      'Labour Amount (AED)',
      'Plant & Eqpt Amount (AED)'
    ];

    activeLabour.forEach(t => candyHeaderRow2.push(t.name));
    activePlant.forEach(p => candyHeaderRow2.push(p.name));

    candyHeaderRow2.push(
      'Workout Unit',
      'Workout Qty',
      'Workout Labour Cost (AED)',
      'Workout Plant Cost (AED)',
      'Unit Labour Cost (AED)',
      'Unit Plant Cost (AED)',
      'Calculated Unit Rate (AED)',
      'Earned Budget / Spend (AED)',
      'Actual Spend (AED)',
      'Net Profit / Loss (AED)'
    );

    const candyRows = [candyHeaderRow1, candyHeaderRow2];

    let sumTotalBudget = 0;
    let sumLabourBudget = 0;
    let sumPlantBudget = 0;
    let sumEarnedValue = 0;
    let sumActualSpend = 0;
    let sumProfitLoss = 0;

    // Helper to push BGT row and its daily Act rows
    function pushActivityAndDailyRows(item) {
      const calc = calculateFixedActivity(item, prj);
      sumTotalBudget += calc.totalBudgetAmount;
      sumLabourBudget += calc.totalLabourAmount;
      sumPlantBudget += calc.totalPlantAmount;
      sumEarnedValue += calc.earnedBudgetToDate;
      sumActualSpend += calc.totalActualSpend;
      sumProfitLoss += calc.cumulativeProfitLoss;

      const bgtRow = [
        item.date || prj.startDate || getTodayDate(),
        'BGT',
        item.code,
        item.division,
        item.zone || 'Zone 1',
        item.subActivity,
        item.unit,
        Number(item.totalQty) || 0,
        Number(calc.budgetUnitRate.toFixed(2)),
        Number(calc.totalBudgetAmount.toFixed(2)),
        Number(calc.totalLabourAmount.toFixed(2)),
        Number(calc.totalPlantAmount.toFixed(2))
      ];

      activeLabour.forEach(t => {
        bgtRow.push(Number(calc.detailedLabour[t.id]?.projectHrs?.toFixed(1) || 0));
      });
      activePlant.forEach(p => {
        bgtRow.push(Number(calc.detailedPlant[p.id]?.projectHrs?.toFixed(1) || 0));
      });

      bgtRow.push(
        item.unit,
        Number(item.workoutQty) || 1,
        Number(calc.workoutLabourCost.toFixed(2)),
        Number(calc.workoutPlantCost.toFixed(2)),
        Number(calc.unitLabourCost.toFixed(2)),
        Number(calc.unitPlantCost.toFixed(2)),
        Number(calc.budgetUnitRate.toFixed(2)),
        Number(calc.earnedBudgetToDate.toFixed(2)),
        Number(calc.totalActualSpend.toFixed(2)),
        Number(calc.cumulativeProfitLoss.toFixed(2))
      );
      candyRows.push(bgtRow);

      // Daily Execution 'Act' Rows under this Fixed Activity
      const activityDailyLogs = (prj.dailyLogs || []).filter(l => l.activityId === item.id);
      activityDailyLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

      activityDailyLogs.forEach(log => {
        const lCalc = calculateDailyLog(log, item, prj);
        const actRow = [
          log.date,
          'Act',
          item.code,
          item.division,
          item.zone || 'Zone 1',
          `↳ ${log.notes ? log.notes : 'Daily site execution'}`,
          item.unit,
          Number(lCalc.actualQty) || 0,
          Number(lCalc.actualUnitCost.toFixed(2)),
          Number(lCalc.actualCost.toFixed(2)),
          Number(lCalc.actualLabourCost.toFixed(2)),
          Number(lCalc.actualPlantCost.toFixed(2))
        ];

        activeLabour.forEach(t => {
          actRow.push(Number(lCalc.detailedLabour?.[t.id]?.actualHrs?.toFixed(1) || 0));
        });
        activePlant.forEach(p => {
          actRow.push(Number(lCalc.detailedPlant?.[p.id]?.actualHrs?.toFixed(1) || 0));
        });

        actRow.push(
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          Number(lCalc.earnedBudget.toFixed(2)),
          Number(lCalc.actualCost.toFixed(2)),
          Number(lCalc.profitLossAED.toFixed(2))
        );
        candyRows.push(actRow);
      });
    }

    // Separate standalone activities from grouped activities
    const groups = {};
    (prj.fixedActivities || []).forEach(item => {
      const rawMCode = (item.mainActivityCode || '').trim();
      const isStandalone = !rawMCode || rawMCode.toUpperCase() === 'NONE' || rawMCode === '-';
      const mCode = isStandalone ? '__STANDALONE__' : rawMCode;
      if (!groups[mCode]) {
        const mainItem = !isStandalone ? getActiveMainActivities().find(m => m.code === mCode) : null;
        groups[mCode] = {
          code: isStandalone ? '' : mCode,
          desc: isStandalone ? '' : (item.mainActivityDesc || mainItem?.description || 'Main Activity'),
          isStandalone: isStandalone,
          activities: []
        };
      }
      groups[mCode].activities.push(item);
    });

    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      if (a === '__STANDALONE__') return -1;
      if (b === '__STANDALONE__') return 1;
      return 0;
    });

    sortedGroupKeys.forEach(key => {
      const grp = groups[key];
      if (!grp.isStandalone) {
        // Main Activity banner row matching Image 2
        const mainBannerRow = new Array(totalCols).fill('');
        mainBannerRow[0] = 'MAIN';
        mainBannerRow[1] = 'GRP';
        mainBannerRow[2] = grp.code;
        mainBannerRow[5] = grp.desc.toUpperCase();
        candyRows.push(mainBannerRow);
      }

      grp.activities.forEach(item => {
        pushActivityAndDailyRows(item);
      });
    });

    // Summary Totals Row
    const candyTotalsRow = new Array(totalCols).fill('');
    candyTotalsRow[0] = 'TOTALS';
    candyTotalsRow[9] = Number(sumTotalBudget.toFixed(2));
    candyTotalsRow[10] = Number(sumLabourBudget.toFixed(2));
    candyTotalsRow[11] = Number(sumPlantBudget.toFixed(2));
    candyTotalsRow[12 + lCount + pCount + 7] = Number(sumEarnedValue.toFixed(2));
    candyTotalsRow[12 + lCount + pCount + 8] = Number(sumActualSpend.toFixed(2));
    candyTotalsRow[12 + lCount + pCount + 9] = Number(sumProfitLoss.toFixed(2));
    candyRows.push(candyTotalsRow);

    const wsCandy = XLSX.utils.aoa_to_sheet(candyRows);
    const colWidths = [
      { wch: 14 }, // Date
      { wch: 12 }, // Type
      { wch: 14 }, // Candy Code
      { wch: 8 },  // Division
      { wch: 10 }, // Zone
      { wch: 42 }, // Sub Activity Description
      { wch: 8 },  // Unit
      { wch: 14 }, // Total BOQ Qty
      { wch: 16 }, // Unit Rate
      { wch: 18 }, // Total Amount
      { wch: 16 }, // Labour Amount
      { wch: 16 }  // Plant Amount
    ];
    activeLabour.forEach(() => colWidths.push({ wch: 12 }));
    activePlant.forEach(() => colWidths.push({ wch: 14 }));
    colWidths.push(
      { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
      { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }
    );
    wsCandy['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, wsCandy, 'Candy Baseline & Actuals');

    // ==========================================
    // SHEET 2: DAILY SITE ACTUALS REGISTER
    // ==========================================
    const dailyHeaderRow1 = [`DAILY SITE EXECUTION & ACTUAL PRODUCTIVITY LOGS - ${prj.code} (${prj.name})`];
    const dailyHeaderRow2 = [
      'Log #', 'Execution Date', 'Candy Code', 'Division', 'Sub Activity Description',
      'Daily Output Done', 'Unit', 'Actual Cost Spent (AED)', 'Actual Unit Cost (AED)',
      'Budget Unit Rate (AED)', 'Earned Budget (AED)', 'Daily Profit / Loss (AED)',
      'Profit / Loss %', 'Productivity Index', 'Cost Status', 'Observations & Site Notes'
    ];

    const dailyRows = [dailyHeaderRow1, dailyHeaderRow2];

    let sumDailyQty = 0;
    let sumDailyActualCost = 0;
    let sumDailyEarned = 0;
    let sumDailyProfitLoss = 0;

    const sortedLogs = [...(prj.dailyLogs || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedLogs.forEach((l, idx) => {
      const act = (prj.fixedActivities || []).find(a => a.id === l.activityId);
      const c = calculateDailyLog(l, act, prj);

      sumDailyQty += c.actualQty;
      sumDailyActualCost += c.actualCost;
      sumDailyEarned += c.earnedBudget;
      sumDailyProfitLoss += c.profitLossAED;

      dailyRows.push([
        idx + 1,
        l.date,
        act ? act.code : 'N/A',
        act ? act.division : '',
        act ? act.subActivity : 'Unknown Activity',
        Number(c.actualQty) || 0,
        act ? act.unit : '',
        Number(c.actualCost.toFixed(2)),
        Number(c.actualUnitCost.toFixed(2)),
        Number(c.budgetUnitRate.toFixed(2)),
        Number(c.earnedBudget.toFixed(2)),
        Number(c.profitLossAED.toFixed(2)),
        `${c.profitLossPercent >= 0 ? '+' : ''}${c.profitLossPercent.toFixed(1)}%`,
        Number(c.productivityIndex.toFixed(2)),
        c.isLoss ? 'LOSS INCURRED' : 'PROFITABLE',
        l.notes || ''
      ]);
    });

    const dailyTotalsRow = new Array(16).fill('');
    dailyTotalsRow[0] = 'TOTALS';
    dailyTotalsRow[5] = Number(sumDailyQty.toFixed(1));
    dailyTotalsRow[7] = Number(sumDailyActualCost.toFixed(2));
    dailyTotalsRow[10] = Number(sumDailyEarned.toFixed(2));
    dailyTotalsRow[11] = Number(sumDailyProfitLoss.toFixed(2));
    dailyRows.push(dailyTotalsRow);

    const wsDaily = XLSX.utils.aoa_to_sheet(dailyRows);
    wsDaily['!cols'] = [
      { wch: 7 },  // Log #
      { wch: 14 }, // Date
      { wch: 14 }, // Code
      { wch: 8 },  // Div
      { wch: 42 }, // Sub Activity
      { wch: 16 }, // Output Done
      { wch: 8 },  // Unit
      { wch: 18 }, // Actual Spent
      { wch: 16 }, // Actual Rate
      { wch: 18 }, // Budget Rate
      { wch: 18 }, // Earned Value
      { wch: 18 }, // Profit Loss
      { wch: 14 }, // Profit Loss %
      { wch: 14 }, // Index
      { wch: 16 }, // Status
      { wch: 45 }  // Notes
    ];
    XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Site Actuals');

    // ==========================================
    // SHEET 3: PROJECT EXECUTIVE SUMMARY REPORT
    // ==========================================
    const summaryData = [
      ['CANDY PRODUCTIVITY & SITE MONITORING EXECUTIVE REPORT', ''],
      ['Generated on:', new Date().toLocaleString()],
      ['', ''],
      ['PROJECT DETAILS', ''],
      ['Project Name:', prj.name],
      ['Project Code:', prj.code],
      ['Client / Main Contractor:', prj.client || 'N/A'],
      ['Start Date:', prj.startDate || 'N/A'],
      ['Target End Date:', prj.targetEndDate || 'N/A'],
      ['Standard Shift Hours:', `${prj.shiftHours || 10} Hours / Day`],
      ['Loss Alert Sensitivity:', `${prj.lossThreshold || 0}% variance`],
      ['', ''],
      ['FINANCIAL & PRODUCTIVITY PERFORMANCE KPI', 'VALUE'],
      ['Total Candy Baseline Budget:', `${totalBOQBudget.toFixed(2)} AED`],
      ['Total Earned Value (Work Done):', `${totalEarnedValue.toFixed(2)} AED`],
      ['Total Actual Cost (Spent to Date):', `${totalActualCost.toFixed(2)} AED`],
      ['Net Cumulative Profit / Loss:', `${netProfitLoss >= 0 ? '+' : ''}${netProfitLoss.toFixed(2)} AED`],
      ['Cumulative Profit / Loss %:', `${netProfitLoss >= 0 ? '+' : ''}${netProfitLossPercent.toFixed(1)}%`],
      ['Overall Cost Performance Index (CPI):', overallProductivityIndex.toFixed(2)],
      ['Overall Physical Progress %:', `${overallPercentDone.toFixed(1)}%`],
      ['Performance Status:', netProfitLoss >= 0 ? 'PROFITABLE (ON BUDGET)' : 'COST OVERRUN / LOSS (INTERVENTION REQUIRED)'],
      ['Total Fixed Baseline Activities:', (prj.fixedActivities || []).length],
      ['Total Daily Site Shift Records:', (prj.dailyLogs || []).length]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 38 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

    // =======================================================
    // SHEET 4: AUDIT TRAIL LOG ("WHO DID WHAT" BACKUP AUDIT)
    // =======================================================
    const auditHeaders = ['Audit ID', 'Date & Time', 'User', 'Role', 'Action Taken', 'Target Entity', 'Audit Details & Changes'];
    const auditRows = [
      [`CANDY SYSTEM AUDIT TRAIL (WHO DID WHAT) - ${prj.code} (${prj.name})`],
      [`Generated: ${new Date().toLocaleString()} | Total Recorded Events: ${(appState.auditTrail || []).length}`],
      [],
      auditHeaders
    ];

    (appState.auditTrail || []).forEach(a => {
      auditRows.push([
        a.id || '',
        a.timestamp || '',
        a.user || 'Unknown',
        a.role || 'Site User',
        a.action || '',
        a.target || '',
        a.details || ''
      ]);
    });

    const wsAudit = XLSX.utils.aoa_to_sheet(auditRows);
    wsAudit['!cols'] = [
      { wch: 20 },
      { wch: 22 },
      { wch: 18 },
      { wch: 14 },
      { wch: 24 },
      { wch: 26 },
      { wch: 60 }
    ];
    XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit Trail (Who Did What)');

    const fileName = `${prj.code}_Productivity_Master_${new Date().toISOString().slice(0, 10)}.xlsx`;

    try {
      XLSX.writeFile(wb, fileName);
    } catch (writeErr) {
      console.warn('XLSX.writeFile failed, using Blob fallback:', writeErr);
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      triggerBlobDownload(blob, fileName);
    }

    showToast(`✓ Master Excel report exported: ${fileName}`);
  } catch (err) {
    console.error('Export error:', err);
    alert('Error exporting Excel: ' + err.message + '\n\nFalling back to CSV export.');
    exportToCSV();
  }
}

function exportToCSV() {
  const prj = getCurrentProject();
  if (!prj) return;

  const rows = [
    ['Date', 'Candy Code', 'Sub Activity', 'Daily Output Qty', 'Unit', 'Actual Cost AED', 'Actual Unit Cost AED', 'Budget Unit Rate AED', 'Profit Loss AED', 'Profit Loss %', 'Status', 'Notes']
  ];

  (prj.dailyLogs || []).forEach(l => {
    const act = (prj.fixedActivities || []).find(a => a.id === l.activityId);
    const c = calculateDailyLog(l, act, prj);
    rows.push([
      `"${l.date}"`,
      `"${act ? act.code : ''}"`,
      `"${(act ? act.subActivity : '').replace(/"/g, '""')}"`,
      c.actualQty,
      `"${act ? act.unit : ''}"`,
      c.actualCost.toFixed(2),
      c.actualUnitCost.toFixed(2),
      c.budgetUnitRate.toFixed(2),
      c.profitLossAED.toFixed(2),
      `"${c.profitLossPercent.toFixed(1)}%"`,
      `"${c.isLoss ? 'LOSS' : 'PROFIT'}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileName = `${prj.code}_Daily_Productivity_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerBlobDownload(blob, fileName);
  showToast(`Exported ${fileName} successfully!`);
}

// --- 7. GLOBAL INTERACTIVE HANDLERS ---

function switchNavTab(tab) {
  if (tab === 'dashboard' && !isDashboardVisibleToCurrentUser()) {
    showAccessDenied('view the Executive Dashboard tab. The Dashboard view tab has been restricted by the Administrator.');
    tab = 'fixed';
  }
  appState.activeNavTab = tab;
  const navDashboard = document.getElementById('nav-dashboard');
  const navFixed = document.getElementById('nav-fixed-activities');
  const navDaily = document.getElementById('nav-daily-logs');
  const navMatrix = document.getElementById('nav-matrix');

  const secDashboard = document.getElementById('section-dashboard');
  const secFixed = document.getElementById('section-fixed-activities');
  const secDaily = document.getElementById('section-daily-logs');
  const secMatrix = document.getElementById('section-matrix');

  [navDashboard, navFixed, navDaily, navMatrix].forEach(btn => {
    if (btn) btn.className = 'nav-tab px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition-all cursor-pointer';
  });

  if (secDashboard) secDashboard.classList.add('hidden');
  if (secFixed) secFixed.classList.add('hidden');
  if (secDaily) secDaily.classList.add('hidden');
  if (secMatrix) secMatrix.classList.add('hidden');

  if (tab === 'dashboard') {
    if (navDashboard) navDashboard.className = 'nav-tab px-3.5 py-2 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-200 flex items-center gap-2 transition-all cursor-pointer';
    if (secDashboard) secDashboard.classList.remove('hidden');
    renderCharts();
  } else if (tab === 'fixed') {
    if (navFixed) navFixed.className = 'nav-tab px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-2 transition-all cursor-pointer';
    if (secFixed) secFixed.classList.remove('hidden');
    renderFixedActivitiesTable();
  } else if (tab === 'daily') {
    if (navDaily) navDaily.className = 'nav-tab px-3.5 py-2 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-2 transition-all cursor-pointer';
    if (secDaily) secDaily.classList.remove('hidden');
    renderDailyLogsTable();
  } else if (tab === 'matrix') {
    if (navMatrix) navMatrix.className = 'nav-tab px-3.5 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 flex items-center gap-2 transition-all cursor-pointer';
    if (secMatrix) secMatrix.classList.remove('hidden');
    renderMatrixTable();
  }
  if (window.lucide) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function forceResetAllData() {
  if (!isCurrentUserAdmin()) {
    showAccessDenied('reset the system to factory demo baselines');
    return;
  }
  const confirmation = prompt('DANGER: This will delete ALL custom projects and revert to initial demo data.\n\nTo confirm, type RESET in capital letters:');
  if (confirmation === 'RESET') {
    safeStorage.removeItem('candy_site_projects');
    safeStorage.removeItem('candy_active_project_id');
    appState.projects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
    appState.currentProjectId = 'prj-1';
    appState.editingFixedActivityId = null;
    appState.editingDailyLogId = null;
    appState.expandedActivityIds = new Set(['act-1']);
    saveState();
    renderApp();
    showToast('Factory demo project data restored.');
  }
}

function applyGangPreset(key) {
  const preset = GANG_PRESETS[key];
  if (!preset) return;
  const wQty = document.getElementById('inp-workout-qty');
  if (wQty) wQty.value = preset.workoutQty;
  populateModalLabourInputs(preset.labour);
  populateModalPlantInputs(preset.plant);
  triggerFixedModalCalculation();
}

function handleProjectChange(val) {
  appState.currentProjectId = val;
  saveState();
  renderApp();
  const prj = getCurrentProject();
  if (prj) showToast(`Switched project to: ${prj.name}`);
}

function handleDailyActivitySelection(actId) {
  updateDailyModalLabels();
  const prj = getCurrentProject();
  const act = (prj?.fixedActivities || []).find(a => a.id === actId);
  if (act) {
    const qtyInp = document.getElementById('inp-daily-qty');
    if (qtyInp) qtyInp.value = act.workoutQty || 100;
    populateDailyLabourInputs(act.labourHours || {});
    populateDailyPlantInputs(act.plantHours || {});
    triggerDailyModalCalculation();
  }
}

function handleDailyFilterActivity(actId) {
  appState.filterDailyActivityId = actId;
  renderDailyLogsTable();
}

function handleDailyFilterDate(dt) {
  appState.filterDailyDate = dt;
  renderDailyLogsTable();
}

function handleFixedSearch(query) {
  appState.searchFixedQuery = query;
  renderFixedActivitiesTable();
}

// --- 8. INITIALIZATION & SAFE LISTENER BINDINGS ---
function safeAddListener(id, evt, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(evt, fn);
}

function initApp() {
  // Project Switcher
  safeAddListener('project-selector', 'change', (e) => handleProjectChange(e.target.value));

  // Modal Input Calculation Bindings
  safeAddListener('inp-unit', 'change', (e) => {
    const lbl = document.getElementById('label-modal-unit');
    if (lbl) lbl.textContent = e.target.value;
  });
  safeAddListener('inp-total-qty', 'input', triggerFixedModalCalculation);
  safeAddListener('inp-workout-qty', 'input', triggerFixedModalCalculation);
  safeAddListener('preset-selector', 'change', (e) => applyGangPreset(e.target.value));

  safeAddListener('inp-daily-activity-id', 'change', (e) => handleDailyActivitySelection(e.target.value));
  safeAddListener('inp-daily-qty', 'input', triggerDailyModalCalculation);

  // Search & Filters
  safeAddListener('search-fixed', 'input', (e) => handleFixedSearch(e.target.value));
  safeAddListener('filter-daily-date', 'change', (e) => handleDailyFilterDate(e.target.value));

  // Set today's date in badge
  const dtLbl = document.getElementById('label-current-date');
  if (dtLbl) dtLbl.textContent = new Date().toISOString().slice(0, 10);

  // Ensure state is cleanly flushed to localStorage on page refresh or close
  window.addEventListener('beforeunload', () => {
    saveState();
  });

  // Initial Auth Check and Render / Route to Login Screen
  checkAuthAndRoute();
}

// Auto-run when DOM is ready (or immediately if already parsed)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Expose all public APIs to window for inline onclick / onchange handlers
window.showModal = showModal;
window.hideModal = hideModal;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.saveProjectFromModal = saveProjectFromModal;
window.openFixedActivityModal = openFixedActivityModal;
window.closeFixedActivityModal = closeFixedActivityModal;
window.saveFixedActivityFromModal = saveFixedActivityFromModal;
window.openDailyModal = openDailyModal;
window.closeDailyModal = closeDailyModal;
window.saveDailyLogFromModal = saveDailyLogFromModal;
window.openDailyModalForActivity = openDailyModalForActivity;
window.openSolutionModal = openSolutionModal;
window.closeSolutionModal = closeSolutionModal;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.switchSettingsTab = switchSettingsTab;
window.saveSettingsFromModal = saveSettingsFromModal;
window.resetSettingsToDefaults = resetSettingsToDefaults;
window.exportToExcel = exportToExcel;
window.exportToCSV = exportToCSV;
window.forceResetAllData = forceResetAllData;
window.switchNavTab = switchNavTab;
window.toggleActivityExpand = toggleActivityExpand;
window.editFixedActivity = editFixedActivity;
window.deleteFixedActivity = deleteFixedActivity;
window.editDailyLog = editDailyLog;
window.deleteDailyLog = deleteDailyLog;
window.applyGangPreset = applyGangPreset;
window.handleProjectChange = handleProjectChange;
window.handleDailyActivitySelection = handleDailyActivitySelection;
window.handleDailyFilterActivity = handleDailyFilterActivity;
window.handleDailyFilterDate = handleDailyFilterDate;
window.handleFixedSearch = handleFixedSearch;
window.triggerDailyModalCalculation = triggerDailyModalCalculation;
window.triggerFixedModalCalculation = triggerFixedModalCalculation;
window.updateDailyModalLabels = updateDailyModalLabels;
window.getCurrentProject = getCurrentProject;
window.renderApp = renderApp;
window.appState = appState;
window.toggleSearchDropdown = toggleSearchDropdown;
window.closeAllDropdowns = closeAllDropdowns;
window.filterDropdownList = filterDropdownList;
window.clearDailyDateFilter = clearDailyDateFilter;
window.handleMatrixDateFilter = handleMatrixDateFilter;
window.handleMatrixActFilter = handleMatrixActFilter;
window.toggleAllMatrixLogs = toggleAllMatrixLogs;
window.toggleMatrixActivityExpand = toggleMatrixActivityExpand;
window.populateDailyFilterActivityDropdown = populateDailyFilterActivityDropdown;
window.populateModalDailyActivityDropdown = populateModalDailyActivityDropdown;
window.populateMatrixDropdowns = populateMatrixDropdowns;
window.toggleTopControlMenu = toggleTopControlMenu;
window.closeTopControlMenu = closeTopControlMenu;
window.deleteCurrentProject = deleteCurrentProject;
window.deleteProjectById = deleteProjectById;
window.openManageProjectsModal = openManageProjectsModal;
window.closeManageProjectsModal = closeManageProjectsModal;
window.populateManageProjectsModal = populateManageProjectsModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.handleLoginFormSubmit = handleLoginFormSubmit;
window.loginUser = loginUser;
window.switchRoleQuick = switchRoleQuick;
window.handleAddNewUserFormSubmit = handleAddNewUserFormSubmit;
window.deleteUserAccount = deleteUserAccount;
window.populateUserManagementTable = populateUserManagementTable;
window.exportBackupJSON = exportBackupJSON;
window.handleBackupFileSelect = handleBackupFileSelect;
window.importBackupJSON = importBackupJSON;
window.manualSaveWithFeedback = manualSaveWithFeedback;
window.isCurrentUserAdmin = isCurrentUserAdmin;
window.getTodayDate = getTodayDate;
window.checkAuthAndRoute = checkAuthAndRoute;
window.renderLoginScreenCredentials = renderLoginScreenCredentials;
window.handleLoginScreenSubmit = handleLoginScreenSubmit;
window.quickLogin = quickLogin;
window.logoutUser = logoutUser;
window.togglePasswordVisibility = togglePasswordVisibility;
window.openManageCredentialsModal = openManageCredentialsModal;
window.closeManageCredentialsModal = closeManageCredentialsModal;
window.renderCredentialsModal = renderCredentialsModal;
window.addAdminCredentialRow = addAdminCredentialRow;
window.addUserCredentialRow = addUserCredentialRow;
window.deleteCredentialRow = deleteCredentialRow;
window.saveCredentialsFromModal = saveCredentialsFromModal;
window.showAccessDenied = showAccessDenied;
window.closeAccessDeniedModal = closeAccessDeniedModal;
window.openEditProjectModal = openEditProjectModal;
window.selectFixedDivision = selectFixedDivision;
window.selectFixedUnit = selectFixedUnit;
window.populateFixedUnitDropdown = populateFixedUnitDropdown;
window.selectFixedMainActivity = selectFixedMainActivity;
window.populateFixedMainActivityDropdown = populateFixedMainActivityDropdown;
window.renderSettingsMainActivities = renderSettingsMainActivities;
window.saveMainActivityFromSettings = saveMainActivityFromSettings;
window.editMainActivityFromSettings = editMainActivityFromSettings;
window.resetMainActivityForm = resetMainActivityForm;
window.deleteMainActivityFromSettings = deleteMainActivityFromSettings;
window.renderSettingsUnits = renderSettingsUnits;
window.addUnitFromSettings = addUnitFromSettings;
window.deleteUnitFromSettings = deleteUnitFromSettings;
window.renderSettingsLabourTrades = renderSettingsLabourTrades;
window.addLabourTradeFromSettings = addLabourTradeFromSettings;
window.deleteLabourTradeFromSettings = deleteLabourTradeFromSettings;
window.renderSettingsPlantEquipment = renderSettingsPlantEquipment;
window.addPlantEquipmentFromSettings = addPlantEquipmentFromSettings;
window.deletePlantEquipmentFromSettings = deletePlantEquipmentFromSettings;
window.saveProjectSettingsFromTab = saveProjectSettingsFromTab;
window.renderMatrixHeader = renderMatrixHeader;
window.getEffectiveUser = getEffectiveUser;
window.renderSettingsDivisions = renderSettingsDivisions;
window.addDivisionFromSettings = addDivisionFromSettings;
window.deleteDivisionFromSettings = deleteDivisionFromSettings;
window.quickPromptNewDivision = quickPromptNewDivision;
window.populateFixedDivisionDropdown = populateFixedDivisionDropdown;
window.toggleCustomMainActInput = toggleCustomMainActInput;
window.applyCustomMainActivityInput = applyCustomMainActivityInput;
window.toggleAddLabourInline = toggleAddLabourInline;
window.addLabourInlineToActivity = addLabourInlineToActivity;
window.toggleAddPlantInline = toggleAddPlantInline;
window.addPlantInlineToActivity = addPlantInlineToActivity;
window.saveDashboardCustomizationFromTab = saveDashboardCustomizationFromTab;
window.resetDashboardCustomizationToDefault = resetDashboardCustomizationToDefault;
window.renderAuditTrailTable = renderAuditTrailTable;
window.filterAuditTrailTable = filterAuditTrailTable;
window.clearAuditTrailHistory = clearAuditTrailHistory;
window.exportAuditTrailCSV = exportAuditTrailCSV;
window.exportAuditTrailJSON = exportAuditTrailJSON;
window.renderCodeStudioPanel = renderCodeStudioPanel;
window.onCodeSelectSubActChange = onCodeSelectSubActChange;
window.saveSubActivityDescriptionFromStudio = saveSubActivityDescriptionFromStudio;
window.onCodeSelectMainActChange = onCodeSelectMainActChange;
window.saveMainActivityDescriptionFromStudio = saveMainActivityDescriptionFromStudio;
window.exportStateForPython = exportStateForPython;
window.importPythonStateFile = importPythonStateFile;
window.togglePythonScriptViewer = togglePythonScriptViewer;
window.handleDashboardDateChange = handleDashboardDateChange;
window.setDashboardDateFilter = setDashboardDateFilter;
window.navigateDashboardDate = navigateDashboardDate;
window.setDashboardDisplayMode = setDashboardDisplayMode;
window.openDailyModalWithDate = openDailyModalWithDate;
window.setFixedRateMode = setFixedRateMode;
window.setDailyCostMode = setDailyCostMode;
window.handleDailyManualUnitCostInput = handleDailyManualUnitCostInput;
window.handleDailyManualTotalCostInput = handleDailyManualTotalCostInput;
window.toggleDashboardTabVisibilitySetting = toggleDashboardTabVisibilitySetting;
window.toggleManualFixedRateSetting = toggleManualFixedRateSetting;
window.toggleManualDailyRateSetting = toggleManualDailyRateSetting;
window.isDashboardVisibleToCurrentUser = isDashboardVisibleToCurrentUser;
window.isManualFixedRateEnabled = isManualFixedRateEnabled;
window.isManualDailyRateEnabled = isManualDailyRateEnabled;
window.saveResourceRatesFromSettings = saveResourceRatesFromSettings;
window.editDivisionFromSettings = editDivisionFromSettings;
window.resetDivisionForm = resetDivisionForm;
window.saveDivisionFromSettings = saveDivisionFromSettings;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.switchSettingsTab = switchSettingsTab;
window.saveSettingsFromModal = saveSettingsFromModal;

