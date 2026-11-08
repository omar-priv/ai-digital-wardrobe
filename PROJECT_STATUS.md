# Project Status — AI Digital Wardrobe

Last updated: 2026-11-08

## Product constraints
- Arabic-first, RTL and responsive.
- Local-first IndexedDB; clothing records, photos and optional profile remain on the current browser origin/device.
- No paid API or remote AI is required for core features.
- Profile fields are optional and local-only. No body-photo upload.
- Cloud sync is not implemented.

## Implemented features
- [x] Wardrobe management — add/edit/delete, photos, categories, search and filters.
- [x] Local profile — optional height and style notes.
- [ ] Revised outfit engine and recommendation UI implemented on branch `feat/smart-outfit-redesign`: local color-harmony scoring, season/style compatibility, ranked and diversified combinations, optional shoes/layers/accessories, and reason labels. Build/test verification for this branch is pending.
- [ ] Optional garment style metadata and style/season filters added; old records and v1 backups remain supported. Backup regression tests added but not yet run on this branch.
- [x] JSON backup export and validated merge import.
- [x] Atomic backup restore — all records and optional profile are written in one IndexedDB transaction.
- [x] IndexedDB writes resolve only after transaction completion.
- [x] Backup validation — field bounds, supported image MIME types, bounded base64 and duplicate ID rejection.
- [x] Export memory guard for large photo collections.
- [x] Editorial RTL redesign, contained/lazy garment photos, mobile bottom navigation, narrow-screen wrapping and safe-area spacing.
- [x] Accessibility source improvements — semantic main landmark, skip link, labelled filter group, modal focus behavior and distinct storage failure state.
- [x] Design handoff — DESIGN.md and DESIGN_SYSTEM.md.
- [x] Agent handoff — AGENTS.md, project audit skill and 27 skill entrypoints under .agents/skills/.
- [x] GitHub Copilot review guidance under .github/skills/code-review/SKILL.md.
- [x] Regression tests for backup validation, outfit rules and IndexedDB import/rollback.
- [x] CI workflow runs regression tests and production build; actions are pinned and token permissions are read-only.

## Verification state
- [ ] New branch changes (`feat/smart-outfit-redesign`) have not yet been run through `npm test` or `npm run build` in a local/CI environment.
- [ ] Visual, RTL and keyboard verification of the revised outfit page has not been run in a real browser.
- [x] GitHub Actions: 3 test files, 13 tests passed.
- [x] GitHub Actions: TypeScript project check and Vite production build passed on revision cff62321cd205bb39ad3df1b73603b53f88a5b3e.
- [ ] Real-browser screenshots, device-width checks, screen-reader checks and 200% zoom checks.
- [ ] Independent subagent review; this environment did not expose parallel subagent execution.
- [ ] package-lock.json is not committed yet. CI currently uses npm install, not npm ci.

## Known limitations
- Wardrobe data belongs to one browser/device; there is no cloud sync.
- Outfit matching uses transparent local rules for color, season and manually selected style labels. It does not analyze garment images or determine fit, cut or occasion; results depend on the accuracy of the user's labels.
- Delete has confirmation but no undo.
- Browser storage can be cleared; export backups regularly.
- The manifest includes a local SVG icon, but PWA installability and offline behavior are not verified.

## Next required checks
1. Commit package-lock.json and switch CI from npm install to npm ci.
2. Test 320px, 360px, 390px, 768px, 1024px and desktop widths in a browser.
3. Test keyboard-only use, dialog focus, file chooser, backup round-trip and storage failure in a real browser.
4. Only then mark browser/device verification complete.

## Handoff
Read AGENTS.md, README.md, DESIGN.md, DESIGN_SYSTEM.md, CODE_REVIEW.md and docs/ARCHITECTURE.md. For a full review, start at .agents/skills/wardrobe-full-audit/SKILL.md.
