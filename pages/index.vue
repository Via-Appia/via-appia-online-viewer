<template>
  <div class="relative">
    <div class="fixed bg-black opacity-80 top-0 left-0 right-0 bottom-0" />
    <section
      v-motion
      :initial="{ opacity: 0}"
      :enter="{ opacity: 1}"
      class="fixed top-0 left-0 right-0 bottom-0  w-screen h-screen flex items-center justify-center"
    >
      <div class="text-white py-20">
        <div class="container mx-auto flex flex-col md:flex-row items-center my-12 md:my-24">
          <div class="flex flex-col w-1/3 justify-center items-start p-8">
            <h1 class="text-3xl md:text-5xl py-2 text-yellow-300 tracking-loose">
              Via Appia 3D
            </h1>
            <h2 class="text-3xl md:text-5xl leading-relaxed md:leading-snug mb-2">
              The Timeless Infinity
            </h2>
            <p class="text-sm md:text-base mb-4">
              Explore one of the earliest and strategically most important
              Roman roads of the ancient republic.
            </p>
            <nuxt-link to="stories" class="button">
              Explore Now
            </nuxt-link>
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
