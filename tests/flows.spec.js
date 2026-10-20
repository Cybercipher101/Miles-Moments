import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
const ready = async (page, path) => {
  await page.goto(path);
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
};
async function signIn(page, admin = false) {
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
test("registration, duplicate email, incorrect password, protected return, and account isolation", async ({
  page,
}) => {
  await ready(page, "/index.html");
  await page.getByLabel("Your name").fill("Test Traveler");
  await page.getByLabel("Email address").fill("test@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Sample123!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page).toHaveURL(/home.html/);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("miles-moments:v1")),
  );
  expect(
    stored.users.find((u) => u.email === "test@example.test").digest,
  ).toHaveLength(64);
  expect(JSON.stringify(stored)).not.toContain("Sample123!");
  await page.getByRole("button", { name: "Sign out" }).click();
  await ready(page, "/index.html");
  await page.getByLabel("Your name").fill("Duplicate");
  await page.getByLabel("Email address").fill("test@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Sample123!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page.getByRole("status").first()).toContainText(
    "already has an account",
  );
  await ready(page, "/package.html?id=bali");
  await page.getByRole("button", { name: "Plan this escape" }).click();
  await expect(page).toHaveURL(/login.html\?next=/);
  await page.getByLabel("Email address").fill("test@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Wrong123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".form-status")).toContainText("incorrect");
  await page.getByLabel("Password", { exact: true }).fill("Sample123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/package.html\?id=bali/);
  await ready(page, "/admin.html");
  await expect(page.getByText("Administrator sign-in required.")).toBeVisible();
  await expect(page.locator("#admin-content")).toHaveCount(0);
});
test("destination filtering, sorting, slideshow and immersive gallery", async ({
  page,
}) => {
  await ready(page, "/destinations.html");
  await expect(page.locator("#result-count")).toHaveText(
    "6 destinations to discover",
  );
  await page.getByLabel("Search destinations").fill("bamboo");
  await expect(page.locator("#result-count")).toHaveText(
    "1 destination to discover",
  );
  await expect(page.locator(".destination-panel h2")).toHaveText("Kyoto");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Budget per person").selectOption("25000");
  await expect(page.locator(".destination-panel h2")).toHaveText("Jaipur");
  await page.getByLabel("Search destinations").fill("unfindable");
  await expect(page.getByText("No places found just yet.")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Sort by").selectOption("price-low");
  await expect(page.locator(".destination-panel h2").first()).toHaveText(
    "Jaipur",
  );
  await ready(page, "/destination.html?id=bali");
  const gallery = page.locator('[data-gallery="detail-bali"]');
  await gallery.scrollIntoViewIfNeeded();
  await gallery.hover();
  await expect(gallery).toHaveAttribute("data-playing", "true");
  await expect(gallery).toHaveAttribute("data-slide", "1", { timeout: 5000 });
  await page.mouse.move(0, 0);
  await expect(gallery).toHaveAttribute("data-playing", "false");
  await gallery.getByRole("button", { name: "Next photo" }).click();
  await expect(gallery).toHaveAttribute("data-slide", "2");
  await gallery.getByRole("button", { name: "Expand Bali gallery" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("package, hotel and flight booking, cancellation, itinerary, reviews and contact", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await signIn(page);
  await ready(page, "/package.html?id=bali");
  await page.getByRole("button", { name: "Plan this escape" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Travelers", { exact: true })
    .fill("2");
  await expect(page.locator("#booking-total")).toContainText("85,800");
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm demo booking" }).click();
  await expect(page.getByText("Your demo booking is saved.")).toBeVisible();
  await page.getByRole("link", { name: "View my bookings" }).click();
  await expect(page.locator(".booking-ticket")).toHaveCount(1);
  await ready(page, "/hotels.html?destination=bali");
  await page.getByRole("button", { name: "Choose stay" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Travelers", { exact: true })
    .fill("3");
  await expect(page.locator("#booking-total")).toContainText("37,200");
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm demo booking" }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await ready(page, "/flights.html");
  await page
    .getByRole("combobox", { name: "To", exact: true })
    .selectOption("DEL");
  await page.getByRole("button", { name: "Search flights" }).click();
  await expect(page.locator(".form-status")).toContainText("different");
  await page
    .getByRole("combobox", { name: "To", exact: true })
    .selectOption("DPS");
  await page.getByRole("button", { name: "Search flights" }).click();
  await expect(page.locator(".flight-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Select flight" }).first().click();
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm demo booking" }).click();
  await page.getByRole("link", { name: "View my bookings" }).click();
  await expect(page.locator(".booking-ticket")).toHaveCount(3);
  await page.getByRole("button", { name: "Cancel booking" }).first().click();
  await expect(page.locator(".status.cancelled")).toHaveCount(1);
  await ready(page, "/itinerary.html?destination=bali");
  await page.getByRole("button", { name: "+ Add a day" }).click();
  await expect(page.locator(".itinerary-day")).toHaveCount(7);
  await page.getByLabel("New activity").last().fill("Watch the sunrise");
  await page
    .getByRole("button", { name: "+ Add activity", exact: true })
    .last()
    .click();
  await page.reload();
  await expect(page.getByLabel("Activity description").last()).toHaveValue(
    "Watch the sunrise",
  );
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export as text" }).click();
  expect((await dl).suggestedFilename()).toContain("bali-itinerary.txt");
  await ready(page, "/reviews.html");
  await page
    .getByLabel("Your story")
    .fill("A peaceful and thoughtfully planned sample journey.");
  await page.getByRole("button", { name: "Share your story" }).click();
  await expect(
    page.getByText("“A peaceful and thoughtfully planned sample journey.”"),
  ).toBeVisible();
  await ready(page, "/contact.html");
  await page.getByLabel("Your name").fill("Demo Sender");
  await page.getByLabel("Email address").fill("sender@example.test");
  await page
    .getByLabel("Your message")
    .fill("Please help me plan a quiet coastal getaway.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send your message" }).click();
  await expect(page.locator(".form-status")).toContainText("No email was sent");
  await page.getByRole("button", { name: "Sign out" }).click();
  await ready(page, "/bookings.html");
  await expect(page.locator(".booking-ticket")).toHaveCount(0);
  await signIn(page, true);
  await page.getByRole("tab", { name: "Bookings", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.locator("[data-booking-status]").last().selectOption("cancelled");
  await page.getByRole("tab", { name: "Inbox", exact: true }).click();
  await expect(page.getByText("Demo Sender")).toBeVisible();
  await page.getByRole("button", { name: "Mark read", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mark unread", exact: true }),
  ).toBeVisible();
});
test("admin package CRUD and traveler activation", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await signIn(page, true);
  await page
    .getByRole("button", { name: "Deactivate", exact: true })
    .first()
    .click();
  await expect(page.getByText("Inactive", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Activate", exact: true }).click();
  await page.getByRole("tab", { name: "Packages", exact: true }).click();
  await page.getByRole("button", { name: "Create package" }).click();
  await page.getByLabel("Package name").fill("Jaipur creative weekend");
  await page
    .getByRole("combobox", { name: "Destination", exact: true })
    .selectOption("jaipur");
  await page.getByLabel("Price per person").fill("20000");
  await page.getByRole("button", { name: "Save package" }).click();
  const card = page
    .locator(".admin-card")
    .filter({ hasText: "Jaipur creative weekend" });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Price per person").fill("21000");
  await page.getByRole("button", { name: "Save package" }).click();
  await expect(card).toContainText("21,000");
  await card.getByRole("button", { name: "Deactivate", exact: true }).click();
  await expect(card).toContainText("Inactive");
  await card.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.locator(".admin-card")).toHaveCount(6);
});
test("mobile visible playback, persistent pause, swipe and reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await ready(page, "/destination.html?id=bali");
  const gallery = page.locator('[data-gallery="detail-bali"]');
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveAttribute("data-playing", "true");
  await gallery.getByRole("button", { name: "Pause slideshow" }).click();
  await expect(gallery).toHaveAttribute("data-playing", "false");
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await gallery.scrollIntoViewIfNeeded();
  await expect(
    gallery.getByRole("button", { name: "Play slideshow" }),
  ).toBeVisible();
  await gallery.dispatchEvent("touchstart", {
    touches: [{ identifier: 1, clientX: 280, clientY: 300 }],
  });
  await gallery.dispatchEvent("touchend", {
    changedTouches: [{ identifier: 1, clientX: 100, clientY: 305 }],
  });
  await expect(gallery).toHaveAttribute("data-slide", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gallery.getByRole("button", { name: "Play slideshow" }).click();
  await expect(gallery).toHaveAttribute("data-playing", "false");
  await context.close();
});
for (const width of [360, 390, 768, 1024, 1440]) {
  test(`all pages fit ${width}px without console errors or missing images`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "index",
      "login",
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
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
      expect(await page.locator('a[target="_blank"]').count()).toBe(0);
      expect(await page.locator("h1").count()).toBe(1);
      const broken = await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter((i) => i.complete && i.naturalWidth === 0)
            .map((i) => i.src),
        );
      expect(broken).toEqual([]);
      if (
        ["home", "index", "destinations", "itinerary"].includes(route) &&
        [390, 1440].includes(width)
      ) {
        await fs.mkdir("docs/screenshots", { recursive: true });
        await page.screenshot({
          path: `docs/screenshots/${route}-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
    expect(errors).toEqual([]);
  });
}
test("corrupted storage recovery and invalid destination routes", async ({
  page,
}) => {
  await ready(page, "/home.html");
  await page.evaluate(() =>
    localStorage.setItem("miles-moments:v1", "{broken"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("could not be read");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo storage" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await ready(page, "/destination.html?id=unknown");
  await expect(page.getByText("That chapter isn’t here.")).toBeVisible();
});
