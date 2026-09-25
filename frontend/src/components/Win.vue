<script>
import axios from "axios";
import Modal from "@/components/Modal.vue";
import { MODES, formatTime } from "@/services/Modes.js";
import { LAYOUTS, DIFFICULTIES } from "@/services/FigureService.js";

export default {
  name: "Win",
  components: { Modal },
  props: {
    result: { type: Object, required: true },
    profile: { type: Object, required: true },
  },
  emits: ["restart", "menu", "leaders", "nickname"],
  data() {
    return {
      nickname: this.profile.nickname,
      status: "idle", // idle | sending | sent | error
      confetti: Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        color: ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#f87171"][i % 6],
        rotate: Math.random() * 360,
      })),
    };
  },
  computed: {
    mode() {
      return MODES[this.result.mode];
    },
    subtitle() {
      return `${this.mode.icon} ${this.mode.name} · ${LAYOUTS[this.result.layout].name} · ${DIFFICULTIES[this.result.difficulty].name}`;
    },
    canSend() {
      return this.mode.ranked && this.nickname.trim().length > 0 && this.status !== "sending" && this.status !== "sent";
    },
  },
  methods: {
    formatTime,
    async send() {
      if (!this.canSend) return;
      const name = this.nickname.trim().slice(0, 20);
      this.$emit("nickname", name);
      this.status = "sending";
      try {
        await axios.post("/add_result", {
          name,
          time: this.result.time,
          reshuffles: this.result.reshuffles,
          hints: this.result.hints,
          difficulty: this.result.difficulty,
          mode: this.result.mode,
          layout: this.result.layout,
          day: this.result.day,
        });
        this.status = "sent";
      } catch {
        this.status = "error";
      }
    },
  },
};
</script>

<template>
  <div>
  <div class="confetti" aria-hidden="true">
    <i v-for="(c, i) in confetti" :key="i" :style="{
      left: c.left + '%',
      background: c.color,
      animationDelay: c.delay + 's',
      animationDuration: c.duration + 's',
      transform: `rotate(${c.rotate}deg)`,
    }"></i>
  </div>
  <Modal width="30rem" :closable="false">
    <div class="text-center">
      <div class="trophy">🏆</div>
      <h2 class="text-2xl font-extrabold">Победа!</h2>
      <p class="text-white/60 text-sm mt-1">{{ subtitle }}</p>
      <div v-if="result.newRecord" class="record">🎉 Новый личный рекорд!</div>
    </div>

    <div class="grid grid-cols-3 gap-2 my-5">
      <div class="tile-stat">
        <div class="val">{{ formatTime(result.time) }}</div>
        <div class="lbl">время</div>
      </div>
      <div class="tile-stat">
        <div class="val">{{ result.hints }}</div>
        <div class="lbl">подсказок</div>
      </div>
      <div class="tile-stat">
        <div class="val">{{ result.reshuffles }}</div>
        <div class="lbl">перемешиваний</div>
      </div>
    </div>
    <p v-if="result.timeLeft !== null" class="text-center text-sm text-white/70 -mt-2 mb-4">
      В запасе осталось <b class="text-emerald-300">{{ formatTime(result.timeLeft) }}</b>
    </p>

    <div v-if="result.unlocked.length" class="mb-5">
      <div class="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Новые достижения</div>
      <div class="flex flex-col gap-2">
        <div v-for="a in result.unlocked" :key="a.id" class="achievement">
          <span class="text-2xl">{{ a.icon }}</span>
          <div>
            <div class="font-semibold text-sm">{{ a.name }}</div>
            <div class="text-xs text-white/60">{{ a.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <form v-if="mode.ranked" class="mb-4" @submit.prevent="send">
      <label for="nickname" class="block text-sm mb-2 text-white/80">Попасть в таблицу лидеров</label>
      <div class="flex gap-2">
        <input id="nickname" v-model="nickname" maxlength="20" placeholder="Ваше имя" autocomplete="nickname"
          :disabled="status === 'sent'" class="input" />
        <button type="submit" class="btn btn-primary" :disabled="!canSend">
          {{ status === "sending" ? "…" : status === "sent" ? "✓" : "Отправить" }}
        </button>
      </div>
      <p v-if="status === 'sent'" class="text-emerald-300 text-sm mt-2">
        Результат сохранён!
        <button type="button" class="underline" @click="$emit('leaders')">Посмотреть таблицу</button>
      </p>
      <p v-if="status === 'error'" class="text-red-300 text-sm mt-2">
        Не удалось связаться с сервером. Попробуйте ещё раз.
      </p>
    </form>
    <p v-else class="text-sm text-white/60 text-center mb-4">В режиме «Дзен» результаты не соревнуются — просто кайфуйте 🍃</p>

    <div class="grid grid-cols-2 gap-2">
      <button class="btn btn-ghost" @click="$emit('restart')">🔁 Эту же раскладку</button>
      <button class="btn btn-primary" @click="$emit('menu')">▶ Новая игра</button>
    </div>
  </Modal>
  </div>
</template>

<style scoped>
.trophy {
  font-size: 3.5rem;
  animation: bounce 1.2s ease infinite;
}

@keyframes bounce {
  50% {
    transform: translateY(-8px) scale(1.05);
  }
}

.record {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.2);
  color: #fde68a;
  font-weight: 600;
  font-size: 0.85rem;
}

.tile-stat {
  text-align: center;
  padding: 0.75rem 0.25rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.06);
}

.val {
  font-size: 1.35rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.lbl {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
}

.achievement {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.05));
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.input {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.8rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  outline: none;
}

.input:focus {
  border-color: var(--gold);
}

.confetti {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  overflow: hidden;
}

.confetti i {
  position: absolute;
  top: -20px;
  width: 9px;
  height: 14px;
  border-radius: 2px;
  animation: fall linear forwards;
}

@keyframes fall {
  to {
    top: 110vh;
    transform: rotate(720deg) translateX(40px);
  }
}
</style>
