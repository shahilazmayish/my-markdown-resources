---
version: alpha
name: Piszczek Terminal Dark
description: A minimal, high-contrast personal brand system with terminal-inspired neon accents and editorial typography.
colors:
  primary: "#00FF94"
  secondary: "#E2E8F0"
  tertiary: "#FFFFFF"
  neutral: "#030303"
  surface: "#090B0A"
  on-surface: "#FFFFFF"
  muted: "#8A93A3"
  border: "#FFFFFF1F"
  border-soft: "#FFFFFF1A"
  error: "#FF5F5F"
  success: "#00FF94"
typography:
  headline-display:
    fontFamily: "Space Grotesk"
    fontSize: 86.4px
    fontWeight: 700
    lineHeight: 89.856px
    letterSpacing: -2.592px
  headline-lg:
    fontFamily: "Space Grotesk"
    fontSize: 55.2px
    fontWeight: 700
    lineHeight: 59.616px
    letterSpacing: -1.932px
  headline-md:
    fontFamily: "Space Grotesk"
    fontSize: 28.8px
    fontWeight: 700
    lineHeight: 33.12px
  headline-sm:
    fontFamily: "Space Grotesk"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 22px
  body-lg:
    fontFamily: "JetBrains Mono"
    fontSize: 18px
    fontWeight: 300
    lineHeight: 28px
    letterSpacing: 0.06em
  body-md:
    fontFamily: "JetBrains Mono"
    fontSize: 14px
    fontWeight: 300
    lineHeight: 22.4px
    letterSpacing: 1.68px
  body-sm:
    fontFamily: "JetBrains Mono"
    fontSize: 12px
    fontWeight: 300
    lineHeight: 18px
    letterSpacing: 0.08em
  label-lg:
    fontFamily: "Space Grotesk"
    fontSize: 15px
    fontWeight: 700
    lineHeight: 18px
  label-md:
    fontFamily: "Space Grotesk"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: "Space Grotesk"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 12px
    letterSpacing: 0.12em
  mono-kicker:
    fontFamily: "JetBrains Mono"
    fontSize: 12px
    fontWeight: 300
    lineHeight: 16px
    letterSpacing: 0.14em
  mono-stat:
    fontFamily: "JetBrains Mono"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: 0.02em
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 10px
  xl: 14px
  full: 9999px
spacing:
  xs: 2px
  sm: 10px
  md: 18px
  lg: 24px
  xl: 40px
  gutter: 26px
  section: 80px
components:
  button-primary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 16px 32px
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 16px 32px
    height: 44px
  button-secondary:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 16px 32px
    height: 44px
  button-secondary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 16px 32px
    height: 44px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 0px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: 26px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px 14px
  chip:
    backgroundColor: "#101010"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 8px 14px
---

# Piszczek Terminal Dark

## Overview
This system feels like a dark, confident terminal interface translated into a personal brand site. It is minimal, sharp, and highly technical, with a strong editorial hierarchy and neon-green signal color used sparingly for emphasis and status. The mood is serious and high-performance rather than playful, with compact spacing and dense information blocks that still remain readable.

