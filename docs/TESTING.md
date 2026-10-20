# Testing record

Date: **20 October 2026**. Environment: Windows, Node 26.10.0, Playwright 1.64.1, bundled Chromium. Local preview: `http://localhost:5500`.

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
| Source/resource checks | Passed: fourteen HTML entrypoints, eighteen images, JavaScript syntax |
| Browser acceptance suite | 18 passed, 0 failed; final full run completed in 22.0 seconds |
| Dependency audit | 0 known vulnerabilities at verification time |
| Figma structural audit | Sixteen editable screens, 508 text nodes, 112 component instances |

## Browser coverage

- Registration, duplicate email, incorrect password, logout, guest access, intended-page login return, traveler/admin separation.
- Destination keyword search, budget filters, empty/reset states, price sorting. Combined category/budget filters and original-data immutability also tested as pure functions.
- Desktop hover playback, next image, manual pause, mobile visible playback, touch swipe, refresh persistence, keyboard arrows, reduced motion, immersive close/Escape.
- Package, hotel, and flight booking; invalid dates and traveler counts; hotel room/night calculation; confirmation; cancellation; stored records.
- Activity addition from discovery, activity reordering/completion, day editing, saved itinerary reload, text export, isolation between two traveler accounts.
- Review submission, local contact confirmation, admin inbox read state.
- Admin package creation/edit/activation/removal, traveler activation, inactive login rejection, booking status changes.
- Corrupt storage recovery and blocked-storage error explanation.
- Every page loaded at **360, 390, 768, 1024, 1440px**: no unintended document-width overflow, one H1, no new-tab internal links, no page JavaScript exceptions, no broken loaded images.
- Signed-in admin and booking dialogs fit the same five widths.
- All discovered internal links and all eighteen image assets return successfully.

## Visual inspection

Reviewed desktop Home and mobile Home, registration, booking dialog, and administration screenshots. Form wrapping, image cropping, contrast surfaces, navigation, and focus visibility were inspected. Figma review identified and corrected collapsed text heights and horizontal container clipping.

Saved browser evidence is in `docs/screenshots/`. Figma reference images and the node audit are in `docs/design/`.

## Issues found and resolved

- Local server root normalization initially blocked files; corrected before browser verification.
- Password’s embedded Show control polluted its label; supplied an explicit accessible name.
- Exact dropdown test selectors included option text; tests now target the accessible combobox role/name.
- Touch-event fixtures required a touch identifier; updated the fixture.
- A refreshed manually paused gallery had no explicit initial playback state; initialization now sets the paused state and first slide.
- Itinerary activity reordering and direct discovery-to-itinerary addition were completed and tested.

## Limits of the evidence

This is Chromium automation with emulated touch layouts, not real-device coverage. Safari, Firefox, iOS/Android hardware, screen-reader evaluation, and a formal WCAG or performance audit were not run. Native background-tab throttling and trackpad gestures remain manual checks; the implementation includes visibility and intersection pausing without wheel interception.

The dataset is illustrative. Tests do not establish production security, payment correctness, travel availability, or third-party service reliability. Multi-tab concurrent edits can race.

## Optional manual checks

Open a playing gallery, switch browser tabs, then return; playback should stop while hidden. Use a physical trackpad to scroll a card rail, then continue normal vertical page scrolling. Test a phone in portrait and landscape with its virtual keyboard open. Navigate forms and dialogs with a screen reader and keyboard.
