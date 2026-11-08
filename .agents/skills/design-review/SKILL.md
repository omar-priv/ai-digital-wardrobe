---
name: design-review
description: Review and improve the visual design, responsive behavior, Arabic RTL quality and accessibility of the Digital Wardrobe using the actual source as evidence.
---

# Design Review

This is an original project-specific review skill. Read DESIGN.md and DESIGN_SYSTEM.md first, then inspect src/styles.css, src/App.tsx, index.html and public assets.

## Product design intent
- A calm, editorial wardrobe archive; the garments, not the UI chrome, are the visual focus.
- Arabic-first RTL with readable mixed Arabic/Latin content.
- Soft porcelain and lavender surfaces with muted indigo actions.
- Local-first privacy is visible and truthful.
- Avoid generic SaaS dashboards, overdecorated cards, neon colors and icon-only mobile navigation.

## Review passes
1. **Hierarchy:** can users quickly find their wardrobe, add a piece, search, filter, see outfit suggestions and manage their profile?
2. **Content states:** inspect empty, loading, storage-error, populated, filtered-empty, add/edit, import and confirmation states.
3. **Garment imagery:** preserve the full clothing item; check contain/crop behavior, placeholders, aspect ratios and object URL cleanup.
4. **Responsive layout:** inspect 320, 360, 390, 768, 1024 and desktop widths when browser tools are available. Check overflow, tap targets, safe areas, grid density and modal height.
5. **RTL and typography:** verify logical alignment, Arabic punctuation, numerals, long labels, text wrapping and English brand fragments. Avoid negative letter spacing on Arabic headings.
6. **Accessibility:** keyboard-only navigation, visible focus, skip link, semantic landmarks, accessible names, filter grouping, modal focus trap/Escape/return, live status, reduced motion and zoom.
7. **Contrast:** calculate actual foreground/background pairs from the source; distinguish text contrast from non-text focus indicators. Do not claim a complete WCAG audit from selected pairs.
8. **Consistency:** compare CSS tokens, browser theme color, manifest colors, icons, design docs and actual component states.

## Rules for changing design
- Prefer small, coherent changes over a wholesale rewrite.
- Preserve content and data behavior while changing presentation.
- Use CSS logical properties for direction-sensitive layout.
- Keep touch controls visible on touch devices.
- Avoid remote fonts, analytics and assets unless explicitly approved.
- Update DESIGN.md when the source design system materially changes.

## Reporting
Separate visual defects, accessibility barriers and subjective polish suggestions. Give exact selectors/components and viewport/state context. State whether the review was source-only or browser-verified.
