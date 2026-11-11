/* ==========================================================
   app.js – главна логика: зареждане, търсене, филтри, събития
   ========================================================== */
const App = {

  /* Текущи стойности на търсенето и филтрите */
  filters() {
    return {
      search: Utils.$("search").value.trim(),
      studio: Utils.$("filter-studio").value,
      minRating: Utils.$("filter-rating").value
    };
  },

  /* Зарежда игрите и статистиката от сървъра и обновява екрана */
  async refresh() {
    try {
      const [games, stats] = await Promise.all([Api.games(this.filters()), Api.stats()]);
      UI.notice("");
      UI.renderList(games);
      UI.renderStats(stats);
    } catch (err) { UI.notice(err.message); }
  },

  /* Оценяване / премахване на оценка и обновяване на екрана */
  async changeRating(id, action) {
    try {
      await action();
      await UI.openDialog(id);
      this.refresh();
    } catch (err) {
      const el = Utils.$("rate-msg");
      if (el) el.textContent = err.message;
    }
  },

  bind() {
    // Търсене (с малко закъснение) и филтри
    Utils.$("search").addEventListener("input", Utils.debounce(() => this.refresh(), 250));
    ["filter-studio", "filter-rating"].forEach((id) =>
      Utils.$(id).addEventListener("input", () => this.refresh()));
    Utils.$("btn-reset").addEventListener("click", () => {
      Utils.$("search").value = "";
      Utils.$("filter-studio").value = "";
      Utils.$("filter-rating").value = "0";
      this.refresh();
    });

    // Отваряне на карта (клик или Enter)
    const list = Utils.$("game-list");
    list.addEventListener("click", (e) => {
      const c = e.target.closest(".card"); if (c) UI.openDialog(c.dataset.id);
    });
    list.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const c = e.target.closest(".card"); if (c) UI.openDialog(c.dataset.id);
    });

    // Прозорец с игра: затваряне, оценяване, покана за вход
    const dlg = Utils.$("game-dialog");
    dlg.addEventListener("click", (e) => {
      const t = e.target;
      if (t === dlg || t.id === "btn-close") return dlg.close();
      if (t.id === "btn-need-login") { dlg.close(); Auth.open("login"); return; }
      if (t.dataset.v) {
        const id = t.parentNode.dataset.id;
        this.changeRating(id, () => Api.rate(id, Number(t.dataset.v)));
      }
      if (t.id === "btn-unrate") this.changeRating(t.dataset.id, () => Api.unrate(t.dataset.id));
    });

    // Ако снимка не се зареди – показваме генерирана корица
    document.addEventListener("error", async (e) => {
      const t = e.target;
      if (t.tagName !== "IMG" || !t.dataset.id || t.dataset.fallback) return;
      t.dataset.fallback = 1;
      try { t.src = Utils.art(await Api.game(t.dataset.id)); } catch {}
    }, true);
  },

  /* Старт на приложението */
  async init() {
    this.bind();
    Auth.onChange = () => this.refresh();   // след вход/изход се обновяват личните оценки
    await Auth.init();
    try { UI.renderStudios(await Api.studios()); } catch (err) { UI.notice(err.message); }
    this.refresh();
  }
};

App.init();
