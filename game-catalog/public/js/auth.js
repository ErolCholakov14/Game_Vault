/* ==========================================================
   auth.js – вход, регистрация и изход (интерфейс)
   ========================================================== */
const Auth = {
  user: null,          // текущият потребител или null
  mode: "login",       // "login" | "register"
  onChange: () => {},  // извиква се след вход/изход (задава се от app.js)

  async init() {
    try { this.user = await Api.me(); } catch { this.user = null; }
    this.renderBar();

    Utils.$("user-area").addEventListener("click", (e) => {
      if (e.target.dataset.auth) this.open(e.target.dataset.auth);
      if (e.target.id === "btn-logout") this.logout();
    });

    const dlg = Utils.$("auth-dialog");
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.id === "btn-auth-close") dlg.close();
      if (e.target.dataset.tab) this.open(e.target.dataset.tab);
    });
    dlg.addEventListener("submit", (e) => { e.preventDefault(); this.submit(e.target); });
  },

  /* Лента горе вдясно: бутони или име на потребителя */
  renderBar() {
    Utils.$("user-area").innerHTML = this.user
      ? '<span class="user-chip">👤 ' + Utils.esc(this.user.username) + '</span><button class="btn-sm ghost" id="btn-logout" type="button">Изход</button>'
      : '<button class="btn-sm ghost" data-auth="login" type="button">Вход</button><button class="btn-sm primary" data-auth="register" type="button">Регистрация</button>';
  },

  /* Показва прозореца във вид "login" или "register" */
  open(mode) {
    this.mode = mode;
    const reg = mode === "register";
    Utils.$("auth-body").innerHTML =
      '<div class="tabs"><button type="button" data-tab="login" class="' + (!reg ? "active" : "") + '">Вход</button>' +
      '<button type="button" data-tab="register" class="' + (reg ? "active" : "") + '">Регистрация</button></div>' +
      '<form class="form" autocomplete="on">' +
        (reg
          ? '<label>Потребителско име<input name="username" required minlength="3" maxlength="20" autocomplete="username"></label>' +
            '<label>Имейл<input name="email" type="email" required autocomplete="email"></label>'
          : '<label>Потребителско име или имейл<input name="login" required autocomplete="username"></label>') +
        '<label>Парола<input name="password" type="password" required minlength="6" autocomplete="' + (reg ? "new-password" : "current-password") + '"></label>' +
        '<div class="msg" id="auth-msg" aria-live="polite"></div>' +
        '<button class="primary" type="submit">' + (reg ? "Създай профил" : "Влез") + '</button>' +
        '<button class="link" id="btn-auth-close" type="button">Отказ</button>' +
        (reg ? "" : '<p class="hint">Демо акаунт: <b>demo1</b> / <b>demo123</b></p>') +
      '</form>';
    if (!Utils.$("auth-dialog").open) Utils.$("auth-dialog").showModal();
  },

  async submit(form) {
    const data = Object.fromEntries(new FormData(form));
    const msg = Utils.$("auth-msg");
    msg.textContent = "";
    try {
      this.user = this.mode === "register" ? await Api.register(data) : await Api.login(data);
      Utils.$("auth-dialog").close();
      this.renderBar();
      this.onChange();
    } catch (err) { msg.textContent = err.message; }
  },

  async logout() {
    try { await Api.logout(); } catch {}
    this.user = null;
    this.renderBar();
    this.onChange();
  }
};
