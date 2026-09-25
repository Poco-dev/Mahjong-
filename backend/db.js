const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/mahjong";

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

// Результат партии. Старые записи без mode/layout считаются «классикой» на «черепахе».
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 20 },
    time: { type: Number, required: true, min: 0 }, // Время в секундах
    reshuffles: { type: Number, required: true, min: 0 }, // Количество перемешиваний
    hints: { type: Number, min: 0 },
    difficulty: { type: String, required: true, enum: ["easy", "medium", "hard"] },
    mode: { type: String, default: "classic", enum: ["classic", "timed", "daily"] },
    layout: { type: String, default: "turtle", enum: ["turtle", "pyramid", "fortress"] },
    day: { type: String }, // Для ежедневного вызова: YYYY-MM-DD
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

userSchema.index({ mode: 1, layout: 1, difficulty: 1, day: 1, time: 1 });

// Создание модели пользователя
const User = mongoose.model("User", userSchema);

module.exports = { connectDB, User };
