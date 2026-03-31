// ─── DASHBOARD RENDER & EDIT ─────────────────────────────────────────────────

window.renderDashboard = function() {
  renderEditHint();
  renderUrgentBanner();
  renderMilestones();
  renderWorkstreams();
  renderAttentionItems();
  renderProgressBars();
  renderContacts();
  updateFooter();
};

// ─── EDIT HINT BANNER ────────────────────────────────────────────────────────
function renderEditHint() {
  const el = document.getElementById('edit-hint');
  if (!el) return;
  el.style.display = APP.editMode ? 'flex' : 'none';
}

// ─── URGENT BANNER ───────────────────────────────────────────────────────────
function renderUrgentBanner() {
  const el = document.getElementById('urgent-banner');
  if (!el) return;
  const text    = getConfigValue('urgent_banner', 'No urgent items');
  const nearest = APP.data.milestones.length
    ? APP.data.milestones.reduce((a, b) => (new Date(a.date) < new Date(b.date) ? a : b))
    : null;
  const days    = nearest ? daysRemaining(nearest.date) : null;

  if (APP.editMode) {
    el.innerHTML = `
      <span class="urgent-dot"></span>
      <span class="urgent-label">URGENT</span>
      <span class="urgent-text" contenteditable="true" data-editable data-config-key="urgent_banner">${escapeHtml(text)}</span>`;
  } else {
    el.innerHTML = `
      <span class="urgent-dot"></span>
      <span class="urgent-label">URGENT</span>
      ${days !== null ? `<span class="urgent-days">&mdash; ${days} days:</span>` : ''}
      <span class="urgent-text">${escapeHtml(text)}</span>`;
  }
}

// ─── MILESTONES ───────────────────────────────────────────────────────────────
function renderMilestones() {
  const container = document.getElementById('milestones-grid');
  if (!container) return;
  const milestones = [...APP.data.milestones].sort((a, b) => a.sort_order - b.sort_order);

  container.innerHTML = milestones.map((m, idx) => {
    const days    = daysRemaining(m.date);
    const urgency = days <= 14 ? 'urgent' : days <= 30 ? 'warning' : days <= 45 ? 'caution' : 'normal';
    const hasDot  = urgency !== 'normal';

    if (APP.editMode) {
      return `
        <div class="milestone-card ${urgency}" data-id="${m.id}" data-sort="${idx}">
          <div class="drag-handle">⠿</div>
          <div class="milestone-days">${days}</div>
          <div class="milestone-days-label">DAYS</div>
          <div class="milestone-label" contenteditable="true" data-editable data-field="label">${escapeHtml(m.label)}</div>
          <input type="date" class="edit-date-input" data-field="date" value="${m.date}" style="margin-top:6px">
          <button class="delete-btn" onclick="deleteMilestone(${m.id})" title="Delete">✕</button>
        </div>`;
    }

    return `
      <div class="milestone-card ${urgency}">
        ${hasDot ? '<div class="milestone-dot"></div>' : ''}
        <div class="milestone-days">${days}</div>
        <div class="milestone-days-label">DAYS</div>
        <div class="milestone-label">${escapeHtml(m.label)}</div>
        <div class="milestone-date-display">${formatDisplayDate(m.date)}</div>
      </div>`;
  }).join('');

  if (APP.editMode) {
    container.innerHTML += `
      <button class="add-row-btn" onclick="addMilestone()">+ Add Milestone</button>`;
  }
}

window.deleteMilestone = function(id) {
  APP.data.milestones = APP.data.milestones.filter(m => m.id !== id);
  if (id > 0) APP.deletedIds.milestones.push(id);
  renderMilestones();
  if (APP.editMode) initMilestoneSortable();
};

window.addMilestone = function() {
  const maxOrder = APP.data.milestones.reduce((m, x) => Math.max(m, x.sort_order), 0);
  APP.data.milestones.push({
    id: -(Date.now()),   // negative temp id
    label: 'New Milestone',
    date: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
    sort_order: maxOrder + 1
  });
  renderMilestones();
  if (APP.editMode) initMilestoneSortable();
};

