import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

const publicDirectory = path.join(projectRoot, "public");
const frontendDirectory = path.join(projectRoot, "frontend");

const PORT = 8000;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  let filePath;

  if (url.pathname === "/") {
    filePath = path.join(publicDirectory, "index.html");
  } 
  else if (url.pathname.startsWith("/auth/") || url.pathname.startsWith("/component/") || url.pathname.startsWith("/page/")) {
    filePath = path.join(publicDirectory, url.pathname);
  } 
  else if (url.pathname.startsWith("/css/") || url.pathname.startsWith("/js/")) {
    filePath = path.join(frontendDirectory, url.pathname);
  } 
  else {
    response.writeHead(404, {
      "Content-Type": "text/plain"
    });

    response.end("404 Not Found");

    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, {
      "Content-Type": "text/plain"
    });

    response.end("404 Not Found");

    return;
  }

  const extension = path.extname(filePath);
  const contentType = mimeTypes[extension] || "application/octet-stream";

  response.writeHead(200, {
    "Content-Type": contentType
  });

  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}`);
});