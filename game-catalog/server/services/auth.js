/* services/auth.js – пароли (scrypt) и подписани сесийни токени (HMAC) */
const crypto = require("node:crypto");
const config = require("../config");

/* Хешира парола със случайна "сол": резултат "sol:хеш" */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/* Проверява парола срещу запазен хеш (сравнение с постоянно време) */
function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const real = Buffer.from(hash, "hex");
  return test.length === real.length && crypto.timingSafeEqual(test, real);
}

const sign = (data) => crypto.createHmac("sha256", config.SECRET).update(data).digest("base64url");

/* Създава токен { uid, exp } подписан със сървърния ключ */
function createToken(userId) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + config.SESSION_TTL_SEC * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/* Връща съдържанието на токена или null, ако е невалиден/изтекъл */
function verifyToken(token) {
  const [payload, sig] = String(token).split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

module.exports = { hashPassword, verifyPassword, createToken, verifyToken };
