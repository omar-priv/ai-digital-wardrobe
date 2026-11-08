---
name: wardrobe-design-review
description: Design, improve and independently review the Arabic RTL Digital Wardrobe interface, including mobile layout, accessibility, visual consistency and local-data safety.
---

# Wardrobe design and review

Use this skill when designing or changing this product's UI, reviewing a UI change, or preparing a handoff to another coding agent.

## Product identity
Create a calm, editorial digital wardrobe archive. Clothing photos should be the primary visual content. Preserve Arabic-first RTL, the ink/lavender design tokens, local-first privacy, and mobile usability. Do not revert to a generic SaaS dashboard, acid-green-on-black template, or icon-only mobile navigation.

## Before coding
Read `AGENTS.md`, `DESIGN_SYSTEM.md`, `README.md`, `PROJECT_STATUS.md`, and `docs/ARCHITECTURE.md`. Read the relevant upstream skill instructions:
- https://github.com/anthropics/skills/tree/main/skills/frontend-design
- https://github.com/jakubkrehel/skills/tree/main/skills/better-interface
- https://github.com/jakubkrehel/skills/tree/main/skills/better-layout
- https://github.com/jakubkrehel/skills/tree/main/skills/better-accessibility
- https://github.com/jakubkrehel/skills/tree/main/skills/better-colors
- https://github.com/jakubkrehel/skills/tree/main/skills/better-typography
- https://github.com/jakubkrehel/skills/tree/main/skills/interface-review

## Build and verify
1. Write a short design plan before changing the UI.
2. Keep CSS direction-aware with logical properties and verify Arabic/English mixed text.
3. Check empty, loading, error, populated, add/edit, and destructive states.
4. Check 320px, 360px, tablet and desktop widths; look for clipping and horizontal overflow.
5. Check keyboard-only operation, focus visibility, accessible labels, modal focus trap, Escape and focus return.
6. Check reduced motion and text contrast; measure contrast instead of guessing.
7. Review object URL lifecycle, IndexedDB failure paths, import validation and backup compatibility.
8. Run the project build. Never claim tests passed unless they ran.

## Independent reviewer handoff
When subagents are supported, spawn a second read-only reviewer after implementation. It must not edit source. Ask it to return exact file/line evidence for RTL, accessibility, contrast, interaction and data-loss risks. The implementer then fixes findings and reruns the build. If no subagent feature exists, say that a separate agent did not run and perform a distinct self-review instead.
