# Design System: خزانتي — Digital Wardrobe

**Source:** `src/styles.css`, `src/App.tsx`, `index.html`, and `public/manifest.webmanifest`. Values below are read from the current source; no live-browser measurements are implied.

## 1. Atmosphere

A **light, calm, editorial wardrobe archive**. The visual identity uses muted indigo, soft lavender and warm near-white surfaces. Clothing photos should carry the visual weight; interface chrome stays quiet. The desktop layout feels like a personal archive with a fixed dark sidebar, while mobile prioritises the clothes grid and a labelled bottom navigation.

The interface is Arabic-first and RTL. English appears only as small brand decoration. There is no dark-mode implementation and no external font dependency.

## 2. Color Palette

### Surfaces
- **Soft Porcelain** `#F1F1F4` — main page canvas.
- **Clean White** `#FFFFFF` — cards, forms and modal surfaces.
- **Lavender Paper** `#DCDbea` — welcome panel and selected soft panels.
- **Pale Lavender** `#E8E7F2` — quiet supporting surfaces.
- **Hairline Mist** `#E4E3E9` — dividers and input/card borders.
- **Modal Scrim** `#1D1D2C9C` — dimmed background behind the dialog.

### Ink
| Color | Role |
|---|---|
| `#252637` | Primary body text |
| `#292A3B` | Sidebar, brand surface and browser theme color |
| `#41446F` | Darker hover state for primary actions |
| `#626375` | Secondary copy and supporting metadata |
| `#B4B4C4` | Sidebar footer copy |
| `#CBCBD7` | Resting sidebar navigation text |

### Accents
- **Muted Indigo** `#575A91` — primary action buttons and key interactive accents.
- **Deep Indigo** `#41446F` — primary button hover.
- **Soft Iris** `#D9D7E9` — brand mark and decorative garment surfaces.
- **Muted Periwinkle** `#7779BD` — keyboard focus outline.

### Contrast samples
These source-derived pairings were calculated from the CSS values, not measured from a rendered screenshot:
- Secondary text `#626375` on canvas `#F1F1F4`: **5.23:1**.
- Secondary text `#626375` on white: **5.90:1**.
- White text on primary indigo `#575A91`: **6.41:1**.
- Sidebar text `#CBCBD7` on `#292A3B`: **8.78:1**.
- Focus outline `#7779BD` on white: **4.00:1**.

These are selected pairings, not a complete WCAG audit of every state.

## 3. Typography

- **System stack:** Tahoma, Segoe UI, Arial, sans-serif. This avoids third-party font requests and supports Arabic fallback.
- **Page title:** 27px desktop, 23px mobile; bold and compact.
- **Welcome headline:** fluid 31–45px desktop and 29–34px mobile; high visual priority.
- **Section headings:** around 21px.
- **Card titles:** 14px desktop, 12px on narrow mobile.
- **Metadata and helper copy:** mostly 10–13px.
- Arabic text should use natural letter spacing. Keep tracking for the small English brand label only.

## 4. Shape & Elevation

- Main welcome panel: generous 23px corners.
- Clothing cards and outfit cards: 15px corners.
- Inputs and buttons: 10–11px corners.
- Modal: 19px corners with a broad, soft shadow.
- Borders are thin and low contrast. Cards are mostly flat; elevation appears on hover and on the modal, not on every surface.

## 5. Components

### Buttons
- **Primary:** muted indigo fill, white label, minimum height 43px; darker indigo on hover.
- **Secondary:** pale neutral fill with dark ink.
- **Quiet utility:** white fill, hairline border, compact square shape.
- Keyboard focus uses a visible 3px periwinkle outline.

### Clothing cards
- White surface, thin border, 15px radius.
- The garment image is contained rather than cropped so the full item remains visible.
- Category chip sits over the image; edit/delete actions are available on hover and remain visible on touch devices.
- Item title, color, season and optional notes sit below the image.

### Inputs and forms
- Soft off-white fill, thin border, 10px radius.
- Labels remain visible; inputs have explicit accessible names.
- Modal form is vertically scrollable on short screens.
- Image upload is limited to JPEG, PNG, WebP and GIF; maximum image size is 8MB.

### Dialog
- Centred white panel over a dark scrim, maximum width 540px.
- Has an accessible dialog role and title, Escape handling, focus trapping and focus return.

### Empty and status states
- Empty states use an icon, clear heading, explanatory copy and an optional action.
- Status notices use a pale lavender background and polite live announcement.
- Storage-load failure is distinct from a genuinely empty wardrobe.

## 6. Layout Principles

- Desktop: 252px RTL sidebar beside a centred main column, capped at 1440px.
- Desktop clothing grid: four columns; three columns below 1120px.
- Mobile below 760px: sidebar hidden, labelled bottom navigation shown, two-column clothing grid.
- Narrow mobile below 380px: welcome illustration is removed and the top bar can wrap to prevent horizontal overflow.
- Mobile bottom navigation accounts for the device safe area.
- Main page padding is fluid; cards and text use min-width constraints to avoid grid overflow.
- Uploaded clothing photos use `object-fit: contain` so garment edges are not lost.

## 7. Motion & Interaction

- Hover transitions are short and restrained; cards lift slightly.
- The interface respects `prefers-reduced-motion`.
- Modal opens with focus placed in the name field; Escape closes it; focus returns to the opener.
- A skip-to-content link appears on keyboard focus.

## 8. Accessibility & States

- Arabic document language and RTL direction are set in the HTML root.
- Navigation landmarks have accessible labels; category filters are grouped; buttons and inputs have names.
- Focus indicators are visible for keyboard users.
- The bottom navigation remains text-labelled, not icon-only.
- Static CSS review cannot establish real-device reflow, screen-reader quality or full WCAG conformance. Those still require browser and assistive-technology testing.


## 9. Outfit recommendation view

The recommendations screen uses the same editorial wardrobe identity; it is not a separate SaaS dashboard.

- Lead with a concise statement of the matching method and the number of viable looks.
- Keep style and season filters in a compact control row below the introduction.
- Each recommendation separates the two core garments (top and bottom) from optional additions (shoes, winter layer, accessories).
- Display the reason tags after the garment grouping. Reasons describe known evidence only; never imply AI vision, fit analysis, or occasion recognition.
- Retain the established lavender/indigo palette, system font stack, RTL reading order and garment-image `object-fit: contain`.
- At narrow mobile widths, stack recommendations and keep the top/bottom pair readable as two columns. Optional additions wrap into full-width rows when needed.
- A garment's optional style label is selected when adding/editing an item. Older records without a style are treated as unspecified, not silently relabelled.
- The empty state should explain that missing/unknown color or style metadata can prevent a strong match, and provide a route back to edit wardrobe records.
- The score is a deterministic heuristic used for ranking, not a probability or a claim of expert fashion judgment.

Rendered browser inspection and viewport checks are still required before the design can be marked verified.