## Colors
- **Primary (#00FF94):** The electric terminal green used for highlights, active states, status dots, accent text, and small glows. It should feel like a signal, not a flood.
- **Secondary (#E2E8F0):** A cool gray-white used for supporting text, metadata, and subdued UI labels on dark surfaces.
- **Tertiary (#FFFFFF):** Crisp white reserved for the strongest emphasis, especially primary headlines and important UI contrast.
- **Neutral (#030303):** The near-black base canvas that anchors the entire experience and gives the neon accent maximum contrast.
- **Surface (#090B0A):** A slightly lifted black-green surface for cards, terminal windows, and inset panels.
- **On-surface (#FFFFFF):** The ideal foreground color for high-emphasis text and key button labels placed on dark surfaces.
- **Muted (#8A93A3):** A restrained gray-blue used for less prominent supporting copy where the interface needs to recede.
- **Border (#FFFFFF1F):** A faint hairline border that defines cards and windows without adding visual weight.
- **Border-soft (#FFFFFF1A):** An even subtler divider tone for understated outlines and button edges.
- **Error (#FF5F5F):** A small but clear warm alert color for status indicators or destructive states.
- **Success (#00FF94):** Same tonal family as primary; use it for live/healthy system states and confirmation signals.

## Typography
Headlines use Space Grotesk and carry the brand voice: geometric, modern, and assertive. The largest sizes are heavy and tightly tracked, with negative letter spacing on display titles to create a compact, premium feel.

Body content uses JetBrains Mono to reinforce the terminal/code aesthetic. Paragraph text is intentionally light in weight with increased letter spacing, which gives it a technical readout quality rather than a conventional marketing tone.

Labels and navigation use Space Grotesk in bold or semibold weights so UI controls feel structured and dependable. Uppercase styling and wide tracking are part of the brand language, especially for navigation, stats, and small chips.

## Layout & Spacing
The layout is centered and wide, with generous negative space around a constrained hero composition. It behaves like a fixed-max-width editorial landing page rather than a fluid marketing grid, allowing the large headline, copy block, and terminal panel to breathe.

Spacing follows a restrained rhythm: 2px for micro-separations, then 10px, 18px, 24px, and 40px for progressively larger groupings. Section padding should feel substantial but not airy; the design prefers deliberate gaps and strong alignment over decorative whitespace.

Cards and terminal windows use internal padding around 26px, which gives them a dense but comfortable reading area. Use consistent gutters and avoid overly loose vertical spacing inside dense data sections.

## Elevation & Depth
Depth is handled primarily through contrast, borders, and subtle glow rather than layered shadows. The hero content sits on a nearly black background with faint star-like noise, while panels are separated by thin translucent outlines.

When depth is needed, use the soft green glow defined by the accent tone or a very large, low-opacity shadow like the one seen on the main terminal card. Avoid heavy material shadows; the system should feel flat, precise, and technical.

## Shapes
The shape language is quietly rounded, with small radii around 6px on buttons, cards, and panels. This keeps the interface from feeling brittle while preserving the sharp, mechanical personality.

Use full rounding only for status pills, chips, and pill-shaped indicators. Overall, the geometry should remain boxy and architectural rather than soft or playful.

## Components
Buttons are the most visible interactive element and should be compact, high-contrast, and confident. Use `button-secondary` as the main filled action style with white background and black text, and `button-primary` for dark, outlined utility actions on dark surfaces. Hover states should flip emphasis cleanly, using `button-primary-hover` and `button-secondary-hover` to preserve clarity. Standard sizing is 16px vertical padding, 32px horizontal padding, and a 44px minimum height.

Cards use the `card` token: dark surface, 1px subtle border, 6px radius, and 26px padding. Keep cards visually calm and content-forward; they should support terminal-like content, stats, or short editorial blocks without ornamental decoration.

Inputs should follow the same dark-surface logic as cards, with `input` using 6px radius, subtle contrast, and readable mono body text. Focus states should lean on the primary green rather than bright fills or heavy shadows.

Chips and pills should be small, fully rounded status capsules using the `chip` token. They are best for live indicators, category tags, or short callouts and should rely on the primary green for accent rather than multiple colors.

Links and tertiary controls should feel lightweight and code-like. Use transparent backgrounds, minimal padding, and underline or color-accent treatments rather than button chrome.

Navigation items should stay compact and uppercase-feeling, with mono or label typography and subdued colors until active. The experience should feel like a command bar, not a traditional top nav.

## Do's and Don'ts
- Do keep the background almost black and reserve neon green for highlights, statuses, and small emphasis points.
- Do use Space Grotesk for headlines, labels, and controls, and JetBrains Mono for body text and code-like content.
- Do preserve tight headline tracking and strong hierarchy; the hero title should feel engineered, not decorative.
- Do keep borders subtle and transparent so panels read as technical surfaces rather than boxed UI.
- Don't introduce bright secondary hues or multi-color branding that competes with the primary green.
- Don't use heavy drop shadows, glossy gradients, or glassmorphism effects.
- Don't increase radii dramatically; the system depends on restrained, near-square geometry.
- Don't make body text feel conversational or soft; it should retain the crisp, terminal-inspired tone.