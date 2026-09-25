const express = require("express");
const cors = require("cors");
const { connectDB, User } = require("./db");

const app = express();

// Middleware для обработки JSON
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Подключение к MongoDB
connectDB();

const DIFFICULTIES = ["easy", "medium", "hard"];
const MODES = ["classic", "timed", "daily"];
const LAYOUTS = ["turtle", "pyramid", "fortress"];

const isCount = (value) => Number.isInteger(value) && value >= 0 && value < 1e6;

// Маршрут для сохранения результата
app.post("/add_result", async (req, res) => {
  try {
    const { name, difficulty } = req.body;
    const time = Number(req.body.time);
    const reshuffles = Number(req.body.reshuffles);
    const hints = req.body.hints == null ? undefined : Number(req.body.hints);
    const mode = req.body.mode || "classic";
    const layout = req.body.layout || "turtle";
    const day = mode === "daily" ? req.body.day : undefined;

    // Проверка полей
    if (typeof name !== "string" || !name.trim() || name.trim().length > 20) {
      return res.status(400).json({ message: "Имя должно быть от 1 до 20 символов" });
    }
    if (!isCount(time) || time === 0 || !isCount(reshuffles) || (hints !== undefined && !isCount(hints))) {
      return res.status(400).json({ message: "Некорректные время или счётчики" });
    }
    if (!DIFFICULTIES.includes(difficulty) || !MODES.includes(mode) || !LAYOUTS.includes(layout)) {
      return res.status(400).json({ message: "Неизвестные режим, раскладка или сложность" });
    }
    if (mode === "daily" && !/^\d{4}-\d{2}-\d{2}$/.test(day || "")) {
      return res.status(400).json({ message: "Для вызова дня нужна дата" });
    }

    const newUser = new User({ name: name.trim(), time, reshuffles, hints, difficulty, mode, layout, day });
    await newUser.save();

    res.status(201).json({ message: "Результат сохранён", user: newUser });
  } catch (err) {
    console.error("Ошибка при сохранении результата:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Маршрут для получения топ-10 по сложности, режиму и раскладке
app.get("/users", async (req, res) => {
  try {
    const { difficulty, day } = req.query;
    const mode = req.query.mode || "classic";
    const layout = req.query.layout || "turtle";
    if (!DIFFICULTIES.includes(difficulty) || !MODES.includes(mode) || !LAYOUTS.includes(layout)) {
      return res.status(400).json({ message: "Неизвестные режим, раскладка или сложность" });
    }

    const filter = {
      difficulty,
      // null совпадает и с отсутствующим полем — так старые записи попадают в «классику на черепахе»
      mode: mode === "classic" ? { $in: ["classic", null] } : mode,
      layout: layout === "turtle" ? { $in: ["turtle", null] } : layout,
    };
    if (mode === "daily") filter.day = String(day);

    const users = await User.find(filter).sort({ time: 1, reshuffles: 1, hints: 1 }).limit(10);
    res.status(200).json(users);
  } catch (err) {
    console.error("Ошибка при получении результатов:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
