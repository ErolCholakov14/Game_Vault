/* ==========================================================
   server.js – входна точка на приложението
   Стартира HTTP сървър, който:
     1. обработва /api/* заявки (REST API)
     2. сервира статичните файлове от папка public/
   ========================================================== */
const http = require("node:http");
const config = require("./server/config");
const { initDatabase } = require("./server/db/database");
const { matchRoute } = require("./server/routes");
const { sendJson, readJson, parseCookies, serveStatic } = require("./server/utils/http");
const { verifyToken } = require("./server/services/auth");
const users = require("./server/models/userModel");

initDatabase();

/* Определя влезлия потребител от cookie-то */
function currentUser(req) {
  const token = parseCookies(req)[config.COOKIE_NAME];
  const payload = token && verifyToken(token);
  return payload ? users.findById(payload.uid) : null;
}

async function handleApi(req, res, url) {
  const route = matchRoute(req.method, url.pathname);
  if (!route) return sendJson(res, 404, { error: "Не е намерено." });

  const user = currentUser(req);
  if (route.auth && !user) return sendJson(res, 401, { error: "Трябва да влезете в профила си." });

  const body = ["POST", "PUT", "PATCH"].includes(req.method) ? await readJson(req) : {};
  await route.handler({ req, res, params: route.params, query: Object.fromEntries(url.searchParams), body, user });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) await handleApi(req, res, url);
    else serveStatic(req, res, url.pathname);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    sendJson(res, status, { error: status === 500 ? "Грешка в сървъра." : err.message });
  }
});

server.listen(config.PORT, () => console.log(`GameVault работи на http://localhost:${config.PORT}`));
