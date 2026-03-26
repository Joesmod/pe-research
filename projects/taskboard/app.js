// ── Storage Layer (always server-backed) ──

async function loadCards() {
  const res = await fetch('/api/cards');
  return (await res.json()).cards;
}

async function persistCards(cards) {
  await fetch('/api/cards', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards })
  });
}

// ── State ──
let cards = [];
let nextId = 100;

// ── Render ──
function render() {
  document.querySelectorAll('.card-list').forEach(el => el.innerHTML = '');
  const counts = { backlog: 0, 'in-progress': 0, review: 0, done: 0 };

  cards.forEach(card => {
    counts[card.column] = (counts[card.column] || 0) + 1;
    const list = document.querySelector(`.card-list[data-column="${card.column}"]`);
    if (!list) return;

    const el = document.createElement('div');
    el.className = 'card';
    el.draggable = true;
    el.dataset.id = card.id;
    el.innerHTML = `
      <div class="card-top">
        <h3>${esc(card.title)}</h3>
        <button class="card-delete" onclick="event.stopPropagation(); deleteCard('${card.id}')" title="Delete">×</button>
      </div>
      ${card.description ? `<p class="card-desc">${esc(card.description)}</p>` : ''}
      <div class="card-meta">
        <span class="badge badge-${card.priority}">${card.priority}</span>
        ${card.assignee ? `<span class="card-assignee">${esc(card.assignee)}</span>` : ''}
      </div>
    `;
    el.addEventListener('click', () => openModal(card));
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragend', onDragEnd);
    list.appendChild(el);
  });

  // Update counts
  document.querySelectorAll('.column').forEach(col => {
    const key = col.dataset.column;
    col.querySelector('.card-count').textContent = counts[key] || 0;
  });
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ── Drag & Drop ──
let dragId = null;

function onDragStart(e) {
  dragId = e.target.dataset.id || e.target.closest('.card')?.dataset.id;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function onDragEnd(e) { e.target.classList.remove('dragging'); dragId = null; }

document.querySelectorAll('.card-list').forEach(list => {
  list.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; list.classList.add('drag-over'); });
  list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
  list.addEventListener('drop', e => {
    e.preventDefault();
    list.classList.remove('drag-over');
    if (!dragId) return;
    const card = cards.find(c => c.id === dragId);
    if (card) {
      card.column = list.dataset.column;
      persistCards(cards);
      render();
    }
  });
});

// ── Modal ──
function openModal(card) {
  document.getElementById('modal-title').textContent = card ? 'Edit Card' : 'New Card';
  document.getElementById('card-id').value = card ? card.id : '';
  document.getElementById('card-title').value = card ? card.title : '';
  document.getElementById('card-assignee').value = card ? card.assignee : '';
  document.getElementById('card-desc').value = card ? card.description : '';
  document.getElementById('card-priority').value = card ? card.priority : 'medium';
  document.getElementById('card-column').value = card ? card.column : 'backlog';
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('card-title').focus(), 50);
}

function closeModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('modal-overlay').classList.remove('open');
}

function saveCard(e) {
  e.preventDefault();
  const id = document.getElementById('card-id').value;
  const data = {
    title: document.getElementById('card-title').value.trim(),
    assignee: document.getElementById('card-assignee').value.trim(),
    description: document.getElementById('card-desc').value.trim(),
    priority: document.getElementById('card-priority').value,
    column: document.getElementById('card-column').value,
  };
  if (!data.title) return;

  if (id) {
    const card = cards.find(c => c.id === id);
    if (card) Object.assign(card, data);
  } else {
    data.id = String(nextId++);
    cards.push(data);
  }
  persistCards(cards);
  render();
  document.getElementById('modal-overlay').classList.remove('open');
}

function deleteCard(id) {
  if (!confirm('Delete this card?')) return;
  cards = cards.filter(c => c.id !== id);
  persistCards(cards);
  render();
}

// Keyboard shortcut
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('modal-overlay').classList.remove('open');
  if (e.key === 'n' && !e.target.closest('input, textarea, select') && !e.ctrlKey && !e.metaKey) openModal();
});

// ── Real-time Sync (poll every 5s) ──
function startSync() {
  setInterval(async () => {
    try {
      const freshCards = await loadCards();
      // Only re-render if data actually changed
      if (JSON.stringify(freshCards) !== JSON.stringify(cards)) {
        cards = freshCards;
        nextId = Math.max(100, ...cards.map(x => +x.id + 1));
        render();
      }
    } catch { /* silent fail on poll */ }
  }, 5000);
}

// ── Init ──
loadCards().then(c => {
  cards = c;
  nextId = Math.max(100, ...cards.map(x => +x.id + 1));
  render();
  startSync();
});
