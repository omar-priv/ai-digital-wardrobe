---
name: deep-code-audit
description: Perform a structured multi-lens codebase audit with evidence, cross-module tracing, verification and prioritized remediation. Use for full-project or subsystem reviews.
---

# Deep Code Audit

This is an original project skill informed by general multi-lens audit practice. For this repository, use it together with wardrobe-full-audit.

## 1. Scope and inventory
- Record the exact commit being reviewed.
- Inspect tracked application files, package scripts, CI, public assets, configuration, tests and project docs.
- Exclude vendored skill instructions from application defect counts.
- Build a file/module map: UI, domain rules, persistence, import/export, configuration, dependencies, build and deployment.
- Trace the complete user flows and lifecycle pairs rather than reviewing isolated snippets.

## 2. Independent review lenses
Perform separate passes. When a runtime can spawn subagents, assign each lens a read-only reviewer and ask for evidence; otherwise run each pass sequentially and disclose that no independent subagent ran.

### Code health
Check consistency, naming, duplication, complexity, dead code, error handling and whether helpers are placed at the right layer.

### Cross-module contracts
Trace types and data from UI input through validation, domain logic, persistence, export/import and rendering. Check that every producer and consumer agrees on the same shape and constraints.

### Correctness
Check boundary values, state transitions, async ordering, transaction commit/abort, error paths, stale state, compatibility and failure recovery. Reproduce defects when safe.

### Security and privacy
Identify trust boundaries and attacker-controlled inputs. Trace files, JSON, URLs, text and metadata to parsers, storage and rendering. Distinguish a confirmed vulnerability from a hardening suggestion or an unknown deployment fact.

### Performance
Inspect large data, repeated work, unbounded loops, image/Blob memory, rendering churn and cleanup. Measure before asserting a performance defect.

### Tests
Compare tests with critical user journeys and failure paths. A test must fail if the defect returns. Separate unit, integration, browser and real-device coverage.

## 3. Evidence contract
Every finding must state:
- ID and priority (P0 critical, P1 high, P2 medium, P3 low).
- Exact file and line or symbol.
- Triggering input/state and concrete failure path.
- Impact on the user, data, security or maintainability.
- Confidence and whether reproduced.
- Smallest safe fix and a regression test.

Do not report style preferences as bugs. Do not inflate severity. Merge duplicate findings with the same root cause.

## 4. Verification
- Run only the commands declared by the repository.
- Do not claim a test or build ran without its actual result.
- Re-run tests and build after fixes.
- Review the changed code again from a separate perspective.
- Record unavailable browser, device, screen-reader or sandbox checks as NOT RUN.

## 5. Report
Write .audit/report.md with scope/commit, system map, prioritized findings, fixed items, remaining risks, tests and build results, and coverage gaps. End with SHIP, FIX or BLOCK. Never claim a codebase is bug-free.
