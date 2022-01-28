<template>
  <div
    v-if="story.pages && story.pages[0] && story.pages[0].path"
    class="w-[180px] flex flex-col h-screen items-center text-center overflow-hidden bg-gray-700"
  >
    <div class="text-xl text-medium primary-text mt-2">
      REVISITED <br>Via Appia
    </div>

    <explore-stories-button class="mt-2" />
    <div v-show="false">
      {{ modal }}
    </div>
    <div class="flex flex-col items-center w-full mt-2 bg-gray-700 px-2 rounded-xl">
      <img
        class="cursor-pointer mb-2 rounded-xl w-[145px] h-[130px] hover:scale-95 transition"
        :src="`/images/menu/${$route.params.story}.jpg`"
        alt="Monuments image"
        @click="modal.checked = true"
      >
      {{ monuments[$route.params.story].title }}
    </div>

    <nuxt-link
      v-if="showReconstructionButton"
      :to="`/stories/${$route.params.story}/${allPages[reconstructionPage].slug}`"
      class="btn mt-6 mb-4"
    >
      Reconstruction
    </nuxt-link>

    <div class="flex mt-2">
      <NuxtLink
        :disabled="!prev"
        class="btn btn-sm ml-4"
        :to="{ to: 'stories', params: {story: $route.params.story, page: prev && prev.slug}}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
      </NuxtLink>
      <NuxtLink
        :disabled="!next"
        class="btn ml-4 btn-sm"
        :to="{ to: 'stories', params: {story: $route.params.story, page: next && next.slug}}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </NuxtLink>
    </div>

    <div class="flex flex-col overflow-y-auto items-center w-full flex-1 ">
      <div v-for="(page,i) in story.pages" :key="i" class="flex flex-col md:grid mx-auto text-blue-50">
        <div class="mr-10 mx-auto relative h-20">
          <div class="h-full w-6 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-800" />
          </div>
          <div class="w-6 h-6 absolute top-1/4 -mt-3 flex justify-center">
            <div class="relative py-3 sm:max-w-xl sm:mx-auto">
              <div class="group cursor-pointer relative inline-block text-center">
                <!--                <div :data-tip=" page.path" class="tooltip tooltip-left">-->
                <router-link :to="'/stories' + page.path" class="btn btn-circle text-white">
                  <span> {{ i + 1 }}</span>
                </router-link>
                <!--                </div>-->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from '@nuxtjs/composition-api'
import { modal } from '~/components/ExploreStoriesButton'
import { story } from '~/api/story'
import monuments from '~/content/monuments.json'

console.log('🎹  modal.checked', modal.checked)
defineProps({
  showReconstructionButton: { type: Boolean, default: false }
})

</script>

<style scoped>
.btn.nuxt-link-active{
  @apply bg-yellow-500 text-white
}
</style>
