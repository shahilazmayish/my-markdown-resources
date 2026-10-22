// Notion Resource Hub - Client Application
(function () {
  'use strict';

  // Application State
  const state = {
    resources: [],
    filteredResources: [],
    categories: [],
    tags: [],
    config: {},
    activeCategory: 'ALL',
    activeTag: 'ALL',
    searchQuery: '',
    currentView: 'grid', // 'grid' | 'board'
    isAdmin: localStorage.getItem('hub_admin') === 'true',
    currentTheme: localStorage.getItem('notion_theme') || 'notion-light',

    // Peek & Drawer System State (Specs 2 & 3)
    peekActive: false,
    peekResourceId: null,
    peekMode: localStorage.getItem('notion_peek_mode') || 'side', // 'side' | 'center' | 'full'
    peekWidth: parseInt(localStorage.getItem('notion_peek_width') || '640', 10),
    isResizing: false
  };

  // DOM Elements
  const el = {
    appLayoutWrapper: document.getElementById('app-layout-wrapper'),
    resourcesContainer: document.getElementById('resources-container'),
    boardContainer: document.getElementById('board-container'),
    categoryChips: document.getElementById('category-chips'),
    tagChips: document.getElementById('tag-chips'),
    searchInput: document.getElementById('search-input'),
    resourceCount: document.getElementById('resource-count'),
    folderPathDisplay: document.getElementById('folder-path-display'),
    adminToggleBtn: document.getElementById('admin-toggle-btn'),
    adminBanner: document.getElementById('admin-banner'),
    newResourceBtn: document.getElementById('new-resource-btn'),
    rescanBtn: document.getElementById('rescan-btn'),
    manageCategoriesBtn: document.getElementById('manage-categories-btn'),
    manageTagsBtn: document.getElementById('manage-tags-btn'),
    changeDirBtn: document.getElementById('change-dir-btn'),
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewBoardBtn: document.getElementById('view-board-btn'),
    viewGraphBtn: document.getElementById('view-graph-btn'),

    // Graph View Elements
    graphContainer: document.getElementById('graph-container'),
    graphCanvas: document.getElementById('graph-canvas'),
    graphTooltip: document.getElementById('graph-tooltip'),
    graphNodesCount: document.getElementById('graph-nodes-count'),
    graphEdgesCount: document.getElementById('graph-edges-count'),
    graphShowTagsCb: document.getElementById('graph-show-tags-cb'),
    graphShowCategoriesCb: document.getElementById('graph-show-categories-cb'),
    graphZoomInBtn: document.getElementById('graph-zoom-in-btn'),
    graphZoomOutBtn: document.getElementById('graph-zoom-out-btn'),
    graphResetBtn: document.getElementById('graph-reset-btn'),

    // Theme Switcher Elements
    themeDropdownContainer: document.getElementById('theme-dropdown-container'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeBtnLabel: document.getElementById('theme-btn-label'),

    // Notion Side Peek & Drawer System Elements
    peekBackdrop: document.getElementById('peek-backdrop'),
    peekDrawer: document.getElementById('notion-peek-drawer'),
    peekResizeHandle: document.getElementById('peek-resize-handle'),
    modeSwitcherContainer: document.getElementById('mode-switcher-container'),
    modeSwitcherBtn: document.getElementById('mode-switcher-btn'),
    currentModeIcon: document.getElementById('current-mode-icon'),
    currentModeLabel: document.getElementById('current-mode-label'),
    peekPrevBtn: document.getElementById('peek-prev-btn'),
    peekNextBtn: document.getElementById('peek-next-btn'),
    peekCounter: document.getElementById('peek-counter'),
    peekFullpageToggleBtn: document.getElementById('peek-fullpage-toggle-btn'),
    peekExpandIcon: document.getElementById('peek-expand-icon'),
    peekEditBtn: document.getElementById('peek-edit-btn'),
    peekCloseBtn: document.getElementById('peek-close-btn'),
    peekCategory: document.getElementById('peek-category'),
    peekTitle: document.getElementById('peek-title'),
    peekFilename: document.getElementById('peek-filename'),
    peekReadingTime: document.getElementById('peek-reading-time'),
    peekUpdated: document.getElementById('peek-updated'),
    peekTags: document.getElementById('peek-tags'),
    peekBody: document.getElementById('peek-body'),

    // Modals
    editorModal: document.getElementById('editor-modal'),
    editorModalTitle: document.getElementById('editor-modal-title'),
    editorForm: document.getElementById('editor-form'),
    editorId: document.getElementById('editor-id'),
    editorTitle: document.getElementById('editor-title'),
    editorCategory: document.getElementById('editor-category'),
    editorNewCategory: document.getElementById('editor-new-category'),
    editorTagsInput: document.getElementById('editor-tags-input'),
    editorTagsContainer: document.getElementById('editor-tags-container'),
    editorDescription: document.getElementById('editor-description'),
    editorBody: document.getElementById('editor-body'),

    tagEditorModal: document.getElementById('tag-editor-modal'),
    tagEditorResourceTitle: document.getElementById('tag-editor-resource-title'),
    tagEditorTagsContainer: document.getElementById('tag-editor-tags-container'),
    tagEditorInput: document.getElementById('tag-editor-input'),
    tagEditorSaveBtn: document.getElementById('tag-editor-save-btn'),

    categoryManagerModal: document.getElementById('category-manager-modal'),
    categoryList: document.getElementById('category-list'),

    tagManagerModal: document.getElementById('tag-manager-modal'),
    tagManagerList: document.getElementById('tag-manager-list'),

    changeDirModal: document.getElementById('change-dir-modal'),
    newDirPathInput: document.getElementById('new-dir-path-input'),
    saveDirBtn: document.getElementById('save-dir-btn'),

    toastContainer: document.getElementById('toast-container')
  };

  // Lucide SVG Icons Dictionary
  const ICONS = {
    sidebar: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>`,
    square: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
    maximize: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>`,
    minimize: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>`
  };

  // Toast Notification
  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- THEME SYSTEM ---
  const THEME_NAMES = {
    'notion-light': 'Light',
    'notion-dark': 'Dark',
    'notion-oled': 'Midnight OLED',
    'notion-charcoal': 'Charcoal',
    'notion-warm': 'Espresso',
    'piszczek': 'Piszczek Terminal'
  };

  function applyTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('notion_theme', theme);
    if (el.themeBtnLabel) {
      el.themeBtnLabel.textContent = THEME_NAMES[theme] || 'Theme';
    }

    // Update active dropdown item
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      if (btn.getAttribute('data-set-theme') === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update graph colors if initialized
    if (typeof graphState !== 'undefined' && graphState.nodes && graphState.nodes.length > 0) {
      for (const n of graphState.nodes) {
        n.color = getCategoryColor(n.category);
      }
      renderGraph();
    }
  }

  el.themeToggleBtn.onclick = (e) => {
    e.stopPropagation();
    el.themeDropdownContainer.classList.toggle('open');
  };

  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.onclick = () => {
      const selected = btn.getAttribute('data-set-theme');
      applyTheme(selected);
      el.themeDropdownContainer.classList.remove('open');
      showToast(`Theme switched to ${THEME_NAMES[selected]}`);
    };
  });

  // --- API CALLS ---
  async function fetchConfig() {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      state.config = data;
      state.categories = data.categories || [];
      state.tags = data.tags || [];
      if (el.folderPathDisplay) {
        el.folderPathDisplay.textContent = data.localmdDir || 'localmd';
      }
      renderCategoryChips();
      renderTagChips();
    } catch (err) {
      console.error('Failed to fetch config:', err);
      showToast('Could not load configuration');
    }
  }

  async function fetchResources() {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      state.resources = data;
      applyFilters();

      // If a peek is already open, refresh its content
      if (state.peekActive && state.peekResourceId) {
        updatePeekContent(state.peekResourceId);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      showToast('Could not load resources');
    }
  }

  async function rescanDirectory() {
    try {
      const res = await fetch('/api/rescan', { method: 'POST' });
      const data = await res.json();
      showToast(`Rescanned ${data.count} markdown files`);
      await fetchConfig();
      await fetchResources();
    } catch (err) {
      showToast('Rescan failed');
    }
  }

  // --- FILTERING & SEARCH ---
  function applyFilters() {
    let list = [...state.resources];

    // Category filter
    if (state.activeCategory !== 'ALL') {
      list = list.filter(r => (r.category || '').toLowerCase() === state.activeCategory.toLowerCase());
    }

    // Tag filter
    if (state.activeTag !== 'ALL') {
      list = list.filter(r => (r.tags || []).map(t => t.toLowerCase()).includes(state.activeTag.toLowerCase()));
    }

    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(r => {
        const titleMatch = (r.title || '').toLowerCase().includes(q);
        const descMatch = (r.description || '').toLowerCase().includes(q);
        const categoryMatch = (r.category || '').toLowerCase().includes(q);
        const tagsMatch = (r.tags || []).some(t => t.toLowerCase().includes(q));
        const bodyMatch = (r.body || '').toLowerCase().includes(q);
        return titleMatch || descMatch || categoryMatch || tagsMatch || bodyMatch;
      });
    }

    state.filteredResources = list;
    el.resourceCount.textContent = `${list.length} resource${list.length === 1 ? '' : 's'}`;

    if (state.currentView === 'grid') {
      el.resourcesContainer.style.display = 'grid';
      el.boardContainer.style.display = 'none';
      if (el.graphContainer) el.graphContainer.style.display = 'none';
      renderGrid();
    } else if (state.currentView === 'board') {
      el.resourcesContainer.style.display = 'none';
      el.boardContainer.style.display = 'flex';
      if (el.graphContainer) el.graphContainer.style.display = 'none';
      renderBoard();
    } else if (state.currentView === 'graph') {
      el.resourcesContainer.style.display = 'none';
      el.boardContainer.style.display = 'none';
      if (el.graphContainer) el.graphContainer.style.display = 'block';
      updateGraphData();
    }

    // Update peek navigation counter if peek is open
    if (state.peekActive) {
      updatePeekNavState();
    }
  }

  // --- RENDERING CHIPS ---
  function renderCategoryChips() {
    const container = el.categoryChips;
    container.innerHTML = '';

    const allChip = document.createElement('div');
    allChip.className = `chip ${state.activeCategory === 'ALL' ? 'active' : ''}`;
    allChip.innerHTML = `<span>All Categories</span> <span class="chip-count">${state.resources.length}</span>`;
    allChip.onclick = () => {
      state.activeCategory = 'ALL';
      renderCategoryChips();
      applyFilters();
    };
    container.appendChild(allChip);

    state.categories.forEach(cat => {
      const count = state.resources.filter(r => (r.category || '').toLowerCase() === cat.toLowerCase()).length;
      const chip = document.createElement('div');
      chip.className = `chip ${state.activeCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`;
      chip.innerHTML = `<span>${cat}</span> <span class="chip-count">${count}</span>`;
      chip.onclick = () => {
        state.activeCategory = (state.activeCategory.toLowerCase() === cat.toLowerCase()) ? 'ALL' : cat;
        renderCategoryChips();
        applyFilters();
      };
      container.appendChild(chip);
    });
  }

  function renderTagChips() {
    const container = el.tagChips;
    container.innerHTML = '';

    const allChip = document.createElement('div');
    allChip.className = `chip ${state.activeTag === 'ALL' ? 'active' : ''}`;
    allChip.innerHTML = `<span>All Tags</span>`;
    allChip.onclick = () => {
      state.activeTag = 'ALL';
      renderTagChips();
      applyFilters();
    };
    container.appendChild(allChip);

    state.tags.forEach(t => {
      const chip = document.createElement('div');
      chip.className = `chip ${state.activeTag.toLowerCase() === t.name.toLowerCase() ? 'active' : ''}`;
      chip.innerHTML = `<span>#${t.name}</span> <span class="chip-count">${t.count}</span>`;
      chip.onclick = () => {
        state.activeTag = (state.activeTag.toLowerCase() === t.name.toLowerCase()) ? 'ALL' : t.name;
        renderTagChips();
        applyFilters();
      };
      container.appendChild(chip);
    });
  }

  window.filterByTag = function (tag) {
    state.activeTag = tag;
    renderTagChips();
    applyFilters();
  };

  // --- SPEC 1: RENDERING GRID WITH NOTION 'OPEN' HOVER BADGE OVERLAY ---
  function renderGrid() {
    const container = el.resourcesContainer;
    container.innerHTML = '';

    if (state.filteredResources.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>No resources found</h3>
          <p>Try adjusting your search query, selecting another tag, or create a new markdown file.</p>
        </div>
      `;
      return;
    }

    state.filteredResources.forEach(res => {
      const card = document.createElement('div');
      const isActivePeek = state.peekActive && state.peekResourceId === res.id;
      card.className = `resource-card ${res.pinned ? 'pinned' : ''} ${isActivePeek ? 'active-peek' : ''}`;
      card.setAttribute('data-id', res.id);

      const tagsHtml = (res.tags || []).map(t => `<span class="chip" onclick="window.filterByTag('${t}'); event.stopPropagation();">#${t}</span>`).join('');

      card.innerHTML = `
        <!-- Notion 'OPEN' badge button overlay on hover -->
        <button class="card-open-badge" title="Open peek" onclick="window.openPeek('${res.id}'); event.stopPropagation();">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" x2="14" y1="3" y2="10"/>
            <line x1="3" x2="10" y1="21" y2="14"/>
          </svg>
          <span>Open</span>
        </button>

        <div class="card-top">
          <span class="card-category">${escapeHtml(res.category || 'General')}</span>
          <span class="card-meta-date">${res.updated || res.date || ''}</span>
        </div>
        <h3 class="card-title">${escapeHtml(res.title)}</h3>
        <p class="card-desc">${escapeHtml(res.description)}</p>
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-footer">
          <span class="card-filename" title="${res.fileName}">${res.fileName}</span>
          <div class="card-admin-actions">
            <button class="btn btn-tertiary btn-sm" onclick="event.stopPropagation(); window.openTagEditor('${res.id}')">Tags</button>
            <button class="btn btn-tertiary btn-sm" onclick="event.stopPropagation(); window.openEditor('${res.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); window.deleteResource('${res.id}')">Delete</button>
          </div>
          <span>${res.readingTime || ''}</span>
        </div>
      `;

      // Clicking either the card itself or the 'OPEN' button opens the peek panel
      card.onclick = () => openPeek(res.id);
      container.appendChild(card);
    });
  }

  function renderBoard() {
    const container = el.boardContainer;
    container.innerHTML = '';

    const categories = state.categories.length > 0 ? state.categories : ['General'];

    categories.forEach(cat => {
      const catResources = state.filteredResources.filter(r => (r.category || '').toLowerCase() === cat.toLowerCase());

      const col = document.createElement('div');
      col.className = 'board-column';

      let cardsHtml = '';
      if (catResources.length === 0) {
        cardsHtml = `<div style="color:var(--color-muted); font-size:13px; text-align:center; padding: 20px 0;">No items</div>`;
      } else {
        cardsHtml = catResources.map(r => `
          <div class="board-card ${state.peekActive && state.peekResourceId === r.id ? 'active-peek' : ''}" onclick="window.openPeek('${r.id}')">
            <!-- Open badge overlay -->
            <button class="card-open-badge" title="Open peek" onclick="window.openPeek('${r.id}'); event.stopPropagation();">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" x2="14" y1="3" y2="10"/>
                <line x1="3" x2="10" y1="21" y2="14"/>
              </svg>
              <span>Open</span>
            </button>
            <div style="font-weight:600; font-size:15px; margin-bottom:4px; padding-right:50px;">${escapeHtml(r.title)}</div>
            <div style="font-size:12px; color:var(--color-muted); margin-bottom:8px;">${r.readingTime} · ${r.tags.length} tags</div>
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              ${r.tags.slice(0, 3).map(t => `<span class="chip" style="font-size:10px; padding:2px 6px;">#${t}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }

      col.innerHTML = `
        <div class="board-col-header">
          <span>${cat}</span>
          <span class="chip-count">${catResources.length}</span>
        </div>
        <div class="board-col-cards">
          ${cardsHtml}
        </div>
      `;

      container.appendChild(col);
    });
  }

  // ==========================================================================
  // INTERNAL WIKILINKS & MARKDOWN LINK HELPERS
  // ==========================================================================
  window.openResourceByTitle = function (title) {
    if (!title) return;
    const clean = title.trim().toLowerCase();
    const match = state.resources.find(r => 
      r.title.toLowerCase() === clean || 
      r.title.toLowerCase().includes(clean) ||
      r.fileName.toLowerCase().replace(/\.md$/i, '') === clean
    );
    if (match) {
      openPeek(match.id);
    } else {
      showToast(`Resource "${title}" not found`);
    }
  };

  window.openResourceByFilename = function (filename) {
    if (!filename) return;
    const clean = filename.split('#')[0].replace(/^(\.\/|\/)/, '').toLowerCase();
    const base = clean.replace(/\.md$/i, '');
    const match = state.resources.find(r => 
      r.fileName.toLowerCase() === clean || 
      r.fileName.toLowerCase().replace(/\.md$/i, '') === base
    );
    if (match) {
      openPeek(match.id);
    } else {
      showToast(`File "${filename}" not found`);
    }
  };

  // ==========================================================================
  // GRAPH VIEW: INTERACTIVE FORCE-DIRECTED GRAPH SIMULATION
  // ==========================================================================
  const graphState = {
    canvas: null,
    ctx: null,
    nodes: [],
    edges: [],
    nodeMap: new Map(),
    rawGraphData: null,
    pan: { x: 0, y: 0 },
    zoom: 1.0,
    hoveredNode: null,
    draggedNode: null,
    isPanning: false,
    dragStart: { x: 0, y: 0 },
    mouseScreen: { x: 0, y: 0 },
    mouseMovedDist: 0,
    alpha: 1.0,
    animId: null,
    isInitialized: false,
    dpr: window.devicePixelRatio || 1
  };

  const CATEGORY_COLORS = {
    'Getting Started': '#06b6d4',
    'Design Systems': '#10b981',
    'Engineering': '#0075de',
    'DevTools': '#8b5cf6',
    'Backend': '#f59e0b',
    'DevOps': '#ec4899',
    'General': '#64748b'
  };

  function getCategoryColor(cat) {
    if (state.currentTheme === 'piszczek') {
      return '#00FF94';
    }
    return CATEGORY_COLORS[cat] || '#0075de';
  }

  function resizeGraphCanvas() {
    if (!el.graphCanvas || !el.graphContainer) return;
    const rect = el.graphContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    graphState.dpr = window.devicePixelRatio || 1;
    el.graphCanvas.width = rect.width * graphState.dpr;
    el.graphCanvas.height = rect.height * graphState.dpr;
    el.graphCanvas.style.width = `${rect.width}px`;
    el.graphCanvas.style.height = `${rect.height}px`;

    // Wake simulation to re-adjust center
    graphState.alpha = Math.max(graphState.alpha, 0.3);
    startGraphLoop();
  }

  async function fetchGraphData() {
    try {
      const res = await fetch('/api/graph');
      const data = await res.json();
      graphState.rawGraphData = data;
      return data;
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
      return { nodes: [], edges: [] };
    }
  }

  async function updateGraphData() {
    if (!graphState.isInitialized) {
      initGraphView();
    }

    if (!graphState.rawGraphData) {
      await fetchGraphData();
    }

    const raw = graphState.rawGraphData || { nodes: [], edges: [] };
    const visibleIds = new Set(state.filteredResources.map(r => r.id));

    // Filter nodes
    const existingMap = new Map(graphState.nodes.map(n => [n.id, n]));
    const rect = el.graphContainer.getBoundingClientRect();
    const cx = (rect.width || 800) / 2;
    const cy = (rect.height || 600) / 2;

    const showTags = el.graphShowTagsCb ? el.graphShowTagsCb.checked : true;
    const showCategories = el.graphShowCategoriesCb ? el.graphShowCategoriesCb.checked : true;

    const visibleNodes = raw.nodes
      .filter(n => visibleIds.has(n.id))
      .map(n => {
        const existing = existingMap.get(n.id);
        const color = getCategoryColor(n.category);
        return {
          id: n.id,
          title: n.title,
          category: n.category,
          tags: n.tags,
          fileName: n.fileName,
          readingTime: n.readingTime,
          date: n.date,
          x: existing ? existing.x : cx + (Math.random() - 0.5) * 300,
          y: existing ? existing.y : cy + (Math.random() - 0.5) * 260,
          vx: existing ? existing.vx * 0.5 : 0,
          vy: existing ? existing.vy * 0.5 : 0,
          radius: 12,
          degree: 0,
          color
        };
      });

    const nodeMap = new Map(visibleNodes.map(n => [n.id, n]));

    // Filter edges
    const activeEdges = [];
    for (const e of raw.edges) {
      if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) continue;
      if (e.type === 'tag' && !showTags) continue;
      if (e.type === 'category' && !showCategories) continue;

      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (src && tgt) {
        src.degree++;
        tgt.degree++;
        activeEdges.push({
          source: src,
          target: tgt,
          type: e.type,
          label: e.label
        });
      }
    }

    // Dynamic node radius based on connection degree
    for (const node of visibleNodes) {
      node.radius = Math.max(9, Math.min(26, 9 + Math.sqrt(node.degree) * 3.5));
    }

    graphState.nodes = visibleNodes;
    graphState.edges = activeEdges;
    graphState.nodeMap = nodeMap;

    if (el.graphNodesCount) {
      el.graphNodesCount.textContent = `${visibleNodes.length} node${visibleNodes.length === 1 ? '' : 's'}`;
    }
    if (el.graphEdgesCount) {
      el.graphEdgesCount.textContent = `${activeEdges.length} link${activeEdges.length === 1 ? '' : 's'}`;
    }

    resizeGraphCanvas();
    graphState.alpha = 1.0;
    startGraphLoop();
  }

  function initGraphView() {
    if (graphState.isInitialized) return;
    graphState.isInitialized = true;

    graphState.canvas = el.graphCanvas;
    graphState.ctx = el.graphCanvas.getContext('2d');

    // Canvas Mouse Listeners
    el.graphCanvas.addEventListener('mousedown', onGraphMouseDown);
    window.addEventListener('mousemove', onGraphMouseMove);
    window.addEventListener('mouseup', onGraphMouseUp);
    el.graphCanvas.addEventListener('wheel', onGraphWheel, { passive: false });

    // Controls
    if (el.graphShowTagsCb) el.graphShowTagsCb.onchange = () => updateGraphData();
    if (el.graphShowCategoriesCb) el.graphShowCategoriesCb.onchange = () => updateGraphData();

    if (el.graphZoomInBtn) {
      el.graphZoomInBtn.onclick = () => {
        zoomGraph(1.25);
      };
    }
    if (el.graphZoomOutBtn) {
      el.graphZoomOutBtn.onclick = () => {
        zoomGraph(0.8);
      };
    }
    if (el.graphResetBtn) {
      el.graphResetBtn.onclick = () => {
        graphState.pan = { x: 0, y: 0 };
        graphState.zoom = 1.0;
        graphState.alpha = 1.0;
        startGraphLoop();
        showToast('Graph view reset');
      };
    }

    // Auto-resize on layout shift (e.g. side peek resize)
    window.addEventListener('resize', resizeGraphCanvas);
    if (window.ResizeObserver && el.graphContainer) {
      const ro = new ResizeObserver(() => resizeGraphCanvas());
      ro.observe(el.graphContainer);
    }
  }

  function zoomGraph(factor, centerScreenX = null, centerScreenY = null) {
    const rect = el.graphContainer.getBoundingClientRect();
    const cx = centerScreenX !== null ? centerScreenX - rect.left : rect.width / 2;
    const cy = centerScreenY !== null ? centerScreenY - rect.top : rect.height / 2;

    const oldZoom = graphState.zoom;
    const newZoom = Math.max(0.2, Math.min(3.5, oldZoom * factor));
    if (newZoom === oldZoom) return;

    // Zoom towards center/mouse position
    graphState.pan.x = cx - ((cx - graphState.pan.x) / oldZoom) * newZoom;
    graphState.pan.y = cy - ((cy - graphState.pan.y) / oldZoom) * newZoom;
    graphState.zoom = newZoom;

    renderGraph();
  }

  // World coordinates converter
  function screenToWorld(sx, sy) {
    const rect = el.graphContainer.getBoundingClientRect();
    const x = sx - rect.left;
    const y = sy - rect.top;
    return {
      x: (x - graphState.pan.x) / graphState.zoom,
      y: (y - graphState.pan.y) / graphState.zoom
    };
  }

  function getNodeAt(screenX, screenY) {
    const world = screenToWorld(screenX, screenY);
    for (let i = graphState.nodes.length - 1; i >= 0; i--) {
      const n = graphState.nodes[i];
      const d = Math.hypot(n.x - world.x, n.y - world.y);
      if (d <= n.radius + 5) {
        return n;
      }
    }
    return null;
  }

  function onGraphMouseDown(e) {
    if (e.button !== 0) return; // primary click only
    const node = getNodeAt(e.clientX, e.clientY);
    graphState.mouseMovedDist = 0;
    graphState.dragStart = { x: e.clientX, y: e.clientY };

    if (node) {
      graphState.draggedNode = node;
      graphState.alpha = Math.max(graphState.alpha, 0.5);
      startGraphLoop();
    } else {
      graphState.isPanning = true;
      el.graphCanvas.style.cursor = 'grabbing';
    }
  }

  function onGraphMouseMove(e) {
    graphState.mouseScreen = { x: e.clientX, y: e.clientY };
    const dx = e.clientX - graphState.dragStart.x;
    const dy = e.clientY - graphState.dragStart.y;
    graphState.mouseMovedDist += Math.hypot(dx, dy);

    if (graphState.draggedNode) {
      const world = screenToWorld(e.clientX, e.clientY);
      graphState.draggedNode.x = world.x;
      graphState.draggedNode.y = world.y;
      graphState.draggedNode.vx = 0;
      graphState.draggedNode.vy = 0;
      graphState.alpha = Math.max(graphState.alpha, 0.4);
      startGraphLoop();
      hideTooltip();
    } else if (graphState.isPanning) {
      graphState.pan.x += e.movementX;
      graphState.pan.y += e.movementY;
      graphState.dragStart = { x: e.clientX, y: e.clientY };
      renderGraph();
      hideTooltip();
    } else {
      // Hover detection
      const node = getNodeAt(e.clientX, e.clientY);
      if (node !== graphState.hoveredNode) {
        graphState.hoveredNode = node;
        renderGraph();
      }

      if (node) {
        el.graphCanvas.style.cursor = 'pointer';
        showTooltip(node, e.clientX, e.clientY);
      } else {
        el.graphCanvas.style.cursor = 'grab';
        hideTooltip();
      }
    }
  }

  function onGraphMouseUp(e) {
    if (graphState.draggedNode) {
      // If minimal drag, treat as click to open peek!
      if (graphState.mouseMovedDist < 8) {
        openPeek(graphState.draggedNode.id);
      }
      graphState.draggedNode = null;
    } else if (graphState.isPanning) {
      graphState.isPanning = false;
      el.graphCanvas.style.cursor = 'grab';
    }
  }

  function onGraphWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    zoomGraph(factor, e.clientX, e.clientY);
  }

  function showTooltip(node, clientX, clientY) {
    if (!el.graphTooltip) return;
    const rect = el.graphContainer.getBoundingClientRect();
    let left = clientX - rect.left + 14;
    let top = clientY - rect.top + 14;

    // Boundary check
    if (left + 260 > rect.width) left = left - 275;
    if (top + 130 > rect.height) top = top - 130;

    const tagsHtml = (node.tags || []).slice(0, 4)
      .map(t => `<span class="graph-tooltip-tag">#${escapeHtml(t)}</span>`)
      .join('');

    el.graphTooltip.innerHTML = `
      <div class="graph-tooltip-category">${escapeHtml(node.category)}</div>
      <div class="graph-tooltip-title">${escapeHtml(node.title)}</div>
      <div class="graph-tooltip-meta">${escapeHtml(node.fileName)} &bull; ${node.degree} links</div>
      <div class="graph-tooltip-tags">${tagsHtml}</div>
    `;

    el.graphTooltip.style.left = `${left}px`;
    el.graphTooltip.style.top = `${top}px`;
    el.graphTooltip.classList.add('visible');
  }

  function hideTooltip() {
    if (el.graphTooltip) {
      el.graphTooltip.classList.remove('visible');
    }
  }

  // --- FORCE SIMULATION LOOP ---
  function startGraphLoop() {
    if (graphState.animId) return;
    function loop() {
      if (state.currentView !== 'graph') {
        graphState.animId = null;
        return;
      }

      if (graphState.alpha > 0.003 || graphState.draggedNode) {
        stepPhysics();
        renderGraph();
        graphState.animId = requestAnimationFrame(loop);
      } else {
        renderGraph();
        graphState.animId = null;
      }
    }
    graphState.animId = requestAnimationFrame(loop);
  }

  function stepPhysics() {
    const nodes = graphState.nodes;
    const edges = graphState.edges;
    const alpha = graphState.alpha;
    const rect = el.graphContainer.getBoundingClientRect();
    const cx = (rect.width || 800) / 2;
    const cy = (rect.height || 600) / 2;

    // 1. Repulsion between all nodes (Coulomb)
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dSq = dx * dx + dy * dy + 100;
        const dist = Math.sqrt(dSq);
        const force = (1600 / dSq) * alpha;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        n1.vx -= fx;
        n1.vy -= fy;
        n2.vx += fx;
        n2.vy += fy;

        // Collision radius resolution
        const minDist = n1.radius + n2.radius + 8;
        if (dist < minDist) {
          const overlap = (minDist - dist) * 0.5 * alpha;
          const ox = (dx / dist) * overlap;
          const oy = (dy / dist) * overlap;
          n1.vx -= ox;
          n1.vy -= oy;
          n2.vx += ox;
          n2.vy += oy;
        }
      }
    }

    // 2. Spring Attraction along Edges (Hooke)
    for (const e of edges) {
      const src = e.source;
      const tgt = e.target;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

      let restLength = 100;
      let stiffness = 0.04;
      if (e.type === 'direct') {
        restLength = 80;
        stiffness = 0.08;
      } else if (e.type === 'category') {
        restLength = 130;
        stiffness = 0.03;
      } else if (e.type === 'tag') {
        restLength = 160;
        stiffness = 0.02;
      }

      const diff = dist - restLength;
      const force = diff * stiffness * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      src.vx += fx;
      src.vy += fy;
      tgt.vx -= fx;
      tgt.vy -= fy;
    }

    // 3. Center Gravity & Position Integration
    for (const n of nodes) {
      if (n === graphState.draggedNode) continue;

      // Gentle pull towards center
      const gx = (cx - n.x) * 0.012 * alpha;
      const gy = (cy - n.y) * 0.012 * alpha;
      n.vx += gx;
      n.vy += gy;

      // Velocity damping
      n.vx *= 0.88;
      n.vy *= 0.88;

      n.x += n.vx;
      n.y += n.vy;
    }

    // Cool down
    graphState.alpha *= 0.992;
  }

  function renderGraph() {
    const ctx = graphState.ctx;
    const canvas = graphState.canvas;
    if (!ctx || !canvas) return;

    const dpr = graphState.dpr;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // High-DPI scaling & Zoom/Pan transform
    ctx.scale(dpr, dpr);
    ctx.translate(graphState.pan.x, graphState.pan.y);
    ctx.scale(graphState.zoom, graphState.zoom);

    const hovered = graphState.hoveredNode;
    const activePeekId = state.peekActive ? state.peekResourceId : null;

    // Set of connected neighbor IDs
    const connectedNodeIds = new Set();
    if (hovered) {
      connectedNodeIds.add(hovered.id);
      for (const e of graphState.edges) {
        if (e.source.id === hovered.id) connectedNodeIds.add(e.target.id);
        if (e.target.id === hovered.id) connectedNodeIds.add(e.source.id);
      }
    }

    // Is dark theme?
    const isDark = state.currentTheme !== 'notion-light';
    const isPiszczek = state.currentTheme === 'piszczek';

    // 1. Draw Edges
    for (const e of graphState.edges) {
      const isConnectedToHover = hovered && (e.source.id === hovered.id || e.target.id === hovered.id);
      const isDimmed = hovered && !isConnectedToHover;

      ctx.beginPath();
      ctx.moveTo(e.source.x, e.source.y);
      ctx.lineTo(e.target.x, e.target.y);

      if (isConnectedToHover) {
        ctx.strokeStyle = isPiszczek ? '#00FF94' : '#0075de';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.9;
      } else if (isDimmed) {
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.2;
      } else {
        if (e.type === 'direct') {
          ctx.strokeStyle = isPiszczek ? 'rgba(0, 255, 148, 0.5)' : (isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 117, 222, 0.4)');
          ctx.lineWidth = 1.6;
          ctx.setLineDash([]);
        } else if (e.type === 'category') {
          ctx.strokeStyle = isPiszczek ? 'rgba(0, 255, 148, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)');
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
        } else {
          // tag
          ctx.strokeStyle = isPiszczek ? 'rgba(0, 255, 148, 0.15)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
        }
        ctx.globalAlpha = 0.7;
      }

      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;

    // 2. Draw Nodes
    for (const n of graphState.nodes) {
      const isHovered = n === hovered;
      const isConnected = !hovered || connectedNodeIds.has(n.id);
      const isActivePeek = n.id === activePeekId;

      ctx.save();
      ctx.globalAlpha = isConnected ? 1.0 : 0.18;

      // Outer glow / active ring
      if (isActivePeek || isHovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = isPiszczek ? 'rgba(0, 255, 148, 0.25)' : 'rgba(0, 117, 222, 0.2)';
        ctx.fill();

        ctx.strokeStyle = isPiszczek ? '#00FF94' : '#0075de';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Base Node Circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();

      ctx.strokeStyle = isDark ? '#191919' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node Title Label
      ctx.font = '500 11px NotionInter, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const labelY = n.y + n.radius + 5;
      const text = n.title.length > 24 ? n.title.slice(0, 22) + '...' : n.title;

      if (isConnected) {
        // Subtle text background pill
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(n.x - textWidth / 2 - 4, labelY - 1, textWidth + 8, 15);

        ctx.fillStyle = isHovered ? (isPiszczek ? '#00FF94' : '#0075de') : (isDark ? '#f0f0f0' : '#111111');
        if (isHovered) ctx.font = '700 11px NotionInter, -apple-system, sans-serif';
        ctx.fillText(text, n.x, labelY);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================================
  // SPECS 2 & 3: NOTION RESIZABLE SIDE PEEK DRAWER & 3 MODES
  // ==========================================================================

  // Apply peek width and layout margin
  function setPeekWidth(widthPx) {
    const minWidth = 320;
    const maxWidth = Math.round(window.innerWidth * 0.8);
    const clamped = Math.max(minWidth, Math.min(maxWidth, widthPx));

    state.peekWidth = clamped;
    localStorage.setItem('notion_peek_width', clamped.toString());

    document.documentElement.style.setProperty('--side-peek-width', `${clamped}px`);

    // Dynamically adjust right margin of main layout container if side peek is active
    if (state.peekActive && state.peekMode === 'side') {
      document.documentElement.style.setProperty('--main-margin-right', `${clamped}px`);
    } else {
      document.documentElement.style.setProperty('--main-margin-right', '0px');
    }

    if (state.currentView === 'graph') {
      resizeGraphCanvas();
    }
  }

  // Set Peek Mode ('side' | 'center' | 'full')
  function setPeekMode(mode) {
    state.peekMode = mode;
    localStorage.setItem('notion_peek_mode', mode);

    el.peekDrawer.classList.remove('mode-side', 'mode-center', 'mode-full');
    el.peekDrawer.classList.add(`mode-${mode}`);

    // Update Mode Switcher button label and icon
    if (mode === 'side') {
      el.currentModeIcon.innerHTML = ICONS.sidebar;
      el.currentModeLabel.textContent = 'Side peek';
      el.peekBackdrop.classList.remove('visible');
      setPeekWidth(state.peekWidth);
      el.peekExpandIcon.innerHTML = ICONS.maximize;
    } else if (mode === 'center') {
      el.currentModeIcon.innerHTML = ICONS.square;
      el.currentModeLabel.textContent = 'Center peek';
      if (state.peekActive) el.peekBackdrop.classList.add('visible');
      document.documentElement.style.setProperty('--main-margin-right', '0px');
      el.peekExpandIcon.innerHTML = ICONS.maximize;
    } else if (mode === 'full') {
      el.currentModeIcon.innerHTML = ICONS.maximize;
      el.currentModeLabel.textContent = 'Full page';
      el.peekBackdrop.classList.remove('visible');
      document.documentElement.style.setProperty('--main-margin-right', '0px');
      el.peekExpandIcon.innerHTML = ICONS.minimize;
    }

    // Update active state in mode dropdown menu
    document.querySelectorAll('[data-peek-mode]').forEach(btn => {
      if (btn.getAttribute('data-peek-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    el.modeSwitcherContainer.classList.remove('open');
  }

  // Open Peek with active resource
  function openPeek(resourceId) {
    const res = state.resources.find(r => r.id === resourceId);
    if (!res) return;

    state.peekActive = true;
    state.peekResourceId = resourceId;

    updatePeekContent(resourceId);

    // Apply layout mode
    setPeekMode(state.peekMode);

    el.peekDrawer.classList.add('open');

    if (state.peekMode === 'center') {
      el.peekBackdrop.classList.add('visible');
    }

    // Highlight card in grid/board
    document.querySelectorAll('.resource-card, .board-card').forEach(c => {
      if (c.getAttribute('data-id') === resourceId) {
        c.classList.add('active-peek');
      } else {
        c.classList.remove('active-peek');
      }
    });

    if (state.currentView === 'graph') {
      resizeGraphCanvas();
      renderGraph();
    }
  }

  window.openPeek = openPeek;

  // Close Peek
  function closePeek() {
    state.peekActive = false;
    state.peekResourceId = null;

    el.peekDrawer.classList.remove('open');
    el.peekBackdrop.classList.remove('visible');
    document.documentElement.style.setProperty('--main-margin-right', '0px');

    document.querySelectorAll('.active-peek').forEach(c => c.classList.remove('active-peek'));

    if (state.currentView === 'graph') {
      resizeGraphCanvas();
      renderGraph();
    }
  }

  window.closePeek = closePeek;

  // Update content inside peek drawer
  function updatePeekContent(resourceId) {
    const res = state.resources.find(r => r.id === resourceId);
    if (!res) return;

    el.peekCategory.textContent = res.category || 'General';
    el.peekTitle.textContent = res.title;
    el.peekFilename.textContent = res.fileName;
    el.peekReadingTime.textContent = res.readingTime;
    el.peekUpdated.textContent = `Updated ${res.updated || res.date}`;

    // Tags
    el.peekTags.innerHTML = (res.tags || []).map(t => `
      <span class="chip" onclick="window.filterByTag('${t}')">#${t}</span>
    `).join('');

    // Markdown Body
    if (window.marked && typeof window.marked.parse === 'function') {
      el.peekBody.innerHTML = window.marked.parse(res.body);
    } else {
      el.peekBody.textContent = res.body;
    }

    updatePeekNavState();
  }

  // Update Next/Prev buttons state and counter
  function updatePeekNavState() {
    const list = state.filteredResources;
    const currentIndex = list.findIndex(r => r.id === state.peekResourceId);

    if (currentIndex === -1) {
      el.peekPrevBtn.disabled = true;
      el.peekNextBtn.disabled = true;
      el.peekCounter.textContent = '1 of 1';
      return;
    }

    el.peekCounter.textContent = `${currentIndex + 1} of ${list.length}`;
    el.peekPrevBtn.disabled = currentIndex <= 0;
    el.peekNextBtn.disabled = currentIndex >= list.length - 1;
  }

  function navigatePeek(direction) {
    const list = state.filteredResources;
    if (list.length === 0) return;

    let currentIndex = list.findIndex(r => r.id === state.peekResourceId);
    if (currentIndex === -1) currentIndex = 0;

    let targetIndex = currentIndex + direction;
    if (targetIndex >= 0 && targetIndex < list.length) {
      openPeek(list[targetIndex].id);
    }
  }

  el.peekPrevBtn.onclick = () => navigatePeek(-1);
  el.peekNextBtn.onclick = () => navigatePeek(1);

  // Full page quick toggle button
  el.peekFullpageToggleBtn.onclick = () => {
    if (state.peekMode === 'full') {
      setPeekMode('side');
    } else {
      setPeekMode('full');
    }
  };

  // Close Peek Button & Backdrop Click
  el.peekCloseBtn.onclick = closePeek;
  el.peekBackdrop.onclick = closePeek;

  // Edit in Admin button
  el.peekEditBtn.onclick = () => {
    if (state.peekResourceId) {
      openEditor(state.peekResourceId);
    }
  };

  // Mode Switcher Dropdown Click
  el.modeSwitcherBtn.onclick = (e) => {
    e.stopPropagation();
    el.modeSwitcherContainer.classList.toggle('open');
  };

  document.querySelectorAll('[data-peek-mode]').forEach(btn => {
    btn.onclick = () => {
      const mode = btn.getAttribute('data-peek-mode');
      setPeekMode(mode);
    };
  });

  // --- HORIZONTAL DRAG RESIZING FOR SIDE PEEK ---
  let startX = 0;
  let startWidth = 0;

  el.peekResizeHandle.addEventListener('mousedown', (e) => {
    if (state.peekMode !== 'side') return;
    state.isResizing = true;
    startX = e.clientX;
    startWidth = state.peekWidth;

    document.body.classList.add('resizing-active');

    const onMouseMove = (ev) => {
      if (!state.isResizing) return;
      // Dragging left increases width, dragging right decreases width
      const delta = startX - ev.clientX;
      const newWidth = startWidth + delta;
      setPeekWidth(newWidth);
    };

    const onMouseUp = () => {
      state.isResizing = false;
      document.body.classList.remove('resizing-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  // Window resize listener to keep side peek within 80% screen width
  window.addEventListener('resize', () => {
    if (state.peekActive && state.peekMode === 'side') {
      setPeekWidth(state.peekWidth);
    }
  });

  // --- EDITOR MODAL (Admin) ---
  let currentEditorTags = [];

  function renderEditorTags() {
    el.editorTagsContainer.querySelectorAll('.tag-badge').forEach(b => b.remove());
    currentEditorTags.forEach((t, index) => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.innerHTML = `#${t} <span class="tag-badge-remove">&times;</span>`;
      badge.querySelector('.tag-badge-remove').onclick = () => {
        currentEditorTags.splice(index, 1);
        renderEditorTags();
      };
      el.editorTagsContainer.insertBefore(badge, el.editorTagsInput);
    });
  }

  function setupTagInput(inputEl, tagsArray, renderFn) {
    inputEl.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = inputEl.value.trim().replace(/^#/, '').toLowerCase();
        if (val && !tagsArray.includes(val)) {
          tagsArray.push(val);
          renderFn();
        }
        inputEl.value = '';
      } else if (e.key === 'Backspace' && inputEl.value === '' && tagsArray.length > 0) {
        tagsArray.pop();
        renderFn();
      }
    };
  }

  function openEditor(id = null) {
    if (!state.isAdmin) {
      promptAdminAccess(() => openEditor(id));
      return;
    }

    // Populate category dropdown
    el.editorCategory.innerHTML = '<option value="">-- Select Category --</option>';
    state.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      el.editorCategory.appendChild(opt);
    });
    el.editorCategory.innerHTML += '<option value="__NEW__">+ Create New Category...</option>';

    if (id) {
      const res = state.resources.find(r => r.id === id);
      if (!res) return;
      el.editorModalTitle.textContent = 'Edit Resource';
      el.editorId.value = res.id;
      el.editorTitle.value = res.title;
      el.editorCategory.value = res.category || '';
      el.editorNewCategory.style.display = 'none';
      el.editorNewCategory.value = '';
      el.editorDescription.value = res.description || '';
      el.editorBody.value = res.body || '';
      currentEditorTags = [...(res.tags || [])];
    } else {
      el.editorModalTitle.textContent = 'Create New Resource';
      el.editorId.value = '';
      el.editorTitle.value = '';
      el.editorCategory.value = state.categories[0] || 'General';
      el.editorNewCategory.style.display = 'none';
      el.editorNewCategory.value = '';
      el.editorDescription.value = '';
      el.editorBody.value = '# New Resource\n\nWrite your markdown notes here...';
      currentEditorTags = [];
    }

    renderEditorTags();
    setupTagInput(el.editorTagsInput, currentEditorTags, renderEditorTags);
    el.editorModal.classList.add('open');
  }

  window.openEditor = openEditor;

  el.editorCategory.onchange = () => {
    if (el.editorCategory.value === '__NEW__') {
      el.editorNewCategory.style.display = 'block';
      el.editorNewCategory.focus();
    } else {
      el.editorNewCategory.style.display = 'none';
    }
  };

  el.editorForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = el.editorId.value;
    let category = el.editorCategory.value;
    if (category === '__NEW__') {
      category = el.editorNewCategory.value.trim() || 'General';
    }

    const payload = {
      title: el.editorTitle.value.trim(),
      category: category,
      tags: currentEditorTags,
      description: el.editorDescription.value.trim(),
      body: el.editorBody.value
    };

    try {
      if (id) {
        const res = await fetch(`/api/resources/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update');
        showToast('Resource updated successfully');
      } else {
        const res = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create');
        showToast('Resource created successfully in localmd');
      }

      closeAllModals();
      await fetchConfig();
      await fetchResources();
    } catch (err) {
      showToast('Error saving resource: ' + err.message);
    }
  };

  // --- TAG QUICK EDITOR (Admin) ---
  let currentTagEditingResourceId = null;
  let quickEditorTags = [];

  function renderQuickEditorTags() {
    el.tagEditorTagsContainer.querySelectorAll('.tag-badge').forEach(b => b.remove());
    quickEditorTags.forEach((t, idx) => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.innerHTML = `#${t} <span class="tag-badge-remove">&times;</span>`;
      badge.querySelector('.tag-badge-remove').onclick = () => {
        quickEditorTags.splice(idx, 1);
        renderQuickEditorTags();
      };
      el.tagEditorTagsContainer.insertBefore(badge, el.tagEditorInput);
    });
  }

  window.openTagEditor = function (id) {
    if (!state.isAdmin) {
      promptAdminAccess(() => window.openTagEditor(id));
      return;
    }

    const res = state.resources.find(r => r.id === id);
    if (!res) return;

    currentTagEditingResourceId = id;
    el.tagEditorResourceTitle.textContent = res.title;
    quickEditorTags = [...(res.tags || [])];

    renderQuickEditorTags();
    setupTagInput(el.tagEditorInput, quickEditorTags, renderQuickEditorTags);
    el.tagEditorModal.classList.add('open');
  };

  el.tagEditorSaveBtn.onclick = async () => {
    if (!currentTagEditingResourceId) return;
    try {
      const res = await fetch(`/api/resources/${currentTagEditingResourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: quickEditorTags })
      });
      if (!res.ok) throw new Error('Save failed');
      showToast('Tags updated');
      closeAllModals();
      await fetchConfig();
      await fetchResources();
    } catch (err) {
      showToast(err.message);
    }
  };

  // --- DELETE RESOURCE ---
  window.deleteResource = async function (id) {
    if (!state.isAdmin) {
      promptAdminAccess(() => window.deleteResource(id));
      return;
    }

    const res = state.resources.find(r => r.id === id);
    if (!res) return;

    if (!confirm(`Are you sure you want to delete "${res.title}" (${res.fileName})?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      showToast(`Deleted ${res.fileName}`);
      if (state.peekActive && state.peekResourceId === id) {
        closePeek();
      }
      await fetchConfig();
      await fetchResources();
    } catch (err) {
      showToast('Error deleting: ' + err.message);
    }
  };

  // --- CATEGORY MANAGER (Admin) ---
  function openCategoryManager() {
    if (!state.isAdmin) {
      promptAdminAccess(openCategoryManager);
      return;
    }

    const list = el.categoryList;
    list.innerHTML = '';

    state.categories.forEach(cat => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--color-border);';
      row.innerHTML = `
        <span style="font-weight:500;">${escapeHtml(cat)}</span>
        <button class="btn btn-tertiary btn-sm">Rename</button>
      `;
      row.querySelector('button').onclick = async () => {
        const newName = prompt(`Rename category "${cat}" to:`, cat);
        if (newName && newName.trim() && newName.trim() !== cat) {
          try {
            const res = await fetch('/api/categories/rename', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldCategory: cat, newCategory: newName.trim() })
            });
            const data = await res.json();
            showToast(`Updated ${data.updatedCount} files`);
            closeAllModals();
            await fetchConfig();
            await fetchResources();
          } catch (err) {
            showToast('Error: ' + err.message);
          }
        }
      };
      list.appendChild(row);
    });

    el.categoryManagerModal.classList.add('open');
  }

  // --- TAG MANAGER (Admin) ---
  function openTagManager() {
    if (!state.isAdmin) {
      promptAdminAccess(openTagManager);
      return;
    }

    const list = el.tagManagerList;
    list.innerHTML = '';

    state.tags.forEach(t => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--color-border);';
      row.innerHTML = `
        <span><strong>#${escapeHtml(t.name)}</strong> <span style="color:var(--color-muted); font-size:12px;">(${t.count} files)</span></span>
        <button class="btn btn-tertiary btn-sm">Rename</button>
      `;
      row.querySelector('button').onclick = async () => {
        const newName = prompt(`Rename tag "#${t.name}" to:`, t.name);
        if (newName && newName.trim() && newName.trim().toLowerCase() !== t.name) {
          try {
            const res = await fetch('/api/tags/rename', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldTag: t.name, newTag: newName.trim().toLowerCase() })
            });
            const data = await res.json();
            showToast(`Renamed tag across ${data.updatedCount} files`);
            closeAllModals();
            await fetchConfig();
            await fetchResources();
          } catch (err) {
            showToast('Error: ' + err.message);
          }
        }
      };
      list.appendChild(row);
    });

    el.tagManagerModal.classList.add('open');
  }

  // --- ADMIN MODE TOGGLE ---
  function updateAdminUI() {
    if (state.isAdmin) {
      document.body.classList.add('admin-mode');
      el.adminToggleBtn.classList.add('active');
      el.adminToggleBtn.querySelector('.text').textContent = 'Admin Mode: ON';
      el.adminBanner.classList.add('visible');
    } else {
      document.body.classList.remove('admin-mode');
      el.adminToggleBtn.classList.remove('active');
      el.adminToggleBtn.querySelector('.text').textContent = 'Admin Mode';
      el.adminBanner.classList.remove('visible');
    }
  }

  function promptAdminAccess(callback) {
    const pwd = prompt('Enter Admin Password (default: admin):');
    if (pwd === null) return;

    fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          state.isAdmin = true;
          localStorage.setItem('hub_admin', 'true');
          updateAdminUI();
          showToast('Admin Mode unlocked');
          if (callback) callback();
        } else {
          showToast('Incorrect Admin Password');
        }
      })
      .catch(() => showToast('Verification error'));
  }

  el.adminToggleBtn.onclick = () => {
    if (state.isAdmin) {
      state.isAdmin = false;
      localStorage.setItem('hub_admin', 'false');
      updateAdminUI();
      showToast('Exited Admin Mode');
    } else {
      promptAdminAccess();
    }
  };

  // --- DIRECTORY CHANGE (Admin) ---
  function openChangeDir() {
    if (!state.isAdmin) {
      promptAdminAccess(openChangeDir);
      return;
    }
    el.newDirPathInput.value = state.config.localmdDir || '';
    el.changeDirModal.classList.add('open');
  }

  el.saveDirBtn.onclick = async () => {
    const newPath = el.newDirPathInput.value.trim();
    if (!newPath) return;

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localmdDir: newPath })
      });
      if (!res.ok) throw new Error('Failed to update directory');
      showToast('Markdown directory updated');
      closeAllModals();
      await fetchConfig();
      await fetchResources();
    } catch (err) {
      showToast(err.message);
    }
  };

  // --- MODAL UTILS ---
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    el.themeDropdownContainer.classList.remove('open');
    el.modeSwitcherContainer.classList.remove('open');
  }

  document.querySelectorAll('.modal-close-btn, [data-close-modal]').forEach(btn => {
    btn.onclick = closeAllModals;
  });

  window.onclick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeAllModals();
    }
    if (!el.themeDropdownContainer.contains(e.target)) {
      el.themeDropdownContainer.classList.remove('open');
    }
    if (!el.modeSwitcherContainer.contains(e.target)) {
      el.modeSwitcherContainer.classList.remove('open');
    }
  };

  // --- KEYBOARD SHORTCUTS ---
  window.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

    if (e.key === '/' && !isTyping && !document.querySelector('.modal-overlay.open')) {
      e.preventDefault();
      el.searchInput.focus();
    } else if (e.key === 'Escape') {
      if (document.querySelector('.modal-overlay.open')) {
        closeAllModals();
      } else if (state.peekActive) {
        closePeek();
      }
    } else if (!isTyping && state.peekActive) {
      // Navigate next/prev with j/k or arrows
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j') {
        navigatePeek(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k') {
        navigatePeek(-1);
      }
    }
  });

  // Search input handler
  el.searchInput.oninput = () => {
    state.searchQuery = el.searchInput.value;
    applyFilters();
  };

  // View switchers
  el.viewGridBtn.onclick = () => {
    state.currentView = 'grid';
    el.viewGridBtn.classList.add('active');
    el.viewBoardBtn.classList.remove('active');
    if (el.viewGraphBtn) el.viewGraphBtn.classList.remove('active');
    applyFilters();
  };

  el.viewBoardBtn.onclick = () => {
    state.currentView = 'board';
    el.viewBoardBtn.classList.add('active');
    el.viewGridBtn.classList.remove('active');
    if (el.viewGraphBtn) el.viewGraphBtn.classList.remove('active');
    applyFilters();
  };

  if (el.viewGraphBtn) {
    el.viewGraphBtn.onclick = () => {
      state.currentView = 'graph';
      el.viewGraphBtn.classList.add('active');
      el.viewGridBtn.classList.remove('active');
      el.viewBoardBtn.classList.remove('active');
      applyFilters();
    };
  }

  // Buttons
  el.newResourceBtn.onclick = () => openEditor();
  el.rescanBtn.onclick = rescanDirectory;
  el.manageCategoriesBtn.onclick = openCategoryManager;
  el.manageTagsBtn.onclick = openTagManager;
  el.changeDirBtn.onclick = openChangeDir;

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- INITIALIZATION ---
  async function init() {
    applyTheme(state.currentTheme);
    setPeekWidth(state.peekWidth);
    updateAdminUI();
    await fetchConfig();
    await fetchResources();
  }

  init();

})();
