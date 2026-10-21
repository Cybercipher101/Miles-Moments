# Product requirements

## Purpose

Miles & Moments helps a traveler move from inspiration to a clear, personal travel plan. This educational frontend demonstrates the complete experience without implying that a real trip was purchased.

## Audience and roles

- Guests discover destinations and compare illustrative trips.
- Travelers register or sign in to save bookings, itineraries, and reviews.
- Administrators manage the local demonstration’s users, bookings, packages, and contact messages.

The administrator operates the same browser-local dataset. There is no remote service or shared production account system.

## Functional scope

| Area | Required behavior |
| --- | --- |
| Entry | Login first on index/login, separate registration, explicit remembered guest browsing; direct content links require an entry choice; successful login returns Home or intended page |
| Discovery | Bali, Santorini, Switzerland, Kyoto, Maldives, Jaipur; information panels with separate activity carousels |
| Search | Text, category, budget, and name/price/rating sorting; combined filters; empty state and reset |
| Details | Same-tab destination and package pages, day plans, amenities, inclusions, exclusions, INR summaries |
| Galleries | Three original images per destination; 2-second hover playback; visible mobile playback; swipe, controls, indicators, keyboard, immersive dialog |
| Booking | Guest-visible offer searches; account-only booking forms and My Bookings; hotel date/guest and flight route/date/cabin search, validation, consent, confirmation, persistence, cancellation |
| Itinerary | Account-specific destinations, days and activities; edit, reorder, complete, remove, reset, export text |
| Community | Labeled sample reviews, user ratings and review submission |
| Contact | Home’s final content section and standalone page; local inbox only; honest confirmation |
| Administration | Separate sign-in route, user activation/deletion, booking status, package creation/editing/activation/removal, inbox read/deletion |

## Experience requirements

Responsive at 360, 390, 768, 1024, and 1440 pixels. Every content page provides Home navigation; links remain in the same tab. The page scrolls vertically; horizontal carousels accept independent touch/trackpad scrolling and buttons. Native forms have labels, focus indicators, understandable errors, and comfortable controls.

Automatic gallery playback stops offscreen or in a hidden document. A manual pause persists for the gallery in the current tab, including refreshes, until Play is pressed. Reduced motion disables automatic playback and decorative transitions. Dialogs have visible close controls and Escape support.

Home uses a scenic chapter navigation component and restrained scroll reveals. Flights and Gallery feature original destination imagery. Olive accents complement the blue/pink palette. Reduced motion immediately disables section movement and reveals pending content.

## Data and trust

Versioned browser-local storage holds accounts, bookings, reviews, itineraries, package overrides, and messages. User-owned records carry account identifiers. Credentials are salted digests; no real password should be entered. Browser-local storage can be inspected and edited, so authentication and authorization demonstrate interface behavior only.

Do not collect payments or issue real reservations. Label fictional inventory, schedules, reviews, prices, and generated images. No email is sent by the contact form.

## Delivery and acceptance

Deliver source, original imagery, licensed local fonts, editable Figma designs, Markdown documentation, a local server, and meaningful automated tests. Commit and push to the public repository’s main branch after checks. Do not deploy.

Acceptance evidence is recorded in [TESTING.md](TESTING.md). Technical and browser coverage limitations must remain visible rather than being presented as successful checks.
