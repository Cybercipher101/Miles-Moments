import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5500",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node scripts/serve.mjs",
      url: "http://localhost:5500",
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: "node scripts/preview-docs.mjs",
      url: "http://localhost:5502",
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});
