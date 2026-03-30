// ─── SUPABASE CLIENT & APP BOOTSTRAP ────────────────────────────────────────
// Requires @supabase/supabase-js UMD bundle loaded before this file.

const SUPABASE_URL = 'https://vklvzmfmsxonlxzzkbez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2632xgQuFI8jmLqJL5J8tQ_1I77lSdt';

// Global Supabase client
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── GLOBAL APP STATE ────────────────────────────────────────────────────────
window.APP = {
  data: {
    config:          [],
    milestones:      [],
    workstreams:     [],
    attention_items: [],
    progress_items:  [],
    contacts:        [],
    streams:         [],
    tasks:           []
  },
  editMode:    false,
  currentTab:  'dashboard',
  zoom:        1.5,      // px per day (month view = 1.5, quarter = 4.5)
  sortables:   [],       // active SortableJS instances
  deletedIds:  {         // ids queued for deletion on save
    milestones: [], workstreams: [], attention_items: [],
    progress_items: [], contacts: [], streams: [], tasks: []
  }
};

// ─── DATA ACCESS LAYER ───────────────────────────────────────────────────────
window.DB = {
  async fetchAll(table) {
    const { data, error } = await _supabase
      .from(table)
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new Error(`fetchAll(${table}): ${error.message}`);
    return data || [];
  },

  async upsertAll(table, rows) {
    if (!rows || rows.length === 0) return;
    const { error } = await _supabase
      .from(table)
      .upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`upsertAll(${table}): ${error.message}`);
  },

  async deleteRow(table, id) {
    const { error } = await _supabase.from(table).delete().eq('id', id);
    if (error) throw new Error(`deleteRow(${table}, ${id}): ${error.message}`);
  },

  async upsertConfig(key, value) {
    const { error } = await _supabase
      .from('config')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw new Error(`upsertConfig(${key}): ${error.message}`);
  },

  async isEmpty() {
    const { count, error } = await _supabase
      .from('milestones')
      .select('*', { count: 'exact', head: true });
    if (error) return true;
    return count === 0;
  }
};

// ─── TOAST NOTIFICATIONS ─────────────────────────────────────────────────────
window.showToast = function(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
};

// ─── DATA LOADING ────────────────────────────────────────────────────────────
async function loadAllData() {
  const tables = [
    'config', 'milestones', 'workstreams', 'attention_items',
    'progress_items', 'contacts', 'streams', 'tasks'
  ];
  const results = await Promise.all(tables.map(t => DB.fetchAll(t)));
  tables.forEach((t, i) => { APP.data[t] = results[i]; });
}

async function seedDatabase() {
  // Insert in order (streams before tasks due to FK)
  await DB.upsertAll('config',          SEED.config);
  await DB.upsertAll('milestones',      SEED.milestones);
  await DB.upsertAll('workstreams',     SEED.workstreams);
  await DB.upsertAll('attention_items', SEED.attention_items);
  await DB.upsertAll('progress_items',  SEED.progress_items);
  await DB.upsertAll('contacts',        SEED.contacts);
  await DB.upsertAll('streams',         SEED.streams);
  await DB.upsertAll('tasks',           SEED.tasks);
}

// ─── APP INIT ────────────────────────────────────────────────────────────────
window.initApp = async function() {
  try {
    showToast('Connecting to Supabase…', 'info');
    const empty = await DB.isEmpty();
    if (empty) {
      showToast('First run — seeding data…', 'info');
      await seedDatabase();
    }
    await loadAllData();
    renderDashboard();
    renderRoadmap();
    startClock();
    showToast('Ready', 'success');
  } catch (err) {
    console.error('Init error:', err);
    showToast('Offline mode — ' + err.message, 'error');
    // Fall back to seed data so the UI is still useful
    APP.data.config          = SEED.config;
    APP.data.milestones      = SEED.milestones;
    APP.data.workstreams     = SEED.workstreams;
    APP.data.attention_items = SEED.attention_items;
    APP.data.progress_items  = SEED.progress_items;
    APP.data.contacts        = SEED.contacts;
    APP.data.streams         = SEED.streams;
    APP.data.tasks           = SEED.tasks;
    renderDashboard();
    renderRoadmap();
    startClock();
  }
};

// ─── TAB SWITCHING ───────────────────────────────────────────────────────────
window.switchTab = function(tab) {
  APP.currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.getElementById('dashboard-view').style.display =
    tab === 'dashboard' ? 'block' : 'none';
  document.getElementById('roadmap-view').style.display =
    tab === 'roadmap' ? 'block' : 'none';
};

// ─── EDIT MODE TOGGLE ────────────────────────────────────────────────────────
window.toggleEditMode = function() {
  APP.editMode = !APP.editMode;

  // Destroy any active sortable instances
  APP.sortables.forEach(s => { try { s.destroy(); } catch (_) {} });
  APP.sortables = [];

  // Reset deleted ids when entering edit mode fresh
  if (APP.editMode) {
    APP.deletedIds = {
      milestones: [], workstreams: [], attention_items: [],
      progress_items: [], contacts: [], streams: [], tasks: []
    };
  }

  const fab     = document.getElementById('edit-fab');
  const saveBtn = document.getElementById('save-btn');
  fab.classList.toggle('active', APP.editMode);
  saveBtn.style.display = APP.editMode ? 'flex' : 'none';
  document.body.classList.toggle('edit-mode', APP.editMode);

  if (APP.currentTab === 'dashboard') {
    renderDashboard();
    if (APP.editMode) initDashboardSortables();
  } else {
    renderRoadmap();
  }
};

// ─── SAVE ────────────────────────────────────────────────────────────────────
window.saveAll = async function() {
  try {
    showToast('Saving…', 'info');
    document.getElementById('save-btn').disabled = true;

    if (APP.currentTab === 'dashboard') {
      await saveDashboardData();
    } else {
      await saveRoadmapData();
    }

    // Reload fresh data
    await loadAllData();

    // Exit edit mode
    APP.editMode = false;
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-fab').classList.remove('active');
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('save-btn').disabled = false;
    APP.sortables.forEach(s => { try { s.destroy(); } catch (_) {} });
    APP.sortables = [];

    if (APP.currentTab === 'dashboard') renderDashboard();
    else renderRoadmap();

    showToast('Saved successfully', 'success');
  } catch (err) {
    console.error('Save error:', err);
    showToast('Save failed: ' + err.message, 'error');
    document.getElementById('save-btn').disabled = false;
  }
};

// ─── CLOCK ───────────────────────────────────────────────────────────────────
window.startClock = function() {
  function tick() {
    const now  = new Date();
    const time = now.toLocaleTimeString('en-AU', { hour12: false });
    const date = now.toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    });
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (timeEl) timeEl.textContent = time;
    if (dateEl) dateEl.textContent = date;
  }
  tick();
  setInterval(tick, 1000);
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────
window.formatDisplayDate = function(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

window.daysRemaining = function(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
};

window.getConfigValue = function(key, fallback = '') {
  const row = APP.data.config.find(c => c.key === key);
  return row ? row.value : fallback;
};

window.escapeHtml = function(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
