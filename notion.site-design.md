---
version: alpha
name: Notion Light
description: A clean, high-contrast productivity system with a calm white canvas, black typography, and a vivid blue action color.
colors:
  primary: "#0075de"
  primary-60: "#e6f3fe"
  primary-90: "#005bab"
  secondary: "#000000"
  tertiary: "#f5f5f5"
  neutral: "#ffffff"
  surface: "#ffffff"
  on-surface: "#000000"
  error: "#d92d20"
  border: "#0000001a"
typography:
  headline-display:
    fontFamily: NotionInter
    fontSize: 96px
    fontWeight: 600
    lineHeight: 100px
    letterSpacing: -4.6px
  headline-lg:
    fontFamily: NotionInter
    fontSize: 59px
    fontWeight: 600
    lineHeight: 71px
    letterSpacing: -1.875px
  headline-md:
    fontFamily: NotionInter
    fontSize: 37px
    fontWeight: 400
    lineHeight: 44px
  headline-sm:
    fontFamily: NotionInter
    fontSize: 23px
    fontWeight: 400
    lineHeight: 28px
  body-lg:
    fontFamily: NotionInter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: NotionInter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: NotionInter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-lg:
    fontFamily: NotionInter
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
  label-md:
    fontFamily: NotionInter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  label-sm:
    fontFamily: NotionInter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 24px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 32px
  lg: 80px
  xl: 140px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "6px 15px"
    height: "38px"
  button-secondary:
    backgroundColor: "{colors.primary-60}"
    textColor: "{colors.primary-90}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "6px 15px"
    height: "38px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  chip:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Notion Light

## Overview
Notion’s visual language is minimalist, crisp, and highly functional, with a strong editorial feel rather than a playful one. The interface is designed for a broad productivity audience, from individuals to teams, and it emphasizes clarity, speed, and trust. The overall tone is spacious and calm, with a bold headline system and restrained UI chrome that keeps attention on content and actions.

## Colors
- **Primary (#0075de):** The signature action blue used for primary calls to action like “Get Notion free,” selected states, and key affordances. It should feel energetic but not loud.
- **Primary soft (#e6f3fe):** A pale blue wash used for secondary actions and subtle emphasis, especially where the interface needs a gentle interactive cue.
- **Primary dark (#005bab):** A deeper blue used for strong text or active emphasis against the light blue treatment.
- **Secondary (#000000):** The core ink color for headings, body text, icons, and most interface lines. The system relies on black for maximum legibility and a clean, editorial look.
- **Tertiary (#f5f5f5):** A soft neutral gray used for low-emphasis backgrounds, hover surfaces, and lightweight chip treatments.
- **Neutral / Surface (#ffffff):** The dominant canvas color. White space is essential to the brand and should remain the default background everywhere possible.
- **On-surface (#000000):** The main foreground color on white or very light surfaces, maintaining the system’s stark contrast.
- **Border (#0000001a):** A very light black border used to define cards and containers without adding visual weight.
- **Error (#d92d20):** Reserved for destructive or invalid states; use sparingly so it does not compete with the calm core palette.

## Typography
The system is built around NotionInter, with Inter as a practical fallback for consistent, modern sans-serif rendering. Headlines use heavy negative tracking and large sizes to create a confident, product-led landing page voice, while body text stays compact and readable. The hierarchy is clean: `headline-display` and `headline-lg` are bold and tight, `headline-md` and `headline-sm` become lighter and more conversational, and body/label styles provide utility without visual noise. There is no visible uppercase-heavy branding; instead, the system relies on sentence case and precise spacing for polish.

## Layout
The layout is centered and spacious, with a wide hero composition and generous vertical breathing room. Content appears to live in a fixed or semi-fluid max-width container, while the hero and product mockup scale within a large white page field. Spacing follows a pronounced rhythm: small internal gaps use `xs` and `sm`, section separation uses `md`, and major page transitions jump to `lg` and `xl`. Cards and panels use comfortable internal padding, with 24px being a strong default for contained content.

## Elevation & Depth
The system is intentionally flat. Depth is created through contrast, borders, and layered white panels rather than dramatic shadows. When elevation is needed, it is subtle: a faint border plus slight tonal separation is preferred over heavy drop shadows. This keeps the UI feeling modern, light, and highly legible.

## Shapes
The corner language is soft but disciplined. Interactive controls use `rounded.md` for approachable buttons, while cards and larger containers use `rounded.lg` for a slightly more open, friendly feel. Chips and pills can go fully rounded with `rounded.full`, but the overall geometry remains restrained and rectangular rather than bubbly.

## Components
Buttons are the clearest expression of hierarchy. `button-primary` is the main CTA style: solid blue, white text, medium-weight label typography, 38px height, and compact horizontal padding. `button-secondary` uses the pale blue fill with dark blue text for less dominant actions. `button-link` is minimal and should appear as plain text or understated navigation, with no fill and no border radius.

Cards should use `card` styling: white background, faint border, `rounded.lg`, and 24px padding. They should feel clean and modular, with content organized in concise blocks and enough internal whitespace to breathe. Inputs should remain understated and aligned with the card language: white surface, subtle border or tonal separation, `rounded.md`, and body-sized text.

Chips and status pills should use `chip` styling: soft neutral or contextual fills, small label text, and fully rounded edges. They work best as compact metadata rather than attention-grabbing UI. Lists and navigation items should stay simple, using low-contrast icons, light separators, and clear spacing instead of decorative treatments.

## Do's and Don'ts
- Do keep layouts spacious and centered, with strong use of white space around major content.
- Do use black typography for most text and reserve blue for true actions and key states.
- Do keep borders subtle and shadows minimal so the interface feels crisp rather than heavy.
- Do use large, confident headlines with tight letter spacing for hero and section messaging.
- Don't introduce saturated secondary colors that compete with the primary blue.
- Don't over-round cards or controls; the system should feel precise, not playful.
- Don't rely on shadow-heavy elevation to separate surfaces; use borders and spacing instead.
- Don't crowd content into dense blocks when the source pattern clearly favors breathing room.