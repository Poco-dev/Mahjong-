<script>
export default {
  name: "Header",
  data() {
    return {
      hour: 0,
      min: 0,
      sec: 0,
      time: 0,
    }
  },
  methods: {
    timer() {
      if (window.localStorage.getItem('time') == "null") {
        this.time = 0;
        window.localStorage.setItem('time', this.time)
      } else {
        this.time += 1
        if (this.time == 0) {
          this.sec = 0
        } else {
          this.sec = this.time % 60
        }
        this.min = Math.floor(this.time / 60)
        this.hour = Math.floor(this.time / 3600)
        window.localStorage.setItem('time', this.time)
      }
    },
  },
  mounted() {
    setInterval(this.timer, 1000);
  }
}
</script>

<template>
  <header class="flex justify-around content-center h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
    style="z-index: 2; position: absolute; width: 100%">
    <p class="text-white mt-1 hover:cursor-pointer" @click="$emit('restart')">Новая игра</p>
    <p class="text-white mt-1 hover:cursor-pointer" @click="$emit('update')">Начать сначала</p>
    <p class="text-white mt-1 hover:cursor-pointer" @click="$emit('reshuffle')">Перемешать</p>
    <p class="text-white mt-1 hover:cursor-pointer" @click="$emit('showhint')">Подсказка</p>
    <p class="text-white mt-1 hover:cursor-pointer" @click="$emit('revert')">Отмена хода</p>
    <p class="text-white mt-1 hover:cursor-pointer" @click="$emit('leaderBoard')">Таблица лидеров</p>
    <p class="text-white mt-1 hover:cursor-pointer">Время: <span v-if="hour">{{ hour }}:</span>{{ min }}:{{ sec }}</p>
  </header>
</template>

<style scoped></style>