/* models/userModel.js – достъп до таблица users */
const { db } = require("../db/database");

const PUBLIC = "id, username, email, created_at";

module.exports = {
  create({ username, email, passwordHash }) {
    const r = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?,?,?)").run(username, email, passwordHash);
    return this.findById(Number(r.lastInsertRowid));
  },
  findById(id) {
    return db.prepare(`SELECT ${PUBLIC} FROM users WHERE id = ?`).get(id) || null;
  },
  /* Връща и password_hash – само за вътрешна проверка при вход */
  findForLogin(login) {
    return db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(login, login) || null;
  },
  exists(username, email) {
    return db.prepare("SELECT username, email FROM users WHERE username = ? OR email = ?").get(username, email) || null;
  }
};
