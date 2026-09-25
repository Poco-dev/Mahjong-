<script>
import Header from "@/components/Header.vue";
import Toolbar from "@/components/Toolbar.vue";
import Board from "@/components/Board.vue";
import Lose from "@/components/Lose.vue";
import Win from "@/components/Win.vue";
import LeaderBoard from "@/components/LeaderBoard.vue";
import StartGame from "@/components/StartGame.vue";
import PlayerCard from "@/components/PlayerCard.vue";
import Help from "@/components/Help.vue";
import FigureService, { LAYOUTS } from "@/services/FigureService.js";
import { availableMoves, freeTiles } from "@/services/BoardLogic.js";
import { TIME_LIMITS, TIMED_BONUS, dailySetup } from "@/services/Modes.js";
import { loadProfile, saveProfile, recordStart, recordPairs, recordWin, recordLoss } from "@/services/Profile.js";
import Rnd from "@/services/Rnd.js";
import Sound from "@/services/Sound.js";

const SETTINGS_KEY = "mahjong.settings";

function loadSettings() {
  try {
    return { highlightFree: false, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return { highlightFree: false };
  }
}

export default {
  components: { StartGame, Board, Header, Toolbar, Lose, Win, LeaderBoard, PlayerCard, Help },
  data() {
    return {
      screen: "menu", // menu | game | win | lose
      overlay: null, // leaders | profile | help
      game: null, // { mode, layout, difficulty, day }
      gameId: 0,
      tiles: [],
      initialTiles: [],
      history: [],
      chosen: null,
      isShowHint: false,
      hints: 0,
      reshuffles: 0,
      undos: 0,
      elapsed: 0,
      loseReason: null,
      result: null,
      profile: loadProfile(),
      settings: loadSettings(),
      soundOn: Sound.enabled,
      toast: null,
      shakeId: null,
    };
  },
  computed: {
    moves() {
      return availableMoves(this.tiles);
    },
    freeIds() {
      return new Set(freeTiles(this.tiles).map((e) => e.id));
    },
    hintIds() {
      return this.isShowHint && this.moves.hint ? this.moves.hint.map((e) => e.id) : [];
    },
    totalPairs() {
      return this.initialTiles.length / 2;
    },
    pairsLeft() {
      return this.tiles.length / 2;
    },
    timeLeft() {
      if (!this.game || this.game.mode !== "timed") return null;
      return TIME_LIMITS[this.game.difficulty] + this.history.length * TIMED_BONUS - this.elapsed;
    },
    paused() {
      return this.screen !== "game" || this.overlay !== null;
    },
    positions() {
      return this.game ? LAYOUTS[this.game.layout].positions : [];
    },
  },
  methods: {
    startNewGame(setup) {
      let random = Math.random;
      let game = { ...setup, day: null };
      if (setup.mode === "daily") {
        const daily = dailySetup();
        game = { mode: "daily", layout: daily.layout, difficulty: daily.difficulty, day: daily.day };
        random = Rnd.seeded(`mahjong-${daily.day}`);
      }
      this.game = game;
      this.initialTiles = FigureService.deal(game.layout, game.difficulty, random);
      recordStart(this.profile);
      this.resetBoard();
    },
    resetBoard() {
      this.tiles = this.initialTiles.map((e) => ({ ...e }));
      this.history = [];
      this.chosen = null;
      this.isShowHint = false;
      this.hints = 0;
      this.reshuffles = 0;
      this.undos = 0;
      this.elapsed = 0;
      this.loseReason = null;
      this.result = null;
      this.overlay = null;
      this.gameId++;
      this.screen = "game";
    },
    restartSame() {
      if (!this.game) return;
      this.resetBoard();
      this.showToast("Та же раскладка — с чистого листа");
    },
    toMenu() {
      this.overlay = null;
      this.screen = "menu";
    },
    checkGame() {
      if (this.tiles.length === 0) {
        this.finishWin();
      } else if (this.moves.pairs === 0) {
        if (this.game.mode === "zen") {
          this.zenRescue();
        } else {
          Sound.lose();
          this.loseReason = "stuck";
          this.screen = "lose";
        }
      }
    },
    chooseTile(tile) {
      if (this.paused) return;
      if (!this.freeIds.has(tile.id)) {
        this.shakeId = tile.id;
        setTimeout(() => (this.shakeId = null), 350);
        Sound.wrong();
        return;
      }
      this.isShowHint = false;
      if (this.chosen && this.chosen.id === tile.id) {
        this.chosen = null;
      } else if (this.chosen && this.chosen.type === tile.type) {
        this.removePair(this.chosen, tile);
      } else {
        this.chosen = tile;
        Sound.select();
      }
    },
    removePair(a, b) {
      this.tiles = this.tiles.filter((e) => e.id !== a.id && e.id !== b.id);
      this.history.push([a, b]);
      this.chosen = null;
      recordPairs(this.profile, 1);
      Sound.match();
      this.checkGame();
    },
    revert() {
      if (this.history.length === 0 || this.loseReason === "timeout") return;
      const pair = this.history.pop();
      this.tiles = [...this.tiles, ...pair].sort((a, b) => a.id - b.id);
      this.undos++;
      this.chosen = null;
      this.isShowHint = false;
      this.screen = "game";
      this.loseReason = null;
    },
    showHint() {
      if (this.screen !== "game" || !this.moves.hint) return;
      if (!this.isShowHint) this.hints++;
      this.isShowHint = true;
    },
    reshuffle() {
      if (!this.game || this.tiles.length === 0 || this.loseReason === "timeout") return;
      const { tiles, solvable } = FigureService.reshuffle(this.tiles);
      this.tiles = tiles;
      this.chosen = null;
      this.isShowHint = false;
      this.reshuffles++;
      Sound.shuffle();
      this.screen = "game";
      this.loseReason = null;
      if (!solvable) this.showToast("Эту позицию уже не решить — попробуйте отменить ходы");
      if (this.moves.pairs === 0 && this.tiles.length > 0) {
        this.loseReason = "stuck";
        this.screen = "lose";
      }
    },
    // В «Дзене» не проигрывают: перемешиваем, а если позиция нерешаема — тихо откатываем ходы.
    zenRescue() {
      let res = FigureService.reshuffle(this.tiles);
      let undone = 0;
      while (!res.solvable && this.history.length) {
        this.tiles = [...this.tiles, ...this.history.pop()].sort((a, b) => a.id - b.id);
        res = FigureService.reshuffle(this.tiles);
        undone++;
      }
      this.tiles = res.tiles;
      this.chosen = null;
      this.isShowHint = false;
      Sound.shuffle();
      this.showToast(undone ? `Тупик — вернули ${undone} ход(а) и перемешали 🍃` : "Ходов не было — перемешали за вас 🍃");
    },
    finishWin() {
      Sound.win();
      const stats = {
        mode: this.game.mode,
        layout: this.game.layout,
        difficulty: this.game.difficulty,
        day: this.game.day,
        time: this.elapsed,
        hints: this.hints,
        reshuffles: this.reshuffles,
        undos: this.undos,
      };
      const { unlocked, newRecord } = recordWin(this.profile, stats);
      this.result = { ...stats, unlocked, newRecord, timeLeft: this.timeLeft };
      this.screen = "win";
    },
    tick() {
      if (this.paused || document.hidden) return;
      this.elapsed++;
      if (this.timeLeft !== null && this.timeLeft <= 0) {
        Sound.lose();
        this.loseReason = "timeout";
        this.chosen = null;
        this.screen = "lose";
        recordLoss(this.profile, { time: this.elapsed });
      }
    },
    toggleOverlay(name) {
      this.overlay = this.overlay === name ? null : name;
    },
    toggleSound() {
      this.soundOn = Sound.toggle();
    },
    toggleHighlight() {
      this.settings.highlightFree = !this.settings.highlightFree;
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch {
        /* не страшно */
      }
    },
    updateProfile(changes) {
      Object.assign(this.profile, changes);
      saveProfile(this.profile);
    },
    resetProfile() {
      localStorage.removeItem("mahjong.profile.v1");
      this.profile = loadProfile();
      this.showToast("Карточка игрока сброшена");
    },
    showToast(text) {
      this.toast = text;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => (this.toast = null), 2600);
    },
    onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const key = e.key.toLowerCase();
      if (key === "escape") {
        if (this.overlay) this.overlay = null;
        else this.chosen = null;
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (key === "z" || key === "я") {
          e.preventDefault();
          this.revert();
        }
        return;
      }
      const inGame = this.screen === "game" && !this.overlay;
      const actions = {
        z: () => (inGame || this.screen === "lose") && this.revert(),
        h: () => inGame && this.showHint(),
        s: () => (inGame || this.loseReason === "stuck") && this.reshuffle(),
        r: () => this.game && this.restartSame(),
        n: () => this.toMenu(),
        l: () => this.toggleOverlay("leaders"),
        p: () => this.toggleOverlay("profile"),
        "?": () => this.toggleOverlay("help"),
        m: () => this.toggleSound(),
        f: () => this.toggleHighlight(),
      };
      // Русская раскладка: я=z, р=h, ы=s, к=r, т=n, д=l, з=p, ь=m, а=f
      const ru = { я: "z", р: "h", ы: "s", к: "r", т: "n", д: "l", з: "p", ь: "m", а: "f", ",": "?" };
      const action = actions[ru[key] || key];
      if (action) {
        e.preventDefault();
        action();
      }
    },
  },
  mounted() {
    this.timer = setInterval(this.tick, 1000);
    window.addEventListener("keydown", this.onKey);
  },
  beforeUnmount() {
    clearInterval(this.timer);
    window.removeEventListener("keydown", this.onKey);
  },
};
</script>

