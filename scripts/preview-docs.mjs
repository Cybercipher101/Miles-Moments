import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ttf": "font/ttf",
};
// Serve only the album and its assets, never the full checkout.
const allowed =
  /^\/(?:docs\/(?:showcase\.html|assets\/[\w.-]+\.(?:css|js|svg)|screenshots\/[\w.-]+\.png)|dist\/assets\/(?:fonts\/(?:Manrope|DMSerifDisplay)\.ttf|favicon\.svg))$/;
http
  .createServer(async (req, res) => {
    try {
      const url = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (url === "/") {
        res.writeHead(302, { Location: "/docs/showcase.html" }).end();
        return;
      }
      if (!["GET", "HEAD"].includes(req.method) || !allowed.test(url)) {
        res.writeHead(404).end("Not found");
        return;
      }
      const file = path.resolve(root, "." + url);
      const content = await fs.readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)],
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : content);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(5502, "127.0.0.1", () =>
    console.log("Miles & Moments visual notebook · http://localhost:5502"),
  );
