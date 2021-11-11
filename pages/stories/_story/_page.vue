<template>
  <div>
    <div class="flex mb-4">
      <div class="flex-grow" />
      <NuxtLink
        tag="button"
        :disabled="!prev"
        class="btn"
        :to="{ to: 'stories', params: {story: $route.params.story, page: prev && prev.slug}}"
      >
        Back
      </NuxtLink>

      <NuxtLink
        tag="button"
        :disabled="!next"
        class="btn ml-4"
        :to="{ to: 'stories', params: {story: $route.params.story, page: next && next.slug}}"
      >
        Next
      </NuxtLink>
    </div>

    <!--    page time line -->
    <div class="fixed top-48 right-0">
      <steps-timeline-links :pages="pages" />
    </div>
    <div>
      <div class="bg-gray-700 bg-opacity-90 rounded p-4">
        <div class="text-xl font-bold ">
          {{ page && page.title }}
        </div>
        <div class="w-full mt-3">
          <nuxt-content :document="page" class="prose-sm sm:prose" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { VAOrientedImageLoader } from '~/components/overrides/VAOrientedImages'
import { potreeRef } from '~/api/VAPotree'

export default {
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

    this.pages = await this.$content(params.story)
      .sortBy('slug', 'asc')
      .only(['title', 'description', 'path'])
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

    this.page = await this.$content(params.story, params.page)
      .fetch()
      .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })

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
    $route () {
      this.$fetch().then(() => {
        this.loadImage()
      })
    // this.getAnimationPaths(to.params)
    }
  },
  mounted () {
    this.$fetch().then(() => {
      this.loadImage()
    })
  },
  methods: {
    loadImage () {
      // Remove previous image here
      // TODO
      console.log('🎹', potreeRef.viewer?.scene.uuid)
      if (this.page?.image) {
        VAOrientedImageLoader.load(this.page?.image?.cameraParams, this.page?.image?.imageParams, potreeRef.viewer)
          .then(([images, controls]) => {
            // // add the image to the mess TODO this doesn't work yet
            // const material = THREE.createMaterial()
            // material.transparent = false
            // images.images[0].mesh.material = material

            // new THREE.TextureLoader().load(imageParams.path, (texture) => {
            //   images[0].texture = texture
            //   images[0].mesh.material.uniforms.tColor.value = texture
            //   images[0].mesh.material.needsUpdate = true
            // })

            potreeRef.viewer.scene.addOrientedImages(images)
          })
      }
      // return image
      // })
    }
  }

}
</script>
