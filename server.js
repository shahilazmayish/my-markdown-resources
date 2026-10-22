const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Default configuration
let config = {
  port: DEFAULT_PORT,
  localmdDir: path.join(__dirname, 'localmd'),
  adminPassword: 'admin',
  siteTitle: 'Resource Hub'
};

// Load saved config if exists
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    config = { ...config, ...saved };
  } catch (err) {
    console.error('Error reading config.json:', err.message);
  }
}

// Ensure localmd directory exists
if (!fs.existsSync(config.localmdDir)) {
  fs.mkdirSync(config.localmdDir, { recursive: true });
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config.json:', err.message);
  }
}

// Helper: Parse Frontmatter (YAML-like key: value)
function parseFrontmatter(rawContent) {
  const result = {
    frontmatter: {},
    body: rawContent
  };

  const trimmed = rawContent.replace(/^\uFEFF/, ''); // remove BOM if present
  if (!trimmed.startsWith('---')) {
    return result;
  }

  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return result;
  }

  const fmString = match[1];
  result.body = match[2];

  const lines = fmString.split(/\r?\n/);
  let currentKey = null;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // List item under currentKey
    const listItemMatch = line.match(/^\s*-\s+(.*)$/);
    if (listItemMatch && currentKey && inList) {
      let val = listItemMatch[1].trim();
      val = val.replace(/^['"](.*)['"]$/, '$1');
      if (Array.isArray(result.frontmatter[currentKey])) {
        result.frontmatter[currentKey].push(val);
      }
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();

      if (!val) {
        // Could be start of list
        currentKey = key;
        result.frontmatter[key] = [];
        inList = true;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        // Inline array: [tag1, tag2]
        inList = false;
        currentKey = key;
        const items = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"](.*)['"]$/, '$1')).filter(Boolean);
        result.frontmatter[key] = items;
      } else {
        inList = false;
        currentKey = key;
        // Strip quotes
        val = val.replace(/^['"](.*)['"]$/, '$1');
        if (val.toLowerCase() === 'true') val = true;
        else if (val.toLowerCase() === 'false') val = false;
        result.frontmatter[key] = val;
      }
    }
  }

  return result;
}

// Helper: Extract inline hashtags from markdown body
function extractHashtags(body) {
  const tags = new Set();
  const lines = body.split(/\r?\n/);
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Skip markdown headings like "# Heading" or "## Heading"
    if (/^#{1,6}\s+/.test(trimmed)) {
      continue;
    }

    // Match hashtags: #word (must have space or start of line before #, and alphanumeric/dash/underscore after)
    const regex = /(?:^|\s)#([a-zA-Z0-9_\-\u00C0-\u024F]+)(?=$|\s|[.,;:!?])/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const tag = match[1].toLowerCase();
      // avoid hex colors or digit-only tags
      if (!/^[0-9a-fA-F]{3,6}$/.test(tag) && !/^\d+$/.test(tag)) {
        tags.add(tag);
      }
    }
  }

  return Array.from(tags);
}

// Helper: Extract internal links (wikilinks [[Note Title]] and markdown links [Label](note.md))
function extractInternalLinks(body) {
  const links = new Set();
  const lines = body.split(/\r?\n/);
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // 1. Wikilinks: [[Target Note]] or [[Target Note|Label]]
    const wikiRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let wMatch;
    while ((wMatch = wikiRegex.exec(line)) !== null) {
      const target = wMatch[1].trim();
      if (target) links.add(target);
    }

    // 2. Markdown links: [Label](some-file.md)
    const mdRegex = /\[([^\]]+)\]\(([^)]+\.md(?:#[^)]*)?)\)/g;
    let mMatch;
    while ((mMatch = mdRegex.exec(line)) !== null) {
      let targetPath = mMatch[2].trim().split('#')[0];
      targetPath = path.basename(targetPath);
      if (targetPath) links.add(targetPath);
    }
  }

  return Array.from(links);
}