// ─── WORKSTREAMS ──────────────────────────────────────────────────────────────
function renderWorkstreams() {
  const container = document.getElementById('workstreams-list');
  if (!container) return;
  const workstreams = [...APP.data.workstreams].sort((a, b) => a.sort_order - b.sort_order);

  const STATUS_OPTIONS = [
    'converge','mid-late-apr','may','late-may-jun','active','pending','embed','default'
  ];

  container.innerHTML = workstreams.map((w, idx) => {
    if (APP.editMode) {
      const opts = STATUS_OPTIONS.map(s =>
        `<option value="${s}" ${w.status_color === s ? 'selected' : ''}>${s}</option>`
      ).join('');
      return `
        <div class="workstream-row" data-id="${w.id}" data-sort="${idx}">
          <div class="drag-handle">⠿</div>
          <div class="ws-dot"></div>
          <div class="ws-info">
            <div class="ws-name" contenteditable="true" data-editable data-field="name">${escapeHtml(w.name)}</div>
            <div class="ws-subtitle" contenteditable="true" data-editable data-field="subtitle">${escapeHtml(w.subtitle || '')}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
            <input type="text" class="edit-select" data-field="status_label" value="${escapeHtml(w.status_label || '')}" style="width:100px;font-size:11px">
            <select class="edit-select" data-field="status_color">${opts}</select>
          </div>
          <button class="delete-btn" onclick="deleteWorkstream(${w.id})" title="Delete">✕</button>
        </div>`;
    }

    return `
      <div class="workstream-row" data-id="${w.id}">
        <div class="ws-dot"></div>
        <div class="ws-info">
          <div class="ws-name">${escapeHtml(w.name)}</div>
          <div class="ws-subtitle">${escapeHtml(w.subtitle || '')}</div>
        </div>
        <span class="ws-badge badge-${w.status_color || 'default'}">${escapeHtml(w.status_label || '')}</span>
      </div>`;
  }).join('');

  if (APP.editMode) {
    container.innerHTML += `
      <button class="add-row-btn" onclick="addWorkstream()">+ Add Workstream</button>`;
  }
}

window.deleteWorkstream = function(id) {
  APP.data.workstreams = APP.data.workstreams.filter(w => w.id !== id);
  if (id > 0) APP.deletedIds.workstreams.push(id);
  renderWorkstreams();
  if (APP.editMode) initWorkstreamSortable();
};

window.addWorkstream = function() {
  const maxOrder = APP.data.workstreams.reduce((m, x) => Math.max(m, x.sort_order), 0);
  APP.data.workstreams.push({
    id: -(Date.now()),
    name: 'New Workstream',
    subtitle: '',
    status_label: 'TBD',
    status_color: 'default',
    stream_id: null,
    sort_order: maxOrder + 1
  });
  renderWorkstreams();
  if (APP.editMode) initWorkstreamSortable();
};

// ─── ATTENTION ITEMS ──────────────────────────────────────────────────────────
function renderAttentionItems() {
  const container = document.getElementById('attention-list');
  if (!container) return;
  const PRIORITY_ORDER = { 'NOW': 0, 'THIS WEEK': 1, 'WATCH': 2 };
  const items = [...APP.data.attention_items].sort((a, b) => {
    const po = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    return po !== 0 ? po : a.sort_order - b.sort_order;
  });

  const PRIORITY_OPTIONS = ['NOW', 'THIS WEEK', 'WATCH'];

  container.innerHTML = items.map((item, idx) => {
    const priorityClass = 'priority-' + item.priority.replace(/\s+/g, '-');

    if (APP.editMode) {
      const opts = PRIORITY_OPTIONS.map(p =>
        `<option value="${p}" ${item.priority === p ? 'selected' : ''}>${p}</option>`
      ).join('');
      return `
        <div class="attention-item" data-id="${item.id}" data-sort="${idx}">
          <div class="drag-handle">⠿</div>
          <select class="edit-select priority-badge" data-field="priority" style="margin-top:2px">${opts}</select>
          <div class="attention-text" contenteditable="true" data-editable data-field="text">${escapeHtml(item.text)}</div>
          <button class="delete-btn" onclick="deleteAttentionItem(${item.id})" title="Delete">✕</button>
        </div>`;
    }

    // Bold the first phrase (up to first dash or em-dash)
    const parts   = item.text.split(/\s*[—–-]\s*/);
    const display = parts.length > 1
      ? `<strong>${escapeHtml(parts[0])}</strong> &mdash; ${escapeHtml(parts.slice(1).join(' — '))}`
      : escapeHtml(item.text);

    return `
      <div class="attention-item" data-id="${item.id}">
        <span class="priority-badge ${priorityClass}">${escapeHtml(item.priority)}</span>
        <div class="attention-text">${display}</div>
      </div>`;
  }).join('');

  if (APP.editMode) {
    container.innerHTML += `
      <button class="add-row-btn" onclick="addAttentionItem()">+ Add Item</button>`;
  }
}

window.deleteAttentionItem = function(id) {
  APP.data.attention_items = APP.data.attention_items.filter(i => i.id !== id);
  if (id > 0) APP.deletedIds.attention_items.push(id);
  renderAttentionItems();
  if (APP.editMode) initAttentionSortable();
};

window.addAttentionItem = function() {
  const maxOrder = APP.data.attention_items.reduce((m, x) => Math.max(m, x.sort_order), 0);
  APP.data.attention_items.push({
    id: -(Date.now()),
    priority: 'WATCH',
    text: 'New item — add detail here.',
    sort_order: maxOrder + 1
  });
  renderAttentionItems();
  if (APP.editMode) initAttentionSortable();
};

