<script>
export default {
  name: "Tile",
  props: {
    tile: {
      type: Object,
      required: true
    },
    selectable: {
      type: Boolean
    },
    chosen: {
      type: Boolean
    },
    hint: {
      type: Boolean
    }
  },
  methods: {
    getSrc(type) {
      switch (type) {
        case 0:
          return "/src/assets/cars/lada.png"
        case 1:
          return "/src/assets/cars/moskvich.png"
        case 2:
          return "/src/assets/cars/uaz.png"
        case 3:
          return "/src/assets/cars/honda.png"
        case 4:
          return "/src/assets/cars/infinity.png"
        case 5:
          return "/src/assets/cars/mitsubishi.png"
        case 6:
          return "/src/assets/cars/lexus.png"
        case 7:
          return "/src/assets/cars/mazda.png"
        case 8:
          return "/src/assets/cars/nissan.png"
        case 9:
          return "/src/assets/cars/tayota.png"
        case 10:
          return "/src/assets/cars/chevrolet.png"
        case 11:
          return "/src/assets/cars/ford.png"
        case 12:
          return "/src/assets/cars/tesla.png"
        case 13:
          return "/src/assets/cars/audi.png"
        case 14:
          return "/src/assets/cars/bmw.png"
        case 15:
          return "/src/assets/cars/mercedes.png"
        case 16:
          return "/src/assets/cars/porsche.png"
        case 17:
          return "/src/assets/cars/volkswagen.png"
        case 18:
          return "/src/assets/cars/opel.png"
        case 19:
          return "/src/assets/cars/kia.png"
        case 20:
          return "/src/assets/cars/hyundai.png"
        case 21:
          return "/src/assets/cars/ferrari.png"
        case 22:
          return "/src/assets/cars/lamborghini.png"
        case 23:
          return "/src/assets/cars/rollsroyce.png"
        case 24:
          return "/src/assets/cars/bugatti.png"
        case 25:
          return "/src/assets/cars/jaguar.png"
        case 26:
          return "/src/assets/cars/skoda.png"
        case 27:
          return "/src/assets/cars/peugeot.png"
        case 28:
          return "/src/assets/cars/landrover.png"
        case 29:
          return "/src/assets/cars/citroen.png"
        case 30:
          return "/src/assets/cars/renault.png"
        case 31:
          return "/src/assets/cars/cadillac.png"
        case 32:
          return "/src/assets/cars/fiat.png"
        case 33:
          return "/src/assets/cars/jeep.png"
        case 34:
          return "/src/assets/cars/subaru.png"
        case 35:
          return "/src/assets/cars/volvo.png"
        default:
          return "/src/assets/empty.png"
      }
    },
    getX() {
      return this.tile['x'] * 89 + this.tile['z'] * 20
    },
    getY() {
      return this.tile['y'] * 109 + 80 - this.tile['z'] * 20
    },
    getZIndex() {
      return Math.floor(this.tile['z'] * 100000 - this.tile['x'] * 100 + this.tile['y'] * 100 + 100000)
    },
    getShadowX() {
      return this.tile['x'] * 89 + this.tile['z'] * 20
    },
    getShadowY() {
      return this.tile['y'] * 109 + 60 - this.tile['z'] * 20
    },
    getShadowZIndex() {
      return Math.floor((this.tile['z'] - 1) * 100000 - this.tile['x'] * 100 + this.tile['y'] * 100 + 100000)
    },
    getHintX() {
      return this.tile['x'] * 89 + this.tile['z'] * 20 + 20
    },
    getHintY() {
      return this.tile['y'] * 109 + 80 - this.tile['z'] * 20
    }
  }
}
</script>

<template>
  <div>
    <img draggable="false" v-if="selectable && chosen" class="img chosen" :style="{
      'left': this.getX() + 'px',
      'top': this.getY() + 'px',
      'z-index': this.getZIndex()
    }" :src="getSrc(tile['type'])" @click="$emit('choose', tile)" alt="no"/>
    <img draggable="false" onmousedown="off" v-else-if="selectable" class="img selectable" :style="{
      'left': this.getX() + 'px',
      'top': this.getY() + 'px',
      'z-index': this.getZIndex()
    }" :src="getSrc(tile['type'])" @click="$emit('choose', tile)" alt="no"/>
    <img draggable="false" v-else class="img" :style="{
      'left': this.getX() + 'px',
      'top': this.getY() + 'px',
      'z-index': this.getZIndex()
    }" :src="getSrc(tile['type'])" alt="no"/>
    <img draggable="false" class="shadow" src="/src/assets/shadow.png"
         :style="{ 'left': this.getShadowX() + 'px', 'top': this.getShadowY() + 'px', 'z-index': this.getShadowZIndex() }" alt="no"/>
    <div v-if="hint" class="hint" :style="{'left': this.getHintX() + 'px','top': this.getHintY() + 'px','z-index': 1000000000}"></div>
  </div>
</template>

<style scoped>
.img {
  position: absolute;
  user-select: none;
}

.selectable, .chosen {
  cursor: pointer;
}

.selectable:hover,
.chosen {
  filter: brightness(80%)
}

.shadow {
  position: absolute;
  opacity: 40%;
  filter: blur(5px);
  user-select: none;
  pointer-events: none;
}

.hint {
  position: absolute;
  width: 92px;
  height: 112px;
  border: 3px solid blue;
  pointer-events: none;
}
</style>