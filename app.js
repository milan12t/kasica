// ===== STATE =====
const STATE = {
  currentScreen: 'home',
  prevScreen: null,
  mainTab: 'expense',
  txTab: 'expense',
  opsTab: 'expense',
  period: 'day',
  opsPeriod: 'week',
  periodOffset: 0,
  opsPeriodOffset: 0,
  selectedCategoryId: null,
  selectedIcon: '🛒',
  selectedColor: '#3a7d5a',
  newCatType: 'expense',
  balance: 2845,
  baseCurrency: 'USD',
};

const DEFAULT_CATS = [
  { id: 1, name: 'Namirnice', icon: '🛒', color: '#4a90d9', type: 'expense' },
  { id: 2, name: 'Kupovina', icon: '🛍️', color: '#9b59b6', type: 'expense' },
  { id: 3, name: 'Restorani', icon: '🍽️', color: '#f5a623', type: 'expense' },
  { id: 4, name: 'Dom', icon: '🏠', color: '#e74c3c', type: 'expense' },
  { id: 5, name: 'Krediti', icon: '🏛️', color: '#27ae60', type: 'expense' },
  { id: 6, name: 'Zdravlje', icon: '❤️', color: '#e91e63', type: 'expense' },
  { id: 7, name: 'Prevoz', icon: '🚌', color: '#00bcd4', type: 'expense' },
  { id: 8, name: 'Ostalo', icon: '❓', color: '#95a5a6', type: 'expense' },
  { id: 9, name: 'Plata', icon: '💵', color: '#27ae60', type: 'income' },
  { id: 10, name: 'Freelance', icon: '💻', color: '#3498db', type: 'income' },
  { id: 11, name: 'Poklon', icon: '🎁', color: '#e91e63', type: 'income' },
  { id: 12, name: 'Investicije', icon: '📈', color: '#f5a623', type: 'income' },
];

const SAMPLE_TX = [
  { id: 1, catId: 1, amount: 12, currency: 'USD', note: '', date: '2024-07-22', type: 'expense' },
  { id: 2, catId: 7, amount: 8, currency: 'USD', note: '', date: '2024-07-22', type: 'expense' },
  { id: 3, catId: 3, amount: 2500, currency: 'JPY', note: '', date: '2024-07-23', type: 'expense' },
  { id: 4, catId: 1, amount: 20, currency: 'EUR', note: 'povrće sa pijace', date: '2024-07-25', type: 'expense' },
  { id: 5, catId: 2, amount: 180, currency: 'USD', note: '', date: '2024-07-25', type: 'expense' },
  { id: 6, catId: 7, amount: 10, currency: 'GBP', note: '', date: '2024-07-26', type: 'expense' },
  { id: 7, catId: 5, amount: 980, currency: 'USD', note: '', date: '2024-07-25', type: 'expense' },
  { id: 8, catId: 9, amount: 3500, currency: 'USD', note: '', date: '2024-07-01', type: 'income' },
];

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', RSD: 'din', JPY: '¥' };
const ICON_LIST = ['🛒','🍽️','🏠','🏛️','❤️','❓','➕','🚌','👨‍👩‍👧','🎁','✈️','🐾','⚡','🚗','💄','💪','💵','💻','📈','🎁','🏥','🎓','🎮','📱','🎵','🌍','⚽','🎨'];
const COLORS = ['#e74c3c','#27ae60','#4a90d9','#f5a623','#e91e63','#8bc34a','#00bcd4','#9b59b6','#ff5722','#607d8b'];

function load() {
  let categories = DEFAULT_CATS;
  let transactions = SAMPLE_TX;
  let balance = 2845;

  try {
    const rawCats = localStorage.getItem('kasica_cats');
    if (rawCats) {
      const parsed = JSON.parse(rawCats);
      if (Array.isArray(parsed) && parsed.length > 0) categories = parsed;
    }
  } catch(e) {}

  try {
    const rawTx = localStorage.getItem('kasica_tx');
    if (rawTx) {
      const parsed = JSON.parse(rawTx);
      if (Array.isArray(parsed)) transactions = parsed;
    }
  } catch(e) {}

  try {
    const rawBal = localStorage.getItem('kasica_balance');
    if (rawBal !== null) {
      const parsed = parseFloat(rawBal);
      if (!isNaN(parsed)) balance = parsed;
    }
  } catch(e) {}

  return { categories, transactions, balance };
}

