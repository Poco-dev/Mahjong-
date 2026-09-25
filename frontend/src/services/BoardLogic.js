// Общая логика доски: какие плитки свободны и какие пары можно убрать.

// Плитка свободна, если на ней ничего не лежит и хотя бы один бок (левый или правый) открыт.
export function isFree(tile, tiles) {
  let left = false, right = false, up = false;
  for (const e of tiles) {
    if (e === tile) continue;
    if (e.z === tile.z && Math.abs(e.y - tile.y) < 1) {
      if (e.x === tile.x + 1) right = true;
      else if (e.x === tile.x - 1) left = true;
    } else if (e.z === tile.z + 1 && Math.abs(e.x - tile.x) < 1 && Math.abs(e.y - tile.y) < 1) {
      up = true;
    }
    if (up || (left && right)) return false;
  }
  return true;
}

export function freeTiles(tiles) {
  return tiles.filter((tile) => isFree(tile, tiles));
}

// Все доступные сейчас пары, сгруппированные по типу плитки.
export function availableMoves(tiles) {
  const byType = {};
  for (const tile of freeTiles(tiles)) {
    (byType[tile.type] ||= []).push(tile);
  }
  let pairs = 0;
  let hint = null;
  for (const group of Object.values(byType)) {
    if (group.length >= 2) {
      pairs += (group.length * (group.length - 1)) / 2;
      hint ||= [group[0], group[1]];
    }
  }
  return { pairs, hint };
}
