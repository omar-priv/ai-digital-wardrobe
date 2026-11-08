# Design system — خزانتي

## Design direction
A quiet digital wardrobe archive: editorial, organized and personal. The clothing itself should become the visual focus once the user adds photos. The UI should feel like a curated personal catalogue, not a generic admin dashboard.

## Palette
| Token | Value | Role |
|---|---|---|
| Ink | `#292A3B` | Navigation and strong text |
| Paper | `#F1F1F4` | App canvas |
| Surface | `#FFFFFF` | Cards and forms |
| Lavender | `#DCDbea` | Welcome and intro surfaces |
| Accent | `#575A91` | Primary actions and selected states |
| Accent dark | `#41446F` | Hover/pressed state |
| Muted text | `#626375` | Secondary copy on light backgrounds |
| Line | `#E4E3E9` | Subtle structure |

## Typography
- Arabic-first system stack: Tahoma, Segoe UI, Arial.
- Clear hierarchy: page title, section title, item name, supporting metadata.
- Body copy uses comfortable line-height; do not use letter spacing on Arabic text.
- Do not depend on an external font service for core readability.

## Layout and RTL
- Desktop: persistent right-side navigation rail (RTL start side), content centered with a readable maximum width.
- Mobile: bottom navigation with visible labels; do not collapse navigation into unlabeled icons.
- Use CSS logical properties for directional spacing and positioning.
- Category filters may scroll horizontally; cards must reflow without horizontal page overflow.
- Modal content scrolls within the viewport and must remain keyboard reachable.

## Interaction
- One clear primary action per screen.
- Icon-only actions require accessible names.
- Confirm destructive deletion.
- Show explicit loading, empty, success and error states.
- Keyboard focus must be visible; Escape closes the editor and focus returns to the opener.
- Respect reduced-motion preferences.

## Privacy cues
Explain that local browser storage is device/browser-specific. Never imply cloud backup or cross-device sync unless it is implemented and enabled.


## Source of truth
The detailed, source-grounded design handoff is maintained in [DESIGN.md](./DESIGN.md). It records the current palette, typography, layout breakpoints, image treatment and accessibility behavior. Update both documents when the visual system changes.
