import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { destinations, imagePath } from "../dist/js/data.js";
const root = new URL("../", import.meta.url);
for (const file of await fs.readdir(new URL("dist/js/", root))) {
  const result = spawnSync(
    process.execPath,
    ["--check", fileURLToPath(new URL("dist/js/" + file, root))],
    { encoding: "utf8" },
  );
  if (result.status) throw new Error(result.stderr);
}
const html = (await fs.readdir(new URL("dist/", root))).filter((f) =>
  f.endsWith(".html"),
);
for (const name of html) {
  const text = await fs.readFile(new URL("dist/" + name, root), "utf8");
  if (!text.includes('name="viewport"') || !text.includes('lang="en"'))
    throw new Error("Missing accessibility metadata: " + name);
  if (/target=["']_blank/.test(text))
    throw new Error("Unexpected new-tab navigation");
}
for (const d of destinations)
  for (let i = 0; i < 3; i++)
    await fs.access(new URL("dist/" + imagePath(d.id, i), root));
console.log(
  `PASS: ${html.length} HTML entrypoints, 18 destination images, and JavaScript syntax.`,
);
