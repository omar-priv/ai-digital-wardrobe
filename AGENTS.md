# Agent instructions — AI Digital Wardrobe

Before changing the interface, read this file, `README.md`, `DESIGN_SYSTEM.md`, `PROJECT_STATUS.md` and `docs/ARCHITECTURE.md`.

## Product constraints
- Arabic-first, right-to-left, mobile-first, and usable on desktop.
- Local-first: clothing records and images stay in IndexedDB on the current browser/device.
- Do not upload photos, body details, or wardrobe contents to a server or AI provider without explicit opt-in.
- Do not add paid APIs, accounts, tracking, or analytics to the core product.
- Be honest: static hosting does not synchronize local IndexedDB between devices or guarantee unlimited uptime.
- Keep backup export/import compatible; bump its version deliberately when the schema changes.

## Design references to consult
These are upstream agent skills, not runtime dependencies:
- Anthropic `frontend-design`: https://github.com/anthropics/skills/tree/main/skills/frontend-design
- Jakub Krehel `better-interface`: https://github.com/jakubkrehel/skills/tree/main/skills/better-interface
- `better-layout`: https://github.com/jakubkrehel/skills/tree/main/skills/better-layout
- `better-accessibility`: https://github.com/jakubkrehel/skills/tree/main/skills/better-accessibility
- `better-colors`: https://github.com/jakubkrehel/skills/tree/main/skills/better-colors
- `better-typography`: https://github.com/jakubkrehel/skills/tree/main/skills/better-typography
- `interface-review`: https://github.com/jakubkrehel/skills/tree/main/skills/interface-review

## Required implementation/review workflow
1. Establish the user task and design direction before editing. Avoid generic dashboard patterns.
2. Preserve the established semantic color and spacing tokens; use CSS logical properties for direction-dependent layout.
3. Review Arabic RTL at 320px, 360px, tablet and desktop widths. Check long labels, mixed Arabic/Latin text, empty/loading/error states and modal overflow.
4. Check keyboard operation, visible focus, accessible names, modal Escape behavior and focus return. Respect `prefers-reduced-motion`.
5. Review local data safety: image object-URL cleanup, import validation, backup compatibility, IndexedDB failures and destructive confirmations.
6. Run `npm install` and `npm run build`. Do not report success unless the commands actually pass.
7. **Independent review:** if the coding environment supports subagents, start a read-only reviewer after implementation. Give it the changed commit and this brief; ask it to inspect RTL/layout, accessibility, contrast, data safety and TypeScript without editing files. The implementer fixes findings and reruns checks. If subagents are unavailable, perform a clearly separate second review pass and state that no separate agent ran.
8. Update `CODE_REVIEW.md` and `PROJECT_STATUS.md` with verified facts, not assumptions.

## Definition of done
- Build passes.
- No known high-severity accessibility, RTL or data-loss issue remains.
- Empty, loading, error, add, edit, delete, backup and import states are covered.
- Desktop and narrow mobile widths have been inspected in a browser.
- Verification limitations are explicitly listed.
