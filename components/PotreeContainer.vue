<template>
  <div>
    <div id="potree_container" ref="potree_container" class=" absolute w-screen h-screen" />

    <!--  Only show the toolbar when developing locally-->
    <!--  <div v-if="$nuxt.context.isDev" id="potree_sidebar_container" /> -->
    <div
      v-if="!$config.isMuseumApp"
      class="flex w-full absolute left-4 bottom-4 z-20 items-end pr-10 pointer-events-none"
      :class="{'pl-[300px]':isSidebarOpen}"
    >
      <img src="/app/keys.svg" alt="Keys Helper" class="select-none pointer-events-none h-20">
      <div class="mr-auto mb-1">
        {{ potreeRef.props.moveSpeed }}
      </div>

      <memory-usage-demo />

      <div class="pointer-events-auto cursor-pointer ml-4" @click="resize">
        {{ windowWidth }} x {{ windowHeight }}
      </div>

      <div class="btn pointer-events-auto" @click="toggleSidebar">
        Toggle Panel
      </div>
    </div>

    <camera-side-panel-section v-if="!$config.isMuseumApp && camera" />
    <div id="potree_sidebar_container" />
  </div>
</template>

<script>
import { ref } from '@nuxtjs/composition-api'
import { potreeRef, addAnimationPath, initViewer, listenSelectObject } from '~/api/VAPotree'

export const isSidebarOpen = ref(false)

export default {
  setup (props, context) {
    return { isSidebarOpen, potreeRef }
  },

  data () {
    return {
      labels: [],
      camera: null,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }
  },
  async fetch () {
    this.labels = await this.$content('labels-map').fetch()
  },

  /**
   * When entring a new page, add the animations in place
   */
  watch: {
    $route (to, from) {
      // this.getAnimationPaths(to.params)
    }
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.windowHeight = window.innerHeight
      this.windowWidth = window.innerWidth
    })
    // check if the sidebar is visible
    isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')

    // hide toolbar if production mode
    if (!this.$nuxt.context.isDev || this.$config.isMuseumApp) {
      this.toggleSidebar()
    }

    initViewer(this.$refs.potree_container)

    //
    // Listen for clicks on the viewer
    //
    this.$refs.potree_container.addEventListener('click', (event) => {
      listenSelectObject()
    })
    // we need to pass to the global value the viewer, otherwise, the animation won't be able to load
    window.viewer = potreeRef.viewer
    this.camera = potreeRef.viewer.scene.getActiveCamera()

    // get labels
    // this.getLabels()
  },

  methods: {
    resize () {
      window.open(
        'http://localhost:3000',
        '',
        'width=1280, height=721, directories=no,titlebar=no,toolbar=no, location=no, status=no, menubar=no, scrollbars=no, resizable=no')
    },
    // Get labels from the markdown file and ads the to the scene
    async getLabels () {
      const labels = await this.$content('labels-map')
        .fetch()
        .catch((err) => {
          console.error({ statusCode: 404, message: 'Page not found', error: err })
        })
      labels.labels.map(label => potreeRef.viewer.scene.annotations.add(new Potree.Annotation(label)))
    },

    // async getAnimationPaths ({ story = '', page = '' }) {
    //   const animation = await this.$content(story, page)
    //     .fetch()
    //     .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })
    //
    //   const positions = [
    //     potreeRef.viewer.scene.getActiveCamera().position.toArray(), // current camera position
    //     animation.cameraPosition
    //   ]
    //   const targets = [
    //     potreeRef.viewer.scene.view.getPivot().toArray(), // current target position
    //     animation.cameraTarget
    //   ]
    //
    //   // Remove previous animations
    //   // TODO this doesn't remove the animation from the previous path
    //   potreeRef.viewer.scene.cameraAnimations.length = 0
    //   addAnimationPath(positions, targets, animation.animationEntry)
    //   potreeRef.viewer.scene.cameraAnimations[0].play()
    // },

    toggleSidebar () {
      $('#potree_sidebar_container').toggle()
      isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')
    }

  }
}
</script>

<style>
#potree_menu img {
  display: inline-block;
}

#potree_sidebar_container {
  position: absolute;
  left: 0px;
  top: 0px;
  background: rgba(0, 0, 0, .8);
  color: white;
  /*padding: 0.3em 0.8em;*/
  font-family: "system-ui";
  border-radius: 0em 0em 0.3em 0.3em;
  /*display: flex;*/
}

.potree_toolbar_label {
  text-align: center;
  font-size: smaller;
}

.potree_toolbar_separator {
  background: white;
  padding: 0px;
  margin: 5px 10px;
  width: 1px;
}
.pv-menu-list > li > input {
  margin-bottom: 5px;
  padding: 5px;
  color: black;
}
input[type="number"]::-webkit-inner-spin-button {
  opacity: 1;
}
</style>
