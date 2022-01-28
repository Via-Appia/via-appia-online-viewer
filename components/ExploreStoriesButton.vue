<template>
  <div>
    <label for="my-modal-2" class="btn modal-button">Monuments</label>
    <input
      id="my-modal-2"
      ref="modal"
      type="checkbox"
      class="modal-toggle"
    >
    <label class="modal" for="my-modal-2">
      <!--      <div class="modal-box max-w-[650px] bg-[#646363]">-->
      <monuments-modal-content />
    </label>
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
    modal.value.checked = true
  }
})
</script>
