/* =====================================================
   Focus Dashboard — app.js
   Vanilla JS | Local Storage | No frameworks
   ===================================================== */

'use strict';

/* ---- Storage helpers ---- */
const store = {
  get: (key, fallback) => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

/* ---- Toast ---- */
let toastTimer = null;
function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* =======================================================
   1. GREETING & DATETIME
   ======================================================= */
function getGreetingText(name) {
  const h = new Date().getHours();
  let salute;
  if (h < 5)  salute = 'Good night';
  else if (h < 12) salute = 'Good morning';
  else if (h < 17) salute = 'Good afternoon';
  else if (h < 21) salute = 'Good evening';
  else salute = 'Good night';
  const who = name ? `, <span>${escHtml(name)}</span>` : '';
  return `${salute}${who} 👋`;
}

function updateDatetime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('datetime').textContent = `${timeStr} · ${dateStr}`;
}

function refreshGreeting() {
  const name = store.get('userName', '');
  document.getElementById('greeting').innerHTML = getGreetingText(name);
}

/* =======================================================
   2. THEME
   ======================================================= */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  store.set('theme', theme);
}

function initTheme() {
  const saved = store.get('theme', null);
  if (saved) { applyTheme(saved); return; }
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(preferred);
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* =======================================================
   3. FOCUS TIMER
   ======================================================= */
const timerState = {
  totalSeconds: 0,
  remaining: 0,
  running: false,
  interval: null
};

function getPomodoroDuration() {
  return (store.get('pomodoroDuration', 25) * 60);
}

function initTimer() {
  timerState.totalSeconds = getPomodoroDuration();
  timerState.remaining = timerState.totalSeconds;
  renderTimer();
}

function renderTimer() {
  const m = Math.floor(timerState.remaining / 60).toString().padStart(2, '0');
  const s = (timerState.remaining % 60).toString().padStart(2, '0');
  const display = document.getElementById('timer-display');
  display.textContent = `${m}:${s}`;

  const ratio = timerState.totalSeconds > 0
    ? timerState.remaining / timerState.totalSeconds
    : 1;
  document.getElementById('progress-fill').style.width = `${ratio * 100}%`;

  if (timerState.running) {
    display.className = 'timer-display running';
    document.getElementById('timer-label').textContent = 'Stay focused…';
  } else if (timerState.remaining === 0) {
    display.className = 'timer-display done';
    document.getElementById('progress-fill').style.background = 'var(--success)';
  } else {
    display.className = 'timer-display';
    document.getElementById('timer-label').textContent =
      timerState.remaining === timerState.totalSeconds ? 'Ready to focus' : 'Paused';
  }
}

function startTimer() {
  if (timerState.running) return;
  if (timerState.remaining === 0) return;
  timerState.running = true;
  timerState.interval = setInterval(() => {
    timerState.remaining -= 1;
    renderTimer();
    if (timerState.remaining <= 0) {
      clearInterval(timerState.interval);
      timerState.running = false;
      document.getElementById('timer-label').textContent = '🎉 Session complete!';
      showToast('Focus session complete! Take a break.');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus session done!', { body: 'Time for a break 🎉' });
      }
    }
  }, 1000);
  renderTimer();
}

function stopTimer() {
  clearInterval(timerState.interval);
  timerState.running = false;
  renderTimer();
}

function resetTimer() {
  clearInterval(timerState.interval);
  timerState.running = false;
  timerState.totalSeconds = getPomodoroDuration();
  timerState.remaining = timerState.totalSeconds;
  document.getElementById('progress-fill').style.background = '';
  document.getElementById('timer-label').textContent = 'Ready to focus';
  renderTimer();
}

document.getElementById('timer-start').addEventListener('click', startTimer);
document.getElementById('timer-stop').addEventListener('click', stopTimer);
document.getElementById('timer-reset').addEventListener('click', resetTimer);

/* =======================================================
   4. TO-DO LIST
   ======================================================= */
let tasks = [];

