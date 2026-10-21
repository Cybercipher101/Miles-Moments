import { test, expect } from "@playwright/test";
const ready = (page) =>
  expect(page.locator("body")).toHaveAttribute("data-ready", "true");
async function guest(page, path = "/home.html") {
  await page.goto(path);
  await ready(page);
  await page.getByRole("button", { name: "Continue as guest" }).click();
  await expect(page).not.toHaveURL(/login.html/);
  await ready(page);
}
test("login is the entry page; direct URLs require an explicit choice", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Your name")).toHaveCount(0);
  await page
    .getByRole("link", { name: "Create an account", exact: true })
    .click();
  await expect(page).toHaveURL(/register.html/);
  await expect(page.getByLabel("Your name")).toBeVisible();
  for (const path of [
    "home.html",
    "flights.html",
    "gallery.html",
    "bookings.html",
    "admin.html",
    "package.html?id=kyoto",
  ]) {
    await page.goto("/" + path);
    await ready(page);
    await expect(page).toHaveURL(
      new RegExp(
        "login.html\\?next=" +
          encodeURIComponent(path).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      ),
    );
    await expect(
      page.locator(
        ".site-header, #flight-search, [data-book-package], .booking-ticket",
      ),
    ).toHaveCount(0);
  }
});
test("guest persists across pages and tabs but cannot open any booking form", async ({
  page,
  context,
}) => {
  await guest(page, "/package.html?id=bali");
  await expect(page.locator(".guest-badge")).toHaveText("Guest browsing");
  await page.reload();
  await ready(page);
  await expect(page).toHaveURL(/package.html\?id=bali/);
  const tab = await context.newPage();
  await tab.goto("/gallery.html");
  await ready(tab);
  await expect(tab.locator(".photo-journal")).toHaveCount(6);
  await tab.close();
  for (const [path, label] of [
    ["package.html?id=bali", "Plan this escape"],
    ["hotels.html?destination=bali", "Choose stay"],
    ["flights.html", "Select flight"],
  ]) {
    await page.goto("/" + path);
    await ready(page);
    if (path === "flights.html")
      await page.getByRole("button", { name: "Search flights" }).click();
    await page.getByRole("button", { name: label }).first().click();
    await expect(page).toHaveURL(/login.html\?next=/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto("/bookings.html");
  await expect(page).toHaveURL(/login.html\?next=bookings.html/);
  await page.getByRole("button", { name: "Continue as guest" }).click();
  await expect(page).toHaveURL(/home.html/);
  await page.goto("/bookings.html");
  await page.getByLabel("Email address").fill("traveler@miles.test");
  await page.getByLabel("Password", { exact: true }).fill("Travel123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/bookings.html$/);
  await expect(page.locator(".stats-grid")).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/home.html");
  await expect(page).toHaveURL(/login.html\?next=home.html/);
});
test("scroll reveals, chapter links, flight inspiration and gallery remain usable with reduced motion", async ({
  page,
}) => {
  await guest(page);
  await expect(page.locator("#stories")).toHaveClass(/reveal-pending/);
  await page.getByRole("link", { name: /Keep the moments/ }).click();
  await expect(page).toHaveURL(/#stories$/);
  await expect(page.locator("#stories")).not.toHaveClass(/reveal-pending/);
  await expect(
    page.getByRole("link", { name: /Keep the moments/ }),
  ).toHaveAttribute("aria-current", "location");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".reveal-pending")).toHaveCount(0);
  await page.goto("/flights.html");
  await ready(page);
  await expect(page.locator(".flight-postcard img")).toBeVisible();
  await page.locator(".route-postcard").last().click();
  await expect(
    page.getByRole("combobox", { name: "To", exact: true }),
  ).toHaveValue("KIX");
  await page.goto("/gallery.html");
  await ready(page);
  await expect(page.locator(".photo-journal")).toHaveCount(6);
  await page
    .getByRole("navigation", { name: "Gallery destinations" })
    .getByRole("link", { name: /Jaipur/ })
    .click();
  await expect(page).toHaveURL(/#postcard-jaipur$/);
  await page.getByRole("button", { name: "Expand Jaipur gallery" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".reveal-pending")).toHaveCount(0);
});
test("blocked guest storage fails visibly and does not bypass the entry check", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Continue as guest" }).click();
  await expect(page.locator("#guest-status")).toContainText(
    "Enable browser storage",
  );
  await expect(page.locator(".site-header")).toHaveCount(0);
});

test("animated layouts fit all viewports and offer visible sign-in controls", async ({
  page,
}) => {
  await guest(page);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["home", "gallery", "flights"]) {
      await page.goto(`/${route}.html`);
      await ready(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} at ${width}`,
      ).toBe(true);
      await expect(
        page.locator(".nav-account").getByRole("link", { name: "Sign in" }),
      ).toBeVisible();
    }
  }
});
