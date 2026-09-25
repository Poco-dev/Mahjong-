<script>
import Modal from "@/components/Modal.vue";
import MiniLayout from "@/components/MiniLayout.vue";
import Avatar from "@/components/Avatar.vue";
import { MODES, TIME_LIMITS, TIMED_BONUS, dailySetup, formatTime } from "@/services/Modes.js";
import { LAYOUTS, DIFFICULTIES } from "@/services/FigureService.js";
import { levelInfo, bestKey } from "@/services/Profile.js";

const KEY = "mahjong.lastSetup";

export default {
  name: "StartGame",
  components: { Modal, MiniLayout, Avatar },
  props: {
    profile: { type: Object, required: true },
    canContinue: Boolean,
  },
  emits: ["start", "continue", "profile", "leaders", "help"],
  data() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      /* пусто */
    }
    return {
      mode: MODES[saved.mode] ? saved.mode : "classic",
      layout: LAYOUTS[saved.layout] ? saved.layout : "turtle",
      difficulty: DIFFICULTIES[saved.difficulty] ? saved.difficulty : "medium",
      modes: MODES,
      layouts: LAYOUTS,
      difficulties: DIFFICULTIES,
      daily: dailySetup(),
    };
  },
  computed: {
    level() {
      return levelInfo(this.profile.xp);
    },
    isDaily() {
      return this.mode === "daily";
    },
    dailyDone() {
      return this.profile.dailyDone.includes(this.daily.day);
    },
    effective() {
      return this.isDaily
        ? { layout: this.daily.layout, difficulty: this.daily.difficulty }
        : { layout: this.layout, difficulty: this.difficulty };
    },
    best() {
      if (this.mode === "zen") return null;
      return this.profile.best[bestKey(this.mode, this.effective.layout, this.effective.difficulty)] || null;
    },
    timedNote() {
      return `Старт: ${formatTime(TIME_LIMITS[this.difficulty])}, +${TIMED_BONUS} с за пару`;
    },
  },
  methods: {
    formatTime,
    start() {
      try {
        localStorage.setItem(KEY, JSON.stringify({ mode: this.mode, layout: this.layout, difficulty: this.difficulty }));
      } catch {
        /* не страшно */
      }
      this.$emit("start", { mode: this.mode, layout: this.layout, difficulty: this.difficulty });
    },
  },
};
</script>

<template>
  <Modal width="46rem" :closable="false">
    <div class="flex items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Авто-Маджонг <span class="text-amber-300">🀄</span>
        </h1>
        <p class="text-white/60 text-sm">Собирайте пары одинаковых автомобильных эмблем</p>
      </div>
      <button class="player" @click="$emit('profile')">
        <Avatar :type="profile.avatar" :size="40" />
        <div class="text-left leading-tight hidden sm:block">
          <div class="font-semibold text-sm max-w-[9rem] truncate">{{ profile.nickname || "Гость" }}</div>
          <div class="text-xs text-amber-300">Ур. {{ level.level }} · {{ level.rank }}</div>
        </div>
      </button>
    </div>

    <section class="mb-5">
      <h2 class="section-title">Режим</h2>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="m in modes" :key="m.id" class="choice" :class="{ active: mode === m.id }" @click="mode = m.id">
          <div class="flex items-center gap-2 font-semibold">
            <span class="text-xl">{{ m.icon }}</span>{{ m.name }}
            <span v-if="m.id === 'daily' && dailyDone" class="ml-auto text-xs text-emerald-300">✓ пройден</span>
          </div>
          <p class="text-xs text-white/60 mt-1 hidden sm:block">{{ m.description }}</p>
        </button>
      </div>
    </section>

    <div v-if="isDaily" class="daily mb-5">
      <div class="w-24 h-16 shrink-0">
        <MiniLayout :positions="layouts[daily.layout].positions" />
      </div>
      <div class="text-sm">
        <div class="font-semibold">Вызов на {{ daily.day }}</div>
        <div class="text-white/70">
          {{ layouts[daily.layout].icon }} {{ layouts[daily.layout].name }} ·
          {{ difficulties[daily.difficulty].name }} — одна раскладка для всех игроков.
        </div>
      </div>
    </div>

    <template v-else>
      <section class="mb-5">
        <h2 class="section-title">Раскладка</h2>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="l in layouts" :key="l.id" class="choice layout" :class="{ active: layout === l.id }"
            @click="layout = l.id">
            <div class="h-14 sm:h-20 mb-2 px-1">
              <MiniLayout :positions="l.positions" />
            </div>
            <div class="text-sm font-semibold">{{ l.icon }} {{ l.name }}</div>
          </button>
        </div>
      </section>

      <section class="mb-5">
        <h2 class="section-title">Сложность</h2>
        <div class="segmented">
          <button v-for="d in difficulties" :key="d.id" :class="{ active: difficulty === d.id }"
            @click="difficulty = d.id">
            {{ d.name }}
          </button>
        </div>
        <p class="text-xs text-white/50 mt-2">
          {{ difficulties[difficulty].note }}<template v-if="mode === 'timed'"> · {{ timedNote }}</template>
        </p>
      </section>
    </template>

    <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <button class="btn btn-primary text-base py-3 flex-1" @click="start">
        ▶ {{ isDaily && dailyDone ? "Сыграть ещё раз" : "Начать игру" }}
      </button>
      <button v-if="canContinue" class="btn btn-ghost py-3" @click="$emit('continue')">Продолжить</button>
      <button class="btn btn-ghost py-3" @click="$emit('leaders')">🏆 Лидеры</button>
    </div>
    <p class="text-xs text-white/50 mt-3 flex justify-between gap-2 flex-wrap">
      <span>Каждая раскладка гарантированно решаема 🧩</span>
      <span v-if="best">Ваш рекорд: <b class="text-amber-300">{{ formatTime(best) }}</b></span>
      <button v-else class="underline decoration-dotted hover:text-white" @click="$emit('help')">Как играть?</button>
    </p>
  </Modal>
</template>

<style scoped>
.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.choice {
  text-align: left;
  padding: 0.75rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.15s, background-color 0.15s, transform 0.12s;
}

.choice:hover {
  background: rgba(255, 255, 255, 0.09);
}

.choice:active {
  transform: scale(0.98);
}

.choice.active {
  border-color: var(--gold);
  background: rgba(251, 191, 36, 0.12);
}

.choice.layout {
  text-align: center;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 0.25rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.06);
}

.segmented button {
  padding: 0.55rem;
  border-radius: 0.7rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  transition: background-color 0.15s, color 0.15s;
}

.segmented button.active {
  background: var(--gold);
  color: #1c1917;
}

.daily {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem;
  border-radius: 0.9rem;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.15));
  border: 1px solid rgba(147, 197, 253, 0.25);
}

.player {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.8rem 0.35rem 0.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.15s;
  flex: none;
}

.player:hover {
  background: rgba(255, 255, 255, 0.14);
}

@media (max-width: 640px) {
  .player {
    padding: 0.2rem;
  }
}
</style>
