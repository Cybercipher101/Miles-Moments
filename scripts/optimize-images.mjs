import sharp from "sharp";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
const dir = new URL("../dist/assets/images/", import.meta.url);
for (const file of await fs.readdir(dir)) {
  if (!file.endsWith(".png")) continue;
  await sharp(fileURLToPath(new URL(file, dir)))
    .resize({ width: 1536, withoutEnlargement: true })
    .webp({ quality: 83 })
    .toFile(fileURLToPath(new URL(file.replace(".png", ".webp"), dir)));
}
console.log("Optimized original PNG assets to WebP.");
