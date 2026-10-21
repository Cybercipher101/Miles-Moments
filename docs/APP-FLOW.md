# Application flow

## Traveler journey

```text
Login first (index.html / login.html)
  ├─ Create an account → register.html
  ├─ Continue as guest → Home or requested browsing page
  ├─ Register traveler → Home
  └─ Sign in → intended page, or Home

Home → Destinations → Destination details → Package details
                    │                      └─ Book → Confirmation → My Bookings
                    ├─ Activities → Itinerary
                    ├─ Stays → Search → Booking → My Bookings
                    └─ Flights → Search → Booking → My Bookings

Home / Footer → Gallery, Reviews, Contact, My Bookings, Admin
```

## Entry and guest access

Fresh direct links redirect to login before content renders. Continuing as guest stores a versioned browser preference; future browsing links remain accessible. Guests can inspect offers and search inventory, but cannot open booking forms or My Bookings. A guest choice from a My Bookings or Admin login return goes Home. Guest entry from an activity-add link opens the sample itinerary without saving that activity. Login returns to the requested page; account actions still require an active session. Signing out clears the guest choice.

## Protected actions

Booking, adding an activity from discovery, saving an itinerary, adding a day, and posting a review require a session. The requested path and query are encoded in `login.html?next=...`. The return helper accepts only known local pages. A traveler never receives administrator controls.

Some guest itinerary edits can be explored temporarily. Signing in is required to persist them; unsaved guest edits are not transferred through authentication.

## Booking sequence

1. Inspect an active package, or submit valid hotel/flight search criteria.
2. Sign in if needed, then open the booking dialog in the same page.
3. Enter a traveler name, 1–8 travelers, and valid future dates.
4. Review the total and acknowledge that the action is a local demonstration.
5. Confirm. Save a local reference, account ID, price snapshot, and confirmed status.
6. Open My Bookings; cancellation updates the status after confirmation.

Hotel totals use rooms, nights, and a nightly rate. One room holds up to two travelers. Flight dates must match the searched result; changing the date requires a new search.

## Itinerary sequence

Choose a destination → use its sample plan → edit titles and activities → reorder with arrows → mark completion → save automatically for a signed-in account → export a plain-text journal. Discovery’s Add action appends its activity to the first day. Reset replaces that destination’s plan after confirmation.

## Administration sequence

Footer Admin demo → Admin sign-in → dashboard → Users / Bookings / Packages / Inbox. The admin can deactivate or remove travelers, change booking status, curate packages, and read contact submissions. Existing booking snapshots survive package and traveler removal.

## Navigation and recovery

Fifteen physical HTML files support direct loads. Content-page navigation includes Home. Native dialogs stay inside the current page. Unknown destination/package IDs show a recovery link. No internal link requests a new browser tab.

Unreadable storage produces a recovery banner. Reset deletes this project’s local dataset, account session, and guest preference. Persistent guest storage falls back to a tab session if localStorage is blocked; if both are unavailable, entry shows a clear error. If the browser blocks storage entirely, the user is told to enable it for localhost.
