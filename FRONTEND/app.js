/* ============================================
   APP.JS — TeamFinder Shared Logic
   ============================================ */

/* ─── Constants ────────────────────────────── */
const STORAGE_KEYS = {
  SESSION:  'token',
  PROJECTS: 'tf_projects',
  USER:     'tf_user',
};

const PAGES = {
  index:   'index.html',
  login:   'login.html',
  dash:    'dashboard.html',
  find:    'find-team.html',
  create:  'create-project.html',
  details: 'project-details.html',
};

/* ─── Seed Data ─────────────────────────────── */
const SEED_PROJECTS = [
  {
    id: 'p001',
    title: 'AI-Powered Resume Builder',
    description:
      'Build a smart resume generator that tailors content using GPT-4. We need a React frontend, Node.js backend, and OpenAI integration.',
    category: 'AI / Machine Learning',
    status: 'recruiting',
    owner: 'Alex Morgan',
    ownerInitials: 'AM',
    skills: ['React', 'Node.js', 'OpenAI API', 'MongoDB'],
    teamSize: 4,
    currentMembers: 2,
    duration: '3 months',
    createdAt: Date.now() - 86400000 * 5,
    remote: true,
  },
  {
    id: 'p002',
    title: 'Decentralized Freelance Platform',
    description:
      'A Web3 marketplace for freelancers leveraging smart contracts for trustless payments. Looking for Solidity devs and a UI wizard.',
    category: 'Web3 / Blockchain',
    status: 'recruiting',
    owner: 'Priya Sharma',
    ownerInitials: 'PS',
    skills: ['Solidity', 'React', 'Ethers.js', 'Tailwind CSS'],
    teamSize: 5,
    currentMembers: 3,
    duration: '6 months',
    createdAt: Date.now() - 86400000 * 10,
    remote: true,
  },
  {
    id: 'p003',
    title: 'Real-Time Collaborative Whiteboard',
    description:
      'A Figma-like collaborative tool with real-time cursors, infinite canvas, and shape libraries. Built with WebSockets and canvas APIs.',
    category: 'SaaS / Productivity',
    status: 'recruiting',
    owner: 'Chris Liu',
    ownerInitials: 'CL',
    skills: ['TypeScript', 'WebSockets', 'Canvas API', 'Redis'],
    teamSize: 3,
    currentMembers: 1,
    duration: '4 months',
    createdAt: Date.now() - 86400000 * 2,
    remote: true,
  },
  {
    id: 'p004',
    title: 'Open-Source Code Review Bot',
    description:
      'A GitHub App that automatically reviews pull requests using LLMs, gives actionable feedback, and learns from team coding standards.',
    category: 'Developer Tools',
    status: 'active',
    owner: 'Jordan Reed',
    ownerInitials: 'JR',
    skills: ['Python', 'GitHub API', 'LangChain', 'Docker'],
    teamSize: 4,
    currentMembers: 4,
    duration: '2 months',
    createdAt: Date.now() - 86400000 * 20,
    remote: true,
  },
  {
    id: 'p005',
    title: 'Health & Fitness Tracking App',
    description:
      'A mobile-first PWA for tracking workouts, nutrition, and progress with AI-powered insights and social challenges.',
    category: 'Health & Fitness',
    status: 'recruiting',
    owner: 'Samira Khan',
    ownerInitials: 'SK',
    skills: ['React Native', 'Firebase', 'Chart.js', 'OpenAI'],
    teamSize: 3,
    currentMembers: 1,
    duration: '5 months',
    createdAt: Date.now() - 86400000 * 7,
    remote: false,
  },
  {
    id: 'p006',
    title: 'CLI Tool for Cloud Cost Analysis',
    description:
      'A developer CLI that ingests AWS/GCP/Azure billing data and generates cost reports, anomaly alerts, and optimization tips.',
    category: 'Developer Tools',
    status: 'recruiting',
    owner: 'Tomás García',
    ownerInitials: 'TG',
    skills: ['Go', 'AWS SDK', 'Google Cloud', 'Cobra CLI'],
    teamSize: 2,
    currentMembers: 1,
    duration: '2 months',
    createdAt: Date.now() - 86400000 * 1,
    remote: true,
  },
];

/* ─── Storage Helpers ───────────────────────── */
const store = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  remove: (key) => localStorage.removeItem(key),
};

