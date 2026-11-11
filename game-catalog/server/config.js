/* config.js – настройки на приложението */
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

/* Тайният ключ за подписване на сесиите: от променлива на средата
   или автоматично генериран и запазен във файл при първо стартиране. */
function loadSecret() {
  if (process.env.SECRET) return process.env.SECRET;
  const file = path.join(DATA_DIR, "secret.key");
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(32).toString("hex"));
  return fs.readFileSync(file, "utf8").trim();
}

module.exports = {
  PORT: process.env.PORT || 3000,
  PUBLIC_DIR: path.join(ROOT, "public"),
  DB_FILE: path.join(DATA_DIR, "gamevault.db"),
  SECRET: loadSecret(),
  COOKIE_NAME: "gv_session",
  SESSION_TTL_SEC: 7 * 24 * 60 * 60   // 7 дни
};
