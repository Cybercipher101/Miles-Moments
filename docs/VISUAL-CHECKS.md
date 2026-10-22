# Visual notebook checks

Review date: **22 October 2026**. The application is unchanged by this documentation update.

## What this review covers

The README uses GitHub-compatible Markdown, collapsible galleries, local SVG artwork, and screenshot artifacts. GitHub controls its reading font and does not run custom scripts. The optional [visual album](showcase.html) supplies the interactive device filters, chapter selector, search, and full-size screenshot viewer.

Run `npm run preview:docs` and visit `http://localhost:5502` to use the album. It runs locally and is not deployed. Run `npm run check:docs` for documentation references and `npx playwright test tests/docs.spec.js` for its browser checks after installing development dependencies.

## Results

| Check | Observed result |
| --- | --- |
| Documentation browser suite | **3 passed** in 6.8 seconds; Windows, Node 26.10.0, Playwright 1.64.1 / Chromium |
| Album filters | All 18 views; Desktop / Mobile each show 9; combined chapter and text filters, empty state, and reset pass |
| Dialog and keyboard | Full-size image loads; Escape and Close dismiss; focus returns to the opening button |
| Album layout | No document overflow at 360, 390, 768, 1024, and 1440px; dialogs fit; reduced motion enabled |
| Assets and errors | All 18 screenshot requests succeed; no page JavaScript exceptions; unrelated checkout paths return 404 |
| README render | Light and dark reading modes at all five widths; collapsed and expanded galleries fit; images, section jump links, and SVG XML parse checks pass |
| Manual visual inspection | Reviewed 1440px and 390px album and README screenshots for wrapping, typography, hierarchy, and readable controls |

The README was rendered locally with bundled Marked 17.0.5 and GitHub-like reading styles for this inspection. That temporary renderer is not shipped or required by the website or visual album. Source files are the portable deliverables.

### Saved evidence

- [README, desktop](screenshots/readme-1440.png) · [README, mobile](screenshots/readme-390.png)
- [Visual album, desktop](screenshots/visual-album-1440.png) · [Visual album, mobile](screenshots/visual-album-390.png)
- [Current Home preview](screenshots/home-preview.png) · [Flights](screenshots/flights-1440.png) · [Gallery](screenshots/gallery-390.png)

`npm run check:docs` checks local references, README heading anchors, all 18 catalog screenshots, and documentation script syntax. It does not validate external websites. Review the command output for the current reference count.

## Artifact dates

- The README cover and palette are original, code-authored SVGs created on 22 October. They contain no external image or font requests.
- Login, Flights, Gallery, and the Home preview are refreshed from the current application during this review.
- Registration, destination exploration, full-page Home, itinerary, booking, and administrator screenshots retain their 21 October acceptance-run captures. They remain representative; dates in booking examples are illustrative.
- The application uses the original eighteen destination impressions documented in [image provenance](IMAGE-PROVENANCE.md).

## Limits

The local README rendering approximates GitHub's Markdown presentation; it does not establish identical GitHub chrome, spacing, or font rendering. The documentation album is checked in Chromium, including narrow viewports and reduced motion. No physical-device, Safari, Firefox, screen-reader, or formal contrast audit is claimed. The application’s previous 6 unit / 23 browser results remain dated 21 October in [TESTING.md](TESTING.md).
