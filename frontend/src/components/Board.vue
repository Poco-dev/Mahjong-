<script>
import Tile from "@/components/Tile.vue";

export default {
  name: "Board",

  components: { Tile },
  props: {
    tiles: {
      type: Array,
      required: true
    },
    chosen: {
      type: Object
    },
    hint: {
      type: Array,
      required: true
    },
    showHint: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    isSelectable(tile) {
      let left = false, right = false, up = false;
      this.tiles.map((e) => {
        if (e.z === tile.z && e.x === tile.x + 1 && Math.abs(e.y - tile.y) < 1) {
          right = true
        } else if (e.z === tile.z && e.x === tile.x - 1 && Math.abs(e.y - tile.y) < 1) {
          left = true
        } else if (e.z === tile.z + 1 && Math.abs(e.x - tile.x) < 1 && Math.abs(e.y - tile.y) < 1) {
          up = true
        }
      })
      return !up && !(left && right)
    },
    chooseTile(tile) {
      this.$emit('choose', tile)
    },
  },
}
</script>

<template>
  <div>
    <Tile v-for="tile in tiles" :tile="tile" :selectable="isSelectable(tile)"
      :chosen="tile === chosen" :hint="showHint && hint.indexOf(tile) !== -1" :key="tile" @choose="chooseTile(tile)" />
  </div>
</template>

<style scoped></style>