# MVP and scope

## Delivered first release

The MVP is a complete browser-local journey: discover a destination, inspect a package, sign in, save a demo booking, and manage it. Stays, flights, itineraries, reviews, and the contact inbox complete the travel experience.

| Capability | Implementation |
| --- | --- |
| Identity | Traveler registration, seeded demo accounts, login/logout, intended-page return |
| Discovery | Six destinations and three images each, search/filter/sort, nested horizontal carousels |
| Planning | Day plans, package details, editable itineraries and text export |
| Reservations | Package, hotel, flight forms; itemized total; confirmation and cancellation |
| Administration | Local users, packages, bookings, inbox |
| Quality | Responsive layouts, keyboard controls, reduced motion, storage recovery, tests |
| Handoff | Documentation, editable designs, local startup, repository source |

## Explicit exclusions

No application backend, database server, live inventory APIs, OAuth, password reset email, real payments, real booking fulfillment, email delivery, maps integration, geolocation, analytics, or deployment. No runtime framework.

## Sensible future sequence

1. Add a server with validated accounts, secure sessions, authorization, and database migrations.
2. Introduce audited travel inventory and pricing integrations.
3. Add booking fulfillment and server-side transactional email.
4. Add payment processing only after inventory, refunds, and support processes are defined.
5. Add localization, user accessibility testing, and wider device/browser coverage.

Do not connect the current client-side role checks directly to production data.
