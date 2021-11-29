<template>
  <div>
    <label for="my-modal-2" class="button modal-button ">Explore stories</label>
    <input
      id="my-modal-2"
      type="checkbox"
      class="modal-toggle"
    >
    <label class="modal" for="my-modal-2">
      <div class="modal-box max-w-[700px] ">
        <div class="grid-modal mt-3">
          <label
            v-for=" (item,index) in menu.items"
            :key="index"
            tab-index="0"
            for="my-modal-2"
            class="cursor-pointer transition hover:bg-gray-800 rounded p-4"
            @click="$router.push(item.route)"
          >
            <img class="rounded object-cover w-36 h-24 mx-auto" :src="item.image || '/images/menu/placeholder.jpg'">
            <div class="font-medium text-center text-xl mt-2">{{ item.tooltip }}</div>
          </label>
        </div>
        <div class="text-center">
          <label for="my-modal-2" tab-index="0" class="text-center btn btn-sm" @click="$router.push('/stories')">
            Home
          </label>
        </div>
      </div>
    </label>
  </div>
</template>

<script setup>
import menu from '~/content/menu-items.yaml'
</script>

<style scoped>
.grid-modal{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 4px
}
</style>
