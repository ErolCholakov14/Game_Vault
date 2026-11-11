/* ==========================================================
   utils.js – помощни функции
   ========================================================== */
const Utils = {

  /* Кратък достъп до елемент по id */
  $: (id) => document.getElementById(id),

  /* Защита от вмъкване на HTML (XSS) */
  esc: (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),

  /* Закъснява изпълнението, докато потребителят спре да пише */
  debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  /* Генерира SVG корица (резервен вариант, ако липсва снимка) */
  art(g) {
    const words = g.title.split(/[\s:]+/).filter((w) => w.length > 2);
    const letters = words.slice(0, 2).map((w) => w[0]).join("").toUpperCase() || g.title[0];
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">' +
      '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + g.colors[0] + '"/><stop offset="1" stop-color="' + g.colors[1] + '"/></linearGradient></defs>' +
      '<rect width="640" height="360" fill="url(#a)"/>' +
      '<circle cx="540" cy="60" r="130" fill="#fff" fill-opacity=".1"/>' +
      '<circle cx="90" cy="340" r="110" fill="#000" fill-opacity=".18"/>' +
      '<text x="320" y="215" font-family="Arial" font-size="130" font-weight="800" fill="#fff" fill-opacity=".9" text-anchor="middle">' + letters + '</text></svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
};
