# Architecture

- UI: React + TypeScript + Vite.
- Storage: IndexedDB in the browser; clothing photos are Blob values.
- Privacy: no backend required for core functionality. Body profile is optional and local-only.
- Outfit logic: deterministic local rules; no remote model calls.
- Hosting: static build can be deployed to Cloudflare Pages. Hosting does not sync IndexedDB between devices.

IndexedDB is scoped to the browser origin and device. Clearing site data can remove the wardrobe. Export backups regularly. Cloud sync, if implemented, must be opt-in with clear delete/export controls.