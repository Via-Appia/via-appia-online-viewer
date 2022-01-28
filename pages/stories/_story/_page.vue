<template>
  <div>
    <transition :name="pageId !== $route.params.page? 'fade':'videofade'">
      <video
        v-show="showOverlayVideo"
        ref="video"
        autoplay
        class="fixed w-screen h-screen top-0 left-0 bg-black "
        muted="muted"
        :src="page && page.mediaPath"
      />
    </transition>

    <div v-if="showSubtitles">
      <transition :name="pageId !== $route.params.page? '':'fade'">
        <div v-show="showSubtitle" class="fixed bottom-3 left-0 flex w-screen">
          <div class="subtitles m-auto py-2 px-6 rounded-xl">
            {{ vp.TITEL }}
          </div>
        </div>
      </transition>
    </div>

    <div class="flex mb-4">
      <div class="flex-grow" />
      <div v-if="!$config.isMuseumApp" class="fixed top-2 right-[180px] flex">
        <div v-if="$nuxt.context.isDev">
          idle: {{ potreeRef.idleTimer }} : {{ resetViewTimeInMinutes }}
        </div>

        <div v-if="!$config.isMuseumApp" class="fixed top-0 right-0 h-screen ">
          <steps-timeline-links :pages="pages" />
        </div>
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
  fadeInDT,
  radiousEDL,
  resetViewTimeInMinutes,
  startDT,
  stopDT,
  stopSecuence,
  strengthEDL,
  waitUntilNextVideo,
  showSubtitles
} from '~/content/app-settings.yaml'

import { VACameraAnimation } from '~/api/VACameraAnimation'
import { promisifyVideo, tweenToPromisify } from '~/api/tweenUtils'

import { socket } from '~/api/websocket'

import viewpoints from '~/content/viewpoints.json'
import monuments from '~/content/monuments.json'

