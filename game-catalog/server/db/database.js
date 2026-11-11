/* database.js – връзка с базата и първоначално попълване */
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const config = require("../config");

const db = new DatabaseSync(config.DB_FILE);
db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");

/* Създава таблиците и, ако базата е празна, добавя примерни данни */
function initDatabase() {
  db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  const count = db.prepare("SELECT COUNT(*) AS n FROM games").get().n;
  if (count === 0) {
    require("./seed").run(db);
    console.log("Базата данни е попълнена с примерни игри.");
  }
}

module.exports = { db, initDatabase };
