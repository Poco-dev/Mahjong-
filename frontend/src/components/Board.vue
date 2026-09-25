<script>
import Tile from "@/components/Tile.vue";

const STEP_X = 89;
const STEP_Y = 109;
const LIFT = 20;
const TILE_W = 110;
const TILE_H = 130;
const PAD = 24;

export default {
  name: "Board",
  components: { Tile },
  props: {
    tiles: { type: Array, required: true },
    positions: { type: Array, required: true },
    freeIds: { type: Set, required: true },
    chosenId: { type: Number, default: null },
    hintIds: { type: Array, required: true },
    shakeId: { type: Number, default: null },
    highlightFree: Boolean,
    dimmed: Boolean,
  },
  emits: ["choose"],
  data() {
    return { available: { width: 0, height: 0 } };
  },
  computed: {
    // Размер доски считаем по всей раскладке, чтобы масштаб не прыгал по ходу игры.
    bounds() {
      let maxX = 0, maxY = 0, maxZ = 0;
      for (const p of this.positions) {
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
        maxZ = Math.max(maxZ, p.z);
      }
      return {
        maxZ,
        width: maxX * STEP_X + maxZ * LIFT + TILE_W + PAD * 2,
        height: maxY * STEP_Y + maxZ * LIFT + TILE_H + PAD * 2,
      };
    },
    scale() {
      const { width, height } = this.available;
      if (!width || !height) return 1;
      return Math.min(1.15, width / this.bounds.width, height / this.bounds.height);
    },
    // На вертикальном телефоне доска получается мелкой — подскажем повернуть экран.
    suggestRotate() {
      const { width, height } = this.available;
      return height > width * 1.2 && this.scale < 0.45;
    },
  },
  methods: {
    place(tile) {
      return {
        left: PAD + tile.x * STEP_X + tile.z * LIFT,
        top: PAD + tile.y * STEP_Y + (this.bounds.maxZ - tile.z) * LIFT,
        zIndex: Math.floor(tile.z * 100000 - tile.x * 100 + tile.y * 100 + 100000),
      };
    },
    shadowStyle(tile) {
      const p = this.place(tile);
      return {
        left: p.left + "px",
        top: p.top + "px",
        zIndex: p.zIndex - 100000,
      };
    },
    measure() {
      const el = this.$refs.wrap;
      if (!el) return;
      // Снизу оставляем место под панель инструментов
      const toolbar = 84;
      this.available = { width: el.clientWidth - 16, height: el.clientHeight - toolbar };
    },
  },
  mounted() {
    this.measure();
    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this.$refs.wrap);
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
};
</script>

<template>
  <div ref="wrap" class="board-wrap">
    <div class="board-slot" :style="{ width: bounds.width * scale + 'px', height: bounds.height * scale + 'px' }">
      <div class="board" :class="{ dimmed }"
        :style="{ width: bounds.width + 'px', height: bounds.height + 'px', transform: `scale(${scale})` }">
        <TransitionGroup name="shadow">
          <div v-for="tile in tiles" :key="'s' + tile.id" class="shadow" :style="shadowStyle(tile)"></div>
        </TransitionGroup>
        <TransitionGroup name="tile" appear>
          <Tile v-for="(tile, index) in tiles" :key="tile.id" :tile="tile" :pos="place(tile)" :index="index"
            :free="freeIds.has(tile.id)" :chosen="tile.id === chosenId" :hint="hintIds.includes(tile.id)"
            :shake="tile.id === shakeId" :highlight-free="highlightFree" @choose="$emit('choose', tile)" />
        </TransitionGroup>
      </div>
    </div>
    <p v-if="suggestRotate" class="rotate-hint">📱↻ Поверните телефон — плитки станут крупнее</p>
  </div>
</template>

<style scoped>
.board-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 0.5rem;
  min-width: 0;
  overflow: hidden;
}

.board-slot {
  position: relative;
}

.rotate-hint {
  margin-top: 1rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.board {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  isolation: isolate;
  transition: filter 0.3s;
}

.board.dimmed {
  filter: blur(2px) brightness(0.7);
}

.shadow {
  position: absolute;
  width: 110px;
  height: 130px;
  border-radius: 14px;
  box-shadow: -6px 16px 18px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.shadow-leave-active {
  transition: opacity 0.3s;
}

.shadow-leave-to,
.shadow-enter-from {
  opacity: 0;
}

.shadow-enter-active {
  transition: opacity 0.3s;
}
</style>

<style>
.tile-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.3);
}

.tile-appear-active {
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2);
  transition-delay: calc(var(--i) * 4ms);
}

.tile-enter-from,
.tile-appear-from {
  opacity: 0;
  transform: translateY(-40px) scale(0.9);
}

.tile-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
  pointer-events: none;
}

.tile-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.12) rotate(-4deg);
}
</style>
