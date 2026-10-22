# Graphify Master Reference & AI Workflow Guide

I am working on this repository[cite: 1]. I have pre-generated a Graphify graph of the codebase architecture at `/graphify.md` and `/graphify.json`[cite: 1].

Before making changes or diagnosing issues:
1. Refer to `/graphify.md` to understand the relevant code clusters, entry points, and module relationships[cite: 1].
2. Use the dependency graph to trace how changes in one file affect connected components[cite: 1].
3. Keep your proposed changes aligned with the established architecture shown in the graph[cite: 1].

---

## 1. Core Graph Generation & Updates

| Command | Description |
| :--- | :--- |
| `graphify .` | Scans the current directory, analyzes file relationships/imports, and generates or updates `graphify.json` and `graphify.md`. |
| `graphify ./src` | Restricts graph generation to a specific subfolder (useful for monorepos or isolating core app modules). |

---

## 2. Custom Output & Filtering Options

| Command | Description |
| :--- | :--- |
| `graphify . --output docs/codebase-graph` | Customizes output path/filenames (e.g., outputs `docs/codebase-graph.json` and `docs/codebase-graph.md`). |
| `graphify . --exclude "tests/**,*.spec.ts"` | Ignores specified file patterns, test files, or generated assets to keep the architecture map focused. |

---

## 3. System & Inspection Commands

| Command | Description |
| :--- | :--- |
| `graphify --version` | Displays the installed CLI version. |
| `graphify --help` | Lists all supported flags, configuration syntax, and available options. |

---

## 4. Recommended AI Prompt Templates

Use these starter prompts when opening a new chat session with your AI assistant[cite: 1]:

### Standard Session Starter
> "I am working on this repository[cite: 1]. I have pre-generated a codebase map at `/graphify.md`[cite: 1]. Please review `/graphify.md` to understand our module structure before suggesting changes[cite: 1]."

### Feature Implementation / Refactoring
> "Before we implement [Feature Name], check `/graphify.md` for the related modules[cite: 1]. Identify which files will be affected and trace any downstream dependencies that might break[cite: 1]."

### Bug Diagnosis
> "We are experiencing an issue with [Module/Component][cite: 1]. Consult `/graphify.md` to identify all connected components and help isolate where the failure might originate[cite: 1]."

---

## 💡 Best Practices & Maintenance

1. **Refresh Before New Sessions:** Always run `npx graphify .` after pulling changes from your main branch, completing major refactors, moving files, or adding new features[cite: 1].
2. **Commit `graphify.md` to Git:** Keep `graphify.md` checked into version control so team members and AI assistants immediately have access to the architecture map upon cloning[cite: 1].
3. **Add `graphify.json` to `.gitignore` (Optional):** If you prefer to reduce repository size, commit only `graphify.md` and ignore the raw JSON file[cite: 1].