function save(data) {
  try {
    localStorage.setItem('kasica_cats', JSON.stringify(data.categories));
    localStorage.setItem('kasica_tx', JSON.stringify(data.transactions));
    localStorage.setItem('kasica_balance', String(data.balance));
  } catch(e) {
    alert('Greška pri čuvanju podataka: ' + e.message);
  }
}

let DB = load();

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('app').style.opacity = '1';
    initHome();
    setTxDate(new Date());
    initCategoryScreen();
    initNewCategoryScreen();
    initAccounts();
    initSettings();
    initCharts();
  }, 2000);
});

// ===== NAVIGATION =====
function navigate(screen) {
  STATE.prevScreen = STATE.currentScreen;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + screen);
  if (el) el.classList.add('active');
  STATE.currentScreen = screen;
  if (screen === 'home') initHome();
  if (screen === 'operations') initOperations();
  if (screen === 'categories') initCategoryScreen();
  if (screen === 'add-transaction') initAddTx();
  if (screen === 'charts') initCharts();
  if (screen === 'accounts') initAccounts();
}

function goBack() {
  navigate(STATE.prevScreen || 'home');
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

// ===== TABS =====
function switchTab(tab, btn) {
  STATE.mainTab = tab;
  document.querySelectorAll('#screen-home .tabs .tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCategoryList();
  drawDonut();
}

function switchTxTab(tab, btn) {
  STATE.txTab = tab;
  document.querySelectorAll('#screen-add-transaction .tabs .tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTxCatGrid();
}

function switchOpsTab(tab, btn) {
  STATE.opsTab = tab;
  document.querySelectorAll('#screen-operations .tabs .tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOpsList();
}

// ===== PERIOD =====
function switchPeriod(p, btn) {
  STATE.period = p;
  STATE.periodOffset = 0;
  document.querySelectorAll('#screen-home .period-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updatePeriodLabel();
  renderCategoryList();
  drawDonut();
}

function prevPeriod() { STATE.periodOffset--; updatePeriodLabel(); renderCategoryList(); drawDonut(); }
function nextPeriod() {
  if (STATE.periodOffset < 0) { STATE.periodOffset++; updatePeriodLabel(); renderCategoryList(); drawDonut(); }
}

function switchOpsPeriod(p, btn) {
  STATE.opsPeriod = p;
  STATE.opsPeriodOffset = 0;
  document.querySelectorAll('#screen-operations .period-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOpsList();
}
function prevOpsPeriod() { STATE.opsPeriodOffset--; updateOpsLabel(); renderOpsList(); }
function nextOpsPeriod() { if(STATE.opsPeriodOffset < 0){ STATE.opsPeriodOffset++; updateOpsLabel(); renderOpsList(); } }

function updatePeriodLabel() {
  const now = new Date();
  const offset = STATE.periodOffset;
  let label = '';
  const fmt = (d) => d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long' });
  if (STATE.period === 'day') {
    const d = new Date(now); d.setDate(d.getDate() + offset);
    label = offset === 0 ? 'Danas, ' + fmt(d) : fmt(d);
  } else if (STATE.period === 'week') {
    const start = new Date(now); start.setDate(start.getDate() - start.getDay() + 1 + offset * 7);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    label = fmt(start) + ' – ' + fmt(end);
  } else if (STATE.period === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    label = d.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' });
  } else if (STATE.period === 'year') {
    label = (now.getFullYear() + offset).toString();
  } else { label = 'Prilagođeno'; }
  document.getElementById('period-label').textContent = label;
  document.getElementById('next-period-btn').disabled = offset >= 0;
}

function updateOpsLabel() {
  document.getElementById('ops-period-label').textContent = 'Nedavni periodi';
}

// ===== HOME =====
function initHome() {
  DB = load();
  STATE.balance = DB.balance;
  document.getElementById('balance-display').textContent = formatMoney(STATE.balance, STATE.baseCurrency);
  updatePeriodLabel();
  renderCategoryList();
  drawDonut();
}

function getCatsForTab(tab) {
  return DB.categories.filter(c => c.type === tab);
}

function getTxForPeriod(tab) {
  return DB.transactions.filter(t => t.type === tab);
}

function renderCategoryList() {
  const el = document.getElementById('categories-list');
  const cats = getCatsForTab(STATE.mainTab);
  const txList = getTxForPeriod(STATE.mainTab);
  const total = txList.reduce((a, t) => a + t.amount, 0) || 1;

  let html = '';
  cats.forEach(cat => {
    const catTx = txList.filter(t => t.catId === cat.id);
    const sum = catTx.reduce((a, t) => a + t.amount, 0);
    if (sum === 0) return;
    const pct = Math.round(sum / total * 100);
    const sym = CURRENCY_SYMBOLS[STATE.baseCurrency] || '$';
    html += `<div class="cat-item" onclick="filterByCategory(${cat.id})">
      <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color}">
        <span style="font-size:20px">${cat.icon}</span>
      </div>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-pct">${pct}%</span>
      <span class="cat-amount">${formatMoney(sum, STATE.baseCurrency)}</span>
    </div>`;
  });
  el.innerHTML = html || '<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:14px">Nema transakcija</div>';
}

function drawDonut() {
  const canvas = document.getElementById('donut-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cats = getCatsForTab(STATE.mainTab);
  const txList = getTxForPeriod(STATE.mainTab);
  const data = cats.map(cat => ({
    val: txList.filter(t => t.catId === cat.id).reduce((a,t)=>a+t.amount,0),
    color: cat.color,
  })).filter(d => d.val > 0);

  const total = data.reduce((a, d) => a + d.val, 0);
  const cx = 110, cy = 110, r = 90, inner = 60;
  ctx.clearRect(0, 0, 220, 220);

  if (total === 0) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = '#e0e8e2'; ctx.lineWidth = 30; ctx.stroke();
    document.getElementById('donut-total').textContent = '0 ' + (CURRENCY_SYMBOLS[STATE.baseCurrency]||'$');
    return;
  }

  let startAngle = -Math.PI / 2;
  const gap = 0.03;
  data.forEach(d => {
    const slice = (d.val / total) * (Math.PI * 2 - gap * data.length);
    ctx.beginPath();
    ctx.moveTo(cx + (inner+1) * Math.cos(startAngle + gap/2), cy + (inner+1) * Math.sin(startAngle + gap/2));
    ctx.arc(cx, cy, r, startAngle + gap/2, startAngle + slice + gap/2);
    ctx.arc(cx, cy, inner, startAngle + slice + gap/2, startAngle + gap/2, true);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    startAngle += slice + gap;
  });

  document.getElementById('donut-total').textContent = formatMoney(total, STATE.baseCurrency);
}

function formatMoney(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency || '$';
  const formatted = Math.round(amount).toLocaleString('sr-RS');
  return formatted + ' ' + sym;
}

function editBalance() {
  const val = prompt('Unesite novi balans:', STATE.balance);
  if (val && !isNaN(parseFloat(val))) {
    DB.balance = parseFloat(val);
    save(DB);
    initHome();
  }
}

function filterByCategory(id) {
  navigate('operations');
}

// ===== ADD TRANSACTION =====
function initAddTx() {
  STATE.selectedCategoryId = null;
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-converted').textContent = '0.00';
  document.getElementById('tx-comment').value = '';
  setTxDate(new Date());
  renderTxCatGrid();
}

function renderTxCatGrid() {
  const el = document.getElementById('tx-cat-grid');
  const cats = DB.categories.filter(c => c.type === STATE.txTab);
  let html = cats.map(cat => `
    <div class="cat-grid-item ${STATE.selectedCategoryId === cat.id ? 'selected':''}" onclick="selectTxCat(${cat.id})">
      <div class="cgi-circle" style="background:${cat.color}">
        <span>${cat.icon}</span>
      </div>
      <span>${cat.name}</span>
    </div>
  `).join('');
  // Add "More" button
  html += `<div class="cat-grid-item" onclick="navigate('categories')">
    <div class="cgi-circle"><span>➕</span></div>
    <span>Više</span>
  </div>`;
  el.innerHTML = html;
}

function selectTxCat(id) {
  STATE.selectedCategoryId = id;
  renderTxCatGrid();
}

function setTxDate(d) {
  const label = d.toLocaleDateString('sr-RS', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('tx-date-display').textContent = label;
  document.getElementById('tx-date-display').dataset.date = d.toISOString().split('T')[0];
}

function pickDate() {
  const input = document.createElement('input');
  input.type = 'date';
  input.value = document.getElementById('tx-date-display').dataset.date;
  input.style.opacity = 0;
  input.style.position = 'fixed';
  document.body.appendChild(input);
  input.focus(); input.click();
  input.addEventListener('change', () => {
    if (input.value) setTxDate(new Date(input.value + 'T12:00:00'));
    document.body.removeChild(input);
  });
  setTimeout(() => { if(document.body.contains(input)) document.body.removeChild(input); }, 5000);
}

function convertAmount() {
  const val = parseFloat(document.getElementById('tx-amount').value) || 0;
  // simple mock conversion rates
  const rates = { USD:1, EUR:0.88, GBP:0.76, RSD:108, JPY:150 };
  const from = STATE.baseCurrency;
  const to = from === 'USD' ? 'EUR' : 'USD';
  const converted = (val / (rates[from]||1)) * (rates[to]||1);
  document.getElementById('tx-converted').textContent = converted.toFixed(2);
  document.getElementById('tx-currency').textContent = from;
  document.getElementById('tx-converted-currency').textContent = CURRENCY_SYMBOLS[to] || to;
}

function addTransaction() {
  const amount = parseFloat(document.getElementById('tx-amount').value);
  if (!amount || amount <= 0) { alert('Unesite iznos!'); return; }
  if (!STATE.selectedCategoryId) { alert('Izaberite kategoriju!'); return; }
  const note = document.getElementById('tx-comment').value;
  const date = document.getElementById('tx-date-display').dataset.date;
  const newTx = {
    id: Date.now(),
    catId: STATE.selectedCategoryId,
    amount,
    currency: STATE.baseCurrency,
    note,
    date: date || new Date().toISOString().split('T')[0],
    type: STATE.txTab,
  };
  DB.transactions.push(newTx);
  if (STATE.txTab === 'expense') DB.balance -= amount;
  else DB.balance += amount;
  save(DB);
  navigate('home');
}

// ===== OPERATIONS =====
function initOperations() {
  DB = load();
  updateOpsLabel();
  renderOpsList();
}

function renderOpsList() {
  const el = document.getElementById('ops-list');
  const txList = DB.transactions.filter(t => t.type === STATE.opsTab)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (txList.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:14px">Nema transakcija</div>';
    document.getElementById('ops-total').textContent = 'Ukupno: 0 ' + (CURRENCY_SYMBOLS[STATE.baseCurrency]||'$');
    return;
  }

  const total = txList.reduce((a, t) => a + t.amount, 0);
  document.getElementById('ops-total').textContent = 'Ukupno: ' + formatMoney(total, STATE.baseCurrency);

  const byDate = {};
  txList.forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = [];
    byDate[t.date].push(t);
  });

  let html = '';
  Object.keys(byDate).sort((a,b) => b.localeCompare(a)).forEach(date => {
    const d = new Date(date + 'T12:00:00');
    const label = d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' });
    html += `<div class="ops-date-group">${label}</div>`;
    byDate[date].forEach(tx => {
      const cat = DB.categories.find(c => c.id === tx.catId) || { name: 'Ostalo', icon: '❓', color: '#95a5a6' };
      const sym = CURRENCY_SYMBOLS[tx.currency] || tx.currency;
      html += `<div class="ops-tx-item" onclick="deleteTx(${tx.id})">
        <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color};width:40px;height:40px">
          <span style="font-size:18px">${cat.icon}</span>
        </div>
        <div class="ops-tx-info">
          <div class="ops-tx-name">${cat.name}</div>
          ${tx.note ? `<div class="ops-tx-note">${tx.note}</div>` : ''}
        </div>
        <div class="ops-tx-amount ${tx.type === 'income' ? 'income':''}">${tx.amount} ${sym}</div>
      </div>`;
    });
  });
  el.innerHTML = html;
}

function deleteTx(id) {
  if (!confirm('Obrisati ovu transakciju?')) return;
  const tx = DB.transactions.find(t => t.id === id);
  if (tx) {
    if (tx.type === 'expense') DB.balance += tx.amount;
    else DB.balance -= tx.amount;
    DB.transactions = DB.transactions.filter(t => t.id !== id);
    save(DB);
    renderOpsList();
  }
}

// ===== CATEGORY SCREEN =====
function initCategoryScreen() {
  DB = load();
  const el = document.getElementById('cat-list-screen');
  const expCats = DB.categories.filter(c => c.type === 'expense');
  const incCats = DB.categories.filter(c => c.type === 'income');
  let html = `<div class="cat-type-header">TROŠKOVI</div>`;
  expCats.forEach(cat => {
    html += `<div class="cat-item">
      <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color}">
        <span style="font-size:20px">${cat.icon}</span>
      </div>
      <span class="cat-name">${cat.name}</span>
      <button style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:20px" onclick="deleteCat(${cat.id})">×</button>
    </div>`;
  });
  html += `<div class="cat-type-header">PRIHODI</div>`;
  incCats.forEach(cat => {
    html += `<div class="cat-item">
      <div class="cat-icon-circle" style="background:${cat.color}20;color:${cat.color}">
        <span style="font-size:20px">${cat.icon}</span>
      </div>
      <span class="cat-name">${cat.name}</span>
      <button style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:20px" onclick="deleteCat(${cat.id})">×</button>
    </div>`;
  });
  el.innerHTML = html;
}

function deleteCat(id) {
  if (!confirm('Obrisati kategoriju?')) return;
  DB.categories = DB.categories.filter(c => c.id !== id);
  save(DB);
  initCategoryScreen();
}

// ===== NEW CATEGORY SCREEN =====
function initNewCategoryScreen() {
  STATE.selectedIcon = '🛒';
  STATE.selectedColor = '#3a7d5a';
  renderIconGrid();
  renderColorRow();
  updateNewCatPreview();
}

function renderIconGrid() {
  const el = document.getElementById('icon-grid');
  el.innerHTML = ICON_LIST.map(ic => `
    <div class="icon-cell ${STATE.selectedIcon === ic ? 'selected':''}" onclick="selectIcon('${ic}')">
      ${ic}
    </div>
  `).join('');
}

function renderColorRow() {
  const el = document.getElementById('color-row');
  let html = `<div class="color-add" onclick="addCustomColor()">+</div>`;
  html += COLORS.map(c => `
    <div class="color-dot ${STATE.selectedColor === c ? 'selected':''}"
      style="background:${c}" onclick="selectColor('${c}')">
      ${STATE.selectedColor === c ? '✓' : ''}
    </div>
  `).join('');
  el.innerHTML = html;
}

function selectIcon(ic) {
  STATE.selectedIcon = ic;
  document.getElementById('new-cat-icon-preview').textContent = ic;
  renderIconGrid();
}

function selectColor(c) {
  STATE.selectedColor = c;
  document.getElementById('new-cat-preview').style.background = c;
  renderColorRow();
}

function addCustomColor() {
  const c = prompt('Unesite hex boju (npr. #ff5733):');
  if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
    COLORS.push(c); selectColor(c);
  }
}

function updateNewCatPreview() {
  document.getElementById('new-cat-preview').style.background = STATE.selectedColor;
  document.getElementById('new-cat-icon-preview').textContent = STATE.selectedIcon;
}

function saveCategory() {
  const name = document.getElementById('new-cat-name').value.trim();
  if (!name) { alert('Unesite naziv!'); return; }
  const type = document.querySelector('input[name="cat-type"]:checked').value;
  const newCat = {
    id: Date.now(),
    name, icon: STATE.selectedIcon, color: STATE.selectedColor, type
  };
  DB.categories.push(newCat);
  save(DB);
  navigate('categories');
}

// ===== ACCOUNTS =====
function initAccounts() {
  const accounts = JSON.parse(localStorage.getItem('kasica_accounts') || 'null') || [
    { id: 1, name: 'Gotovina', balance: 2845, currency: 'USD', icon: '💵' },
    { id: 2, name: 'Banka', balance: 5200, currency: 'RSD', icon: '🏦' },
  ];
  const el = document.getElementById('accounts-content');
  el.innerHTML = accounts.map(a => `
    <div class="account-card">
      <div>
        <div style="font-size:28px;margin-bottom:4px">${a.icon}</div>
        <div class="account-name">${a.name}</div>
      </div>
      <div class="account-balance">${formatMoney(a.balance, a.currency)}</div>
    </div>
  `).join('');
}

function addAccount() {
  const name = prompt('Naziv računa:');
  if (!name) return;
  const balance = parseFloat(prompt('Početni balans:', '0') || '0');
  const accounts = JSON.parse(localStorage.getItem('kasica_accounts') || '[]');
  accounts.push({ id: Date.now(), name, balance, currency: STATE.baseCurrency, icon: '💰' });
  localStorage.setItem('kasica_accounts', JSON.stringify(accounts));
  initAccounts();
}

// ===== CHARTS =====
function initCharts() {
  setTimeout(() => {
    drawBarChart();
    drawPieChart();
  }, 100);
}

function drawBarChart() {
  const canvas = document.getElementById('bar-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const months = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'];
  const data = [800,1200,950,1400,1100,1600,1030,0,0,0,0,0];
  const maxVal = Math.max(...data.filter(d=>d>0)) || 1;
  const w = canvas.width, h = canvas.height;
  const barW = 18, gap = (w - 32) / 12;
  ctx.clearRect(0, 0, w, h);
  data.forEach((val, i) => {
    if (val === 0) return;
    const x = 16 + i * gap + gap/2 - barW/2;
    const barH = (val / maxVal) * (h - 40);
    const y = h - 25 - barH;
    ctx.fillStyle = i === 6 ? '#3a7d5a' : '#c5ddd1';
    const radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barW - radius, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a9080';
    ctx.font = '10px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText(months[i], x + barW/2, h - 8);
  });
}

function drawPieChart() {
  const canvas = document.getElementById('pie-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cats = DB.categories.filter(c => c.type === 'expense').slice(0, 6);
  const txList = DB.transactions.filter(t => t.type === 'expense');
  const data = cats.map(cat => ({
    val: txList.filter(t => t.catId === cat.id).reduce((a,t)=>a+t.amount,0),
    color: cat.color, name: cat.name,
  })).filter(d => d.val > 0);
  const total = data.reduce((a, d) => a + d.val, 0);
  if (total === 0) return;
  const cx = 100, cy = 100, r = 80;
  let startAngle = -Math.PI / 2;
  data.forEach(d => {
    const slice = (d.val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    startAngle += slice;
  });
}

// ===== SETTINGS =====
function initSettings() {
  const theme = localStorage.getItem('kasica_theme') || 'light';
  document.getElementById('theme-select').value = theme;
  if (theme === 'dark') document.body.classList.add('dark');
  document.getElementById('base-currency').value = STATE.baseCurrency;
}

function applyTheme() {
  const theme = document.getElementById('theme-select').value;
  localStorage.setItem('kasica_theme', theme);
  document.body.classList.toggle('dark', theme === 'dark');
}

function saveSettings() {
  STATE.baseCurrency = document.getElementById('base-currency').value;
}

function clearData() {
  if (confirm('Obrisati sve podatke? Ovo se ne može poništiti.')) {
    localStorage.clear();
    DB = load();
    navigate('home');
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify({ categories: DB.categories, transactions: DB.transactions }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'kasica-export.json'; a.click();
}
