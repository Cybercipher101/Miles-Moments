import fs from "node:fs/promises";
const pages = {
  index: "Log in",
  login: "Log in",
  register: "Create an account",
  home: "Go places. Feel more.",
  destinations: "Explore destinations",
  destination: "A closer look",
  package: "Your thoughtful escape",
  hotels: "Find a stay",
  flights: "Find a flight",
  itinerary: "Your travel journal",
  gallery: "Visual wanderlust",
  reviews: "Travel stories",
  bookings: "My bookings",
  contact: "Get in touch",
  admin: "The travel desk",
};
for (const [page, title] of Object.entries(pages)) {
  await fs.writeFile(
    new URL(`../dist/${page}.html`, import.meta.url),
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#A62963">
  <meta name="description" content="Miles & Moments — original destination inspiration, thoughtful itineraries, and browser-local travel booking demonstrations.">
  <title>${title} | Miles &amp; Moments</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/Manrope.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="assets/fonts/DMSerifDisplay.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="assets/styles.css">
  <link rel="stylesheet" href="assets/experience.css">
  <script type="module" src="js/app.js"></script>
</head>
<body data-page="${page}">
  <div id="app"><div class="container section"><p class="eyebrow">MILES &amp; MOMENTS</p><p>Opening your next chapter…</p></div></div>
  <noscript><main class="container"><h1>A little JavaScript, a world of possibilities.</h1><p>Please enable JavaScript to use the galleries, local accounts, and booking demonstrations.</p></main></noscript>
</body>
</html>\n`,
  );
}
console.log(`Created ${Object.keys(pages).length} HTML pages.`);
