import { currentUser, getState, updateState, uid } from "./store.js";
import {
  destinations,
  destinationById,
  hotelNames,
  hotelRates,
} from "./data.js";
import { packages } from "./pages.js";
import {
  escapeHTML as e,
  money,
  today,
  nightsBetween,
  bookingTotal,
  dateLabel,
} from "./core.js";
import { field, icon, gallery } from "./ui.js";
import { initGalleries, stopGalleries } from "./carousel.js";
export function toast(message) {
  const t = document.getElementById("toast");
  t.textContent = message;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.textContent = ""), 4500);
}
export function requireAuth() {
  if (currentUser()) return true;
  location.href = `login.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}`;
  return false;
}
export function modal(title, body, { wide = false } = {}) {
  document.querySelector("dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = wide ? "gallery-dialog" : "";
  dialog.innerHTML = `<div class="dialog-header"><h2 id="dialog-title">${e(title)}</h2><button class="icon-button" data-close aria-label="Close dialog">${icon("close")}</button></div>${body}`;
  dialog.setAttribute("aria-labelledby", "dialog-title");
  document.body.append(dialog);
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.addEventListener("click", (ev) => {
    if (ev.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        ev.clientX < r.left ||
        ev.clientX > r.right ||
        ev.clientY < r.top ||
        ev.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    stopGalleries();
    dialog.remove();
  });
  dialog.showModal();
  return dialog;
}
export function expandGallery(id) {
  const d = destinationById(id);
  if (!d) return;
  stopGalleries();
  const dialog = modal(
    `${d.name} · a closer look`,
    gallery(d, { expand: false, key: "immersive-" + id, eager: true }) +
      '<p class="tiny muted">Original AI-generated destination impressions. Swipe, use the arrows, or press Play.</p>',
    { wide: true },
  );
  initGalleries(dialog);
}
export function openBooking(type, id, search = {}, rate = 0) {
  if (!requireAuth()) return;
  const p =
    type === "package" ? packages().find((p) => p.id === id && p.active) : null;
  const d = destinationById(type === "package" ? p?.destination : id);
  if (type === "package" && !p) {
    toast("This package is no longer available.");
    return;
  }
  const title =
    type === "package"
      ? p.name
      : type === "hotel"
        ? hotelNames[id]
        : `${search.from} → ${search.to} · ${search.airline}`;
  const price =
    type === "package" ? p.price : type === "hotel" ? hotelRates[id] : rate;
  const date = search.checkin || search.date || today(7);
  const dialog = modal(
    "Your next chapter",
    `<p class="eyebrow">${e(type)} · DEMO RESERVATION</p><h3>${e(title)}</h3><form id="booking-form" class="form-grid">${field("Traveler name", "name", "text", currentUser().name, 'required minlength="2" maxlength="60"')}${field("Travelers", "guests", "number", search.guests || 1, 'required min="1" max="8"')}${field(type === "hotel" ? "Check-in" : "Departure date", "date", "date", date, `required min="${today()}"`)}${type === "hotel" ? field("Check-out", "endDate", "date", search.checkout || today(10), `required min="${today(1)}"`) : ""}<p class="full form-hint">${type === "hotel" ? `${money(price)} per room/night. Two guests per room. Stay up to 30 nights.` : `${money(price)} per person. ${type === "package" ? p.days + " days." : ""}`} ${type === "flight" ? e(search.cabin) + " · " + e(search.time) + " departure." : ""}</p><div class="booking-summary full"><span>Illustrative total</span><strong id="booking-total"></strong></div><label class="check-label full"><input type="checkbox" name="consent" required>I understand this saves a demo booking only. No payment is taken and no real reservation is made.</label><button class="button full" type="submit">Confirm demo booking ${icon("check")}</button><p class="form-status full" role="status"></p></form>`,
  );
  const form = dialog.querySelector("form"),
    totalEl = dialog.querySelector("#booking-total");
  const calculate = () => {
    try {
      totalEl.textContent = money(
        bookingTotal(
          type,
          price,
          Number(form.elements.guests.value),
          type === "hotel"
            ? nightsBetween(
                form.elements.date.value,
                form.elements.endDate.value,
              )
            : 1,
        ),
      );
    } catch {
      totalEl.textContent = "—";
    }
  };
  form.addEventListener("input", calculate);
  calculate();
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const status = form.querySelector(".form-status");
    try {
      if (!currentUser())
        throw new Error(
          "Your session ended. Close this dialog and sign in again.",
        );
      const f = Object.fromEntries(new FormData(form));
      if (f.date < today()) throw new Error("Choose today or a future date.");
      if (type === "flight" && f.date !== date)
        throw new Error(
          "To change the flight date, close this dialog and search again.",
        );
      const guests = Number(f.guests),
        nights = type === "hotel" ? nightsBetween(f.date, f.endDate) : 1;
      const total = bookingTotal(type, price, guests, nights);
      if (
        type === "package" &&
        !packages().some((x) => x.id === id && x.active)
      )
        throw new Error("This package is no longer available.");
      const reference = "MM-" + uid().slice(0, 8).toUpperCase();
      updateState((s) =>
        s.bookings.push({
          id: uid(),
          reference,
          userId: currentUser().id,
          type,
          title,
          traveler: f.name.trim(),
          date: f.date,
          endDate: f.endDate || "",
          guests,
          total,
          status: "confirmed",
          created: new Date().toISOString(),
          details:
            type === "hotel"
              ? `${nights} night(s) · ${Math.ceil(guests / 2)} room(s)`
              : type === "flight"
                ? `${search.cabin} · ${search.time} departure · Sample flight`
                : `${p.days} days · ${d.name}`,
        }),
      );
      dialog.close();
      modal(
        "A moment to look forward to",
        `<div class="confirmation"><div class="confirm-stamp">✓</div><h3>Your demo booking is saved.</h3><p>${e(title)}<br>${dateLabel(f.date)} · ${money(total)}</p><p class="eyebrow">${reference}</p><p class="muted">Your plan is stored in this browser. No ticket, reservation, or payment has been created.</p><a class="button" href="bookings.html">View my bookings ${icon("arrow")}</a></div>`,
      );
    } catch (err) {
      status.textContent = err.message;
    }
  });
}
export function bindCommonActions(root = document) {
  root
    .querySelectorAll("[data-expand]")
    .forEach((b) => (b.onclick = () => expandGallery(b.dataset.expand)));
  root
    .querySelectorAll("[data-book-package]")
    .forEach(
      (b) => (b.onclick = () => openBooking("package", b.dataset.bookPackage)),
    );
  root
    .querySelectorAll("[data-book-hotel]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          openBooking(
            "hotel",
            b.dataset.bookHotel,
            JSON.parse(b.dataset.search),
          )),
    );
  root
    .querySelectorAll("[data-book-flight]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          openBooking(
            "flight",
            b.dataset.bookFlight,
            JSON.parse(b.dataset.search),
            Number(b.dataset.rate),
          )),
    );
  root.querySelectorAll("[data-contact]").forEach(
    (form) =>
      (form.onsubmit = (ev) => {
        ev.preventDefault();
        const status = form.querySelector(".form-status");
        try {
          const f = Object.fromEntries(new FormData(form));
          if (f.message.trim().length < 10)
            throw new Error(
              "Please write a message of at least 10 characters.",
            );
          updateState((s) =>
            s.messages.push({
              id: uid(),
              ...f,
              name: f.name.trim(),
              message: f.message.trim(),
              created: new Date().toISOString(),
              read: false,
            }),
          );
          form.reset();
          status.classList.add("success");
          status.textContent =
            "Your message is saved in the local demo inbox. No email was sent.";
        } catch (err) {
          status.textContent = err.message;
        }
      }),
  );
  root.querySelectorAll("[data-cancel-booking]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!confirm("Cancel this demo booking?")) return;
        try {
          updateState((s) => {
            const x = s.bookings.find(
              (x) =>
                x.id === b.dataset.cancelBooking &&
                x.userId === currentUser()?.id,
            );
            if (x) x.status = "cancelled";
          });
          location.reload();
        } catch (err) {
          toast(err.message);
        }
      }),
  );
}
export function bindItinerary() {
  const id = document.querySelector("#itinerary-destination").value,
    d = destinationById(id),
    user = currentUser();
  const sample = () =>
    d.itinerary.map((title, i) => ({
      id: uid(),
      title: `Day ${i + 1}`,
      items: [{ id: uid(), text: title, done: false }],
    }));
  let days = getState().itineraries[user?.id]?.[id] || sample();
  let status = document.querySelector("#itinerary-status");
  const persist = () => {
    if (!user) return;
    try {
      updateState((s) => {
        s.itineraries[user.id] ??= {};
        s.itineraries[user.id][id] = days;
      });
      status.textContent = "Saved to your local travel journal.";
      status.className = "form-status success";
    } catch (err) {
      status.textContent = err.message;
    }
  };
  const render = () => {
    document.getElementById("itinerary-days").innerHTML = days
      .map(
        (day, i) =>
          `<article class="itinerary-day" data-day="${day.id}"><div class="row between"><label class="full-width"><span class="eyebrow">CHAPTER ${String(i + 1).padStart(2, "0")}</span><input class="day-title" aria-label="Day title" value="${e(day.title)}" maxlength="60"></label><div class="day-actions"><button class="icon-button" data-day-up aria-label="Move day up" ${i === 0 ? "disabled" : ""}>↑</button><button class="icon-button" data-day-down aria-label="Move day down" ${i === days.length - 1 ? "disabled" : ""}>↓</button><button class="icon-button" data-day-delete aria-label="Delete day">×</button></div></div><div>${day.items.map((item) => `<div class="itinerary-item" data-item="${item.id}"><input type="checkbox" aria-label="Mark activity complete" ${item.done ? "checked" : ""}><input type="text" aria-label="Activity description" maxlength="180" value="${e(item.text)}"><button class="text-button" data-item-delete aria-label="Remove activity">Remove</button></div>`).join("")}</div><form data-add-item><input name="activity" required maxlength="180" aria-label="New activity" placeholder="A little adventure to add…"><button class="button secondary small">+ Add activity</button></form></article>`,
      )
      .join("");
    for (const node of document.querySelectorAll("[data-day]")) {
      const day = days.find((x) => x.id === node.dataset.day);
      node.querySelector(".day-title").onchange = (ev) => {
        day.title = ev.target.value.trim() || "Untitled day";
        persist();
      };
      node.querySelector("[data-day-up]").onclick = () => {
        const i = days.indexOf(day);
        [days[i - 1], days[i]] = [days[i], days[i - 1]];
        persist();
        render();
      };
      node.querySelector("[data-day-down]").onclick = () => {
        const i = days.indexOf(day);
        [days[i + 1], days[i]] = [days[i], days[i + 1]];
        persist();
        render();
      };
      node.querySelector("[data-day-delete]").onclick = () => {
        if (confirm("Remove this day and its activities?")) {
          days = days.filter((x) => x.id !== day.id);
          persist();
          render();
        }
      };
      node.querySelector("[data-add-item]").onsubmit = (ev) => {
        ev.preventDefault();
        const input = ev.target.elements.activity;
        if (!input.value.trim()) return;
        day.items.push({ id: uid(), text: input.value.trim(), done: false });
        persist();
        render();
      };
      for (const row of node.querySelectorAll("[data-item]")) {
        const index = day.items.findIndex((x) => x.id === row.dataset.item);
        const controls = document.createElement("div");
        controls.className = "activity-order";
        controls.innerHTML = `<button class="icon-button" aria-label="Move activity up" ${index === 0 ? "disabled" : ""}>↑</button><button class="icon-button" aria-label="Move activity down" ${index === day.items.length - 1 ? "disabled" : ""}>↓</button>`;
        row.append(controls);
        controls.querySelectorAll("button").forEach(
          (button, i) =>
            (button.onclick = () => {
              const target = index + (i === 0 ? -1 : 1);
              [day.items[index], day.items[target]] = [
                day.items[target],
                day.items[index],
              ];
              persist();
              render();
            }),
        );
      }
      for (const row of node.querySelectorAll("[data-item]")) {
        const item = day.items.find((x) => x.id === row.dataset.item);
        row.querySelector("[type=checkbox]").onchange = (ev) => {
          item.done = ev.target.checked;
          persist();
        };
        row.querySelector("[type=text]").onchange = (ev) => {
          item.text = ev.target.value.trim() || "Untitled activity";
          persist();
        };
        row.querySelector("[data-item-delete]").onclick = () => {
          day.items = day.items.filter((x) => x.id !== item.id);
          persist();
          render();
        };
      }
    }
  };
  document.querySelector("#itinerary-destination").onchange = (ev) =>
    (location.href = `itinerary.html?destination=${ev.target.value}`);
  document.querySelector("[data-add-day]").onclick = () => {
    if (!requireAuth()) return;
    if (days.length >= 30) {
      toast("Keep your itinerary to 30 days or fewer.");
      return;
    }
    days.push({ id: uid(), title: `Day ${days.length + 1}`, items: [] });
    persist();
    render();
  };
  document.querySelector("[data-save-itinerary]").onclick = () => {
    if (requireAuth()) persist();
  };
  document.querySelector("[data-reset-itinerary]").onclick = () => {
    if (confirm("Replace this itinerary with the sample plan?")) {
      days = sample();
      persist();
      render();
    }
  };
  document.querySelector("[data-export-itinerary]").onclick = () => {
    const text =
      `MILES & MOMENTS\n${d.name} — My travel journal\nIllustrative itinerary; no reservation made.\n\n` +
      days
        .map(
          (day) =>
            day.title +
            "\n" +
            day.items
              .map((item) => `${item.done ? "[x]" : "[ ]"} ${item.text}`)
              .join("\n"),
        )
        .join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `miles-moments-${id}-itinerary.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const activityParam = new URLSearchParams(location.search).get("activity");
  if (
    activityParam !== null &&
    /^\d+$/.test(activityParam) &&
    d.activities[Number(activityParam)]
  ) {
    if (!requireAuth()) return;
    if (!days.length) days.push({ id: uid(), title: "Day 1", items: [] });
    days[0].items.push({
      id: uid(),
      text: d.activities[Number(activityParam)][1],
      done: false,
    });
    persist();
    history.replaceState(null, "", `itinerary.html?destination=${id}`);
    toast("Activity added to the first day of your itinerary.");
  }
  render();
}
