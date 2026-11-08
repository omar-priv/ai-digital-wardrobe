# Architecture

- **UI:** React 18 + TypeScript + Vite 6.
- **Storage:** IndexedDB in the browser; clothing images are stored as Blob objects in the same database.
- **Privacy:** No backend is required for core features. Profile fields are optional and local-only.
- **Outfit logic:** deterministic local rules based on categories and season. This is not AI and does not judge style or fit.
- **Backup:** JSON export serializes images as data URLs. Import validates schema, supported image MIME types and file sizes, then upserts by item ID.
- **Hosting:** static build can be deployed to Cloudflare Pages. Hosting does not sync IndexedDB between devices.

IndexedDB is scoped to the browser origin and device. Clearing site data can remove the wardrobe. Export backups regularly. Any future cloud sync must be opt-in, documented, and include export/delete controls.

## Domain modules and data integrity
- `src/lib/outfits.ts` contains deterministic season-compatible outfit selection.
- `src/lib/backup.ts` validates imported backup records and converts bounded image data URLs.
- `src/lib/db.ts` resolves writes only after IndexedDB transactions complete. Backup import writes all records and the optional profile in one read-write transaction, so a failed write aborts the restore instead of leaving a partial import.
- `src/lib/*.test.ts` contains unit and in-memory IndexedDB regression tests. These tests do not replace real-browser storage quota and lifecycle testing.