function loadTasks()  { tasks = store.get('tasks', []); }
function saveTasks()  { store.set('tasks', tasks); }

function normalizeText(str) {
  return str.trim().replace(/\s+/g, ' ');
}

function isDuplicate(text) {
  const norm = text.toLowerCase();
  return tasks.some(t => t.text.toLowerCase() === norm);
}

function addTask(text) {
  text = normalizeText(text);
  if (!text) { showToast('Task cannot be empty.'); return false; }
  if (isDuplicate(text)) { showToast('Task already exists.'); return false; }
  tasks.push({ id: Date.now(), text, done: false, createdAt: Date.now() });
  saveTasks();
  return true;
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.done = !task.done; saveTasks(); }
}

function editTask(id, newText) {
  newText = normalizeText(newText);
  if (!newText) { showToast('Task cannot be empty.'); return false; }
  const others = tasks.filter(t => t.id !== id);
  if (others.some(t => t.text.toLowerCase() === newText.toLowerCase())) {
    showToast('A task with this name already exists.'); return false;
  }
  const task = tasks.find(t => t.id === id);
  if (task) { task.text = newText; saveTasks(); }
  return true;
}

function getSortedTasks() {
  const sort = document.getElementById('todo-sort').value;
  const copy = [...tasks];
  switch (sort) {
    case 'newest':  return copy.sort((a, b) => b.createdAt - a.createdAt);
    case 'oldest':  return copy.sort((a, b) => a.createdAt - b.createdAt);
    case 'az':      return copy.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':      return copy.sort((a, b) => b.text.localeCompare(a.text));
    case 'active':  return copy.sort((a, b) => Number(a.done) - Number(b.done));
    case 'done':    return copy.sort((a, b) => Number(b.done) - Number(a.done));
    default:        return copy;
  }
}

function renderTasks() {
  const list = document.getElementById('todo-list');
  const sorted = getSortedTasks();

  document.getElementById('todo-count').textContent =
    `${tasks.filter(t => !t.done).length} / ${tasks.length} remaining`;

  if (sorted.length === 0) {
    list.innerHTML = '<li class="todo-empty">No tasks yet. Add one above!</li>';
    return;
  }

  list.innerHTML = '';
  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${task.done ? 'checked' : ''}
             aria-label="Mark done" />
      <span class="todo-text">${escHtml(task.text)}</span>
      <div class="todo-item-actions">
        <button class="todo-item-btn edit" title="Edit">✏️</button>
        <button class="todo-item-btn delete" title="Delete">🗑️</button>
      </div>`;

    li.querySelector('.todo-checkbox').addEventListener('change', () => {
      toggleTask(task.id);
      renderTasks();
    });
    li.querySelector('.btn.edit, .todo-item-btn.edit').addEventListener('click', () => openEditModal(task.id));
    li.querySelector('.todo-item-btn.delete').addEventListener('click', () => {
      deleteTask(task.id);
      renderTasks();
      showToast('Task deleted.');
    });

    list.appendChild(li);
  });
}

document.getElementById('todo-add').addEventListener('click', () => {
  const input = document.getElementById('todo-input');
  if (addTask(input.value)) {
    input.value = '';
    renderTasks();
  }
});

document.getElementById('todo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('todo-add').click();
});

document.getElementById('todo-sort').addEventListener('change', renderTasks);

/* -- Edit task modal -- */
let editingTaskId = null;

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  document.getElementById('edit-task-input').value = task.text;
  document.getElementById('edit-modal-overlay').hidden = false;
  document.getElementById('edit-task-input').focus();
}

function closeEditModal() {
  document.getElementById('edit-modal-overlay').hidden = true;
  editingTaskId = null;
}

document.getElementById('edit-task-save').addEventListener('click', () => {
  const val = document.getElementById('edit-task-input').value;
  if (editTask(editingTaskId, val)) {
    closeEditModal();
    renderTasks();
    showToast('Task updated.');
  }
});

document.getElementById('edit-task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('edit-task-save').click();
  if (e.key === 'Escape') closeEditModal();
});

document.getElementById('edit-task-cancel').addEventListener('click', closeEditModal);
document.getElementById('edit-modal-close').addEventListener('click', closeEditModal);
document.getElementById('edit-modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('edit-modal-overlay')) closeEditModal();
});

/* =======================================================
   5. QUICK LINKS
   ======================================================= */
let links = [];

function loadLinks()  { links = store.get('quickLinks', []); }
function saveLinks()  { store.set('quickLinks', links); }

function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(origin)}`;
  } catch { return ''; }
}

