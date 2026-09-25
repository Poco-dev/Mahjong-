// Карточка игрока: статистика, уровень и достижения. Хранится в localStorage.
import { LAYOUTS } from "./FigureService.js";

const KEY = "mahjong.profile.v1";

export const ACHIEVEMENTS = [
  { id: "first_win", icon: "🏁", name: "Первый финиш", description: "Выиграйте первую партию" },
  { id: "clean", icon: "🧠", name: "Сам с усами", description: "Победа без подсказок и перемешиваний" },
  { id: "speed", icon: "⚡", name: "Форсаж", description: "Победа быстрее чем за 5 минут" },
  { id: "hardcore", icon: "🔥", name: "Хардкорщик", description: "Победа на сложном уровне" },
  { id: "timed", icon: "⏱️", name: "Против часов", description: "Победа в режиме «На время»" },
  { id: "zen", icon: "🍃", name: "Дзен", description: "Пройдите партию в режиме «Дзен»" },
  { id: "daily", icon: "📅", name: "Вызов принят", description: "Пройдите вызов дня" },
  { id: "streak3", icon: "🔗", name: "Серия", description: "3 победы подряд" },
  { id: "collector", icon: "🗺️", name: "Путешественник", description: "Победа на каждой раскладке" },
  { id: "pairs1000", icon: "🚗", name: "Автосалон", description: "Уберите 1000 пар" },
];

export const RANKS = ["Новичок", "Любитель", "Водитель", "Гонщик", "Пилот", "Чемпион", "Легенда"];

function defaults() {
  return {
    nickname: "",
    avatar: 14,
    createdAt: Date.now(),
    games: 0,
    wins: 0,
    streak: 0,
    bestStreak: 0,
    pairs: 0,
    playTime: 0,
    hints: 0,
    xp: 0,
    activeGame: false,
    best: {},
    modeWins: {},
    layoutWins: {},
    dailyDone: [],
    achievements: {},
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    return defaults();
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* приватный режим браузера и т.п. */
  }
}

export function levelInfo(xp) {
  const level = Math.floor(Math.sqrt(xp / 150)) + 1;
  const from = 150 * (level - 1) ** 2;
  const to = 150 * level ** 2;
  return {
    level,
    rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))],
    progress: (xp - from) / (to - from),
    toNext: to - xp,
  };
}

export function bestKey(mode, layout, difficulty) {
  return `${mode}:${layout}:${difficulty}`;
}

// Новая партия. Брошенная незаконченная партия обрывает серию побед.
export function recordStart(profile) {
  if (profile.activeGame) profile.streak = 0;
  profile.activeGame = true;
  profile.games++;
  saveProfile(profile);
}

export function recordPairs(profile, count) {
  profile.pairs += count;
  profile.xp += count;
  saveProfile(profile);
}

export function recordLoss(profile, { time }) {
  profile.activeGame = false;
  profile.streak = 0;
  profile.playTime += time;
  saveProfile(profile);
}

// Возвращает список только что открытых достижений.
export function recordWin(profile, { mode, layout, difficulty, time, hints, reshuffles, day }) {
  profile.activeGame = false;
  profile.wins++;
  profile.streak++;
  profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
  profile.playTime += time;
  profile.modeWins[mode] = (profile.modeWins[mode] || 0) + 1;
  profile.layoutWins[layout] = (profile.layoutWins[layout] || 0) + 1;
  profile.xp += 50 + { easy: 0, medium: 25, hard: 60 }[difficulty] + (hints + reshuffles === 0 ? 30 : 0);

  let newRecord = false;
  if (mode !== "zen") {
    const key = bestKey(mode, layout, difficulty);
    if (!profile.best[key] || time < profile.best[key]) {
      newRecord = Boolean(profile.best[key]);
      profile.best[key] = time;
    }
  }
  if (day && !profile.dailyDone.includes(day)) {
    profile.dailyDone = [...profile.dailyDone, day].slice(-60);
  }

  const unlocked = [];
  const unlock = (id, condition) => {
    if (condition && !profile.achievements[id]) {
      profile.achievements[id] = Date.now();
      unlocked.push(ACHIEVEMENTS.find((a) => a.id === id));
    }
  };
  unlock("first_win", true);
  unlock("clean", hints === 0 && reshuffles === 0);
  unlock("speed", time < 300);
  unlock("hardcore", difficulty === "hard");
  unlock("timed", mode === "timed");
  unlock("zen", mode === "zen");
  unlock("daily", mode === "daily");
  unlock("streak3", profile.streak >= 3);
  unlock("collector", Object.keys(LAYOUTS).every((id) => profile.layoutWins[id]));
  unlock("pairs1000", profile.pairs >= 1000);

  saveProfile(profile);
  return { unlocked, newRecord };
}
