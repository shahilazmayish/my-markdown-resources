---
description: Coding standards and guidelines for myResource codebase
always_on: true
---

# Codebase Rules & Standards

1. **Zero Dependencies for Node Server**:
   Keep `server.js` dependent strictly on Node.js built-in modules (`http`, `fs`, `path`, `url`) so it runs instantly on any machine without requiring `npm install`.

2. **Design System Compliance**:
   All new themes or UI adjustments must respect the design tokens established in:
   - `notion.site-design.md` (Notion Light and Dark themes)
   - `piszczek.pl-design.md` (Piszczek Terminal Dark theme)

3. **Frontmatter Safety**:
   When reading/writing markdown files to `localmd/`, always ensure YAML frontmatter is properly closed with `---` and that inline hashtags are accurately distinguished from markdown headings (`# Heading` vs `#hashtag`).
