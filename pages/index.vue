<template>
  <div class="relative">
    <div class="fixed bg-black opacity-80 top-0 left-0 right-0 bottom-0" />
    <section
      v-motion
      :initial="{ opacity: 0}"
      :enter="{ opacity: 1}"
      class="fixed top-0 left-0 right-0 bottom-0  w-screen h-screen flex items-center justify-center"
    >
      <locale-switch class="absolute top-[15%] right-[15%]" />

      <div class="text-white py-20">
        <div class="container mx-auto flex flex-col md:flex-row items-center my-12 md:my-24">
          <div class="flex flex-col w-1/3 justify-center items-start p-8">
            <h1 class="text-3xl md:text-5xl py-2 text-yellow-300 tracking-loose">
              REVISITED Via Appia
            </h1>
            <div v-if="potreeRef.lang ==='nl'">
              <p class="text-sm md:text-base my-4">
                Reis in tijd en ruimte langs de belangrijkste oude Romeinse weg.
              </p>
              <p class="text-sm md:text-base mb-4">
                Zes monumenten en meer dan honderd uitzichtpunten laten zien hoe de Via Appia Antica in de loop van de tijd door kunstenaars en fotografen werd gezien.
              </p>
              <nuxt-link to="stories" class="button">
                BEGIN met verkennen
              </nuxt-link>
            </div>
            <div v-else>
              <p class="text-sm md:text-base my-4">
                Travel in time and space along the most important ancient Roman road.
              </p>
              <p class="text-sm md:text-base mb-4">
                Six monuments and more than a hundred viewpoints show how the Via Appia Antica was seen by artists and photographers over time.
              </p>
              <nuxt-link to="stories" class="button">
                START exploring
              </nuxt-link>
            </div>
          </div>
          <div class="p-8 mt-12 mb-6  ml-0 justify-center">
            <div class="h-48 flex flex-wrap content-center">
              <div>
                <img class="inline-block mt-28 " src="banner.webp">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="fixed bottom-0 text-xs opacity-40">
      Debug:
      <nuxt-link class="ml-2 btn-outline" to="offline">
        Offline
      </nuxt-link>
      <nuxt-link class="ml-2 btn-outline" to="feedback">
        Feedback
      </nuxt-link>
    </footer>
  </div>
</template>
<script setup>
import { potreeRef } from '~/api/VAPotree'
import LocaleSwitch from '~/components/LocaleSwitch'
</script>