export default {
  setup () {
    return { videos, potreeRef, removeVideo, resetViewTimeInMinutes, THREE, viewpoints, monuments, showSubtitles }
  },
  data () {
    return {
      error: false,
      reconstructionPage: null,
      monumentPage: null,
      allPages: null,
      pages: null,
      page: null,
      prev: null,
      next: null,
      showOverlayVideo: false,
      showSubtitle: false,
      pageId: null
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
    this.allPages = await this.$content(params.story)
      .sortBy('slug', 'asc')
      .only(['title', 'description', 'path', 'exclude', 'slug'])
      .fetch()
      .catch((err) => {
        console.error({ statusCode: 404, message: 'Page not found', error: err })
      })

    this.reconstructionPage = this.allPages.findIndex(page => page?.slug === 'reconstruction')
    this.monumentPage = this.allPages.findIndex(page => page?.slug === 'monument')

    // Exclude monument pages and reconstruction pages from the list
    this.pages = this.allPages.filter(page => page.slug !== 'monument' && page.slug !== 'reconstruction')

    // Next and previous pages links
    const currentIndex = this.pages.findIndex(page => page?.path === this.page?.path)
    this.prev = (currentIndex - 1) < 0 ? this.pages[this.pages.length - 1] : this.pages[currentIndex - 1]
    this.next = (currentIndex + 1) === this.pages.length ? this.pages[0] : this.pages[currentIndex + 1]
  },
  computed: {
    // Return viewpoint object
    vp () {
      return viewpoints[viewpoints.findIndex(v => v.CODES_NEW === this.$route.params.page.slice(3).replace('-1080p', ''))] || {}
    }
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
        potreeRef.viewer.useEDL = false
      }
    }
  },
  async mounted () {
    await this.$fetch(); this.initPagePosition()
  },
  methods: {
    async initPagePosition () {
      // Reset time of for the museum app
      potreeRef.idleTimer = 0
      this.showSubtitle = false

      const pageId = this.$route.params.page
      this.pageId = pageId

      // Set Eye-Dome-Lighting, needed to make the pointcloud transparent.
      potreeRef.viewer.edlStrength = strengthEDL
      potreeRef.viewer.radius = radiousEDL
      potreeRef.viewer.edlOpacity = 1
      potreeRef.viewer.useEDL = false
      potreeRef.viewer.scene.pointclouds[0] && (potreeRef.viewer.scene.pointclouds[0].visible = true)

      // Set viewer FOV
      const fov = this.page?.cameraFOV || 60
      potreeRef.fov = fov
      potreeRef.viewer.setFOV(fov)

      /**
       * Add media to the scene
       */
      // this.loadImageExample() // Single image example
      if (this.page?.mediaPath) {
        loadVideo(this.page) // Load page video
      }

      //
      // calculate complete flow duration
      //
      const completeDurationInSecs =
        this.page.animationEntry || cameraMoveDT + // camera movement animation
        fadeInDT + // wait for the pointcloud to dissapear
        startDT + // wait until the video starts
        playDT + // duration of the video
        stopDT + // wait for the video to fadeout
        waitUntilNextVideo // wait until move to the next video in slide mode

      // Send the time duration inside the WebSocket
      socket.send(JSON.stringify({
        type: 'message',
        message: 'Animation duration',
        duration: completeDurationInSecs
      }))
      console.log('🔥 completeDurationInSecs', completeDurationInSecs, 'seconds')

      /*
      * Story sequence
      */
      await this.goToCameraPosition(this.page.cameraPath)

      // Development only, do not end the animation if setting the media coordinates
      if (stopSecuence || !this.page?.mediaPath) {
        potreeRef.viewer.useEDL = false
        return
      }

      // Set video parameters and times
      const video = videos.value[this.page?.mediaPath]
      const videoMesh = potreeRef.viewer.scene.scene.getObjectByName(this.page?.mediaPath)
      const _playDT = this.page.playDT || playDT
      video.playbackRate = video?.duration / _playDT // make the video duration as long as the setting

      // 1. Hide the PointCloud to see the video in between.
      // ===================================================
      // console.log(pageId === this.$route.params.page && '🎹 1. Hide the PointCloud to see the video in between.')
      if (pageId !== this.$route.params.page) {
        return
      }
      // if (this.$config.isMuseumApp) {
      //   potreeRef.viewer.useEDL = true
      //   await tweenToPromisify(potreeRef.viewer, { edlOpacity: 0 }, startDT * 1000)
      //   potreeRef.viewer.scene.pointclouds[0] && (potreeRef.viewer.scene.pointclouds[0].visible = false)
      //   potreeRef.viewer.useEDL = false
      // }

      this.showSubtitle = true
      // 2. Wait to start playing the video.
      // ======================================
      // console.log(pageId === this.$route.params.page && '🎹 2. Wait to start playing the video.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await promiseTimeout(startDT * 1000)

      // 3. Play the video and wait until the video is finished.
      // ========================================================
      // console.log(pageId === this.$route.params.page && '🎹 3. Play the video and wait until the video is finished.')
      if (pageId !== this.$route.params.page) {
        return
      }

      // hide the video title after 3-5 seconds
      setTimeout(() => {
        this.showSubtitle = false
      }, 3000)

      if (this.$config.isMuseumApp) {
        this.showOverlayVideo = true
        this.$refs.video.playbackRate = video?.duration / _playDT
        this.$refs.video.play()
        await promiseTimeout(_playDT * 1000) // await x seconds
      }
      else {
        await promisifyVideo(video)
      }

      // 4. Time delay between end of video and start of the fade out.
      // =================================================================
      // console.log(pageId === this.$route.params.page && '🎹 4. Time delay between end of video and start of the fade out.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await promiseTimeout(stopDT * 1000)

      // 5. Set back the Pointcloud opacity to 1.
      // ==========================================
      // console.log(pageId === this.$route.params.page && '🎹 5. Set back the Pointcloud opacity to 1.')
      if (pageId !== this.$route.params.page) {
        return
      }
      // if (this.$config.isMuseumApp) {
      //   potreeRef.viewer.useEDL = true
      //   potreeRef.viewer.scene.pointclouds[0] && (potreeRef.viewer.scene.pointclouds[0].visible = true)
      //   await tweenToPromisify(potreeRef.viewer, { edlOpacity: 1 }, 2000)
      //   potreeRef.viewer.useEDL = false
      // }

      // 6. Wait for the video to fade out
      // =====================================
      // console.log(pageId === this.$route.params.page && '🎹 6. Wait for the video to fade out')
      if (pageId !== this.$route.params.page) {
        return
      }

      // in museum app, show video overlay
      if (this.$config.isMuseumApp) {
        videoMesh.material.opacity = 0
        this.showOverlayVideo = false
      }
      // else: web version
      else {
        await tweenToPromisify(videoMesh.material, { opacity: 0 }, fadeOutDT * 1000)
      }
      await promiseTimeout(fadeOutDT * 1000) // await x seconds

      // 7. Wait until move to the next viewpoint.
      // ==========================================
      // console.log(pageId === this.$route.params.page && '🎹 7. Wait until move to the next viewpoint.')
      if (pageId !== this.$route.params.page) {
        return
      }
      await promiseTimeout(waitUntilNextVideo * 1000)

      // Send workflow is finished the WebSocket
      socket.send(JSON.stringify({
        type: 'message',
        message: 'Viewpoint finished'
      }))

      // If it is not in slideshow mode then stop de animation
      if (!this.$config.slideshow) {
        return
      }

      // Go to the first page if reached the last one
      this.$router.push(`/stories/${this.$route.params.story}/${this.next.slug}`)
    },

    /**
     * Camera Animation
     */
    async goToCameraPosition () {
      // if there are not any camera points defined, then don't do anything.
      if (this.page.cameraPath?.length === 0) {
        return
      }
      //
      // If there is only one point defined in the scene, then fly to it directly
      //
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
      animation.duration = this.page?.animationEntry || cameraMoveDT
      // Wait for the camera animation transition to finish
      await animation.play()
      // }
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
<style>

.subtitles{
  color: white;
  font-family: "HelveticaRounded";
  font-size: 2.5vw;
  font-weight: 500;
  letter-spacing: 0.15rem;
  -webkit-text-stroke: 0.1rem black;
}
.fade-enter-active,.fade-leave-active {transition: opacity 1s;}
.fade-enter, .fade-leave-to  {opacity: 0}

.videofade-enter-active { transition: opacity 1s; }
.videofade-leave-active { transition: opacity 5s; }
.videofade-enter, .videofade-leave-to  { opacity: 0; }
</style>