function addLink(name, url) {
  name = name.trim();
  url  = url.trim();
  if (!name) { showToast('Please enter a label for the link.'); return false; }
  if (!url)  { showToast('Please enter a URL.'); return false; }
  try { new URL(url); } catch { showToast('Please enter a valid URL (include https://).'); return false; }
  if (links.some(l => l.url === url)) { showToast('This link already exists.'); return false; }
  links.push({ id: Date.now(), name, url });
  saveLinks();
  return true;
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
}

function renderLinks() {
  const grid = document.getElementById('links-grid');

  if (links.length === 0) {
    grid.innerHTML = '<p class="links-empty">No links yet. Add your favourites above!</p>';
    return;
  }

  grid.innerHTML = '';
  links.forEach(link => {
    const a = document.createElement('a');
    a.className = 'link-item';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = link.url;

    const favicon = getFavicon(link.url);
    a.innerHTML = `
      ${favicon ? `<img class="link-favicon" src="${escHtml(favicon)}" alt="" onerror="this.style.display='none'" />` : ''}
      <span class="link-label">${escHtml(link.name)}</span>
      <button class="link-delete" title="Remove link" data-id="${link.id}">✕</button>`;

    a.querySelector('.link-delete').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      deleteLink(link.id);
      renderLinks();
      showToast('Link removed.');
    });

    grid.appendChild(a);
  });
}

document.getElementById('link-add').addEventListener('click', () => {
  const nameEl = document.getElementById('link-name');
  const urlEl  = document.getElementById('link-url');
  if (addLink(nameEl.value, urlEl.value)) {
    nameEl.value = '';
    urlEl.value  = '';
    renderLinks();
  }
});

document.getElementById('link-url').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('link-add').click();
});

/* =======================================================
   6. SETTINGS MODAL
   ======================================================= */
function openSettings() {
  document.getElementById('setting-name').value = store.get('userName', '');
  document.getElementById('setting-pomodoro').value = store.get('pomodoroDuration', 25);
  document.getElementById('modal-overlay').hidden = false;
  document.getElementById('setting-name').focus();
}

function closeSettings() {
  document.getElementById('modal-overlay').hidden = true;
}

document.getElementById('settings-btn').addEventListener('click', openSettings);
document.getElementById('modal-close').addEventListener('click', closeSettings);
document.getElementById('setting-cancel').addEventListener('click', closeSettings);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeSettings();
});

document.getElementById('setting-save').addEventListener('click', () => {
  const name     = document.getElementById('setting-name').value.trim();
  const duration = parseInt(document.getElementById('setting-pomodoro').value, 10);

  if (isNaN(duration) || duration < 1 || duration > 120) {
    showToast('Duration must be between 1 and 120 minutes.');
    return;
  }

  store.set('userName', name);
  store.set('pomodoroDuration', duration);
  refreshGreeting();

  // Reset timer only if duration changed and timer is not running
  if (duration * 60 !== timerState.totalSeconds && !timerState.running) {
    resetTimer();
  }

  closeSettings();
  showToast('Settings saved.');
});

/* =======================================================
   7. UTILITY
   ======================================================= */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =======================================================
   8. INIT
   ======================================================= */
function init() {
  initTheme();
  refreshGreeting();
  updateDatetime();
  setInterval(updateDatetime, 1000);
  setInterval(refreshGreeting, 60_000); // re-check greeting every minute

  loadTasks();
  renderTasks();

  loadLinks();
  renderLinks();

  initTimer();

  // Request notification permission silently
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

init();
