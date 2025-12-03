<script>
import Header from "@/components/Header.vue";
import Board from "@/components/Board.vue";
import FigureService from "@/services/FigureService.js";
import Lose from "./components/Lose.vue";
import Win from "./components/Win.vue";
import LeaderBoard from "./components/LeaderBoard.vue";
import axios from "axios";
import Rnd from "@/services/Rnd.js";
import StartGame from "@/components/StartGame.vue";

export default {
  components: {
    StartGame,
    Board,
    Header,
    Lose,
    Win,
    LeaderBoard
  },
  data() {
    return {
      tiles: [],
      deleted: [],
      moves: [],
      start: false,
      chosen: undefined,
      gameStatus: "startGame",
      hint: [],
      isShowHint: false,
      countReshuffles: 0,
      isLeaderBoard: false,
    }
  },
  methods: {
    checkGame() {
      this.chosen = undefined
      if (this.tiles.length === 0) {
        this.gameStatus = "win"
      } else {
        const dict = {}
        for (const tile of this.tiles) {
          if (this.isSelectable(tile)) {
            if (dict[tile.type] === undefined) {
              dict[tile.type] = [tile]
            } else {
              dict[tile.type].push(tile)
            }
          }
        }
        for (let i = 0; i < 52; i++) {
          if (dict[i] && dict[i].length >= 2) {
            this.hint = [dict[i][0], dict[i][1]]
            this.gameStatus = "game"
            return
          }
        }
        this.gameStatus = "lose"
      }
    },
    chooseTile(tile) {
      console.log(tile)
      if (this.chosen) {
        if (this.chosen === tile) {
          this.chosen = undefined
        } else if (this.chosen.type === tile.type) {
          this.deleteTiles([this.chosen, tile])
          this.chosen = undefined
        } else {
          this.chosen = tile
        }
      } else {
        this.chosen = tile
      }
      this.isShowHint = false
    },
    deleteTiles(tiles) {
      let tile1 = tiles[0];
      let tile2 = tiles[1];
      this.tiles = this.tiles.filter((e) => e !== tile1 && e !== tile2)
      this.deleted.push(tile1)
      this.deleted.push(tile2)
      this.checkGame()
    },
    revert() {
      if (this.deleted.length > 0) {
        this.tiles.push(this.deleted[this.deleted.length - 1])
        this.deleted.pop()
        this.tiles.push(this.deleted[this.deleted.length - 1])
        this.deleted.pop()
        this.checkGame()
        this.isShowHint = false
      }
    },
    isSelectable(tile) {
      let left = false, right = false, up = false;
      this.tiles.map((e) => {
        if (e.z === tile.z && e.x === tile.x + 1 && Math.abs(e.y - tile.y) < 1) {
          right = true
        } else if (e.z === tile.z && e.x === tile.x - 1 && Math.abs(e.y - tile.y) < 1) {
          left = true
        } else if (e.z === tile.z + 1 && Math.abs(e.x - tile.x) < 1 && Math.abs(e.y - tile.y) < 1) {
          up = true
        }
      })
      return !up && !(left && right)
    },
    showHint() {
      this.isShowHint = true
    },
    startNewGame(difficulty) {
      this.tiles = FigureService.getTurtle(difficulty)
      this.deleted = []
      this.checkGame()
      this.isShowHint = false
      window.localStorage.setItem('time', "null")
    },
    revertGame() {
      for (const tile of this.deleted) {
        this.tiles.push(tile)
      }
      this.deleted = []
      this.checkGame()
      this.isShowHint = false
      window.localStorage.setItem('time', 'null')
    },
    reshuffle() {
      const types = this.tiles.map((e) => e.type)
      Rnd.shuffle(types)
      this.tiles = this.tiles.map((e, index) => {
        return { ...e, type: types[index] }
      })
      this.countReshuffles++
      this.checkGame()
      this.isShowHint = false
    },
    Escape() {
      this.isLeaderBoard = !this.isLeaderBoard
    },
    LeaderBoard() {
      this.isLeaderBoard = !this.isLeaderBoard
    },
    async SendName() {
      console.log('next-get')
      await axios.post('/add_result', {
        name: localStorage.getItem('nickname'),
        time: localStorage.getItem('time'),
        reshuffles: this.countReshuffles,
        difficulty: localStorage.getItem('difficulty')
      })
    },
    restart() {
      this.gameStatus = "startGame"
      this.startGame = true
    }
  },

}
</script>

<template>
  <div>
    <div v-if="this.gameStatus !== 'game' || isLeaderBoard"
      style="z-index: 2000000000;position: fixed;left: 0;top: 0;width: 100%;opacity: 50%;min-height: 100vh;"
      class="bg-gray-900 ">
    </div>
    <Header @revert="revert" @showhint="showHint" @restart="restart" @update="revertGame" @leaderBoard="LeaderBoard"
      @reshuffle="reshuffle" class="w-96" />
    <main class="flex justify-center items-center"
      style="min-height: 100vh;position: absolute;left: 0;top: 0;width: 100%">
      <Lose v-if="gameStatus === 'lose'" style="z-index: 2000000001;" @revert="revert" @update="revertGame"
        @restart="restart" @reshuffle="reshuffle" />
      <Win v-if="gameStatus === 'win'" style="z-index: 2000000001;" @update="revertGame" @restart="restart"
        @send="SendName" />
      <StartGame v-if="gameStatus === 'startGame'" style="z-index: 2000000001;" @start="startNewGame" />
      <Board :tiles="tiles" :chosen="chosen" :hint="hint" :show-hint="isShowHint" @choose="chooseTile" />
      <LeaderBoard v-if="isLeaderBoard" style="z-index: 2000000001;" @escape="Escape()" />
    </main>
  </div>
</template>

<style>
body {
  background-color: #007863;
}
</style>
