import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
let checked = 0;
async function checkLink(from, value) {
  if (/^(?:https?:|mailto:)/.test(value)) return;
  const [filePart, anchor] = value.split("#");
  const target = path.resolve(
    path.dirname(from),
    decodeURIComponent(filePart.split("?")[0] || path.basename(from)),
  );
  if (!target.startsWith(root))
    throw new Error(`Link leaves project: ${value}`);
  await fs.access(target);
  if (anchor && target.endsWith(".md")) {
    const content = await fs.readFile(target, "utf8");
    const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) =>
      slug(m[1]),
    );
    if (!headings.includes(anchor)) throw new Error(`Missing heading ${value}`);
  }
  checked++;
}
for (const name of [
  "README.md",
  "docs/VISUAL-CHECKS.md",
  "docs/WORKFLOWS.md",
  "docs/showcase.html",
]) {
  const file = path.join(root, name);
  const content = await fs.readFile(file, "utf8");
  for (const match of content.matchAll(
    /!?\[[^\]]*\]\(([^)\s]+)\)|(?:src|href)=["']([^"']+)["']/g,
  )) {
    await checkLink(file, match[1] || match[2]);
  }
}
const catalog = await fs.readFile(
  path.join(root, "docs/assets/showcase.js"),
  "utf8",
);
const ids = [...catalog.matchAll(/id:\s*["']([^"']+)["']/g)].map((m) => m[1]);
if (ids.length !== 9) throw new Error("Expected nine screenshot subjects");
for (const id of ids)
  for (const width of [390, 1440]) {
    await fs.access(path.join(root, `docs/screenshots/${id}-${width}.png`));
    checked++;
  }
for (const name of [
  "docs/assets/showcase.js",
  "scripts/preview-docs.mjs",
  "scripts/check-docs.mjs",
  "scripts/package-release.mjs",
]) {
  const result = spawnSync(
    process.execPath,
    ["--check", path.join(root, name)],
    { encoding: "utf8" },
  );
  if (result.status) throw new Error(result.stderr);
}
console.log(
  `PASS: ${checked} local documentation references, 18 album screenshots, and documentation JavaScript syntax. External links are not fetched.`,
);
