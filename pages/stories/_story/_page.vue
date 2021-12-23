<template>
  <div>
    <div class="flex mb-4">
      <div class="flex-grow" />

      <NuxtLink
        :disabled="!prev"
        class="btn"
        :to="{ to: 'stories', params: {story: $route.params.story, page: prev && prev.slug}}"
      >
        Back
      </NuxtLink>

      <NuxtLink
        :disabled="!next"
        class="btn ml-4"
        :to="{ to: 'stories', params: {story: $route.params.story, page: next && next.slug}}"
      >
        Next
      </NuxtLink>
    </div>

    <!--    page time line -->
    <div class="fixed top-20 pb-40 right-0 overflow-auto h-full ">
      <steps-timeline-links :pages="pages" />
    </div>
    <!--      <div class="bg-gray-700 bg-opacity-90 rounded p-4">-->
    <!--                <div class="text-xl font-bold ">-->
    <!--                  {{ page && page.title }}-->
    <!--                </div>-->
    <!--                <div class="w-full mt-3">-->
    <!--                  <nuxt-content :document="page" class="prose-sm sm:prose" />-->
    <!--                </div>-->
    <!--      </div>-->
  </div>
</template>

<script>

import { potreeRef } from '~/api/VAPotree'
import { loadVideo, videos, removeVideo } from '~/api/videos'
import { cameraMoveDT, playDT, startDT, stopDT, fadeOutDT, waitUntilNextVideo } from '~/content/app-settings.yaml'
import { VACameraAnimation } from '~/api/VACameraAnimation'

export default {
  setup () {
    return { videos, potreeRef, removeVideo, THREE }
  },
  data () {
    return {
      error: false,
      pages: null,
      page: null,
      prev: null,
      next: null
    }
  },
  async fetch () {
    const params = this.$route.params

    // Page details
    this.page = await this.$content(params.story, params.page)
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

    // Get the list of pages of the story
    this.pages = await this.$content(params.story)
      .sortBy('slug', 'asc')
      .only(['title', 'description', 'path'])
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

    // Next and previous pages links
    const [prev, next] = await this.$content(params.story)
      .sortBy('slug', 'asc')
      .only(['title', 'slug'])
      .surround(params.page)
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

    this.prev = prev
    this.next = next
  },
  watch: {
    // When changing pages, refetch the content page and reload the method
    $route () {
      // delete previous video on the page
      if (this.page.mediaPath) {
        removeVideo(this.page.mediaPath)
      }
      console.log('🎹 before leave?', this.page.mediaPath)
      this.$fetch().then(() => {
        this.initPagePosition()
      })
      // this.getAnimationPaths(to.params)
    }
  },
  mounted () {
    this.$fetch().then(() => {
      this.initPagePosition()
    })
  },
  methods: {
    async initPagePosition () {
      /**
       * Add media to the scene
       */

      // Single image example
      // this.loadImageExample()

      // Load page video
      loadVideo(this.page)

      // Set viewer FOV
      potreeRef.fov = this.page?.cameraFOV || 60
      potreeRef.viewer.setFOV(this.page?.cameraFOV || 60)
      /**
       * Camera Animation
       */
      // if there are not any camera points defined, then don't do anything.
      if (this.page.cameraPath.length === 0) {
        return
      }

      // If there is only one point defined in the scene, then fly to it directly
      if (this.page.cameraPath.length === 1) {
        potreeRef.viewer.scene.view.setView(
          this.page.cameraPath[0][0], // camera position
          this.page.cameraPath[0][1], // cameraTarget
          this.page.animationEntry || cameraMoveDT
        )
        // Wait for the animation to finish
        await new Promise(resolve => setTimeout(resolve, this.page.animationEntry || cameraMoveDT * 1000)) // wait x seconds
      }

      // If there are a camera path points defined
      if (this.page.cameraPath.length > 1) {
        const animation = new VACameraAnimation(potreeRef.viewer)

        // Get the positions and tagets from the markdown file
        const positions = this.page.cameraPath.map(position => position[0])
        const targets = this.page.cameraPath.map(target => target[1])

        // Add to the current camera point to the camera path to animate from it
        positions.push(potreeRef.viewer.scene.getActiveCamera().position.toArray())
        targets.push(potreeRef.viewer.scene.view.getPivot().toArray())

        // Reverse the array to start the camera animation from the bottom to the beginning
        const _positions = positions.reverse()
        const _targets = targets.reverse()

        // Build the camera animation path
        _positions.forEach((position, i) => {
          const cp = animation.createControlPoint()
          cp.position.set(..._positions[i])
          cp.target.set(..._targets[i])
        })

        animation.visible = false
        animation.duration = cameraMoveDT
        // Wait for the camera animation transition to finish
        await animation.play()
      }

      /*
      * Story secuence
       */
      // play the video
      const video = videos.value[this.page.mediaPath]
      const videoMesh = potreeRef.viewer.scene.scene.getObjectByName(this.page.mediaPath)
      videoMesh.material.opacity -= 0.01
      video.playbackRate = playDT
      await new Promise(resolve => setTimeout(resolve, startDT * 1000)) // wait x seconds
      video.play()

      // Wait until the video is finished
      video.addEventListener('ended', async () => {
        await new Promise(resolve => setTimeout(resolve, stopDT * 1000)) // wait x seconds

        // TODO ENABLE THE MAP AGAIN!!!, only for the museum application!!!

        new TWEEN.Tween(videoMesh.material).to({ opacity: 0 }, fadeOutDT * 1000).start()
          .onComplete(async () => {
            // Code goes here
            video.removeEventListener('ended', null)
            await new Promise(resolve => setTimeout(resolve, waitUntilNextVideo * 1000)) // wait x seconds

            // Go to the first page if reached the last one
            const next = this.next?.slug
              ? `/stories/${this.$route.params.story}/${this.next.slug}`
              : '/stories' + this.pages[0].path
            this.$router.push(next)
          })
      })
    },

    /**
     * Add image example to the scence
     */
    loadImageExample () {
      const scene = potreeRef.viewer.scene.scene
      // Remove previous image here
      // TODO
      // console.log('🎹', potreeRef.viewer?.scene.uuid)
      if (this.page?.image) {
        /**
         * Video
         **/
        // Create a texture loader so we can load our image file
        const loader = new THREE.TextureLoader()
        // Load an image file into a custom material
        const material = new THREE.MeshLambertMaterial({
          map: loader.load('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/assets/cat.jpg')
        })
        // create a plane geometry for the image with a width of 10
        // and a height that preserves the image's aspect ratio
        const geometry = new THREE.PlaneGeometry(10, 10 * 0.75)
        // combine our image geometry and material into a mesh
        const mesh = new THREE.Mesh(geometry, material)
        // set the position of the image mesh in the x,y,z dimensions
        mesh.position.set(296255.77195538126, 4633698.280614582, 139.53239533881214)
        mesh.rotation.set(90, 0, 0)
        // add the image to the scene
        scene.add(mesh)
      }
    }
  }
}
</script>
