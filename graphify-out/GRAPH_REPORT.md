# Graph Report - myResource  (2026-10-22)

## Corpus Check
- Corpus is ~17,670 words - fits in a single context window. You may not need a graph.

## Summary
- 139 nodes · 216 edges · 36 communities (7 shown, 29 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI State and Graph Simulation
- Backend HTTP Server & Routes
- Resource Filtering & Modal Controls
- Architecture & Workspace Guidelines
- Package Configuration & Metadata
- Markdown Parser Engine
- Notion Peek Grid React Component
- Offline Typography & Fonts
- Editor Tag Input & Management
- Resource Hub HTML Layout
- Color Tokens & Palettes
- Frontmatter Portability Spec
- Admin Sync & File Management
- Automatic Tag Detection
- Local Markdown Storage
- Git Branching Strategies
- Git Stashing Workflows
- Git Undoing Techniques
- Notion Typography Hierarchy
- Notion UI Component Specifications
- REST HTTP Verbs Semantics
- REST Status Code Conventions
- Graphify AI Workflow Prompts
- Graphify CLI Commands
- Graphify Master Reference Guide
- Notion Light Color System
- Notion Light Design Tokens
- Terminal Component Design Tokens
- Graph View Canvas Component
- Admin Management Modals
- Automated Tag Extraction
- Interactive Hub Layout Views
- Offline-First Hub Architecture
- Resource Hub Documentation

## God Nodes (most connected - your core abstractions)
1. `initGraphView()` - 10 edges
2. `server` - 9 edges
3. `showToast()` - 8 edges
4. `fetchConfig()` - 8 edges
5. `fetchResources()` - 8 edges
6. `applyFilters()` - 8 edges
7. `onGraphMouseMove()` - 8 edges
8. `openPeek()` - 8 edges
9. `resizeGraphCanvas()` - 7 edges
10. `updateGraphData()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Frontend Offline-First Principles` --semantically_similar_to--> `Zero Dependencies Rule`  [INFERRED] [semantically similar]
  localmd/frontend-architecture.md → .agents/rules/coding-standards.md
- `Notion Light Core Color Tokens` --semantically_similar_to--> `Piszczek Terminal Neon Green & Dark Palette`  [INFERRED] [semantically similar]
  localmd/notion-design-system.md → piszczek.pl-design.md
- `Notion Peek Drawer System` --conceptually_related_to--> `Notion Light Design Specification`  [INFERRED]
  public/index.html → notion.site-design.md
- `Design System Compliance Rule` --references--> `Notion Light Design Specification`  [EXTRACTED]
  .agents/rules/coding-standards.md → notion.site-design.md
- `Public Index HTML Layout` --implements--> `Resource Hub Component Layout Design`  [INFERRED]
  public/index.html → localmd/frontend-architecture.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Design System Token Specifications** — notion_site_design_spec, piszczek_pl_design_spec, localmd_notion_design_system_doc [EXTRACTED 1.00]
- **Offline-First Architecture Standards** — _agents_rules_coding_standards_zero_dependencies, agents_offline_integrity, localmd_frontend_architecture_offline_first_principles [EXTRACTED 1.00]

## Communities (36 total, 29 thin omitted)

### Community 0 - "UI State and Graph Simulation"
Cohesion: 0.16
Nodes (29): applyTheme(), closePeek(), fetchGraphData(), getCategoryColor(), getNodeAt(), hideTooltip(), init(), initGraphView() (+21 more)

### Community 1 - "Backend HTTP Server & Routes"
Cohesion: 0.13
Nodes (19): config, CONFIG_FILE, extractHashtags(), extractInternalLinks(), fs, getAllResources(), http, loadResource() (+11 more)

### Community 2 - "Resource Filtering & Modal Controls"
Cohesion: 0.26
Nodes (15): applyFilters(), closeAllModals(), escapeHtml(), fetchConfig(), fetchResources(), openCategoryManager(), openChangeDir(), openTagManager() (+7 more)

### Community 3 - "Architecture & Workspace Guidelines"
Cohesion: 0.25
Nodes (11): Design System Compliance Rule, Antigravity Workspace Guidelines, Modern Frontend Architecture Document, Getting Started Guide, Git Cheatsheet & Productivity Workflows, Notion Light Design System Guide, RESTful API Best Practices Guide, Notion Light Design Specification (+3 more)

### Community 4 - "Package Configuration & Metadata"
Cohesion: 0.20
Nodes (9): author, description, keywords, license, main, name, scripts, start (+1 more)

### Community 5 - "Markdown Parser Engine"
Cohesion: 0.43
Nodes (5): escapeHtml(), parseInline(), parseMarkdown(), closeTable(), renderTable()

### Community 8 - "Editor Tag Input & Management"
Cohesion: 0.67
Nodes (3): openEditor(), renderEditorTags(), setupTagInput()

## Knowledge Gaps
- **31 isolated node(s):** `Frontmatter Portability`, `Notion Resource Hub Documentation`, `Offline-First Architecture`, `Automated Tag Extraction Feature`, `Three Interactive Layout Views` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 59 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 5 inferred relationships involving `initGraphView()` (e.g. with `onGraphMouseDown()` and `onGraphMouseMove()`) actually correct?**
  _`initGraphView()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Frontmatter Portability`, `Notion Resource Hub Documentation`, `Offline-First Architecture` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend HTTP Server & Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._