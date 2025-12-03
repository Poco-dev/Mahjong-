<template>
    <div class="flex flex-col items-center">
        <div>
            <button type="button" @click="$emit('escape')" style="width:200px;"
                class="mt-10 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-5">
                Назад
            </button>
        </div>
        <div class="flex justify-between">
            <div class="min-h-screen flex items-center flex-col">

                <div
                    class="flex flex-col justify-center rounded-xl items-center bg-red-400 mr-5 ml-2 border-red-500 border-4">
                    <p class="text-white text-xl font-serif mb-5">LeaderBoard: Hard level</p>
                    <div class="flex flex-row gap-5 mr-2 ml-2">
                        <p class="text-white text-md w-40">Имя</p>
                        <p class="text-white text-md w-26">Время</p>
                        <p class="text-white text-md w-26">Перемешивания</p>
                    </div>
                    <div v-for="player in hard" class="flex flex-row justify-between pl-2 pr-2 mr-2 ml-2 mb-2 "
                        style="border-top: 1px black solid;width: 100%;">
                        <p class="text-white text-md w-40">{{ player.name }}</p>
                        <p class="text-white text-md w-40">{{ Math.floor(player.time / 3600) }}:{{
                            Math.floor(player.time / 60) }}:{{ player.time % 60 }}</p>
                        <p class="text-white text-md w-26">{{ player.reshuffles }}</p>
                    </div>

                </div>
            </div>
            <div class="min-h-screen flex items-center flex-col">
                <div
                    class="flex flex-col justify-center items-center bg-blue-400 mr-5 ml-2 rounded-xl border-blue-500 border-4">
                    <p class="text-white text-xl font-serif mb-5">LeaderBoard: Medium level</p>
                    <div class="flex flex-row gap-5 mr-2 ml-2">
                        <p class="text-white text-md w-40">Имя</p>
                        <p class="text-white text-md w-26">Время</p>
                        <p class="text-white text-md w-26">Перемешивания</p>
                    </div>
                    <div v-for="player in medium" class="flex flex-row justify-between pl-2 pr-2 mr-2 ml-2 mb-2 "
                        style="border-top: 1px black solid;width: 100%;">
                        <p class="text-white text-md w-40">{{ player.name }}</p>
                        <p class="text-white text-md w-40">{{ Math.floor(player.time / 3600) }}:{{
                            Math.floor(player.time / 60) }}:{{ player.time % 60 }}</p>
                        <p class="text-white text-md w-26">{{ player.reshuffles }}</p>
                    </div>

                </div>
            </div>
            <div class="min-h-screen flex items-center flex-col">
                <div
                    class="flex flex-col justify-center rounded-xl items-center bg-green-400 mr-5 ml-2 border-green-500 border-4">
                    <p class="text-white text-xl font-serif mb-5">LeaderBoard: Easy level</p>
                    <div class="flex flex-row gap-5 mr-2 ml-2">
                        <p class="text-white text-md w-40">Имя</p>
                        <p class="text-white text-md w-26">Время</p>
                        <p class="text-white text-md w-26">Перемешивания</p>
                    </div>
                    <div v-for="player in easy" class="flex flex-row justify-between pl-2 pr-2 mr-2 ml-2 mb-2 "
                        style="border-top: 1px black solid;width: 100%;">
                        <p class="text-white text-md w-40">{{ player.name }}</p>
                        <p class="text-white text-md w-40">{{ Math.floor(player.time / 3600) }}:{{
                            Math.floor(player.time / 60) }}:{{ player.time % 60 }}</p>
                        <p class="text-white text-md w-26">{{ player.reshuffles }}</p>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "LeaderBoard",
    data() {
        return {
            hard: [],
            medium: [],
            easy: []
        };
    },
    methods: {
        async getHard() {
            let response = await axios.get('/users', {
                params: {
                    difficulty: 'hard'
                }
            })
            this.hard = response.data
        },
        async getMedium() {
            let response = await axios.get('/users', {
                params: {
                    difficulty: 'medium'
                }
            })
            this.medium = response.data
        }, async getEasy() {
            let response = await axios.get('/users', {
                params: {
                    difficulty: 'easy'
                }
            })
            this.easy = response.data
        }
    },
    mounted() {
        this.getHard();
        this.getMedium();
        this.getEasy();
    }
};
</script>

<style scoped></style>