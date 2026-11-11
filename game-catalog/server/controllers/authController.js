/* controllers/authController.js – регистрация, вход, изход */
const config = require("../config");
const users = require("../models/userModel");
const { hashPassword, verifyPassword, createToken } = require("../services/auth");
const { httpError, sendJson, sessionCookie } = require("../utils/http");

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Връща данните на потребителя и изпраща сесийно cookie */
function startSession(res, user, status = 200) {
  sendJson(res, status, { user }, { "Set-Cookie": sessionCookie(createToken(user.id), config.SESSION_TTL_SEC) });
}

module.exports = {
  register({ res, body }) {
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!USERNAME_RE.test(username)) throw httpError(400, "Потребителското име е 3–20 символа: букви, цифри или _.");
    if (!EMAIL_RE.test(email)) throw httpError(400, "Въведете валиден имейл адрес.");
    if (password.length < 6 || password.length > 72) throw httpError(400, "Паролата трябва да е между 6 и 72 символа.");

    const taken = users.exists(username, email);
    if (taken) throw httpError(409, taken.username.toLowerCase() === username.toLowerCase()
      ? "Това потребителско име вече е заето." : "Този имейл вече е регистриран.");

    const user = users.create({ username, email, passwordHash: hashPassword(password) });
    startSession(res, user, 201);
  },

  login({ res, body }) {
    const login = String(body.login || "").trim();
    const password = String(body.password || "");
    const row = login && password ? users.findForLogin(login) : null;
    // Еднакво съобщение, за да не се разкрива кои акаунти съществуват
    if (!row || !verifyPassword(password, row.password_hash)) throw httpError(401, "Грешно потребителско име или парола.");
    startSession(res, users.findById(row.id));
  },

  logout({ res }) {
    sendJson(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", 0) });
  },

  me({ res, user }) {
    sendJson(res, 200, { user });
  }
};
