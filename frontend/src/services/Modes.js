export const MODES = {
  classic: {
    id: "classic",
    name: "Классика",
    icon: "🀄",
    description: "Уберите все пары. Время идёт вверх, результат попадает в таблицу лидеров.",
    ranked: true,
  },
  timed: {
    id: "timed",
    name: "На время",
    icon: "⏱️",
    description: "Обратный отсчёт! Каждая пара даёт +5 секунд. Не успели — проиграли.",
    ranked: true,
  },
  zen: {
    id: "zen",
    name: "Дзен",
    icon: "🍃",
    description: "Без таймера и проигрышей: тупики перемешиваются сами. Просто отдыхайте.",
    ranked: false,
  },
  daily: {
    id: "daily",
    name: "Вызов дня",
    icon: "📅",
    description: "Одна раскладка на всех на сегодня. Сравните время с другими игроками.",
    ranked: true,
  },
};

export const TIMED_BONUS = 5;

export const TIME_LIMITS = { easy: 6 * 60, medium: 8 * 60, hard: 10 * 60 };

export const DAILY_LAYOUTS = ["turtle", "pyramid", "fortress"];

export function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dailySetup(date = new Date()) {
  const day = todayKey(date);
  const index = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return { day, layout: DAILY_LAYOUTS[index % DAILY_LAYOUTS.length], difficulty: "medium" };
}

export function formatTime(total) {
  total = Math.max(0, Math.floor(Number(total) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
