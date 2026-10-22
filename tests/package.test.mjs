import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = fileURLToPath(new URL("../", import.meta.url));
function pack(overrides = {}) {
  const env = {
    ...process.env,
    PACKAGE_REGISTRY: "npm",
    PACKAGE_NAME: "@cybercipher101/miles-moments",
    ...overrides,
  };
  delete env.GITHUB_OUTPUT;
  return spawnSync(process.execPath, ["scripts/package-release.mjs"], {
    cwd: root,
    env,
    encoding: "utf8",
  });
}
for (const registry of ["npm", "github"]) {
  test(`${registry} archive contains the runnable website, fonts, and no development files`, async () => {
    const original = await fs.readFile(path.join(root, "package.json"), "utf8");
    const result = pack({ PACKAGE_REGISTRY: registry });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const bytes = await fs.readFile(path.join(root, report.tarball));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      report.sha256,
    );
    assert.equal(
      Buffer.from(report.hashes, "base64").toString(),
      `${report.sha256}  ${path.basename(report.tarball)}\n`,
    );
    for (const file of [
      "dist/index.html",
      "dist/assets/styles.css",
      "dist/js/app.js",
      "dist/assets/fonts/Manrope-LICENSE.txt",
      "dist/assets/fonts/DMSerifDisplay-LICENSE.txt",
      "scripts/serve.mjs",
    ])
      assert.ok(report.files.includes(file), file);
    assert.equal(report.files.filter((f) => f.endsWith(".webp")).length, 18);
    assert.equal(report.files.filter((f) => f.endsWith(".html")).length, 15);
    assert.ok(
      report.files.every(
        (f) =>
          f.startsWith("dist/") ||
          ["scripts/serve.mjs", "README.md", "package.json"].includes(f),
      ),
    );
    const manifest = JSON.parse(
      await fs.readFile(
        path.join(root, path.dirname(report.tarball), "package/package.json"),
        "utf8",
      ),
    );
    assert.equal(manifest.private, undefined);
    assert.equal(manifest.dependencies, undefined);
    assert.equal(manifest.devDependencies, undefined);
    assert.deepEqual(manifest.scripts, { start: "node scripts/serve.mjs" });
    assert.equal(
      manifest.publishConfig.registry,
      registry === "npm"
        ? "https://registry.npmjs.org/"
        : "https://npm.pkg.github.com/",
    );
    assert.equal(
      await fs.readFile(path.join(root, "package.json"), "utf8"),
      original,
    );
    assert.equal(JSON.parse(original).private, true);
  });
}
test("invalid names, registry URLs, and foreign GitHub scopes are rejected", () => {
  for (const overrides of [
    { PACKAGE_NAME: "../../outside" },
    { PACKAGE_NAME: "@name/package\ninjected=value" },
    { PACKAGE_REGISTRY: "https://example.com" },
    { PACKAGE_REGISTRY: "github", PACKAGE_NAME: "@someone-else/miles-moments" },
  ])
    assert.notEqual(pack(overrides).status, 0);
});
