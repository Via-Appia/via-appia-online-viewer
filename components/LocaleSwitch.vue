<template>
  <div class="select-none">
    <span
      v-if="langs.nl"
      class="cursor-pointer hover:underline"
      :class="{'primary-text':potreeRef.lang==='nl'}"
      @click="changeLocale('nl')"
    >
      nl
    </span>

    <span v-if="langs.en">|</span>

    <span
      v-if="langs.en"
      class="cursor-pointer hover:underline"
      :class="{'primary-text':potreeRef.lang==='en'}"
      @click="changeLocale('en')"
    >
      en
    </span>

    <span v-if="langs.de">|</span>

    <span
      v-if="langs.de"
      class="cursor-pointer hover:underline"
      :class="{'primary-text':potreeRef.lang==='de'}"
      @click="changeLocale('de')"
    >
      de
    </span>
  </div>
</template>

<script setup>
import { defineProps } from '@nuxtjs/composition-api'
import { potreeRef } from '~/api/VAPotree'

defineProps({
  langs: {
    type: Object,
    default: () => ({ nl: true, en: true, de: true })
  }
})
function changeLocale (locale) {
  potreeRef.lang = locale
}
</script>