<template>
  <div class="app">
    <Header
      :game="game"
      :active="screen !== 'menu' && game !== null"
      :elapsed="elapsed"
      :time-left="timeLeft"
      :pairs-left="pairsLeft"
      :total-pairs="totalPairs"
      :moves="moves.pairs"
      :profile="profile"
      :sound-on="soundOn"
      :highlight-free="settings.highlightFree"
      @leaders="toggleOverlay('leaders')"
      @profile="toggleOverlay('profile')"
      @help="toggleOverlay('help')"
      @sound="toggleSound"
      @highlight="toggleHighlight"
    />

    <main class="stage">
      <Board
        v-if="game"
        :key="gameId"
        :tiles="tiles"
        :positions="positions"
        :free-ids="freeIds"
        :chosen-id="chosen ? chosen.id : null"
        :hint-ids="hintIds"
        :shake-id="shakeId"
        :highlight-free="settings.highlightFree"
        :dimmed="paused"
        @choose="chooseTile"
      />
    </main>

    <Toolbar
      v-if="game && screen !== 'menu'"
      :can-undo="history.length > 0"
      :disabled="screen !== 'game'"
      :hints="hints"
      :reshuffles="reshuffles"
      @revert="revert"
      @hint="showHint"
      @reshuffle="reshuffle()"
      @restart="restartSame"
      @menu="toMenu"
    />

    <Transition name="pop">
      <StartGame
        v-if="screen === 'menu' && !overlay"
        :profile="profile"
        :can-continue="game !== null && tiles.length > 0 && !loseReason"
        @start="startNewGame"
        @continue="screen = 'game'"
        @profile="overlay = 'profile'"
        @leaders="overlay = 'leaders'"
        @help="overlay = 'help'"
      />
    </Transition>
    <Transition name="pop">
      <Lose
        v-if="screen === 'lose' && !overlay"
        :reason="loseReason"
        :can-undo="history.length > 0"
        :pairs-left="pairsLeft"
        @revert="revert"
        @reshuffle="reshuffle()"
        @restart="restartSame"
        @menu="toMenu"
      />
    </Transition>
    <Transition name="pop">
      <Win
        v-if="screen === 'win' && !overlay"
        :result="result"
        :profile="profile"
        @restart="restartSame"
        @menu="toMenu"
        @leaders="overlay = 'leaders'"
        @nickname="updateProfile({ nickname: $event })"
      />
    </Transition>
    <Transition name="pop">
      <LeaderBoard
        v-if="overlay === 'leaders'"
        :initial-mode="game && game.mode !== 'zen' ? game.mode : 'classic'"
        :initial-layout="game ? game.layout : 'turtle'"
        :nickname="profile.nickname"
        @escape="overlay = null"
      />
    </Transition>
    <Transition name="pop">
      <PlayerCard
        v-if="overlay === 'profile'"
        :profile="profile"
        @update="updateProfile"
        @reset="resetProfile"
        @escape="overlay = null"
      />
    </Transition>
    <Transition name="pop">
      <Help v-if="overlay === 'help'" @escape="overlay = null" />
    </Transition>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style>
