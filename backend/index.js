const express = require("express");
const cors = require("cors");
const { connectDB, User } = require("./db");

const app = express();

// Middleware для обработки JSON
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
connectDB();

// Маршрут для сохранения нового пользователя
app.post("/add_result", async (req, res) => {
  try {
    const { name, time, reshuffles, difficulty } = req.body;

    // Проверка на наличие всех полей
    if (!name || time == null || reshuffles == null || !difficulty) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    // Создание и сохранение пользователя
    const newUser = new User({ name, time, reshuffles, difficulty });
    await newUser.save();

    res.status(201).json({ message: "Пользователь сохранен", user: newUser });
  } catch (err) {
    console.error("Ошибка при сохранении пользователя:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Маршрут для получения данных о всех пользователях
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({ difficulty: req.query.difficulty })
      .sort({ time: 1 })
      .limit(10);
    res.status(200).json(users);
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
