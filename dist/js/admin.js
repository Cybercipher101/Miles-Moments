import { currentUser, getState, updateState, uid } from "./store.js";
import { packages } from "./pages.js";
import { destinations, destinationById } from "./data.js";
import { escapeHTML as e, money, dateLabel } from "./core.js";
import { pageIntro, emptyState, field, options, icon } from "./ui.js";
import { modal, toast } from "./actions.js";
let tab = "users";
export function adminPage() {
  const u = currentUser();
  if (u?.role !== "admin")
    return `${pageIntro("THE ADMIN DESK", "A thoughtful view behind the journey.", "Manage the local demo’s travelers, packages, reservations, and messages.")}<div class="container">${emptyState("Administrator sign-in required.", "Use the demo administrator account to explore these controls. Traveler accounts cannot access this interface.", "login.html?role=admin&next=admin.html", "Admin sign-in")}</div>`;
  const s = getState();
  return `${pageIntro("ADMINISTRATION · LOCAL DEMO", "The travel desk.", "A clear view of the people, plans, and little details behind each journey.")}<section class="container"><div class="notice">Admin controls affect only data in this browser. This frontend demonstrates roles; it is not a secure administration service.</div><div class="stats-grid"><div class="stat"><span>TRAVELERS</span><strong>${s.users.filter((u) => u.role === "traveler").length}</strong></div><div class="stat"><span>CONFIRMED BOOKINGS</span><strong>${s.bookings.filter((b) => b.status === "confirmed").length}</strong></div><div class="stat"><span>UNREAD MESSAGES</span><strong>${s.messages.filter((m) => !m.read).length}</strong></div></div><div class="admin-tabs" role="tablist" aria-label="Admin sections">${[
    ["users", "Users"],
    ["bookings", "Bookings"],
    ["packages", "Packages"],
    ["inbox", "Inbox"],
  ]
    .map(
      ([id, label]) =>
        `<button role="tab" aria-selected="${id === tab}" data-admin-tab="${id}" id="tab-${id}" aria-controls="admin-content">${label}</button>`,
    )
    .join(
      "",
    )}</div><div id="admin-content" role="tabpanel" aria-labelledby="tab-${tab}"></div></section>`;
}
function assertAdmin() {
  if (currentUser()?.role !== "admin")
    throw new Error("An active admin session is required.");
}
function mutate(fn) {
  try {
    assertAdmin();
    updateState(fn);
    renderTab();
  } catch (err) {
    toast(err.message);
  }
}
export function bindAdmin() {
  if (currentUser()?.role !== "admin") return;
  document.querySelectorAll("[data-admin-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.adminTab;
        document
          .querySelectorAll("[data-admin-tab]")
          .forEach((x) => x.setAttribute("aria-selected", String(x === b)));
        document
          .querySelector("#admin-content")
          .setAttribute("aria-labelledby", b.id);
        renderTab();
      }),
  );
  renderTab();
}
function renderTab() {
  const s = getState(),
    root = document.getElementById("admin-content");
  if (tab === "users") {
    root.innerHTML = `<div class="admin-heading"><h2>People on the journey</h2></div><div class="table-wrap"><table><thead><tr><th>Name / email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>${s.users.map((u) => `<tr><td><strong>${e(u.name)}</strong><br>${e(u.email)}</td><td>${e(u.role)}</td><td><span class="status ${u.active ? "" : "cancelled"}">${u.active ? "Active" : "Inactive"}</span></td><td>${u.role === "admin" ? '<span class="tiny muted">Administrator protected</span>' : `<div class="row"><button class="text-button" data-toggle-user="${u.id}">${u.active ? "Deactivate" : "Activate"}</button><button class="text-button" data-delete-user="${u.id}">Delete</button></div>`}</td></tr>`).join("")}</tbody></table></div>`;
    root.querySelectorAll("[data-toggle-user]").forEach(
      (b) =>
        (b.onclick = () =>
          mutate((s) => {
            const u = s.users.find((x) => x.id === b.dataset.toggleUser);
            if (u?.role === "traveler") u.active = !u.active;
          })),
    );
    root.querySelectorAll("[data-delete-user]").forEach(
      (b) =>
        (b.onclick = () => {
          if (
            confirm(
              "Delete this traveler and their local itinerary? Booking records remain for the admin.",
            )
          )
            mutate((s) => {
              s.users = s.users.filter(
                (u) => u.id !== b.dataset.deleteUser || u.role === "admin",
              );
              delete s.itineraries[b.dataset.deleteUser];
            });
        }),
    );
  } else if (tab === "bookings") {
    root.innerHTML = `<div class="admin-heading"><h2>Every plan, in one place</h2></div>${
      s.bookings.length
        ? `<div class="table-wrap"><table><thead><tr><th>Reference / journey</th><th>Traveler</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>${s.bookings
            .slice()
            .reverse()
            .map(
              (b) =>
                `<tr><td><span class="tiny">${e(b.reference)}</span><br><strong>${e(b.title)}</strong></td><td>${e(s.users.find((u) => u.id === b.userId)?.name || "Deleted traveler")}</td><td>${dateLabel(b.date)}</td><td>${money(b.total)}</td><td><select aria-label="Booking status for ${e(b.reference)}" data-booking-status="${b.id}">${options(
                  [
                    ["confirmed", "Confirmed"],
                    ["cancelled", "Cancelled"],
                  ],
                  b.status,
                )}</select></td></tr>`,
            )
            .join("")}</tbody></table></div>`
        : '<p class="panel">No bookings yet. A traveler’s demo bookings will appear here.</p>'
    }`;
    root.querySelectorAll("[data-booking-status]").forEach(
      (select) =>
        (select.onchange = () =>
          mutate((s) => {
            const b = s.bookings.find(
              (x) => x.id === select.dataset.bookingStatus,
            );
            if (b) b.status = select.value;
          })),
    );
  } else if (tab === "packages") {
    root.innerHTML = `<div class="row between wrap admin-heading"><h2>Curate the collection</h2><button class="button small" id="add-package">+ Create package</button></div><div class="grid three">${packages()
      .map(
        (p) =>
          `<article class="admin-card"><span class="eyebrow">${e(destinationById(p.destination)?.name || p.destination)}</span><h3>${e(p.name)}</h3><p>${money(p.price)} · ${p.days} days</p><span class="status ${p.active ? "" : "cancelled"}">${p.active ? "Active" : "Inactive"}</span><div class="row wrap"><button class="text-button" data-edit-package="${e(p.id)}">Edit</button><button class="text-button" data-toggle-package="${e(p.id)}">${p.active ? "Deactivate" : "Activate"}</button><button class="text-button" data-delete-package="${e(p.id)}">Delete</button></div></article>`,
      )
      .join(
        "",
      )}</div><button class="text-button" id="restore-packages">Restore six sample packages</button>`;
    root.querySelector("#add-package").onclick = () => editPackage();
    root
      .querySelectorAll("[data-edit-package]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            editPackage(
              packages().find((p) => p.id === b.dataset.editPackage),
            )),
      );
    root.querySelectorAll("[data-toggle-package]").forEach(
      (b) =>
        (b.onclick = () => {
          const p = packages().find((p) => p.id === b.dataset.togglePackage);
          mutate((s) => (s.packages[p.id] = { ...p, active: !p.active }));
        }),
    );
    root.querySelectorAll("[data-delete-package]").forEach(
      (b) =>
        (b.onclick = () => {
          if (
            confirm(
              "Remove this package from the collection? Existing bookings will remain.",
            )
          ) {
            const p = packages().find((p) => p.id === b.dataset.deletePackage);
            mutate((s) => (s.packages[p.id] = { ...p, deleted: true }));
          }
        }),
    );
    root.querySelector("#restore-packages").onclick = () => {
      if (
        confirm(
          "Restore the original six sample packages? Custom packages will remain.",
        )
      )
        mutate((s) => destinations.forEach((d) => delete s.packages[d.id]));
    };
  } else {
    root.innerHTML = `<div class="admin-heading"><h2>A little hello from your travelers</h2></div><div class="stack">${
      s.messages.length
        ? s.messages
            .slice()
            .reverse()
            .map(
              (m) =>
                `<article class="admin-card"><div class="row between wrap"><span class="eyebrow">${e(m.topic)}</span><span class="status">${m.read ? "Read" : "Unread"}</span></div><h3>${e(m.name)}</h3><p>${e(m.email)} · ${new Date(m.created).toLocaleDateString("en-IN")}</p><p class="inbox-message">${e(m.message)}</p><div class="row"><button class="text-button" data-read-message="${m.id}">${m.read ? "Mark unread" : "Mark read"}</button><button class="text-button" data-delete-message="${m.id}">Delete message</button></div></article>`,
            )
            .join("")
        : '<p class="panel">The local inbox is empty. Contact form submissions will appear here.</p>'
    }</div>`;
    root.querySelectorAll("[data-read-message]").forEach(
      (b) =>
        (b.onclick = () =>
          mutate((s) => {
            const m = s.messages.find((x) => x.id === b.dataset.readMessage);
            if (m) m.read = !m.read;
          })),
    );
    root.querySelectorAll("[data-delete-message]").forEach(
      (b) =>
        (b.onclick = () => {
          if (confirm("Delete this message from the local inbox?"))
            mutate(
              (s) =>
                (s.messages = s.messages.filter(
                  (m) => m.id !== b.dataset.deleteMessage,
                )),
            );
        }),
    );
  }
}
function editPackage(p) {
  const dialog = modal(
    p ? "Edit the escape" : "Create a new escape",
    `<form class="form-grid" id="package-form">${field("Package name", "name", "text", p?.name || "", 'required minlength="3" maxlength="80"')}<label>Destination<select name="destination">${options(
      destinations.map((d) => [d.id, d.name]),
      p?.destination || "bali",
    )}</select></label>${field("Price per person (INR)", "price", "number", p?.price || 42900, 'required min="100" max="10000000" step="100"')}${field("Days", "days", "number", p?.days || 5, 'required min="1" max="30"')}<label class="check-label full"><input type="checkbox" name="active" ${p?.active === false ? "" : "checked"}> Available to travelers</label><p class="form-hint full">Uses the destination’s imagery and itinerary. Additional days are free exploration days.</p><button class="button full" type="submit">Save package ${icon("check")}</button><p class="form-status full" role="status"></p></form>`,
  );
  dialog.querySelector("form").onsubmit = (ev) => {
    ev.preventDefault();
    try {
      assertAdmin();
      const f = Object.fromEntries(new FormData(ev.target));
      if (f.name.trim().length < 3) throw new Error("Enter a package name.");
      const value = {
        id: p?.id || uid(),
        name: f.name.trim(),
        destination: f.destination,
        price: Number(f.price),
        days: Number(f.days),
        active: f.active === "on",
      };
      updateState((s) => (s.packages[value.id] = value));
      dialog.close();
      renderTab();
      toast("Package saved.");
    } catch (err) {
      ev.target.querySelector(".form-status").textContent = err.message;
    }
  };
}
