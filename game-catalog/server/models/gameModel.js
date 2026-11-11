/* models/gameModel.js – игри, производители, жанрове и статистика */
const { db } = require("../db/database");

/* Общата SELECT част: игра + студио + средна оценка + жанрове + оценка на текущия потребител */
const BASE = `
  SELECT g.id, g.title, s.name AS studio, g.year, g.instructions, g.image,
         g.color_a, g.color_b,
         ROUND(AVG(r.value), 1) AS rating,
         COUNT(r.id)            AS votes,
         (SELECT group_concat(ge.name, '|') FROM game_genres gg
            JOIN genres ge ON ge.id = gg.genre_id WHERE gg.game_id = g.id) AS genres,
         (SELECT value FROM ratings WHERE game_id = g.id AND user_id = @uid) AS my_rating
  FROM games g
  JOIN studios s ON s.id = g.studio_id
  LEFT JOIN ratings r ON r.game_id = g.id`;

/* Преобразува ред от базата в обект за API-то */
function format(row) {
  return {
    id: row.id, title: row.title, studio: row.studio, year: row.year,
    instructions: row.instructions, image: row.image,
    colors: [row.color_a, row.color_b],
    rating: row.rating, votes: row.votes,
    genres: row.genres ? row.genres.split("|") : [],
    myRating: row.my_rating
  };
}

module.exports = {
  /* Търсене по име + филтри по производител и минимален рейтинг */
  search({ search = "", studio = "", minRating = 0, userId = 0 }) {
    const rows = db.prepare(`${BASE}
      WHERE g.title LIKE @search ESCAPE '\\' AND (@studio = '' OR s.name = @studio)
      GROUP BY g.id
      HAVING COALESCE(AVG(r.value), 0) >= @minRating
      ORDER BY rating DESC, g.title`).all({
        search: `%${String(search).replace(/[\\%_]/g, "\\$&")}%`,
        studio, minRating: Number(minRating) || 0, uid: userId
      });
    return rows.map(format);
  },

  findById(id, userId = 0) {
    const row = db.prepare(`${BASE} WHERE g.id = @id GROUP BY g.id`).get({ id, uid: userId });
    return row && row.id ? format(row) : null;
  },

  studios() {
    return db.prepare("SELECT name FROM studios ORDER BY name").all().map((r) => r.name);
  },

  stats() {
    return db.prepare(`SELECT
      (SELECT COUNT(*) FROM games)   AS games,
      (SELECT COUNT(*) FROM studios) AS studios,
      (SELECT ROUND(AVG(value), 1) FROM ratings) AS avgRating`).get();
  }
};
