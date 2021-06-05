<template>
  <div>
    <div class="flex mb-4">
      <button class="btn btn-outline btn-xs mt-4 text-2xl" @click="targetTo">
        Change Camera(dev)
      </button>
      <div class="flex-grow" />
      <NuxtLink
        tag="button"
        :disabled="!prev"
        class="btn"
        :to="{ to: 'stories', params: {story: $route.params.story, page: prev && prev.slug}}"
      >
        Back
      </NuxtLink>

      <NuxtLink
        tag="button"
        :disabled="!next"
        class="btn ml-4"
        :to="{ to: 'stories', params: {story: $route.params.story, page: next && next.slug}}"
      >
        Next
      </NuxtLink>
    </div>

    <div>
      <div class="bg-gray-700 bg-opacity-90 rounded p-4">
        <div class="text-2xl font-bold text-accent">
          {{ page && page.title }}
        </div>
        <div class="w-full">
          <nuxt-content :document="page" class="text-gray-400 prose prose-sm sm:prose lg:prose-lg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({
    $content,
    params
  }) {
    const coordinates = await $content(params.story)
      .sortBy('slug', 'asc')
      .only(['cameraPosition', 'lookAt'])
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

    console.log('🎹', coordinates)

    const page = await $content(params.story, params.page)
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

    const [prev, next] = await $content(params.story)
      .sortBy('slug', 'asc')
      .only(['title', 'slug'])
      .surround(params.page)
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

    return {
      page,
      prev,
      next,
      params
    }
  },
  data () {
    return {
      error: false
    }
  },
  methods: {
    targetTo (target) {
      const { view } = this.$viewer.scene
      // const { direction, radius } = view

      // position
      view.position.set(296409.834, 4633292.402, 284.229)
      // target
      view.lookAt(new THREE.Vector3(296389.882, 4633364.782, 267.282))

      // const endPosition = new THREE.Vector3(295767.711, 4631801.029, 586.717)
      //   .addScaledVector(direction, -radius) // notice do not forget the negative symbol here
      // view.position.copy(endPosition)
    }
  }

}
</script>
