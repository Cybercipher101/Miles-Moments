# Figma design handoff

[Open Miles & Moments designs](https://www.figma.com/design/RhMcGbJ8l4bVz4xKMs9S78?node-id=5-84)

The first design page is **Miles & Moments · Screens and foundations**. It contains sixteen editable desktop/mobile screen compositions plus a reusable component and token foundation.

| Composition | Desktop | Mobile |
| --- | --- | --- |
| Home | `5:84` | `5:85` |
| Registration | `5:86` | `5:87` |
| Login | `11:267` | `11:289` |
| Destination exploration | `5:88` | `5:89` |
| Destination details | `5:90` | `5:91` |
| Booking | `5:92` | `5:93` |
| Itinerary | `5:94` | `5:95` |
| Administration | `5:96` | `5:97` |

Desktop frames are 1440px wide; mobile frames are 390px wide. Text uses DM Serif Display and Manrope. Reusable buttons include primary/secondary and default/hover/disabled variants. Fields, cards, booking summaries, gallery controls, and navigation use editable components. Semantic variables reference the palette and spacing foundations.

## Validation

The structural audit found **508 editable text nodes**, **112 component instances** across the sixteen screens, **14 component/component-set nodes**, and **24 variables**. Individual scenery images are image fills; the screens are not flattened UI screenshots. [Audit JSON](design/figma-audit.json) and [node ledger](figma-state.json) preserve exact IDs.

Visual review covered Home, authentication, destination exploration, booking, and administration. Text auto-sizing and horizontal container heights were corrected after the first render. Home’s review section and gradient invitation were added to match the implemented page’s content order.

Reference exports: [Home desktop](design/figma-home-desktop.png), [destination exploration mobile](design/figma-destinations-mobile.png), [login mobile](design/figma-login-mobile.png). Browser screenshots live in `screenshots/`.

## Differences and remaining limitation

The editable compositions share the implemented content hierarchy, typography, palette, imagery, and core controls. They are design studies rather than pixel-identical captures: some field treatment, spacing, header details, and authentication image overlays differ. Booking is shown as a composed review screen; the website opens it as an in-page dialog. Interaction, validation, and responsive behavior are defined by the browser implementation.

The file’s outer title remains **Roamly — Travel Website & Design System**. The connector cannot rename files, and the available Figma browser session is signed out. A signed-in file editor can rename it **Miles & Moments** from the title menu. The design page, content, and repository already use the final brand.

The second page retains an editable HTML capture as an implementation reference. Scripts in `scripts/figma-*.txt` preserve the authoring recipes; run them only through the Figma Plugin API workflow with the saved state ledger, not with Node.

## 21 October implementation update

The browser now includes login-first entry, a separate registration page, persistent guest browsing, olive tokens, Home chapter navigation/reveals, scenic flight postcards, and editorial gallery journals. This code update has not yet been mirrored into the sixteen Figma compositions; current browser screenshots and UI-UX.md are authoritative for these additions.
