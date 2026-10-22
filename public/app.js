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
    graphZoomInBtn: document.getElementById('graph-zoom-in-btn'),
    graphZoomOutBtn: document.getElementById('graph-zoom-out-btn'),
    graphResetBtn: document.getElementById('graph-reset-btn'),

    // Obsidian Floating Graph Controls Elements
    graphSettingsPanel: document.getElementById('graph-settings-panel'),
    graphPanelHeader: document.getElementById('graph-panel-header'),
    graphPanelToggleBtn: document.getElementById('graph-panel-toggle-btn'),
    graphPanelCloseBtn: document.getElementById('graph-panel-close-btn'),
    graphShowLabelsCb: document.getElementById('graph-show-labels-cb'),
    graphColorCategoryCb: document.getElementById('graph-color-category-cb'),
    graphShowCategoriesCb: document.getElementById('graph-show-categories-cb'),
    graphShowTagsCb: document.getElementById('graph-show-tags-cb'),
    graphNodeSizeSlider: document.getElementById('graph-node-size-slider'),
    graphNodeSizeVal: document.getElementById('graph-node-size-val'),
    graphChargeSlider: document.getElementById('graph-charge-slider'),
    graphChargeVal: document.getElementById('graph-charge-val'),
    graphLinkDistSlider: document.getElementById('graph-link-dist-slider'),
    graphLinkDistVal: document.getElementById('graph-link-dist-val'),
    graphLinkStrengthSlider: document.getElementById('graph-link-strength-slider'),
    graphLinkStrengthVal: document.getElementById('graph-link-strength-val'),
    graphGravitySlider: document.getElementById('graph-gravity-slider'),
    graphGravityVal: document.getElementById('graph-gravity-val'),
    graphResetForcesBtn: document.getElementById('graph-reset-forces-btn'),
    graphReheatBtn: document.getElementById('graph-reheat-btn'),

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

  // --- KANBAN BOARD DRAG & DROP AND COLUMN HELPERS ---
  let isDraggingBoardCard = false;
  window.__boardDraggedId = null;

  window.handleBoardDragStart = function (e, id) {
    isDraggingBoardCard = true;
    window.__boardDraggedId = id;
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    }
    const card = e.currentTarget;
    setTimeout(() => {
      if (card) card.classList.add('dragging');
    }, 0);
  };

  window.handleBoardDragEnd = function (e) {
    window.__boardDraggedId = null;
    document.querySelectorAll('.board-card.dragging').forEach(c => c.classList.remove('dragging'));
    document.querySelectorAll('.board-column.drag-over').forEach(c => c.classList.remove('drag-over'));
    setTimeout(() => {
      isDraggingBoardCard = false;
    }, 80);
  };

  window.handleBoardCardClick = function (e, id) {
    if (isDraggingBoardCard) return;
    window.openPeek(id);
  };

  window.handleBoardColDragOver = function (e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };

  window.handleBoardColDragEnter = function (e) {
    e.preventDefault();
    const col = e.currentTarget;
    if (col && col.classList.contains('board-column')) {
      col.classList.add('drag-over');
    }
  };

  window.handleBoardColDragLeave = function (e) {
    const col = e.currentTarget;
    if (col && !col.contains(e.relatedTarget)) {
      col.classList.remove('drag-over');
    }
  };

  window.handleBoardColDrop = async function (e, targetCategory) {
    e.preventDefault();
    const col = e.currentTarget;
    if (col) col.classList.remove('drag-over');

    const id = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || window.__boardDraggedId;
    if (!id || !targetCategory) return;
    await window.moveResourceToCategory(id, targetCategory);
  };

  window.moveResourceToCategory = async function (id, targetCategory) {
    const res = state.resources.find(r => r.id === id);
    if (!res) return;

    const currentCat = res.category || 'General';
    if (currentCat.toLowerCase() === targetCategory.toLowerCase()) {
      return; // Dropped in the same column
    }

    const previousCategory = res.category;
    // Optimistic UI update
    res.category = targetCategory;
    applyFilters();

    try {
      const resp = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: targetCategory })
      });

      if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status}`);
      }

      showToast(`Moved "${res.title}" to ${targetCategory}`);
      await fetchConfig();
      await fetchResources();
    } catch (err) {
      console.error('Failed to move resource:', err);
      // Revert optimistic update
      res.category = previousCategory;
      applyFilters();
      showToast('Failed to update category');
    }
  };

  window.quickAddResourceInBoard = function (cat) {
    openEditor(null, cat);
  };

  window.toggleBoardColumnMenu = function (btn, e) {
    if (e) e.stopPropagation();
    const actions = btn.closest('.board-col-actions');
    if (!actions) return;
    const wasOpen = actions.classList.contains('open');
    document.querySelectorAll('.board-col-actions.open').forEach(el => el.classList.remove('open'));
    if (!wasOpen) {
      actions.classList.add('open');
    }
  };

  window.renameBoardCategory = async function (cat) {
    document.querySelectorAll('.board-col-actions.open').forEach(el => el.classList.remove('open'));
    if (!state.isAdmin) {
      promptAdminAccess(() => window.renameBoardCategory(cat));
      return;
    }

    const newName = prompt(`Rename category "${cat}" to:`, cat);
    if (newName && newName.trim() && newName.trim() !== cat) {
      try {
        const res = await fetch('/api/categories/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldCategory: cat, newCategory: newName.trim() })
        });
        const data = await res.json();
        showToast(`Renamed "${cat}" to "${newName.trim()}" (${data.updatedCount} files)`);
        await fetchConfig();
        await fetchResources();
      } catch (err) {
        showToast('Failed to rename category');
      }
    }
  };

  window.deleteBoardCategory = async function (cat) {
    document.querySelectorAll('.board-col-actions.open').forEach(el => el.classList.remove('open'));
    if (!state.isAdmin) {
      promptAdminAccess(() => window.deleteBoardCategory(cat));
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat}"?\nAny resources inside it will be moved to "General".`)) {
      return;
    }

    try {
      const res = await fetch('/api/categories/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, fallbackCategory: 'General' })
      });
      const data = await res.json();
      showToast(`Deleted category "${cat}" (${data.updatedCount} files moved to General)`);
      await fetchConfig();
      await fetchResources();
    } catch (err) {
      showToast('Failed to delete category');
    }
  };

  // Close open board column menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.board-col-actions')) {
      document.querySelectorAll('.board-col-actions.open').forEach(el => el.classList.remove('open'));
    }
  });

  function renderBoard() {
    const container = el.boardContainer;
    container.innerHTML = '';

    const categorySet = new Set(state.categories);
    state.resources.forEach(r => {
      if (r.category) categorySet.add(r.category);
    });
    let categories = Array.from(categorySet);
    if (categories.length === 0) categories = ['General'];

    if (state.activeCategory && state.activeCategory !== 'ALL') {
      categories = categories.filter(c => c.toLowerCase() === state.activeCategory.toLowerCase());
      if (categories.length === 0) categories = [state.activeCategory];
    }

    categories.forEach(cat => {
      const catResources = state.filteredResources.filter(r => (r.category || 'General').toLowerCase() === cat.toLowerCase());

      const col = document.createElement('div');
      col.className = 'board-column';
      col.setAttribute('data-category', cat);

      col.ondragover = window.handleBoardColDragOver;
      col.ondragenter = window.handleBoardColDragEnter;
      col.ondragleave = window.handleBoardColDragLeave;
      col.ondrop = (e) => window.handleBoardColDrop(e, cat);

      let cardsHtml = '';
      if (catResources.length === 0) {
        cardsHtml = `
          <div class="board-empty-col">
            No documents
            <div style="font-size:11px; opacity:0.75; margin-top:4px;">Drag cards here or click + New</div>
          </div>
        `;
      } else {
        cardsHtml = catResources.map(r => `
          <div class="board-card ${state.peekActive && state.peekResourceId === r.id ? 'active-peek' : ''}"
               data-id="${r.id}"
               draggable="true"
               ondragstart="window.handleBoardDragStart(event, '${r.id}')"
               ondragend="window.handleBoardDragEnd(event)"
               onclick="window.handleBoardCardClick(event, '${r.id}')">
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
            <div class="board-card-title">${escapeHtml(r.title)}</div>
            <div class="board-card-meta">${escapeHtml(r.readingTime || '1 min read')} · ${(r.tags || []).length} tags</div>
            <div class="board-card-tags flex-wrap gap-1.5">
              ${(r.tags || []).map(t => `<span class="chip" title="#${escapeHtml(t)}" onclick="window.filterByTag('${escapeHtml(t)}'); event.stopPropagation();">#${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }

      col.innerHTML = `
        <div class="board-col-header">
          <div class="board-col-title-group" title="${escapeHtml(cat)}">
            <span class="board-col-title">${escapeHtml(cat)}</span>
            <span class="chip-count">${catResources.length}</span>
          </div>
          <div class="board-col-actions" data-category="${escapeHtml(cat)}">
            <button class="board-add-btn" title="Create document in ${escapeHtml(cat)}" onclick="window.quickAddResourceInBoard('${escapeHtml(cat)}'); event.stopPropagation();">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>New</span>
            </button>
            <button class="board-col-menu-btn" title="Category options" onclick="window.toggleBoardColumnMenu(this, event)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1.5"></circle>
                <circle cx="19" cy="12" r="1.5"></circle>
                <circle cx="5" cy="12" r="1.5"></circle>
              </svg>
            </button>
            <div class="board-col-dropdown">
              <button class="dropdown-item" onclick="window.renameBoardCategory('${escapeHtml(cat)}'); event.stopPropagation();">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Rename</span>
              </button>
              <button class="dropdown-item" style="color:var(--color-error);" onclick="window.deleteBoardCategory('${escapeHtml(cat)}'); event.stopPropagation();">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
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
  // GRAPH VIEW: OBSIDIAN-AESTHETIC FORCE-DIRECTED GRAPH SIMULATION
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
    dpr: window.devicePixelRatio || 1,

    // Obsidian Physics & Force Tuning Parameters
    chargeForce: 300,        // Repulsion (-200 to -400)
    linkDistance: 100,       // Link distance (80px–120px)
    linkStrength: 0.3,       // Link strength (0.2–0.4)
    collisionPadding: 25,    // Collision force padding (+25px)
    centerGravity: 0.003,    // Soft center pull
    alphaDecay: 0.02,        // Simulation velocity decay ~0.02 (0.98 decay multiplier)
    velocityDecay: 0.92,     // Fluid velocity damping

    // Obsidian Visual & Display Settings
    baseNodeRadius: 5.0,     // 5px base radius
    showLabels: true,        // Clean direct canvas labels
    colorByCategory: false,  // Default: subtle Obsidian grey (#888888 / #a3a3a3)
    showCategories: true,
    showTags: true
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

    // Wake simulation to re-adjust
    graphState.alpha = Math.max(graphState.alpha, 0.35);
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

  function recalculateNodeRadii() {
    for (const node of graphState.nodes) {
      // Base radius 5px, scaling slightly up to 7px–8px for heavily connected nodes
      node.radius = Math.max(
        graphState.baseNodeRadius,
        Math.min(graphState.baseNodeRadius + 3.2, graphState.baseNodeRadius + Math.sqrt(node.degree) * 0.85)
      );
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

    const showTags = el.graphShowTagsCb ? el.graphShowTagsCb.checked : graphState.showTags;
    const showCategories = el.graphShowCategoriesCb ? el.graphShowCategoriesCb.checked : graphState.showCategories;

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
          x: existing ? existing.x : cx + (Math.random() - 0.5) * 380,
          y: existing ? existing.y : cy + (Math.random() - 0.5) * 320,
          vx: existing ? existing.vx * 0.5 : 0,
          vy: existing ? existing.vy * 0.5 : 0,
          radius: graphState.baseNodeRadius,
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

    graphState.nodes = visibleNodes;
    graphState.edges = activeEdges;
    graphState.nodeMap = nodeMap;

    recalculateNodeRadii();

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

    // Touch & Pinch-to-zoom support
    let touchStartDist = 0;
    let touchStartZoom = 1;
    let touchStartPan = { x: 0, y: 0 };
    let touchStartCenter = { x: 0, y: 0 };

    el.graphCanvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const node = getNodeAt(touch.clientX, touch.clientY);
        graphState.dragStart = { x: touch.clientX, y: touch.clientY };
        graphState.mouseMovedDist = 0;
        if (node) {
          graphState.draggedNode = node;
          graphState.alpha = Math.max(graphState.alpha, 0.45);
          startGraphLoop();
        } else {
          graphState.isPanning = true;
        }
      } else if (e.touches.length === 2) {
        e.preventDefault();
        graphState.draggedNode = null;
        graphState.isPanning = false;
        touchStartDist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        touchStartZoom = graphState.zoom;
        touchStartCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
        touchStartPan = { ...graphState.pan };
      }
    }, { passive: false });

    el.graphCanvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - graphState.dragStart.x;
        const dy = touch.clientY - graphState.dragStart.y;
        graphState.mouseMovedDist += Math.hypot(dx, dy);

        if (graphState.draggedNode) {
          e.preventDefault();
          const world = screenToWorld(touch.clientX, touch.clientY);
          graphState.draggedNode.x = world.x;
          graphState.draggedNode.y = world.y;
          graphState.draggedNode.vx = 0;
          graphState.draggedNode.vy = 0;
          graphState.alpha = Math.max(graphState.alpha, 0.4);
          startGraphLoop();
          hideTooltip();
        } else if (graphState.isPanning) {
          e.preventDefault();
          graphState.pan.x += dx;
          graphState.pan.y += dy;
          graphState.dragStart = { x: touch.clientX, y: touch.clientY };
          renderGraph();
          hideTooltip();
        }
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        if (touchStartDist > 0) {
          const factor = currentDist / touchStartDist;
          const newZoom = Math.max(0.2, Math.min(3.5, touchStartZoom * factor));
          const rect = el.graphContainer.getBoundingClientRect();
          const cx = touchStartCenter.x - rect.left;
          const cy = touchStartCenter.y - rect.top;
          graphState.pan.x = cx - ((cx - touchStartPan.x) / touchStartZoom) * newZoom;
          graphState.pan.y = cy - ((cy - touchStartPan.y) / touchStartZoom) * newZoom;
          graphState.zoom = newZoom;
          renderGraph();
        }
      }
    }, { passive: false });

    el.graphCanvas.addEventListener('touchend', (e) => {
      if (graphState.draggedNode) {
        if (graphState.mouseMovedDist < 8) {
          openPeek(graphState.draggedNode.id);
        }
        graphState.draggedNode = null;
      }
      graphState.isPanning = false;
      touchStartDist = 0;
    });

    // Obsidian Floating Settings Panel Controls
    if (el.graphPanelToggleBtn && el.graphSettingsPanel) {
      el.graphPanelToggleBtn.onclick = (e) => {
        e.stopPropagation();
        el.graphSettingsPanel.classList.toggle('open');
      };
    }
    if (el.graphPanelCloseBtn && el.graphSettingsPanel) {
      el.graphPanelCloseBtn.onclick = () => {
        el.graphSettingsPanel.classList.remove('open');
      };
    }

    // Display Toggles
    if (el.graphShowLabelsCb) {
      el.graphShowLabelsCb.checked = graphState.showLabels;
      el.graphShowLabelsCb.onchange = () => {
        graphState.showLabels = el.graphShowLabelsCb.checked;
        renderGraph();
      };
    }

    if (el.graphColorCategoryCb) {
      el.graphColorCategoryCb.checked = graphState.colorByCategory;
      el.graphColorCategoryCb.onchange = () => {
        graphState.colorByCategory = el.graphColorCategoryCb.checked;
        renderGraph();
      };
    }

    if (el.graphShowCategoriesCb) {
      el.graphShowCategoriesCb.checked = graphState.showCategories;
      el.graphShowCategoriesCb.onchange = () => {
        graphState.showCategories = el.graphShowCategoriesCb.checked;
        updateGraphData();
      };
    }

    if (el.graphShowTagsCb) {
      el.graphShowTagsCb.checked = graphState.showTags;
      el.graphShowTagsCb.onchange = () => {
        graphState.showTags = el.graphShowTagsCb.checked;
        updateGraphData();
      };
    }

    // Node Size Slider
    if (el.graphNodeSizeSlider) {
      el.graphNodeSizeSlider.value = graphState.baseNodeRadius;
      el.graphNodeSizeSlider.oninput = (e) => {
        const val = Number(e.target.value);
        graphState.baseNodeRadius = val;
        if (el.graphNodeSizeVal) el.graphNodeSizeVal.textContent = `${val}px`;
        recalculateNodeRadii();
        renderGraph();
      };
    }

    // Forces Sliders
    if (el.graphChargeSlider) {
      el.graphChargeSlider.value = graphState.chargeForce;
      el.graphChargeSlider.oninput = (e) => {
        const val = Number(e.target.value);
        graphState.chargeForce = val;
        if (el.graphChargeVal) el.graphChargeVal.textContent = `-${val}`;
        graphState.alpha = Math.max(graphState.alpha, 0.45);
        startGraphLoop();
      };
    }

    if (el.graphLinkDistSlider) {
      el.graphLinkDistSlider.value = graphState.linkDistance;
      el.graphLinkDistSlider.oninput = (e) => {
        const val = Number(e.target.value);
        graphState.linkDistance = val;
        if (el.graphLinkDistVal) el.graphLinkDistVal.textContent = `${val}px`;
        graphState.alpha = Math.max(graphState.alpha, 0.45);
        startGraphLoop();
      };
    }

    if (el.graphLinkStrengthSlider) {
      el.graphLinkStrengthSlider.value = graphState.linkStrength;
      el.graphLinkStrengthSlider.oninput = (e) => {
        const val = Number(e.target.value);
        graphState.linkStrength = val;
        if (el.graphLinkStrengthVal) el.graphLinkStrengthVal.textContent = `${val}`;
        graphState.alpha = Math.max(graphState.alpha, 0.45);
        startGraphLoop();
      };
    }

    if (el.graphGravitySlider) {
      el.graphGravitySlider.value = graphState.centerGravity;
      el.graphGravitySlider.oninput = (e) => {
        const val = Number(e.target.value);
        graphState.centerGravity = val;
        if (el.graphGravityVal) el.graphGravityVal.textContent = `${val}`;
        graphState.alpha = Math.max(graphState.alpha, 0.45);
        startGraphLoop();
      };
    }

    if (el.graphResetForcesBtn) {
      el.graphResetForcesBtn.onclick = () => {
        graphState.chargeForce = 300;
        graphState.linkDistance = 100;
        graphState.linkStrength = 0.3;
        graphState.centerGravity = 0.003;
        graphState.baseNodeRadius = 5.0;

        if (el.graphChargeSlider) el.graphChargeSlider.value = 300;
        if (el.graphChargeVal) el.graphChargeVal.textContent = '-300';
        if (el.graphLinkDistSlider) el.graphLinkDistSlider.value = 100;
        if (el.graphLinkDistVal) el.graphLinkDistVal.textContent = '100px';
        if (el.graphLinkStrengthSlider) el.graphLinkStrengthSlider.value = 0.3;
        if (el.graphLinkStrengthVal) el.graphLinkStrengthVal.textContent = '0.3';
        if (el.graphGravitySlider) el.graphGravitySlider.value = 0.003;
        if (el.graphGravityVal) el.graphGravityVal.textContent = '0.003';
        if (el.graphNodeSizeSlider) el.graphNodeSizeSlider.value = 5;
        if (el.graphNodeSizeVal) el.graphNodeSizeVal.textContent = '5px';

        recalculateNodeRadii();
        graphState.alpha = 1.0;
        startGraphLoop();
        showToast('Physics forces reset to defaults');
      };
    }

    if (el.graphReheatBtn) {
      el.graphReheatBtn.onclick = () => {
        graphState.alpha = 1.0;
        startGraphLoop();
      };
    }

    // Zoom Buttons
    if (el.graphZoomInBtn) {
      el.graphZoomInBtn.onclick = () => zoomGraph(1.25);
    }
    if (el.graphZoomOutBtn) {
      el.graphZoomOutBtn.onclick = () => zoomGraph(0.8);
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

    graphState.pan.x = cx - ((cx - graphState.pan.x) / oldZoom) * newZoom;
    graphState.pan.y = cy - ((cy - graphState.pan.y) / oldZoom) * newZoom;
    graphState.zoom = newZoom;

    renderGraph();
  }

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
      if (d <= n.radius + 6) {
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
      graphState.alpha = Math.max(graphState.alpha, 0.45);
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
    const charge = graphState.chargeForce;

    // 1. Repulsion between all nodes (Coulomb - charge repulsion -200 to -400)
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dSq = dx * dx + dy * dy + 100;
        const dist = Math.sqrt(dSq);

        // Broad comfortable repulsion spread across the canvas
        const force = Math.min(30, ((charge * 65) / Math.max(dSq, 200))) * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        n1.vx -= fx;
        n1.vy -= fy;
        n2.vx += fx;
        n2.vy += fy;

        // Collision force: node size + 25px padding to prevent overlapping labels
        const minDist = n1.radius + n2.radius + graphState.collisionPadding;
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

    // 2. Spring Attraction along Edges (Hooke's Law - loose springy simulation)
    for (const e of edges) {
      const src = e.source;
      const tgt = e.target;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

      let restLength = graphState.linkDistance;
      let stiffness = graphState.linkStrength * 0.18;

      if (e.type === 'direct') {
        restLength = graphState.linkDistance * 0.9;
        stiffness = graphState.linkStrength * 0.22;
      } else if (e.type === 'category') {
        restLength = graphState.linkDistance * 1.35;
        stiffness = graphState.linkStrength * 0.14;
      } else if (e.type === 'tag') {
        restLength = graphState.linkDistance * 1.65;
        stiffness = graphState.linkStrength * 0.09;
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

      // Gentle center gravity
      const gx = (cx - n.x) * graphState.centerGravity * alpha;
      const gy = (cy - n.y) * graphState.centerGravity * alpha;
      n.vx += gx;
      n.vy += gy;

      // Smooth velocity decay for weightless and fluid dragging
      n.vx *= graphState.velocityDecay;
      n.vy *= graphState.velocityDecay;

      n.x += n.vx;
      n.y += n.vy;
    }

    // Cool down with alpha decay ~0.02
    graphState.alpha *= (1 - graphState.alphaDecay);
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

    // 1. Draw Links (Obsidian Aesthetic: thin 1px lines with low opacity)
    for (const e of graphState.edges) {
      const isConnectedToHover = hovered && (e.source.id === hovered.id || e.target.id === hovered.id);
      const isDimmed = hovered && !isConnectedToHover;

      ctx.beginPath();
      ctx.moveTo(e.source.x, e.source.y);
      ctx.lineTo(e.target.x, e.target.y);

      if (isConnectedToHover) {
        // Highlight in bright white / accent blue
        ctx.strokeStyle = isPiszczek ? '#00FF94' : (isDark ? '#ffffff' : '#0075de');
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.95;
      } else if (isDimmed) {
        // Dim unrelated links
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.03;
      } else {
        // Default thin 1px lines with low opacity (#ffffff1f or #444444)
        if (e.type === 'direct') {
          ctx.strokeStyle = isPiszczek ? 'rgba(0, 255, 148, 0.35)' : (isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.14)');
          ctx.lineWidth = 1.0;
          ctx.setLineDash([]);
        } else if (e.type === 'category') {
          ctx.strokeStyle = isPiszczek ? 'rgba(0, 255, 148, 0.2)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');
          ctx.lineWidth = 0.9;
          ctx.setLineDash([3, 3]);
        } else {
          // Tag link
          ctx.strokeStyle = isPiszczek ? 'rgba(0, 255, 148, 0.14)' : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)');
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 3]);
        }
        ctx.globalAlpha = 0.85;
      }

      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;

    // 2. Draw Nodes (Obsidian Aesthetic: subtle grey dots 5px-8px, clean sans-serif text without boxes)
    for (const n of graphState.nodes) {
      const isHovered = n === hovered;
      const isConnected = !hovered || connectedNodeIds.has(n.id);
      const isActivePeek = n.id === activePeekId;

      ctx.save();
      ctx.globalAlpha = isConnected ? 1.0 : 0.15;

      // Hover / Active Glowing Halo
      if (isActivePeek || isHovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = isPiszczek
          ? 'rgba(0, 255, 148, 0.22)'
          : (isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 117, 222, 0.18)');
        ctx.fill();

        ctx.strokeStyle = isPiszczek ? '#00FF94' : (isDark ? '#ffffff' : '#0075de');
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Base Node Circle (subtle grey fills #888888 / #a3a3a3 or category color)
      ctx.beginPath();
      ctx.arc(n.x, n.y, isHovered ? n.radius + 1.2 : n.radius, 0, Math.PI * 2);

      if (isHovered) {
        ctx.fillStyle = isPiszczek ? '#00FF94' : (isDark ? '#ffffff' : '#0075de');
      } else if (graphState.colorByCategory) {
        ctx.fillStyle = n.color;
      } else {
        // Obsidian clean subtle grey
        if (isDark) {
          ctx.fillStyle = n.degree > 2 ? '#a3a3a3' : '#888888';
        } else {
          ctx.fillStyle = n.degree > 2 ? '#525252' : '#737373';
        }
      }
      ctx.fill();

      // Delicate stroke
      ctx.strokeStyle = isDark ? '#141414' : '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Label Text: Rendered directly on the canvas without solid black boxes!
      if (graphState.showLabels || isHovered) {
        const labelY = n.y + n.radius + 6;
        const text = n.title.length > 25 ? n.title.slice(0, 23) + '...' : n.title;

        ctx.font = isHovered
          ? '600 10.5px NotionInter, -apple-system, sans-serif'
          : '400 10px NotionInter, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        if (isHovered) {
          ctx.fillStyle = isPiszczek ? '#00FF94' : (isDark ? '#ffffff' : '#0075de');
        } else if (hovered && connectedNodeIds.has(n.id)) {
          ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
        } else {
          ctx.fillStyle = isDark ? '#9ca3af' : '#4b5563';
        }

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

  function openEditor(id = null, defaultCategory = null) {
    if (!state.isAdmin) {
      promptAdminAccess(() => openEditor(id, defaultCategory));
      return;
    }

    // Populate category dropdown
    el.editorCategory.innerHTML = '<option value="">-- Select Category --</option>';
    const catSet = new Set(state.categories);
    if (defaultCategory && defaultCategory !== '__NEW__') {
      catSet.add(defaultCategory);
    }
    catSet.forEach(cat => {
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
      el.editorModalTitle.textContent = defaultCategory ? `Create Resource in ${defaultCategory}` : 'Create New Resource';
      el.editorId.value = '';
      el.editorTitle.value = '';
      el.editorCategory.value = defaultCategory || state.categories[0] || 'General';
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
