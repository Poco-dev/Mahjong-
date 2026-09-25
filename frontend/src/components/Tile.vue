<script>
import { tileSrc, tileName } from "@/services/TileSet.js";

export default {
  name: "Tile",
  props: {
    tile: { type: Object, required: true },
    pos: { type: Object, required: true },
    index: Number,
    free: Boolean,
    chosen: Boolean,
    hint: Boolean,
    shake: Boolean,
    highlightFree: Boolean,
  },
  emits: ["choose"],
  computed: {
    src() {
      return tileSrc(this.tile.type);
    },
    name() {
      return tileName(this.tile.type);
    },
  },
};
</script>

<template>
  <div class="tile" :class="{ free, chosen, hint, shake, blocked: highlightFree && !free }" :style="{
    left: pos.left + 'px',
    top: pos.top + 'px',
    zIndex: pos.zIndex,
    '--i': index,
  }" :title="name" @click="$emit('choose')">
    <img :key="tile.type" class="face" draggable="false" :src="src" :alt="name" />
    <div class="glow"></div>
  </div>
</template>

<style scoped>
.tile {
  position: absolute;
  width: 110px;
  height: 130px;
  user-select: none;
  -webkit-user-select: none;
}

.face {
  display: block;
  width: 110px;
  height: 130px;
  pointer-events: none;
  animation: flip 0.35s ease;
  transition: filter 0.2s;
}

@keyframes flip {
  from {
    transform: rotateY(90deg);
  }
}

.glow {
  position: absolute;
  left: 20px;
  top: 1px;
  width: 89px;
  height: 108px;
  border-radius: 6px;
  pointer-events: none;
  transition: box-shadow 0.15s, background-color 0.15s;
}

.free {
  cursor: pointer;
}

.free:hover .face {
  filter: brightness(0.93);
}

.free:hover .glow {
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.blocked .face {
  filter: brightness(0.62) saturate(0.7);
}

.chosen .face {
  filter: brightness(0.9) sepia(0.35) saturate(1.6);
}

.chosen .glow {
  box-shadow: inset 0 0 0 3px #f59e0b, 0 0 18px 2px rgba(245, 158, 11, 0.75);
  background: rgba(251, 191, 36, 0.15);
}

.hint .glow {
  animation: hint 0.9s ease-in-out infinite;
}

@keyframes hint {
  0%,
  100% {
    box-shadow: inset 0 0 0 3px #22d3ee, 0 0 10px 1px rgba(34, 211, 238, 0.5);
  }

  50% {
    box-shadow: inset 0 0 0 3px #22d3ee, 0 0 26px 6px rgba(34, 211, 238, 0.9);
  }
}

.shake {
  animation: shake 0.35s;
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-4px);
  }

  40%,
  80% {
    transform: translateX(4px);
  }
}
</style>
