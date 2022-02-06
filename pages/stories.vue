<template>
  <div class="flex">
    <div
      v-if="!$config.isMuseumApp"
      class="btn btn-sm btn-circle pointer-events-auto fixed top-3 left-3  hidden md:block"
      :class="{'left-[310px]':isSidebarOpen}"
      @click="toggleSidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 m-[5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>

    <div v-if="!$config.isMuseumApp" class="fixed top-0 right-0 h-screen ">
      <steps-timeline-links />
    </div>

    <transition name="page">
      <NuxtChild
        id="steps"
        class="absolute top-0 md:top-20 left-4 p-3"
        :class="{'left-[350px]':isSidebarOpen}"
      />
    </transition>
    <div
      v-if="!$config.isMuseumApp"
      class="flex w-screen h-screen items-start justify-center"
    >
      <monuments-modal-content v-if="!$route.params.story" />
    </div>
  </div>
</template>

<script >
import { watch, watchEffect } from '@nuxtjs/composition-api'
import { useMagicKeys } from '@vueuse/core'
import { isSidebarOpen } from '~/components/PotreeContainer'
import { potreeRef } from '~/api/VAPotree'
import { socket } from '~/api/websocket'

import { resetViewTimeInMinutes } from '~/content/app-settings.yaml'
export default {
  setup () {
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
    return { isSidebarOpen }
  },

  mounted () {
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data)
      if (message.type === 'path') {
        console.log('🏴‍☠️ messge from the server', message.page)
        this.$router.push(`/stories/${message.page}`)
      }
    }

    // Reset the view to Monument view after 'resetViewTimeInMinutes' minutes
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
