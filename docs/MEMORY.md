# Project memory

Last updated: 20 October 2026.

## Decisions to preserve

- Final brand: **Miles & Moments**. Repository: `Cybercipher101/Miles-Moments`, public, branch `main`.
- Frontend only: HTML, CSS, vanilla JavaScript native modules. No runtime framework.
- Local preview only. Do not publish to GitHub Pages or Sites.
- Dedicated checkout: `Miles-Moments` inside the traveling website workspace. Do not modify unrelated drive-level Git files.
- Registration/login entry, guest browsing, same-tab links, Home navigation.
- Six destinations: Bali, Santorini, Switzerland, Kyoto, Maldives, Jaipur.
- Eighteen original generated images; reused six initial images plus twelve new activity scenes.
- Local DM Serif Display and Manrope with font licenses.
- Sky `#BDE8F3`, dark pink `#A62963`, ivory, dark ink.
- Horizontal destination panels and nested activity rails; preserve normal vertical scrolling.
- Demo accounts, bookings, itineraries, reviews, package overrides, and messages stay browser-local.
- No real reservations, payments, email, tickets, external booking integrations, or shared database.

## Current implementation

Fourteen entrypoints; shared UI/data/storage/auth modules; package/hotel/flight bookings; itinerary add/edit/reorder/completion/export; reviews; Home-end contact and dedicated contact page; local admin dashboard.

Demo credentials are intentionally public and documented in README. Registration creates travelers. Browser-only admin checks demonstrate role behavior and cannot secure production data.

Figma: `RhMcGbJ8l4bVz4xKMs9S78`, primary page `5:2`, sixteen screen compositions, reusable components and tokens. The outer provisional title could not be changed through the available connector/signed-out browser; see FIGMA.md.

## Verification and maintenance

Use `npm test`, `npm run check`, and `npm run test:browser`. Read TESTING.md for actual results and coverage limitations before claiming broader support. Preserve keyboard focus and reduced-motion behavior when changing galleries.

Treat `dist` as authored source. Editing generated HTML shell metadata also requires updating `scripts/create-pages.mjs`. Do not commit node_modules, browser profiles, temporary screenshots/traces, generated PNG masters, `.env` files, or hosting credentials.

Keep sample and user-created content distinguishable. Preserve booking snapshots if packages change. Keep original image prompt records as provenance even where they mention the initial working brand.

## Known boundaries

Storage is local to an origin and can be manually edited or cleared. Seed accounts are recreated when missing. No cross-device synchronization or robust concurrent-write handling. Only Chromium automation and the listed responsive viewports were verified; hardware device testing and formal accessibility auditing remain future work.
