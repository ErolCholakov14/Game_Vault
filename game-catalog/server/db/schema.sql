-- ==========================================================
-- schema.sql – структура на базата данни (SQLite)
--
--  users ──< ratings >── games >── studios
--                          │
--                          └──< game_genres >── genres
-- ==========================================================
PRAGMA foreign_keys = ON;

-- Потребители
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,                 -- scrypt (никога парола в чист вид)
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Производители / студиа
CREATE TABLE IF NOT EXISTS studios (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Жанрове
CREATE TABLE IF NOT EXISTS genres (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Игри
CREATE TABLE IF NOT EXISTS games (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  studio_id    INTEGER NOT NULL REFERENCES studios(id),
  year         INTEGER NOT NULL CHECK (year BETWEEN 1970 AND 2100),
  instructions TEXT NOT NULL,                  -- упътване за инсталация/геймплей
  image        TEXT,                           -- път до снимка, напр. images/hades.jpg
  color_a      TEXT NOT NULL DEFAULT '#444444',-- цветове за резервната корица
  color_b      TEXT NOT NULL DEFAULT '#888888'
);

-- Връзка игра ↔ жанр (много към много)
CREATE TABLE IF NOT EXISTS game_genres (
  game_id  INTEGER NOT NULL REFERENCES games(id)  ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, genre_id)
);

-- Оценки на потребителите: един потребител = една оценка за игра
CREATE TABLE IF NOT EXISTS ratings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  value      INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_games_title  ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_studio ON games(studio_id);
CREATE INDEX IF NOT EXISTS idx_ratings_game ON ratings(game_id);
