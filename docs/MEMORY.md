# Project memory

Last updated: 22 October 2026.

## Decisions to preserve

- Final brand: **Miles & Moments**. Repository: `Cybercipher101/Miles-Moments`, public, branch `main`.
- Frontend only: HTML, CSS, vanilla JavaScript native modules. No runtime framework.
- Local preview only. Do not publish to GitHub Pages or Sites.
- Dedicated checkout: `Miles-Moments` inside the traveling website workspace. Do not modify unrelated drive-level Git files.
- Login-first entry (index/login), separate register page, explicit persistent guest browsing, same-tab links, Home navigation. Direct content access requires account or guest choice; booking forms and My Bookings require an account.
- Six destinations: Bali, Santorini, Switzerland, Kyoto, Maldives, Jaipur.
- Eighteen original generated images; reused six initial images plus twelve new activity scenes.
- Local DM Serif Display and Manrope with font licenses.
- Sky `#BDE8F3`, dark pink `#A62963`, olive `#626C3E`, ivory, dark ink.
- Horizontal destination panels and nested activity rails; preserve normal vertical scrolling.
- Demo accounts, bookings, itineraries, reviews, package overrides, and messages stay browser-local.
- No real reservations, payments, email, tickets, external booking integrations, or shared database.

## Current implementation

Fifteen entrypoints; shared UI/data/storage/auth modules; package/hotel/flight bookings; itinerary add/edit/reorder/completion/export; reviews; Home-end contact and dedicated contact page; local admin dashboard.

Demo credentials are intentionally public and documented in README. Registration creates travelers. Browser-only admin checks demonstrate role behavior and cannot secure production data.

Figma: `RhMcGbJ8l4bVz4xKMs9S78`, primary page `5:2`, sixteen screen compositions, reusable components and tokens. The outer provisional title could not be changed through the available connector/signed-out browser; see FIGMA.md.

The 21 October update adds olive accents, Home chapter navigation and scroll reveals, a scenic flights page, and an editorial gallery. All use existing original imagery. The older Figma compositions have not been resynchronized with this update.

## Verification and maintenance

The 22 October documentation update expands README setup, role explanations, code navigation, and troubleshooting; adds local SVG cover/palette artwork and a filterable screenshot album in `docs/showcase.html`. `npm run preview:docs` serves only album assets on localhost:5502. Preserve GitHub-compatible Markdown; custom typography and interactive filters live in the album. Documentation evidence and the three dedicated browser tests are recorded in VISUAL-CHECKS.md. Application source under `dist/` was unchanged.

Use `npm test`, `npm run check`, and `npm run test:browser`. Read TESTING.md for actual results and coverage limitations before claiming broader support. Preserve keyboard focus and reduced-motion behavior when changing galleries.

Use `npm run check:docs` for README references and `npx playwright test tests/docs.spec.js` for the album and representative screenshot refresh. The full browser command now includes the 23 application tests plus 3 documentation tests; the latest documentation run alone is not a new full application acceptance run.

Treat `dist` as authored source. Editing generated HTML shell metadata also requires updating `scripts/create-pages.mjs`. Do not commit node_modules, browser profiles, temporary screenshots/traces, generated PNG masters, `.env` files, or hosting credentials.

Keep sample and user-created content distinguishable. Preserve booking snapshots if packages change. Keep original image prompt records as provenance even where they mention the initial working brand.

## Known boundaries

Storage is local to an origin and can be manually edited or cleared. Seed accounts are recreated when missing. No cross-device synchronization or robust concurrent-write handling. Only Chromium automation and the listed responsive viewports were verified; hardware device testing and formal accessibility auditing remain future work.
