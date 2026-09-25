<script>
import Modal from "@/components/Modal.vue";
import { MODES } from "@/services/Modes.js";

export default {
  name: "Help",
  components: { Modal },
  emits: ["escape"],
  data() {
    return {
      modes: MODES,
      keys: [
        ["Z", "Отменить ход (или Ctrl+Z)"],
        ["H", "Подсказка"],
        ["S", "Перемешать"],
        ["R", "Сыграть раскладку заново"],
        ["N", "Меню / новая игра"],
        ["L", "Таблица лидеров"],
        ["P", "Карточка игрока"],
        ["F", "Подсветка свободных плиток"],
        ["M", "Звук вкл/выкл"],
        ["Esc", "Снять выделение / закрыть окно"],
      ],
    };
  },
};
</script>

<template>
  <Modal width="34rem" @close="$emit('escape')">
    <h2 class="text-2xl font-extrabold mb-4">Как играть</h2>
    <ul class="rules">
      <li>Нажимайте на две <b>одинаковые</b> эмблемы, чтобы убрать их с поля.</li>
      <li>Брать можно только <b>свободные</b> плитки: сверху ничего не лежит, и открыт левый <i>или</i> правый бок.</li>
      <li>Уберите все плитки — и вы победили. Каждая раскладка генерируется так, что решение точно существует.</li>
      <li>Застряли? Отмените ход, возьмите подсказку или перемешайте оставшиеся плитки.</li>
    </ul>

    <h3 class="section-title mt-5">Режимы</h3>
    <div class="flex flex-col gap-2">
      <div v-for="m in modes" :key="m.id" class="flex gap-3 text-sm">
        <span class="text-xl">{{ m.icon }}</span>
        <div><b>{{ m.name }}</b> — <span class="text-white/70">{{ m.description }}</span></div>
      </div>
    </div>

    <h3 class="section-title mt-5">Горячие клавиши</h3>
    <div class="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
      <div v-for="[k, d] in keys" :key="k" class="flex items-center gap-2">
        <span class="kbd">{{ k }}</span><span class="text-white/75">{{ d }}</span>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.rules {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
}

.rules li {
  padding-left: 1.4rem;
  position: relative;
}

.rules li::before {
  content: "🀄";
  position: absolute;
  left: 0;
  font-size: 0.85rem;
}

.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
  font-weight: 700;
}
</style>
