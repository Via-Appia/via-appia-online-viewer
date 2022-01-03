<template>
  <div>
    <div class="flex mb-4">
      <div class="flex-grow" />
      <div v-if="!$config.isMuseumApp" class="fixed top-2 right-[180px] flex">
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
    </div>
  </div>
</template>

<script>

import { promiseTimeout } from '@vueuse/core'
import { potreeRef } from '~/api/VAPotree'
import { loadVideo, removeVideo, videos } from '~/api/videos'
import {
  cameraMoveDT,
  fadeOutDT,
  playDT,
  radiousEDL,
  startDT,
  stopDT,
  stopSecuence,
  strengthEDL,
  waitUntilNextVideo
} from '~/content/app-settings.yaml'

import { VACameraAnimation } from '~/api/VACameraAnimation'
import { promisifyVideo, tweenToPromisify } from '~/api/tweenUtils'

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
      .catch((err) => {
        console.error({ statusCode: 404, message: 'Page not found', error: err })
      })

    // Get the list of pages of the story
    this.pages = await this.$content(params.story)
      .sortBy('slug', 'asc')
      .only(['title', 'description', 'path'])
      .fetch()
      .catch((err) => {
        console.error({ statusCode: 404, message: 'Page not found', error: err })
      })

    // Next and previous pages links
    const [prev, next] = await this.$content(params.story)
      .sortBy('slug', 'asc')
      .only(['title', 'slug'])
      .surround(params.page)
      .fetch()
      .catch((err) => {
        console.error({ statusCode: 404, message: 'Page not found', error: err })
      })

    this.prev = prev
    this.next = next
  },
  watch: {
    // When changing pages, refetch the content page and reload the method
    async $route () {
      // Get th current vido before loading the nextone
      const previousVideoPath = this.page?.mediaPath

      // if the pointcloud is transparent, put it back
      if (potreeRef.viewer.useEDL) {
        tweenToPromisify(potreeRef.viewer, { edlOpacity: 1 }, 1000)
      }

      // if there is a video: make it transparent
      await this.$fetch(); this.initPagePosition()

      if (previousVideoPath) {
        potreeRef.viewer.useEDL = false
        const videoMesh = potreeRef.viewer.scene.scene.getObjectByName(previousVideoPath)
        await tweenToPromisify(videoMesh?.material, { opacity: 0 }, 1000)// fadeOutDT * 1000)
        // Delete previous video on the page
        removeVideo(previousVideoPath)
        potreeRef.viewer.useEDL = true
      }
    }
  },
  async mounted () {
    await this.$fetch(); this.initPagePosition()
  },
  methods: {
    async initPagePosition () {
      console.log('🎹 this route', this.$route.params.page)
      const pageId = this.$route.params.page

      // Set Eye-Dome-Lighting, needed to make the pointcloud transparent.
      potreeRef.viewer.useEDL = true
      potreeRef.viewer.edlStrength = strengthEDL
      potreeRef.viewer.radius = radiousEDL
      potreeRef.viewer.edlOpacity = 1

      /**
       * Add media to the scene
       */
      // this.loadImageExample() // Single image example
      loadVideo(this.page) // Load page video

      // Set viewer FOV
      potreeRef.fov = this.page?.cameraFOV || 60
      potreeRef.viewer.setFOV(this.page?.cameraFOV || 60)

      await this.goToCameraPosition()
      /*
      * Story sequence
      */
      // Development only, do not end the animation if setting the media coordinates
      if (stopSecuence) {
        potreeRef.viewer.useEDL = false
        return
      }

      // Set video parameters and times
      const video = videos.value[this.page.mediaPath]
      const videoMesh = potreeRef.viewer.scene.scene.getObjectByName(this.page.mediaPath)
      videoMesh.material.opacity -= 0.01
      video.playbackRate = video.duration / playDT // make the video duration as long as the setting

      // 1. Hide the PointCloud to see the video in between.
      // console.log(pageId === this.$route.params.page && '🎹 1. Hide the PointCloud to see the video in between.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await tweenToPromisify(potreeRef.viewer, { edlOpacity: 0 }, startDT * 1000)

      // 2. Wait to start playing the video.
      // console.log(pageId === this.$route.params.page && '🎹 2. Wait to start playing the video.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await promiseTimeout(startDT * 1000)

      // 3. Play the video and wait until the video is finished.
      // console.log(pageId === this.$route.params.page && '🎹 3. Play the video and wait until the video is finished.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await promisifyVideo(video)

      // 4. Time delay between end of video and start of the fade out.
      // console.log(pageId === this.$route.params.page && '🎹 4. Time delay between end of video and start of the fade out.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await promiseTimeout(stopDT * 1000)

      // 5. Set back the Pointcloud opacity to 1.
      // console.log(pageId === this.$route.params.page && '🎹 5. Set back the Pointcloud opacity to 1.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await tweenToPromisify(potreeRef.viewer, { edlOpacity: 1 }, 2000)
      potreeRef.viewer.useEDL = false

      // 6. Wait for the video to fade out
      // console.log(pageId === this.$route.params.page && '🎹 6. Wait for the video to fade out')
      if (pageId !== this.$route.params.page) {
        return
      }
      await tweenToPromisify(videoMesh.material, { opacity: 0 }, fadeOutDT * 1000)

      // 7. Wait until move to the next viewpoint.
      // console.log(pageId === this.$route.params.page && '🎹 7. Wait until move to the next viewpoint.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await promiseTimeout(waitUntilNextVideo * 1000)

      //   return
      // }

      // Go to the first page if reached the last one
      const next = this.next?.slug
        ? `/stories/${this.$route.params.story}/${this.next.slug}`
        : '/stories' + this.pages[0].path
      this.$router.push(next)
      // })
    },

    /**
     * Camera Animation
     */
    async goToCameraPosition () {
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
        await promiseTimeout(this.page.animationEntry || cameraMoveDT * 1000) // wait x seconds
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
    },

    /**
     * Add image example to the scene
     */
    loadImageExample () {
      const scene = potreeRef.viewer.scene.scene
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
