import { escapeHTML as e, money } from "./core.js";
import { imagePath } from "./data.js";
import { currentUser } from "./store.js";
export const icons = {
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  plane: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="m22 2-11 11"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  bed: '<path d="M3 18V7m18 11V7M3 14h18M3 20v-2h18v2M6 14v-4h12v4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.compass}</svg>`;
export const brand = () =>
  `<a class="brand" href="home.html" aria-label="Miles and Moments home"><span class="brand-symbol">${icon("compass")}</span><span>Miles <i>&</i> Moments<small>GO PLACES. FEEL MORE.</small></span></a>`;
export function header(page) {
  const user = currentUser();
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="nav-wrap">${brand()}<button class="icon-button menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Open navigation">${icon("menu")}</button><nav id="navigation" aria-label="Main navigation">${[
    ["home", "Home"],
    ["destinations", "Destinations"],
    ["hotels", "Stays"],
    ["flights", "Flights"],
    ["itinerary", "My itinerary"],
    ["gallery", "Gallery"],
  ]
    .map(
      ([id, label]) =>
        `<a href="${id}.html" ${page === id ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join(
      "",
    )}<a class="mobile-only" href="reviews.html">Reviews</a><a class="mobile-only" href="contact.html">Contact</a></nav><div class="nav-account">${user ? `<a class="account-link" href="${user.role === "admin" ? "admin" : "bookings"}.html">${icon("user")}<span>${e(user.name.split(" ")[0])}</span></a><button class="text-button small" data-logout>Sign out</button>` : `<span class="guest-badge">Guest browsing</span><a class="button small" href="login.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}">Sign in ${icon("arrow")}</a>`}</div></div></header>`;
}
export const footer = () =>
  `<footer class="site-footer"><div class="footer-top">${brand()}<p>For the places you’ll go.<br>And the moments you’ll keep.</p><div><a href="destinations.html">Explore destinations</a><a href="hotels.html">Find a stay</a><a href="flights.html">Find a flight</a></div><div><a href="bookings.html">My bookings</a><a href="reviews.html">Travel stories</a><a href="contact.html">Get in touch</a><a href="admin.html">Admin demo</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Miles & Moments. Made for the curious.</span><span>Frontend demo · Original AI-generated imagery · INR sample prices</span></div></footer>`;
export function gallery(
  d,
  { className = "", expand = false, eager = false, key = d.id } = {},
) {
  return `<div class="photo-gallery ${className}" data-gallery="${e(key)}" data-destination="${d.id}" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${e(d.name)} photos"><div class="gallery-images">${[0, 1, 2].map((s) => `<img src="${imagePath(d.id, s)}" width="1536" height="1024" alt="${e(s === 0 ? `${d.name}, ${d.country} — ${d.intro}` : d.activities[s - 1][1])}" class="${s === 0 ? "active" : ""}" loading="${eager && s === 0 ? "eager" : "lazy"}" ${s === 0 ? "" : 'aria-hidden="true"'}>`).join("")}</div><span class="photo-location">${icon("pin")} ${e(d.name)}, ${e(d.country)}</span>${expand ? `<button class="gallery-expand icon-button" data-expand="${d.id}" aria-label="Expand ${e(d.name)} gallery">${icon("expand")}</button>` : ""}<div class="gallery-controls"><button class="gallery-prev icon-button" aria-label="Previous photo">‹</button><div class="gallery-dots" aria-label="Select a photo">${[0, 1, 2].map((i) => `<button data-slide="${i}" aria-label="Photo ${i + 1}" aria-pressed="${i === 0}"></button>`).join("")}</div><span class="slide-count" aria-live="off">1 / 3</span><button class="gallery-play" aria-label="Play slideshow">▶ <span>Play</span></button><button class="gallery-next icon-button" aria-label="Next photo">›</button></div></div>`;
}
export const heading = (eyebrow, title, desc = "", right = "") =>
  `<div class="section-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${desc ? `<p class="muted">${desc}</p>` : ""}</div>${right}</div>`;
export const pageIntro = (eyebrow, title, desc) =>
  `<section class="page-intro container"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${desc}</p></section>`;
export const destinationCard = (d) =>
  `<article class="destination-card">${gallery(d, { key: "card-" + d.id })}<div class="card-content"><div class="row between"><span class="tiny muted">${e(d.country)} · ${d.days} days</span><span class="rating">★ ${d.rating} <span class="tiny">sample</span></span></div><h3><a href="destination.html?id=${d.id}">${e(d.name)}</a></h3><p>${e(d.tag)}</p><div class="card-bottom"><span><strong>${money(d.price)}</strong> <small>/ person</small></span><a class="circle-link" href="destination.html?id=${d.id}" aria-label="Explore ${e(d.name)}">${icon("arrow")}</a></div></div></article>`;
export function contactForm() {
  return `<form class="contact-form form-grid" data-contact><label>Your name<input name="name" autocomplete="name" required minlength="2" maxlength="60" placeholder="Alex Morgan"></label><label>Email address<input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label><label class="full">What’s on your mind?<select name="topic"><option>Help planning a journey</option><option>A booking question</option><option>Feedback and suggestions</option></select></label><label class="full">Your message<textarea name="message" required minlength="10" maxlength="2000" rows="4" placeholder="Tell us about your next chapter…"></textarea></label><label class="check-label full"><input type="checkbox" required> I understand this message is saved only in this browser.</label><div class="full row between wrap"><span class="tiny muted">Demo inbox. No email is sent.</span><button class="button" type="submit">Send your message ${icon("arrow")}</button></div><p class="form-status full" role="status"></p></form>`;
}
export const contactSection = () =>
  `<section id="contact" class="contact-section" data-reveal><div class="container contact-layout"><div><p class="eyebrow">LET’S TALK ABOUT YOUR NEXT CHAPTER</p><h2>A little hello.<br>A world of possibilities.</h2><p>Have a destination in mind, or just the feeling that it’s time to go? Leave a note in our demo inbox.</p><div class="contact-note">${icon("heart")} Thoughtful journeys start with a conversation.</div></div><div class="panel">${contactForm()}</div></div></section>`;
export const emptyState = (
  title,
  text,
  href = "destinations.html",
  label = "Explore destinations",
) =>
  `<div class="empty-state">${icon("compass")}<h2>${title}</h2><p>${text}</p><a class="button" href="${href}">${label} ${icon("arrow")}</a></div>`;
export const field = (label, name, type = "text", value = "", attrs = "") =>
  `<label>${label}<input name="${name}" type="${type}" value="${e(value)}" ${attrs}></label>`;
export const options = (items, selected = "") =>
  items
    .map(
      ([value, label]) =>
        `<option value="${e(value)}" ${value === selected ? "selected" : ""}>${e(label)}</option>`,
    )
    .join("");
