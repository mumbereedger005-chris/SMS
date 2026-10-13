/* ═══════════════════════════════════════════════════════════════
   FIVE STAR MODEL SCHOOL — Shared Sidebar & System JavaScript
   Include at the END of every portal's <body>
   Usage:  <script src="../assets/sidebar.js"></script>
═══════════════════════════════════════════════════════════════ */

/* ── 1. SIDEBAR TOGGLE ─────────────────────────────────────── */
(function initSidebar () {
  const sidebar  = document.getElementById('sidebar');
  const ham      = document.getElementById('sb-ham');
  const backdrop = document.getElementById('sb-backdrop');
  if (!sidebar) return;

  function openSB () {
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    sessionStorage.setItem('sms_sb_open', '1');
  }

  function closeSB () {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    sessionStorage.setItem('sms_sb_open', '0');
  }

  function toggleSB () {
    sidebar.classList.contains('open') ? closeSB() : openSB();
  }

  /* Hamburger click */
  if (ham) ham.addEventListener('click', toggleSB);

  /* Backdrop click (mobile) */
  if (backdrop) backdrop.addEventListener('click', closeSB);

  /* Any nav item marked data-close="1" (Dashboard) collapses the sidebar */
  document.querySelectorAll('.sb-item[data-close]').forEach(el => {
    el.addEventListener('click', closeSB);
  });

  /* Keep sidebar state across page navigations (optional) */
  // if (sessionStorage.getItem('sms_sb_open') === '1') openSB();

  /* Expose globally */
  window.openSidebar  = openSB;
  window.closeSidebar = closeSB;
  window.toggleSidebar = toggleSB;

  /* ── Active nav item ── */
  window.setActiveNav = function (itemEl) {
    document.querySelectorAll('.sb-item').forEach(el => el.classList.remove('active'));
    if (itemEl) itemEl.classList.add('active');
  };
})();


/* ── 2. SESSION GUARD ──────────────────────────────────────── */
(function checkSession () {
  const sess = JSON.parse(sessionStorage.getItem('sms_user') || '{}');
  if (!sess || !sess.loggedIn) {
    /* Redirect to login after a very brief delay so the page shows the guard */
    setTimeout(() => { window.location.href = '../index.html'; }, 200);
    return;
  }
  window.SMS_SESSION = sess;

  /* ── Display user info in topbar / sidebar ── */
  const name = sess.fullName || sess.username || 'User';
  const role = sess.role || '';
  const init = name.charAt(0).toUpperCase();

  ['tb-av', 'sb-av-init'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = init;
  });
  ['tb-uname', 'sb-uname'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name;
  });

  const greeting = function () {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const wEl = document.getElementById('welcome-msg');
  if (wEl) wEl.textContent = greeting() + ', ' + name + ' \uD83D\uDC4B';

  const dEl = document.getElementById('today-date');
  if (dEl) {
    dEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday:'long', day:'2-digit', month:'long', year:'numeric'
    });
  }

  /* Topbar term/year display */
  const termEl = document.getElementById('tb-term');
  if (termEl) {
    const y = localStorage.getItem('sms_current_year') || '';
    const t = localStorage.getItem('sms_current_term') || '';
    if (y || t) termEl.textContent = [y, t].filter(Boolean).join(' \u00B7 ');
  }
})();


/* ── 3. SIGN OUT ───────────────────────────────────────────── */
window.signOut = function () {
  if (!confirm('Sign out of the system?')) return;
  sessionStorage.removeItem('sms_user');
  window.location.href = '../index.html';
};


/* ── 4. TOAST NOTIFICATIONS ────────────────────────────────── */
window.toast = function (msg, type) {
  /* type: '' | 'success' | 'warn' | 'error' */
  let stack = document.getElementById('sms-toasts');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'sms-toasts';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' t-' + type : '');
  const icons = { success:'✓', warn:'!', error:'✗', '':'\u2139' };
  el.innerHTML =
    '<span style="font-weight:800;font-size:.9rem;color:inherit">' +
    (icons[type] || icons['']) + '</span>' +
    '<span>' + msg + '</span>';
  stack.appendChild(el);
  setTimeout(() => el.remove(), 4500);
};


/* ── 5. MODAL HELPERS ──────────────────────────────────────── */
window.openM = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
};
window.closeM = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
};
/* Close modal on backdrop click */
document.querySelectorAll('.overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov) ov.classList.remove('open');
  });
});
/* Close modal on Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.overlay.open').forEach(ov => ov.classList.remove('open'));
  }
});


/* ── 6. TAB SWITCHER ───────────────────────────────────────── */
window.switchTab = function (tabEl, paneId) {
  /* Deactivate sibling tabs */
  tabEl.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  /* Hide all panes that share the same parent container */
  const allPanes = tabEl.closest('.tabs').nextElementSibling
    ? tabEl.closest('.tabs').parentElement.querySelectorAll('.tab-pane')
    : document.querySelectorAll('.tab-pane');
  allPanes.forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  const pane = document.getElementById(paneId);
  if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
};
/* Init all tab panes to hidden except active */
document.querySelectorAll('.tab-pane').forEach(p => {
  p.style.display = p.classList.contains('active') ? 'block' : 'none';
});


