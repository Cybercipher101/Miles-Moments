import {
  destinations,
  destinationById,
  hotelNames,
  hotelRates,
  airports,
  sampleReviews,
  imagePath,
} from "./data.js";
import { money, escapeHTML as e, today, dateLabel } from "./core.js";
import { getState, currentUser } from "./store.js";
import {
  brand,
  icon,
  gallery,
  heading,
  pageIntro,
  destinationCard,
  contactSection,
  contactForm,
  emptyState,
  field,
  options,
} from "./ui.js";
export const packages = () =>
  Object.values({
    ...Object.fromEntries(
      destinations.map((d) => [
        d.id,
        {
          id: d.id,
          destination: d.id,
          name: `${d.name} discovery`,
          price: d.price,
          days: d.days,
          active: true,
        },
      ]),
    ),
    ...getState().packages,
  }).filter((p) => !p.deleted);
export const catalog = () =>
  destinations.map((d) => ({
    ...d,
    price: packages().find((p) => p.id === d.id)?.price || d.price,
  }));
export const railButtons = () =>
  `<div class="rail-buttons"><button class="icon-button" data-rail-prev aria-label="Previous destination">←</button><button class="icon-button" data-rail-next aria-label="Next destination">→</button></div>`;
export const amenities = (d) =>
  `<div class="amenities">${d.amenities.map((a) => `<span>${icon("check")}${e(a)}</span>`).join("")}</div>`;
