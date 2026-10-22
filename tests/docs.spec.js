import { test, expect } from "@playwright/test";
const album = "http://localhost:5502/docs/showcase.html";
test("visual album combines device, chapter, and search filters with empty/reset states", async ({
  page,
}) => {
  await page.goto(album);
  await expect(page.locator(".postcard")).toHaveCount(18);
  await page.getByRole("button", { name: "♡ Mobile", exact: true }).click();
  await expect(page.locator(".postcard")).toHaveCount(9);
  await expect(
    page.getByRole("button", { name: "♡ Mobile", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("combobox", { name: "Chapter" }).selectOption("plan");
  await expect(page.locator(".postcard")).toHaveCount(3);
  await page.getByLabel("Find a screen").fill("booking");
  await expect(page.locator(".postcard")).toHaveCount(1);
  await expect(page.locator(".postcard h2")).toHaveText("Booking");
  await page.getByLabel("Find a screen").fill("nowhere-123");
  await expect(page.getByText("No postcards here just yet.")).toBeVisible();
  await page.getByRole("button", { name: "Show every screen" }).click();
  await expect(page.locator(".postcard")).toHaveCount(18);
  await expect(page.getByLabel("Find a screen")).toHaveValue("");
  await page.getByRole("button", { name: "▱ Desktop", exact: true }).click();
  await expect(page.locator(".postcard")).toHaveCount(9);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".postcard")).toHaveCount(18);
});
test("visual album fits five widths with usable dialogs, keyboard focus, and loaded imagery", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(album);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".postcard")).toHaveCount(18);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const button = page.getByRole("button", {
      name: "Open Gallery mobile screenshot",
    });
    await button.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#full-image")).toHaveJSProperty(
      "complete",
      true,
    );
    expect(
      await page.locator("#full-image").evaluate((img) => img.naturalWidth),
    ).toBeGreaterThan(0);
    const bounds = await page.getByRole("dialog").boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(button).toBeFocused();
    await button.click();
    await page.getByRole("button", { name: "Close screenshot" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.evaluate(() => scrollTo(0, 0));
    if ([390, 1440].includes(width))
      await page.screenshot({
        path: `docs/screenshots/visual-album-${width}.png`,
        animations: "disabled",
      });
  }
  for (const src of await page
    .locator(".postcard img")
    .evaluateAll((imgs) => imgs.map((img) => img.src)))
    expect((await request.get(src)).ok()).toBe(true);
  expect(
    (await request.get("http://localhost:5502/.git/config")).status(),
  ).toBe(404);
  expect(
    (await request.get("http://localhost:5502/package.json")).status(),
  ).toBe(404);
  expect(errors).toEqual([]);
});
test("refresh representative application screenshots for the README", async ({
  browser,
}) => {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:5500/index.html");
    await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".auth-art img").evaluate((img) => img.decode());
    await page.screenshot({
      path: `docs/screenshots/index-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "Continue as guest" }).click();
    await expect(page).toHaveURL(/home.html/);
    for (const route of ["home", "flights", "gallery"]) {
      await page.goto(`http://localhost:5500/${route}.html`);
      await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
      await page.evaluate(() => document.fonts.ready);
      await page
        .locator("img")
        .evaluateAll(async (imgs) =>
          Promise.all(
            imgs
              .filter((img) => img.getBoundingClientRect().top < innerHeight)
              .map((img) => img.decode()),
          ),
        );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      if (route !== "home")
        await page.screenshot({
          path: `docs/screenshots/${route}-${width}.png`,
          animations: "disabled",
        });
      else if (width === 1440)
        await page.screenshot({
          path: "docs/screenshots/home-preview.png",
          animations: "disabled",
        });
    }
    expect(errors).toEqual([]);
    await context.close();
  }
});
