<script>
import Modal from "@/components/Modal.vue";
import Avatar from "@/components/Avatar.vue";
import { ACHIEVEMENTS, levelInfo } from "@/services/Profile.js";
import { MODES, formatTime } from "@/services/Modes.js";
import { LAYOUTS, DIFFICULTIES } from "@/services/FigureService.js";
import { TILES } from "@/services/TileSet.js";

export default {
  name: "PlayerCard",
  components: { Modal, Avatar },
  props: {
    profile: { type: Object, required: true },
  },
  emits: ["update", "reset", "escape"],
  data() {
    return {
      nickname: this.profile.nickname,
      pickingAvatar: false,
      confirmReset: false,
      tiles: TILES,
    };
  },
  computed: {
    level() {
      return levelInfo(this.profile.xp);
    },
    winRate() {
      return this.profile.games ? Math.round((this.profile.wins / this.profile.games) * 100) : 0;
    },
    stats() {
      const p = this.profile;
      return [
        { label: "Партий", value: p.games },
        { label: "Побед", value: p.wins },
        { label: "Процент побед", value: this.winRate + "%" },
        { label: "Серия / лучшая", value: `${p.streak} / ${p.bestStreak}` },
        { label: "Пар собрано", value: p.pairs },
        { label: "В игре", value: this.playTime },
      ];
    },
    playTime() {
      const minutes = Math.round(this.profile.playTime / 60);
      return minutes >= 60 ? `${Math.floor(minutes / 60)} ч ${minutes % 60} мин` : `${minutes} мин`;
    },
    records() {
      return Object.entries(this.profile.best)
        .map(([key, time]) => {
          const [mode, layout, difficulty] = key.split(":");
          return { key, time, mode: MODES[mode], layout: LAYOUTS[layout], difficulty: DIFFICULTIES[difficulty] };
        })
        .filter((r) => r.mode && r.layout && r.difficulty)
        .sort((a, b) => a.time - b.time)
        .slice(0, 6);
    },
    achievements() {
      return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: Boolean(this.profile.achievements[a.id]) }));
    },
    unlockedCount() {
      return this.achievements.filter((a) => a.unlocked).length;
    },
    memberSince() {
      return new Date(this.profile.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    },
  },
  methods: {
    formatTime,
    saveName() {
      const name = this.nickname.trim().slice(0, 20);
      if (name !== this.profile.nickname) this.$emit("update", { nickname: name });
    },
    pick(type) {
      this.$emit("update", { avatar: type });
      this.pickingAvatar = false;
    },
    reset() {
      if (!this.confirmReset) {
        this.confirmReset = true;
        return;
      }
      this.$emit("reset");
      this.nickname = "";
      this.confirmReset = false;
    },
  },
};
</script>

