<template>
  <div class="modal-box max-w-[650px] " style="height: fit-content">
    <div class="mt-3 py-6">
      <div class="flex gap-5 justify-center">
        <label
          v-for=" (item,index) in menuPart1"
          :key="index"
          tab-index="0"
          for="my-modal-2"
          class="cursor-pointer group rounded w-1/3 flex flex-col justify-end "
          @click="$router.push(item.route)"
        >
          <div class="text-center text-2xl mb-2 h-[60px] mx-auto">{{ item.title }}</div>
          <div class="rounded-xl bg-[#F6F6F6] p-1 group-hover:scale-95 transition">
            <img
              class="object-cover mx-auto h-[130px]"
              :src="item.image || '/images/menu/placeholder.jpg'"
            >
          </div>
        </label>
      </div>
      <div class="flex my-6 items-center justify-center text-2xl bg-[#F6E100] text-gray-700 p-3">
        <div>Via Appia Antica</div>
      </div>
      <div class="flex gap-5 justify-center">
        <label
          v-for=" (item,index) in menuPart2"
          :key="index"
          tab-index="0"
          for="my-modal-2"
          class="cursor-pointer group rounded w-1/3 "
          @click="$router.push(item.route)"
        >
          <div class="rounded-xl bg-[#F6F6F6] p-1 group-hover:scale-95 transition">
            <img
              class="object-cover mx-auto h-[130px]"
              :src="item.image || '/images/menu/placeholder.jpg'"
            >
          </div>
          <div class="text-center text-2xl mt-2 h-[50px]">{{ item.title }}</div>
        </label>
      </div>
    </div>

    <div class="mt-6 text-center">
      <!--                 @click="$router.push('/stories')"-->
      <label
        for="my-modal-2"
        tab-index="0"
        class="text-center text-xl"
      >
        <div v-if="potreeRef.lang==='nl'">kies een monument</div>
        <div v-if="potreeRef.lang==='en'">choose a monument</div>
        <div v-if="potreeRef.lang==='de'">Wähle ein Denkmal</div>

      </label>
    </div>
  </div>
</template>

<script setup>
import menu from '~/content/menu-items.yaml'
import { potreeRef } from '~/api/VAPotree'

const menuPart1 = [menu.items[0], menu.items[1], menu.items[2]]
const menuPart2 = [menu.items[3], menu.items[4], menu.items[5]]

</script>
