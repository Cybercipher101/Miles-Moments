export const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function nightsBetween(start, end) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start || "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end || "")
  )
    return 0;
  return Math.round(
    (Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) /
      86400000,
  );
}
export function bookingTotal(type, rate, guests, nights = 1) {
  if (
    !Number.isFinite(rate) ||
    rate <= 0 ||
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > 8
  )
    throw new Error("Choose between 1 and 8 travelers.");
  if (
    type === "hotel" &&
    (!Number.isInteger(nights) || nights < 1 || nights > 30)
  )
    throw new Error("Choose a stay of 1 to 30 nights.");
  return Math.round(
    rate * (type === "hotel" ? Math.ceil(guests / 2) * nights : guests),
  );
}
export function filterDestinations(
  items,
  { q = "", category = "", budget = Infinity, sort = "featured" } = {},
) {
  const term = q.trim().toLowerCase();
  const result = items.filter(
    (d) =>
      [d.name, d.country, d.intro, ...d.activities.flat()]
        .join(" ")
        .toLowerCase()
        .includes(term) &&
      (!category || d.category === category) &&
      d.price <= Number(budget),
  );
  if (sort === "price-low") result.sort((a, b) => a.price - b.price);
  if (sort === "price-high") result.sort((a, b) => b.price - a.price);
  if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
  return result;
}
export function safeReturn(value) {
  const allowed = [
    "home.html",
    "destinations.html",
    "destination.html",
    "package.html",
    "hotels.html",
    "flights.html",
    "itinerary.html",
    "gallery.html",
    "reviews.html",
    "bookings.html",
    "contact.html",
    "admin.html",
  ];
  try {
    const url = new URL(value, "http://local/");
    return url.origin === "http://local" &&
      allowed.includes(url.pathname.slice(1))
      ? url.pathname.slice(1) + url.search
      : "home.html";
  } catch {
    return "home.html";
  }
}
export const dateLabel = (date) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
