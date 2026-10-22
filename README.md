# Notion Resource Hub (Offline Markdown Library)

An offline-first personal resource hub crafted using the **Notion Light Design System** specifications. It automatically indexes, categorizes, and extracts tags from all your Markdown files stored in a designated local directory (`localmd/`), and gives you complete admin control to organize categories and edit tags directly from the browser.

---

## Key Features

1. **Notion Light Design System**:
   - Exact color tokens: `#0075de` (primary action blue), `#e6f3fe` (soft primary), `#f5f5f5` (tertiary neutral), and `#000000` on crisp white canvas.
   - Clean editorial typography with tight letter spacing on headlines and compact, legible body copy.
   - Restrained UI chrome, flat elevation, soft corner radii (`rounded.md` for buttons/inputs, `rounded.lg` for cards, `rounded.full` for chips).

2. **100% Offline-First**:
   - Zero external CDNs or internet dependencies required at runtime.
   - Self-contained offline Markdown engine (`marked.min.js`) supporting GitHub Flavored Markdown (GFM), code blocks, tables, task lists, and blockquotes.
   - Native Node.js HTTP server without heavy external `node_modules`.

3. **Local Markdown Storage (`localmd/`)**:
   - Stores all documents as pure Markdown files on your disk.
   - Transparent, portable, and compatible with Obsidian, VS Code, Logseq, or Notepad.
   - Real-time directory rescanning and configurable custom folder paths.

4. **Automated Tag Extraction**:
   - Extracts tags defined in YAML frontmatter (`tags: [frontend, css, notion]`).
   - Discovers inline hashtags in document body text (e.g. `#architecture`, `#cheatsheet`).
   - Aggregates and displays tag chips with item counts for instant 1-click filtering.

5. **Admin Access & Organization**:
   - **Toggle Admin Mode** (unlock with password, default: `admin`).
   - **Organize Categories**: Filter by category, view Category Board columns, and batch-rename categories across files.
   - **Edit Tags**: Add or remove tags per resource with interactive chips, or rename tags globally across all documents.
   - **In-Browser Markdown Editor**: Create new `.md` files or edit existing ones directly. Changes are automatically written back to the physical Markdown files on disk!
   - **Fast Search**: Instant full-text search across titles, descriptions, categories, tags, and document bodies (`/` shortcut).

---

## Quick Start

### 1. Launch with Node.js
```bash
node server.js
```
or
```bash
npm start
```

### 2. Windows 1-Click Launch
Double-click `start.bat` in this folder. It will launch the server and open your default browser to `http://localhost:3000`.

---

## Default Admin Credentials
- **Password**: `admin`
- Click the **Admin Mode** badge in the upper right navigation bar to unlock editing and organizational features.

---

## Markdown File Format Example

You can drop any `.md` file into `localmd/`. Here is an example of supported frontmatter:

```markdown
---
title: My Developer Notes
category: Engineering
tags: [javascript, node, performance]
description: Tips and tricks for writing fast Node.js services.
pinned: true
---

# My Developer Notes

Here are some thoughts on performance...

Use inline tags like #tips or #cheatsheet anywhere in your text!
```
