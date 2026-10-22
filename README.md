# Miles & Moments

**Go places. Feel more.** A responsive travel frontend built entirely with HTML, CSS, and vanilla JavaScript.

Explore six destinations, plan a journey, and try hotel, flight, and package bookings. Traveler and administrator workflows share a clearly labeled, browser-local demonstration. No backend, payments, real reservations, or email delivery.

[Editable Figma designs](https://www.figma.com/design/RhMcGbJ8l4bVz4xKMs9S78?node-id=5-84) · [Product requirements](docs/PRD.md) · [Testing](docs/TESTING.md) · [Design guide](docs/UI-UX.md)

![Miles & Moments Home](docs/screenshots/home-preview.png)

## Run locally

Install **Node.js 22 or later**, then:

```sh
git clone https://github.com/Cybercipher101/Miles-Moments.git
cd Miles-Moments
npm start
```

Open **http://localhost:5500**. The first page is **Log in**, with **Create an account** and **Continue as guest**. Fresh visitors must choose one before entering; direct content links also pass through this screen. No dependency installation or build is needed to run the website. Keep the terminal open; press `Ctrl+C` to stop.

Use the local server rather than opening HTML files directly. Native modules and password hashing need an HTTP localhost or secure origin. If port 5500 is busy, stop the other server or set `PORT` before starting. Changing the port creates a separate browser storage origin.

## Try the two roles

These are public, fictional demo credentials:

| Role | Email | Password |
| --- | --- | --- |
| Traveler | `traveler@miles.test` | `Travel123!` |
| Administrator | `admin@miles.test` | `Admin123!` |

**Traveler:** browse destinations, combine filters, open a destination and package, confirm a demo booking, then cancel it from My Bookings. Search stays or flights to try their booking flows. Add an activity to your itinerary, edit and reorder days or activities, mark progress, and export text. Share a review.

**Administrator:** use the Admin demo link in the footer, then Admin sign-in. Manage local users, booking statuses, and packages; read messages in Inbox. Administrator changes appear in traveler views in the same browser. They do not affect other visitors or devices.

**Guest:** choose Continue as guest to browse destinations, offers, flight/stay searches, galleries, and sample itineraries. This choice is remembered across pages, reloads, and new tabs in the same browser. Booking forms, My Bookings, saved itinerary actions, and review submission require login and then return to the intended page. Guest access creates no traveler account. Registration always creates a traveler; signing out returns to the login screen.

The Home contact form is immediately before the footer. Its confirmation explicitly says that no email was sent.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html`, `login.html` | Login-first entry and remembered guest access |
| `register.html` | Create a traveler account |
| `home.html` | Editorial introduction, discovery, reviews, contact |
| `destinations.html` | Search, filters, sorting, horizontal destination and activity carousels |
| `destination.html?id=bali` | Destination story, gallery, package links |
| `package.html?id=bali` | Daily plan, inclusions, exclusions, booking |
| `hotels.html`, `flights.html` | Demo inventory search and booking |
| `itinerary.html` | Editable travel journal and text export |
| `gallery.html`, `reviews.html` | Original imagery and traveler stories |
| `bookings.html`, `contact.html` | Account bookings and local contact inbox submission |
| `admin.html` | Separate administration dashboard |

All navigation stays in the current tab. Each content page links Home. Direct URLs and refreshes work.

## Development and tests

```sh
npm ci
npx playwright install chromium
npm test
npm run check
npm run test:browser
```

The browser suite starts the server if needed. Results and coverage boundaries are in [TESTING.md](docs/TESTING.md). Screenshots include [mobile Home](docs/screenshots/home-390.png), [login](docs/screenshots/index-390.png), [registration](docs/screenshots/register-390.png), [flights](docs/screenshots/flights-1440.png), [gallery](docs/screenshots/gallery-1440.png), [booking](docs/screenshots/booking-390.png), and [administration](docs/screenshots/admin-390.png).

## Project structure

```text
dist/                  Website served directly; no build step
  *.html               Fifteen real page entrypoints
  assets/              Shared CSS, licensed local fonts, original WebP imagery
  js/                  Native modules for UI, data, auth, storage, and behavior
scripts/               Local server, asset optimization, checks, Figma recipes
tests/                 Node unit tests and Playwright browser tests
docs/                  Product, architecture, design, provenance, and test records
```

Start with [MVP](docs/MVP.md), [app flow](docs/APP-FLOW.md), [tech stack](docs/TECH-STACK.md), [architecture](docs/ARCHITECTURE.md), and [project memory](docs/MEMORY.md) when extending the project.

The fifteen HTML files in `dist/` provide page entrypoints. Styling lives in `dist/assets/styles.css` and `dist/assets/experience.css`; vanilla JavaScript modules render shared/page markup and handle interactions. GitHub normally excludes `dist/` from language statistics, so `.gitattributes` explicitly identifies this directory as project source. No file languages are relabeled.

## Design and limitations

DM Serif Display and Manrope are packaged locally with their SIL Open Font licenses. The palette combines light blue `#BDE8F3`, dark pink `#A62963`, olive `#626C3E`, ivory, and dark ink. Home chapter links connect discovery, planning, and stories; gentle sliding reveals respect reduced-motion preferences. Scenic flight postcards and six editorial photo journals reuse the original imagery. Eighteen original generated destination/activity images are documented in [image provenance](docs/IMAGE-PROVENANCE.md).

Figma contains sixteen editable desktop/mobile compositions, reusable components, color/spacing variables, and text styles. [Figma handoff](docs/FIGMA.md) documents the screens and known differences. The existing file’s outer title still uses the provisional name; its design page and content are branded Miles & Moments.

Accounts and records persist only in this browser’s local storage. Passwords use salted PBKDF2 digests, but frontend role checks are **not a secure authorization boundary**. Use sample details. Clearing site data removes local accounts and records. Demo accounts are seeded again when absent.

Inventory, prices, ratings, schedules, and imagery are illustrative. There is no live availability, currency service, payment, ticketing, hotel reservation, email, or cross-device sync. The project is intended for local preview; no GitHub Pages or Sites deployment is configured.
