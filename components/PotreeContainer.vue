<template>
  <div>
    <div id="potree_container" ref="potree_container" class="z-0 absolute w-screen h-screen">
      <div id="potree_sidebar_container" />

      <!--  Only show the toolbar when developing locally-->
      <!--  <div v-if="$nuxt.context.isDev" id="potree_sidebar_container" /> -->
      <div
        class="flex w-full absolute left-4 bottom-4 z-20 items-end pr-10"
        :class="{'pl-[300px]':isSidebarOpen}"
      >
        <img src="/app/keys.svg" alt="Keys Helper" class="select-none pointer-events-none h-20">
        <div class="mr-auto mb-1">
          {{ potreeRef.props.moveSpeed }}
        </div>
        <div class="btn" @click="toggleSidebar">
          Toggle Panel
        </div>
      </div>
    </div>
    <camera-side-panel-section v-if="camera" />
  </div>
</template>

<script>
// import Vue from 'vue'
import { ref } from '@nuxtjs/composition-api'
import {
  potreeRef, addAnimationPath, initViewer
} from '~/api/VAPotree'

// Access the potreeView instance from everywhere using composition API
// export const potreeRef = reactive({})
export const isSidebarOpen = ref(false)

export default {
  setup (props, context) {
    return { isSidebarOpen, potreeRef }
  },

  data () {
    return {
      labels: [],
      camera: null
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
      this.getAnimationPaths(to.params)
    }
  },
  mounted () {
    // check if the sidebar is visible
    isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')

    // hide toolbar if production mode
    if (!this.$nuxt.context.isDev) {
      this.toggleSidebar()
    }

    initViewer(this.$refs.potree_container)
    // we need to pass to the global value the viewer, otherwise, the animation won't be able to load
    window.viewer = potreeRef.viewer
    this.camera = potreeRef.viewer.scene.getActiveCamera()

    // get labels
    this.getLabels()
  },

  methods: {
    // Get labels from the markdown file and ads the to the scene
    async getLabels () {
      const labels = await this.$content('labels-map')
        .fetch()
        .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })
      labels.labels.map(label => potreeRef.viewer.scene.annotations.add(new Potree.Annotation(label)))
    },

    async getAnimationPaths ({ story = '', page = '' }) {
      const animation = await this.$content(story, page)
        .fetch()
        .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

      const positions = [
        potreeRef.viewer.scene.getActiveCamera().position.toArray(), // current camera position
        animation.cameraPosition
      ]
      const targets = [
        potreeRef.viewer.scene.view.getPivot().toArray(), // current target position
        animation.cameraTarget
      ]

      // Remove previous animations
      // TODO this doesn't remove the animation from the previous path
      potreeRef.viewer.scene.cameraAnimations.length = 0
      addAnimationPath(positions, targets, animation.animationSpeed)
      potreeRef.viewer.scene.cameraAnimations[0].play()
    },

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
  z-index: 1000;
  left: 0px;
  top: 0px;
  background: black;
  color: white;
  /*padding: 0.3em 0.8em;*/
  font-family: "system-ui";
  border-radius: 0em 0em 0.3em 0.3em;
  /*display: flex;*/
}

.potree_toolbar_label {
  text-align: center;
  font-size: smaller;
  opacity: 0.9;
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