export function authPage(page) {
  const login = page !== "register",
    admin = new URLSearchParams(location.search).get("role") === "admin";
  return `<div class="auth-shell"><aside class="auth-art"><img src="${imagePath("santorini")}" alt="Whitewashed Santorini above a turquoise caldera" width="1536" height="1024"><div class="auth-art-top">${brand()}<span class="pill light">A WORLD WORTH FEELING</span></div><div class="auth-art-copy"><p class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>Collect moments.<br>Go a little further.</h2><p>Beautiful places. Thoughtful journeys.<br>Stories that stay with you.</p><span class="location-caption">${icon("pin")} Santorini, Greece</span></div></aside><main id="main" class="auth-main"><div class="auth-top"><span class="auth-welcome">YOUR JOURNEY, YOUR WAY</span></div><div class="auth-form-wrap"><span class="eyebrow">${admin ? "THE ADMIN DESK" : "A LITTLE CURIOSITY GOES A LONG WAY"}</span><h1>${login ? (admin ? "Welcome, administrator." : "Your next chapter awaits.") : "Let the journey begin."}</h1><p class="muted">${login ? "Sign in to pick up where your wanderlust left off." : "A few details, and a world of possibilities."}</p><div class="auth-tabs"><a href="login.html${e(location.search)}" ${login ? 'aria-current="page"' : ""}>Log in</a><a href="register.html${e(location.search)}" ${!login ? 'aria-current="page"' : ""}>Create an account</a></div><form id="auth-form" class="stack" data-mode="${login ? "login" : "register"}">${!login ? field("Your name", "name", "text", "", 'autocomplete="name" required minlength="2" maxlength="60" placeholder="Alex Morgan"') : ""}${field("Email address", "email", "email", admin ? "admin@miles.test" : "", 'autocomplete="email" required placeholder="you@example.com"')}<label>Password<div class="password-field"><input name="password" id="password" aria-label="Password" type="password" required minlength="${login ? 1 : 8}" autocomplete="${login ? "current-password" : "new-password"}" placeholder="${login ? "Your demo password" : "At least 8 characters"}"><button type="button" data-password aria-label="Show password">Show</button></div></label>${!login ? `<label class="check-label"><input type="checkbox" required>I understand this is a browser-local demo. I’ll use a sample password.</label>` : ""}<button class="button full-width" type="submit">${login ? "Sign in" : "Create my account"} ${icon("arrow")}</button><p class="form-status" role="status"></p></form><div class="guest-entry"><span class="guest-divider">JUST LOOKING AROUND?</span><button type="button" class="button guest-button full-width" data-guest>Continue as guest ${icon("arrow")}</button><p>Explore places, offers, and travel inspiration. Sign in when you’re ready to book. We’ll remember your guest choice on this browser.</p><p id="guest-status" class="form-status" role="status"></p></div><p class="auth-note">${icon("compass")} Frontend demo. Use sample details, not a real password.</p><details class="demo-details"><summary>Try a demo account</summary><p>Traveler: <b>traveler@miles.test</b> / <b>Travel123!</b><br>Admin: <b>admin@miles.test</b> / <b>Admin123!</b></p><button class="button secondary small" data-fill-demo="${admin ? "admin" : "traveler"}">Fill ${admin ? "admin" : "traveler"} account</button></details></div><p class="auth-copyright">Miles & Moments · Made for the curious.</p></main></div>`;
}
export function homePage() {
  return `<section class="home-hero container"><div class="hero-copy"><p class="eyebrow"><span class="small-line"></span> FOR THE BEAUTIFULLY CURIOUS</p><h1>More than miles.<br><em>Moments</em> that<br>stay with you.</h1><p>Take the scenic route. Find your kind of adventure.<br>Make a little room for the unexpected.</p><div class="row wrap hero-actions"><a class="button" href="destinations.html">Find your next chapter ${icon("arrow")}</a><a class="underlined" href="gallery.html">${icon("sun")} A little inspiration</a></div><div class="hero-note"><span class="mini-compass">${icon("compass")}</span><span>Thoughtfully imagined journeys.<br><strong>Endlessly personal possibilities.</strong></span></div></div><div class="hero-visual">${gallery(destinations[1], { className: "hero-gallery", eager: true, key: "hero", expand: true })}<div class="floating-note"><span class="note-star">✳</span><div>A little further.<br><b>A little freer.</b></div></div><div class="travel-stamp">MILES & MOMENTS<br><span>✧</span><br>THE WORLD IS WAITING</div></div></section><section class="container search-wrap"><form class="search-bar" action="destinations.html"><label>${icon("pin")}<span>Where’s calling?<input name="q" placeholder="A place, a feeling, an adventure…"></span></label><label>${icon("compass")}<span>Your kind of escape<select name="category"><option value="">A little bit of everything</option>Coast</option><option>Nature</option><option>Mountains</option><option>Culture</option></select></span></label><button class="button" type="submit">${icon("search")} Let’s explore</button></form><p class="tiny muted search-note">Six destinations. Countless ways to make them yours. <span>All trips and prices are illustrative.</span></p></section><section class="chapter-bridge container" aria-labelledby="chapter-heading" data-reveal><div class="chapter-intro"><span class="eyebrow">THE SCENIC ROUTE</span><h2 id="chapter-heading">Every journey<br>has its chapters.</h2><p>Follow a little curiosity.<br>See where it takes you.</p></div><nav class="chapter-route" aria-label="Home chapters">${[
    [
      "places",
      "01",
      "Find your somewhere",
      "A world of possibilities",
      "santorini",
    ],
    [
      "your-pace",
      "02",
      "Travel at your pace",
      "The details, thoughtfully planned",
      "bali",
    ],
    ["stories", "03", "Keep the moments", "Stories to take with you", "kyoto"],
  ]
    .map(
      ([id, number, title, subtitle, image]) =>
        `<a class="chapter-stop" href="#${id}"><span class="chapter-number">${number}</span><img src="${imagePath(image, 1)}" alt="" width="220" height="150" loading="lazy"><strong>${title}</strong><span>${subtitle}</span><span class="chapter-arrow" aria-hidden="true">↗</span></a>`,
    )
    .join(
      "",
    )}</nav></section><section id="places" class="section container" data-reveal data-rail-scope>${heading("PLACES THAT PULL YOU IN", "Where will your story go?", "A few favorite corners of the world, waiting to become yours.", `<a class="underlined" href="destinations.html">All destinations ${icon("arrow")}</a>`)}<div class="destination-cards" data-rail tabindex="0" aria-label="Destination cards">${catalog().map(destinationCard).join("")}</div><div class="row between rail-footer"><p class="tiny muted">Hover to wander · Swipe to discover</p>${railButtons()}</div></section><section class="experience-band" data-reveal="right"><div class="container experience-layout"><div><p class="eyebrow">IT’S THE LITTLE THINGS</p><h2>Travel that feels<br>a little more <em>you.</em></h2><p>A sunrise worth waking up for. A street you hadn’t planned to find. The best part of a journey is how it makes you feel.</p><a class="underlined" href="itinerary.html">Make room for your moments ${icon("arrow")}</a></div><div class="experience-features">${[
    [
      "compass",
      "Follow your curiosity",
      "Explore places by the experiences you love.",
    ],
    ["heart", "Make it your own", "Build an itinerary with room to breathe."],
    ["sun", "Keep the good bits", "Save your plans and collect new stories."],
  ]
    .map(
      ([i, h, p]) =>
        `<article>${icon(i)}<div><h3>${h}</h3><p>${p}</p></div></article>`,
    )
    .join(
      "",
    )}</div></div></section><section id="your-pace" class="section container" data-reveal="left"><div class="split-feature"><img src="${imagePath("bali", 1)}" alt="A quiet yoga deck beside Bali’s rice terraces" loading="lazy" width="1536" height="1024"><div><p class="eyebrow">LESS RUSH. MORE WONDER.</p><h2>Your time.<br>Your kind of journey.</h2><p>Book a peaceful stay, find a flight, and put together the days you’ll want to remember. Every little detail, in one place.</p><div class="row wrap"><a class="button" href="hotels.html">${icon("bed")} Find a stay</a><a class="button secondary" href="flights.html">${icon("plane")} Find a flight</a></div></div></div></section><section id="stories" class="section container" data-reveal>${heading("THE TRAVEL JOURNAL", "Good places. Better stories.", "A few illustrative voices to inspire your next chapter.", `<a class="underlined" href="reviews.html">Read & write stories ${icon("arrow")}</a>`)}<div class="grid three">${sampleReviews.map(reviewCard).join("")}</div></section><section class="container journey-banner" data-reveal><div><p class="eyebrow">THE WORLD CAN WAIT. YOUR CURIOSITY SHOULDN’T.</p><h2>Somewhere new.<br>Something unforgettable.</h2></div><a class="button" href="destinations.html">Start exploring ${icon("arrow")}</a></section>${contactSection()}`;
}
export function destinationPanel(d) {
  return `<article class="destination-panel" aria-label="${e(d.name)} destination"><div class="destination-main">${gallery(d, { expand: true, key: "explore-" + d.id })}<div class="destination-copy"><div class="row between"><span class="eyebrow">${e(d.country)} · ${e(d.category)}</span><span class="rating">★ ${d.rating} <small>sample</small></span></div><h2>${e(d.name)}</h2><p class="destination-tag">${e(d.tag)}</p><p>${e(d.intro)}</p><div class="trip-facts"><span>${icon("calendar")} ${d.days} days of discovery</span><span>From <strong>${money(d.price)}</strong> / person</span></div>${amenities(d)}<a class="button" href="destination.html?id=${d.id}">Explore ${e(d.name)} ${icon("arrow")}</a></div></div><div class="activity-section" data-rail-scope><div class="row between"><h3>Little adventures, lasting memories</h3><div class="rail-buttons"><button class="icon-button" data-rail-prev aria-label="Previous activity">←</button><button class="icon-button" data-rail-next aria-label="Next activity">→</button></div></div><div class="activity-rail" data-rail tabindex="0" aria-label="${e(d.name)} activities">${d.activities.map(([title, desc, tag], i) => `<article class="activity-card"><img src="${imagePath(d.id, i < 2 ? i + 1 : 0)}" alt="${e(desc)}" width="300" height="220" loading="lazy"><div><span class="tiny">${e(tag)}</span><h4>${e(title)}</h4><p>${e(desc)}</p><a href="itinerary.html?destination=${d.id}&activity=${i}">Add to your itinerary →</a></div></article>`).join("")}</div></div></article>`;
}
export function destinationsPage() {
  const params = new URLSearchParams(location.search);
  return `${pageIntro("A WORLD OF POSSIBILITIES", "Find a place. Feel something.", "Follow your curiosity from quiet coastlines to colorful city streets.")}<section class="container"><form id="destination-filters" class="filter-bar"><label>Search destinations<input name="q" placeholder="Place, country, or activity…" value="${e(params.get("q") || "")}"></label><label>Your escape<select name="category">${options([["", "All experiences"], ...["Coast", "Nature", "Mountains", "Culture"].map((x) => [x, x])], params.get("category") || "")}</select></label><label>Budget per person<select name="budget">${options(
    [
      ["Infinity", "Any budget"],
      ["25000", "Under ₹25,000"],
      ["50000", "Under ₹50,000"],
      ["80000", "Under ₹80,000"],
      ["100000", "Under ₹1,00,000"],
    ],
  )}</select></label><label>Sort by<select name="sort">${options([
    ["featured", "Our collection"],
    ["price-low", "Price: low to high"],
    ["price-high", "Price: high to low"],
    ["name", "Name: A–Z"],
    ["rating", "Highest rated"],
  ])}</select></label><button class="text-button" type="reset">Reset</button></form><div data-rail-scope><div class="row between results-bar"><p id="result-count" role="status"></p>${railButtons()}</div><div id="destination-results" class="destination-explorer" data-rail tabindex="0" aria-label="Explore destinations"></div></div><p class="tiny muted">All amenities, ratings, activities, and prices represent sample packages. Check the package page for inclusions.</p></section>`;
}
export function detailPage(isPackage = false) {
  const id = new URLSearchParams(location.search).get("id") || "bali";
  const p = isPackage ? packages().find((p) => p.id === id) : null;
  const d = catalog().find((d) => d.id === (isPackage ? p?.destination : id));
  if (!d)
    return `<div class="container">${emptyState("That chapter isn’t here.", "This destination or package could not be found.")}</div>`;
  const available = packages().filter(
    (p) => p.destination === d.id && p.active,
  );
  return `<section class="container detail-header"><a class="underlined tiny" href="destinations.html">← Back to destinations</a><div class="row between wrap"><div><p class="eyebrow">${e(d.country)} · ${isPackage ? "THE THOUGHTFUL ESCAPE" : e(d.tag)}</p><h1>${e(isPackage ? p.name : d.name)}</h1></div><span class="pill">${icon("calendar")} ${isPackage ? p.days : d.days} days · ${e(d.category)}</span></div></section><section class="container detail-hero">${gallery(d, { className: "wide-gallery", eager: true, expand: true, key: "detail-" + d.id })}</section><section class="section container detail-grid"><div><p class="eyebrow">A LITTLE ABOUT THIS CHAPTER</p><h2>${e(d.intro)}</h2><p class="lead">${e(d.description)}</p>${amenities(d)}<div class="facts-grid"><div><span class="tiny muted">BEST TIME TO VISIT</span><strong>${e(d.best)}</strong></div><div><span class="tiny muted">ARRIVAL AIRPORT</span><strong>${d.airport}</strong></div></div><h3>Your days, thoughtfully imagined.</h3><ol class="timeline">${Array.from({ length: isPackage ? p.days : d.days }, (_, i) => `<li><span class="day-number">${String(i + 1).padStart(2, "0")}</span><div><span class="eyebrow">DAY ${i + 1}</span><h4>${e(d.itinerary[i] || "A free day to explore at your own pace")}</h4><p>Space to explore, time to enjoy, and a little room for the unexpected.</p></div></li>`).join("")}</ol><div class="grid two"><div class="panel"><h3>Included in the sample</h3><ul class="check-list">${d.amenities.map((a) => `<li>${e(a)}</li>`).join("")}<li>Activities listed in the itinerary</li></ul></div><div class="panel"><h3>Plan separately</h3><ul><li>International flights and visas</li><li>Travel insurance</li><li>Personal shopping and optional activities</li><li>Meals not explicitly included</li></ul></div></div></div><aside class="booking-sidebar panel"><p class="eyebrow">YOUR NEXT CHAPTER</p><h3>${isPackage ? e(p.name) : `${e(d.name)} is calling.`}</h3><p class="price">${money(isPackage ? p.price : d.price)} <small>/ person</small></p><p class="muted">Illustrative total per person. No real reservation or payment.</p>${isPackage ? (p.active ? `<button class="button full-width" data-book-package="${e(p.id)}">Plan this escape ${icon("arrow")}</button>` : `<p class="notice">This package is currently unavailable.</p>`) : available.map((pack) => `<a class="button full-width" href="package.html?id=${e(pack.id)}">${e(pack.name)} ${icon("arrow")}</a>`).join("") || "<p>No active packages right now.</p>"}<a class="button secondary full-width" href="itinerary.html?destination=${d.id}">Build my itinerary</a><div class="sidebar-links"><a href="hotels.html?destination=${d.id}">${icon("bed")} Browse stays</a><a href="flights.html?destination=${d.id}">${icon("plane")} Find a flight</a></div><span class="tiny muted">Original AI-generated imagery; locations and activities are illustrative.</span></aside></section>`;
}
export function hotelsPage() {
  const dest = new URLSearchParams(location.search).get("destination") || "";
  return `${pageIntro("STAY A LITTLE LONGER", "A place to call your own.", "From peaceful garden stays to a room with an ocean view.")}<section class="container"><form id="hotel-search" class="filter-bar">${`<label>Destination<select name="destination">${options([["", "Anywhere"], ...destinations.map((d) => [d.id, d.name])], dest)}</select></label>`}${field("Check-in", "checkin", "date", today(7), `required min="${today()}"`)}${field("Check-out", "checkout", "date", today(10), `required min="${today(1)}"`)}${field("Guests", "guests", "number", "2", 'required min="1" max="8"')}<label>Sort<select name="sort"><option value="featured">Our collection</option><option value="price">Lowest nightly price</option></select></label><button class="button" type="submit">Find a stay</button><p class="form-status full" role="status"></p></form><p class="tiny muted">Demo stays · Two guests per room · Destination imagery is illustrative and does not depict real properties.</p><div id="hotel-results" class="grid three section compact"></div></section>`;
}
export function hotelCard(d, search) {
  return `<article class="destination-card"><img class="card-photo" src="${imagePath(d.id)}" alt="${e(d.name)} destination scenery; illustrative stay image" width="600" height="400" loading="lazy"><div class="card-content"><span class="eyebrow">${e(d.name)} · DEMO STAY</span><h3>${hotelNames[d.id]}</h3><p>Breakfast · Wi-Fi · ${d.category === "Coast" ? "Coastal setting" : "Local character"}</p><div class="row between wrap"><span><strong>${money(hotelRates[d.id])}</strong><small> / room / night</small></span><button class="button small" data-book-hotel="${d.id}" data-search="${e(JSON.stringify(search))}">Choose stay ${icon("arrow")}</button></div></div></article>`;
}
export function flightsPage() {
  const dest =
    destinationById(new URLSearchParams(location.search).get("destination"))
      ?.airport || "DPS";
  return `<section class="flight-hero container"><div class="flight-hero-copy"><p class="eyebrow">THE JOURNEY STARTS HERE</p><h1>A window seat<br>to <em>somewhere new.</em></h1><p>Some journeys begin with a daydream.<br>Yours starts with a view worth flying for.</p><a class="underlined" href="#flight-search">Find your next flight ${icon("arrow")}</a><span class="flight-hero-note">${icon("plane")} Six destinations. A thousand possibilities.</span></div><div class="flight-postcard"><img src="${imagePath("maldives")}" alt="Turquoise Maldives lagoon and a green island seen from above; original destination impression" width="1536" height="1024" fetchpriority="high"><div class="postcard-caption"><span>4.17° N · 73.51° E</span><strong>Somewhere between<br>the sky & the sea.</strong><span>MALDIVES · ORIGINAL DESTINATION IMPRESSION</span></div><span class="postcard-stamp">THE WINDOW<br>SEAT CLUB ${icon("plane")}</span></div></section><section class="container flight-search-section"><div class="row between wrap flight-search-heading"><div><p class="eyebrow">YOUR DEPARTURE BOARD</p><h2>Where are we taking you?</h2></div><span class="pill olive-pill">Sample routes · INR fares</span></div><form id="flight-search" class="filter-bar"><label>From<select name="from">${options(
    airports.map(([c, n]) => [c, `${n} (${c})`]),
    "DEL",
  )}</select></label><label>To<select name="to">${options(
    airports.map(([c, n]) => [c, `${n} (${c})`]),
    dest,
  )}</select></label>${field("Departure", "date", "date", today(14), `required min="${today()}"`)}${field("Travelers", "guests", "number", "1", 'required min="1" max="8"')}<label>Cabin<select name="cabin"><option>Economy</option><option>Business</option></select></label><button class="button" type="submit">Search flights ${icon("search")}</button><p class="form-status full" role="status"></p></form><div class="notice">One-way demo flights. Airlines, schedules, availability, and fares are illustrative. No ticket is issued.</div><div id="flight-results" class="stack section compact">${emptyState("Where will you land next?", "Choose your route and dates above to explore sample flights.", "destinations.html", "Find destination inspiration")}</div></section><section class="container section flight-inspiration" data-reveal>${heading("LET THE VIEW DECIDE", "An arrival worth imagining.", "A little inspiration for the other side of your journey.")}<div class="grid three">${[destinations[0], destinations[2], destinations[3]].map((d) => `<a class="route-postcard" href="flights.html?destination=${d.id}#flight-search"><img src="${imagePath(d.id, 2)}" alt="${e(d.activities[1][1])}" width="600" height="400" loading="lazy"><div><span class="eyebrow">DEL → ${d.airport}</span><h3>${e(d.name)}</h3><span>Explore sample flights ${icon("arrow")}</span></div></a>`).join("")}</div></section>`;
}
export function flightCard(route, i) {
  const names = ["Moment Air", "Sky Chapter", "Blue Horizon"],
    times = ["08:20", "13:45", "19:10"];
  const base = route.from === "JAI" || route.to === "JAI" ? 5800 : 24900;
  const rate = Math.round(
    (base + i * 2100) * (route.cabin === "Business" ? 2.4 : 1),
  );
  return `<article class="flight-card panel"><div class="airline-mark">${icon("plane")}</div><div><h3>${names[i]}</h3><span class="tiny muted">MM ${210 + i} · Sample service</span></div><div class="flight-route"><div><strong>${times[i]}</strong><span>${e(route.from)}</span></div><span class="flight-line">${icon("plane")}<small>${i === 1 ? "1 sample stop" : "Sample nonstop"}</small></span><div><strong>${["16:10", "22:30", "03:00 +1"][i]}</strong><span>${e(route.to)}</span></div></div><div><span class="tiny">${e(route.cabin)} · ${e(route.guests)} traveler(s)</span><p><strong>${money(rate)}</strong> / person</p></div><button class="button small" data-book-flight="${i}" data-rate="${rate}" data-search="${e(JSON.stringify({ ...route, airline: names[i], time: times[i] }))}">Select flight</button></article>`;
}
export function itineraryPage() {
  const user = currentUser(),
    id = new URLSearchParams(location.search).get("destination") || "bali",
    d = destinationById(id) || destinations[0];
  return `${pageIntro("YOUR OWN KIND OF ADVENTURE", "Make room for the moments.", "Shape your days, follow a little curiosity, and leave space for a lovely detour.")}<section class="container itinerary-layout"><aside class="panel itinerary-sidebar"><label>Your destination<select id="itinerary-destination">${options(
    destinations.map((d) => [d.id, d.name]),
    d.id,
  )}</select></label><img src="${imagePath(d.id)}" alt="${e(d.name)}" width="600" height="400"><h3>${e(d.name)}</h3><p>${e(d.tag)}</p><p class="tiny muted">${user ? "Your edits are saved to this account in this browser." : "Sign in to save and customize this sample itinerary."}</p><div class="stack"><button class="button" data-save-itinerary>Save itinerary ${icon("check")}</button><button class="button secondary" data-export-itinerary>Export as text</button><button class="text-button" data-reset-itinerary>Restore sample itinerary</button></div><p id="itinerary-status" class="form-status" role="status"></p></aside><div><div class="row between wrap"><h2>Your journey, day by day.</h2><button class="button secondary small" data-add-day>+ Add a day</button></div><div id="itinerary-days" class="stack"></div></div></section>`;
}
export function galleryPage() {
  return `<section class="gallery-intro container"><div><p class="eyebrow">THE MILES & MOMENTS FIELD NOTES</p><h1>A world worth<br><em>looking closer.</em></h1></div><div class="gallery-intro-note"><span class="editorial-star" aria-hidden="true">✳</span><p>Quiet corners. Wild horizons.<br>Little moments that make you stay.</p><span class="eyebrow">06 PLACES / 18 ORIGINAL IMPRESSIONS</span></div></section><nav class="gallery-index container" aria-label="Gallery destinations">${destinations.map((d, i) => `<a href="#postcard-${d.id}"><span>0${i + 1}</span> ${e(d.name)}</a>`).join("")}</nav><section class="container postcard-collection" aria-label="Destination photo journals">${destinations.map((d, i) => `<article id="postcard-${d.id}" class="photo-journal" data-reveal="${i % 2 ? "right" : "left"}"><div class="journal-photo">${gallery(d, { expand: true, eager: i === 0, key: "gallery-" + d.id })}<span class="journal-number" aria-hidden="true">0${i + 1}</span></div><div class="journal-copy"><p class="eyebrow">FIELD NOTE 0${i + 1} · ${e(d.country)}</p><h2>${e(d.name)}</h2><p class="journal-tag">${e(d.tag)}</p><p>${e(d.intro)}</p><div class="journal-details"><span>${e(d.category)} escape</span><span>3 original views</span></div><a class="underlined" href="destination.html?id=${d.id}">Explore this chapter ${icon("arrow")}</a></div></article>`).join("")}</section><section class="container gallery-colophon" data-reveal><span class="editorial-star" aria-hidden="true">✳</span><div><h2>Take your time. Take it all in.</h2><p>Hover to play, swipe between views, or expand a scene for a closer look. Your pause choice stays yours.</p><p class="tiny muted">All eighteen images are original AI-generated destination impressions created for this project.</p></div><a class="button secondary" href="destinations.html">Find your next chapter ${icon("arrow")}</a></section>`;
}
export function reviewCard(r) {
  return `<article class="review-card"><span class="rating" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span><blockquote>“${e(r.text)}”</blockquote><div class="row"><span class="avatar">${e(r.name[0])}</span><div><strong>${e(r.name)}</strong><small>${e(destinationById(r.destination)?.name || r.destination)} · ${r.sample ? "Illustrative review" : "Local demo review"}</small></div></div></article>`;
}
export function reviewsPage() {
  const reviews = [...getState().reviews, ...sampleReviews];
  return `${pageIntro("THE TRAVEL JOURNAL", "Every journey has a story.", "A little inspiration from our sample travelers—and a place for your own thoughts.")}<section class="container"><div class="grid three">${reviews.map(reviewCard).join("")}</div><div class="review-form-layout section"><div><p class="eyebrow">LEAVE A LITTLE INSPIRATION</p><h2>What will you remember?</h2><p>Share a destination thought or experience. Your review is saved in this browser.</p></div><form id="review-form" class="panel form-grid"><label>Destination<select name="destination">${options(destinations.map((d) => [d.id, d.name]))}</select></label><label>Your rating<select name="rating">${options(
    [
      ["5", "★★★★★ — Wonderful"],
      ["4", "★★★★☆ — Lovely"],
      ["3", "★★★☆☆ — Good"],
      ["2", "★★☆☆☆ — Fair"],
      ["1", "★☆☆☆☆ — Poor"],
    ],
  )}</select></label><label class="full">Your story<textarea name="text" rows="5" required minlength="10" maxlength="1000" placeholder="A moment, a place, a little recommendation…"></textarea></label><button class="button full" type="submit">Share your story ${icon("arrow")}</button><p class="form-status full" role="status"></p></form></div></section>`;
}
export function bookingsPage() {
  const user = currentUser();
  if (!user)
    return `${pageIntro("YOUR TRAVEL DESK", "All your plans, one place.", "Sign in to view and manage your browser-local bookings.")}<div class="container">${emptyState("Your next chapter is waiting.", "Bookings belong to the account that created them.", "login.html?next=bookings.html", "Sign in")}</div>`;
  const bookings = getState().bookings.filter((b) => b.userId === user.id);
  return `${pageIntro("YOUR TRAVEL DESK", `Your moments, ${e(user.name.split(" ")[0])}.`, "Keep your plans close and your possibilities open.")}<section class="container"><div class="stats-grid"><div class="stat"><span>YOUR BOOKINGS</span><strong>${bookings.length}</strong></div><div class="stat"><span>ACTIVE PLANS</span><strong>${bookings.filter((b) => b.status === "confirmed").length}</strong></div><div class="stat"><span>ILLUSTRATIVE VALUE</span><strong>${money(bookings.filter((b) => b.status === "confirmed").reduce((n, b) => n + b.total, 0))}</strong></div></div><div class="stack section compact">${
    bookings.length
      ? bookings
          .slice()
          .reverse()
          .map(
            (b) =>
              `<article class="booking-ticket"><div class="ticket-icon">${icon(b.type === "flight" ? "plane" : b.type === "hotel" ? "bed" : "compass")}</div><div><span class="eyebrow">${e(b.type)} · ${e(b.reference)}</span><h3>${e(b.title)}</h3><p>${dateLabel(b.date)} ${b.endDate ? " – " + dateLabel(b.endDate) : ""} · ${b.guests} traveler(s)</p><span class="tiny muted">${e(b.details || "Demo reservation · No payment collected")}</span></div><div class="ticket-end"><span class="status ${b.status === "cancelled" ? "cancelled" : ""}">${e(b.status)}</span><strong>${money(b.total)}</strong>${b.status === "confirmed" ? `<button class="text-button" data-cancel-booking="${b.id}">Cancel booking</button>` : ""}</div></article>`,
          )
          .join("")
      : emptyState(
          "A blank page. Endless possibilities.",
          "Your bookings will appear here when you plan your first escape.",
        )
  }</div></section>`;
}
export const contactPage = () =>
  `${pageIntro("A LITTLE HELLO", "Let’s talk about your next chapter.", "Leave a note, share an idea, or tell us where your curiosity is taking you.")}<section class="container contact-layout"><div><h2>Good journeys start<br>with a conversation.</h2><p>Use the form to save a message in the local demo inbox. You can view it from the administrator dashboard.</p><div class="panel"><h3>How this demo works</h3><p>Your message stays in this browser. No email is sent and no external travel service receives your details.</p><a class="underlined" href="admin.html">Explore the admin demo ${icon("arrow")}</a></div></div><div class="panel">${contactForm()}</div></section>`;
