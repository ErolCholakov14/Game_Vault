/* controllers/gamesController.js – игри, филтри и оценки */
const games = require("../models/gameModel");
const ratings = require("../models/ratingModel");
const { httpError, sendJson } = require("../utils/http");

const uid = (user) => (user ? user.id : 0);

module.exports = {
  /* GET /api/games?search=&studio=&minRating= */
  list({ res, query, user }) {
    sendJson(res, 200, { games: games.search({
      search: query.search || "", studio: query.studio || "",
      minRating: query.minRating || 0, userId: uid(user)
    }) });
  },

  /* GET /api/games/:id */
  get({ res, params, user }) {
    const game = games.findById(Number(params.id), uid(user));
    if (!game) throw httpError(404, "Играта не е намерена.");
    sendJson(res, 200, { game });
  },

  /* GET /api/studios */
  studios({ res }) { sendJson(res, 200, { studios: games.studios() }); },

  /* GET /api/stats */
  stats({ res }) { sendJson(res, 200, games.stats()); },

  /* PUT /api/games/:id/rating  { value: 1..5 } – само за влезли потребители */
  rate({ res, params, body, user }) {
    const id = Number(params.id), value = Number(body.value);
    if (!games.findById(id)) throw httpError(404, "Играта не е намерена.");
    if (!Number.isInteger(value) || value < 1 || value > 5) throw httpError(400, "Оценката трябва да е цяло число от 1 до 5.");
    ratings.upsert(user.id, id, value);
    sendJson(res, 200, { game: games.findById(id, user.id) });
  },

  /* DELETE /api/games/:id/rating */
  unrate({ res, params, user }) {
    const id = Number(params.id);
    if (!games.findById(id)) throw httpError(404, "Играта не е намерена.");
    ratings.remove(user.id, id);
    sendJson(res, 200, { game: games.findById(id, user.id) });
  }
};