/* ── 7. TABLE SEARCH / FILTER HELPER ──────────────────────── */
window.filterTable = function (tbodyId, query) {
  const q = (query || '').toLowerCase();
  const tb = document.getElementById(tbodyId);
  if (!tb) return;
  tb.querySelectorAll('tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
};


/* ── 8. FORMAT HELPERS ─────────────────────────────────────── */
window.fmtUGX = function (n) {
  return 'UGX\u00A0' + Number(n || 0).toLocaleString('en-UG');
};
window.fmtDate = function (dateStr) {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day:'2-digit', month:'short', year:'numeric'
  });
};
window.today = function () {
  return new Date().toISOString().split('T')[0];
};
window.nowTs = function () {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
};


/* ── 9. ADMISSION NUMBER GENERATOR ────────────────────────── */
window.generateAdmNo = function () {
  const prefix = localStorage.getItem('sms_adm_prefix') || 'BFS';
  const year   = new Date().getFullYear();
  const seq    = parseInt(localStorage.getItem('sms_adm_seq') || '0') + 1;
  localStorage.setItem('sms_adm_seq', seq);
  return prefix + '-' + year + '-' + String(seq).padStart(5, '0');
  /* e.g.  BFS-2026-00001 */
};

/* ── 10. RECEIPT NUMBER GENERATOR ─────────────────────────── */
window.generateRcpNo = function () {
  const prefix = localStorage.getItem('sms_rcp_prefix') || 'BFS-RCP';
  const year   = new Date().getFullYear();
  const seq    = parseInt(localStorage.getItem('sms_rcp_seq') || '0') + 1;
  localStorage.setItem('sms_rcp_seq', seq);
  return prefix + '-' + year + '-' + String(seq).padStart(5, '0');
  /* e.g.  BFS-RCP-2026-00001 */
};

/* ── 11. ASSET ID GENERATOR ────────────────────────────────── */
window.generateAssetId = function () {
  const year = new Date().getFullYear();
  const seq  = parseInt(localStorage.getItem('sms_ast_seq') || '0') + 1;
  localStorage.setItem('sms_ast_seq', seq);
  return 'BFS-AST-' + year + '-' + String(seq).padStart(4, '0');
  /* e.g.  BFS-AST-2026-0001 */
};

/* ── 12. GRADE CALCULATOR (Uganda Primary) ─────────────────── */
window.GRADE_SCALE = [
  { grade:'D1', min:90, max:100, remarks:'Distinction', points:1 },
  { grade:'D2', min:80, max:89,  remarks:'Distinction', points:2 },
  { grade:'C3', min:70, max:79,  remarks:'Credit',      points:3 },
  { grade:'C4', min:65, max:69,  remarks:'Credit',      points:4 },
  { grade:'C5', min:60, max:64,  remarks:'Credit',      points:5 },
  { grade:'C6', min:55, max:59,  remarks:'Credit',      points:6 },
  { grade:'P7', min:50, max:54,  remarks:'Pass',        points:7 },
  { grade:'P8', min:45, max:49,  remarks:'Pass',        points:8 },
  { grade:'F9', min:0,  max:44,  remarks:'Fail',        points:9 },
];

window.getGrade = function (mark) {
  const m = parseFloat(mark);
  if (isNaN(m)) return { grade: '\u2014', remarks: '\u2014', points: null };
  for (const g of window.GRADE_SCALE) {
    if (m >= g.min && m <= g.max) return g;
  }
  return { grade:'F9', remarks:'Fail', points:9 };
};

/* ── 13. MARK VALIDATION ───────────────────────────────────── */
window.validateMark = function (value, maxMark) {
  const v = parseFloat(value);
  if (isNaN(v))    return { ok:false, msg:'Enter a number' };
  if (v < 0)       return { ok:false, msg:'Mark cannot be negative' };
  if (v > maxMark) return { ok:false, msg:'Mark exceeds maximum of ' + maxMark };
  return { ok:true };
};

/* ── 14. PRINT UTILITY ─────────────────────────────────────── */
window.printSection = function (elId) {
  const el = document.getElementById(elId);
  if (!el) return window.print();
  const win = window.open('', '_blank');
  win.document.write(
    '<!DOCTYPE html><html><head>' +
    '<link rel="stylesheet" href="../assets/sms.css"/>' +
    '<style>body{padding:20px;background:#fff}</style>' +
    '</head><body>' +
    el.innerHTML +
    '</body></html>'
  );
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
};

