<script>
import { tileSrc } from "@/services/TileSet.js";

// Круглая аватарка: вырезаем эмблему с лицевой стороны плитки (без 3D-бортика).
export default {
  name: "Avatar",
  props: {
    type: { type: Number, default: 14 },
    size: { type: Number, default: 40 },
  },
  computed: {
    style() {
      const k = this.size / 70;
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        backgroundImage: `url(${tileSrc(this.type)})`,
        backgroundSize: `${110 * k}px ${130 * k}px`,
        backgroundPosition: `${this.size / 2 - 65 * k}px ${this.size / 2 - 53 * k}px`,
      };
    },
  },
};
</script>

<template>
  <div class="avatar" :style="style"></div>
</template>

<style scoped>
.avatar {
  flex: none;
  border-radius: 999px;
  background-color: white;
  background-repeat: no-repeat;
}
</style>
