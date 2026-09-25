<script>
// Мини-схема раскладки для меню: чем выше слой, тем светлее плитка.
export default {
  name: "MiniLayout",
  props: { positions: { type: Array, required: true } },
  computed: {
    view() {
      let maxX = 0, maxY = 0, maxZ = 0;
      for (const p of this.positions) {
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
        maxZ = Math.max(maxZ, p.z);
      }
      const rects = [...this.positions]
        .sort((a, b) => a.z - b.z)
        .map((p) => ({ x: p.x * 10 + p.z * 1.6, y: p.y * 12 - p.z * 1.6 + maxZ * 1.6, z: p.z }));
      return { rects, maxZ, w: maxX * 10 + 10 + maxZ * 1.6, h: maxY * 12 + 12 + maxZ * 1.6 };
    },
  },
};
</script>

<template>
  <svg :viewBox="`-1 -1 ${view.w + 2} ${view.h + 2}`" class="mini" aria-hidden="true">
    <rect v-for="(r, i) in view.rects" :key="i" :x="r.x" :y="r.y" width="9.4" height="11.4" rx="1.4"
      :fill="`hsl(45, ${40 + r.z * 12}%, ${55 + r.z * 9}%)`" stroke="rgba(0,0,0,.35)" stroke-width=".5" />
  </svg>
</template>

<style scoped>
.mini {
  width: 100%;
  height: 100%;
}
</style>
