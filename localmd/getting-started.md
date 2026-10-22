---
title: Welcome to Your Offline Resource Hub
category: Getting Started
tags: [offline, notion, markdown, guide, resources]
description: A complete guide on how this offline resource hub loads, tags, and organizes markdown files from your localmd folder.
date: 2026-10-21
pinned: true
---

# Welcome to Your Resource Hub

This application is built for keeping all your knowledge, cheatsheets, documentation, and notes in one place, completely **offline** and fast.

> **Key Design Philosophy:** Minimalist, crisp, and functional with an editorial Notion aesthetic. Focused on typography, whitespace, and immediate access to your content.

---

## How It Works

1. **Local Markdown Storage (`localmd/`)**
   - All your `.md` files live in the `localmd/` directory right next to the server.
   - You can copy, move, or edit `.md` files using any editor (Obsidian, VS Code, Notepad).
   - The web app automatically scans and monitors this directory.

2. **Automatic Tag Detection**
   - Any tags listed in the YAML frontmatter (`tags: [tag1, tag2]`) are extracted.
   - Any hashtags in the markdown body text like `#productivity` or `#cheatsheet` are automatically extracted and indexed.
   - Tags are rendered as interactive chips at the top of the interface for instant filtering.

3. **Admin Organization**
   - Click **Admin Mode** in the top navigation bar.
   - Reorganize files into new or existing categories.
   - Edit, add, or delete tags on any resource.
   - Create new markdown files or edit existing ones directly in the browser.
   - All changes update the actual `.md` file on your disk!

---

## Formatting Cheatsheet

### Lists and Tasks
- [x] Set up localmd folder
- [x] Auto-extract tags from files
- [x] Admin category & tag editing
- [ ] Add more custom resources

### Code Blocks
```javascript
// Quick example of accessing local resources
async function fetchResources() {
  const res = await fetch('/api/resources');
  const data = await res.json();
  console.log(`Loaded ${data.length} resources from localmd`);
}
```

### Table View

| Feature | Support | Storage |
| :--- | :---: | :--- |
| Offline Mode | 100% | Local filesystem |
| Tag Extraction | Automatic | Frontmatter + Body `#tags` |
| Admin Access | Included | Instant file sync |
