# Antigravity Workspace Configuration & Guidelines

Welcome to the **myResource** repository — an offline-first Notion & Terminal-inspired Resource Hub.

---

## 1. Project Overview & Architecture

- **Backend (`server.js`)**: Native, zero-dependency Node.js HTTP server. Handles local directory scanning, YAML frontmatter parsing, internal wikilink / markdown link extraction, automatic tag extraction, CRUD APIs (`/api/resources`, `/api/graph`, `/api/config`), and static asset serving.
- **Frontend (`public/`)**: Pure offline vanilla JavaScript, HTML5, and CSS3 with CSS custom properties.
  - `public/index.html`: Layout with top navigation, command bar, theme selector, 3 layout views (Grid, Category Board, Graph View), and Notion peek drawer.
  - `public/style.css`: Strict design system implementation supporting Notion Light, Notion Dark, Notion OLED, Charcoal Slate, Warm Espresso, and Piszczek Terminal Dark.
  - `public/app.js`: State management, real-time search, tag/category filtering, interactive HTML5 Canvas force-directed graph simulation, resizable side peek drawer, and admin controls.
  - `public/vendor/marked.min.js`: Bundled offline Markdown parser.
- **React Component (`components/NotionPeekGrid.jsx`)**: Standalone Tailwind CSS + Lucide React grid component with 3-mode peek drawer.
- **Resource Directory (`localmd/`)**: Markdown `.md` files with YAML frontmatter (`title`, `category`, `tags`, `description`, `pinned`, `date`).

---

## 2. Core Guidelines for Agents

1. **Maintain Offline Integrity**:
   - Never introduce required external CDNs (fonts, scripts, icons, or stylesheets) at runtime.
   - Always keep local fallbacks for fonts (`NotionInter`, `Space Grotesk`, `JetBrains Mono`, system sans-serif, and monospace).

2. **Preserve Frontmatter Portability**:
   - Any modifications to resource files in `localmd/` must preserve valid YAML frontmatter delimiters (`---`) without destroying markdown body content.
   - Tags must be normalized (lowercase, deduplicated).

3. **Follow the Design Tokens**:
   - Use CSS custom properties defined in `public/style.css`.
   - Adhere strictly to the specs in `notion.site-design.md` and `piszczek.pl-design.md`.

---

## 3. Common Commands & Runbooks

- **Start Web Server**: `node server.js` or double-click `start.bat` (serves at `http://localhost:3000`).
- **Rescan Local Directory**: Trigger via `POST /api/rescan` or click the **Rescan** button in the UI.
- **Default Admin Passcode**: `admin` (toggleable in navigation bar).
