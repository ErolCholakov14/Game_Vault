/* utils/http.js – помощни функции за HTTP: JSON, cookies, статични файлове */
const fs = require("node:fs");
const path = require("node:path");
const config = require("../config");

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

function httpError(status, message) {
  const e = new Error(message); e.status = status; return e;
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  res.end(JSON.stringify(data));
}

/* Чете тялото на заявката като JSON (макс. 100 KB) */
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) { reject(httpError(413, "Заявката е твърде голяма.")); req.destroy(); }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(httpError(400, "Невалиден JSON.")); }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

/* Сесийно cookie: недостъпно за JavaScript (HttpOnly) */
function sessionCookie(value, maxAgeSec) {
  return `${config.COOKIE_NAME}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}`;
}

/* Сервира файл от public/ (с защита от излизане извън папката) */
function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "Методът не е позволен." });
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return sendJson(res, 400, { error: "Невалиден адрес." }); }
  if (rel === "/") rel = "/index.html";

  const file = path.normalize(path.join(config.PUBLIC_DIR, rel));
  if (!file.startsWith(config.PUBLIC_DIR + path.sep)) return sendJson(res, 403, { error: "Забранено." });

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return sendJson(res, 404, { error: "Страницата не е намерена." });
    const ext = path.extname(file).toLowerCase();
    const isImage = /\.(jpe?g|png|webp|avif|gif|svg|ico)$/.test(ext);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": stat.size,
      // Кеширане на снимките за по-бързо зареждане
      "Cache-Control": isImage ? "public, max-age=604800, immutable" : "no-cache"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

module.exports = { httpError, sendJson, readJson, parseCookies, sessionCookie, serveStatic };
