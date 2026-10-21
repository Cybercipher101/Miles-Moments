import { header, footer, emptyState } from "./ui.js";
import {
  seedDemo,
  currentUser,
  register,
  login,
  logout,
  storageStatus,
  resetStorage,
  updateState,
  uid,
  isGuest,
  startGuest,
} from "./store.js";
import {
  safeReturn,
  filterDestinations,
  nightsBetween,
  today,
} from "./core.js";
import { destinations } from "./data.js";
import * as pages from "./pages.js";
import { adminPage, bindAdmin } from "./admin.js";
import {
  bindCommonActions,
  bindItinerary,
  requireAuth,
  toast,
} from "./actions.js";
import { initGalleries, initRails, stopGalleries } from "./carousel.js";
import { initMotion } from "./motion.js";
const page = document.body.dataset.page;
function enforceEntry() {
  const auth = ["index", "login", "register"].includes(page);
  const user = currentUser();
  if (!auth && ((!user && !isGuest()) || (page === "bookings" && !user))) {
    const next =
      location.pathname.split("/").pop() + location.search + location.hash;
    document.getElementById("app").replaceChildren();
    location.replace(`login.html?next=${encodeURIComponent(next)}`);
    return false;
  }
  return true;
}
window.addEventListener("pageshow", (event) => {
  if (event.persisted) enforceEntry();
});
async function boot() {
  await seedDemo();
  const auth = ["index", "login", "register"].includes(page);
  if (!enforceEntry()) return;
  const renderers = {
    home: pages.homePage,
    destinations: pages.destinationsPage,
    destination: () => pages.detailPage(false),
    package: () => pages.detailPage(true),
    hotels: pages.hotelsPage,
    flights: pages.flightsPage,
    itinerary: pages.itineraryPage,
    gallery: pages.galleryPage,
    reviews: pages.reviewsPage,
    bookings: pages.bookingsPage,
    contact: pages.contactPage,
    admin: adminPage,
  };
  const content = auth
    ? pages.authPage(page)
    : `${header(page)}<main id="main">${(renderers[page] || pages.homePage)()}</main>${footer()}`;
  document.getElementById("app").innerHTML =
    (storageStatus()
      ? `<div class="storage-alert" role="alert">${storageStatus()} <button class="text-button" id="reset-storage">Reset demo storage</button></div>`
      : "") + content;
  document.body.insertAdjacentHTML(
    "beforeend",
    '<div id="toast" class="toast" role="status"></div>',
  );
  document.querySelector("#reset-storage")?.addEventListener("click", () => {
    if (
      confirm("Delete this browser’s demo accounts, bookings, and saved plans?")
    ) {
      try {
        resetStorage();
      } catch (err) {
        toast(err.message);
      }
    }
  });
  document.querySelector(".menu-toggle")?.addEventListener("click", (ev) => {
    const b = ev.currentTarget;
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(open));
    b.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    document.querySelector("#navigation").classList.toggle("open", open);
  });
  document
    .querySelectorAll("[data-logout]")
    .forEach((b) => (b.onclick = logout));
  if (auth) bindAuth();
  if (page === "destinations") bindDestinations();
  if (page === "hotels") bindHotels();
  if (page === "flights") bindFlights();
  if (page === "itinerary") bindItinerary();
  if (page === "reviews") bindReviews();
  if (page === "admin") bindAdmin();
  bindCommonActions();
  initGalleries();
  initRails();
  initMotion();
  document.body.dataset.ready = "true";
}
function bindAuth() {
  const form = document.getElementById("auth-form");
  const next = safeReturn(
    new URLSearchParams(location.search).get("next") || "home.html",
  );
  document.querySelector("[data-guest]").onclick = () => {
    try {
      startGuest();
      const target = new URL(next, location.href);
      target.searchParams.delete("activity");
      location.href = /\/(bookings|admin)\.html$/.test(target.pathname)
        ? "home.html"
        : target.pathname + target.search + target.hash;
    } catch (err) {
      document.querySelector("#guest-status").textContent = err.message;
    }
  };
  document.querySelector("[data-password]").onclick = (ev) => {
    const input = form.elements.password;
    input.type = input.type === "password" ? "text" : "password";
    ev.target.textContent = input.type === "password" ? "Show" : "Hide";
    ev.target.setAttribute(
      "aria-label",
      input.type === "password" ? "Show password" : "Hide password",
    );
  };
  document.querySelector("[data-fill-demo]").onclick = (ev) => {
    const admin = ev.currentTarget.dataset.fillDemo === "admin";
    form.elements.email.value = admin
      ? "admin@miles.test"
      : "traveler@miles.test";
    form.elements.password.value = admin ? "Admin123!" : "Travel123!";
    if (form.elements.name) form.elements.name.value = "Alex Traveler";
    if (form.dataset.mode === "register") {
      location.href = "login.html" + location.search;
      return;
    }
    form.elements.password.focus();
  };
  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const button = form.querySelector("[type=submit]"),
      status = form.querySelector(".form-status");
    button.disabled = true;
    status.textContent = "Opening your next chapter…";
    try {
      const f = Object.fromEntries(new FormData(form));
      if (form.dataset.mode === "register")
        await register(f.name, f.email, f.password);
      const user = await login(f.email, f.password);
      location.href =
        user.role === "admin" && next === "home.html" ? "admin.html" : next;
    } catch (err) {
      status.textContent = err.message;
      button.disabled = false;
    }
  };
}
function bindDestinations() {
  const form = document.getElementById("destination-filters");
  const render = () => {
    stopGalleries();
    const f = Object.fromEntries(new FormData(form)),
      items = filterDestinations(pages.catalog(), f);
    const rail = document.getElementById("destination-results");
    rail.innerHTML = items.length
      ? items.map(pages.destinationPanel).join("")
      : emptyState(
          "No places found just yet.",
          "Try a different word, a larger budget, or reset the filters.",
          "destinations.html",
          "Reset filters",
        );
    rail.scrollLeft = 0;
    document.getElementById("result-count").textContent =
      `${items.length} destination${items.length === 1 ? "" : "s"} to discover`;
    bindCommonActions(rail);
    initGalleries(rail);
    initRails();
  };
  form.oninput = render;
  form.onsubmit = (ev) => ev.preventDefault();
  form.onreset = () =>
    setTimeout(() => {
      form.elements.q.value = "";
      form.elements.category.value = "";
      render();
    }, 0);
  render();
}
function bindHotels() {
  const form = document.getElementById("hotel-search");
  const render = () => {
    const f = Object.fromEntries(new FormData(form)),
      nights = nightsBetween(f.checkin, f.checkout);
    const status = form.querySelector(".form-status");
    if (f.checkin < today() || nights < 1 || nights > 30) {
      status.textContent =
        "Choose a future stay of 1–30 nights, with checkout after check-in.";
      document.getElementById("hotel-results").innerHTML = "";
      return;
    }
    status.textContent = "";
    let items = destinations.filter(
      (d) => !f.destination || d.id === f.destination,
    );
    if (f.sort === "price") {
      const rates = {
        bali: 6200,
        santorini: 12800,
        switzerland: 16400,
        kyoto: 9500,
        maldives: 18200,
        jaipur: 4200,
      };
      items.sort((a, b) => rates[a.id] - rates[b.id]);
    }
    const root = document.getElementById("hotel-results");
    root.innerHTML = items.map((d) => pages.hotelCard(d, f)).join("");
    bindCommonActions(root);
  };
  form.onsubmit = (ev) => {
    ev.preventDefault();
    render();
  };
  form.onchange = () => {
    document.getElementById("hotel-results").innerHTML =
      '<p class="notice full">Your search changed. Select “Find a stay” to refresh the results.</p>';
  };
  render();
}
function bindFlights() {
  const form = document.getElementById("flight-search");
  form.onsubmit = (ev) => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(form)),
      status = form.querySelector(".form-status");
    if (f.from === f.to) {
      status.textContent = "Choose different departure and arrival airports.";
      document.getElementById("flight-results").innerHTML = "";
      return;
    }
    if (f.date < today()) {
      status.textContent = "Choose today or a future departure date.";
      return;
    }
    status.textContent = "";
    const root = document.getElementById("flight-results");
    root.innerHTML = [0, 1, 2].map((i) => pages.flightCard(f, i)).join("");
    bindCommonActions(root);
  };
  form.onchange = () =>
    (document.getElementById("flight-results").innerHTML =
      '<p class="notice">Your route changed. Search again for updated sample flights.</p>');
}
function bindReviews() {
  const form = document.getElementById("review-form");
  form.onsubmit = (ev) => {
    ev.preventDefault();
    if (!requireAuth()) return;
    try {
      const f = Object.fromEntries(new FormData(form));
      if (f.text.trim().length < 10)
        throw new Error("Share at least 10 characters.");
      updateState((s) =>
        s.reviews.unshift({
          id: uid(),
          userId: currentUser().id,
          name: currentUser().name,
          destination: f.destination,
          rating: Number(f.rating),
          text: f.text.trim(),
          created: new Date().toISOString(),
        }),
      );
      location.reload();
    } catch (err) {
      form.querySelector(".form-status").textContent = err.message;
    }
  };
}
window.addEventListener("storage", (event) => {
  if (event.key === "miles-moments:v1") location.reload();
});
boot().catch((err) => {
  document.getElementById("app").innerHTML =
    `<main class="container"><h1>Let’s get you back on your way.</h1><p>The local demo could not start. Use a current browser and open the site through the local server.</p><p id="boot-error"></p><button id="recover" class="button">Reset local demo data</button></main>`;
  document.getElementById("boot-error").textContent = err.message;
  document.querySelector("#recover").onclick = () => {
    if (confirm("Reset all Miles & Moments data in this browser?"))
      resetStorage();
  };
  console.error(err);
});
