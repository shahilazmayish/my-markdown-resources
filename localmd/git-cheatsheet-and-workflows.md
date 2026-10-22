---
title: Git Cheatsheet & Productivity Workflows
category: DevTools
tags: [git, devtools, cheatsheet, terminal, workflows]
description: Everyday git commands, branching strategies, stash tricks, and undo techniques for rapid development.
date: 2026-10-21
---

# Git Cheatsheet & Workflows

A practical cheatsheet for everyday git commands and branch management.

---

## 1. Quick Branching
```bash
# Create and switch to new branch
git checkout -b feature/notion-redesign

# List all local branches with last commit
git branch -v
```

## 2. Stashing Changes
```bash
# Stash with descriptive message
git stash push -m "Work in progress on search filter"

# List stashes
git stash list

# Apply and drop the latest stash
git stash pop
```

## 3. Undoing Mistakes Safely
```bash
# Amend the last commit without changing message
git commit --amend --no-edit

# Unstage a file keeping modifications
git restore --staged <file>

# Revert a commit by creating a new inverse commit
git revert <commit-hash>
```

#git #cheatsheet #terminal
