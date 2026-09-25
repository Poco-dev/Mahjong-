<script>
import axios from "axios";
import Modal from "@/components/Modal.vue";
import { MODES, dailySetup, formatTime } from "@/services/Modes.js";
import { LAYOUTS, DIFFICULTIES } from "@/services/FigureService.js";

const RANKED = Object.values(MODES).filter((m) => m.ranked);

export default {
  name: "LeaderBoard",
  components: { Modal },
  props: {
    initialMode: { type: String, default: "classic" },
    initialLayout: { type: String, default: "turtle" },
    nickname: { type: String, default: "" },
  },
  emits: ["escape"],
  data() {
    return {
      modes: RANKED,
      layouts: LAYOUTS,
      mode: MODES[this.initialMode]?.ranked ? this.initialMode : "classic",
      layout: LAYOUTS[this.initialLayout] ? this.initialLayout : "turtle",
      daily: dailySetup(),
      tables: {},
      loading: false,
      error: false,
    };
  },
  computed: {
    columns() {
      const ids = this.mode === "daily" ? [this.daily.difficulty] : ["hard", "medium", "easy"];
      return ids.map((id) => ({ ...DIFFICULTIES[id], rows: this.tables[id] || [] }));
    },
    query() {
      return this.mode === "daily"
        ? { mode: "daily", layout: this.daily.layout, day: this.daily.day }
        : { mode: this.mode, layout: this.layout };
    },
  },
  watch: {
    query: {
      handler() {
        this.load();
      },
      immediate: true,
    },
  },
  methods: {
    formatTime,
    async load() {
      this.loading = true;
      this.error = false;
      const query = this.query;
      try {
        const results = await Promise.all(
          this.columns.map((c) => axios.get("/users", { params: { ...query, difficulty: c.id } })),
        );
        if (query !== this.query) return;
        this.tables = Object.fromEntries(this.columns.map((c, i) => [c.id, results[i].data]));
      } catch {
        if (query === this.query) this.error = true;
      } finally {
        if (query === this.query) this.loading = false;
      }
    },
    medal(i) {
      return ["🥇", "🥈", "🥉"][i] || i + 1;
    },
  },
};
</script>

<template>
  <Modal width="64rem" @close="$emit('escape')">
    <h2 class="text-2xl font-extrabold mb-4">🏆 Таблица лидеров</h2>

    <div class="flex flex-wrap gap-2 mb-3">
      <button v-for="m in modes" :key="m.id" class="chip" :class="{ active: mode === m.id }" @click="mode = m.id">
        {{ m.icon }} {{ m.name }}
      </button>
    </div>
    <div v-if="mode !== 'daily'" class="flex flex-wrap gap-2 mb-5">
      <button v-for="l in layouts" :key="l.id" class="chip small" :class="{ active: layout === l.id }"
        @click="layout = l.id">
        {{ l.icon }} {{ l.name }}
      </button>
    </div>
    <p v-else class="text-sm text-white/60 mb-5">
      Вызов на {{ daily.day }}: {{ layouts[daily.layout].icon }} {{ layouts[daily.layout].name }}
    </p>

    <div v-if="error" class="state">
      😕 Сервер недоступен. Проверьте, что бэкенд запущен.
      <button class="btn btn-ghost mt-3" @click="load">Повторить</button>
    </div>
    <div v-else class="grid gap-3" :class="columns.length > 1 ? 'md:grid-cols-3' : 'max-w-md mx-auto'">
      <div v-for="c in columns" :key="c.id" class="column" :class="c.id">
        <div class="column-title">{{ c.name }}</div>
        <div v-if="loading" class="py-8 text-center text-white/50 text-sm">Загрузка…</div>
        <div v-else-if="!c.rows.length" class="py-8 text-center text-white/50 text-sm">Пока пусто — станьте первым!</div>
        <ol v-else>
          <li v-for="(p, i) in c.rows" :key="p._id || i" :class="{ me: nickname && p.name === nickname }">
            <span class="place">{{ medal(i) }}</span>
            <span class="name" :title="p.name">{{ p.name }}</span>
            <span class="meta" title="Перемешивания / подсказки">🔀{{ p.reshuffles }}<template v-if="p.hints != null">
                💡{{ p.hints }}</template></span>
            <span class="time">{{ formatTime(p.time) }}</span>
          </li>
        </ol>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.chip {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.15s;
}

.chip.small {
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.14);
}

.chip.active {
  background: var(--gold);
  color: #1c1917;
  border-color: var(--gold);
}

.column {
  border-radius: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border-top: 3px solid;
}

.column.hard {
  border-color: #f87171;
}

.column.medium {
  border-color: #60a5fa;
}

.column.easy {
  border-color: #34d399;
}

.column-title {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.4rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

li:nth-child(odd) {
  background: rgba(255, 255, 255, 0.03);
}

li.me {
  background: rgba(251, 191, 36, 0.15);
}

.place {
  width: 1.6rem;
  text-align: center;
  flex: none;
  color: rgba(255, 255, 255, 0.6);
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.time {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}
</style>
