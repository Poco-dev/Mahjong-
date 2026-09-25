// Генератор псевдослучайных чисел с зерном (mulberry32) — нужен для ежедневного вызова,
// чтобы у всех игроков в один день была одинаковая раскладка.
function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

class Rnd {
  seeded(seed) {
    let a = typeof seed === "string" ? hashString(seed) : seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  int(max, random = Math.random) {
    return Math.floor(random() * max);
  }

  shuffle(array, random = Math.random) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export default new Rnd();