/* ── 15. REPORT CARD PRINT HEADER ──────────────────────────── */
window.rcHeader = function () {
  return `
  <div style="text-align:center;border-bottom:2px solid #173B63;padding-bottom:14px;margin-bottom:16px">
    <img src="../star logo.png" style="width:64px;height:64px;object-fit:contain;margin:0 auto 8px"/>
    <div style="font-size:1.1rem;font-weight:900;color:#173B63">FIVE STAR MODEL SCHOOL</div>
    <div style="font-size:.75rem;font-style:italic;color:#667085">"Nature for Excellence"</div>
    <div style="font-size:.72rem;color:#667085;margin-top:2px">Kasese District, Uganda</div>
  </div>`;
};

/* ── 16. SHARED SCHOOL INFO FROM PROFILE ───────────────────── */
window.getSchoolInfo = function () {
  return {
    name    : localStorage.getItem('sms_school_name')  || 'Five Star Model School',
    motto   : localStorage.getItem('sms_school_motto') || 'Nature for Excellence',
    address : localStorage.getItem('sms_school_addr')  || 'Kasese District, Uganda',
    phone   : localStorage.getItem('sms_school_phone') || '',
    email   : localStorage.getItem('sms_school_email') || '',
    abbr    : localStorage.getItem('sms_school_abbr')  || 'BFS',
  };
};
window.saveSchoolInfo = function (info) {
  Object.entries(info).forEach(([k, v]) => localStorage.setItem('sms_school_' + k, v));
};

/* ── 17. CURRENT ACADEMIC YEAR / TERM ──────────────────────── */
window.getCurrentPeriod = function () {
  return {
    year : localStorage.getItem('sms_current_year') || '',
    term : localStorage.getItem('sms_current_term') || '',
  };
};

/* ── 18. SHARED DATA STORE (localStorage) ──────────────────── */
/* Each portal reads/writes shared data so portals can cross-reference */
window.SMS = {
  get: function (key)        { try { return JSON.parse(localStorage.getItem('sms_' + key) || 'null'); } catch(e){ return null; } },
  set: function (key, value) { localStorage.setItem('sms_' + key, JSON.stringify(value)); },
  push: function (key, item) {
    const arr = window.SMS.get(key) || [];
    arr.push(item);
    window.SMS.set(key, arr);
    return arr;
  },
  remove: function (key, predicate) {
    const arr = (window.SMS.get(key) || []).filter(x => !predicate(x));
    window.SMS.set(key, arr);
    return arr;
  },
  clear: function (key) { localStorage.removeItem('sms_' + key); }
};

/* ── 19. AUDIT LOG ─────────────────────────────────────────── */
window.addAudit = function (action, record, detail) {
  const sess = window.SMS_SESSION || {};
  window.SMS.push('audit_log', {
    dt     : window.nowTs(),
    user   : sess.fullName || sess.username || 'User',
    role   : sess.role || '—',
    action : action,
    record : record,
    detail : detail,
  });
};

/* ── 20. NOTIFICATION BETWEEN PORTALS ──────────────────────── */
window.sendNotification = function (toRole, title, message, type) {
  window.SMS.push('notifications_' + toRole, {
    id      : Date.now(),
    title   : title,
    message : message,
    type    : type || 'info',
    read    : false,
    date    : window.today(),
  });
};

window.getNotifications = function (role) {
  return window.SMS.get('notifications_' + role) || [];
};

window.markNotifRead = function (role, id) {
  const list = window.getNotifications(role).map(n => n.id === id ? { ...n, read:true } : n);
  window.SMS.set('notifications_' + role, list);
};

/* ── 21. CROSS-PORTAL PUPIL LOOKUP ────────────────────────── */
window.getPupils = function () { return window.SMS.get('pupils') || []; };
window.getPupilById = function (admNo) {
  return window.getPupils().find(p => p.admNo === admNo) || null;
};

/* ── 22. CROSS-PORTAL STAFF LOOKUP ────────────────────────── */
window.getStaff = function () { return window.SMS.get('staff') || []; };

/* ── 23. CROSS-PORTAL PAYMENTS ─────────────────────────────── */
window.getPayments = function () { return window.SMS.get('payments') || []; };
window.getPupilPayments = function (admNo) {
  return window.getPayments().filter(p => p.pupilAdmNo === admNo);
};

/* ── 24. FEE BALANCE CALCULATOR ────────────────────────────── */
window.calcBalance = function (admNo) {
  const pupil = window.getPupilById(admNo);
  if (!pupil) return null;
  const charges  = pupil.totalCharged  || 0;
  const discount = pupil.discount      || 0;
  const paid     = window.getPupilPayments(admNo).reduce((s, p) => s + (p.amount || 0), 0);
  const balance  = charges - paid - discount;
  return { charges, paid, discount, balance };
};

/* ── 25. INPUT VALUE HELPERS ───────────────────────────────── */
window.v    = id  => { const el = document.getElementById(id); return el ? el.value : ''; };
window.setv = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

console.log('%c Five Star Model School SMS %c sidebar.js loaded ✓',
  'background:#173B63;color:#18A999;padding:2px 6px;border-radius:4px;font-weight:700',
  'color:#667085');
