// ============================================================
// KASICA — app.js  (kompletno prepisano, sve greške popravljene)
// ============================================================

// ===== KONSTANTE =====
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', RSD: 'din', JPY: '¥' };

const ICON_LIST = [
  '🛒','🍽️','🏠','🏛️','❤️','❓','🚌','👨‍👩‍👧','🎁','✈️',
  '🐾','⚡','🚗','💄','💪','💵','💻','📈','🏥','🎓',
  '🎮','📱','🎵','🌍','⚽','🎨','🛍️','☕','🍕','🐶'
];

const COLORS = [
  '#e74c3c','#27ae60','#4a90d9','#f5a623',
  '#e91e63','#8bc34a','#00bcd4','#9b59b6',
  '#ff5722','#607d8b'
];

const DEFAULT_CATS = [
  { id: 1,  name: 'Namirnice',   icon: '🛒', color: '#4a90d9', type: 'expense' },
  { id: 2,  name: 'Kupovina',    icon: '🛍️', color: '#9b59b6', type: 'expense' },
  { id: 3,  name: 'Restorani',   icon: '🍽️', color: '#f5a623', type: 'expense' },
  { id: 4,  name: 'Dom',         icon: '🏠', color: '#e74c3c', type: 'expense' },
  { id: 5,  name: 'Krediti',     icon: '🏛️', color: '#27ae60', type: 'expense' },
  { id: 6,  name: 'Zdravlje',    icon: '❤️', color: '#e91e63', type: 'expense' },
  { id: 7,  name: 'Prevoz',      icon: '🚌', color: '#00bcd4', type: 'expense' },
  { id: 8,  name: 'Ostalo',      icon: '❓', color: '#95a5a6', type: 'expense' },
  { id: 9,  name: 'Plata',       icon: '💵', color: '#27ae60', type: 'income'  },
  { id: 10, name: 'Freelance',   icon: '💻', color: '#3498db', type: 'income'  },
  { id: 11, name: 'Poklon',      icon: '🎁', color: '#e91e63', type: 'income'  },
  { id: 12, name: 'Investicije', icon: '📈', color: '#f5a623', type: 'income'  },
];

const SAMPLE_TX = [
  { id: 1, catId: 1, amount: 12,   currency: 'USD', note: '',                 date: '2024-07-22', type: 'expense' },
  { id: 2, catId: 7, amount: 8,    currency: 'USD', note: '',                 date: '2024-07-22', type: 'expense' },
  { id: 3, catId: 3, amount: 2500, currency: 'JPY', note: '',                 date: '2024-07-23', type: 'expense' },
  { id: 4, catId: 1, amount: 20,   currency: 'EUR', note: 'povrce sa pijace', date: '2024-07-25', type: 'expense' },
  { id: 5, catId: 2, amount: 180,  currency: 'USD', note: '',                 date: '2024-07-25', type: 'expense' },
  { id: 6, catId: 7, amount: 10,   currency: 'GBP', note: '',                 date: '2024-07-26', type: 'expense' },
  { id: 7, catId: 5, amount: 980,  currency: 'USD', note: '',                 date: '2024-07-25', type: 'expense' },
  { id: 8, catId: 9, amount: 3500, currency: 'USD', note: '',                 date: '2024-07-01', type: 'income'  },
];

// ===== STATE =====
const STATE = {
  currentScreen: 'home',
  prevScreen:    'home',
  mainTab:       'expense',
  txTab:         'expense',
  opsTab:        'expense',
  period:        'day',
  periodOffset:  0,
  selectedCatId: null,
  selectedIcon:  '🛒',
  selectedColor: '#4a90d9',
  baseCurrency:  'EUR',
};

// Fiksna mapa — svaki ekran zna gde ide "nazad"
const BACK_MAP = {
  'add-transaction': 'home',
  'operations':      'home',
  'categories':      'home',
  'new-category':    'categories',
  'charts':          'home',
  'accounts':        'home',
  'new-account':     'accounts',
  'regular':         'home',
  'new-regular':     'regular',
  'reminders':       'home',
  'new-reminder':    'reminders',
  'settings':        'home',
};

// ===== LOCALSTORAGE HELPERS =====
function lsGet(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
}

// ===== UCITAVANJE I CUVANJE =====
function loadDB() {
  // kategorije
  let categories = DEFAULT_CATS;
  const rawCats = lsGet('k_cats');
  if (rawCats) {
    try {
      const p = JSON.parse(rawCats);
      if (Array.isArray(p) && p.length > 0) categories = p;
    } catch(e) {}
  }

  // transakcije
  let transactions = SAMPLE_TX;
  const rawTx = lsGet('k_tx');
  if (rawTx) {
    try {
      const p = JSON.parse(rawTx);
      if (Array.isArray(p)) transactions = p;
    } catch(e) {}
  }

  // balans
  let balance = 2845;
  const rawBal = lsGet('k_balance');
  if (rawBal !== null && rawBal !== '') {
    const p = parseFloat(rawBal);
    if (!isNaN(p)) balance = p;
  }

  // valuta — ucitava se u STATE
  const savedCur = lsGet('k_currency');
  if (savedCur && CURRENCY_SYMBOLS[savedCur]) STATE.baseCurrency = savedCur;
  else STATE.baseCurrency = 'EUR';

  // tema
  const savedTheme = lsGet('k_theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');

  return { categories, transactions, balance };
}

