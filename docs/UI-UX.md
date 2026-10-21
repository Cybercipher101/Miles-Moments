# UI and UX guide

## Visual language

Use the feeling of a personal travel journal with the clarity of a booking dashboard. Scenic photography, generous space, expressive headings, small journey captions, and subtle compass/stamp details create atmosphere. Forms and pricing stay practical and readable.

| Token | Value / use |
| --- | --- |
| Sky | `#BDE8F3`, light accents and gradient start |
| Pink | `#A62963`, primary actions and emphasis |
| Olive | `#626C3E`, route markers, image surrounds, guest access and subtle accents |
| Olive dark / wash | `#47512F` / `#EEF0E4`, readable text and pale surfaces |
| Ink | `#243D3E`, body text and headings |
| Paper | `#FCFBF8`, main background |
| Gradient | Sky through soft lavender to muted pink; selected panels and accents |
| Headings | DM Serif Display, regular |
| Interface | Manrope, regular through bold |
| Spacing | Consistent small gaps and 20–24px component padding; larger section rhythm |
| Corners | Soft 8–20px UI radii; larger scenic hero corner |

The shared CSS token definitions are authoritative. Keep body text on solid, readable surfaces. Use dark pink for action labels and emphasis; avoid large blocks of saturated pink behind long body copy.

## Layout

Desktop Home uses a split editorial hero, a search strip, a three-stop scenic chapter navigation, horizontal destination cards, a feature band, stay/flight discovery, reviews, gradient invitation, and contact immediately before the footer.

Mobile stacks the hero and forms, retains intentional horizontal card rails, and replaces the full navigation with a menu. Booking and admin dialogs fit within the viewport and scroll internally when necessary. Tables scroll inside their own containers.

Destination exploration uses one destination panel at a time, with its own activity rail. Neither rail intercepts vertical mouse wheel events. Next/previous buttons provide an alternative to swiping.

The login screen comes first, with a prominent olive Continue as guest action and a separate registration page. Sign in remains visible in the header at every tested viewport. Flights use an original Maldives image framed like a window, with destination postcards below the search. Gallery uses six alternating photo-journal spreads, numbered field notes, destination jump links, and the existing accessible slideshow controls. Mobile journals stack in reading order.

## Motion

Gallery playback advances every two seconds. On desktop, hover starts it and leaving stops it. On touch layouts, only the selected substantially visible gallery runs. Manual navigation pauses playback. Pause choices persist across refreshes in the current tab.

Home sections and photo journals reveal once as they enter view, using a 24–28px slide and a 650–750ms opacity/transform transition. A section containing keyboard focus is immediately revealed. Home chapter links use native anchor scrolling, with the active chapter highlighted; no scroll events are intercepted. Live changes to reduced-motion preference remove pending reveals. CSS leaves content visible if the motion module is unavailable.

Use soft image fades, small button translations, and restrained decorative rotation. Avoid forced page transitions, animated scroll hijacking, and delayed access to content. Reduced-motion preference disables automatic slideshow playback, smooth scrolling, and decorative motion. In that mode, Play advances one image manually.

## Accessibility

- Semantic headings, labeled fields, buttons, landmarks, skip links, and visible keyboard focus.
- Gallery arrows, dots, Play/Pause, keyboard arrows, and descriptive image alternatives.
- Native dialogs trap focus, close with Escape, and provide visible close controls.
- Form errors appear in live status regions; success text explains what was saved.
- Sample ratings and reviews are distinguished from user-created entries.
- Comfortable primary controls and responsive wrapping; small decorative labels never replace form labels.

Automated checks cover keyboard interactions and viewport overflow. A formal WCAG audit and assistive-technology evaluation have not been completed.

## Design handoff

See [FIGMA.md](FIGMA.md) for editable screens, components, variables, screenshot comparisons, and composition differences. The browser implementation is the source for exact interactive behavior and responsive breakpoints.
