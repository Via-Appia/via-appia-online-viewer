<template>
  <div v-if="potreeRef.viewer" id="cameraSection">
    <div v-if="seeDetailsPanel" class="fixed top-[50px] left-[300px] z-10">
      <pre class="bg-black bg-opacity-90 scrollable">
        {{ activeCamera }}
        Position Array:
        {{ potreeRef.viewer.scene.getActiveCamera().position.toArray() }}
        target array
        {{ potreeRef.viewer.scene.view.getPivot().toArray() }}
      </pre>
    </div>

    FOV (Field of View): {{ potreeRef.fov }}

    <!-- Camera position-->
    <div v-if="activeCamera" class="mt-4 font-bold">
      <!-- Copy camera position -->
      <button
        class="font-capitalize btn btn-sm btn-accent"
        @click="copyCameraPosition(
          `[[${potreeRef.viewer.scene.getActiveCamera().position.toArray().toString()}],[${potreeRef.viewer.scene.view.getPivot().toArray().toString()}]]`
        )"
      >
        <svg
          class="w-3 mr-1 h-"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-divnecap="round"
            stroke-divnejoin="round"
            stroke-width="2"
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          />
        </svg>
        Copy Camera position
      </button>
      <!--      <button-->
      <!--        class="text-xs text-gray-400 font-capitalize btn btn-xs btn-outline"-->
      <!--        @click="copyCameraPosition(potreeRef.viewer.scene.getActiveCamera().position.toArray().toString())"-->
      <!--      >-->
      <!--        <svg-->
      <!--          class="w-3 mr-1 h-"-->
      <!--          fill="none"-->
      <!--          stroke="currentColor"-->
      <!--          viewBox="0 0 24 24"-->
      <!--          xmlns="http://www.w3.org/2000/svg"-->
      <!--        >-->
      <!--          <path-->
      <!--            stroke-divnecap="round"-->
      <!--            stroke-divnejoin="round"-->
      <!--            stroke-width="2"-->
      <!--            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"-->
      <!--          />-->
      <!--        </svg>-->
      <!--        Copy Camera Position-->
      <!--      </button>-->

      <div class="mt-2 mb-2">
        x: <input
          :value="activeCamera.position.x"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraPosition({x:$event.target.value})"
        >
      </div>
      <div class="mb-2">
        y: <input
          :value="activeCamera.position.y"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraPosition({y:$event.target.value})"
        >
      </div>
      <div class="mb-2">
        z: <input
          :value="activeCamera.position.z"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraPosition({z:$event.target.value})"
        >
      </div>

      <!--      <div class="mt-4">-->
      <!--        &lt;!&ndash; Copy camera Target &ndash;&gt;-->
      <!--        <button-->
      <!--          class="text-xs text-gray-400 font-capitalize btn btn-xs btn-outline"-->
      <!--          @click="copyCameraPosition(potreeRef.viewer.scene.view.getPivot().toArray().toString())"-->
      <!--        >-->
      <!--          <svg-->
      <!--            class="w-3 mr-1 h-"-->
      <!--            fill="none"-->
      <!--            stroke="currentColor"-->
      <!--            viewBox="0 0 24 24"-->
      <!--            xmlns="http://www.w3.org/2000/svg"-->
      <!--          >-->
      <!--            <path-->
      <!--              stroke-divnecap="round"-->
      <!--              stroke-divnejoin="round"-->
      <!--              stroke-width="2"-->
      <!--              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"-->
      <!--            />-->
      <!--          </svg>-->
      <!--          Copy Camera Target-->
      <!--        </button>-->
      <!--        <div class="mt-2 rounded bg-gray-800 p-1">-->
      <!--          {{ potreeRef.viewer.scene.view.getPivot().toArray().map(number=>Math.round(number*1000)/1000).toString() }}-->
      <!--        </div>-->
      <!--      </div>-->
    </div>

    <!-- Camera Rotation-->
    <div class="mt-4 font-bold">
      <div class="mb-2">
        Yaw (left-right): <input
          :value="potreeRef.viewer.scene.view.yaw"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraRotation({yaw:$event.target.value})"
        >
      </div>
      <div class="mb-2">
        Pitch (up-down): <input
          :value="potreeRef.viewer.scene.view._pitch"
          class="input input-xs"
          type="number"
          step=".01"
          :min="potreeRef.viewer.scene.view.minPitch"
          :max="potreeRef.viewer.scene.view.maxPitch"
          @input="setCameraRotation({pitch:$event.target.value})"
        >
      </div>
    </div>

    <!-- Active media -->
    <div v-if="potreeRef.selectedVideo">
      Floating video
      <div class="p-3 card bordered">
        <div class="form-control">
          <!-- Copy All-->
          <button
            class=" font-capitalize btn btn-sm btn-primary"
            @click="copyCameraPosition(
              `mediaPosition:  [${potreeRef.selectedVideo.position.toArray().toString()}]
mediaRotation:  [${potreeRef.selectedVideo.quaternion.toArray().toString()}]
mediaScale: ${scaleMedia}
cameraFOV: ${potreeRef.fov}

# Pair of camera points and targets: [final point], ... , [entrance point]
cameraPath: [
    [[${potreeRef.viewer.scene.getActiveCamera().position.toArray().toString()}],[${potreeRef.viewer.scene.view.getPivot().toArray().toString()}]]
]
`
            )"
          >
            <svg
              class="w-3 mr-1 h-"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-divnecap="round"
                stroke-divnejoin="round"
                stroke-width="2"
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            Copy all params
          </button>

          <!-- Copy Media position -->
          <button
            class=" font-capitalize btn btn-sm mt-3"
            @click="copyCameraPosition(
              `mediaPosition:  [${potreeRef.selectedVideo.position.toArray().toString()}]
mediaRotation:  [${potreeRef.selectedVideo.quaternion.toArray().toString()}]
mediaScale: ${scaleMedia}
cameraFOV: ${potreeRef.fov}
`
            )"
          >
            <svg
              class="w-3 mr-1 h-"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-divnecap="round"
                stroke-divnejoin="round"
                stroke-width="2"
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            Copy Media Position
          </button>

          <div>
            Video Player
            <br class="mb-3">
            <div class="btn btn-xs" @click="videos[potreeRef.selectedVideo.name].play()">
              Play
            </div>
            <div class="btn btn-xs" @click="videos[potreeRef.selectedVideo.name].pause()">
              pause
            </div>
            {{ videos[potreeRef.selectedVideo.name].video }}
            <div class="btn btn-xs" @click="videos[potreeRef.selectedVideo.name].currentTime = videos[potreeRef.selectedVideo.name].duration">
              end
            </div>
            <br>
            <div class="btn btn-xs" @click="videos[potreeRef.selectedVideo.name].playbackRate = 0.5">
              0.5x
            </div>
            <div class="btn btn-xs" @click="videos[potreeRef.selectedVideo.name].playbackRate = 2.0">
              2x
            </div>
            <div class="btn btn-xs" @click="videos[potreeRef.selectedVideo.name].playbackRate = 3.0">
              3x
            </div>
            <div class="btn btn-xs" @click="videos[potreeRef.selectedVideo.name].playbackRate = 5.0">
              5x
            </div>
          </div>

          <label class="flex justify-between cursor-pointer mt-3">
            <span class="label-text">Follow the camera</span>
            <div>
              <input type="checkbox" class="toggle toggle-primary" @change="potreeRef.followCamera = $event.target.checked">
              <span class="toggle-mark" />
            </div>
          </label>
          <div class="flex items-center mt-2">
            <div class="flex-grow w-full label-text">
              Opacity <br>{{ potreeRef.selectedVideo.material.opacity }}
            </div>
            <input
              :value="potreeRef.selectedVideo.material.opacity "
              class="ml-2 input input-xs"
              step="0.01"
              type="range"
              min="0"
              max="1"
              @input="potreeRef.selectedVideo.material.opacity = $event.target.value"
            >
          </div>

          <div class="mt-4 font-bold">
            FOV: <input type="number" step="0.01" class="input input-xs w-20" :value="potreeRef.fov" @input="changeFOV">
          </div>
          <input
            :value="potreeRef.fov"
            type="range"
            step="0.01"
            min="10"
            max="120"
            @input="changeFOV"
          >
          <div class="mt-4 font-bold">
            Image Scale: {{ scaleMedia }}
          </div>
          <input
            v-model="scaleMedia"
            type="range"
            min="0"
            max="4"
            step="0.00001"
            @input="changeScale"
          >

          <!--            <div class="mt-3">-->
          <!--              <label class="label-text"> Offset </label>-->
          <!--              <input-->
          <!--                :value="offset"-->
          <!--                class="input input-xs"-->
          <!--                type="number"-->
          <!--                step="0.02"-->
          <!--                @input="setActiveImageOffset($event.target.value)"-->
          <!--              >-->
          <!--            </div>-->
        </div>
      </div>
    </div>

    <div class="mb-2 btn btn-xs" @click="seeDetailsPanel = !seeDetailsPanel">
      See stats Panel
    </div>
  </div>
