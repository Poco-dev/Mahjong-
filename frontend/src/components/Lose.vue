<template>
    <div
        class="flex flex-col content-between bg-gradient-to-r from-red-500 via-red-900 to-red-500 border-4 rounded-md border-red-900">
        <div class="text-center mb-5 mt-5">
            <p class="text-white text-lg font-serif">Упс, вы проиграли!</p>
        </div>
        <div class="flex flex-col p-1 ">
            <div class="flex flex-row">
                <button type="button" @click="$emit('revert')"
                    class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Отменить
                    ход</button>

                <button type="button" @click="$emit('update')"
                    class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Начать
                    сначала</button>

            </div>

            <button type="button" @click="$emit('restart')"
                class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Начать
                новую игру</button>
            <button type="button" @click="$emit('reshuffle')"
                class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Перемешать
            </button>

        </div>
    </div>
</template>