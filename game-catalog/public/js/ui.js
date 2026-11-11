/* ==========================================================
   ui.js – визуализация (рендериране на HTML)
   ========================================================== */
const UI = {

  score: (g) => (g.rating == null ? "–" : g.rating.toFixed(1)),

  tags: (g) => g.genres.map((x) => '<span class="tag">' + Utils.esc(x) + '</span>').join(""),

  /* Снимка на игра (lazy loading за по-бързо зареждане) */
  picture(g, lazy) {
    return '<img src="' + Utils.esc(g.image || Utils.art(g)) + '" data-id="' + g.id + '" width="640" height="360" ' +
           (lazy ? 'loading="lazy" ' : '') + 'decoding="async" alt="Корица на ' + Utils.esc(g.title) + '">';
  },

  /* Карта на игра в каталога */
  card(g) {
    return '<article class="card" tabindex="0" data-id="' + g.id + '">' +
      '<div class="cover">' + UI.picture(g, true) +
        '<span class="badge">★ ' + UI.score(g) + '</span>' +
        '<span class="year">' + g.year + '</span>' +
      '</div>' +
      '<div class="info"><h3>' + Utils.esc(g.title) + '</h3>' +
        '<div class="meta">' + Utils.esc(g.studio) + '</div>' +
        '<div class="tags">' + UI.tags(g) + '</div></div>' +
    '</article>';
  },

  renderList(games) {
    Utils.$("result-count").textContent = "Намерени игри: " + games.length;
    Utils.$("game-list").innerHTML = games.length
      ? games.map(UI.card).join("")
      : '<p class="empty">Няма игри по зададените критерии.</p>';
  },

  renderStats(s) {
    Utils.$("stat-games").textContent = s.games;
    Utils.$("stat-studios").textContent = s.studios;
    Utils.$("stat-rating").textContent = s.avgRating == null ? "–" : s.avgRating.toFixed(1);
  },

  renderStudios(studios) {
    Utils.$("filter-studio").innerHTML = '<option value="">Всички производители</option>' +
      studios.map((s) => '<option>' + Utils.esc(s) + '</option>').join("");
  },

  /* Съобщение за грешка най-горе в каталога */
  notice(text) {
    const el = Utils.$("notice");
    el.textContent = text || "";
    el.hidden = !text;
  },

  /* Блок за оценяване: звезди за влезли потребители, покана за вход за останалите */
  rateBlock(g) {
    if (!Auth.user) {
      return '<button class="primary" id="btn-need-login" type="button">Влез, за да оцениш</button>';
    }
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += '<span data-v="' + i + '" class="' + (i <= (g.myRating || 0) ? "on" : "") + '" role="button" aria-label="' + i + ' звезди">★</span>';
    }
    return '<div class="rate" data-id="' + g.id + '">' + stars + '</div>' +
      (g.myRating ? '<button class="link" id="btn-unrate" data-id="' + g.id + '" type="button">Премахни оценката ми</button>' : "") +
      '<div class="msg" id="rate-msg" aria-live="polite"></div>';
  },

  /* Прозорец с подробности – данните се зареждат от сървъра */
  async openDialog(id) {
    let g;
    try { g = await Api.game(id); } catch (err) { UI.notice(err.message); return; }
    Utils.$("dialog-body").innerHTML =
      '<div class="cover">' + UI.picture(g, false) + '</div>' +
      '<div class="body">' +
        '<h2>' + Utils.esc(g.title) + '</h2>' +
        '<div class="meta">' + Utils.esc(g.studio) + ' · ' + g.year + '</div>' +
        '<div class="tags">' + UI.tags(g) + '</div>' +
        '<div class="score"><b>★ ' + UI.score(g) + '</b><span class="meta">от 5 · ' + g.votes + ' оценки от потребители</span></div>' +
        '<h4>Инсталация и геймплей</h4><p>' + Utils.esc(g.instructions) + '</p>' +
        '<h4>Вашата оценка</h4>' + UI.rateBlock(g) +
        '<button class="close" id="btn-close" type="button">Затвори</button>' +
      '</div>';
    const dlg = Utils.$("game-dialog");
    if (!dlg.open) dlg.showModal();
  }
};
