# Architecture

## Rendering

Each HTML entrypoint declares a page key and loads the shared stylesheet and `js/app.js` module. The application initializes the demo dataset, renders the relevant page, attaches handlers, then initializes galleries and horizontal rails. Navigation uses normal HTML links; there is no client-side router.

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `data.js` | Destination catalog, sample reviews, hotel rates, airport choices, image paths |
| `core.js` | Pure formatting, date differences, pricing, filtering, escaping, safe return paths |
| `store.js` | Versioned state, accounts, salted digests, sessions, recovery |
| `ui.js` | Shared navigation, footer, fields, cards, gallery markup, icons, contact form |
| `pages.js` | Public page renderers and merged package catalog |
| `actions.js` | Dialogs, protected actions, booking, contact, cancellation, itinerary editing |
| `carousel.js` | Gallery lifecycle, playback, gestures, reduced motion, rail controls |
| `admin.js` | Administrator guard, tabs, user/package/booking/inbox mutations |
| `app.js` | Boot, page dispatch, form/search binding, cross-tab refresh |

## Local data model

Storage key: `miles-moments:v1`.

```text
version: 1
users[]       id, name, email, salt, digest, role, active, created
bookings[]    id, reference, userId, type, title, traveler, dates,
              guests, total, status, created, details
reviews[]     id, userId, name, destination, rating, text, created
itineraries   userId → destinationId → days[] → items[]
messages[]    id, name, email, topic, message, created, read
packages      packageId → destination, name, price, days, active, deleted
```

`mm-session` in sessionStorage holds the selected user ID. `mm-gallery-pauses` preserves gallery pause choices within a tab. Neither stores a real authentication token.

Updates clone the state, apply a change, write storage, then commit the in-memory snapshot. A failed write does not commit the snapshot. Other tabs on the same origin reload when the main dataset changes. This is not a transactional multi-user database; concurrent edits can overwrite one another.

## Ownership and roles

Bookings and itineraries are queried by the active account. Reviews retain the author ID and display name. Admin controls check for an active administrator before changing records. Traveler registration has no role chooser.

The two built-in demo accounts are seeded when absent. Deleting a seeded account causes it to be recreated on a later load; deactivation persists. Deleting a custom traveler removes their itinerary; existing reviews and booking snapshots remain.

## Pricing

- Package: per-person rate × traveler count.
- Flight: selected sample per-person fare × traveler count; business fare is applied before opening booking.
- Hotel: nightly room rate × `ceil(travelers / 2)` × nights.
- Allowed travelers: integers 1–8. Allowed hotel stays: 1–30 nights.
- Booking records store their total and description so later package changes do not rewrite history.

## Rendering safety and recovery

User-supplied text is escaped before HTML interpolation. Return paths use an allowlist and reject external origins. Native form constraints and explicit domain validation prevent ordinary invalid bookings.

Storage shape/version errors show a recovery banner; storage write failures produce understandable status messages. Client-side code and local records remain editable through developer tools. Salted PBKDF2 with 100,000 iterations demonstrates password handling but cannot make this frontend a production authentication service.

## Extending the site

Add destination records in `data.js`, create three corresponding image assets, update image provenance and resource checks, then test filters and direct detail routes. Add a page by extending `scripts/create-pages.mjs`, page rendering and dispatch, navigation, safe-return allowlist where needed, and route coverage.

Keep actual application behavior in the vanilla modules. Development tooling and Figma authoring recipes must not become runtime dependencies.
