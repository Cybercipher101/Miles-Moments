import { test, expect } from "@playwright/test";
const ready = async (page, path) => {
  await page.goto(path);
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  if (
    page.url().includes("login.html?next=") &&
    !/^\/(index|login|register|bookings)\.html/.test(path) &&
    !(await page.getByRole("alert").count())
  ) {
    await page.getByRole("button", { name: "Continue as guest" }).click();
    await expect(page).not.toHaveURL(/login.html/);
    await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  }
};
async function login(page, admin = false) {
  await ready(page, "/login.html");
  await page
    .getByLabel("Email address")
    .fill(admin ? "admin@miles.test" : "traveler@miles.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(admin ? "Admin123!" : "Travel123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(admin ? /admin.html/ : /home.html/);
}

test("date and traveler validation prevents invalid bookings", async ({
  page,
}) => {
  await login(page);
  await ready(page, "/hotels.html?destination=bali");
  const checkin = await page
    .getByLabel("Check-in", { exact: true })
    .inputValue();
  await page.getByLabel("Check-out", { exact: true }).fill(checkin);
  await page.getByRole("button", { name: "Find a stay", exact: true }).click();
  await expect(page.locator(".form-status")).toContainText(
    "checkout after check-in",
  );
  await expect(page.locator("[data-book-hotel]")).toHaveCount(0);
  await ready(page, "/package.html?id=bali");
  await page.getByRole("button", { name: "Plan this escape" }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel("Travelers", { exact: true }).fill("9");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Confirm demo booking" }).click();
  expect(await form.locator("form").evaluate((f) => f.checkValidity())).toBe(
    false,
  );
  await form.getByLabel("Travelers", { exact: true }).fill("2");
  await form.getByLabel("Departure date").fill("2020-01-01");
  await form.getByRole("button", { name: "Confirm demo booking" }).click();
  expect(await form.locator("form").evaluate((f) => f.checkValidity())).toBe(
    false,
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("miles-moments:v1")).bookings.length,
    ),
  ).toBe(0);
});

test("activities add, reorder, complete, edit and remain scoped to their traveler", async ({
  page,
}) => {
  await login(page);
  await ready(page, "/destinations.html");
  await page
    .getByRole("link", { name: "Add to your itinerary" })
    .first()
    .click();
  await expect(page).toHaveURL(/itinerary.html\?destination=bali$/);
  const firstDay = page.locator(".itinerary-day").first();
  await expect(firstDay.getByLabel("Activity description")).toHaveCount(2);
  await firstDay
    .getByRole("button", { name: "Move activity up", exact: true })
    .last()
    .click();
  await expect(firstDay.getByLabel("Activity description").first()).toHaveValue(
    "Yoga above the rice fields",
  );
  await firstDay.getByLabel("Mark activity complete").first().check();
  await firstDay.getByLabel("Day title").fill("My arrival day");
  await firstDay.getByLabel("Day title").press("Tab");
  await page.reload();
  await expect(
    firstDay.getByLabel("Mark activity complete").first(),
  ).toBeChecked();
  await expect(firstDay.getByLabel("Day title")).toHaveValue("My arrival day");
  await page.getByRole("button", { name: "Sign out" }).click();
  await ready(page, "/register.html");
  await page.getByLabel("Your name").fill("Another Traveler");
  await page.getByLabel("Email address").fill("another@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Another123!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page).toHaveURL(/home.html/);
  await ready(page, "/itinerary.html?destination=bali");
  await expect(firstDay.getByLabel("Day title")).toHaveValue("Day 1");
  await expect(firstDay.getByLabel("Activity description")).toHaveCount(1);
});

test("mobile manual pause survives refresh; arrows and Escape remain keyboard accessible", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await ready(page, "/destination.html?id=bali");
  let gallery = page.locator('[data-gallery="detail-bali"]');
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveAttribute("data-playing", "true");
  await gallery.getByRole("button", { name: "Pause slideshow" }).click();
  await page.reload();
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveAttribute("data-playing", "false");
  await gallery.focus();
  await page.keyboard.press("ArrowRight");
  await expect(gallery).toHaveAttribute("data-slide", "1");
  await gallery.getByRole("button", { name: "Expand Bali gallery" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await gallery.getByRole("button", { name: "Play slideshow" }).click();
  await expect(gallery).toHaveAttribute("data-playing", "true");
  await context.close();
});

test("unavailable local storage offers an understandable recovery message", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.removeItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await ready(page, "/home.html");
  await expect(page.getByRole("alert")).toContainText(
    "Saved demo data could not be read",
  );
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo storage" }).click();
  await expect(page.locator("#toast")).toContainText(
    "Enable storage for localhost",
  );
});

test("inactive traveler cannot sign in and removed packages cannot be booked", async ({
  page,
}) => {
  await login(page, true);
  await page
    .getByRole("button", { name: "Deactivate", exact: true })
    .first()
    .click();
  await page.getByRole("tab", { name: "Packages", exact: true }).click();
  const bali = page
    .locator(".admin-card")
    .filter({ hasText: "Bali discovery" });
  page.on("dialog", (d) => d.accept());
  await bali.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByLabel("Email address").fill("traveler@miles.test");
  await page.getByLabel("Password", { exact: true }).fill("Travel123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#auth-form .form-status")).toContainText(
    "inactive",
  );
  await ready(page, "/package.html?id=bali");
  await expect(page.getByText("That chapter isn’t here.")).toBeVisible();
  await expect(page.locator("[data-book-package]")).toHaveCount(0);
});

test("signed-in administration and booking dialogs fit all target widths", async ({
  page,
}) => {
  await login(page, true);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await ready(page, "/admin.html");
    await page.getByRole("tab", { name: "Packages", exact: true }).click();
    await page.getByRole("button", { name: "Create package" }).click();
    let box = await page.getByRole("dialog").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if ([390, 1440].includes(width))
      await page.screenshot({
        path: `docs/screenshots/admin-${width}.png`,
        fullPage: true,
      });
    await ready(page, "/package.html?id=bali");
    await page.getByRole("button", { name: "Plan this escape" }).click();
    box = await page.getByRole("dialog").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    if ([390, 1440].includes(width))
      await page.screenshot({ path: `docs/screenshots/booking-${width}.png` });
    await page.keyboard.press("Escape");
  }
});

test("every linked local page and all original scenery assets return successfully", async ({
  page,
  request,
}) => {
  const links = new Set();
  for (const route of [
    "index",
    "register",
    "home",
    "destinations",
    "destination",
    "package",
    "hotels",
    "flights",
    "itinerary",
    "gallery",
    "reviews",
    "bookings",
    "contact",
    "admin",
  ]) {
    await ready(page, `/${route}.html`);
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href"))))
      if (!href.startsWith("#")) links.add(href);
  }
  for (const href of links) {
    expect(href).not.toMatch(/^(https?:|\/\/)/);
    expect((await request.get("/" + href)).ok(), href).toBe(true);
  }
  for (const id of [
    "bali",
    "santorini",
    "switzerland",
    "kyoto",
    "maldives",
    "jaipur",
  ])
    for (const suffix of ["", "-1", "-2"])
      expect(
        (await request.get(`/assets/images/${id}${suffix}.webp`)).ok(),
      ).toBe(true);
});
