import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = fileURLToPath(new URL("../", import.meta.url));
const name = process.env.PACKAGE_NAME || "@cybercipher101/miles-moments";
const target = process.env.PACKAGE_REGISTRY || "npm";
const registries = {
  npm: "https://registry.npmjs.org/",
  github: "https://npm.pkg.github.com/",
};
if (
  !/^@[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9._-]*$/.test(name) ||
  name.length > 214
)
  throw new Error(
    "Use a lowercase scoped package name such as @your-name/miles-moments.",
  );
if (!Object.hasOwn(registries, target))
  throw new Error("PACKAGE_REGISTRY must be npm or github.");
if (target === "github" && name !== "@cybercipher101/miles-moments")
  throw new Error("The GitHub package must use this repository owner's scope.");
if (!process.env.npm_execpath)
  throw new Error("Run this script with npm run package:preview.");

const source = JSON.parse(
  await fs.readFile(path.join(root, "package.json"), "utf8"),
);
const cache = path.join(root, ".cache");
await fs.mkdir(cache, { recursive: true });
const release = await fs.mkdtemp(path.join(cache, "release-"));
const stage = path.join(release, "package");
await fs.mkdir(stage);
// Only tracked website files and the local server can enter the archive.
const tracked = execFileSync(
  "git",
  ["ls-files", "-z", "--", "dist", "scripts/serve.mjs"],
  {
    cwd: root,
    encoding: "utf8",
  },
)
  .split("\0")
  .filter(Boolean);
if (
  !tracked.includes("dist/index.html") ||
  !tracked.includes("scripts/serve.mjs")
)
  throw new Error("The website and local server must be tracked in Git.");
for (const file of tracked) {
  if (
    (!file.startsWith("dist/") && file !== "scripts/serve.mjs") ||
    file.split("/").includes("..")
  )
    throw new Error(`Unexpected package path: ${file}`);
  const input = path.join(root, file);
  if (!(await fs.lstat(input)).isFile())
    throw new Error(`Expected a regular file: ${file}`);
  const output = path.join(stage, file);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.copyFile(input, output);
}
const manifest = {
  name,
  version: source.version,
  description: source.description,
  type: "module",
  engines: source.engines,
  license: "UNLICENSED",
  repository: {
    type: "git",
    url: "git+https://github.com/Cybercipher101/Miles-Moments.git",
  },
  homepage: "https://github.com/Cybercipher101/Miles-Moments#readme",
  files: ["dist/", "scripts/serve.mjs"],
  scripts: { start: "node scripts/serve.mjs" },
  publishConfig: {
    registry: registries[target],
    ...(target === "npm" ? { access: "public" } : {}),
  },
};
await fs.writeFile(
  path.join(stage, "package.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
await fs.writeFile(
  path.join(stage, "README.md"),
  `# Miles & Moments\n\nA static travel frontend made with HTML, CSS, and vanilla JavaScript.\n\nExtract this archive, open a terminal in its package folder, run npm start, then visit http://localhost:5500. Node.js 22+ is required; no dependencies or build step are needed.\n\nUse Continue as guest, or demo traveler traveler@miles.test / Travel123!. The administrator is admin@miles.test / Admin123!. These are fictional browser-local accounts. No real booking, payment, or email is sent.\n\nFull guide and image provenance: https://github.com/Cybercipher101/Miles-Moments\n\nProject code is UNLICENSED; no open-source license has been selected. Bundled fonts retain their licenses in dist/assets/fonts/.\n`,
);
const packed = JSON.parse(
  execFileSync(
    process.execPath,
    [
      process.env.npm_execpath,
      "pack",
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      release,
    ],
    {
      cwd: stage,
      encoding: "utf8",
      env: { ...process.env, npm_config_cache: path.join(cache, "npm") },
    },
  ),
)[0];
const expected = new Set([...tracked, "package.json", "README.md"]);
if (
  packed.files.length !== expected.size ||
  packed.files.some(({ path: file }) => !expected.has(file))
)
  throw new Error("Archive files differ from the explicit package allowlist.");
const tarball = path.join(release, packed.filename);
const digest = createHash("sha256")
  .update(await fs.readFile(tarball))
  .digest("hex");
const hashes = Buffer.from(`${digest}  ${packed.filename}\n`).toString(
  "base64",
);
const relative = path.relative(root, tarball).split(path.sep).join("/");
const result = {
  name,
  version: source.version,
  registry: registries[target],
  tarball: relative,
  sha256: digest,
  hashes,
  files: packed.files.map(({ path: file }) => file),
};
await fs.writeFile(
  path.join(release, "manifest.json"),
  JSON.stringify(result, null, 2) + "\n",
);
if (process.env.GITHUB_OUTPUT)
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `tarball=${relative}\nhashes=${hashes}\n`,
  );
console.log(JSON.stringify(result, null, 2));
