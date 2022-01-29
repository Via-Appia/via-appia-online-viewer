<template>
  <div>
    <div class="btn" @click="modal=!modal">
      Monuments
    </div>
    <transition name="modal">
      <div
        v-if="modal"
        class="fixed top-0 left-0 right-0 bottom-0 flex align-center justify-center bg-black bg-opacity-30"
        @click="modal=!modal"
      >
        <monuments-modal-content />
      </div>
    <!--    </label>-->
    </transition>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref } from '@nuxtjs/composition-api'

export const modal = ref(false)

const props = defineProps({
  open: { type: Boolean, default: false }
})

onMounted(() => {
  // Open the explore stories modal if it is the main stories page
  if (props.open) {
    modal.value = true
  }
})
</script>
