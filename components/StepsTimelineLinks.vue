<template>
  <div class="container">
    <div v-if="pages && pages[0].path" class="">
      <div v-for="(page,i) in pages" :key="i" class="flex flex-col md:grid mx-auto text-blue-50">
        <div class="mr-10 md:mx-auto relative h-20">
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

<script>

export default {
  props: {
    pages: { type: Array, required: false, default: () => [] }
  }
}
</script>

<style scoped>
.btn.nuxt-link-active{
  @apply bg-yellow-500 text-white
}
</style>
