<template>
  <div class="bg-gray-700 bg-opacity-90 rounded ">
    <h2> {{ page.title }} </h2>
    <div class="w-full">
      <nuxt-content :document="page" class="text-gray-400 prose prose-sm sm:prose lg:prose-lg" />
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('VI').fetch()
    return {
      page
    }
  }
}
</script>
