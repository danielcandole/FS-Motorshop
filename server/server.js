import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import pool from "../backend/config/database.js";

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

function sendFile(filePath, response) {
  if (!fs.existsSync(filePath)) {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.end("404 Not Found");
    return;
  }

  if (!fs.statSync(filePath).isFile()) {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.end("404 Not Found");
    return;
  }

  const extension = path.extname(filePath);
  const contentType = mimeTypes[extension] || "application/octet-stream";

  response.writeHead(200, {"Content-Type": contentType});
  fs.createReadStream(filePath).pipe(response);
}

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();

    console.log("Database connected successfully.");

    connection.release();
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);

    throw error;
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  const pathname = url.pathname;

  if (pathname === "/") {
    sendFile(path.join(publicDirectory, "index.html"), response);
    return;
  }

  if (pathname.startsWith("/auth/") || pathname.startsWith("/component/") || pathname.startsWith("/page/")) {
    sendFile(path.join(publicDirectory, pathname), response);
    return;
  }

  if (pathname.startsWith("/css/") || pathname.startsWith("/js/")) {
    sendFile(path.join(frontendDirectory, pathname), response);
    return;
  }

  response.writeHead(404, {"Content-Type": "text/plain"});
  response.end("404 Not Found");
});

async function startServer() {
  try {
    await testDatabaseConnection();
    
    server.listen(PORT, () => {console.log(`Server running at http://localhost:${PORT}`);});
  } catch (error) {
    console.error("Server startup aborted.");
    process.exit(1);
  }
}

startServer();