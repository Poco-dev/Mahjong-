<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "Lose",
  components: { Modal },
  props: {
    reason: String,
    canUndo: Boolean,
    pairsLeft: Number,
  },
  emits: ["revert", "reshuffle", "restart", "menu"],
};
</script>

<template>
  <Modal width="26rem" :closable="false">
    <div class="text-center mb-5">
      <div class="text-5xl mb-2">{{ reason === "timeout" ? "⌛" : "🚧" }}</div>
      <h2 class="text-2xl font-extrabold">{{ reason === "timeout" ? "Время вышло!" : "Ходов больше нет" }}</h2>
      <p class="text-white/60 text-sm mt-1">
        <template v-if="reason === 'timeout'">Оставалось всего {{ pairsLeft }} пар. В следующий раз получится!</template>
        <template v-else>Осталось {{ pairsLeft }} пар, но свободных одинаковых нет. Можно отменить ход или перемешать.</template>
      </p>
    </div>
    <div class="flex flex-col gap-2">
      <template v-if="reason !== 'timeout'">
        <button class="btn btn-primary" @click="$emit('reshuffle')">🔀 Перемешать <span class="kbd">S</span></button>
        <button class="btn btn-ghost" :disabled="!canUndo" @click="$emit('revert')">↩️ Отменить ход <span class="kbd">Z</span></button>
      </template>
      <div class="grid grid-cols-2 gap-2">
        <button class="btn" :class="reason === 'timeout' ? 'btn-primary' : 'btn-ghost'" @click="$emit('restart')">🔁 Заново</button>
        <button class="btn btn-ghost" @click="$emit('menu')">🏠 Меню</button>
      </div>
    </div>
  </Modal>
</template>
