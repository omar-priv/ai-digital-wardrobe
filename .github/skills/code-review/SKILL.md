---
name: code-review
description: Review the AI Digital Wardrobe codebase for correctness, security, data integrity, tests, RTL, design and accessibility before merge or release.
---

# Wardrobe Full Audit

This project skill orchestrates the installed upstream skills. It is tailored to this repository, not a generic checklist.

## Mandatory project context
Read AGENTS.md, README.md, PROJECT_STATUS.md, DESIGN_SYSTEM.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, and CODE_REVIEW.md before judging the implementation.

Product invariants:
- Arabic-first, RTL, responsive from 320 CSS px to desktop.
- Local-first: wardrobe records, photos and optional profile remain in IndexedDB on the current browser origin/device.
- Never add remote image/font/analytics/API calls or cloud sync without explicit opt-in.
- Do not describe deterministic outfit rules as AI or style intelligence.
- Backups must validate fully before writes; importing must not silently destroy existing records.
- No unverified claims about PWA installability, offline guarantees, sync, accessibility compliance or build status.

## Audit sequence

### 1. Establish a fixed scope
Inspect the entire tracked application: source, configuration, package manifests, CI, public assets, docs and tests. Exclude .agents/skills/** from application correctness findings, but verify the skill bundle and references separately. Record the exact main commit SHA. Read every source file; do not infer missing files from expected paths.

### 2. Map the system
Use agent-code-analysis and deep-code-audit methods:
- Map entry points, UI state, IndexedDB, import/export, outfit generation, build/deploy and dependencies.
- Trace complete journeys: add/edit/delete item; photo lifecycle; export/import; profile save; outfit generation; initial load and failure states.
- Identify data contracts and paired operations (create/revoke object URLs, serialize/deserialize backups, open/close DB transactions).

### 3. Correctness and debugging
Use awesome-code-review, agent-code-review, awesome-bug-fix and agent-debugging.
- Review boundary values, invalid data, async races, transaction completion/abort, stale UI state, error visibility and resource cleanup.
- Every claimed bug must include the exact file/line, triggering input/state, actual failure path, and a deterministic fix.
- Reproduce where possible. Do not edit before locating the divergence point.

### 4. Data, privacy and security
Use awesome-security-audit, agent-security-analysis, awesome-privacy-audit, awesome-dependency-audit and Cloudflare security-audit references.
- Trace user-controlled file and backup data to parsers, Blob creation, DOM rendering and IndexedDB.
- Check data minimisation, local-only claims, browser-origin boundaries, export leakage, unsafe MIME handling, oversized inputs, dependency/CI supply-chain risks.
- Distinguish confirmed vulnerabilities from hardening suggestions and unknown deployment facts.
- Never execute untrusted project code unless a suitable isolated sandbox is available. Never probe production or external services as part of a source audit.

### 5. Tests and regression proof
Use awesome-test-gap-audit, awesome-test-writing, agent-unit-testing, agent-integration-testing, agent-browser-testing and awesome-regression-sweep.
- Test real behavior, not implementation details. Include empty/one/many, boundaries, malformed imports, storage failures, season compatibility, keyboard and narrow-screen journeys.
- Each new test must be capable of failing when the corresponding defect is reintroduced.
- Run the repository's actual scripts from package.json; do not claim a test ran if it did not.
- Report skipped checks with exact reason. A green build is not a substitute for browser or behavior tests.

### 6. Design, RTL and accessibility
Use design-review, awesome-accessibility-audit, agent-accessibility-review and wardrobe-design-review.
- Review visual hierarchy, image treatment, spacing, responsive layout, Arabic typography, RTL alignment, text wrapping, empty/loading/error states and design-token consistency.
- Inspect at 320, 360, 768, 1024 and desktop widths when browser tooling exists.
- Keyboard-only test all flows; verify visible focus, dialog focus/escape/return, labels, accessible names, announcements, reduced motion, 200% zoom and contrast.
- Prefer native semantic elements. Do not claim WCAG compliance from static inspection alone.

### 7. Performance and architecture
Use awesome-performance-audit, awesome-architecture-audit, awesome-database-audit only where relevant, and the code-audit lenses.
- Measure before claiming performance defects.
- Review IndexedDB lifecycle, large image/backup memory, bounded work, dependency direction, duplication and feature complexity.
- Do not invent database concerns for an IndexedDB-only app; adapt only the relevant integrity and transaction principles.

### 8. Synthesis, repair and re-review
- First produce an evidence-backed finding list ranked P0/P1/P2/P3 (or Critical/High/Medium/Low).
- Verify every high-priority finding against source and trace all sibling variants.
- Apply only confirmed, in-scope fixes. Avoid unrelated rewrites.
- Add regression tests for fixed defects.
- Re-run typecheck, tests and build after each coherent batch.
- Re-review the changed code and design from a fresh perspective. If subagents are unavailable, do separate read-only passes and explicitly state that no independent agent ran.
- Update CODE_REVIEW.md, PROJECT_STATUS.md, architecture/design docs only with verified facts.

## Report format
Write .audit/report.md with:
1. Commit and scope.
2. Findings table: ID, severity, confidence, file:line, status.
3. Each finding: evidence, triggering scenario, impact, smallest fix, regression test.
4. Design/RTL/accessibility findings separately from code defects.
5. Tests/build/browser checks: PASS / FAIL / NOT RUN with evidence.
6. NOT ASSESSED items and why.
7. Final verdict: SHIP / FIX / BLOCK.

Never report "fully clean", "fully secure", "fully accessible" or "all tested" unless the corresponding evidence actually exists.
