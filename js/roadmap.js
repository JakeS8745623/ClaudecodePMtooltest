// ─── ROADMAP / GANTT VIEW ─────────────────────────────────────────────────────

// Timeline constants
const TIMELINE_START = new Date('2025-07-01T00:00:00');
const TIMELINE_END   = new Date('2028-04-30T00:00:00');
const TOTAL_DAYS     = Math.ceil((TIMELINE_END - TIMELINE_START) / 86400000);

// Zoom levels: px per day
const ZOOM_MONTH   = 1.5;
const ZOOM_QUARTER = 4.5;

// Drag state
let _drag = null;

// Track collapsed streams
const _collapsed = new Set();

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────
window.renderRoadmap = function() {
  buildRoadmapHeader();
  buildGantt();
  updateRoadmapFooter();
  syncScrolls();
};

function buildRoadmapHeader() {
  const el = document.getElementById('roadmap-meta');
  if (!el) return;
  const streams = APP.data.streams.length;
  const tasks   = APP.data.tasks.length;
  const overall = calcOverallProgress();
  el.textContent = `FY2026–FY2028 · ${streams} streams · ${tasks} tasks · ${overall}% overall progress`;
}

function calcOverallProgress() {
  const tasks = APP.data.tasks;
  if (!tasks.length) return 0;
  return Math.round(tasks.reduce((s, t) => s + (t.percent_complete || 0), 0) / tasks.length);
}

function streamProgress(streamId) {
  const tasks = APP.data.tasks.filter(t => t.stream_id === streamId);
  if (!tasks.length) return 0;
  return Math.round(tasks.reduce((s, t) => s + (t.percent_complete || 0), 0) / tasks.length);
}

// ─── BUILD GANTT ─────────────────────────────────────────────────────────────
function buildGantt() {
  const filterVal = document.getElementById('stream-filter')
    ? document.getElementById('stream-filter').value
    : 'all';

  const streams = [...APP.data.streams].sort((a, b) => a.sort_order - b.sort_order)
    .filter(s => filterVal === 'all' || String(s.id) === filterVal);

  const pxPerDay = APP.zoom;
  const totalW   = Math.ceil(TOTAL_DAYS * pxPerDay);

  // Build left panel
  buildLeftPanel(streams);

  // Build right timeline
  buildTimeline(streams, pxPerDay, totalW);
}