:root {
  --felt: #0b5d4b;
  --felt-dark: #06372d;
  --gold: #f5c451;
}

* {
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background-color: var(--felt-dark);
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #f8fafc;
  overscroll-behavior: none;
}

body {
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.08), transparent 60%),
    radial-gradient(ellipse at center, var(--felt) 0%, var(--felt-dark) 100%) fixed;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.stage {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
}

.panel {
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: transform 0.12s, background-color 0.15s, opacity 0.15s, box-shadow 0.15s;
  user-select: none;
}

.btn:active:not(:disabled) {
  transform: scale(0.96);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1c1917;
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.35);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #fcd34d, #fbbf24);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
}

.kbd {
  display: inline-block;
  min-width: 1.3em;
  padding: 0 0.3em;
  border-radius: 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom-width: 2px;
  font-size: 0.7rem;
  line-height: 1.4;
  text-align: center;
  opacity: 0.75;
  font-family: ui-monospace, monospace;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s ease;
}

.pop-enter-active .modal-card,
.pop-leave-active .modal-card {
  transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}

.pop-enter-from .modal-card,
.pop-leave-to .modal-card {
  transform: scale(0.92) translateY(12px);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 6rem;
  transform: translateX(-50%);
  z-index: 80;
  padding: 0.7rem 1.1rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.9rem;
  white-space: nowrap;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
