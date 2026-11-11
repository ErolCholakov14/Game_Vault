/* ==========================================================
   api.js – връзка със сървъра (REST API)
   Всички заявки към /api/* минават оттук.
   ========================================================== */
const Api = {

  async request(method, url, body) {
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
        credentials: "same-origin"
      });
    } catch {
      throw new Error("Няма връзка със сървъра. Стартирайте го с „npm start“ и отворете http://localhost:3000.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Грешка " + res.status);
    return data;
  },

  /* --- Игри --- */
  games(filters) {
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) q.set(k, v); });
    return this.request("GET", "/api/games?" + q).then((d) => d.games);
  },
  game:    (id) => Api.request("GET", "/api/games/" + id).then((d) => d.game),
  studios: ()   => Api.request("GET", "/api/studios").then((d) => d.studios),
  stats:   ()   => Api.request("GET", "/api/stats"),

  /* --- Оценки (изискват вход) --- */
  rate:   (id, value) => Api.request("PUT", "/api/games/" + id + "/rating", { value }).then((d) => d.game),
  unrate: (id)        => Api.request("DELETE", "/api/games/" + id + "/rating").then((d) => d.game),

  /* --- Потребители --- */
  me:       ()     => Api.request("GET", "/api/auth/me").then((d) => d.user),
  register: (data) => Api.request("POST", "/api/auth/register", data).then((d) => d.user),
  login:    (data) => Api.request("POST", "/api/auth/login", data).then((d) => d.user),
  logout:   ()     => Api.request("POST", "/api/auth/logout")
};