// ─── LEFT PANEL ──────────────────────────────────────────────────────────────
function buildLeftPanel(streams) {
  const left = document.getElementById('gantt-left');
  if (!left) return;

  let html = `<div class="gantt-left-header">
    <span class="gantt-left-header-label">STREAM</span>
  </div>`;

  streams.forEach(stream => {
    const tasks     = [...APP.data.tasks]
      .filter(t => t.stream_id === stream.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const pct       = streamProgress(stream.id);
    const collapsed = _collapsed.has(stream.id);

    html += `
      <div class="gantt-stream-header" onclick="toggleStream(${stream.id})">
        <span class="gantt-stream-toggle">${collapsed ? '▶' : '▼'}</span>
        <div class="gantt-stream-info">
          <div class="gantt-stream-name">${escapeHtml(stream.name)}</div>
          <div class="gantt-stream-desc">${escapeHtml(stream.description || '')}</div>
          <div class="gantt-stream-pct">${pct}% complete</div>
        </div>
        ${APP.editMode ? `
          <button class="delete-btn" onclick="event.stopPropagation();deleteStream(${stream.id})" title="Delete stream">✕</button>
        ` : ''}
      </div>`;

    if (!collapsed) {
      tasks.forEach(task => {
        html += `
          <div class="gantt-task-row-left" data-task-id="${task.id}">
            <div class="gantt-task-name-left" title="${escapeHtml(task.name)}">${escapeHtml(task.name)}</div>
          </div>`;
      });

      if (APP.editMode) {
        html += `
          <div class="gantt-task-row-left">
            <button class="add-row-btn" style="margin:0;font-size:11px;padding:3px 8px"
              onclick="addTask(${stream.id})">+ Add Task</button>
          </div>`;
      }
    }
  });

  if (APP.editMode) {
    html += `
      <div style="padding:8px">
        <button class="add-row-btn" style="margin:0" onclick="addStream()">+ Add Stream</button>
      </div>`;
  }

  left.innerHTML = html;
}

// ─── TIMELINE ────────────────────────────────────────────────────────────────
function buildTimeline(streams, pxPerDay, totalW) {
  const right = document.getElementById('gantt-right');
  if (!right) return;

  const today = new Date();

  // ── Timeline header ──
  let yearHtml  = '';
  let monthHtml = '';
  const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const months  = getAllMonths(TIMELINE_START, TIMELINE_END);

  // Group months by year for the year row
  const yearGroups = [];
  months.forEach(m => {
    const yr = m.getFullYear();
    if (!yearGroups.length || yearGroups[yearGroups.length - 1].year !== yr) {
      yearGroups.push({ year: yr, months: 1 });
    } else {
      yearGroups[yearGroups.length - 1].months++;
    }
  });

  yearGroups.forEach(yg => {
    const w = Math.round(monthWidth(pxPerDay) * yg.months);
    yearHtml += `<div class="gantt-year-cell" style="width:${w}px">${yg.year}</div>`;
  });

  months.forEach(m => {
    const w         = Math.round(monthWidth(pxPerDay));
    const isToday   = m.getFullYear() === today.getFullYear() && m.getMonth() === today.getMonth();
    monthHtml += `
      <div class="gantt-month-cell${isToday ? ' today-month' : ''}" style="width:${w}px">
        ${MONTHS[m.getMonth()]}
      </div>`;
  });

  // ── Today line position ──
  const todayLeft = Math.round(dayOffset(today) * pxPerDay);

  // ── Alternating column backgrounds ──
  let colBgHtml = '';
  months.forEach((m, i) => {
    const left = Math.round(dayOffset(m) * pxPerDay);
    const w    = Math.round(monthWidth(pxPerDay));
    colBgHtml += `<div class="gantt-col-bg${i % 2 === 0 ? ' alt' : ''}" style="left:${left}px;width:${w}px"></div>`;
  });

  // ── Stream and task rows ──
  let rowsHtml = '';

  streams.forEach(stream => {
    const tasks     = [...APP.data.tasks]
      .filter(t => t.stream_id === stream.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const collapsed = _collapsed.has(stream.id);

    // Stream separator row — height must match .gantt-stream-header (72px)
    rowsHtml += `<div class="gantt-stream-row-right" style="position:relative;height:72px;width:${totalW}px">
      ${colBgHtml}
      <div class="today-line" style="left:${todayLeft}px"></div>
    </div>`;

    if (!collapsed) {
      tasks.forEach(task => {
        const left  = Math.round(dayOffset(new Date(task.start_date + 'T00:00:00')) * pxPerDay);
        const width = Math.max(6, Math.round(
          (new Date(task.end_date + 'T00:00:00') - new Date(task.start_date + 'T00:00:00')) / 86400000 * pxPerDay
        ));
        const pct   = task.percent_complete || 0;
        const isLong = width > totalW * 0.4; // mark very long bars

        const barLabel = width > 60 ? `${escapeHtml(task.name)}${pct > 0 ? ' · ' + pct + '%' : ''}` : '';

        rowsHtml += `
          <div class="gantt-task-row-right" style="width:${totalW}px" data-task-id="${task.id}">
            ${colBgHtml}
            <div class="today-line" style="left:${todayLeft}px"></div>
            <div class="gantt-bar ${task.status}"
              data-id="${task.id}"
              data-stream="${stream.id}"
              ${isLong ? 'data-long="true"' : ''}
              style="left:${left}px;width:${width}px"
              onmousedown="startBarDrag(event,${task.id})">
              <span class="gantt-bar-text">${barLabel}</span>
              <div class="resize-handle" onmousedown="event.stopPropagation();startBarResize(event,${task.id})"></div>
            </div>
          </div>`;
      });

      // Add-task placeholder row (edit mode)
      if (APP.editMode) {
        rowsHtml += `<div class="gantt-task-row-right" style="width:${totalW}px"></div>`;
      }
    }
  });

  right.innerHTML = `
    <div class="gantt-timeline" style="width:${totalW}px">
      <div class="gantt-timeline-header">
        <div class="gantt-year-row">${yearHtml}</div>
        <div class="gantt-month-row">${monthHtml}</div>
      </div>
      <div class="gantt-rows-area">
        ${rowsHtml}
      </div>
    </div>`;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getAllMonths(start, end) {
  const months = [];
  const cur    = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function monthWidth(pxPerDay) {
  return 30.44 * pxPerDay; // average days per month
}

function dayOffset(date) {
  return Math.max(0, (date - TIMELINE_START) / 86400000);
}

function leftToDayOffset(px) {
  return px / APP.zoom;
}

function dayOffsetToDate(offset) {
  const d = new Date(TIMELINE_START.getTime() + offset * 86400000);
  return d.toISOString().split('T')[0];
}

// ─── STREAM COLLAPSE ─────────────────────────────────────────────────────────
window.toggleStream = function(streamId) {
  if (_collapsed.has(streamId)) _collapsed.delete(streamId);
  else _collapsed.add(streamId);
  buildGantt();
  syncScrolls();
};

// ─── SCROLL SYNC ─────────────────────────────────────────────────────────────
function syncScrolls() {
  const left  = document.getElementById('gantt-left');
  const right = document.getElementById('gantt-right');
  if (!left || !right) return;

  // Right scroll → mirror left position
  right.removeEventListener('scroll', right._syncHandler);
  right._syncHandler = () => { left.scrollTop = right.scrollTop; };
  right.addEventListener('scroll', right._syncHandler);

  // Wheel on left panel → forward to right panel (fixes "can't scroll when hovering left")
  left.removeEventListener('wheel', left._wheelHandler);
  left._wheelHandler = (e) => {
    e.preventDefault();
    right.scrollTop  += e.deltaY;
    right.scrollLeft += e.deltaX;
  };
  left.addEventListener('wheel', left._wheelHandler, { passive: false });
}

// ─── FILTER & ZOOM ───────────────────────────────────────────────────────────
window.applyStreamFilter = function() { buildGantt(); syncScrolls(); };

window.setZoom = function(level) {
  APP.zoom = level === 'quarter' ? ZOOM_QUARTER : ZOOM_MONTH;
  document.querySelectorAll('.zoom-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.zoom === level)
  );
  buildGantt();
  syncScrolls();
};

// ─── DRAG (MOVE BAR) ─────────────────────────────────────────────────────────
// Bars are always draggable. If moved, auto-enter edit mode so changes can be saved.
// If no movement detected (< 4px), treat as a click and open the task popover.

window.startBarDrag = function(e, taskId) {
  if (e.target.classList.contains('resize-handle')) return;
  e.preventDefault();

  const task = APP.data.tasks.find(t => t.id === taskId);
  if (!task) return;

  _drag = {
    type:      'move',
    taskId,
    startX:    e.clientX,
    origStart: task.start_date,
    origEnd:   task.end_date,
    moved:     false
  };

  document.addEventListener('mousemove', _onDragMove);
  document.addEventListener('mouseup',   _onDragEnd);
};

window.startBarResize = function(e, taskId) {
  e.preventDefault();

  const task = APP.data.tasks.find(t => t.id === taskId);
  if (!task) return;

  _drag = {
    type:    'resize',
    taskId,
    startX:  e.clientX,
    origEnd: task.end_date,
    moved:   false
  };

  document.addEventListener('mousemove', _onDragMove);
  document.addEventListener('mouseup',   _onDragEnd);
};

function _onDragMove(e) {
  if (!_drag) return;
  const task = APP.data.tasks.find(t => t.id === _drag.taskId);
  if (!task) return;

  const deltaX = e.clientX - _drag.startX;
  if (Math.abs(deltaX) < 4) return; // threshold: below this treat as click
  _drag.moved = true;

  const deltaDays = Math.round(deltaX / APP.zoom);

  if (_drag.type === 'move') {
    const newStartOffset = dayOffset(new Date(_drag.origStart + 'T00:00:00')) + deltaDays;
    const newEndOffset   = dayOffset(new Date(_drag.origEnd   + 'T00:00:00')) + deltaDays;
    task.start_date = dayOffsetToDate(Math.max(0, newStartOffset));
    task.end_date   = dayOffsetToDate(Math.max(1, newEndOffset));
  } else {
    const newEndOffset = dayOffset(new Date(_drag.origEnd + 'T00:00:00')) + deltaDays;
    task.end_date = dayOffsetToDate(Math.max(
      dayOffset(new Date(task.start_date + 'T00:00:00')) + 1,
      newEndOffset
    ));
  }

  // Live-update bar position in DOM (no full re-render during drag)
  const bar = document.querySelector(`.gantt-bar[data-id="${_drag.taskId}"]`);
  if (bar) {
    const left  = Math.round(dayOffset(new Date(task.start_date + 'T00:00:00')) * APP.zoom);
    const width = Math.max(6, Math.round(
      (new Date(task.end_date + 'T00:00:00') - new Date(task.start_date + 'T00:00:00')) / 86400000 * APP.zoom
    ));
    bar.style.left  = left  + 'px';
    bar.style.width = width + 'px';
  }
}

function _onDragEnd(e) {
  if (!_drag) return;
  const { taskId, moved } = _drag;
  _drag = null;
  document.removeEventListener('mousemove', _onDragMove);
  document.removeEventListener('mouseup',   _onDragEnd);

  if (moved) {
    // Auto-enter edit mode so user can save the change
    markDirty();
    buildRoadmapHeader();
    updateRoadmapFooter();
  } else {
    // No movement — treat as click, open popover
    openTaskPopover(e, taskId);
  }
}

// ─── TASK POPOVER ────────────────────────────────────────────────────────────
window.openTaskPopover = function(e, taskId) {
  e.stopPropagation();
  const task = APP.data.tasks.find(t => t.id === taskId);
  if (!task) return;

  const popover = document.getElementById('task-popover');
  if (!popover) return;

  const STATUSES = ['complete','in_progress','planned','at_risk','on_hold','behind','blocked'];
  const statusOpts = STATUSES.map(s =>
    `<option value="${s}" ${task.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`
  ).join('');

  popover.innerHTML = `
    <h4>Edit Task</h4>
    <div class="popover-field">
      <label>Name</label>
      <input type="text" id="pop-name" value="${escapeHtml(task.name)}">
    </div>
    <div class="popover-field">
      <label>Start Date</label>
      <input type="date" id="pop-start" value="${task.start_date}">
    </div>
    <div class="popover-field">
      <label>End Date</label>
      <input type="date" id="pop-end" value="${task.end_date}">
    </div>
    <div class="popover-field">
      <label>Status</label>
      <select id="pop-status">${statusOpts}</select>
    </div>
    <div class="popover-field">
      <label>% Complete</label>
      <input type="number" id="pop-pct" min="0" max="100" value="${task.percent_complete || 0}">
    </div>
    <div class="popover-actions">
      <button class="popover-save-btn" onclick="savePopover(${taskId})">Save</button>
      <button class="popover-delete-btn" onclick="deleteTask(${taskId})">Delete</button>
      <button class="popover-close-btn" onclick="closePopover()">Cancel</button>
    </div>`;

  // Position near click
  const rect = e.currentTarget.getBoundingClientRect
    ? e.currentTarget.getBoundingClientRect()
    : { left: e.clientX, top: e.clientY, height: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = e.clientX + 8;
  let top  = e.clientY + 8;
  if (left + 280 > vw) left = vw - 288;
  if (top  + 340 > vh) top  = vh - 348;
  popover.style.left = left + 'px';
  popover.style.top  = top  + 'px';
  popover.classList.add('visible');

  // Close on outside click
  setTimeout(() => document.addEventListener('click', closePopoverOutside), 0);
};

function closePopoverOutside(e) {
  const popover = document.getElementById('task-popover');
  if (popover && !popover.contains(e.target)) {
    closePopover();
  }
}

window.closePopover = function() {
  const popover = document.getElementById('task-popover');
  if (popover) popover.classList.remove('visible');
  document.removeEventListener('click', closePopoverOutside);
};

window.savePopover = function(taskId) {
  const task = APP.data.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.name             = document.getElementById('pop-name').value.trim() || task.name;
  task.start_date       = document.getElementById('pop-start').value || task.start_date;
  task.end_date         = document.getElementById('pop-end').value   || task.end_date;
  task.status           = document.getElementById('pop-status').value;
  task.percent_complete = parseInt(document.getElementById('pop-pct').value) || 0;

  closePopover();
  buildGantt();
  syncScrolls();
  buildRoadmapHeader();
  updateRoadmapFooter();
};

window.deleteTask = function(taskId) {
  APP.data.tasks = APP.data.tasks.filter(t => t.id !== taskId);
  if (taskId > 0) APP.deletedIds.tasks.push(taskId);
  closePopover();
  buildGantt();
  syncScrolls();
  updateRoadmapFooter();
  buildRoadmapHeader();
};

// ─── ADD STREAM / TASK ────────────────────────────────────────────────────────
window.addStream = function() {
  const maxOrder = APP.data.streams.reduce((m, x) => Math.max(m, x.sort_order), 0);
  const newId    = -(Date.now());
  APP.data.streams.push({
    id: newId,
    name: 'New Stream',
    description: 'Stream description',
    sort_order: maxOrder + 1
  });
  buildGantt();
  syncScrolls();
  buildRoadmapHeader();
};

window.deleteStream = function(streamId) {
  APP.data.streams = APP.data.streams.filter(s => s.id !== streamId);
  APP.data.tasks   = APP.data.tasks.filter(t => t.stream_id !== streamId);
  if (streamId > 0) APP.deletedIds.streams.push(streamId);
  buildGantt();
  syncScrolls();
  buildRoadmapHeader();
  updateRoadmapFooter();
};

window.addTask = function(streamId) {
  const maxOrder = APP.data.tasks
    .filter(t => t.stream_id === streamId)
    .reduce((m, x) => Math.max(m, x.sort_order), 0);

  const newTask = {
    id: -(Date.now()),
    stream_id: streamId,
    name: 'New Task',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    percent_complete: 0,
    status: 'planned',
    is_milestone: false,
    sort_order: maxOrder + 1
  };
  APP.data.tasks.push(newTask);

  // Immediately open popover to edit it
  buildGantt();
  syncScrolls();
  buildRoadmapHeader();
  updateRoadmapFooter();
};

// ─── EXPORT HTML ─────────────────────────────────────────────────────────────
window.exportHTML = function() {
  const html = `<!DOCTYPE html><html><head><title>Roadmap Export</title></head>
<body>${document.getElementById('roadmap-view').outerHTML}</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'roadmap-export.html';
  a.click();
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function updateRoadmapFooter() {
  const tasks       = APP.data.tasks;
  const complete    = tasks.filter(t => t.status === 'complete').length;
  const inProgress  = tasks.filter(t => t.status === 'in_progress').length;
  const atRisk      = tasks.filter(t => t.status === 'at_risk').length;
  const overall     = calcOverallProgress();

  const totalEl    = document.getElementById('gantt-total');
  const compEl     = document.getElementById('gantt-complete');
  const inProgEl   = document.getElementById('gantt-inprog');
  const riskEl     = document.getElementById('gantt-atrisk');
  const fillEl     = document.getElementById('gantt-prog-fill');
  const labelEl    = document.getElementById('gantt-prog-label');

  if (totalEl)  totalEl.textContent  = tasks.length;
  if (compEl)   compEl.textContent   = complete;
  if (inProgEl) inProgEl.textContent = inProgress;
  if (riskEl)   riskEl.textContent   = atRisk;
  if (fillEl)   fillEl.style.width   = overall + '%';
  if (labelEl)  labelEl.textContent  = `Overall Program Progress — ${overall}%`;
}

// ─── SAVE ROADMAP ────────────────────────────────────────────────────────────
window.saveRoadmapData = async function() {
  // Streams
  const streams = APP.data.streams.map((s, i) => {
    const entry = { sort_order: i, updated_at: new Date().toISOString() };
    if (s.id > 0) entry.id = s.id;
    return { ...s, ...entry };
  });
  await DB.upsertAll('streams', streams);

  // Tasks
  const tasks = APP.data.tasks.map((t, i) => {
    const entry = { sort_order: i, updated_at: new Date().toISOString() };
    if (t.id > 0) entry.id = t.id;
    // Map negative stream ids — after upsert, we don't have new ids yet,
    // so only save tasks that belong to existing (positive id) streams.
    return { ...t, ...entry };
  }).filter(t => t.stream_id > 0);
  await DB.upsertAll('tasks', tasks);

  // Deletes
  for (const id of APP.deletedIds.tasks) {
    if (id > 0) await DB.deleteRow('tasks', id);
  }
  for (const id of APP.deletedIds.streams) {
    if (id > 0) await DB.deleteRow('streams', id);
  }
};
