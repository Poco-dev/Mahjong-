const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/mahjong";

// Подключение к базе данных
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB подключен успешно!");
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err.message);
    process.exit(1);
  }
};

// Определение схемы пользователя
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    time: { type: Number, required: true }, // Время в секундах
    reshuffles: { type: Number, required: true },
    difficulty: { type: String, required: true }, // Количество перемешиваний
  },
  { collection: "users" }
);

// Создание модели пользователя
const User = mongoose.model("User", userSchema);

module.exports = { connectDB, User };