</template>

<script>
import { potreeRef } from '~/api/VAPotree'
import { videos, removeVideo } from '~/api/videos'

export default {
  setup () {
    return { potreeRef, videos, removeVideo }
  },

  data () {
    return {
      seeDetailsPanel: false,
      offset: -0.9,
      activeImage: null,
      activeCamera: null,
      target: null,
      imageFollowsCamera: false,
      scaleMedia: 1
    }
  },
  mounted () {
    this.activeCamera = potreeRef.viewer.scene.getActiveCamera()
    this.target = potreeRef.viewer.scene.view.getPivot()
  },

  methods: {
    changeScale () {
      const aspectRatio = 9 / 16 // 16:9
      const scale = 5 * 1.48 * this.scaleMedia
      potreeRef.selectedVideo.scale.set(1 * scale, (aspectRatio) * scale, 1 * scale)
    },

    changeFOV (event) {
      // this.fov = this.fov
      const fov = event.target.value
      potreeRef.viewer.setFOV(fov)
      potreeRef.fov = fov
      if (potreeRef.selectedVideo && potreeRef.followCamera) {
        const aspectRatio = 9 / 16 // 16:9
        // const scale = 5 * 1.48 * fov / 60
        const keep = 6.41 * this.scaleMedia
        const scale = keep * Math.tan(fov / 2.0 * Math.PI / 180.0) * 2.0
        potreeRef.selectedVideo.scale.set(1 * scale, (aspectRatio) * scale, 1 * scale)
      }
    },
    copyCameraPosition (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          potreeRef.viewer.postMessage(text, { duration: 3000 })
        })
        .catch((err) => {
          // This can happen if the user denies clipboard permissions:
          console.error('Could not copy text: ', err)
        })
    },
    setCameraPosition (newPosition) {
      potreeRef.viewer.scene.view.position.set(
        parseFloat(newPosition.x || this.activeCamera.position.x),
        parseFloat(newPosition.y || this.activeCamera.position.y),
        parseFloat(newPosition.z || this.activeCamera.position.z)
      )

      if (this.activeImage && this.imageFollowsCamera) {
        this.activeImage.setPosition(this.activeCamera, this.offset)
      }
    },
    setCameraRotation (newRotation) {
      if (newRotation.yaw) {
        potreeRef.viewer.scene.view.yaw = parseFloat(newRotation.yaw)
      }
      if (newRotation.pitch) {
        potreeRef.viewer.scene.view.pitch = parseFloat(newRotation.pitch)
      }

      if (this.activeImage && this.imageFollowsCamera) {
        this.activeImage.setPosition(this.activeCamera, this.offset)
      }
    },
    setActiveImageOpacity (value) {
      this.activeImage.mesh.material.uniforms.uOpacity.value = parseFloat(value)
    },
    setActiveImageOffset (offsetValue = this.offset) {
      this.offset = offsetValue
      this.activeImage.setPosition(this.activeCamera, offsetValue)
    }
  }
}
</script>
