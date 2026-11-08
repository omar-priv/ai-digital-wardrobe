# Project Agent Skills

These are 27 project-local Agent Skills in the standard .agents/skills/<name>/SKILL.md layout. They are instructions and reference material, not runtime dependencies.

## Main workflow
- wardrobe-full-audit — project-specific end-to-end code, data, design, RTL and accessibility audit.
- wardrobe-design-review — project design handoff and review.

## Code review and debugging
- awesome-code-review, agent-code-review, agent-code-analysis
- awesome-bug-fix, agent-debugging, awesome-root-cause
- deep-code-audit, deep-review, awesome-architecture-audit

## Tests and regression
- awesome-test-writing, awesome-test-gap-audit
- agent-unit-testing, agent-integration-testing, agent-browser-testing
- awesome-regression-sweep

## Security, privacy and supply chain
- awesome-security-audit, agent-security-analysis
- cloudflare-security-audit
- awesome-privacy-audit, awesome-dependency-audit
- awesome-database-audit

## Design and quality
- design-review
- awesome-accessibility-audit, agent-accessibility-review
- awesome-performance-audit

## Upstream sources
- khasky/awesome-agent-skills — https://github.com/khasky/awesome-agent-skills
- arjunprabhulal/agent-skills — https://github.com/arjunprabhulal/agent-skills
- pietz/skills — https://github.com/pietz/skills (methodology reference only; no source files copied because no explicit repository license was found)
- cloudflare/security-audit-skill — https://github.com/cloudflare/security-audit-skill
- coder/coder deep-review — https://github.com/coder/coder/tree/main/.agents/skills/deep-review

Original skill names, author metadata and license notices are preserved in copied files where supplied. Review upstream repositories for updates before redistributing or making public releases. These skills do not grant this ChatGPT session sub-agent execution, browser access or local shell access; use capabilities available in the coding-agent runtime.

The deep-review skill requires a runtime that can spawn parallel subagents. If that capability is absent, use the single-agent audit workflow and do not claim a multi-agent review occurred.

## License notes
- MIT license texts for khasky/awesome-agent-skills, arjunprabhulal/agent-skills and cloudflare/security-audit-skill are preserved under licenses/.
- The copied coder/coder deep-review skill pack is accompanied by the upstream AGPL-3.0 license under licenses/.
- deep-code-audit and design-review are original project-authored adaptations; pietz/skills is cited as a methodology reference only.
