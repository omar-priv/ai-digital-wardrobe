# Architecture

- **UI:** React 18 + TypeScript + Vite 6.
- **Storage:** IndexedDB in the browser; clothing images are stored as Blob objects in the same database.
- **Privacy:** No backend is required for core features. Profile fields are optional and local-only.
- **Outfit logic:** deterministic local ranking based on garment category, season, normalized color harmony and optional style labels. It rejects incompatible seasons and strongly conflicting style pairs, selects compatible shoes/layers/accessories, diversifies results and explains its reasons. This remains a rule-based engine, not an AI model; it does not inspect garment photos or infer fit, cut or occasion.
- **Outfit metadata:** `ClothingItem.style` is optional so existing IndexedDB records and version-1 JSON backups remain compatible. Backup validation accepts the field only when it is one of the supported labels.
- **Backup:** JSON export serializes images as data URLs. Import validates schema, supported image MIME types and file sizes, then upserts by item ID.
- **Hosting:** static build can be deployed to Cloudflare Pages. Hosting does not sync IndexedDB between devices.

IndexedDB is scoped to the browser origin and device. Clearing site data can remove the wardrobe. Export backups regularly. Any future cloud sync must be opt-in, documented, and include export/delete controls.

## Domain modules and data integrity
- `src/lib/outfits.ts` ranks explainable local outfit candidates using color, season and optional style compatibility; it also selects matching optional extras and diversifies repeated items.
- `src/types.ts` keeps style metadata optional for backward compatibility; `src/lib/backup.ts` validates it when present.
- `src/lib/backup.ts` validates imported backup records and converts bounded image data URLs.
- `src/lib/db.ts` resolves writes only after IndexedDB transactions complete. Backup import writes all records and the optional profile in one read-write transaction, so a failed write aborts the restore instead of leaving a partial import.
- `src/lib/*.test.ts` contains unit and in-memory IndexedDB regression tests. These tests do not replace real-browser storage quota and lifecycle testing.
