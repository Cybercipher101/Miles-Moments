const screens = [
  {
    id: "index",
    name: "Login",
    chapter: "welcome",
    description: "A welcoming first stop, with a guest seat ready for you.",
  },
  {
    id: "home",
    name: "Home",
    chapter: "discover",
    description: "Scenic chapters, thoughtful details, and a little hello.",
  },
  {
    id: "flights",
    name: "Flights",
    chapter: "plan",
    description: "A window seat, a destination, a new possibility.",
  },
  {
    id: "gallery",
    name: "Gallery",
    chapter: "discover",
    description: "Six visual journals, with room to look a little closer.",
  },
  {
    id: "destinations",
    name: "Destinations",
    chapter: "discover",
    description: "Search, filter, and find your kind of escape.",
  },
  {
    id: "booking",
    name: "Booking",
    chapter: "plan",
    description: "Clear dates, traveler counts, and illustrative totals.",
  },
  {
    id: "register",
    name: "Registration",
    chapter: "welcome",
    description: "Create your own traveler account in this browser.",
  },
  {
    id: "itinerary",
    name: "Itinerary",
    chapter: "plan",
    description: "Your days, your detours, your own little journal.",
  },
  {
    id: "admin",
    name: "Administration",
    chapter: "admin",
    description: "A separate local desk for users, trips, and messages.",
  },
];
const photos = screens.flatMap((screen) =>
  ["desktop", "mobile"].map((device) => ({
    ...screen,
    device,
    width: device === "desktop" ? 1440 : 390,
    src: `screenshots/${screen.id}-${device === "desktop" ? 1440 : 390}.png`,
  })),
);
const cards = document.querySelector("#cards");
const search = document.querySelector("#search");
const chapter = document.querySelector("#chapter");
const viewer = document.querySelector("#viewer");
let device = "all";
let opener;
function render() {
  const query = search.value.trim().toLowerCase();
  const matches = photos.filter(
    (p) =>
      (device === "all" || p.device === device) &&
      (chapter.value === "all" || chapter.value === p.chapter) &&
      `${p.name} ${p.description} ${p.device}`.toLowerCase().includes(query),
  );
  cards.replaceChildren(
    ...matches.map((photo, i) => {
      const card = document.createElement("article");
      card.className = `postcard ${photo.device}`;
      // Values below come from the fixed local catalog, never the search input.
      card.innerHTML = `<div class="screen-preview"><img src="${photo.src}" alt="${photo.name} ${photo.device} screenshot" width="${photo.width}" height="900" loading="lazy"></div><div class="postcard-body"><div class="postcard-top"><span class="tag">${photo.device.toUpperCase()} · ${photo.width} PX</span><span class="number">${String(i + 1).padStart(2, "0")}</span></div><h2>${photo.name}</h2><p>${photo.description}</p><button type="button" aria-label="Open ${photo.name} ${photo.device} screenshot">Take a closer look ↗</button></div>`;
      card.querySelector("button").onclick = (event) => {
        opener = event.currentTarget;
        document.querySelector("#viewer-title").textContent =
          `${photo.name} · ${photo.device}`;
        document.querySelector("#viewer-note").textContent =
          `${photo.width}px viewport capture. Scroll inside the frame for longer pages. Escape closes this view.`;
        const image = document.querySelector("#full-image");
        image.src = photo.src;
        image.alt = `${photo.name} ${photo.device} full screenshot`;
        image.width = photo.width;
        viewer.showModal();
        document.querySelector(".full-screenshot").scrollTop = 0;
      };
      return card;
    }),
  );
  document.querySelector("#count").textContent =
    `${matches.length} ${matches.length === 1 ? "view" : "views"} in your collection`;
  document.querySelector("#empty").hidden = matches.length > 0;
}
document.querySelectorAll("[data-device]").forEach((button) => {
  button.onclick = () => {
    device = button.dataset.device;
    document
      .querySelectorAll("[data-device]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    render();
  };
});
function reset() {
  device = "all";
  search.value = "";
  chapter.value = "all";
  document
    .querySelectorAll("[data-device]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.device === "all")),
    );
  render();
}
search.addEventListener("input", render);
chapter.addEventListener("change", render);
document.querySelector("#reset").onclick = reset;
document.querySelector("#empty-reset").onclick = reset;
document.querySelector("#close").onclick = () => viewer.close();
viewer.addEventListener("close", () => opener?.focus());
render();
