<template>
  <div
    class="flex w-1/2 flex-col content-between bg-gradient-to-r from-emerald-500 via-emerald-900 to-emerald-500 border-4 rounded-md border-green-900">
    <div class="text-center mb-5 mt-5">
      <p class="text-white text-xl font-serif">Ура, вы победили!</p>
    </div>
    <div class="flex flex-row p-1 ">
      <button type="button" @click="$emit('update')" style="width:49%"
        class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
        Начать
        сначала
      </button>

      <button type="button" @click="$emit('restart')" style="width:49%"
        class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
        Начать
        новую игру
      </button>
    </div>
    <div class="mb-6 ml-2 mr-2">
      <label for="default-input" class="block mb-2 text-sm font-medium text-white"><span class="text-black">Хотите
          попасть в ТОП?</span> ВВЕДИТЕ ИМЯ</label>
      <input v-model="nickname" type="text" id="default-input"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
    </div>
    <button type="button" @click="send()" :disabled="used == true || nickname == ''"
      class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-2 mr-2">
      Отправить
    </button>
  </div>
</template>

<script>


export default {
  data() {
    return {
      nickname: '',
      time: '6:3:17',
      used: false,
    }
  },
  methods: {
    getInfo() {
      console.log('work')
      this.time = localStorage.getItem('time')
      console.log(this.time)
    },
    send() {
      if (this.nickname) {
        window.localStorage.setItem('nickname', this.nickname)
        this.used = !this.used
        this.$emit('send')


      }

    }
  },
  mounted() {
    this.getInfo()
  }
}
</script>