function saveDB() {
  lsSet('k_cats',    JSON.stringify(DB.categories));
  lsSet('k_tx',      JSON.stringify(DB.transactions));
  lsSet('k_balance', String(DB.balance));
}

let DB = loadDB();

// ===== BOOT =====
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('app').style.opacity = '1';
    navigate('home');
  }, 2000);
});

// ===== NAVIGACIJA =====
function navigate(screen) {
  STATE.prevScreen = STATE.currentScreen;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + screen);
  if (!el) return;
  el.classList.add('active');
  STATE.currentScreen = screen;

  if (screen === 'home')            initHome();
  if (screen === 'add-transaction') initAddTx();
  if (screen === 'operations')      initOperations();
  if (screen === 'categories')      initCategoryScreen();
  if (screen === 'new-category')    initNewCatScreen();
  if (screen === 'charts')          initCharts();
  if (screen === 'accounts')        initAccounts();
  if (screen === 'new-account')     { selectedAccIcon = '💵'; }
  if (screen === 'regular')         initRegular();
  if (screen === 'new-regular')     initNewRegular();
  if (screen === 'reminders')       initReminders();
  if (screen === 'new-reminder')    initNewReminder();
  if (screen === 'settings')        initSettings();
}

function goBack() {
  const dest = BACK_MAP[STATE.currentScreen] || 'home';
  navigate(dest);
}

// ===== SIDEBAR =====
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.remove('hidden');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.add('hidden');
}

// ===== FORMAT NOVCA =====
function fmt(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency || '$';
  return Math.round(amount).toLocaleString('sr-RS') + ' ' + sym;
}

// ===== HOME =====
function initHome() {
  DB = loadDB();
  document.getElementById('balance-display').textContent = fmt(DB.balance, STATE.baseCurrency);
  updatePeriodLabel();
  renderHomeList();
  drawDonut();
}

