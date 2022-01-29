<template>
  <div class="flex">
    <div
      v-if="!$config.isMuseumApp"
      class="btn btn-sm pointer-events-auto fixed top-3 left-3 p-0 w-[40px]"
      :class="{'left-[310px]':isSidebarOpen}"
      @click="toggleSidebar"
    >
      <svg width="20" height="20" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 6H20V8H0V6ZM0 0H20V2H0V0ZM0 12H20V14H0V12Z" fill="currentColor" />
      </svg>
    </div>
    <!--    <div v-if="!$config.isMuseumApp" class="absolute top-[20px] right-[40%]">-->
    <!--    </div>-->
    <div v-if="!$config.isMuseumApp" class="fixed top-2 right-2 ">
      <explore-stories-button :open="!story" />
    </div>
    <div v-if="!$config.isMuseumApp" class="fixed top-20 pb-40 right-0 overflow-auto h-full ">
      <steps-timeline-links v-if="story" :pages="pages" class="" />
    </div>
    <transition>
      <!--        :pages="pages"-->
      <NuxtChild
        id="steps"
        class="absolute top-20 min-w-[500px] left-4 p-3 prose"
        :class="{'left-[350px]':isSidebarOpen}"
      />
    </transition>
  </div>
</template>

<script >
import { useRoute, computed, watch, watchEffect } from '@nuxtjs/composition-api'
import { useMagicKeys } from '@vueuse/core'
import { isSidebarOpen } from '~/components/PotreeContainer'
import { potreeRef } from '~/api/VAPotree'
import { socket } from '~/api/websocket'

import { resetViewTimeInMinutes } from '~/content/app-settings.yaml'
export default {
  setup () {
    const route = useRoute()
    const story = computed(() => route.value.params.story)
    const { shift, a, Equal /* keys you want to monitor */ } = useMagicKeys()

    watch(Equal, (v) => {
      if (v) {
        console.log('space has been pressed')
        window.open(
          'http://localhost:3000/stories',
          '',
          'width=1280, height=721, directories=no,titlebar=no,toolbar=no, location=no, status=no, menubar=no, scrollbars=no, resizable=no'
        )
      }
    })
    watchEffect(() => {
      if (shift.value && a.value) {
        console.log('Shift + A have been pressed')
      }
    })

    return { isSidebarOpen, story }
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
      .only(['title', 'description', 'path', 'exclude'])
      .fetch()
      .catch((err) => {
        console.error({ statusCode: 404, message: 'Page not found', error: err })
      })
    this.pages = this.pages.filter(viewpoint => !viewpoint.exclude)
  },
  watch: {
    // When changing pages, refetch the content page and reload the method
    $route () {
      this.$fetch()
    }
  },
  mounted () {
    socket.onmessage = ({ data }) => {
      console.log('🎹 ')
      const message = JSON.parse(data)
      if (message.type === 'path') {
        console.log('🏴‍☠️ messge from the server', message.page)
        console.log('completeMessage', message)
        this.$router.push(`/stories/${message.page}`)
      }

      // if (message.type === 'openInFullHd') {
      //   console.log('🎹 open in full')
      //   window.open(
      //     'http://localhost:3000/stories',
      //     '',
      //     'width=1280, height=721, directories=no,titlebar=no,toolbar=no, location=no, status=no, menubar=no, scrollbars=no, resizable=no')
      // }
    }

    const router = this.$router
    setInterval(() => {
      potreeRef.idleTimer++
      if (potreeRef.idleTimer >= resetViewTimeInMinutes * 60 * 1000) {
        // console.log('🎹 RESET view')
        // Tell the tablet to reset
        socket.send(JSON.stringify({
          type: 'message',
          message: 'idle time reached - reset view'
        }))
        router.push(`/stories/${this.$route.params.story}/monument`)
      }
    }, 1000)
  },
  methods: {
    toggleSidebar () {
      $('#potree_sidebar_container').toggle()
      isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')
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
