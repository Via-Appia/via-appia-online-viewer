<template>
  <div
    v-if="story.pages && story.pages[0] && story.pages[0].path"
    class="w-[180px] flex flex-col h-screen items-center text-center overflow-y-scroll bg-gray-700 p-2"
  >
    <div class="text-xl text-medium primary-text mt-2">
      REVISITED <br>Via Appia
    </div>

    <explore-stories-button class="mt-2" />
    <div v-show="false">
      {{ modal }}
    </div>
    <div class="flex flex-col items-center w-full mt-2 bg-gray-800 rounded-xl p-4">
      <div class="font-bold">
        {{ monuments[$route.params.story].title }}
      </div>
      <nuxt-link :to="{ to: 'stories', params: {story: $route.params.story, page: 'monument'}}">
        <img
          class="cursor-pointer mt-2 rounded-xl hover:scale-95 transition"
          :src="`/images/menu/${$route.params.story}.jpg`"
          alt="Monuments image"
        >
        <!--        @click="modal = !modal"-->
      </nuxt-link>
    </div>

    <nuxt-link
      v-if="story.reconstructionPage"
      :to="`/stories/${$route.params.story}/reconstruction`"
      class="btn mt-2 "
    >
      <div v-if="potreeRef.lang==='nl'">
        Reconstructie
      </div>
      <div v-if="potreeRef.lang==='en'">
        Reconstruction
      </div>
      <div v-if="potreeRef.lang==='de'">
        Wiederaufbau
      </div>
    </nuxt-link>

    <div class="flex mt-2 mr-4 mb-2">
      <NuxtLink
        :disabled="!story.prev"
        class="btn btn-sm ml-4"
        :to="{ to: 'stories', params: {story: $route.params.story, page: story.prev && story.prev.slug}}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <NuxtLink
        :disabled="!story.next"
        class="btn ml-4 btn-sm"
        :to="{ to: 'stories', params: {story: $route.params.story, page: story.next && story.next.slug}}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </NuxtLink>
    </div>

    <div class="flex flex-col overflow-y-auto items-center w-full flex-1 min-h-[150px]">
      <div v-for="(page,i) in story.pages" :key="i" class="flex flex-col items-center">
        <div class="h-5 w-1 bg-gray-800" />
        <div class="group cursor-pointer inline-block text-center">
          <router-link :to="'/stories' + page.path" class="btn btn-circle  text-white">
            <span> {{ i }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from '@nuxtjs/composition-api'
import { modal } from '~/components/ExploreStoriesButton'
import { story } from '~/api/story'
import { potreeRef } from '~/api/VAPotree'
import monuments from '~/content/monuments.json'

defineProps({
  showReconstructionButton: { type: Boolean, default: false }
})

</script>

<style scoped>
.btn.nuxt-link-active{
  @apply bg-yellow-500 text-white
}
</style>
