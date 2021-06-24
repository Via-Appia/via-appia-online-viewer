<template>
  <div>
    <div class="flex mb-4">
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

    <!--    page time line -->
    <div class="fixed top-48 right-0">
      <steps-timeline-links :pages="pages" />
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
    const pages = await $content(params.story)
      .sortBy('slug', 'asc')
      .only('title', 'description')
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

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
      pages,
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
  }
}
</script>
