/* routes.js – таблица с всички API маршрути */
const auth = require("./controllers/authController");
const games = require("./controllers/gamesController");

//  метод   път                       обработчик      auth = изисква вход
const ROUTES = [
  ["POST",   "/api/auth/register",    auth.register,  false],
  ["POST",   "/api/auth/login",       auth.login,     false],
  ["POST",   "/api/auth/logout",      auth.logout,    false],
  ["GET",    "/api/auth/me",          auth.me,        false],

  ["GET",    "/api/games",            games.list,     false],
  ["GET",    "/api/games/:id",        games.get,      false],
  ["PUT",    "/api/games/:id/rating", games.rate,     true],
  ["DELETE", "/api/games/:id/rating", games.unrate,   true],
  ["GET",    "/api/studios",          games.studios,  false],
  ["GET",    "/api/stats",            games.stats,    false]
].map(([method, path, handler, requireAuth]) => ({
  method, handler, auth: requireAuth,
  regex: new RegExp("^" + path.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "$")
}));

/* Намира маршрут за метод + адрес и връща параметрите от адреса */
function matchRoute(method, pathname) {
  for (const r of ROUTES) {
    const m = r.method === method && pathname.match(r.regex);
    if (m) return { handler: r.handler, auth: r.auth, params: m.groups || {} };
  }
  return null;
}

module.exports = { matchRoute };
