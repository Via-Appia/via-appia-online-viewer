<template>
  <div class="flex">
    <!--    <div v-if="!$config.isMuseumApp" class="absolute top-[20px] right-[40%]">-->
    <!--    </div>-->
    <div v-if="!$config.isMuseumApp" class="fixed top-2  right-2 ">
      <explore-stories-button />
    </div>
    <div v-if="!$config.isMuseumApp" class="fixed top-20 pb-40 right-0 overflow-auto h-full ">
      <steps-timeline-links :pages="pages" />
    </div>
    <transition>
      <NuxtChild
        id="steps"
        :pages="pages"
        class="absolute top-20 min-w-[500px] left-4 p-3 prose"
        :class="{'left-[350px]':isSidebarOpen}"
      />
    </transition>
  </div>
</template>

<script >
import { isSidebarOpen } from '~/components/PotreeContainer'
export default {
  setup () {
    return { isSidebarOpen }
  },

  data () {
    return {
      pages: null
    }
  },

  async fetch () {
    // Get the list of pages of the story
    this.pages = await this.$content(this.$route.params.story)
      .sortBy('slug', 'asc')
    // .only(['title', 'description', 'path'])
      .fetch()
      .catch((err) => {
        console.error({ statusCode: 404, message: 'Page not found', error: err })
      })
  },
  watch: {
    // When changing pages, refetch the content page and reload the method
    $route () {
      this.$fetch()
    }
  }
}
</script>

<style scoped>
/* Transitions using the page hook */
.page-enter-active {
  animation: acrossIn .40s ease-out both;
}
/*.page-leave-active {*/
/*  animation: acrossOut .60s ease-in both;*/
/*}*/
@keyframes acrossIn {
  0% {
    transform: translate3d(0, 10px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
@keyframes acrossOut {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(100%, 0, 0);
  }
}
</style>
