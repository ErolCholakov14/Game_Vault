/* models/ratingModel.js – оценки на потребителите */
const { db } = require("../db/database");

module.exports = {
  /* Добавя или променя оценката на потребителя за дадена игра */
  upsert(userId, gameId, value) {
    db.prepare(`INSERT INTO ratings (user_id, game_id, value) VALUES (?,?,?)
                ON CONFLICT(user_id, game_id) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`)
      .run(userId, gameId, value);
  },
  remove(userId, gameId) {
    db.prepare("DELETE FROM ratings WHERE user_id = ? AND game_id = ?").run(userId, gameId);
  }
};
