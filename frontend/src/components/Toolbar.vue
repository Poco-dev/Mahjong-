<script>
export default {
  name: "Toolbar",
  props: {
    canUndo: Boolean,
    disabled: Boolean,
    hints: Number,
    reshuffles: Number,
  },
  emits: ["revert", "hint", "reshuffle", "restart", "menu"],
};
</script>

<template>
  <nav class="toolbar panel">
    <button class="tool" :disabled="disabled || !canUndo" title="Отменить ход (Z)" @click="$emit('revert')">
      <span class="ico">↩️</span><span class="label">Отмена</span><span class="kbd">Z</span>
    </button>
    <button class="tool" :disabled="disabled" title="Подсказка (H)" @click="$emit('hint')">
      <span class="ico">💡</span><span class="label">Подсказка</span>
      <span v-if="hints" class="badge">{{ hints }}</span><span class="kbd">H</span>
    </button>
    <button class="tool" :disabled="disabled" title="Перемешать (S)" @click="$emit('reshuffle')">
      <span class="ico">🔀</span><span class="label">Перемешать</span>
      <span v-if="reshuffles" class="badge">{{ reshuffles }}</span><span class="kbd">S</span>
    </button>
    <span class="sep"></span>
    <button class="tool" title="Сыграть эту раскладку заново (R)" @click="$emit('restart')">
      <span class="ico">🔁</span><span class="label">Заново</span><span class="kbd">R</span>
    </button>
    <button class="tool" title="Меню / новая игра (N)" @click="$emit('menu')">
      <span class="ico">🏠</span><span class="label">Меню</span><span class="kbd">N</span>
    </button>
  </nav>
</template>

<style scoped>
.toolbar {
  position: fixed;
  left: 50%;
  bottom: max(0.75rem, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem;
  border-radius: 1rem;
  max-width: calc(100vw - 1rem);
}

.tool {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  border-radius: 0.7rem;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.15s, transform 0.1s;
}

.tool:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.tool:active:not(:disabled) {
  transform: scale(0.95);
}

.tool:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ico {
  font-size: 1rem;
}

.badge {
  min-width: 1.1rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.25);
  color: #fde68a;
  font-size: 0.7rem;
  line-height: 1.1rem;
  text-align: center;
}

.sep {
  width: 1px;
  align-self: stretch;
  margin: 0.3rem 0.2rem;
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 900px), (max-height: 500px) {
  .kbd {
    display: none;
  }
}

@media (max-width: 640px), (max-height: 500px) {
  .label {
    display: none;
  }

  .tool {
    padding: 0.6rem 0.75rem;
  }

  .ico {
    font-size: 1.2rem;
  }

  .badge {
    position: absolute;
    top: 0.1rem;
    right: 0.1rem;
  }
}
</style>
