<script>
import { MODES, formatTime } from "@/services/Modes.js";
import { LAYOUTS, DIFFICULTIES } from "@/services/FigureService.js";
import { levelInfo } from "@/services/Profile.js";
import Avatar from "@/components/Avatar.vue";

export default {
  name: "Header",
  components: { Avatar },
  props: {
    game: Object,
    active: Boolean,
    elapsed: Number,
    timeLeft: Number,
    pairsLeft: Number,
    totalPairs: Number,
    moves: Number,
    profile: Object,
    soundOn: Boolean,
    highlightFree: Boolean,
  },
  emits: ["leaders", "profile", "help", "sound", "highlight"],
  computed: {
    mode() {
      return this.game ? MODES[this.game.mode] : null;
    },
    subtitle() {
      if (!this.game) return "";
      return `${LAYOUTS[this.game.layout].name} · ${DIFFICULTIES[this.game.difficulty].name}`;
    },
    clock() {
      return formatTime(this.timeLeft !== null ? this.timeLeft : this.elapsed);
    },
    urgent() {
      return this.timeLeft !== null && this.timeLeft <= 30;
    },
    progress() {
      return this.totalPairs ? 1 - this.pairsLeft / this.totalPairs : 0;
    },
    level() {
      return levelInfo(this.profile.xp).level;
    },
  },
};
</script>

<template>
  <header class="header">
    <div class="bar">
      <div class="brand" :class="{ playing: active }">
        <span class="logo">🀄</span>
        <div class="leading-tight min-w-0">
          <div class="font-bold tracking-wide text-sm sm:text-base">Авто-Маджонг</div>
          <div v-if="active && mode" class="text-xs text-white/60 truncate">
            {{ mode.icon }} {{ mode.name }} · {{ subtitle }}
          </div>
        </div>
      </div>

      <div v-if="active" class="stats">
        <div v-if="game.mode !== 'zen'" class="stat" :class="{ urgent }" :title="timeLeft !== null ? 'Осталось времени' : 'Время'">
          <span class="stat-icon">{{ timeLeft !== null ? "⏳" : "⏱" }}</span>
          <span class="tabular-nums font-semibold">{{ clock }}</span>
        </div>
        <div class="stat" title="Осталось пар">
          <span class="stat-icon">🀫</span>
          <span class="tabular-nums font-semibold">{{ pairsLeft }}</span>
        </div>
        <div class="stat" :class="{ warn: moves <= 2 }" title="Доступных ходов">
          <span class="stat-icon">🔀</span>
          <span class="tabular-nums font-semibold">{{ moves }}</span>
          <span class="text-white/50 text-xs hidden md:inline">ходов</span>
        </div>
      </div>

      <div class="actions">
        <button class="icon-btn desktop-only" :class="{ on: highlightFree }" title="Подсвечивать свободные плитки (F)"
          @click="$emit('highlight')">💡</button>
        <button class="icon-btn" :title="soundOn ? 'Выключить звук (M)' : 'Включить звук (M)'" @click="$emit('sound')">
          {{ soundOn ? "🔊" : "🔇" }}
        </button>
        <button class="icon-btn desktop-only" title="Правила и клавиши (?)" @click="$emit('help')">❔</button>
        <button class="icon-btn" title="Таблица лидеров (L)" @click="$emit('leaders')">🏆</button>
        <button class="profile-btn" title="Карточка игрока (P)" @click="$emit('profile')">
          <Avatar :type="profile.avatar" :size="36" />
          <span class="lvl">{{ level }}</span>
        </button>
      </div>
    </div>
    <div v-if="active" class="progress">
      <div class="progress-fill" :style="{ width: progress * 100 + '%' }"></div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: relative;
  z-index: 20;
  background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  min-height: 3.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  flex: 1 1 0;
}

.logo {
  font-size: 1.6rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}

.stats {
  display: flex;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.95rem;
}

.stat-icon {
  font-size: 0.85rem;
  opacity: 0.85;
}

.stat.warn {
  background: rgba(251, 191, 36, 0.18);
}

.stat.urgent {
  background: rgba(239, 68, 68, 0.35);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  50% {
    background: rgba(239, 68, 68, 0.6);
  }
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
  flex: 1 1 0;
}

.icon-btn {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.7rem;
  transition: background-color 0.15s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.icon-btn.on {
  background: rgba(251, 191, 36, 0.25);
}

.profile-btn {
  position: relative;
  margin-left: 0.25rem;
  border-radius: 999px;
  border: 2px solid var(--gold);
  transition: transform 0.15s;
}

.profile-btn:hover {
  transform: scale(1.06);
}

.lvl {
  position: absolute;
  right: -0.35rem;
  bottom: -0.3rem;
  min-width: 1.2rem;
  padding: 0 0.2rem;
  border-radius: 999px;
  background: var(--gold);
  color: #1c1917;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1.2rem;
}

.progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, var(--gold));
  transition: width 0.4s ease;
}

@media (max-width: 640px) {
  .bar {
    padding: 0.4rem 0.6rem;
    gap: 0.4rem;
  }

  .brand .leading-tight,
  .brand.playing,
  .desktop-only {
    display: none;
  }

  .brand {
    flex: 0 0 auto;
  }

  .stat {
    padding: 0.25rem 0.55rem;
    font-size: 0.85rem;
  }
}
</style>
