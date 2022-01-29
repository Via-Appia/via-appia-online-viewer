<template>
  <div>
    <span
      class="cursor-pointer hover:underline"
      :class="{'primary-text':potreeRef.lang==='nl'}"
      @click="changeLocale('nl')"
    >
      nl
    </span>
    |
    <span
      class="cursor-pointer hover:underline"
      :class="{'primary-text':potreeRef.lang==='en'}"
      @click="changeLocale('en')"
    >
      en
    </span>
  </div>
</template>

<script setup>
import { potreeRef } from '~/api/VAPotree'
function changeLocale (locale) {
  potreeRef.lang = locale
}
</script>