function switchTab(tab, btn) {
  STATE.mainTab = tab;
  document.querySelectorAll('#screen-home .tabs .tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHomeList();
  drawDonut();
}

function switchPeriod(p, btn) {
  STATE.period = p;
  STATE.periodOffset = 0;
  document.querySelectorAll('#screen-home .period-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updatePeriodLabel();
  renderHomeList();
  drawDonut();
}

function prevPeriod() {
  STATE.periodOffset--;
  updatePeriodLabel(); renderHomeList(); drawDonut();
}
function nextPeriod() {
  if (STATE.periodOffset < 0) {
    STATE.periodOffset++;
    updatePeriodLabel(); renderHomeList(); drawDonut();
  }
}

function updatePeriodLabel() {
  const now = new Date();
  const off = STATE.periodOffset;
  const fmtD = d => d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long' });
  let label = '';

  if (STATE.period === 'day') {
    const d = new Date(now); d.setDate(d.getDate() + off);
    label = off === 0 ? 'Danas, ' + fmtD(d) : fmtD(d);
  } else if (STATE.period === 'week') {
    const s = new Date(now);
    s.setDate(s.getDate() - ((s.getDay() + 6) % 7) + off * 7);
    const e = new Date(s); e.setDate(e.getDate() + 6);
    label = fmtD(s) + ' - ' + fmtD(e);
  } else if (STATE.period === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() + off, 1);
    label = d.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' });
  } else if (STATE.period === 'year') {
    label = String(now.getFullYear() + off);
  } else {
    label = 'Svi periodi';
  }

  document.getElementById('period-label').textContent = label;
  document.getElementById('next-period-btn').disabled = off >= 0;
}

function getPeriodTx(tab) {
  const now = new Date();
  const off = STATE.periodOffset;
  return DB.transactions.filter(t => {
    if (t.type !== tab) return false;
    if (STATE.period === 'period') return true;
    const d = new Date(t.date + 'T12:00:00');
    if (STATE.period === 'day') {
      const target = new Date(now); target.setDate(target.getDate() + off);
      return d.toDateString() === target.toDateString();
    }
    if (STATE.period === 'week') {
      const s = new Date(now);
      s.setDate(s.getDate() - ((s.getDay() + 6) % 7) + off * 7);
      s.setHours(0,0,0,0);
      const e = new Date(s); e.setDate(e.getDate() + 6); e.setHours(23,59,59,999);
      return d >= s && d <= e;
    }
    if (STATE.period === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() + off;
    }
    if (STATE.period === 'year') {
      return d.getFullYear() === now.getFullYear() + off;
    }
    return true;
  });
}

function renderHomeList() {
  const el     = document.getElementById('categories-list');
  const txList = getPeriodTx(STATE.mainTab);
  const cats   = DB.categories.filter(c => c.type === STATE.mainTab);
  const total  = txList.reduce((a, t) => a + t.amount, 0) || 1;

  let html = '';
  cats.forEach(cat => {
    const sum = txList.filter(t => t.catId === cat.id).reduce((a, t) => a + t.amount, 0);
    if (!sum) return;
    const pct = Math.round(sum / total * 100);
    html += `
      <div class="cat-item" onclick="navigate('operations')">
        <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color}">
          <span style="font-size:20px">${cat.icon}</span>
        </div>
        <span class="cat-name">${cat.name}</span>
        <span class="cat-pct">${pct}%</span>
        <span class="cat-amount">${fmt(sum, STATE.baseCurrency)}</span>
      </div>`;
  });

  el.innerHTML = html ||
    '<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:14px">Nema transakcija za ovaj period</div>';
}

function drawDonut() {
  const canvas = document.getElementById('donut-chart');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const cx   = 110, cy = 110, r = 90, inner = 60;
  ctx.clearRect(0, 0, 220, 220);

  const txList = getPeriodTx(STATE.mainTab);
  const cats   = DB.categories.filter(c => c.type === STATE.mainTab);
  const data   = cats.map(cat => ({
    val:   txList.filter(t => t.catId === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.val > 0);

  const total = data.reduce((a, d) => a + d.val, 0);

  if (!total) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#e0e8e2'; ctx.lineWidth = 30; ctx.stroke();
    document.getElementById('donut-total').textContent = fmt(0, STATE.baseCurrency);
    return;
  }

  let angle = -Math.PI / 2;
  const gap = data.length > 1 ? 0.04 : 0;
  data.forEach(d => {
    const slice = (d.val / total) * (Math.PI * 2 - gap * data.length);
    ctx.beginPath();
    ctx.arc(cx, cy, r,     angle + gap / 2, angle + slice + gap / 2);
    ctx.arc(cx, cy, inner, angle + slice + gap / 2, angle + gap / 2, true);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    angle += slice + gap;
  });

  document.getElementById('donut-total').textContent = fmt(total, STATE.baseCurrency);
}

function editBalance() {
  const val = prompt('Novi balans:', DB.balance);
  if (val === null) return;
  const num = parseFloat(val);
  if (!isNaN(num)) { DB.balance = num; saveDB(); initHome(); }
}

// ===== DODAJ TRANSAKCIJU =====
function initAddTx() {
  DB = loadDB();
  STATE.selectedCatId = null;
  STATE.txTab = 'expense';

  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-converted').textContent = '0.00';
  document.getElementById('tx-comment').value = '';
  document.getElementById('tx-currency').textContent = STATE.baseCurrency;

  // resetuj tabove na Troškovi
  document.querySelectorAll('#screen-add-transaction .tabs .tab').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  setTxDate(new Date());
  renderTxCatGrid();
}

function switchTxTab(tab, btn) {
  STATE.txTab = tab;
  STATE.selectedCatId = null;
  document.querySelectorAll('#screen-add-transaction .tabs .tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTxCatGrid();
}

function renderTxCatGrid() {
  const el = document.getElementById('tx-cat-grid');
  if (!el) return;

  // GLAVNI FIX: STATE.txTab je 'expense' ili 'income'
  // cat.type je takodje 'expense' ili 'income' — sada se poklapa!
  const cats = DB.categories.filter(c => c.type === STATE.txTab);

  let html = cats.map(cat => {
    const sel = STATE.selectedCatId === cat.id;
    return `
      <div class="cat-grid-item ${sel ? 'selected' : ''}" onclick="selectTxCat(${cat.id})">
        <div class="cgi-circle" style="background:${sel ? cat.color : '#c5d4cc'}">
          <span style="font-size:22px">${cat.icon}</span>
        </div>
        <span style="font-size:11px;font-weight:600;color:${sel ? cat.color : 'var(--text-muted)'};text-align:center;line-height:1.2">${cat.name}</span>
      </div>`;
  }).join('');

  html += `
    <div class="cat-grid-item" onclick="navigate('new-category')">
      <div class="cgi-circle" style="background:#c5d4cc">
        <span style="font-size:22px">➕</span>
      </div>
      <span style="font-size:11px;font-weight:600;color:var(--text-muted)">Nova</span>
    </div>`;

  el.innerHTML = html;
}

function selectTxCat(id) {
  STATE.selectedCatId = id;
  renderTxCatGrid();
}

function setTxDate(d) {
  const el = document.getElementById('tx-date-display');
  if (!el) return;
  el.textContent = d.toLocaleDateString('sr-RS', { year: 'numeric', month: 'long', day: 'numeric' });
  el.dataset.date = d.toISOString().split('T')[0];
}

function pickDate() {
  const hidden = document.createElement('input');
  hidden.type = 'date';
  hidden.value = document.getElementById('tx-date-display').dataset.date || '';
  hidden.style.cssText = 'position:fixed;opacity:0;pointer-events:none;top:0;left:0';
  document.body.appendChild(hidden);
  hidden.addEventListener('change', () => {
    if (hidden.value) setTxDate(new Date(hidden.value + 'T12:00:00'));
    if (document.body.contains(hidden)) document.body.removeChild(hidden);
  });
  hidden.focus(); hidden.click();
  setTimeout(() => { if (document.body.contains(hidden)) document.body.removeChild(hidden); }, 10000);
}

function convertAmount() {
  const val   = parseFloat(document.getElementById('tx-amount').value) || 0;
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79, RSD: 108, JPY: 149 };
  const from  = STATE.baseCurrency;
  const to    = from === 'USD' ? 'EUR' : 'USD';
  const conv  = (val / (rates[from] || 1)) * (rates[to] || 1);
  document.getElementById('tx-converted').textContent          = conv.toFixed(2);
  document.getElementById('tx-currency').textContent           = from;
  document.getElementById('tx-converted-currency').textContent = CURRENCY_SYMBOLS[to] || to;
}

function addTransaction() {
  const amount = parseFloat(document.getElementById('tx-amount').value);
  if (!amount || amount <= 0) { alert('Unesite iznos!');        return; }
  if (!STATE.selectedCatId)   { alert('Izaberite kategoriju!'); return; }

  const note = document.getElementById('tx-comment').value.trim();
  const date = document.getElementById('tx-date-display').dataset.date
             || new Date().toISOString().split('T')[0];

  DB.transactions.push({
    id:       Date.now(),
    catId:    STATE.selectedCatId,
    amount,
    currency: STATE.baseCurrency,
    note,
    date,
    type: STATE.txTab,
  });

  DB.balance += STATE.txTab === 'income' ? amount : -amount;
  saveDB();
  navigate('home');
}

// ===== OPERACIJE =====
function initOperations() {
  DB = loadDB();
  STATE.opsTab = 'expense';
  document.querySelectorAll('#screen-operations .tabs .tab').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  document.getElementById('ops-period-label').textContent = 'Sve transakcije';
  renderOpsList();
}

function switchOpsTab(tab, btn) {
  STATE.opsTab = tab;
  document.querySelectorAll('#screen-operations .tabs .tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOpsList();
}

function renderOpsList() {
  const el     = document.getElementById('ops-list');
  const txList = DB.transactions
    .filter(t => t.type === STATE.opsTab)
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = txList.reduce((a, t) => a + t.amount, 0);
  document.getElementById('ops-total').textContent = 'Ukupno: ' + fmt(total, STATE.baseCurrency);

  if (!txList.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:14px">Nema transakcija</div>';
    return;
  }

  const byDate = {};
  txList.forEach(t => { (byDate[t.date] = byDate[t.date] || []).push(t); });

  let html = '';
  Object.keys(byDate).sort((a, b) => b.localeCompare(a)).forEach(date => {
    const d = new Date(date + 'T12:00:00');
    html += `<div class="ops-date-group">${d.toLocaleDateString('sr-RS', { day:'numeric', month:'long', year:'numeric' })}</div>`;
    byDate[date].forEach(tx => {
      const cat = DB.categories.find(c => c.id === tx.catId) || { name:'Ostalo', icon:'❓', color:'#95a5a6' };
      const sym = CURRENCY_SYMBOLS[tx.currency] || tx.currency || '$';
      html += `
        <div class="ops-tx-item" onclick="deleteTx(${tx.id})">
          <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color};width:40px;height:40px">
            <span style="font-size:18px">${cat.icon}</span>
          </div>
          <div class="ops-tx-info">
            <div class="ops-tx-name">${cat.name}</div>
            ${tx.note ? `<div class="ops-tx-note">${tx.note}</div>` : ''}
          </div>
          <div class="ops-tx-amount ${tx.type === 'income' ? 'income' : ''}">${tx.amount} ${sym}</div>
        </div>`;
    });
  });
  el.innerHTML = html;
}

function deleteTx(id) {
  if (!confirm('Obrisati ovu transakciju?')) return;
  const tx = DB.transactions.find(t => t.id === id);
  if (!tx) return;
  DB.balance += tx.type === 'income' ? -tx.amount : tx.amount;
  DB.transactions = DB.transactions.filter(t => t.id !== id);
  saveDB();
  renderOpsList();
}

// ===== KATEGORIJE =====
function initCategoryScreen() {
  DB = loadDB();
  const el      = document.getElementById('cat-list-screen');
  const expCats = DB.categories.filter(c => c.type === 'expense');
  const incCats = DB.categories.filter(c => c.type === 'income');

  const renderCat = cat => `
    <div class="cat-item">
      <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color}">
        <span style="font-size:20px">${cat.icon}</span>
      </div>
      <span class="cat-name">${cat.name}</span>
      <button style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:22px;padding:4px 8px"
              onclick="deleteCat(${cat.id})">×</button>
    </div>`;

  el.innerHTML =
    `<div class="cat-type-header">TROSKOVI</div>` + expCats.map(renderCat).join('') +
    `<div class="cat-type-header">PRIHODI</div>`  + incCats.map(renderCat).join('');
}

function deleteCat(id) {
  if (!confirm('Obrisati kategoriju?')) return;
  DB.categories = DB.categories.filter(c => c.id !== id);
  saveDB();
  initCategoryScreen();
}

// ===== NOVA KATEGORIJA =====
function initNewCatScreen() {
  STATE.selectedIcon  = '🛒';
  STATE.selectedColor = '#4a90d9';
  const nameEl = document.getElementById('new-cat-name');
  if (nameEl) nameEl.value = '';
  const radio = document.querySelector('input[name="cat-type"][value="expense"]');
  if (radio) radio.checked = true;
  updateNewCatPreview();
  renderIconGrid();
  renderColorRow();
}

function updateNewCatPreview() {
  const prev = document.getElementById('new-cat-preview');
  const icon = document.getElementById('new-cat-icon-preview');
  if (prev) prev.style.background = STATE.selectedColor;
  if (icon) icon.textContent      = STATE.selectedIcon;
}

function renderIconGrid() {
  const el = document.getElementById('icon-grid');
  if (!el) return;
  el.innerHTML = ICON_LIST.map(ic => `
    <div class="icon-cell ${STATE.selectedIcon === ic ? 'selected' : ''}"
         onclick="selectIcon('${ic}')">${ic}</div>
  `).join('');
}

function renderColorRow() {
  const el = document.getElementById('color-row');
  if (!el) return;
  let html = `<div class="color-add" onclick="addCustomColor()">+</div>`;
  html += COLORS.map(c => `
    <div class="color-dot ${STATE.selectedColor === c ? 'selected' : ''}"
         style="background:${c}" onclick="selectColor('${c}')">${STATE.selectedColor === c ? '&#10003;' : ''}</div>
  `).join('');
  el.innerHTML = html;
}

function selectIcon(ic) {
  STATE.selectedIcon = ic;
  updateNewCatPreview();
  renderIconGrid();
}

function selectColor(c) {
  STATE.selectedColor = c;
  updateNewCatPreview();
  renderColorRow();
}

function addCustomColor() {
  const c = prompt('Hex boja (npr. #ff5733):');
  if (c && /^#[0-9a-fA-F]{6}$/.test(c)) { COLORS.push(c); selectColor(c); }
}

function saveCategory() {
  const nameEl = document.getElementById('new-cat-name');
  const name   = nameEl ? nameEl.value.trim() : '';
  if (!name) { alert('Unesite naziv!'); return; }
  const radio = document.querySelector('input[name="cat-type"]:checked');
  const type  = radio ? radio.value : 'expense'; // 'expense' ili 'income'
  DB.categories.push({ id: Date.now(), name, icon: STATE.selectedIcon, color: STATE.selectedColor, type });
  saveDB();
  navigate('categories');
}

// ===== RACUNI =====
function initAccounts() {
  let accounts = [];
  const raw = lsGet('k_accounts');
  if (raw) { try { accounts = JSON.parse(raw) || []; } catch(e) {} }
  if (!accounts.length) {
    accounts = [
      { id: 1, name: 'Gotovina', balance: 2845, currency: 'USD', icon: '💵' },
      { id: 2, name: 'Banka',    balance: 5200, currency: 'RSD', icon: '🏦' },
    ];
  }
  const el = document.getElementById('accounts-content');
  if (!el) return;
  el.innerHTML = accounts.map(a => `
    <div class="account-card">
      <div>
        <div style="font-size:28px;margin-bottom:4px">${a.icon}</div>
        <div class="account-name">${a.name}</div>
      </div>
      <div class="account-balance">${fmt(a.balance, a.currency)}</div>
    </div>`).join('');
}

function addAccount() {
  const name = prompt('Naziv racuna:');
  if (!name) return;
  const balance = parseFloat(prompt('Pocetni balans:', '0') || '0') || 0;
  const raw = lsGet('k_accounts');
  const accounts = raw ? (JSON.parse(raw) || []) : [];
  accounts.push({ id: Date.now(), name, balance, currency: STATE.baseCurrency, icon: '💰' });
  lsSet('k_accounts', JSON.stringify(accounts));
  initAccounts();
}

// ===== GRAFIKONI =====
function initCharts() {
  DB = loadDB();
  setTimeout(() => { drawBarChart(); drawPieChart(); }, 80);
}

function drawBarChart() {
  const canvas = document.getElementById('bar-chart');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const months = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'];
  const curM   = new Date().getMonth();

  const data = months.map((_, i) =>
    DB.transactions
      .filter(t => t.type === 'expense' && new Date(t.date + 'T12:00:00').getMonth() === i)
      .reduce((a, t) => a + t.amount, 0)
  );

  const maxVal = Math.max(...data, 1);
  const W = canvas.width, H = canvas.height;
  const barW = 16, gap = (W - 32) / 12;
  ctx.clearRect(0, 0, W, H);

  data.forEach((val, i) => {
    const x    = 16 + i * gap + gap / 2 - barW / 2;
    const barH = Math.max(val > 0 ? 4 : 0, (val / maxVal) * (H - 40));
    const y    = H - 25 - barH;
    ctx.fillStyle = i === curM ? '#3a7d5a' : '#c5ddd1';
    ctx.beginPath();
    ctx.rect(x, y, barW, barH);
    ctx.fill();
    ctx.fillStyle = '#7a9080';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(months[i], x + barW / 2, H - 8);
  });
}

function drawPieChart() {
  const canvas = document.getElementById('pie-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cats   = DB.categories.filter(c => c.type === 'expense');
  const txList = DB.transactions.filter(t => t.type === 'expense');
  const data   = cats.map(cat => ({
    val:   txList.filter(t => t.catId === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.val > 0);

  const total = data.reduce((a, d) => a + d.val, 0);
  if (!total) return;

  let angle = -Math.PI / 2;
  data.forEach(d => {
    const slice = (d.val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 80, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    angle += slice;
  });
}

// ===== PODESAVANJA =====
function initSettings() {
  const themeEl = document.getElementById('theme-select');
  const currEl  = document.getElementById('base-currency');
  if (themeEl) themeEl.value = lsGet('k_theme') || 'light';
  if (currEl)  currEl.value  = STATE.baseCurrency;
}

function applyTheme() {
  const theme = document.getElementById('theme-select').value;
  lsSet('k_theme', theme);
  document.body.classList.toggle('dark', theme === 'dark');
}

function saveSettings() {
  const cur = document.getElementById('base-currency').value;
  STATE.baseCurrency = cur;
  lsSet('k_currency', cur);  // cuva se u localStorage
  // odmah osvezi prikaz balansa
  const balEl = document.getElementById('balance-display');
  if (balEl) balEl.textContent = fmt(DB.balance, cur);
}

function clearData() {
  if (!confirm('Obrisati SVE podatke? Ne moze se ponistiti.')) return;
  ['k_cats','k_tx','k_balance','k_currency','k_theme','k_accounts'].forEach(k => {
    try { localStorage.removeItem(k); } catch(e) {}
  });
  STATE.baseCurrency = 'USD';
  DB = loadDB();
  navigate('home');
}

function exportData() {
  const blob = new Blob(
    [JSON.stringify({ categories: DB.categories, transactions: DB.transactions }, null, 2)],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kasica-export.json';
  a.click();
}

// ============================================================
// RAČUNI — sa brisanjem i uređivanjem
// ============================================================
let selectedAccIcon = '💵';

function selectAccIcon(el, icon) {
  selectedAccIcon = icon;
  document.querySelectorAll('.acc-icon-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
}

function getAccounts() {
  const raw = lsGet('k_accounts');
  if (raw) { try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch(e) {} }
  return [
    { id: 1, name: 'Gotovina', balance: 2845, currency: 'USD', icon: '💵' },
    { id: 2, name: 'Banka',    balance: 5200, currency: 'RSD', icon: '🏦' },
  ];
}
function saveAccounts(accounts) {
  lsSet('k_accounts', JSON.stringify(accounts));
}

function initAccounts() {
  const accounts = getAccounts();
  const el = document.getElementById('accounts-content');
  if (!el) return;

  if (!accounts.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:12px">💰</div>
        <p style="font-size:15px;font-weight:600">Nema računa</p>
        <p style="font-size:13px;margin-top:6px">Dodaj novi računom pritiskom na +</p>
      </div>`;
    return;
  }

  const totalUSD = accounts.reduce((a, acc) => {
    const rates = { USD:1, EUR:1.09, GBP:1.27, RSD:0.0093 };
    return a + acc.balance * (rates[acc.currency] || 1);
  }, 0);

  el.innerHTML = `
    <div style="background:var(--green);margin:12px;border-radius:16px;padding:20px;color:white;text-align:center">
      <div style="font-size:12px;opacity:0.8;font-weight:600;letter-spacing:1px">UKUPNO (≈ USD)</div>
      <div style="font-size:28px;font-weight:900;margin-top:4px">${Math.round(totalUSD).toLocaleString('sr-RS')} $</div>
    </div>
    ${accounts.map(a => `
      <div class="account-card">
        <div style="display:flex;align-items:center;gap:14px;flex:1">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--green)20;display:flex;align-items:center;justify-content:center;font-size:22px">${a.icon}</div>
          <div>
            <div class="account-name">${a.name}</div>
            <div class="account-balance">${fmt(a.balance, a.currency)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="editAccount(${a.id})" style="background:var(--green)20;border:none;border-radius:10px;padding:8px 12px;cursor:pointer;font-size:16px">✏️</button>
          <button onclick="deleteAccount(${a.id})" style="background:#e74c3c20;border:none;border-radius:10px;padding:8px 12px;cursor:pointer;font-size:16px">🗑️</button>
        </div>
      </div>`).join('')}`;
}

function deleteAccount(id) {
  if (!confirm('Obrisati ovaj račun?')) return;
  const accounts = getAccounts().filter(a => a.id !== id);
  saveAccounts(accounts);
  initAccounts();
}

function editAccount(id) {
  const accounts = getAccounts();
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;
  const newBalance = prompt(`Novi balans za "${acc.name}":`, acc.balance);
  if (newBalance === null) return;
  const num = parseFloat(newBalance);
  if (isNaN(num)) { alert('Neispravan iznos'); return; }
  acc.balance = num;
  saveAccounts(accounts);
  initAccounts();
}

function saveAccount() {
  const name    = document.getElementById('acc-name').value.trim();
  const balance = parseFloat(document.getElementById('acc-balance').value) || 0;
  const currency = document.getElementById('acc-currency').value;
  if (!name) { alert('Unesite naziv računa!'); return; }
  const accounts = getAccounts();
  accounts.push({ id: Date.now(), name, balance, currency, icon: selectedAccIcon });
  saveAccounts(accounts);
  navigate('accounts');
}

// ============================================================
// REDOVNA PLAĆANJA
// ============================================================
let selectedRegCatId = null;
let selectedRegFreq  = 'monthly';

function getRegulars() {
  const raw = lsGet('k_regulars');
  if (raw) { try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch(e) {} }
  return [];
}
function saveRegulars(data) { lsSet('k_regulars', JSON.stringify(data)); }

const FREQ_LABELS = { daily:'Dnevno', weekly:'Nedeljno', monthly:'Mesečno', yearly:'Godišnje' };

function initRegular() {
  const list = getRegulars();
  const el   = document.getElementById('regular-list');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:12px">🔄</div>
        <p style="font-size:15px;font-weight:700">Nema redovnih plaćanja</p>
        <p style="font-size:13px;margin-top:6px">Dodaj kiriju, pretplate, rate...</p>
      </div>`;
    return;
  }

  el.innerHTML = list.map(r => {
    const cat = DB.categories.find(c => c.id === r.catId) || { icon:'❓', color:'#95a5a6', name:'Ostalo' };
    const sym = CURRENCY_SYMBOLS[r.currency] || r.currency;
    const nextD = new Date(r.nextDate + 'T12:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const diff  = Math.round((nextD - today) / 86400000);
    const diffLabel = diff === 0 ? '⚠️ Danas!' : diff < 0 ? `⚠️ Kasni ${Math.abs(diff)} dana` : `Za ${diff} dana`;
    const diffColor = diff <= 3 ? '#e74c3c' : '#7a9080';

    return `
      <div class="cat-item" style="margin-bottom:10px">
        <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color}">
          <span style="font-size:20px">${cat.icon}</span>
        </div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:15px">${r.name}</div>
          <div style="font-size:12px;color:${diffColor};font-weight:600;margin-top:2px">${diffLabel} · ${FREQ_LABELS[r.freq]}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800;font-size:15px;color:var(--green)">${r.amount} ${sym}</div>
          <button onclick="deleteRegular(${r.id})" style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:18px;padding:4px">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function deleteRegular(id) {
  if (!confirm('Obrisati ovo plaćanje?')) return;
  saveRegulars(getRegulars().filter(r => r.id !== id));
  initRegular();
}

function initNewRegular() {
  selectedRegCatId = null;
  selectedRegFreq  = 'monthly';
  document.getElementById('reg-name').value    = '';
  document.getElementById('reg-amount').value  = '';
  document.querySelectorAll('.freq-btn').forEach((b, i) => b.classList.toggle('active', i === 2));
  const d = new Date(); d.setDate(d.getDate() + 30);
  setRegDate(d);
  renderRegCatGrid();
}

function renderRegCatGrid() {
  const el   = document.getElementById('reg-cat-grid');
  if (!el) return;
  const cats = DB.categories.filter(c => c.type === 'expense');
  el.innerHTML = cats.map(cat => {
    const sel = selectedRegCatId === cat.id;
    return `<div class="cat-grid-item ${sel?'selected':''}" onclick="selectedRegCatId=${cat.id};renderRegCatGrid()">
      <div class="cgi-circle" style="background:${sel?cat.color:'#c5d4cc'}">
        <span style="font-size:20px">${cat.icon}</span>
      </div>
      <span style="font-size:11px;font-weight:600;color:${sel?cat.color:'var(--text-muted)'}">${cat.name}</span>
    </div>`;
  }).join('');
}

function selectFreq(btn, freq) {
  selectedRegFreq = freq;
  document.querySelectorAll('#screen-new-regular .freq-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setRegDate(d) {
  const el = document.getElementById('reg-date-display');
  if (!el) return;
  el.textContent  = d.toLocaleDateString('sr-RS', { year:'numeric', month:'long', day:'numeric' });
  el.dataset.date = d.toISOString().split('T')[0];
}

function pickRegDate() {
  const h = document.createElement('input'); h.type = 'date';
  h.value = document.getElementById('reg-date-display').dataset.date || '';
  h.style.cssText = 'position:fixed;opacity:0;pointer-events:none;top:0;left:0';
  document.body.appendChild(h);
  h.addEventListener('change', () => { if (h.value) setRegDate(new Date(h.value+'T12:00:00')); document.body.removeChild(h); });
  h.focus(); h.click();
  setTimeout(() => { if (document.body.contains(h)) document.body.removeChild(h); }, 10000);
}

function saveRegular() {
  const name   = document.getElementById('reg-name').value.trim();
  const amount = parseFloat(document.getElementById('reg-amount').value);
  const currency = document.getElementById('reg-currency').value;
  const nextDate = document.getElementById('reg-date-display').dataset.date;
  if (!name)   { alert('Unesite naziv!'); return; }
  if (!amount) { alert('Unesite iznos!'); return; }
  const list = getRegulars();
  list.push({ id: Date.now(), name, amount, currency, catId: selectedRegCatId, freq: selectedRegFreq, nextDate: nextDate || new Date().toISOString().split('T')[0] });
  saveRegulars(list);
  navigate('regular');
}

// ============================================================
// PODSETNICI
// ============================================================
let selectedRemFreq = 'once';

function getReminders() {
  const raw = lsGet('k_reminders');
  if (raw) { try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch(e) {} }
  return [];
}
function saveReminders(data) { lsSet('k_reminders', JSON.stringify(data)); }

const REM_FREQ_LABELS = { once:'Jednom', daily:'Dnevno', weekly:'Nedeljno', monthly:'Mesečno' };

function initReminders() {
  const list = getReminders();
  const el   = document.getElementById('reminders-list');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:12px">🔔</div>
        <p style="font-size:15px;font-weight:700">Nema podsetnika</p>
        <p style="font-size:13px;margin-top:6px">Dodaj podsetnik pritiskom na +</p>
      </div>`;
    return;
  }

  const sorted = [...list].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  el.innerHTML = sorted.map(r => {
    const d      = new Date(r.date + 'T' + (r.time || '00:00'));
    const today  = new Date(); today.setHours(0,0,0,0);
    const isPast = d < new Date();
    const dateLabel = d.toLocaleDateString('sr-RS', { day:'numeric', month:'long', year:'numeric' });
    const timeLabel = r.time || '';

    return `
      <div class="cat-item" style="margin-bottom:10px;opacity:${isPast?'0.55':'1'}">
        <div style="width:44px;height:44px;border-radius:50%;background:${isPast?'#95a5a620':'#f5a62320'};
             display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
          ${isPast ? '✅' : '🔔'}
        </div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:15px">${r.title}</div>
          ${r.note ? `<div style="font-size:12px;color:var(--text-muted);margin-top:1px">${r.note}</div>` : ''}
          <div style="font-size:12px;color:var(--text-muted);margin-top:3px">
            📅 ${dateLabel}${timeLabel ? ' · ⏰ ' + timeLabel : ''} · ${REM_FREQ_LABELS[r.freq] || 'Jednom'}
          </div>
        </div>
        <button onclick="deleteReminder(${r.id})" style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:18px;padding:4px 8px">🗑️</button>
      </div>`;
  }).join('');
}

function deleteReminder(id) {
  if (!confirm('Obrisati podsetnik?')) return;
  saveReminders(getReminders().filter(r => r.id !== id));
  initReminders();
}

function initNewReminder() {
  selectedRemFreq = 'once';
  document.getElementById('rem-title').value = '';
  document.getElementById('rem-note').value  = '';
  document.getElementById('rem-time').value  = '09:00';
  document.querySelectorAll('#screen-new-reminder .freq-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  setRemDate(new Date());
}

function setRemDate(d) {
  const el = document.getElementById('rem-date-display');
  if (!el) return;
  el.textContent  = d.toLocaleDateString('sr-RS', { year:'numeric', month:'long', day:'numeric' });
  el.dataset.date = d.toISOString().split('T')[0];
}

function pickRemDate() {
  const h = document.createElement('input'); h.type = 'date';
  h.value = document.getElementById('rem-date-display').dataset.date || '';
  h.style.cssText = 'position:fixed;opacity:0;pointer-events:none;top:0;left:0';
  document.body.appendChild(h);
  h.addEventListener('change', () => { if (h.value) setRemDate(new Date(h.value+'T12:00:00')); document.body.removeChild(h); });
  h.focus(); h.click();
  setTimeout(() => { if (document.body.contains(h)) document.body.removeChild(h); }, 10000);
}

function selectRemFreq(btn, freq) {
  selectedRemFreq = freq;
  document.querySelectorAll('#screen-new-reminder .freq-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function saveReminder() {
  const title = document.getElementById('rem-title').value.trim();
  const note  = document.getElementById('rem-note').value.trim();
  const date  = document.getElementById('rem-date-display').dataset.date;
  const time  = document.getElementById('rem-time').value;
  if (!title) { alert('Unesite naslov!'); return; }
  const list = getReminders();
  list.push({ id: Date.now(), title, note, date: date || new Date().toISOString().split('T')[0], time, freq: selectedRemFreq });
  saveReminders(list);
  navigate('reminders');
}
