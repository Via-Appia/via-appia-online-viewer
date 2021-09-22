<template>
  <div class="container">
    <div v-if="pages" class="container">
      <div v-for="(page,i) in pages" :key="i" class="flex flex-col md:grid mx-auto text-blue-50">
        <div class="mr-10 md:mx-auto relative h-20">
          <div class="h-full w-6 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-800" />
          </div>
          <div class="w-6 h-6 absolute top-1/4 -mt-3 flex justify-center">
            <div class="relative py-3 sm:max-w-xl sm:mx-auto">
              <div class="group cursor-pointer relative inline-block text-center">
                <nuxt-link tag="div" :to="'/stories' + page.path" class="btn btn-circle text-white">
                  {{ i + 1 }}
                </nuxt-link>
                <div
                  class=" w-[170px] h-14 flex items-center justify-center bg-gray-800 text-white text-center rounded-lg py-2
                          absolute opacity-0 transition-all
                          z-10 group-hover:opacity-100 bottom-full mr-0 px-3 pointer-events-none
                          transform translate-x-[-200px] translate-y-[55px]
                "
                >
                  {{ page.title }}
                </div>
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
  background: #1b3e4c;
  color: white
}
</style>
