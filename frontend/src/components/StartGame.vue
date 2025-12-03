<script>
export default {
  name: "StartGame",
  data() {
    return {
      difficulty: ''
    }
  },
  methods: {
    click() {
      if (this.difficulty !== '') {
        this.$emit('start', this.difficulty)
        window.localStorage.setItem('difficulty', this.difficulty)
        window.localStorage.setItem('time', "null")
      }
    }
  }
}
</script>

<template>
  <div
    class="flex flex-col content-between bg-gradient-to-r from-red-500 via-red-900 to-red-500 border-4 rounded-md border-red-900">
    <div class="text-center mb-5 mt-5">
      <p class="text-white text-lg font-serif">Выберите сложность</p>
    </div>
    <div class="flex flex-col p-1 ">
      <div class="flex flex-row">
        <button type="button" @click="difficulty = 'hard'"
          class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Сложно
        </button>
        <button type="button" @click="difficulty = 'medium'"
          class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Средняя
        </button>
        <button type="button" @click="difficulty = 'easy'"
          class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Легко
        </button>
      </div>

      <button type="button" @click="click"
        class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
        Начать
      </button>
    </div>
  </div>
</template>

<style scoped></style>