<template>
  <Modal width="40rem" @close="saveName(); $emit('escape')">
    <div class="card-head">
      <button class="avatar-btn" title="Сменить аватар" @click="pickingAvatar = !pickingAvatar">
        <Avatar :type="profile.avatar" :size="84" />
        <span class="edit">✎</span>
      </button>
      <div class="min-w-0 flex-1">
        <input v-model="nickname" class="name-input" maxlength="20" placeholder="Введите имя" @blur="saveName"
          @keyup.enter="$event.target.blur()" />
        <div class="text-sm text-amber-300 font-semibold">Уровень {{ level.level }} · {{ level.rank }}</div>
        <div class="xp">
          <div class="xp-fill" :style="{ width: level.progress * 100 + '%' }"></div>
        </div>
        <div class="text-xs text-white/50 mt-1">{{ profile.xp }} XP · до следующего уровня {{ level.toNext }} XP</div>
      </div>
    </div>

    <div v-if="pickingAvatar" class="avatars">
      <button v-for="t in tiles" :key="t.type" :title="t.name" :class="{ active: profile.avatar === t.type }"
        @click="pick(t.type)">
        <Avatar :type="t.type" :size="42" />
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2 my-5">
      <div v-for="s in stats" :key="s.label" class="stat">
        <div class="val">{{ s.value }}</div>
        <div class="lbl">{{ s.label }}</div>
      </div>
    </div>

    <section class="mb-5">
      <h3 class="section-title">Личные рекорды</h3>
      <div v-if="!records.length" class="text-sm text-white/50">Выиграйте партию, чтобы здесь появился рекорд.</div>
      <div v-else class="grid sm:grid-cols-2 gap-2">
        <div v-for="r in records" :key="r.key" class="record">
          <span class="text-lg">{{ r.mode.icon }}</span>
          <div class="flex-1 min-w-0 text-sm leading-tight">
            <div class="truncate">{{ r.layout.name }} · {{ r.difficulty.name }}</div>
            <div class="text-xs text-white/50">{{ r.mode.name }}</div>
          </div>
          <b class="tabular-nums">{{ formatTime(r.time) }}</b>
        </div>
      </div>
    </section>

    <section class="mb-5">
      <h3 class="section-title">Достижения · {{ unlockedCount }}/{{ achievements.length }}</h3>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div v-for="a in achievements" :key="a.id" class="badge" :class="{ locked: !a.unlocked }"
          :title="a.description">
          <div class="text-2xl">{{ a.unlocked ? a.icon : "🔒" }}</div>
          <div class="text-xs font-semibold leading-tight mt-1">{{ a.name }}</div>
          <div class="text-[10px] text-white/50 leading-tight mt-0.5">{{ a.description }}</div>
        </div>
      </div>
    </section>

    <div class="flex items-center justify-between text-xs text-white/40 gap-2 flex-wrap">
      <span>Играет с {{ memberSince }}</span>
      <button class="reset" :class="{ confirm: confirmReset }" @click="reset" @blur="confirmReset = false">
        {{ confirmReset ? "Точно сбросить? Нажмите ещё раз" : "Сбросить статистику" }}
      </button>
    </div>
  </Modal>
</template>

<style scoped>
.card-head {
  display: flex;
  gap: 1.1rem;
  align-items: center;
  padding: 1rem;
  margin: -0.25rem -0.25rem 0;
  border-radius: 1rem;
  background:
    radial-gradient(circle at 0% 0%, rgba(251, 191, 36, 0.25), transparent 55%),
    linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.avatar-btn {
  position: relative;
  flex: none;
  border-radius: 999px;
  border: 3px solid var(--gold);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.edit {
  position: absolute;
  right: -0.2rem;
  bottom: -0.2rem;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: var(--gold);
  color: #1c1917;
  font-size: 0.8rem;
  line-height: 1.6rem;
}

.name-input {
  width: 100%;
  margin-right: 2rem;
  background: transparent;
  border: none;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.25);
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  outline: none;
  padding: 0 0 0.1rem;
}

.name-input:focus {
  border-bottom-color: var(--gold);
}

.xp {
  height: 8px;
  margin-top: 0.5rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.xp-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #fbbf24, #f97316);
  transition: width 0.5s ease;
}

.avatars {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 0.35rem;
  margin-top: 1rem;
  padding: 0.6rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  max-height: 11rem;
  overflow-y: auto;
}

.avatars button {
  display: flex;
  justify-content: center;
  padding: 0.15rem;
  border-radius: 999px;
  border: 2px solid transparent;
  transition: transform 0.12s;
}

.avatars button:hover {
  transform: scale(1.1);
}

.avatars button.active {
  border-color: var(--gold);
}

.stat {
  padding: 0.7rem 0.4rem;
  text-align: center;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.06);
}

.val {
  font-size: 1.15rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.lbl {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
}

.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.record {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
}

.badge {
  padding: 0.6rem 0.4rem;
  border-radius: 0.8rem;
  text-align: center;
  background: linear-gradient(160deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.04));
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.locked {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
  opacity: 0.55;
}

.reset {
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  transition: background-color 0.15s, color 0.15s;
}

.reset:hover,
.reset.confirm {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}
</style>
