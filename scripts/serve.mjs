import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const port = Number(process.env.PORT || 5500);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400).end();
      return;
    }
    const target = path.resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (
      !target.startsWith(root + path.sep) &&
      target !== path.join(root, "index.html")
    ) {
      res.writeHead(403).end();
      return;
    }
    fs.stat(target, (err, stat) => {
      if (err || !stat.isFile()) {
        res
          .writeHead(404, { "Content-Type": "text/plain" })
          .end("Page not found. Return to /home.html");
        return;
      }
      res.writeHead(200, {
        "Content-Type":
          mime[path.extname(target)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(target).pipe(res);
    });
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Miles & Moments · http://localhost:${port}`),
  );