/* ─── Projects ──────────────────────────────── */
const projectsDB = {
  init() {
    if (!store.get(STORAGE_KEYS.PROJECTS)) {
      store.set(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    }
  },
  getAll() {
    return store.get(STORAGE_KEYS.PROJECTS) || [];
  },
  getById(id) {
    return this.getAll().find((p) => p.id === id) || null;
  },
  add(project) {
    const projects = this.getAll();
    projects.unshift(project);
    store.set(STORAGE_KEYS.PROJECTS, projects);
  },
  generateId() {
    return 'p' + Date.now().toString(36).toUpperCase();
  },
};

/* ─── Auth ──────────────────────────────────── */
const auth = {
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },
  getToken() {
    return localStorage.getItem('token');
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('tf_user') || '{}');
    } catch {
      return null;
    }
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tf_user');
    localStorage.removeItem('tf_projects');
  },
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = PAGES.login;
      return false;
    }
    return true;
  },
};

/* ─── Toast ──────────────────────────────────── */
const toast = {
  container: null,
  ensure() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3500) {
    this.ensure();
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span style="font-size:1.1rem;">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;
    this.container.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 350);
    }, duration);
  },
  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur)   { this.show(msg, 'error', dur); },
  info(msg, dur)    { this.show(msg, 'info', dur); },
};

/* ─── URL Params ─────────────────────────────── */
const urlParams = {
  get: (key) => new URLSearchParams(window.location.search).get(key),
};

/* ─── Navbar ─────────────────────────────────── */
function initNavbar() {
  const navbar  = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');

  // Scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
    });

    // Close on link click (mobile)
    mobileMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Highlight active link
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach((link) => {
    if (link.dataset.page === current) link.classList.add('active');
  });

  // Update auth-aware elements
  updateNavAuth();
}

function updateNavAuth() {
  const loggedIn = auth.isLoggedIn();
  const user     = auth.getUser();

  // Show/hide nav items based on auth
  document.querySelectorAll('[data-auth="true"]').forEach((el) => {
    el.style.display = loggedIn ? '' : 'none';
  });
  document.querySelectorAll('[data-auth="false"]').forEach((el) => {
    el.style.display = loggedIn ? 'none' : '';
  });

  // Populate avatar
  const avatarEls = document.querySelectorAll('.nav-user-avatar');
  avatarEls.forEach((el) => {
    if (user) el.textContent = user.initials;
  });

  const nameEls = document.querySelectorAll('.nav-user-name');
  nameEls.forEach((el) => {
    if (user) el.textContent = user.name;
  });
}

/* ─── Project Card Builder ───────────────────── */
function buildProjectCard(project, clickable = true) {
  const pct = Math.round((project.currentMembers / project.teamSize) * 100);
  const skillsHTML = (project.skills || [])
    .slice(0, 4)
    .map((s) => `<span class="badge">${s}</span>`)
    .join('');
  const extra = project.skills && project.skills.length > 4
    ? `<span class="badge badge-info">+${project.skills.length - 4}</span>` : '';

  const statusMap = {
    recruiting: { cls: 'badge-success', label: 'Recruiting' },
    active:     { cls: 'badge-warning', label: 'Active' },
    completed:  { cls: 'badge-info',    label: 'Completed' },
  };
  const s = statusMap[project.status] || statusMap.active;

  const card = document.createElement('div');
  card.className = `card ${clickable ? 'card-clickable' : ''}`;
  if (clickable) {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => {
      window.location.href = `${PAGES.details}?id=${project.id}`;
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') card.click();
    });
  }

  card.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
        <div class="avatar">${project.ownerInitials || '??'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px;">${project.owner || 'Unknown'}</div>
          <h3 style="font-size:1rem;font-weight:700;line-height:1.3;letter-spacing:-0.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${project.title}</h3>
        </div>
      </div>
      <span class="badge ${s.cls}" style="flex-shrink:0;">${s.label}</span>
    </div>
    <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${project.description}</p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">${skillsHTML}${extra}</div>
    <div class="divider" style="margin:12px 0;"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.78rem;color:var(--text-muted);margin-bottom:12px;">
      <div>📂 <span style="color:var(--text-secondary);">${project.category}</span></div>
      <div>⏱ <span style="color:var(--text-secondary);">${project.duration}</span></div>
      <div>👥 <span style="color:var(--text-secondary);">${project.currentMembers}/${project.teamSize} members</span></div>
      <div>${project.remote ? '🌐 Remote' : '📍 On-site'}</div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${pct}%"></div>
    </div>
    <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;text-align:right;">${pct}% filled</div>
  `;
  return card;
}

/* ─── Helpers ────────────────────────────────── */
function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/* ─── Init ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  projectsDB.init();
  initNavbar();
});

// --- LIVE DEPLOYMENT CONNECTION TRACER ---
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM READY - JS RUNNING");
  console.log("Testing API call...");

  try {
    const res = await fetch("https://team-finder-3.onrender.com/api");
    const data = await res.text();
    console.log("API RESPONSE:", data);
  } catch (err) {
    console.error("API ERROR:", err);
  }
});
