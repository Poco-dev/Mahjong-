import Rnd from "./Rnd.js";
import { freeTiles } from "./BoardLogic.js";

function rect(x0, x1, ys, z) {
  const res = [];
  for (const y of ys) {
    for (let x = x0; x <= x1; x++) res.push({ x, y, z });
  }
  return res;
}

function range(a, b) {
  const res = [];
  for (let i = a; i <= b; i++) res.push(i);
  return res;
}

const turtle = [
  ...rect(1, 12, [0], 0),
  ...rect(3, 10, [1], 0),
  ...rect(2, 11, [2], 0),
  ...rect(1, 12, [3], 0),
  { x: 0, y: 3.5, z: 0 },
  { x: 13, y: 3.5, z: 0 },
  { x: 14, y: 3.5, z: 0 },
  ...rect(1, 12, [4], 0),
  ...rect(2, 11, [5], 0),
  ...rect(3, 10, [6], 0),
  ...rect(1, 12, [7], 0),
  ...rect(4, 9, range(1, 6), 1),
  ...rect(5, 8, range(2, 5), 2),
  ...rect(6, 7, [3, 4], 3),
  { x: 6.5, y: 3.5, z: 4 },
];

const pyramid = [
  ...rect(0, 9, range(0, 7), 0),
  ...rect(1, 8, range(1, 6), 1),
  ...rect(3, 6, [2.5, 3.5, 4.5], 2),
  ...rect(4, 5, [3, 4], 3),
];

const fortress = (() => {
  const res = [];
  // Стены в два ряда вокруг двора
  for (let y = 0; y <= 7; y++) {
    for (let x = 0; x <= 11; x++) {
      if (x < 2 || x > 9 || y < 2 || y > 5) res.push({ x, y, z: 0 });
    }
  }
  // Башни по углам
  for (const [tx, ty] of [[0, 0], [10, 0], [0, 6], [10, 6]]) {
    res.push(...rect(tx, tx + 1, [ty, ty + 1], 1));
    res.push(...rect(tx, tx + 1, [ty, ty + 1], 2));
    res.push({ x: tx + 0.5, y: ty + 0.5, z: 3 });
  }
  // Цитадель в центре, отделённая рвом
  res.push(...rect(3, 8, range(2, 5), 0));
  res.push(...rect(4, 7, range(2, 5), 1));
  res.push(...rect(5, 6, [3, 4], 2));
  return res;
})();

export const LAYOUTS = {
  turtle: { id: "turtle", name: "Черепаха", icon: "🐢", positions: turtle },
  pyramid: { id: "pyramid", name: "Пирамида", icon: "🔺", positions: pyramid },
  fortress: { id: "fortress", name: "Крепость", icon: "🏰", positions: fortress },
};

export const DIFFICULTIES = {
  easy: { id: "easy", name: "Легко", copies: 8, note: "18 марок, по 8 штук" },
  medium: { id: "medium", name: "Средне", copies: 6, note: "24 марки, по 6 штук" },
  hard: { id: "hard", name: "Сложно", copies: 4, note: "36 марок, по 4 штуки" },
};

class FigureService {
  // Раскладываем пары «с конца»: снимаем с полной доски случайные свободные пары
  // и назначаем им одинаковый тип. Такая раскладка гарантированно решаема.
  place(positions, pairTypes, random) {
    for (let attempt = 0; attempt < 60; attempt++) {
      let rest = positions.map((p) => ({ ...p }));
      const types = Rnd.shuffle([...pairTypes], random);
      const placed = [];
      let ok = true;
      for (const type of types) {
        const free = freeTiles(rest);
        if (free.length < 2) {
          ok = false;
          break;
        }
        const a = free.splice(Rnd.int(free.length, random), 1)[0];
        const b = free[Rnd.int(free.length, random)];
        placed.push({ ...a, type }, { ...b, type });
        rest = rest.filter((e) => e !== a && e !== b);
      }
      if (ok) return placed;
    }
    return null;
  }

  deal(layoutId, difficultyId, random = Math.random) {
    const positions = LAYOUTS[layoutId].positions.map((p, id) => ({ ...p, id }));
    const copies = DIFFICULTIES[difficultyId].copies;
    const pairTypes = [];
    for (let i = 0; pairTypes.length * 2 < positions.length; i++) {
      for (let j = 0; j < copies / 2; j++) pairTypes.push(i);
    }
    pairTypes.length = positions.length / 2;
    const placed = this.place(positions, pairTypes, random);
    if (placed) return placed.sort((a, b) => a.id - b.id);
    // На всякий случай — обычная случайная раскладка
    const flat = Rnd.shuffle(pairTypes.flatMap((t) => [t, t]), random);
    return positions.map((p, i) => ({ ...p, type: flat[i] }));
  }

  // Перемешиваем оставшиеся плитки так, чтобы партию снова можно было пройти.
  reshuffle(tiles, random = Math.random) {
    const counts = {};
    for (const tile of tiles) counts[tile.type] = (counts[tile.type] || 0) + 1;
    const pairTypes = [];
    for (const [type, count] of Object.entries(counts)) {
      for (let i = 0; i < Math.floor(count / 2); i++) pairTypes.push(Number(type));
    }
    const placed = pairTypes.length * 2 === tiles.length ? this.place(tiles, pairTypes, random) : null;
    if (placed) return { tiles: placed.sort((a, b) => a.id - b.id), solvable: true };
    const types = Rnd.shuffle(tiles.map((e) => e.type), random);
    return { tiles: tiles.map((e, i) => ({ ...e, type: types[i] })), solvable: false };
  }
}

export default new FigureService();
