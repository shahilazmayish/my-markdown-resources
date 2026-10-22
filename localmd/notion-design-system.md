---
title: Notion Light Design System
category: Design Systems
tags: [design, notion, css, typography, ui, tokens]
description: Design tokens, typography hierarchy, colors, and layout rules derived from the official Notion Light specification.
date: 2026-10-21
---

# Notion Light Design System

A clean, high-contrast productivity system with a calm white canvas, black typography, and a vivid blue action color `#0075de`.

---

## Core Color Tokens

- **Primary (`#0075de`)**: The signature action blue used for primary CTA buttons, active state highlights, and key links.
- **Primary Soft (`#e6f3fe`)**: Pale blue tint used for secondary actions and subtle emphasis badges.
- **Primary Dark (`#005bab`)**: High-contrast blue used for text on soft backgrounds.
- **Canvas / Surface (`#ffffff`)**: Dominant pure white space.
- **On-Surface (`#000000`)**: Solid black for razor-sharp typography.
- **Tertiary (`#f5f5f5`)**: Soft neutral gray for chips, code backgrounds, and table headers.
- **Border (`rgba(0, 0, 0, 0.1)`)**: Subtle boundary definition without visual weight.
- **Error (`#d92d20`)**: Reserved for destructive actions.

---

## Typography Hierarchy

| Style | Font Size | Line Height | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Headline Display** | 96px | 100px | 600 | -4.6px |
| **Headline Lg** | 59px | 71px | 600 | -1.875px |
| **Headline Md** | 37px | 44px | 400 | Normal |
| **Headline Sm** | 23px | 28px | 400 | Normal |
| **Body Lg** | 18px | 28px | 400 | Normal |
| **Body Md** | 14px | 20px | 400 | Normal |
| **Label Sm** | 14px | 20px | 500 | 0px |

---

## UI Components

### 1. Primary Button
- Background: `#0075de`
- Text: `#ffffff`
- Corner radius: `8px` (`rounded.md`)
- Height: `38px`
- Padding: `6px 15px`

### 2. Secondary Button
- Background: `#e6f3fe`
- Text: `#005bab`
- Corner radius: `8px`
- Height: `38px`

### 3. Chip / Badge
- Background: `#f5f5f5`
- Text: `#000000`
- Corner radius: `9999px` (`rounded.full`)
- Padding: `4px 10px`
- Font: `14px`, 500 weight

#design #tokens #styleguide