// ─── PROGRESS BARS ────────────────────────────────────────────────────────────
function renderProgressBars() {
  const container = document.getElementById('progress-list');
  if (!container) return;
  const items = [...APP.data.progress_items].sort((a, b) => a.sort_order - b.sort_order);

  container.innerHTML = items.map((item, idx) => {
    const pct      = Math.min(100, Math.max(0, item.percentage));
    const fillClass = item.bar_color !== 'auto'
      ? ''
      : pct >= 70 ? 'fill-green' : pct >= 30 ? 'fill-amber' : 'fill-red';
    const fillStyle = item.bar_color !== 'auto'
      ? `background:${escapeHtml(item.bar_color)};`
      : '';

    if (APP.editMode) {
      return `
        <div class="progress-item" data-id="${item.id}" data-sort="${idx}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <div class="drag-handle">⠿</div>
            <div class="progress-label" style="flex:1" contenteditable="true" data-editable data-field="label">${escapeHtml(item.label)}</div>
            <span class="progress-pct">${pct}%</span>
            <button class="delete-btn" onclick="deleteProgressItem(${item.id})" title="Delete">✕</button>
          </div>
          <input type="range" min="0" max="100" value="${pct}" data-field="percentage"
            oninput="this.closest('.progress-item').querySelector('.progress-fill').style.width=this.value+'%'; this.closest('.progress-item').querySelector('.progress-pct').textContent=this.value+'%'">
          <div class="progress-track" style="margin-top:4px">
            <div class="progress-fill ${fillClass}" style="width:${pct}%;${fillStyle}"></div>
          </div>
        </div>`;
    }

    return `
      <div class="progress-item" data-id="${item.id}">
        <div class="progress-header">
          <span class="progress-label">${escapeHtml(item.label)}</span>
          <span class="progress-pct">${pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${fillClass}" style="width:${pct}%;${fillStyle}"></div>
        </div>
      </div>`;
  }).join('');

  if (APP.editMode) {
    container.innerHTML += `
      <button class="add-row-btn" onclick="addProgressItem()">+ Add Progress Bar</button>`;
  }
}

window.deleteProgressItem = function(id) {
  APP.data.progress_items = APP.data.progress_items.filter(i => i.id !== id);
  if (id > 0) APP.deletedIds.progress_items.push(id);
  renderProgressBars();
  if (APP.editMode) initProgressSortable();
};

window.addProgressItem = function() {
  const maxOrder = APP.data.progress_items.reduce((m, x) => Math.max(m, x.sort_order), 0);
  APP.data.progress_items.push({
    id: -(Date.now()),
    label: 'New Item',
    percentage: 0,
    bar_color: 'auto',
    sort_order: maxOrder + 1
  });
  renderProgressBars();
  if (APP.editMode) initProgressSortable();
};

// ─── CONTACTS ─────────────────────────────────────────────────────────────────
function renderContacts() {
  const container = document.getElementById('contacts-grid');
  if (!container) return;
  const contacts = [...APP.data.contacts].sort((a, b) => a.sort_order - b.sort_order);

  container.innerHTML = contacts.map((c, idx) => {
    if (APP.editMode) {
      return `
        <div class="contact-card" data-id="${c.id}" data-sort="${idx}" style="position:relative">
          <div style="display:flex;align-items:flex-start;gap:6px">
            <div class="drag-handle">⠿</div>
            <div style="flex:1;min-width:0">
              <div class="contact-name" contenteditable="true" data-editable data-field="name">${escapeHtml(c.name)}</div>
              <div class="contact-title" contenteditable="true" data-editable data-field="title">${escapeHtml(c.title || '')}</div>
            </div>
            <button class="delete-btn" onclick="deleteContact(${c.id})" title="Delete">✕</button>
          </div>
        </div>`;
    }

    return `
      <div class="contact-card" data-id="${c.id}">
        <div class="contact-name">${escapeHtml(c.name)}</div>
        <div class="contact-title">${escapeHtml(c.title || '')}</div>
      </div>`;
  }).join('');

  if (APP.editMode) {
    container.innerHTML += `
      <button class="add-row-btn" onclick="addContact()" style="grid-column:1/-1">+ Add Contact</button>`;
  }
}

window.deleteContact = function(id) {
  APP.data.contacts = APP.data.contacts.filter(c => c.id !== id);
  if (id > 0) APP.deletedIds.contacts.push(id);
  renderContacts();
  if (APP.editMode) initContactsSortable();
};

