/* seed.js – примерни данни (игри + демо потребители с оценки) */
const { hashPassword } = require("../services/auth");

const GAMES = [
  { title: "The Witcher 3: Wild Hunt", studio: "CD Projekt Red", year: 2015, rating: 4.8, genres: ["RPG", "Отворен свят"], image: "images/witcher3.jpg", colors: ["#3a1c71", "#d76d77"],
    how: "Инсталирайте през Steam или GOG (около 50 GB). Геймплей: отворен свят, управлявате Геролт от Ривия – изпълнявайте поръчки, сражавайте се с чудовища и вземайте решения, които променят историята." },
  { title: "Hades", studio: "Supergiant Games", year: 2020, rating: 4.7, genres: ["Рогалик", "Екшън"], image: "images/hades.jpg", colors: ["#8e0e00", "#1f1c18"],
    how: "Инсталация през Steam или Epic (около 15 GB). Геймплей: екшън рогалик – бягате от подземния свят, комбинирате дарове от боговете и опитвате отново след всяка смърт." },
  { title: "Stardew Valley", studio: "ConcernedApe", year: 2016, rating: 4.8, genres: ["Симулация", "Релакс"], image: "images/stardew.jpg", colors: ["#56ab2f", "#a8e063"],
    how: "Малка инсталация (около 1 GB). Геймплей: управлявате ферма – садите култури, отглеждате животни, риболов, мини и приятелства с жителите." },
  { title: "Celeste", studio: "Maddy Makes Games", year: 2018, rating: 4.6, genres: ["Платформър", "Инди"], image: "images/celeste.jpg", colors: ["#614385", "#516395"],
    how: "Инсталация през Steam, Epic или Itch (около 1 GB). Геймплей: прецизен платформър – катерите планината Селест с двоен скок и бягане." },
  { title: "Portal 2", studio: "Valve", year: 2011, rating: 4.8, genres: ["Пъзел", "Кооп"], image: "images/portal2.jpg", colors: ["#0083b0", "#00b4db"],
    how: "Инсталация през Steam (около 12 GB). Геймплей: логически загадки с портален пистолет, възможен кооперативен режим за двама." },
  { title: "Elden Ring", studio: "FromSoftware", year: 2022, rating: 4.5, genres: ["Action RPG", "Отворен свят"], image: "images/eldenring.jpg", colors: ["#b79891", "#2c2c2c"],
    how: "Инсталация през Steam (около 60 GB). Геймплей: труден екшън RPG в отворен свят – изследвайте, надвивайте боси и подобрявайте героя си." },
  { title: "Hollow Knight", studio: "Team Cherry", year: 2017, rating: 4.7, genres: ["Метроидвания", "Инди"], image: "images/hollowknight.jpg", colors: ["#232526", "#6a85b6"],
    how: "Инсталация през Steam или GOG (около 9 GB). Геймплей: метроидвания – изследвате подземното кралство Халоунест и побеждавате босове." },
  { title: "Minecraft", studio: "Mojang Studios", year: 2011, rating: 4.4, genres: ["Сандбокс", "Оцеляване"], image: "images/minecraft.jpg", colors: ["#3a7d44", "#8b5e3c"],
    how: "Инсталация чрез Minecraft Launcher (около 1 GB). Геймплей: добивайте ресурси, строите и оцелявате в свят от блокове – творчески или оцеляване." },
  { title: "Cyberpunk 2077", studio: "CD Projekt Red", year: 2020, rating: 3.9, genres: ["RPG", "Шутър"], image: "images/cyberpunk.jpg", colors: ["#f9d423", "#ff4e50"],
    how: "Инсталация през Steam, GOG или Epic (около 70 GB). Геймплей: RPG от първо лице в Найт Сити – развивайте героя, хакове, оръжия и странични мисии." },
  { title: "Half-Life 2", studio: "Valve", year: 2004, rating: 4.6, genres: ["Шутър", "Пъзел"], image: "images/halflife2.jpg", colors: ["#f12711", "#f5af19"],
    how: "Инсталация през Steam (около 6 GB). Геймплей: шутър от първо лице с физични пъзели и гравитационна пушка." },
  { title: "Terraria", studio: "Re-Logic", year: 2011, rating: 4.5, genres: ["Сандбокс", "2D"], image: "images/terraria.jpg", colors: ["#134e5e", "#71b280"],
    how: "Инсталация през Steam (около 300 MB). Геймплей: 2D приключение с копаене, крафтинг, строеж и битки с босове." },
  { title: "Dark Souls III", studio: "FromSoftware", year: 2016, rating: 4.3, genres: ["Action RPG", "Тъмно фентъзи"], image: "images/darksouls3.jpg", colors: ["#434343", "#c0392b"],
    how: "Инсталация през Steam (около 25 GB). Геймплей: взискателен екшън RPG – учете се от грешките и надвивайте могъщи врагове." }
];

const DEMO_USERS = 10;                 // демо потребители: demo1 … demo10, парола demo123
const DEMO_PASSWORD = "demo123";

/* Разпределя оценки от 1–5 така, че средната да е близо до целевата */
function spreadRatings(target, n) {
  const sum = Math.round(target * n), base = Math.floor(sum / n), extra = sum - base * n;
  return Array.from({ length: n }, (_, i) => Math.min(5, base + (i < extra ? 1 : 0)));
}

function run(db) {
  const insStudio = db.prepare("INSERT OR IGNORE INTO studios (name) VALUES (?)");
  const getStudio = db.prepare("SELECT id FROM studios WHERE name = ?");
  const insGenre = db.prepare("INSERT OR IGNORE INTO genres (name) VALUES (?)");
  const getGenre = db.prepare("SELECT id FROM genres WHERE name = ?");
  const insGame = db.prepare("INSERT INTO games (title, studio_id, year, instructions, image, color_a, color_b) VALUES (?,?,?,?,?,?,?)");
  const insLink = db.prepare("INSERT INTO game_genres (game_id, genre_id) VALUES (?,?)");
  const insUser = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?,?,?)");
  const insRating = db.prepare("INSERT INTO ratings (user_id, game_id, value) VALUES (?,?,?)");

  db.exec("BEGIN");
  try {
    const hash = hashPassword(DEMO_PASSWORD);
    const userIds = [];
    for (let i = 1; i <= DEMO_USERS; i++) {
      userIds.push(Number(insUser.run(`demo${i}`, `demo${i}@example.com`, hash).lastInsertRowid));
    }
    for (const g of GAMES) {
      insStudio.run(g.studio);
      const studioId = getStudio.get(g.studio).id;
      const gameId = Number(insGame.run(g.title, studioId, g.year, g.how, g.image, g.colors[0], g.colors[1]).lastInsertRowid);
      for (const name of g.genres) {
        insGenre.run(name);
        insLink.run(gameId, getGenre.get(name).id);
      }
      spreadRatings(g.rating, DEMO_USERS).forEach((v, i) => insRating.run(userIds[i], gameId, v));
    }
    db.exec("COMMIT");
  } catch (e) { db.exec("ROLLBACK"); throw e; }
}

module.exports = { run };