// Helper: Build Frontmatter string
function stringifyFrontmatter(data, body) {
  let fm = '---\n';
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      if (val.length === 0) {
        fm += `${key}: []\n`;
      } else {
        const escaped = val.map(v => (v.includes(',') || v.includes(' ') ? `"${v.replace(/"/g, '\\"')}"` : v));
        fm += `${key}: [${escaped.join(', ')}]\n`;
      }
    } else if (typeof val === 'boolean') {
      fm += `${key}: ${val}\n`;
    } else {
      const strVal = String(val);
      if (strVal.includes('\n') || strVal.includes(':') || strVal.includes('"')) {
        fm += `${key}: "${strVal.replace(/"/g, '\\"')}"\n`;
      } else {
        fm += `${key}: ${strVal}\n`;
      }
    }
  }
  fm += '---\n\n';
  return fm + (body || '').trimStart();
}

// Helper: Scan localmd directory recursively
function scanDirectory(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(scanDirectory(fullPath, baseDir));
    } else if (item.isFile() && (item.name.endsWith('.md') || item.name.endsWith('.markdown'))) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({
        fullPath,
        relativePath,
        fileName: item.name
      });
    }
  }
  return results;
}

// Helper: Parse single markdown resource
function loadResource(fileInfo) {
  try {
    const raw = fs.readFileSync(fileInfo.fullPath, 'utf-8');
    const stats = fs.statSync(fileInfo.fullPath);
    const { frontmatter, body } = parseFrontmatter(raw);

    // Extract tags from frontmatter
    let fmTags = [];
    if (Array.isArray(frontmatter.tags)) {
      fmTags = frontmatter.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
    } else if (typeof frontmatter.tags === 'string') {
      fmTags = frontmatter.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    // Extract inline hashtags from body
    const bodyTags = extractHashtags(body);

    // Merge and deduplicate
    const combinedTags = Array.from(new Set([...fmTags, ...bodyTags]));

    // Title fallback
    let title = frontmatter.title;
    if (!title) {
      const h1Match = body.match(/^#\s+(.+)$/m);
      if (h1Match) {
        title = h1Match[1].trim();
      } else {
        title = fileInfo.fileName.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
    }

    // Category fallback
    let category = frontmatter.category;
    if (!category) {
      const dirPart = path.dirname(fileInfo.relativePath);
      if (dirPart && dirPart !== '.') {
        category = dirPart.split('/')[0];
      } else {
        category = 'General';
      }
    }

    // Description fallback
    let description = frontmatter.description || frontmatter.summary;
    if (!description) {
      // Find first non-heading, non-empty paragraph
      const paragraphs = body.split(/\r?\n\r?\n/);
      for (const p of paragraphs) {
        const clean = p.replace(/^#{1,6}\s+.*$/m, '').trim();
        if (clean && !clean.startsWith('>') && !clean.startsWith('```')) {
          description = clean.slice(0, 160).replace(/(\r\n|\n|\r)/gm, ' ');
          if (clean.length > 160) description += '...';
          break;
        }
      }
    }

    // Word count & reading time
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    // Internal links (wikilinks + md links)
    const internalLinks = extractInternalLinks(body);

    // Stable ID: relative path encoded
    const id = Buffer.from(fileInfo.relativePath).toString('base64url');

    return {
      id,
      relativePath: fileInfo.relativePath,
      fileName: fileInfo.fileName,
      title,
      category,
      tags: combinedTags,
      internalLinks,
      description: description || 'No summary available.',
      pinned: !!frontmatter.pinned,
      date: frontmatter.date || stats.birthtime.toISOString().split('T')[0],
      updated: frontmatter.updated || stats.mtime.toISOString().split('T')[0],
      readingTime: `${readingTime} min read`,
      wordCount: words,
      body,
      rawFrontmatter: frontmatter
    };
  } catch (err) {
    console.error(`Error reading ${fileInfo.fullPath}:`, err.message);
    return null;
  }
}

// Get all resources
function getAllResources() {
  const files = scanDirectory(config.localmdDir);
  const resources = [];
  for (const f of files) {
    const res = loadResource(f);
    if (res) resources.push(res);
  }

  // Sort: pinned first, then updated date descending
  resources.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
  });

  return resources;
}

// Static MIME mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.md': 'text/markdown; charset=utf-8'
};

// Request body helper
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) { // 20MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const method = req.method.toUpperCase();

  // CORS headers for local flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTES ---

  // GET /api/config
  if (method === 'GET' && pathname === '/api/config') {
    const resources = getAllResources();
    const categories = new Set();
    const tagCountMap = {};

    for (const r of resources) {
      if (r.category) categories.add(r.category);
      for (const t of r.tags) {
        tagCountMap[t] = (tagCountMap[t] || 0) + 1;
      }
    }

    const tagsList = Object.entries(tagCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return sendJSON(res, 200, {
      siteTitle: config.siteTitle,
      localmdDir: config.localmdDir,
      totalResources: resources.length,
      categories: Array.from(categories).sort(),
      tags: tagsList
    });
  }

  // POST /api/config (Admin)
  if (method === 'POST' && pathname === '/api/config') {
    try {
      const data = await readRequestBody(req);
      if (data.localmdDir) {
        const resolved = path.resolve(data.localmdDir);
        if (!fs.existsSync(resolved)) {
          fs.mkdirSync(resolved, { recursive: true });
        }
        config.localmdDir = resolved;
      }
      if (data.siteTitle) config.siteTitle = data.siteTitle;
      saveConfig();
      return sendJSON(res, 200, { success: true, config });
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // POST /api/admin/verify
  if (method === 'POST' && pathname === '/api/admin/verify') {
    try {
      const data = await readRequestBody(req);
      const isMatch = (data.password === config.adminPassword) || (config.adminPassword === '' || !config.adminPassword);
      return sendJSON(res, 200, { valid: isMatch });
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // GET /api/resources
  if (method === 'GET' && pathname === '/api/resources') {
    const resources = getAllResources();
    return sendJSON(res, 200, resources);
  }

  // GET /api/graph
  if (method === 'GET' && pathname === '/api/graph') {
    const resources = getAllResources();
    const nodes = [];
    const edges = [];
    const edgeKeySet = new Set();

    const byId = new Map();
    const byFileName = new Map();
    const byTitle = new Map();

    for (const r of resources) {
      byId.set(r.id, r);
      byFileName.set(r.fileName.toLowerCase(), r);
      byTitle.set(r.title.toLowerCase(), r);
      const baseName = r.fileName.replace(/\.md$/i, '').toLowerCase();
      byFileName.set(baseName, r);
    }

    // Nodes
    for (const r of resources) {
      nodes.push({
        id: r.id,
        title: r.title,
        fileName: r.fileName,
        category: r.category || 'General',
        tags: r.tags || [],
        description: r.description || '',
        readingTime: r.readingTime,
        pinned: r.pinned,
        date: r.date,
        updated: r.updated,
        internalLinks: r.internalLinks || [],
        inDegree: 0,
        outDegree: 0,
        degree: 0
      });
    }

    function addEdge(sourceId, targetId, type, label) {
      if (sourceId === targetId) return;
      const key = sourceId < targetId ? `${sourceId}---${targetId}---${type}` : `${targetId}---${sourceId}---${type}`;
      if (edgeKeySet.has(key)) return;
      edgeKeySet.add(key);
      edges.push({ source: sourceId, target: targetId, type, label: label || type });
    }

    // 1. Direct Links from body
    for (const r of resources) {
      for (const linkTarget of (r.internalLinks || [])) {
        const clean = linkTarget.toLowerCase().replace(/\.md$/i, '').trim();
        const matched = byTitle.get(clean) || byFileName.get(clean);
        if (matched && matched.id !== r.id) {
          addEdge(r.id, matched.id, 'direct', 'direct link');
        }
      }
    }

    // 2. Category Affinity Links
    const catMap = {};
    for (const r of resources) {
      const c = (r.category || 'General').toLowerCase();
      if (!catMap[c]) catMap[c] = [];
      catMap[c].push(r.id);
    }
    for (const [c, ids] of Object.entries(catMap)) {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          addEdge(ids[i], ids[j], 'category', c);
        }
      }
    }

    // 3. Shared Tag Links
    const tagMap = {};
    for (const r of resources) {
      for (const t of r.tags) {
        const tag = t.toLowerCase();
        if (!tagMap[tag]) tagMap[tag] = [];
        tagMap[tag].push(r.id);
      }
    }
    for (const [tag, ids] of Object.entries(tagMap)) {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          addEdge(ids[i], ids[j], 'tag', `#${tag}`);
        }
      }
    }

    // Compute degrees
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    for (const e of edges) {
      const s = nodeMap.get(e.source);
      const t = nodeMap.get(e.target);
      if (s && t) {
        s.outDegree++;
        s.degree++;
        t.inDegree++;
        t.degree++;
      }
    }

    return sendJSON(res, 200, {
      nodes,
      edges,
      totalNodes: nodes.length,
      totalEdges: edges.length
    });
  }

  // GET /api/resources/:id
  if (method === 'GET' && pathname.startsWith('/api/resources/')) {
    const id = pathname.replace('/api/resources/', '');
    try {
      const relativePath = Buffer.from(id, 'base64url').toString('utf-8');
      const fullPath = path.resolve(config.localmdDir, relativePath);

      if (!fs.existsSync(fullPath)) {
        return sendJSON(res, 404, { error: 'Resource not found' });
      }

      const resource = loadResource({ fullPath, relativePath, fileName: path.basename(fullPath) });
      return sendJSON(res, 200, resource);
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // POST /api/resources (Create new markdown file)
  if (method === 'POST' && pathname === '/api/resources') {
    try {
      const data = await readRequestBody(req);
      let title = (data.title || 'Untitled Resource').trim();
      let category = (data.category || 'General').trim();
      let tags = Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(s => s.trim()) : []);
      let body = data.body || `# ${title}\n\nWrite your content here...`;
      let pinned = !!data.pinned;
      let description = data.description || '';

      // Generate filename safe
      let safeBaseName = title.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'resource';
      let fileName = `${safeBaseName}.md`;
      let fullPath = path.join(config.localmdDir, fileName);

      // Avoid overwriting existing file
      let counter = 1;
      while (fs.existsSync(fullPath)) {
        fileName = `${safeBaseName}-${counter++}.md`;
        fullPath = path.join(config.localmdDir, fileName);
      }

      const fmData = {
        title,
        category,
        tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
        description: description || undefined,
        date: new Date().toISOString().split('T')[0],
        pinned: pinned || undefined
      };

      const fileContent = stringifyFrontmatter(fmData, body);
      fs.writeFileSync(fullPath, fileContent, 'utf-8');

      const relativePath = path.relative(config.localmdDir, fullPath).replace(/\\/g, '/');
      const created = loadResource({ fullPath, relativePath, fileName });
      return sendJSON(res, 201, created);
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // PUT /api/resources/:id (Update markdown file - categories, tags, content)
  if (method === 'PUT' && pathname.startsWith('/api/resources/')) {
    const id = pathname.replace('/api/resources/', '');
    try {
      const relativePath = Buffer.from(id, 'base64url').toString('utf-8');
      const fullPath = path.resolve(config.localmdDir, relativePath);

      if (!fs.existsSync(fullPath)) {
        return sendJSON(res, 404, { error: 'Resource not found' });
      }

      const data = await readRequestBody(req);
      const existingRaw = fs.readFileSync(fullPath, 'utf-8');
      const { frontmatter: existingFm, body: existingBody } = parseFrontmatter(existingRaw);

      // Update frontmatter properties
      const updatedFm = { ...existingFm };
      if (data.title !== undefined) updatedFm.title = data.title.trim();
      if (data.category !== undefined) updatedFm.category = data.category.trim();
      if (data.tags !== undefined) {
        let tagList = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(s => s.trim());
        updatedFm.tags = Array.from(new Set(tagList.map(t => String(t).trim().toLowerCase()).filter(Boolean)));
      }
      if (data.description !== undefined) updatedFm.description = data.description.trim();
      if (data.pinned !== undefined) updatedFm.pinned = !!data.pinned;
      updatedFm.updated = new Date().toISOString().split('T')[0];

      const newBody = data.body !== undefined ? data.body : existingBody;
      const newFileContent = stringifyFrontmatter(updatedFm, newBody);

      fs.writeFileSync(fullPath, newFileContent, 'utf-8');

      const updatedResource = loadResource({ fullPath, relativePath, fileName: path.basename(fullPath) });
      return sendJSON(res, 200, updatedResource);
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // DELETE /api/resources/:id
  if (method === 'DELETE' && pathname.startsWith('/api/resources/')) {
    const id = pathname.replace('/api/resources/', '');
    try {
      const relativePath = Buffer.from(id, 'base64url').toString('utf-8');
      const fullPath = path.resolve(config.localmdDir, relativePath);

      if (!fs.existsSync(fullPath)) {
        return sendJSON(res, 404, { error: 'Resource not found' });
      }

      fs.unlinkSync(fullPath);
      return sendJSON(res, 200, { success: true, deleted: relativePath });
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // POST /api/categories/rename (Batch rename category across all files)
  if (method === 'POST' && pathname === '/api/categories/rename') {
    try {
      const { oldCategory, newCategory } = await readRequestBody(req);
      if (!oldCategory || !newCategory) {
        return sendJSON(res, 400, { error: 'Both oldCategory and newCategory are required.' });
      }

      const files = scanDirectory(config.localmdDir);
      let count = 0;

      for (const f of files) {
        const raw = fs.readFileSync(f.fullPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(raw);
        if (frontmatter.category && frontmatter.category.trim().toLowerCase() === oldCategory.trim().toLowerCase()) {
          frontmatter.category = newCategory.trim();
          frontmatter.updated = new Date().toISOString().split('T')[0];
          fs.writeFileSync(f.fullPath, stringifyFrontmatter(frontmatter, body), 'utf-8');
          count++;
        }
      }

      return sendJSON(res, 200, { success: true, updatedCount: count });
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // POST /api/categories/delete (Batch reassign category to General or fallback)
  if (method === 'POST' && pathname === '/api/categories/delete') {
    try {
      const { category, fallbackCategory = 'General' } = await readRequestBody(req);
      if (!category) {
        return sendJSON(res, 400, { error: 'Category name is required.' });
      }

      const files = scanDirectory(config.localmdDir);
      let count = 0;

      for (const f of files) {
        const raw = fs.readFileSync(f.fullPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(raw);
        if (frontmatter.category && frontmatter.category.trim().toLowerCase() === category.trim().toLowerCase()) {
          frontmatter.category = fallbackCategory.trim();
          frontmatter.updated = new Date().toISOString().split('T')[0];
          fs.writeFileSync(f.fullPath, stringifyFrontmatter(frontmatter, body), 'utf-8');
          count++;
        }
      }

      return sendJSON(res, 200, { success: true, updatedCount: count, fallbackCategory });
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // POST /api/tags/rename (Batch rename a tag across all files)
  if (method === 'POST' && pathname === '/api/tags/rename') {
    try {
      const { oldTag, newTag } = await readRequestBody(req);
      if (!oldTag || !newTag) {
        return sendJSON(res, 400, { error: 'Both oldTag and newTag are required.' });
      }

      const oTag = oldTag.trim().toLowerCase();
      const nTag = newTag.trim().toLowerCase();
      const files = scanDirectory(config.localmdDir);
      let count = 0;

      for (const f of files) {
        const raw = fs.readFileSync(f.fullPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(raw);

        let modified = false;
        if (Array.isArray(frontmatter.tags)) {
          const index = frontmatter.tags.findIndex(t => String(t).trim().toLowerCase() === oTag);
          if (index !== -1) {
            frontmatter.tags[index] = nTag;
            frontmatter.tags = Array.from(new Set(frontmatter.tags));
            modified = true;
          }
        }

        // Also check if body has #oldtag
        const regex = new RegExp(`(^|\\s)#${oTag}(?=$|\\s|[.,;:!?])`, 'gi');
        let newBody = body;
        if (regex.test(body)) {
          newBody = body.replace(regex, `$1#${nTag}`);
          modified = true;
        }

        if (modified) {
          frontmatter.updated = new Date().toISOString().split('T')[0];
          fs.writeFileSync(f.fullPath, stringifyFrontmatter(frontmatter, newBody), 'utf-8');
          count++;
        }
      }

      return sendJSON(res, 200, { success: true, updatedCount: count });
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // POST /api/rescan (Force refresh)
  if (method === 'POST' && pathname === '/api/rescan') {
    const resources = getAllResources();
    return sendJSON(res, 200, { success: true, count: resources.length });
  }

  // --- STATIC FILE SERVING ---
  const publicDir = path.join(__dirname, 'public');
  let requestedFile = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.join(publicDir, requestedFile);

  // Security check: ensure within publicDir
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA fallback to index.html if not an API route
  const indexHtml = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexHtml).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start Server with auto-port fallback
function startServer(port) {
  server.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`  NOTION RESOURCE HUB (Offline Edition)`);
    console.log(`==================================================`);
    console.log(`  Local URL:        http://localhost:${port}`);
    console.log(`  Markdown Folder:  ${config.localmdDir}`);
    console.log(`  Default Admin:    admin (toggle in UI)`);
    console.log(`==================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(config.port || DEFAULT_PORT);
