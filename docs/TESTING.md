# Testing record

Date: **21 October 2026**. Environment: Windows, Node 26.10.0, Playwright 1.64.1, bundled Chromium. Local preview: `http://localhost:5500`.

## Commands

```sh
npm ci
npx playwright install chromium
npm test
npm run check
npm run test:browser
npm audit
```

Playwright starts the local server when required and keeps each test’s browser storage isolated. HTML reports and failure traces are development artifacts excluded from Git.

## Results

| Check | Result |
| --- | --- |
| Node core tests | 6 passed |
| Source/resource checks | Passed: fifteen HTML entrypoints, eighteen images, JavaScript syntax |
| Browser acceptance suite | 23 passed, 0 failed on the final full run |
| Dependency audit | 0 known vulnerabilities on 20 October; dependencies unchanged in this update |
| Figma structural audit | Previous release: sixteen editable screens, 508 text nodes, 112 component instances; new UI not resynchronized |

## Browser coverage

- Registration, duplicate email, incorrect password, logout, guest access, intended-page login return, traveler/admin separation.
- Login-first index, separate registration, fresh direct-link entry checks, persistent guest choice across reloads and tabs, guest access to offers, and account-only package/hotel/flight forms and My Bookings. A guest choice from the My Bookings login returns Home.
- Fully blocked guest storage reports an error without bypassing entry; unavailable demo-account storage leaves the entry screen usable.
- Home chapter anchors and selected chapter, scroll reveal completion, immediate reduced-motion reveal, flight inspiration routes, and gallery chapter/immersive controls.
- Destination keyword search, budget filters, empty/reset states, price sorting. Combined category/budget filters and original-data immutability also tested as pure functions.
- Desktop hover playback, next image, manual pause, mobile visible playback, touch swipe, refresh persistence, keyboard arrows, reduced motion, immersive close/Escape.
- Package, hotel, and flight booking; invalid dates and traveler counts; hotel room/night calculation; confirmation; cancellation; stored records.
- Activity addition from discovery, activity reordering/completion, day editing, saved itinerary reload, text export, isolation between two traveler accounts.
- Review submission, local contact confirmation, admin inbox read state.
- Admin package creation/edit/activation/removal, traveler activation, inactive login rejection, booking status changes.
- Corrupt storage recovery and blocked-storage error explanation.
- Every page loaded at **360, 390, 768, 1024, 1440px**: no unintended document-width overflow, one H1, no new-tab internal links, no page JavaScript exceptions, no broken loaded images.
- Signed-in admin and booking dialogs fit the same five widths.
- Home, Flights, and Gallery also fit all five widths with decorative motion enabled; the header Sign in action remains visible at every width.
- All discovered internal links and all eighteen image assets return successfully.

## Visual inspection

Reviewed refreshed desktop Home and Flights, mobile Login and Gallery, plus the existing booking and administration coverage. Screenshots for registration, flights, and gallery are included at 390 and 1440 pixels. Form wrapping, image cropping, navigation, and gallery control visibility were inspected. The earlier Figma review identified and corrected collapsed text heights and horizontal container clipping; this update changes browser code only.

Saved browser evidence is in `docs/screenshots/`. Figma reference images and the node audit are in `docs/design/`.

## Issues found and resolved

- Local server root normalization initially blocked files; corrected before browser verification.
- Password’s embedded Show control polluted its label; supplied an explicit accessible name.
- Exact dropdown test selectors included option text; tests now target the accessible combobox role/name.
- Touch-event fixtures required a touch identifier; updated the fixture.
- A refreshed manually paused gallery had no explicit initial playback state; initialization now sets the paused state and first slide.
- Itinerary activity reordering and direct discovery-to-itinerary addition were completed and tested.
- Fixed the editorial gallery's inherited aspect ratio, which initially caused horizontal overflow on narrower viewports.
- Kept mobile Sign in visible when the older compact header rule hid filled buttons; moved journal numbering below the photo so it does not cover gallery controls.
- Limited the full-width Home band's reveal to vertical movement to avoid overflow while the animation is pending.

## Limits of the evidence

**Documentation update, 22 October:** three additional tests in `tests/docs.spec.js` passed for the screenshot album and representative image refresh. The full browser suite now contains 26 tests; only the three documentation tests were rerun for that documentation-only update. See [VISUAL-CHECKS.md](VISUAL-CHECKS.md) for the separate README rendering checks and visual artifacts.

This is Chromium automation with emulated touch layouts, not real-device coverage. Safari, Firefox, iOS/Android hardware, screen-reader evaluation, and a formal WCAG or performance audit were not run. Native background-tab throttling and trackpad gestures remain manual checks; the implementation includes visibility and intersection pausing without wheel interception.

The dataset is illustrative. Tests do not establish production security, payment correctness, travel availability, or third-party service reliability. Multi-tab concurrent edits can race.

## Optional manual checks

Open a playing gallery, switch browser tabs, then return; playback should stop while hidden. Use a physical trackpad to scroll a card rail, then continue normal vertical page scrolling. Test a phone in portrait and landscape with its virtual keyboard open. Navigate forms and dialogs with a screen reader and keyboard.