window.addContact = function() {
  const maxOrder = APP.data.contacts.reduce((m, x) => Math.max(m, x.sort_order), 0);
  APP.data.contacts.push({
    id: -(Date.now()),
    name: 'New Contact',
    title: 'Role',
    sort_order: maxOrder + 1
  });
  renderContacts();
  if (APP.editMode) initContactsSortable();
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function updateFooter() {
  const el = document.getElementById('footer-label');
  if (el) el.textContent = getConfigValue('footer_label', 'TSA IT · UNIFIED OPERATING MODEL PROGRAM · CONFIDENTIAL');
}

// ─── SORTABLES ────────────────────────────────────────────────────────────────
window.initDashboardSortables = function() {
  initMilestoneSortable();
  initWorkstreamSortable();
  initAttentionSortable();
  initProgressSortable();
  initContactsSortable();
};

function makeSortable(containerId, dataKey, dragClass) {
  const el = document.getElementById(containerId);
  if (!el) return null;
  const s = Sortable.create(el, {
    animation: 150,
    handle: '.drag-handle',
    draggable: dragClass,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: () => {
      const items = el.querySelectorAll(dragClass);
      items.forEach((item, idx) => {
        const id = parseInt(item.dataset.id);
        const row = APP.data[dataKey].find(r => r.id === id);
        if (row) row.sort_order = idx;
      });
    }
  });
  APP.sortables.push(s);
  return s;
}

function initMilestoneSortable()  { makeSortable('milestones-grid',   'milestones',      '.milestone-card[data-id]'); }
function initWorkstreamSortable() { makeSortable('workstreams-list',  'workstreams',     '.workstream-row[data-id]'); }
function initAttentionSortable()  { makeSortable('attention-list',    'attention_items', '.attention-item[data-id]'); }
function initProgressSortable()   { makeSortable('progress-list',     'progress_items',  '.progress-item[data-id]'); }
function initContactsSortable()   { makeSortable('contacts-grid',     'contacts',        '.contact-card[data-id]'); }

// ─── COLLECT DOM VALUES ────────────────────────────────────────────────────────
function collectRows(containerId, selector, dataKey, fields) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const rows = container.querySelectorAll(selector);
  const result = [];

  rows.forEach((row, idx) => {
    const id    = parseInt(row.dataset.id);
    const entry = { sort_order: idx, updated_at: new Date().toISOString() };

    // Only include id if positive (real DB id)
    if (id > 0) entry.id = id;

    fields.forEach(f => {
      const el = row.querySelector(`[data-field="${f}"]`);
      if (!el) return;
      if (el.tagName === 'INPUT' && el.type === 'range') {
        entry[f] = Math.min(100, Math.max(0, parseInt(el.value) || 0));
      } else if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        entry[f] = el.value.trim();
      } else {
        entry[f] = el.textContent.trim();
      }
    });

    // Merge with defaults from APP.data
    const existing = APP.data[dataKey].find(r => r.id === id);
    if (existing) Object.assign(entry, { ...existing, ...entry });

    result.push(entry);
  });

  return result;
}

// ─── SAVE DASHBOARD ───────────────────────────────────────────────────────────
window.saveDashboardData = async function() {
  // Config (urgent banner)
  const bannerEl = document.querySelector('[data-config-key="urgent_banner"]');
  if (bannerEl) await DB.upsertConfig('urgent_banner', bannerEl.textContent.trim());

  // Milestones
  const milestones = collectRows('milestones-grid', '.milestone-card[data-id]', 'milestones', ['label', 'date']);
  await DB.upsertAll('milestones', milestones);

  // Workstreams
  const workstreams = collectRows('workstreams-list', '.workstream-row[data-id]', 'workstreams',
    ['name', 'subtitle', 'status_label', 'status_color']);
  await DB.upsertAll('workstreams', workstreams);

  // Attention items
  const attentionItems = collectRows('attention-list', '.attention-item[data-id]', 'attention_items',
    ['priority', 'text']);
  await DB.upsertAll('attention_items', attentionItems);

  // Progress
  const progressItems = collectRows('progress-list', '.progress-item[data-id]', 'progress_items',
    ['label', 'percentage']);
  await DB.upsertAll('progress_items', progressItems);

  // Contacts
  const contacts = collectRows('contacts-grid', '.contact-card[data-id]', 'contacts',
    ['name', 'title']);
  await DB.upsertAll('contacts', contacts);

  // Process deletes
  for (const [table, ids] of Object.entries(APP.deletedIds)) {
    if (table === 'streams' || table === 'tasks') continue; // handled by roadmap
    for (const id of ids) {
      if (id > 0) await DB.deleteRow(table, id);
    }
  }
};

// ─── REFRESH ──────────────────────────────────────────────────────────────────
window.refreshDashboard = async function() {
  try {
    showToast('Refreshing…', 'info');
    await loadAllData();
    renderDashboard();
    showToast('Refreshed', 'success');
  } catch (err) {
    showToast('Refresh failed: ' + err.message, 'error');
  }
};
