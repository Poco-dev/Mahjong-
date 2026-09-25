<script>
export default {
  name: "Modal",
  props: {
    width: { type: String, default: "32rem" },
    closable: { type: Boolean, default: true },
  },
  emits: ["close"],
};
</script>

<template>
  <div class="modal-backdrop" @click.self="closable && $emit('close')">
    <div class="modal-card panel" :style="{ maxWidth: width }">
      <button v-if="closable" class="modal-close" aria-label="Закрыть" @click="$emit('close')">✕</button>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(2, 6, 23, 0.55);
  overflow-y: auto;
}

.modal-card {
  position: relative;
  width: 100%;
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  border-radius: 1.25rem;
  padding: 1.5rem;
}

@media (max-width: 480px) {
  .modal-card {
    padding: 1.1rem;
  }
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.6);
  transition: background-color 0.15s, color 0.15s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>
